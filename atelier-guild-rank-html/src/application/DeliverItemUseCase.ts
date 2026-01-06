/**
 * 納品ユースケース
 * TASK-0109: 納品ユースケース
 *
 * 依頼へのアイテム納品処理を担当するユースケース
 * 報酬計算、品質ボーナス適用を行う
 */

import { StateManager } from '@application/StateManager';
import { EventBus, GameEventType, Reward } from '@domain/events/GameEvents';
import { Quality, QuestType } from '@domain/common/types';
import { IActiveQuest } from '@domain/quest/QuestEntity';

/**
 * 納品リクエスト
 */
export interface DeliverItemRequest {
  /** 依頼ID */
  questId: string;
  /** アイテムインスタンスID */
  itemInstanceId: string;
}

/**
 * 納品結果
 */
export interface DeliverItemResult {
  /** 成功したかどうか */
  success: boolean;
  /** 獲得報酬 */
  reward?: Reward;
  /** エラータイプ */
  error?: 'QUEST_NOT_FOUND' | 'ITEM_NOT_FOUND' | 'ITEM_NOT_MATCHING';
}

/**
 * 納品ユースケースインターフェース
 */
export interface DeliverItemUseCase {
  /**
   * 納品を実行する
   * @param request 納品リクエスト
   * @returns 納品結果
   */
  execute(request: DeliverItemRequest): Promise<DeliverItemResult>;
}

/**
 * 品質ボーナス倍率マップ
 */
const QualityBonusMultiplier: Record<Quality, number> = {
  [Quality.E]: 0.25,
  [Quality.D]: 0.5,
  [Quality.C]: 1.0,
  [Quality.B]: 1.25,
  [Quality.A]: 1.5,
  [Quality.S]: 2.0,
};

/**
 * 納品ユースケースを生成する
 * @param stateManager ステートマネージャー
 * @param eventBus イベントバス
 * @returns 納品ユースケース
 */
export function createDeliverItemUseCase(
  stateManager: StateManager,
  eventBus: EventBus
): DeliverItemUseCase {
  /**
   * 受注中の依頼を取得する
   */
  const getActiveQuest = (questId: string): IActiveQuest | undefined => {
    const questState = stateManager.getQuestState();
    return questState.activeQuests.find((aq) => aq.quest.id === questId);
  };

  /**
   * インベントリからアイテムを取得する
   */
  const getItem = (itemInstanceId: string) => {
    const inventory = stateManager.getInventoryState();
    return inventory.items.find((item) => item.id === itemInstanceId);
  };

  /**
   * アイテムが依頼条件を満たすかチェックする
   */
  const checkItemMatchesCondition = (
    activeQuest: IActiveQuest,
    itemId: string
  ): boolean => {
    const condition = activeQuest.quest.condition;

    // 特定アイテム納品条件
    if (condition.type === QuestType.SPECIFIC) {
      return condition.itemId === itemId;
    }

    // カテゴリ指定条件（TODO: 将来的に拡張）
    if (condition.type === QuestType.CATEGORY) {
      // 簡易実装: 現時点ではitemIdと一致するかのみチェック
      return condition.itemId === itemId;
    }

    return false;
  };

  /**
   * 報酬を計算する
   */
  const calculateReward = (
    activeQuest: IActiveQuest,
    quality: Quality
  ): Reward => {
    const baseGold = activeQuest.quest.gold;
    const baseContribution = activeQuest.quest.contribution;
    const multiplier = QualityBonusMultiplier[quality];

    return {
      gold: Math.floor(baseGold * multiplier),
      contribution: Math.floor(baseContribution * multiplier),
    };
  };

  /**
   * アイテムをインベントリから消費する
   */
  const consumeItem = (itemInstanceId: string): void => {
    const inventory = stateManager.getInventoryState();
    const newItems = inventory.items.filter((item) => item.id !== itemInstanceId);

    stateManager.updateInventoryState({
      ...inventory,
      items: newItems,
    });
  };

  /**
   * 依頼を完了状態にする
   */
  const completeQuest = (questId: string): void => {
    const questState = stateManager.getQuestState();
    const newActiveQuests = questState.activeQuests.filter(
      (aq) => aq.quest.id !== questId
    );

    stateManager.updateQuestState({
      ...questState,
      activeQuests: newActiveQuests,
    });
  };

  /**
   * 報酬を付与する
   */
  const grantReward = (reward: Reward): void => {
    const playerState = stateManager.getPlayerState();

    stateManager.updatePlayerState({
      ...playerState,
      gold: playerState.gold + reward.gold,
      promotionGauge: playerState.promotionGauge + reward.contribution,
    });
  };

  return {
    async execute(request: DeliverItemRequest): Promise<DeliverItemResult> {
      // 受注中の依頼を取得
      const activeQuest = getActiveQuest(request.questId);
      if (!activeQuest) {
        return {
          success: false,
          error: 'QUEST_NOT_FOUND',
        };
      }

      // アイテムを取得
      const item = getItem(request.itemInstanceId);
      if (!item) {
        return {
          success: false,
          error: 'ITEM_NOT_FOUND',
        };
      }

      // 依頼条件を満たすかチェック
      if (!checkItemMatchesCondition(activeQuest, item.itemId)) {
        return {
          success: false,
          error: 'ITEM_NOT_MATCHING',
        };
      }

      // 報酬を計算
      const reward = calculateReward(activeQuest, item.quality);

      // アイテムを消費
      consumeItem(request.itemInstanceId);

      // 依頼を完了
      completeQuest(request.questId);

      // 報酬を付与
      grantReward(reward);

      // イベントを発行
      eventBus.publish({
        type: GameEventType.QUEST_COMPLETED,
        payload: {
          questId: request.questId,
          reward,
        },
      });

      return {
        success: true,
        reward,
      };
    },
  };
}
