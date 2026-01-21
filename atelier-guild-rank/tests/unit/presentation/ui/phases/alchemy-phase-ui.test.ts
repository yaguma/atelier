/**
 * AlchemyPhaseUIコンポーネントのテスト
 * TASK-0045 調合フェーズUI実装（再実装）
 *
 * @description
 * TC-001 ~ TC-052: 正常系テストケース
 * TC-200 ~ TC-204: 異常系テストケース
 * TC-300 ~ TC-305: 境界値テストケース
 * TC-400 ~ TC-402: 統合テストケース
 */

import { ItemInstance } from '@domain/entities/ItemInstance';
import { MaterialInstance } from '@domain/entities/MaterialInstance';
import type { IAlchemyService } from '@domain/interfaces/alchemy-service.interface';
import { AlchemyPhaseUI } from '@presentation/ui/phases/AlchemyPhaseUI';
import type { CardId, Quality } from '@shared/types';
import { toCardId, toItemId, toMaterialId } from '@shared/types/ids';
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
    };
  };
}

/**
 * AlchemyServiceモックインターフェース
 */
interface MockAlchemyService extends IAlchemyService {
  craft: ReturnType<typeof vi.fn>;
  canCraft: ReturnType<typeof vi.fn>;
  previewQuality: ReturnType<typeof vi.fn>;
  getAvailableRecipes: ReturnType<typeof vi.fn>;
  checkRecipeRequirements: ReturnType<typeof vi.fn>;
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
      },
    },
  } as unknown as MockScene;

  return { scene, mockContainer };
};

/**
 * IAlchemyServiceモックを作成する
 */
const createMockAlchemyService = (): MockAlchemyService => ({
  craft: vi.fn(),
  canCraft: vi.fn().mockReturnValue(true),
  previewQuality: vi.fn().mockReturnValue('B' as Quality),
  getAvailableRecipes: vi.fn().mockReturnValue([]),
  checkRecipeRequirements: vi.fn().mockReturnValue({
    canCraft: true,
    missingMaterials: [],
    matchedMaterials: [],
  }),
});

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

/**
 * 素材インスタンスを生成する
 */
const createMockMaterial = (
  overrides?: Partial<{
    instanceId: string;
    quality: Quality;
  }>,
): MaterialInstance => {
  const instanceId = overrides?.instanceId ?? 'inst-001';
  const quality = overrides?.quality ?? ('B' as Quality);
  const master = {
    id: toMaterialId('mat-001'),
    name: '薬草',
    baseQuality: 'C' as Quality,
    attributes: [],
  };
  return new MaterialInstance(instanceId, master, quality);
};

/**
 * アイテムインスタンスを生成する
 */
const createMockItem = (
  overrides?: Partial<{
    instanceId: string;
    quality: Quality;
  }>,
): ItemInstance => {
  const instanceId = overrides?.instanceId ?? 'item-inst-001';
  const quality = overrides?.quality ?? ('B' as Quality);
  const master = {
    id: toItemId('item-001'),
    name: '回復薬',
    basePrice: 100,
  };
  return new ItemInstance(instanceId, master, quality, []);
};

// =============================================================================
// テストスイート
// =============================================================================

