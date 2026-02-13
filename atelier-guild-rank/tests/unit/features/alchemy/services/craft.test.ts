/**
 * craft.test.ts - craft関数のユニットテスト
 *
 * TASK-0077: features/alchemy/services作成
 */

import type { MaterialInstance } from '@domain/entities/MaterialInstance';
import { craft } from '@features/alchemy/services/craft';
import type { MaterialId, Quality } from '@shared/types';
import type { IRecipeCardMaster } from '@shared/types/master-data';
import { describe, expect, it, vi } from 'vitest';

/**
 * テスト用素材インスタンスを生成
 */
function createMaterial(materialId: string, quality: Quality): MaterialInstance {
  return {
    materialId: materialId as MaterialId,
    quality,
    master: { id: materialId as MaterialId, name: materialId },
  } as MaterialInstance;
}

/**
 * テスト用レシピを生成
 */
function createRecipe(overrides?: Partial<IRecipeCardMaster>): IRecipeCardMaster {
  return {
    id: 'recipe-001',
    name: 'Test Potion',
    type: 'RECIPE',
    rarity: 'COMMON',
    unlockRank: 'G',
    cost: 1,
    requiredMaterials: [{ materialId: 'herb' as MaterialId, quantity: 1 }],
    outputItemId: 'item-potion',
    category: 'CONSUMABLE',
    ...overrides,
  } as IRecipeCardMaster;
}

/**
 * テスト用ID生成関数
 */
function createMockIdGenerator(): () => string {
  let counter = 0;
  return () => {
    counter++;
    return `generated-id-${counter}`;
  };
}

describe('craft', () => {
  describe('正常系', () => {
    it('レシピと素材が揃っている場合、成功結果を返す', () => {
      const recipe = createRecipe();
      const materials = [createMaterial('herb', 'B')];
      const generateId = createMockIdGenerator();

      const result = craft(recipe, materials, generateId);

      expect(result.success).toBe(true);
      expect(result.item).toBeDefined();
      expect(result.item?.recipeId).toBe('recipe-001');
      expect(result.item?.outputItemId).toBe('item-potion');
      expect(result.error).toBeUndefined();
    });

    it('生成されたIDが使用される', () => {
      const recipe = createRecipe();
      const materials = [createMaterial('herb', 'A')];
      const generateId = vi.fn(() => 'test-id-123');

      const result = craft(recipe, materials, generateId);

      expect(generateId).toHaveBeenCalledOnce();
      expect(result.item?.id).toBe('test-id-123');
    });

    it('マッチした素材の品質から結果品質が計算される', () => {
      const recipe = createRecipe({
        requiredMaterials: [{ materialId: 'herb' as MaterialId, quantity: 2 }],
      });
      const materials = [createMaterial('herb', 'A'), createMaterial('herb', 'A')];
      const generateId = createMockIdGenerator();

      const result = craft(recipe, materials, generateId);

      expect(result.success).toBe(true);
      expect(result.item?.quality).toBe('A');
    });

    it('マッチした素材が結果に含まれる', () => {
      const recipe = createRecipe();
      const materials = [createMaterial('herb', 'B'), createMaterial('ore', 'C')];
      const generateId = createMockIdGenerator();

      const result = craft(recipe, materials, generateId);

      expect(result.matchedMaterials).toHaveLength(1);
      expect(result.matchedMaterials[0].materialId).toBe('herb');
    });
  });

  describe('異常系', () => {
    it('素材が不足している場合、失敗結果を返す', () => {
      const recipe = createRecipe();
      const materials: MaterialInstance[] = [];
      const generateId = createMockIdGenerator();

      const result = craft(recipe, materials, generateId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Cannot craft: insufficient materials');
      expect(result.item).toBeUndefined();
      expect(result.matchedMaterials).toHaveLength(0);
    });

    it('異なる素材しかない場合、失敗結果を返す', () => {
      const recipe = createRecipe();
      const materials = [createMaterial('ore', 'S')];
      const generateId = createMockIdGenerator();

      const result = craft(recipe, materials, generateId);

      expect(result.success).toBe(false);
    });
  });

  describe('純粋関数の性質', () => {
    it('同じ入力に対して同じ結果を返す', () => {
      const recipe = createRecipe();
      const materials = [createMaterial('herb', 'B')];
      const generateId1 = () => 'fixed-id';
      const generateId2 = () => 'fixed-id';

      const result1 = craft(recipe, materials, generateId1);
      const result2 = craft(recipe, materials, generateId2);

      expect(result1.success).toBe(result2.success);
      expect(result1.item?.quality).toBe(result2.item?.quality);
      expect(result1.item?.recipeId).toBe(result2.item?.recipeId);
    });

    it('入力の素材配列を変更しない', () => {
      const recipe = createRecipe();
      const materials = [createMaterial('herb', 'B')];
      const originalLength = materials.length;
      const generateId = createMockIdGenerator();

      craft(recipe, materials, generateId);

      expect(materials.length).toBe(originalLength);
    });
  });
});
