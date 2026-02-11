/**
 * calculate-materials.ts - 採取コスト計算の純粋関数
 *
 * TASK-0073: features/gathering/services作成
 *
 * @description
 * 採取時のコスト計算（行動ポイント消費・追加日数）を行う純粋関数。
 * 既存のGatheringService.calculateGatheringCost()を純粋関数として抽出。
 */

import type { GatheringCostResult } from '@features/gathering/types';

/**
 * 採取コストを計算する純粋関数
 *
 * コスト計算ルール:
 * - 0個選択: 追加コスト0
 * - 1-2個選択: 追加コスト1
 * - 3-4個選択: 追加コスト2
 * - 5-6個選択: 追加コスト3
 * - 7個以上: 追加コスト3 + 翌日持越しペナルティ（extraDays=1）
 *
 * @param baseCost - 採取地の基本コスト
 * @param selectedCount - 選択した素材の個数
 * @returns 行動ポイントコストと追加日数
 *
 * @example
 * ```typescript
 * const cost = calculateGatheringCost(1, 5);
 * // => { actionPointCost: 4, extraDays: 0 }
 *
 * const heavyCost = calculateGatheringCost(1, 7);
 * // => { actionPointCost: 4, extraDays: 1 }
 * ```
 */
export function calculateGatheringCost(
  baseCost: number,
  selectedCount: number,
): GatheringCostResult {
  let additionalCost: number;
  let extraDays = 0;

  if (selectedCount === 0) {
    additionalCost = 0;
  } else if (selectedCount <= 2) {
    additionalCost = 1;
  } else if (selectedCount <= 4) {
    additionalCost = 2;
  } else if (selectedCount <= 6) {
    additionalCost = 3;
  } else {
    additionalCost = 3;
    extraDays = 1;
  }

  return {
    actionPointCost: baseCost + additionalCost,
    extraDays,
  };
}
