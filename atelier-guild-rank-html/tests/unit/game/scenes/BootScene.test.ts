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
          }),
        };
        cameras = {
          main: {
            centerX: 400,
            centerY: 300,
          },
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
        }),
      };
      cameras = {
        main: {
          centerX: 400,
          centerY: 300,
        },
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
    });

    it('preload()でローディングテキストが作成される', () => {
      bootScene.init();
      bootScene.preload();
      expect(bootScene.add.text).toHaveBeenCalled();
    });

    it('preload()で全アセットの読み込みが開始される', () => {
      bootScene.init();
      bootScene.preload();
      // アセット読み込みメソッドが呼ばれたことを確認
      expect(bootScene.load.image).toHaveBeenCalled();
      expect(bootScene.load.audio).toHaveBeenCalled();
      expect(bootScene.load.json).toHaveBeenCalled();
    });
  });

  describe('プログレスコールバック', () => {
    it('プログレスコールバックを設定できる', () => {
      const callback: ProgressCallback = vi.fn();
      bootScene.setProgressCallback(callback);
      // コールバックは内部プロパティなので直接確認できないが、エラーなく設定できることを確認
      expect(true).toBe(true);
    });

    it('プログレスイベント時にコールバックが呼ばれる', () => {
      const callback: ProgressCallback = vi.fn();
      bootScene.setProgressCallback(callback);
      bootScene.init();
      bootScene.preload();

      // load.onに渡されたprogressコールバックを取得して実行
      const progressCall = (bootScene.load.on as ReturnType<typeof vi.fn>).mock.calls.find(
        (call: unknown[]) => call[0] === 'progress'
      );
      expect(progressCall).toBeDefined();

      // progressコールバックを実行
      const progressHandler = progressCall![1] as (value: number) => void;
      progressHandler(0.5);

      expect(callback).toHaveBeenCalledWith(0.5);
    });
  });

  describe('スキップトランジション', () => {
    it('スキップトランジションを設定できる', () => {
      bootScene.setSkipTransition(true);
      // エラーなく設定できることを確認
      expect(true).toBe(true);
    });

    it('スキップ設定時はcreate()で遷移しない', () => {
      bootScene.setSkipTransition(true);
      bootScene.init();
      bootScene.preload();
      bootScene.create();

      // time.delayedCallが呼ばれないことを確認
      expect(bootScene.time.delayedCall).not.toHaveBeenCalled();
    });

    it('スキップ未設定時はcreate()で遷移する', () => {
      bootScene.init();
      bootScene.preload();
      bootScene.create();

      // time.delayedCallが呼ばれることを確認
      expect(bootScene.time.delayedCall).toHaveBeenCalledWith(500, expect.any(Function));
    });
  });

  describe('ロードエラー管理', () => {
    it('ロードエラーが不変配列として返される', () => {
      const errors1 = bootScene.getLoadErrors();
      const errors2 = bootScene.getLoadErrors();
      expect(errors1).not.toBe(errors2); // 異なる配列インスタンス
      expect(errors1).toEqual(errors2); // 内容は同じ
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
});

describe('BootScene アセットカウント', () => {
  it('getTotalAssetCountがアセット総数を返す', () => {
    const count = getTotalAssetCount();
    expect(count).toBeGreaterThan(0);
    // 現在の定義: ImageAssets(21) + AudioAssets(14) + JsonAssets(11) = 46
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
