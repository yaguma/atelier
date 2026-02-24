/**
 * Shared Services Save/Load
 * SaveLoadServiceとマイグレーション機能の公開エクスポート
 *
 * TASK-0104: application層からshared/servicesに移動
 * Issue #310: セーブデータマイグレーション機能追加
 */

export type {
  IMigrationRegistry,
  IMigrationStep,
  IValidationError,
  IValidationResult,
  MigrationResult,
  SaveDataVersion,
} from './migration';
// マイグレーション機能
export {
  compareVersions,
  MigrationFailureReason,
  MigrationRegistry,
  migrateSaveData,
  migrationV1_0ToV1_1,
  parseVersion,
  validateSaveData,
} from './migration';
export type { ISaveLoadService } from './save-load-service';
export { SaveLoadService } from './save-load-service';
