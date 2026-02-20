/**
 * Gathering Services - 採取機能サービスのバレルエクスポート
 *
 * TASK-0073: features/gathering/services作成
 *
 * 全て副作用のない純粋関数として実装。
 * 乱数は外部から注入する設計のため、テスト容易性が高い。
 */

// --- 採取コスト計算 ---
export { calculateGatheringCost } from './calculate-materials';
export type { GatherInput, GatherResult } from './gather';
// --- 採取素材オプション生成 ---
export { gather } from './gather';
// --- 採取場所 ---
export {
  getAvailableLocations,
  getLocationDetail,
  getSelectableLocations,
} from './gathering-location-service';
export type { SelectionError, SelectionResult } from './select-option';
// --- ドラフト選択 ---
export { selectGatheringOption } from './select-option';
