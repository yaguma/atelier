/**
 * フェーズ自由遷移 統合テスト
 * TASK-0118: 統合テスト - フェーズ自由遷移
 *
 * @description
 * GameFlowManager + StateManager + EventBus の連携を検証する。
 * 全12パターンのフェーズ遷移、イベント発行、進行中操作チェックをテスト。
 *
 * @信頼性レベル 🔵 REQ-001・設計文書より
 */

import type { IDeckService } from '@domain/interfaces/deck-service.interface';
import type { IQuestService } from '@domain/interfaces/quest-service.interface';
import { EventBus } from '@shared/services/event-bus/EventBus';
import { StateManager } from '@shared/services/state-manager/StateManager';
import { GameEventType, GamePhase, PhaseSwitchFailureReason } from '@shared/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// =============================================================================
// モック定義（GameFlowManagerの依存のうちフェーズ遷移に無関係なもの）
// =============================================================================

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

describe('フェーズ自由遷移 統合テスト（TASK-0118）', () => {
  let eventBus: EventBus;
  let stateManager: StateManager;
  let mockDeckService: IDeckService;
  let mockQuestService: IQuestService;

  // 全フェーズ一覧
  const allPhases = [
    GamePhase.QUEST_ACCEPT,
    GamePhase.GATHERING,
    GamePhase.ALCHEMY,
    GamePhase.DELIVERY,
  ] as const;

  beforeEach(() => {
    eventBus = new EventBus();
    stateManager = new StateManager(eventBus);
    mockDeckService = createMockDeckService();
    mockQuestService = createMockQuestService();
  });

  // ===========================================================================
  // テストケース1: 全12パターンのフェーズ遷移
  // ===========================================================================

  describe('全12パターンのフェーズ遷移', () => {
    for (const from of allPhases) {
      for (const to of allPhases) {
        if (from === to) continue;

        it(`T-0118-${from}-${to}: ${from} → ${to} への遷移が成功する`, async () => {
          // 【テスト目的】: 任意のフェーズ間で自由遷移が可能であることを確認
          // 🔵 REQ-001: フェーズ遷移の自由化

          const { GameFlowManager } = await import('@shared/services/game-flow');
          const gameFlowManager = new GameFlowManager(
            stateManager,
            mockDeckService,
            mockQuestService,
            eventBus,
          );

          // 開始フェーズに設定（初期状態と異なる場合のみ遷移）
          if (stateManager.getState().currentPhase !== from) {
            stateManager.setPhase(from);
          }
          expect(stateManager.getState().currentPhase).toBe(from);

          // フェーズ遷移実行
          const result = await gameFlowManager.switchPhase({ targetPhase: to });

          // 遷移成功を確認
          expect(result.success).toBe(true);
          expect(result.previousPhase).toBe(from);
          expect(result.newPhase).toBe(to);
          expect(stateManager.getState().currentPhase).toBe(to);
        });
      }
    }
  });

  // ===========================================================================
  // テストケース2: 同一フェーズへの遷移（no-op）
  // ===========================================================================

  describe('同一フェーズへの遷移', () => {
    for (const phase of allPhases) {
      it(`${phase} → ${phase} への遷移はno-op（成功、フェーズ不変）`, async () => {
        // 【テスト目的】: 同一フェーズへのswitchPhase()がno-opで成功を返すこと
        // 🔵 REQ-001: switchPhase()仕様

        const { GameFlowManager } = await import('@shared/services/game-flow');
        const gameFlowManager = new GameFlowManager(
          stateManager,
          mockDeckService,
          mockQuestService,
          eventBus,
        );

        // 開始フェーズに設定（初期状態と異なる場合のみ遷移）
        if (stateManager.getState().currentPhase !== phase) {
          stateManager.setPhase(phase);
        }

        const result = await gameFlowManager.switchPhase({ targetPhase: phase });

        expect(result.success).toBe(true);
        expect(result.previousPhase).toBe(phase);
        expect(result.newPhase).toBe(phase);
        expect(stateManager.getState().currentPhase).toBe(phase);
      });
    }
  });

  // ===========================================================================
  // テストケース3: PHASE_CHANGEDイベント発行
  // ===========================================================================

  describe('PHASE_CHANGEDイベント発行', () => {
    it('T-0118-EVENT-01: フェーズ遷移時にPHASE_CHANGEDイベントが発行される', async () => {
      // 【テスト目的】: switchPhase()実行後にPHASE_CHANGEDイベントが正しく発行されること
      // 🔵 REQ-001: イベント駆動設計

      const { GameFlowManager } = await import('@shared/services/game-flow');
      const gameFlowManager = new GameFlowManager(
        stateManager,
        mockDeckService,
        mockQuestService,
        eventBus,
      );

      const handler = vi.fn();
      eventBus.on(GameEventType.PHASE_CHANGED, handler);

      await gameFlowManager.switchPhase({ targetPhase: GamePhase.GATHERING });

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: {
            previousPhase: GamePhase.QUEST_ACCEPT,
            newPhase: GamePhase.GATHERING,
          },
        }),
      );
    });

    it('T-0118-EVENT-02: 同一フェーズへの遷移ではPHASE_CHANGEDイベントが発行されない', async () => {
      // 【テスト目的】: no-op遷移ではイベントが発行されないこと
      // 🔵 REQ-001: 不要なイベント抑制

      const { GameFlowManager } = await import('@shared/services/game-flow');
      const gameFlowManager = new GameFlowManager(
        stateManager,
        mockDeckService,
        mockQuestService,
        eventBus,
      );

      const handler = vi.fn();
      eventBus.on(GameEventType.PHASE_CHANGED, handler);

      await gameFlowManager.switchPhase({ targetPhase: GamePhase.QUEST_ACCEPT });

      expect(handler).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // テストケース4: 進行中操作チェック（採取セッション等）
  // ===========================================================================

  describe('進行中操作チェック', () => {
    it('T-0118-ACTIVE-01: 進行中操作があるとき、遷移が拒否される', async () => {
      // 【テスト目的】: 採取セッション中などのフェーズ遷移がブロックされること
      // 🟡 信頼性レベル: dataflow.md セクション3.2から妥当な推測

      const activeOperationChecker = vi.fn().mockReturnValue(true);

      const { GameFlowManager } = await import('@shared/services/game-flow');
      const gameFlowManager = new GameFlowManager(
        stateManager,
        mockDeckService,
        mockQuestService,
        eventBus,
        activeOperationChecker,
      );

      const result = await gameFlowManager.switchPhase({
        targetPhase: GamePhase.GATHERING,
      });

      expect(result.success).toBe(false);
      expect(result.failureReason).toBe(PhaseSwitchFailureReason.SESSION_ABORT_REJECTED);
      expect(stateManager.getState().currentPhase).toBe(GamePhase.QUEST_ACCEPT);
    });

    it('T-0118-ACTIVE-02: forceAbort=trueで進行中操作があっても遷移できる', async () => {
      // 【テスト目的】: forceAbortフラグで強制遷移が可能であること
      // 🟡 信頼性レベル: dataflow.md セクション3.2から妥当な推測

      const activeOperationChecker = vi.fn().mockReturnValue(true);

      const { GameFlowManager } = await import('@shared/services/game-flow');
      const gameFlowManager = new GameFlowManager(
        stateManager,
        mockDeckService,
        mockQuestService,
        eventBus,
        activeOperationChecker,
      );

      const result = await gameFlowManager.switchPhase({
        targetPhase: GamePhase.ALCHEMY,
        forceAbort: true,
      });

      expect(result.success).toBe(true);
      expect(result.newPhase).toBe(GamePhase.ALCHEMY);
      expect(stateManager.getState().currentPhase).toBe(GamePhase.ALCHEMY);
    });

    it('T-0118-ACTIVE-03: 進行中操作がないとき、通常通り遷移できる', async () => {
      // 【テスト目的】: activeOperationCheckerがfalseなら通常遷移が可能であること
      // 🔵 REQ-001

      const activeOperationChecker = vi.fn().mockReturnValue(false);

      const { GameFlowManager } = await import('@shared/services/game-flow');
      const gameFlowManager = new GameFlowManager(
        stateManager,
        mockDeckService,
        mockQuestService,
        eventBus,
        activeOperationChecker,
      );

      const result = await gameFlowManager.switchPhase({
        targetPhase: GamePhase.DELIVERY,
      });

      expect(result.success).toBe(true);
      expect(result.newPhase).toBe(GamePhase.DELIVERY);
    });
  });

  // ===========================================================================
  // テストケース5: VALID_PHASE_TRANSITIONSの網羅確認
  // ===========================================================================

  describe('VALID_PHASE_TRANSITIONSの網羅確認', () => {
    it('T-0118-VALID-01: 全4フェーズから他の全3フェーズへの遷移が許可されている', async () => {
      // 【テスト目的】: VALID_PHASE_TRANSITIONSが全ペアをカバーしていることを確認
      // 🔵 REQ-001: 自由遷移定義

      const { VALID_PHASE_TRANSITIONS } = await import(
        '@shared/services/state-manager/initial-state'
      );

      for (const from of allPhases) {
        const validTargets = VALID_PHASE_TRANSITIONS[from];
        for (const to of allPhases) {
          if (from === to) continue;
          expect(validTargets).toContain(to);
        }
      }
    });

    it('T-0118-VALID-02: StateManager.canTransitionTo()が全遷移を許可する', () => {
      // 【テスト目的】: StateManagerの遷移バリデーションが全ペアを許可すること
      // 🔵 REQ-001

      for (const from of allPhases) {
        // 開始フェーズに設定（初期状態と異なる場合のみ遷移）
        if (stateManager.getState().currentPhase !== from) {
          stateManager.setPhase(from);
        }
        for (const to of allPhases) {
          if (from === to) continue;
          expect(stateManager.canTransitionTo(to)).toBe(true);
        }
      }
    });
  });

  // ===========================================================================
  // テストケース6: 連続フェーズ遷移
  // ===========================================================================

  describe('連続フェーズ遷移', () => {
    it('T-0118-SEQ-01: 複数回の連続遷移が正しく動作する', async () => {
      // 【テスト目的】: 連続的なフェーズ切り替えで状態が正しく更新されること
      // 🔵 REQ-001

      const { GameFlowManager } = await import('@shared/services/game-flow');
      const gameFlowManager = new GameFlowManager(
        stateManager,
        mockDeckService,
        mockQuestService,
        eventBus,
      );

      const handler = vi.fn();
      eventBus.on(GameEventType.PHASE_CHANGED, handler);

      // QUEST_ACCEPT → ALCHEMY → GATHERING → DELIVERY → QUEST_ACCEPT
      const sequence = [
        GamePhase.ALCHEMY,
        GamePhase.GATHERING,
        GamePhase.DELIVERY,
        GamePhase.QUEST_ACCEPT,
      ];

      for (const target of sequence) {
        const result = await gameFlowManager.switchPhase({ targetPhase: target });
        expect(result.success).toBe(true);
        expect(stateManager.getState().currentPhase).toBe(target);
      }

      // 4回のPHASE_CHANGEDイベントが発行される
      expect(handler).toHaveBeenCalledTimes(4);
    });

    it('T-0118-SEQ-02: 逆方向の遷移も含む自由なパターンが動作する', async () => {
      // 【テスト目的】: 固定順序でなく自由な順序での遷移が可能であること
      // 🔵 REQ-001: 順方向・逆方向・スキップ遷移

      const { GameFlowManager } = await import('@shared/services/game-flow');
      const gameFlowManager = new GameFlowManager(
        stateManager,
        mockDeckService,
        mockQuestService,
        eventBus,
      );

      // 逆方向を含む自由遷移
      await gameFlowManager.switchPhase({ targetPhase: GamePhase.DELIVERY });
      expect(stateManager.getState().currentPhase).toBe(GamePhase.DELIVERY);

      await gameFlowManager.switchPhase({ targetPhase: GamePhase.QUEST_ACCEPT });
      expect(stateManager.getState().currentPhase).toBe(GamePhase.QUEST_ACCEPT);

      await gameFlowManager.switchPhase({ targetPhase: GamePhase.ALCHEMY });
      expect(stateManager.getState().currentPhase).toBe(GamePhase.ALCHEMY);

      await gameFlowManager.switchPhase({ targetPhase: GamePhase.GATHERING });
      expect(stateManager.getState().currentPhase).toBe(GamePhase.GATHERING);
    });
  });
});
