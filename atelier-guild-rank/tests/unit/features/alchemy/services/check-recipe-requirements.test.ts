/**
 * check-recipe-requirements.test.ts - checkRecipeRequirements関数のユニットテスト
 *
 * TASK-0077: features/alchemy/services作成
 */

import type { MaterialInstance } from '@domain/entities/MaterialInstance';
import { checkRecipeRequirements } from '@features/alchemy/services/check-recipe-requirements';
import type { MaterialId, Quality } from '@shared/types';
import type { IRecipeRequiredMaterial } from '@shared/types/master-data';
import { describe, expect, it } from 'vitest';

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
 * テスト用必要素材を生成
 */
function createRequired(
  materialId: string,
  quantity: number,
  minQuality?: Quality,
): IRecipeRequiredMaterial {
  return {
    materialId: materialId as MaterialId,
    quantity,
    minQuality,
  } as IRecipeRequiredMaterial;
}

describe('checkRecipeRequirements', () => {
  describe('正常系: 調合可能', () => {
    it('必要素材が全て揃っている場合、canCraftがtrueを返す', () => {
      const required = [createRequired('herb', 1)];
      const available = [createMaterial('herb', 'C')];

      const result = checkRecipeRequirements(required, available);

      expect(result.canCraft).toBe(true);
      expect(result.missingMaterials).toHaveLength(0);
      expect(result.matchedMaterials).toHaveLength(1);
    });

    it('複数の必要素材が全て揃っている場合', () => {
      const required = [createRequired('herb', 1), createRequired('ore', 1)];
      const available = [createMaterial('herb', 'B'), createMaterial('ore', 'C')];

      const result = checkRecipeRequirements(required, available);

      expect(result.canCraft).toBe(true);
      expect(result.matchedMaterials).toHaveLength(2);
    });

    it('余剰素材がある場合でも調合可能', () => {
      const required = [createRequired('herb', 1)];
      const available = [
        createMaterial('herb', 'A'),
        createMaterial('herb', 'B'),
        createMaterial('ore', 'C'),
      ];

      const result = checkRecipeRequirements(required, available);

      expect(result.canCraft).toBe(true);
      expect(result.matchedMaterials).toHaveLength(1);
    });

    it('同じ素材が複数必要な場合', () => {
      const required = [createRequired('herb', 3)];
      const available = [
        createMaterial('herb', 'C'),
        createMaterial('herb', 'B'),
        createMaterial('herb', 'A'),
      ];

      const result = checkRecipeRequirements(required, available);

      expect(result.canCraft).toBe(true);
      expect(result.matchedMaterials).toHaveLength(3);
    });
  });

  describe('正常系: 調合不可', () => {
    it('素材が足りない場合、canCraftがfalseを返す', () => {
      const required = [createRequired('herb', 2)];
      const available = [createMaterial('herb', 'C')];

      const result = checkRecipeRequirements(required, available);

      expect(result.canCraft).toBe(false);
      expect(result.missingMaterials).toHaveLength(1);
      expect(result.missingMaterials[0].quantity).toBe(1);
    });

    it('必要素材が存在しない場合', () => {
      const required = [createRequired('gem', 1)];
      const available = [createMaterial('herb', 'C')];

      const result = checkRecipeRequirements(required, available);

      expect(result.canCraft).toBe(false);
      expect(result.missingMaterials).toHaveLength(1);
    });

    it('利用可能素材が空の場合', () => {
      const required = [createRequired('herb', 1)];

      const result = checkRecipeRequirements(required, []);

      expect(result.canCraft).toBe(false);
    });
  });

  describe('品質条件', () => {
    it('最低品質を満たす素材のみマッチする', () => {
      const required = [createRequired('herb', 1, 'B')];
      const available = [
        createMaterial('herb', 'C'), // B未満なのでマッチしない
        createMaterial('herb', 'B'), // マッチ
      ];

      const result = checkRecipeRequirements(required, available);

      expect(result.canCraft).toBe(true);
      expect(result.matchedMaterials).toHaveLength(1);
      expect(result.matchedMaterials[0].quality).toBe('B');
    });

    it('最低品質を満たす素材がない場合は不可', () => {
      const required = [createRequired('herb', 1, 'A')];
      const available = [createMaterial('herb', 'C'), createMaterial('herb', 'B')];

      const result = checkRecipeRequirements(required, available);

      expect(result.canCraft).toBe(false);
    });
  });

  describe('素材の重複使用防止', () => {
    it('同じ素材インスタンスが複数の要件に使い回されない', () => {
      const required = [createRequired('herb', 1), createRequired('herb', 1)];
      const available = [createMaterial('herb', 'C')];

      const result = checkRecipeRequirements(required, available);

      expect(result.canCraft).toBe(false);
      expect(result.matchedMaterials).toHaveLength(1);
    });
  });

  describe('空の必要素材リスト', () => {
    it('必要素材がない場合はcanCraftがtrue', () => {
      const result = checkRecipeRequirements([], []);

      expect(result.canCraft).toBe(true);
      expect(result.matchedMaterials).toHaveLength(0);
    });
  });
});
