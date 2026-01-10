/**
 * MaterialOptionView単体テスト
 *
 * TASK-0220: MaterialOptionView設計・実装のテスト
 * 素材選択肢表示コンポーネントをテストする
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Quality } from '../../../../../src/domain/common/types';
import { Material } from '../../../../../src/domain/material/MaterialEntity';
import { MaterialOptionView } from '../../../../../src/game/ui/material/MaterialOptionView';
import type {
  MaterialOption,
  MaterialOptionViewOptions,
} from '../../../../../src/game/ui/material/IMaterialOptionView';

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
    fillRoundedRect: vi.fn().mockReturnThis(),
    lineStyle: vi.fn().mockReturnThis(),
    strokeRoundedRect: vi.fn().mockReturnThis(),
    clear: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
  };

  const createMockContainer = () => {
    const data: Record<string, unknown> = {};
    const children: unknown[] = [];
    const container: any = {
      setVisible: vi.fn().mockReturnThis(),
      setAlpha: vi.fn().mockReturnThis(),
      add: vi.fn().mockImplementation((child: unknown) => {
        children.push(child);
        return container;
      }),
      destroy: vi.fn(),
      setData: vi.fn().mockImplementation(function (key: string, value: unknown) {
        data[key] = value;
        return container;
      }),
      getData: vi.fn().mockImplementation((key: string) => {
        return data[key];
      }),
      setInteractive: vi.fn().mockReturnThis(),
      on: vi.fn().mockReturnThis(),
      get length() {
        return children.length;
      },
    };
    return container;
  };

  const createMockText = () => ({
    setOrigin: vi.fn().mockReturnThis(),
    setText: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
  });

  const mockTween = {
    add: vi.fn().mockImplementation((config: any) => {
      if (config.onComplete) {
        config.onComplete();
      }
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
  } as unknown as Phaser.Scene;
}

/**
 * テスト用素材を作成
 */
function createMockMaterial(overrides: Partial<Material> = {}): Material {
  const defaultMaterial = {
    id: 'mat-1',
    name: '薬草',
    baseQuality: Quality.C,
    attributes: [],
    isRare: false,
    description: 'テスト素材',
  };

  return new Material({ ...defaultMaterial, ...overrides });
}

/**
 * テスト用素材選択肢を作成
 */
function createMockOption(material: Material, quantity: number = 1): MaterialOption {
  return { material, quantity };
}

