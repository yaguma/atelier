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

/**
 * カードタイプ
 */
export type CardType = 'gathering' | 'recipe' | 'enhance';

/**
 * カードタイプのアイコン定義
 */
export const CardTypeIcons: Record<CardType, string> = {
  gathering: '🌿',
  recipe: '📜',
  enhance: '⚡',
} as const;

/**
 * カードタイプのラベル定義
 */
export const CardTypeLabels: Record<CardType, string> = {
  gathering: '採取地カード',
  recipe: 'レシピカード',
  enhance: '強化カード',
} as const;

/**
 * カードレアリティ
 */
export type CardRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

/**
 * レアリティのカラー定義（数値形式 - Phaser用）
 */
export const RarityColors: Record<CardRarity, number> = {
  common: 0xaaaaaa,
  uncommon: 0x00aa00,
  rare: 0x0088ff,
  epic: 0xaa00ff,
  legendary: 0xffaa00,
} as const;

/**
 * レアリティのカラー定義（文字列形式 - CSS用）
 */
export const RarityColorStrings: Record<CardRarity, string> = {
  common: '#aaaaaa',
  uncommon: '#00aa00',
  rare: '#0088ff',
  epic: '#aa00ff',
  legendary: '#ffaa00',
} as const;

/**
 * レアリティのラベル定義
 */
export const RarityLabels: Record<CardRarity, string> = {
  common: 'コモン',
  uncommon: 'アンコモン',
  rare: 'レア',
  epic: 'エピック',
  legendary: 'レジェンダリー',
} as const;

/**
 * カード商品行のレイアウト
 */
export const CardItemRowLayout = {
  WIDTH: 560,
  HEIGHT: 80,
  ICON_X: 15,
  ICON_Y: 40,
  NAME_X: 50,
  NAME_Y: 20,
  EFFECT_X: 50,
  EFFECT_Y: 45,
  RARITY_X: 540,
  RARITY_Y: 25,
  RARITY_RADIUS: 8,
  PRICE_X: 480,
  PRICE_Y: 50,
} as const;

/**
 * カード詳細パネルのレイアウト
 */
export const CardDetailPanelLayout = {
  PREVIEW_Y: 100,
  NAME_Y: 200,
  TYPE_Y: 230,
  DESCRIPTION_Y: 260,
  DESCRIPTION_LINE_SPACING: 4,
  PRICE_Y: 360,
  WARNING_Y: 385,
} as const;

/**
 * カードプレビューのサイズ
 */
export const CardPreviewSize = {
  WIDTH: 100,
  HEIGHT: 140,
  BORDER_RADIUS: 8,
  ICON_SIZE: 32,
  NAME_MAX_LENGTH: 8,
} as const;

/**
 * ローディングオーバーレイの設定
 */
export const LoadingOverlayConfig = {
  SPINNER_RADIUS: 30,
  SPINNER_LINE_WIDTH: 4,
  SPINNER_ANGLE: 0.75,
  MESSAGE_OFFSET_Y: 60,
  ROTATION_DURATION: 1000,
  DEPTH: 200,
} as const;

/**
 * 購入アニメーションの設定
 */
export const PurchaseAnimationConfig = {
  DURATION: 500,
  EASE: 'Power2.easeIn',
  END_X_OFFSET: 100,
  END_Y: 100,
  END_SCALE: 0.5,
  END_ALPHA: 0,
  DEPTH: 100,
} as const;

/**
 * 素材品質の型
 */
export type MaterialQuality = 'low' | 'medium' | 'high';

/**
 * 素材品質の閾値
 */
export const MaterialQualityThresholds = {
  HIGH_MIN: 80,
  MEDIUM_MIN: 50,
} as const;

/**
 * 素材品質のカラー定義（数値形式 - Phaser用）
 */
export const MaterialQualityColors: Record<MaterialQuality, number> = {
  low: 0xaaaaaa,
  medium: 0x00aaff,
  high: 0xffaa00,
} as const;

/**
 * 素材品質のカラー定義（文字列形式 - CSS用）
 */
