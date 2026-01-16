/**
 * rank-service.ts - RankService実装
 *
 * TASK-0014: ContributionCalculator・RankService実装
 *
 * @description
 * ランクシステムを管理するアプリケーションサービス。
 * ランク昇格、昇格ゲージ、昇格試験を管理する。
 *
 * @信頼性レベル 🔵
 * - 設計文書に基づいた実装
 * - ランクゲージシステム
 * - 昇格試験システム
 */

import type { IMasterDataRepository } from '@domain/interfaces';
import type {
  IRankService,
  PromotionResult,
  PromotionTest,
  PromotionTestRequirement,
} from '@domain/interfaces/rank-service.interface';
import { ApplicationError, ErrorCodes, GuildRank } from '@shared/types';
import type { IGuildRankMaster } from '@shared/types/master-data';

// =============================================================================
// ランク順序
// =============================================================================

/**
 * 【機能概要】: ランク順序配列
 * 【実装方針】: G→F→E→D→C→B→A→Sの順
 * 🔵 信頼性レベル: 設計文書に明記
 */
const RANK_ORDER: GuildRank[] = [
  GuildRank.G,
  GuildRank.F,
  GuildRank.E,
  GuildRank.D,
  GuildRank.C,
  GuildRank.B,
  GuildRank.A,
  GuildRank.S,
];

// =============================================================================
// RankService実装
// =============================================================================

/**
 * 【機能概要】: RankServiceクラス
 * 【実装方針】: ランク管理、昇格判定、昇格試験を提供
 * 🔵 信頼性レベル: 設計文書に明記
 *
 * @example
 * ```typescript
 * const service = new RankService(masterDataRepository);
 * service.addContribution(100);
 * if (service.canPromote()) {
 *   const result = service.promote();
 * }
 * ```
 */
export class RankService implements IRankService {
  /** マスターデータリポジトリ */
  private readonly masterDataRepository: IMasterDataRepository;

  /** 現在のランク */
  private currentRank: GuildRank = GuildRank.G;

  /** 累積貢献度 */
  private accumulatedContribution = 0;

  /** 現在の昇格試験（null: 試験中でない） */
  private currentPromotionTest: PromotionTest | null = null;

  /**
   * 【機能概要】: RankServiceコンストラクタ
   * 【実装方針】: マスターデータリポジトリを注入
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @param masterDataRepository - マスターデータリポジトリ
   */
  constructor(masterDataRepository: IMasterDataRepository) {
    this.masterDataRepository = masterDataRepository;
  }

  // ===========================================================================
  // ランク操作
  // ===========================================================================

  /**
   * 【機能概要】: 現在のランクを取得
   */
  getCurrentRank(): GuildRank {
    return this.currentRank;
  }

  /**
   * 【機能概要】: 昇格ゲージを取得
   * 【実装方針】: (累積貢献度 / 必要貢献度) * 100
   */
  getPromotionGauge(): number {
    const rankMaster = this.getRankRequirements(this.currentRank);
    if (!rankMaster) return 0;

    // ゲージはパーセンテージではなく貢献度そのものを返す（設計に合わせて調整）
    // 設計書では「ゲージ100到達で昇格可能」とあるため、
    // 必要貢献度に対するパーセンテージを返す
    return Math.floor((this.accumulatedContribution / rankMaster.requiredContribution) * 100);
  }

  /**
   * 【機能概要】: 累積貢献度を取得
   */
  getAccumulatedContribution(): number {
    return this.accumulatedContribution;
  }

  /**
   * 【機能概要】: 貢献度を加算
   */
  addContribution(amount: number): void {
    this.accumulatedContribution += amount;
  }

  /**
   * 【機能概要】: ランクを設定
   */
  setRank(rank: GuildRank): void {
    this.currentRank = rank;
  }

  // ===========================================================================
  // 昇格判定
  // ===========================================================================

  /**
   * 【機能概要】: 昇格可能かどうかを判定
   */
  canPromote(): boolean {
    // 最高ランクは昇格不可
    if (this.currentRank === GuildRank.S) {
      return false;
    }

    // ゲージ100以上で昇格可能
    return this.getPromotionGauge() >= 100;
  }

  /**
   * 【機能概要】: 昇格を実行
   */
  promote(): PromotionResult {
    if (!this.canPromote()) {
      throw new ApplicationError(
        ErrorCodes.INVALID_OPERATION,
        'Cannot promote: conditions not met',
      );
    }

    const previousRank = this.currentRank;
    const newRank = this.getNextRank();

    if (!newRank) {
      throw new ApplicationError(
        ErrorCodes.INVALID_OPERATION,
        'Cannot promote: already at max rank',
      );
    }

    // ランクアップ
    this.currentRank = newRank;

    // ゲージリセット
    this.accumulatedContribution = 0;

    // 昇格試験終了
    this.currentPromotionTest = null;

    // ボーナス報酬計算（ランクに応じて増加）
    const rankIndex = RANK_ORDER.indexOf(newRank);
    const bonusReward = 100 * (rankIndex + 1);

    return {
      previousRank,
      newRank,
      bonusReward,
    };
  }

