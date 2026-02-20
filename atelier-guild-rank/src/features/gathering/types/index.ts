/**
 * Gathering Types - 採取機能の型定義バレルエクスポート
 *
 * TASK-0072: features/gathering/types作成
 * TASK-0103: AP超過計算関連型追加
 */

// --- AP超過計算関連型 ---
export type { IAPConsumptionInput, IAPOverflowResult } from './ap-overflow';
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
