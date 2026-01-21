/**
 * RecipeListUIコンポーネントのテスト
 * TASK-0045 調合フェーズUI実装（再実装）
 *
 * @description
 * TC-100 ~ TC-122: 正常系テストケース
 */

import { RecipeListUI } from '@presentation/ui/components/RecipeListUI';
import type { CardId } from '@shared/types';
import { toCardId } from '@shared/types/ids';
import type { IRecipeCardMaster } from '@shared/types/master-data';
import type Phaser from 'phaser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// =============================================================================
// モック定義
// =============================================================================

/**
 * コンテナモックインターフェース
 */
interface MockContainer {
  setPosition: ReturnType<typeof vi.fn>;
  setVisible: ReturnType<typeof vi.fn>;
  setDepth: ReturnType<typeof vi.fn>;
  add: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
  x: number;
  y: number;
  visible: boolean;
}

/**
 * rexUIラベルモックインターフェース
 */
interface MockLabel {
  setInteractive: ReturnType<typeof vi.fn>;
  on: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
  setBackgroundColor: ReturnType<typeof vi.fn>;
}

/**
 * Phaserシーンモックインターフェース
 */
interface MockScene extends Phaser.Scene {
  add: {
    container: ReturnType<typeof vi.fn>;
    rectangle: ReturnType<typeof vi.fn>;
    text: ReturnType<typeof vi.fn>;
  };
  cameras: {
    main: {
      centerX: number;
      centerY: number;
      width: number;
      height: number;
    };
  };
  rexUI: {
    add: {
      roundRectangle: ReturnType<typeof vi.fn>;
      label: ReturnType<typeof vi.fn>;
      scrollablePanel: ReturnType<typeof vi.fn>;
      sizer: ReturnType<typeof vi.fn>;
    };
  };
}

/**
 * Phaserシーンのモックを作成する
 */
const createMockScene = (): { scene: MockScene; mockContainer: MockContainer } => {
  const mockContainer: MockContainer = {
    setPosition: vi.fn().mockReturnThis(),
    setVisible: vi.fn().mockReturnThis(),
    setDepth: vi.fn().mockReturnThis(),
    add: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
    x: 0,
    y: 0,
    visible: true,
  };

  const mockLabel: MockLabel = {
    setInteractive: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
    setBackgroundColor: vi.fn().mockReturnThis(),
  };

  const mockSizer = {
    add: vi.fn().mockReturnThis(),
    layout: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
  };

  const scene = {
    add: {
      container: vi.fn().mockReturnValue(mockContainer),
      rectangle: vi.fn().mockReturnValue({
        setOrigin: vi.fn().mockReturnThis(),
        setFillStyle: vi.fn().mockReturnThis(),
      }),
      text: vi.fn().mockReturnValue({
        setOrigin: vi.fn().mockReturnThis(),
        setText: vi.fn().mockReturnThis(),
        destroy: vi.fn(),
      }),
    },
    cameras: {
      main: {
        centerX: 640,
        centerY: 360,
        width: 1280,
        height: 720,
      },
    },
    rexUI: {
      add: {
        roundRectangle: vi.fn().mockReturnValue({
          setFillStyle: vi.fn().mockReturnThis(),
        }),
        label: vi.fn().mockReturnValue(mockLabel),
        scrollablePanel: vi.fn().mockReturnValue({
          layout: vi.fn().mockReturnThis(),
          destroy: vi.fn(),
        }),
        sizer: vi.fn().mockReturnValue(mockSizer),
      },
    },
  } as unknown as MockScene;

  return { scene, mockContainer };
};

/**
 * レシピマスターデータを生成する
 */
const createMockRecipe = (overrides?: Partial<IRecipeCardMaster>): IRecipeCardMaster => ({
  id: toCardId('recipe-001'),
  name: '回復薬',
  type: 'RECIPE',
  cost: 1,
  requiredMaterials: [{ materialId: 'mat-001', quantity: 1 }],
  outputItemId: 'item-001',
  category: 'consumable',
  rarity: 'common',
  unlockRank: 'E',
  description: '基本的な回復薬',
  ...overrides,
});

// =============================================================================
// テストスイート
// =============================================================================

