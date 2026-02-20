/**
 * Gathering Feature - 採取機能公開API
 *
 * TASK-0075: features/gathering/index.ts公開API作成
 *
 * @description
 * 採取機能の公開APIを定義。
 * types、services、componentsを一元的にエクスポートする。
 * 外部からのアクセスはこのindex.ts経由で行うこと。
 */

// =============================================================================
// Types
// =============================================================================

export type {
  DraftSession,
  DropRateLabel,
  GatheringCostResult,
  GatheringResult,
  IGatheringCard,
  IGatheringLocation,
  IGatheringLocationData,
  IGatheringMaterial,
  IGatheringService,
  ILocationSelectResult,
  IMaterial,
  IMaterialInstance,
  IMaterialPreview,
  MaterialOption,
} from './types';
export { GatheringStage, isGatheringCard } from './types';

// =============================================================================
// Services（純粋関数）
// =============================================================================

export type { GatherInput, GatherResult, SelectionError, SelectionResult } from './services';
export {
  calculateGatheringCost,
  gather,
  getAvailableLocations,
  getLocationDetail,
  getSelectableLocations,
  selectGatheringOption,
} from './services';

// =============================================================================
// Data（マスタデータ）
// =============================================================================

export { GATHERING_LOCATIONS } from './data/locations';

// =============================================================================
// Components
// =============================================================================

export type { MaterialDisplay } from './components';
export { GatheringPhaseUI, MaterialSlotUI } from './components';
