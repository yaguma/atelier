/**
 * game-flow-manager.interface.ts（後方互換性用再エクスポート）
 *
 * @description
 * 実体は shared/services/game-flow/game-flow-manager.interface.ts に移動済み。
 * 後方互換性のため再エクスポートを提供する。
 *
 * 新規コードでは @shared/services を使用すること。
 */
export type {
  GameEndCondition,
  IGameFlowManager,
} from '@shared/services/game-flow/game-flow-manager.interface';
