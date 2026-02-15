/**
 * Infrastructure Loaders（後方互換性用再エクスポート）
 *
 * @description
 * 実体は shared/services/loaders/ に移動済み。
 * 後方互換性のため再エクスポートを提供する。
 *
 * 新規コードでは @shared/services を使用すること。
 */
export type { IJsonLoader } from '@shared/services/loaders/json-loader';
export { JsonLoader } from '@shared/services/loaders/json-loader';
