/**
 * MainSceneレイアウト定数
 *
 * TASK-0235: MainScene基本レイアウト実装
 * メイン画面のレイアウト定数を定義する。
 *
 * 設計文書: docs/design/atelier-guild-rank-phaser/ui-design/overview.md
 */

/**
 * MainSceneレイアウト定数
 */
export const MainSceneLayout = {
  // 画面サイズ
  SCREEN_WIDTH: 1024,
  SCREEN_HEIGHT: 768,

  // ヘッダーエリア
  HEADER: {
    X: 0,
    Y: 0,
    WIDTH: 1024,
    HEIGHT: 60,
  },

  // サイドバーエリア（右側）
  SIDEBAR: {
    X: 824,
    Y: 60,
    WIDTH: 200,
    HEIGHT: 658, // 768 - 60 (header) - 50 (footer)
  },

  // メインエリア（フェーズコンテナ表示）
  MAIN_AREA: {
    X: 0,
    Y: 60,
    WIDTH: 824,
    HEIGHT: 658,
  },

  // フッターエリア（フェーズインジケーター）
  FOOTER: {
    X: 0,
    Y: 718,
    WIDTH: 824,
    HEIGHT: 50,
  },

  // フェーズコンテナ配置
  PHASE_CONTAINER: {
    X: 12,
    Y: 70,
    WIDTH: 800,
    HEIGHT: 500,
  },

  // 手札エリア（メインエリア下部）
  HAND_AREA: {
    X: 50,
    Y: 580,
    WIDTH: 700,
    HEIGHT: 180,
  },

  // デッキ表示（サイドバー内）
  DECK_AREA: {
    X: 850,
    Y: 550,
    WIDTH: 150,
    HEIGHT: 100,
  },
} as const;

/**
 * MainSceneのフェーズ一覧
 */
export const MainScenePhases = [
  'quest-accept',
  'gathering',
  'alchemy',
  'delivery',
] as const;

/**
 * フェーズ型
 */
export type MainScenePhase = (typeof MainScenePhases)[number];

/**
 * フェーズ表示名
 */
export const MainScenePhaseLabels: Record<MainScenePhase, string> = {
  'quest-accept': '依頼受注',
  gathering: '採取',
  alchemy: '調合',
  delivery: '納品',
} as const;
