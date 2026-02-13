/**
 * Rank Services - ランク機能サービスのバレルエクスポート
 *
 * TASK-0092: features/rank/services作成
 */

// --- 貢献度計算 ---
export type { ContributionContext, ContributionResult } from './contribution-calculator';
export {
  calculateContribution,
  getClientModifier,
  getComboModifier,
  getQualityModifier,
} from './contribution-calculator';
// --- ランク操作 ---
export type { SpecialRuleEffect } from './rank-operations';
export {
  applySpecialRules,
  calculatePromotionBonus,
  calculateRankProgress,
  checkPromotion,
  getNextRank,
  getRankOrder,
} from './rank-operations';
