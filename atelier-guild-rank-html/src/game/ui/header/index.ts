/**
 * ヘッダーUIコンポーネント
 *
 * ヘッダー表示に関するインターフェース、定数、ユーティリティをエクスポートする。
 */

// 定数
export { HeaderLayout, HeaderColors, RankColors } from './HeaderConstants';

// インターフェース
export {
  type IHeaderUI,
  type HeaderUIData,
  type HeaderUIOptions,
} from './IHeaderUI';

// ユーティリティ
export {
  getRankColor,
  formatGold,
  formatDay,
  formatAP,
  formatExp,
  getRankName,
} from './HeaderUtils';
