/**
 * AP超過自動日進行 統合テスト
 * TASK-0119: 統合テスト - AP超過自動日進行
 *
 * @description
 * APOverflowService.calculateOverflow() と GameFlowManager.processAPOverflow() の
 * 連携を検証する。単日・複数日消費、ゲームオーバー判定、AP回復を網羅的にテスト。
 *
 * @信頼性レベル 🔵 REQ-003, EDGE-002, 設計文書dataflow.mdより
 */

import type { IDeckService } from '@domain/interfaces/deck-service.interface';
import type { IQuestService } from '@domain/interfaces/quest-service.interface';
import { calculateOverflow } from '@features/gathering';
import type { IEventBus } from '@shared/services/event-bus';
import type { IStateManager } from '@shared/services/state-manager';
import type { IGameState } from '@shared/types';
import { GameEventType, GamePhase, GuildRank } from '@shared/types';
import type { MockedFunction } from 'vitest';
import { describe, expect, it, vi } from 'vitest';

// =============================================================================
// モック定義
// =============================================================================

interface MockedStateManager extends Partial<IStateManager> {
  getState: MockedFunction<IStateManager['getState']>;
  updateState: MockedFunction<IStateManager['updateState']>;
  setPhase: MockedFunction<IStateManager['setPhase']>;
  initialize: MockedFunction<IStateManager['initialize']>;
  advanceDay: MockedFunction<IStateManager['advanceDay']>;
  addGold: MockedFunction<IStateManager['addGold']>;
  spendGold: MockedFunction<IStateManager['spendGold']>;
  spendActionPoints: MockedFunction<IStateManager['spendActionPoints']>;
  canTransitionTo: MockedFunction<IStateManager['canTransitionTo']>;
}

const createBaseState = (overrides?: Partial<IGameState>): IGameState => ({
  currentRank: GuildRank.G,
  rankHp: 100,
  remainingDays: 148,
  currentDay: 3,
  gold: 100,
  actionPoints: 3,
  maxActionPoints: 3,
  comboCount: 0,
  currentPhase: GamePhase.GATHERING,
  contribution: 0,
  apOverflow: 0,
  isPromotionTest: false,
  promotionGauge: 0,
  questBoard: {
    boardQuests: [],
    visitorQuests: [],
    lastVisitorUpdateDay: 0,
  },
  ...overrides,
});

const createMockStateManager = (state: IGameState): MockedStateManager => ({
  getState: vi.fn(() => ({ ...state })),
  updateState: vi.fn((partial) => {
    Object.assign(state, partial);
  }),
  setPhase: vi.fn(),
  initialize: vi.fn(),
  advanceDay: vi.fn(),
  addGold: vi.fn(),
  spendGold: vi.fn(),
  spendActionPoints: vi.fn(),
  canTransitionTo: vi.fn().mockReturnValue(true),
});

const createMockEventBus = (): IEventBus => ({
  emit: vi.fn(),
  on: vi.fn(() => vi.fn()),
  once: vi.fn(),
  off: vi.fn(),
});

const createMockDeckService = (): IDeckService =>
  ({
    initialize: vi.fn(),
    draw: vi.fn(),
    shuffle: vi.fn(),
    getHand: vi.fn().mockReturnValue([]),
    getDeck: vi.fn().mockReturnValue([]),
    getDiscardPile: vi.fn().mockReturnValue([]),
    playCard: vi.fn(),
    discardHand: vi.fn(),
    addCard: vi.fn(),
    removeCard: vi.fn(),
    refillHand: vi.fn(),
  }) as unknown as IDeckService;

const createMockQuestService = (): IQuestService =>
  ({
    generateDailyQuests: vi.fn(),
    generateBoardQuests: vi.fn(() => []),
    generateVisitorQuests: vi.fn(() => []),
    updateDeadlines: vi.fn(() => []),
    getActiveQuests: vi.fn().mockReturnValue([]),
    getAvailableQuests: vi.fn().mockReturnValue([]),
    acceptQuest: vi.fn(),
    getQuestLimit: vi.fn().mockReturnValue(3),
  }) as unknown as IQuestService;

