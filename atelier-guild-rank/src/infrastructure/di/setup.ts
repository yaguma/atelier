/**
 * setup.ts - サービス初期化セットアップ（後方互換性用再エクスポート）
 *
 * @description
 * 実体は shared/services/di/setup.ts に移動済み。
 * 後方互換性のため再エクスポートを提供する。
 *
 * 新規コードでは @shared/services を使用すること。
 */
export {
  initializeServices,
  resetServices,
  type ServiceInitializationConfig,
} from '@shared/services/di/setup';
