/**
 * Shop関連型定義
 * TASK-0056 ShopSceneリファクタリング
 *
 * @description
 * ShopScene関連コンポーネントで使用する型定義
 */

/**
 * ショップアイテムの型
 * 商品情報を表すインターフェース
 */
export interface IShopItem {
  /** アイテムID */
  id: string;
  /** アイテム名 */
  name: string;
  /** アイテムタイプ（カード、素材、アーティファクト） */
  type: 'card' | 'material' | 'artifact';
  /** 説明文 */
  description: string;
  /** 価格 */
  price: number;
  /** 在庫数（-1は無制限） */
  stock: number;
}

/**
 * 購入コールバック型
 * @param itemId - 購入するアイテムのID
 */
export type OnPurchaseCallback = (itemId: string) => void;

/**
 * 戻るボタンコールバック型
 */
export type OnBackClickCallback = () => void;

/**
 * アイテム選択コールバック型
 * @param item - 選択されたアイテム
 */
export type OnItemSelectCallback = (item: IShopItem) => void;

/**
 * ShopHeader設定
 */
export interface ShopHeaderConfig {
  /** 初期所持金 */
  initialGold: number;
  /** 戻るボタンクリック時のコールバック */
  onBackClick: OnBackClickCallback;
}

/**
 * ShopItemCard設定
 */
export interface ShopItemCardConfig {
  /** 表示する商品 */
  item: IShopItem;
  /** X座標 */
  x: number;
  /** Y座標 */
  y: number;
  /** 現在の所持金 */
  currentGold: number;
  /** 購入時のコールバック */
  onPurchase: OnPurchaseCallback;
}

/**
 * ShopItemGrid設定
 */
export interface ShopItemGridConfig {
  /** 表示するアイテムリスト */
  items: IShopItem[];
  /** アイテム選択時のコールバック */
  onItemSelect: OnItemSelectCallback;
  /** 購入時のコールバック（オプション） */
  onPurchase?: OnPurchaseCallback;
  /** 現在の所持金（オプション） */
  currentGold?: number;
}

// テスト用のエクスポート（型チェック用）
export const ShopHeaderConfig = {} as ShopHeaderConfig;
export const ShopItemCardConfig = {} as ShopItemCardConfig;
export const OnPurchaseCallback = (() => {}) as OnPurchaseCallback;
export const OnBackClickCallback = (() => {}) as OnBackClickCallback;
export const OnItemSelectCallback = (() => {}) as OnItemSelectCallback;
