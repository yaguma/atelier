/**
 * Shape tokens - radius / border / shadow
 * Issue #455: UI刷新 Phase 1
 * Issue #508: 水彩ファンタジースタイルへ更新（design-guide.md §4 準拠）
 */

/** 角丸トークン — design-guide.md §4.1 */
export const Radius = {
  xs: 2,
  sm: 6, // バッジ、タグ
  md: 12, // カード、パネル、入力欄
  lg: 18, // ボタン、ダイアログ
  xl: 24, // 大きなモーダル、トースト
  full: 9999, // ピル型ボタン、丸アイコン
} as const;

/** ボーダー幅トークン — design-guide.md §4.2 */
export const Border = {
  hairline: 1, // 後方互換
  thin: 1, // 区切り線、薄い枠
  regular: 2, // カード枠、パネル枠（標準）
  thick: 3, // フォーカスリング、選択状態
} as const;

/**
 * Shadow tokens — design-guide.md §4.3 準拠
 * Phaser はCSS box-shadow を直接使えないため、blur/offset/color を数値で保持する。
 * 利用側で glow/stroke に変換する想定。
 */
export const Shadow = {
  sm: { offsetX: 0, offsetY: 2, blur: 6, color: 0x000000, alpha: 0.08 },
  md: { offsetX: 0, offsetY: 4, blur: 12, color: 0x000000, alpha: 0.12 },
  lg: { offsetX: 0, offsetY: 8, blur: 24, color: 0x000000, alpha: 0.16 },
  glowFocus: { offsetX: 0, offsetY: 0, blur: 8, color: 0x7bae7f, alpha: 0.3 },
} as const;

export type RadiusKey = keyof typeof Radius;
export type BorderKey = keyof typeof Border;
export type ShadowKey = keyof typeof Shadow;
