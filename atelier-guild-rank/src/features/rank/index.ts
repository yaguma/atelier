/**
 * @module features/rank
 * @description ランク機能モジュール
 *
 * ギルドランクの進捗管理、昇格判定、貢献度計算、
 * およびUI表示コンポーネントを提供する。
 *
 * TASK-0093: features/rank/index.ts公開API作成
 *
 * @example
 * ```typescript
 * import {
 *   calculateRankProgress,
 *   checkPromotion,
 *   calculateContribution,
 *   RankProgressBar,
 * } from '@features/rank';
 *
 * // ランク進捗計算
 * const progress = calculateRankProgress('D', 150, rankMaster);
 *
 * // 昇格判定
 * const canPromote = checkPromotion('D', 300, rankMaster);
 *
 * // 貢献度計算
 * const result = calculateContribution(context);
 * ```
 */

// =============================================================================
// Types - ランク関連の型定義
// =============================================================================

export type {
  IGuildRankMaster,
  IPromotionRequirement,
  IPromotionTest,
  IRankService,
  ISpecialRule,
  PromotionResult,
  PromotionTest,
  PromotionTestRequirement,
  RankProgress,
} from './types';
export { GuildRank, SpecialRuleType } from './types';

// =============================================================================
// Services - ランク関連のビジネスロジック（純粋関数）
// =============================================================================

export type { ContributionContext, ContributionResult, SpecialRuleEffect } from './services';
export {
  applySpecialRules,
  calculateContribution,
  calculatePromotionBonus,
  calculateRankProgress,
  checkPromotion,
  getClientModifier,
  getComboModifier,
  getNextRank,
  getQualityModifier,
  getRankOrder,
} from './services';

// =============================================================================
// Components - ランク関連UIコンポーネント
// =============================================================================

export type {
  DisplayRule,
  PromotionDialogConfig,
  RankBadgeConfig,
  RankProgressBarConfig,
  SpecialRuleDisplayConfig,
} from './components';
export { PromotionDialog, RankBadge, RankProgressBar, SpecialRuleDisplay } from './components';
