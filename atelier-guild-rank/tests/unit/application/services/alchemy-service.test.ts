/**
 * AlchemyService テストケース
 * TASK-0012 アイテムエンティティ・AlchemyService実装
 *
 * @description
 * T-0012-01 〜 T-0012-05, TC-CRAFT-*, TC-CANCRAFT-*, TC-PREVIEW-*,
 * TC-AVAILABLE-*, TC-CHECK-* を実装
 */

import { ItemInstance } from '@domain/entities/ItemInstance';
import { MaterialInstance } from '@domain/entities/MaterialInstance';
import type { IAlchemyService } from '@domain/interfaces/alchemy-service.interface';
import type { IMasterDataRepository } from '@domain/interfaces/master-data-repository.interface';
import type { IMaterialService } from '@domain/interfaces/material-service.interface';
import { AlchemyService } from '@shared/services/alchemy-service';
import type { IEventBus } from '@shared/services/event-bus';
import type { CardId, IItem, IMaterial } from '@shared/types';
import { ItemCategory, Quality, toCardId, toItemId, toMaterialId } from '@shared/types';
import { ApplicationError } from '@shared/types/errors';
import { GameEventType } from '@shared/types/events';
import type { IRecipeCardMaster, IRecipeRequiredMaterial } from '@shared/types/master-data';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

// =============================================================================
// モックデータ・ヘルパー関数
// =============================================================================

/**
 * モックアイテムマスターを作成
 */
function createMockItemMaster(id: string, name: string, basePrice: number): IItem {
  return {
    id: toItemId(id),
    name,
    category: ItemCategory.CONSUMABLE,
    effects: [],
    description: `${name}の説明`,
    basePrice,
  } as IItem & { basePrice: number };
}

/**
 * モック素材マスターを作成
 */
function createMockMaterialMaster(id: string, name: string, quality: Quality): IMaterial {
  return {
    id: toMaterialId(id),
    name,
    baseQuality: quality,
    attributes: [],
    description: `${name}の説明`,
  };
}

/**
 * モック素材インスタンスを作成
 */
function createMockMaterialInstance(materialId: string, quality: Quality): MaterialInstance {
  const master = createMockMaterialMaster(materialId, `${materialId}の名前`, quality);
  return new MaterialInstance(`material_${Date.now()}_${Math.random()}`, master, quality);
}

/**
 * 基本的なレシピマスターを作成
 */
function createMockRecipeMaster(
  recipeId: string,
  outputItemId: string,
  requiredMaterials: IRecipeRequiredMaterial[],
): IRecipeCardMaster {
  return {
    id: toCardId(recipeId),
    type: 'RECIPE',
    name: 'テストレシピ',
    description: 'テスト用レシピ',
    cost: 1,
    rarity: 'COMMON',
    outputItemId,
    requiredMaterials,
    category: ItemCategory.CONSUMABLE,
    unlockRank: 'G',
  } as IRecipeCardMaster;
}

/**
 * モックMasterDataRepositoryを作成
 */
function createMockMasterDataRepository(): IMasterDataRepository {
  return {
    getAllCards: vi.fn(),
    getCardById: vi.fn(),
    getCardsByType: vi.fn(),
    getAllMaterials: vi.fn(),
    getMaterialById: vi.fn(),
    getMaterialsByAttribute: vi.fn(),
    getAllItems: vi.fn(),
    getItemById: vi.fn(),
    getAllRanks: vi.fn(),
    getRankByValue: vi.fn(),
    getAllClients: vi.fn(),
    getClientById: vi.fn(),
    getAllArtifacts: vi.fn(),
    getArtifactById: vi.fn(),
    load: vi.fn(),
    isLoaded: vi.fn(),
    getRecipeCardById: vi.fn(),
  } as unknown as IMasterDataRepository;
}

/**
 * モックMaterialServiceを作成
 */
function createMockMaterialService(): IMaterialService {
  return {
    createInstance: vi.fn(),
    generateRandomQuality: vi.fn(),
    calculateAverageQuality: vi.fn(),
    getMaterialsByRank: vi.fn(),
  } as unknown as IMaterialService;
}

