/**
 * shop-filters テスト
 * TASK-0089: features/shop/services作成
 *
 * ショップアイテムフィルタリングの純粋関数テスト
 */

import {
  filterByMaxPrice,
  filterByType,
  getAvailableItems,
} from '@features/shop/services/shop-filters';
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

describe('shop-filters', () => {
  // ===========================================================================
  // getAvailableItems
  // ===========================================================================
  describe('getAvailableItems', () => {
    it('ランク条件と在庫条件を満たすアイテムのみ返すこと', () => {
      const items: IShopItem[] = [
        createShopItem({ id: '1', unlockRank: GuildRank.G, stock: 3 }),
        createShopItem({ id: '2', unlockRank: GuildRank.A, stock: 5 }),
        createShopItem({ id: '3', unlockRank: GuildRank.G, stock: 0 }),
      ];

      const result = getAvailableItems(items, GuildRank.D);

      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe('1');
    });

    it('空配列に対して空配列を返すこと', () => {
      const result = getAvailableItems([], GuildRank.G);
      expect(result).toHaveLength(0);
    });

    it('在庫-1（無制限）のアイテムを含めること', () => {
      const items: IShopItem[] = [createShopItem({ id: '1', stock: -1, unlockRank: GuildRank.G })];

      const result = getAvailableItems(items, GuildRank.G);
      expect(result).toHaveLength(1);
    });

    it('すべてのアイテムが在庫切れの場合、空配列を返すこと', () => {
      const items: IShopItem[] = [
        createShopItem({ id: '1', stock: 0 }),
        createShopItem({ id: '2', stock: 0 }),
      ];

      const result = getAvailableItems(items, GuildRank.S);
      expect(result).toHaveLength(0);
    });

    it('高ランクプレイヤーは全ランクのアイテムを取得できること', () => {
      const items: IShopItem[] = [
        createShopItem({ id: '1', unlockRank: GuildRank.G }),
        createShopItem({ id: '2', unlockRank: GuildRank.D }),
        createShopItem({ id: '3', unlockRank: GuildRank.A }),
        createShopItem({ id: '4', unlockRank: GuildRank.S }),
      ];

      const result = getAvailableItems(items, GuildRank.S);
      expect(result).toHaveLength(4);
    });

    describe('純粋関数検証', () => {
      it('入力配列を変更しないこと', () => {
        const items: IShopItem[] = [createShopItem({ id: '1' }), createShopItem({ id: '2' })];
        const originalLength = items.length;
        getAvailableItems(items, GuildRank.G);

        expect(items).toHaveLength(originalLength);
      });

      it('同じ入力に対して同じ出力を返すこと', () => {
        const items: IShopItem[] = [createShopItem({ id: '1', unlockRank: GuildRank.D })];

        const result1 = getAvailableItems(items, GuildRank.D);
        const result2 = getAvailableItems(items, GuildRank.D);

        expect(result1).toEqual(result2);
      });
    });
  });

  // ===========================================================================
  // filterByType
  // ===========================================================================
  describe('filterByType', () => {
    it('指定タイプのアイテムのみ返すこと', () => {
      const items: IShopItem[] = [
        createShopItem({ id: '1', type: 'card' }),
        createShopItem({ id: '2', type: 'material' }),
        createShopItem({ id: '3', type: 'card' }),
        createShopItem({ id: '4', type: 'artifact' }),
      ];

      const result = filterByType(items, 'card');

      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe('1');
      expect(result[1]?.id).toBe('3');
    });

    it('該当タイプがない場合、空配列を返すこと', () => {
      const items: IShopItem[] = [createShopItem({ id: '1', type: 'card' })];

      const result = filterByType(items, 'artifact');
      expect(result).toHaveLength(0);
    });
  });

  // ===========================================================================
  // filterByMaxPrice
  // ===========================================================================
  describe('filterByMaxPrice', () => {
    it('指定価格以下のアイテムのみ返すこと', () => {
      const items: IShopItem[] = [
        createShopItem({ id: '1', price: 50 }),
        createShopItem({ id: '2', price: 100 }),
        createShopItem({ id: '3', price: 200 }),
      ];

      const result = filterByMaxPrice(items, 100);

      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe('1');
      expect(result[1]?.id).toBe('2');
    });

    it('ちょうどの価格のアイテムを含めること', () => {
      const items: IShopItem[] = [createShopItem({ id: '1', price: 100 })];

      const result = filterByMaxPrice(items, 100);
      expect(result).toHaveLength(1);
    });

    it('すべて高額な場合、空配列を返すこと', () => {
      const items: IShopItem[] = [createShopItem({ id: '1', price: 500 })];

      const result = filterByMaxPrice(items, 100);
      expect(result).toHaveLength(0);
    });
  });
});
