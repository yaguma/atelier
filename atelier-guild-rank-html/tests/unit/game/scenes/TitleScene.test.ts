/**
 * TitleScene テスト
 *
 * タイトル画面シーンのテストを行う。
 * Phaserはcanvas環境を必要とするため、ユニットテストでは
 * Phaserをモックして純粋なロジックのみをテストする。
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventBus } from '@game/events/EventBus';
import { SceneKeys } from '@game/config/SceneKeys';
import { SceneManager } from '@game/managers/SceneManager';
import { UIActionEvents } from '@game/events/EventTypes';

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
        textures = {
          exists: vi.fn().mockReturnValue(false),
        };
        cache = {
          audio: {
            exists: vi.fn().mockReturnValue(false),
          },
        };
        sound = {
          play: vi.fn(),
          stopByKey: vi.fn(),
          stopAll: vi.fn(),
        };
        add = {
          text: vi.fn().mockReturnValue({
            setOrigin: vi.fn().mockReturnThis(),
            setText: vi.fn(),
          }),
          image: vi.fn().mockReturnValue({
            setDisplaySize: vi.fn().mockReturnThis(),
          }),
          container: vi.fn().mockReturnValue({
            add: vi.fn(),
          }),
        };
        cameras = {
          main: {
            width: 800,
            height: 600,
            centerX: 400,
            centerY: 300,
            setBackgroundColor: vi.fn(),
            fadeIn: vi.fn(),
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
      textures = {
        exists: vi.fn().mockReturnValue(false),
      };
      cache = {
        audio: {
          exists: vi.fn().mockReturnValue(false),
        },
      };
      sound = {
        play: vi.fn(),
        stopByKey: vi.fn(),
        stopAll: vi.fn(),
      };
      add = {
        text: vi.fn().mockReturnValue({
          setOrigin: vi.fn().mockReturnThis(),
          setText: vi.fn(),
        }),
        image: vi.fn().mockReturnValue({
          setDisplaySize: vi.fn().mockReturnThis(),
        }),
        container: vi.fn().mockReturnValue({
          add: vi.fn(),
        }),
      };
      cameras = {
        main: {
          width: 800,
          height: 600,
          centerX: 400,
          centerY: 300,
          setBackgroundColor: vi.fn(),
          fadeIn: vi.fn(),
        },
      };
      time = {
        delayedCall: vi.fn(),
        addEvent: vi.fn().mockReturnValue({
          remove: vi.fn(),
        }),
      };
      tweens = {
        add: vi.fn(),
        addCounter: vi.fn(),
      };

      constructor(config: { key: string }) {
        this.sys.settings.key = config.key;
      }
    },
  };
});

// rexUIプラグインをモック
vi.mock('phaser3-rex-plugins/templates/ui/ui-plugin', () => {
  return {
    default: class MockUIPlugin {
      add = {
        roundRectangle: vi.fn().mockReturnValue({
          setFillStyle: vi.fn(),
        }),
        label: vi.fn().mockReturnValue({
          layout: vi.fn(),
          setInteractive: vi.fn().mockReturnThis(),
          on: vi.fn().mockReturnThis(),
        }),
      };
    },
  };
});

// UIFactoryをモック
vi.mock('@game/ui/UIFactory', () => {
  const mockButton = {
    layout: vi.fn(),
    setInteractive: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    setPosition: vi.fn(),
  };

  return {
    UIFactory: vi.fn().mockImplementation(() => ({
      createButton: vi.fn().mockReturnValue(mockButton),
      createPrimaryButton: vi.fn().mockReturnValue(mockButton),
      createSecondaryButton: vi.fn().mockReturnValue(mockButton),
    })),
  };
});

// SceneManagerをモック
vi.mock('@game/managers/SceneManager', () => {
  return {
    SceneManager: {
      getInstance: vi.fn().mockReturnValue({
        goTo: vi.fn(),
        getCurrentScene: vi.fn(),
      }),
      resetInstance: vi.fn(),
    },
  };
});

// モック後にインポート
import { TitleScene } from '@game/scenes/TitleScene';

describe('TitleScene', () => {
  let titleScene: TitleScene;

  beforeEach(() => {
    EventBus.resetInstance();
    titleScene = new TitleScene();
  });

  afterEach(() => {
    EventBus.resetInstance();
    vi.clearAllMocks();
  });

  describe('インスタンス生成', () => {
    it('TitleSceneが作成できる', () => {
      expect(titleScene).toBeDefined();
      expect(titleScene).toBeInstanceOf(TitleScene);
    });

    it('シーンキーがTitleSceneである', () => {
      expect(titleScene.sys.settings.key).toBe(SceneKeys.TITLE);
    });
  });

  describe('初期状態', () => {
    it('初期状態ではBGMはロードされていない', () => {
      titleScene.init();
      expect(titleScene.hasBgm).toBe(false);
    });

    it('初期状態では背景画像はロードされていない', () => {
      titleScene.init();
      expect(titleScene.hasBackground).toBe(false);
    });
  });

  describe('ライフサイクル - create', () => {
    it('create()で背景色が設定される', () => {
      titleScene.init();
      titleScene.preload();
      titleScene.create();

      expect(titleScene.cameras.main.setBackgroundColor).toHaveBeenCalled();
    });

    it('create()でタイトルテキストが作成される', () => {
      titleScene.init();
      titleScene.preload();
      titleScene.create();

      // add.textが呼ばれることを確認（タイトル、サブタイトル、バージョン）
      expect(titleScene.add.text).toHaveBeenCalled();
    });

    it('create()でメニューコンテナが作成される', () => {
      titleScene.init();
      titleScene.preload();
      titleScene.create();

      expect(titleScene.add.container).toHaveBeenCalled();
    });

    it('create()でフェードインが実行される', () => {
      titleScene.init();
      titleScene.preload();
      titleScene.create();

      expect(titleScene.cameras.main.fadeIn).toHaveBeenCalledWith(500, 0, 0, 0);
    });
  });

  describe('背景画像', () => {
    it('背景画像が存在しない場合は作成されない', () => {
      titleScene.init();
      titleScene.preload();
      titleScene.create();

      expect(titleScene.add.image).not.toHaveBeenCalled();
      expect(titleScene.hasBackground).toBe(false);
    });

    it('背景画像が存在する場合は作成される', () => {
      (titleScene.textures.exists as ReturnType<typeof vi.fn>).mockReturnValue(true);

      titleScene.init();
      titleScene.preload();
      titleScene.create();

      expect(titleScene.add.image).toHaveBeenCalled();
      expect(titleScene.hasBackground).toBe(true);
    });
  });

  describe('BGM', () => {
    it('BGMが存在しない場合は再生されない', () => {
      titleScene.init();
      titleScene.preload();
      titleScene.create();

      expect(titleScene.sound.play).not.toHaveBeenCalled();
      expect(titleScene.hasBgm).toBe(false);
    });

    it('BGMが存在する場合は再生される', () => {
      (titleScene.cache.audio.exists as ReturnType<typeof vi.fn>).mockReturnValue(true);

      titleScene.init();
      titleScene.preload();
      titleScene.create();

      expect(titleScene.sound.play).toHaveBeenCalledWith('bgm-title', {
        loop: true,
        volume: 0.5,
      });
      expect(titleScene.hasBgm).toBe(true);
    });
  });

  describe('メニューコンテナ', () => {
    it('getMenuContainer()でコンテナを取得できる', () => {
      titleScene.init();
      titleScene.preload();
      titleScene.create();

      const container = titleScene.getMenuContainer();
      expect(container).toBeDefined();
    });
  });

  describe('シーン終了', () => {
    it('shutdown()でBGMが停止される（BGMありの場合）', () => {
      (titleScene.cache.audio.exists as ReturnType<typeof vi.fn>).mockReturnValue(true);

      titleScene.init();
      titleScene.preload();
      titleScene.create();
      titleScene.shutdown();

      expect(titleScene.sound.stopByKey).toHaveBeenCalledWith('bgm-title');
    });

    it('shutdown()でBGM停止は呼ばれない（BGMなしの場合）', () => {
      titleScene.init();
      titleScene.preload();
      titleScene.create();
      titleScene.shutdown();

      expect(titleScene.sound.stopByKey).not.toHaveBeenCalled();
    });
  });

  describe('新規ゲームボタン', () => {
    it('create()で新規ゲームボタンが作成される', () => {
      titleScene.init();
      titleScene.preload();
      titleScene.create();

      const button = titleScene.getNewGameButton();
      expect(button).toBeDefined();
    });

    it('初期状態では遷移中ではない', () => {
      titleScene.init();
      expect(titleScene.isTransitioning).toBe(false);
    });
  });
});

describe('TitleScene シーンキー', () => {
  it('SceneKeys.TITLEがTitleSceneである', () => {
    expect(SceneKeys.TITLE).toBe('TitleScene');
  });
});

describe('TitleScene エクスポート', () => {
  it('TitleSceneがエクスポートされている', async () => {
    const module = await import('@game/scenes/TitleScene');
    expect(module.TitleScene).toBeDefined();
  });
});

describe('TitleScene シーンインデックス', () => {
  it('scenesインデックスからTitleSceneがエクスポートされている', async () => {
    const module = await import('@game/scenes');
    expect(module.TitleScene).toBeDefined();
  });
});
