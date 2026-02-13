/**
 * purchase-validator テスト
 * TASK-0089: features/shop/services作成
 *
 * 購入可否判定の純粋関数テスト
 */

import { canPurchase, isRankSufficient } from '@features/shop/services/purchase-validator';
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

describe('purchase-validator', () => {
  // ===========================================================================
  // isRankSufficient
  // ===========================================================================
  describe('isRankSufficient', () => {
    it('同じランクの場合trueを返すこと', () => {
      expect(isRankSufficient(GuildRank.D, GuildRank.D)).toBe(true);
    });

    it('現在のランクが必要ランクより高い場合trueを返すこと', () => {
      expect(isRankSufficient(GuildRank.A, GuildRank.D)).toBe(true);
    });

    it('現在のランクが必要ランクより低い場合falseを返すこと', () => {
      expect(isRankSufficient(GuildRank.G, GuildRank.D)).toBe(false);
    });

    it('最低ランクGが要件Gを満たすこと', () => {
      expect(isRankSufficient(GuildRank.G, GuildRank.G)).toBe(true);
    });

    it('最高ランクSがすべてのランク要件を満たすこと', () => {
      expect(isRankSufficient(GuildRank.S, GuildRank.S)).toBe(true);
      expect(isRankSufficient(GuildRank.S, GuildRank.G)).toBe(true);
    });
  });

  // ===========================================================================
  // canPurchase
  // ===========================================================================
  describe('canPurchase', () => {
    describe('正常系', () => {
      it('すべての条件を満たす場合、購入可能と判定すること', () => {
        const item = createShopItem();
        const result = canPurchase(item, 1000, GuildRank.G);

        expect(result.canPurchase).toBe(true);
        expect(result.error).toBeUndefined();
        expect(result.errorMessage).toBeUndefined();
      });

      it('ちょうどの所持金で購入可能と判定すること', () => {
        const item = createShopItem({ price: 100 });
        const result = canPurchase(item, 100, GuildRank.G);

        expect(result.canPurchase).toBe(true);
      });

      it('在庫-1（無制限）の場合、購入可能と判定すること', () => {
        const item = createShopItem({ stock: -1 });
        const result = canPurchase(item, 1000, GuildRank.G);

        expect(result.canPurchase).toBe(true);
      });
    });

    describe('異常系', () => {
      it('アイテムがundefinedの場合、ITEM_NOT_FOUNDエラーを返すこと', () => {
        const result = canPurchase(undefined, 1000, GuildRank.G);

        expect(result.canPurchase).toBe(false);
        expect(result.error).toBe('ITEM_NOT_FOUND');
        expect(result.errorMessage).toBe('アイテムが見つかりません');
      });

      it('在庫が0の場合、OUT_OF_STOCKエラーを返すこと', () => {
        const item = createShopItem({ stock: 0 });
        const result = canPurchase(item, 1000, GuildRank.G);

        expect(result.canPurchase).toBe(false);
        expect(result.error).toBe('OUT_OF_STOCK');
        expect(result.errorMessage).toBe('在庫がありません');
      });

      it('所持金が不足している場合、INSUFFICIENT_GOLDエラーを返すこと', () => {
        const item = createShopItem({ price: 100 });
        const result = canPurchase(item, 99, GuildRank.G);

        expect(result.canPurchase).toBe(false);
        expect(result.error).toBe('INSUFFICIENT_GOLD');
        expect(result.errorMessage).toBe('ゴールドが不足しています');
      });

      it('ランクが不足している場合、RANK_INSUFFICIENTエラーを返すこと', () => {
        const item = createShopItem({ unlockRank: GuildRank.A });
        const result = canPurchase(item, 1000, GuildRank.G);

        expect(result.canPurchase).toBe(false);
        expect(result.error).toBe('RANK_INSUFFICIENT');
        expect(result.errorMessage).toContain('ランクA');
      });
    });

    describe('純粋関数検証', () => {
      it('同じ入力に対して同じ出力を返すこと', () => {
        const item = createShopItem();
        const result1 = canPurchase(item, 1000, GuildRank.G);
        const result2 = canPurchase(item, 1000, GuildRank.G);

        expect(result1).toEqual(result2);
      });

      it('入力のアイテムオブジェクトを変更しないこと', () => {
        const item = createShopItem();
        const originalItem = { ...item };
        canPurchase(item, 1000, GuildRank.G);

        expect(item).toEqual(originalItem);
      });
    });
  });
});
