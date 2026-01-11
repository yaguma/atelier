/**
 * GameClearSceneレイアウト定数
 *
 * TASK-0248: GameClearScene実装
 * ゲームクリアシーンのレイアウト定数と型定義。
 */

/**
 * GameClearSceneレイアウト定数
 */
export const GameClearSceneLayout = {
  // 画面サイズ
  SCREEN_WIDTH: 1024,
  SCREEN_HEIGHT: 768,

  // センター位置
  CENTER_X: 512,
  CENTER_Y: 384,

  // コングラチュレーションテキスト
  CLEAR_TEXT: {
    Y: -220,
    FONT_SIZE: '48px',
  },

  // サブタイトル
  SUB_TEXT: {
    Y: -160,
    FONT_SIZE: '24px',
  },

  // トロフィーエリア
  TROPHY_AREA: {
    Y: -60,
    GLOW_RADIUS: 60,
    ICON_SIZE: '64px',
  },

  // 統計パネル
  STATS_PANEL: {
    Y: 80,
    WIDTH: 500,
    HEIGHT: 140,
    BORDER_RADIUS: 8,
  },

  // レアアイテムエリア
  RARE_ITEMS_AREA: {
    Y: 170,
    ITEM_SIZE: 50,
    ITEM_SPACING: 60,
    MAX_DISPLAY: 5,
  },

  // プレイ時間表示
  PLAY_TIME: {
    Y: 210,
    FONT_SIZE: '14px',
  },

  // ボタンエリア
  BUTTON_AREA: {
    Y: 260,
    BUTTON_WIDTH: 200,
    BUTTON_HEIGHT: 50,
  },
} as const;

/**
 * ゲームクリア統計情報
 */
export interface GameClearStats {
  clearDay: number;
  finalRank: string;
  totalQuests: number;
  totalAlchemy: number;
  totalGold: number;
  rareItems: string[];
  playTime: number;
}

/**
 * ゲームクリア色設定
 */
export const GameClearColors = {
  /** 背景グラデーション開始色 */
  backgroundStart: { r: 10, g: 10, b: 30 },
  /** 背景グラデーション終了色 */
  backgroundEnd: { r: 30, g: 40, b: 80 },
  /** クリアテキスト色 */
  text: '#ffcc00',
  /** サブテキスト色 */
  subText: '#ffffff',
  /** 統計パネル背景 */
  statsBackground: 0x000033,
  /** 統計パネル枠線 */
  statsBorder: 0xffcc00,
  /** ラベル色 */
  labelColor: '#888888',
  /** 値色 */
  valueColor: '#ffffff',
  /** トロフィー光彩 */
  trophyGlow: 0xffcc00,
  /** レアアイテム背景 */
  rareItemBackground: 0xffaa00,
  /** 星色 */
  starColor: 0xffffff,
  /** 紙吹雪色 */
  confettiColors: [0xffcc00, 0xff6600, 0x00ff00, 0x00ffff, 0xff00ff, 0xffffff],
} as const;

/**
 * アニメーション設定
 */
export const GameClearAnimations = {
  /** フェードイン時間（ms） */
  FADE_IN_DURATION: 800,
  /** フェードイン遅延（ms） */
  FADE_IN_DELAY: 500,
  /** トロフィー光彩アニメーション時間（ms） */
  TROPHY_GLOW_DURATION: 1500,
  /** 星の数 */
  STAR_COUNT: 100,
  /** 星の瞬きの最小時間（ms） */
  STAR_TWINKLE_MIN_DURATION: 1000,
  /** 星の瞬きの最大時間（ms） */
  STAR_TWINKLE_MAX_DURATION: 3000,
  /** 紙吹雪の数 */
  CONFETTI_COUNT: 100,
  /** 紙吹雪の落下最小時間（ms） */
  CONFETTI_FALL_MIN_DURATION: 3000,
  /** 紙吹雪の落下最大時間（ms） */
  CONFETTI_FALL_MAX_DURATION: 5000,
  /** 紙吹雪の遅延最大（ms） */
  CONFETTI_DELAY_MAX: 2000,
} as const;
