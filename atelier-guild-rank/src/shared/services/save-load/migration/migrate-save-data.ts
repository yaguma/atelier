/**
 * migrate-save-data.ts - セーブデータマイグレーション関数
 *
 * Issue #310: セーブデータマイグレーション関数のインターフェース設計
 *
 * @description
 * セーブデータのマイグレーション・バリデーションを実行するメイン関数。
 *
 * 【Functional Core】: 純粋関数として実装。
 * 副作用（ログ出力、localStorage操作等）は呼び出し元で行う。
 */

import type { ISaveData } from '@shared/types';
import { validateSaveData } from './save-data-validator';
import type {
  CompareVersionsFn,
  IMigrationRegistry,
  MigrationResult,
  ParseVersionFn,
  SaveDataVersion,
} from './types';
import { MigrationFailureReason } from './types';

// =============================================================================
// バージョンユーティリティ関数（純粋関数）
// =============================================================================

/**
 * バージョン文字列をパースする
 *
 * 【純粋関数】
 * "1.0.0" 形式の文字列を SaveDataVersion に変換する。
 *
 * @param version バージョン文字列
 * @returns パース済みバージョン（不正な場合null）
 */
export const parseVersion: ParseVersionFn = (version: string): SaveDataVersion | null => {
  if (typeof version !== 'string') {
    return null;
  }

  const parts = version.split('.');
  if (parts.length !== 3) {
    return null;
  }

  const major = Number.parseInt(parts[0] ?? '', 10);
  const minor = Number.parseInt(parts[1] ?? '', 10);
  const patch = Number.parseInt(parts[2] ?? '', 10);

  if (Number.isNaN(major) || Number.isNaN(minor) || Number.isNaN(patch)) {
    return null;
  }

  if (major < 0 || minor < 0 || patch < 0) {
    return null;
  }

  return { major, minor, patch };
};

/**
 * 2つのバージョンを比較する
 *
 * 【純粋関数】
 *
 * @param a 比較対象A
 * @param b 比較対象B
 * @returns a < b なら負、a === b なら0、a > b なら正
 */
export const compareVersions: CompareVersionsFn = (
  a: SaveDataVersion,
  b: SaveDataVersion,
): number => {
  if (a.major !== b.major) {
    return a.major - b.major;
  }
  if (a.minor !== b.minor) {
    return a.minor - b.minor;
  }
  return a.patch - b.patch;
};

// =============================================================================
// メインマイグレーション関数（純粋関数）
// =============================================================================

/**
 * セーブデータをマイグレーションする
 *
 * 【純粋関数】
 *
 * 処理フロー:
 * 1. データの基本構造チェック
 * 2. バージョン検出・パース
 * 3. 互換性判定
 * 4. マイグレーションパス解決・実行
 * 5. バリデーション
 *
 * @param rawData パース済みのunknownデータ（JSON.parse結果）
 * @param targetVersion マイグレーション先バージョン文字列
 * @param registry マイグレーションレジストリ
 * @returns マイグレーション結果
 */
export function migrateSaveData(
  rawData: unknown,
  targetVersion: string,
  registry: IMigrationRegistry,
): MigrationResult {
  // 1. データの基本構造チェック
  if (typeof rawData !== 'object' || rawData === null || Array.isArray(rawData)) {
    return createFailure(
      null,
      targetVersion,
      MigrationFailureReason.INVALID_STRUCTURE,
      'セーブデータがオブジェクトではありません',
    );
  }

  const data = rawData as Record<string, unknown>;

  // 2. バージョン検出
  if (typeof data.version !== 'string' || data.version.length === 0) {
    return createFailure(
      null,
      targetVersion,
      MigrationFailureReason.VERSION_MISSING,
      'セーブデータにバージョン情報がありません',
    );
  }

  const fromVersionStr = data.version;

  // 3. バージョンパース
  const fromVersion = parseVersion(fromVersionStr);
  if (!fromVersion) {
    return createFailure(
      fromVersionStr,
      targetVersion,
      MigrationFailureReason.VERSION_INVALID,
      `バージョン形式が不正です: ${fromVersionStr}`,
    );
  }

  const toVersion = parseVersion(targetVersion);
  if (!toVersion) {
    return createFailure(
      fromVersionStr,
      targetVersion,
      MigrationFailureReason.VERSION_INVALID,
      `ターゲットバージョン形式が不正です: ${targetVersion}`,
    );
  }

  // 4. メジャーバージョンチェック
  if (fromVersion.major !== toVersion.major) {
    return createFailure(
      fromVersionStr,
      targetVersion,
      MigrationFailureReason.MAJOR_VERSION_MISMATCH,
      `メジャーバージョンが異なります: ${fromVersionStr} -> ${targetVersion}`,
    );
  }

  // 5. ダウングレードチェック
  const comparison = compareVersions(fromVersion, toVersion);
  if (comparison > 0) {
    return createFailure(
      fromVersionStr,
      targetVersion,
      MigrationFailureReason.DOWNGRADE_NOT_SUPPORTED,
      `ダウングレードはサポートされていません: ${fromVersionStr} -> ${targetVersion}`,
    );
  }

  // 6. 同一バージョンの場合（マイグレーション不要）
  if (comparison === 0) {
    // バリデーションのみ実行
    const validationResult = validateSaveData(rawData);
    if (!validationResult.valid) {
      return createFailure(
        fromVersionStr,
        targetVersion,
        MigrationFailureReason.VALIDATION_FAILED,
        `バリデーション失敗: ${validationResult.errors.map((e) => e.message).join(', ')}`,
      );
    }

    return {
      success: true,
      data: rawData as ISaveData,
      fromVersion: fromVersionStr,
      toVersion: targetVersion,
      stepsApplied: 0 as const,
      fallback: false,
    };
  }

  // 7. マイグレーションパス解決
  const migrationPath = registry.getPath(fromVersionStr, targetVersion);
  if (!migrationPath) {
    return createFailure(
      fromVersionStr,
      targetVersion,
      MigrationFailureReason.NO_MIGRATION_PATH,
      `マイグレーションパスが見つかりません: ${fromVersionStr} -> ${targetVersion}`,
    );
  }

  // 8. マイグレーション実行
  let currentData: unknown = rawData;
  for (const step of migrationPath) {
    try {
      currentData = step.migrate(currentData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return createFailure(
        fromVersionStr,
        targetVersion,
        MigrationFailureReason.STEP_EXECUTION_ERROR,
        `マイグレーションステップ ${step.fromVersion} -> ${step.toVersion} でエラー: ${errorMessage}`,
      );
    }
  }

  // 9. マイグレーション後のバリデーション
  const validationResult = validateSaveData(currentData);
  if (!validationResult.valid) {
    return createFailure(
      fromVersionStr,
      targetVersion,
      MigrationFailureReason.VALIDATION_FAILED,
      `マイグレーション後のバリデーション失敗: ${validationResult.errors.map((e) => e.message).join(', ')}`,
    );
  }

  return {
    success: true,
    data: currentData as ISaveData,
    fromVersion: fromVersionStr,
    toVersion: targetVersion,
    stepsApplied: migrationPath.length,
    fallback: false,
  };
}

// =============================================================================
// ヘルパー関数
// =============================================================================

/**
 * 失敗結果を生成する
 */
function createFailure(
  fromVersion: string | null,
  toVersion: string,
  reason: MigrationFailureReason,
  errorMessage: string,
): MigrationResult {
  return {
    success: false,
    data: null,
    fromVersion,
    toVersion,
    fallback: true,
    reason,
    errorMessage,
  };
}
