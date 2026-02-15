/**
 * Shop Types（後方互換性用再エクスポート）
 *
 * @description
 * 実体は scenes/components/shop/types.ts に移動済み。
 * 後方互換性のため再エクスポートを提供する。
 *
 * 新規コードでは @scenes/components/shop を使用すること。
 */
export type {
  IShopItem,
  OnBackClickCallback,
  OnItemSelectCallback,
  OnPurchaseCallback,
  ShopHeaderConfig,
  ShopItemCardConfig,
  ShopItemGridConfig,
} from '@scenes/components/shop/types';
