/**
 * 手札レイアウト定数
 *
 * 手札表示に関するレイアウト設定と定数を定義する。
 * 設計文書: docs/tasks/atelier-guild-rank-phaser/TASK-0195.md
 */

/**
 * 手札のレイアウト設定
 */
export const HandLayout = {
  // 位置（画面下部中央）
  /** X座標（画面中央） */
  X: 640,
  /** Y座標（画面下部） */
  Y: 650,

  // 表示設定
  /** 最大表示カード数 */
  MAX_VISIBLE_CARDS: 7,
  /** カード間隔（水平配置時） */
  CARD_SPACING: 100,
  /** カード重なり（扇形配置時） */
  CARD_OVERLAP: 30,

  // 扇形配置
  /** 扇形の角度範囲（度） */
  FAN_ANGLE_RANGE: 30,
  /** 扇形の半径 */
  FAN_RADIUS: 400,

  // アニメーション
  /** カード移動アニメーション時間（ミリ秒） */
  CARD_MOVE_DURATION: 200,
  /** カードホバー時のY方向オフセット（負の値で上に移動） */
  CARD_HOVER_OFFSET: -30,
} as const;

/**
 * 手札レイアウトタイプ
 */
export type HandLayoutType = 'horizontal' | 'fan';
