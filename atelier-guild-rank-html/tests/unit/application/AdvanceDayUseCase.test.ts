/**
 * AdvanceDayUseCaseテスト
 * TASK-0111: 日数経過ユースケース
 *
 * 日数経過処理をテストする
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  AdvanceDayUseCase,
  createAdvanceDayUseCase,
  AdvanceDayResult,
} from '@application/AdvanceDayUseCase';
import { StateManager, createStateManager } from '@application/StateManager';
import { EventBus, createEventBus, GameEventType } from '@domain/events/GameEvents';
import { GamePhase, GuildRank, QuestType } from '@domain/common/types';
import { IQuest, IActiveQuest } from '@domain/quest/QuestEntity';

describe('AdvanceDayUseCase', () => {
  let advanceDayUseCase: AdvanceDayUseCase;
  let stateManager: StateManager;
  let eventBus: EventBus;

  // テスト用の依頼データ
  const createTestQuest = (id: string, deadline: number): IQuest => ({
    id,
    clientId: 'client1',
    condition: {
      type: QuestType.SPECIFIC,
      itemId: 'item_1',
      quantity: 1,
    },
    contribution: 10,
    gold: 100,
    deadline,
    difficulty: 'normal',
    flavorText: 'テスト依頼',
  });

  // テスト用の受注中依頼
  const createTestActiveQuest = (id: string, remainingDays: number): IActiveQuest => ({
    quest: createTestQuest(id, 3),
    remainingDays,
    acceptedDay: 1,
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
      actionPoints: 3,
      gold: 100,
      promotionGauge: 50,
      rankDaysRemaining: 30,
    });

    // ゲーム状態を設定
    const gameState = stateManager.getGameState();
    stateManager.updateGameState({
      ...gameState,
      currentPhase: GamePhase.QUEST_ACCEPT,
      currentDay: 1,
    });

    // ユースケースを生成
    advanceDayUseCase = createAdvanceDayUseCase(stateManager, eventBus);
  });

  describe('日数経過', () => {
    it('日数が1日進む', async () => {
      const result = await advanceDayUseCase.execute();

      expect(result.success).toBe(true);
      expect(result.newDay).toBe(2);
    });

    it('ゲーム状態の日数が更新される', async () => {
      await advanceDayUseCase.execute();

      const gameState = stateManager.getGameState();
      expect(gameState.currentDay).toBe(2);
    });
  });

  describe('ランク維持日数', () => {
    it('ランク維持日数が減少する', async () => {
      const playerState = stateManager.getPlayerState();
      stateManager.updatePlayerState({
        ...playerState,
        rankDaysRemaining: 30,
      });

      await advanceDayUseCase.execute();

      const updatedPlayerState = stateManager.getPlayerState();
      expect(updatedPlayerState.rankDaysRemaining).toBe(29);
    });

    it('ランク維持日数0でゲームオーバーフラグ', async () => {
      const playerState = stateManager.getPlayerState();
      stateManager.updatePlayerState({
        ...playerState,
        rankDaysRemaining: 1,
      });

      const result = await advanceDayUseCase.execute();

      expect(result.success).toBe(true);
      expect(result.isGameOver).toBe(true);
      expect(result.gameOverReason).toBe('RANK_DAYS_EXPIRED');
    });
  });

  describe('依頼の期限', () => {
    it('依頼の期限が減少する', async () => {
      // 受注中の依頼を設定
      stateManager.updateQuestState({
        activeQuests: [createTestActiveQuest('quest1', 3)],
        availableQuests: [],
      });

      await advanceDayUseCase.execute();

      const questState = stateManager.getQuestState();
      expect(questState.activeQuests[0].remainingDays).toBe(2);
    });

    it('期限切れ依頼にペナルティ', async () => {
      // 残り1日の依頼を設定
      stateManager.updateQuestState({
        activeQuests: [createTestActiveQuest('quest1', 1)],
        availableQuests: [],
      });

      const result = await advanceDayUseCase.execute();

      expect(result.success).toBe(true);
      expect(result.expiredQuests).toHaveLength(1);
      expect(result.expiredQuests?.[0]).toBe('quest1');
    });

    it('期限切れ依頼は貢献度ペナルティを受ける', async () => {
      const playerState = stateManager.getPlayerState();
      const initialContribution = 50;
      stateManager.updatePlayerState({
        ...playerState,
        promotionGauge: initialContribution,
      });

      // 残り1日の依頼を設定（期限切れになる）
      stateManager.updateQuestState({
        activeQuests: [createTestActiveQuest('quest1', 1)],
        availableQuests: [],
      });

      await advanceDayUseCase.execute();

      const updatedPlayerState = stateManager.getPlayerState();
      // 貢献度が減少していることを確認
      expect(updatedPlayerState.promotionGauge).toBeLessThan(initialContribution);
    });

    it('期限切れ依頼は削除される', async () => {
      // 残り1日の依頼を設定
      stateManager.updateQuestState({
        activeQuests: [createTestActiveQuest('quest1', 1)],
        availableQuests: [],
      });

      await advanceDayUseCase.execute();

      const questState = stateManager.getQuestState();
      expect(questState.activeQuests).toHaveLength(0);
    });
  });

  describe('昇格試験中', () => {
    it('昇格試験中は試験日数が減少', async () => {
      // 昇格試験中の状態を設定
      const gameState = stateManager.getGameState();
      stateManager.updateGameState({
        ...gameState,
        isInPromotionTest: true,
        promotionTestDaysRemaining: 5,
      });

      await advanceDayUseCase.execute();

      const updatedGameState = stateManager.getGameState();
      expect(updatedGameState.promotionTestDaysRemaining).toBe(4);
    });

    it('昇格試験日数が0になったらフラグが立つ', async () => {
      // 昇格試験中の状態を設定（残り1日）
      const gameState = stateManager.getGameState();
      stateManager.updateGameState({
        ...gameState,
        isInPromotionTest: true,
        promotionTestDaysRemaining: 1,
      });

      const result = await advanceDayUseCase.execute();

      expect(result.success).toBe(true);
      expect(result.promotionTestExpired).toBe(true);
    });
  });

  describe('イベント発行', () => {
    it('日数経過イベントが発行される', async () => {
      const eventHandler = vi.fn();
      eventBus.subscribe(GameEventType.DAY_ADVANCED, eventHandler);

      await advanceDayUseCase.execute();

      expect(eventHandler).toHaveBeenCalled();
      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: GameEventType.DAY_ADVANCED,
          payload: expect.objectContaining({
            day: 2,
          }),
        })
      );
    });
  });
});
