/**
 * Gathering Types - 採取機能の型定義バレルエクスポート
 *
 * TASK-0072: features/gathering/types作成
 */

// --- 採取カード関連型 ---
export type { IGatheringCard, IGatheringMaterial } from './gathering-card';
export { isGatheringCard } from './gathering-card';
// --- GatheringService関連型 ---
export type {
  DraftSession,
  GatheringCostResult,
  GatheringResult,
  IGatheringService,
  MaterialOption,
} from './gathering-service';

// --- 素材関連型 ---
export type { IMaterial, IMaterialInstance } from './material';
