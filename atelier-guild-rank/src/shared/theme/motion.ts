/**
 * Motion tokens - duration / easing
 * Issue #455: UI刷新 Phase 1
 * Issue #460: prefers-reduced-motion 対応追加
 */

export const Duration = {
  instant: 60,
  fast: 120,
  base: 240,
  slow: 400,
} as const;

/**
 * Phaser tween ease 名称
 * TODO(#455 Phase 2): 設計レポート §8.1 のキー名(`motion.ease`)と
 * Quad系easeへの統一を検討する。
 */
export const Easing = {
  standard: 'Sine.easeInOut',
  decelerate: 'Cubic.easeOut',
  accelerate: 'Cubic.easeIn',
  emphasized: 'Back.easeOut',
} as const;

export const Motion = {
  duration: Duration,
  easing: Easing,
} as const;

/**
 * prefers-reduced-motion メディアクエリを検知する。
 * ブラウザが「アニメーション軽減」を要求している場合に true を返す。
 *
 * Issue #460: A11y - モーション配慮
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * reduced-motion が有効な場合は instant (60ms) を返し、
 * 無効な場合は指定された duration をそのまま返すヘルパー。
 */
export function motionSafeDuration(duration: number): number {
  return prefersReducedMotion() ? Duration.instant : duration;
}

export type DurationKey = keyof typeof Duration;
export type EasingKey = keyof typeof Easing;
