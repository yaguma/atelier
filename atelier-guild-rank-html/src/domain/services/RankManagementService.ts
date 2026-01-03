/**
 * ランク管理ドメインサービス
 * TASK-0096: ランク管理ドメインサービス
 *
 * ランクの貢献度管理、昇格試験発生、ゲームオーバー・ゲームクリア条件を管理する
 */

import { GuildRank } from '@domain/common/types';
import type { IGuildRank, IPromotionTest } from '@domain/rank/Rank';

/**
 * 操作結果型
 */
export type Result<T> =
  | { success: true; value: T }
  | { success: false; error: string };

/**
 * ランク状態
 */
export interface RankState {
  /** 現在のランク */
  currentRank: GuildRank;
  /** 現在の昇格ゲージ */
  promotionGauge: number;
  /** 昇格ゲージ最大値 */
  maxPromotionGauge: number;
  /** 残り日数 */
  remainingDays: number;
  /** 昇格試験中かどうか */
  isInPromotionTest: boolean;
  /** 昇格試験の残り日数（試験中でなければnull） */
  promotionTestDaysRemaining: number | null;
}

/**
 * 依頼データ型（フィルタリング用）
 */
export interface QuestWithRank {
  id: string;
  requiredRank: GuildRank;
}

/**
 * ランク順序マップ
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
 * ランク状態を生成する
 * @param currentRank 現在のランク
 * @param maxPromotionGauge 昇格ゲージ最大値
 * @param remainingDays 残り日数
 * @returns ランク状態
 */
export function createRankState(
  currentRank: GuildRank,
  maxPromotionGauge: number,
  remainingDays: number
): RankState {
  return {
    currentRank,
    promotionGauge: 0,
    maxPromotionGauge,
    remainingDays,
    isInPromotionTest: false,
    promotionTestDaysRemaining: null,
  };
}

/**
 * ランク管理ドメインサービス
 */
export class RankManagementService {
  private rankDataMap: Map<GuildRank, IGuildRank>;

  /**
   * コンストラクタ
   * @param rankDataMap ランクマスターデータのマップ
   */
  constructor(rankDataMap: Map<GuildRank, IGuildRank>) {
    this.rankDataMap = rankDataMap;
  }

  /**
   * 貢献度を加算する
   * @param state 現在のランク状態
   * @param contribution 加算する貢献度
   * @returns 新しいランク状態
   */
  addContribution(state: RankState, contribution: number): RankState {
    // 負の貢献度は無視
    if (contribution < 0) {
      return state;
    }

    const newGauge = Math.min(
      state.promotionGauge + contribution,
      state.maxPromotionGauge
    );

    return {
      ...state,
      promotionGauge: newGauge,
    };
  }

  /**
   * 昇格試験が発生するかどうかを判定する
   * @param state 現在のランク状態
   * @returns 昇格試験が発生する場合true
   */
  isPromotionReady(state: RankState): boolean {
    // Sランクでは昇格試験は発生しない
    if (state.currentRank === GuildRank.S) {
      return false;
    }

    // 昇格ゲージが満タンかどうか
    return state.promotionGauge >= state.maxPromotionGauge;
  }

  /**
   * 日数を減らす
   * @param state 現在のランク状態
   * @returns 新しいランク状態
   */
  decrementDay(state: RankState): RankState {
    const newRemainingDays = Math.max(0, state.remainingDays - 1);

    // 昇格試験中の場合は試験日数も減らす
    let newPromotionTestDays = state.promotionTestDaysRemaining;
    if (state.isInPromotionTest && newPromotionTestDays !== null) {
      newPromotionTestDays = Math.max(0, newPromotionTestDays - 1);
    }

    return {
      ...state,
      remainingDays: newRemainingDays,
      promotionTestDaysRemaining: newPromotionTestDays,
    };
  }

