/**
 * ランクエンティティ
 * TASK-0088: ランクエンティティ
 *
 * ギルドランク、昇格試験、特殊ルールエンティティを実装する
 * すべてのエンティティは不変オブジェクトとして設計されている
 */

import { GuildRank, Quality, SpecialRuleType } from '@domain/common/types';
import type { IGuildRank, IPromotionTest, IPromotionRequirement, ISpecialRule } from './Rank';

/**
 * ランク順序マップ
 * G→F→E→D→C→B→A→Sの順序
 */
const RankOrder: Record<GuildRank, number> = {
  [GuildRank.G]: 0,
  [GuildRank.F]: 1,
  [GuildRank.E]: 2,
  [GuildRank.D]: 3,
  [GuildRank.C]: 4,
  [GuildRank.B]: 5,
  [GuildRank.A]: 6,
  [GuildRank.S]: 7,
};

/**
 * 次ランクマップ
 */
const NextRank: Record<GuildRank, GuildRank | null> = {
  [GuildRank.G]: GuildRank.F,
  [GuildRank.F]: GuildRank.E,
  [GuildRank.E]: GuildRank.D,
  [GuildRank.D]: GuildRank.C,
  [GuildRank.C]: GuildRank.B,
  [GuildRank.B]: GuildRank.A,
  [GuildRank.A]: GuildRank.S,
  [GuildRank.S]: null,
};

/**
 * 昇格試験要件エンティティ
 */
export class PromotionRequirement implements IPromotionRequirement {
  public readonly itemId: string;
  public readonly quantity: number;
  public readonly minQuality?: Quality;

  constructor(data: IPromotionRequirement) {
    this.itemId = data.itemId;
    this.quantity = data.quantity;
    this.minQuality = data.minQuality;
    Object.freeze(this);
  }

  /**
   * 品質要件があるかどうかを判定する
   * @returns 品質要件がある場合true
   */
  hasQualityRequirement(): boolean {
    return this.minQuality !== undefined;
  }
}

/**
 * 特殊ルールエンティティ
 */
export class SpecialRule implements ISpecialRule {
  public readonly type: SpecialRuleType;
  public readonly value?: number;
  public readonly condition?: Quality;
  public readonly description: string;

  constructor(data: ISpecialRule) {
    this.type = data.type;
    this.value = data.value;
    this.condition = data.condition;
    this.description = data.description;
    Object.freeze(this);
  }

  /**
   * ルールの値を取得する
   * @returns ルールの値（未設定の場合は0）
   */
  getValue(): number {
    return this.value ?? 0;
  }

  /**
   * ルールの条件（品質）を取得する
   * @returns 条件の品質（未設定の場合はundefined）
   */
  getCondition(): Quality | undefined {
    return this.condition;
  }
}

/**
 * 昇格試験エンティティ
 */
export class PromotionTest implements IPromotionTest {
  private readonly _requirements: readonly PromotionRequirement[];
  public readonly dayLimit: number;

  // IPromotionTest互換のためのgetter
  get requirements(): IPromotionRequirement[] {
    return this.getRequirements();
  }

  constructor(data: IPromotionTest) {
    this._requirements = Object.freeze(
      data.requirements.map((r) => new PromotionRequirement(r))
    );
    this.dayLimit = data.dayLimit;
    Object.freeze(this);
  }

  /**
   * 試験要件を取得する
   * 不変性を保証するため、コピーを返す
   * @returns 試験要件のコピー
   */
  getRequirements(): PromotionRequirement[] {
    return this._requirements.map((r) => new PromotionRequirement({
      itemId: r.itemId,
      quantity: r.quantity,
      minQuality: r.minQuality,
    }));
  }

  /**
   * 制限日数を取得する
   * @returns 制限日数
   */
  getDayLimit(): number {
    return this.dayLimit;
  }
}

/**
 * ギルドランクエンティティ
 * ランクの情報と昇格関連のロジックを保持する不変オブジェクト
 */
