/**
 * features/shop/types バレルエクスポートテスト
 * TASK-0088: features/shop/types作成
 *
 * @description
 * ショップ機能の型定義が正しくエクスポートされていることを確認する。
 */

import type { IPurchaseResult, IShopItem, IShopService, ShopItemType } from '@features/shop/types';
import { describe, expect, it } from 'vitest';

describe('features/shop/types バレルエクスポート', () => {
  // ===========================================================================
  // IShopItem型
  // ===========================================================================
  describe('IShopItem型', () => {
    it('IShopItem型がエクスポートされ、必須プロパティを持つこと', () => {
      const item: IShopItem = {
        id: 'shop-001',
        type: 'card',
        itemId: 'card-001',
        name: 'テストカード',
        price: 100,
        stock: 5,
        unlockRank: 'G',
        description: 'テスト用のカード',
      };

      expect(item.id).toBe('shop-001');
      expect(item.type).toBe('card');
      expect(item.itemId).toBe('card-001');
      expect(item.name).toBe('テストカード');
      expect(item.price).toBe(100);
      expect(item.stock).toBe(5);
      expect(item.unlockRank).toBe('G');
      expect(item.description).toBe('テスト用のカード');
    });

    it('在庫-1で無制限を表現できること', () => {
      const item: IShopItem = {
        id: 'shop-002',
        type: 'material',
        itemId: 'mat-001',
        name: '無限在庫アイテム',
        price: 50,
        stock: -1,
        unlockRank: 'G',
        description: '常に購入可能',
      };

      expect(item.stock).toBe(-1);
    });
  });

  // ===========================================================================
  // ShopItemType型
  // ===========================================================================
  describe('ShopItemType型', () => {
    it('card型が使用できること', () => {
      const itemType: ShopItemType = 'card';
      expect(itemType).toBe('card');
    });

    it('material型が使用できること', () => {
      const itemType: ShopItemType = 'material';
      expect(itemType).toBe('material');
    });

    it('artifact型が使用できること', () => {
      const itemType: ShopItemType = 'artifact';
      expect(itemType).toBe('artifact');
    });
  });

  // ===========================================================================
  // IPurchaseResult型
  // ===========================================================================
  describe('IPurchaseResult型', () => {
    it('成功時の購入結果が表現できること', () => {
      const result: IPurchaseResult = {
        success: true,
        itemId: 'shop-001',
        remainingGold: 900,
        remainingStock: 4,
      };

      expect(result.success).toBe(true);
      expect(result.itemId).toBe('shop-001');
      expect(result.remainingGold).toBe(900);
      expect(result.remainingStock).toBe(4);
      expect(result.errorMessage).toBeUndefined();
    });

    it('失敗時の購入結果にエラーメッセージが含まれること', () => {
      const result: IPurchaseResult = {
        success: false,
        itemId: 'shop-001',
        remainingGold: 50,
        remainingStock: 5,
        errorMessage: 'ゴールドが不足しています',
      };

      expect(result.success).toBe(false);
      expect(result.errorMessage).toBe('ゴールドが不足しています');
    });
  });

  // ===========================================================================
  // IShopService型
  // ===========================================================================
  describe('IShopService型', () => {
    it('IShopService型がエクスポートされていること', () => {
      const service: IShopService = {} as IShopService;
      expect(service).toBeDefined();
    });

    it('必要なメソッドシグネチャが定義されていること', () => {
      const service: IShopService = {
        getAvailableItems: () => [],
        getAllItems: () => [],
        canPurchase: () => true,
        purchase: () => ({
          success: true,
          itemId: '',
          remainingGold: 0,
          remainingStock: 0,
        }),
        getItemPrice: () => 0,
        getShopItem: () => null,
        getStock: () => 0,
      };

      expect(typeof service.getAvailableItems).toBe('function');
      expect(typeof service.getAllItems).toBe('function');
      expect(typeof service.canPurchase).toBe('function');
      expect(typeof service.purchase).toBe('function');
      expect(typeof service.getItemPrice).toBe('function');
      expect(typeof service.getShopItem).toBe('function');
      expect(typeof service.getStock).toBe('function');
    });
  });

  // ===========================================================================
  // 後方互換性
  // ===========================================================================
  describe('後方互換性', () => {
    it('@domain/interfaces/shop-service.interfaceからの再エクスポートが動作すること', async () => {
      const mod = await import('@domain/interfaces/shop-service.interface');

      // 再エクスポートshimから型が解決可能（ランタイム値は含まれない）
      expect(mod).toBeDefined();
    });
  });

  // ===========================================================================
  // 一括インポート
  // ===========================================================================
  describe('一括インポート', () => {
    it('すべての型が@features/shop/typesから一括インポートできること', async () => {
      const mod = await import('@features/shop/types');

      // 型のみのモジュールなので、モジュール自体が解決可能であること
      expect(mod).toBeDefined();
    });
  });
});
