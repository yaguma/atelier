/**
 * カード関連インターフェース定義
 */

import {
  CardType,
  EnhancementTarget,
  EffectType,
  GuildRank,
  ItemCategory,
  Quality,
  Rarity,
} from '@domain/common/types';

/**
 * カード効果
 */
export interface ICardEffect {
  /** 効果タイプ */
  type: EffectType;
  /** 効果値 */
  value: number;
}

/**
 * カード基底インターフェース
 * すべてのカードが持つ共通プロパティ
 */
export interface ICard {
  /** カードID */
  id: string;
  /** カード名 */
  name: string;
  /** カード種別 */
  type: CardType;
  /** レアリティ */
  rarity: Rarity;
  /** 解放ランク */
  unlockRank: GuildRank;
  /** フレーバーテキスト */
  description?: string;
}

/**
 * 採取で獲得できる素材情報
 */
export interface IGatheringMaterial {
  /** 素材ID */
  materialId: string;
  /** 獲得数 */
  quantity: number;
  /** 獲得確率（0.0〜1.0） */
  probability: number;
  /** 品質（指定がなければ素材のbaseQualityを使用） */
  quality?: Quality;
}

/**
 * 採取地カード
 */
export interface IGatheringCard extends ICard {
  type: CardType.GATHERING;
  /** 行動コスト（0〜3） */
  cost: number;
  /** 獲得可能な素材リスト */
  materials: IGatheringMaterial[];
}

/**
 * レシピに必要な素材情報
 */
export interface IRequiredMaterial {
  /** 素材ID */
  materialId: string;
  /** 必要数 */
  quantity: number;
  /** 最低品質（指定がなければ任意品質でOK） */
  minQuality?: Quality;
}

/**
 * レシピカード
 */
export interface IRecipeCard extends ICard {
  type: CardType.RECIPE;
  /** 行動コスト（1〜3） */
  cost: number;
  /** 必要素材リスト */
  requiredMaterials: IRequiredMaterial[];
  /** 出力アイテムID */
  outputItemId: string;
  /** アイテムカテゴリ */
  category: ItemCategory;
}

/**
 * 強化カード
 */
export interface IEnhancementCard extends ICard {
  type: CardType.ENHANCEMENT;
  /** コストは常に0 */
  cost: 0;
  /** 効果 */
  effect: ICardEffect;
  /** 対象行動 */
  targetAction: EnhancementTarget;
}

/**
 * カードのユニオン型
 */
export type Card = IGatheringCard | IRecipeCard | IEnhancementCard;
