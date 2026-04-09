/**
 * Design Tokens - 全トークン一元定義
 * Issue #455: UI刷新 Phase 1
 *
 * @remarks
 * radius / border / shadow / motion / zIndex / opacity の各トークンを一箇所に集約する。
 * 既存の `theme.ts` (Colors / THEME) は薄いエイリアスとして残し、後続Phaseで参照先を移行する。
 */

import { Duration, Easing, Motion } from './motion';
import { Border, Radius, Shadow } from './shape';
import { Colors, THEME } from './theme';

/** 透明度トークン */
export const Opacity = {
  disabled: 0.45,
  hover: 0.85,
  overlay: 0.72,
} as const;

/** zIndex レイヤリング（値は設計レポート §8.1 より） */
export const ZIndex = {
  base: 0,
  content: 10,
  sidebar: 20,
  hud: 30,
  phaseRail: 30,
  slidePanel: 80,
  modal: 100,
  toast: 110,
  tooltip: 120,
} as const;

/**
 * DesignTokens - デザイントークン統合エクスポート
 *
 * 使用例:
 *   import { DesignTokens } from '@shared/theme';
 *   const r = DesignTokens.radius.md;
 *   const z = DesignTokens.zIndex.modal;
 */
export const DesignTokens = {
  colors: Colors,
  theme: THEME,
  radius: Radius,
  border: Border,
  shadow: Shadow,
  motion: Motion,
  opacity: Opacity,
  zIndex: ZIndex,
  spacing: THEME.spacing,
  fonts: THEME.fonts,
  sizes: THEME.sizes,
} as const;

export type OpacityKey = keyof typeof Opacity;
export type ZIndexKey = keyof typeof ZIndex;

export { Border, Duration, Easing, Motion, Radius, Shadow };
