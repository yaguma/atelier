/**
 * フェーズインジケーターUIコンポーネント
 *
 * フェーズ表示に関するインターフェース、定数、実装をエクスポートする。
 */

// 定数
export {
  PhaseIndicatorLayout,
  PhaseColors,
  PhaseInfo,
} from './PhaseIndicatorConstants';

// インターフェース
export {
  type IPhaseIndicator,
  type PhaseIndicatorOptions,
} from './IPhaseIndicator';

// 実装
export { PhaseIndicator } from './PhaseIndicator';
