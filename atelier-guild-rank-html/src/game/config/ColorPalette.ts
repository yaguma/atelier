/**
 * カラーパレット定義
 *
 * ゲーム内で使用する色を一元管理する。
 * Phaserは数値形式（0xRRGGBB）、CSSは文字列形式（#RRGGBB）を使用するため
 * 両方の形式を提供する。
 * 設計文書: docs/design/atelier-guild-rank-phaser/ui-design/overview.md
 */

/**
 * 基本カラーパレット（数値形式 - Phaser用）
 */
export const Colors = {
  // 背景色
  background: 0x1a1a2e,
  backgroundLight: 0x252542,
  backgroundDark: 0x0f0f1a,
  backgroundParchment: 0xf5f5dc, // 羊皮紙風ベージュ

  // テキスト色
  textPrimary: 0xffffff,
  textSecondary: 0xe0e0e0,
  textMuted: 0xa0a0a0,
  textDark: 0x333333,

  // アクセント色
  primary: 0x4a90d9,
  primaryHover: 0x5ca0e9,
  primaryActive: 0x3a80c9,
  secondary: 0x6c757d,
  secondaryHover: 0x7c858d,

  // 状態色
  success: 0x28a745,
  warning: 0xffc107,
  danger: 0xdc3545,
  info: 0x17a2b8,

  // ゴールド
  gold: 0xffd700,
  goldDark: 0xb8860b,
  goldLight: 0xffec8b,

  // パネル
  panelBackground: 0x2a2a4e,
  panelBorder: 0x3a3a6e,
  panelBackgroundLight: 0x3a3a5e,

  // オーバーレイ
  overlay: 0x000000,

  // 特殊
  disabled: 0x555555,
  highlight: 0xffff00,
} as const;

/**
 * 基本カラーパレット（文字列形式 - CSS/rexUI用）
 */
export const ColorStrings = {
  // 背景色
  background: '#1a1a2e',
  backgroundLight: '#252542',
  backgroundDark: '#0f0f1a',
  backgroundParchment: '#f5f5dc',

  // テキスト色
  textPrimary: '#ffffff',
  textSecondary: '#e0e0e0',
  textMuted: '#a0a0a0',
  textDark: '#333333',

  // アクセント色
  primary: '#4a90d9',
  primaryHover: '#5ca0e9',
  primaryActive: '#3a80c9',
  secondary: '#6c757d',
  secondaryHover: '#7c858d',

  // 状態色
  success: '#28a745',
  warning: '#ffc107',
  danger: '#dc3545',
  info: '#17a2b8',

  // ゴールド
  gold: '#ffd700',
  goldDark: '#b8860b',
  goldLight: '#ffec8b',

  // パネル
  panelBackground: '#2a2a4e',
  panelBorder: '#3a3a6e',
  panelBackgroundLight: '#3a3a5e',

  // 特殊
  disabled: '#555555',
  highlight: '#ffff00',
} as const;

/**
 * オーバーレイのアルファ値
 */
export const OverlayAlpha = {
  light: 0.3,
  medium: 0.5,
  heavy: 0.7,
  opaque: 0.9,
} as const;

/**
 * カード種別ごとの色
 */
export const CardTypeColors = {
  gathering: {
    background: 0x2d5a27,
    border: 0x4a8f40,
    text: '#90ee90',
    accent: 0x90ee90,
  },
  recipe: {
    background: 0x5a2d27,
    border: 0x8f4a40,
    text: '#ffb6c1',
    accent: 0xffb6c1,
  },
  enhancement: {
    background: 0x27405a,
    border: 0x406a8f,
    text: '#add8e6',
    accent: 0xadd8e6,
  },
} as const;

/**
 * カード種別名の型
 */
export type CardTypeColorKey = keyof typeof CardTypeColors;

/**
 * ギルドランク別の色
 */
export const RankColors = {
  G: { primary: 0x808080, text: '#808080', name: 'グレー' },
  F: { primary: 0xcd7f32, text: '#cd7f32', name: 'ブロンズ' },
  E: { primary: 0xc0c0c0, text: '#c0c0c0', name: 'シルバー' },
  D: { primary: 0xffd700, text: '#ffd700', name: 'ゴールド' },
  C: { primary: 0x00ff00, text: '#00ff00', name: 'エメラルド' },
  B: { primary: 0x00bfff, text: '#00bfff', name: 'サファイア' },
  A: { primary: 0xff00ff, text: '#ff00ff', name: 'アメジスト' },
  S: { primary: 0xff4500, text: '#ff4500', name: 'ルビー' },
} as const;

/**
 * ランク名の型
 */
export type RankColorKey = keyof typeof RankColors;

/**
 * アイテム品質別の色
 */
export const QualityColors = {
  low: { primary: 0x808080, text: '#808080', label: '低' },
  medium: { primary: 0x00ff00, text: '#00ff00', label: '中' },
  high: { primary: 0x00bfff, text: '#00bfff', label: '高' },
  highest: { primary: 0xffd700, text: '#ffd700', label: '最高' },
} as const;

/**
 * 品質名の型
 */
export type QualityColorKey = keyof typeof QualityColors;

/**
 * UI状態別の色
 */
export const StateColors = {
  normal: {
    background: Colors.panelBackground,
    border: Colors.panelBorder,
    text: '#ffffff',
  },
  hover: {
    background: Colors.panelBackgroundLight,
    border: Colors.primary,
    text: '#ffffff',
  },
  active: {
    background: Colors.primary,
    border: Colors.primaryActive,
    text: '#ffffff',
  },
  disabled: {
    background: Colors.disabled,
    border: 0x444444,
    text: '#888888',
  },
  selected: {
    background: Colors.primaryActive,
    border: Colors.gold,
    text: '#ffffff',
  },
} as const;

/**
 * UI状態名の型
 */
export type StateColorKey = keyof typeof StateColors;

/**
 * 16進数文字列を数値に変換する
 * @param hex 16進数文字列（#RRGGBB形式）
 * @returns 数値（0xRRGGBB形式）
 */
export const hexToNumber = (hex: string): number => {
  return parseInt(hex.replace('#', ''), 16);
};

/**
 * 数値を16進数文字列に変換する
 * @param num 数値（0xRRGGBB形式）
 * @returns 16進数文字列（#RRGGBB形式）
 */
export const numberToHex = (num: number): string => {
  return '#' + num.toString(16).padStart(6, '0');
};

/**
 * 色にアルファ値を適用したRGBAを生成する
 * @param hex 16進数文字列（#RRGGBB形式）
 * @param alpha アルファ値（0-1）
 * @returns RGBA文字列
 */
export const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
