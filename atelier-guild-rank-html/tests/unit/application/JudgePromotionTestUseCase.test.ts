/**
 * JudgePromotionTestUseCaseテスト
 * TASK-0114: 昇格試験判定ユースケース
 *
 * 昇格試験の判定処理をテストする
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  JudgePromotionTestUseCase,
  createJudgePromotionTestUseCase,
  JudgePromotionTestResult,
} from '@application/JudgePromotionTestUseCase';
import { StateManager, createStateManager } from '@application/StateManager';
import { EventBus, createEventBus, GameEventType } from '@domain/events/GameEvents';
import { GamePhase, GuildRank, Quality } from '@domain/common/types';
import { GameProgress } from '@domain/game/GameState';
import { Rank, createRank } from '@domain/rank/RankEntity';
import type { IPromotionTest } from '@domain/rank/Rank';
import { createCraftedItem, ICraftedItem } from '@domain/item/ItemEntity';

/**
 * テスト用調合済みアイテムを作成するヘルパー
 */
function createTestCraftedItem(
  id: string,
  itemId: string,
  name: string,
  quality: Quality
): ReturnType<typeof createCraftedItem> {
  const data: ICraftedItem = {
    id,
    itemId,
    quality,
    attributeValues: [],
    effectValues: [],
    usedMaterials: [],
  };
  return createCraftedItem(data);
}

