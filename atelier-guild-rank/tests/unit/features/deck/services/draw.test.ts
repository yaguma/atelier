/**
 * draw.test.ts - draw関数のユニットテスト
 *
 * TASK-0069: features/deck/services作成（DeckService純粋関数化）
 */

import { draw } from '@features/deck/services/draw';
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

describe('draw', () => {
  describe('基本動作', () => {
    it('指定枚数のカードを取得できること', () => {
      const deck = [
        createMockCard('card-1'),
        createMockCard('card-2'),
        createMockCard('card-3'),
        createMockCard('card-4'),
        createMockCard('card-5'),
      ];

      const [drawnCards, remainingDeck] = draw(deck, 3);

      expect(drawnCards.length).toBe(3);
      expect(remainingDeck.length).toBe(2);
    });

    it('元のデッキと残りデッキを返すこと', () => {
      const deck = [createMockCard('card-1'), createMockCard('card-2'), createMockCard('card-3')];

      const [drawnCards, remainingDeck] = draw(deck, 2);

      // ドローしたカードは元のデッキの末尾から取得される
      expect(drawnCards.map((c) => c.id)).toEqual(['card-3', 'card-2']);
      expect(remainingDeck.map((c) => c.id)).toEqual(['card-1']);
    });

    it('入力配列を変更しないこと（イミュータブル）', () => {
      const deck = [createMockCard('card-1'), createMockCard('card-2'), createMockCard('card-3')];
      const originalIds = deck.map((c) => c.id);

      draw(deck, 2);

      // 元の配列が変更されていないことを確認
      expect(deck.map((c) => c.id)).toEqual(originalIds);
    });

    it('全カード数がドロー前後で保存されること', () => {
      const deck = [
        createMockCard('card-1'),
        createMockCard('card-2'),
        createMockCard('card-3'),
        createMockCard('card-4'),
        createMockCard('card-5'),
      ];

      const [drawnCards, remainingDeck] = draw(deck, 3);

      expect(drawnCards.length + remainingDeck.length).toBe(deck.length);
    });
  });

  describe('エッジケース', () => {
    it('デッキが空の場合空配列を返すこと', () => {
      const [drawnCards, remainingDeck] = draw([], 3);

      expect(drawnCards).toEqual([]);
      expect(remainingDeck).toEqual([]);
    });

    it('ドロー枚数が0の場合、空配列とデッキをそのまま返すこと', () => {
      const deck = [createMockCard('card-1'), createMockCard('card-2')];

      const [drawnCards, remainingDeck] = draw(deck, 0);

      expect(drawnCards).toEqual([]);
      expect(remainingDeck.map((c) => c.id)).toEqual(['card-1', 'card-2']);
    });

    it('ドロー枚数がデッキ枚数より多い場合、可能な分だけ取得すること', () => {
      const deck = [createMockCard('card-1'), createMockCard('card-2')];

      const [drawnCards, remainingDeck] = draw(deck, 5);

      expect(drawnCards.length).toBe(2);
      expect(remainingDeck.length).toBe(0);
    });

    it('負のドロー枚数の場合、空配列を返すこと', () => {
      const deck = [createMockCard('card-1'), createMockCard('card-2')];

      const [drawnCards, remainingDeck] = draw(deck, -1);

      expect(drawnCards).toEqual([]);
      expect(remainingDeck.map((c) => c.id)).toEqual(['card-1', 'card-2']);
    });
  });

  describe('複数回ドロー', () => {
    it('連続でドローしても正しく動作すること', () => {
      const deck = [
        createMockCard('card-1'),
        createMockCard('card-2'),
        createMockCard('card-3'),
        createMockCard('card-4'),
        createMockCard('card-5'),
      ];

      const [drawn1, remaining1] = draw(deck, 2);
      const [drawn2, remaining2] = draw(remaining1, 2);

      expect(drawn1.length).toBe(2);
      expect(drawn2.length).toBe(2);
      expect(remaining2.length).toBe(1);
    });
  });
});
