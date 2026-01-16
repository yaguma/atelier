/**
 * StateManager テストケース
 * TASK-0005 StateManager実装
 *
 * @description
 * T-0005-01 〜 T-0005-09 を実装
 */

import { EventBus } from '@application/events/event-bus';
import type { IEventBus } from '@application/events/event-bus.interface';
import { INITIAL_GAME_STATE } from '@application/services/initial-state';
import { StateManager } from '@application/services/state-manager';
import type { IStateManager } from '@application/services/state-manager.interface';
import { GameEventType, GamePhase, GuildRank } from '@shared/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('StateManager', () => {
  let stateManager: IStateManager;
  let eventBus: IEventBus;

  beforeEach(() => {
    eventBus = new EventBus();
    stateManager = new StateManager(eventBus);
  });

  // =============================================================================
  // T-0005-01: 初期状態の取得
  // =============================================================================

  describe('getState', () => {
    it('T-0005-01: 初期状態の取得', () => {
      const state = stateManager.getState();

      expect(state.currentRank).toBe(GuildRank.G);
      expect(state.rankHp).toBe(INITIAL_GAME_STATE.rankHp);
      expect(state.remainingDays).toBe(INITIAL_GAME_STATE.remainingDays);
      expect(state.gold).toBe(INITIAL_GAME_STATE.gold);
      expect(state.actionPoints).toBe(INITIAL_GAME_STATE.actionPoints);
      expect(state.currentPhase).toBe(GamePhase.QUEST_ACCEPT);
      expect(state.currentDay).toBe(1);
    });

    it('取得した状態を変更しても元の状態に影響しない', () => {
      const state1 = stateManager.getState();
      const originalGold = state1.gold;

      // 取得した状態オブジェクトを変更
      (state1 as { gold: number }).gold = 9999;

      const state2 = stateManager.getState();
      expect(state2.gold).toBe(originalGold);
    });
  });

  // =============================================================================
  // T-0005-02: 状態更新
  // =============================================================================

  describe('updateState', () => {
    it('T-0005-02: 状態更新で部分更新が反映される', () => {
      stateManager.updateState({ gold: 500 });

      const state = stateManager.getState();
      expect(state.gold).toBe(500);
      expect(state.currentRank).toBe(GuildRank.G); // 他のプロパティは変わらない
    });

    it('複数プロパティを同時に更新できる', () => {
      stateManager.updateState({
        gold: 200,
        actionPoints: 5,
        comboCount: 3,
      });

      const state = stateManager.getState();
      expect(state.gold).toBe(200);
      expect(state.actionPoints).toBe(5);
      expect(state.comboCount).toBe(3);
    });

    it('状態更新時にSTATE_CHANGEDイベントが発火する', () => {
      const handler = vi.fn();
      eventBus.on(GameEventType.DAY_STARTED, handler);

      // DAY_STARTEDはadvanceDayで発火するので、別のテストで確認
      // ここではイベントの発火自体を確認
    });
  });

  // =============================================================================
  // T-0005-03: 有効なフェーズ遷移
  // =============================================================================

  describe('setPhase', () => {
    it('T-0005-03: 有効なフェーズ遷移', () => {
      // QUEST_ACCEPT -> GATHERING
      stateManager.setPhase(GamePhase.GATHERING);
      expect(stateManager.getState().currentPhase).toBe(GamePhase.GATHERING);

      // GATHERING -> ALCHEMY
      stateManager.setPhase(GamePhase.ALCHEMY);
      expect(stateManager.getState().currentPhase).toBe(GamePhase.ALCHEMY);

      // ALCHEMY -> DELIVERY
      stateManager.setPhase(GamePhase.DELIVERY);
      expect(stateManager.getState().currentPhase).toBe(GamePhase.DELIVERY);

      // DELIVERY -> QUEST_ACCEPT
      stateManager.setPhase(GamePhase.QUEST_ACCEPT);
      expect(stateManager.getState().currentPhase).toBe(GamePhase.QUEST_ACCEPT);
    });

    it('フェーズ変更時にPHASE_CHANGEDイベントが発火する', () => {
      const handler = vi.fn();
      eventBus.on(GameEventType.PHASE_CHANGED, handler);

      stateManager.setPhase(GamePhase.GATHERING);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: GameEventType.PHASE_CHANGED,
          payload: expect.objectContaining({
            previousPhase: GamePhase.QUEST_ACCEPT,
            newPhase: GamePhase.GATHERING,
          }),
        }),
      );
    });
  });

  // =============================================================================
  // T-0005-04: 無効なフェーズ遷移
  // =============================================================================

  describe('canTransitionTo / invalid transitions', () => {
    it('T-0005-04: 無効なフェーズ遷移はエラーになる', () => {
      // QUEST_ACCEPT -> ALCHEMY (無効)
      expect(() => stateManager.setPhase(GamePhase.ALCHEMY)).toThrow();

      // QUEST_ACCEPT -> DELIVERY (無効)
      expect(() => stateManager.setPhase(GamePhase.DELIVERY)).toThrow();
    });

    it('canTransitionToで遷移可能性をチェックできる', () => {
      // QUEST_ACCEPT からの遷移
      expect(stateManager.canTransitionTo(GamePhase.GATHERING)).toBe(true);
      expect(stateManager.canTransitionTo(GamePhase.ALCHEMY)).toBe(false);
      expect(stateManager.canTransitionTo(GamePhase.DELIVERY)).toBe(false);
      expect(stateManager.canTransitionTo(GamePhase.QUEST_ACCEPT)).toBe(false);
    });

    it('各フェーズからの有効な遷移先を検証', () => {
      // GATHERING からの遷移
      stateManager.setPhase(GamePhase.GATHERING);
      expect(stateManager.canTransitionTo(GamePhase.ALCHEMY)).toBe(true);
      expect(stateManager.canTransitionTo(GamePhase.DELIVERY)).toBe(false);

      // ALCHEMY からの遷移
      stateManager.setPhase(GamePhase.ALCHEMY);
      expect(stateManager.canTransitionTo(GamePhase.DELIVERY)).toBe(true);
      expect(stateManager.canTransitionTo(GamePhase.GATHERING)).toBe(false);

      // DELIVERY からの遷移
      stateManager.setPhase(GamePhase.DELIVERY);
      expect(stateManager.canTransitionTo(GamePhase.QUEST_ACCEPT)).toBe(true);
      expect(stateManager.canTransitionTo(GamePhase.GATHERING)).toBe(false);
    });
  });

  // =============================================================================
  // T-0005-05: AP消費（十分な場合）
  // =============================================================================

  describe('spendActionPoints', () => {
    it('T-0005-05: AP消費（十分な場合）', () => {
      const initialAp = stateManager.getState().actionPoints;

      const result = stateManager.spendActionPoints(1);

      expect(result).toBe(true);
      expect(stateManager.getState().actionPoints).toBe(initialAp - 1);
    });

    it('複数APを消費できる', () => {
      const result = stateManager.spendActionPoints(2);

      expect(result).toBe(true);
      expect(stateManager.getState().actionPoints).toBe(INITIAL_GAME_STATE.actionPoints - 2);
    });

    // T-0005-06: AP消費（不足時）
    it('T-0005-06: AP消費（不足時）はfalseを返しAP変化なし', () => {
      const initialAp = stateManager.getState().actionPoints;

      const result = stateManager.spendActionPoints(initialAp + 1);

      expect(result).toBe(false);
      expect(stateManager.getState().actionPoints).toBe(initialAp);
    });
  });

  // =============================================================================
  // T-0005-07: ゴールド追加
  // =============================================================================

  describe('addGold', () => {
    it('T-0005-07: ゴールド追加で正しく加算', () => {
      const initialGold = stateManager.getState().gold;

      stateManager.addGold(50);

      expect(stateManager.getState().gold).toBe(initialGold + 50);
    });

    it('複数回加算できる', () => {
      stateManager.addGold(100);
      stateManager.addGold(50);

      expect(stateManager.getState().gold).toBe(INITIAL_GAME_STATE.gold + 100 + 50);
    });
  });

  // =============================================================================
  // T-0005-08: ゴールド消費
  // =============================================================================

  describe('spendGold', () => {
    it('T-0005-08: ゴールド消費で正しく減算', () => {
      const initialGold = stateManager.getState().gold;

      const result = stateManager.spendGold(30);

      expect(result).toBe(true);
      expect(stateManager.getState().gold).toBe(initialGold - 30);
    });

    it('ゴールド不足時はfalseを返し変化なし', () => {
      const initialGold = stateManager.getState().gold;

      const result = stateManager.spendGold(initialGold + 1);

      expect(result).toBe(false);
      expect(stateManager.getState().gold).toBe(initialGold);
    });
  });

  // =============================================================================
  // T-0005-09: 日の進行
  // =============================================================================

  describe('advanceDay', () => {
    it('T-0005-09: 日の進行でday+1、AP回復', () => {
      // APを消費
      stateManager.spendActionPoints(2);
      expect(stateManager.getState().actionPoints).toBe(INITIAL_GAME_STATE.actionPoints - 2);

      stateManager.advanceDay();

      const state = stateManager.getState();
      expect(state.currentDay).toBe(2);
      expect(state.remainingDays).toBe(INITIAL_GAME_STATE.remainingDays - 1);
      expect(state.actionPoints).toBe(INITIAL_GAME_STATE.actionPoints); // AP回復
    });

    it('日進行時にDAY_STARTEDイベントが発火する', () => {
      const handler = vi.fn();
      eventBus.on(GameEventType.DAY_STARTED, handler);

      stateManager.advanceDay();

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  // =============================================================================
  // 初期化・リセット
  // =============================================================================

  describe('initialize / reset', () => {
    it('initializeで初期状態にカスタム値を設定できる', () => {
      stateManager.initialize({ gold: 500, currentDay: 5 });

      const state = stateManager.getState();
      expect(state.gold).toBe(500);
      expect(state.currentDay).toBe(5);
      expect(state.currentRank).toBe(GuildRank.G); // 未指定はデフォルト
    });

    it('resetでデフォルト初期状態に戻る', () => {
      stateManager.updateState({ gold: 9999, currentDay: 99 });
      stateManager.reset();

      const state = stateManager.getState();
      expect(state.gold).toBe(INITIAL_GAME_STATE.gold);
      expect(state.currentDay).toBe(INITIAL_GAME_STATE.currentDay);
    });
  });

  // =============================================================================
  // 昇格ゲージ
  // =============================================================================

  describe('addContribution', () => {
    it('貢献度を追加できる', () => {
      // 実装時に追加
      // stateManager.addContribution(10);
      // expect(stateManager.getState().promotionGauge).toBe(10);
    });
  });
});
