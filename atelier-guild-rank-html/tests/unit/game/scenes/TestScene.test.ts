/**
 * TestScene テスト
 *
 * TestSceneの動作確認を行う。
 * Phaserシーンの完全な動作テストはE2Eで行う。
 * ここではロジック部分をテストする。
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
        cameras = {
          main: {
            setBackgroundColor: vi.fn(),
          },
        };
        add = {
          text: vi.fn().mockReturnValue({
            setOrigin: vi.fn().mockReturnThis(),
            setStyle: vi.fn().mockReturnThis(),
            setInteractive: vi.fn().mockReturnThis(),
            on: vi.fn().mockReturnThis(),
            setText: vi.fn().mockReturnThis(),
            text: 'Gold: 0',
            active: true,
          }),
        };
        time = {
          delayedCall: vi.fn(),
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
      cameras = {
        main: {
          setBackgroundColor: vi.fn(),
        },
      };
      add = {
        text: vi.fn().mockReturnValue({
          setOrigin: vi.fn().mockReturnThis(),
          setStyle: vi.fn().mockReturnThis(),
          setInteractive: vi.fn().mockReturnThis(),
          on: vi.fn().mockReturnThis(),
          setText: vi.fn().mockReturnThis(),
          text: 'Gold: 0',
          active: true,
        }),
      };
      time = {
        delayedCall: vi.fn(),
      };

      constructor(config: { key: string }) {
        this.sys.settings.key = config.key;
      }
    },
  };
});

// TestSceneをモック後にインポート
import { TestScene } from '@game/scenes/TestScene';
import { SCENE_KEYS } from '@game/config/SceneKeys';

describe('TestScene', () => {
  let scene: TestScene;

  beforeEach(() => {
    EventBus.resetInstance();
    scene = new TestScene();
  });

  afterEach(() => {
    EventBus.resetInstance();
  });

  describe('コンストラクタ', () => {
    it('シーンキーがTESTに設定される', () => {
      expect(scene.sys.settings.key).toBe(SCENE_KEYS.TEST);
    });
  });

  describe('ライフサイクル', () => {
    it('init()でフレームカウントがリセットされる', () => {
      scene.init();
      expect(scene.getFrameCount()).toBe(0);
    });

    it('preload()が正常に呼び出せる', () => {
      expect(() => scene.preload()).not.toThrow();
    });
  });

  describe('フレーム更新', () => {
    it('update()でフレームカウントが増加する', () => {
      scene.init();
      expect(scene.getFrameCount()).toBe(0);

      scene.update(0, 16);
      expect(scene.getFrameCount()).toBe(1);

      scene.update(16, 16);
      expect(scene.getFrameCount()).toBe(2);
    });

    it('shutdown()でフレームカウントがリセットされる', () => {
      scene.init();
      scene.update(0, 16);
      scene.update(16, 16);
      expect(scene.getFrameCount()).toBe(2);

      scene.shutdown();
      expect(scene.getFrameCount()).toBe(0);
    });
  });

  describe('EventBus連携', () => {
    it('BaseGameSceneからEventBusを取得できる', () => {
      const eventBus = EventBus.getInstance();
      expect(eventBus).toBeDefined();
    });
  });
});