/**
 * モックEventBusを作成
 */
function createMockEventBus(): IEventBus {
  return {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    once: vi.fn(),
  } as unknown as IEventBus;
}

/**
 * 標準レシピをセットアップ（herb + water → potion）
 */
function setupMockRecipe(repo: IMasterDataRepository, recipeId: CardId): void {
  const recipe = createMockRecipeMaster(recipeId as string, 'potion', [
    { materialId: 'herb', quantity: 1 },
    { materialId: 'water', quantity: 1 },
  ]);
  (repo.getRecipeCardById as Mock).mockReturnValue(recipe);
}

/**
 * 出力アイテムが無効なレシピをセットアップ
 */
function setupMockRecipeWithInvalidOutput(repo: IMasterDataRepository, recipeId: CardId): void {
  const recipe = createMockRecipeMaster(recipeId as string, 'invalid_item', [
    { materialId: 'herb', quantity: 1 },
  ]);
  (repo.getRecipeCardById as Mock).mockReturnValue(recipe);
  (repo.getItemById as Mock).mockReturnValue(undefined);
}

/**
 * 2つの素材を必要とするレシピをセットアップ
 */
function setupMockRecipeRequiringTwoMaterials(repo: IMasterDataRepository, recipeId: CardId): void {
  const recipe = createMockRecipeMaster(recipeId as string, 'potion', [
    { materialId: 'herb', quantity: 1 },
    { materialId: 'water', quantity: 1 },
  ]);
  (repo.getRecipeCardById as Mock).mockReturnValue(recipe);
}

/**
 * 素材を必要とするレシピをセットアップ
 */
function setupMockRecipeRequiringMaterials(repo: IMasterDataRepository, recipeId: CardId): void {
  const recipe = createMockRecipeMaster(recipeId as string, 'potion', [
    { materialId: 'herb', quantity: 2 },
  ]);
  (repo.getRecipeCardById as Mock).mockReturnValue(recipe);
}

/**
 * 最低品質条件付きのレシピをセットアップ
 */
function setupMockRecipeRequiringMinQuality(
  repo: IMasterDataRepository,
  recipeId: CardId,
  minQuality: Quality,
): void {
  const recipe = createMockRecipeMaster(recipeId as string, 'potion', [
    { materialId: 'herb', quantity: 1, minQuality },
  ]);
  (repo.getRecipeCardById as Mock).mockReturnValue(recipe);
}

/**
 * 複数個の同一素材を必要とするレシピをセットアップ
 */
function setupMockRecipeRequiringMultipleQuantity(
  repo: IMasterDataRepository,
  recipeId: CardId,
  quantity: number,
): void {
  const recipe = createMockRecipeMaster(recipeId as string, 'potion', [
    { materialId: 'herb', quantity },
  ]);
  (repo.getRecipeCardById as Mock).mockReturnValue(recipe);
}

/**
 * 1つの素材のみを必要とするレシピをセットアップ
 */
function setupMockRecipeRequiringSingleMaterial(
  repo: IMasterDataRepository,
  recipeId: CardId,
): void {
  const recipe = createMockRecipeMaster(recipeId as string, 'potion', [
    { materialId: 'herb', quantity: 1 },
  ]);
  (repo.getRecipeCardById as Mock).mockReturnValue(recipe);
}

/**
 * アイテムマスターをセットアップ
 */
function setupMockItem(repo: IMasterDataRepository, itemId: string): void {
  const item = createMockItemMaster(itemId, 'テストアイテム', 100);
  (repo.getItemById as Mock).mockReturnValue(item);
}

/**
 * 複数のレシピをセットアップ
 */
function setupMockMultipleRecipes(repo: IMasterDataRepository): void {
  const recipes = [
    createMockRecipeMaster('recipe_001', 'potion', [{ materialId: 'herb', quantity: 1 }]),
    createMockRecipeMaster('recipe_002', 'elixir', [
      { materialId: 'herb', quantity: 1 },
      { materialId: 'water', quantity: 1 },
    ]),
    createMockRecipeMaster('recipe_003', 'ore_product', [{ materialId: 'ore', quantity: 1 }]),
  ];
  (repo.getCardsByType as Mock).mockReturnValue(recipes);
}

