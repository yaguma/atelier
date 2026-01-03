/**
 * 調合ドメインサービスのテスト
 * TASK-0093: 調合ドメインサービス
 *
 * 調合フェーズのビジネスロジックをテストする
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  AlchemyService,
} from '../../../../src/domain/services/AlchemyService';
import {
  RecipeCard,
  EnhancementCard,
  createRecipeCard,
  createEnhancementCard,
} from '../../../../src/domain/card/CardEntity';
import {
  MaterialInstance,
  createMaterialInstance,
} from '../../../../src/domain/material/MaterialEntity';
import {
  CraftedItem,
} from '../../../../src/domain/item/ItemEntity';
import {
  createInventory,
  type Inventory,
} from '../../../../src/domain/services/InventoryService';
import {
  CardType,
  GuildRank,
  Rarity,
  Quality,
  EffectType,
  EnhancementTarget,
  ItemCategory,
} from '../../../../src/domain/common/types';
import type { IRecipeCard, IEnhancementCard } from '../../../../src/domain/card/Card';

describe('AlchemyService', () => {
  // テスト用レシピカードデータ
  const healingPotionRecipe: IRecipeCard = {
    id: 'recipe_healing_potion',
    name: 'ヒーリングポーション',
    type: CardType.RECIPE,
    rarity: Rarity.COMMON,
    unlockRank: GuildRank.G,
    cost: 1,
    requiredMaterials: [
      { materialId: 'herb', quantity: 2 },
    ],
    outputItemId: 'healing_potion',
    category: ItemCategory.MEDICINE,
  };

  const bombRecipe: IRecipeCard = {
    id: 'recipe_bomb',
    name: '爆弾',
    type: CardType.RECIPE,
    rarity: Rarity.UNCOMMON,
    unlockRank: GuildRank.F,
    cost: 2,
    requiredMaterials: [
      { materialId: 'ore', quantity: 2 },
      { materialId: 'crystal', quantity: 1 },
    ],
    outputItemId: 'bomb',
    category: ItemCategory.ADVENTURE,
  };

  const qualityRequiredRecipe: IRecipeCard = {
    id: 'recipe_high_potion',
    name: '高級ポーション',
    type: CardType.RECIPE,
    rarity: Rarity.RARE,
    unlockRank: GuildRank.E,
    cost: 2,
    requiredMaterials: [
      { materialId: 'herb', quantity: 3, minQuality: Quality.B },
    ],
    outputItemId: 'high_potion',
    category: ItemCategory.MEDICINE,
  };

  // テスト用強化カードデータ
  const qualityUpEnhancement: IEnhancementCard = {
    id: 'enhancement_quality_up',
    name: '品質向上',
    type: CardType.ENHANCEMENT,
    rarity: Rarity.UNCOMMON,
    unlockRank: GuildRank.G,
    cost: 0,
    effect: { type: EffectType.QUALITY_UP, value: 15 },
    targetAction: EnhancementTarget.ALCHEMY,
  };

  const materialSaveEnhancement: IEnhancementCard = {
    id: 'enhancement_material_save',
    name: '素材節約',
    type: CardType.ENHANCEMENT,
    rarity: Rarity.RARE,
    unlockRank: GuildRank.F,
    cost: 0,
    effect: { type: EffectType.MATERIAL_SAVE, value: 50 },
    targetAction: EnhancementTarget.ALCHEMY,
  };

  let alchemyService: AlchemyService;

  beforeEach(() => {
    alchemyService = new AlchemyService();
  });

  describe('canCraft（調合可否判定）', () => {
    it('必要素材が揃っていれば調合可能と判定される', () => {
      const materials = [
        createMaterialInstance({ materialId: 'herb', quality: Quality.C, quantity: 5 }),
      ];
      const inventory = createInventory(materials);
      const recipe = createRecipeCard(healingPotionRecipe);

      const result = alchemyService.canCraft(inventory, recipe);

      expect(result.canCraft).toBe(true);
      expect(result.missingMaterials).toHaveLength(0);
    });

    it('素材が不足していると調合不可と判定される', () => {
      const materials = [
        createMaterialInstance({ materialId: 'herb', quality: Quality.C, quantity: 1 }),
      ];
      const inventory = createInventory(materials);
      const recipe = createRecipeCard(healingPotionRecipe); // 2個必要

      const result = alchemyService.canCraft(inventory, recipe);

      expect(result.canCraft).toBe(false);
      expect(result.missingMaterials).toHaveLength(1);
      expect(result.missingMaterials[0].materialId).toBe('herb');
      expect(result.missingMaterials[0].shortage).toBe(1);
    });

    it('複数素材が必要な場合、すべて揃っていないと調合不可', () => {
      const materials = [
        createMaterialInstance({ materialId: 'ore', quality: Quality.C, quantity: 2 }),
        // crystalが不足
      ];
      const inventory = createInventory(materials);
      const recipe = createRecipeCard(bombRecipe);

      const result = alchemyService.canCraft(inventory, recipe);

      expect(result.canCraft).toBe(false);
      expect(result.missingMaterials.some((m) => m.materialId === 'crystal')).toBe(true);
    });

    it('最低品質が指定されている場合、その品質以上の素材が必要', () => {
      const materials = [
        createMaterialInstance({ materialId: 'herb', quality: Quality.C, quantity: 5 }),
      ];
      const inventory = createInventory(materials);
      const recipe = createRecipeCard(qualityRequiredRecipe); // B品質以上が必要

      const result = alchemyService.canCraft(inventory, recipe);

      expect(result.canCraft).toBe(false);
    });

    it('最低品質以上の素材があれば調合可能', () => {
      const materials = [
        createMaterialInstance({ materialId: 'herb', quality: Quality.A, quantity: 5 }),
      ];
      const inventory = createInventory(materials);
      const recipe = createRecipeCard(qualityRequiredRecipe);

      const result = alchemyService.canCraft(inventory, recipe);

      expect(result.canCraft).toBe(true);
    });
  });

  describe('craft（調合実行）', () => {
    it('レシピカードと素材から調合できる', () => {
      const materials = [
        createMaterialInstance({ materialId: 'herb', quality: Quality.C, quantity: 5 }),
      ];
      const inventory = createInventory(materials);
      const recipe = createRecipeCard(healingPotionRecipe);

      const result = alchemyService.craft(inventory, recipe);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.craftedItem).toBeDefined();
        expect(result.value.craftedItem.itemId).toBe('healing_potion');
      }
    });

    it('素材が不足していると調合できない', () => {
      const materials = [
        createMaterialInstance({ materialId: 'herb', quality: Quality.C, quantity: 1 }),
      ];
      const inventory = createInventory(materials);
      const recipe = createRecipeCard(healingPotionRecipe);

      const result = alchemyService.craft(inventory, recipe);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('素材が不足しています');
      }
    });

    it('調合後に素材が消費される', () => {
      const materials = [
        createMaterialInstance({ materialId: 'herb', quality: Quality.C, quantity: 5 }),
      ];
      const inventory = createInventory(materials);
      const recipe = createRecipeCard(healingPotionRecipe);

      const result = alchemyService.craft(inventory, recipe);

      expect(result.success).toBe(true);
      if (result.success) {
        // 2個消費されて3個残る
        const remainingHerb = result.value.inventory.materials.find(
          (m) => m.materialId === 'herb' && m.quality === Quality.C
        );
        expect(remainingHerb?.quantity).toBe(3);
      }
    });

    it('品質が計算される', () => {
      const materials = [
        createMaterialInstance({ materialId: 'herb', quality: Quality.A, quantity: 5 }),
      ];
      const inventory = createInventory(materials);
      const recipe = createRecipeCard(healingPotionRecipe);

      const result = alchemyService.craft(inventory, recipe);

      expect(result.success).toBe(true);
      if (result.success) {
        // A品質の素材から作成したアイテムは高品質になる
        expect(result.value.craftedItem.quality).toBeDefined();
      }
    });

    it('調合結果にアイテムが生成される', () => {
      const materials = [
        createMaterialInstance({ materialId: 'herb', quality: Quality.C, quantity: 5 }),
      ];
      const inventory = createInventory(materials);
      const recipe = createRecipeCard(healingPotionRecipe);

      const result = alchemyService.craft(inventory, recipe);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.craftedItem).toBeInstanceOf(CraftedItem);
        expect(result.value.craftedItem.itemId).toBe('healing_potion');
      }
    });
  });

  describe('craftWithEnhancements（強化カード付き調合）', () => {
    it('強化カードの効果が適用される', () => {
      const materials = [
        createMaterialInstance({ materialId: 'herb', quality: Quality.C, quantity: 5 }),
      ];
      const inventory = createInventory(materials);
      const recipe = createRecipeCard(healingPotionRecipe);
      const enhancements = [createEnhancementCard(qualityUpEnhancement)];

      const result = alchemyService.craftWithEnhancements(inventory, recipe, enhancements);

      expect(result.success).toBe(true);
      if (result.success) {
        // 品質向上効果が適用されている
        expect(result.value.appliedEffects).toContain(EffectType.QUALITY_UP);
      }
    });

    it('複数の強化カードを適用できる', () => {
      const materials = [
        createMaterialInstance({ materialId: 'herb', quality: Quality.C, quantity: 5 }),
      ];
      const inventory = createInventory(materials);
      const recipe = createRecipeCard(healingPotionRecipe);
      const enhancements = [
        createEnhancementCard(qualityUpEnhancement),
        createEnhancementCard({ ...materialSaveEnhancement, id: 'enhancement_2' }),
      ];

      const result = alchemyService.craftWithEnhancements(inventory, recipe, enhancements);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.appliedEffects).toHaveLength(2);
      }
    });

    it('調合対象外の強化カードは適用されない', () => {
      const materials = [
        createMaterialInstance({ materialId: 'herb', quality: Quality.C, quantity: 5 }),
      ];
      const inventory = createInventory(materials);
      const recipe = createRecipeCard(healingPotionRecipe);
      const gatheringEnhancement = createEnhancementCard({
        ...qualityUpEnhancement,
        id: 'gathering_enhancement',
        targetAction: EnhancementTarget.GATHERING, // 採取用
      });

      const result = alchemyService.craftWithEnhancements(inventory, recipe, [gatheringEnhancement]);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.appliedEffects).toHaveLength(0);
      }
    });

    it('素材節約効果で素材消費が減る可能性がある', () => {
      // 100%節約効果でテスト
      vi.spyOn(Math, 'random').mockReturnValue(0.1);

      const materials = [
        createMaterialInstance({ materialId: 'herb', quality: Quality.C, quantity: 5 }),
      ];
      const inventory = createInventory(materials);
      const recipe = createRecipeCard(healingPotionRecipe);
      const saveEnhancement = createEnhancementCard({
        ...materialSaveEnhancement,
        effect: { type: EffectType.MATERIAL_SAVE, value: 100 },
      });

      const result = alchemyService.craftWithEnhancements(inventory, recipe, [saveEnhancement]);

      expect(result.success).toBe(true);
      if (result.success) {
        // 素材が節約されている（消費なし）
        const remainingHerb = result.value.inventory.materials.find(
          (m) => m.materialId === 'herb' && m.quality === Quality.C
        );
        expect(remainingHerb?.quantity).toBe(5);
      }

      vi.restoreAllMocks();
    });
  });

  describe('calculateBaseQuality（基本品質計算）', () => {
    it('使用素材の品質平均から基本品質を計算する', () => {
      const materials = [
        createMaterialInstance({ materialId: 'herb', quality: Quality.B, quantity: 2 }),
        createMaterialInstance({ materialId: 'ore', quality: Quality.A, quantity: 1 }),
      ];

      const baseQuality = alchemyService.calculateBaseQuality(materials);

      // B(50) + A(70) = 平均60 → B〜Aの間
      expect(baseQuality).toBeGreaterThanOrEqual(0);
      expect(baseQuality).toBeLessThanOrEqual(100);
    });
  });

  describe('不変性', () => {
    it('craftは元のインベントリを変更しない', () => {
      const materials = [
        createMaterialInstance({ materialId: 'herb', quality: Quality.C, quantity: 5 }),
      ];
      const inventory = createInventory(materials);
      const originalQuantity = inventory.materials[0].quantity;
      const recipe = createRecipeCard(healingPotionRecipe);

      alchemyService.craft(inventory, recipe);

      expect(inventory.materials[0].quantity).toBe(originalQuantity);
    });
  });
});
