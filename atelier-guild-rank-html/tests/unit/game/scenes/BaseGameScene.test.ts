/**
 * BaseGameScene テスト
 *
 * BaseGameSceneの設計と基本機能を検証する。
 * 注: Phaserシーンの完全な動作テストはE2Eで行う。
 * ここでは型定義と基本的なロジックをテストする。
 *
 * Phaserはcanvas環境を必要とするため、ユニットテストでは
 * Phaserをモックして純粋なロジックのみをテストする。
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventBus } from '@game/events/EventBus';

// Phaserをモック
vi.mock('phaser', () => {
  return {
    default: {
      Scene: class MockScene {
        sys = { settings: { key: '' } };
        scene = {
          start: vi.fn(),
          launch: vi.fn(),
          pause: vi.fn(),
          stop: vi.fn(),
          resume: vi.fn(),
        };
        plugins = {
          get: vi.fn().mockReturnValue({}),
        };
        registry = {
          set: vi.fn(),
          get: vi.fn(),
        };

        constructor(config: { key: string }) {
          this.sys.settings.key = config.key;
        }
      },
    },
    Scene: class MockScene {
      sys = { settings: { key: '' } };
      scene = {
        start: vi.fn(),
        launch: vi.fn(),
        pause: vi.fn(),
        stop: vi.fn(),
        resume: vi.fn(),
      };
      plugins = {
        get: vi.fn().mockReturnValue({}),
      };
      registry = {
        set: vi.fn(),
        get: vi.fn(),
      };

      constructor(config: { key: string }) {
        this.sys.settings.key = config.key;
      }
    },
  };
});

// BaseGameSceneをモック後にインポート
import { BaseGameScene, SceneInitData } from '@game/scenes/BaseGameScene';

// テスト用の具象シーンクラス
class TestScene extends BaseGameScene {
  public onInitCalled = false;
  public onPreloadCalled = false;
  public onCreateCalled = false;
  public setupEventListenersCalled = false;
  public onUpdateCalled = false;
  public onShutdownCalled = false;
  public lastInitData: SceneInitData | undefined;

  constructor() {
    super('TestScene');
  }

  protected onInit(data?: SceneInitData): void {
    this.onInitCalled = true;
    this.lastInitData = data;
  }

  protected onPreload(): void {
    this.onPreloadCalled = true;
  }

  protected onCreate(_data?: SceneInitData): void {
    this.onCreateCalled = true;
  }

  protected setupEventListeners(): void {
    this.setupEventListenersCalled = true;
  }

  protected onUpdate(_time: number, _delta: number): void {
    this.onUpdateCalled = true;
  }

  protected onShutdown(): void {
    this.onShutdownCalled = true;
  }

  // テスト用にprotectedメソッドを公開
  public testSubscribe(unsubscriber: () => void): void {
    this.subscribe(unsubscriber);
  }

  public testCleanup(): void {
    this.cleanup();
  }

  public testGetSubscriptionCount(): number {
    return this.getSubscriptionCount();
  }

  public getEventBus(): EventBus {
    return this.eventBus;
  }
}

describe('BaseGameScene', () => {
  let scene: TestScene;

  beforeEach(() => {
    EventBus.resetInstance();
    scene = new TestScene();
  });

  afterEach(() => {
    EventBus.resetInstance();
  });

  describe('コンストラクタ', () => {
    it('シーンキーが設定される', () => {
      expect(scene.sys.settings.key).toBe('TestScene');
    });

    it('EventBusインスタンスが取得される', () => {
      const eventBus = scene.getEventBus();
      expect(eventBus).toBe(EventBus.getInstance());
    });
  });

  describe('ライフサイクルフック', () => {
    it('init()がonInit()を呼び出す', () => {
      expect(scene.onInitCalled).toBe(false);
      scene.init({ test: 'data' });
      expect(scene.onInitCalled).toBe(true);
      expect(scene.lastInitData).toEqual({ test: 'data' });
    });

    it('preload()がonPreload()を呼び出す', () => {
      expect(scene.onPreloadCalled).toBe(false);
      scene.preload();
      expect(scene.onPreloadCalled).toBe(true);
    });

    it('update()がonUpdate()を呼び出す', () => {
      expect(scene.onUpdateCalled).toBe(false);
      scene.update(1000, 16);
      expect(scene.onUpdateCalled).toBe(true);
    });

    it('isInitializedは初期状態でfalse', () => {
      expect(scene.isInitialized).toBe(false);
    });
  });

  describe('購読管理', () => {
    it('subscribe()で購読を登録できる', () => {
      expect(scene.testGetSubscriptionCount()).toBe(0);

      const unsubscribe = vi.fn();
      scene.testSubscribe(unsubscribe);

      expect(scene.testGetSubscriptionCount()).toBe(1);
    });

    it('cleanup()で登録された購読がすべて解除される', () => {
      const unsubscribe1 = vi.fn();
      const unsubscribe2 = vi.fn();
      const unsubscribe3 = vi.fn();

      scene.testSubscribe(unsubscribe1);
      scene.testSubscribe(unsubscribe2);
      scene.testSubscribe(unsubscribe3);

      expect(scene.testGetSubscriptionCount()).toBe(3);

      scene.testCleanup();

      expect(unsubscribe1).toHaveBeenCalledTimes(1);
      expect(unsubscribe2).toHaveBeenCalledTimes(1);
      expect(unsubscribe3).toHaveBeenCalledTimes(1);
      expect(scene.testGetSubscriptionCount()).toBe(0);
    });

    it('shutdown()がcleanup()とonShutdown()を呼び出す', () => {
      const unsubscribe = vi.fn();
      scene.testSubscribe(unsubscribe);

      expect(scene.onShutdownCalled).toBe(false);

      scene.shutdown();

      expect(unsubscribe).toHaveBeenCalledTimes(1);
      expect(scene.onShutdownCalled).toBe(true);
      expect(scene.testGetSubscriptionCount()).toBe(0);
    });
  });

  describe('EventBus連携', () => {
    it('EventBusからイベントを購読できる', () => {
      const callback = vi.fn();
      const eventBus = scene.getEventBus();

      const unsubscribe = eventBus.onVoid('scene:ready', callback);
      scene.testSubscribe(unsubscribe);

      eventBus.emitVoid('scene:ready');
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('cleanup後はイベントを受信しない', () => {
      const callback = vi.fn();
      const eventBus = scene.getEventBus();

      const unsubscribe = eventBus.onVoid('scene:ready', callback);
      scene.testSubscribe(unsubscribe);

      // cleanup前
      eventBus.emitVoid('scene:ready');
      expect(callback).toHaveBeenCalledTimes(1);

      // cleanup
      scene.testCleanup();

      // cleanup後
      eventBus.emitVoid('scene:ready');
      expect(callback).toHaveBeenCalledTimes(1); // 増えない
    });
  });

  describe('SceneInitData型', () => {
    it('任意のキーと値を持つことができる', () => {
      const data: SceneInitData = {
        stringValue: 'test',
        numberValue: 42,
        boolValue: true,
        objectValue: { nested: 'value' },
        arrayValue: [1, 2, 3],
      };

      scene.init(data);
      expect(scene.lastInitData).toEqual(data);
    });
  });
});
