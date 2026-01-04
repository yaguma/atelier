/**
 * 日数経過ユースケース
 * TASK-0111: 日数経過ユースケース
 *
 * 日数進行処理を担当するユースケース
 * ランク維持日数減少、依頼期限減少、ペナルティ処理を行う
 */

import { StateManager } from '@application/StateManager';
import { EventBus, GameEventType } from '@domain/events/GameEvents';
import {
  advanceDay as advanceDayState,
  decrementPromotionTestDays,
} from '@domain/game/GameState';
import { decrementRankDaysRemaining } from '@domain/player/PlayerState';
import { IActiveQuest } from '@domain/quest/QuestEntity';

/**
 * 期限切れペナルティ（貢献度減少量）
 */
const EXPIRED_QUEST_PENALTY = 10;

/**
 * 日数経過結果
 */
export interface AdvanceDayResult {
  /** 成功したかどうか */
  success: boolean;
  /** 新しい日数 */
  newDay?: number;
  /** 期限切れになった依頼ID */
  expiredQuests?: string[];
  /** ゲームオーバーかどうか */
  isGameOver?: boolean;
  /** ゲームオーバー理由 */
  gameOverReason?: string;
  /** 昇格試験が期限切れになったかどうか */
  promotionTestExpired?: boolean;
}

/**
 * 日数経過ユースケースインターフェース
 */
export interface AdvanceDayUseCase {
  /**
   * 日数経過を実行する
   * @returns 日数経過結果
   */
  execute(): Promise<AdvanceDayResult>;
}

/**
 * 日数経過ユースケースを生成する
 * @param stateManager ステートマネージャー
 * @param eventBus イベントバス
 * @returns 日数経過ユースケース
 */
export function createAdvanceDayUseCase(
  stateManager: StateManager,
  eventBus: EventBus
): AdvanceDayUseCase {
  /**
   * 依頼の期限を進める
   */
  const advanceQuestDeadlines = (): { updatedQuests: IActiveQuest[]; expiredQuests: string[] } => {
    const questState = stateManager.getQuestState();
    const updatedQuests: IActiveQuest[] = [];
    const expiredQuests: string[] = [];

    for (const activeQuest of questState.activeQuests) {
      const newRemainingDays = activeQuest.remainingDays - 1;

      if (newRemainingDays <= 0) {
        // 期限切れ
        expiredQuests.push(activeQuest.quest.id);
      } else {
        // 日数を減らして継続
        updatedQuests.push({
          quest: activeQuest.quest,
          remainingDays: newRemainingDays,
          acceptedDay: activeQuest.acceptedDay,
        });
      }
    }

    return { updatedQuests, expiredQuests };
  };

  /**
   * 期限切れペナルティを適用する
   */
  const applyExpiredPenalty = (expiredCount: number): void => {
    if (expiredCount === 0) return;

    let playerState = stateManager.getPlayerState();
    const penalty = EXPIRED_QUEST_PENALTY * expiredCount;
    const newPromotionGauge = Math.max(0, playerState.promotionGauge - penalty);

    stateManager.updatePlayerState({
      ...playerState,
      promotionGauge: newPromotionGauge,
    });
  };

  return {
    async execute(): Promise<AdvanceDayResult> {
      let gameState = stateManager.getGameState();
      let playerState = stateManager.getPlayerState();

      // 日数を進める
      gameState = advanceDayState(gameState);
      const newDay = gameState.currentDay;

      // ランク維持日数を減らす
      playerState = decrementRankDaysRemaining(playerState);
      stateManager.updatePlayerState(playerState);

      // ゲームオーバー判定
      let isGameOver = false;
      let gameOverReason: string | undefined;

      if (playerState.rankDaysRemaining <= 0) {
        isGameOver = true;
        gameOverReason = 'RANK_DAYS_EXPIRED';
      }

      // 依頼の期限を進める
      const { updatedQuests, expiredQuests } = advanceQuestDeadlines();

      // クエスト状態を更新
      const questState = stateManager.getQuestState();
      stateManager.updateQuestState({
        ...questState,
        activeQuests: updatedQuests,
      });

      // 期限切れペナルティを適用
      applyExpiredPenalty(expiredQuests.length);

      // 昇格試験中は試験日数を減らす
      let promotionTestExpired = false;
      if (gameState.isInPromotionTest) {
        gameState = decrementPromotionTestDays(gameState);

        if (gameState.promotionTestDaysRemaining === 0) {
          promotionTestExpired = true;
        }
      }

      // ゲーム状態を更新
      stateManager.updateGameState(gameState);

      // DAY_ADVANCEDイベントを発行
      eventBus.publish({
        type: GameEventType.DAY_ADVANCED,
        payload: { day: newDay },
      });

      return {
        success: true,
        newDay,
        expiredQuests: expiredQuests.length > 0 ? expiredQuests : undefined,
        isGameOver,
        gameOverReason,
        promotionTestExpired,
      };
    },
  };
}
