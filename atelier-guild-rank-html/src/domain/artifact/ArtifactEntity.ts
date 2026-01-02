/**
 * アーティファクトエンティティ
 * TASK-0089: アーティファクトエンティティ
 *
 * アーティファクトマスターデータエンティティを実装する
 * すべてのエンティティは不変オブジェクトとして設計されている
 */

import { Rarity, EffectType } from '@domain/common/types';
import type { IArtifact } from './Artifact';
import type { ICardEffect } from '@domain/card/Card';

/**
 * レアリティの重み付けマップ
 */
const RarityWeight: Record<Rarity, number> = {
  [Rarity.COMMON]: 1,
  [Rarity.UNCOMMON]: 2,
  [Rarity.RARE]: 3,
  [Rarity.EPIC]: 4,
  [Rarity.LEGENDARY]: 5,
};

/**
 * アーティファクトエンティティ
 * パッシブ効果を持つ装備品を表す不変オブジェクト
 */
export class Artifact implements IArtifact {
  public readonly id: string;
  public readonly name: string;
  private readonly _effect: Readonly<ICardEffect>;
  public readonly rarity: Rarity;
  public readonly acquisitionType?: 'shop' | 'promotion';
  public readonly description?: string;

  // IArtifact互換のためのgetter
  get effect(): ICardEffect {
    return this.getEffect();
  }

  constructor(data: IArtifact) {
    this.id = data.id;
    this.name = data.name;
    this._effect = Object.freeze({ ...data.effect });
    this.rarity = data.rarity;
    this.acquisitionType = data.acquisitionType;
    this.description = data.description;
    Object.freeze(this);
  }

  /**
   * レアリティを取得する
   * @returns レアリティ
   */
  getRarity(): Rarity {
    return this.rarity;
  }

  /**
   * 効果を取得する
   * 不変性を保証するため、コピーを返す
   * @returns 効果のコピー
   */
  getEffect(): ICardEffect {
    return { ...this._effect };
  }

  /**
   * 特定の効果タイプを持つかどうかを判定する
   * @param effectType 判定する効果タイプ
   * @returns 指定した効果タイプを持つ場合true
   */
  hasEffectType(effectType: EffectType): boolean {
    return this._effect.type === effectType;
  }

  /**
   * 効果値を取得する
   * @returns 効果値
   */
  getEffectValue(): number {
    return this._effect.value;
  }

  /**
   * 取得方法を取得する
   * @returns 取得方法（shop | promotion | undefined）
   */
  getAcquisitionType(): 'shop' | 'promotion' | undefined {
    return this.acquisitionType;
  }

  /**
   * ショップ購入かどうかを判定する
   * @returns ショップ購入の場合true
   */
  isShopPurchase(): boolean {
    return this.acquisitionType === 'shop';
  }

  /**
   * 昇格報酬かどうかを判定する
   * @returns 昇格報酬の場合true
   */
  isPromotionReward(): boolean {
    return this.acquisitionType === 'promotion';
  }

  /**
   * 説明文を取得する
   * @returns 説明文（未設定の場合は空文字）
   */
  getDescription(): string {
    return this.description ?? '';
  }

  /**
   * レアリティの重みを取得する
   * @returns レアリティの重み（1〜5）
   */
  getRarityWeight(): number {
    return RarityWeight[this.rarity];
  }
}

/**
 * アーティファクトを生成するファクトリ関数
 * @param data アーティファクトデータ
 * @returns Artifactインスタンス
 */
export function createArtifact(data: IArtifact): Artifact {
  return new Artifact(data);
}
