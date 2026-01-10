/**
 * AlchemyContainerレイアウト定数
 *
 * TASK-0227: AlchemyContainer設計
 * 調合フェーズコンテナのレイアウト定数を定義する。
 *
 * 設計文書: docs/tasks/atelier-guild-rank-phaser/TASK-0227.md
 */

/**
 * AlchemyContainerレイアウト定数
 */
export const AlchemyContainerLayout = {
  // 全体サイズ
  WIDTH: 800,
  HEIGHT: 550,
  PADDING: 20,

  // タイトル
  TITLE_Y: 20,

  // 手札エリア（レシピカード）
  HAND_AREA: {
    X: 20,
    Y: 70,
    WIDTH: 500,
    HEIGHT: 160,
    LABEL_Y_OFFSET: -20,
  },

  // 素材選択エリア
  MATERIAL_AREA: {
    X: 20,
    Y: 260,
    WIDTH: 500,
    HEIGHT: 150,
    LABEL_Y_OFFSET: -20,
  },

  // プレビューパネル
  PREVIEW_PANEL: {
    X: 540,
    Y: 70,
    WIDTH: 240,
    HEIGHT: 350,
  },

  // アクションエリア
  ACTION_AREA: {
    Y: 460,
    BUTTON_SPACING: 20,
  },
} as const;

/**
 * AlchemyContainer用テキスト定数
 */
export const AlchemyContainerTexts = {
  TITLE: '⚗️ 調合フェーズ',
  RECIPE_LABEL: '📋 レシピを選択',
  MATERIAL_LABEL: '🧪 素材を選択',
  CRAFT_BUTTON: '⚗️ 調合する',
  SKIP_BUTTON: 'スキップ',
  RESET_BUTTON: '🔄 リセット',
  EMPTY_RECIPE: 'レシピカードがありません',
  EMPTY_MATERIAL: '素材を選択してください',
} as const;

export type AlchemyContainerLayoutType = typeof AlchemyContainerLayout;
export type AlchemyContainerTextsType = typeof AlchemyContainerTexts;
