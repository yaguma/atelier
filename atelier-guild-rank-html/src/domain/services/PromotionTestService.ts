/**
 * 昇格試験ドメインサービス
 * TASK-0097: 昇格試験ドメインサービス
 *
 * 昇格試験の課題達成判定、報酬計算を管理する
 */

import { GuildRank, Quality } from '@domain/common/types';
import type { IPromotionTest, IPromotionRequirement } from '@domain/rank/Rank';
import type { ICraftedItem } from '@domain/item/Item';

/**
 * 昇格試験報酬
 */
export interface PromotionTestReward {
  /** 獲得ゴールド */
  gold: number;
  /** 選択可能なアーティファクト */
  artifactChoices: string[];
}

/**
 * 課題進捗情報
 */
export interface RequirementProgress {
  /** 要件 */
  requirement: IPromotionRequirement;
  /** 現在のカウント */
  currentCount: number;
  /** 必要数 */
  requiredCount: number;
  /** 完了しているか */
  isCompleted: boolean;
}

/**
 * 品質順序マップ
 */
const QualityOrder: Record<Quality, number> = {
  [Quality.E]: 0,
  [Quality.D]: 1,
  [Quality.C]: 2,
  [Quality.B]: 3,
  [Quality.A]: 4,
  [Quality.S]: 5,
};

/**
 * ランクごとの報酬ゴールド
 */
const RankRewardGold: Record<GuildRank, number> = {
  [GuildRank.G]: 100,
  [GuildRank.F]: 200,
  [GuildRank.E]: 300,
  [GuildRank.D]: 500,
  [GuildRank.C]: 800,
  [GuildRank.B]: 1200,
  [GuildRank.A]: 2000,
  [GuildRank.S]: 0, // Sランクは昇格試験なし
};

/**
 * ランクごとの報酬アーティファクト選択肢
 */
const RankRewardArtifacts: Record<GuildRank, string[]> = {
  [GuildRank.G]: ['artifact_lucky_charm', 'artifact_quality_lens', 'artifact_storage_box'],
  [GuildRank.F]: ['artifact_spirit_guide', 'artifact_ancient_map', 'artifact_sage_catalyst'],
  [GuildRank.E]: ['artifact_master_glove', 'artifact_guild_seal', 'artifact_alchemist_ring'],
  [GuildRank.D]: ['artifact_time_crystal', 'artifact_philosopher_stone', 'artifact_dragon_scale'],
  [GuildRank.C]: ['artifact_eternal_flame', 'artifact_wisdom_orb', 'artifact_miracle_seed'],
  [GuildRank.B]: ['artifact_star_fragment', 'artifact_void_crystal', 'artifact_life_essence'],
  [GuildRank.A]: ['artifact_world_tree_leaf', 'artifact_divine_hammer', 'artifact_cosmic_dust'],
  [GuildRank.S]: [], // Sランクは昇格試験なし
};

/**
 * 昇格試験ドメインサービス
 */
export class PromotionTestService {
  /**
   * 要件を満たすかどうかを判定する
   * @param requirement 要件
   * @param items 所持アイテム
   * @returns 要件を満たす場合true
   */
  checkRequirement(requirement: IPromotionRequirement, items: ICraftedItem[]): boolean {
    // 指定アイテムで品質を満たすものをフィルタ
    const validItems = items.filter((item) => {
      if (item.itemId !== requirement.itemId) {
        return false;
      }

      // 品質条件がある場合はチェック
      if (requirement.minQuality) {
        const itemQuality = QualityOrder[item.quality];
        const requiredQuality = QualityOrder[requirement.minQuality];
        if (itemQuality < requiredQuality) {
          return false;
        }
      }

      return true;
    });

    // 数量を満たすか
    return validItems.length >= requirement.quantity;
  }

  /**
   * 全要件を満たすかどうかを判定する
   * @param promotionTest 昇格試験
   * @param items 所持アイテム
   * @returns 全要件を満たす場合true
   */
  checkAllRequirements(promotionTest: IPromotionTest, items: ICraftedItem[]): boolean {
    return promotionTest.requirements.every((requirement) =>
      this.checkRequirement(requirement, items)
    );
  }

  /**
   * 報酬を計算する
   * @param currentRank 現在のランク
   * @returns 報酬
   */
  calculateReward(currentRank: GuildRank): PromotionTestReward {
    return {
      gold: RankRewardGold[currentRank],
      artifactChoices: [...RankRewardArtifacts[currentRank]],
    };
  }

  /**
   * 課題の進捗状況を取得する
   * @param promotionTest 昇格試験
   * @param items 所持アイテム
   * @returns 進捗情報
   */
  getProgress(promotionTest: IPromotionTest, items: ICraftedItem[]): RequirementProgress[] {
    return promotionTest.requirements.map((requirement) => {
      // 要件を満たすアイテムをカウント
      const validItems = items.filter((item) => {
        if (item.itemId !== requirement.itemId) {
          return false;
        }

        if (requirement.minQuality) {
          const itemQuality = QualityOrder[item.quality];
          const requiredQuality = QualityOrder[requirement.minQuality];
          if (itemQuality < requiredQuality) {
            return false;
          }
        }

        return true;
      });

      const currentCount = validItems.length;
      const requiredCount = requirement.quantity;

      return {
        requirement,
        currentCount,
        requiredCount,
        isCompleted: currentCount >= requiredCount,
      };
    });
  }

  /**
   * 試験に使用するアイテムを消費する
   * @param promotionTest 昇格試験
   * @param items 所持アイテム
   * @returns 消費されるアイテム
   */
  consumeItems(promotionTest: IPromotionTest, items: ICraftedItem[]): ICraftedItem[] {
    const consumed: ICraftedItem[] = [];

    for (const requirement of promotionTest.requirements) {
      // 要件を満たすアイテムを取得
      const validItems = items.filter((item) => {
        if (item.itemId !== requirement.itemId) {
          return false;
        }

        if (requirement.minQuality) {
          const itemQuality = QualityOrder[item.quality];
          const requiredQuality = QualityOrder[requirement.minQuality];
          if (itemQuality < requiredQuality) {
            return false;
          }
        }

        // すでに消費済みのアイテムは除外
        if (consumed.some((c) => c.id === item.id)) {
          return false;
        }

        return true;
      });

      // 必要数分だけ消費
      for (let i = 0; i < Math.min(requirement.quantity, validItems.length); i++) {
        consumed.push(validItems[i]);
      }
    }

    return consumed;
  }

  /**
   * 品質を数値に変換する（内部ユーティリティ）
   * @param quality 品質
   * @returns 数値
   */
  private qualityToNumber(quality: Quality): number {
    return QualityOrder[quality];
  }
}
