/**
 * extra-gathering-ap-cost.ts - 追加採取APコスト計算（純粋関数）
 *
 * Issue #408: かごの容量分だけ繰り返し採取できるようにする
 *
 * @description
 * presentationCount超過後の追加採取に対するAPコスト増加を計算する。
 * 超過回数に応じて段階的にAPコストが上昇する。
 *
 * @remarks
 * - currentRound <= presentationCount の場合、追加コストは0
 * - 超過回数 = currentRound - presentationCount
 * - 超過回数に応じてEXTRA_GATHERING_AP_COSTテーブルを参照
 */

import { EXTRA_GATHERING_AP_COST } from '@shared/constants/game-config';

/**
 * 追加採取APコストを計算する（純粋関数）
 *
 * @param currentRound - 現在のラウンド番号（1始まり）
 * @param presentationCount - 基本採取回数（追加APなしで採取できる回数）
 * @returns 追加APコスト（0以上の整数）
 */
export function calculateExtraGatheringApCost(
  currentRound: number,
  presentationCount: number,
): number {
  const excess = currentRound - presentationCount;

  if (excess <= 0) {
    return 0;
  }

  // 閾値テーブルを走査して該当する追加コストを返す
  for (const threshold of EXTRA_GATHERING_AP_COST.thresholds) {
    if (excess <= threshold.maxExcess) {
      return threshold.cost;
    }
  }

  // フォールバック（到達しないはず）
  const lastThreshold =
    EXTRA_GATHERING_AP_COST.thresholds[EXTRA_GATHERING_AP_COST.thresholds.length - 1];
  return lastThreshold?.cost ?? 0;
}
