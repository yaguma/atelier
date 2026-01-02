/**
 * アイテムエンティティ
 * TASK-0086: アイテムエンティティ
 *
 * アイテムマスターデータエンティティと調合済みアイテムエンティティを実装する
 * すべてのエンティティは不変オブジェクトとして設計されている
 */

import {
  ItemCategory,
  ItemEffectType,
  Quality,
  Attribute,
} from '@domain/common/types';
import type {
  IItem,
  IItemEffect,
  ICraftedItem,
  IAttributeValue,
  IEffectValue,
  IUsedMaterial,
} from './Item';

/**
 * 品質補正マップ
 * 品質に応じた補正倍率
 */
const QualityMultiplier: Record<Quality, number> = {
  [Quality.D]: 0.5,
  [Quality.C]: 1.0,
  [Quality.B]: 1.5,
  [Quality.A]: 2.0,
  [Quality.S]: 3.0,
};

/**
 * アイテムマスターデータエンティティ
 * アイテムの基本情報を保持する不変オブジェクト
 */
export class Item implements IItem {
  public readonly id: string;
  public readonly name: string;
  public readonly category: ItemCategory;
  private readonly _effects: readonly IItemEffect[];
  public readonly basePrice?: number;
  public readonly description?: string;

  // IItem互換のためのgetter
  get effects(): IItemEffect[] {
    return this.getEffects();
  }

  constructor(data: IItem) {
    this.id = data.id;
    this.name = data.name;
    this.category = data.category;
    // 不変性を保証するため、深いコピーを作成
    this._effects = Object.freeze(
      data.effects.map((e) => Object.freeze({ ...e }))
    );
    this.basePrice = data.basePrice;
    this.description = data.description;
    Object.freeze(this);
  }

  /**
   * カテゴリを取得する
   * @returns アイテムカテゴリ
   */
  getCategory(): ItemCategory {
    return this.category;
  }

  /**
   * 効果リストを取得する
   * 不変性を保証するため、コピーを返す
   * @returns 効果リストのコピー
   */
  getEffects(): IItemEffect[] {
    return this._effects.map((e) => ({ ...e }));
  }

  /**
   * 基本売却価格を取得する
   * @returns 基本売却価格（未設定の場合は0）
   */
  getBasePrice(): number {
    return this.basePrice ?? 0;
  }
}

/**
 * 調合済みアイテムエンティティ
 * インベントリ内の実際のアイテムを表す不変オブジェクト
 */
export class CraftedItem implements ICraftedItem {
  public readonly itemId: string;
  public readonly quality: Quality;
  private readonly _attributeValues: readonly IAttributeValue[];
  private readonly _effectValues: readonly IEffectValue[];
  private readonly _usedMaterials: readonly IUsedMaterial[];

  // ICraftedItem互換のためのgetter
  get attributeValues(): IAttributeValue[] {
    return this.getAttributeValues();
  }

  get effectValues(): IEffectValue[] {
    return this.getEffectValues();
  }

  get usedMaterials(): IUsedMaterial[] {
    return this.getUsedMaterials();
  }

  constructor(data: ICraftedItem) {
    this.itemId = data.itemId;
    this.quality = data.quality;
    // 不変性を保証するため、深いコピーを作成
    this._attributeValues = Object.freeze(
      data.attributeValues.map((a) => Object.freeze({ ...a }))
    );
    this._effectValues = Object.freeze(
      data.effectValues.map((e) => Object.freeze({ ...e }))
    );
    this._usedMaterials = Object.freeze(
      data.usedMaterials.map((m) => Object.freeze({ ...m }))
    );
    Object.freeze(this);
  }

  /**
   * 品質を取得する
   * @returns 品質（D〜S）
   */
  getQuality(): Quality {
    return this.quality;
  }

  /**
   * 売却価格を計算する
   * @param basePrice 基本売却価格
   * @returns 品質補正後の売却価格
   */
  calculateSellPrice(basePrice: number): number {
    const multiplier = QualityMultiplier[this.quality];
    return Math.floor(basePrice * multiplier);
  }

  /**
   * 効果値リストを取得する
   * 不変性を保証するため、コピーを返す
   * @returns 効果値リストのコピー
   */
  getEffectValues(): IEffectValue[] {
    return this._effectValues.map((e) => ({ ...e }));
  }

  /**
   * 属性値リストを取得する
   * 不変性を保証するため、コピーを返す
   * @returns 属性値リストのコピー
   */
  getAttributeValues(): IAttributeValue[] {
    return this._attributeValues.map((a) => ({ ...a }));
  }

  /**
   * 特定の属性値を取得する
   * @param attribute 取得する属性
   * @returns 属性値（存在しない場合は0）
   */
  getAttributeValue(attribute: Attribute): number {
    const found = this._attributeValues.find((a) => a.attribute === attribute);
    return found?.value ?? 0;
  }

  /**
   * 特定の効果値を取得する
   * @param effectType 取得する効果タイプ
   * @returns 効果値（存在しない場合は0）
   */
  getEffectValue(effectType: ItemEffectType): number {
    const found = this._effectValues.find((e) => e.type === effectType);
    return found?.value ?? 0;
  }

  /**
   * 使用素材情報を取得する
   * 不変性を保証するため、コピーを返す
   * @returns 使用素材情報リストのコピー
   */
  getUsedMaterials(): IUsedMaterial[] {
    return this._usedMaterials.map((m) => ({ ...m }));
  }

  /**
   * レア素材を使用したかどうかを判定する
   * @returns レア素材を使用した場合true
   */
  usedRareMaterial(): boolean {
    return this._usedMaterials.some((m) => m.isRare);
  }

  /**
   * 使用したレア素材の総数をカウントする
   * @returns レア素材の使用数合計
   */
  countRareMaterials(): number {
    return this._usedMaterials
      .filter((m) => m.isRare)
      .reduce((sum, m) => sum + m.quantity, 0);
  }

  /**
   * 特定の素材を使用したかどうかを判定する
   * @param materialId 判定する素材ID
   * @returns 指定した素材を使用した場合true
   */
  usedMaterial(materialId: string): boolean {
    return this._usedMaterials.some((m) => m.materialId === materialId);
  }
}

/**
 * アイテムマスターデータを生成するファクトリ関数
 * @param data アイテムマスターデータ
 * @returns Itemインスタンス
 */
export function createItem(data: IItem): Item {
  return new Item(data);
}

/**
 * 調合済みアイテムを生成するファクトリ関数
 * @param data 調合済みアイテムデータ
 * @returns CraftedItemインスタンス
 */
export function createCraftedItem(data: ICraftedItem): CraftedItem {
  return new CraftedItem(data);
}
