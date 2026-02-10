/**
 * shuffle.test.ts - shuffle関数のユニットテスト
 *
 * TASK-0069: features/deck/services作成（DeckService純粋関数化）
 */

import { createSeededRandom, shuffle } from '@features/deck/services/shuffle';
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

describe('shuffle', () => {
  describe('基本動作', () => {
    it('同じシード値で同じ結果が返されること', () => {
      const cards = [
        createMockCard('card-1'),
        createMockCard('card-2'),
        createMockCard('card-3'),
        createMockCard('card-4'),
        createMockCard('card-5'),
      ];

      const result1 = shuffle(cards, 12345);
      const result2 = shuffle(cards, 12345);

      expect(result1.map((c) => c.id)).toEqual(result2.map((c) => c.id));
    });

    it('異なるシード値で異なる結果が返されること', () => {
      const cards = [
        createMockCard('card-1'),
        createMockCard('card-2'),
        createMockCard('card-3'),
        createMockCard('card-4'),
        createMockCard('card-5'),
      ];

      const result1 = shuffle(cards, 12345);
      const result2 = shuffle(cards, 67890);

      // 順序が異なる可能性が高い（完全に同じ可能性は非常に低い）
      const order1 = result1.map((c) => c.id).join(',');
      const order2 = result2.map((c) => c.id).join(',');
      expect(order1).not.toEqual(order2);
    });

    it('入力配列を変更しないこと（イミュータブル）', () => {
      const cards = [createMockCard('card-1'), createMockCard('card-2'), createMockCard('card-3')];
      const originalIds = cards.map((c) => c.id);

      shuffle(cards, 12345);

      // 元の配列が変更されていないことを確認
      expect(cards.map((c) => c.id)).toEqual(originalIds);
    });

    it('全てのカードが結果に含まれること', () => {
      const cards = [
        createMockCard('card-1'),
        createMockCard('card-2'),
        createMockCard('card-3'),
        createMockCard('card-4'),
        createMockCard('card-5'),
      ];
      const originalIds = new Set(cards.map((c) => c.id));

      const result = shuffle(cards, 12345);
      const resultIds = new Set(result.map((c) => c.id));

      expect(resultIds).toEqual(originalIds);
    });

    it('結果の配列長が元の配列長と同じであること', () => {
      const cards = [createMockCard('card-1'), createMockCard('card-2'), createMockCard('card-3')];

      const result = shuffle(cards, 12345);

      expect(result.length).toBe(cards.length);
    });
  });

  describe('エッジケース', () => {
    it('空配列の場合、空配列を返すこと', () => {
      const result = shuffle([], 12345);
      expect(result).toEqual([]);
    });

    it('要素が1つの場合、同じ配列を返すこと', () => {
      const cards = [createMockCard('card-1')];
      const result = shuffle(cards, 12345);

      expect(result.length).toBe(1);
      expect(result[0]?.id).toBe('card-1');
    });

    it('シードなしでもシャッフルできること', () => {
      const cards = [createMockCard('card-1'), createMockCard('card-2'), createMockCard('card-3')];

      // シードなしで実行してもエラーが発生しないこと
      const result = shuffle(cards);

      expect(result.length).toBe(cards.length);
      expect(new Set(result.map((c) => c.id))).toEqual(new Set(cards.map((c) => c.id)));
    });
  });
});

describe('createSeededRandom', () => {
  it('同じシードで同じ乱数列を生成すること', () => {
    const random1 = createSeededRandom(12345);
    const random2 = createSeededRandom(12345);

    const values1 = [random1(), random1(), random1()];
    const values2 = [random2(), random2(), random2()];

    expect(values1).toEqual(values2);
  });

  it('異なるシードで異なる乱数列を生成すること', () => {
    const random1 = createSeededRandom(12345);
    const random2 = createSeededRandom(67890);

    const values1 = [random1(), random1(), random1()];
    const values2 = [random2(), random2(), random2()];

    expect(values1).not.toEqual(values2);
  });

  it('生成される値が0以上1未満であること', () => {
    const random = createSeededRandom(12345);

    for (let i = 0; i < 100; i++) {
      const value = random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});
