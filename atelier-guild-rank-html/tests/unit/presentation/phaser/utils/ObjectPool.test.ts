import { describe, it, expect, vi, beforeEach } from 'vitest';

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
  },
}));

import {
  ObjectPool,
  PoolableObject,
} from '@/presentation/phaser/utils/ObjectPool';

// テスト用のPoolableオブジェクト（Phaserに依存しない）
class TestPoolableObject implements PoolableObject {
  private _isPooled: boolean = false;
  private _active: boolean = true;
  private _visible: boolean = true;
  public resetCount: number = 0;

  reset(): void {
    this.resetCount++;
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

  get active(): boolean {
    return this._active;
  }

  get visible(): boolean {
    return this._visible;
  }

  destroy(): void {}

  // Phaser.GameObjects.GameObjectの他の必須プロパティ（最小限）
  scene = {} as any;
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

  // 最小限のメソッドスタブ
  setData(): this { return this; }
  incData(): this { return this; }
  toggleData(): this { return this; }
  getData(): unknown { return undefined; }
  setDataEnabled(): this { return this; }
  setInteractive(): this { return this; }
  disableInteractive(): this { return this; }
  removeInteractive(): this { return this; }
  addedToScene(): void {}
  removedFromScene(): void {}
  update(): void {}
  toJSON(): any { return {}; }
  willRender(): boolean { return true; }
  getIndexList(): number[] { return []; }
  addListener(): this { return this; }
  on(): this { return this; }
  once(): this { return this; }
  removeListener(): this { return this; }
  off(): this { return this; }
  removeAllListeners(): this { return this; }
  emit(): boolean { return true; }
  listenerCount(): number { return 0; }
  listeners(): Function[] { return []; }
  eventNames(): (string | symbol)[] { return []; }
  setName(): this { return this; }
  setState(): this { return this; }
}

describe('ObjectPool', () => {
  let scene: any;
  let factoryCallCount: number;

  beforeEach(() => {
    scene = {};
    factoryCallCount = 0;
  });

  const createPool = (config: {
    initialSize?: number;
    maxSize?: number;
    autoExpand?: boolean;
  } = {}): ObjectPool<TestPoolableObject> => {
    return new ObjectPool<TestPoolableObject>({
      scene,
      factory: () => {
        factoryCallCount++;
        return new TestPoolableObject();
      },
      initialSize: config.initialSize ?? 10,
      maxSize: config.maxSize ?? 100,
      autoExpand: config.autoExpand ?? true,
    });
  };

  describe('初期化', () => {
    it('初期サイズ分のオブジェクトが生成される', () => {
      const pool = createPool({ initialSize: 5 });

      expect(factoryCallCount).toBe(5);
      expect(pool.getSize()).toBe(5);
      expect(pool.getAvailableCount()).toBe(5);
      expect(pool.getActiveCount()).toBe(0);
    });

    it('デフォルト設定で初期化できる', () => {
      const pool = createPool();

      expect(pool.getSize()).toBe(10);
    });
  });

  describe('acquire（取得）', () => {
    it('プールからオブジェクトを取得できる', () => {
      const pool = createPool({ initialSize: 5 });

      const obj = pool.acquire();

      expect(obj).not.toBeNull();
      expect(pool.getActiveCount()).toBe(1);
      expect(pool.getAvailableCount()).toBe(4);
    });

    it('取得したオブジェクトはアクティブ状態になる', () => {
      const pool = createPool({ initialSize: 5 });

      const obj = pool.acquire();

      expect(obj?.isPooled()).toBe(false);
    });

    it('複数のオブジェクトを取得できる', () => {
      const pool = createPool({ initialSize: 10 });

      const objects = [];
      for (let i = 0; i < 5; i++) {
        objects.push(pool.acquire());
      }

      expect(objects.filter((o) => o !== null).length).toBe(5);
      expect(pool.getActiveCount()).toBe(5);
    });

    it('統計情報が正しく更新される', () => {
      const pool = createPool({ initialSize: 5 });

      pool.acquire();
      pool.acquire();

      const stats = pool.getStats();
      expect(stats.acquireCount).toBe(2);
    });
  });

  describe('release（返却）', () => {
    it('オブジェクトをプールに返却できる', () => {
      const pool = createPool({ initialSize: 5 });

      const obj = pool.acquire()!;
      pool.release(obj);

      expect(pool.getActiveCount()).toBe(0);
      expect(pool.getAvailableCount()).toBe(5);
    });

    it('返却時にresetが呼ばれる', () => {
      const pool = createPool({ initialSize: 5 });

      const obj = pool.acquire()!;
      pool.release(obj);

      expect(obj.resetCount).toBe(1);
    });

    it('返却したオブジェクトはプール状態になる', () => {
      const pool = createPool({ initialSize: 5 });

      const obj = pool.acquire()!;
      pool.release(obj);

      expect(obj.isPooled()).toBe(true);
    });

    it('アクティブでないオブジェクトの返却は警告される', () => {
      const pool = createPool({ initialSize: 5 });
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const obj = new TestPoolableObject();
      pool.release(obj);

      expect(consoleWarn).toHaveBeenCalled();
      consoleWarn.mockRestore();
    });

    it('統計情報が正しく更新される', () => {
      const pool = createPool({ initialSize: 5 });

      const obj = pool.acquire()!;
      pool.release(obj);

      const stats = pool.getStats();
      expect(stats.releaseCount).toBe(1);
    });
  });

  describe('releaseAll（全返却）', () => {
    it('全てのアクティブオブジェクトを返却できる', () => {
      const pool = createPool({ initialSize: 10 });

      for (let i = 0; i < 5; i++) {
        pool.acquire();
      }

      pool.releaseAll();

      expect(pool.getActiveCount()).toBe(0);
      expect(pool.getAvailableCount()).toBe(10);
    });
  });

  describe('自動拡張', () => {
    it('プールが枯渇すると自動拡張される', () => {
      const pool = createPool({
        initialSize: 5,
        maxSize: 20,
        autoExpand: true,
      });

      // 初期サイズ以上を取得
      for (let i = 0; i < 10; i++) {
        pool.acquire();
      }

      expect(pool.getSize()).toBeGreaterThan(5);
      expect(pool.getActiveCount()).toBe(10);
    });

    it('最大サイズを超えて拡張されない', () => {
      const pool = createPool({
        initialSize: 5,
        maxSize: 10,
        autoExpand: true,
      });

      for (let i = 0; i < 15; i++) {
        pool.acquire();
      }

      expect(pool.getSize()).toBe(10);
    });

    it('autoExpandがfalseの場合は拡張されない', () => {
      const pool = createPool({
        initialSize: 5,
        maxSize: 20,
        autoExpand: false,
      });

      for (let i = 0; i < 10; i++) {
        pool.acquire();
      }

      expect(pool.getSize()).toBe(5);
    });
  });

  describe('最大サイズ制限', () => {
    it('最大サイズに達するとnullを返す', () => {
      const pool = createPool({
        initialSize: 5,
        maxSize: 5,
        autoExpand: true,
      });

      const objects: (TestPoolableObject | null)[] = [];
      for (let i = 0; i < 10; i++) {
        objects.push(pool.acquire());
      }

      const nullCount = objects.filter((o) => o === null).length;
      expect(nullCount).toBe(5);
    });

    it('isExhaustedがtrueになる', () => {
      const pool = createPool({
        initialSize: 5,
        maxSize: 5,
        autoExpand: true,
      });

      for (let i = 0; i < 5; i++) {
        pool.acquire();
      }

      expect(pool.isExhausted()).toBe(true);
    });
  });

  describe('オブジェクトの再利用', () => {
    it('返却後に取得すると同じオブジェクトが再利用される', () => {
      const pool = createPool({ initialSize: 1 });

      const obj1 = pool.acquire()!;
      pool.release(obj1);
      const obj2 = pool.acquire();

      expect(obj2).toBe(obj1);
    });
  });

  describe('prewarm（プリウォーム）', () => {
    it('指定数まで事前にオブジェクトを生成できる', () => {
      const pool = createPool({ initialSize: 5, maxSize: 20 });

      pool.prewarm(15);

      expect(pool.getSize()).toBe(15);
    });
  });

  describe('getActiveObjects', () => {
    it('アクティブなオブジェクトの配列を取得できる', () => {
      const pool = createPool({ initialSize: 10 });

      const obj1 = pool.acquire()!;
      const obj2 = pool.acquire()!;

      const activeObjects = pool.getActiveObjects();

      expect(activeObjects).toContain(obj1);
      expect(activeObjects).toContain(obj2);
      expect(activeObjects.length).toBe(2);
    });
  });

  describe('resetStats', () => {
    it('統計情報をリセットできる', () => {
      const pool = createPool({ initialSize: 5 });

      pool.acquire();
      pool.acquire();
      pool.resetStats();

      const stats = pool.getStats();
      expect(stats.acquireCount).toBe(0);
      expect(stats.releaseCount).toBe(0);
      expect(stats.expandCount).toBe(0);
    });
  });

  describe('destroy', () => {
    it('プールを破棄できる', () => {
      const pool = createPool({ initialSize: 5 });

      pool.acquire();
      pool.acquire();
      pool.destroy();

      expect(pool.getSize()).toBe(0);
      expect(pool.getActiveCount()).toBe(0);
    });
  });
});
