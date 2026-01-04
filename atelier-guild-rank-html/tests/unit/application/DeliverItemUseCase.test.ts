/**
 * DeliverItemUseCaseテスト
 * TASK-0109: 納品ユースケース
 *
 * 依頼へのアイテム納品処理をテストする
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  DeliverItemUseCase,
  createDeliverItemUseCase,
  DeliverItemResult,
} from '@application/DeliverItemUseCase';
import { StateManager, createStateManager } from '@application/StateManager';
import { EventBus, createEventBus, GameEventType } from '@domain/events/GameEvents';
import {
  GuildRank,
  CardType,
  Rarity,
  ItemCategory,
  Quality,
} from '@domain/common/types';
import { IQuest, IActiveQuest, createActiveQuest } from '@domain/quest/QuestEntity';
import { CraftedItem, createCraftedItem } from '@domain/item/ItemEntity';
import { createInventory } from '@domain/services/InventoryService';

describe('DeliverItemUseCase', () => {
  let deliverItemUseCase: DeliverItemUseCase;
  let stateManager: StateManager;
  let eventBus: EventBus;

  // テスト用の依頼データ
  const createTestQuest = (id: string): IQuest => ({
    id,
    clientId: 'client1',
    condition: {
      type: 'specific_item',
      targetItemId: 'item_1',
      quantity: 1,
    },
    contribution: 10,
    gold: 100,
    deadline: 3,
    difficulty: 'normal',
    flavorText: 'テスト依頼',
  });

  // テスト用のアイテム
  const createTestItem = (id: string, itemId: string, quality: Quality): CraftedItem =>
    createCraftedItem({
      id,
      itemId,
      quality,
      attributeValues: [],
      effectValues: [],
      usedMaterials: [],
    });

  // テスト用の受注中依頼
  const testQuest = createTestQuest('quest1');
  const testActiveQuest: IActiveQuest = {
    quest: testQuest,
    remainingDays: 3,
    acceptedDay: 1,
  };

  // テスト用のアイテム
  const testItem = createTestItem('crafted_1', 'item_1', Quality.C);

  beforeEach(() => {
    // イベントバスを生成
    eventBus = createEventBus();
    // ステートマネージャーを生成
    stateManager = createStateManager();

    // 初期状態を設定
    const playerState = stateManager.getPlayerState();
    stateManager.updatePlayerState({
      ...playerState,
      actionPoints: 3,
      gold: 0,
      contribution: 0,
    });

    // ゲーム状態を設定
    const gameState = stateManager.getGameState();
    stateManager.updateGameState({
      ...gameState,
      currentDay: 1,
    });

    // クエスト状態を設定（受注中依頼）
    stateManager.updateQuestState({
      activeQuests: [testActiveQuest],
      availableQuests: [],
    });

    // インベントリにアイテムを設定
    stateManager.updateInventoryState(
      createInventory([], [testItem], 50)
    );

    // ユースケースを生成
    deliverItemUseCase = createDeliverItemUseCase(stateManager, eventBus);
  });

  describe('納品実行', () => {
    it('依頼にアイテムを納品できる', async () => {
      const result = await deliverItemUseCase.execute({
        questId: 'quest1',
        itemInstanceId: 'crafted_1',
      });

      expect(result.success).toBe(true);
    });

    it('納品成功で報酬を獲得', async () => {
      await deliverItemUseCase.execute({
        questId: 'quest1',
        itemInstanceId: 'crafted_1',
      });

      const playerState = stateManager.getPlayerState();
      expect(playerState.gold).toBeGreaterThan(0);
    });

    it('納品成功で貢献度を獲得', async () => {
      await deliverItemUseCase.execute({
        questId: 'quest1',
        itemInstanceId: 'crafted_1',
      });

      const playerState = stateManager.getPlayerState();
      expect(playerState.contribution).toBeGreaterThan(0);
    });

    it('品質ボーナスが適用される', async () => {
      // 高品質アイテムを設定
      const highQualityItem = createTestItem('crafted_high', 'item_1', Quality.S);
      stateManager.updateInventoryState(
        createInventory([], [highQualityItem], 50)
      );

      const result = await deliverItemUseCase.execute({
        questId: 'quest1',
        itemInstanceId: 'crafted_high',
      });

      expect(result.success).toBe(true);
      // 品質Sは基本報酬より高い報酬が期待される
      expect(result.reward?.gold).toBeGreaterThan(testQuest.gold);
    });

    it('納品後に依頼が完了状態になる', async () => {
      await deliverItemUseCase.execute({
        questId: 'quest1',
        itemInstanceId: 'crafted_1',
      });

      const questState = stateManager.getQuestState();
      expect(questState.activeQuests).toHaveLength(0);
    });
  });

  describe('納品失敗', () => {
    it('必要アイテム不足で納品できない', async () => {
      // 空のインベントリを設定
      stateManager.updateInventoryState(
        createInventory([], [], 50)
      );

      const result = await deliverItemUseCase.execute({
        questId: 'quest1',
        itemInstanceId: 'nonexistent',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('ITEM_NOT_FOUND');
    });

    it('受注していない依頼に納品できない', async () => {
      const result = await deliverItemUseCase.execute({
        questId: 'nonexistent',
        itemInstanceId: 'crafted_1',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('QUEST_NOT_FOUND');
    });

    it('納品条件を満たさないアイテムは納品できない', async () => {
      // 別のアイテムを設定
      const wrongItem = createTestItem('crafted_wrong', 'item_wrong', Quality.C);
      stateManager.updateInventoryState(
        createInventory([], [wrongItem], 50)
      );

      const result = await deliverItemUseCase.execute({
        questId: 'quest1',
        itemInstanceId: 'crafted_wrong',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('ITEM_NOT_MATCHING');
    });
  });

  describe('行動ポイント', () => {
    it('行動ポイントを消費しない', async () => {
      const beforeAP = stateManager.getPlayerState().actionPoints;

      await deliverItemUseCase.execute({
        questId: 'quest1',
        itemInstanceId: 'crafted_1',
      });

      const afterAP = stateManager.getPlayerState().actionPoints;
      expect(afterAP).toBe(beforeAP);
    });
  });

  describe('イベント発行', () => {
    it('納品成功イベントが発行される', async () => {
      const eventHandler = vi.fn();
      eventBus.subscribe(GameEventType.QUEST_COMPLETED, eventHandler);

      await deliverItemUseCase.execute({
        questId: 'quest1',
        itemInstanceId: 'crafted_1',
      });

      expect(eventHandler).toHaveBeenCalled();
      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: GameEventType.QUEST_COMPLETED,
          payload: expect.objectContaining({
            questId: 'quest1',
          }),
        })
      );
    });
  });
});
