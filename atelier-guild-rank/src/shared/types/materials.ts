/**
 * materials.ts - 素材・アイテム関連型定義
 *
 * 素材とアイテムのインターフェース定義
 */

import type { Attribute, ItemCategory, ItemEffectType, Quality } from './common';
import type { ItemId, MaterialId } from './ids';

// =============================================================================
// 素材関連
// =============================================================================

/**
 * 素材マスターインターフェース
 */
export interface IMaterial {
  /** 素材ID */
  id: MaterialId;
  /** 素材名 */
  name: string;
  /** 基本品質 */
  baseQuality: Quality;
  /** 持つことができる属性リスト */
  attributes: Attribute[];
  /** 説明（オプション） */
  description?: string;
}

/**
 * 素材インスタンスインターフェース
 * 実際に所持している素材の状態
 */
export interface IMaterialInstance {
  /** 素材ID */
  materialId: MaterialId;
  /** 品質 */
  quality: Quality;
  /** 所持数量 */
  quantity: number;
}

// =============================================================================
// アイテム関連
// =============================================================================

/**
 * アイテム効果情報
 */
export interface IItemEffect {
  /** 効果種別 */
  type: ItemEffectType;
  /** 基本効果値 */
  baseValue: number;
}

/**
 * アイテムマスターインターフェース
 */
export interface IItem {
  /** アイテムID */
  id: ItemId;
  /** アイテム名 */
  name: string;
  /** アイテムカテゴリ */
  category: ItemCategory;
  /** 効果リスト */
  effects: IItemEffect[];
  /** 説明（オプション） */
  description?: string;
}

// =============================================================================
// 調合済みアイテム関連
// =============================================================================

/**
 * 属性値情報
 */
export interface IAttributeValue {
  /** 属性 */
  attribute: Attribute;
  /** 属性値 */
  value: number;
}

/**
 * 効果値情報
 */
export interface IEffectValue {
  /** 効果種別 */
  type: ItemEffectType;
  /** 効果値 */
  value: number;
}

/**
 * 使用素材情報
 */
export interface IUsedMaterial {
  /** 素材ID */
  materialId: MaterialId;
  /** 品質 */
  quality: Quality;
  /** 使用数量 */
  quantity: number;
  /** レア素材かどうか */
  isRare: boolean;
}

/**
 * 調合済みアイテムインターフェース
 */
export interface ICraftedItem {
  /** アイテムID */
  itemId: ItemId;
  /** 品質 */
  quality: Quality;
  /** 属性値リスト */
  attributeValues: IAttributeValue[];
  /** 効果値リスト */
  effectValues: IEffectValue[];
  /** 使用した素材リスト */
  usedMaterials: IUsedMaterial[];
}
