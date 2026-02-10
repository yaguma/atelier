/**
 * State Manager Module
 * StateManagerの公開エクスポート
 *
 * TASK-0066: shared/services移行
 */

export { INITIAL_GAME_STATE, MAX_ACTION_POINTS, VALID_PHASE_TRANSITIONS } from './initial-state';
export { StateManager } from './StateManager';
export type { IStateManager } from './types';
