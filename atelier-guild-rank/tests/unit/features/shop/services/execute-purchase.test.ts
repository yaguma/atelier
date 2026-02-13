/**
 * execute-purchase テスト
 * TASK-0089: features/shop/services作成
 *
 * 購入処理の純粋関数テスト
 */

import type { PurchaseInput } from '@features/shop/services/execute-purchase';
import { executePurchase } from '@features/shop/services/execute-purchase';
import type { IShopItem } from '@features/shop/types';
import { GuildRank } from '@shared/types';
import { describe, expect, it } from 'vitest';

const createShopItem = (overrides: Partial<IShopItem> = {}): IShopItem => ({
  id: 'shop-001',
  type: 'card',
  itemId: 'card-001',
  name: 'テストカード',
  price: 100,
  stock: 5,
  unlockRank: GuildRank.G,
  description: 'テスト用',
  ...overrides,
});

describe('executePurchase', () => {
  describe('購入成功', () => {
    it('購入成功時にsuccessがtrueとなること', () => {
      const input: PurchaseInput = {
        item: createShopItem({ price: 100, stock: 5 }),
        currentGold: 1000,
        currentRank: GuildRank.G,
      };

      const result = executePurchase(input);

      expect(result.success).toBe(true);
      expect(result.itemId).toBe('shop-001');
    });

    it('購入後のゴールドが正しく計算されること', () => {
      const input: PurchaseInput = {
        item: createShopItem({ price: 150 }),
        currentGold: 500,
        currentRank: GuildRank.G,
      };

      const result = executePurchase(input);

      expect(result.remainingGold).toBe(350);
    });

    it('購入後の在庫が1減ること', () => {
      const input: PurchaseInput = {
        item: createShopItem({ stock: 3 }),
        currentGold: 1000,
        currentRank: GuildRank.G,
      };

      const result = executePurchase(input);

      expect(result.remainingStock).toBe(2);
    });

    it('在庫-1（無制限）の場合、在庫が-1のまま返されること', () => {
      const input: PurchaseInput = {
        item: createShopItem({ stock: -1 }),
        currentGold: 1000,
        currentRank: GuildRank.G,
      };

      const result = executePurchase(input);

      expect(result.success).toBe(true);
      expect(result.remainingStock).toBe(-1);
    });

    it('所持金ちょうどで購入でき、残りゴールドが0になること', () => {
      const input: PurchaseInput = {
        item: createShopItem({ price: 200 }),
        currentGold: 200,
        currentRank: GuildRank.G,
      };

      const result = executePurchase(input);

      expect(result.success).toBe(true);
      expect(result.remainingGold).toBe(0);
    });
  });

  describe('購入失敗', () => {
    it('アイテムがundefinedの場合、失敗すること', () => {
      const input: PurchaseInput = {
        item: undefined,
        currentGold: 1000,
        currentRank: GuildRank.G,
      };

      const result = executePurchase(input);

      expect(result.success).toBe(false);
      expect(result.errorMessage).toBeDefined();
    });

    it('ゴールド不足の場合、失敗しゴールドが変わらないこと', () => {
      const input: PurchaseInput = {
        item: createShopItem({ price: 500 }),
        currentGold: 100,
        currentRank: GuildRank.G,
      };

      const result = executePurchase(input);

      expect(result.success).toBe(false);
      expect(result.remainingGold).toBe(100);
    });

    it('在庫切れの場合、失敗すること', () => {
      const input: PurchaseInput = {
        item: createShopItem({ stock: 0 }),
        currentGold: 1000,
        currentRank: GuildRank.G,
      };

      const result = executePurchase(input);

      expect(result.success).toBe(false);
      expect(result.remainingStock).toBe(0);
    });

    it('ランク不足の場合、失敗すること', () => {
      const input: PurchaseInput = {
        item: createShopItem({ unlockRank: GuildRank.S }),
        currentGold: 1000,
        currentRank: GuildRank.G,
      };

      const result = executePurchase(input);

      expect(result.success).toBe(false);
    });
  });

  describe('純粋関数検証', () => {
    it('同じ入力に対して同じ出力を返すこと', () => {
      const input: PurchaseInput = {
        item: createShopItem(),
        currentGold: 500,
        currentRank: GuildRank.D,
      };

      const result1 = executePurchase(input);
      const result2 = executePurchase(input);

      expect(result1).toEqual(result2);
    });

    it('入力のアイテムオブジェクトを変更しないこと', () => {
      const item = createShopItem({ stock: 5, price: 100 });
      const originalStock = item.stock;
      const originalPrice = item.price;

      executePurchase({
        item,
        currentGold: 1000,
        currentRank: GuildRank.G,
      });

      expect(item.stock).toBe(originalStock);
      expect(item.price).toBe(originalPrice);
    });

    it('入力オブジェクトが参照的に同一であること（変更されないことの確認）', () => {
      const item = createShopItem();
      const input: PurchaseInput = {
        item,
        currentGold: 1000,
        currentRank: GuildRank.G,
      };
      const inputCopy = { ...input };

      executePurchase(input);

      expect(input.currentGold).toBe(inputCopy.currentGold);
      expect(input.currentRank).toBe(inputCopy.currentRank);
    });
  });
});
