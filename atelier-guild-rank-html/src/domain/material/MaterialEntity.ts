/**
 * 素材エンティティ
 * TASK-0085: 素材エンティティ
 *
 * 素材マスターデータエンティティと素材インスタンスエンティティを実装する
 * すべてのエンティティは不変オブジェクトとして設計されている
 */

import { Attribute, Quality } from '@domain/common/types';
import type { IMaterial, IMaterialInstance } from './Material';

/**
 * 素材マスターデータエンティティ
 * 素材の基本情報を保持する不変オブジェクト
 */
export class Material implements IMaterial {
  public readonly id: string;
  public readonly name: string;
  public readonly baseQuality: Quality;
  private readonly _attributes: readonly Attribute[];
  public readonly isRare?: boolean;
  public readonly description?: string;

  // IMaterial互換のためのgetter
  get attributes(): Attribute[] {
    return this.getAttributes();
  }

  constructor(data: IMaterial) {
    this.id = data.id;
    this.name = data.name;
    this.baseQuality = data.baseQuality;
    // 不変性を保証するため、深いコピーを作成
    this._attributes = Object.freeze([...data.attributes]);
    this.isRare = data.isRare;
    this.description = data.description;
    Object.freeze(this);
  }

  /**
   * 基本品質を取得する
   * @returns 基本品質（D〜S）
   */
  getBaseQuality(): Quality {
    return this.baseQuality;
  }

  /**
   * 属性リストを取得する
   * 不変性を保証するため、コピーを返す
   * @returns 属性リストのコピー
   */
  getAttributes(): Attribute[] {
    return [...this._attributes];
  }

  /**
   * レア素材かどうかを判定する
   * @returns レア素材の場合true
   */
  isRareMaterial(): boolean {
    return this.isRare === true;
  }

  /**
   * 指定した属性を持つかどうかを判定する
   * @param attribute 判定する属性
   * @returns 指定した属性を持つ場合true
   */
  hasAttribute(attribute: Attribute): boolean {
    return this._attributes.includes(attribute);
  }
}

/**
 * 素材インスタンスエンティティ
 * インベントリ内の実際の素材を表す不変オブジェクト
 */
export class MaterialInstance implements IMaterialInstance {
  public readonly materialId: string;
  public readonly quality: Quality;
  public readonly quantity: number;

  constructor(data: IMaterialInstance) {
    this.materialId = data.materialId;
    this.quality = data.quality;
    this.quantity = data.quantity;
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
   * 数量を取得する
   * @returns 数量
   */
  getQuantity(): number {
    return this.quantity;
  }

  /**
   * 同一素材かどうかを判定する（素材IDと品質が同じ）
   * @param other 比較対象の素材インスタンス
   * @returns 同一素材の場合true
   */
  isSameMaterial(other: IMaterialInstance): boolean {
    return this.materialId === other.materialId && this.quality === other.quality;
  }

  /**
   * 同一素材IDかどうかを判定する（品質は無視）
   * @param other 比較対象の素材インスタンス
   * @returns 同一素材IDの場合true
   */
  isSameMaterialId(other: IMaterialInstance): boolean {
    return this.materialId === other.materialId;
  }

  /**
   * 数量を追加した新しいインスタンスを作成する
   * @param amount 追加する数量
   * @returns 新しいMaterialInstance
   */
  addQuantity(amount: number): MaterialInstance {
    return new MaterialInstance({
      materialId: this.materialId,
      quality: this.quality,
      quantity: this.quantity + amount,
    });
  }

  /**
   * 数量を減らした新しいインスタンスを作成する
   * @param amount 減らす数量
   * @returns 新しいMaterialInstance
   */
  subtractQuantity(amount: number): MaterialInstance {
    return new MaterialInstance({
      materialId: this.materialId,
      quality: this.quality,
      quantity: this.quantity - amount,
    });
  }
}

/**
 * 素材マスターデータを生成するファクトリ関数
 * @param data 素材マスターデータ
 * @returns Materialインスタンス
 */
export function createMaterial(data: IMaterial): Material {
  return new Material(data);
}

/**
 * 素材インスタンスを生成するファクトリ関数
 * @param data 素材インスタンスデータ
 * @returns MaterialInstanceインスタンス
 */
export function createMaterialInstance(data: IMaterialInstance): MaterialInstance {
  return new MaterialInstance(data);
}