describe('RecipeListUI', () => {
  let scene: MockScene;
  let mockContainer: MockContainer;

  beforeEach(() => {
    const mocks = createMockScene();
    scene = mocks.scene;
    mockContainer = mocks.mockContainer;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ========================================
  // 1. 初期化テストケース
  // ========================================

  describe('初期化', () => {
    describe('TC-100: BaseComponent継承', () => {
      // 【テスト目的】: RecipeListUIがBaseComponentを継承して正常に初期化されることを確認
      // 【対応要件】: FR-100
      // 🔵 信頼性レベル: requirements.md セクション2.2.1 FR-100に明記

      it('TC-100: コンストラクタで正常にインスタンスが作成される', () => {
        // Given: 有効なPhaserシーンモックとレシピ配列
        const recipes = [createMockRecipe()];

        // When: RecipeListUIをインスタンス化する
        const ui = new RecipeListUI(scene, 0, 0, recipes);

        // Then:
        // - インスタンスが正常に作成される
        expect(ui).toBeDefined();
        expect(ui).toBeInstanceOf(RecipeListUI);
      });
    });

    describe('TC-101: IRecipeCardMaster[]を受け取って表示', () => {
      // 【テスト目的】: IRecipeCardMaster[]を受け取って表示されることを確認
      // 【対応要件】: FR-101
      // 🔵 信頼性レベル: requirements.md セクション2.2.1 FR-101に明記

      it('TC-101: レシピ配列を受け取って表示される', () => {
        // Given: 複数のレシピ
        const recipes = [
          createMockRecipe({ id: toCardId('recipe-1'), name: 'レシピ1' }),
          createMockRecipe({ id: toCardId('recipe-2'), name: 'レシピ2' }),
        ];

        // When: RecipeListUIをインスタンス化してcreate()を呼び出す
        const ui = new RecipeListUI(scene, 0, 0, recipes);
        ui.create();

        // Then:
        // - レシピが表示される
        expect(ui.getRecipeCount()).toBe(2);
      });
    });

    describe('TC-102: 選択コールバックの設定', () => {
      // 【テスト目的】: 選択時コールバックがオプションで設定できることを確認
      // 【対応要件】: FR-102
      // 🔵 信頼性レベル: requirements.md セクション2.2.1 FR-102に明記

      it('TC-102: onSelectコールバックがオプションで設定できる', () => {
        // Given: 有効なPhaserシーンモック、レシピ配列、コールバック関数
        const recipes = [createMockRecipe()];
        const onSelect = vi.fn();

        // When: コールバック付きでRecipeListUIをインスタンス化する
        const ui = new RecipeListUI(scene, 0, 0, recipes, onSelect);

        // Then:
        // - エラーなくインスタンスが作成される
        expect(ui).toBeDefined();
      });
    });
  });

  // ========================================
  // 2. レシピ表示テストケース
  // ========================================

  describe('レシピ表示', () => {
    describe('TC-110: レシピが縦方向リストとして表示', () => {
      // 【テスト目的】: レシピが縦方向リストとして表示されることを確認
      // 【対応要件】: FR-110
      // 🔵 信頼性レベル: requirements.md セクション2.2.2 FR-110に明記

      it('TC-110: レシピが縦方向リストとして表示される', () => {
        // Given: 複数のレシピ
        const recipes = [
          createMockRecipe({ id: toCardId('recipe-1'), name: 'レシピ1' }),
          createMockRecipe({ id: toCardId('recipe-2'), name: 'レシピ2' }),
          createMockRecipe({ id: toCardId('recipe-3'), name: 'レシピ3' }),
        ];

        // When: RecipeListUIをインスタンス化してcreate()を呼び出す
        const ui = new RecipeListUI(scene, 0, 0, recipes);
        ui.create();

        // Then:
        // - すべてのレシピが表示される
        expect(ui.getRecipeCount()).toBe(3);
      });
    });

    describe('TC-111: 各レシピにレシピ名が表示', () => {
      // 【テスト目的】: 各レシピにレシピ名が表示されることを確認
      // 【対応要件】: FR-111
      // 🔵 信頼性レベル: requirements.md セクション2.2.2 FR-111に明記

      it('TC-111: 各レシピにレシピ名が表示される', () => {
        // Given: レシピ
        const recipes = [createMockRecipe({ name: '回復薬' })];

        // When: RecipeListUIをインスタンス化してcreate()を呼び出す
        const ui = new RecipeListUI(scene, 0, 0, recipes);
        ui.create();

        // Then:
        // - scene.add.textまたはrexUI.add.labelが呼び出される
        expect(scene.rexUI.add.label).toHaveBeenCalled();
      });
    });

    describe('TC-112: 各レシピに必要素材の要約が表示', () => {
      // 【テスト目的】: 各レシピに必要素材の要約が表示されることを確認
      // 【対応要件】: FR-112
      // 🔵 信頼性レベル: requirements.md セクション2.2.2 FR-112に明記

      it('TC-112: 各レシピに必要素材の要約が表示される', () => {
        // Given: 複数の必要素材を持つレシピ
        const recipes = [
          createMockRecipe({
            requiredMaterials: [
              { materialId: 'mat-001', quantity: 2 },
              { materialId: 'mat-002', quantity: 1 },
            ],
          }),
        ];

        // When: RecipeListUIをインスタンス化してcreate()を呼び出す
        const ui = new RecipeListUI(scene, 0, 0, recipes);
        ui.create();

        // Then:
        // - 必要素材情報がある（表示されている）
        expect(ui.getRecipeInfo(recipes[0].id)?.requiredMaterials).toHaveLength(2);
      });
    });
  });

  // ========================================
  // 3. 選択状態テストケース
  // ========================================

  describe('選択状態', () => {
    describe('TC-120: レシピクリックでハイライト表示', () => {
      // 【テスト目的】: レシピクリック時にハイライト表示されることを確認
      // 【対応要件】: FR-120
      // 🔵 信頼性レベル: requirements.md セクション2.2.3 FR-120に明記

      it('TC-120: レシピクリックでハイライト表示される', () => {
        // Given: RecipeListUIが初期化済み
        const recipe = createMockRecipe();
        const recipes = [recipe];
        const ui = new RecipeListUI(scene, 0, 0, recipes);
        ui.create();

        // When: レシピを選択する
        ui.selectRecipe(recipe.id);

        // Then:
        // - 選択状態になる
        expect(ui.isSelected(recipe.id)).toBe(true);
      });
    });

    describe('TC-121: コールバック呼び出し', () => {
      // 【テスト目的】: レシピクリック時にコールバック関数が呼び出されることを確認
      // 【対応要件】: FR-121
      // 🔵 信頼性レベル: requirements.md セクション2.2.3 FR-121に明記

      it('TC-121: レシピクリックでコールバックが呼び出される', () => {
        // Given: RecipeListUIが初期化済み、コールバック設定済み
        const recipe = createMockRecipe();
        const recipes = [recipe];
        const onSelect = vi.fn();
        const ui = new RecipeListUI(scene, 0, 0, recipes, onSelect);
        ui.create();

        // When: レシピを選択する
        ui.selectRecipe(recipe.id);

        // Then:
        // - onSelectがレシピと共に呼び出される
        expect(onSelect).toHaveBeenCalledWith(recipe);
      });
    });

    describe('TC-122: 選択解除', () => {
      // 【テスト目的】: 新しいレシピ選択時に以前の選択が解除されることを確認
      // 【対応要件】: FR-122
      // 🔵 信頼性レベル: requirements.md セクション2.2.3 FR-122に明記

      it('TC-122: 新しいレシピ選択で以前の選択が解除される', () => {
        // Given: RecipeListUIが初期化済み、レシピ1が選択済み
        const recipe1 = createMockRecipe({ id: toCardId('recipe-1'), name: 'レシピ1' });
        const recipe2 = createMockRecipe({ id: toCardId('recipe-2'), name: 'レシピ2' });
        const recipes = [recipe1, recipe2];
        const ui = new RecipeListUI(scene, 0, 0, recipes);
        ui.create();
        ui.selectRecipe(recipe1.id);

        // When: レシピ2を選択する
        ui.selectRecipe(recipe2.id);

        // Then:
        // - 選択中のレシピがレシピ2になる
        expect(ui.getSelectedRecipeId()).toBe(recipe2.id);
        // - レシピ1は選択解除される（isSelected(recipe1.id)がfalse）
        expect(ui.isSelected(recipe1.id)).toBe(false);
      });
    });
  });

  // ========================================
  // 4. 境界値テストケース
  // ========================================

  describe('境界値', () => {
    describe('空のレシピリスト', () => {
      it('空のレシピリストでも正常に表示される', () => {
        // Given: 空のレシピリスト
        const recipes: IRecipeCardMaster[] = [];

        // When: RecipeListUIをインスタンス化してcreate()を呼び出す
        const ui = new RecipeListUI(scene, 0, 0, recipes);
        ui.create();

        // Then:
        // - エラーなく表示される
        expect(ui.getRecipeCount()).toBe(0);
      });
    });

    describe('レシピ1件', () => {
      it('レシピ1件で正常に表示・選択できる', () => {
        // Given: レシピ1件
        const recipe = createMockRecipe();
        const recipes = [recipe];

        // When: RecipeListUIをインスタンス化してcreate()を呼び出し、選択する
        const ui = new RecipeListUI(scene, 0, 0, recipes);
        ui.create();
        ui.selectRecipe(recipe.id);

        // Then:
        // - 正常に選択される
        expect(ui.getSelectedRecipeId()).toBe(recipe.id);
      });
    });

    describe('レシピ20件', () => {
      it('レシピ20件で正常に表示される', () => {
        // Given: レシピ20件
        const recipes = Array.from({ length: 20 }, (_, i) =>
          createMockRecipe({ id: toCardId(`recipe-${i}`), name: `レシピ${i}` }),
        );

        // When: RecipeListUIをインスタンス化してcreate()を呼び出す
        const ui = new RecipeListUI(scene, 0, 0, recipes);
        ui.create();

        // Then:
        // - 20件すべて表示される
        expect(ui.getRecipeCount()).toBe(20);
      });
    });
  });

  // ========================================
  // 5. リソース管理テストケース
  // ========================================

  describe('リソース管理', () => {
    describe('destroy()でリソース破棄', () => {
      it('destroy()でコンテナとUI要素が破棄される', () => {
        // Given: RecipeListUIが初期化済み
        const recipes = [createMockRecipe()];
        const ui = new RecipeListUI(scene, 0, 0, recipes);
        ui.create();

        // When: destroy()を呼び出す
        ui.destroy();

        // Then:
        // - コンテナのdestroy()が呼び出される
        expect(mockContainer.destroy).toHaveBeenCalled();
      });
    });
  });
});
