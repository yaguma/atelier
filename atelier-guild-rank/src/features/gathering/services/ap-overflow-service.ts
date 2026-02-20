/**
 * ap-overflow-service.ts - AP超過計算の純粋関数
 *
 * TASK-0103: APOverflowService実装
 *
 * @description
 * 消費APが残APを超過した場合の日数消費・翌日AP計算を行うFunctional Core。
 * 副作用なし、外部状態を参照・変更しない純粋関数として実装。
 *
 * 計算ロジック:
 * - overflowAP = max(0, consumeAP - currentAP)
 * - daysConsumed = ceil(overflowAP / maxAP)
 * - nextDayAP = overflowAP % maxAP === 0 ? maxAP : maxAP - (overflowAP % maxAP)
 *
 * 設計文書: docs/design/free-phase-navigation/architecture.md
 * 要件: REQ-003, REQ-003-01〜REQ-003-06
 */

import { InitialParameters } from '@shared/types';
import type { IAPConsumptionInput, IAPOverflowResult } from '../types/ap-overflow';

/** デフォルトのAP上限 */
const DEFAULT_MAX_AP = InitialParameters.ACTION_POINTS_PER_DAY;

/**
 * AP超過を計算する純粋関数
 *
 * @param input - AP消費入力（現在AP、消費AP、AP上限）
 * @returns AP超過計算結果
 *
 * @example
 * ```typescript
 * // AP超過なし
 * calculateOverflow({ currentAP: 3, consumeAP: 2 });
 * // => { hasOverflow: false, overflowAP: 0, daysConsumed: 0, nextDayAP: 0, remainingAP: 1 }
 *
 * // 1日分の超過
 * calculateOverflow({ currentAP: 3, consumeAP: 4 });
 * // => { hasOverflow: true, overflowAP: 1, daysConsumed: 1, nextDayAP: 2, remainingAP: 0 }
 * ```
 */
export function calculateOverflow(input: IAPConsumptionInput): IAPOverflowResult {
  const { currentAP, consumeAP, maxAP = DEFAULT_MAX_AP } = input;

  if (maxAP <= 0) {
    throw new Error(`maxAP must be a positive integer (received: ${maxAP})`);
  }

  const overflowAP = Math.max(0, consumeAP - currentAP);
  const hasOverflow = overflowAP > 0;

  if (!hasOverflow) {
    return {
      hasOverflow: false,
      overflowAP: 0,
      daysConsumed: 0,
      nextDayAP: 0,
      remainingAP: currentAP - consumeAP,
    };
  }

  const daysConsumed = Math.ceil(overflowAP / maxAP);
  // 超過APがmaxAPの倍数の場合、翌日APはmaxAP（0ではない）
  const remainder = overflowAP % maxAP;
  const nextDayAP = remainder === 0 ? maxAP : maxAP - remainder;

  return {
    hasOverflow: true,
    overflowAP,
    daysConsumed,
    nextDayAP,
    remainingAP: 0,
  };
}
