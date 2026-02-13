/**
 * purchase-result.ts - 購入結果の型定義
 *
 * TASK-0088: features/shop/types作成
 *
 * domain/interfaces/shop-service.interface.tsから移行。
 * ショップ購入結果の型を定義する。
 */

/**
 * 購入結果
 * 購入処理の成否と詳細情報
 */
export interface IPurchaseResult {
  /** 購入成功フラグ */
  success: boolean;
  /** 購入したアイテムID */
  itemId: string;
  /** 残りゴールド */
  remainingGold: number;
  /** 残り在庫 */
  remainingStock: number;
  /** エラーメッセージ（失敗時） */
  errorMessage?: string;
}
