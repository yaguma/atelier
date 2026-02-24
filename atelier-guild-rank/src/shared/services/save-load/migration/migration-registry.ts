/**
 * migration-registry.ts - マイグレーションレジストリ
 *
 * Issue #310: セーブデータマイグレーション関数のインターフェース設計
 *
 * @description
 * マイグレーションステップの登録・検索・パス解決を行う。
 * 段階的マイグレーション（v1.0.0 -> v1.1.0 -> v1.2.0）のパス解決に使用する。
 *
 * 【Functional Core】: 状態を持つが、マイグレーションステップ自体は純粋関数。
 * レジストリは初期化時に全ステップを登録し、以降は読み取り専用として扱う。
 */

import type { IMigrationRegistry, IMigrationStep } from './types';

// =============================================================================
// MigrationRegistry 実装
// =============================================================================

/**
 * マイグレーションレジストリ実装
 *
 * マイグレーションステップをMapで管理し、
 * バージョン間の最短パスをBFSで解決する。
 *
 * @example
 * ```typescript
 * const registry = new MigrationRegistry();
 * registry.register(migrationV1_0ToV1_1);
 * registry.register(migrationV1_1ToV1_2);
 *
 * const path = registry.getPath('1.0.0', '1.2.0');
 * // -> [migrationV1_0ToV1_1, migrationV1_1ToV1_2]
 * ```
 */
export class MigrationRegistry implements IMigrationRegistry {
  /**
   * マイグレーションステップのマップ
   * key: fromVersion, value: ステップ配列（同一fromVersionから複数の遷移先がある場合）
   */
  private readonly steps: Map<string, IMigrationStep[]> = new Map();

  /**
   * マイグレーションステップを登録する
   *
   * @param step 登録するマイグレーションステップ
   */
  register(step: IMigrationStep): void {
    const existing = this.steps.get(step.fromVersion) ?? [];
    existing.push(step);
    this.steps.set(step.fromVersion, existing);
  }

  /**
   * 指定バージョン間のマイグレーションパスを取得する
   *
   * BFS（幅優先探索）でfromVersionからtoVersionへの最短パスを解決する。
   *
   * @param fromVersion マイグレーション元バージョン
   * @param toVersion マイグレーション先バージョン
   * @returns マイグレーションステップの配列（パスが存在しない場合null）
   */
  getPath(fromVersion: string, toVersion: string): readonly IMigrationStep[] | null {
    // 同一バージョンの場合はパス不要
    if (fromVersion === toVersion) {
      return [];
    }

    // BFSでパス探索
    const visited = new Set<string>();
    const queue: Array<{ version: string; path: IMigrationStep[] }> = [
      { version: fromVersion, path: [] },
    ];

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) {
        break;
      }

      if (visited.has(current.version)) {
        continue;
      }
      visited.add(current.version);

      const nextSteps = this.steps.get(current.version);
      if (!nextSteps) {
        continue;
      }

      for (const step of nextSteps) {
        const newPath = [...current.path, step];

        if (step.toVersion === toVersion) {
          return newPath;
        }

        if (!visited.has(step.toVersion)) {
          queue.push({ version: step.toVersion, path: newPath });
        }
      }
    }

    return null;
  }

  /**
   * 指定バージョンからのマイグレーションが可能かを判定する
   *
   * @param fromVersion マイグレーション元バージョン
   * @param toVersion マイグレーション先バージョン
   * @returns マイグレーション可能な場合true
   */
  canMigrate(fromVersion: string, toVersion: string): boolean {
    return this.getPath(fromVersion, toVersion) !== null;
  }

  /**
   * 登録されているすべてのマイグレーションステップを取得する
   *
   * @returns 登録済みマイグレーションステップの配列
   */
  getAll(): readonly IMigrationStep[] {
    const allSteps: IMigrationStep[] = [];
    for (const steps of this.steps.values()) {
      allSteps.push(...steps);
    }
    return allSteps;
  }
}
