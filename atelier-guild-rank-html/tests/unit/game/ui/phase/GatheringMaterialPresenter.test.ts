/**
 * GatheringMaterialPresenter単体テスト
 *
 * TASK-0223: GatheringContainer素材提示実装のテスト
 * 素材アニメーション提示のロジックをテストする
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Quality } from '../../../../../src/domain/common/types';
import { Material } from '../../../../../src/domain/material/MaterialEntity';
import { GatheringMaterialPresenter } from '../../../../../src/game/ui/phase/GatheringMaterialPresenter';
import type { MaterialOption } from '../../../../../src/game/ui/material/IMaterialOptionView';

// Phaserをモック
vi.mock('phaser', () => {
  class MockRectangle {
    x: number;
    y: number;
    width: number;
    height: number;

    constructor(x: number = 0, y: number = 0, width: number = 0, height: number = 0) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
    }

    static Contains = () => true;
  }

  return {
    default: {
      Geom: {
        Rectangle: MockRectangle,
      },
    },
    Geom: {
      Rectangle: MockRectangle,
    },
  };
});

/**
 * モックPhaserシーン作成
 */
function createMockScene(): Phaser.Scene {
  const mockGraphics = {
    fillStyle: vi.fn().mockReturnThis(),
    fillCircle: vi.fn().mockReturnThis(),
    fillRect: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
    setAlpha: vi.fn().mockReturnThis(),
    alpha: 1,
    scaleX: 1,
    scaleY: 1,
  };

  const createMockContainer = () => {
    const children: unknown[] = [];
    const container: any = {
      setDepth: vi.fn().mockReturnThis(),
      setVisible: vi.fn().mockReturnThis(),
      setAlpha: vi.fn().mockReturnThis(),
      add: vi.fn().mockImplementation((child: unknown) => {
        children.push(child);
        return container;
      }),
      destroy: vi.fn(),
      removeAll: vi.fn(),
      x: 0,
      y: 0,
    };
    return container;
  };

  const createMockText = () => ({
    setOrigin: vi.fn().mockReturnThis(),
    setAlpha: vi.fn().mockReturnThis(),
    setScale: vi.fn().mockReturnThis(),
    setText: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
    alpha: 1,
    scaleX: 1,
    scaleY: 1,
    x: 0,
    y: 0,
  });

  const delayedCalls: { delay: number; callback: () => void }[] = [];

  const mockTween = {
    add: vi.fn().mockImplementation((config: any) => {
      // 即座にonCompleteを呼び出す
      if (config.onComplete) {
        config.onComplete();
      }
      return { remove: vi.fn() };
    }),
  };

  const mockTime = {
    delayedCall: vi.fn().mockImplementation((delay: number, callback: () => void) => {
      // 即座にコールバックを実行
      setTimeout(callback, 0);
      return { remove: vi.fn() };
    }),
  };

  return {
    add: {
      container: vi.fn().mockImplementation(() => createMockContainer()),
      graphics: vi.fn().mockReturnValue(mockGraphics),
      text: vi.fn().mockImplementation(() => createMockText()),
    },
    tweens: mockTween,
    time: mockTime,
  } as unknown as Phaser.Scene;
}

/**
 * テスト用素材を作成
 */
function createTestMaterial(
  id: string,
  name: string,
  attributes: string[] = []
): Material {
  return new Material({
    id,
    name,
    baseQuality: Quality.C,
    attributes,
    isRare: false,
    description: 'テスト素材',
  });
}

/**
 * テスト用素材選択肢を作成
 */
function createTestMaterialOption(
  material: Material,
  quantity: number = 1,
  probability: number = 1.0
): MaterialOption {
  return {
    material,
    quantity,
    probability,
  };
}

