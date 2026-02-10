/**
 * play-card.test.ts - playCard関数のユニットテスト
 *
 * TASK-0069: features/deck/services作成（DeckService純粋関数化）
 */

import { type DeckState, playCard } from '@features/deck/services/play-card';
import type { Card } from '@shared/types';
import { CardType, GuildRank, Rarity } from '@shared/types';
import { describe, expect, it } from 'vitest';

// テスト用のカードモック
function createMockCard(id: string): Card {
  return {
    id: id as Card['id'],
    name: `Card ${id}`,
    type: CardType.GATHERING,
    rarity: Rarity.COMMON,
    unlockRank: GuildRank.G,
    cost: 1,
    materials: [],
  } as Card;
}

// テスト用のDeckState生成
function createDeckState(hand: Card[] = [], deck: Card[] = [], discard: Card[] = []): DeckState {
  return { hand, deck, discard };
}

describe('playCard', () => {
  describe('正常系', () => {
    it('手札からカードを削除した新しい状態を返すこと', () => {
      const card1 = createMockCard('card-1');
      const card2 = createMockCard('card-2');
      const card3 = createMockCard('card-3');
      const state = createDeckState([card1, card2, card3]);

      const result = playCard(state, 'card-2' as Card['id']);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.hand.map((c) => c.id)).toEqual(['card-1', 'card-3']);
      }
    });

    it('カードが捨て札に追加されること', () => {
      const card1 = createMockCard('card-1');
      const card2 = createMockCard('card-2');
      const state = createDeckState([card1, card2]);

      const result = playCard(state, 'card-1' as Card['id']);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.discard.map((c) => c.id)).toEqual(['card-1']);
      }
    });

    it('入力状態を変更しないこと（イミュータブル）', () => {
      const card1 = createMockCard('card-1');
      const card2 = createMockCard('card-2');
      const state = createDeckState([card1, card2]);
      const originalHandIds = state.hand.map((c) => c.id);

      playCard(state, 'card-1' as Card['id']);

      // 元の状態が変更されていないことを確認
      expect(state.hand.map((c) => c.id)).toEqual(originalHandIds);
    });

    it('山札は変更されないこと', () => {
      const handCard = createMockCard('hand-1');
      const deckCard1 = createMockCard('deck-1');
      const deckCard2 = createMockCard('deck-2');
      const state = createDeckState([handCard], [deckCard1, deckCard2]);

      const result = playCard(state, 'hand-1' as Card['id']);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.deck.map((c) => c.id)).toEqual(['deck-1', 'deck-2']);
      }
    });

    it('既存の捨て札にカードが追加されること', () => {
      const handCard = createMockCard('hand-1');
      const discardCard = createMockCard('discard-1');
      const state = createDeckState([handCard], [], [discardCard]);

      const result = playCard(state, 'hand-1' as Card['id']);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.discard.map((c) => c.id)).toEqual(['discard-1', 'hand-1']);
      }
    });
  });

  describe('異常系', () => {
    it('存在しないカードの場合エラーを返すこと', () => {
      const card1 = createMockCard('card-1');
      const card2 = createMockCard('card-2');
      const state = createDeckState([card1, card2]);

      const result = playCard(state, 'card-999' as Card['id']);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe('CARD_NOT_IN_HAND');
      }
    });

    it('手札が空の場合エラーを返すこと', () => {
      const state = createDeckState([]);

      const result = playCard(state, 'card-1' as Card['id']);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe('CARD_NOT_IN_HAND');
      }
    });

    it('山札にあるカードを指定してもエラーを返すこと', () => {
      const handCard = createMockCard('hand-1');
      const deckCard = createMockCard('deck-1');
      const state = createDeckState([handCard], [deckCard]);

      const result = playCard(state, 'deck-1' as Card['id']);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe('CARD_NOT_IN_HAND');
      }
    });
  });

  describe('同じカードIDが複数ある場合', () => {
    it('最初に見つかったカードのみ削除されること', () => {
      const card1a = createMockCard('card-1');
      const card1b = createMockCard('card-1');
      const card2 = createMockCard('card-2');
      const state = createDeckState([card1a, card2, card1b]);

      const result = playCard(state, 'card-1' as Card['id']);

      expect(result.ok).toBe(true);
      if (result.ok) {
        // 最初のcard-1が削除される
        expect(result.value.hand.length).toBe(2);
        // card-1がまだ1枚残っている
        expect(result.value.hand.filter((c) => c.id === 'card-1').length).toBe(1);
      }
    });
  });
});