describe('MaterialOptionView', () => {
  let mockScene: Phaser.Scene;

  beforeEach(() => {
    mockScene = createMockScene();
  });

  describe('コンストラクタ', () => {
    it('コンテナが正しく初期化される', () => {
      const options: MaterialOptionViewOptions = {
        scene: mockScene,
        options: [],
      };

      const view = new MaterialOptionView(options);

      expect(view).toBeDefined();
      expect(view.container).toBeDefined();
    });

    it('初期オプションを設定できる', () => {
      const materials = [
        createMockMaterial({ id: 'mat-1', name: '薬草' }),
        createMockMaterial({ id: 'mat-2', name: '鉱石' }),
      ];
      const materialOptions = materials.map((m) => createMockOption(m, 5));

      const options: MaterialOptionViewOptions = {
        scene: mockScene,
        options: materialOptions,
      };

      const view = new MaterialOptionView(options);

      expect(view.getOptions().length).toBe(2);
    });
  });

  describe('選択肢管理', () => {
    it('setOptionsで選択肢を設定できる', () => {
      const view = new MaterialOptionView({ scene: mockScene, options: [] });
      const materials = [
        createMockMaterial({ id: 'mat-1' }),
        createMockMaterial({ id: 'mat-2' }),
        createMockMaterial({ id: 'mat-3' }),
      ];
      const materialOptions = materials.map((m) => createMockOption(m));

      view.setOptions(materialOptions);

      expect(view.getOptions().length).toBe(3);
    });

    it('setOptionsで既存の選択肢がクリアされる', () => {
      const view = new MaterialOptionView({ scene: mockScene, options: [] });

      view.setOptions([createMockOption(createMockMaterial({ id: 'mat-1' }))]);
      view.setOptions([
        createMockOption(createMockMaterial({ id: 'mat-2' })),
        createMockOption(createMockMaterial({ id: 'mat-3' })),
      ]);

      expect(view.getOptions().length).toBe(2);
    });
  });

  describe('選択操作', () => {
    it('素材を選択できる', () => {
      const material = createMockMaterial({ id: 'mat-1' });
      const options: MaterialOptionViewOptions = {
        scene: mockScene,
        options: [createMockOption(material)],
      };
      const view = new MaterialOptionView(options);

      view.selectMaterial(material);

      expect(view.getSelectedMaterials().length).toBe(1);
      expect(view.getSelectedMaterials()[0]).toBe(material);
    });

    it('選択した素材を解除できる', () => {
      const material = createMockMaterial({ id: 'mat-1' });
      const options: MaterialOptionViewOptions = {
        scene: mockScene,
        options: [createMockOption(material)],
      };
      const view = new MaterialOptionView(options);

      view.selectMaterial(material);
      view.deselectMaterial(material);

      expect(view.getSelectedMaterials().length).toBe(0);
    });

    it('clearSelectionで全選択が解除される', () => {
      const materials = [
        createMockMaterial({ id: 'mat-1' }),
        createMockMaterial({ id: 'mat-2' }),
      ];
      const options: MaterialOptionViewOptions = {
        scene: mockScene,
        options: materials.map((m) => createMockOption(m)),
        maxSelections: 2,
      };
      const view = new MaterialOptionView(options);

      view.selectMaterial(materials[0]);
      view.selectMaterial(materials[1]);
      view.clearSelection();

      expect(view.getSelectedMaterials().length).toBe(0);
    });
  });

  describe('選択上限', () => {
    it('デフォルトの選択上限は1', () => {
      const materials = [
        createMockMaterial({ id: 'mat-1' }),
        createMockMaterial({ id: 'mat-2' }),
      ];
      const options: MaterialOptionViewOptions = {
        scene: mockScene,
        options: materials.map((m) => createMockOption(m)),
      };
      const view = new MaterialOptionView(options);

      view.selectMaterial(materials[0]);
      view.selectMaterial(materials[1]);

      // 2つ目は選択されない
      expect(view.getSelectedMaterials().length).toBe(1);
    });

    it('maxSelectionsを超えて選択できない', () => {
      const materials = [
        createMockMaterial({ id: 'mat-1' }),
        createMockMaterial({ id: 'mat-2' }),
        createMockMaterial({ id: 'mat-3' }),
      ];
      const options: MaterialOptionViewOptions = {
        scene: mockScene,
        options: materials.map((m) => createMockOption(m)),
        maxSelections: 2,
      };
      const view = new MaterialOptionView(options);

      view.selectMaterial(materials[0]);
      view.selectMaterial(materials[1]);
      view.selectMaterial(materials[2]);

      expect(view.getSelectedMaterials().length).toBe(2);
    });

    it('canSelectMoreが正しく動作する', () => {
      const materials = [
        createMockMaterial({ id: 'mat-1' }),
        createMockMaterial({ id: 'mat-2' }),
      ];
      const options: MaterialOptionViewOptions = {
        scene: mockScene,
        options: materials.map((m) => createMockOption(m)),
        maxSelections: 2,
      };
      const view = new MaterialOptionView(options);

      expect(view.canSelectMore()).toBe(true);
      view.selectMaterial(materials[0]);
      expect(view.canSelectMore()).toBe(true);
      view.selectMaterial(materials[1]);
      expect(view.canSelectMore()).toBe(false);
    });

    it('setMaxSelectionsで上限を変更できる', () => {
      const materials = [
        createMockMaterial({ id: 'mat-1' }),
        createMockMaterial({ id: 'mat-2' }),
        createMockMaterial({ id: 'mat-3' }),
      ];
      const options: MaterialOptionViewOptions = {
        scene: mockScene,
        options: materials.map((m) => createMockOption(m)),
        maxSelections: 1,
      };
      const view = new MaterialOptionView(options);

      view.selectMaterial(materials[0]);
      view.setMaxSelections(3);
      view.selectMaterial(materials[1]);
      view.selectMaterial(materials[2]);

      expect(view.getSelectedMaterials().length).toBe(3);
    });
  });

  describe('コールバック', () => {
    it('選択時にonSelectが呼ばれる', () => {
      const onSelect = vi.fn();
      const material = createMockMaterial({ id: 'mat-1' });
      const options: MaterialOptionViewOptions = {
        scene: mockScene,
        options: [createMockOption(material)],
        onSelect,
      };
      const view = new MaterialOptionView(options);

      view.selectMaterial(material);

      expect(onSelect).toHaveBeenCalledWith(material);
    });

    it('解除時にonDeselectが呼ばれる', () => {
      const onDeselect = vi.fn();
      const material = createMockMaterial({ id: 'mat-1' });
      const options: MaterialOptionViewOptions = {
        scene: mockScene,
        options: [createMockOption(material)],
        onDeselect,
      };
      const view = new MaterialOptionView(options);

      view.selectMaterial(material);
      view.deselectMaterial(material);

      expect(onDeselect).toHaveBeenCalledWith(material);
    });
  });

  describe('表示制御', () => {
    it('setVisibleで表示/非表示を切り替えられる', () => {
      const view = new MaterialOptionView({ scene: mockScene, options: [] });

      view.setVisible(false);

      expect(view.container.setVisible).toHaveBeenCalledWith(false);
    });

    it('setEnabledで有効/無効を切り替えられる', () => {
      const view = new MaterialOptionView({ scene: mockScene, options: [] });

      view.setEnabled(false);

      expect(view.container.setAlpha).toHaveBeenCalledWith(0.5);
    });
  });

  describe('破棄', () => {
    it('destroyでコンテナが破棄される', () => {
      const view = new MaterialOptionView({ scene: mockScene, options: [] });

      view.destroy();

      expect(view.container.destroy).toHaveBeenCalled();
    });
  });
});