export class Rank implements IGuildRank {
  public readonly id: GuildRank;
  public readonly name: string;
  public readonly maxPromotionGauge: number;
  public readonly dayLimit: number;
  private readonly _specialRules: readonly SpecialRule[];
  private readonly _promotionTest: PromotionTest | null;
  private readonly _unlockedGatheringCards: readonly string[];
  private readonly _unlockedRecipeCards: readonly string[];

  // IGuildRank互換のためのgetter
  get specialRules(): ISpecialRule[] {
    return this.getSpecialRules();
  }

  get promotionTest(): IPromotionTest | null {
    return this.getPromotionTest();
  }

  get unlockedGatheringCards(): string[] {
    return this.getUnlockedGatheringCards();
  }

  get unlockedRecipeCards(): string[] {
    return this.getUnlockedRecipeCards();
  }

  constructor(data: IGuildRank) {
    this.id = data.id;
    this.name = data.name;
    this.maxPromotionGauge = data.maxPromotionGauge;
    this.dayLimit = data.dayLimit;
    this._specialRules = Object.freeze(
      data.specialRules.map((r) => new SpecialRule(r))
    );
    this._promotionTest = data.promotionTest
      ? new PromotionTest(data.promotionTest)
      : null;
    this._unlockedGatheringCards = Object.freeze([...data.unlockedGatheringCards]);
    this._unlockedRecipeCards = Object.freeze([...data.unlockedRecipeCards]);
    Object.freeze(this);
  }

  /**
   * ランクを比較する
   * @param other 比較対象のランク
   * @returns 自分が大きい場合正、小さい場合負、等しい場合0
   */
  compareTo(other: Rank): number {
    return RankOrder[this.id] - RankOrder[other.id];
  }

  /**
   * 昇格ゲージ最大値を取得する
   * @returns 昇格ゲージ最大値
   */
  getMaxPromotionGauge(): number {
    return this.maxPromotionGauge;
  }

  /**
   * 次ランクを取得する
   * @returns 次ランク（最高ランクの場合はnull）
   */
  getNextRank(): GuildRank | null {
    return NextRank[this.id];
  }

  /**
   * 昇格試験を取得する
   * @returns 昇格試験（最高ランクの場合はnull）
   */
  getPromotionTest(): PromotionTest | null {
    return this._promotionTest;
  }

  /**
   * 制限日数を取得する
   * @returns 制限日数
   */
  getDayLimit(): number {
    return this.dayLimit;
  }

  /**
   * 特殊ルールを取得する
   * 不変性を保証するため、コピーを返す
   * @returns 特殊ルールのコピー
   */
  getSpecialRules(): SpecialRule[] {
    return this._specialRules.map((r) => new SpecialRule({
      type: r.type,
      value: r.value,
      condition: r.condition,
      description: r.description,
    }));
  }

  /**
   * 解放される採取地カードを取得する
   * 不変性を保証するため、コピーを返す
   * @returns 採取地カードIDのコピー
   */
  getUnlockedGatheringCards(): string[] {
    return [...this._unlockedGatheringCards];
  }

  /**
   * 解放されるレシピカードを取得する
   * 不変性を保証するため、コピーを返す
   * @returns レシピカードIDのコピー
   */
  getUnlockedRecipeCards(): string[] {
    return [...this._unlockedRecipeCards];
  }

  /**
   * 最高ランクかどうかを判定する
   * @returns 最高ランクの場合true
   */
  isMaxRank(): boolean {
    return this.id === GuildRank.S;
  }
}

/**
 * ギルドランクを生成するファクトリ関数
 * @param data ギルドランクデータ
 * @returns Rankインスタンス
 */
export function createRank(data: IGuildRank): Rank {
  return new Rank(data);
}

/**
 * 昇格試験を生成するファクトリ関数
 * @param data 昇格試験データ
 * @returns PromotionTestインスタンス
 */
export function createPromotionTest(data: IPromotionTest): PromotionTest {
  return new PromotionTest(data);
}