  // ===========================================================================
  // 昇格試験
  // ===========================================================================

  /**
   * 【機能概要】: 昇格試験中かどうかを判定
   */
  isInPromotionTest(): boolean {
    return this.currentPromotionTest !== null;
  }

  /**
   * 【機能概要】: 昇格試験を開始
   */
  startPromotionTest(): PromotionTest {
    if (this.isInPromotionTest()) {
      throw new ApplicationError(ErrorCodes.INVALID_OPERATION, 'Already in promotion test');
    }

    if (!this.canPromote()) {
      throw new ApplicationError(
        ErrorCodes.INVALID_OPERATION,
        'Cannot start promotion test: promotion gauge not full',
      );
    }

    const nextRank = this.getNextRank();
    if (!nextRank) {
      throw new ApplicationError(
        ErrorCodes.INVALID_OPERATION,
        'Cannot start promotion test: at max rank',
      );
    }

    const rankMaster = this.getRankRequirements(this.currentRank);
    if (!rankMaster?.promotionTest) {
      throw new ApplicationError(
        ErrorCodes.DATA_NOT_FOUND,
        'Promotion test requirements not found for current rank',
      );
    }

    const requirements: PromotionTestRequirement[] = rankMaster.promotionTest.requirements.map(
      (req) => ({
        itemId: req.itemId,
        quantity: req.quantity,
        minQuality: req.minQuality,
      }),
    );

    this.currentPromotionTest = {
      targetRank: nextRank,
      requirements,
      remainingDays: rankMaster.promotionTest.dayLimit,
      completedRequirements: [],
    };

    return { ...this.currentPromotionTest };
  }

  /**
   * 【機能概要】: 現在の昇格試験を取得
   */
  getCurrentPromotionTest(): PromotionTest | null {
    if (!this.currentPromotionTest) {
      return null;
    }
    return { ...this.currentPromotionTest };
  }

  /**
   * 【機能概要】: 昇格試験の要件を満たしたことを報告
   */
  completePromotionTestRequirement(requirementIndex: number): void {
    if (!this.currentPromotionTest) {
      throw new ApplicationError(ErrorCodes.INVALID_OPERATION, 'Not in promotion test');
    }

    if (!this.currentPromotionTest.completedRequirements.includes(requirementIndex)) {
      this.currentPromotionTest.completedRequirements.push(requirementIndex);
    }
  }

  /**
   * 【機能概要】: 昇格試験を完了
   */
  completePromotionTest(success: boolean): PromotionResult | null {
    if (!this.currentPromotionTest) {
      throw new ApplicationError(ErrorCodes.INVALID_OPERATION, 'Not in promotion test');
    }

    if (success) {
      // 試験成功: 昇格実行
      return this.promote();
    } else {
      // 試験失敗: ゲージを半分に減少
      this.accumulatedContribution = Math.floor(this.accumulatedContribution * 0.5);
      this.currentPromotionTest = null;
      return null;
    }
  }

  /**
   * 【機能概要】: 昇格試験の残り日数を減らす
   */
  decrementPromotionTestDays(): boolean {
    if (!this.currentPromotionTest) {
      return false;
    }

    this.currentPromotionTest.remainingDays--;

    if (this.currentPromotionTest.remainingDays <= 0) {
      // 期限切れ: 試験失敗
      this.completePromotionTest(false);
      return true;
    }

    return false;
  }

  // ===========================================================================
  // ランク情報取得
  // ===========================================================================

  /**
   * 【機能概要】: ランク要件を取得
   */
  getRankRequirements(rank: GuildRank): IGuildRankMaster | null {
    const rankMaster = this.masterDataRepository.getRankByValue(rank);
    return rankMaster ?? null;
  }

  /**
   * 【機能概要】: 次のランクを取得
   */
  getNextRank(): GuildRank | null {
    const currentIndex = RANK_ORDER.indexOf(this.currentRank);
    if (currentIndex === -1 || currentIndex >= RANK_ORDER.length - 1) {
      return null;
    }
    return RANK_ORDER[currentIndex + 1];
  }

  /**
   * 【機能概要】: 昇格に必要な残り貢献度を取得
   */
  getRemainingContribution(): number {
    const rankMaster = this.getRankRequirements(this.currentRank);
    if (!rankMaster) return 0;

    const remaining = rankMaster.requiredContribution - this.accumulatedContribution;
    return Math.max(0, remaining);
  }
}
