/**
 * Application層連携 統合テスト
 *
 * TASK-0254: Application層連携テスト
 * EventBus-UseCase連携、StateManager、GameFlowManagerの統合テスト。
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EventBus } from '@game/events/EventBus';
import {
  PhaserStateManager,
  resetPhaserStateManager,
} from '@game/state/PhaserStateManager';
import { StateSelectors } from '@game/state/StateSelectors';
import {
  PhaserGameFlowManager,
  resetPhaserGameFlowManager,
  type ISceneManager,
} from '@game/flow/PhaserGameFlowManager';
import { createStateManager, type StateManager } from '@application/StateManager';
import { createGameState } from '@domain/game/GameState';
import { createPlayerState } from '@domain/player/PlayerState';
import { GamePhase } from '@domain/common/types';
import { SceneKeys } from '@game/config/SceneKeys';

describe('Application層連携 統合テスト', () => {
  let applicationStateManager: StateManager;
  let phaserStateManager: PhaserStateManager;
  let eventBus: EventBus;
  let flowManager: PhaserGameFlowManager;
  let selectors: StateSelectors;
  let mockSceneManager: ISceneManager;

  beforeEach(() => {
    // EventBusのシングルトンをリセット
    EventBus.resetInstance();
    eventBus = EventBus.getInstance();

    // StateManager作成
    applicationStateManager = createStateManager();

    // PhaserStateManager作成
    phaserStateManager = new PhaserStateManager({
      stateManager: applicationStateManager,
      eventBus,
    });
    phaserStateManager.initialize();

    // StateSelectors作成
    selectors = new StateSelectors(phaserStateManager);

    // モックシーンマネージャー
    mockSceneManager = {
      switchTo: vi.fn(),
      getCurrentSceneKey: vi.fn().mockReturnValue(SceneKeys.MAIN),
    };

    // PhaserGameFlowManager作成
    flowManager = new PhaserGameFlowManager({
      stateManager: phaserStateManager,
      sceneManager: mockSceneManager,
      eventBus,
    });
    flowManager.initialize();
  });

  afterEach(() => {
    resetPhaserGameFlowManager();
    resetPhaserStateManager();
    EventBus.resetInstance();
  });

  // ========================================
  // EventBus-StateManager連携テスト
  // ========================================
  describe('EventBus-StateManager連携', () => {
    describe('状態更新→イベント発火', () => {
      it('プレイヤーゴールド更新でgold:changedイベントが発火する', () => {
        const listener = vi.fn();
        eventBus.on('state:gold:changed', listener);

        phaserStateManager.updatePlayerState({
          ...createPlayerState(),
          gold: 500,
        });

        expect(listener).toHaveBeenCalledWith({
          gold: 500,
          delta: 400, // 500 - 100
        });
      });

      it('フェーズ更新でphase:changedイベントが発火する', () => {
        const listener = vi.fn();
        eventBus.on('state:phase:changed', listener);

        phaserStateManager.updateGameState({
          ...createGameState(),
          currentPhase: GamePhase.GATHERING,
        });

        expect(listener).toHaveBeenCalledWith({
          phase: GamePhase.GATHERING,
          previousPhase: GamePhase.QUEST_ACCEPT,
        });
      });

      it('ランク更新でrank:changedイベントが発火する', () => {
        const listener = vi.fn();
        eventBus.on('state:rank:changed', listener);

        phaserStateManager.updatePlayerState({
          ...createPlayerState(),
          rank: 'F',
        });

        expect(listener).toHaveBeenCalledWith({
          rank: 'F',
          previousRank: 'G',
        });
      });

      it('AP更新でap:changedイベントが発火する', () => {
        const listener = vi.fn();
        eventBus.on('state:ap:changed', listener);

        phaserStateManager.updatePlayerState({
          ...createPlayerState(),
          actionPoints: 1,
          actionPointsMax: 3,
        });

        expect(listener).toHaveBeenCalledWith({
          ap: 1,
          maxAP: 3,
        });
      });

      it('日数更新でday:changedイベントが発火する', () => {
        const listener = vi.fn();
        eventBus.on('state:day:changed', listener);

        phaserStateManager.updateGameState({
          ...createGameState(),
          currentDay: 5,
        });

        expect(listener).toHaveBeenCalled();
        expect(listener).toHaveBeenCalledWith(
          expect.objectContaining({
            day: 5,
          })
        );
      });
    });

    describe('複数イベントの連携', () => {
      it('状態更新で複数のイベントが発火する', () => {
        const goldListener = vi.fn();
        const apListener = vi.fn();
        eventBus.on('state:gold:changed', goldListener);
        eventBus.on('state:ap:changed', apListener);

        // ゴールドとAPを同時に更新
        phaserStateManager.updatePlayerState({
          ...createPlayerState(),
          gold: 200,
          actionPoints: 2,
        });

        expect(goldListener).toHaveBeenCalled();
        expect(apListener).toHaveBeenCalled();
      });
    });
  });

  // ========================================
  // StateSelectors連携テスト
  // ========================================
  describe('StateSelectors連携', () => {
    describe('派生値の計算', () => {
      it('canAffordが正しく判定される', () => {
        expect(selectors.canAfford(100)).toBe(true);
        expect(selectors.canAfford(101)).toBe(false);
      });

      it('hasEnoughAPが正しく判定される', () => {
        expect(selectors.hasEnoughAP(3)).toBe(true);
        expect(selectors.hasEnoughAP(4)).toBe(false);
      });

      it('状態更新後にセレクタの値が更新される', () => {
        expect(selectors.canAfford(200)).toBe(false);

        phaserStateManager.updatePlayerState({
          ...createPlayerState(),
          gold: 300,
        });

        expect(selectors.canAfford(200)).toBe(true);
      });
    });

    describe('ゲーム状態の判定', () => {
      it('isGameOverが正しく判定される', () => {
        expect(selectors.isGameOver()).toBe(false);

        phaserStateManager.updatePlayerState({
          ...createPlayerState(),
          rankDaysRemaining: 0,
        });

        expect(selectors.isGameOver()).toBe(true);
      });

      it('isGameClearが正しく判定される', () => {
        expect(selectors.isGameClear()).toBe(false);

        phaserStateManager.updatePlayerState({
          ...createPlayerState(),
          rank: 'S',
        });

        expect(selectors.isGameClear()).toBe(true);
      });
    });
  });

  // ========================================
  // GameFlowManager連携テスト
  // ========================================
  describe('GameFlowManager連携', () => {
    describe('フェーズ進行とイベント', () => {
      it('フェーズ進行でEventBusに通知される', async () => {
        const listener = vi.fn();
        eventBus.on('state:phase:changed', listener);

        await flowManager.advancePhase();

        expect(listener).toHaveBeenCalledWith({
          phase: GamePhase.GATHERING,
          previousPhase: GamePhase.QUEST_ACCEPT,
        });
      });

      it('フェーズ進行でStateManagerの状態が更新される', async () => {
        await flowManager.advancePhase();

        expect(phaserStateManager.getGameState().currentPhase).toBe(
          GamePhase.GATHERING
        );
      });

      it('全フェーズを経由してターン終了できる', async () => {
        expect(flowManager.getCurrentPhase()).toBe(GamePhase.QUEST_ACCEPT);

        await flowManager.advancePhase();
        expect(flowManager.getCurrentPhase()).toBe(GamePhase.GATHERING);

        await flowManager.advancePhase();
        expect(flowManager.getCurrentPhase()).toBe(GamePhase.ALCHEMY);

        await flowManager.advancePhase();
        expect(flowManager.getCurrentPhase()).toBe(GamePhase.DELIVERY);

        await flowManager.advancePhase();
        // ターン終了後はQUEST_ACCEPTに戻る
        expect(flowManager.getCurrentPhase()).toBe(GamePhase.QUEST_ACCEPT);
      });
    });

    describe('ターン終了とイベント', () => {
      it('ターン終了でday:changedイベントが発火する', async () => {
        const listener = vi.fn();
        eventBus.on('state:day:changed', listener);

        await flowManager.endTurn();

        expect(listener).toHaveBeenCalled();
      });

      it('ターン終了でAPが回復する', async () => {
        phaserStateManager.updatePlayerState({
          ...createPlayerState(),
          actionPoints: 0,
          actionPointsMax: 3,
        });

        await flowManager.endTurn();

        expect(phaserStateManager.getPlayerState().actionPoints).toBe(3);
      });

      it('ターン終了で残り日数が減る', async () => {
        const initialRemaining =
          phaserStateManager.getPlayerState().rankDaysRemaining;

        await flowManager.endTurn();

        expect(phaserStateManager.getPlayerState().rankDaysRemaining).toBe(
          initialRemaining - 1
        );
      });
    });

    describe('ゲーム終了判定', () => {
      it('残り日数が0になるとゲームオーバーシーンに遷移する', async () => {
        phaserStateManager.updatePlayerState({
          ...createPlayerState(),
          rankDaysRemaining: 1,
        });

        await flowManager.endTurn();

        expect(mockSceneManager.switchTo).toHaveBeenCalledWith(
          SceneKeys.GAME_OVER,
          expect.anything()
        );
      });

      it('Sランクになるとゲームクリアシーンに遷移する', async () => {
        phaserStateManager.updatePlayerState({
          ...createPlayerState(),
          rank: 'S',
        });

        await flowManager.endTurn();

        expect(mockSceneManager.switchTo).toHaveBeenCalledWith(
          SceneKeys.GAME_CLEAR,
          expect.anything()
        );
      });
    });
  });

  // ========================================
  // UIイベント→アプリケーション層連携テスト
  // ========================================
  describe('UIイベント→アプリケーション層連携', () => {
    describe('フェーズ完了イベント', () => {
      it('ui:questPhase:completedでフェーズが進む', async () => {
        eventBus.emitVoid('ui:questPhase:completed');

        // イベントループを待つ
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(flowManager.getCurrentPhase()).toBe(GamePhase.GATHERING);
      });

      it('ui:gathering:skippedでフェーズが進む', async () => {
        // GATHERINGフェーズに設定
        await flowManager.transitionToPhase(GamePhase.GATHERING);

        eventBus.emitVoid('ui:gathering:skipped');

        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(flowManager.getCurrentPhase()).toBe(GamePhase.ALCHEMY);
      });

      it('ui:alchemy:skippedでフェーズが進む', async () => {
        // ALCHEMYフェーズに設定
        await flowManager.transitionToPhase(GamePhase.ALCHEMY);

        eventBus.emitVoid('ui:alchemy:skipped');

        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(flowManager.getCurrentPhase()).toBe(GamePhase.DELIVERY);
      });
    });

    describe('ゲーム制御イベント', () => {
      it('game:restartで状態がリセットされる', async () => {
        // 状態を変更
        phaserStateManager.updatePlayerState({
          ...createPlayerState(),
          gold: 9999,
        });

        eventBus.emitVoid('game:restart');

        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(phaserStateManager.getPlayerState().gold).toBe(100);
      });

      it('ui:dayEnd:confirmedでターン終了する', async () => {
        const initialDay = phaserStateManager.getGameState().currentDay;

        eventBus.emitVoid('ui:dayEnd:confirmed');

        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(phaserStateManager.getGameState().currentDay).toBe(
          initialDay + 1
        );
      });
    });
  });

  // ========================================
  // シリアライズ・デシリアライズ連携テスト
  // ========================================
  describe('シリアライズ・デシリアライズ連携', () => {
    it('状態を正しくシリアライズできる', () => {
      phaserStateManager.updatePlayerState({
        ...createPlayerState(),
        gold: 1500,
        rank: 'D',
      });
      phaserStateManager.updateGameState({
        ...createGameState(),
        currentDay: 5,
      });

      const serialized = phaserStateManager.serialize();
      const parsed = JSON.parse(serialized);

      expect(parsed.playerState.gold).toBe(1500);
      expect(parsed.playerState.rank).toBe('D');
      expect(parsed.gameState.currentDay).toBe(5);
    });

    it('状態を正しくデシリアライズできる', () => {
      // 状態を変更してシリアライズ
      phaserStateManager.updatePlayerState({
        ...createPlayerState(),
        gold: 5000,
        rank: 'C',
      });
      phaserStateManager.updateGameState({
        ...createGameState(),
        currentDay: 10,
        currentPhase: GamePhase.ALCHEMY,
      });

      const serialized = phaserStateManager.serialize();

      // リセット
      phaserStateManager.reset();
      expect(phaserStateManager.getPlayerState().gold).toBe(100);

      // デシリアライズ
      phaserStateManager.deserialize(serialized);

      expect(phaserStateManager.getPlayerState().gold).toBe(5000);
      expect(phaserStateManager.getPlayerState().rank).toBe('C');
      expect(phaserStateManager.getGameState().currentDay).toBe(10);
      expect(phaserStateManager.getGameState().currentPhase).toBe(
        GamePhase.ALCHEMY
      );
    });

    it('ロード後にセレクタが正しい値を返す', async () => {
      // 状態を変更してシリアライズ
      phaserStateManager.updatePlayerState({
        ...createPlayerState(),
        gold: 3000,
        rank: 'A',
      });

      const serialized = phaserStateManager.serialize();

      // リセット
      phaserStateManager.reset();

      // ロード
      await flowManager.loadGame(serialized);

      expect(selectors.canAfford(2000)).toBe(true);
    });
  });

  // ========================================
  // 統計記録連携テスト
  // ========================================
  describe('統計記録連携', () => {
    it('統計がターン終了でリセットされる', async () => {
      flowManager.recordQuestComplete();
      flowManager.recordItemCrafted();
      flowManager.recordGoldEarned(500);

      let stats = flowManager.getDayStats();
      expect(stats.questsCompleted).toBe(1);
      expect(stats.itemsCrafted).toBe(1);
      expect(stats.goldEarned).toBe(500);

      await flowManager.endTurn();

      stats = flowManager.getDayStats();
      expect(stats.questsCompleted).toBe(0);
      expect(stats.itemsCrafted).toBe(0);
      expect(stats.goldEarned).toBe(0);
    });
  });

  // ========================================
  // エラーハンドリング連携テスト
  // ========================================
  describe('エラーハンドリング連携', () => {
    it('無効なセーブデータでエラーが発生する', () => {
      expect(() => {
        phaserStateManager.deserialize('invalid json');
      }).toThrow('Invalid save data');
    });

    it('シーンマネージャーなしでもゲームオーバー処理ができる', async () => {
      // シーンマネージャーなしのFlowManagerを作成
      const flowManagerNoScene = new PhaserGameFlowManager({
        stateManager: phaserStateManager,
        eventBus,
      });
      flowManagerNoScene.initialize();

      phaserStateManager.updatePlayerState({
        ...createPlayerState(),
        rankDaysRemaining: 1,
      });

      // エラーなく実行できることを確認
      await expect(flowManagerNoScene.endTurn()).resolves.not.toThrow();

      flowManagerNoScene.destroy();
    });
  });

  // ========================================
  // 複合シナリオテスト
  // ========================================
  describe('複合シナリオ', () => {
    it('完全な1ターンの流れが正しく動作する', async () => {
      const phaseChangedListener = vi.fn();
      const dayChangedListener = vi.fn();
      eventBus.on('state:phase:changed', phaseChangedListener);
      eventBus.on('state:day:changed', dayChangedListener);

      // QUEST_ACCEPT → GATHERING
      await flowManager.advancePhase();
      expect(flowManager.getCurrentPhase()).toBe(GamePhase.GATHERING);

      // 採取で統計記録
      flowManager.recordGoldEarned(100);

      // GATHERING → ALCHEMY
      await flowManager.advancePhase();
      expect(flowManager.getCurrentPhase()).toBe(GamePhase.ALCHEMY);

      // 調合で統計記録
      flowManager.recordItemCrafted();

      // ALCHEMY → DELIVERY
      await flowManager.advancePhase();
      expect(flowManager.getCurrentPhase()).toBe(GamePhase.DELIVERY);

      // 納品で統計記録
      flowManager.recordQuestComplete();

      // DELIVERY → ターン終了 → QUEST_ACCEPT
      const initialDay = phaserStateManager.getGameState().currentDay;
      await flowManager.advancePhase();

      // 状態確認
      expect(flowManager.getCurrentPhase()).toBe(GamePhase.QUEST_ACCEPT);
      expect(phaserStateManager.getGameState().currentDay).toBe(initialDay + 1);
      expect(dayChangedListener).toHaveBeenCalled();

      // 統計がリセットされている
      const stats = flowManager.getDayStats();
      expect(stats.questsCompleted).toBe(0);
      expect(stats.itemsCrafted).toBe(0);
      expect(stats.goldEarned).toBe(0);
    });

    it('ゲーム開始からクリアまでのフロー', async () => {
      const gameChangedListener = vi.fn();
      eventBus.on('state:game:changed', gameChangedListener);

      // 新規ゲーム開始
      await flowManager.startNewGame();
      expect(gameChangedListener).toHaveBeenCalledWith({ state: 'playing' });

      // Sランクに昇格
      phaserStateManager.updatePlayerState({
        ...phaserStateManager.getPlayerState(),
        rank: 'S',
      });

      // ターン終了でクリア判定
      await flowManager.endTurn();

      expect(gameChangedListener).toHaveBeenCalledWith({ state: 'gameClear' });
      expect(mockSceneManager.switchTo).toHaveBeenCalledWith(
        SceneKeys.GAME_CLEAR,
        expect.anything()
      );
    });
  });
});
