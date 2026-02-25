/**
 * calculate-materials.ts - 採取コスト計算の純粋関数
 *
 * TASK-0073: features/gathering/services作成
 *
 * @description
 * 採取時のコスト計算（行動ポイント消費・追加日数）を行う純粋関数。
 * 既存のGatheringService.calculateGatheringCost()を純粋関数として抽出。
 *
 * コスト閾値はGAME_CONFIG (GATHERING_COST) で一元管理される。
 */

import type { GatheringCostResult } from '@features/gathering/types';
import { GATHERING_COST } from '@shared/constants';

/**
 * 採取コストを計算する純粋関数
 *
 * コスト計算ルール（GATHERING_COST.thresholds による）:
 * - 0個選択: 追加コスト0
 * - 1-2個選択: 追加コスト1
 * - 3-4個選択: 追加コスト2
 * - 5-6個選択: 追加コスト3
 * - 7個以上: 追加コスト4（AP超過モデルで日数管理）
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
 * const heavyCost = calculateGatheringCost(2, 7);
 * // => { actionPointCost: 6, extraDays: 0 }
 * ```
 */
export function calculateGatheringCost(
  baseCost: number,
  selectedCount: number,
): GatheringCostResult {
  let additionalCost = 0;

  for (const threshold of GATHERING_COST.thresholds) {
    if (selectedCount <= threshold.maxCount) {
      additionalCost = threshold.additionalCost;
      break;
    }
  }

  return {
    actionPointCost: baseCost + additionalCost,
    extraDays: 0,
  };
}