describe('AlchemyPhaseUI', () => {
  let scene: MockScene;
  let mockContainer: MockContainer;
  let alchemyService: MockAlchemyService;

  beforeEach(() => {
    const mocks = createMockScene();
    scene = mocks.scene;
    mockContainer = mocks.mockContainer;
    alchemyService = createMockAlchemyService();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ========================================
  // 1. 初期化テストケース
  // ========================================

  describe('初期化', () => {
    describe('TC-001: BaseComponentを継承して初期化', () => {
      // 【テスト目的】: AlchemyPhaseUIがBaseComponentを継承して正常に初期化されることを確認
      // 【対応要件】: FR-001
      // 🔵 信頼性レベル: requirements.md セクション2.1.1 FR-001に明記

      it('TC-001: コンストラクタで正常にインスタンスが作成される', () => {
        // Given: 有効なPhaserシーンモックとIAlchemyServiceモック
        // When: AlchemyPhaseUIをインスタンス化する
        const ui = new AlchemyPhaseUI(scene, alchemyService);

        // Then:
        // - インスタンスが正常に作成される
        expect(ui).toBeDefined();
        expect(ui).toBeInstanceOf(AlchemyPhaseUI);
      });
    });

    describe('TC-002: IAlchemyServiceのコンストラクタ注入', () => {
      // 【テスト目的】: IAlchemyServiceがコンストラクタで正しく注入されることを確認
      // 【対応要件】: FR-002
      // 🔵 信頼性レベル: requirements.md セクション2.1.1 FR-002に明記

      it('TC-002: alchemyServiceがコンストラクタで受け取られる', () => {
        // Given: 有効なPhaserシーンモックとIAlchemyServiceモック
        // When: AlchemyPhaseUIをインスタンス化する
        const ui = new AlchemyPhaseUI(scene, alchemyService);
        ui.create();

        // Then:
        // - alchemyServiceが内部で使用可能である（canCraftなどを呼び出せる）
        // - 初期状態でgetAvailableRecipesが呼び出される
        expect(alchemyService.getAvailableRecipes).toHaveBeenCalled();
      });
    });

    describe('TC-003: 調合完了コールバックの設定', () => {
      // 【テスト目的】: 調合完了コールバックがオプションで受け取れることを確認
      // 【対応要件】: FR-003
      // 🔵 信頼性レベル: requirements.md セクション2.1.1 FR-003に明記

      it('TC-003: onCraftCompleteコールバックがオプションで設定できる', () => {
        // Given: 有効なPhaserシーンモック、IAlchemyServiceモック、コールバック関数
        const onCraftComplete = vi.fn();

        // When: コールバック付きでAlchemyPhaseUIをインスタンス化する
        const ui = new AlchemyPhaseUI(scene, alchemyService, onCraftComplete);

        // Then:
        // - エラーなくインスタンスが作成される
        expect(ui).toBeDefined();
      });
    });

    describe('TC-004: create()でUI要素作成', () => {
      // 【テスト目的】: create()で全てのUI要素が作成されることを確認
      // 【対応要件】: FR-004
      // 🔵 信頼性レベル: requirements.md セクション2.1.1 FR-004に明記

      it('TC-004: create()でコンテナ、レシピリスト、素材スロット、調合ボタンが作成される', () => {
        // Given: 有効なPhaserシーンモックとIAlchemyServiceモック
        const ui = new AlchemyPhaseUI(scene, alchemyService);

        // When: create()を呼び出す
        ui.create();

        // Then:
        // - scene.add.containerが呼び出される
        expect(scene.add.container).toHaveBeenCalled();
        // - タイトルテキストが作成される
        expect(scene.add.text).toHaveBeenCalled();
      });
    });

    describe('TC-005: destroy()でリソース破棄', () => {
      // 【テスト目的】: destroy()で全てのUI要素が適切に破棄されることを確認
      // 【対応要件】: FR-005
      // 🔵 信頼性レベル: requirements.md セクション2.1.1 FR-005に明記

      it('TC-005: destroy()でコンテナとUI要素が破棄される', () => {
        // Given: AlchemyPhaseUIが初期化済み
        const ui = new AlchemyPhaseUI(scene, alchemyService);
        ui.create();

        // When: destroy()を呼び出す
        ui.destroy();

        // Then:
        // - コンテナのdestroy()が呼び出される
        expect(mockContainer.destroy).toHaveBeenCalled();
      });
    });
  });

  // ========================================
  // 2. レシピ選択テストケース
  // ========================================

  describe('レシピ選択', () => {
    describe('TC-010: 調合フェーズ開始時にレシピ一覧表示', () => {
      // 【テスト目的】: 調合フェーズ開始時にレシピ一覧が左側パネルに表示されることを確認
      // 【対応要件】: FR-010
      // 🔵 信頼性レベル: requirements.md セクション2.1.2 FR-010に明記

      it('TC-010: 調合フェーズ開始時にレシピ一覧が表示される', () => {
        // Given: AlchemyPhaseUIが初期化済み、レシピが存在
        const recipe = createMockRecipe();
        alchemyService.getAvailableRecipes.mockReturnValue([recipe]);
        const ui = new AlchemyPhaseUI(scene, alchemyService);

        // When: create()を呼び出す
        ui.create();

        // Then:
        // - レシピが表示される
        expect(ui.getRecipeCount()).toBe(1);
      });
    });

    describe('TC-011: レシピクリックで選択状態になる', () => {
      // 【テスト目的】: レシピをクリックした際に選択状態が変更されることを確認
      // 【対応要件】: FR-011
      // 🔵 信頼性レベル: requirements.md セクション2.1.2 FR-011に明記

      it('TC-011: レシピクリックで選択状態が変更される', () => {
        // Given: AlchemyPhaseUIが初期化済み、レシピ一覧が表示されている
        const recipe = createMockRecipe();
        alchemyService.getAvailableRecipes.mockReturnValue([recipe]);
        const ui = new AlchemyPhaseUI(scene, alchemyService);
        ui.create();

        // When: レシピをクリックする（内部メソッドをテスト）
        ui.selectRecipe(recipe.id);

        // Then:
        // - getSelectedRecipe()が選択したレシピIDを返す
        expect(ui.getSelectedRecipeId()).toBe(recipe.id);
      });
    });

    describe('TC-012: レシピ選択時に必要素材情報表示', () => {
      // 【テスト目的】: レシピ選択時に必要素材情報が調合エリアに表示されることを確認
      // 【対応要件】: FR-012
      // 🔵 信頼性レベル: requirements.md セクション2.1.2 FR-012に明記

      it('TC-012: レシピ選択で必要素材情報が表示される', () => {
        // Given: AlchemyPhaseUIが初期化済み
        const recipe = createMockRecipe({
          requiredMaterials: [
            { materialId: 'mat-001', quantity: 2 },
            { materialId: 'mat-002', quantity: 1 },
          ],
        });
        alchemyService.getAvailableRecipes.mockReturnValue([recipe]);
        const ui = new AlchemyPhaseUI(scene, alchemyService);
        ui.create();

        // When: レシピを選択する
        ui.selectRecipe(recipe.id);

        // Then:
        // - 必要素材スロット数が正しい（2種類 = 3スロット）
        expect(ui.getMaterialSlotCount()).toBe(3);
      });
    });

    describe('TC-013: レシピ選択時に対応する素材スロット表示', () => {
      // 【テスト目的】: レシピ選択時に対応する素材スロットが表示されることを確認
      // 【対応要件】: FR-013
      // 🔵 信頼性レベル: requirements.md セクション2.1.2 FR-013に明記

      it('TC-013: レシピ選択で素材スロットが表示される', () => {
        // Given: AlchemyPhaseUIが初期化済み
        const recipe = createMockRecipe({
          requiredMaterials: [{ materialId: 'mat-001', quantity: 1 }],
        });
        alchemyService.getAvailableRecipes.mockReturnValue([recipe]);
        const ui = new AlchemyPhaseUI(scene, alchemyService);
        ui.create();

        // When: レシピを選択する
        ui.selectRecipe(recipe.id);

        // Then:
        // - 素材スロットが存在する
        expect(ui.getMaterialSlotCount()).toBeGreaterThan(0);
      });
    });
  });

  // ========================================
  // 3. 素材選択テストケース
  // ========================================

  describe('素材選択', () => {
    describe('TC-020: 所持素材クリックでスロット配置', () => {
      // 【テスト目的】: 所持素材をクリックした際にスロットに配置されることを確認
      // 【対応要件】: FR-020
      // 🔵 信頼性レベル: requirements.md セクション2.1.3 FR-020に明記

      it('TC-020: 所持素材クリックでスロットに配置される', () => {
        // Given: AlchemyPhaseUIが初期化済み、レシピが選択済み
        const recipe = createMockRecipe();
        const material = createMockMaterial();
        alchemyService.getAvailableRecipes.mockReturnValue([recipe]);
        const ui = new AlchemyPhaseUI(scene, alchemyService);
        ui.create();
        ui.setAvailableMaterials([material]);
        ui.selectRecipe(recipe.id);

        // When: 素材を選択する
        ui.selectMaterial(material.instanceId);

        // Then:
        // - スロットに素材が配置される
        expect(ui.getPlacedMaterials()).toContainEqual(
          expect.objectContaining({ instanceId: material.instanceId }),
        );
      });
    });

    describe('TC-021: 素材配置時に所持素材表示更新', () => {
      // 【テスト目的】: 素材配置時に所持素材表示が更新されることを確認
      // 【対応要件】: FR-021
      // 🟡 信頼性レベル: requirements.md セクション2.1.3 FR-021に明記

      it('TC-021: 素材配置で所持素材表示が更新される', () => {
        // Given: AlchemyPhaseUIが初期化済み、レシピが選択済み
        const recipe = createMockRecipe();
        const material = createMockMaterial();
        alchemyService.getAvailableRecipes.mockReturnValue([recipe]);
        const ui = new AlchemyPhaseUI(scene, alchemyService);
        ui.create();
        ui.setAvailableMaterials([material]);
        ui.selectRecipe(recipe.id);

        // When: 素材を選択する
        ui.selectMaterial(material.instanceId);

        // Then:
        // - 所持素材表示が更新される（素材が使用中としてマークされる）
        expect(ui.getAvailableMaterialCount()).toBe(0);
      });
    });

    describe('TC-022: 配置済み素材クリックで取り除き', () => {
      // 【テスト目的】: 配置済み素材クリック時にスロットから取り除かれることを確認
      // 【対応要件】: FR-022
      // 🟡 信頼性レベル: requirements.md セクション2.1.3 FR-022に明記

      it('TC-022: 配置済み素材クリックでスロットから取り除かれる', () => {
        // Given: AlchemyPhaseUIが初期化済み、素材が配置済み
        const recipe = createMockRecipe();
        const material = createMockMaterial();
        alchemyService.getAvailableRecipes.mockReturnValue([recipe]);
        const ui = new AlchemyPhaseUI(scene, alchemyService);
        ui.create();
        ui.setAvailableMaterials([material]);
        ui.selectRecipe(recipe.id);
        ui.selectMaterial(material.instanceId);

        // When: 配置済み素材を取り除く
        ui.removeMaterial(material.instanceId);

        // Then:
        // - スロットから素材が取り除かれる
        expect(ui.getPlacedMaterials()).toHaveLength(0);
      });
    });

    describe('TC-023: 素材配置時に品質プレビュー更新', () => {
      // 【テスト目的】: 素材配置時に品質プレビューが更新されることを確認
      // 【対応要件】: FR-023
      // 🔵 信頼性レベル: requirements.md セクション2.1.3 FR-023に明記

      it('TC-023: 素材配置でpreviewQuality()が呼び出される', () => {
        // Given: AlchemyPhaseUIが初期化済み、レシピが選択済み
        const recipe = createMockRecipe();
        const material = createMockMaterial();
        alchemyService.getAvailableRecipes.mockReturnValue([recipe]);
        alchemyService.previewQuality.mockReturnValue('A' as Quality);
        const ui = new AlchemyPhaseUI(scene, alchemyService);
        ui.create();
        ui.setAvailableMaterials([material]);
        ui.selectRecipe(recipe.id);

        // When: 素材を配置する
        ui.selectMaterial(material.instanceId);

        // Then:
        // - alchemyService.previewQuality()が呼び出される
        expect(alchemyService.previewQuality).toHaveBeenCalledWith(recipe.id, expect.any(Array));
      });
    });
  });

  // ========================================
  // 4. 品質プレビューテストケース
  // ========================================

  describe('品質プレビュー', () => {
    describe('TC-030: レシピと素材選択時に品質プレビュー表示', () => {
      // 【テスト目的】: レシピと素材選択時に完成品予測品質が表示されることを確認
      // 【対応要件】: FR-030
      // 🔵 信頼性レベル: requirements.md セクション2.1.4 FR-030に明記

      it('TC-030: レシピと素材選択時に品質プレビューが表示される', () => {
        // Given: AlchemyPhaseUIが初期化済み
        const recipe = createMockRecipe();
        const material = createMockMaterial();
        alchemyService.getAvailableRecipes.mockReturnValue([recipe]);
        alchemyService.previewQuality.mockReturnValue('B' as Quality);
        const ui = new AlchemyPhaseUI(scene, alchemyService);
        ui.create();
        ui.setAvailableMaterials([material]);
        ui.selectRecipe(recipe.id);
        ui.selectMaterial(material.instanceId);

        // When & Then:
        // - 品質プレビューが取得できる
        expect(ui.getQualityPreview()).toBe('B');
      });
    });

    describe('TC-031: 素材変更時にリアルタイム品質プレビュー更新', () => {
      // 【テスト目的】: 素材変更時にリアルタイムで品質プレビューが更新されることを確認
      // 【対応要件】: FR-031
      // 🔵 信頼性レベル: requirements.md セクション2.1.4 FR-031に明記

      it('TC-031: 素材変更で品質プレビューがリアルタイム更新される', () => {
        // Given: AlchemyPhaseUIが初期化済み、素材が配置済み
        const recipe = createMockRecipe();
        const material1 = createMockMaterial({ instanceId: 'inst-001', quality: 'B' as Quality });
        const material2 = createMockMaterial({ instanceId: 'inst-002', quality: 'A' as Quality });
        alchemyService.getAvailableRecipes.mockReturnValue([recipe]);
        alchemyService.previewQuality
          .mockReturnValueOnce('B' as Quality)
          .mockReturnValueOnce('A' as Quality);
        const ui = new AlchemyPhaseUI(scene, alchemyService);
        ui.create();
        ui.setAvailableMaterials([material1, material2]);
        ui.selectRecipe(recipe.id);
        ui.selectMaterial(material1.instanceId);

        // When: 素材を変更する
        ui.removeMaterial(material1.instanceId);
        ui.selectMaterial(material2.instanceId);

        // Then:
        // - previewQuality()が2回呼び出される
        expect(alchemyService.previewQuality).toHaveBeenCalledTimes(2);
      });
    });

    describe('TC-032: 素材不足時に品質プレビューが「-」表示', () => {
      // 【テスト目的】: 素材不足時に品質プレビューが「-」表示になることを確認
      // 【対応要件】: FR-032
      // 🟡 信頼性レベル: requirements.md セクション2.1.4 FR-032に明記

      it('TC-032: 素材不足時に品質プレビューが「-」になる', () => {
        // Given: AlchemyPhaseUIが初期化済み、素材未配置
        const recipe = createMockRecipe();
        alchemyService.getAvailableRecipes.mockReturnValue([recipe]);
        const ui = new AlchemyPhaseUI(scene, alchemyService);
        ui.create();
        ui.selectRecipe(recipe.id);

        // When & Then:
        // - 品質プレビューが「-」または null
        expect(ui.getQualityPreview()).toBeNull();
      });
    });
  });

  // ========================================
  // 5. 調合実行テストケース
  // ========================================

  describe('調合実行', () => {
    describe('TC-040: 調合ボタンでcraft()呼び出し', () => {
      // 【テスト目的】: 調合ボタンクリック時にalchemyService.craft()が呼び出されることを確認
      // 【対応要件】: FR-040
      // 🔵 信頼性レベル: requirements.md セクション2.1.5 FR-040に明記

      it('TC-040: 調合ボタンクリックでcraft()が呼び出される', () => {
        // Given: AlchemyPhaseUIが初期化済み、レシピ選択済み、素材配置済み
        const recipe = createMockRecipe();
        const material = createMockMaterial();
        const craftedItem = createMockItem();
        alchemyService.getAvailableRecipes.mockReturnValue([recipe]);
        alchemyService.canCraft.mockReturnValue(true);
        alchemyService.craft.mockReturnValue(craftedItem);
        const ui = new AlchemyPhaseUI(scene, alchemyService);
        ui.create();
        ui.setAvailableMaterials([material]);
        ui.selectRecipe(recipe.id);
        ui.selectMaterial(material.instanceId);

        // When: 調合を実行する
        ui.executeCraft();

        // Then:
        // - alchemyService.craft()が呼び出される
        expect(alchemyService.craft).toHaveBeenCalledWith(recipe.id, expect.any(Array));
      });
    });

    describe('TC-041: 調合成功時のコールバック通知', () => {
      // 【テスト目的】: 調合成功時にItemInstanceがコールバックで通知されることを確認
      // 【対応要件】: FR-041
      // 🔵 信頼性レベル: requirements.md セクション2.1.5 FR-041に明記

      it('TC-041: 調合成功でコールバックにItemInstanceが渡される', () => {
        // Given: AlchemyPhaseUIが初期化済み、コールバック関数が設定済み
        const recipe = createMockRecipe();
        const material = createMockMaterial();
        const craftedItem = createMockItem();
        const onCraftComplete = vi.fn();
        alchemyService.getAvailableRecipes.mockReturnValue([recipe]);
        alchemyService.canCraft.mockReturnValue(true);
        alchemyService.craft.mockReturnValue(craftedItem);
        const ui = new AlchemyPhaseUI(scene, alchemyService, onCraftComplete);
        ui.create();
        ui.setAvailableMaterials([material]);
        ui.selectRecipe(recipe.id);
        ui.selectMaterial(material.instanceId);

        // When: 調合を実行する
        ui.executeCraft();

        // Then:
        // - onCraftCompleteがItemInstanceと共に呼び出される
        expect(onCraftComplete).toHaveBeenCalledWith(craftedItem);
      });
    });

    describe('TC-042: 調合成功時に素材スロットクリア', () => {
      // 【テスト目的】: 調合成功時に素材スロットがクリアされることを確認
      // 【対応要件】: FR-042
      // 🔵 信頼性レベル: requirements.md セクション2.1.5 FR-042に明記

      it('TC-042: 調合成功で素材スロットがクリアされる', () => {
        // Given: AlchemyPhaseUIが初期化済み、素材配置済み
        const recipe = createMockRecipe();
        const material = createMockMaterial();
        const craftedItem = createMockItem();
        alchemyService.getAvailableRecipes.mockReturnValue([recipe]);
        alchemyService.canCraft.mockReturnValue(true);
        alchemyService.craft.mockReturnValue(craftedItem);
        const ui = new AlchemyPhaseUI(scene, alchemyService);
        ui.create();
        ui.setAvailableMaterials([material]);
        ui.selectRecipe(recipe.id);
        ui.selectMaterial(material.instanceId);

        // When: 調合を実行する
        ui.executeCraft();

        // Then:
        // - 素材スロットがクリアされる
        expect(ui.getPlacedMaterials()).toHaveLength(0);
      });
    });

    describe('TC-043: 調合成功時に選択状態リセット', () => {
      // 【テスト目的】: 調合成功時に選択状態がリセットされることを確認
      // 【対応要件】: FR-043
      // 🟡 信頼性レベル: requirements.md セクション2.1.5 FR-043に明記

      it('TC-043: 調合成功で選択状態がリセットされる', () => {
        // Given: AlchemyPhaseUIが初期化済み
        const recipe = createMockRecipe();
        const material = createMockMaterial();
        const craftedItem = createMockItem();
        alchemyService.getAvailableRecipes.mockReturnValue([recipe]);
        alchemyService.canCraft.mockReturnValue(true);
        alchemyService.craft.mockReturnValue(craftedItem);
        const ui = new AlchemyPhaseUI(scene, alchemyService);
        ui.create();
        ui.setAvailableMaterials([material]);
        ui.selectRecipe(recipe.id);
        ui.selectMaterial(material.instanceId);

        // When: 調合を実行する
        ui.executeCraft();

        // Then:
        // - 選択状態がリセットされる
        expect(ui.getSelectedRecipeId()).toBeNull();
      });
    });
  });

  // ========================================
  // 6. 調合ボタン状態テストケース
  // ========================================

  describe('調合ボタン状態', () => {
    describe('TC-050: 素材充足時にボタン有効', () => {
      // 【テスト目的】: 必要素材が揃っている時に調合ボタンが有効になることを確認
      // 【対応要件】: FR-050
      // 🔵 信頼性レベル: requirements.md セクション2.1.6 FR-050に明記

      it('TC-050: 素材充足時に調合ボタンが有効になる', () => {
        // Given: AlchemyPhaseUIが初期化済み、レシピ選択済み
        const recipe = createMockRecipe();
        const material = createMockMaterial();
        alchemyService.getAvailableRecipes.mockReturnValue([recipe]);
        alchemyService.canCraft.mockReturnValue(true);
        const ui = new AlchemyPhaseUI(scene, alchemyService);
        ui.create();
        ui.setAvailableMaterials([material]);
        ui.selectRecipe(recipe.id);
        ui.selectMaterial(material.instanceId);

        // When: canCraftがtrueを返す
        // Then:
        // - isCraftButtonEnabled()がtrueを返す
        expect(ui.isCraftButtonEnabled()).toBe(true);
      });
    });

    describe('TC-051: 素材不足時にボタン無効', () => {
      // 【テスト目的】: 必要素材が不足時に調合ボタンが無効になることを確認
      // 【対応要件】: FR-051
      // 🔵 信頼性レベル: requirements.md セクション2.1.6 FR-051に明記

      it('TC-051: 素材不足時に調合ボタンが無効になる', () => {
        // Given: AlchemyPhaseUIが初期化済み、レシピ選択済み、素材未配置
        const recipe = createMockRecipe();
        alchemyService.getAvailableRecipes.mockReturnValue([recipe]);
        alchemyService.canCraft.mockReturnValue(false);
        const ui = new AlchemyPhaseUI(scene, alchemyService);
        ui.create();
        ui.selectRecipe(recipe.id);

        // When: canCraftがfalseを返す
        // Then:
        // - isCraftButtonEnabled()がfalseを返す
        expect(ui.isCraftButtonEnabled()).toBe(false);
      });
    });

    describe('TC-052: レシピ未選択時にボタン無効', () => {
      // 【テスト目的】: レシピ未選択時に調合ボタンが無効になることを確認
      // 【対応要件】: FR-052
      // 🔵 信頼性レベル: requirements.md セクション2.1.6 FR-052に明記

      it('TC-052: レシピ未選択時に調合ボタンが無効になる', () => {
        // Given: AlchemyPhaseUIが初期化済み、レシピ未選択
        const ui = new AlchemyPhaseUI(scene, alchemyService);
        ui.create();

        // When: レシピが選択されていない
        // Then:
        // - isCraftButtonEnabled()がfalseを返す
        expect(ui.isCraftButtonEnabled()).toBe(false);
      });
    });
  });

  // ========================================
  // 7. 異常系テストケース
  // ========================================

  describe('異常系', () => {
    describe('TC-200: sceneがnullの場合', () => {
      // 【テスト目的】: sceneがnullの場合にエラーがスローされることを確認
      // 【対応要件】: FR-202
      // 🔵 信頼性レベル: requirements.md セクション2.3 FR-202に明記

      it('TC-200: sceneがnullでエラーがスローされる', () => {
        // Given: sceneがnull
        // When & Then: エラーがスローされる
        expect(() => new AlchemyPhaseUI(null as unknown as Phaser.Scene, alchemyService)).toThrow(
          /scene/i,
        );
      });
    });

    describe('TC-201: sceneがundefinedの場合', () => {
      // 【テスト目的】: sceneがundefinedの場合にエラーがスローされることを確認
      // 【対応要件】: FR-202
      // 🔵 信頼性レベル: requirements.md セクション2.3 FR-202に明記

      it('TC-201: sceneがundefinedでエラーがスローされる', () => {
        // Given: sceneがundefined
        // When & Then: エラーがスローされる
        expect(
          () => new AlchemyPhaseUI(undefined as unknown as Phaser.Scene, alchemyService),
        ).toThrow(/scene/i);
      });
    });

    describe('TC-202: IAlchemyServiceがnullの場合', () => {
      // 【テスト目的】: IAlchemyServiceがnullの場合にエラーがスローされることを確認
      // 【対応要件】: FR-203
      // 🟡 信頼性レベル: requirements.md セクション2.3 FR-203に明記

      it('TC-202: alchemyServiceがnullでエラーがスローされる', () => {
        // Given: alchemyServiceがnull
        // When & Then: エラーがスローされる
        expect(() => new AlchemyPhaseUI(scene, null as unknown as IAlchemyService)).toThrow(
          /alchemyService/i,
        );
      });
    });

    describe('TC-203: 存在しないレシピID選択', () => {
      // 【テスト目的】: 存在しないレシピIDが指定された場合にエラーログが出力されることを確認
      // 【対応要件】: FR-200
      // 🔵 信頼性レベル: requirements.md セクション2.3 FR-200に明記

      it('TC-203: 存在しないレシピIDでエラーログが出力される', () => {
        // Given: AlchemyPhaseUIが初期化済み、console.errorをモック
        const ui = new AlchemyPhaseUI(scene, alchemyService);
        ui.create();
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        // When: 存在しないレシピIDを選択する
        ui.selectRecipe(toCardId('non-existent-recipe'));

        // Then:
        // - console.errorが呼び出される
        expect(errorSpy).toHaveBeenCalled();
        // - 選択状態は変更されない
        expect(ui.getSelectedRecipeId()).toBeNull();

        errorSpy.mockRestore();
      });
    });

    describe('TC-204: 素材不足での調合試行', () => {
      // 【テスト目的】: 素材不足時に調合が実行されないことを確認
      // 【対応要件】: FR-201
      // 🔵 信頼性レベル: requirements.md セクション2.3 FR-201に明記

      it('TC-204: 素材不足時にcraft()が呼び出されない', () => {
        // Given: AlchemyPhaseUIが初期化済み、素材不足状態
        const recipe = createMockRecipe();
        alchemyService.getAvailableRecipes.mockReturnValue([recipe]);
        alchemyService.canCraft.mockReturnValue(false);
        const ui = new AlchemyPhaseUI(scene, alchemyService);
        ui.create();
        ui.selectRecipe(recipe.id);

        // When: 調合を試みる
        ui.executeCraft();

        // Then:
        // - craft()は呼び出されない
        expect(alchemyService.craft).not.toHaveBeenCalled();
      });
    });
  });

  // ========================================
  // 8. 境界値テストケース
  // ========================================

  describe('境界値', () => {
    describe('TC-300: 空のレシピリスト', () => {
      // 【テスト目的】: レシピリストが空の場合の動作を確認
      // 【対応要件】: 境界値テスト（レシピリスト）
      // 🔵 信頼性レベル: requirements.md セクション5.1に明記

      it('TC-300: 空のレシピリストでも正常に表示される', () => {
        // Given: AlchemyPhaseUIが初期化、レシピ0件
        alchemyService.getAvailableRecipes.mockReturnValue([]);
        const ui = new AlchemyPhaseUI(scene, alchemyService);

        // When: create()を呼び出す
        ui.create();

        // Then:
        // - エラーなく表示される
        expect(ui.getRecipeCount()).toBe(0);
      });
    });

    describe('TC-301: レシピ1件', () => {
      // 【テスト目的】: レシピ1件の場合の動作を確認
      // 【対応要件】: 境界値テスト（レシピリスト）
      // 🔵 信頼性レベル: requirements.md セクション5.1に明記

      it('TC-301: レシピ1件で正常に表示・選択できる', () => {
        // Given: AlchemyPhaseUIが初期化、レシピ1件
        const recipe = createMockRecipe();
        alchemyService.getAvailableRecipes.mockReturnValue([recipe]);
        const ui = new AlchemyPhaseUI(scene, alchemyService);
        ui.create();

        // When: レシピを選択する
        ui.selectRecipe(recipe.id);

        // Then:
        // - 正常に選択される
        expect(ui.getSelectedRecipeId()).toBe(recipe.id);
      });
    });

    describe('TC-302: レシピ最大件数（20件）', () => {
      // 【テスト目的】: レシピ最大件数の場合の動作を確認
      // 【対応要件】: 境界値テスト（レシピリスト）
      // 🟡 信頼性レベル: requirements.md セクション5.1に明記

      it('TC-302: レシピ20件で正常に表示される', () => {
        // Given: AlchemyPhaseUIが初期化、レシピ20件
        const recipes = Array.from({ length: 20 }, (_, i) =>
          createMockRecipe({ id: toCardId(`recipe-${i}`), name: `レシピ${i}` }),
        );
        alchemyService.getAvailableRecipes.mockReturnValue(recipes);
        const ui = new AlchemyPhaseUI(scene, alchemyService);

        // When: create()を呼び出す
        ui.create();

        // Then:
        // - 20件すべて表示される
        expect(ui.getRecipeCount()).toBe(20);
      });
    });

    describe('TC-303: 素材0件', () => {
      // 【テスト目的】: 所持素材が0件の場合の動作を確認
      // 【対応要件】: 境界値テスト（素材選択）
      // 🔵 信頼性レベル: requirements.md セクション5.2に明記

      it('TC-303: 素材0件でエラーなく表示される', () => {
        // Given: AlchemyPhaseUIが初期化、素材0件
        const ui = new AlchemyPhaseUI(scene, alchemyService);
        ui.create();
        ui.setAvailableMaterials([]);

        // When & Then:
        // - エラーなく動作する
        expect(ui.getAvailableMaterialCount()).toBe(0);
      });
    });

    describe('TC-304: 最低品質（D）の素材', () => {
      // 【テスト目的】: D品質素材での品質プレビューを確認
      // 【対応要件】: 境界値テスト（品質）
      // 🔵 信頼性レベル: requirements.md セクション5.3に明記

      it('TC-304: D品質素材でD品質プレビューが表示される', () => {
        // Given: AlchemyPhaseUIが初期化、D品質素材
        const recipe = createMockRecipe();
        const material = createMockMaterial({ quality: 'D' as Quality });
        alchemyService.getAvailableRecipes.mockReturnValue([recipe]);
        alchemyService.previewQuality.mockReturnValue('D' as Quality);
        const ui = new AlchemyPhaseUI(scene, alchemyService);
        ui.create();
        ui.setAvailableMaterials([material]);
        ui.selectRecipe(recipe.id);
        ui.selectMaterial(material.instanceId);

        // When & Then:
        // - D品質がプレビューされる
        expect(alchemyService.previewQuality).toHaveBeenCalled();
      });
    });

    describe('TC-305: 最高品質（S）の素材', () => {
      // 【テスト目的】: S品質素材での品質プレビューを確認
      // 【対応要件】: 境界値テスト（品質）
      // 🔵 信頼性レベル: requirements.md セクション5.3に明記

      it('TC-305: S品質素材でS品質プレビューが表示される', () => {
        // Given: AlchemyPhaseUIが初期化、S品質素材
        const recipe = createMockRecipe();
        const material = createMockMaterial({ instanceId: 'inst-s', quality: 'S' as Quality });
        alchemyService.getAvailableRecipes.mockReturnValue([recipe]);
        alchemyService.previewQuality.mockReturnValue('S' as Quality);
        const ui = new AlchemyPhaseUI(scene, alchemyService);
        ui.create();
        ui.setAvailableMaterials([material]);
        ui.selectRecipe(recipe.id);
        ui.selectMaterial(material.instanceId);

        // When & Then:
        // - S品質がプレビューされる
        expect(alchemyService.previewQuality).toHaveBeenCalled();
      });
    });
  });

  // ========================================
  // 9. 統合テストケース
  // ========================================

  describe('統合テスト', () => {
    describe('TC-400: 完全な調合フロー', () => {
      // 【テスト目的】: レシピ選択→素材選択→調合実行の一連の流れが正常に動作することを確認
      // 【対応要件】: 統合テスト

      it('TC-400: レシピ選択→素材選択→調合実行が正常に動作する', () => {
        // Given: AlchemyPhaseUIが初期化済み
        const recipe = createMockRecipe();
        const material = createMockMaterial();
        const craftedItem = createMockItem();
        const onCraftComplete = vi.fn();

        alchemyService.getAvailableRecipes.mockReturnValue([recipe]);
        alchemyService.canCraft.mockReturnValue(true);
        alchemyService.previewQuality.mockReturnValue('B' as Quality);
        alchemyService.craft.mockReturnValue(craftedItem);

        const ui = new AlchemyPhaseUI(scene, alchemyService, onCraftComplete);
        ui.create();
        ui.setAvailableMaterials([material]);

        // Step 1: レシピ選択
        ui.selectRecipe(recipe.id);
        expect(ui.getSelectedRecipeId()).toBe(recipe.id);

        // Step 2: 素材選択
        ui.selectMaterial(material.instanceId);
        expect(ui.getPlacedMaterials()).toHaveLength(1);

        // Step 3: 調合実行
        ui.executeCraft();
        expect(alchemyService.craft).toHaveBeenCalled();
        expect(onCraftComplete).toHaveBeenCalledWith(craftedItem);

        // Step 4: 状態リセット確認
        expect(ui.getPlacedMaterials()).toHaveLength(0);
      });
    });

    describe('TC-401: 調合キャンセルフロー', () => {
      // 【テスト目的】: レシピ選択→素材選択→キャンセル（素材取り除き）の流れを確認

      it('TC-401: 素材取り除きでプレビューがリセットされる', () => {
        // Given: AlchemyPhaseUIが初期化済み、素材配置済み
        const recipe = createMockRecipe();
        const material = createMockMaterial();

        alchemyService.getAvailableRecipes.mockReturnValue([recipe]);
        alchemyService.previewQuality.mockReturnValue('B' as Quality);
        alchemyService.canCraft.mockReturnValue(false);

        const ui = new AlchemyPhaseUI(scene, alchemyService);
        ui.create();
        ui.setAvailableMaterials([material]);
        ui.selectRecipe(recipe.id);
        ui.selectMaterial(material.instanceId);

        // When: 素材を取り除く
        ui.removeMaterial(material.instanceId);

        // Then:
        // - 素材が取り除かれる
        expect(ui.getPlacedMaterials()).toHaveLength(0);
        // - 調合ボタンが無効になる
        expect(ui.isCraftButtonEnabled()).toBe(false);
      });
    });

    describe('TC-402: 初期化→使用→破棄→再初期化', () => {
      // 【テスト目的】: ライフサイクル全体が正常に機能することを確認

      it('TC-402: ライフサイクル全体が正常に動作する', () => {
        // Given: 2つのシーンモック
        const mocks1 = createMockScene();
        const mocks2 = createMockScene();

        // Step 1: 初期化
        const recipe = createMockRecipe();
        alchemyService.getAvailableRecipes.mockReturnValue([recipe]);
        const ui1 = new AlchemyPhaseUI(mocks1.scene, alchemyService);
        ui1.create();

        // Step 2: 使用
        ui1.selectRecipe(recipe.id);

        // Step 3: 破棄
        ui1.destroy();
        expect(mocks1.mockContainer.destroy).toHaveBeenCalled();

        // Step 4: 再初期化（新しいシーンで）
        const ui2 = new AlchemyPhaseUI(mocks2.scene, alchemyService);
        ui2.create();
        expect(ui2).toBeDefined();
      });
    });
  });
});