/**
 * マッチしないレシピをセットアップ
 */
function setupMockRecipesThatDontMatch(repo: IMasterDataRepository): void {
  const recipes = [
    createMockRecipeMaster('recipe_001', 'potion', [{ materialId: 'rare_herb', quantity: 1 }]),
  ];
  (repo.getCardsByType as Mock).mockReturnValue(recipes);
}

/**
 * 標準のレシピリストをセットアップ
 */
function setupMockRecipes(repo: IMasterDataRepository): void {
  const recipes = [
    createMockRecipeMaster('recipe_001', 'potion', [
      { materialId: 'herb', quantity: 1 },
      { materialId: 'water', quantity: 1 },
    ]),
  ];
  (repo.getCardsByType as Mock).mockReturnValue(recipes);
}

/**
 * 1つだけマッチするレシピをセットアップ
 */
function setupMockSingleMatchingRecipe(repo: IMasterDataRepository): void {
  const recipes = [
    createMockRecipeMaster('recipe_001', 'potion', [{ materialId: 'herb', quantity: 1 }]),
    createMockRecipeMaster('recipe_002', 'elixir', [
      { materialId: 'rare_herb', quantity: 5 }, // マッチしない
    ]),
  ];
  (repo.getCardsByType as Mock).mockReturnValue(recipes);
}

// =============================================================================
// テスト
// =============================================================================

