/**
 * Color Palette - 水彩ファンタジースタイル
 * Issue #457: UI刷新 Phase 3
 * Issue #508: 水彩ファンタジースタイルへ更新
 *
 * @remarks
 * 水彩画のような柔らかさと絵本のような親しみやすさ。
 * クリーム・パステル基調＋草色＋ゴールデンベージュのパレット。
 * 生の色値（0xRRGGBB）のみを定義する純粋な定数モジュール。
 * 用途別のエイリアスは `semantic-colors.ts` を参照。
 */

/** Surface 階層（背景） — design-guide.md §2.1 */
export const Surface = {
  base: 0xfff8f0, // 温かみのあるオフホワイト
  raised: 0xffffff, // カード・パネル（ピュアホワイト）
  panel: 0xf5efe6, // サイドバー（やや暗めのクリーム）
  inset: 0xfdfaf5, // ヘッダー（薄いクリーム）
} as const;

/** Text 階層 — design-guide.md §2.3 */
export const Text = {
  primary: 0x3d3d3d, // 見出し・重要テキスト（コントラスト10.2:1）
  secondary: 0x5a5a5a, // 本文・説明（コントラスト6.8:1）
  muted: 0x8a8a8a, // 補助・ヒント（コントラスト3.5:1、非テキスト装飾用）
} as const;

/** Brand カラー — design-guide.md §2.2 */
export const Brand = {
  primary: 0x7bae7f, // 草色（錬金術のハーブ）
  secondary: 0xd4a76a, // ゴールデンベージュ（調合の琥珀）
  accent: 0xe8a87c, // コーラルピーチ
} as const;

/** Status カラー — design-guide.md §2.4 */
export const Status = {
  success: 0x6aaf6a,
  warning: 0xe0a84b,
  danger: 0xd46b6b,
  info: 0x6b9fcc,
} as const;

/** Quality カラー（D..S）— design-guide.md §2.6 */
export const Quality = {
  D: 0xa0a0a0, // グレー
  C: 0xffffff, // 白
  B: 0x6aaf6a, // グリーン（brand.primaryに寄せる）
  A: 0x6b9fcc, // ブルー（status.infoに寄せる）
  S: 0xe0a84b, // ゴールド（status.warningに寄せる）
} as const;

/** Rank カラー（G..S） */
export const Rank = {
  G: 0xa0a0a0,
  F: 0xb0b0b0,
  E: 0x8cc084, // リーフグリーン
  D: 0x6aaf6a,
  C: 0x6b9fcc,
  B: 0x5b8cb8,
  A: 0xb8a9d4, // ラベンダー
  S: 0xe0a84b,
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
