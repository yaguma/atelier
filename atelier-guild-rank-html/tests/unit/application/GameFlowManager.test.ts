/**
 * ゲームフローマネージャーのテスト
 * TASK-0102: ゲームフローマネージャー
 *
 * ゲームフロー制御を担当するマネージャーをテストする
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  GameFlowManager,
  createGameFlowManager,
} from '@application/GameFlowManager';
import { createGameState, GameProgress } from '@domain/game/GameState';
import { createPlayerState } from '@domain/player/PlayerState';
import {
  EventBus,
  createEventBus,
  GameEventType,
  PhaseChangedEvent,
  DayAdvancedEvent,
} from '@domain/events/GameEvents';
import { GamePhase, GuildRank } from '@domain/common/types';

describe('GameFlowManager', () => {
  let eventBus: EventBus;
  let manager: GameFlowManager;

  beforeEach(() => {
    eventBus = createEventBus();
    manager = createGameFlowManager(eventBus);
  });

  describe('initializeGame（ゲームを初期化）', () => {
    it('ゲームを初期化できる', () => {
      const { gameState, playerState } = manager.initializeGame();

      expect(gameState).toBeDefined();
      expect(playerState).toBeDefined();
      expect(gameState.currentPhase).toBe(GamePhase.QUEST_ACCEPT);
      expect(gameState.currentDay).toBe(1);
      expect(gameState.gameProgress).toBe(GameProgress.IN_PROGRESS);
    });

    it('初期化時にプレイヤー状態がデフォルト値で生成される', () => {
      const { playerState } = manager.initializeGame();

      expect(playerState.rank).toBe(GuildRank.G);
      expect(playerState.gold).toBe(100);
      expect(playerState.promotionGauge).toBe(0);
      expect(playerState.actionPoints).toBe(3);
    });

    it('カスタム初期値でゲームを初期化できる', () => {
      const { gameState, playerState } = manager.initializeGame({
        initialDay: 5,
        initialGold: 500,
        initialRank: GuildRank.F,
      });

      expect(gameState.currentDay).toBe(5);
      expect(playerState.gold).toBe(500);
      expect(playerState.rank).toBe(GuildRank.F);
    });
  });

  describe('advancePhase（フェーズを順番に進行）', () => {
    it('フェーズを順番に進行できる（QUEST_ACCEPT → GATHERING）', () => {
      manager.initializeGame();

      const newState = manager.advancePhase();

      expect(newState.currentPhase).toBe(GamePhase.GATHERING);
    });

    it('フェーズを順番に進行できる（GATHERING → ALCHEMY）', () => {
      manager.initializeGame();
      manager.advancePhase(); // QUEST_ACCEPT → GATHERING

      const newState = manager.advancePhase();

      expect(newState.currentPhase).toBe(GamePhase.ALCHEMY);
    });

    it('フェーズを順番に進行できる（ALCHEMY → DELIVERY）', () => {
      manager.initializeGame();
      manager.advancePhase(); // QUEST_ACCEPT → GATHERING
      manager.advancePhase(); // GATHERING → ALCHEMY

      const newState = manager.advancePhase();

      expect(newState.currentPhase).toBe(GamePhase.DELIVERY);
    });

    it('フェーズを順番に進行できる（DELIVERY → QUEST_ACCEPT、日数+1）', () => {
      manager.initializeGame();
      manager.advancePhase(); // QUEST_ACCEPT → GATHERING
      manager.advancePhase(); // GATHERING → ALCHEMY
      manager.advancePhase(); // ALCHEMY → DELIVERY

      const newState = manager.advancePhase();

      expect(newState.currentPhase).toBe(GamePhase.QUEST_ACCEPT);
      expect(newState.currentDay).toBe(2);
    });

    it('1サイクル（4フェーズ）を完了できる', () => {
      manager.initializeGame();

      // 4回フェーズを進める
      manager.advancePhase();
      manager.advancePhase();
      manager.advancePhase();
      const finalState = manager.advancePhase();

      expect(finalState.currentPhase).toBe(GamePhase.QUEST_ACCEPT);
      expect(finalState.currentDay).toBe(2);
    });
  });

  describe('フェーズ遷移時のイベント発行', () => {
    it('フェーズ遷移時にPHASE_CHANGEDイベントを発行する', () => {
      manager.initializeGame();
      const eventHandler = vi.fn();
      eventBus.subscribe<PhaseChangedEvent>(
        GameEventType.PHASE_CHANGED,
        eventHandler
      );

      manager.advancePhase();

      expect(eventHandler).toHaveBeenCalledTimes(1);
      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: GameEventType.PHASE_CHANGED,
          payload: expect.objectContaining({
            phase: GamePhase.GATHERING,
          }),
        })
      );
    });

    it('各フェーズ遷移で正しいフェーズが通知される', () => {
      manager.initializeGame();
      const receivedPhases: GamePhase[] = [];
      eventBus.subscribe<PhaseChangedEvent>(
        GameEventType.PHASE_CHANGED,
        (event) => {
          receivedPhases.push(event.payload.phase);
        }
      );

      manager.advancePhase(); // → GATHERING
      manager.advancePhase(); // → ALCHEMY
      manager.advancePhase(); // → DELIVERY
      manager.advancePhase(); // → QUEST_ACCEPT

      expect(receivedPhases).toEqual([
        GamePhase.GATHERING,
        GamePhase.ALCHEMY,
        GamePhase.DELIVERY,
        GamePhase.QUEST_ACCEPT,
      ]);
    });
  });

  describe('日数経過管理', () => {
    it('日数経過を管理できる（DELIVERYからQUEST_ACCEPTへ遷移時に日数+1）', () => {
      manager.initializeGame();
      manager.advancePhase(); // QUEST_ACCEPT → GATHERING
      manager.advancePhase(); // GATHERING → ALCHEMY
      manager.advancePhase(); // ALCHEMY → DELIVERY

      const state = manager.advancePhase(); // DELIVERY → QUEST_ACCEPT (日数+1)

      expect(state.currentDay).toBe(2);
    });

    it('複数日経過後も正しくカウントされる', () => {
      manager.initializeGame();

      // 3日分のサイクルを実行
      for (let i = 0; i < 3; i++) {
        manager.advancePhase(); // → GATHERING
        manager.advancePhase(); // → ALCHEMY
        manager.advancePhase(); // → DELIVERY
        manager.advancePhase(); // → QUEST_ACCEPT (日数+1)
      }

      const state = manager.getGameState();
      expect(state.currentDay).toBe(4);
    });

    it('日数経過時にDAY_ADVANCEDイベントを発行する', () => {
      manager.initializeGame();
      const eventHandler = vi.fn();
      eventBus.subscribe<DayAdvancedEvent>(
        GameEventType.DAY_ADVANCED,
        eventHandler
      );

      manager.advancePhase(); // → GATHERING（イベントなし）
      manager.advancePhase(); // → ALCHEMY（イベントなし）
      manager.advancePhase(); // → DELIVERY（イベントなし）
      manager.advancePhase(); // → QUEST_ACCEPT + 日数+1（イベント発行）

      expect(eventHandler).toHaveBeenCalledTimes(1);
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

  describe('ゲーム終了条件監視', () => {
    it('ゲーム終了条件を監視できる（昇格ゲージ満タン）', () => {
      manager.initializeGame();

      const result = manager.checkEndConditions(
        createPlayerState({
          promotionGauge: 100,
          promotionGaugeMax: 100,
          rank: GuildRank.F,
        })
      );

      expect(result.shouldTriggerPromotion).toBe(true);
    });

    it('ゲーム終了条件を監視できる（ランク維持日数0）', () => {
      manager.initializeGame();

      const result = manager.checkEndConditions(
        createPlayerState({
          rankDaysRemaining: 0,
        })
      );

      expect(result.isGameOver).toBe(true);
      expect(result.gameOverReason).toBe('RANK_DAYS_EXPIRED');
    });

    it('ゲーム終了条件を監視できる（Sランク到達）', () => {
      manager.initializeGame();

      const result = manager.checkEndConditions(
        createPlayerState({
          rank: GuildRank.S,
        })
      );

      expect(result.isGameClear).toBe(true);
    });

    it('終了条件がない場合は続行', () => {
      manager.initializeGame();

      const result = manager.checkEndConditions(
        createPlayerState({
          rank: GuildRank.G,
          rankDaysRemaining: 30,
          promotionGauge: 50,
          promotionGaugeMax: 100,
        })
      );

      expect(result.isGameOver).toBe(false);
      expect(result.isGameClear).toBe(false);
      expect(result.shouldTriggerPromotion).toBe(false);
    });
  });

  describe('昇格試験モード', () => {
    it('昇格試験モードに切り替えできる', () => {
      manager.initializeGame();

      const state = manager.startPromotionTest(5);

      expect(state.isInPromotionTest).toBe(true);
      expect(state.promotionTestDaysRemaining).toBe(5);
    });

    it('昇格試験中は試験日数が減少する', () => {
      manager.initializeGame();
      manager.startPromotionTest(5);

      // 1日分のサイクルを実行
      manager.advancePhase(); // → GATHERING
      manager.advancePhase(); // → ALCHEMY
      manager.advancePhase(); // → DELIVERY
      const state = manager.advancePhase(); // → QUEST_ACCEPT (日数+1、試験日数-1)

      expect(state.promotionTestDaysRemaining).toBe(4);
    });

    it('昇格試験を終了できる', () => {
      manager.initializeGame();
      manager.startPromotionTest(5);

      const state = manager.endPromotionTest();

      expect(state.isInPromotionTest).toBe(false);
      expect(state.promotionTestDaysRemaining).toBeNull();
    });

    it('昇格試験開始時にRANK_UP_TEST_STARTEDイベントを発行する', () => {
      manager.initializeGame();
      const eventHandler = vi.fn();
      eventBus.subscribe(GameEventType.RANK_UP_TEST_STARTED, eventHandler);

      manager.startPromotionTest(5, GuildRank.G, GuildRank.F);

      expect(eventHandler).toHaveBeenCalledTimes(1);
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

  describe('getGameState（現在のゲーム状態取得）', () => {
    it('現在のゲーム状態を取得できる', () => {
      manager.initializeGame();

      const state = manager.getGameState();

      expect(state).toBeDefined();
      expect(state.currentPhase).toBe(GamePhase.QUEST_ACCEPT);
    });

    it('初期化前は例外をスローする', () => {
      expect(() => manager.getGameState()).toThrow('Game not initialized');
    });
  });

  describe('getPlayerState（現在のプレイヤー状態取得）', () => {
    it('現在のプレイヤー状態を取得できる', () => {
      manager.initializeGame();

      const state = manager.getPlayerState();

      expect(state).toBeDefined();
      expect(state.rank).toBe(GuildRank.G);
    });

    it('初期化前は例外をスローする', () => {
      expect(() => manager.getPlayerState()).toThrow('Game not initialized');
    });
  });

  describe('setGameState（ゲーム状態設定）', () => {
    it('ゲーム状態を設定できる', () => {
      manager.initializeGame();
      const newState = createGameState({
        currentPhase: GamePhase.ALCHEMY,
        currentDay: 10,
      });

      manager.setGameState(newState);

      expect(manager.getGameState().currentPhase).toBe(GamePhase.ALCHEMY);
      expect(manager.getGameState().currentDay).toBe(10);
    });
  });

  describe('setPlayerState（プレイヤー状態設定）', () => {
    it('プレイヤー状態を設定できる', () => {
      manager.initializeGame();
      const newState = createPlayerState({
        rank: GuildRank.A,
        gold: 5000,
      });

      manager.setPlayerState(newState);

      expect(manager.getPlayerState().rank).toBe(GuildRank.A);
      expect(manager.getPlayerState().gold).toBe(5000);
    });
  });
});
