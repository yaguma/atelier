/**
 * calculate-reward.ts - 報酬計算の純粋関数
 *
 * TASK-0081: features/quest/services作成
 *
 * 納品時の報酬を計算する純粋関数。
 * 品質補正、依頼タイプ補正、依頼者補正を適用する。
 */

import type { Quality, QuestType } from '@shared/types';
import type { IClient, IQuest } from '@shared/types/quests';

// =============================================================================
// 型定義
// =============================================================================

/** 報酬計算対象のアイテム情報 */
export interface RewardableItem {
  /** アイテム品質 */
  quality: Quality;
}

/** 報酬計算結果 */
export interface RewardCalculationResult {
  /** 基本ゴールド報酬 */
  baseGold: number;
  /** 基本貢献度報酬 */
  baseContribution: number;
  /** 品質補正値 */
  qualityMultiplier: number;
  /** 依頼タイプ補正値 */
  typeMultiplier: number;
  /** 依頼者ゴールド補正値 */
  clientGoldMultiplier: number;
  /** 依頼者貢献度補正値 */
  clientContributionMultiplier: number;
  /** 最終ゴールド報酬 */
  totalGold: number;
  /** 最終貢献度報酬 */
  totalContribution: number;
}

// =============================================================================
// 定数
// =============================================================================

/** 品質に応じた報酬補正値 */
export const QUALITY_REWARD_MULTIPLIER: Record<Quality, number> = {
  D: 0.5,
  C: 1.0,
  B: 1.5,
  A: 2.0,
  S: 3.0,
};

/** 依頼タイプに応じた貢献度補正値 */
export const QUEST_TYPE_CONTRIBUTION_MULTIPLIER: Record<QuestType, number> = {
  SPECIFIC: 1.0,
  CATEGORY: 0.8,
  QUALITY: 1.2,
  QUANTITY: 0.7,
  ATTRIBUTE: 1.3,
  EFFECT: 1.3,
  MATERIAL: 1.5,
  COMPOUND: 1.8,
};

// =============================================================================
// メイン関数
// =============================================================================

/**
 * 納品報酬を計算する（純粋関数）
 *
 * 計算式:
 * - ゴールド = 基本ゴールド * 品質補正 * 依頼者ゴールド補正
 * - 貢献度 = 基本貢献度 * 品質補正 * 依頼タイプ補正 * 依頼者貢献度補正
 *
 * @param quest - 依頼データ
 * @param client - 依頼者データ
 * @param item - 納品アイテム
 * @returns 報酬計算結果
 */
export function calculateReward(
  quest: IQuest,
  client: IClient,
  item: RewardableItem,
): RewardCalculationResult {
  const qualityMultiplier = QUALITY_REWARD_MULTIPLIER[item.quality];
  const typeMultiplier = QUEST_TYPE_CONTRIBUTION_MULTIPLIER[quest.condition.type];
  const clientGoldMultiplier = client.goldMultiplier;
  const clientContributionMultiplier = client.contributionMultiplier;

  const totalGold = Math.floor(quest.gold * qualityMultiplier * clientGoldMultiplier);
  const totalContribution = Math.floor(
    quest.contribution * qualityMultiplier * typeMultiplier * clientContributionMultiplier,
  );

  return {
    baseGold: quest.gold,
    baseContribution: quest.contribution,
    qualityMultiplier,
    typeMultiplier,
    clientGoldMultiplier,
    clientContributionMultiplier,
    totalGold,
    totalContribution,
  };
}

/**
 * 複数アイテム納品時の平均品質ボーナスを計算する（純粋関数）
 *
 * @param items - 納品アイテムリスト
 * @returns 平均品質補正値
 */
export function calculateAverageQualityMultiplier(items: readonly RewardableItem[]): number {
  if (items.length === 0) {
    return 0;
  }

  const totalMultiplier = items.reduce((sum, item) => {
    return sum + QUALITY_REWARD_MULTIPLIER[item.quality];
  }, 0);

  return totalMultiplier / items.length;
}
