/**
 * Infrastructure DI Container（後方互換性用再エクスポート）
 *
 * @description
 * 実体は shared/services/di/ に移動済み。
 * 後方互換性のため再エクスポートを提供する。
 *
 * 新規コードでは @shared/services を使用すること。
 */
export { Container, type ServiceKey, ServiceKeys } from '@shared/services/di/container';
export {
  initializeServices,
  resetServices,
  type ServiceInitializationConfig,
} from '@shared/services/di/setup';
