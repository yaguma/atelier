/**
 * Shared Services Game Flow
 * GameFlowManagerの公開エクスポート
 *
 * TASK-0104: application層からshared/servicesに移動
 */

export { GameFlowManager } from './game-flow-manager';
export type { GameEndCondition, IGameFlowManager } from './game-flow-manager.interface';
