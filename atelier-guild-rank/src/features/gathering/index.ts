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

// 採取カード関連
// GatheringService関連
// 素材関連
export type {
  DraftSession,
  GatheringCostResult,
  GatheringResult,
  IGatheringCard,
  IGatheringMaterial,
  IGatheringService,
  IMaterial,
  IMaterialInstance,
  MaterialOption,
} from './types';
export { isGatheringCard } from './types';

// =============================================================================
// Services（純粋関数）
// =============================================================================

export type { GatherInput, GatherResult, SelectionError, SelectionResult } from './services';
export { calculateGatheringCost, gather, selectGatheringOption } from './services';

// =============================================================================
// Components
// =============================================================================

export type { MaterialDisplay } from './components';
export { GatheringPhaseUI, MaterialSlotUI } from './components';
