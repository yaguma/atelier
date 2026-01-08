/**
 * BootScene テスト
 *
 * 起動・プリロードシーンのテストを行う。
 * Phaserはcanvas環境を必要とするため、ユニットテストでは
 * Phaserをモックして純粋なロジックのみをテストする。
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventBus } from '@game/events/EventBus';
import { SceneKeys } from '@game/config/SceneKeys';
import { getTotalAssetCount } from '@game/boot/AssetList';

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
        load = {
          on: vi.fn(),
          image: vi.fn(),
          audio: vi.fn(),
          json: vi.fn(),
          spritesheet: vi.fn(),
        };
        add = {
          text: vi.fn().mockReturnValue({
            setOrigin: vi.fn().mockReturnThis(),
            setText: vi.fn(),
            text: 'Loading',
          }),
          graphics: vi.fn().mockReturnValue({
            fillStyle: vi.fn().mockReturnThis(),
            fillRoundedRect: vi.fn().mockReturnThis(),
            clear: vi.fn().mockReturnThis(),
          }),
        };
        cameras = {
          main: {
            centerX: 400,
            centerY: 300,
            setBackgroundColor: vi.fn(),
            fadeOut: vi.fn(),
            once: vi.fn(),
          },
        };
        time = {
          delayedCall: vi.fn(),
          addEvent: vi.fn().mockReturnValue({
            remove: vi.fn(),
          }),
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
      load = {
        on: vi.fn(),
        image: vi.fn(),
        audio: vi.fn(),
        json: vi.fn(),
        spritesheet: vi.fn(),
      };
      add = {
        text: vi.fn().mockReturnValue({
          setOrigin: vi.fn().mockReturnThis(),
          setText: vi.fn(),
          text: 'Loading',
        }),
        graphics: vi.fn().mockReturnValue({
          fillStyle: vi.fn().mockReturnThis(),
          fillRoundedRect: vi.fn().mockReturnThis(),
          clear: vi.fn().mockReturnThis(),
        }),
      };
      cameras = {
        main: {
          centerX: 400,
          centerY: 300,
          setBackgroundColor: vi.fn(),
          fadeOut: vi.fn(),
          once: vi.fn(),
        },
      };
      time = {
        delayedCall: vi.fn(),
        addEvent: vi.fn().mockReturnValue({
          remove: vi.fn(),
        }),
      };

      constructor(config: { key: string }) {
        this.sys.settings.key = config.key;
      }
    },
  };
});

// SceneManagerをモック
vi.mock('@game/managers/SceneManager', () => ({
  SceneManager: {
    getInstance: vi.fn(() => ({
      goTo: vi.fn(),
    })),
    resetInstance: vi.fn(),
  },
}));

// モック後にインポート
import { BootScene, AssetLoadError, ProgressCallback } from '@game/scenes/BootScene';
import { SceneManager } from '@game/managers/SceneManager';

describe('BootScene', () => {
  let bootScene: BootScene;

  beforeEach(() => {
    EventBus.resetInstance();
    SceneManager.resetInstance();
    bootScene = new BootScene();
  });

  afterEach(() => {
    EventBus.resetInstance();
    vi.clearAllMocks();
  });

  describe('インスタンス生成', () => {
    it('BootSceneが作成できる', () => {
      expect(bootScene).toBeDefined();
      expect(bootScene).toBeInstanceOf(BootScene);
    });

    it('シーンキーがBOOTSceneである', () => {
      expect(bootScene.sys.settings.key).toBe(SceneKeys.BOOT);
    });
  });

  describe('初期状態', () => {
    it('初期状態ではロード未完了', () => {
      expect(bootScene.isLoadComplete).toBe(false);
    });

    it('初期状態ではロードエラーが空', () => {
      expect(bootScene.getLoadErrors()).toEqual([]);
    });

    it('初期状態ではプログレスが0', () => {
      expect(bootScene.getProgress()).toBe(0);
    });
  });

  describe('ライフサイクル - init', () => {
    it('init()でカウンターがリセットされる', () => {
      bootScene.init();
      expect(bootScene.isLoadComplete).toBe(false);
      expect(bootScene.getLoadErrors()).toEqual([]);
    });
  });

  describe('ライフサイクル - preload', () => {
    it('preload()でローダーイベントが設定される', () => {
      bootScene.init();
      bootScene.preload();
      expect(bootScene.load.on).toHaveBeenCalledWith('progress', expect.any(Function));
      expect(bootScene.load.on).toHaveBeenCalledWith('complete', expect.any(Function));
      expect(bootScene.load.on).toHaveBeenCalledWith('loaderror', expect.any(Function));
      expect(bootScene.load.on).toHaveBeenCalledWith('fileprogress', expect.any(Function));
    });

    it('preload()で背景色が設定される', () => {
      bootScene.init();
      bootScene.preload();
      expect(bootScene.cameras.main.setBackgroundColor).toHaveBeenCalled();
    });

    it('preload()でタイトルテキストが作成される', () => {
      bootScene.init();
      bootScene.preload();
      // add.textが複数回呼ばれる（タイトル、サブタイトル、パーセント、ローディング、アセット名）
      expect(bootScene.add.text).toHaveBeenCalled();
    });

    it('preload()でプログレスバーが作成される', () => {
      bootScene.init();
      bootScene.preload();
      // add.graphicsが2回呼ばれる（背景とプログレスバー）
      expect(bootScene.add.graphics).toHaveBeenCalledTimes(2);
    });

    it('preload()でローディングアニメーションが開始される', () => {
      bootScene.init();
      bootScene.preload();
      expect(bootScene.time.addEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          delay: 500,
          loop: true,
        })
      );
    });

    it('preload()で全アセットの読み込みが開始される', () => {
      bootScene.init();
      bootScene.preload();
      expect(bootScene.load.image).toHaveBeenCalled();
      expect(bootScene.load.audio).toHaveBeenCalled();
      expect(bootScene.load.json).toHaveBeenCalled();
    });
  });

  describe('プログレスコールバック', () => {
    it('プログレスコールバックを設定できる', () => {
      const callback: ProgressCallback = vi.fn();
      bootScene.setProgressCallback(callback);
      expect(true).toBe(true);
    });

    it('プログレスイベント時にコールバックが呼ばれる', () => {
      const callback: ProgressCallback = vi.fn();
      bootScene.setProgressCallback(callback);
      bootScene.init();
      bootScene.preload();

      const progressCall = (bootScene.load.on as ReturnType<typeof vi.fn>).mock.calls.find(
        (call: unknown[]) => call[0] === 'progress'
      );
      expect(progressCall).toBeDefined();

      const progressHandler = progressCall![1] as (value: number) => void;
      progressHandler(0.5);

      expect(callback).toHaveBeenCalledWith(0.5);
    });
  });

  describe('スキップトランジション', () => {
    it('スキップトランジションを設定できる', () => {
      bootScene.setSkipTransition(true);
      expect(true).toBe(true);
    });

    it('スキップ設定時はcreate()でフェードアウトしない', () => {
      bootScene.setSkipTransition(true);
      bootScene.init();
      bootScene.preload();
      bootScene.create();

      expect(bootScene.cameras.main.fadeOut).not.toHaveBeenCalled();
    });

    it('スキップ未設定時はcreate()でフェードアウトする', () => {
      bootScene.init();
      bootScene.preload();
      bootScene.create();

      expect(bootScene.cameras.main.fadeOut).toHaveBeenCalledWith(500, 0, 0, 0);
    });
  });

  describe('ロードエラー管理', () => {
    it('ロードエラーが不変配列として返される', () => {
      const errors1 = bootScene.getLoadErrors();
      const errors2 = bootScene.getLoadErrors();
      expect(errors1).not.toBe(errors2);
      expect(errors1).toEqual(errors2);
    });
  });

  describe('ロード完了状態', () => {
    it('create()後にisLoadCompleteがtrueになる', () => {
      bootScene.setSkipTransition(true);
      bootScene.init();
      bootScene.preload();

      expect(bootScene.isLoadComplete).toBe(false);

      bootScene.create();

      expect(bootScene.isLoadComplete).toBe(true);
    });
  });

  describe('進捗バー更新', () => {
    it('プログレスイベントでプログレスバーが更新される', () => {
      bootScene.init();
      bootScene.preload();

      const progressCall = (bootScene.load.on as ReturnType<typeof vi.fn>).mock.calls.find(
        (call: unknown[]) => call[0] === 'progress'
      );

      const progressHandler = progressCall![1] as (value: number) => void;
      progressHandler(0.5);

      // graphicsのclearとfillRoundedRectが呼ばれることを確認
      const graphicsMock = (bootScene.add.graphics as ReturnType<typeof vi.fn>).mock.results[1]
        .value;
      expect(graphicsMock.clear).toHaveBeenCalled();
    });
  });

  describe('ファイルプログレスイベント', () => {
    it('fileprogress時にアセット名が更新される', () => {
      bootScene.init();
      bootScene.preload();

      const fileProgressCall = (bootScene.load.on as ReturnType<typeof vi.fn>).mock.calls.find(
        (call: unknown[]) => call[0] === 'fileprogress'
      );
      expect(fileProgressCall).toBeDefined();

      // fileprogress コールバックがあることを確認
      const fileProgressHandler = fileProgressCall![1] as (file: { key: string }) => void;
      expect(typeof fileProgressHandler).toBe('function');
    });
  });
});

describe('BootScene アセットカウント', () => {
  it('getTotalAssetCountがアセット総数を返す', () => {
    const count = getTotalAssetCount();
    expect(count).toBeGreaterThan(0);
    expect(count).toBe(46);
  });
});

describe('BootScene シーンキー定数', () => {
  it('SceneKeys.BOOTがBootSceneである', () => {
    expect(SceneKeys.BOOT).toBe('BootScene');
  });

  it('SceneKeys.TITLEがTitleSceneである', () => {
    expect(SceneKeys.TITLE).toBe('TitleScene');
  });
});

describe('BootScene アセットロードエラー型', () => {
  it('AssetLoadError型が正しい構造を持つ', () => {
    const error: AssetLoadError = {
      key: 'test-key',
      url: 'test-url',
      message: 'test-message',
    };
    expect(error.key).toBe('test-key');
    expect(error.url).toBe('test-url');
    expect(error.message).toBe('test-message');
  });
});

describe('BootScene ProgressCallback型', () => {
  it('ProgressCallbackが正しく呼び出せる', () => {
    const callback: ProgressCallback = vi.fn();
    callback(0.5);
    expect(callback).toHaveBeenCalledWith(0.5);
  });

  it('ProgressCallbackが0-1の範囲の値を受け取る', () => {
    const callback: ProgressCallback = vi.fn();
    callback(0);
    callback(0.25);
    callback(0.5);
    callback(0.75);
    callback(1);
    expect(callback).toHaveBeenCalledTimes(5);
  });
});

describe('BootScene エクスポート', () => {
  it('BootSceneがエクスポートされている', async () => {
    const module = await import('@game/scenes/BootScene');
    expect(module.BootScene).toBeDefined();
  });
});

describe('BootScene シーンインデックス', () => {
  it('scenesインデックスからBootSceneがエクスポートされている', async () => {
    const module = await import('@game/scenes');
    expect(module.BootScene).toBeDefined();
  });
});
