/**
 * rank-operations.ts - ランク操作の純粋関数
 * TASK-0092: features/rank/services作成
 *
 * ランク進捗計算、昇格判定、次ランク取得などの
 * ビジネスロジックを純粋関数として提供する。
 */

import type { GuildRank } from '@shared/types';
import type { IGuildRankMaster, ISpecialRule } from '@shared/types/master-data';
import type { RankProgress } from '../types/rank-progress';

// =============================================================================
// 定数
// =============================================================================

/** ランク順序（G→S） */
const RANK_ORDER: GuildRank[] = ['G', 'F', 'E', 'D', 'C', 'B', 'A', 'S'];

/** 昇格ボーナス報酬の基礎値 */
const PROMOTION_BONUS_BASE = 100;

// =============================================================================
// ランク進捗計算
// =============================================================================

/**
 * ランク進捗情報を計算する（純粋関数）
 *
 * @param currentRank - 現在のランク
 * @param accumulatedContribution - 累積貢献度
 * @param rankMaster - 現在ランクのマスターデータ
 * @returns ランク進捗情報
 */
export function calculateRankProgress(
  currentRank: GuildRank,
  accumulatedContribution: number,
  rankMaster: IGuildRankMaster | null,
): RankProgress {
  const requiredContribution = rankMaster?.requiredContribution ?? 0;
  const promotionGauge =
    requiredContribution > 0
      ? Math.floor((accumulatedContribution / requiredContribution) * 100)
      : 0;
  const remainingContribution = Math.max(0, requiredContribution - accumulatedContribution);
  const nextRank = getNextRank(currentRank);
  const canPromote = nextRank !== null && promotionGauge >= 100;

  return {
    currentRank,
    accumulatedContribution,
    requiredContribution,
    promotionGauge,
    remainingContribution,
    canPromote,
    nextRank,
  };
}

// =============================================================================
// 昇格判定
// =============================================================================

/**
 * 昇格可能かどうかを判定する（純粋関数）
 *
 * @param currentRank - 現在のランク
 * @param accumulatedContribution - 累積貢献度
 * @param rankMaster - 現在ランクのマスターデータ
 * @returns 昇格可能な場合true
 */
export function checkPromotion(
  currentRank: GuildRank,
  accumulatedContribution: number,
  rankMaster: IGuildRankMaster | null,
): boolean {
  if (currentRank === 'S') {
    return false;
  }
  if (!rankMaster) {
    return false;
  }
  const gauge = Math.floor((accumulatedContribution / rankMaster.requiredContribution) * 100);
  return gauge >= 100;
}

/**
 * 昇格ボーナス報酬を計算する（純粋関数）
 *
 * @param newRank - 昇格先のランク
 * @returns ボーナス報酬（ゴールド）
 */
export function calculatePromotionBonus(newRank: GuildRank): number {
  const rankIndex = RANK_ORDER.indexOf(newRank);
  if (rankIndex === -1) {
    return 0;
  }
  return PROMOTION_BONUS_BASE * (rankIndex + 1);
}

// =============================================================================
// ランク情報取得
// =============================================================================

/**
 * 次のランクを取得する（純粋関数）
 *
 * @param currentRank - 現在のランク
 * @returns 次のランク（最高ランクの場合はnull）
 */
export function getNextRank(currentRank: GuildRank): GuildRank | null {
  const currentIndex = RANK_ORDER.indexOf(currentRank);
  if (currentIndex === -1 || currentIndex >= RANK_ORDER.length - 1) {
    return null;
  }
  return RANK_ORDER[currentIndex + 1] ?? null;
}

/**
 * ランクの順序値を取得する（純粋関数）
 *
 * @param rank - ランク
 * @returns 順序値（G=0, F=1, ..., S=7）、不明なランクは-1
 */
export function getRankOrder(rank: GuildRank): number {
  const index = RANK_ORDER.indexOf(rank);
  return index;
}

// =============================================================================
// 特殊ルール処理
// =============================================================================

/** 特殊ルール適用結果 */
export interface SpecialRuleEffect {
  /** 依頼受注数上限（nullの場合は変更なし） */
  questLimit: number | null;
  /** 品質ペナルティ係数（1.0 = ペナルティなし） */
  qualityPenalty: number;
  /** 期限短縮日数 */
  deadlineReduction: number;
  /** 最低品質要求（nullの場合は要求なし） */
  qualityRequired: string | null;
}

/**
 * 特殊ルールの効果を計算する（純粋関数）
 *
 * @param rules - 適用する特殊ルールの配列
 * @returns 統合された特殊ルール効果
 */
export function applySpecialRules(rules: readonly ISpecialRule[]): SpecialRuleEffect {
  const effect: SpecialRuleEffect = {
    questLimit: null,
    qualityPenalty: 1.0,
    deadlineReduction: 0,
    qualityRequired: null,
  };

  for (const rule of rules) {
    switch (rule.type) {
      case 'QUEST_LIMIT':
        effect.questLimit = rule.value ?? null;
        break;
      case 'QUALITY_PENALTY':
        if (rule.value !== undefined) {
          effect.qualityPenalty *= rule.value;
        }
        break;
      case 'DEADLINE_REDUCTION':
        effect.deadlineReduction += rule.value ?? 0;
        break;
      case 'QUALITY_REQUIRED':
        effect.qualityRequired = rule.condition ?? null;
        break;
    }
  }

  return effect;
}
