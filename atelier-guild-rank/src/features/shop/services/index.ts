/**
 * Shop Services - ショップ機能サービスのバレルエクスポート
 *
 * TASK-0089: features/shop/services作成
 *
 * 全て副作用のない純粋関数として実装。
 * 実際の状態変更はImperative Shell（シーンやサービス）が担当する。
 */

// --- 購入処理 ---
export type { PurchaseInput } from './execute-purchase';
export { executePurchase } from './execute-purchase';

// --- 購入可否判定 ---
export type { CanPurchaseResult, PurchaseError } from './purchase-validator';
export { canPurchase, isRankSufficient } from './purchase-validator';

// --- フィルタリング ---
export {
  filterByMaxPrice,
  filterByType,
  getAvailableItems,
} from './shop-filters';
