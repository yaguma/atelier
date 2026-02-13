/**
 * shop-filters.ts - ショップアイテムフィルタリングの純粋関数
 *
 * TASK-0089: features/shop/services作成
 *
 * ショップアイテムの絞り込みを行う純粋関数群。
 * application/services/shop-service.tsのgetAvailableItemsロジックを抽出。
 */

import type { GuildRank } from '@shared/types';
import type { IShopItem, ShopItemType } from '../types';
import { isRankSufficient } from './purchase-validator';

/**
 * 購入可能なアイテムを絞り込む（純粋関数）
 *
 * ランクで解放されたアイテムかつ在庫ありのアイテムを返す。
 * 入力配列は変更しない。
 *
 * @param items - ショップアイテム一覧
 * @param currentRank - 現在のギルドランク
 * @returns 購入可能なアイテムの配列
 */
export function getAvailableItems(
  items: readonly IShopItem[],
  currentRank: GuildRank,
): IShopItem[] {
  return items.filter((item) => {
    if (item.stock === 0) {
      return false;
    }
    return isRankSufficient(currentRank, item.unlockRank);
  });
}

/**
 * アイテムタイプでフィルタリングする（純粋関数）
 *
 * @param items - ショップアイテム一覧
 * @param type - フィルタするアイテムタイプ
 * @returns 指定タイプのアイテムの配列
 */
export function filterByType(items: readonly IShopItem[], type: ShopItemType): IShopItem[] {
  return items.filter((item) => item.type === type);
}

/**
 * 価格範囲でフィルタリングする（純粋関数）
 *
 * @param items - ショップアイテム一覧
 * @param maxPrice - 最大価格
 * @returns 指定価格以下のアイテムの配列
 */
export function filterByMaxPrice(items: readonly IShopItem[], maxPrice: number): IShopItem[] {
  return items.filter((item) => item.price <= maxPrice);
}
