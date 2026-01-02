/**
 * ギルドランク関連インターフェース定義
 */

import { GuildRank, Quality, SpecialRuleType } from '@domain/common/types';

/**
 * 特殊ルール
 */
export interface ISpecialRule {
  /** ルールタイプ */
  type: SpecialRuleType;
  /** ルールの値（例: QUEST_LIMITなら上限数） */
  value?: number;
  /** 適用条件（例: QUALITY_PENALTYなら対象品質） */
  condition?: Quality;
  /** 説明文 */
  description: string;
}

/**
 * 昇格試験の要件
 */
export interface IPromotionRequirement {
  /** アイテムID */
  itemId: string;
  /** 必要数 */
  quantity: number;
  /** 最低品質 */
  minQuality?: Quality;
}

/**
 * 昇格試験
 */
export interface IPromotionTest {
  /** 試験要件リスト */
  requirements: IPromotionRequirement[];
  /** 制限日数 */
  dayLimit: number;
}

/**
 * ギルドランクマスターデータ
 */
export interface IGuildRank {
  /** ランクID */
  id: GuildRank;
  /** ランク名 */
  name: string;
  /** 昇格ゲージ最大値 */
  maxPromotionGauge: number;
  /** 制限日数 */
  dayLimit: number;
  /** 特殊ルールリスト */
  specialRules: ISpecialRule[];
  /** 昇格試験（Sランクはnull） */
  promotionTest: IPromotionTest | null;
  /** 解放される採取地カードID */
  unlockedGatheringCards: string[];
  /** 解放されるレシピカードID */
  unlockedRecipeCards: string[];
}
