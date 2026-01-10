/**
 * PhaseContainerモジュールエクスポート
 */

// インターフェース
export type {
  IPhaseContainer,
  PhaseContainerConfig,
} from './IPhaseContainer';

// イベント型
export type {
  PhaseCompletePayload,
  PhaseCancelPayload,
  PhaseActionPayload,
  PhaseErrorPayload,
  PhaseContainerEvents,
} from './PhaseContainerEvents';

// 基底クラス
export { BasePhaseContainer } from './BasePhaseContainer';
