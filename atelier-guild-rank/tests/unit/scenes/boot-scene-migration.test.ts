/**
 * BootScene移行テスト
 * TASK-0094: scenes/ディレクトリ作成とBootScene移行
 *
 * @description
 * BootSceneがsrc/scenes/に正しく移行され、
 * @scenes/BootSceneからインポートできることを確認する。
 * 後方互換性（@presentation/scenes/BootScene）も維持されることを確認。
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Phaserモック
 */
vi.mock('phaser', () => {
  return {
    default: {
      Scene: class MockScene {},
      GameObjects: {
        Graphics: class MockGraphics {},
        Text: class MockText {},
      },
    },
  };
});

// DIセットアップのモック
vi.mock('@infrastructure/di/setup', () => ({
  initializeServices: vi.fn().mockResolvedValue(undefined),
}));

describe('BootScene移行（TASK-0094）', () => {
  // ===========================================================================
  // @scenes/BootScene からのインポート確認
  // ===========================================================================
  describe('@scenes/BootScene からのインポート', () => {
    it('BootSceneクラスが@scenes/BootSceneからインポートできること', async () => {
      const mod = await import('@scenes/BootScene');
      expect(mod.BootScene).toBeDefined();
      expect(typeof mod.BootScene).toBe('function');
    });

    it('BootSceneクラスが@scenes（index.ts）からインポートできること', async () => {
      const mod = await import('@scenes/index');
      expect(mod.BootScene).toBeDefined();
      expect(typeof mod.BootScene).toBe('function');
    });
  });

  // ===========================================================================
  // 後方互換性確認
  // ===========================================================================
  describe('後方互換性', () => {
    it('@presentation/scenes/BootSceneからの再エクスポートが動作すること', async () => {
      const mod = await import('@presentation/scenes/BootScene');
      expect(mod.BootScene).toBeDefined();
      expect(typeof mod.BootScene).toBe('function');
    });

    it('@scenes/BootSceneと@presentation/scenes/BootSceneが同一クラスであること', async () => {
      const sceneMod = await import('@scenes/BootScene');
      const presentationMod = await import('@presentation/scenes/BootScene');
      expect(sceneMod.BootScene).toBe(presentationMod.BootScene);
    });
  });

  // ===========================================================================
  // BootSceneの基本動作確認
  // ===========================================================================
  describe('BootSceneの基本動作', () => {
    let bootScene: InstanceType<typeof import('@scenes/BootScene').BootScene>;

    beforeEach(async () => {
      const { BootScene } = await import('@scenes/BootScene');
      bootScene = new BootScene();

      // Phaserモックオブジェクトを注入
      const mockGraphics = {
        fillStyle: vi.fn().mockReturnThis(),
        fillRect: vi.fn().mockReturnThis(),
        clear: vi.fn(),
        destroy: vi.fn(),
      };

      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      bootScene.load = { json: vi.fn(), on: vi.fn() };
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      bootScene.scene = { start: vi.fn() };
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      bootScene.add = {
        graphics: vi.fn(() => mockGraphics),
        text: vi.fn(() => ({ setOrigin: vi.fn().mockReturnThis(), destroy: vi.fn() })),
      };
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      bootScene.cache = { json: { get: vi.fn(() => []) } };
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      bootScene.cameras = { main: { centerX: 640, centerY: 360 } };

      vi.clearAllMocks();
    });

    it('preload()でマスターデータを読み込むこと', () => {
      bootScene.preload();

      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      const mockLoad = bootScene.load;
      expect(mockLoad.json).toHaveBeenCalledTimes(6);
      expect(mockLoad.json).toHaveBeenCalledWith('cards', '/data/cards.json');
      expect(mockLoad.json).toHaveBeenCalledWith('materials', '/data/materials.json');
    });

    it('create()でTitleSceneに遷移すること', async () => {
      bootScene.create();

      await vi.waitFor(() => {
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        expect(bootScene.scene.start).toHaveBeenCalledWith('TitleScene');
      });
    });

    it('preload()でプログレスイベントが登録されること', () => {
      bootScene.preload();

      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      const mockLoad = bootScene.load;
      expect(mockLoad.on).toHaveBeenCalledWith('progress', expect.any(Function), bootScene);
      expect(mockLoad.on).toHaveBeenCalledWith('complete', expect.any(Function), bootScene);
      expect(mockLoad.on).toHaveBeenCalledWith('loaderror', expect.any(Function), bootScene);
    });
  });
});
