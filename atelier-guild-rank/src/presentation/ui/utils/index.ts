/**
 * UI Utils エクスポート
 *
 * TASK-0053 Phase 7 共通UIユーティリティ基盤
 * TASK-0054 Phase 7 テーマ定数統一（カラー・アニメーション）
 */

export {
  type AnimationPresetKey,
  AnimationPresets,
  type ButtonAnimationKey,
  type CardAnimationKey,
  type EasingKey,
  type FadeAnimationKey,
  type ScaleAnimationKey,
  type SlideAnimationKey,
  type TimingKey,
} from './AnimationPresets';
export {
  BorderLineFactory,
  createHorizontalLine,
  createRoundedBorder,
  createVerticalLine,
} from './BorderLineFactory';
export {
  applyHoverAnimation,
  type HoverAnimationConfig,
  removeHoverAnimation,
} from './HoverAnimationMixin';
export { UIBackgroundBuilder } from './UIBackgroundBuilder';
