/**
 * SidebarUI - ユニットテスト
 * TASK-0040 サイドバー折りたたみアニメーション
 */

import { SidebarUI } from '@presentation/ui/main/SidebarUI';
import type Phaser from 'phaser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('SidebarUI', () => {
  let scene: Phaser.Scene;
  let sidebar: SidebarUI;

  beforeEach(() => {
    // Phaserシーンのモックを作成
    scene = {
      add: {
        container: vi.fn().mockReturnValue({
          setDepth: vi.fn().mockReturnThis(),
          add: vi.fn(),
          destroy: vi.fn(),
          setSize: vi.fn().mockReturnThis(),
          setInteractive: vi.fn().mockReturnThis(),
          on: vi.fn(),
          setVisible: vi.fn().mockReturnThis(),
          setAlpha: vi.fn().mockReturnThis(),
          setY: vi.fn().mockReturnThis(),
          setScale: vi.fn().mockReturnThis(),
        }),
        text: vi.fn().mockReturnValue({
          setText: vi.fn().mockReturnThis(),
          setAngle: vi.fn().mockReturnThis(),
          destroy: vi.fn(),
        }),
      },
      tweens: {
        add: vi.fn().mockImplementation((config) => {
          // アニメーション完了をすぐに実行
          if (config.onComplete) {
            config.onComplete();
          }
          return {};
        }),
      },
    } as unknown as Phaser.Scene;

    // localStorageのモック
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    global.localStorage = localStorageMock as unknown as Storage;

    sidebar = new SidebarUI(scene);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('3つのセクション（受注依頼、素材、完成品）を作成する', () => {
      sidebar.create();

      // containerが作成される
      expect(scene.add.container).toHaveBeenCalled();
      // テキストが作成される（アイコン×3 + タイトル×3 + コンテンツ×3 = 9回）
      expect(scene.add.text).toHaveBeenCalled();
    });

    it('折りたたみ状態を復元する', () => {
      const savedState = ['material'];
      // biome-ignore lint/suspicious/noExplicitAny: テスト用モックのため
      (localStorage.getItem as any).mockReturnValue(JSON.stringify(savedState));

      sidebar.create();

      expect(localStorage.getItem).toHaveBeenCalledWith('sidebar-collapsed');
    });
  });

  describe('destroy', () => {
    it('折りたたみ状態を保存する', () => {
      sidebar.create();
      sidebar.destroy();

      expect(localStorage.setItem).toHaveBeenCalledWith('sidebar-collapsed', expect.any(String));
    });

    it('GameObjectsを破棄する', () => {
      sidebar.create();
      // biome-ignore lint/suspicious/noExplicitAny: テスト用モックのため
      const container = (scene.add.container as any).mock.results[0].value;

      sidebar.destroy();

      expect(container.destroy).toHaveBeenCalled();
    });
  });

  describe('折りたたみアニメーション', () => {
    it('localStorageエラー時も正常動作する', () => {
      // biome-ignore lint/suspicious/noExplicitAny: テスト用モックのため
      (localStorage.getItem as any).mockImplementation(() => {
        throw new Error('localStorage error');
      });
      // biome-ignore lint/suspicious/noExplicitAny: テスト用モックのため
      (localStorage.setItem as any).mockImplementation(() => {
        throw new Error('localStorage error');
      });

      expect(() => {
        sidebar.create();
        sidebar.destroy();
      }).not.toThrow();
    });
  });

  describe('状態保持', () => {
    it('折りたたみ状態を配列形式で保存する', () => {
      sidebar.create();
      sidebar.destroy();

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'sidebar-collapsed',
        expect.stringMatching(/^\[.*\]$/),
      );
    });
  });
});
