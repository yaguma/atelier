/**
 * アトリエ錬金術ゲーム TypeScriptインターフェース定義
 *
 * @version 1.0.0
 * @description ギルドランク制デッキ構築RPGのドメインモデル型定義
 * @see docs/spec/atelier-guild-rank-requirements.md
 */

// ============================================================================

/**
 * 素材・アイテム関連の型定義
 * このファイルは interfaces.ts から分割されたのだ
 * @see interfaces/core.ts
 */

// ============================================================================
// 素材・アイテム関連インターフェース
// ============================================================================

/**
 * 素材マスターデータ
 * 🔵 青信号: 要件定義書 Section 4.5 に詳細記載
 */
export interface IMaterial {
  /** 素材ID */
  id: string;
  /** 素材名 */
  name: string;
  /** 基本品質 */
  baseQuality: Quality;
  /** 属性リスト */
  attributes: Attribute[];
  /** 説明 */
  description?: string;
}

/**
 * 素材インスタンス（インベントリ内）
 * 品質と数量を持つ実際の素材
 */
export interface IMaterialInstance {
  /** 素材ID（IMaterial.idを参照） */
  materialId: string;
  /** 実際の品質 */
  quality: Quality;
  /** 所持数 */
  quantity: number;
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
  /** 説明 */
  description?: string;
}

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
 * 調合済みアイテム（インベントリ内）
 */
export interface ICraftedItem {
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

