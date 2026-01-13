import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  DisposableManager,
  IDisposable,
} from '@/presentation/phaser/utils/DisposableManager';
import { EventListenerManager } from '@/presentation/phaser/utils/EventListenerManager';

// Phaserをモック
vi.mock('phaser', () => ({
  default: {
    Scene: class MockScene {},
    Events: {
      EventEmitter: class MockEventEmitter {
        private listeners: Map<string, Set<Function>> = new Map();
        on(event: string, callback: Function): this {
          if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
          }
          this.listeners.get(event)!.add(callback);
          return this;
        }
        off(event: string, callback: Function): this {
          this.listeners.get(event)?.delete(callback);
          return this;
        }
        emit(event: string, ...args: unknown[]): boolean {
          const callbacks = this.listeners.get(event);
          if (callbacks) {
            callbacks.forEach((cb) => cb(...args));
          }
          return true;
        }
        listenerCount(event: string): number {
          return this.listeners.get(event)?.size ?? 0;
        }
        removeAllListeners(): this {
          this.listeners.clear();
          return this;
        }
      },
    },
    Tweens: {
      Tween: class MockTween {
        private playing: boolean = false;
        isPlaying(): boolean {
          return this.playing;
        }
        stop(): this {
          this.playing = false;
          return this;
        }
        destroy(): void {}
      },
    },
    Time: {
      TimerEvent: class MockTimerEvent {
        destroy(): void {}
      },
    },
  },
}));

import Phaser from 'phaser';

/**
 * シーン遷移時のメモリ管理テスト
 *
 * シーン遷移時にリソースが正しくクリーンアップされることを検証
 */
