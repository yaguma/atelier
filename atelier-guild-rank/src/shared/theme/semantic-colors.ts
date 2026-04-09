/**
 * Semantic Colors - 用途別カラーエイリアス
 * Issue #457: UI刷新 Phase 3
 *
 * @remarks
 * `color-palette.ts` の生カラーを用途別の意味で再エクスポートする。
 * UI層からはこちらを参照することで、将来のパレット刷新に強くする。
 * 純粋な定数定義のみ、副作用なし。
 */

import { Brand, Quality, Rank, Status, Surface, Text } from './color-palette';

export const SemanticColors = {
  surface: {
    base: Surface.base,
    raised: Surface.raised,
    panel: Surface.panel,
    inset: Surface.inset,
  },
  text: {
    primary: Text.primary,
    secondary: Text.secondary,
    /** アイコン・枠・非テキスト装飾用（WCAG AA コントラスト未保証、本文テキストには使用しない）。 */
    muted: Text.muted,
  },
  brand: {
    /** アイコン・枠・非テキスト装飾用（WCAG AA コントラスト未保証、本文テキストには使用しない）。 */
    primary: Brand.primary,
    /** アイコン・枠・非テキスト装飾用（WCAG AA コントラスト未保証、本文テキストには使用しない）。 */
    secondary: Brand.secondary,
    accent: Brand.accent,
  },
  status: {
    success: Status.success,
    warning: Status.warning,
    /** アイコン・枠・非テキスト装飾用（WCAG AA コントラスト未保証、本文テキストには使用しない）。 */
    danger: Status.danger,
    info: Status.info,
  },
  quality: {
    /** アイコン・枠・非テキスト装飾用（WCAG AA コントラスト未保証、本文テキストには使用しない）。 */
    D: Quality.D,
    C: Quality.C,
    B: Quality.B,
    /** アイコン・枠・非テキスト装飾用（WCAG AA コントラスト未保証、本文テキストには使用しない）。 */
    A: Quality.A,
    S: Quality.S,
  },
  rank: {
    G: Rank.G,
    F: Rank.F,
    E: Rank.E,
    D: Rank.D,
    C: Rank.C,
    B: Rank.B,
    A: Rank.A,
    S: Rank.S,
  },
} as const;

export type SemanticSurfaceKey = keyof typeof SemanticColors.surface;
export type SemanticTextKey = keyof typeof SemanticColors.text;
export type SemanticBrandKey = keyof typeof SemanticColors.brand;
export type SemanticStatusKey = keyof typeof SemanticColors.status;
export type SemanticQualityKey = keyof typeof SemanticColors.quality;
export type SemanticRankKey = keyof typeof SemanticColors.rank;
