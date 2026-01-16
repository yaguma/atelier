/**
 * Application Services
 * アプリケーションサービスの公開エクスポート
 */

export { DeckService } from './deck-service';
export {
  INITIAL_GAME_STATE,
  MAX_ACTION_POINTS,
  VALID_PHASE_TRANSITIONS,
} from './initial-state';
export { StateManager } from './state-manager';
export type { IStateManager } from './state-manager.interface';
