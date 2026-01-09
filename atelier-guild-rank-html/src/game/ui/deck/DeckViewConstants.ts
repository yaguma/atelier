/**
 * DeckView定数
 *
 * デッキビューUIのレイアウト・色定義
 */

/**
 * レイアウト定数
 */
export const DeckViewLayout = {
  // 位置（画面左下）
  X: 100,
  Y: 550,

  // カードサイズ
  CARD_WIDTH: 80,
  CARD_HEIGHT: 120,

  // スタック表現
  STACK_OFFSET: 2,
  MAX_VISIBLE_STACK: 5,

  // アニメーション
  DRAW_DURATION: 300,
  SHUFFLE_DURATION: 500,
} as const;

/**
 * 色定数
 */
export const DeckColors = {
  CARD_BACK: 0x2a3a5a,
  CARD_BORDER: 0x4a5a7a,
  CARD_PATTERN: 0x3a4a6a,
  COUNT_BG: 0x1a1a2e,
} as const;
