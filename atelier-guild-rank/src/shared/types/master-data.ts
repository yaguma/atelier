/**
 * master-data.ts - マスターデータ型定義
 *
 * TASK-0006: マスターデータローダー実装
 * ゲームの静的マスターデータを定義する
 */

import type {
  EffectType,
  EnhancementTarget,
  GuildRank,
  ItemCategory,
  Quality,
  Rarity,
  SpecialRuleType,
} from './common';
import type { ArtifactId, CardId } from './ids';
import type { IItem, IMaterial } from './materials';
import type { IClient } from './quests';

// =============================================================================
// カードマスター型
// =============================================================================

/**
 * 採取地カードマスター
 */
export interface IGatheringCardMaster {
  /** カードID */
  id: CardId;
  /** カード名 */
  name: string;
  /** カード種別（GATHERING固定） */
  type: 'GATHERING';
  /** 基本コスト */
  baseCost: number;
  /** 提示回数 */
  presentationCount: number;
  /** レア素材出現率（%） */
  rareRate: number;
  /** 素材プール（素材IDリスト） */
  materialPool: string[];
  /** レアリティ */
  rarity: Rarity;
  /** 解禁ランク */
  unlockRank: GuildRank;
  /** 説明 */
  description: string;
}

/**
 * レシピカードの必要素材
 */
export interface IRecipeRequiredMaterial {
  /** 素材ID */
  materialId: string;
  /** 必要数量 */
  quantity: number;
  /** 最低品質（オプション） */
  minQuality?: Quality;
}

/**
 * レシピカードマスター
 */
export interface IRecipeCardMaster {
  /** カードID */
  id: CardId;
  /** カード名 */
  name: string;
  /** カード種別（RECIPE固定） */
  type: 'RECIPE';
  /** 行動コスト */
  cost: number;
  /** 必要素材リスト */
  requiredMaterials: IRecipeRequiredMaterial[];
  /** 出力アイテムID */
  outputItemId: string;
  /** アイテムカテゴリ */
  category: ItemCategory;
  /** レアリティ */
  rarity: Rarity;
  /** 解禁ランク */
  unlockRank: GuildRank;
  /** 説明 */
  description: string;
}

/**
 * 強化カード効果
 */
export interface IEnhancementEffect {
  /** 効果種別 */
  type: EffectType | string;
  /** 効果値 */
  value: number;
}

/**
 * 強化カードマスター
 */
export interface IEnhancementCardMaster {
  /** カードID */
  id: CardId;
  /** カード名 */
  name: string;
  /** カード種別（ENHANCEMENT固定） */
  type: 'ENHANCEMENT';
  /** 行動コスト（強化カードは0） */
  cost: 0;
  /** 効果情報 */
  effect: IEnhancementEffect;
  /** 対象アクション */
  targetAction: EnhancementTarget;
  /** レアリティ */
  rarity: Rarity;
  /** 解禁ランク */
  unlockRank: GuildRank;
  /** 説明 */
  description: string;
}

/**
 * カードマスターユニオン型
 */
export type CardMaster = IGatheringCardMaster | IRecipeCardMaster | IEnhancementCardMaster;

// =============================================================================
// マテリアルマスター型
// =============================================================================

/**
 * 素材マスター（JSON用）
 * IMaterialと同じ構造だが、マスターデータ用に明示的に定義
 */
export type MaterialMaster = IMaterial;

// =============================================================================
// アイテムマスター型
// =============================================================================

/**
 * アイテムマスター（JSON用）
 * IItemと同じ構造だが、マスターデータ用に明示的に定義
 */
export type ItemMaster = IItem;

// =============================================================================
// ギルドランクマスター型
// =============================================================================

/**
 * 特殊ルール
 */
export interface ISpecialRule {
  /** ルール種別 */
  type: SpecialRuleType;
  /** 値（オプション） */
  value?: number;
  /** 条件（オプション） */
  condition?: string;
  /** 説明 */
  description: string;
}

/**
 * 昇格試験要件
 */
export interface IPromotionRequirement {
  /** アイテムID */
  itemId: string;
  /** 必要数量 */
  quantity: number;
  /** 最低品質（オプション） */
  minQuality?: Quality;
}

/**
 * 昇格試験
 */
export interface IPromotionTest {
  /** 要件リスト */
  requirements: IPromotionRequirement[];
  /** 期限（日数） */
  dayLimit: number;
}

/**
 * ギルドランクマスター
 */
export interface IGuildRankMaster {
  /** ランクID（G, F, E, D, C, B, A, S） */
  id: GuildRank;
  /** ランク名 */
  name: string;
  /** 昇格に必要な貢献度 */
  requiredContribution: number;
  /** ランク期限（日数） */
  dayLimit: number;
  /** 特殊ルール */
  specialRules: ISpecialRule[];
  /** 昇格試験（Sランクはnull） */
  promotionTest: IPromotionTest | null;
  /** 解禁採取カードID */
  unlockedGatheringCards: string[];
  /** 解禁レシピカードID */
  unlockedRecipeCards: string[];
}

// =============================================================================
// 依頼者マスター型
// =============================================================================

/**
 * 依頼者マスター（JSON用）
 * IClientと同じ構造だが、マスターデータ用に明示的に定義
 */
export type ClientMaster = IClient;

// =============================================================================
// 依頼テンプレートマスター型
// =============================================================================

import type { IQuest } from './quests';

/**
 * 依頼テンプレートマスター（JSON用）
 * IQuestと同じ構造だが、マスターデータ用に明示的に定義
 */
export type QuestMaster = IQuest;

// =============================================================================
// アーティファクトマスター型
// =============================================================================

/**
 * アーティファクト効果
 */
export interface IArtifactEffect {
  /** 効果種別 */
  type: EffectType | string;
  /** 効果値 */
  value: number;
}

/**
 * アーティファクトマスター
 */
export interface IArtifactMaster {
  /** アーティファクトID */
  id: ArtifactId;
  /** アーティファクト名 */
  name: string;
  /** 効果 */
  effect: IArtifactEffect;
  /** レアリティ */
  rarity: Rarity;
  /** 説明 */
  description: string;
}

// =============================================================================
// 型ガード関数
// =============================================================================

/**
 * 採取カードマスターかどうかを判定
 */
export function isGatheringCardMaster(card: CardMaster): card is IGatheringCardMaster {
  return card.type === 'GATHERING';
}

/**
 * レシピカードマスターかどうかを判定
 */
export function isRecipeCardMaster(card: CardMaster): card is IRecipeCardMaster {
  return card.type === 'RECIPE';
}

/**
 * 強化カードマスターかどうかを判定
 */
export function isEnhancementCardMaster(card: CardMaster): card is IEnhancementCardMaster {
  return card.type === 'ENHANCEMENT';
}