export const MaterialQualityColorStrings: Record<MaterialQuality, string> = {
  low: '#aaaaaa',
  medium: '#00aaff',
  high: '#ffaa00',
} as const;

/**
 * 素材品質のラベル定義
 */
export const MaterialQualityLabels: Record<MaterialQuality, string> = {
  low: '低品質',
  medium: '中品質',
  high: '高品質',
} as const;

/**
 * 素材商品行のレイアウト
 */
export const MaterialItemRowLayout = {
  WIDTH: 560,
  HEIGHT: 70,
  ICON_BG_X: 10,
  ICON_BG_Y: 10,
  ICON_BG_SIZE: 50,
  NAME_X: 75,
  NAME_Y: 15,
  CATEGORY_X: 75,
  CATEGORY_Y: 40,
  UNIT_PRICE_X: 350,
  UNIT_PRICE_Y: 25,
  STOCK_X: 480,
  STOCK_Y: 25,
} as const;

/**
 * 素材詳細パネルのレイアウト
 */
export const MaterialDetailPanelLayout = {
  NAME_Y: 30,
  QUALITY_Y: 60,
  CATEGORY_Y: 85,
  DESCRIPTION_X: 20,
  DESCRIPTION_Y: 120,
  QUANTITY_SELECTOR_Y: 220,
  TOTAL_Y: 300,
} as const;

/**
 * 数量セレクタのレイアウト
 */
export const QuantitySelectorLayout = {
  LABEL_OFFSET_Y: -30,
  BUTTON_RADIUS: 20,
  MINUS_X: -60,
  PLUS_X: 60,
  MAX_BUTTON_Y: 50,
  MAX_BUTTON_WIDTH: 80,
  MAX_BUTTON_HEIGHT: 30,
  QUANTITY_FONT_SIZE: 24,
} as const;

/**
 * 数量セレクタの設定
 */
export const QuantitySelectorConfig = {
  MIN_QUANTITY: 1,
  MAX_QUANTITY: 99,
  INFINITE_STOCK: -1,
} as const;

/**
 * アーティファクト商品行のレイアウト
 */
export const ArtifactItemRowLayout = {
  WIDTH: 560,
  HEIGHT: 90,
  ICON_BG_X: 10,
  ICON_BG_Y: 10,
  ICON_BG_WIDTH: 70,
  ICON_BG_HEIGHT: 70,
  ICON_CENTER_X: 45,
  ICON_CENTER_Y: 45,
  NAME_X: 95,
  NAME_Y: 15,
  RARITY_X: 95,
  RARITY_Y: 40,
  EFFECT_X: 95,
  EFFECT_Y: 60,
  PRICE_X: 480,
  PRICE_Y: 35,
} as const;

/**
 * アーティファクト詳細パネルのレイアウト
 */
export const ArtifactDetailPanelLayout = {
  NAME_Y: 30,
  RARITY_Y: 60,
  EFFECTS_LABEL_X: 20,
  EFFECTS_LABEL_Y: 100,
  EFFECTS_ITEM_X: 30,
  EFFECTS_START_Y: 125,
  EFFECTS_LINE_HEIGHT: 5,
  REQUIREMENT_LABEL_OFFSET_Y: 10,
  REQUIREMENT_TEXT_OFFSET_Y: 25,
  PRICE_Y: 350,
} as const;

/**
 * アーティファクトレアリティのラベル定義（星付き）
 */
export const ArtifactRarityLabels: Record<CardRarity, string> = {
  common: '★ コモン',
  uncommon: '★★ アンコモン',
  rare: '★★★ レア',
  epic: '★★★★ エピック',
  legendary: '★★★★★ レジェンダリー',
} as const;

/**
 * アーティファクトのアイコン
 */
export const ArtifactIcon = '🏆' as const;

/**
 * 在庫表示の設定
 */
export const StockDisplayConfig = {
  INFINITE_SYMBOL: '∞',
  STOCK_PREFIX: '残',
  OUT_OF_STOCK_COLOR: '#ff4444',
  IN_STOCK_COLOR: '#aaaaaa',
} as const;
