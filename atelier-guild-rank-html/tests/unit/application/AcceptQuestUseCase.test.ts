/**
 * AcceptQuestUseCaseテスト
 * TASK-0106: 依頼受注ユースケース
 *
 * 依頼受注処理をテストする
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  AcceptQuestUseCase,
  createAcceptQuestUseCase,
  AcceptQuestResult,
} from '@application/AcceptQuestUseCase';
import { StateManager, createStateManager } from '@application/StateManager';
import { EventBus, createEventBus, GameEventType } from '@domain/events/GameEvents';
import { GuildRank, QuestType } from '@domain/common/types';
import { IQuest, createActiveQuest } from '@domain/quest/QuestEntity';

describe('AcceptQuestUseCase', () => {
  let acceptQuestUseCase: AcceptQuestUseCase;
  let stateManager: StateManager;
  let eventBus: EventBus;

  // テスト用の依頼データ
  const createTestQuest = (id: string, unlockRank: GuildRank = GuildRank.G): IQuest => ({
    id,
    clientId: 'client1',
    condition: {
      type: 'specific_item',
      targetItemId: 'item1',
      quantity: 1,
    },
    contribution: 10,
    gold: 100,
    deadline: 3,
    difficulty: 'normal',
    flavorText: 'テスト依頼',
  });

  beforeEach(() => {
    // イベントバスを生成
    eventBus = createEventBus();
    // ステートマネージャーを生成
    stateManager = createStateManager();

    // 初期状態を設定
    const playerState = stateManager.getPlayerState();
    stateManager.updatePlayerState({
      ...playerState,
      rank: GuildRank.F,
    });

    // 利用可能な依頼を設定
    stateManager.updateQuestState({
      activeQuests: [],
      availableQuests: [
        createTestQuest('quest1'),
        createTestQuest('quest2'),
        createTestQuest('quest3'),
        createTestQuest('quest4'),
      ],
    });

    // ゲーム状態を設定（現在1日目）
    const gameState = stateManager.getGameState();
    stateManager.updateGameState({
      ...gameState,
      currentDay: 1,
    });

    // ユースケースを生成
    acceptQuestUseCase = createAcceptQuestUseCase(stateManager, eventBus);
  });

  describe('依頼受注', () => {
    it('依頼を受注できる', async () => {
      const result = await acceptQuestUseCase.execute('quest1');

      expect(result.success).toBe(true);
    });

    it('受注後に受注中依頼リストに追加される', async () => {
      await acceptQuestUseCase.execute('quest1');

      const questState = stateManager.getQuestState();
      expect(questState.activeQuests).toHaveLength(1);
      expect(questState.activeQuests[0].quest.id).toBe('quest1');
    });

    it('受注後に利用可能依頼リストから除外される', async () => {
      await acceptQuestUseCase.execute('quest1');

      const questState = stateManager.getQuestState();
      expect(questState.availableQuests).toHaveLength(3);
      expect(questState.availableQuests.find((q) => q.id === 'quest1')).toBeUndefined();
    });

    it('受注時に残り日数が期限で設定される', async () => {
      await acceptQuestUseCase.execute('quest1');

      const questState = stateManager.getQuestState();
      expect(questState.activeQuests[0].remainingDays).toBe(3);
    });

    it('受注時に受注日が現在日で設定される', async () => {
      await acceptQuestUseCase.execute('quest1');

      const questState = stateManager.getQuestState();
      expect(questState.activeQuests[0].acceptedDay).toBe(1);
    });
  });

  describe('受注制限', () => {
    it('同時受注上限（3件）を超えると受注できない', async () => {
      // 3件受注
      await acceptQuestUseCase.execute('quest1');
      await acceptQuestUseCase.execute('quest2');
      await acceptQuestUseCase.execute('quest3');

      // 4件目は失敗
      const result = await acceptQuestUseCase.execute('quest4');

      expect(result.success).toBe(false);
      expect(result.error).toBe('MAX_QUESTS_REACHED');
    });

    it('存在しない依頼は受注できない', async () => {
      const result = await acceptQuestUseCase.execute('nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toBe('QUEST_NOT_FOUND');
    });

    it('受注済み依頼は再受注できない', async () => {
      await acceptQuestUseCase.execute('quest1');
      const result = await acceptQuestUseCase.execute('quest1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('QUEST_NOT_FOUND');
    });
  });

  describe('行動ポイント', () => {
    it('行動ポイントを消費しない', async () => {
      const beforeAP = stateManager.getPlayerState().actionPoints;

      await acceptQuestUseCase.execute('quest1');

      const afterAP = stateManager.getPlayerState().actionPoints;
      expect(afterAP).toBe(beforeAP);
    });
  });

  describe('イベント発行', () => {
    it('依頼受注イベントが発行される', async () => {
      const eventHandler = vi.fn();
      eventBus.subscribe(GameEventType.QUEST_ACCEPTED, eventHandler);

      await acceptQuestUseCase.execute('quest1');

      expect(eventHandler).toHaveBeenCalled();
      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: GameEventType.QUEST_ACCEPTED,
          payload: expect.objectContaining({
            questId: 'quest1',
          }),
        })
      );
    });
  });
});
