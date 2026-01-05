/**
 * カードコンポーネントテスト
 * @description TASK-0133 カードコンポーネント
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  CardComponent,
  CardData,
  CardType,
} from '../../../../src/presentation/components/CardComponent';

describe('CardComponent', () => {
  let card: CardComponent;
  let container: HTMLElement;

  const mockGatheringCard: CardData = {
    id: 'gather-1',
    type: 'gathering',
    name: '深い森',
    cost: 2,
    description: '薬草×3、魔力草×2を獲得',
    materials: ['薬草×3', '魔力草×2'],
  };

  const mockRecipeCard: CardData = {
    id: 'recipe-1',
    type: 'recipe',
    name: '回復薬',
    cost: 3,
    description: 'HP回復アイテムを調合',
    requiredMaterials: ['薬草×2', '清水×1'],
    quality: 50,
  };

  const mockEnhancementCard: CardData = {
    id: 'enhance-1',
    type: 'enhancement',
    name: '品質向上',
    cost: 1,
    description: '調合時の品質を+10%',
    effect: '+10% 品質',
  };

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    card?.destroy();
    document.body.removeChild(container);
  });

  describe('採取地カード表示', () => {
    it('採取地カードを表示できる', () => {
      // Arrange
      card = new CardComponent(mockGatheringCard);
      card.mount(container);

      // Assert
      const cardElement = container.querySelector('.card');
      expect(cardElement).not.toBeNull();
      expect(cardElement?.classList.contains('card-gathering')).toBe(true);
    });

    it('採取地カードに素材一覧が表示される', () => {
      // Arrange
      card = new CardComponent(mockGatheringCard);
      card.mount(container);

      // Assert
      const materialsDisplay = container.querySelector('.card-materials');
      expect(materialsDisplay).not.toBeNull();
      expect(materialsDisplay?.textContent).toContain('薬草×3');
      expect(materialsDisplay?.textContent).toContain('魔力草×2');
    });
  });

  describe('レシピカード表示', () => {
    it('レシピカードを表示できる', () => {
      // Arrange
      card = new CardComponent(mockRecipeCard);
      card.mount(container);

      // Assert
      const cardElement = container.querySelector('.card');
      expect(cardElement).not.toBeNull();
      expect(cardElement?.classList.contains('card-recipe')).toBe(true);
    });

    it('レシピカードに必要素材が表示される', () => {
      // Arrange
      card = new CardComponent(mockRecipeCard);
      card.mount(container);

      // Assert
      const requirementsDisplay = container.querySelector('.card-requirements');
      expect(requirementsDisplay).not.toBeNull();
      expect(requirementsDisplay?.textContent).toContain('薬草×2');
      expect(requirementsDisplay?.textContent).toContain('清水×1');
    });

    it('レシピカードに品質が表示される', () => {
      // Arrange
      card = new CardComponent(mockRecipeCard);
      card.mount(container);

      // Assert
      const qualityDisplay = container.querySelector('.card-quality');
      expect(qualityDisplay).not.toBeNull();
      expect(qualityDisplay?.textContent).toContain('50');
    });
  });

  describe('強化カード表示', () => {
    it('強化カードを表示できる', () => {
      // Arrange
      card = new CardComponent(mockEnhancementCard);
      card.mount(container);

      // Assert
      const cardElement = container.querySelector('.card');
      expect(cardElement).not.toBeNull();
      expect(cardElement?.classList.contains('card-enhancement')).toBe(true);
    });

    it('強化カードに効果が表示される', () => {
      // Arrange
      card = new CardComponent(mockEnhancementCard);
      card.mount(container);

      // Assert
      const effectDisplay = container.querySelector('.card-effect');
      expect(effectDisplay).not.toBeNull();
      expect(effectDisplay?.textContent).toContain('+10% 品質');
    });
  });

  describe('共通表示', () => {
    it('カード名が表示される', () => {
      // Arrange
      card = new CardComponent(mockGatheringCard);
      card.mount(container);

      // Assert
      const nameDisplay = container.querySelector('.card-name');
      expect(nameDisplay).not.toBeNull();
      expect(nameDisplay?.textContent).toContain('深い森');
    });

    it('コストが表示される', () => {
      // Arrange
      card = new CardComponent(mockGatheringCard);
      card.mount(container);

      // Assert
      const costDisplay = container.querySelector('.card-cost');
      expect(costDisplay).not.toBeNull();
      expect(costDisplay?.textContent).toContain('2');
    });

    it('効果・詳細が表示される', () => {
      // Arrange
      card = new CardComponent(mockGatheringCard);
      card.mount(container);

      // Assert
      const descDisplay = container.querySelector('.card-description');
      expect(descDisplay).not.toBeNull();
      expect(descDisplay?.textContent).toContain('薬草×3、魔力草×2を獲得');
    });
  });

  describe('選択状態', () => {
    it('選択状態が切り替わる', () => {
      // Arrange
      card = new CardComponent(mockGatheringCard);
      card.mount(container);

      // Act
      card.setSelected(true);

      // Assert
      const cardElement = container.querySelector('.card');
      expect(cardElement?.classList.contains('selected')).toBe(true);
    });

    it('選択解除できる', () => {
      // Arrange
      card = new CardComponent(mockGatheringCard);
      card.mount(container);
      card.setSelected(true);

      // Act
      card.setSelected(false);

      // Assert
      const cardElement = container.querySelector('.card');
      expect(cardElement?.classList.contains('selected')).toBe(false);
    });

    it('クリックで選択コールバックが呼ばれる', () => {
      // Arrange
      const onClick = vi.fn();
      card = new CardComponent(mockGatheringCard);
      card.onClick(onClick);
      card.mount(container);

      // Act
      const cardElement = container.querySelector('.card') as HTMLElement;
      cardElement?.click();

      // Assert
      expect(onClick).toHaveBeenCalledWith('gather-1');
    });
  });

  describe('無効状態', () => {
    it('無効状態が表示される', () => {
      // Arrange
      card = new CardComponent(mockGatheringCard);
      card.mount(container);

      // Act
      card.setDisabled(true);

      // Assert
      const cardElement = container.querySelector('.card');
      expect(cardElement?.classList.contains('disabled')).toBe(true);
    });

    it('無効状態ではクリックが無効', () => {
      // Arrange
      const onClick = vi.fn();
      card = new CardComponent(mockGatheringCard);
      card.onClick(onClick);
      card.mount(container);
      card.setDisabled(true);

      // Act
      const cardElement = container.querySelector('.card') as HTMLElement;
      cardElement?.click();

      // Assert
      expect(onClick).not.toHaveBeenCalled();
    });

    it('無効解除できる', () => {
      // Arrange
      card = new CardComponent(mockGatheringCard);
      card.mount(container);
      card.setDisabled(true);

      // Act
      card.setDisabled(false);

      // Assert
      const cardElement = container.querySelector('.card');
      expect(cardElement?.classList.contains('disabled')).toBe(false);
    });
  });

  describe('ホバー状態', () => {
    it('ホバー時にハイライトされる', () => {
      // Arrange
      card = new CardComponent(mockGatheringCard);
      card.mount(container);

      // Act
      const cardElement = container.querySelector('.card') as HTMLElement;
      cardElement?.dispatchEvent(new MouseEvent('mouseenter'));

      // Assert
      expect(cardElement?.classList.contains('hovered')).toBe(true);
    });

    it('ホバー解除でハイライトが消える', () => {
      // Arrange
      card = new CardComponent(mockGatheringCard);
      card.mount(container);

      // Act
      const cardElement = container.querySelector('.card') as HTMLElement;
      cardElement?.dispatchEvent(new MouseEvent('mouseenter'));
      cardElement?.dispatchEvent(new MouseEvent('mouseleave'));

      // Assert
      expect(cardElement?.classList.contains('hovered')).toBe(false);
    });
  });
});
