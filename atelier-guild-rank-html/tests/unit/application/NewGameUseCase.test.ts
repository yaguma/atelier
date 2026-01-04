/**
 * NewGameUseCaseテスト
 * TASK-0104: ニューゲームユースケース
 *
 * 新規ゲーム開始時の初期化処理をテストする
 */

import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import {
  NewGameUseCase,
  createNewGameUseCase,
  NewGameResult,
} from '@application/NewGameUseCase';
import { StateManager, createStateManager } from '@application/StateManager';
import { GameFlowManager, createGameFlowManager } from '@application/GameFlowManager';
import { EventBus, createEventBus, GameEventType } from '@domain/events/GameEvents';
import { ISaveDataRepository } from '@infrastructure/repository/ISaveDataRepository';
import { ISaveData } from '@domain/save/SaveData';
import { GamePhase, GuildRank } from '@domain/common/types';
import { DeckService } from '@domain/services/DeckService';

describe('NewGameUseCase', () => {
  let newGameUseCase: NewGameUseCase;
  let stateManager: StateManager;
  let gameFlowManager: GameFlowManager;
  let eventBus: EventBus;
  let mockSaveRepository: ISaveDataRepository;
  let deckService: DeckService;

  beforeEach(() => {
    // イベントバスを生成
    eventBus = createEventBus();
    // ステートマネージャーを生成
    stateManager = createStateManager();
    // ゲームフローマネージャーを生成
    gameFlowManager = createGameFlowManager(eventBus);
    // デッキサービスを生成
    deckService = new DeckService();
    // モックリポジトリを生成
    mockSaveRepository = {
      create: vi.fn(),
      load: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      exists: vi.fn().mockReturnValue(false),
      getVersion: vi.fn(),
    };

    // ユースケースを生成
    newGameUseCase = createNewGameUseCase(
      stateManager,
      gameFlowManager,
      mockSaveRepository,
      eventBus,
      deckService
    );
  });

  describe('新規ゲーム開始', () => {
    it('新規ゲームを開始できる', async () => {
      const result = await newGameUseCase.execute();

      expect(result.success).toBe(true);
    });

    it('初期ランク（G）が設定される', async () => {
      await newGameUseCase.execute();

      const playerState = stateManager.getPlayerState();
      expect(playerState.rank).toBe(GuildRank.G);
    });

    it('初期ゴールド（100G）が設定される', async () => {
      await newGameUseCase.execute();

      const playerState = stateManager.getPlayerState();
      expect(playerState.gold).toBe(100);
    });

    it('初期日数（1日目）が設定される', async () => {
      await newGameUseCase.execute();

      const gameState = stateManager.getGameState();
      expect(gameState.currentDay).toBe(1);
    });

    it('初期フェーズ（QUEST_ACCEPT）が設定される', async () => {
      await newGameUseCase.execute();

      const gameState = stateManager.getGameState();
      expect(gameState.currentPhase).toBe(GamePhase.QUEST_ACCEPT);
    });

    it('初期行動ポイント（3）が設定される', async () => {
      await newGameUseCase.execute();

      const playerState = stateManager.getPlayerState();
      expect(playerState.actionPoints).toBe(3);
    });
  });

  describe('初期デッキ設定', () => {
    it('初期デッキが設定される', async () => {
      await newGameUseCase.execute();

      const deckState = stateManager.getDeckState();
      // 初期デッキは12枚（採取地4枚 + レシピ2枚 + 強化2枚 = 各種2枚ずつ）
      // DeckServiceのcreateInitialDeckが採取地2種x2枚、レシピ1種x2枚、強化1種x2枚を生成
      const totalCards =
        deckState.cards.length + deckState.hand.length + deckState.discardPile.length;
      expect(totalCards).toBeGreaterThan(0);
    });
  });

  describe('セーブデータ作成', () => {
    it('セーブデータが作成される', async () => {
      await newGameUseCase.execute();

      expect(mockSaveRepository.create).toHaveBeenCalled();
    });

    it('セーブデータにタイムスタンプが記録される', async () => {
      await newGameUseCase.execute();

      const createCall = (mockSaveRepository.create as Mock).mock.calls[0];
      const saveData: ISaveData = createCall[0];
      expect(saveData.lastSaved).toBeDefined();
      // ISO8601形式であることを確認
      expect(new Date(saveData.lastSaved).toISOString()).toBe(saveData.lastSaved);
    });

    it('セーブデータにバージョンが記録される', async () => {
      await newGameUseCase.execute();

      const createCall = (mockSaveRepository.create as Mock).mock.calls[0];
      const saveData: ISaveData = createCall[0];
      expect(saveData.version).toBeDefined();
      expect(saveData.version).toBe('1.0.0');
    });
  });

  describe('既存セーブデータの確認', () => {
    it('既存セーブデータがある場合は上書き確認を要求する', async () => {
      // 既存データがあることを設定
      (mockSaveRepository.exists as Mock).mockReturnValue(true);

      const result = await newGameUseCase.execute();

      // 上書き確認が必要であることを示す
      expect(result.requiresConfirmation).toBe(true);
      // まだセーブデータは作成されない
      expect(mockSaveRepository.create).not.toHaveBeenCalled();
    });

    it('上書き確認後にゲームを開始できる', async () => {
      // 既存データがあることを設定
      (mockSaveRepository.exists as Mock).mockReturnValue(true);

      // まず確認を要求
      const confirmResult = await newGameUseCase.execute();
      expect(confirmResult.requiresConfirmation).toBe(true);

      // 上書きを確認して実行
      const result = await newGameUseCase.execute({ forceOverwrite: true });

      expect(result.success).toBe(true);
      expect(mockSaveRepository.delete).toHaveBeenCalled();
      expect(mockSaveRepository.create).toHaveBeenCalled();
    });
  });

  describe('イベント発行', () => {
    it('ゲーム開始イベントが発行される', async () => {
      const eventHandler = vi.fn();
      eventBus.subscribe(GameEventType.GAME_STARTED, eventHandler);

      await newGameUseCase.execute();

      expect(eventHandler).toHaveBeenCalled();
    });
  });

  describe('初期状態の整合性', () => {
    it('昇格ゲージが0から始まる', async () => {
      await newGameUseCase.execute();

      const playerState = stateManager.getPlayerState();
      expect(playerState.promotionGauge).toBe(0);
    });

    it('ランク維持日数が設定される', async () => {
      await newGameUseCase.execute();

      const playerState = stateManager.getPlayerState();
      // Gランクの初期日数（30日）
      expect(playerState.rankDaysRemaining).toBe(30);
    });

    it('所持アーティファクトが空', async () => {
      await newGameUseCase.execute();

      const playerState = stateManager.getPlayerState();
      expect(playerState.artifacts).toEqual([]);
    });

    it('インベントリが空', async () => {
      await newGameUseCase.execute();

      const inventoryState = stateManager.getInventoryState();
      expect(inventoryState.materials).toEqual([]);
      expect(inventoryState.items).toEqual([]);
    });

    it('クエスト状態が空', async () => {
      await newGameUseCase.execute();

      const questState = stateManager.getQuestState();
      expect(questState.activeQuests).toEqual([]);
      expect(questState.availableQuests).toEqual([]);
    });
  });
});
