/**
 * index.test.ts - features/alchemy/types エクスポートテスト
 *
 * TASK-0076: features/alchemy/types作成
 * 型定義が正しくエクスポートされていることを確認する
 */

import type {
  IAlchemyService,
  ICraftedItem,
  IRecipeCardMaster,
  IRecipeRequiredMaterial,
  RecipeCheckResult,
} from '@features/alchemy/types';
import { QUALITY_THRESHOLDS } from '@features/alchemy/types';
import type { CardId, MaterialId, Quality } from '@shared/types';
import { describe, expect, it } from 'vitest';

describe('features/alchemy/types', () => {
  describe('IAlchemyService', () => {
    it('@features/alchemy/typesからIAlchemyServiceがインポートできること', () => {
      const _typeCheck: IAlchemyService | undefined = undefined;
      expect(_typeCheck).toBeUndefined();
    });

    it('RecipeCheckResult型のオブジェクトを作成できること', () => {
      const result: RecipeCheckResult = {
        canCraft: true,
        missingMaterials: [],
        matchedMaterials: [],
      };
      expect(result.canCraft).toBe(true);
      expect(result.missingMaterials).toEqual([]);
      expect(result.matchedMaterials).toEqual([]);
    });
  });

  describe('レシピ関連型', () => {
    it('IRecipeCardMaster型がインポートできること', () => {
      const _typeCheck: IRecipeCardMaster | undefined = undefined;
      expect(_typeCheck).toBeUndefined();
    });

    it('IRecipeRequiredMaterial型のオブジェクトを作成できること', () => {
      const requirement: IRecipeRequiredMaterial = {
        materialId: 'mat-001',
        quantity: 3,
        minQuality: 'C' as Quality,
      };
      expect(requirement.materialId).toBe('mat-001');
      expect(requirement.quantity).toBe(3);
      expect(requirement.minQuality).toBe('C');
    });

    it('IRecipeRequiredMaterialのminQualityはオプショナルであること', () => {
      const requirement: IRecipeRequiredMaterial = {
        materialId: 'mat-002',
        quantity: 1,
      };
      expect(requirement.minQuality).toBeUndefined();
    });
  });

  describe('調合済みアイテム型', () => {
    it('ICraftedItem型のオブジェクトを作成できること', () => {
      const item: ICraftedItem = {
        itemId: 'item-001' as unknown as ICraftedItem['itemId'],
        quality: 'B' as Quality,
        attributeValues: [],
        effectValues: [],
        usedMaterials: [],
      };
      expect(item.quality).toBe('B');
      expect(item.attributeValues).toEqual([]);
    });
  });

  describe('QUALITY_THRESHOLDS定数', () => {
    it('全品質レベルの閾値が定義されていること', () => {
      expect(QUALITY_THRESHOLDS).toBeDefined();
      expect(QUALITY_THRESHOLDS.D).toBeDefined();
      expect(QUALITY_THRESHOLDS.C).toBeDefined();
      expect(QUALITY_THRESHOLDS.B).toBeDefined();
      expect(QUALITY_THRESHOLDS.A).toBeDefined();
      expect(QUALITY_THRESHOLDS.S).toBeDefined();
    });

    it('品質閾値が昇順であること', () => {
      expect(QUALITY_THRESHOLDS.D).toBeLessThan(QUALITY_THRESHOLDS.C);
      expect(QUALITY_THRESHOLDS.C).toBeLessThan(QUALITY_THRESHOLDS.B);
      expect(QUALITY_THRESHOLDS.B).toBeLessThan(QUALITY_THRESHOLDS.A);
      expect(QUALITY_THRESHOLDS.A).toBeLessThan(QUALITY_THRESHOLDS.S);
    });

    it('品質閾値が期待する値であること', () => {
      expect(QUALITY_THRESHOLDS.D).toBe(0);
      expect(QUALITY_THRESHOLDS.C).toBe(20);
      expect(QUALITY_THRESHOLDS.B).toBe(40);
      expect(QUALITY_THRESHOLDS.A).toBe(60);
      expect(QUALITY_THRESHOLDS.S).toBe(80);
    });
  });

  describe('index.tsバレルエクスポート', () => {
    it('すべての型と定数が@features/alchemy/typesから一括インポートできること', async () => {
      const mod = await import('@features/alchemy/types');
      // QUALITY_THRESHOLDS定数がエクスポートされていること
      expect(mod.QUALITY_THRESHOLDS).toBeDefined();
      expect(typeof mod.QUALITY_THRESHOLDS).toBe('object');
    });
  });
});
