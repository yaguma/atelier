/**
 * 調合フェーズUIテスト
 * @description TASK-0127 調合フェーズUI
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  AlchemyPhaseUI,
  RecipeCardData,
  MaterialStock,
  EnhancementCardData,
  AlchemyResult,
} from '../../../../src/presentation/phases/AlchemyPhaseUI';

describe('AlchemyPhaseUI', () => {
  let phaseUI: AlchemyPhaseUI;
  let container: HTMLElement;

  const mockRecipes: RecipeCardData[] = [
    {
      id: 'recipe-1',
      name: '回復薬',
      requiredMaterials: [
        { name: '薬草', quantity: 2 },
        { name: '清水', quantity: 1 },
      ],
      baseQuality: 50,
    },
    {
      id: 'recipe-2',
      name: '魔力草エキス',
      requiredMaterials: [
        { name: '魔力草', quantity: 3 },
        { name: '清水', quantity: 2 },
      ],
      baseQuality: 60,
    },
    {
      id: 'recipe-3',
      name: 'エリクサー',
      requiredMaterials: [
        { name: '回復薬', quantity: 2 },
        { name: '魔力草エキス', quantity: 1 },
        { name: '宝石', quantity: 1 },
      ],
      baseQuality: 80,
    },
  ];

  const mockMaterials: MaterialStock[] = [
    { name: '薬草', quantity: 5 },
    { name: '清水', quantity: 3 },
    { name: '魔力草', quantity: 4 },
    { name: '宝石', quantity: 0 },
  ];

  const mockEnhancements: EnhancementCardData[] = [
    {
      id: 'enhance-1',
      name: '品質向上',
      qualityBonus: 10,
      description: '品質を10%向上させる',
    },
    {
      id: 'enhance-2',
      name: '大成功',
      qualityBonus: 25,
      description: '品質を25%向上させる',
    },
  ];

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    phaseUI = new AlchemyPhaseUI();
  });

  afterEach(() => {
    phaseUI.destroy();
    document.body.removeChild(container);
  });

  describe('レシピ一覧表示', () => {
    it('レシピカード一覧が表示される', () => {
      // Arrange
      phaseUI.setRecipes(mockRecipes);
      phaseUI.mount(container);

      // Assert
      const recipeCards = container.querySelectorAll('.recipe-card');
      expect(recipeCards.length).toBe(3);
    });

    it('レシピに名前と必要素材が表示される', () => {
      // Arrange
      phaseUI.setRecipes(mockRecipes);
      phaseUI.mount(container);

      // Assert
      const firstCard = container.querySelector('.recipe-card');
      expect(firstCard?.textContent).toContain('回復薬');
      expect(firstCard?.textContent).toContain('薬草');
      expect(firstCard?.textContent).toContain('2');
    });
  });

  describe('所持素材表示', () => {
    it('所持素材が表示される', () => {
      // Arrange
      phaseUI.setRecipes(mockRecipes);
      phaseUI.setMaterialStock(mockMaterials);
      phaseUI.mount(container);

      // Assert
      const materialList = container.querySelector('.material-stock');
      expect(materialList).not.toBeNull();
      expect(materialList?.textContent).toContain('薬草');
      expect(materialList?.textContent).toContain('5');
    });
  });

  describe('レシピ選択', () => {
    it('レシピを選択できる', () => {
      // Arrange
      phaseUI.setRecipes(mockRecipes);
      phaseUI.mount(container);

      // Act
      const firstCard = container.querySelector('.recipe-card') as HTMLElement;
      firstCard?.click();

      // Assert
      expect(phaseUI.getSelectedRecipeId()).toBe('recipe-1');
    });

    it('選択したレシピがハイライトされる', () => {
      // Arrange
      phaseUI.setRecipes(mockRecipes);
      phaseUI.mount(container);

      // Act
      const firstCard = container.querySelector('.recipe-card') as HTMLElement;
      firstCard?.click();

      // Assert - 再構築後の要素を取得
      const selectedCard = container.querySelector('.recipe-card.selected');
      expect(selectedCard).not.toBeNull();
      expect(selectedCard?.textContent).toContain('回復薬');
    });
  });

  describe('素材過不足表示', () => {
    it('必要素材の過不足が表示される', () => {
      // Arrange
      phaseUI.setRecipes(mockRecipes);
      phaseUI.setMaterialStock(mockMaterials);
      phaseUI.mount(container);

      // Act - レシピを選択
      const firstCard = container.querySelector('.recipe-card') as HTMLElement;
      firstCard?.click();

      // Assert
      const requirementDisplay = container.querySelector('.material-requirements');
      expect(requirementDisplay).not.toBeNull();
      // 薬草: 必要2, 所持5 → 十分
      expect(requirementDisplay?.querySelector('.sufficient')).not.toBeNull();
    });

    it('素材が不足している場合に警告が表示される', () => {
      // Arrange
      phaseUI.setRecipes(mockRecipes);
      phaseUI.setMaterialStock(mockMaterials);
      phaseUI.mount(container);

      // Act - エリクサーを選択（宝石が不足）
      const cards = container.querySelectorAll('.recipe-card');
      (cards[2] as HTMLElement).click();

      // Assert
      const requirementDisplay = container.querySelector('.material-requirements');
      expect(requirementDisplay?.querySelector('.insufficient')).not.toBeNull();
    });
  });

  describe('強化カード選択', () => {
    it('強化カードを選択できる', () => {
      // Arrange
      phaseUI.setRecipes(mockRecipes);
      phaseUI.setEnhancementCards(mockEnhancements);
      phaseUI.mount(container);

      // Act
      const enhanceCard = container.querySelector('.enhancement-card') as HTMLElement;
      enhanceCard?.click();

      // Assert
      expect(phaseUI.getSelectedEnhancementId()).toBe('enhance-1');
    });

    it('強化カード一覧が表示される', () => {
      // Arrange
      phaseUI.setRecipes(mockRecipes);
      phaseUI.setEnhancementCards(mockEnhancements);
      phaseUI.mount(container);

      // Assert
      const enhanceCards = container.querySelectorAll('.enhancement-card');
      expect(enhanceCards.length).toBe(2);
    });
  });

  describe('調合実行', () => {
    it('調合ボタンで調合実行コールバックが呼ばれる', () => {
      // Arrange
      const onSynthesize = vi.fn();
      phaseUI.setRecipes(mockRecipes);
      phaseUI.setMaterialStock(mockMaterials);
      phaseUI.onSynthesize(onSynthesize);
      phaseUI.mount(container);

      // Act - レシピを選択して調合
      const firstCard = container.querySelector('.recipe-card') as HTMLElement;
      firstCard?.click();
      const synthesizeBtn = container.querySelector('.synthesize-btn') as HTMLButtonElement;
      synthesizeBtn?.click();

      // Assert
      expect(onSynthesize).toHaveBeenCalledWith('recipe-1', null);
    });

    it('素材不足時は調合ボタンが無効', () => {
      // Arrange
      phaseUI.setRecipes(mockRecipes);
      phaseUI.setMaterialStock(mockMaterials);
      phaseUI.mount(container);

      // Act - エリクサーを選択（素材不足）
      const cards = container.querySelectorAll('.recipe-card');
      (cards[2] as HTMLElement).click();

      // Assert
      const synthesizeBtn = container.querySelector('.synthesize-btn') as HTMLButtonElement;
      expect(synthesizeBtn?.disabled).toBe(true);
    });
  });

  describe('調合結果表示', () => {
    it('調合結果がアニメーション表示される', () => {
      // Arrange
      phaseUI.setRecipes(mockRecipes);
      phaseUI.mount(container);

      // Act
      const result: AlchemyResult = {
        itemName: '回復薬',
        quality: 75,
        success: true,
      };
      phaseUI.showAlchemyResult(result);

      // Assert
      const resultDisplay = container.querySelector('.alchemy-result');
      expect(resultDisplay).not.toBeNull();
      expect(resultDisplay?.classList.contains('animating')).toBe(true);
      expect(resultDisplay?.textContent).toContain('回復薬');
    });

    it('品質が表示される', () => {
      // Arrange
      phaseUI.setRecipes(mockRecipes);
      phaseUI.mount(container);

      // Act
      const result: AlchemyResult = {
        itemName: '回復薬',
        quality: 75,
        success: true,
      };
      phaseUI.showAlchemyResult(result);

      // Assert
      const qualityDisplay = container.querySelector('.alchemy-quality');
      expect(qualityDisplay).not.toBeNull();
      expect(qualityDisplay?.textContent).toContain('75');
    });
  });

  describe('次フェーズ遷移', () => {
    it('「次のフェーズへ」ボタンが表示される', () => {
      // Arrange
      phaseUI.setRecipes(mockRecipes);
      phaseUI.mount(container);

      // Assert
      const nextPhaseBtn = container.querySelector('.next-phase-btn');
      expect(nextPhaseBtn).not.toBeNull();
    });

    it('「次のフェーズへ」クリックでコールバックが呼ばれる', () => {
      // Arrange
      const onNextPhase = vi.fn();
      phaseUI.setRecipes(mockRecipes);
      phaseUI.onNextPhase(onNextPhase);
      phaseUI.mount(container);

      // Act
      const nextPhaseBtn = container.querySelector('.next-phase-btn') as HTMLButtonElement;
      nextPhaseBtn?.click();

      // Assert
      expect(onNextPhase).toHaveBeenCalled();
    });
  });

  describe('フェーズタイトル', () => {
    it('フェーズタイトルが表示される', () => {
      // Arrange
      phaseUI.setRecipes(mockRecipes);
      phaseUI.mount(container);

      // Assert
      const title = container.querySelector('.phase-title');
      expect(title).not.toBeNull();
      expect(title?.textContent).toContain('調合');
    });
  });
});
