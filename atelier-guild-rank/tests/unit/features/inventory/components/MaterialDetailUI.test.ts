/**
 * MaterialDetailUI コンポーネントテスト
 * Issue #473: MaterialDetailUI を SlidePanel ベースに刷新
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
    setAlpha: vi.fn().mockReturnThis(),
    setDepth: vi.fn().mockReturnThis(),
    add: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
    x: 640,
    y: 360,
  };

  const mockText = {
    setOrigin: vi.fn().mockReturnThis(),
    setWordWrapWidth: vi.fn().mockReturnThis(),
    setText: vi.fn().mockReturnThis(),
    setInteractive: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    off: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
  };

  const mockTween = {
    stop: vi.fn(),
  };

  const scene = {
    add: {
      container: vi.fn().mockReturnValue(mockContainer),
      rectangle: vi.fn().mockReturnValue({
        setOrigin: vi.fn().mockReturnThis(),
        setStrokeStyle: vi.fn().mockReturnThis(),
        setFillStyle: vi.fn().mockReturnThis(),
        setInteractive: vi.fn().mockReturnThis(),
        setDepth: vi.fn().mockReturnThis(),
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
    tweens: {
      add: vi.fn().mockReturnValue(mockTween),
      killTweensOf: vi.fn(),
    },
    input: {
      keyboard: {
        addKey: vi.fn().mockReturnValue({
          on: vi.fn().mockReturnThis(),
          off: vi.fn().mockReturnThis(),
        }),
        removeKey: vi.fn(),
      },
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
        onClose: vi.fn(),
      };

      const ui = new MaterialDetailUI(mockScene, config);
      expect(ui).toBeDefined();
    });

    it('configがnullの場合エラーを投げる', () => {
      expect(
        () => new MaterialDetailUI(mockScene, null as unknown as MaterialDetailUIConfig),
      ).toThrow('config is required');
    });
  });

  describe('create', () => {
    it('create()でオーバーレイが作成される', () => {
      const config: MaterialDetailUIConfig = {
        material: createMockMaterial('inst-001'),
        onClose: vi.fn(),
      };

      const ui = new MaterialDetailUI(mockScene, config);
      ui.create();

      // オーバーレイ用の rectangle が作成される
      expect(mockScene.add.rectangle).toHaveBeenCalled();
    });

    it('create()で素材名が表示される', () => {
      const config: MaterialDetailUIConfig = {
        material: createMockMaterial('inst-001', { name: '火の結晶' }),
        onClose: vi.fn(),
      };

      const ui = new MaterialDetailUI(mockScene, config);
      ui.create();

      const textCalls = (mockScene.add.text as ReturnType<typeof vi.fn>).mock.calls;
      const nameCall = textCalls.find(
        (call: unknown[]) =>
          typeof call[2] === 'string' && (call[2] as string).includes('火の結晶'),
      );
      expect(nameCall).toBeDefined();
    });

    it('品質情報が表示される', () => {
      const config: MaterialDetailUIConfig = {
        material: createMockMaterial('inst-001', { quality: 'A' }),
        onClose: vi.fn(),
      };

      const ui = new MaterialDetailUI(mockScene, config);
      ui.create();

      const textCalls = (mockScene.add.text as ReturnType<typeof vi.fn>).mock.calls;
      const qualityCall = textCalls.find(
        (call: unknown[]) => typeof call[2] === 'string' && (call[2] as string).includes('A'),
      );
      expect(qualityCall).toBeDefined();
    });

    it('属性情報が表示される', () => {
      const config: MaterialDetailUIConfig = {
        material: createMockMaterial('inst-001', { attributes: ['FIRE', 'WATER'] }),
        onClose: vi.fn(),
      };

      const ui = new MaterialDetailUI(mockScene, config);
      ui.create();

      const textCalls = (mockScene.add.text as ReturnType<typeof vi.fn>).mock.calls;
      const attrCall = textCalls.find(
        (call: unknown[]) => typeof call[2] === 'string' && (call[2] as string).includes('FIRE'),
      );
      expect(attrCall).toBeDefined();
    });

    it('ESCキーリスナーが登録される', () => {
      const config: MaterialDetailUIConfig = {
        material: createMockMaterial('inst-001'),
        onClose: vi.fn(),
      };

      const ui = new MaterialDetailUI(mockScene, config);
      ui.create();

      expect(mockScene.input.keyboard!.addKey).toHaveBeenCalledWith('ESC');
    });

    it('閉じるボタンが作成される', () => {
      const config: MaterialDetailUIConfig = {
        material: createMockMaterial('inst-001'),
        onClose: vi.fn(),
      };

      const ui = new MaterialDetailUI(mockScene, config);
      ui.create();

      const textCalls = (mockScene.add.text as ReturnType<typeof vi.fn>).mock.calls;
      const closeCall = textCalls.find(
        (call: unknown[]) => typeof call[2] === 'string' && (call[2] as string).includes('閉じる'),
      );
      expect(closeCall).toBeDefined();
    });

    it('開くアニメーションが再生される', () => {
      const config: MaterialDetailUIConfig = {
        material: createMockMaterial('inst-001'),
        onClose: vi.fn(),
      };

      const ui = new MaterialDetailUI(mockScene, config);
      ui.create();

      // tweens.add がオーバーレイのフェードインで呼ばれる
      expect(mockScene.tweens.add).toHaveBeenCalled();
    });
  });

  describe('updateMaterial', () => {
    it('表示する素材を更新できる', () => {
      const config: MaterialDetailUIConfig = {
        material: createMockMaterial('inst-001', { name: '火の結晶' }),
        onClose: vi.fn(),
      };

      const ui = new MaterialDetailUI(mockScene, config);
      ui.create();

      const newMaterial = createMockMaterial('inst-002', { name: '水の結晶' });
      ui.updateMaterial(newMaterial);

      const textCalls = (mockScene.add.text as ReturnType<typeof vi.fn>).mock.calls;
      const newNameCall = textCalls.find(
        (call: unknown[]) =>
          typeof call[2] === 'string' && (call[2] as string).includes('水の結晶'),
      );
      expect(newNameCall).toBeDefined();
    });
  });

  describe('close', () => {
    it('close()でアニメーションが実行される', () => {
      const onClose = vi.fn();
      const config: MaterialDetailUIConfig = {
        material: createMockMaterial('inst-001'),
        onClose,
      };

      const ui = new MaterialDetailUI(mockScene, config);
      ui.create();

      // tweens.add の呼び出し回数をリセット
      (mockScene.tweens.add as ReturnType<typeof vi.fn>).mockClear();

      ui.close();

      // overlay フェードアウトの tween が追加される
      expect(mockScene.tweens.add).toHaveBeenCalled();
    });
  });

  describe('destroy', () => {
    it('destroy()でリソースが解放される', () => {
      const config: MaterialDetailUIConfig = {
        material: createMockMaterial('inst-001'),
        onClose: vi.fn(),
      };

      const ui = new MaterialDetailUI(mockScene, config);
      ui.create();

      expect(() => ui.destroy()).not.toThrow();
    });

    it('create()前にdestroy()を呼んでもエラーにならない', () => {
      const config: MaterialDetailUIConfig = {
        material: createMockMaterial('inst-001'),
        onClose: vi.fn(),
      };

      const ui = new MaterialDetailUI(mockScene, config);

      expect(() => ui.destroy()).not.toThrow();
    });

    it('ESCキーリスナーが解除される', () => {
      const config: MaterialDetailUIConfig = {
        material: createMockMaterial('inst-001'),
        onClose: vi.fn(),
      };

      const ui = new MaterialDetailUI(mockScene, config);
      ui.create();
      ui.destroy();

      expect(mockScene.input.keyboard!.removeKey).toHaveBeenCalledWith('ESC');
    });
  });
});
