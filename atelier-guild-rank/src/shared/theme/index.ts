/**
 * Shared Theme Module
 * テーマ定義の公開エクスポート
 *
 * TASK-0067: shared/theme作成
 * Issue #455: UI刷新 Phase 1 - DesignTokens基盤追加
 */

export type {
  BrandKey as PaletteBrandKey,
  QualityKey as PaletteQualityKey,
  RankKey as PaletteRankKey,
  StatusKey as PaletteStatusKey,
  SurfaceKey as PaletteSurfaceKey,
  TextKey as PaletteTextKey,
} from './color-palette';
export { ColorPalette } from './color-palette';
export { contrastRatio, meetsWcagAa, relativeLuminance } from './contrast';
export type { OpacityKey, ZIndexKey } from './design-tokens';
// Design tokens (Issue #455 Phase 1)
export {
  Border,
  DesignTokens,
  Duration,
  Easing,
  Motion,
  Opacity,
  Radius,
  Shadow,
  ZIndex,
} from './design-tokens';
export type { DurationKey, EasingKey } from './motion';
export { RANK_COLORS } from './rank-tokens';
export type {
  SemanticBrandKey,
  SemanticQualityKey,
  SemanticRankKey,
  SemanticStatusKey,
  SemanticSurfaceKey,
  SemanticTextKey,
} from './semantic-colors';
export { SemanticColors } from './semantic-colors';
export type { BorderKey, RadiusKey, ShadowKey } from './shape';
export type {
  BackgroundColorKey,
  BorderColorKey,
  CardTypeColorKey,
  ColorKey,
  TextColorKey,
} from './theme';
export { Colors, THEME, toColorStr } from './theme';