// =============================================================================
// テスト
// =============================================================================

describe('AP超過自動日進行 統合テスト（TASK-0119）', () => {
  // ===========================================================================
  // テストケース1: calculateOverflow 計算テーブル
  // ===========================================================================

  describe('AP超過計算テーブル', () => {
    it.each([
      {
        consume: 1,
        current: 3,
        expectOverflow: false,
        expectDays: 0,
        expectNextAP: 0,
        expectRemaining: 2,
      },
      {
        consume: 3,
        current: 3,
        expectOverflow: false,
        expectDays: 0,
        expectNextAP: 0,
        expectRemaining: 0,
      },
      {
        consume: 4,
        current: 3,
        expectOverflow: true,
        expectDays: 1,
        expectNextAP: 2,
        expectRemaining: 0,
      },
      {
        consume: 5,
        current: 3,
        expectOverflow: true,
        expectDays: 1,
        expectNextAP: 1,
        expectRemaining: 0,
      },
      {
        consume: 6,
        current: 3,
        expectOverflow: true,
        expectDays: 1,
        expectNextAP: 3,
        expectRemaining: 0,
      },
      {
        consume: 7,
        current: 3,
        expectOverflow: true,
        expectDays: 2,
        expectNextAP: 2,
        expectRemaining: 0,
      },
      {
        consume: 3,
        current: 1,
        expectOverflow: true,
        expectDays: 1,
        expectNextAP: 1,
        expectRemaining: 0,
      },
      {
        consume: 4,
        current: 2,
        expectOverflow: true,
        expectDays: 1,
        expectNextAP: 1,
        expectRemaining: 0,
      },
    ])('T-0119-CALC: AP消費$consume/残AP$current → 超過=$expectOverflow, $expectDays日消費, 翌日AP=$expectNextAP', ({
      consume,
      current,
      expectOverflow,
      expectDays,
      expectNextAP,
      expectRemaining,
    }) => {
      // 【テスト目的】: calculateOverflow()の計算結果がテーブル通りであること
      // 🔵 REQ-003-01・architecture.md AP超過計算テーブル

      const result = calculateOverflow({ consumeAP: consume, currentAP: current });

      expect(result.hasOverflow).toBe(expectOverflow);
      expect(result.daysConsumed).toBe(expectDays);
      if (expectOverflow) {
        expect(result.nextDayAP).toBe(expectNextAP);
      }
      expect(result.remainingAP).toBe(expectRemaining);
    });
  });

  // ===========================================================================
  // テストケース2: processAPOverflow 順次日進行
  // ===========================================================================

  describe('processAPOverflow 順次日進行', () => {
    it('T-0119-PROC-01: 1日消費時にendDay相当の処理が1回実行される', async () => {
      // 【テスト目的】: AP超過1日消費時の日進行処理を確認
      // 🔵 REQ-003・EDGE-002

      const state = createBaseState({ remainingDays: 148, currentDay: 3 });
      const mockStateManager = createMockStateManager(state);
      const mockEventBus = createMockEventBus();
      const mockDeckService = createMockDeckService();
      const mockQuestService = createMockQuestService();

      const { GameFlowManager } = await import('@shared/services/game-flow');
      const gameFlowManager = new GameFlowManager(
        mockStateManager as unknown as IStateManager,
        mockDeckService,
        mockQuestService,
        mockEventBus,
      );

      const overflowResult = calculateOverflow({ consumeAP: 4, currentAP: 3 });
      const result = await gameFlowManager.processAPOverflow(overflowResult);

      expect(result.daysAdvanced).toBe(1);
      expect(result.isGameOver).toBe(false);
      expect(mockQuestService.updateDeadlines).toHaveBeenCalledTimes(1);
    });

    it('T-0119-PROC-02: 2日消費時にendDay相当の処理が2回実行される', async () => {
      // 【テスト目的】: 複数日消費時の順次日進行を確認
      // 🔵 EDGE-002: 各日の日終了処理を順次実行

      const state = createBaseState({ remainingDays: 148, currentDay: 3 });
      const mockStateManager = createMockStateManager(state);
      const mockEventBus = createMockEventBus();
      const mockDeckService = createMockDeckService();
      const mockQuestService = createMockQuestService();

      const { GameFlowManager } = await import('@shared/services/game-flow');
      const gameFlowManager = new GameFlowManager(
        mockStateManager as unknown as IStateManager,
        mockDeckService,
        mockQuestService,
        mockEventBus,
      );

      const overflowResult = calculateOverflow({ consumeAP: 7, currentAP: 3 });
      expect(overflowResult.daysConsumed).toBe(2);

      const result = await gameFlowManager.processAPOverflow(overflowResult);

      expect(result.daysAdvanced).toBe(2);
      expect(result.isGameOver).toBe(false);
      expect(mockQuestService.updateDeadlines).toHaveBeenCalledTimes(2);
    });

    it('T-0119-PROC-03: 各日の日進行でDAY_ENDEDイベントが発行される', async () => {
      // 【テスト目的】: 各日進行ごとにDAY_ENDEDイベントが正しく発行されること
      // 🔵 設計文書dataflow.md

      const state = createBaseState({ remainingDays: 148, currentDay: 3 });
      const mockStateManager = createMockStateManager(state);
      const mockEventBus = createMockEventBus();
      const mockDeckService = createMockDeckService();
      const mockQuestService = createMockQuestService();

      const { GameFlowManager } = await import('@shared/services/game-flow');
      const gameFlowManager = new GameFlowManager(
        mockStateManager as unknown as IStateManager,
        mockDeckService,
        mockQuestService,
        mockEventBus,
      );

      const overflowResult = calculateOverflow({ consumeAP: 7, currentAP: 3 });
      await gameFlowManager.processAPOverflow(overflowResult);

      const dayEndedCalls = (
        mockEventBus.emit as MockedFunction<IEventBus['emit']>
      ).mock.calls.filter((call) => call[0] === GameEventType.DAY_ENDED);
      expect(dayEndedCalls.length).toBe(2);
    });

    it('T-0119-PROC-04: processAPOverflow後にAPが正しく設定される', async () => {
      // 【テスト目的】: processAPOverflow完了後にnextDayAPが設定されること
      // 🔵 REQ-003-01

      const state = createBaseState({ remainingDays: 148, currentDay: 3 });
      const mockStateManager = createMockStateManager(state);
      const mockEventBus = createMockEventBus();
      const mockDeckService = createMockDeckService();
      const mockQuestService = createMockQuestService();

      const { GameFlowManager } = await import('@shared/services/game-flow');
      const gameFlowManager = new GameFlowManager(
        mockStateManager as unknown as IStateManager,
        mockDeckService,
        mockQuestService,
        mockEventBus,
      );

      const overflowResult = calculateOverflow({ consumeAP: 4, currentAP: 3 });
      expect(overflowResult.nextDayAP).toBe(2);

      const result = await gameFlowManager.processAPOverflow(overflowResult);

      expect(result.newActionPoints).toBe(2);
      // updateStateにactionPointsが含まれていることを確認
      const apUpdateCalls = mockStateManager.updateState.mock.calls.filter(
        (call) => call[0]?.actionPoints !== undefined,
      );
      expect(apUpdateCalls.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ===========================================================================
  // テストケース3: ゲームオーバー判定
  // ===========================================================================

  describe('ゲームオーバー判定', () => {
    it('T-0119-GO-01: 残り日数不足で途中ゲームオーバーになる', async () => {
      // 【テスト目的】: 日進行中にゲームオーバー条件を満たした場合に停止すること
      // 🔵 REQ-003-04: 自動日進行で残り日数0以下→ゲームオーバー判定

      const state = createBaseState({ remainingDays: 1, currentDay: 149 });
      const mockStateManager = createMockStateManager(state);
      const mockEventBus = createMockEventBus();
      const mockDeckService = createMockDeckService();
      const mockQuestService = createMockQuestService();

      const { GameFlowManager } = await import('@shared/services/game-flow');
      const gameFlowManager = new GameFlowManager(
        mockStateManager as unknown as IStateManager,
        mockDeckService,
        mockQuestService,
        mockEventBus,
      );

      // 2日消費しようとするが、残り1日しかない
      const overflowResult = calculateOverflow({ consumeAP: 7, currentAP: 3 });
      expect(overflowResult.daysConsumed).toBe(2);

      const result = await gameFlowManager.processAPOverflow(overflowResult);

      expect(result.isGameOver).toBe(true);
      // 1日目の日終了でゲームオーバーになるため、2日目は実行されない
      expect(result.daysAdvanced).toBeLessThanOrEqual(2);
    });

    it('T-0119-GO-02: 十分な残り日数があれば正常に日進行する', async () => {
      // 【テスト目的】: 残り日数が十分な場合は正常に日進行が完了すること
      // 🔵 REQ-003

      const state = createBaseState({ remainingDays: 100, currentDay: 50 });
      const mockStateManager = createMockStateManager(state);
      const mockEventBus = createMockEventBus();
      const mockDeckService = createMockDeckService();
      const mockQuestService = createMockQuestService();

      const { GameFlowManager } = await import('@shared/services/game-flow');
      const gameFlowManager = new GameFlowManager(
        mockStateManager as unknown as IStateManager,
        mockDeckService,
        mockQuestService,
        mockEventBus,
      );

      const overflowResult = calculateOverflow({ consumeAP: 7, currentAP: 3 });
      const result = await gameFlowManager.processAPOverflow(overflowResult);

      expect(result.isGameOver).toBe(false);
      expect(result.daysAdvanced).toBe(2);
    });

    it('T-0119-GO-03: ゲームオーバー時にGAME_OVERイベントが発行される', async () => {
      // 【テスト目的】: ゲームオーバー発生時にイベントが正しく発行されること
      // 🔵 REQ-003-04

      const state = createBaseState({ remainingDays: 1, currentDay: 149 });
      const mockStateManager = createMockStateManager(state);
      const mockEventBus = createMockEventBus();
      const mockDeckService = createMockDeckService();
      const mockQuestService = createMockQuestService();

      const { GameFlowManager } = await import('@shared/services/game-flow');
      const gameFlowManager = new GameFlowManager(
        mockStateManager as unknown as IStateManager,
        mockDeckService,
        mockQuestService,
        mockEventBus,
      );

      const overflowResult = calculateOverflow({ consumeAP: 7, currentAP: 3 });
      await gameFlowManager.processAPOverflow(overflowResult);

      const gameOverCalls = (
        mockEventBus.emit as MockedFunction<IEventBus['emit']>
      ).mock.calls.filter((call) => call[0] === GameEventType.GAME_OVER);
      expect(gameOverCalls.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ===========================================================================
  // テストケース4: startDay() AP回復テスト
  // ===========================================================================

  describe('startDay() AP回復', () => {
    it.each([
      { apOverflow: 0, expectedAP: 3 },
      { apOverflow: 1, expectedAP: 2 },
      { apOverflow: 2, expectedAP: 1 },
    ])('T-0119-RECOVERY: apOverflow=$apOverflow → 翌日AP=$expectedAP', async ({
      apOverflow,
      expectedAP,
    }) => {
      // 【テスト目的】: startDay()でAP超過分を差し引いたAP回復が行われること
      // 🔵 REQ-003-01・architecture.md startDay()変更点

      const state = createBaseState({
        apOverflow,
        currentPhase: GamePhase.DELIVERY,
        remainingDays: 100,
        currentDay: 5,
      });
      const mockStateManager = createMockStateManager(state);
      const mockEventBus = createMockEventBus();
      const mockDeckService = createMockDeckService();
      const mockQuestService = createMockQuestService();

      const { GameFlowManager } = await import('@shared/services/game-flow');
      const gameFlowManager = new GameFlowManager(
        mockStateManager as unknown as IStateManager,
        mockDeckService,
        mockQuestService,
        mockEventBus,
      );

      gameFlowManager.startDay();

      // updateStateにactionPointsが設定されていることを確認
      const apCalls = mockStateManager.updateState.mock.calls.filter(
        (call) => call[0]?.actionPoints !== undefined,
      );
      expect(apCalls.length).toBeGreaterThanOrEqual(1);
      const lastAPCall = apCalls[apCalls.length - 1];
      expect(lastAPCall?.[0]?.actionPoints).toBe(expectedAP);
    });

    it('T-0119-RECOVERY-RESET: startDay()でapOverflowが0にリセットされる', async () => {
      // 【テスト目的】: startDay()後にapOverflowが0にリセットされること
      // 🔵 REQ-003-01

      const state = createBaseState({
        apOverflow: 2,
        currentPhase: GamePhase.DELIVERY,
        remainingDays: 100,
        currentDay: 5,
      });
      const mockStateManager = createMockStateManager(state);
      const mockEventBus = createMockEventBus();
      const mockDeckService = createMockDeckService();
      const mockQuestService = createMockQuestService();

      const { GameFlowManager } = await import('@shared/services/game-flow');
      const gameFlowManager = new GameFlowManager(
        mockStateManager as unknown as IStateManager,
        mockDeckService,
        mockQuestService,
        mockEventBus,
      );

      gameFlowManager.startDay();

      // apOverflow=0にリセットされているか確認
      const resetCalls = mockStateManager.updateState.mock.calls.filter(
        (call) => call[0]?.apOverflow === 0,
      );
      expect(resetCalls.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ===========================================================================
  // テストケース5: calculateOverflow + processAPOverflow E2E連携
  // ===========================================================================

  describe('calculateOverflow + processAPOverflow 連携', () => {
    it('T-0119-E2E-01: AP消費4/残AP3 → 1日消費、翌日AP2が正しく設定される', async () => {
      // 【テスト目的】: calculateOverflow → processAPOverflow の一連の流れが正しく動作すること
      // 🔵 REQ-003・dataflow.md

      const state = createBaseState({ remainingDays: 100, currentDay: 10, actionPoints: 3 });
      const mockStateManager = createMockStateManager(state);
      const mockEventBus = createMockEventBus();
      const mockDeckService = createMockDeckService();
      const mockQuestService = createMockQuestService();

      const { GameFlowManager } = await import('@shared/services/game-flow');
      const gameFlowManager = new GameFlowManager(
        mockStateManager as unknown as IStateManager,
        mockDeckService,
        mockQuestService,
        mockEventBus,
      );

      // Step 1: AP超過計算
      const overflowResult = calculateOverflow({ consumeAP: 4, currentAP: 3 });
      expect(overflowResult.hasOverflow).toBe(true);
      expect(overflowResult.daysConsumed).toBe(1);
      expect(overflowResult.nextDayAP).toBe(2);

      // Step 2: 日進行処理
      const advanceResult = await gameFlowManager.processAPOverflow(overflowResult);
      expect(advanceResult.daysAdvanced).toBe(1);
      expect(advanceResult.newActionPoints).toBe(2);
      expect(advanceResult.isGameOver).toBe(false);
    });

    it('T-0119-E2E-02: AP消費6/残AP3 → 1日消費、翌日AP3（ちょうど1日分）', async () => {
      // 【テスト目的】: 超過がちょうど1日分の場合の処理を確認
      // 🔵 REQ-003・architecture.md計算テーブル

      const state = createBaseState({ remainingDays: 100, currentDay: 10, actionPoints: 3 });
      const mockStateManager = createMockStateManager(state);
      const mockEventBus = createMockEventBus();
      const mockDeckService = createMockDeckService();
      const mockQuestService = createMockQuestService();

      const { GameFlowManager } = await import('@shared/services/game-flow');
      const gameFlowManager = new GameFlowManager(
        mockStateManager as unknown as IStateManager,
        mockDeckService,
        mockQuestService,
        mockEventBus,
      );

      const overflowResult = calculateOverflow({ consumeAP: 6, currentAP: 3 });
      expect(overflowResult.daysConsumed).toBe(1);
      expect(overflowResult.nextDayAP).toBe(3);

      const advanceResult = await gameFlowManager.processAPOverflow(overflowResult);
      expect(advanceResult.daysAdvanced).toBe(1);
      expect(advanceResult.newActionPoints).toBe(3);
    });
  });
});