describe('AlchemyService', () => {
  let alchemyService: IAlchemyService;
  let mockMasterDataRepo: IMasterDataRepository;
  let mockMaterialService: IMaterialService;
  let mockEventBus: IEventBus;

  beforeEach(() => {
    // 各テスト実行前にAlchemyServiceを初期化
    mockMasterDataRepo = createMockMasterDataRepository();
    mockMaterialService = createMockMaterialService();
    mockEventBus = createMockEventBus();
    alchemyService = new AlchemyService(mockMasterDataRepo, mockMaterialService, mockEventBus);
  });

  // =============================================================================
  // T-0012-01 〜 T-0012-04, TC-CRAFT-*: craft()メソッド
  // =============================================================================

  describe('craft', () => {
    it('T-0012-01: 有効なレシピ・十分な素材で調合成功', () => {
      // 【テスト目的】: craft()で正常に調合ができること
      // 【テスト内容】: 有効なレシピIDと十分な素材でcraftを実行
      // 【期待される動作】: ItemInstanceが生成される
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const recipeId = toCardId('recipe_001');
      const materials = [
        createMockMaterialInstance('herb', Quality.B),
        createMockMaterialInstance('water', Quality.C),
      ];
      setupMockRecipe(mockMasterDataRepo, recipeId);
      setupMockItem(mockMasterDataRepo, 'potion');
      (mockMaterialService.calculateAverageQuality as Mock).mockReturnValue(Quality.B);

      // Act
      const result = alchemyService.craft(recipeId, materials);

      // Assert
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(ItemInstance);
      expect(result.instanceId).toMatch(/^item_\d+_\d+$/);
      expect(result.quality).toBe(Quality.B);
    });

    it('TC-CRAFT-002: 存在しないレシピIDで調合', () => {
      // 【テスト目的】: 存在しないレシピIDでエラーが発生すること
      // 【テスト内容】: 無効なレシピIDでcraftを実行
      // 【期待される動作】: ApplicationError(INVALID_RECIPE)がスローされる
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const invalidRecipeId = toCardId('invalid_recipe');
      const materials = [createMockMaterialInstance('herb', Quality.B)];
      (mockMasterDataRepo.getRecipeCardById as Mock).mockReturnValue(undefined);

      // Act & Assert
      expect(() => alchemyService.craft(invalidRecipeId, materials)).toThrow(ApplicationError);
      expect(() => alchemyService.craft(invalidRecipeId, materials)).toThrow(/Recipe not found/);
    });

    it('T-0012-02: 素材不足で調合', () => {
      // 【テスト目的】: 素材不足でエラーが発生すること
      // 【テスト内容】: 必要素材が不足した状態でcraftを実行
      // 【期待される動作】: ApplicationError(INSUFFICIENT_MATERIALS)がスローされる
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const recipeId = toCardId('recipe_001');
      const materials: MaterialInstance[] = []; // 空の素材リスト
      setupMockRecipe(mockMasterDataRepo, recipeId);

      // Act & Assert
      expect(() => alchemyService.craft(recipeId, materials)).toThrow(ApplicationError);
      expect(() => alchemyService.craft(recipeId, materials)).toThrow(/insufficient materials/i);
    });

    it('TC-CRAFT-004: 出力アイテムが存在しないレシピで調合', () => {
      // 【テスト目的】: 出力アイテムが存在しない場合エラーが発生すること
      // 【テスト内容】: outputItemIdに対応するアイテムがない状態でcraftを実行
      // 【期待される動作】: ApplicationError(INVALID_RECIPE)がスローされる
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const recipeId = toCardId('recipe_001');
      const materials = [createMockMaterialInstance('herb', Quality.B)];
      setupMockRecipeWithInvalidOutput(mockMasterDataRepo, recipeId);

      // Act & Assert
      expect(() => alchemyService.craft(recipeId, materials)).toThrow(ApplicationError);
      expect(() => alchemyService.craft(recipeId, materials)).toThrow(/Output item not found/i);
    });

    it('TC-CRAFT-005: 調合成功時にALCHEMY_COMPLETEDイベント発行', () => {
      // 【テスト目的】: 調合成功時にイベントが発行されること
      // 【テスト内容】: craftを正常に実行した後、eventBus.emitが呼ばれる
      // 【期待される動作】: ALCHEMY_COMPLETEDイベントが発行される
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const recipeId = toCardId('recipe_001');
      const materials = [
        createMockMaterialInstance('herb', Quality.B),
        createMockMaterialInstance('water', Quality.C),
      ];
      setupMockRecipe(mockMasterDataRepo, recipeId);
      setupMockItem(mockMasterDataRepo, 'potion');
      (mockMaterialService.calculateAverageQuality as Mock).mockReturnValue(Quality.B);

      // Act
      alchemyService.craft(recipeId, materials);

      // Assert
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        GameEventType.ALCHEMY_COMPLETED,
        expect.objectContaining({
          craftedItem: expect.any(Object),
        }),
      );
    });

    it('T-0012-03: 品質計算（全てC品質素材）', () => {
      // 【テスト目的】: 全てC品質の素材からC品質のアイテムが生成されること
      // 【テスト内容】: C品質の素材のみでcraft
      // 【期待される動作】: C品質のItemInstanceが生成される
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const recipeId = toCardId('recipe_001');
      const materials = [
        createMockMaterialInstance('herb', Quality.C),
        createMockMaterialInstance('water', Quality.C),
      ];
      setupMockRecipe(mockMasterDataRepo, recipeId);
      setupMockItem(mockMasterDataRepo, 'potion');
      (mockMaterialService.calculateAverageQuality as Mock).mockReturnValue(Quality.C);

      // Act
      const result = alchemyService.craft(recipeId, materials);

      // Assert
      expect(result.quality).toBe(Quality.C);
    });

    it('T-0012-04: 品質計算（混合品質素材）', () => {
      // 【テスト目的】: 混合品質の素材から平均品質のアイテムが生成されること
      // 【テスト内容】: B, C, D品質の混合素材でcraft
      // 【期待される動作】: 平均品質のItemInstanceが生成される
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const recipeId = toCardId('recipe_001');
      const materials = [
        createMockMaterialInstance('herb', Quality.B),
        createMockMaterialInstance('water', Quality.C),
      ];
      setupMockRecipe(mockMasterDataRepo, recipeId);
      setupMockItem(mockMasterDataRepo, 'potion');
      // (3+2)/2 = 2.5 → 3 → B
      (mockMaterialService.calculateAverageQuality as Mock).mockReturnValue(Quality.B);

      // Act
      const result = alchemyService.craft(recipeId, materials);

      // Assert
      expect(result.quality).toBe(Quality.B);
      expect(mockMaterialService.calculateAverageQuality).toHaveBeenCalled();
    });
  });

  // =============================================================================
  // TC-CANCRAFT-*: canCraft()メソッド
  // =============================================================================

  describe('canCraft', () => {
    it('TC-CANCRAFT-001: 十分な素材があれば調合可能', () => {
      // 【テスト目的】: 十分な素材がある場合にtrueが返されること
      // 【テスト内容】: 必要素材が全て揃った状態でcanCraftを実行
      // 【期待される動作】: trueが返される
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const recipeId = toCardId('recipe_001');
      const materials = [
        createMockMaterialInstance('herb', Quality.B),
        createMockMaterialInstance('water', Quality.C),
      ];
      setupMockRecipe(mockMasterDataRepo, recipeId);

      // Act
      const result = alchemyService.canCraft(recipeId, materials);

      // Assert
      expect(result).toBe(true);
    });

    it('TC-CANCRAFT-002: 素材不足の場合調合不可', () => {
      // 【テスト目的】: 素材不足の場合にfalseが返されること
      // 【テスト内容】: 素材が不足した状態でcanCraftを実行
      // 【期待される動作】: falseが返される
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const recipeId = toCardId('recipe_001');
      const materials: MaterialInstance[] = [];
      setupMockRecipe(mockMasterDataRepo, recipeId);

      // Act
      const result = alchemyService.canCraft(recipeId, materials);

      // Assert
      expect(result).toBe(false);
    });

    it('TC-CANCRAFT-003: 存在しないレシピIDの場合', () => {
      // 【テスト目的】: 存在しないレシピIDでfalseが返されること
      // 【テスト内容】: 無効なレシピIDでcanCraftを実行
      // 【期待される動作】: falseが返される
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const invalidRecipeId = toCardId('invalid_recipe');
      const materials = [createMockMaterialInstance('herb', Quality.B)];
      (mockMasterDataRepo.getRecipeCardById as Mock).mockReturnValue(undefined);

      // Act
      const result = alchemyService.canCraft(invalidRecipeId, materials);

      // Assert
      expect(result).toBe(false);
    });

    it('TC-CANCRAFT-004: 空の素材リストの場合', () => {
      // 【テスト目的】: 空の素材リストでfalseが返されること
      // 【テスト内容】: 空の素材リストでcanCraftを実行
      // 【期待される動作】: falseが返される
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const recipeId = toCardId('recipe_001');
      const materials: MaterialInstance[] = [];
      setupMockRecipeRequiringMaterials(mockMasterDataRepo, recipeId);

      // Act
      const result = alchemyService.canCraft(recipeId, materials);

      // Assert
      expect(result).toBe(false);
    });
  });

  // =============================================================================
  // TC-PREVIEW-*: previewQuality()メソッド
  // =============================================================================

  describe('previewQuality', () => {
    it('TC-PREVIEW-001: 全てC品質素材でプレビュー', () => {
      // 【テスト目的】: C品質素材のみで品質プレビューが正しいこと
      // 【テスト内容】: C品質素材でpreviewQualityを実行
      // 【期待される動作】: Quality.Cが返される
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const recipeId = toCardId('recipe_001');
      const materials = [
        createMockMaterialInstance('herb', Quality.C),
        createMockMaterialInstance('water', Quality.C),
      ];
      setupMockRecipe(mockMasterDataRepo, recipeId);
      (mockMaterialService.calculateAverageQuality as Mock).mockReturnValue(Quality.C);

      // Act
      const result = alchemyService.previewQuality(recipeId, materials);

      // Assert
      expect(result).toBe(Quality.C);
    });

    it('TC-PREVIEW-002: B, B, C混合素材でプレビュー', () => {
      // 【テスト目的】: 混合品質素材で品質プレビューが正しいこと
      // 【テスト内容】: B, B, C素材でpreviewQualityを実行
      // 【期待される動作】: Quality.Bが返される（(3+3+2)/3=2.67→3→B）
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const recipeId = toCardId('recipe_001');
      const materials = [
        createMockMaterialInstance('herb', Quality.B),
        createMockMaterialInstance('water', Quality.B),
      ];
      setupMockRecipe(mockMasterDataRepo, recipeId);
      (mockMaterialService.calculateAverageQuality as Mock).mockReturnValue(Quality.B);

      // Act
      const result = alchemyService.previewQuality(recipeId, materials);

      // Assert
      expect(result).toBe(Quality.B);
    });

    it('TC-PREVIEW-003: 全てS品質素材でプレビュー', () => {
      // 【テスト目的】: S品質素材のみで品質プレビューが正しいこと
      // 【テスト内容】: S品質素材でpreviewQualityを実行
      // 【期待される動作】: Quality.Sが返される
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const recipeId = toCardId('recipe_001');
      const materials = [
        createMockMaterialInstance('herb', Quality.S),
        createMockMaterialInstance('water', Quality.S),
      ];
      setupMockRecipe(mockMasterDataRepo, recipeId);
      (mockMaterialService.calculateAverageQuality as Mock).mockReturnValue(Quality.S);

      // Act
      const result = alchemyService.previewQuality(recipeId, materials);

      // Assert
      expect(result).toBe(Quality.S);
    });

    it('TC-PREVIEW-004: 存在しないレシピIDでプレビュー', () => {
      // 【テスト目的】: 存在しないレシピIDで適切に処理されること
      // 【テスト内容】: 無効なレシピIDでpreviewQualityを実行
      // 【期待される動作】: エラーがスローされるか、デフォルト品質が返される
      // 🟡 信頼性レベル: 設計文書から妥当に推測

      // Arrange
      const invalidRecipeId = toCardId('invalid_recipe');
      const materials = [createMockMaterialInstance('herb', Quality.B)];
      (mockMasterDataRepo.getRecipeCardById as Mock).mockReturnValue(undefined);

      // Act & Assert
      // 実装によってエラーか、デフォルト値のいずれか
      expect(() => alchemyService.previewQuality(invalidRecipeId, materials)).toThrow();
    });
  });

  // =============================================================================
  // TC-AVAILABLE-*, T-0012-05: getAvailableRecipes()メソッド
  // =============================================================================

  describe('getAvailableRecipes', () => {
    it('TC-AVAILABLE-001: 複数レシピ作成可能', () => {
      // 【テスト目的】: 複数のレシピが作成可能な場合に正しく返されること
      // 【テスト内容】: 複数レシピの素材を満たす状態でgetAvailableRecipesを実行
      // 【期待される動作】: 作成可能な全レシピの配列が返される
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const materials = [
        createMockMaterialInstance('herb', Quality.B),
        createMockMaterialInstance('water', Quality.C),
        createMockMaterialInstance('ore', Quality.A),
      ];
      setupMockMultipleRecipes(mockMasterDataRepo);

      // Act
      const result = alchemyService.getAvailableRecipes(materials);

      // Assert
      expect(result.length).toBeGreaterThan(1);
      expect(Array.isArray(result)).toBe(true);
    });

    it('TC-AVAILABLE-002: 作成可能レシピなし', () => {
      // 【テスト目的】: 作成可能なレシピがない場合に空配列が返されること
      // 【テスト内容】: どのレシピも満たさない素材でgetAvailableRecipesを実行
      // 【期待される動作】: 空配列が返される
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const materials = [createMockMaterialInstance('unknown', Quality.B)];
      setupMockRecipesThatDontMatch(mockMasterDataRepo);

      // Act
      const result = alchemyService.getAvailableRecipes(materials);

      // Assert
      expect(result).toEqual([]);
    });

    it('TC-AVAILABLE-003: 空の素材リスト', () => {
      // 【テスト目的】: 空の素材リストで空配列が返されること
      // 【テスト内容】: 空の素材リストでgetAvailableRecipesを実行
      // 【期待される動作】: 空配列が返される
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const materials: MaterialInstance[] = [];
      setupMockRecipes(mockMasterDataRepo);

      // Act
      const result = alchemyService.getAvailableRecipes(materials);

      // Assert
      expect(result).toEqual([]);
    });

    it('TC-AVAILABLE-004: 1つだけ作成可能', () => {
      // 【テスト目的】: 1つだけ作成可能な場合に1要素の配列が返されること
      // 【テスト内容】: 1つのレシピのみ満たす素材でgetAvailableRecipesを実行
      // 【期待される動作】: 1要素の配列が返される
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const materials = [createMockMaterialInstance('herb', Quality.B)];
      setupMockSingleMatchingRecipe(mockMasterDataRepo);

      // Act
      const result = alchemyService.getAvailableRecipes(materials);

      // Assert
      expect(result.length).toBe(1);
    });

    it('T-0012-05: 調合可能レシピ取得', () => {
      // 【テスト目的】: 所持素材で作れるレシピリストを取得できること
      // 【テスト内容】: 有効な素材でgetAvailableRecipesを実行
      // 【期待される動作】: 作成可能なレシピの配列が返される
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const materials = [
        createMockMaterialInstance('herb', Quality.B),
        createMockMaterialInstance('water', Quality.C),
      ];
      setupMockRecipes(mockMasterDataRepo);

      // Act
      const result = alchemyService.getAvailableRecipes(materials);

      // Assert
      expect(Array.isArray(result)).toBe(true);
      // 各要素がIRecipeCardMasterの構造を持つことを確認
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('id');
        expect(result[0]).toHaveProperty('requiredMaterials');
      }
    });
  });

  // =============================================================================
  // TC-CHECK-*: checkRecipeRequirements()メソッド
  // =============================================================================

  describe('checkRecipeRequirements', () => {
    it('TC-CHECK-001: 全素材マッチ', () => {
      // 【テスト目的】: 全ての必要素材がマッチした場合の結果
      // 【テスト内容】: 必要素材が全て揃った状態でcheckRecipeRequirementsを実行
      // 【期待される動作】: canCraft=true, missingMaterials=[], matchedMaterialsに素材
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const recipeId = toCardId('recipe_001');
      const materials = [
        createMockMaterialInstance('herb', Quality.B),
        createMockMaterialInstance('water', Quality.C),
      ];
      setupMockRecipe(mockMasterDataRepo, recipeId);

      // Act
      const result = alchemyService.checkRecipeRequirements(recipeId, materials);

      // Assert
      expect(result.canCraft).toBe(true);
      expect(result.missingMaterials).toEqual([]);
      expect(result.matchedMaterials.length).toBe(2);
    });

    it('TC-CHECK-002: 一部素材不足', () => {
      // 【テスト目的】: 一部の素材が不足している場合の結果
      // 【テスト内容】: 一部素材のみ揃った状態でcheckRecipeRequirementsを実行
      // 【期待される動作】: canCraft=false, missingMaterialsに不足分, matchedMaterialsにマッチ分
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const recipeId = toCardId('recipe_001');
      const materials = [createMockMaterialInstance('herb', Quality.B)];
      // レシピはherb + waterを要求
      setupMockRecipeRequiringTwoMaterials(mockMasterDataRepo, recipeId);

      // Act
      const result = alchemyService.checkRecipeRequirements(recipeId, materials);

      // Assert
      expect(result.canCraft).toBe(false);
      expect(result.missingMaterials.length).toBeGreaterThan(0);
      expect(result.matchedMaterials.length).toBe(1);
    });

    it('TC-CHECK-003: 全素材不足', () => {
      // 【テスト目的】: 全ての素材が不足している場合の結果
      // 【テスト内容】: 空の素材リストでcheckRecipeRequirementsを実行
      // 【期待される動作】: canCraft=false, missingMaterialsに全必要素材, matchedMaterials=[]
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const recipeId = toCardId('recipe_001');
      const materials: MaterialInstance[] = [];
      setupMockRecipeRequiringMaterials(mockMasterDataRepo, recipeId);

      // Act
      const result = alchemyService.checkRecipeRequirements(recipeId, materials);

      // Assert
      expect(result.canCraft).toBe(false);
      expect(result.missingMaterials.length).toBeGreaterThan(0);
      expect(result.matchedMaterials).toEqual([]);
    });

    it('TC-CHECK-004: 存在しないレシピID', () => {
      // 【テスト目的】: 存在しないレシピIDの場合の結果
      // 【テスト内容】: 無効なレシピIDでcheckRecipeRequirementsを実行
      // 【期待される動作】: canCraft=false, missingMaterials=[], matchedMaterials=[]
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const invalidRecipeId = toCardId('invalid_recipe');
      const materials = [createMockMaterialInstance('herb', Quality.B)];
      (mockMasterDataRepo.getRecipeCardById as Mock).mockReturnValue(undefined);

      // Act
      const result = alchemyService.checkRecipeRequirements(invalidRecipeId, materials);

      // Assert
      expect(result.canCraft).toBe(false);
      expect(result.missingMaterials).toEqual([]);
      expect(result.matchedMaterials).toEqual([]);
    });

    it('TC-CHECK-005: 品質条件未達', () => {
      // 【テスト目的】: 素材の品質が最低条件を満たさない場合の結果
      // 【テスト内容】: 品質条件を満たさない素材でcheckRecipeRequirementsを実行
      // 【期待される動作】: canCraft=false, missingMaterialsに該当素材
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const recipeId = toCardId('recipe_001');
      // レシピはB品質以上のherbを要求
      const materials = [createMockMaterialInstance('herb', Quality.D)];
      setupMockRecipeRequiringMinQuality(mockMasterDataRepo, recipeId, Quality.B);

      // Act
      const result = alchemyService.checkRecipeRequirements(recipeId, materials);

      // Assert
      expect(result.canCraft).toBe(false);
      expect(result.missingMaterials.length).toBeGreaterThan(0);
    });

    it('TC-CHECK-006: 複数個必要な素材', () => {
      // 【テスト目的】: 同一素材が複数個必要な場合の結果
      // 【テスト内容】: 必要数量の素材を持ってcheckRecipeRequirementsを実行
      // 【期待される動作】: 必要数量分がマッチする
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const recipeId = toCardId('recipe_001');
      // レシピはherbを3個要求
      const materials = [
        createMockMaterialInstance('herb', Quality.B),
        createMockMaterialInstance('herb', Quality.C),
        createMockMaterialInstance('herb', Quality.A),
      ];
      setupMockRecipeRequiringMultipleQuantity(mockMasterDataRepo, recipeId, 3);

      // Act
      const result = alchemyService.checkRecipeRequirements(recipeId, materials);

      // Assert
      expect(result.canCraft).toBe(true);
      expect(result.matchedMaterials.length).toBe(3);
    });

    it('TC-CHECK-007: 余剰素材あり', () => {
      // 【テスト目的】: 必要以上の素材がある場合の結果
      // 【テスト内容】: 必要数以上の素材を持ってcheckRecipeRequirementsを実行
      // 【期待される動作】: 必要分のみがマッチし、余剰は含まれない
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const recipeId = toCardId('recipe_001');
      // レシピはherbを1個要求
      const materials = [
        createMockMaterialInstance('herb', Quality.B),
        createMockMaterialInstance('herb', Quality.C),
        createMockMaterialInstance('herb', Quality.A),
      ];
      setupMockRecipeRequiringSingleMaterial(mockMasterDataRepo, recipeId);

      // Act
      const result = alchemyService.checkRecipeRequirements(recipeId, materials);

      // Assert
      expect(result.canCraft).toBe(true);
      expect(result.matchedMaterials.length).toBe(1); // 必要な1個のみ
    });

    it('TC-CHECK-008: 同一素材の重複使用禁止', () => {
      // 【テスト目的】: 同じ素材インスタンスが複数の要件で使用されないこと
      // 【テスト内容】: 複数の要件で同じ素材IDを要求するレシピでチェック
      // 【期待される動作】: 1つの素材インスタンスは1回のみマッチ
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const recipeId = toCardId('recipe_001');
      // レシピはherbを2個要求するが、素材は1個しかない
      const materials = [createMockMaterialInstance('herb', Quality.B)];
      setupMockRecipeRequiringMultipleQuantity(mockMasterDataRepo, recipeId, 2);

      // Act
      const result = alchemyService.checkRecipeRequirements(recipeId, materials);

      // Assert
      expect(result.canCraft).toBe(false);
      expect(result.matchedMaterials.length).toBe(1);
      expect(result.missingMaterials[0].quantity).toBe(1); // 不足1個
    });
  });
});
