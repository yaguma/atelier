/**
 * phase-condition-text.ts
 * Issue #471: フェーズ遷移の到達条件テキストを決定する純粋関数
 *
 * Functional Core: 副作用なし、入力のみに依存
 */

import type { GamePhase } from '@shared/types/common';

/**
 * 現在のフェーズと状態から、次フェーズへの到達条件テキストを返す
 *
 * @param currentPhase - 現在のフェーズ
 * @param hasActiveQuests - 受注中の依頼があるか
 * @returns 到達条件テキスト（条件なしの場合は空文字）
 */
export function getPhaseConditionText(
  currentPhase: GamePhase | string,
  hasActiveQuests: boolean,
): string {
  switch (currentPhase) {
    case 'QUEST_ACCEPT':
      return hasActiveQuests
        ? '→ 依頼を受注済み。採取に進めます'
        : '→ 依頼を受注すると採取に進めます';
    case 'GATHERING':
      return '→ 素材を集めたら調合に進めます';
    case 'ALCHEMY':
      return '→ アイテムを調合したら納品に進めます';
    case 'DELIVERY':
      return '';
    default:
      return '';
  }
}
