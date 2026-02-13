/**
 * features/shop 公開APIテスト
 * TASK-0090: features/shop/index.ts公開API作成
 *
 * @description
 * ショップ機能の公開APIが正しくエクスポートされていることを確認する。
 * 外部モジュールは @features/shop からのみインポートすべき。
 */

import type {
  CanPurchaseResult,
  IPurchaseResult,
  IShopItem,
  IShopService,
  PurchaseError,
  PurchaseInput,
  ShopItemType,
} from '@features/shop';
import {
  canPurchase,
  executePurchase,
  filterByMaxPrice,
  filterByType,
  getAvailableItems,
  isRankSufficient,
  ShopHeader,
  ShopItemCard,
  ShopItemGrid,
} from '@features/shop';
import { describe, expect, it } from 'vitest';

describe('features/shop 公開API', () => {
  // ===========================================================================
  // Types エクスポート確認
  // ===========================================================================
  describe('型定義のエクスポート', () => {
    it('IShopItem型がエクスポートされていること', () => {
      const item: IShopItem = {} as IShopItem;
      expect(item).toBeDefined();
    });

    it('ShopItemType型がエクスポートされていること', () => {
      const type: ShopItemType = 'card';
      expect(type).toBeDefined();
    });

    it('IPurchaseResult型がエクスポートされていること', () => {
      const result: IPurchaseResult = {} as IPurchaseResult;
      expect(result).toBeDefined();
    });

    it('IShopService型がエクスポートされていること', () => {
      const service: IShopService = {} as IShopService;
      expect(service).toBeDefined();
    });

    it('PurchaseError型がエクスポートされていること', () => {
      const error: PurchaseError = 'ITEM_NOT_FOUND';
      expect(error).toBeDefined();
    });

    it('CanPurchaseResult型がエクスポートされていること', () => {
      const result: CanPurchaseResult = { canPurchase: true };
      expect(result).toBeDefined();
    });

    it('PurchaseInput型がエクスポートされていること', () => {
      const input: PurchaseInput = {} as PurchaseInput;
      expect(input).toBeDefined();
    });
  });

  // ===========================================================================
  // Services エクスポート確認
  // ===========================================================================
  describe('サービス関数のエクスポート', () => {
    it('canPurchase関数がエクスポートされていること', () => {
      expect(canPurchase).toBeDefined();
      expect(typeof canPurchase).toBe('function');
    });

    it('isRankSufficient関数がエクスポートされていること', () => {
      expect(isRankSufficient).toBeDefined();
      expect(typeof isRankSufficient).toBe('function');
    });

    it('getAvailableItems関数がエクスポートされていること', () => {
      expect(getAvailableItems).toBeDefined();
      expect(typeof getAvailableItems).toBe('function');
    });

    it('filterByType関数がエクスポートされていること', () => {
      expect(filterByType).toBeDefined();
      expect(typeof filterByType).toBe('function');
    });

    it('filterByMaxPrice関数がエクスポートされていること', () => {
      expect(filterByMaxPrice).toBeDefined();
      expect(typeof filterByMaxPrice).toBe('function');
    });

    it('executePurchase関数がエクスポートされていること', () => {
      expect(executePurchase).toBeDefined();
      expect(typeof executePurchase).toBe('function');
    });
  });

  // ===========================================================================
  // Components エクスポート確認
  // ===========================================================================
  describe('コンポーネントのエクスポート', () => {
    it('ShopHeaderがエクスポートされていること', () => {
      expect(ShopHeader).toBeDefined();
      expect(typeof ShopHeader).toBe('function');
    });

    it('ShopItemCardがエクスポートされていること', () => {
      expect(ShopItemCard).toBeDefined();
      expect(typeof ShopItemCard).toBe('function');
    });

    it('ShopItemGridがエクスポートされていること', () => {
      expect(ShopItemGrid).toBeDefined();
      expect(typeof ShopItemGrid).toBe('function');
    });
  });

  // ===========================================================================
  // 一括インポート確認
  // ===========================================================================
  describe('一括インポート', () => {
    it('すべてのエクスポートが@features/shopから一括インポートできること', async () => {
      const mod = await import('@features/shop');

      // サービス関数
      expect(mod.canPurchase).toBeDefined();
      expect(mod.isRankSufficient).toBeDefined();
      expect(mod.getAvailableItems).toBeDefined();
      expect(mod.filterByType).toBeDefined();
      expect(mod.filterByMaxPrice).toBeDefined();
      expect(mod.executePurchase).toBeDefined();

      // コンポーネント
      expect(mod.ShopHeader).toBeDefined();
      expect(mod.ShopItemCard).toBeDefined();
      expect(mod.ShopItemGrid).toBeDefined();
    });
  });
});
