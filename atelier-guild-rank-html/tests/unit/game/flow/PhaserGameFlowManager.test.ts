/**
 * PhaserGameFlowManager テスト
 *
 * TASK-0253: GameFlowManager Phaser連携実装
 * PhaserGameFlowManagerの機能テスト。
 * - フェーズ進行
 * - ターン終了
 * - ゲームオーバー/クリア判定
 * - イベント連携
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  PhaserGameFlowManager,
  resetPhaserGameFlowManager,
  type ISceneManager,
} from '@game/flow/PhaserGameFlowManager';
import {
  PhaserStateManager,
  resetPhaserStateManager,
} from '@game/state/PhaserStateManager';
import { createStateManager, type StateManager } from '@application/StateManager';
import { createGameState } from '@domain/game/GameState';
import { createPlayerState } from '@domain/player/PlayerState';
import { EventBus } from '@game/events/EventBus';
import { GamePhase } from '@domain/common/types';
import { SceneKeys } from '@game/config/SceneKeys';

describe('PhaserGameFlowManager', () => {
  let stateManager: StateManager;
  let phaserStateManager: PhaserStateManager;
  let eventBus: EventBus;
  let flowManager: PhaserGameFlowManager;
  let mockSceneManager: ISceneManager;

  beforeEach(() => {
    // EventBusのシングルトンをリセット
    EventBus.resetInstance();
    eventBus = EventBus.getInstance();

    // StateManagerを作成
    stateManager = createStateManager();

    // PhaserStateManagerを作成
    phaserStateManager = new PhaserStateManager({
      stateManager,
      eventBus,
    });

    // モックシーンマネージャー
    mockSceneManager = {
      switchTo: vi.fn(),
      getCurrentSceneKey: vi.fn().mockReturnValue(SceneKeys.MAIN),
    };

    // PhaserGameFlowManagerを作成
    flowManager = new PhaserGameFlowManager({
      stateManager: phaserStateManager,
      sceneManager: mockSceneManager,
      eventBus,
    });
  });

  afterEach(() => {
    resetPhaserGameFlowManager();
    resetPhaserStateManager();
    EventBus.resetInstance();
  });

  describe('初期化', () => {
    it('初期状態では未初期化', () => {
      expect(flowManager.isInitialized()).toBe(false);
    });

    it('initialize()で初期化済みになる', () => {
      flowManager.initialize();
      expect(flowManager.isInitialized()).toBe(true);
    });

    it('複数回の初期化は無視される', () => {
      flowManager.initialize();
      flowManager.initialize();
      expect(flowManager.isInitialized()).toBe(true);
    });
  });

  describe('フェーズ管理', () => {
    describe('getCurrentPhase()', () => {
      it('現在のフェーズを取得できる', () => {
        expect(flowManager.getCurrentPhase()).toBe(GamePhase.QUEST_ACCEPT);
      });
    });

    describe('getNextPhase()', () => {
      it('QUEST_ACCEPTの次はGATHERING', () => {
        expect(flowManager.getNextPhase()).toBe(GamePhase.GATHERING);
      });

      it('GATHERINGの次はALCHEMY', () => {
        phaserStateManager.updateGameState({
          ...createGameState(),
          currentPhase: GamePhase.GATHERING,
        });

        expect(flowManager.getNextPhase()).toBe(GamePhase.ALCHEMY);
      });

      it('ALCHEMYの次はDELIVERY', () => {
        phaserStateManager.updateGameState({
          ...createGameState(),
          currentPhase: GamePhase.ALCHEMY,
        });

        expect(flowManager.getNextPhase()).toBe(GamePhase.DELIVERY);
      });

      it('DELIVERYの次はnull（最終フェーズ）', () => {
        phaserStateManager.updateGameState({
          ...createGameState(),
          currentPhase: GamePhase.DELIVERY,
        });

        expect(flowManager.getNextPhase()).toBeNull();
      });
    });

    describe('advancePhase()', () => {
      it('QUEST_ACCEPTからGATHERINGに遷移する', async () => {
        await flowManager.advancePhase();
        expect(flowManager.getCurrentPhase()).toBe(GamePhase.GATHERING);
      });

      it('フェーズ変更イベントが発火する', async () => {
        const listener = vi.fn();
        eventBus.on('state:phase:changed', listener);

        await flowManager.advancePhase();

        expect(listener).toHaveBeenCalled();
        expect(listener).toHaveBeenCalledWith({
          phase: GamePhase.GATHERING,
          previousPhase: GamePhase.QUEST_ACCEPT,
        });
      });

      it('最終フェーズからターン終了に移行する', async () => {
        // DELIVERYフェーズに設定
        phaserStateManager.updateGameState({
          ...createGameState(),
          currentPhase: GamePhase.DELIVERY,
        });

        await flowManager.advancePhase();

        // ターン終了後はQUEST_ACCEPTに戻る
        expect(flowManager.getCurrentPhase()).toBe(GamePhase.QUEST_ACCEPT);
      });
    });

    describe('skipPhase()', () => {
      it('スキップ可能なフェーズをスキップできる', async () => {
        await flowManager.skipPhase(GamePhase.QUEST_ACCEPT);
        expect(flowManager.getCurrentPhase()).toBe(GamePhase.GATHERING);
      });
    });

    describe('transitionToPhase()', () => {
      it('指定フェーズに遷移する', async () => {
        await flowManager.transitionToPhase(GamePhase.ALCHEMY);
        expect(flowManager.getCurrentPhase()).toBe(GamePhase.ALCHEMY);
      });
    });
  });

  describe('ターン管理', () => {
    describe('endTurn()', () => {
      it('日数が進む', async () => {
        const initialDay = phaserStateManager.getGameState().currentDay;
        await flowManager.endTurn();
        expect(phaserStateManager.getGameState().currentDay).toBe(
          initialDay + 1
        );
      });

      it('フェーズがQUEST_ACCEPTに戻る', async () => {
        // GATHERINGフェーズに設定
        phaserStateManager.updateGameState({
          ...createGameState(),
          currentPhase: GamePhase.GATHERING,
        });

        await flowManager.endTurn();
        expect(flowManager.getCurrentPhase()).toBe(GamePhase.QUEST_ACCEPT);
      });

      it('APが回復する', async () => {
        // APを減らす
        phaserStateManager.updatePlayerState({
          ...createPlayerState(),
          actionPoints: 1,
          actionPointsMax: 3,
        });

        await flowManager.endTurn();

        expect(phaserStateManager.getPlayerState().actionPoints).toBe(3);
      });

      it('残り日数が減る', async () => {
        const initialRemaining =
          phaserStateManager.getPlayerState().rankDaysRemaining;
        await flowManager.endTurn();
        expect(phaserStateManager.getPlayerState().rankDaysRemaining).toBe(
          initialRemaining - 1
        );
      });

      it('day:changedイベントが発火する', async () => {
        const listener = vi.fn();
        eventBus.on('state:day:changed', listener);

        await flowManager.endTurn();

        expect(listener).toHaveBeenCalled();
      });
    });
  });

  describe('ゲームオーバー判定', () => {
    it('残り日数が0でゲームオーバー', async () => {
      phaserStateManager.updatePlayerState({
        ...createPlayerState(),
        rankDaysRemaining: 1,
      });

      await flowManager.endTurn();

      expect(mockSceneManager.switchTo).toHaveBeenCalledWith(
        SceneKeys.GAME_OVER,
        expect.objectContaining({
          reason: expect.stringContaining('期限切れ'),
        })
      );
    });

    it('ゴールドがマイナスでゲームオーバー', async () => {
      phaserStateManager.updatePlayerState({
        ...createPlayerState(),
        gold: -1,
      });

      await flowManager.endTurn();

      expect(mockSceneManager.switchTo).toHaveBeenCalledWith(
        SceneKeys.GAME_OVER,
        expect.objectContaining({
          reason: expect.stringContaining('マイナス'),
        })
      );
    });

    it('ゲームオーバーでstate:game:changedイベントが発火する', async () => {
      const listener = vi.fn();
      eventBus.on('state:game:changed', listener);

      phaserStateManager.updatePlayerState({
        ...createPlayerState(),
        rankDaysRemaining: 1,
      });

      await flowManager.endTurn();

      expect(listener).toHaveBeenCalledWith({
        state: 'gameOver',
      });
    });
  });

  describe('ゲームクリア判定', () => {
    it('Sランクでゲームクリア', async () => {
      phaserStateManager.updatePlayerState({
        ...createPlayerState(),
        rank: 'S',
      });

      await flowManager.endTurn();

      expect(mockSceneManager.switchTo).toHaveBeenCalledWith(
        SceneKeys.GAME_CLEAR,
        expect.objectContaining({
          finalRank: 'S',
        })
      );
    });

    it('ゲームクリアでstate:game:changedイベントが発火する', async () => {
      const listener = vi.fn();
      eventBus.on('state:game:changed', listener);

      phaserStateManager.updatePlayerState({
        ...createPlayerState(),
        rank: 'S',
      });

      await flowManager.endTurn();

      expect(listener).toHaveBeenCalledWith({
        state: 'gameClear',
      });
    });
  });

  describe('統計記録', () => {
    it('依頼完了を記録できる', () => {
      flowManager.recordQuestComplete();
      flowManager.recordQuestComplete();

      const stats = flowManager.getDayStats();
      expect(stats.questsCompleted).toBe(2);
    });

    it('アイテム調合を記録できる', () => {
      flowManager.recordItemCrafted();

      const stats = flowManager.getDayStats();
      expect(stats.itemsCrafted).toBe(1);
    });

    it('ゴールド獲得を記録できる', () => {
      flowManager.recordGoldEarned(100);
      flowManager.recordGoldEarned(50);

      const stats = flowManager.getDayStats();
      expect(stats.goldEarned).toBe(150);
    });

    it('ターン終了時に統計がリセットされる', async () => {
      flowManager.recordQuestComplete();
      flowManager.recordItemCrafted();
      flowManager.recordGoldEarned(100);

      await flowManager.endTurn();

      const stats = flowManager.getDayStats();
      expect(stats.questsCompleted).toBe(0);
      expect(stats.itemsCrafted).toBe(0);
      expect(stats.goldEarned).toBe(0);
    });
  });

  describe('ゲーム開始・ロード', () => {
    describe('startNewGame()', () => {
      it('状態がリセットされる', async () => {
        // 状態を変更
        phaserStateManager.updatePlayerState({
          ...createPlayerState(),
          gold: 9999,
        });

        await flowManager.startNewGame();

        expect(phaserStateManager.getPlayerState().gold).toBe(100);
      });

      it('メインシーンに遷移する', async () => {
        await flowManager.startNewGame();

        expect(mockSceneManager.switchTo).toHaveBeenCalledWith(SceneKeys.MAIN);
      });

      it('QUEST_ACCEPTフェーズから開始する', async () => {
        await flowManager.startNewGame();

        expect(flowManager.getCurrentPhase()).toBe(GamePhase.QUEST_ACCEPT);
      });

      it('state:game:changedイベントが発火する', async () => {
        const listener = vi.fn();
        eventBus.on('state:game:changed', listener);

        await flowManager.startNewGame();

        expect(listener).toHaveBeenCalledWith({
          state: 'playing',
        });
      });
    });

    describe('loadGame()', () => {
      it('セーブデータから状態を復元する', async () => {
        // 状態を変更してシリアライズ
        phaserStateManager.updatePlayerState({
          ...createPlayerState(),
          gold: 5000,
        });
        const saveData = phaserStateManager.serialize();

        // リセット
        phaserStateManager.reset();

        // ロード
        await flowManager.loadGame(saveData);

        expect(phaserStateManager.getPlayerState().gold).toBe(5000);
      });

      it('メインシーンに遷移する', async () => {
        const saveData = phaserStateManager.serialize();
        await flowManager.loadGame(saveData);

        expect(mockSceneManager.switchTo).toHaveBeenCalledWith(SceneKeys.MAIN);
      });
    });
  });

  describe('イベント連携', () => {
    beforeEach(() => {
      flowManager.initialize();
    });

    it('ui:questPhase:completedでフェーズが進む', async () => {
      eventBus.emitVoid('ui:questPhase:completed');

      // イベント処理を待つ
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(flowManager.getCurrentPhase()).toBe(GamePhase.GATHERING);
    });

    it('ui:gathering:skippedでフェーズが進む', async () => {
      // GATHERINGフェーズに設定
      phaserStateManager.updateGameState({
        ...createGameState(),
        currentPhase: GamePhase.GATHERING,
      });

      eventBus.emitVoid('ui:gathering:skipped');

      // イベント処理を待つ
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(flowManager.getCurrentPhase()).toBe(GamePhase.ALCHEMY);
    });

    it('ui:alchemy:skippedでフェーズが進む', async () => {
      // ALCHEMYフェーズに設定
      phaserStateManager.updateGameState({
        ...createGameState(),
        currentPhase: GamePhase.ALCHEMY,
      });

      eventBus.emitVoid('ui:alchemy:skipped');

      // イベント処理を待つ
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(flowManager.getCurrentPhase()).toBe(GamePhase.DELIVERY);
    });

    it('ui:dayEnd:confirmedでターン終了する', async () => {
      const initialDay = phaserStateManager.getGameState().currentDay;

      eventBus.emitVoid('ui:dayEnd:confirmed');

      // イベント処理を待つ
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(phaserStateManager.getGameState().currentDay).toBe(initialDay + 1);
    });

    it('game:restartで新規ゲーム開始', async () => {
      // 状態を変更
      phaserStateManager.updatePlayerState({
        ...createPlayerState(),
        gold: 9999,
      });

      eventBus.emitVoid('game:restart');

      // イベント処理を待つ
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(phaserStateManager.getPlayerState().gold).toBe(100);
    });
  });

  describe('フェーズ設定', () => {
    it('getPhases()でフェーズ一覧を取得できる', () => {
      const phases = flowManager.getPhases();
      expect(phases).toHaveLength(4);
      expect(phases[0].type).toBe(GamePhase.QUEST_ACCEPT);
      expect(phases[1].type).toBe(GamePhase.GATHERING);
      expect(phases[2].type).toBe(GamePhase.ALCHEMY);
      expect(phases[3].type).toBe(GamePhase.DELIVERY);
    });

    it('getPhaseConfig()で特定フェーズの設定を取得できる', () => {
      const config = flowManager.getPhaseConfig(GamePhase.ALCHEMY);
      expect(config).toBeDefined();
      expect(config!.name).toBe('調合');
      expect(config!.canSkip).toBe(true);
    });

    it('存在しないフェーズはundefinedを返す', () => {
      const config = flowManager.getPhaseConfig('INVALID' as GamePhase);
      expect(config).toBeUndefined();
    });
  });

  describe('クリーンアップ', () => {
    it('destroy()でイベント購読が解除される', () => {
      flowManager.initialize();

      // イベントリスナーが登録されていることを確認
      const beforeCount = eventBus.listenerCount('ui:questPhase:completed');
      expect(beforeCount).toBeGreaterThan(0);

      flowManager.destroy();

      // イベントリスナーが解除されていることを確認
      const afterCount = eventBus.listenerCount('ui:questPhase:completed');
      expect(afterCount).toBe(0);
    });

    it('destroy()後は未初期化状態になる', () => {
      flowManager.initialize();
      flowManager.destroy();

      expect(flowManager.isInitialized()).toBe(false);
    });
  });

  describe('シーンマネージャーなしの動作', () => {
    let flowManagerNoScene: PhaserGameFlowManager;

    beforeEach(() => {
      flowManagerNoScene = new PhaserGameFlowManager({
        stateManager: phaserStateManager,
        eventBus,
      });
    });

    it('シーンマネージャーなしでも動作する', async () => {
      await flowManagerNoScene.advancePhase();
      expect(flowManagerNoScene.getCurrentPhase()).toBe(GamePhase.GATHERING);
    });

    it('シーンマネージャーなしでゲームオーバー時にエラーにならない', async () => {
      phaserStateManager.updatePlayerState({
        ...createPlayerState(),
        rankDaysRemaining: 1,
      });

      await expect(flowManagerNoScene.endTurn()).resolves.not.toThrow();
    });
  });
});
