/**
 * ゲームフローマネージャー
 * TASK-0102: ゲームフローマネージャー
 *
 * ゲームフロー制御を担当するマネージャー
 * フェーズ遷移、日数管理、ゲーム終了条件の監視を行う
 */

import {
  GameState,
  createGameState,
  advancePhase as advancePhaseState,
  advanceDay,
  startPromotionTest as startPromotionTestState,
  decrementPromotionTestDays,
  endPromotionTest as endPromotionTestState,
} from '@domain/game/GameState';
import { PlayerState, createPlayerState } from '@domain/player/PlayerState';
import { EventBus, GameEventType } from '@domain/events/GameEvents';
import { GamePhase, GuildRank } from '@domain/common/types';

/**
 * ゲーム初期化オプション
 */
export interface GameInitializeOptions {
  initialDay?: number;
  initialGold?: number;
  initialRank?: GuildRank;
}

/**
 * ゲーム終了条件チェック結果
 */
export interface EndConditionResult {
  isGameOver: boolean;
  isGameClear: boolean;
  shouldTriggerPromotion: boolean;
  gameOverReason?: string;
}

/**
 * ゲームフローマネージャーインターフェース
 */
export interface GameFlowManager {
  /**
   * ゲームを初期化する
   * @param options 初期化オプション
   * @returns ゲーム状態とプレイヤー状態
   */
  initializeGame(options?: GameInitializeOptions): {
    gameState: GameState;
    playerState: PlayerState;
  };

  /**
   * フェーズを進める
   * @returns 新しいゲーム状態
   */
  advancePhase(): GameState;

  /**
   * ゲーム終了条件をチェックする
   * @param playerState プレイヤー状態
   * @returns チェック結果
   */
  checkEndConditions(playerState: PlayerState): EndConditionResult;

  /**
   * 昇格試験を開始する
   * @param dayLimit 制限日数
   * @param fromRank 現在のランク
   * @param toRank 目標ランク
   * @returns 新しいゲーム状態
   */
  startPromotionTest(
    dayLimit: number,
    fromRank?: GuildRank,
    toRank?: GuildRank
  ): GameState;

  /**
   * 昇格試験を終了する
   * @returns 新しいゲーム状態
   */
  endPromotionTest(): GameState;

  /**
   * 現在のゲーム状態を取得する
   * @returns ゲーム状態
   * @throws ゲームが初期化されていない場合
   */
  getGameState(): GameState;

  /**
   * 現在のプレイヤー状態を取得する
   * @returns プレイヤー状態
   * @throws ゲームが初期化されていない場合
   */
  getPlayerState(): PlayerState;

  /**
   * ゲーム状態を設定する
   * @param state 新しいゲーム状態
   */
  setGameState(state: GameState): void;

  /**
   * プレイヤー状態を設定する
   * @param state 新しいプレイヤー状態
   */
  setPlayerState(state: PlayerState): void;
}

/**
 * ゲームフローマネージャーを生成する
 * @param eventBus イベントバス
 * @returns ゲームフローマネージャー
 */
export function createGameFlowManager(eventBus: EventBus): GameFlowManager {
  // 内部状態
  let gameState: GameState | null = null;
  let playerState: PlayerState | null = null;

  return {
    initializeGame(options?: GameInitializeOptions): {
      gameState: GameState;
      playerState: PlayerState;
    } {
      // ゲーム状態を初期化
      gameState = createGameState({
        currentDay: options?.initialDay ?? 1,
      });

      // プレイヤー状態を初期化
      playerState = createPlayerState({
        gold: options?.initialGold ?? 100,
        rank: options?.initialRank ?? GuildRank.G,
      });

      return { gameState, playerState };
    },

    advancePhase(): GameState {
      if (!gameState) {
        throw new Error('Game not initialized');
      }

      // 現在のフェーズを取得
      const previousPhase = gameState.currentPhase;

      // フェーズを進める
      gameState = advancePhaseState(gameState);

      // DELIVERYからQUEST_ACCEPTに戻る場合、日数を進める
      if (
        previousPhase === GamePhase.DELIVERY &&
        gameState.currentPhase === GamePhase.QUEST_ACCEPT
      ) {
        gameState = advanceDay(gameState);

        // 昇格試験中は試験日数を減らす
        if (gameState.isInPromotionTest) {
          gameState = decrementPromotionTestDays(gameState);
        }

        // DAY_ADVANCEDイベントを発行
        eventBus.publish({
          type: GameEventType.DAY_ADVANCED,
          payload: { day: gameState.currentDay },
        });
      }

      // PHASE_CHANGEDイベントを発行
      eventBus.publish({
        type: GameEventType.PHASE_CHANGED,
        payload: { phase: gameState.currentPhase },
      });

      return gameState;
    },

    checkEndConditions(targetPlayerState: PlayerState): EndConditionResult {
      const result: EndConditionResult = {
        isGameOver: false,
        isGameClear: false,
        shouldTriggerPromotion: false,
      };

      // 昇格ゲージ満タンで昇格試験トリガー
      if (targetPlayerState.promotionGauge >= targetPlayerState.promotionGaugeMax) {
        result.shouldTriggerPromotion = true;
      }

      // ランク維持日数が0でゲームオーバー
      if (targetPlayerState.rankDaysRemaining <= 0) {
        result.isGameOver = true;
        result.gameOverReason = 'RANK_DAYS_EXPIRED';
      }

      // Sランク到達でゲームクリア
      if (targetPlayerState.rank === GuildRank.S) {
        result.isGameClear = true;
      }

      return result;
    },

    startPromotionTest(
      dayLimit: number,
      fromRank?: GuildRank,
      toRank?: GuildRank
    ): GameState {
      if (!gameState) {
        throw new Error('Game not initialized');
      }

      gameState = startPromotionTestState(gameState, dayLimit);

      // RANK_UP_TEST_STARTEDイベントを発行（ランク情報がある場合）
      if (fromRank !== undefined && toRank !== undefined) {
        eventBus.publish({
          type: GameEventType.RANK_UP_TEST_STARTED,
          payload: { fromRank, toRank },
        });
      }

      return gameState;
    },

    endPromotionTest(): GameState {
      if (!gameState) {
        throw new Error('Game not initialized');
      }

      gameState = endPromotionTestState(gameState);
      return gameState;
    },

    getGameState(): GameState {
      if (!gameState) {
        throw new Error('Game not initialized');
      }
      return gameState;
    },

    getPlayerState(): PlayerState {
      if (!playerState) {
        throw new Error('Game not initialized');
      }
      return playerState;
    },

    setGameState(state: GameState): void {
      gameState = state;
    },

    setPlayerState(state: PlayerState): void {
      playerState = state;
    },
  };
}
