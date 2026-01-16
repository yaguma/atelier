/**
 * cards.ts - カード関連型定義
 *
 * カードの基底インターフェースと各種カード型
 */

import type {
  EffectType,
  EnhancementTarget,
  GuildRank,
  ItemCategory,
  Quality,
  Rarity,
} from './common';
import { CardType } from './common';
import type { CardId, MaterialId } from './ids';

// =============================================================================
// 基底インターフェース
// =============================================================================

/**
 * カード基底インターフェース
 */
export interface ICard {
  /** カードID */
  id: CardId;
  /** カード名 */
  name: string;
  /** カード種別 */
  type: CardType;
  /** レアリティ */
  rarity: Rarity;
  /** 解禁ランク */
  unlockRank: GuildRank;
  /** 説明（オプション） */
  description?: string;
}

// =============================================================================
// 採取カード
// =============================================================================

/**
 * 採取可能素材情報
 */
export interface IGatheringMaterial {
  /** 素材ID */
  materialId: MaterialId;
  /** 取得数量 */
  quantity: number;
  /** 出現確率（0-1） */
  probability: number;
  /** 品質（オプション） */
  quality?: Quality;
}

/**
 * 採取地カードインターフェース
 */
export interface IGatheringCard extends ICard {
  /** カード種別（採取に固定） */
  type: typeof CardType.GATHERING;
  /** 行動コスト */
  cost: number;
  /** 取得可能素材リスト */
  materials: IGatheringMaterial[];
}

// =============================================================================
// レシピカード
// =============================================================================

/**
 * 必要素材情報
 */
export interface IRequiredMaterial {
  /** 素材ID */
  materialId: MaterialId;
  /** 必要数量 */
  quantity: number;
  /** 最低品質（オプション） */
  minQuality?: Quality;
}

/**
 * レシピカードインターフェース
 */
export interface IRecipeCard extends ICard {
  /** カード種別（レシピに固定） */
  type: typeof CardType.RECIPE;
  /** 行動コスト */
  cost: number;
  /** 必要素材リスト */
  requiredMaterials: IRequiredMaterial[];
  /** 出力アイテムID */
  outputItemId: string;
  /** アイテムカテゴリ */
  category: ItemCategory;
}

// =============================================================================
// 強化カード
// =============================================================================

/**
 * カード効果情報
 */
export interface ICardEffect {
  /** 効果種別 */
  type: EffectType;
  /** 効果値 */
  value: number;
}

/**
 * 強化カードインターフェース
 */
export interface IEnhancementCard extends ICard {
  /** カード種別（強化に固定） */
  type: typeof CardType.ENHANCEMENT;
  /** 行動コスト（強化カードは0） */
  cost: 0;
  /** 効果情報 */
  effect: ICardEffect;
  /** 対象アクション */
  targetAction: EnhancementTarget;
}

// =============================================================================
// ユニオン型
// =============================================================================

/**
 * カードユニオン型
 */
export type Card = IGatheringCard | IRecipeCard | IEnhancementCard;

// =============================================================================
// 型ガード関数
// =============================================================================

/**
 * 採取カードかどうかを判定
 * @param card - 判定対象のカード
 * @returns 採取カードならtrue
 */
export function isGatheringCard(card: Card): card is IGatheringCard {
  return card.type === CardType.GATHERING;
}

/**
 * レシピカードかどうかを判定
 * @param card - 判定対象のカード
 * @returns レシピカードならtrue
 */
export function isRecipeCard(card: Card): card is IRecipeCard {
  return card.type === CardType.RECIPE;
}

/**
 * 強化カードかどうかを判定
 * @param card - 判定対象のカード
 * @returns 強化カードならtrue
 */
export function isEnhancementCard(card: Card): card is IEnhancementCard {
  return card.type === CardType.ENHANCEMENT;
}
