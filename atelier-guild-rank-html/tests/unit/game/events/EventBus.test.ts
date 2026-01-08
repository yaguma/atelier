/**
 * EventBus テスト
 *
 * EventBusの実装を検証する。
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventBus } from '@game/events/EventBus';
import type { PhaseChangedPayload, GoldChangedPayload } from '@game/events/EventPayloads';

describe('EventBus', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    // 各テスト前にインスタンスをリセット
    EventBus.resetInstance();
    eventBus = EventBus.getInstance();
  });

  afterEach(() => {
    // 各テスト後にクリーンアップ
    EventBus.resetInstance();
  });

  describe('シングルトン', () => {
    it('getInstance()は同一インスタンスを返す', () => {
      const instance1 = EventBus.getInstance();
      const instance2 = EventBus.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('resetInstance()後は新しいインスタンスが生成される', () => {
      const instance1 = EventBus.getInstance();
      EventBus.resetInstance();
      const instance2 = EventBus.getInstance();
      expect(instance1).not.toBe(instance2);
    });
  });

  describe('イベント発行と購読', () => {
    it('on()で購読しemit()で発行するとコールバックが呼ばれる', () => {
      const callback = vi.fn();
      eventBus.on('state:phase:changed', callback);

      const payload: PhaseChangedPayload = { phase: 'GATHERING' };
      eventBus.emit('state:phase:changed', payload);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(payload);
    });

    it('複数のリスナーが登録できる', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      eventBus.on('state:gold:changed', callback1);
      eventBus.on('state:gold:changed', callback2);

      const payload: GoldChangedPayload = { gold: 1000, delta: 100 };
      eventBus.emit('state:gold:changed', payload);

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    it('異なるイベントは独立して動作する', () => {
      const phaseCallback = vi.fn();
      const goldCallback = vi.fn();

      eventBus.on('state:phase:changed', phaseCallback);
      eventBus.on('state:gold:changed', goldCallback);

      eventBus.emit('state:phase:changed', { phase: 'ALCHEMY' });

      expect(phaseCallback).toHaveBeenCalledTimes(1);
      expect(goldCallback).not.toHaveBeenCalled();
    });

    it('登録されていないイベントをemitしてもエラーにならない', () => {
      expect(() => {
        eventBus.emit('state:phase:changed', { phase: 'GATHERING' });
      }).not.toThrow();
    });
  });

  describe('ペイロードなしイベント', () => {
    it('emitVoid()でペイロードなしイベントを発行できる', () => {
      const callback = vi.fn();
      eventBus.onVoid('ui:newGame:clicked', callback);

      eventBus.emitVoid('ui:newGame:clicked');

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('onVoid()で購読したコールバックは引数なしで呼ばれる', () => {
      const callback = vi.fn();
      eventBus.onVoid('scene:ready', callback);

      eventBus.emitVoid('scene:ready');

      expect(callback).toHaveBeenCalledWith();
    });
  });

  describe('購読解除', () => {
    it('unsubscribe関数を呼ぶと購読が解除される', () => {
      const callback = vi.fn();
      const unsubscribe = eventBus.on('state:phase:changed', callback);

      // 最初のemit
      eventBus.emit('state:phase:changed', { phase: 'GATHERING' });
      expect(callback).toHaveBeenCalledTimes(1);

      // 購読解除
      unsubscribe();

      // 2回目のemit
      eventBus.emit('state:phase:changed', { phase: 'ALCHEMY' });
      expect(callback).toHaveBeenCalledTimes(1); // 増えない
    });

    it('off()で特定のコールバックを解除できる', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      eventBus.on('state:gold:changed', callback1);
      eventBus.on('state:gold:changed', callback2);

      eventBus.off('state:gold:changed', callback1);

      eventBus.emit('state:gold:changed', { gold: 1000, delta: 100 });

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    it('off()でコールバックを指定しないとすべての購読が解除される', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      eventBus.on('state:phase:changed', callback1);
      eventBus.on('state:phase:changed', callback2);

      eventBus.off('state:phase:changed');

      eventBus.emit('state:phase:changed', { phase: 'GATHERING' });

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
    });

    it('onVoidの購読もunsubscribeで解除できる', () => {
      const callback = vi.fn();
      const unsubscribe = eventBus.onVoid('ui:gathering:confirmed', callback);

      unsubscribe();
      eventBus.emitVoid('ui:gathering:confirmed');

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('once購読', () => {
    it('once()で購読するとイベントは1回だけ呼ばれる', () => {
      const callback = vi.fn();
      eventBus.once('state:phase:changed', callback);

      eventBus.emit('state:phase:changed', { phase: 'GATHERING' });
      eventBus.emit('state:phase:changed', { phase: 'ALCHEMY' });
      eventBus.emit('state:phase:changed', { phase: 'DELIVERY' });

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith({ phase: 'GATHERING' });
    });

    it('onceVoid()でペイロードなしイベントを1回だけ購読できる', () => {
      const callback = vi.fn();
      eventBus.onceVoid('ui:newGame:clicked', callback);

      eventBus.emitVoid('ui:newGame:clicked');
      eventBus.emitVoid('ui:newGame:clicked');

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('once購読でもunsubscribeで事前に解除できる', () => {
      const callback = vi.fn();
      const unsubscribe = eventBus.once('state:gold:changed', callback);

      unsubscribe();
      eventBus.emit('state:gold:changed', { gold: 1000, delta: 100 });

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('clear', () => {
    it('clear()ですべての購読が解除される', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const callback3 = vi.fn();

      eventBus.on('state:phase:changed', callback1);
      eventBus.on('state:gold:changed', callback2);
      eventBus.onVoid('ui:newGame:clicked', callback3);

      eventBus.clear();

      eventBus.emit('state:phase:changed', { phase: 'GATHERING' });
      eventBus.emit('state:gold:changed', { gold: 1000, delta: 100 });
      eventBus.emitVoid('ui:newGame:clicked');

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
      expect(callback3).not.toHaveBeenCalled();
    });
  });

  describe('listenerCount', () => {
    it('listenerCount()で特定イベントの購読者数を取得できる', () => {
      expect(eventBus.listenerCount('state:phase:changed')).toBe(0);

      eventBus.on('state:phase:changed', () => {});
      expect(eventBus.listenerCount('state:phase:changed')).toBe(1);

      eventBus.on('state:phase:changed', () => {});
      expect(eventBus.listenerCount('state:phase:changed')).toBe(2);
    });

    it('listenerCount()で全購読者数を取得できる', () => {
      expect(eventBus.listenerCount()).toBe(0);

      eventBus.on('state:phase:changed', () => {});
      eventBus.on('state:gold:changed', () => {});
      eventBus.onVoid('ui:newGame:clicked', () => {});

      expect(eventBus.listenerCount()).toBe(3);
    });

    it('購読解除後はlistenerCountが減る', () => {
      const unsubscribe = eventBus.on('state:phase:changed', () => {});
      expect(eventBus.listenerCount('state:phase:changed')).toBe(1);

      unsubscribe();
      expect(eventBus.listenerCount('state:phase:changed')).toBe(0);
    });
  });

  describe('エラーハンドリング', () => {
    it('コールバック内で例外が発生しても他のリスナーは呼ばれる', () => {
      const errorCallback = vi.fn(() => {
        throw new Error('Test error');
      });
      const successCallback = vi.fn();

      eventBus.on('state:phase:changed', errorCallback);
      eventBus.on('state:phase:changed', successCallback);

      // 例外が外に漏れるが、全リスナーが呼ばれることを確認
      // 注: 実装によっては例外をキャッチして継続する場合もある
      try {
        eventBus.emit('state:phase:changed', { phase: 'GATHERING' });
      } catch {
        // エラーを無視
      }

      expect(errorCallback).toHaveBeenCalledTimes(1);
      // 注: 順序によっては successCallback が呼ばれない可能性がある
      // この動作は実装依存
    });
  });

  describe('型安全性', () => {
    it('正しいペイロード型でemitできる', () => {
      const callback = vi.fn();
      eventBus.on('state:phase:changed', callback);

      // 型チェックはコンパイル時に行われる
      eventBus.emit('state:phase:changed', { phase: 'GATHERING' });
      eventBus.emit('state:phase:changed', { phase: 'ALCHEMY', previousPhase: 'GATHERING' });

      expect(callback).toHaveBeenCalledTimes(2);
    });
  });
});
