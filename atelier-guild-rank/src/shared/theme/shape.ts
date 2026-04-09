/**
 * Shape tokens - radius / border / shadow
 * Issue #455: UI刷新 Phase 1
 */

export const Radius = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 14,
  xl: 22,
  full: 9999,
} as const;

export const Border = {
  hairline: 1,
  thin: 2,
  regular: 3,
  thick: 4,
} as const;

/**
 * Shadow tokens
 * Phaser はCSS box-shadow を直接使えないため、blur/offset/color を数値で保持する。
 * 利用側で glow/stroke に変換する想定。
 */
export const Shadow = {
  sm: { offsetX: 0, offsetY: 1, blur: 2, color: 0x000000, alpha: 0.2 },
  md: { offsetX: 0, offsetY: 2, blur: 6, color: 0x000000, alpha: 0.28 },
  lg: { offsetX: 0, offsetY: 6, blur: 14, color: 0x000000, alpha: 0.35 },
  glowFocus: { offsetX: 0, offsetY: 0, blur: 10, color: 0xffd54f, alpha: 0.6 },
} as const;

export type RadiusKey = keyof typeof Radius;
export type BorderKey = keyof typeof Border;
export type ShadowKey = keyof typeof Shadow;
