/**
 * サービスモックファクトリ
 * Issue #313: テストモック共通化
 *
 * @description
 * EventBus, StateManager, GameFlowManager, DIコンテナの
 * モックファクトリ関数を提供する。
 */

import type { IEventBus } from '@shared/services/event-bus';
import type { IGameFlowManager } from '@shared/services/game-flow/game-flow-manager.interface';
import type { IStateManager } from '@shared/services/state-manager';
import type { IGameState } from '@shared/types';
import { GamePhase, GuildRank } from '@shared/types/common';
import { vi } from 'vitest';
import type { MockEventBusWithListeners } from './mock-types';

// =============================================================================
// EventBusモック
// =============================================================================

/**
 * EventBusモックを作成（リスナー管理付き）
 *
 * 実際のEventBusと同様に、emit時にBusEvent形式でラップしてリスナーに配信する。
 * テストでイベント駆動の連携を検証するために使用する。
 * onceメソッドは初回呼び出し後にリスナーを自動解除する。
 */
export const createMockEventBus = (): MockEventBusWithListeners => {
  const listeners = new Map<string, Array<(...args: unknown[]) => void>>();
  return {
    emit: vi.fn().mockImplementation((type: string, payload: unknown) => {
      const busEvent = {
        type,
        payload,
        timestamp: Date.now(),
      };
      const handlers = listeners.get(type) || [];
      for (const handler of handlers) {
        handler(busEvent);
      }
    }),
    on: vi.fn().mockImplementation((event: string, handler: (...args: unknown[]) => void) => {
      const existing = listeners.get(event) || [];
      existing.push(handler);
      listeners.set(event, existing);
      return () => {
        const index = existing.indexOf(handler);
        if (index > -1) {
          existing.splice(index, 1);
        }
      };
    }),
    off: vi.fn(),
    once: vi.fn().mockImplementation((event: string, handler: (...args: unknown[]) => void) => {
      const wrapper = (...args: unknown[]): void => {
        // リスナーを自動解除してからハンドラーを呼び出す
        const existing = listeners.get(event) || [];
        const index = existing.indexOf(wrapper);
        if (index > -1) {
          existing.splice(index, 1);
        }
        handler(...args);
      };
      const existing = listeners.get(event) || [];
      existing.push(wrapper);
      listeners.set(event, existing);
      return () => {
        const current = listeners.get(event) || [];
        const index = current.indexOf(wrapper);
        if (index > -1) {
          current.splice(index, 1);
        }
      };
    }),
    listeners,
  };
};

/**
 * EventBusモックを作成（シンプル版）
 *
 * リスナー管理不要な場合に使用する軽量版。
 * サービステスト等でイベント発行の検証のみ行う場合に適している。
 */
export const createMockEventBusSimple = (): IEventBus =>
  ({
    emit: vi.fn(),
    on: vi.fn().mockReturnValue(vi.fn()),
    off: vi.fn(),
    once: vi.fn(),
  }) as unknown as IEventBus;

// =============================================================================
// StateManagerモック
// =============================================================================

/**
 * StateManagerモックを作成
 *
 * @param stateOverrides - デフォルトの状態を部分的に上書きする
 */
export const createMockStateManager = (
  stateOverrides?: Partial<IGameState>,
): Partial<IStateManager> => ({
  getState: vi.fn().mockReturnValue({
    currentRank: GuildRank.E,
    promotionGauge: 35,
    remainingDays: 25,
    currentDay: 6,
    currentPhase: GamePhase.QUEST_ACCEPT,
    gold: 500,
    actionPoints: 3,
    maxActionPoints: 3,
    comboCount: 0,
    rankHp: 100,
    isPromotionTest: false,
    contribution: 0,
    apOverflow: 0,
    questBoard: {
      boardQuests: [],
      visitorQuests: [],
      lastVisitorUpdateDay: 0,
    },
    ...stateOverrides,
  } as IGameState),
  updateState: vi.fn(),
  setPhase: vi.fn(),
  canTransitionTo: vi.fn().mockReturnValue(true),
  addGold: vi.fn(),
  spendGold: vi.fn().mockReturnValue(true),
  spendActionPoints: vi.fn().mockReturnValue(true),
  addContribution: vi.fn(),
  advanceDay: vi.fn(),
  initialize: vi.fn(),
  reset: vi.fn(),
});

// =============================================================================
// GameFlowManagerモック
// =============================================================================

/**
 * GameFlowManagerモックを作成
 */
export const createMockGameFlowManager = (): Partial<IGameFlowManager> => ({
  getCurrentPhase: vi.fn().mockReturnValue(GamePhase.QUEST_ACCEPT),
  canAdvancePhase: vi.fn().mockReturnValue(true),
  startPhase: vi.fn(),
  endPhase: vi.fn(),
  startNewGame: vi.fn(),
  continueGame: vi.fn(),
  startDay: vi.fn(),
  endDay: vi.fn(),
  skipPhase: vi.fn(),
  requestEndDay: vi.fn(),
  rest: vi.fn(),
  switchPhase: vi.fn().mockResolvedValue({
    success: true,
    previousPhase: GamePhase.QUEST_ACCEPT,
    newPhase: GamePhase.ALCHEMY,
  }),
  checkGameOver: vi.fn().mockReturnValue(null),
  checkGameClear: vi.fn().mockReturnValue(null),
});

// =============================================================================
// DIコンテナモック
// =============================================================================

/**
 * DIコンテナ（Container）モックを作成
 *
 * @param services - サービスキーとモックインスタンスのマッピング
 */
export const createMockDIContainer = (
  services: Record<string, unknown>,
): {
  resolve: ReturnType<typeof vi.fn>;
  register: ReturnType<typeof vi.fn>;
  has: ReturnType<typeof vi.fn>;
} => ({
  resolve: vi.fn((key: string) => {
    if (key in services) return services[key];
    throw new Error(`Service not found: ${key}`);
  }),
  register: vi.fn(),
  has: vi.fn((key: string) => key in services),
});
