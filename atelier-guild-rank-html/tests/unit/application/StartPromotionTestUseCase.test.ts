/**
 * StartPromotionTestUseCaseテスト
 * TASK-0113: 昇格試験開始ユースケース
 *
 * 昇格試験開始処理をテストする
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  StartPromotionTestUseCase,
  createStartPromotionTestUseCase,
  StartPromotionTestResult,
} from '@application/StartPromotionTestUseCase';
import { StateManager, createStateManager } from '@application/StateManager';
import { EventBus, createEventBus, GameEventType } from '@domain/events/GameEvents';
import { GamePhase, GuildRank, Quality } from '@domain/common/types';
import { Rank, createRank, PromotionTest, createPromotionTest } from '@domain/rank/RankEntity';
import type { IPromotionTest } from '@domain/rank/Rank';

describe('StartPromotionTestUseCase', () => {
  let startPromotionTestUseCase: StartPromotionTestUseCase;
  let stateManager: StateManager;
  let eventBus: EventBus;

  // テスト用の昇格試験データ
  const testPromotionTest: IPromotionTest = {
    requirements: [
      {
        itemId: 'item_potion',
        quantity: 3,
        minQuality: Quality.B,
      },
    ],
    dayLimit: 7,
  };

  // テスト用のランクデータを作成するヘルパー
  const createTestRank = (rank: GuildRank, promotionTest: IPromotionTest | null = null) => {
    return createRank({
      id: rank,
      name: rank,
      maxPromotionGauge: 100,
      dayLimit: 30,
      specialRules: [],
      promotionTest,
      unlockedGatheringCards: [],
      unlockedRecipeCards: [],
    });
  };

  beforeEach(() => {
    // イベントバスを生成
    eventBus = createEventBus();
    // ステートマネージャーを生成
    stateManager = createStateManager();

    // 初期状態を設定（Gランク、昇格ゲージMAX）
    const playerState = stateManager.getPlayerState();
    stateManager.updatePlayerState({
      ...playerState,
      rank: GuildRank.G,
      promotionGauge: 100,
      maxPromotionGauge: 100,
    });

    // ゲーム状態を設定
    const gameState = stateManager.getGameState();
    stateManager.updateGameState({
      ...gameState,
      currentPhase: GamePhase.QUEST_ACCEPT,
      currentDay: 1,
      isInPromotionTest: false,
      promotionTestDaysRemaining: null,
    });

    // テスト用ランクを取得する関数
    const getRankData = (rank: GuildRank): Rank => {
      return createTestRank(rank, testPromotionTest);
    };

    // ユースケースを生成
    startPromotionTestUseCase = createStartPromotionTestUseCase(
      stateManager,
      eventBus,
      getRankData
    );
  });

  describe('昇格試験開始', () => {
    it('昇格試験を開始できる', async () => {
      const result = await startPromotionTestUseCase.execute();

      expect(result.success).toBe(true);
    });

    it('試験課題が設定される', async () => {
      const result = await startPromotionTestUseCase.execute();

      expect(result.success).toBe(true);
      expect(result.requirements).toBeDefined();
      expect(result.requirements).toHaveLength(1);
      expect(result.requirements?.[0].itemId).toBe('item_potion');
      expect(result.requirements?.[0].quantity).toBe(3);
      expect(result.requirements?.[0].minQuality).toBe(Quality.B);
    });

    it('試験制限日数が設定される', async () => {
      const result = await startPromotionTestUseCase.execute();

      expect(result.success).toBe(true);
      expect(result.dayLimit).toBe(7);

      // ゲーム状態でも確認
      const gameState = stateManager.getGameState();
      expect(gameState.promotionTestDaysRemaining).toBe(7);
    });

    it('ゲーム状態が試験モードになる', async () => {
      await startPromotionTestUseCase.execute();

      const gameState = stateManager.getGameState();
      expect(gameState.isInPromotionTest).toBe(true);
    });

    it('昇格ゲージがリセットされる', async () => {
      await startPromotionTestUseCase.execute();

      const playerState = stateManager.getPlayerState();
      expect(playerState.promotionGauge).toBe(0);
    });
  });

  describe('開始条件チェック', () => {
    it('昇格ゲージが足りないと開始できない', async () => {
      // 昇格ゲージを不足させる
      const playerState = stateManager.getPlayerState();
      stateManager.updatePlayerState({
        ...playerState,
        promotionGauge: 50,
        maxPromotionGauge: 100,
      });

      const result = await startPromotionTestUseCase.execute();

      expect(result.success).toBe(false);
      expect(result.error).toBe('INSUFFICIENT_PROMOTION_GAUGE');
    });

    it('既に試験中の場合は開始できない', async () => {
      // 既に試験中に設定
      const gameState = stateManager.getGameState();
      stateManager.updateGameState({
        ...gameState,
        isInPromotionTest: true,
        promotionTestDaysRemaining: 5,
      });

      const result = await startPromotionTestUseCase.execute();

      expect(result.success).toBe(false);
      expect(result.error).toBe('ALREADY_IN_TEST');
    });

    it('最高ランクでは昇格試験を開始できない', async () => {
      // Sランクに設定
      const playerState = stateManager.getPlayerState();
      stateManager.updatePlayerState({
        ...playerState,
        rank: GuildRank.S,
        promotionGauge: 100,
        maxPromotionGauge: 100,
      });

      // Sランクにはpromotion testがない
      const getRankData = (rank: GuildRank): Rank => {
        if (rank === GuildRank.S) {
          return createTestRank(rank, null);
        }
        return createTestRank(rank, testPromotionTest);
      };

      startPromotionTestUseCase = createStartPromotionTestUseCase(
        stateManager,
        eventBus,
        getRankData
      );

      const result = await startPromotionTestUseCase.execute();

      expect(result.success).toBe(false);
      expect(result.error).toBe('MAX_RANK_REACHED');
    });
  });

  describe('イベント発行', () => {
    it('昇格試験開始イベントが発行される', async () => {
      const eventHandler = vi.fn();
      eventBus.subscribe(GameEventType.RANK_UP_TEST_STARTED, eventHandler);

      await startPromotionTestUseCase.execute();

      expect(eventHandler).toHaveBeenCalled();
      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: GameEventType.RANK_UP_TEST_STARTED,
          payload: expect.objectContaining({
            fromRank: GuildRank.G,
            toRank: GuildRank.F,
          }),
        })
      );
    });
  });
});
