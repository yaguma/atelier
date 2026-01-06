/**
 * 昇格試験開始ユースケース
 * TASK-0113: 昇格試験開始ユースケース
 *
 * 昇格試験の開始処理を担当するユースケース
 * 試験課題設定、制限日数設定、ゲーム状態の試験モード切替を行う
 */

import { StateManager } from '@application/StateManager';
import { EventBus, GameEventType } from '@domain/events/GameEvents';
import { GuildRank, Quality } from '@domain/common/types';
import { Rank } from '@domain/rank/RankEntity';
import { startPromotionTest } from '@domain/game/GameState';

/**
 * 昇格試験開始エラー種別
 */
export type StartPromotionTestError =
  | 'INSUFFICIENT_PROMOTION_GAUGE'
  | 'ALREADY_IN_TEST'
  | 'MAX_RANK_REACHED';

/**
 * 試験要件
 */
export interface PromotionRequirementInfo {
  itemId: string;
  quantity: number;
  minQuality?: Quality;
}

/**
 * 昇格試験開始結果
 */
export interface StartPromotionTestResult {
  /** 成功したかどうか */
  success: boolean;
  /** 試験要件 */
  requirements?: PromotionRequirementInfo[];
  /** 制限日数 */
  dayLimit?: number;
  /** 目標ランク */
  toRank?: GuildRank;
  /** エラー種別 */
  error?: StartPromotionTestError;
}

/**
 * 昇格試験開始ユースケースインターフェース
 */
export interface StartPromotionTestUseCase {
  /**
   * 昇格試験を開始する
   * @returns 昇格試験開始結果
   */
  execute(): Promise<StartPromotionTestResult>;
}

/**
 * ランクデータ取得関数型
 */
export type GetRankDataFn = (rank: GuildRank) => Rank;

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
 * 昇格試験開始ユースケースを生成する
 * @param stateManager ステートマネージャー
 * @param eventBus イベントバス
 * @param getRankData ランクデータ取得関数
 * @returns 昇格試験開始ユースケース
 */
export function createStartPromotionTestUseCase(
  stateManager: StateManager,
  eventBus: EventBus,
  getRankData: GetRankDataFn
): StartPromotionTestUseCase {
  return {
    async execute(): Promise<StartPromotionTestResult> {
      const playerState = stateManager.getPlayerState();
      let gameState = stateManager.getGameState();

      // 既に試験中かチェック
      if (gameState.isInPromotionTest) {
        return {
          success: false,
          error: 'ALREADY_IN_TEST',
        };
      }

      // ランクデータを取得
      const currentRank = getRankData(playerState.rank);
      const promotionTest = currentRank.getPromotionTest();

      // 最高ランクチェック
      if (!promotionTest) {
        return {
          success: false,
          error: 'MAX_RANK_REACHED',
        };
      }

      // 昇格ゲージチェック
      if (playerState.promotionGauge < playerState.promotionGaugeMax) {
        return {
          success: false,
          error: 'INSUFFICIENT_PROMOTION_GAUGE',
        };
      }

      // 次ランクを取得
      const toRank = NextRank[playerState.rank];
      if (!toRank) {
        return {
          success: false,
          error: 'MAX_RANK_REACHED',
        };
      }

      // ゲーム状態を試験モードに更新
      gameState = startPromotionTest(gameState, promotionTest.getDayLimit());
      stateManager.updateGameState(gameState);

      // 昇格ゲージをリセット
      stateManager.updatePlayerState({
        ...playerState,
        promotionGauge: 0,
      });

      // 試験要件を整形
      const requirements: PromotionRequirementInfo[] = promotionTest
        .getRequirements()
        .map((req) => ({
          itemId: req.itemId,
          quantity: req.quantity,
          minQuality: req.minQuality,
        }));

      // イベントを発行
      eventBus.publish({
        type: GameEventType.RANK_UP_TEST_STARTED,
        payload: {
          fromRank: playerState.rank,
          toRank,
        },
      });

      return {
        success: true,
        requirements,
        dayLimit: promotionTest.getDayLimit(),
        toRank,
      };
    },
  };
}
