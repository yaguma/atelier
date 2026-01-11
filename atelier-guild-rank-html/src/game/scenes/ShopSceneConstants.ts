/**
 * ShopScene レイアウト定数
 *
 * ショップシーンで使用するレイアウト定数を一元管理する。
 * 設計文書: docs/tasks/atelier-guild-rank-phaser/TASK-0240.md
 */

/**
 * ショップシーンのレイアウト定数
 */
export const ShopSceneLayout = {
  // 画面サイズ
  SCREEN_WIDTH: 1024,
  SCREEN_HEIGHT: 768,

  // ヘッダー（所持金表示）
  HEADER: {
    X: 0,
    Y: 0,
    WIDTH: 1024,
    HEIGHT: 60,
  },

  // カテゴリタブ
  CATEGORY_TAB: {
    X: 50,
    Y: 80,
    WIDTH: 924,
    HEIGHT: 50,
    TAB_WIDTH: 150,
    TAB_HEIGHT: 40,
  },

  // 商品リスト
  ITEM_LIST: {
    X: 50,
    Y: 150,
    WIDTH: 600,
    HEIGHT: 500,
  },

  // 商品詳細・購入エリア
  DETAIL_AREA: {
    X: 670,
    Y: 150,
    WIDTH: 304,
    HEIGHT: 400,
  },

  // 購入確認ボタン
  PURCHASE_BUTTON: {
    X: 770,
    Y: 570,
    WIDTH: 200,
    HEIGHT: 50,
  },

  // 戻るボタン
  BACK_BUTTON: {
    X: 50,
    Y: 680,
    WIDTH: 120,
    HEIGHT: 40,
  },
} as const;

/**
 * ショップカテゴリの型
 */
export type ShopCategory = 'cards' | 'materials' | 'artifacts';

/**
 * ショップカテゴリ定義
 */
export const ShopCategories: ReadonlyArray<{ key: ShopCategory; label: string }> = [
  { key: 'cards', label: 'カード' },
  { key: 'materials', label: '素材' },
  { key: 'artifacts', label: 'アーティファクト' },
] as const;

/**
 * ショップカテゴリラベル
 */
export const ShopCategoryLabels: Record<ShopCategory, string> = {
  cards: 'カード',
  materials: '素材',
  artifacts: 'アーティファクト',
} as const;

/**
 * ショップ関連カラー定数
 */
export const ShopColors = {
  // 価格表示
  priceNormal: '#ffffff',
  priceCannotAfford: '#ff4444',
  priceAffordable: '#00ff00',
} as const;
