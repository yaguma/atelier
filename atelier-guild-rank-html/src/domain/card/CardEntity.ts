/**
 * カードエンティティ
 * TASK-0084: カードエンティティ
 *
 * 3種類のカードエンティティ（GatheringCard、RecipeCard、EnhancementCard）を実装する
 * すべてのエンティティは不変オブジェクトとして設計されている
 */

import {
  CardType,
  EnhancementTarget,
  EffectType,
  GuildRank,
  ItemCategory,
  Rarity,
} from '@domain/common/types';
import type {
  ICard,
  ICardEffect,
  IGatheringCard,
  IGatheringMaterial,
  IRecipeCard,
  IRequiredMaterial,
  IEnhancementCard,
} from './Card';

/**
 * 採取地カードエンティティ
 * 採取フェーズで使用し、素材を獲得するためのカード
 */
export class GatheringCard implements IGatheringCard {
  public readonly id: string;
  public readonly name: string;
  public readonly type: CardType.GATHERING = CardType.GATHERING;
  public readonly rarity: Rarity;
  public readonly unlockRank: GuildRank;
  public readonly description?: string;
  public readonly cost: number;
  private readonly _materials: readonly IGatheringMaterial[];

  // IGatheringCard互換のためのgetter
  get materials(): IGatheringMaterial[] {
    return this.getMaterials();
  }

  constructor(data: IGatheringCard) {
    this.id = data.id;
    this.name = data.name;
    this.rarity = data.rarity;
    this.unlockRank = data.unlockRank;
    this.description = data.description;
    this.cost = data.cost;
    // 不変性を保証するため、深いコピーを作成
    this._materials = Object.freeze(
      data.materials.map((m) => Object.freeze({ ...m }))
    );
    Object.freeze(this);
  }

  /**
   * 行動コストを取得する
   * @returns 行動コスト（0〜3）
   */
  getCost(): number {
    return this.cost;
  }

  /**
   * 獲得可能な素材リストを取得する
   * 不変性を保証するため、コピーを返す
   * @returns 素材リストのコピー
   */
  getMaterials(): IGatheringMaterial[] {
    return this._materials.map((m) => ({ ...m }));
  }

  /**
   * 確率に基づいて獲得する素材を決定する
   * 各素材の確率に基づいて、獲得するかどうかを判定する
   * @returns 獲得した素材のリスト
   */
  determineMaterials(): IGatheringMaterial[] {
    const obtained: IGatheringMaterial[] = [];

    for (const material of this._materials) {
      const roll = Math.random();
      if (roll < material.probability) {
        obtained.push({ ...material });
      }
    }

    return obtained;
  }
}

/**
 * レシピカードエンティティ
 * 調合フェーズで使用し、素材からアイテムを作成するためのカード
 */
export class RecipeCard implements IRecipeCard {
  public readonly id: string;
  public readonly name: string;
  public readonly type: CardType.RECIPE = CardType.RECIPE;
  public readonly rarity: Rarity;
  public readonly unlockRank: GuildRank;
  public readonly description?: string;
  public readonly cost: number;
  private readonly _requiredMaterials: readonly IRequiredMaterial[];
  public readonly outputItemId: string;
  public readonly category: ItemCategory;

  // IRecipeCard互換のためのgetter
  get requiredMaterials(): IRequiredMaterial[] {
    return this.getRequiredMaterials();
  }

  constructor(data: IRecipeCard) {
    this.id = data.id;
    this.name = data.name;
    this.rarity = data.rarity;
    this.unlockRank = data.unlockRank;
    this.description = data.description;
    this.cost = data.cost;
    // 不変性を保証するため、深いコピーを作成
    this._requiredMaterials = Object.freeze(
      data.requiredMaterials.map((m) => Object.freeze({ ...m }))
    );
    this.outputItemId = data.outputItemId;
    this.category = data.category;
    Object.freeze(this);
  }

  /**
   * 行動コストを取得する
   * @returns 行動コスト（1〜3）
   */
  getCost(): number {
    return this.cost;
  }

  /**
   * 必要素材リストを取得する
   * 不変性を保証するため、コピーを返す
   * @returns 必要素材リストのコピー
   */
  getRequiredMaterials(): IRequiredMaterial[] {
    return this._requiredMaterials.map((m) => ({ ...m }));
  }

  /**
   * 完成アイテムIDを取得する
   * @returns 出力アイテムID
   */
  getOutputItemId(): string {
    return this.outputItemId;
  }

  /**
   * アイテムカテゴリを取得する
   * @returns アイテムカテゴリ
   */
  getCategory(): ItemCategory {
    return this.category;
  }
}

/**
 * 強化カードエンティティ
 * 採取・調合・納品時に使用し、効果を付与するカード
 */
export class EnhancementCard implements IEnhancementCard {
  public readonly id: string;
  public readonly name: string;
  public readonly type: CardType.ENHANCEMENT = CardType.ENHANCEMENT;
  public readonly rarity: Rarity;
  public readonly unlockRank: GuildRank;
  public readonly description?: string;
  public readonly cost: 0 = 0;
  private readonly _effect: Readonly<ICardEffect>;
  public readonly targetAction: EnhancementTarget;

  // IEnhancementCard互換のためのgetter
  get effect(): ICardEffect {
    return this.getEffect();
  }

  constructor(data: IEnhancementCard) {
    this.id = data.id;
    this.name = data.name;
    this.rarity = data.rarity;
    this.unlockRank = data.unlockRank;
    this.description = data.description;
    // 不変性を保証するため、深いコピーを作成
    this._effect = Object.freeze({ ...data.effect });
    this.targetAction = data.targetAction;
    Object.freeze(this);
  }

  /**
   * 行動コストを取得する
   * 強化カードのコストは常に0
   * @returns 0
   */
  getCost(): 0 {
    return 0;
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
   * 効果タイプを取得する
   * @returns 効果タイプ
   */
  getEffectType(): EffectType {
    return this._effect.type;
  }

  /**
   * 効果値を取得する
   * @returns 効果値
   */
  getEffectValue(): number {
    return this._effect.value;
  }

  /**
   * 対象行動を取得する
   * @returns 対象行動
   */
  getTargetAction(): EnhancementTarget {
    return this.targetAction;
  }

  /**
   * 効果を適用する
   * 基本値に効果値を加算する
   * @param baseValue 基本値
   * @returns 効果適用後の値
   */
  applyEffect(baseValue: number): number {
    return baseValue + this._effect.value;
  }

  /**
   * 指定した行動に効果を適用可能かどうかを判定する
   * ALLの場合はすべての行動に適用可能
   * @param action 対象行動
   * @returns 適用可能な場合true
   */
  canApplyTo(action: EnhancementTarget): boolean {
    if (this.targetAction === EnhancementTarget.ALL) {
      return true;
    }
    return this.targetAction === action;
  }
}

/**
 * 採取地カードを生成するファクトリ関数
 * @param data 採取地カードデータ
 * @returns GatheringCardインスタンス
 */
export function createGatheringCard(data: IGatheringCard): GatheringCard {
  return new GatheringCard(data);
}

/**
 * レシピカードを生成するファクトリ関数
 * @param data レシピカードデータ
 * @returns RecipeCardインスタンス
 */
export function createRecipeCard(data: IRecipeCard): RecipeCard {
  return new RecipeCard(data);
}

/**
 * 強化カードを生成するファクトリ関数
 * @param data 強化カードデータ
 * @returns EnhancementCardインスタンス
 */
export function createEnhancementCard(data: IEnhancementCard): EnhancementCard {
  return new EnhancementCard(data);
}
