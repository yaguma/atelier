/**
 * play-card.ts - カードプレイ純粋関数
 *
 * TASK-0069: features/deck/services作成（DeckService純粋関数化）
 *
 * @description
 * 手札からカードをプレイする純粋関数。
 * Result型を使用して成功/失敗を明示的に返す。
 *
 * @example
 * ```typescript
 * const result = playCard(state, cardId);
 * if (result.ok) {
 *   // result.value: 新しいDeckState
 * } else {
 *   // result.error: PlayCardError
 * }
 * ```
 */

import type { Card, CardId } from '@shared/types';

/**
 * デッキ状態を表す型
 */
export interface DeckState {
  /** 手札 */
  hand: readonly Card[];
  /** 山札 */
  deck: readonly Card[];
  /** 捨て札 */
  discard: readonly Card[];
}

/**
 * playCardエラーの種類
 */
export type PlayCardErrorCode = 'CARD_NOT_IN_HAND';

/**
 * playCard関数のエラー型
 */
export interface PlayCardError {
  /** エラーコード */
  code: PlayCardErrorCode;
  /** エラーメッセージ */
  message: string;
}

/**
 * Result型（成功または失敗）
 */
export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

/**
 * カードをプレイする純粋関数
 *
 * 手札から指定したカードを削除し、捨て札に追加する。
 * 入力状態を変更せず、新しい状態を返す。
 *
 * @param state - 現在のデッキ状態
 * @param cardId - プレイするカードID
 * @returns Result<新しいDeckState, PlayCardError>
 *
 * @example
 * ```typescript
 * const result = playCard(state, 'card-1');
 * if (result.ok) {
 *   const newState = result.value;
 *   // 手札からcard-1が削除され、捨て札に追加されている
 * }
 * ```
 */
export function playCard(state: DeckState, cardId: CardId): Result<DeckState, PlayCardError> {
  // 手札からカードを検索
  const cardIndex = state.hand.findIndex((card) => card.id === cardId);

  // カードが見つからない場合はエラー
  if (cardIndex === -1) {
    return {
      ok: false,
      error: {
        code: 'CARD_NOT_IN_HAND',
        message: `Card ${cardId} is not in hand`,
      },
    };
  }

  // プレイするカード（cardIndexが-1でないことは上で確認済み）
  const playedCard = state.hand[cardIndex] as Card;

  // 新しい手札（該当カードを削除）
  const newHand = [...state.hand.slice(0, cardIndex), ...state.hand.slice(cardIndex + 1)];

  // 新しい捨て札（プレイしたカードを追加）
  const newDiscard = [...state.discard, playedCard];

  // 新しい状態を返す
  return {
    ok: true,
    value: {
      hand: newHand,
      deck: [...state.deck],
      discard: newDiscard,
    },
  };
}
