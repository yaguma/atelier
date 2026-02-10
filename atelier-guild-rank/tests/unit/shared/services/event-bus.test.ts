/**
 * shared/services/event-bus テスト
 * TASK-0066: shared/services移行
 *
 * @description
 * EventBusの移行確認と機能確認テスト
 */

import type { IEventBus } from '@shared/services/event-bus';
import { EventBus } from '@shared/services/event-bus';
import { GameEventType } from '@shared/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('shared/services/event-bus', () => {
  describe('移行確認', () => {
    it('@shared/services/event-busからEventBusがインポートできること', () => {
      expect(EventBus).toBeDefined();
      expect(typeof EventBus).toBe('function');
    });

    it('EventBusのインスタンスを作成できること', () => {
      const eventBus = new EventBus();
      expect(eventBus).toBeInstanceOf(EventBus);
    });

    it('IEventBusインターフェースを満たすこと', () => {
      const eventBus: IEventBus = new EventBus();
      expect(typeof eventBus.emit).toBe('function');
      expect(typeof eventBus.on).toBe('function');
      expect(typeof eventBus.once).toBe('function');
      expect(typeof eventBus.off).toBe('function');
    });
  });

  describe('機能確認', () => {
    let eventBus: IEventBus;

    beforeEach(() => {
      eventBus = new EventBus();
    });

    it('イベント登録・発火が正常に動作すること', () => {
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

    it('イベント解除が正常に動作すること', () => {
      const handler = vi.fn();
      eventBus.on(GameEventType.DAY_STARTED, handler);

      eventBus.emit(GameEventType.DAY_STARTED, {});
      expect(handler).toHaveBeenCalledTimes(1);

      eventBus.off(GameEventType.DAY_STARTED, handler);
      eventBus.emit(GameEventType.DAY_STARTED, {});
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('unsubscribe関数で購読解除できること', () => {
      const handler = vi.fn();
      const unsubscribe = eventBus.on(GameEventType.QUEST_ACCEPTED, handler);

      eventBus.emit(GameEventType.QUEST_ACCEPTED, {});
      expect(handler).toHaveBeenCalledTimes(1);

      unsubscribe();
      eventBus.emit(GameEventType.QUEST_ACCEPTED, {});
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('onceで1回のみ購読できること', () => {
      const handler = vi.fn();
      eventBus.once(GameEventType.RANK_UP, handler);

      eventBus.emit(GameEventType.RANK_UP, { rank: 'A' });
      eventBus.emit(GameEventType.RANK_UP, { rank: 'S' });

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: { rank: 'A' },
        }),
      );
    });

    it('複数のハンドラーを登録できること', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      eventBus.on(GameEventType.GOLD_CHANGED, handler1);
      eventBus.on(GameEventType.GOLD_CHANGED, handler2);

      eventBus.emit(GameEventType.GOLD_CHANGED, { amount: 100 });

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
    });

    it('タイムスタンプが含まれること', () => {
      const handler = vi.fn();
      eventBus.on(GameEventType.DAY_ENDED, handler);

      const before = Date.now();
      eventBus.emit(GameEventType.DAY_ENDED, {});
      const after = Date.now();

      const event = handler.mock.calls[0][0];
      expect(event.timestamp).toBeGreaterThanOrEqual(before);
      expect(event.timestamp).toBeLessThanOrEqual(after);
    });
  });
});
