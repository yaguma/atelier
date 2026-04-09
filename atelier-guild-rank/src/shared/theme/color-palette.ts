/**
 * Color Palette - 月下の錬金工房
 * Issue #457: UI刷新 Phase 3
 *
 * @remarks
 * ダーク基調＋深紫＋群青＋ゴールドアクセントの新パレット。
 * 生の色値（0xRRGGBB）のみを定義する純粋な定数モジュール。
 * 用途別のエイリアスは `semantic-colors.ts` を参照。
 */

/** Surface 階層（背景） */
export const Surface = {
  base: 0x0e1118,
  raised: 0x161b24,
  panel: 0x1e2532,
  inset: 0x242c3b,
} as const;

/** Text 階層 */
export const Text = {
  primary: 0xf2f4f8,
  secondary: 0xb8c0cc,
  muted: 0x7a8496,
} as const;

/** Brand カラー */
export const Brand = {
  primary: 0x6b4bd6, // アメジスト
  secondary: 0x2d6cdf, // 群青
  accent: 0xf3a93c, // ゴールド
} as const;

/** Status カラー */
export const Status = {
  success: 0x3fae6a,
  warning: 0xe5a13b,
  danger: 0xe5484d,
  info: 0x3fa3d6,
} as const;

/** Quality カラー（D..S） */
export const Quality = {
  D: 0x7a8496,
  C: 0xb8c0cc,
  B: 0x3fae6a,
  A: 0x2d6cdf,
  S: 0xf3a93c,
} as const;

/** Rank カラー（G..S） */
export const Rank = {
  G: 0x7a8496,
  F: 0xa3b1bf,
  E: 0x4fc3a1,
  D: 0x3fae6a,
  C: 0x3fa3d6,
  B: 0x2d6cdf,
  A: 0x9b7be8,
  S: 0xf3a93c,
} as const;

export const ColorPalette = {
  surface: Surface,
  text: Text,
  brand: Brand,
  status: Status,
  quality: Quality,
  rank: Rank,
} as const;

export type SurfaceKey = keyof typeof Surface;
export type TextKey = keyof typeof Text;
export type BrandKey = keyof typeof Brand;
export type StatusKey = keyof typeof Status;
export type QualityKey = keyof typeof Quality;
export type RankKey = keyof typeof Rank;
