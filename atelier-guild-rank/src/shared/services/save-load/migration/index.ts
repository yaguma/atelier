/**
 * Migration Module - セーブデータマイグレーション公開API
 *
 * Issue #310: セーブデータマイグレーション関数のインターフェース設計
 *
 * @description
 * セーブデータのバージョン管理・マイグレーション・バリデーション機能を提供する。
 *
 * @example
 * ```typescript
 * import {
 *   migrateSaveData,
 *   MigrationRegistry,
 *   migrationV1_0ToV1_1,
 *   validateSaveData,
 * } from '@shared/services/save-load/migration';
 *
 * // レジストリにマイグレーションステップを登録
 * const registry = new MigrationRegistry();
 * registry.register(migrationV1_0ToV1_1);
 *
 * // マイグレーション実行
 * const parsed = JSON.parse(jsonString);
 * const result = migrateSaveData(parsed, '1.1.0', registry);
 *
 * if (result.success) {
 *   // result.data をセーブデータとして使用
 * } else {
 *   // result.fallback === true -> 新規ゲーム開始
 *   console.warn(result.errorMessage);
 * }
 * ```
 */

// =============================================================================
// マイグレーション関数
// =============================================================================
export { compareVersions, migrateSaveData, parseVersion } from './migrate-save-data';
// =============================================================================
// マイグレーションレジストリ
// =============================================================================
export { MigrationRegistry } from './migration-registry';
// =============================================================================
// マイグレーションステップ（具体的なバージョン間マイグレーション）
// =============================================================================
export { migrationV1_0ToV1_1 } from './migrations/v1_0_to_v1_1';

// =============================================================================
// バリデーション関数
// =============================================================================
export { validateSaveData } from './save-data-validator';
// =============================================================================
// 型定義
// =============================================================================
export type {
  CompareVersionsFn,
  IMigrationFailure,
  IMigrationNoOp,
  IMigrationRegistry,
  IMigrationStep,
  IMigrationSuccess,
  IValidationError,
  IValidationResult,
  MigrateSaveDataFn,
  MigrationResult,
  ParseVersionFn,
  SaveDataVersion,
  ValidateSaveDataFn,
} from './types';
export { MigrationFailureReason } from './types';
