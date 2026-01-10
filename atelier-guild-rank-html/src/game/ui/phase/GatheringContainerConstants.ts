/**
 * GatheringContainerレイアウト定数
 *
 * TASK-0222: GatheringContainer設計
 * 採取フェーズコンテナのレイアウト定数を定義する
 */

export const GatheringContainerLayout = {
  // 全体サイズ
  WIDTH: 800,
  HEIGHT: 500,
  PADDING: 20,

  // 採取地カードエリア
  CARD_AREA: {
    X: 20,
    Y: 60,
    WIDTH: 220,
    HEIGHT: 350,
  },

  // 素材選択エリア
  MATERIAL_AREA: {
    X: 260,
    Y: 60,
    WIDTH: 380,
    HEIGHT: 350,
  },

  // サイドパネル（APコスト・アクション）
  SIDE_PANEL: {
    X: 660,
    Y: 60,
    WIDTH: 120,
    HEIGHT: 350,
  },

  // アクションボタンエリア
  ACTION_AREA: {
    Y: 430,
    BUTTON_SPACING: 20,
  },
} as const;
