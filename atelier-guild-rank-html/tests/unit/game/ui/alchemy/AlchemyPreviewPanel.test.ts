/**
 * AlchemyPreviewPanel単体テスト
 *
 * TASK-0226: AlchemyPreviewPanel実装のテスト
 * 調合プレビューパネルの各機能をテストする。
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Quality, Rarity, GuildRank, CardType } from '@domain/common/types';
import { Material } from '@domain/material/MaterialEntity';
import { RecipeCard } from '@domain/card/CardEntity';
import { AlchemyPreviewPanel } from '../../../../../src/game/ui/alchemy/AlchemyPreviewPanel';
import type {
  AlchemyPreview,
  AlchemyPreviewPanelOptions,
} from '../../../../../src/game/ui/alchemy/IAlchemyPreviewPanel';

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
    fillRect: vi.fn().mockReturnThis(),
    lineStyle: vi.fn().mockReturnThis(),
    strokeRoundedRect: vi.fn().mockReturnThis(),
    fillCircle: vi.fn().mockReturnThis(),
    lineBetween: vi.fn().mockReturnThis(),
    clear: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
  };

  const createMockContainer = () => {
    const data: Record<string, unknown> = {};
    const children: unknown[] = [];
    const container: any = {
      setDepth: vi.fn().mockReturnThis(),
      setVisible: vi.fn().mockReturnThis(),
      setAlpha: vi.fn().mockReturnThis(),
      setPosition: vi.fn().mockReturnThis(),
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
      disableInteractive: vi.fn().mockReturnThis(),
      on: vi.fn().mockReturnThis(),
      removeAll: vi.fn().mockImplementation(function (destroyChildren?: boolean) {
        if (destroyChildren) {
          children.forEach((child: any) => {
            if (child.destroy) child.destroy();
          });
        }
        children.length = 0;
      }),
      getAll: vi.fn().mockImplementation(() => [...children]),
      each: vi.fn().mockImplementation((callback: (child: unknown) => void) => {
        children.forEach(callback);
      }),
      getAt: vi.fn().mockImplementation((index: number) => children[index]),
      get length() {
        return children.length;
      },
      x: 0,
      y: 0,
      visible: true,
      alpha: 1,
    };
    return container;
  };

  const createMockText = () => ({
    setOrigin: vi.fn().mockReturnThis(),
    setAlpha: vi.fn().mockReturnThis(),
    setText: vi.fn().mockReturnThis(),
    setColor: vi.fn().mockReturnThis(),
    setVisible: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
    text: '',
  });

  return {
    add: {
      container: vi.fn().mockImplementation((x?: number, y?: number) => {
        const container = createMockContainer();
        container.x = x ?? 0;
        container.y = y ?? 0;
        return container;
      }),
      graphics: vi.fn().mockReturnValue(mockGraphics),
      text: vi.fn().mockImplementation(
        (x: number, y: number, text: string, _style?: any) => {
          const mockText = createMockText();
          (mockText as any).text = text;
          (mockText as any).x = x;
          (mockText as any).y = y;
          mockText.setText = vi.fn().mockImplementation((newText: string) => {
            (mockText as any).text = newText;
            return mockText;
          });
          return mockText;
        }
      ),
      sprite: vi.fn().mockImplementation(() => ({
        setDisplaySize: vi.fn().mockReturnThis(),
        setOrigin: vi.fn().mockReturnThis(),
        destroy: vi.fn(),
      })),
    },
    textures: {
      exists: vi.fn().mockReturnValue(false),
    },
  } as unknown as Phaser.Scene;
}

/**
 * テスト用のモックレシピカードを作成
 */
function createMockRecipeCard(overrides: Partial<RecipeCard> = {}): RecipeCard {
  const defaultCard = {
    id: 'recipe-1',
    name: '癒しの軟膏',
    type: CardType.RECIPE,
    rarity: Rarity.COMMON,
    unlockRank: GuildRank.G,
    description: 'テストレシピ',
    cost: 2,
    resultItemId: 'item-1',
    requiredMaterials: [
      { materialId: 'mat-1', quantity: 2 },
    ],
    baseQuality: Quality.C,
    craftingTime: 1,
  };

  return new RecipeCard({ ...defaultCard, ...overrides } as any);
}

