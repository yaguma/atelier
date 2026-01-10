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
export type {
  IAlchemyContainer,
  AlchemyContainerOptions,
  AlchemyResult,
} from './IAlchemyContainer';
export type {
  IDeliveryContainer,
  DeliveryContainerOptions,
  DeliveryResult,
  DeliveryReward,
} from './IDeliveryContainer';

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
export { AlchemyContainerLayout } from './AlchemyContainerConstants';
export { DeliveryContainerLayout, DeliveryContainerColors } from './DeliveryContainerConstants';

// 基底クラス
export { BasePhaseContainer } from './BasePhaseContainer';

// 実装
export { GatheringContainer } from './GatheringContainer';
export { GatheringMaterialGenerator } from './GatheringMaterialGenerator';
export type { IMaterialRepository, GeneratedMaterial } from './GatheringMaterialGenerator';
export { GatheringMaterialPresenter } from './GatheringMaterialPresenter';
export { AlchemyContainer } from './AlchemyContainer';
export { DeliveryContainer } from './DeliveryContainer';
