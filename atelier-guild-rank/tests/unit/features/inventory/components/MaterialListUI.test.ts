/**
 * MaterialListUI コンポーネントテスト
 * TASK-0086: features/inventory/components作成
 */

import type { MaterialInstance } from '@domain/entities/MaterialInstance';
import type { MaterialListUIConfig } from '@features/inventory/components/MaterialListUI';
import { MaterialListUI } from '@features/inventory/components/MaterialListUI';
import type { Quality } from '@shared/types';
import type Phaser from 'phaser';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// =============================================================================
// モックヘルパー
// =============================================================================

function createMockMaterial(
  instanceId: string,
  options: { name?: string; quality?: Quality } = {},
): MaterialInstance {
  const name = options.name ?? 'テスト素材';
  const quality = options.quality ?? 'B';
  return {
    instanceId,
    materialId: 'mat-001',
    master: {
      id: 'mat-001',
      name,
      baseQuality: quality,
      attributes: ['FIRE'],
    },
    quality,
    name,
    baseQuality: quality,
    attributes: ['FIRE'],
  } as unknown as MaterialInstance;
}

function createMockScene(): Phaser.Scene {
  const mockContainer = {
    setPosition: vi.fn().mockReturnThis(),
    setVisible: vi.fn().mockReturnThis(),
    add: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
    x: 0,
    y: 0,
  };

  const mockText = {
    setOrigin: vi.fn().mockReturnThis(),
    setWordWrapWidth: vi.fn().mockReturnThis(),
    setText: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
  };

  const scene = {
    add: {
      container: vi.fn().mockReturnValue(mockContainer),
      rectangle: vi.fn().mockReturnValue({
        setOrigin: vi.fn().mockReturnThis(),
        setStrokeStyle: vi.fn().mockReturnThis(),
        setFillStyle: vi.fn().mockReturnThis(),
        setInteractive: vi.fn().mockReturnThis(),
        on: vi.fn().mockReturnThis(),
        off: vi.fn().mockReturnThis(),
        destroy: vi.fn(),
      }),
      text: vi.fn().mockReturnValue(mockText),
    },
    make: {
      text: vi.fn().mockReturnValue(mockText),
      container: vi.fn().mockReturnValue(mockContainer),
    },
    cameras: {
      main: { width: 1280, height: 720 },
    },
    children: {
      remove: vi.fn(),
    },
    rexUI: undefined,
  } as unknown as Phaser.Scene;

  return scene;
}

// =============================================================================
// テスト
// =============================================================================

describe('MaterialListUI', () => {
  let mockScene: Phaser.Scene;

  beforeEach(() => {
    vi.clearAllMocks();
    mockScene = createMockScene();
  });

  describe('コンストラクタ', () => {
    it('正しい設定でインスタンスを生成できる', () => {
      const config: MaterialListUIConfig = {
        materials: [createMockMaterial('inst-001')],
        onMaterialSelect: vi.fn(),
      };

      const ui = new MaterialListUI(mockScene, 0, 0, config);
      expect(ui).toBeDefined();
    });

    it('configがnullの場合エラーを投げる', () => {
      expect(
        () => new MaterialListUI(mockScene, 0, 0, null as unknown as MaterialListUIConfig),
      ).toThrow('config is required');
    });
  });

  describe('create', () => {
    it('create()でラベルと素材カードが生成される', () => {
      const config: MaterialListUIConfig = {
        materials: [createMockMaterial('inst-001')],
        onMaterialSelect: vi.fn(),
      };

      const ui = new MaterialListUI(mockScene, 0, 0, config);
      ui.create();

      expect(mockScene.make.text).toHaveBeenCalled();
    });

    it('空の素材リストで空メッセージが表示される', () => {
      const config: MaterialListUIConfig = {
        materials: [],
        onMaterialSelect: vi.fn(),
      };

      const ui = new MaterialListUI(mockScene, 0, 0, config);
      ui.create();

      const textCalls = (mockScene.make.text as ReturnType<typeof vi.fn>).mock.calls;
      const emptyMessage = textCalls.find(
        (call: unknown[]) =>
          call[0] &&
          typeof (call[0] as Record<string, unknown>).text === 'string' &&
          ((call[0] as Record<string, unknown>).text as string).includes('素材'),
      );
      expect(emptyMessage).toBeDefined();
    });

    it('複数の素材カードが生成される', () => {
      const config: MaterialListUIConfig = {
        materials: [
          createMockMaterial('inst-001', { name: '火の素材' }),
          createMockMaterial('inst-002', { name: '水の素材' }),
        ],
        onMaterialSelect: vi.fn(),
      };

      const ui = new MaterialListUI(mockScene, 0, 0, config);
      ui.create();

      // 素材名テキストが呼ばれている
      const textCalls = (mockScene.make.text as ReturnType<typeof vi.fn>).mock.calls;
      expect(textCalls.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('素材選択', () => {
    it('getSelectedMaterial()は初期状態でnullを返す', () => {
      const config: MaterialListUIConfig = {
        materials: [createMockMaterial('inst-001')],
        onMaterialSelect: vi.fn(),
      };

      const ui = new MaterialListUI(mockScene, 0, 0, config);
      ui.create();

      expect(ui.getSelectedMaterial()).toBeNull();
    });

    it('clearSelection()で選択がクリアされる', () => {
      const config: MaterialListUIConfig = {
        materials: [createMockMaterial('inst-001')],
        onMaterialSelect: vi.fn(),
      };

      const ui = new MaterialListUI(mockScene, 0, 0, config);
      ui.create();
      ui.clearSelection();

      expect(ui.getSelectedMaterial()).toBeNull();
    });
  });

  describe('updateMaterials', () => {
    it('素材リストを更新できる', () => {
      const config: MaterialListUIConfig = {
        materials: [createMockMaterial('inst-001')],
        onMaterialSelect: vi.fn(),
      };

      const ui = new MaterialListUI(mockScene, 0, 0, config);
      ui.create();

      const newMaterials = [createMockMaterial('inst-002')];
      ui.updateMaterials(newMaterials);

      expect(mockScene.make.text).toHaveBeenCalled();
    });
  });

  describe('destroy', () => {
    it('destroy()でリソースが解放される', () => {
      const config: MaterialListUIConfig = {
        materials: [createMockMaterial('inst-001')],
        onMaterialSelect: vi.fn(),
      };

      const ui = new MaterialListUI(mockScene, 0, 0, config);
      ui.create();

      expect(() => ui.destroy()).not.toThrow();
    });

    it('create()前にdestroy()を呼んでもエラーにならない', () => {
      const config: MaterialListUIConfig = {
        materials: [],
        onMaterialSelect: vi.fn(),
      };

      const ui = new MaterialListUI(mockScene, 0, 0, config);

      expect(() => ui.destroy()).not.toThrow();
    });
  });
});
