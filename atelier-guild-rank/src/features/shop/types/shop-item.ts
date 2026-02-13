/**
 * shop-item.ts - ショップアイテム関連の型定義
 *
 * TASK-0088: features/shop/types作成
 *
 * domain/interfaces/shop-service.interface.tsから移行。
 * ショップアイテムとその関連型を定義する。
 */

import type { GuildRank } from '@shared/types';

/**
 * ショップアイテムタイプ
 */
export type ShopItemType = 'card' | 'material' | 'artifact';

/**
 * ショップアイテム
 * ショップで販売される商品の情報
 */
export interface IShopItem {
  /** ショップアイテムの一意識別子 */
  id: string;
  /** アイテムタイプ */
  type: ShopItemType;
  /** 実際のアイテムID（カードID、素材ID、アーティファクトID） */
  itemId: string;
  /** 表示名 */
  name: string;
  /** 価格 */
  price: number;
  /** 在庫（-1は無制限） */
  stock: number;
  /** 解放ランク */
  unlockRank: GuildRank;
  /** 説明 */
  description: string;
}
