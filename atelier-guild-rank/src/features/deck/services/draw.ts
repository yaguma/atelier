/**
 * draw.ts - カードドロー純粋関数
 *
 * TASK-0069: features/deck/services作成（DeckService純粋関数化）
 *
 * @description
 * デッキからカードを引く純粋関数。
 * 入力配列を変更せず、引いたカードと残りのデッキをタプルで返す。
 *
 * @example
 * ```typescript
 * const [drawnCards, remainingDeck] = draw(deck, 3);
 * ```
 */

/**
 * デッキからカードを引く純粋関数
 *
 * 入力配列を変更せず、新しい配列を返す。
 * デッキの末尾からカードを取得する（スタック的な動作）。
 *
 * @template T - カードの型
 * @param deck - 現在のデッキ（readonly）
 * @param count - 引く枚数
 * @returns [引いたカード, 残りのデッキ] のタプル
 *
 * @example
 * ```typescript
 * const deck = [card1, card2, card3, card4, card5];
 * const [drawn, remaining] = draw(deck, 2);
 * // drawn: [card5, card4] （末尾から取得）
 * // remaining: [card1, card2, card3]
 * ```
 */
export function draw<T>(deck: readonly T[], count: number): [drawnCards: T[], remainingDeck: T[]] {
  // 無効なカウントの場合、空配列とデッキをそのまま返す
  if (count <= 0) {
    return [[], [...deck]];
  }

  // 空のデッキの場合
  if (deck.length === 0) {
    return [[], []];
  }

  // 実際に引く枚数（デッキ枚数を超えない）
  const actualCount = Math.min(count, deck.length);

  // 残りのデッキ（先頭から (length - actualCount) 枚）
  const remainingDeck = deck.slice(0, deck.length - actualCount);

  // 引いたカード（末尾から actualCount 枚、逆順で）
  const drawnCards = deck.slice(deck.length - actualCount).reverse();

  return [drawnCards, remainingDeck];
}
