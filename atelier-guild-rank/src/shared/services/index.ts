/**
 * Shared Services Module
 * 共通サービスの公開エクスポート
 *
 * TASK-0066: shared/services移行
 */

export type { EventHandler, IBusEvent, IEventBus } from './event-bus';
// Event Bus
export { EventBus } from './event-bus';
export type { IStateManager } from './state-manager';

// State Manager
export {
  INITIAL_GAME_STATE,
  MAX_ACTION_POINTS,
  StateManager,
  VALID_PHASE_TRANSITIONS,
} from './state-manager';
