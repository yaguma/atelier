/**
 * ゲームオーバー判定ユースケース
 * TASK-0116: ゲームオーバー判定ユースケース
 *
 * ゲームオーバー判定処理を担当するユースケース
 * ランク維持日数0または昇格試験失敗でゲームオーバー、統計記録、イベント発行を行う
 */

import { StateManager } from '@application/StateManager';
import { EventBus, GameEventType } from '@domain/events/GameEvents';
import { GuildRank } from '@domain/common/types';
import { setGameProgress, GameProgress } from '@domain/game/GameState';

/**
 * ゲームオーバー理由
 */
export type GameOverReason = 'RANK_DAYS_EXPIRED' | 'PROMOTION_TEST_FAILED';

/**
 * プレイ統計
 */
export interface PlayStats {
  /** 総プレイ日数 */
  totalDays: number;
  /** 最終ゴールド */
  finalGold: number;
  /** 最終ランク */
  finalRank: GuildRank;
  /** 所持アーティファクト数 */
  artifactCount: number;
}

/**
 * ゲームオーバー判定結果
 */
export interface CheckGameOverResult {
  /** ゲームオーバーかどうか */
  isGameOver: boolean;
  /** 既にゲームオーバー済みかどうか */
  alreadyGameOver?: boolean;
  /** ゲームオーバー理由 */
  reason?: GameOverReason;
  /** プレイ統計（ゲームオーバー時のみ） */
  playStats?: PlayStats;
}

/**
 * ゲームオーバー判定ユースケースインターフェース
 */
export interface CheckGameOverUseCase {
  /**
   * ゲームオーバーを判定する
   * @returns ゲームオーバー判定結果
   */
  execute(): Promise<CheckGameOverResult>;
}

/**
 * ゲームオーバー判定ユースケースを生成する
 * @param stateManager ステートマネージャー
 * @param eventBus イベントバス
 * @returns ゲームオーバー判定ユースケース
 */
export function createCheckGameOverUseCase(
  stateManager: StateManager,
  eventBus: EventBus
): CheckGameOverUseCase {
  return {
    async execute(): Promise<CheckGameOverResult> {
      const playerState = stateManager.getPlayerState();
      let gameState = stateManager.getGameState();

      // プレイ統計を作成する関数
      const createPlayStats = (): PlayStats => ({
        totalDays: gameState.currentDay,
        finalGold: playerState.gold,
        finalRank: playerState.rank,
        artifactCount: playerState.artifacts.length,
      });

      // 既にゲームオーバー済みかチェック
      if (gameState.gameProgress === GameProgress.GAME_OVER) {
        return {
          isGameOver: true,
          alreadyGameOver: true,
          playStats: createPlayStats(),
        };
      }

      // 昇格試験中で残り日数0かチェック
      if (
        gameState.isInPromotionTest &&
        gameState.promotionTestDaysRemaining !== null &&
        gameState.promotionTestDaysRemaining <= 0
      ) {
        // ゲームオーバー！（昇格試験失敗）
        gameState = setGameProgress(gameState, GameProgress.GAME_OVER);
        stateManager.updateGameState(gameState);

        // ゲームオーバーイベント発行
        eventBus.publish({
          type: GameEventType.GAME_OVER,
          payload: {
            reason: '昇格試験に失敗しました',
          },
        });

        return {
          isGameOver: true,
          reason: 'PROMOTION_TEST_FAILED',
          playStats: createPlayStats(),
        };
      }

      // ランク維持日数0かチェック
      if (playerState.rankDaysRemaining <= 0) {
        // ゲームオーバー！（ランク維持日数切れ）
        gameState = setGameProgress(gameState, GameProgress.GAME_OVER);
        stateManager.updateGameState(gameState);

        // ゲームオーバーイベント発行
        eventBus.publish({
          type: GameEventType.GAME_OVER,
          payload: {
            reason: 'ランク維持日数が0になりました',
          },
        });

        return {
          isGameOver: true,
          reason: 'RANK_DAYS_EXPIRED',
          playStats: createPlayStats(),
        };
      }

      // ゲームオーバーではない
      return {
        isGameOver: false,
      };
    },
  };
}
