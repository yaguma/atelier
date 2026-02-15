/**
 * Quest.ts - 依頼エンティティ
 *
 * TASK-0013: 依頼エンティティ・QuestService実装
 *
 * @description
 * 依頼の実体を表すエンティティ。
 * 依頼者、達成条件、報酬、期限を保持する。
 *
 * @信頼性レベル 🔵
 * - 設計文書に基づいた実装
 * - 不変オブジェクトとして設計
 */

import type { ItemInstance } from '@domain/entities/ItemInstance';
import { compareQuality } from '@domain/value-objects/Quality';
import type { ClientId, Quality, QuestId, QuestType } from '@shared/types';
import type { IClient, IQuest, IQuestCondition, QuestDifficulty } from '@shared/types/quests';

/**
 * 【機能概要】: 品質から数値への変換マップ
 * 【実装方針】: 品質比較のために数値に変換
 * 🔵 信頼性レベル: 設計文書に明記
 */
export const QUALITY_ORDER: Record<Quality, number> = {
  D: 1,
  C: 2,
  B: 3,
  A: 4,
  S: 5,
};

/**
 * 【機能概要】: 依頼タイプごとの貢献度補正
 * 【実装方針】: 設計文書に基づく補正値
 * 🔵 信頼性レベル: 設計文書に明記
 */
export const QUEST_TYPE_MULTIPLIER: Record<QuestType, number> = {
  SPECIFIC: 1.0,
  CATEGORY: 0.8,
  QUALITY: 1.2,
  QUANTITY: 0.7,
  ATTRIBUTE: 1.3,
  EFFECT: 1.3,
  MATERIAL: 1.5,
  COMPOUND: 1.8,
};

/**
 * 【機能概要】: 依頼エンティティクラス
 * 【実装方針】: 依頼ID、依頼者、条件、報酬、期限を保持し、納品可能判定を提供
 * 【不変性】: 全プロパティがreadonlyで変更不可
 * 🔵 信頼性レベル: 設計文書に明記
 */
export class Quest {
  /**
   * 【機能概要】: Questエンティティのコンストラクタ
   * 【実装方針】: 依頼データを保持
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @param data - 依頼データ
   * @param client - 依頼者データ
   */
  constructor(
    /** 依頼データ */
    public readonly data: IQuest,
    /** 依頼者データ */
    public readonly client: IClient,
  ) {
    // 【実装内容】: readonly プロパティとして保持するため、処理なし
    // 🔵 信頼性レベル: 設計文書に明記
  }

  /**
   * 【機能概要】: 依頼IDを取得
   * 【実装方針】: data.idをそのまま返す
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @returns 依頼ID
   */
  get id(): QuestId {
    return this.data.id;
  }

  /**
   * 【機能概要】: 依頼者IDを取得
   * 【実装方針】: data.clientIdをそのまま返す
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @returns 依頼者ID
   */
  get clientId(): ClientId {
    return this.data.clientId;
  }

  /**
   * 【機能概要】: 達成条件を取得
   * 【実装方針】: data.conditionをそのまま返す
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @returns 達成条件
   */
  get condition(): IQuestCondition {
    return this.data.condition;
  }

  /**
   * 【機能概要】: 基本貢献度報酬を取得
   * 【実装方針】: data.contributionをそのまま返す
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @returns 基本貢献度報酬
   */
  get baseContribution(): number {
    return this.data.contribution;
  }

  /**
   * 【機能概要】: 基本ゴールド報酬を取得
   * 【実装方針】: data.goldをそのまま返す
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @returns 基本ゴールド報酬
   */
  get baseGold(): number {
    return this.data.gold;
  }

  /**
   * 【機能概要】: 期限（日数）を取得
   * 【実装方針】: data.deadlineをそのまま返す
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @returns 期限（日数）
   */
  get deadline(): number {
    return this.data.deadline;
  }

  /**
   * 【機能概要】: 難易度を取得
   * 【実装方針】: data.difficultyをそのまま返す
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @returns 難易度
   */
  get difficulty(): QuestDifficulty {
    return this.data.difficulty;
  }

  /**
   * 【機能概要】: フレーバーテキストを取得
   * 【実装方針】: data.flavorTextをそのまま返す
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @returns フレーバーテキスト
   */
  get flavorText(): string {
    return this.data.flavorText;
  }

