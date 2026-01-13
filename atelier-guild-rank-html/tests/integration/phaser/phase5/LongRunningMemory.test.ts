import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ObjectPool, PoolableObject } from '@/presentation/phaser/utils/ObjectPool';
import { WeakCache } from '@/presentation/phaser/utils/WeakCache';
import { DisposableManager } from '@/presentation/phaser/utils/DisposableManager';
import { EventListenerManager } from '@/presentation/phaser/utils/EventListenerManager';

// Phaserをモック
vi.mock('phaser', () => ({
  default: {
    Scene: class MockScene {},
    GameObjects: {
      GameObject: class MockGameObject {},
      Container: class MockContainer {
        constructor() {}
        add() { return this; }
        setSize() { return this; }
        setPosition() { return this; }
        setScale() { return this; }
        setAlpha() { return this; }
        setAngle() { return this; }
        removeInteractive() { return this; }
        removeAllListeners() { return this; }
        setActive() { return this; }
        setVisible() { return this; }
        destroy() {}
      },
    },
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
        removeAllListeners(): this {
          this.listeners.clear();
          return this;
        }
      },
    },
    Tweens: {
      Tween: class MockTween {
        isPlaying(): boolean {
          return false;
        }
        stop(): this {
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

/**
 * テスト用Poolableオブジェクト
 */
class TestPoolableObject implements PoolableObject {
  private _isPooled: boolean = false;
  private _active: boolean = true;
  private _visible: boolean = true;
  public resetCount: number = 0;
  public testData: unknown = null;

  reset(): void {
    this.resetCount++;
    this.testData = null;
  }

  setPooled(pooled: boolean): void {
    this._isPooled = pooled;
  }

  isPooled(): boolean {
    return this._isPooled;
  }

  setActive(active: boolean): this {
    this._active = active;
    return this;
  }

  setVisible(visible: boolean): this {
    this._visible = visible;
    return this;
  }

  destroy(): void {}

  // 必須プロパティ（最小限）
  scene = {} as unknown;
  type = 'TestObject';
  state = 0;
  parentContainer = null;
  name = 'test';
  tabIndex = -1;
  data = null;
  renderFlags = 0;
  cameraFilter = 0;
  input = null;
  body = null;
  ignoreDestroy = false;

  get active(): boolean {
    return this._active;
  }

  get visible(): boolean {
    return this._visible;
  }

  // 最小限のメソッドスタブ
  setData(): this {
    return this;
  }
  incData(): this {
    return this;
  }
  toggleData(): this {
    return this;
  }
  getData(): unknown {
    return undefined;
  }
  setDataEnabled(): this {
    return this;
  }
  setInteractive(): this {
    return this;
  }
  disableInteractive(): this {
    return this;
  }
  removeInteractive(): this {
    return this;
  }
  addedToScene(): void {}
  removedFromScene(): void {}
  update(): void {}
  toJSON(): unknown {
    return {};
  }
  willRender(): boolean {
    return true;
  }
  getIndexList(): number[] {
    return [];
  }
  addListener(): this {
    return this;
  }
  on(): this {
    return this;
  }
  once(): this {
    return this;
  }
  removeListener(): this {
    return this;
  }
  off(): this {
    return this;
  }
  removeAllListeners(): this {
    return this;
  }
  emit(): boolean {
    return true;
  }
  listenerCount(): number {
    return 0;
  }
  listeners(): Function[] {
    return [];
  }
  eventNames(): (string | symbol)[] {
    return [];
  }
  setName(): this {
    return this;
  }
  setState(): this {
    return this;
  }
}

/**
 * 長時間稼働メモリテスト
 *
 * 繰り返し操作でのメモリリークを検証
 */
describe('Long Running Memory Test', () => {
  describe('オブジェクトプールの繰り返し操作', () => {
    let pool: ObjectPool<TestPoolableObject>;

    beforeEach(() => {
      pool = new ObjectPool<TestPoolableObject>({
        scene: {} as unknown as Phaser.Scene,
        factory: () => new TestPoolableObject(),
        initialSize: 10,
        maxSize: 50,
        autoExpand: true,
      });
    });

    it('大量のacquire/releaseでプールサイズが安定する', () => {
      // Arrange
      const iterations = 1000;
      const objects: TestPoolableObject[] = [];

      // Act - 取得・返却を繰り返す
      for (let i = 0; i < iterations; i++) {
        // 5個取得
        for (let j = 0; j < 5; j++) {
          const obj = pool.acquire();
          if (obj) {
            obj.testData = { iteration: i, index: j };
            objects.push(obj);
          }
        }

        // 全て返却
        while (objects.length > 0) {
          const obj = objects.pop()!;
          pool.release(obj);
        }
      }

      // Assert
      const stats = pool.getStats();
      expect(stats.active).toBe(0);
      // プールサイズが最大サイズを超えない
      expect(pool.getSize()).toBeLessThanOrEqual(50);
    });

    it('同時使用数がピーク時でもプールが機能する', () => {
      // Arrange
      const peakUsage = 30;
      const objects: TestPoolableObject[] = [];

      // Act - ピーク使用量まで取得
      for (let i = 0; i < peakUsage; i++) {
        const obj = pool.acquire();
        if (obj) {
          objects.push(obj);
        }
      }

      // Assert
      expect(objects.length).toBe(peakUsage);
      expect(pool.getActiveCount()).toBe(peakUsage);

      // 全て返却
      objects.forEach((obj) => pool.release(obj));
      expect(pool.getActiveCount()).toBe(0);
      expect(pool.getAvailableCount()).toBe(pool.getSize());
    });

    it('resetが正しく呼ばれる', () => {
      // Arrange
      const iterations = 100;

      // Act
      for (let i = 0; i < iterations; i++) {
        const obj = pool.acquire()!;
        obj.testData = { test: i };
        pool.release(obj);
      }

      // 同じオブジェクトが再利用されている場合、resetCountが増加している
      const testObj = pool.acquire()!;
      expect(testObj.resetCount).toBeGreaterThan(0);
    });
  });

  describe('WeakCacheの繰り返し操作', () => {
    it('大量のset/getでメモリが安定する', () => {
      // Arrange
      const cache = new WeakCache<string, object>();
      const iterations = 1000;

      // Act
      for (let i = 0; i < iterations; i++) {
        const key = `key-${i % 100}`; // 100キーを循環
        const value = { data: i };
        cache.set(key, value);
      }

      // Assert
      const stats = cache.getStats();
      // 最大100キー（循環しているため）
      expect(stats.validEntries).toBeLessThanOrEqual(100);
    });

    it('参照を保持しているオブジェクトは残る', () => {
      // Arrange
      const cache = new WeakCache<string, object>();
      const keptObjects: object[] = [];

      // Act - 一部のオブジェクトだけ参照を保持
      for (let i = 0; i < 100; i++) {
        const obj = { id: i };
        cache.set(`key-${i}`, obj);

        // 偶数のみ参照を保持
        if (i % 2 === 0) {
          keptObjects.push(obj);
        }
      }

      // Assert - 参照を保持しているものは取得できる
      for (let i = 0; i < 100; i += 2) {
        expect(cache.has(`key-${i}`)).toBe(true);
      }

      expect(keptObjects.length).toBe(50);
    });
  });

  describe('DisposableManagerの繰り返し操作', () => {
    it('大量のregister/disposeサイクルで安定する', () => {
      // Arrange
      const cycles = 100;

      // Act
      for (let i = 0; i < cycles; i++) {
        const manager = new DisposableManager();

        // 10個のdisposableを登録
        for (let j = 0; j < 10; j++) {
          manager.register({ dispose: vi.fn() });
        }

        // クリーンアップコールバックも登録
        manager.onCleanup(vi.fn());

        // dispose
        manager.dispose();

        // Assert - 各サイクル後にカウントが0
        expect(manager.count).toBe(0);
        expect(manager.disposed).toBe(true);
      }
    });
  });

  describe('EventListenerManagerの繰り返し操作', () => {
    it('大量のリスナー登録・解除で安定する', () => {
      // Arrange
      const cycles = 100;

      // Act
      for (let i = 0; i < cycles; i++) {
        const manager = new EventListenerManager();
        const unsubscribers: (() => void)[] = [];

        // 20個のリスナーを登録
        for (let j = 0; j < 20; j++) {
          const mockEventBus = {
            on: vi.fn().mockReturnValue(() => {}),
          };
          manager.addEventBusListener(mockEventBus, `event-${j}`, vi.fn());
        }

        // dispose
        manager.dispose();

        // Assert
        expect(manager.count).toBe(0);
        expect(manager.disposed).toBe(true);
      }
    });
  });

  describe('複合的なメモリ負荷テスト', () => {
    it('全てのコンポーネントを組み合わせた負荷テスト', () => {
      // Arrange
      const iterations = 50;
      const pool = new ObjectPool<TestPoolableObject>({
        scene: {} as unknown as Phaser.Scene,
        factory: () => new TestPoolableObject(),
        initialSize: 5,
        maxSize: 20,
        autoExpand: true,
      });

      // Act
      for (let i = 0; i < iterations; i++) {
        // DisposableManagerを作成
        const disposableManager = new DisposableManager();
        const eventListenerManager = new EventListenerManager();
        const cache = new WeakCache<string, object>();

        // EventListenerManagerを登録
        disposableManager.register(eventListenerManager);

        // リスナーを追加
        const mockEventBus = { on: vi.fn().mockReturnValue(() => {}) };
        eventListenerManager.addEventBusListener(mockEventBus, 'event', vi.fn());

        // プールからオブジェクトを取得
        const objects: TestPoolableObject[] = [];
        for (let j = 0; j < 3; j++) {
          const obj = pool.acquire();
          if (obj) {
            objects.push(obj);
            cache.set(`obj-${j}`, obj);
          }
        }

        // オブジェクトを返却
        objects.forEach((obj) => pool.release(obj));

        // クリーンアップ
        disposableManager.dispose();
        cache.clear();
      }

      // Assert
      expect(pool.getActiveCount()).toBe(0);
      expect(pool.getSize()).toBeLessThanOrEqual(20);
    });
  });
});
