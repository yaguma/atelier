/**
 * アイテム関連インターフェース定義
 */

import { ItemCategory, ItemEffectType, Quality, Attribute } from '@domain/common/types';

/**
 * アイテム効果
 */
export interface IItemEffect {
  /** 効果タイプ */
  type: ItemEffectType;
  /** 効果値（品質で補正される基本値） */
  baseValue: number;
}

/**
 * アイテムマスターデータ
 * 調合で作成できるアイテムの定義
 */
export interface IItem {
  /** アイテムID */
  id: string;
  /** アイテム名 */
  name: string;
  /** カテゴリ */
  category: ItemCategory;
  /** 効果リスト */
  effects: IItemEffect[];
  /** 基本売却価格 */
  basePrice?: number;
  /** 説明 */
  description?: string;
}

/**
 * 属性値
 */
export interface IAttributeValue {
  attribute: Attribute;
  value: number;
}

/**
 * 効果値
 */
export interface IEffectValue {
  type: ItemEffectType;
  value: number;
}

/**
 * 使用した素材情報
 */
export interface IUsedMaterial {
  materialId: string;
  quantity: number;
  quality: Quality;
  /** レア素材フラグ */
  isRare: boolean;
}

/**
 * 調合済みアイテム（インベントリ内）
 */
export interface ICraftedItem {
  /** インスタンスID（一意識別子） */
  id: string;
  /** アイテムID（IItem.idを参照） */
  itemId: string;
  /** 品質 */
  quality: Quality;
  /** 実際の属性値（調合時に決定） */
  attributeValues: IAttributeValue[];
  /** 実際の効果値（品質補正適用済み） */
  effectValues: IEffectValue[];
  /** 使用した素材情報（素材消費依頼の判定用） */
  usedMaterials: IUsedMaterial[];
}