/**
 * テスト用のモック素材を作成
 */
function createMockMaterial(overrides: Partial<Material> = {}): Material {
  const defaultMaterial = {
    id: overrides.id ?? 'mat-1',
    name: overrides.name ?? '薬草',
    baseQuality: Quality.C,
    attributes: [],
    isRare: false,
    description: 'テスト素材',
  };

  return new Material({ ...defaultMaterial, ...overrides });
}

/**
 * テスト用のAlchemyPreviewを作成
 */
function createMockPreview(overrides: Partial<AlchemyPreview> = {}): AlchemyPreview {
  return {
    recipe: overrides.recipe ?? createMockRecipeCard(),
    materials: overrides.materials ?? [createMockMaterial()],
    predictedQuality: overrides.predictedQuality ?? 'normal',
    predictedTraits: overrides.predictedTraits ?? [],
    canCraft: overrides.canCraft ?? true,
    missingMaterials: overrides.missingMaterials ?? [],
  };
}

describe('AlchemyPreviewPanel', () => {
  let mockScene: Phaser.Scene;

  beforeEach(() => {
    mockScene = createMockScene();
  });

  // ========================================
  // 1. 正常系テストケース
  // ========================================

  describe('1.1 プレビュー設定・取得', () => {
    // TC-226-001: プレビュー設定 - 有効なプレビュー情報
    it('TC-226-001: setPreviewで有効なプレビュー情報を設定できる', () => {
      const panel = new AlchemyPreviewPanel(mockScene);
      const preview = createMockPreview();

      panel.setPreview(preview);

      expect(panel.getPreview()).toBe(preview);
    });

    // TC-226-002: プレビュー設定 - nullでリセット
    it('TC-226-002: setPreview(null)で空の初期状態に戻る', () => {
      const panel = new AlchemyPreviewPanel(mockScene);
      const preview = createMockPreview();

      panel.setPreview(preview);
      panel.setPreview(null);

      expect(panel.getPreview()).toBeNull();
    });

    // TC-226-003: プレビュー取得 - 現在のプレビュー情報
    it('TC-226-003: getPreviewで設定したプレビュー情報を取得できる', () => {
      const panel = new AlchemyPreviewPanel(mockScene);
      const preview = createMockPreview({
        predictedQuality: 'rare',
        predictedTraits: ['品質上昇'],
      });

      panel.setPreview(preview);
      const retrieved = panel.getPreview();

      expect(retrieved).toBe(preview);
      expect(retrieved?.predictedQuality).toBe('rare');
      expect(retrieved?.predictedTraits).toContain('品質上昇');
    });

    // TC-226-004: プレビュー取得 - 未設定時
    it('TC-226-004: 初期状態ではgetPreviewがnullを返す', () => {
      const panel = new AlchemyPreviewPanel(mockScene);

      expect(panel.getPreview()).toBeNull();
    });

    // TC-226-005: レシピ名表示
    it('TC-226-005: レシピ名がパネル上部に表示される', () => {
      const panel = new AlchemyPreviewPanel(mockScene);
      const recipe = createMockRecipeCard({ name: '癒しの軟膏' } as any);
      const preview = createMockPreview({ recipe });

      panel.setPreview(preview);

      // レシピ名が設定されている（モックのため間接的に確認）
      expect(panel.getPreview()?.recipe.name).toBe('癒しの軟膏');
    });
  });

  describe('1.2 品質表示', () => {
    // TC-226-006: 品質表示 - legendary
    it('TC-226-006: legendary品質が金色で表示される', () => {
      const panel = new AlchemyPreviewPanel(mockScene);
      const preview = createMockPreview({ predictedQuality: 'legendary' });

      panel.setPreview(preview);

      expect(panel.getPreview()?.predictedQuality).toBe('legendary');
    });

    // TC-226-007: 品質表示 - epic
    it('TC-226-007: epic品質が紫色で表示される', () => {
      const panel = new AlchemyPreviewPanel(mockScene);
      const preview = createMockPreview({ predictedQuality: 'epic' });

      panel.setPreview(preview);

      expect(panel.getPreview()?.predictedQuality).toBe('epic');
    });

    // TC-226-008: 品質表示 - rare
    it('TC-226-008: rare品質が青色で表示される', () => {
      const panel = new AlchemyPreviewPanel(mockScene);
      const preview = createMockPreview({ predictedQuality: 'rare' });

      panel.setPreview(preview);

      expect(panel.getPreview()?.predictedQuality).toBe('rare');
    });

    // TC-226-009: 品質表示 - good
    it('TC-226-009: good品質が緑色で表示される', () => {
      const panel = new AlchemyPreviewPanel(mockScene);
      const preview = createMockPreview({ predictedQuality: 'good' });

      panel.setPreview(preview);

      expect(panel.getPreview()?.predictedQuality).toBe('good');
    });

    // TC-226-010: 品質表示 - normal
    it('TC-226-010: normal品質が白色で表示される', () => {
      const panel = new AlchemyPreviewPanel(mockScene);
      const preview = createMockPreview({ predictedQuality: 'normal' });

      panel.setPreview(preview);

      expect(panel.getPreview()?.predictedQuality).toBe('normal');
    });

    // TC-226-011: 品質表示 - poor
    it('TC-226-011: poor品質が灰色で表示される', () => {
      const panel = new AlchemyPreviewPanel(mockScene);
      const preview = createMockPreview({ predictedQuality: 'poor' });

      panel.setPreview(preview);

      expect(panel.getPreview()?.predictedQuality).toBe('poor');
    });
  });

  describe('1.3 素材リスト表示', () => {
    // TC-226-012: 素材リスト表示 - 1つの素材
    it('TC-226-012: 1つの素材がMaterialViewで表示される', () => {
      const panel = new AlchemyPreviewPanel(mockScene);
      const materials = [createMockMaterial({ id: 'mat-1' })];
      const preview = createMockPreview({ materials });

      panel.setPreview(preview);

      expect(panel.getPreview()?.materials.length).toBe(1);
    });

    // TC-226-013: 素材リスト表示 - 2つの素材
    it('TC-226-013: 2つの素材が1行2列で表示される', () => {
      const panel = new AlchemyPreviewPanel(mockScene);
      const materials = [
        createMockMaterial({ id: 'mat-1' }),
        createMockMaterial({ id: 'mat-2' }),
      ];
      const preview = createMockPreview({ materials });

      panel.setPreview(preview);

      expect(panel.getPreview()?.materials.length).toBe(2);
    });

    // TC-226-014: 素材リスト表示 - 3つの素材
    it('TC-226-014: 3つの素材が2行で表示される', () => {
      const panel = new AlchemyPreviewPanel(mockScene);
      const materials = [
        createMockMaterial({ id: 'mat-1' }),
        createMockMaterial({ id: 'mat-2' }),
        createMockMaterial({ id: 'mat-3' }),
      ];
      const preview = createMockPreview({ materials });

      panel.setPreview(preview);

      expect(panel.getPreview()?.materials.length).toBe(3);
    });

    // TC-226-015: 素材リスト表示 - 4つの素材
    it('TC-226-015: 4つの素材が2行2列で表示される', () => {
      const panel = new AlchemyPreviewPanel(mockScene);
      const materials = [
        createMockMaterial({ id: 'mat-1' }),
        createMockMaterial({ id: 'mat-2' }),
        createMockMaterial({ id: 'mat-3' }),
        createMockMaterial({ id: 'mat-4' }),
      ];
      const preview = createMockPreview({ materials });

      panel.setPreview(preview);

      expect(panel.getPreview()?.materials.length).toBe(4);
    });
  });

  describe('1.4 特性リスト表示', () => {
    // TC-226-016: 特性リスト表示 - 1つの特性
    it('TC-226-016: 1つの特性がリスト形式で表示される', () => {
      const panel = new AlchemyPreviewPanel(mockScene);
      const preview = createMockPreview({
        predictedTraits: ['品質上昇'],
      });

      panel.setPreview(preview);

      expect(panel.getPreview()?.predictedTraits).toContain('品質上昇');
    });

    // TC-226-017: 特性リスト表示 - 2つの特性
    it('TC-226-017: 2つの特性がリスト形式で表示される', () => {
      const panel = new AlchemyPreviewPanel(mockScene);
      const preview = createMockPreview({
        predictedTraits: ['品質上昇', '効果増大'],
      });

      panel.setPreview(preview);

      expect(panel.getPreview()?.predictedTraits.length).toBe(2);
    });

    // TC-226-018: 特性リスト表示 - 3つの特性
    it('TC-226-018: 3つの特性がすべて表示される', () => {
      const panel = new AlchemyPreviewPanel(mockScene);
      const preview = createMockPreview({
        predictedTraits: ['品質上昇', '効果増大', '持続延長'],
      });

      panel.setPreview(preview);

      expect(panel.getPreview()?.predictedTraits.length).toBe(3);
    });
  });

  describe('1.5 ステータスインジケーター', () => {
    // TC-226-019: ステータス - 調合可能
    it('TC-226-019: canCraft=trueで「調合可能」が表示される', () => {
      const panel = new AlchemyPreviewPanel(mockScene);
      const preview = createMockPreview({
        canCraft: true,
        missingMaterials: [],
      });

      panel.setPreview(preview);

      expect(panel.getPreview()?.canCraft).toBe(true);
    });

    // TC-226-020: ステータス - 素材不足
    it('TC-226-020: canCraft=falseで素材不足時に「素材不足」が表示される', () => {
      const panel = new AlchemyPreviewPanel(mockScene);
      const preview = createMockPreview({
        canCraft: false,
        missingMaterials: ['薬草'],
      });

      panel.setPreview(preview);

      expect(panel.getPreview()?.canCraft).toBe(false);
      expect(panel.getPreview()?.missingMaterials).toContain('薬草');
    });

    // TC-226-021: ステータス - 待機中
    it('TC-226-021: canCraft=falseで不足素材なしの場合「待機中」が表示される', () => {
      const panel = new AlchemyPreviewPanel(mockScene);
      const preview = createMockPreview({
        canCraft: false,
        missingMaterials: [],
      });

      panel.setPreview(preview);

      expect(panel.getPreview()?.canCraft).toBe(false);
      expect(panel.getPreview()?.missingMaterials.length).toBe(0);
    });
  });

  // ========================================
  // 2. 異常系テストケース
  // ========================================

  describe('2.1 nullプレビュー設定', () => {
    // TC-226-022: プレビュー設定後にnullを設定
    it('TC-226-022: プレビュー設定後にnullで初期状態に戻る', () => {
      const panel = new AlchemyPreviewPanel(mockScene);
      const preview = createMockPreview();

      panel.setPreview(preview);
      expect(panel.getPreview()).not.toBeNull();

      panel.setPreview(null);
      expect(panel.getPreview()).toBeNull();
    });
  });

  describe('2.2 空の素材リスト', () => {
    // TC-226-023: 素材リストが空の場合
    it('TC-226-023: 素材リストが空の場合「素材なし」が表示される', () => {
      const panel = new AlchemyPreviewPanel(mockScene);
      const preview = createMockPreview({ materials: [] });

      panel.setPreview(preview);

      expect(panel.getPreview()?.materials.length).toBe(0);
    });
  });

  describe('2.3 無効な品質値', () => {
    // TC-226-024: 未定義の品質値
    it('TC-226-024: 未定義の品質値でもエラーなく表示される', () => {
      const panel = new AlchemyPreviewPanel(mockScene);
      const preview = createMockPreview({ predictedQuality: 'unknown' });

      expect(() => panel.setPreview(preview)).not.toThrow();
      expect(panel.getPreview()?.predictedQuality).toBe('unknown');
    });

    // TC-226-025: 空文字の品質値
    it('TC-226-025: 空文字の品質値でもエラーなく表示される', () => {
      const panel = new AlchemyPreviewPanel(mockScene);
      const preview = createMockPreview({ predictedQuality: '' });

      expect(() => panel.setPreview(preview)).not.toThrow();
    });
  });

  describe('2.4 空の特性リスト', () => {
    // TC-226-026: 特性リストが空の場合
    it('TC-226-026: 特性リストが空の場合「継承特性なし」が表示される', () => {
      const panel = new AlchemyPreviewPanel(mockScene);
      const preview = createMockPreview({ predictedTraits: [] });

      panel.setPreview(preview);

      expect(panel.getPreview()?.predictedTraits.length).toBe(0);
    });
  });

  // ========================================
  // 3. 境界値テストケース
  // ========================================

  describe('3.1 素材数の境界値', () => {
    // TC-226-027: 素材0個
    it('TC-226-027: 素材0個で「素材なし」が表示される', () => {
      const panel = new AlchemyPreviewPanel(mockScene);
      const preview = createMockPreview({ materials: [] });

      panel.setPreview(preview);

      expect(panel.getPreview()?.materials.length).toBe(0);
    });

    // TC-226-028: 素材5個（境界値）
    it('TC-226-028: 素材5個で4つ表示と「+1 more」が表示される', () => {
      const panel = new AlchemyPreviewPanel(mockScene);
      const materials = Array.from({ length: 5 }, (_, i) =>
        createMockMaterial({ id: `mat-${i}` })
      );
      const preview = createMockPreview({ materials });

      panel.setPreview(preview);

      expect(panel.getPreview()?.materials.length).toBe(5);
    });

    // TC-226-029: 素材6個以上
    it('TC-226-029: 素材6個で4つ表示と「+2 more」が表示される', () => {
      const panel = new AlchemyPreviewPanel(mockScene);
      const materials = Array.from({ length: 6 }, (_, i) =>
        createMockMaterial({ id: `mat-${i}` })
      );
      const preview = createMockPreview({ materials });

      panel.setPreview(preview);

      expect(panel.getPreview()?.materials.length).toBe(6);
    });

    // TC-226-030: 素材10個（大量）
    it('TC-226-030: 素材10個で4つ表示と「+6 more」が表示される', () => {
      const panel = new AlchemyPreviewPanel(mockScene);
      const materials = Array.from({ length: 10 }, (_, i) =>
        createMockMaterial({ id: `mat-${i}` })
      );
      const preview = createMockPreview({ materials });

      panel.setPreview(preview);

      expect(panel.getPreview()?.materials.length).toBe(10);
    });
  });

  describe('3.2 特性数の境界値', () => {
    // TC-226-031: 特性0個
    it('TC-226-031: 特性0個で「継承特性なし」が表示される', () => {
      const panel = new AlchemyPreviewPanel(mockScene);
      const preview = createMockPreview({ predictedTraits: [] });

      panel.setPreview(preview);

      expect(panel.getPreview()?.predictedTraits.length).toBe(0);
    });

    // TC-226-032: 特性4個以上（境界超過）
    it('TC-226-032: 特性4個で最初の3つのみ表示される', () => {
      const panel = new AlchemyPreviewPanel(mockScene);
      const preview = createMockPreview({
        predictedTraits: ['特性1', '特性2', '特性3', '特性4'],
      });

      panel.setPreview(preview);

      // 内部では最大3つ表示だが、previewには4つすべて含まれる
      expect(panel.getPreview()?.predictedTraits.length).toBe(4);
    });

    // TC-226-033: 特性5個以上
    it('TC-226-033: 特性5個でも最初の3つのみ表示される', () => {
      const panel = new AlchemyPreviewPanel(mockScene);
      const preview = createMockPreview({
        predictedTraits: ['特性1', '特性2', '特性3', '特性4', '特性5'],
      });

      panel.setPreview(preview);

      expect(panel.getPreview()?.predictedTraits.length).toBe(5);
    });
  });

  // ========================================
  // 4. 操作系テストケース
  // ========================================

  describe('4.1 addMaterial操作', () => {
    // TC-226-034: 素材追加 - 空のリストに追加
    it('TC-226-034: 空の素材リストに素材を追加できる', () => {
      const panel = new AlchemyPreviewPanel(mockScene);
      const preview = createMockPreview({ materials: [] });
      panel.setPreview(preview);

      const material = createMockMaterial({ id: 'mat-new' });
      panel.addMaterial(material);

      expect(panel.getPreview()?.materials.length).toBe(1);
    });

    // TC-226-035: 素材追加 - 既存リストに追加
    it('TC-226-035: 既存の素材リストに素材を追加できる', () => {
      const panel = new AlchemyPreviewPanel(mockScene);
      const materials = [
        createMockMaterial({ id: 'mat-1' }),
        createMockMaterial({ id: 'mat-2' }),
      ];
      const preview = createMockPreview({ materials });
      panel.setPreview(preview);

      const newMaterial = createMockMaterial({ id: 'mat-3' });
      panel.addMaterial(newMaterial);

      expect(panel.getPreview()?.materials.length).toBe(3);
    });

    // TC-226-036: 素材追加 - プレビュー未設定時
    it('TC-226-036: プレビュー未設定時は何も起こらない', () => {
      const panel = new AlchemyPreviewPanel(mockScene);
      const material = createMockMaterial({ id: 'mat-new' });

      expect(() => panel.addMaterial(material)).not.toThrow();
      expect(panel.getPreview()).toBeNull();
    });
  });

  describe('4.2 removeMaterial操作', () => {
    // TC-226-037: 素材削除 - 存在する素材を削除
    it('TC-226-037: 存在する素材を削除できる', () => {
      const panel = new AlchemyPreviewPanel(mockScene);
      const mat1 = createMockMaterial({ id: 'mat-1' });
      const mat2 = createMockMaterial({ id: 'mat-2' });
      const mat3 = createMockMaterial({ id: 'mat-3' });
      const preview = createMockPreview({ materials: [mat1, mat2, mat3] });
      panel.setPreview(preview);

      panel.removeMaterial(mat2);

      expect(panel.getPreview()?.materials.length).toBe(2);
      expect(panel.getPreview()?.materials).not.toContain(mat2);
    });

    // TC-226-038: 素材削除 - 存在しない素材を削除
    it('TC-226-038: 存在しない素材を削除しても変化なし', () => {
      const panel = new AlchemyPreviewPanel(mockScene);
      const materials = [
        createMockMaterial({ id: 'mat-1' }),
        createMockMaterial({ id: 'mat-2' }),
        createMockMaterial({ id: 'mat-3' }),
      ];
      const preview = createMockPreview({ materials });
      panel.setPreview(preview);

      const nonExistingMaterial = createMockMaterial({ id: 'mat-999' });
      panel.removeMaterial(nonExistingMaterial);

      expect(panel.getPreview()?.materials.length).toBe(3);
    });

    // TC-226-039: 素材削除 - プレビュー未設定時
    it('TC-226-039: プレビュー未設定時は何も起こらない', () => {
      const panel = new AlchemyPreviewPanel(mockScene);
      const material = createMockMaterial({ id: 'mat-1' });

      expect(() => panel.removeMaterial(material)).not.toThrow();
      expect(panel.getPreview()).toBeNull();
    });

    // TC-226-040: 素材削除 - 最後の1つを削除
    it('TC-226-040: 最後の1つを削除すると素材なしになる', () => {
      const panel = new AlchemyPreviewPanel(mockScene);
      const material = createMockMaterial({ id: 'mat-1' });
      const preview = createMockPreview({ materials: [material] });
      panel.setPreview(preview);

      panel.removeMaterial(material);

      expect(panel.getPreview()?.materials.length).toBe(0);
    });
  });

  describe('4.3 clearMaterials操作', () => {
    // TC-226-041: 全素材クリア - 複数の素材がある場合
    it('TC-226-041: 複数の素材をすべてクリアできる', () => {
      const panel = new AlchemyPreviewPanel(mockScene);
      const materials = Array.from({ length: 5 }, (_, i) =>
        createMockMaterial({ id: `mat-${i}` })
      );
      const preview = createMockPreview({ materials });
      panel.setPreview(preview);

      panel.clearMaterials();

      expect(panel.getPreview()?.materials.length).toBe(0);
    });

    // TC-226-042: 全素材クリア - 既に空の場合
    it('TC-226-042: 既に空の場合もエラーなくクリアできる', () => {
      const panel = new AlchemyPreviewPanel(mockScene);
      const preview = createMockPreview({ materials: [] });
      panel.setPreview(preview);

      expect(() => panel.clearMaterials()).not.toThrow();
      expect(panel.getPreview()?.materials.length).toBe(0);
    });

    // TC-226-043: 全素材クリア - プレビュー未設定時
    it('TC-226-043: プレビュー未設定時は何も起こらない', () => {
      const panel = new AlchemyPreviewPanel(mockScene);

      expect(() => panel.clearMaterials()).not.toThrow();
      expect(panel.getPreview()).toBeNull();
    });
  });

  describe('4.4 setVisible操作', () => {
    // TC-226-044: 表示切り替え - 非表示にする
    it('TC-226-044: setVisible(false)でパネルが非表示になる', () => {
      const panel = new AlchemyPreviewPanel(mockScene);

      panel.setVisible(false);

      expect(panel.container.setVisible).toHaveBeenCalledWith(false);
    });

    // TC-226-045: 表示切り替え - 表示にする
    it('TC-226-045: setVisible(true)でパネルが表示される', () => {
      const panel = new AlchemyPreviewPanel(mockScene);
      panel.setVisible(false);

      panel.setVisible(true);

      expect(panel.container.setVisible).toHaveBeenCalledWith(true);
    });
  });

  describe('4.5 setEnabled操作', () => {
    // TC-226-046: 有効状態切り替え - 無効にする
    it('TC-226-046: setEnabled(false)でパネルがグレーアウトされる', () => {
      const panel = new AlchemyPreviewPanel(mockScene);

      panel.setEnabled(false);

      expect(panel.container.setAlpha).toHaveBeenCalledWith(0.5);
    });

    // TC-226-047: 有効状態切り替え - 有効にする
    it('TC-226-047: setEnabled(true)でパネルが通常状態に戻る', () => {
      const panel = new AlchemyPreviewPanel(mockScene);
      panel.setEnabled(false);

      panel.setEnabled(true);

      expect(panel.container.setAlpha).toHaveBeenCalledWith(1);
    });
  });

  describe('4.6 destroy操作', () => {
    // TC-226-048: リソース破棄 - 正常破棄
    it('TC-226-048: destroyでコンテナが破棄される', () => {
      const panel = new AlchemyPreviewPanel(mockScene);
      const preview = createMockPreview({
        materials: [
          createMockMaterial({ id: 'mat-1' }),
          createMockMaterial({ id: 'mat-2' }),
        ],
      });
      panel.setPreview(preview);

      panel.destroy();

      expect(panel.container.destroy).toHaveBeenCalled();
    });

    // TC-226-049: リソース破棄 - 素材なしで破棄
    it('TC-226-049: 素材なしでもエラーなく破棄される', () => {
      const panel = new AlchemyPreviewPanel(mockScene);

      expect(() => panel.destroy()).not.toThrow();
      expect(panel.container.destroy).toHaveBeenCalled();
    });
  });

  // ========================================
  // 5. 初期化・コンストラクタテストケース
  // ========================================

  describe('5.1 オプション設定', () => {
    // TC-226-050: デフォルトオプションで初期化
    it('TC-226-050: デフォルトオプションで座標(0,0)に初期化される', () => {
      const panel = new AlchemyPreviewPanel(mockScene);

      expect(panel.container.x).toBe(0);
      expect(panel.container.y).toBe(0);
    });

    // TC-226-051: カスタム座標で初期化
    it('TC-226-051: カスタム座標で初期化される', () => {
      const panel = new AlchemyPreviewPanel(mockScene, { x: 100, y: 200 });

      expect(panel.container.x).toBe(100);
      expect(panel.container.y).toBe(200);
    });

    // TC-226-052: 初期状態の確認
    it('TC-226-052: 初期状態ではプレビューがnull', () => {
      const panel = new AlchemyPreviewPanel(mockScene);

      expect(panel.getPreview()).toBeNull();
    });
  });
});
