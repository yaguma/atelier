/**
 * Motion tokens - duration / easing
 * Issue #455: UI刷新 Phase 1
 */

export const Duration = {
  instant: 60,
  fast: 120,
  base: 240,
  slow: 400,
} as const;

/** Phaser tween ease 名称 */
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

export type DurationKey = keyof typeof Duration;
export type EasingKey = keyof typeof Easing;
