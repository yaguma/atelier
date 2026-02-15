/**
 * EventBus テストケース
 * TASK-0004 イベントバス実装
 *
 * @description
 * T-0004-01 〜 T-0004-05 を実装
 */

import type { IEventBus } from '@shared/services/event-bus';
import { EventBus } from '@shared/services/event-bus';
import { GameEventType, type IGameEvent } from '@shared/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('EventBus', () => {
  let eventBus: IEventBus;

  beforeEach(() => {
    eventBus = new EventBus();
  });

  // =============================================================================
  // T-0004-01: emitでハンドラーが呼ばれる
  // =============================================================================

  describe('emit', () => {
    it('T-0004-01: emitでハンドラーが呼ばれる', () => {
      const handler = vi.fn();
      eventBus.on(GameEventType.PHASE_CHANGED, handler);

      eventBus.emit(GameEventType.PHASE_CHANGED, { test: 'data' });

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: GameEventType.PHASE_CHANGED,
          payload: { test: 'data' },
        }),
      );
    });

    it('イベントにタイムスタンプが含まれる', () => {
      const handler = vi.fn();
      eventBus.on(GameEventType.DAY_STARTED, handler);

      const beforeTime = Date.now();
      eventBus.emit(GameEventType.DAY_STARTED, {});
      const afterTime = Date.now();

      expect(handler).toHaveBeenCalled();
      const event = handler.mock.calls[0][0];
      expect(event.timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(event.timestamp).toBeLessThanOrEqual(afterTime);
    });

    it('登録されていないイベントタイプでもエラーにならない', () => {
      expect(() => {
        eventBus.emit(GameEventType.GAME_OVER, { reason: 'test' });
      }).not.toThrow();
    });
  });

  // =============================================================================
  // T-0004-02: onで複数ハンドラー登録
  // =============================================================================

  describe('on', () => {
    it('T-0004-02: onで複数ハンドラー登録すると全て実行される', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const handler3 = vi.fn();

      eventBus.on(GameEventType.QUEST_ACCEPTED, handler1);
      eventBus.on(GameEventType.QUEST_ACCEPTED, handler2);
      eventBus.on(GameEventType.QUEST_ACCEPTED, handler3);

      eventBus.emit(GameEventType.QUEST_ACCEPTED, { questId: 'q001' });

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
      expect(handler3).toHaveBeenCalledTimes(1);
    });

    it('異なるイベントタイプのハンドラーは混同しない', () => {
      const phaseHandler = vi.fn();
      const questHandler = vi.fn();

      eventBus.on(GameEventType.PHASE_CHANGED, phaseHandler);
      eventBus.on(GameEventType.QUEST_ACCEPTED, questHandler);

      eventBus.emit(GameEventType.PHASE_CHANGED, {});

      expect(phaseHandler).toHaveBeenCalledTimes(1);
      expect(questHandler).not.toHaveBeenCalled();
    });
  });

  // =============================================================================
  // T-0004-03: onceは1回のみ実行
  // =============================================================================

  describe('once', () => {
    it('T-0004-03: onceは1回のみ実行される', () => {
      const handler = vi.fn();
      eventBus.once(GameEventType.RANK_UP, handler);

      eventBus.emit(GameEventType.RANK_UP, { newRank: 'A' });
      eventBus.emit(GameEventType.RANK_UP, { newRank: 'S' });
      eventBus.emit(GameEventType.RANK_UP, { newRank: 'S' });

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: { newRank: 'A' },
        }),
      );
    });

    it('onceとonを組み合わせて使用できる', () => {
      const onceHandler = vi.fn();
      const onHandler = vi.fn();

      eventBus.once(GameEventType.GAME_CLEARED, onceHandler);
      eventBus.on(GameEventType.GAME_CLEARED, onHandler);

      eventBus.emit(GameEventType.GAME_CLEARED, {});
      eventBus.emit(GameEventType.GAME_CLEARED, {});

      expect(onceHandler).toHaveBeenCalledTimes(1);
      expect(onHandler).toHaveBeenCalledTimes(2);
    });
  });

  // =============================================================================
  // T-0004-04: offで購読解除
  // =============================================================================

  describe('off', () => {
    it('T-0004-04: offで購読解除すると実行されない', () => {
      const handler = vi.fn();
      eventBus.on(GameEventType.DAY_ENDED, handler);

      eventBus.emit(GameEventType.DAY_ENDED, {});
      expect(handler).toHaveBeenCalledTimes(1);

      eventBus.off(GameEventType.DAY_ENDED, handler);

      eventBus.emit(GameEventType.DAY_ENDED, {});
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('存在しないハンドラーをoffしてもエラーにならない', () => {
      const handler = vi.fn();
      expect(() => {
        eventBus.off(GameEventType.QUEST_FAILED, handler);
      }).not.toThrow();
    });

    it('特定のハンドラーのみ解除される', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      eventBus.on(GameEventType.GATHERING_COMPLETED, handler1);
      eventBus.on(GameEventType.GATHERING_COMPLETED, handler2);

      eventBus.off(GameEventType.GATHERING_COMPLETED, handler1);

      eventBus.emit(GameEventType.GATHERING_COMPLETED, {});

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalledTimes(1);
    });
  });

  // =============================================================================
  // T-0004-05: 戻り値のunsubscribeで解除
  // =============================================================================

  describe('unsubscribe（on戻り値）', () => {
    it('T-0004-05: 戻り値のunsubscribeで購読解除できる', () => {
      const handler = vi.fn();
      const unsubscribe = eventBus.on(GameEventType.ALCHEMY_COMPLETED, handler);

      eventBus.emit(GameEventType.ALCHEMY_COMPLETED, {});
      expect(handler).toHaveBeenCalledTimes(1);

      unsubscribe();

      eventBus.emit(GameEventType.ALCHEMY_COMPLETED, {});
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('unsubscribe関数を複数回呼んでもエラーにならない', () => {
      const handler = vi.fn();
      const unsubscribe = eventBus.on(GameEventType.RANK_DAMAGED, handler);

      unsubscribe();
      expect(() => unsubscribe()).not.toThrow();
    });
  });

  // =============================================================================
  // 追加テスト: 型安全性
  // =============================================================================

  describe('型安全性', () => {
    it('型パラメータを使用したイベント発行ができる', () => {
      interface PhasePayload {
        previousPhase: string;
        newPhase: string;
      }

      const handler = vi.fn<[{ type: GameEventType; payload: PhasePayload; timestamp: number }]>();
      eventBus.on<PhasePayload>(GameEventType.PHASE_CHANGED, handler);

      const payload: PhasePayload = {
        previousPhase: 'GATHERING',
        newPhase: 'ALCHEMY',
      };
      eventBus.emit<PhasePayload>(GameEventType.PHASE_CHANGED, payload);

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          payload,
        }),
      );
    });
  });
});