describe('Scene Transition Memory Test', () => {
  describe('DisposableManagerとEventListenerManagerの統合', () => {
    it('DisposableManagerがEventListenerManagerを管理できる', () => {
      // Arrange
      const disposableManager = new DisposableManager();
      const eventListenerManager = new EventListenerManager();
      const unsubscribe = vi.fn();
      const eventBus = {
        on: vi.fn().mockReturnValue(unsubscribe),
      };

      // Act
      disposableManager.register(eventListenerManager);
      eventListenerManager.addEventBusListener(eventBus, 'test:event', vi.fn());

      // Assert - まだdispose前
      expect(eventListenerManager.count).toBe(1);
      expect(unsubscribe).not.toHaveBeenCalled();

      // Act - dispose実行
      disposableManager.dispose();

      // Assert - dispose後
      expect(unsubscribe).toHaveBeenCalled();
    });

    it('複数のリソースを階層的に管理できる', () => {
      // Arrange
      const rootManager = new DisposableManager();
      const childManager1 = new DisposableManager();
      const childManager2 = new DisposableManager();
      const disposable1: IDisposable = { dispose: vi.fn() };
      const disposable2: IDisposable = { dispose: vi.fn() };
      const disposable3: IDisposable = { dispose: vi.fn() };

      // 階層構造を構築
      rootManager.register(childManager1);
      rootManager.register(childManager2);
      childManager1.register(disposable1);
      childManager2.register(disposable2);
      childManager2.register(disposable3);

      // Act
      rootManager.dispose();

      // Assert - 全ての破棄が呼ばれる
      expect(disposable1.dispose).toHaveBeenCalled();
      expect(disposable2.dispose).toHaveBeenCalled();
      expect(disposable3.dispose).toHaveBeenCalled();
    });
  });

  describe('シーンシミュレーション', () => {
    /**
     * シーンのクリーンアップをシミュレート
     */
    class MockCleanableScene {
      public disposables: DisposableManager;
      public eventListeners: EventListenerManager;
      public events: InstanceType<typeof Phaser.Events.EventEmitter>;
      private _isShutdown: boolean = false;

      constructor() {
        this.disposables = new DisposableManager();
        this.eventListeners = new EventListenerManager();
        this.events = new Phaser.Events.EventEmitter();

        // EventListenerManagerをDisposableManagerに登録
        this.disposables.register(this.eventListeners);

        // シャットダウンイベントをシミュレート
        this.events.on('shutdown', () => this.cleanup());
      }

      registerDisposable(disposable: IDisposable): void {
        this.disposables.register(disposable);
      }

      cleanup(): void {
        if (this._isShutdown) return;
        this._isShutdown = true;
        this.disposables.dispose();
        this.events.removeAllListeners();
      }

      shutdown(): void {
        this.events.emit('shutdown');
      }

      get isShutdown(): boolean {
        return this._isShutdown;
      }
    }

    it('シーンシャットダウン時に全リソースがクリーンアップされる', () => {
      // Arrange
      const scene = new MockCleanableScene();
      const disposable1: IDisposable = { dispose: vi.fn() };
      const disposable2: IDisposable = { dispose: vi.fn() };
      const callback = vi.fn();

      scene.registerDisposable(disposable1);
      scene.registerDisposable(disposable2);
      scene.disposables.onCleanup(callback);

      // Act
      scene.shutdown();

      // Assert
      expect(scene.isShutdown).toBe(true);
      expect(disposable1.dispose).toHaveBeenCalled();
      expect(disposable2.dispose).toHaveBeenCalled();
      expect(callback).toHaveBeenCalled();
    });

    it('シーン遷移を複数回行ってもメモリリークしない', () => {
      // Arrange
      const scenes: MockCleanableScene[] = [];
      const transitions = 10;

      // Act - シーンを作成・破棄を繰り返す
      for (let i = 0; i < transitions; i++) {
        const scene = new MockCleanableScene();

        // 各シーンにリソースを追加
        for (let j = 0; j < 5; j++) {
          scene.registerDisposable({ dispose: vi.fn() });
        }

        scenes.push(scene);

        // 前のシーンをシャットダウン
        if (i > 0) {
          scenes[i - 1].shutdown();
        }
      }

      // 最後のシーンもシャットダウン
      scenes[scenes.length - 1].shutdown();

      // Assert - 全てのシーンがシャットダウンされている
      expect(scenes.every((s) => s.isShutdown)).toBe(true);
    });

    it('イベントリスナーがシーン終了時に解除される', () => {
      // Arrange
      const scene = new MockCleanableScene();
      const unsubscribe1 = vi.fn();
      const unsubscribe2 = vi.fn();
      const eventBus1 = {
        on: vi.fn().mockReturnValue(unsubscribe1),
      };
      const eventBus2 = {
        on: vi.fn().mockReturnValue(unsubscribe2),
      };

      scene.eventListeners.addEventBusListener(eventBus1, 'game:event', vi.fn());
      scene.eventListeners.addEventBusListener(eventBus2, 'player:event', vi.fn());

      expect(scene.eventListeners.count).toBe(2);

      // Act
      scene.shutdown();

      // Assert
      expect(unsubscribe1).toHaveBeenCalledTimes(1);
      expect(unsubscribe2).toHaveBeenCalledTimes(1);
    });
  });

  describe('エッジケース', () => {
    it('dispose中のエラーが他のクリーンアップを妨げない', () => {
      // Arrange
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      const manager = new DisposableManager();
      const errorDisposable: IDisposable = {
        dispose: () => {
          throw new Error('Intentional error');
        },
      };
      const normalDisposable: IDisposable = { dispose: vi.fn() };

      manager.register(errorDisposable);
      manager.register(normalDisposable);

      // Act - エラーが発生しても例外にならない
      expect(() => manager.dispose()).not.toThrow();

      // Assert - normalDisposableは呼ばれる
      expect(normalDisposable.dispose).toHaveBeenCalled();
      consoleError.mockRestore();
    });

    it('dispose後の登録は即座に破棄される', () => {
      // Arrange
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const manager = new DisposableManager();
      manager.dispose();

      const lateDisposable: IDisposable = { dispose: vi.fn() };

      // Act
      manager.register(lateDisposable);

      // Assert - 即座に破棄される
      expect(lateDisposable.dispose).toHaveBeenCalled();
      consoleWarn.mockRestore();
    });
  });
});
