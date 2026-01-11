/**
 * GameOverSceneレイアウト定数
 *
 * TASK-0247: GameOverScene実装
 * ゲームオーバーシーンのレイアウト定数と型定義。
 */

/**
 * GameOverSceneレイアウト定数
 */
export const GameOverSceneLayout = {
  // 画面サイズ
  SCREEN_WIDTH: 1024,
  SCREEN_HEIGHT: 768,

  // センター位置
  CENTER_X: 512,
  CENTER_Y: 384,

  // ゲームオーバーテキスト
  GAME_OVER_TEXT: {
    Y: -200,
    FONT_SIZE: '64px',
  },

  // 失敗理由表示
  REASON_AREA: {
    Y: -80,
    MAX_WIDTH: 600,
  },

  // 統計パネル
  STATS_PANEL: {
    Y: 60,
    WIDTH: 400,
    HEIGHT: 180,
    BORDER_RADIUS: 8,
  },

  // ボタンエリア
  BUTTON_AREA: {
    Y: 220,
    BUTTON_WIDTH: 180,
    BUTTON_HEIGHT: 50,
    BUTTON_SPACING: 100,
  },
} as const;

/**
 * ゲームオーバー理由の種類
 */
export type GameOverReasonType = 'deadline' | 'bankruptcy' | 'rankDown' | 'other';

/**
 * ゲームオーバー理由情報
 */
export interface GameOverReason {
  type: GameOverReasonType;
  title: string;
  description: string;
  icon: string;
}

/**
 * ゲームオーバー統計情報
 */
export interface GameOverStats {
  finalDay: number;
  finalRank: string;
  totalQuests: number;
  totalAlchemy: number;
}

/**
 * 理由パターン別のデフォルト情報
 */
export const GameOverReasonDefaults: Record<GameOverReasonType, Omit<GameOverReason, 'type'>> = {
  deadline: {
    title: '期限切れ',
    description: '指定された日数内にS級に到達できませんでした。',
    icon: '⏰',
  },
  bankruptcy: {
    title: '資金不足',
    description: '活動に必要な資金が底をつきました。',
    icon: '💸',
  },
  rankDown: {
    title: 'ランク降格',
    description: 'ギルドからの除名処分を受けました。',
    icon: '📉',
  },
  other: {
    title: 'ゲームオーバー',
    description: 'ゲームが終了しました。',
    icon: '❌',
  },
} as const;

/**
 * ゲームオーバー色設定
 */
export const GameOverColors = {
  /** 背景色（暗い赤） */
  background: 0x1a0000,
  /** 霧エフェクト色 */
  fog: 0x330000,
  /** ゲームオーバーテキスト色 */
  text: '#ff4444',
  /** 失敗理由テキスト色 */
  reasonText: '#ff8888',
  /** 統計パネル背景 */
  statsBackground: 0x330000,
  /** 統計パネル枠線 */
  statsBorder: 0xff4444,
  /** ラベル色 */
  labelColor: '#888888',
  /** 値色 */
  valueColor: '#ffffff',
  /** ビネット色 */
  vignette: 0xff0000,
} as const;

/**
 * アニメーション設定
 */
export const GameOverAnimations = {
  /** フェードイン時間（ms） */
  FADE_IN_DURATION: 500,
  /** 画面揺れ遅延（ms） */
  SHAKE_DELAY: 100,
  /** 画面揺れ時間（ms） */
  SHAKE_DURATION: 300,
  /** 画面揺れ強度 */
  SHAKE_INTENSITY: 0.02,
  /** 灰パーティクル数 */
  ASH_PARTICLE_COUNT: 30,
  /** 灰の落下最小時間（ms） */
  ASH_FALL_MIN_DURATION: 3000,
  /** 灰の落下最大時間（ms） */
  ASH_FALL_MAX_DURATION: 6000,
} as const;
