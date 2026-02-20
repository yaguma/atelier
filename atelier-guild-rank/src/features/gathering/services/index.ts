/**
 * Gathering Services - 採取機能サービスのバレルエクスポート
 *
 * TASK-0073: features/gathering/services作成
 * TASK-0103: AP超過計算サービス追加
 *
 * 全て副作用のない純粋関数として実装。
 * 乱数は外部から注入する設計のため、テスト容易性が高い。
 */

// --- AP超過計算 ---
export { calculateOverflow } from './ap-overflow-service';
// --- 採取コスト計算 ---
export { calculateGatheringCost } from './calculate-materials';
// --- 採取実行 ---
export type { GatherInput, GatherResult } from './gather';
export { gather } from './gather';
// --- 採取場所 ---
export {
  getAvailableLocations,
  getLocationDetail,
  getSelectableLocations,
} from './gathering-location-service';
// --- ドラフト選択 ---
export type { SelectionError, SelectionResult } from './select-option';
export { selectGatheringOption } from './select-option';