describe('JudgePromotionTestUseCase', () => {
  let judgePromotionTestUseCase: JudgePromotionTestUseCase;
  let stateManager: StateManager;
  let eventBus: EventBus;

  // テスト用の昇格試験データ
  const testPromotionTest: IPromotionTest = {
    requirements: [
      {
        itemId: 'item_potion',
        quantity: 2,
        minQuality: Quality.C,
      },
    ],
    dayLimit: 7,
  };

  // ボーナスゴールド
  const promotionBonusGold = 500;

  // テスト用のアーティファクト選択肢
  const artifactChoices = ['artifact_1', 'artifact_2', 'artifact_3'];

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

    // 初期状態を設定（Gランク、試験中）
    const playerState = stateManager.getPlayerState();
    stateManager.updatePlayerState({
      ...playerState,
      rank: GuildRank.G,
      gold: 100,
      artifacts: [],
    });

    // ゲーム状態を設定（試験中、残り3日）
    const gameState = stateManager.getGameState();
    stateManager.updateGameState({
      ...gameState,
      currentPhase: GamePhase.DELIVERY,
      currentDay: 5,
      isInPromotionTest: true,
      promotionTestDaysRemaining: 3,
    });

    // テスト用ランクを取得する関数
    const getRankData = (rank: GuildRank): Rank => {
      return createTestRank(rank, testPromotionTest);
    };

    // 試験課題（納品対象アイテム）を取得する関数
    const getPromotionTestRequirements = () => testPromotionTest.requirements;

    // ユースケースを生成
    judgePromotionTestUseCase = createJudgePromotionTestUseCase(
      stateManager,
      eventBus,
      getRankData,
      getPromotionTestRequirements,
      promotionBonusGold,
      artifactChoices
    );
  });

  describe('課題達成判定', () => {
    it('課題達成で試験合格', async () => {
      // 課題を達成できるアイテムをインベントリに追加
      const inventoryState = stateManager.getInventoryState();
      const item1 = createTestCraftedItem('crafted_1', 'item_potion', 'ポーション', Quality.B);
      const item2 = createTestCraftedItem('crafted_2', 'item_potion', 'ポーション', Quality.A);
      stateManager.updateInventoryState({
        ...inventoryState,
        items: [item1, item2],
      });

      const result = await judgePromotionTestUseCase.execute();

      expect(result.success).toBe(true);
      expect(result.passed).toBe(true);
    });

    it('合格時にランクアップ', async () => {
      // 課題を達成できるアイテムをインベントリに追加
      const inventoryState = stateManager.getInventoryState();
      const item1 = createTestCraftedItem('crafted_1', 'item_potion', 'ポーション', Quality.B);
      const item2 = createTestCraftedItem('crafted_2', 'item_potion', 'ポーション', Quality.A);
      stateManager.updateInventoryState({
        ...inventoryState,
        items: [item1, item2],
      });

      await judgePromotionTestUseCase.execute();

      const playerState = stateManager.getPlayerState();
      expect(playerState.rank).toBe(GuildRank.F);
    });

    it('合格時にボーナスゴールド獲得', async () => {
      // 課題を達成できるアイテムをインベントリに追加
      const initialGold = stateManager.getPlayerState().gold;
      const inventoryState = stateManager.getInventoryState();
      const item1 = createTestCraftedItem('crafted_1', 'item_potion', 'ポーション', Quality.B);
      const item2 = createTestCraftedItem('crafted_2', 'item_potion', 'ポーション', Quality.A);
      stateManager.updateInventoryState({
        ...inventoryState,
        items: [item1, item2],
      });

      await judgePromotionTestUseCase.execute();

      const playerState = stateManager.getPlayerState();
      expect(playerState.gold).toBe(initialGold + promotionBonusGold);
    });

    it('合格時にアーティファクト選択肢を表示', async () => {
      // 課題を達成できるアイテムをインベントリに追加
      const inventoryState = stateManager.getInventoryState();
      const item1 = createTestCraftedItem('crafted_1', 'item_potion', 'ポーション', Quality.B);
      const item2 = createTestCraftedItem('crafted_2', 'item_potion', 'ポーション', Quality.A);
      stateManager.updateInventoryState({
        ...inventoryState,
        items: [item1, item2],
      });

      const result = await judgePromotionTestUseCase.execute();

      expect(result.artifactChoices).toBeDefined();
      expect(result.artifactChoices).toHaveLength(3);
      expect(result.artifactChoices).toContain('artifact_1');
    });
  });

  describe('試験失敗', () => {
    it('制限日数超過で試験失敗', async () => {
      // 試験残り日数を0に設定
      const gameState = stateManager.getGameState();
      stateManager.updateGameState({
        ...gameState,
        promotionTestDaysRemaining: 0,
      });

      const result = await judgePromotionTestUseCase.execute();

      expect(result.success).toBe(true);
      expect(result.passed).toBe(false);
      expect(result.reason).toBe('TIME_LIMIT_EXCEEDED');
    });

    it('失敗時はゲームオーバー', async () => {
      // 試験残り日数を0に設定
      const gameState = stateManager.getGameState();
      stateManager.updateGameState({
        ...gameState,
        promotionTestDaysRemaining: 0,
      });

      await judgePromotionTestUseCase.execute();

      const updatedGameState = stateManager.getGameState();
      expect(updatedGameState.gameProgress).toBe(GameProgress.GAME_OVER);
    });
  });

  describe('試験中でない場合', () => {
    it('試験中でない場合はエラー', async () => {
      // 試験中でない状態に設定
      const gameState = stateManager.getGameState();
      stateManager.updateGameState({
        ...gameState,
        isInPromotionTest: false,
        promotionTestDaysRemaining: null,
      });

      const result = await judgePromotionTestUseCase.execute();

      expect(result.success).toBe(false);
      expect(result.error).toBe('NOT_IN_TEST');
    });
  });

  describe('イベント発行', () => {
    it('合格時にRANK_UPイベントが発行される', async () => {
      const eventHandler = vi.fn();
      eventBus.subscribe(GameEventType.RANK_UP, eventHandler);

      // 課題を達成できるアイテムをインベントリに追加
      const inventoryState = stateManager.getInventoryState();
      const item1 = createTestCraftedItem('crafted_1', 'item_potion', 'ポーション', Quality.B);
      const item2 = createTestCraftedItem('crafted_2', 'item_potion', 'ポーション', Quality.A);
      stateManager.updateInventoryState({
        ...inventoryState,
        items: [item1, item2],
      });

      await judgePromotionTestUseCase.execute();

      expect(eventHandler).toHaveBeenCalled();
      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: GameEventType.RANK_UP,
          payload: expect.objectContaining({
            newRank: GuildRank.F,
          }),
        })
      );
    });

    it('失敗時にGAME_OVERイベントが発行される', async () => {
      const eventHandler = vi.fn();
      eventBus.subscribe(GameEventType.GAME_OVER, eventHandler);

      // 試験残り日数を0に設定
      const gameState = stateManager.getGameState();
      stateManager.updateGameState({
        ...gameState,
        promotionTestDaysRemaining: 0,
      });

      await judgePromotionTestUseCase.execute();

      expect(eventHandler).toHaveBeenCalled();
      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: GameEventType.GAME_OVER,
          payload: expect.objectContaining({
            reason: expect.stringContaining('昇格試験'),
          }),
        })
      );
    });
  });
});
