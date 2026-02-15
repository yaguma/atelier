/**
 * save-load-service.ts（後方互換性用再エクスポート）
 *
 * @description
 * 実体は shared/services/save-load/save-load-service.ts に移動済み。
 * 後方互換性のため再エクスポートを提供する。
 *
 * 新規コードでは @shared/services を使用すること。
 */
export type { ISaveLoadService } from '@shared/services/save-load/save-load-service';
export { SaveLoadService } from '@shared/services/save-load/save-load-service';
