/**
 * PhaseContainerモジュールエクスポート
 */

// インターフェース
export type { IPhaseContainer, PhaseContainerConfig } from './IPhaseContainer';
export type {
  IGatheringContainer,
  GatheringContainerOptions,
  GatheringResult,
} from './IGatheringContainer';

// イベント型
export type {
  PhaseCompletePayload,
  PhaseCancelPayload,
  PhaseActionPayload,
  PhaseErrorPayload,
  PhaseContainerEvents,
} from './PhaseContainerEvents';

// 定数
export { GatheringContainerLayout } from './GatheringContainerConstants';

// 基底クラス
export { BasePhaseContainer } from './BasePhaseContainer';

// 実装
export { GatheringContainer } from './GatheringContainer';
export { GatheringMaterialGenerator } from './GatheringMaterialGenerator';
export type { IMaterialRepository, GeneratedMaterial } from './GatheringMaterialGenerator';
export { GatheringMaterialPresenter } from './GatheringMaterialPresenter';
