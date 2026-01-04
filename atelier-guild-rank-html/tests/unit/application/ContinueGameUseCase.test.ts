/**
 * ContinueGameUseCaseテスト
 * TASK-0105: ゲーム再開ユースケース
 *
 * セーブデータからゲームを再開する処理をテストする
 */

import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import {
  ContinueGameUseCase,
  createContinueGameUseCase,
  ContinueGameResult,
} from '@application/ContinueGameUseCase';
import { StateManager, createStateManager } from '@application/StateManager';
import { GameFlowManager, createGameFlowManager } from '@application/GameFlowManager';
import { EventBus, createEventBus, GameEventType } from '@domain/events/GameEvents';
import { ISaveDataRepository } from '@infrastructure/repository/ISaveDataRepository';
import { ISaveData } from '@domain/save/SaveData';
import { GamePhase, GuildRank } from '@domain/common/types';

describe('ContinueGameUseCase', () => {
  let continueGameUseCase: ContinueGameUseCase;
  let stateManager: StateManager;
  let gameFlowManager: GameFlowManager;
  let eventBus: EventBus;
  let mockSaveRepository: ISaveDataRepository;

  // テスト用のセーブデータ
  const mockSaveData: ISaveData = {
    version: '1.0.0',
    lastSaved: '2026-01-01T00:00:00.000Z',
    gameState: {
      currentRank: GuildRank.F,
      promotionGauge: 50,
      requiredContribution: 100,
      remainingDays: 25,
      currentDay: 5,
      currentPhase: GamePhase.GATHERING,
      gold: 500,
      comboCount: 2,
      actionPoints: 2,
      isPromotionTest: false,
      promotionTestRemainingDays: null,
    },
    deckState: {
      deck: ['card1', 'card2', 'card3'],
      hand: ['card4', 'card5'],
      discard: ['card6'],
      ownedCards: ['card1', 'card2', 'card3', 'card4', 'card5', 'card6'],
    },
    inventoryState: {
      materials: [{ materialId: 'herb', quality: 'C', quantity: 5 }],
      craftedItems: [],
      storageLimit: 20,
    },
    questState: {
      activeQuests: [
        { questId: 'quest1', remainingDays: 3, acceptedDay: 3 },
      ],
      todayClients: ['client1', 'client2'],
      questLimit: 3,
    },
    artifacts: ['artifact1'],
  };

  beforeEach(() => {
    // イベントバスを生成
    eventBus = createEventBus();
    // ステートマネージャーを生成
    stateManager = createStateManager();
    // ゲームフローマネージャーを生成
    gameFlowManager = createGameFlowManager(eventBus);
    // モックリポジトリを生成
    mockSaveRepository = {
      create: vi.fn(),
      load: vi.fn().mockReturnValue(mockSaveData),
      save: vi.fn(),
      delete: vi.fn(),
      exists: vi.fn().mockReturnValue(true),
      getVersion: vi.fn().mockReturnValue('1.0.0'),
    };

    // ユースケースを生成
    continueGameUseCase = createContinueGameUseCase(
      stateManager,
      gameFlowManager,
      mockSaveRepository,
      eventBus
    );
  });

  describe('ゲーム再開', () => {
    it('セーブデータからゲームを再開できる', async () => {
      const result = await continueGameUseCase.execute();

      expect(result.success).toBe(true);
    });

    it('セーブデータがない場合はエラー', async () => {
      (mockSaveRepository.exists as Mock).mockReturnValue(false);
      (mockSaveRepository.load as Mock).mockReturnValue(null);

      const result = await continueGameUseCase.execute();

      expect(result.success).toBe(false);
      expect(result.error).toBe('NO_SAVE_DATA');
    });
  });

  describe('状態の復元', () => {
    it('ゲーム状態が正しく復元される', async () => {
      await continueGameUseCase.execute();

      const gameState = stateManager.getGameState();
      expect(gameState.currentDay).toBe(5);
      expect(gameState.currentPhase).toBe(GamePhase.GATHERING);
    });

    it('プレイヤー状態が正しく復元される', async () => {
      await continueGameUseCase.execute();

      const playerState = stateManager.getPlayerState();
      expect(playerState.rank).toBe(GuildRank.F);
      expect(playerState.gold).toBe(500);
      expect(playerState.promotionGauge).toBe(50);
      expect(playerState.rankDaysRemaining).toBe(25);
      expect(playerState.actionPoints).toBe(2);
    });

    it('フェーズが正しく復元される', async () => {
      await continueGameUseCase.execute();

      const gameState = stateManager.getGameState();
      expect(gameState.currentPhase).toBe(GamePhase.GATHERING);
    });

    it('アーティファクトが正しく復元される', async () => {
      await continueGameUseCase.execute();

      const playerState = stateManager.getPlayerState();
      expect(playerState.artifacts).toContain('artifact1');
    });
  });

  describe('イベント発行', () => {
    it('ゲーム再開イベントが発行される', async () => {
      const eventHandler = vi.fn();
      eventBus.subscribe(GameEventType.GAME_CONTINUED, eventHandler);

      await continueGameUseCase.execute();

      expect(eventHandler).toHaveBeenCalled();
    });
  });

  describe('バージョン互換性', () => {
    it('互換性のあるバージョンのセーブデータを読み込める', async () => {
      const result = await continueGameUseCase.execute();

      expect(result.success).toBe(true);
    });

    it('セーブデータが破損している場合はエラー', async () => {
      (mockSaveRepository.load as Mock).mockReturnValue(null);

      const result = await continueGameUseCase.execute();

      expect(result.success).toBe(false);
      expect(result.error).toBe('NO_SAVE_DATA');
    });
  });
});
