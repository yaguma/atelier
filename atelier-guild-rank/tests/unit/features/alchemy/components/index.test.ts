/**
 * Alchemy Components Module Tests
 * TASK-0078: features/alchemy/components作成
 *
 * 調合機能UIコンポーネントのエクスポート検証テスト
 */

import { AlchemyPhaseUI, RecipeListUI } from '@features/alchemy/components';
import { describe, expect, it } from 'vitest';

describe('features/alchemy/components', () => {
  describe('AlchemyPhaseUI', () => {
    it('AlchemyPhaseUIがエクスポートされている', () => {
      expect(AlchemyPhaseUI).toBeDefined();
    });

    it('AlchemyPhaseUIはクラスである', () => {
      expect(typeof AlchemyPhaseUI).toBe('function');
    });

    it('AlchemyPhaseUIはprototypeを持つ', () => {
      expect(AlchemyPhaseUI.prototype).toBeDefined();
    });

    it('AlchemyPhaseUIはcreateメソッドを持つ', () => {
      expect(typeof AlchemyPhaseUI.prototype.create).toBe('function');
    });

    it('AlchemyPhaseUIはdestroyメソッドを持つ', () => {
      expect(typeof AlchemyPhaseUI.prototype.destroy).toBe('function');
    });

    it('AlchemyPhaseUIはselectRecipeメソッドを持つ', () => {
      expect(typeof AlchemyPhaseUI.prototype.selectRecipe).toBe('function');
    });

    it('AlchemyPhaseUIはsetAvailableMaterialsメソッドを持つ', () => {
      expect(typeof AlchemyPhaseUI.prototype.setAvailableMaterials).toBe('function');
    });

    it('AlchemyPhaseUIはselectMaterialメソッドを持つ', () => {
      expect(typeof AlchemyPhaseUI.prototype.selectMaterial).toBe('function');
    });

    it('AlchemyPhaseUIはremoveMaterialメソッドを持つ', () => {
      expect(typeof AlchemyPhaseUI.prototype.removeMaterial).toBe('function');
    });

    it('AlchemyPhaseUIはexecuteCraftメソッドを持つ', () => {
      expect(typeof AlchemyPhaseUI.prototype.executeCraft).toBe('function');
    });

    it('AlchemyPhaseUIはisCraftButtonEnabledメソッドを持つ', () => {
      expect(typeof AlchemyPhaseUI.prototype.isCraftButtonEnabled).toBe('function');
    });

    it('AlchemyPhaseUIはgetRecipeCountメソッドを持つ', () => {
      expect(typeof AlchemyPhaseUI.prototype.getRecipeCount).toBe('function');
    });

    it('AlchemyPhaseUIはgetSelectedRecipeIdメソッドを持つ', () => {
      expect(typeof AlchemyPhaseUI.prototype.getSelectedRecipeId).toBe('function');
    });

    it('AlchemyPhaseUIはgetMaterialSlotCountメソッドを持つ', () => {
      expect(typeof AlchemyPhaseUI.prototype.getMaterialSlotCount).toBe('function');
    });

    it('AlchemyPhaseUIはgetPlacedMaterialsメソッドを持つ', () => {
      expect(typeof AlchemyPhaseUI.prototype.getPlacedMaterials).toBe('function');
    });

    it('AlchemyPhaseUIはgetAvailableMaterialCountメソッドを持つ', () => {
      expect(typeof AlchemyPhaseUI.prototype.getAvailableMaterialCount).toBe('function');
    });

    it('AlchemyPhaseUIはgetQualityPreviewメソッドを持つ', () => {
      expect(typeof AlchemyPhaseUI.prototype.getQualityPreview).toBe('function');
    });
  });

  describe('RecipeListUI', () => {
    it('RecipeListUIがエクスポートされている', () => {
      expect(RecipeListUI).toBeDefined();
    });

    it('RecipeListUIはクラスである', () => {
      expect(typeof RecipeListUI).toBe('function');
    });

    it('RecipeListUIはprototypeを持つ', () => {
      expect(RecipeListUI.prototype).toBeDefined();
    });

    it('RecipeListUIはcreateメソッドを持つ', () => {
      expect(typeof RecipeListUI.prototype.create).toBe('function');
    });

    it('RecipeListUIはdestroyメソッドを持つ', () => {
      expect(typeof RecipeListUI.prototype.destroy).toBe('function');
    });

    it('RecipeListUIはselectRecipeメソッドを持つ', () => {
      expect(typeof RecipeListUI.prototype.selectRecipe).toBe('function');
    });

    it('RecipeListUIはgetRecipeCountメソッドを持つ', () => {
      expect(typeof RecipeListUI.prototype.getRecipeCount).toBe('function');
    });

    it('RecipeListUIはgetSelectedRecipeIdメソッドを持つ', () => {
      expect(typeof RecipeListUI.prototype.getSelectedRecipeId).toBe('function');
    });

    it('RecipeListUIはisSelectedメソッドを持つ', () => {
      expect(typeof RecipeListUI.prototype.isSelected).toBe('function');
    });

    it('RecipeListUIはgetRecipeInfoメソッドを持つ', () => {
      expect(typeof RecipeListUI.prototype.getRecipeInfo).toBe('function');
    });
  });

  describe('後方互換性', () => {
    it('presentation/ui/phases/AlchemyPhaseUIからの再エクスポートが機能する', async () => {
      const compatModule = await import('@presentation/ui/phases/AlchemyPhaseUI');
      expect(compatModule.AlchemyPhaseUI).toBe(AlchemyPhaseUI);
    });

    it('presentation/ui/components/RecipeListUIからの再エクスポートが機能する', async () => {
      const compatModule = await import('@presentation/ui/components/RecipeListUI');
      expect(compatModule.RecipeListUI).toBe(RecipeListUI);
    });
  });
});
