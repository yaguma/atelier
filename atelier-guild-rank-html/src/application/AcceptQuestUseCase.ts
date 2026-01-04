/**
 * 依頼受注ユースケース
 * TASK-0106: 依頼受注ユースケース
 *
 * 依頼を受注する処理を担当するユースケース
 */

import { StateManager } from '@application/StateManager';
import { EventBus, GameEventType } from '@domain/events/GameEvents';
import { IActiveQuest, createActiveQuest } from '@domain/quest/QuestEntity';

/**
 * 同時受注上限
 */
const MAX_ACTIVE_QUESTS = 3;

/**
 * 依頼受注実行結果
 */
export interface AcceptQuestResult {
  /** 成功したかどうか */
  success: boolean;
  /** エラータイプ */
  error?: 'QUEST_NOT_FOUND' | 'MAX_QUESTS_REACHED' | 'RANK_INSUFFICIENT';
}

/**
 * 依頼受注ユースケースインターフェース
 */
export interface AcceptQuestUseCase {
  /**
   * 依頼を受注する
   * @param questId 受注する依頼ID
   * @returns 実行結果
   */
  execute(questId: string): Promise<AcceptQuestResult>;
}

/**
 * 依頼受注ユースケースを生成する
 * @param stateManager ステートマネージャー
 * @param eventBus イベントバス
 * @returns 依頼受注ユースケース
 */
export function createAcceptQuestUseCase(
  stateManager: StateManager,
  eventBus: EventBus
): AcceptQuestUseCase {
  return {
    async execute(questId: string): Promise<AcceptQuestResult> {
      const questState = stateManager.getQuestState();
      const gameState = stateManager.getGameState();

      // 同時受注上限チェック
      if (questState.activeQuests.length >= MAX_ACTIVE_QUESTS) {
        return {
          success: false,
          error: 'MAX_QUESTS_REACHED',
        };
      }

      // 依頼を検索
      const quest = questState.availableQuests.find((q) => q.id === questId);
      if (!quest) {
        return {
          success: false,
          error: 'QUEST_NOT_FOUND',
        };
      }

      // 受注中の依頼を作成
      const activeQuest: IActiveQuest = {
        quest,
        remainingDays: quest.deadline,
        acceptedDay: gameState.currentDay,
      };

      // クエスト状態を更新
      const newAvailableQuests = questState.availableQuests.filter(
        (q) => q.id !== questId
      );
      const newActiveQuests = [...questState.activeQuests, activeQuest];

      stateManager.updateQuestState({
        activeQuests: newActiveQuests,
        availableQuests: newAvailableQuests,
      });

      // イベントを発行
      eventBus.publish({
        type: GameEventType.QUEST_ACCEPTED,
        payload: {
          questId,
        },
      });

      return {
        success: true,
      };
    },
  };
}
