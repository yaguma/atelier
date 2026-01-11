/**
 * RankUpSceneレイアウト定数
 *
 * TASK-0244: RankUpSceneレイアウト設計
 * 昇格試験シーンのレイアウト定数と型定義。
 */

/**
 * RankUpSceneレイアウト定数
 */
export const RankUpSceneLayout = {
  // 画面サイズ
  SCREEN_WIDTH: 1024,
  SCREEN_HEIGHT: 768,

  // ヘッダー（ランク情報）
  HEADER: {
    X: 0,
    Y: 0,
    WIDTH: 1024,
    HEIGHT: 80,
  },

  // 試験タイトル・説明
  TITLE_AREA: {
    X: 50,
    Y: 100,
    WIDTH: 924,
    HEIGHT: 100,
  },

  // 試験要件表示
  REQUIREMENTS_AREA: {
    X: 50,
    Y: 220,
    WIDTH: 450,
    HEIGHT: 300,
  },

  // 現在の達成状況
  PROGRESS_AREA: {
    X: 524,
    Y: 220,
    WIDTH: 450,
    HEIGHT: 300,
  },

  // 報酬表示
  REWARDS_AREA: {
    X: 50,
    Y: 540,
    WIDTH: 924,
    HEIGHT: 120,
  },

  // ボタンエリア
  BUTTON_AREA: {
    X: 0,
    Y: 680,
    WIDTH: 1024,
    HEIGHT: 88,
  },
} as const;

/**
 * 試験要件の種類
 */
export type RankExamRequirementType = 'quest' | 'alchemy' | 'gathering' | 'gold' | 'item';

/**
 * 試験要件
 */
export interface RankExamRequirement {
  type: RankExamRequirementType;
  description: string;
  targetValue: number;
  currentValue: number;
}

/**
 * 報酬の種類
 */
export type RankUpRewardType = 'card' | 'artifact' | 'unlock';

/**
 * 昇格報酬
 */
export interface RankUpReward {
  type: RankUpRewardType;
  name: string;
  description?: string;
}

/**
 * 試験要件アイコンマッピング
 */
export const RequirementIcons: Record<RankExamRequirementType, string> = {
  quest: '📋',
  alchemy: '⚗️',
  gathering: '🌿',
  gold: '💰',
  item: '📦',
} as const;

/**
 * 報酬アイコンマッピング
 */
export const RewardIcons: Record<RankUpRewardType, string> = {
  card: '🃏',
  artifact: '🏆',
  unlock: '🔓',
} as const;

/**
 * 進捗バーの色設定
 */
export const ProgressBarColors = {
  /** 背景色 */
  background: 0x333344,
  /** 未達成時の色 */
  incomplete: 0x0088ff,
  /** 達成時の色 */
  complete: 0x00ff00,
  /** 警告色（黄色） */
  warning: 0xffcc00,
} as const;

/**
 * 進捗バーレイアウト
 */
export const OverallProgressBarLayout = {
  X: 30,
  Y: 60,
  WIDTH: 390,
  HEIGHT: 30,
  BORDER_RADIUS: 15,
} as const;

/**
 * 個別進捗バーレイアウト
 */
export const IndividualProgressBarLayout = {
  BAR_X: 150,
  BAR_WIDTH: 200,
  BAR_HEIGHT: 20,
  BORDER_RADIUS: 10,
  LABEL_WIDTH: 140,
  VALUE_X: 360,
} as const;
