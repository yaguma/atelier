/**
 * Shared Services Module
 * 共通サービスの公開エクスポート
 *
 * TASK-0066: shared/services移行
 * TASK-0102: infrastructure層からDI/リポジトリ/ローダーを移動
 */

// DI Container
export {
  Container,
  initializeServices,
  resetServices,
  type ServiceInitializationConfig,
  type ServiceKey,
  ServiceKeys,
} from './di';
// Event Bus
export type { EventHandler, IBusEvent, IEventBus } from './event-bus';
export { EventBus } from './event-bus';
// Loaders
export type { IJsonLoader } from './loaders';
export { JsonLoader } from './loaders';
export type { IMasterDataRepositoryConfig } from './repositories';
// Repositories
export { LocalStorageSaveRepository, MasterDataRepository } from './repositories';
// State Manager
export type { IStateManager } from './state-manager';
export {
  INITIAL_GAME_STATE,
  MAX_ACTION_POINTS,
  StateManager,
  VALID_PHASE_TRANSITIONS,
} from './state-manager';
