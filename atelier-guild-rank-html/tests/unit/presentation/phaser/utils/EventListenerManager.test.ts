import { describe, it, expect, vi, beforeEach } from 'vitest';

// Phaserをモック
vi.mock('phaser', () => ({
  default: {
    Events: {
      EventEmitter: class MockEventEmitter {
        private listeners: Map<string, Set<{ callback: Function; context?: object }>> =
          new Map();

        on(event: string, callback: Function, context?: object): this {
          if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
          }
          this.listeners.get(event)!.add({ callback, context });
          return this;
        }

        off(event: string, callback: Function, context?: object): this {
          const listeners = this.listeners.get(event);
          if (listeners) {
            for (const listener of listeners) {
              if (listener.callback === callback && listener.context === context) {
                listeners.delete(listener);
                break;
              }
            }
          }
          return this;
        }

        listenerCount(event: string): number {
          return this.listeners.get(event)?.size ?? 0;
        }
      },
    },
    Tweens: {
      Tween: class MockTween {
        private playing: boolean = true;
        private destroyed: boolean = false;

        isPlaying(): boolean {
          return this.playing;
        }

        stop(): this {
          this.playing = false;
          return this;
        }

        destroy(): void {
          this.destroyed = true;
        }

        isDestroyed(): boolean {
          return this.destroyed;
        }
      },
    },
    Time: {
      TimerEvent: class MockTimerEvent {
        private destroyed: boolean = false;

        destroy(): void {
          this.destroyed = true;
        }

        isDestroyed(): boolean {
          return this.destroyed;
        }
      },
    },
  },
}));

import { EventListenerManager } from '@/presentation/phaser/utils/EventListenerManager';
import Phaser from 'phaser';

describe('EventListenerManager', () => {
  let manager: EventListenerManager;

  beforeEach(() => {
    manager = new EventListenerManager();
  });

  describe('addEventBusListener', () => {
    it('EventBusリスナーを登録できる', () => {
      const mockEventBus = {
        on: vi.fn().mockReturnValue(() => {}),
      };

      manager.addEventBusListener(mockEventBus, 'testEvent', () => {});

      expect(mockEventBus.on).toHaveBeenCalledWith('testEvent', expect.any(Function));
      expect(manager.count).toBe(1);
    });

    it('破棄済みの場合は登録されない', () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const mockEventBus = {
        on: vi.fn().mockReturnValue(() => {}),
      };

      manager.dispose();
      manager.addEventBusListener(mockEventBus, 'testEvent', () => {});

      expect(mockEventBus.on).not.toHaveBeenCalled();
      consoleWarn.mockRestore();
    });
  });

  describe('addPhaserListener', () => {
    it('Phaserイベントリスナーを登録できる', () => {
      const emitter = new Phaser.Events.EventEmitter();
      const callback = vi.fn();

      manager.addPhaserListener(emitter, 'testEvent', callback);

      expect(manager.count).toBe(1);
    });
  });

  describe('addDOMListener', () => {
    it('DOMイベントリスナーを登録できる', () => {
      const element = {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      };

      manager.addDOMListener(
        element as unknown as EventTarget,
        'click',
        () => {}
      );

      expect(element.addEventListener).toHaveBeenCalledWith(
        'click',
        expect.any(Function),
        undefined
      );
      expect(manager.count).toBe(1);
    });
  });

  describe('addTween', () => {
    it('Tweenを登録できる', () => {
      const tween = new Phaser.Tweens.Tween(
        {} as unknown as Phaser.Tweens.TweenManager,
        {} as unknown as Phaser.Types.Tweens.TweenBuilderConfig
      );

      manager.addTween(tween);

      expect(manager.count).toBe(1);
    });

    it('破棄済みの場合はTweenが即時破棄される', () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const tween = new Phaser.Tweens.Tween(
        {} as unknown as Phaser.Tweens.TweenManager,
        {} as unknown as Phaser.Types.Tweens.TweenBuilderConfig
      );
      const destroySpy = vi.spyOn(tween, 'destroy');

      manager.dispose();
      manager.addTween(tween);

      expect(destroySpy).toHaveBeenCalled();
      consoleWarn.mockRestore();
    });
  });

  describe('addTimer', () => {
    it('Timerを登録できる', () => {
      const timer = new Phaser.Time.TimerEvent({});

      manager.addTimer(timer);

      expect(manager.count).toBe(1);
    });
  });

  describe('addUnsubscriber', () => {
    it('カスタム解除関数を登録できる', () => {
      const unsubscribe = vi.fn();

      manager.addUnsubscriber(unsubscribe);

      expect(manager.count).toBe(1);
    });
  });

  describe('dispose', () => {
    it('全リスナーを解除する', () => {
      const unsubscribe1 = vi.fn();
      const unsubscribe2 = vi.fn();

      manager.addUnsubscriber(unsubscribe1);
      manager.addUnsubscriber(unsubscribe2);
      manager.dispose();

      expect(unsubscribe1).toHaveBeenCalled();
      expect(unsubscribe2).toHaveBeenCalled();
    });

    it('二重破棄を防ぐ', () => {
      const unsubscribe = vi.fn();

      manager.addUnsubscriber(unsubscribe);
      manager.dispose();
      manager.dispose();

      expect(unsubscribe).toHaveBeenCalledTimes(1);
    });

    it('破棄後はdisposedがtrueになる', () => {
      expect(manager.disposed).toBe(false);

      manager.dispose();

      expect(manager.disposed).toBe(true);
    });

    it('解除時にエラーが発生しても他のリスナーを解除する', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      const unsubscribe1 = vi.fn().mockImplementation(() => {
        throw new Error('Test error');
      });
      const unsubscribe2 = vi.fn();

      manager.addUnsubscriber(unsubscribe1);
      manager.addUnsubscriber(unsubscribe2);
      manager.dispose();

      expect(unsubscribe2).toHaveBeenCalled();
      consoleError.mockRestore();
    });
  });
});
