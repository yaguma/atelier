/**
 * 各フェーズからの日終了 統合テスト
 * Issue #292: TC-004-04
 *
 * @description
 * 依頼受注/採取/調合/納品の各フェーズから「日終了」を実行した際に
 * 正常動作するかを検証する。
 * GameFlowManager + StateManager + EventBus の連携テスト。
 *
 * @信頼性レベル 🔵 REQ-004・設計文書より
 */

import type { IDeckService } from '@domain/interfaces/deck-service.interface';
import type { IQuestService } from '@domain/interfaces/quest-service.interface';
import { EventBus } from '@shared/services/event-bus/EventBus';
import { StateManager } from '@shared/services/state-manager/StateManager';
import { GameEventType, GamePhase } from '@shared/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// =============================================================================
// モック定義
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

describe('TC-004-04: 各フェーズからの日終了（REQ-004）', () => {
  let eventBus: EventBus;
  let stateManager: StateManager;
  let mockDeckService: IDeckService;
  let mockQuestService: IQuestService;

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

  for (const phase of allPhases) {
    it(`${phase}フェーズからrequestEndDay()で正常に日終了される`, async () => {
      // 【テスト目的】: 各フェーズから「日終了」を実行して正常に次の日に進む
      // 🔵 REQ-004: どのフェーズからでも日終了可能

      const { GameFlowManager } = await import('@shared/services/game-flow');
      const gameFlowManager = new GameFlowManager(
        stateManager,
        mockDeckService,
        mockQuestService,
        eventBus,
      );

      // ゲーム開始（day=1で開始される）
      gameFlowManager.startNewGame();
      const initialDay = stateManager.getState().currentDay;

      // 指定フェーズに遷移
      if (stateManager.getState().currentPhase !== phase) {
        stateManager.setPhase(phase);
      }
      expect(stateManager.getState().currentPhase).toBe(phase);

      // イベント記録用
      const events: string[] = [];
      eventBus.on(GameEventType.DAY_ENDED, () => events.push('DAY_ENDED'));
      eventBus.on(GameEventType.DAY_STARTED, () => events.push('DAY_STARTED'));

      // requestEndDay()を実行
      gameFlowManager.requestEndDay();

      // 日が進んでいることを確認
      expect(stateManager.getState().currentDay).toBe(initialDay + 1);

      // DAY_ENDEDとDAY_STARTEDイベントが順番に発行される
      expect(events).toContain('DAY_ENDED');
      expect(events).toContain('DAY_STARTED');

      // 翌日はQUEST_ACCEPTフェーズで開始される
      expect(stateManager.getState().currentPhase).toBe(GamePhase.QUEST_ACCEPT);

      // APが回復している（MAX_AP = 3）
      expect(stateManager.getState().actionPoints).toBe(3);
    });
  }
});
