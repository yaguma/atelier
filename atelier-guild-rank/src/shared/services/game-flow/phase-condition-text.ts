/**
 * phase-condition-text.ts
 * Issue #471: フェーズ遷移の到達条件テキストを決定する純粋関数
 * Issue #498: 説明テキストは不要のため常に空文字を返す
 *
 * Functional Core: 副作用なし、入力のみに依存
 */

import type { GamePhase } from '@shared/types/common';

/**
 * 現在のフェーズと状態から、次フェーズへの到達条件テキストを返す
 * Issue #498: 説明テキストは不要のため常に空文字を返す
 *
 * @param _currentPhase - 現在のフェーズ（未使用）
 * @param _hasActiveQuests - 受注中の依頼があるか（未使用）
 * @returns 空文字（条件テキストは表示しない）
 */
export function getPhaseConditionText(
  _currentPhase: GamePhase | string,
  _hasActiveQuests: boolean,
): string {
  return '';
}