  /**
   * ゲームオーバーかどうかを判定する
   * @param state 現在のランク状態
   * @returns ゲームオーバーの場合true
   */
  isGameOver(state: RankState): boolean {
    return state.remainingDays <= 0;
  }

  /**
   * ゲームクリアかどうかを判定する
   * @param state 現在のランク状態
   * @returns ゲームクリアの場合true
   */
  isGameClear(state: RankState): boolean {
    return state.currentRank === GuildRank.S;
  }

  /**
   * 現在ランクで受注可能な依頼を取得する
   * @param state 現在のランク状態
   * @param allQuests すべての依頼
   * @returns 受注可能な依頼
   */
  getAvailableQuests<T extends QuestWithRank>(
    state: RankState,
    allQuests: T[]
  ): T[] {
    const currentRankOrder = RankOrder[state.currentRank];

    return allQuests.filter((quest) => {
      const requiredRankOrder = RankOrder[quest.requiredRank];
      // 現在のランク以下の依頼のみ受注可能
      return requiredRankOrder <= currentRankOrder;
    });
  }

  /**
   * 昇格試験を開始する
   * @param state 現在のランク状態
   * @returns 操作結果
   */
  startPromotionTest(state: RankState): Result<RankState> {
    // 昇格ゲージが満タンでなければ開始できない
    if (!this.isPromotionReady(state)) {
      return { success: false, error: '昇格ゲージが満タンではありません' };
    }

    // Sランクでは昇格試験は開始できない
    if (state.currentRank === GuildRank.S) {
      return { success: false, error: 'Sランクでは昇格試験はありません' };
    }

    // ランクデータを取得
    const rankData = this.rankDataMap.get(state.currentRank);
    if (!rankData || !rankData.promotionTest) {
      return { success: false, error: 'ランクデータが見つかりません' };
    }

    return {
      success: true,
      value: {
        ...state,
        isInPromotionTest: true,
        promotionTestDaysRemaining: rankData.promotionTest.dayLimit,
      },
    };
  }

  /**
   * ランクを昇格させる
   * @param state 現在のランク状態
   * @returns 操作結果
   */
  promoteRank(state: RankState): Result<RankState> {
    // 昇格試験中でなければ昇格できない
    if (!state.isInPromotionTest) {
      return { success: false, error: '昇格試験中ではありません' };
    }

    // 次のランクを取得
    const nextRank = NextRank[state.currentRank];
    if (!nextRank) {
      return { success: false, error: 'これ以上昇格できません' };
    }

    // 次のランクのデータを取得
    const nextRankData = this.rankDataMap.get(nextRank);
    if (!nextRankData) {
      return { success: false, error: '次のランクデータが見つかりません' };
    }

    return {
      success: true,
      value: {
        currentRank: nextRank,
        promotionGauge: 0,
        maxPromotionGauge: nextRankData.maxPromotionGauge,
        remainingDays: nextRankData.dayLimit,
        isInPromotionTest: false,
        promotionTestDaysRemaining: null,
      },
    };
  }

  /**
   * 昇格試験の課題を取得する
   * @param state 現在のランク状態
   * @returns 昇格試験（ない場合はnull）
   */
  getPromotionTestRequirements(state: RankState): IPromotionTest | null {
    const rankData = this.rankDataMap.get(state.currentRank);
    if (!rankData) {
      return null;
    }

    return rankData.promotionTest;
  }

  /**
   * 現在のランクデータを取得する
   * @param state 現在のランク状態
   * @returns ランクデータ
   */
  getCurrentRankData(state: RankState): IGuildRank | undefined {
    return this.rankDataMap.get(state.currentRank);
  }

  /**
   * 昇格試験に失敗したかどうかを判定する
   * @param state 現在のランク状態
   * @returns 失敗した場合true
   */
  isPromotionTestFailed(state: RankState): boolean {
    if (!state.isInPromotionTest) {
      return false;
    }

    return state.promotionTestDaysRemaining !== null && state.promotionTestDaysRemaining <= 0;
  }
}
