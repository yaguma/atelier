/**
 * Infrastructure Repositories（後方互換性用再エクスポート）
 *
 * @description
 * 実体は shared/services/repositories/ に移動済み。
 * 後方互換性のため再エクスポートを提供する。
 *
 * 新規コードでは @shared/services を使用すること。
 */
export { LocalStorageSaveRepository } from '@shared/services/repositories/local-storage-save-repository';
export type { IMasterDataRepositoryConfig } from '@shared/services/repositories/master-data-repository';
export { MasterDataRepository } from '@shared/services/repositories/master-data-repository';
