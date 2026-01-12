/**
 * PhaserStateManager テスト
 *
 * TASK-0252: StateManager Phaser連携実装
 * PhaserStateManagerの機能テスト。
 * - 状態取得・更新
 * - リスナー通知
 * - EventBus連携
 * - シリアライズ・デシリアライズ
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  PhaserStateManager,
  resetPhaserStateManager,
} from '@game/state/PhaserStateManager';
import { createStateManager, type StateManager } from '@application/StateManager';
import { createGameState } from '@domain/game/GameState';
import { createPlayerState } from '@domain/player/PlayerState';
import { EventBus } from '@game/events/EventBus';

describe('PhaserStateManager', () => {
  let stateManager: StateManager;
  let eventBus: EventBus;
  let phaserStateManager: PhaserStateManager;

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
  });

  afterEach(() => {
    resetPhaserStateManager();
    EventBus.resetInstance();
  });

  describe('初期化', () => {
    it('初期状態では未初期化', () => {
      expect(phaserStateManager.isInitialized()).toBe(false);
    });

    it('initialize()で初期化済みになる', () => {
      phaserStateManager.initialize();
      expect(phaserStateManager.isInitialized()).toBe(true);
    });

    it('複数回の初期化は無視される', () => {
      phaserStateManager.initialize();
      phaserStateManager.initialize();
      expect(phaserStateManager.isInitialized()).toBe(true);
    });
  });

  describe('状態取得', () => {
    it('ゲーム状態を取得できる', () => {
      const gameState = phaserStateManager.getGameState();
      expect(gameState).toBeDefined();
      expect(gameState.currentDay).toBe(1);
    });

    it('プレイヤー状態を取得できる', () => {
      const playerState = phaserStateManager.getPlayerState();
      expect(playerState).toBeDefined();
      expect(playerState.gold).toBe(100); // 初期値は100
    });

    it('デッキ状態を取得できる', () => {
      const deckState = phaserStateManager.getDeckState();
      expect(deckState).toBeDefined();
      expect(deckState.cards).toBeInstanceOf(Array);
    });

    it('インベントリ状態を取得できる', () => {
      const inventoryState = phaserStateManager.getInventoryState();
      expect(inventoryState).toBeDefined();
      expect(inventoryState.materials).toBeInstanceOf(Array);
    });

    it('クエスト状態を取得できる', () => {
      const questState = phaserStateManager.getQuestState();
      expect(questState).toBeDefined();
      expect(questState.activeQuests).toBeInstanceOf(Array);
    });

    it('スナップショットを取得できる', () => {
      const snapshot = phaserStateManager.getSnapshot();
      expect(snapshot).toBeDefined();
      expect(snapshot.gameState).toBeDefined();
      expect(snapshot.playerState).toBeDefined();
      expect(snapshot.deckState).toBeDefined();
      expect(snapshot.inventoryState).toBeDefined();
      expect(snapshot.questState).toBeDefined();
    });
  });

  describe('状態更新', () => {
    it('ゲーム状態を更新できる', () => {
      const newGameState = {
        ...createGameState(),
        currentDay: 5,
        currentPhase: 'GATHERING' as const,
      };

      phaserStateManager.updateGameState(newGameState);

      expect(phaserStateManager.getGameState().currentDay).toBe(5);
      expect(phaserStateManager.getGameState().currentPhase).toBe('GATHERING');
    });

    it('プレイヤー状態を更新できる', () => {
      const newPlayerState = {
        ...createPlayerState(),
        gold: 1000,
        currentAP: 2,
      };

      phaserStateManager.updatePlayerState(newPlayerState);

      expect(phaserStateManager.getPlayerState().gold).toBe(1000);
      expect(phaserStateManager.getPlayerState().currentAP).toBe(2);
    });
  });

  describe('リスナー管理', () => {
    it('リスナーを登録・解除できる', () => {
      const listener = vi.fn();
      const unsubscribe = phaserStateManager.subscribe('player', listener);

      expect(phaserStateManager.getListenerCount('player')).toBe(1);

      unsubscribe();
      expect(phaserStateManager.getListenerCount('player')).toBe(0);
    });

    it('パス別リスナーが状態更新時に呼ばれる', () => {
      const listener = vi.fn();
      phaserStateManager.subscribe('player', listener);

      phaserStateManager.updatePlayerState({
        ...createPlayerState(),
        gold: 1000,
      });

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith({
        path: ['player'],
        previousValue: expect.any(Object),
        newValue: expect.any(Object),
      });
    });

    it('ワイルドカードリスナーが全ての更新で呼ばれる', () => {
      const listener = vi.fn();
      phaserStateManager.subscribe('*', listener);

      phaserStateManager.updateGameState({
        ...createGameState(),
        currentDay: 5,
      });

      phaserStateManager.updatePlayerState({
        ...createPlayerState(),
        gold: 1000,
      });

      expect(listener).toHaveBeenCalledTimes(2);
    });

    it('全リスナー数を取得できる', () => {
      phaserStateManager.subscribe('player', vi.fn());
      phaserStateManager.subscribe('game', vi.fn());
      phaserStateManager.subscribe('*', vi.fn());

      expect(phaserStateManager.getListenerCount()).toBe(3);
    });
  });

  describe('EventBus連携', () => {
    beforeEach(() => {
      phaserStateManager.initialize();
    });

    it('ゲーム状態更新でフェーズ変更イベントが発火する', () => {
      const listener = vi.fn();
      eventBus.on('state:phase:changed', listener);

      const newGameState = {
        ...createGameState(),
        currentPhase: 'GATHERING' as const,
      };
      phaserStateManager.updateGameState(newGameState);

      expect(listener).toHaveBeenCalled();
      expect(listener).toHaveBeenCalledWith({
        phase: 'GATHERING',
        previousPhase: 'QUEST_ACCEPT',
      });
    });

    it('日数変更でday:changedイベントが発火する', () => {
      const listener = vi.fn();
      eventBus.on('state:day:changed', listener);

      const newGameState = {
        ...createGameState(),
        currentDay: 5,
      };
      phaserStateManager.updateGameState(newGameState);

      expect(listener).toHaveBeenCalled();
      // maxDaysはplayerState.rankDaysRemaining + currentDayで計算される
      const playerState = phaserStateManager.getPlayerState();
      expect(listener).toHaveBeenCalledWith({
        day: 5,
        maxDays: playerState.rankDaysRemaining + 5,
      });
    });

    it('ゴールド変更でgold:changedイベントが発火する', () => {
      const listener = vi.fn();
      eventBus.on('state:gold:changed', listener);

      const newPlayerState = {
        ...createPlayerState(),
        gold: 1000,
      };
      phaserStateManager.updatePlayerState(newPlayerState);

      expect(listener).toHaveBeenCalled();
      expect(listener).toHaveBeenCalledWith({
        gold: 1000,
        delta: 900, // 1000 - 100 (初期値)
      });
    });

    it('AP変更でap:changedイベントが発火する', () => {
      const listener = vi.fn();
      eventBus.on('state:ap:changed', listener);

      const newPlayerState = {
        ...createPlayerState(),
        actionPoints: 2,
      };
      phaserStateManager.updatePlayerState(newPlayerState);

      expect(listener).toHaveBeenCalled();
      expect(listener).toHaveBeenCalledWith({
        ap: 2,
        maxAP: 3, // 初期値は3
      });
    });

    it('ランク変更でrank:changedイベントが発火する', () => {
      const listener = vi.fn();
      eventBus.on('state:rank:changed', listener);

      const newPlayerState = {
        ...createPlayerState(),
        rank: 'E' as const,
      };
      phaserStateManager.updatePlayerState(newPlayerState);

      expect(listener).toHaveBeenCalled();
      expect(listener).toHaveBeenCalledWith({
        rank: 'E',
        previousRank: 'G',
      });
    });
  });

  describe('シリアライズ', () => {
    it('状態をシリアライズできる', () => {
      const serialized = phaserStateManager.serialize();
      expect(typeof serialized).toBe('string');

      const parsed = JSON.parse(serialized);
      expect(parsed.gameState).toBeDefined();
      expect(parsed.playerState).toBeDefined();
    });

    it('シリアライズした状態をデシリアライズできる', () => {
      // 状態を変更
      phaserStateManager.updatePlayerState({
        ...createPlayerState(),
        gold: 9999,
      });

      // シリアライズ
      const serialized = phaserStateManager.serialize();

      // リセット
      phaserStateManager.reset();
      expect(phaserStateManager.getPlayerState().gold).toBe(100); // 初期値は100

      // デシリアライズ
      phaserStateManager.deserialize(serialized);
      expect(phaserStateManager.getPlayerState().gold).toBe(9999);
    });

    it('無効なデータのデシリアライズでエラーになる', () => {
      expect(() => {
        phaserStateManager.deserialize('invalid json');
      }).toThrow('Invalid save data');
    });
  });

  describe('一括操作', () => {
    it('スナップショットから復元できる', () => {
      // 状態を変更
      phaserStateManager.updatePlayerState({
        ...createPlayerState(),
        gold: 9999,
      });

      // スナップショットを保存
      const snapshot = phaserStateManager.getSnapshot();

      // リセット
      phaserStateManager.reset();
      expect(phaserStateManager.getPlayerState().gold).toBe(100); // 初期値は100

      // スナップショットから復元
      phaserStateManager.restoreFromSnapshot(snapshot);
      expect(phaserStateManager.getPlayerState().gold).toBe(9999);
    });

    it('リセットで初期状態に戻る', () => {
      phaserStateManager.updatePlayerState({
        ...createPlayerState(),
        gold: 9999,
      });

      phaserStateManager.reset();

      expect(phaserStateManager.getPlayerState().gold).toBe(100); // 初期値は100
    });
  });

  describe('クリーンアップ', () => {
    it('destroy()でリソースが解放される', () => {
      phaserStateManager.initialize();
      phaserStateManager.subscribe('player', vi.fn());
      phaserStateManager.subscribe('*', vi.fn());

      phaserStateManager.destroy();

      expect(phaserStateManager.isInitialized()).toBe(false);
      expect(phaserStateManager.getListenerCount()).toBe(0);
    });
  });

  describe('循環通知の防止', () => {
    it('リスナー内での状態更新による循環通知が防止される', () => {
      const callOrder: string[] = [];

      // リスナー内で別の状態を更新
      phaserStateManager.subscribe('player', () => {
        callOrder.push('player-listener');
        // 循環を引き起こす可能性のある更新
        if (callOrder.length < 5) {
          phaserStateManager.updateGameState({
            ...phaserStateManager.getGameState(),
            currentDay: callOrder.length,
          });
        }
      });

      phaserStateManager.subscribe('game', () => {
        callOrder.push('game-listener');
      });

      // プレイヤー状態を更新
      phaserStateManager.updatePlayerState({
        ...createPlayerState(),
        gold: 1000,
      });

      // 循環が防止されていることを確認
      // player -> game -> (保留) -> game (保留分)
      expect(callOrder).toContain('player-listener');
      expect(callOrder).toContain('game-listener');
    });
  });
});
