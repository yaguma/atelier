/**
 * IEventBus テスト
 *
 * EventBusインターフェースの型定義を検証する。
 */

import { describe, it, expect } from 'vitest';
import type { IEventBus, EventCallback, VoidEventCallback, UnsubscribeFn } from '@game/events/IEventBus';
import type { EventPayloadMap } from '@game/events/EventPayloads';

describe('IEventBus', () => {
  describe('インターフェース型チェック', () => {
    it('IEventBusインターフェースが正しく定義されている', () => {
      // モック実装で型チェック
      const mockEventBus: IEventBus = {
        emit: <K extends keyof EventPayloadMap>(
          _event: K,
          _payload: EventPayloadMap[K]
        ): void => {},
        emitVoid: (_event): void => {},
        on: <K extends keyof EventPayloadMap>(
          _event: K,
          _callback: EventCallback<EventPayloadMap[K]>
        ): UnsubscribeFn => {
          return () => {};
        },
        onVoid: (_event, _callback: VoidEventCallback): UnsubscribeFn => {
          return () => {};
        },
        once: <K extends keyof EventPayloadMap>(
          _event: K,
          _callback: EventCallback<EventPayloadMap[K]>
        ): UnsubscribeFn => {
          return () => {};
        },
        onceVoid: (_event, _callback: VoidEventCallback): UnsubscribeFn => {
          return () => {};
        },
        off: (_event, _callback?): void => {},
        clear: (): void => {},
        listenerCount: (_event): number => 0,
      };

      // インターフェースが正しく実装されていることを確認
      expect(typeof mockEventBus.emit).toBe('function');
      expect(typeof mockEventBus.emitVoid).toBe('function');
      expect(typeof mockEventBus.on).toBe('function');
      expect(typeof mockEventBus.onVoid).toBe('function');
      expect(typeof mockEventBus.once).toBe('function');
      expect(typeof mockEventBus.onceVoid).toBe('function');
      expect(typeof mockEventBus.off).toBe('function');
      expect(typeof mockEventBus.clear).toBe('function');
      expect(typeof mockEventBus.listenerCount).toBe('function');
    });

    it('emitは型安全にペイロードを受け取る', () => {
      const _testEmit = (bus: IEventBus): void => {
        // 正しいペイロード型
        bus.emit('state:phase:changed', { phase: 'GATHERING' });
        bus.emit('state:gold:changed', { gold: 100, delta: 50 });
        bus.emit('ui:quest:selected', { questId: 'quest-001' });
      };

      expect(typeof _testEmit).toBe('function');
    });

    it('onは型安全にコールバックを受け取る', () => {
      const _testOn = (bus: IEventBus): void => {
        // コールバックのペイロード型が推論される
        bus.on('state:phase:changed', (payload) => {
          // payload.phase の型が GamePhase であることをコンパイラが確認
          const phase = payload.phase;
          void phase;
        });

        bus.on('state:gold:changed', (payload) => {
          // payload.gold, payload.delta の型が number であることをコンパイラが確認
          const gold = payload.gold;
          const delta = payload.delta;
          void gold;
          void delta;
        });
      };

      expect(typeof _testOn).toBe('function');
    });

    it('onは購読解除関数を返す', () => {
      const mockEventBus: IEventBus = {
        emit: () => {},
        emitVoid: () => {},
        on: () => () => {},
        onVoid: () => () => {},
        once: () => () => {},
        onceVoid: () => () => {},
        off: () => {},
        clear: () => {},
        listenerCount: () => 0,
      };

      const unsubscribe = mockEventBus.on('state:phase:changed', () => {});
      expect(typeof unsubscribe).toBe('function');
    });

    it('emitVoidはペイロードなしイベントを発行できる', () => {
      const _testEmitVoid = (bus: IEventBus): void => {
        bus.emitVoid('ui:newGame:clicked');
        bus.emitVoid('ui:gathering:confirmed');
        bus.emitVoid('scene:ready');
      };

      expect(typeof _testEmitVoid).toBe('function');
    });

    it('onVoidはペイロードなしイベントを購読できる', () => {
      const _testOnVoid = (bus: IEventBus): void => {
        bus.onVoid('ui:newGame:clicked', () => {
          // コールバックはペイロードなし
        });

        bus.onVoid('scene:ready', () => {
          // コールバックはペイロードなし
        });
      };

      expect(typeof _testOnVoid).toBe('function');
    });
  });

  describe('EventCallback / VoidEventCallback / UnsubscribeFn', () => {
    it('EventCallbackは正しい型を持つ', () => {
      const callback: EventCallback<{ phase: string }> = (payload) => {
        void payload.phase;
      };
      expect(typeof callback).toBe('function');
    });

    it('VoidEventCallbackは引数なしの関数型', () => {
      const callback: VoidEventCallback = () => {
        // 引数なし
      };
      expect(typeof callback).toBe('function');
    });

    it('UnsubscribeFnは引数なし、戻り値なしの関数型', () => {
      const unsubscribe: UnsubscribeFn = () => {
        // 引数なし、戻り値なし
      };
      expect(typeof unsubscribe).toBe('function');
    });
  });
});
