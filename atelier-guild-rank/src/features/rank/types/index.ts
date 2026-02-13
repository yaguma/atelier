/**
 * Rank Types - ランク機能の型定義バレルエクスポート
 *
 * TASK-0091: features/rank/types作成
 */

// --- RankService関連型 ---
export type {
  IRankService,
  PromotionResult,
  PromotionTest,
  PromotionTestRequirement,
} from '@domain/interfaces/rank-service.interface';
// --- ランク関連型（@shared/types再エクスポート） ---
export { GuildRank, SpecialRuleType } from '@shared/types';
export type {
  IGuildRankMaster,
  IPromotionRequirement,
  IPromotionTest,
  ISpecialRule,
} from '@shared/types/master-data';

// --- ランク進捗型（features/rank固有） ---
export type { RankProgress } from './rank-progress';
