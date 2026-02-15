/**
 * master-data-repository.ts - マスターデータリポジトリ（後方互換性用再エクスポート）
 *
 * @description
 * 実体は shared/services/repositories/master-data-repository.ts に移動済み。
 * 後方互換性のため再エクスポートを提供する。
 *
 * 新規コードでは @shared/services を使用すること。
 */
export type { IMasterDataRepositoryConfig } from '@shared/services/repositories/master-data-repository';
export { MasterDataRepository } from '@shared/services/repositories/master-data-repository';
