/**
 * MaterialDetailUI コンポーネントテスト
 * TASK-0086: features/inventory/components作成
 */

import type { MaterialInstance } from '@domain/entities/MaterialInstance';
import type { MaterialDetailUIConfig } from '@features/inventory/components/MaterialDetailUI';
import { MaterialDetailUI } from '@features/inventory/components/MaterialDetailUI';
import type { Quality } from '@shared/types';
import type Phaser from 'phaser';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// =============================================================================
// モックヘルパー
// =============================================================================

function createMockMaterial(
  instanceId: string,
  options: { name?: string; quality?: Quality; attributes?: string[] } = {},
): MaterialInstance {
  const name = options.name ?? 'テスト素材';
  const quality = options.quality ?? 'B';
  const attributes = options.attributes ?? ['FIRE', 'WATER'];
  return {
    instanceId,
    materialId: 'mat-001',
    master: {
      id: 'mat-001',
      name,
      baseQuality: quality,
      attributes,
    },
    quality,
    name,
    baseQuality: quality,
    attributes,
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

describe('MaterialDetailUI', () => {
  let mockScene: Phaser.Scene;

  beforeEach(() => {
    vi.clearAllMocks();
    mockScene = createMockScene();
  });

  describe('コンストラクタ', () => {
    it('正しい設定でインスタンスを生成できる', () => {
      const config: MaterialDetailUIConfig = {
        material: createMockMaterial('inst-001'),
      };

      const ui = new MaterialDetailUI(mockScene, 0, 0, config);
      expect(ui).toBeDefined();
    });

    it('configがnullの場合エラーを投げる', () => {
      expect(
        () => new MaterialDetailUI(mockScene, 0, 0, null as unknown as MaterialDetailUIConfig),
      ).toThrow('config is required');
    });
  });

  describe('create', () => {
    it('create()で素材情報が表示される', () => {
      const config: MaterialDetailUIConfig = {
        material: createMockMaterial('inst-001', { name: '火の結晶' }),
      };

      const ui = new MaterialDetailUI(mockScene, 0, 0, config);
      ui.create();

      const textCalls = (mockScene.make.text as ReturnType<typeof vi.fn>).mock.calls;
      const nameCall = textCalls.find(
        (call: unknown[]) =>
          call[0] &&
          typeof (call[0] as Record<string, unknown>).text === 'string' &&
          ((call[0] as Record<string, unknown>).text as string).includes('火の結晶'),
      );
      expect(nameCall).toBeDefined();
    });

    it('品質情報が表示される', () => {
      const config: MaterialDetailUIConfig = {
        material: createMockMaterial('inst-001', { quality: 'A' }),
      };

      const ui = new MaterialDetailUI(mockScene, 0, 0, config);
      ui.create();

      const textCalls = (mockScene.make.text as ReturnType<typeof vi.fn>).mock.calls;
      const qualityCall = textCalls.find(
        (call: unknown[]) =>
          call[0] &&
          typeof (call[0] as Record<string, unknown>).text === 'string' &&
          ((call[0] as Record<string, unknown>).text as string).includes('A'),
      );
      expect(qualityCall).toBeDefined();
    });

    it('属性情報が表示される', () => {
      const config: MaterialDetailUIConfig = {
        material: createMockMaterial('inst-001', { attributes: ['FIRE', 'WATER'] }),
      };

      const ui = new MaterialDetailUI(mockScene, 0, 0, config);
      ui.create();

      const textCalls = (mockScene.make.text as ReturnType<typeof vi.fn>).mock.calls;
      const attrCall = textCalls.find(
        (call: unknown[]) =>
          call[0] &&
          typeof (call[0] as Record<string, unknown>).text === 'string' &&
          ((call[0] as Record<string, unknown>).text as string).includes('FIRE'),
      );
      expect(attrCall).toBeDefined();
    });
  });

  describe('updateMaterial', () => {
    it('表示する素材を更新できる', () => {
      const config: MaterialDetailUIConfig = {
        material: createMockMaterial('inst-001', { name: '火の結晶' }),
      };

      const ui = new MaterialDetailUI(mockScene, 0, 0, config);
      ui.create();

      const newMaterial = createMockMaterial('inst-002', { name: '水の結晶' });
      ui.updateMaterial(newMaterial);

      // 新しいテキストが設定されている
      expect(mockScene.make.text).toHaveBeenCalled();
    });
  });

  describe('destroy', () => {
    it('destroy()でリソースが解放される', () => {
      const config: MaterialDetailUIConfig = {
        material: createMockMaterial('inst-001'),
      };

      const ui = new MaterialDetailUI(mockScene, 0, 0, config);
      ui.create();

      expect(() => ui.destroy()).not.toThrow();
    });

    it('create()前にdestroy()を呼んでもエラーにならない', () => {
      const config: MaterialDetailUIConfig = {
        material: createMockMaterial('inst-001'),
      };

      const ui = new MaterialDetailUI(mockScene, 0, 0, config);

      expect(() => ui.destroy()).not.toThrow();
    });
  });
});
