/**
 * Shop型定義 ユニットテスト
 * TASK-0056 ShopSceneリファクタリング
 *
 * @description
 * TC-TY-001 ~ TC-TY-003: 型定義の正確性テストケース
 */

import { describe, expect, it } from 'vitest';

// =============================================================================
// テストスイート
// =============================================================================

describe('Shop Types', () => {
  // ===========================================================================
  // TC-TY-001: ShopHeaderConfig型チェック
  // ===========================================================================

  describe('TC-TY-001: ShopHeaderConfig型チェック', () => {
    // 【テスト目的】: 型定義の正確性
    // 【対応要件】: REQ-056-020
    // 🟡 信頼性レベル: 新規作成する型のため妥当な推測

    it('TC-TY-001: ShopHeaderConfigが必須プロパティを持つ', async () => {
      // Given: 型定義をインポート
      const { ShopHeaderConfig } = await import('@presentation/scenes/components/shop/types');

      // When: 正しいShopHeaderConfigオブジェクトを作成
      const config: typeof ShopHeaderConfig = {
        initialGold: 500,
        onBackClick: () => {},
      };

      // Then: コンパイルエラーなし（型チェック成功）
      expect(config).toBeDefined();
      expect(config.initialGold).toBe(500);
      expect(typeof config.onBackClick).toBe('function');
    });
  });

  // ===========================================================================
  // TC-TY-002: ShopItemCardConfig型チェック
  // ===========================================================================

  describe('TC-TY-002: ShopItemCardConfig型チェック', () => {
    // 【テスト目的】: 型定義の正確性
    // 【対応要件】: REQ-056-020
    // 🟡 信頼性レベル: 新規作成する型のため妥当な推測

    it('TC-TY-002: ShopItemCardConfigが必須プロパティを持つ', async () => {
      // Given: 型定義をインポート
      const { ShopItemCardConfig, IShopItem } = await import(
        '@presentation/scenes/components/shop/types'
      );

      // When: 正しいShopItemCardConfigオブジェクトを作成
      const mockItem: typeof IShopItem = {
        id: 'item-001',
        name: '強化ポーション',
        type: 'card',
        description: '攻撃力を上げる',
        price: 100,
        stock: 3,
      };

      const config: typeof ShopItemCardConfig = {
        item: mockItem,
        x: 0,
        y: 0,
        currentGold: 500,
        onPurchase: (_itemId: string) => {},
      };

      // Then: コンパイルエラーなし（型チェック成功）
      expect(config).toBeDefined();
      expect(config.item.id).toBe('item-001');
      expect(config.x).toBe(0);
      expect(config.y).toBe(0);
      expect(config.currentGold).toBe(500);
      expect(typeof config.onPurchase).toBe('function');
    });
  });

  // ===========================================================================
  // TC-TY-003: コールバック型の型安全性
  // ===========================================================================

  describe('TC-TY-003: コールバック型の型安全性', () => {
    // 【テスト目的】: any型排除の確認
    // 【対応要件】: REQ-056-030（any型の関数シグネチャ不可）
    // 🔵 信頼性レベル: REQ-056-030に基づく

    it('TC-TY-003: onPurchaseコールバックが正しい型シグネチャを持つ', async () => {
      // Given: 型定義をインポート
      const { OnPurchaseCallback } = await import('@presentation/scenes/components/shop/types');

      // When: 型安全なコールバックを作成
      const callback: typeof OnPurchaseCallback = (itemId: string): void => {
        // itemIdを使用して処理を行う
        console.log(`Purchased: ${itemId}`);
      };

      // Then: コールバックが正しく動作する
      expect(typeof callback).toBe('function');

      // 呼び出しテスト
      let capturedId = '';
      const testCallback: typeof OnPurchaseCallback = (itemId: string): void => {
        capturedId = itemId;
      };

      testCallback('test-item');
      expect(capturedId).toBe('test-item');
    });

    it('TC-TY-003b: onBackClickコールバックが正しい型シグネチャを持つ', async () => {
      // Given: 型定義をインポート
      const { OnBackClickCallback } = await import('@presentation/scenes/components/shop/types');

      // When: 型安全なコールバックを作成
      const callback: typeof OnBackClickCallback = (): void => {
        // 戻る処理を行う
      };

      // Then: コールバックが正しく動作する
      expect(typeof callback).toBe('function');
    });

    it('TC-TY-003c: onItemSelectコールバックが正しい型シグネチャを持つ', async () => {
      // Given: 型定義をインポート
      const { OnItemSelectCallback, IShopItem } = await import(
        '@presentation/scenes/components/shop/types'
      );

      // When: 型安全なコールバックを作成
      const mockItem: typeof IShopItem = {
        id: 'item-001',
        name: 'テストアイテム',
        type: 'card',
        description: 'テスト説明',
        price: 100,
        stock: 5,
      };

      let capturedItem: typeof IShopItem | null = null;
      const callback: typeof OnItemSelectCallback = (item: typeof IShopItem): void => {
        capturedItem = item;
      };

      // Then: コールバックが正しく動作する
      callback(mockItem);
      expect(capturedItem).toEqual(mockItem);
    });
  });
});
