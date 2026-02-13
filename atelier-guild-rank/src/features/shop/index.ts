/**
 * Shop Feature - ショップ機能公開API
 *
 * TASK-0090: features/shop/index.ts公開API作成
 *
 * @description
 * ショップ機能の公開APIを定義。
 * types、services、componentsを一元的にエクスポートする。
 * 外部からのアクセスはこのindex.ts経由で行うこと。
 */

// =============================================================================
// Types
// =============================================================================

export type { IPurchaseResult, IShopItem, IShopService, ShopItemType } from './types';

// =============================================================================
// Services（純粋関数）
// =============================================================================

export type { CanPurchaseResult, PurchaseError, PurchaseInput } from './services';
export {
  canPurchase,
  executePurchase,
  filterByMaxPrice,
  filterByType,
  getAvailableItems,
  isRankSufficient,
} from './services';

// =============================================================================
// Components
// =============================================================================

export { ShopHeader, ShopItemCard, ShopItemGrid } from './components';
