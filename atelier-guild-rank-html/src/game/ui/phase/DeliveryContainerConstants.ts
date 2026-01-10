/**
 * DeliveryContainerレイアウト定数
 *
 * TASK-0232: DeliveryContainer設計
 * 納品フェーズコンテナのレイアウト定数を定義する。
 *
 * 設計文書: docs/tasks/atelier-guild-rank-phaser/TASK-0232.md
 */

/**
 * DeliveryContainerレイアウト定数
 */
export const DeliveryContainerLayout = {
  // 全体サイズ
  WIDTH: 800,
  HEIGHT: 500,
  PADDING: 20,

  // 受注依頼リストエリア
  QUEST_LIST_AREA: {
    X: 20,
    Y: 60,
    WIDTH: 350,
    HEIGHT: 350,
    ITEM_HEIGHT: 70,
    ITEM_SPACING: 10,
  },

  // 依頼詳細パネル
  DETAIL_PANEL: {
    X: 390,
    Y: 60,
    WIDTH: 390,
    HEIGHT: 350,
  },

  // アクションエリア
  ACTION_AREA: {
    Y: 430,
    BUTTON_WIDTH: 140,
    BUTTON_HEIGHT: 36,
    BUTTON_SPACING: 20,
  },

  // 納品可能インジケーター
  DELIVERABLE_INDICATOR_SIZE: 16,
} as const;

/**
 * DeliveryContainerカラー定数
 */
export const DeliveryContainerColors = {
  // 納品可能アイテム背景
  DELIVERABLE_BG: 0x2a4a2a,
  DELIVERABLE_BORDER: 0x4a8a4a,
  DELIVERABLE_HOVER_BG: 0x3a5a3a,
  DELIVERABLE_HOVER_BORDER: 0x5aaa5a,

  // 納品不可アイテム背景
  UNDELIVERABLE_BG: 0x2a2a4a,
  UNDELIVERABLE_BORDER: 0x4a4a6a,
  UNDELIVERABLE_HOVER_BG: 0x3a3a5a,
  UNDELIVERABLE_HOVER_BORDER: 0x5a5a7a,

  // 選択状態
  SELECTED_ALPHA: 0.3,
  NORMAL_ALPHA: 0.9,
} as const;
