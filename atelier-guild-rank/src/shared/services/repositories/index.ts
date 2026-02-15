/**
 * Shared Services Repositories
 * リポジトリ実装の公開エクスポート
 *
 * TASK-0102: infrastructure層からshared/services/repositoriesに移動
 */

export { LocalStorageSaveRepository } from './local-storage-save-repository';
export type { IMasterDataRepositoryConfig } from './master-data-repository';
export { MasterDataRepository } from './master-data-repository';
