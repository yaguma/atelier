/**
 * フェーズ遷移ユースケース
 * TASK-0110: フェーズ遷移ユースケース
 *
 * ゲームフェーズの遷移処理を担当するユースケース
 * フェーズ遷移、行動ポイントリセット、日数経過を行う
 */

import { StateManager } from '@application/StateManager';
import { EventBus, GameEventType } from '@domain/events/GameEvents';
import { GamePhase } from '@domain/common/types';
import {
  advancePhase as advancePhaseState,
  advanceDay,
  decrementPromotionTestDays,
} from '@domain/game/GameState';

/**
 * フェーズ遷移結果
 */
export interface PhaseTransitionResult {
  /** 成功したかどうか */
  success: boolean;
  /** 遷移前のフェーズ */
  previousPhase?: GamePhase;
  /** 遷移後のフェーズ */
  newPhase?: GamePhase;
  /** 日数が経過したかどうか */
  dayAdvanced?: boolean;
  /** 新しい日数 */
  newDay?: number;
  /** 昇格試験が期限切れになったかどうか */
  promotionTestExpired?: boolean;
}

/**
 * フェーズ遷移ユースケースインターフェース
 */
export interface PhaseTransitionUseCase {
  /**
   * フェーズ遷移を実行する
   * @returns フェーズ遷移結果
   */
  execute(): Promise<PhaseTransitionResult>;
}

/**
 * フェーズ遷移ユースケースを生成する
 * @param stateManager ステートマネージャー
 * @param eventBus イベントバス
 * @returns フェーズ遷移ユースケース
 */
export function createPhaseTransitionUseCase(
  stateManager: StateManager,
  eventBus: EventBus
): PhaseTransitionUseCase {
  /**
   * 行動ポイントをリセットする
   */
  const resetActionPoints = (): void => {
    const playerState = stateManager.getPlayerState();
    stateManager.updatePlayerState({
      ...playerState,
      actionPoints: playerState.actionPointsMax,
    });
  };

  return {
    async execute(): Promise<PhaseTransitionResult> {
      let gameState = stateManager.getGameState();
      const previousPhase = gameState.currentPhase;

      // フェーズを進める
      gameState = advancePhaseState(gameState);
      const newPhase = gameState.currentPhase;

      let dayAdvanced = false;
      let newDay: number | undefined;
      let promotionTestExpired = false;

      // DELIVERYからQUEST_ACCEPTに戻る場合、日数を進める
      if (
        previousPhase === GamePhase.DELIVERY &&
        newPhase === GamePhase.QUEST_ACCEPT
      ) {
        gameState = advanceDay(gameState);
        dayAdvanced = true;
        newDay = gameState.currentDay;

        // 昇格試験中は試験日数を減らす
        if (gameState.isInPromotionTest) {
          gameState = decrementPromotionTestDays(gameState);

          // 残り日数が0になったかチェック
          if (gameState.promotionTestDaysRemaining === 0) {
            promotionTestExpired = true;
          }
        }

        // DAY_ADVANCEDイベントを発行
        eventBus.publish({
          type: GameEventType.DAY_ADVANCED,
          payload: { day: gameState.currentDay },
        });
      }

      // ゲーム状態を更新
      stateManager.updateGameState(gameState);

      // 行動ポイントをリセット
      resetActionPoints();

      // PHASE_CHANGEDイベントを発行
      eventBus.publish({
        type: GameEventType.PHASE_CHANGED,
        payload: { phase: newPhase },
      });

      return {
        success: true,
        previousPhase,
        newPhase,
        dayAdvanced,
        newDay,
        promotionTestExpired,
      };
    },
  };
}
