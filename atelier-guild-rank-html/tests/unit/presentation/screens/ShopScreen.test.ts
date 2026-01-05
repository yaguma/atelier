/**
 * ショップ画面UIテスト
 * @description TASK-0129 ショップ画面UI
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  ShopScreen,
  ShopCategory,
  ShopItem,
} from '../../../../src/presentation/screens/ShopScreen';

describe('ShopScreen', () => {
  let screen: ShopScreen;
  let container: HTMLElement;

  const mockCategories: ShopCategory[] = [
    { id: 'recipe', name: 'レシピ' },
    { id: 'material', name: '素材' },
    { id: 'enhancement', name: '強化カード' },
  ];

  const mockItems: ShopItem[] = [
    {
      id: 'item-1',
      name: '回復薬のレシピ',
      description: '回復薬を調合できるようになる',
      price: 100,
      category: 'recipe',
    },
    {
      id: 'item-2',
      name: '魔力草のレシピ',
      description: '魔力草エキスを調合できるようになる',
      price: 200,
      category: 'recipe',
    },
    {
      id: 'item-3',
      name: '薬草',
      description: '基本的な素材',
      price: 50,
      category: 'material',
    },
    {
      id: 'item-4',
      name: '品質向上カード',
      description: '調合時に品質を向上させる',
      price: 300,
      category: 'enhancement',
    },
  ];

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    screen = new ShopScreen();
  });

  afterEach(() => {
    screen.destroy();
    document.body.removeChild(container);
  });

  describe('カテゴリタブ', () => {
    it('カテゴリタブが表示される', () => {
      // Arrange
      screen.setCategories(mockCategories);
      screen.setItems(mockItems);
      screen.mount(container);

      // Assert
      const tabs = container.querySelectorAll('.category-tab');
      expect(tabs.length).toBe(3);
    });

    it('カテゴリタブをクリックすると切り替わる', () => {
      // Arrange
      screen.setCategories(mockCategories);
      screen.setItems(mockItems);
      screen.mount(container);

      // Act
      const materialTab = container.querySelector(
        '.category-tab[data-category="material"]'
      ) as HTMLElement;
      materialTab?.click();

      // Assert - 再構築後の要素を取得して確認
      expect(screen.getSelectedCategory()).toBe('material');
      const activeTab = container.querySelector('.category-tab.active');
      expect(activeTab).not.toBeNull();
      expect(activeTab?.getAttribute('data-category')).toBe('material');
    });

    it('選択したカテゴリの商品のみ表示される', () => {
      // Arrange
      screen.setCategories(mockCategories);
      screen.setItems(mockItems);
      screen.mount(container);

      // Act - 素材カテゴリを選択
      const materialTab = container.querySelector(
        '.category-tab[data-category="material"]'
      ) as HTMLElement;
      materialTab?.click();

      // Assert - 素材カテゴリの商品のみ表示
      const visibleItems = container.querySelectorAll('.shop-item:not(.hidden)');
      expect(visibleItems.length).toBe(1);
      expect(visibleItems[0].textContent).toContain('薬草');
    });
  });

  describe('商品一覧', () => {
    it('商品一覧が表示される', () => {
      // Arrange
      screen.setCategories(mockCategories);
      screen.setItems(mockItems);
      screen.setSelectedCategory('recipe');
      screen.mount(container);

      // Assert - レシピカテゴリの商品
      const items = container.querySelectorAll('.shop-item');
      expect(items.length).toBeGreaterThan(0);
    });

    it('商品に名前と価格が表示される', () => {
      // Arrange
      screen.setCategories(mockCategories);
      screen.setItems(mockItems);
      screen.setSelectedCategory('recipe');
      screen.mount(container);

      // Assert
      const firstItem = container.querySelector('.shop-item');
      expect(firstItem?.textContent).toContain('回復薬のレシピ');
      expect(firstItem?.textContent).toContain('100');
    });
  });

  describe('商品選択と詳細', () => {
    it('商品を選択すると詳細が表示される', () => {
      // Arrange
      screen.setCategories(mockCategories);
      screen.setItems(mockItems);
      screen.setSelectedCategory('recipe');
      screen.mount(container);

      // Act
      const firstItem = container.querySelector('.shop-item') as HTMLElement;
      firstItem?.click();

      // Assert
      const detailPanel = container.querySelector('.item-detail');
      expect(detailPanel).not.toBeNull();
      expect(detailPanel?.textContent).toContain('回復薬のレシピ');
      expect(detailPanel?.textContent).toContain('回復薬を調合できるようになる');
    });

    it('選択した商品がハイライトされる', () => {
      // Arrange
      screen.setCategories(mockCategories);
      screen.setItems(mockItems);
      screen.setSelectedCategory('recipe');
      screen.mount(container);

      // Act
      const firstItem = container.querySelector('.shop-item') as HTMLElement;
      firstItem?.click();

      // Assert
      expect(firstItem?.classList.contains('selected')).toBe(true);
    });
  });

  describe('購入処理', () => {
    it('購入ボタンで購入処理コールバックが呼ばれる', () => {
      // Arrange
      const onPurchase = vi.fn();
      screen.setCategories(mockCategories);
      screen.setItems(mockItems);
      screen.setSelectedCategory('recipe');
      screen.setPlayerGold(500);
      screen.onPurchase(onPurchase);
      screen.mount(container);

      // Act
      const firstItem = container.querySelector('.shop-item') as HTMLElement;
      firstItem?.click();
      const purchaseBtn = container.querySelector('.purchase-btn') as HTMLButtonElement;
      purchaseBtn?.click();

      // Assert
      expect(onPurchase).toHaveBeenCalledWith('item-1');
    });

    it('ゴールド不足で購入ボタン非活性', () => {
      // Arrange
      screen.setCategories(mockCategories);
      screen.setItems(mockItems);
      screen.setSelectedCategory('recipe');
      screen.setPlayerGold(50); // 100G必要だが50Gしかない
      screen.mount(container);

      // Act
      const firstItem = container.querySelector('.shop-item') as HTMLElement;
      firstItem?.click();

      // Assert
      const purchaseBtn = container.querySelector('.purchase-btn') as HTMLButtonElement;
      expect(purchaseBtn?.disabled).toBe(true);
    });

    it('購入成功でゴールド減少アニメーション', () => {
      // Arrange
      screen.setCategories(mockCategories);
      screen.setItems(mockItems);
      screen.setSelectedCategory('recipe');
      screen.setPlayerGold(500);
      screen.mount(container);

      // Act
      screen.showPurchaseResult(400, true);

      // Assert
      const goldDisplay = container.querySelector('.gold-display');
      expect(goldDisplay?.classList.contains('animating')).toBe(true);
      expect(goldDisplay?.textContent).toContain('400');
    });
  });

  describe('戻るボタン', () => {
    it('戻るボタンでメイン画面へのコールバックが呼ばれる', () => {
      // Arrange
      const onBack = vi.fn();
      screen.setCategories(mockCategories);
      screen.setItems(mockItems);
      screen.onBack(onBack);
      screen.mount(container);

      // Act
      const backBtn = container.querySelector('.back-btn') as HTMLButtonElement;
      backBtn?.click();

      // Assert
      expect(onBack).toHaveBeenCalled();
    });
  });

  describe('所持ゴールド表示', () => {
    it('所持ゴールドが表示される', () => {
      // Arrange
      screen.setCategories(mockCategories);
      screen.setItems(mockItems);
      screen.setPlayerGold(1000);
      screen.mount(container);

      // Assert
      const goldDisplay = container.querySelector('.gold-display');
      expect(goldDisplay).not.toBeNull();
      expect(goldDisplay?.textContent).toContain('1000');
    });
  });

  describe('画面タイトル', () => {
    it('画面タイトルが表示される', () => {
      // Arrange
      screen.setCategories(mockCategories);
      screen.setItems(mockItems);
      screen.mount(container);

      // Assert
      const title = container.querySelector('.screen-title');
      expect(title).not.toBeNull();
      expect(title?.textContent).toContain('ショップ');
    });
  });
});
