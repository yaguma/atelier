/**
 * shared/services/state-manager テスト
 * TASK-0066: shared/services移行
 *
 * @description
 * StateManagerの移行確認と機能確認テスト
 */

import type { IEventBus } from '@shared/services/event-bus';
import { EventBus } from '@shared/services/event-bus';
import type { IStateManager } from '@shared/services/state-manager';
import {
  INITIAL_GAME_STATE,
  MAX_ACTION_POINTS,
  StateManager,
  VALID_PHASE_TRANSITIONS,
} from '@shared/services/state-manager';
import { GameEventType, GamePhase, GuildRank } from '@shared/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('shared/services/state-manager', () => {
  describe('移行確認', () => {
    it('@shared/services/state-managerからStateManagerがインポートできること', () => {
      expect(StateManager).toBeDefined();
      expect(typeof StateManager).toBe('function');
    });

    it('StateManagerのインスタンスを作成できること', () => {
      const eventBus = new EventBus();
      const stateManager = new StateManager(eventBus);
      expect(stateManager).toBeInstanceOf(StateManager);
    });

    it('IStateManagerインターフェースを満たすこと', () => {
      const eventBus = new EventBus();
      const stateManager: IStateManager = new StateManager(eventBus);
      expect(typeof stateManager.getState).toBe('function');
      expect(typeof stateManager.updateState).toBe('function');
      expect(typeof stateManager.setPhase).toBe('function');
      expect(typeof stateManager.canTransitionTo).toBe('function');
      expect(typeof stateManager.advanceDay).toBe('function');
      expect(typeof stateManager.spendActionPoints).toBe('function');
      expect(typeof stateManager.addGold).toBe('function');
      expect(typeof stateManager.spendGold).toBe('function');
      expect(typeof stateManager.addContribution).toBe('function');
      expect(typeof stateManager.initialize).toBe('function');
      expect(typeof stateManager.reset).toBe('function');
      expect(typeof stateManager.loadFromSaveData).toBe('function');
      expect(typeof stateManager.exportToSaveData).toBe('function');
    });

    it('INITIAL_GAME_STATEがエクスポートされていること', () => {
      expect(INITIAL_GAME_STATE).toBeDefined();
      expect(INITIAL_GAME_STATE.currentRank).toBe(GuildRank.G);
      expect(INITIAL_GAME_STATE.currentPhase).toBe(GamePhase.QUEST_ACCEPT);
    });

    it('MAX_ACTION_POINTSがエクスポートされていること', () => {
      expect(MAX_ACTION_POINTS).toBeDefined();
      expect(typeof MAX_ACTION_POINTS).toBe('number');
    });

    it('VALID_PHASE_TRANSITIONSがエクスポートされていること', () => {
      expect(VALID_PHASE_TRANSITIONS).toBeDefined();
      expect(VALID_PHASE_TRANSITIONS[GamePhase.QUEST_ACCEPT]).toContain(GamePhase.GATHERING);
    });
  });

  describe('機能確認', () => {
    let eventBus: IEventBus;
    let stateManager: IStateManager;

    beforeEach(() => {
      eventBus = new EventBus();
      stateManager = new StateManager(eventBus);
    });

    it('状態取得が正常に動作すること', () => {
      const state = stateManager.getState();
      expect(state).toBeDefined();
      expect(state.currentRank).toBe(GuildRank.G);
      expect(state.currentPhase).toBe(GamePhase.QUEST_ACCEPT);
      expect(state.currentDay).toBe(1);
    });

    it('状態更新が正常に動作すること', () => {
      stateManager.updateState({ gold: 500 });
      const state = stateManager.getState();
      expect(state.gold).toBe(500);
    });

    it('フェーズ遷移が正常に動作すること', () => {
      const handler = vi.fn();
      eventBus.on(GameEventType.PHASE_CHANGED, handler);

      stateManager.setPhase(GamePhase.GATHERING);

      expect(stateManager.getState().currentPhase).toBe(GamePhase.GATHERING);
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: {
            previousPhase: GamePhase.QUEST_ACCEPT,
            newPhase: GamePhase.GATHERING,
          },
        }),
      );
    });

    it('ゴールド追加が正常に動作すること', () => {
      const initialGold = stateManager.getState().gold;
      stateManager.addGold(100);
      expect(stateManager.getState().gold).toBe(initialGold + 100);
    });

    it('ゴールド消費が正常に動作すること', () => {
      stateManager.updateState({ gold: 200 });
      const result = stateManager.spendGold(50);
      expect(result).toBe(true);
      expect(stateManager.getState().gold).toBe(150);
    });

    it('行動ポイント消費が正常に動作すること', () => {
      const result = stateManager.spendActionPoints(1);
      expect(result).toBe(true);
      expect(stateManager.getState().actionPoints).toBe(MAX_ACTION_POINTS - 1);
    });

    it('日進行が正常に動作すること', () => {
      const handler = vi.fn();
      eventBus.on(GameEventType.DAY_STARTED, handler);

      stateManager.advanceDay();

      expect(stateManager.getState().currentDay).toBe(2);
      expect(handler).toHaveBeenCalled();
    });

    it('貢献度追加が正常に動作すること', () => {
      const handler = vi.fn();
      eventBus.on(GameEventType.CONTRIBUTION_ADDED, handler);

      stateManager.addContribution(50);

      expect(stateManager.getState().promotionGauge).toBe(50);
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: {
            amount: 50,
            newPromotionGauge: 50,
          },
        }),
      );
    });

    it('リセットが正常に動作すること', () => {
      stateManager.updateState({ gold: 9999, currentDay: 15 });
      stateManager.reset();

      const state = stateManager.getState();
      expect(state.gold).toBe(INITIAL_GAME_STATE.gold);
      expect(state.currentDay).toBe(INITIAL_GAME_STATE.currentDay);
    });

    it('初期化が正常に動作すること', () => {
      stateManager.initialize({ gold: 1000, currentRank: GuildRank.A });

      const state = stateManager.getState();
      expect(state.gold).toBe(1000);
      expect(state.currentRank).toBe(GuildRank.A);
      expect(state.currentPhase).toBe(GamePhase.QUEST_ACCEPT); // デフォルト値
    });
  });
});