  /**
   * 【機能概要】: 依頼タイプ補正を取得
   * 【実装方針】: 依頼タイプに応じた補正値を返す
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @returns 依頼タイプ補正値
   */
  get typeMultiplier(): number {
    return QUEST_TYPE_MULTIPLIER[this.condition.type];
  }

  /**
   * 【機能概要】: 依頼者補正（貢献度）を取得
   * 【実装方針】: 依頼者の貢献度倍率を返す
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @returns 依頼者貢献度補正値
   */
  get clientContributionMultiplier(): number {
    return this.client.contributionMultiplier;
  }

  /**
   * 【機能概要】: 依頼者補正（ゴールド）を取得
   * 【実装方針】: 依頼者のゴールド倍率を返す
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @returns 依頼者ゴールド補正値
   */
  get clientGoldMultiplier(): number {
    return this.client.goldMultiplier;
  }

  /**
   * 【機能概要】: 納品可能かどうかを判定
   * 【実装方針】: アイテムが達成条件を満たすか判定
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @param item - 納品するアイテム
   * @returns 納品可能な場合true
   */
  canDeliver(item: ItemInstance): boolean {
    return this.checkCondition(this.condition, item);
  }

  /**
   * 【機能概要】: 条件を判定
   * 【実装方針】: 依頼タイプに応じた条件判定を実行
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @param condition - 依頼条件
   * @param item - 判定するアイテム
   * @returns 条件を満たす場合true
   */
  checkCondition(condition: IQuestCondition, item: ItemInstance): boolean {
    switch (condition.type) {
      case 'SPECIFIC':
        // 【具体的指定】: アイテムIDが完全一致
        return item.itemId === condition.itemId;

      case 'CATEGORY':
        // 【カテゴリ】: カテゴリが一致
        return item.master.category === condition.category;

      case 'QUALITY':
        // 【品質条件】: 品質が条件以上
        if (!condition.minQuality) return true;
        return compareQuality(item.quality, condition.minQuality) >= 0;

      case 'QUANTITY':
        // 【数量重視】: この判定は単品では常にtrue（複数アイテムの合計は呼び出し元で判定）
        return true;

      case 'ATTRIBUTE':
        // 【属性条件】: 使用素材に属性が存在するか（具体的な属性値判定は将来実装）
        return item.usedMaterials.some(
          (mat) => mat.master.attributes && mat.master.attributes.length > 0,
        );

      case 'EFFECT':
        // 【効果ベース】: 効果が存在するか（具体的な効果値判定は将来実装）
        return item.master.effects !== undefined;

      case 'MATERIAL':
        // 【素材消費】: レア素材使用数を判定（将来実装）
        return true;

      case 'COMPOUND':
        // 【複合条件】: すべての子条件を満たすか
        if (!condition.subConditions) return false;
        return condition.subConditions.every((sub) => this.checkCondition(sub, item));

      default:
        return false;
    }
  }

  /**
   * 【機能概要】: 納品時の貢献度を計算
   * 【実装方針】: 基本貢献度 × 品質補正 × 依頼タイプ補正 × 依頼者補正
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @param item - 納品するアイテム
   * @returns 計算された貢献度
   */
  calculateContribution(item: ItemInstance): number {
    const qualityMultiplier = this.getQualityMultiplier(item.quality);
    const contribution =
      this.baseContribution *
      qualityMultiplier *
      this.typeMultiplier *
      this.clientContributionMultiplier;
    return Math.floor(contribution);
  }

  /**
   * 【機能概要】: 納品時のゴールドを計算
   * 【実装方針】: 基本ゴールド × 品質補正 × 依頼者補正
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @param item - 納品するアイテム
   * @returns 計算されたゴールド
   */
  calculateGold(item: ItemInstance): number {
    const qualityMultiplier = this.getQualityMultiplier(item.quality);
    const gold = this.baseGold * qualityMultiplier * this.clientGoldMultiplier;
    return Math.floor(gold);
  }

  /**
   * 【機能概要】: 品質補正値を取得
   * 【実装方針】: 品質に応じた補正値を返す
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @param quality - 品質
   * @returns 品質補正値
   */
  private getQualityMultiplier(quality: Quality): number {
    const multipliers: Record<Quality, number> = {
      D: 0.5,
      C: 1.0,
      B: 1.5,
      A: 2.0,
      S: 3.0,
    };
    return multipliers[quality];
  }
}
