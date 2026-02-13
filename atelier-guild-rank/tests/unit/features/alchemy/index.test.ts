/**
 * features/alchemy 公開APIテスト
 * TASK-0079: features/alchemy/index.ts公開API作成
 *
 * @description
 * 調合機能の公開APIが正しくエクスポートされていることを確認する。
 * 外部モジュールは @features/alchemy からのみインポートすべき。
 */

import type {
  CraftedItemData,
  CraftResult,
  IAlchemyService,
  IAttributeValue,
  ICraftedItem,
  IEffectValue,
  IRecipeCardMaster,
  IRecipeRequiredMaterial,
  IUsedMaterial,
  RecipeCheckResult,
} from '@features/alchemy';
import {
  AlchemyPhaseUI,
  calculateQuality,
  checkRecipeRequirements,
  craft,
  QUALITY_THRESHOLDS,
  RecipeListUI,
} from '@features/alchemy';
import { describe, expect, it } from 'vitest';

describe('features/alchemy 公開API', () => {
  // ===========================================================================
  // Types エクスポート確認
  // ===========================================================================
  describe('型定義のエクスポート', () => {
    it('IAlchemyService型がエクスポートされていること', () => {
      const service: IAlchemyService = {} as IAlchemyService;
      expect(service).toBeDefined();
    });

    it('RecipeCheckResult型がエクスポートされていること', () => {
      const result: RecipeCheckResult = {
        canCraft: true,
        missingMaterials: [],
      };
      expect(result).toBeDefined();
    });

    it('ICraftedItem型がエクスポートされていること', () => {
      const item: ICraftedItem = {} as ICraftedItem;
      expect(item).toBeDefined();
    });

    it('IAttributeValue型がエクスポートされていること', () => {
      const attr: IAttributeValue = {} as IAttributeValue;
      expect(attr).toBeDefined();
    });

    it('IEffectValue型がエクスポートされていること', () => {
      const effect: IEffectValue = {} as IEffectValue;
      expect(effect).toBeDefined();
    });

    it('IUsedMaterial型がエクスポートされていること', () => {
      const material: IUsedMaterial = {} as IUsedMaterial;
      expect(material).toBeDefined();
    });

    it('IRecipeCardMaster型がエクスポートされていること', () => {
      const recipe: IRecipeCardMaster = {} as IRecipeCardMaster;
      expect(recipe).toBeDefined();
    });

    it('IRecipeRequiredMaterial型がエクスポートされていること', () => {
      const material: IRecipeRequiredMaterial = {} as IRecipeRequiredMaterial;
      expect(material).toBeDefined();
    });

    it('QUALITY_THRESHOLDS定数がエクスポートされていること', () => {
      expect(QUALITY_THRESHOLDS).toBeDefined();
      expect(typeof QUALITY_THRESHOLDS).toBe('object');
    });
  });

  // ===========================================================================
  // Services エクスポート確認
  // ===========================================================================
  describe('サービス関数のエクスポート', () => {
    it('calculateQuality関数がエクスポートされていること', () => {
      expect(calculateQuality).toBeDefined();
      expect(typeof calculateQuality).toBe('function');
    });

    it('checkRecipeRequirements関数がエクスポートされていること', () => {
      expect(checkRecipeRequirements).toBeDefined();
      expect(typeof checkRecipeRequirements).toBe('function');
    });

    it('craft関数がエクスポートされていること', () => {
      expect(craft).toBeDefined();
      expect(typeof craft).toBe('function');
    });

    it('CraftedItemData型がエクスポートされていること', () => {
      const data: CraftedItemData = {} as CraftedItemData;
      expect(data).toBeDefined();
    });

    it('CraftResult型がエクスポートされていること', () => {
      const result: CraftResult = {} as CraftResult;
      expect(result).toBeDefined();
    });
  });

  // ===========================================================================
  // Components エクスポート確認
  // ===========================================================================
  describe('コンポーネントのエクスポート', () => {
    it('AlchemyPhaseUIがエクスポートされていること', () => {
      expect(AlchemyPhaseUI).toBeDefined();
      expect(typeof AlchemyPhaseUI).toBe('function');
    });

    it('RecipeListUIがエクスポートされていること', () => {
      expect(RecipeListUI).toBeDefined();
      expect(typeof RecipeListUI).toBe('function');
    });
  });

  // ===========================================================================
  // 一括インポート確認
  // ===========================================================================
  describe('一括インポート', () => {
    it('すべてのエクスポートが@features/alchemyから一括インポートできること', async () => {
      const mod = await import('@features/alchemy');

      // 定数
      expect(mod.QUALITY_THRESHOLDS).toBeDefined();

      // サービス関数
      expect(mod.calculateQuality).toBeDefined();
      expect(mod.checkRecipeRequirements).toBeDefined();
      expect(mod.craft).toBeDefined();

      // コンポーネント
      expect(mod.AlchemyPhaseUI).toBeDefined();
      expect(mod.RecipeListUI).toBeDefined();
    });
  });
});
