/**
 * shop-service.interface.ts - ShopService関連型の後方互換性shim
 *
 * TASK-0088: features/shop/types作成
 *
 * @description
 * 型定義はfeatures/shop/types/に移行済み。
 * 既存のインポートパスを維持するための再エクスポート。
 *
 * @deprecated @features/shop/types からインポートしてください
 */

export type {
  IPurchaseResult,
  IShopItem,
  IShopService,
  ShopItemType,
} from '@features/shop/types';