describe('GatheringMaterialPresenter', () => {
  let mockScene: Phaser.Scene;
  let mockContainer: Phaser.GameObjects.Container;
  let presenter: GatheringMaterialPresenter;

  beforeEach(() => {
    mockScene = createMockScene();
    mockContainer = (mockScene.add.container as any)();
    presenter = new GatheringMaterialPresenter(mockScene, mockContainer);
  });

  describe('presentMaterials', () => {
    it('素材選択肢を表示し、完了コールバックが呼ばれる', async () => {
      const materials = [
        createTestMaterialOption(createTestMaterial('mat-1', '薬草', ['plant'])),
        createTestMaterialOption(createTestMaterial('mat-2', '鉱石', ['mineral'])),
      ];
      const onComplete = vi.fn();

      await presenter.presentMaterials(materials, onComplete);

      expect(onComplete).toHaveBeenCalled();
    });

    it('空の素材リストでも完了コールバックが呼ばれる', async () => {
      const onComplete = vi.fn();

      await presenter.presentMaterials([], onComplete);

      expect(onComplete).toHaveBeenCalled();
    });

    it('ローディングテキストが追加される', async () => {
      const materials = [
        createTestMaterialOption(createTestMaterial('mat-1', '薬草')),
      ];

      await presenter.presentMaterials(materials, vi.fn());

      expect(mockScene.add.text).toHaveBeenCalled();
    });

    it('アニメーション（tween）が呼ばれる', async () => {
      const materials = [
        createTestMaterialOption(createTestMaterial('mat-1', '薬草')),
      ];

      await presenter.presentMaterials(materials, vi.fn());

      expect(mockScene.tweens.add).toHaveBeenCalled();
    });
  });

  describe('レア素材の表示', () => {
    it('確率30%未満の素材にはレアエフェクトが適用される', async () => {
      const rareMaterial = createTestMaterialOption(
        createTestMaterial('mat-rare', 'レア素材'),
        1,
        0.2 // 20% = レア
      );

      await presenter.presentMaterials([rareMaterial], vi.fn());

      // グラフィックス（グローエフェクト）が追加される
      expect(mockScene.add.graphics).toHaveBeenCalled();
    });

    it('確率30%以上の素材には通常表示が適用される', async () => {
      const normalMaterial = createTestMaterialOption(
        createTestMaterial('mat-normal', '通常素材'),
        1,
        0.8 // 80% = 通常
      );

      // 初期状態のグラフィックス呼び出し数を記録
      const initialGraphicsCallCount = (mockScene.add.graphics as any).mock.calls.length;

      await presenter.presentMaterials([normalMaterial], vi.fn());

      // 通常素材ではグラフィックス（グローエフェクト）は追加されない
      expect((mockScene.add.graphics as any).mock.calls.length).toBe(initialGraphicsCallCount);
    });
  });

  describe('素材絵文字', () => {
    it('fire属性の素材は🔥絵文字で表示される', async () => {
      const fireMaterial = createTestMaterialOption(
        createTestMaterial('mat-fire', '炎素材', ['fire'])
      );

      await presenter.presentMaterials([fireMaterial], vi.fn());

      // text呼び出しで絵文字が使われる
      const textCalls = (mockScene.add.text as any).mock.calls;
      const hasFireEmoji = textCalls.some((call: any[]) => call[2] === '🔥');
      expect(hasFireEmoji).toBe(true);
    });

    it('water属性の素材は💧絵文字で表示される', async () => {
      const waterMaterial = createTestMaterialOption(
        createTestMaterial('mat-water', '水素材', ['water'])
      );

      await presenter.presentMaterials([waterMaterial], vi.fn());

      const textCalls = (mockScene.add.text as any).mock.calls;
      const hasWaterEmoji = textCalls.some((call: any[]) => call[2] === '💧');
      expect(hasWaterEmoji).toBe(true);
    });

    it('属性がない素材は🌿絵文字で表示される', async () => {
      const defaultMaterial = createTestMaterialOption(
        createTestMaterial('mat-default', 'デフォルト素材', [])
      );

      await presenter.presentMaterials([defaultMaterial], vi.fn());

      const textCalls = (mockScene.add.text as any).mock.calls;
      const hasDefaultEmoji = textCalls.some((call: any[]) => call[2] === '🌿');
      expect(hasDefaultEmoji).toBe(true);
    });
  });

  describe('複数素材の処理', () => {
    it('複数の素材が順次表示される', async () => {
      const materials = [
        createTestMaterialOption(createTestMaterial('mat-1', '素材1')),
        createTestMaterialOption(createTestMaterial('mat-2', '素材2')),
        createTestMaterialOption(createTestMaterial('mat-3', '素材3')),
      ];

      await presenter.presentMaterials(materials, vi.fn());

      // 各素材に対してテキストが作成される（ローディング + 素材3つ）
      expect((mockScene.add.text as any).mock.calls.length).toBeGreaterThanOrEqual(4);
    });

    it('レア素材と通常素材が混在する場合も正しく処理される', async () => {
      const materials = [
        createTestMaterialOption(createTestMaterial('mat-normal', '通常'), 1, 0.8),
        createTestMaterialOption(createTestMaterial('mat-rare', 'レア'), 1, 0.1),
        createTestMaterialOption(createTestMaterial('mat-normal2', '通常2'), 1, 0.5),
      ];

      const onComplete = vi.fn();
      await presenter.presentMaterials(materials, onComplete);

      expect(onComplete).toHaveBeenCalled();
    });
  });
});
