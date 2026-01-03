/**
 * デッキドメインサービスのテスト
 * TASK-0090: デッキドメインサービス
 *
 * デッキの操作（追加、削除、ドロー、使用、シャッフル）をテストする
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  DeckService,
  createDeck,
  type Deck,
} from '../../../../src/domain/services/DeckService';
import {
  GatheringCard,
  RecipeCard,
  EnhancementCard,
  createGatheringCard,
  createRecipeCard,
  createEnhancementCard,
} from '../../../../src/domain/card/CardEntity';
import {
  CardType,
  GuildRank,
  Rarity,
  EffectType,
  EnhancementTarget,
  ItemCategory,
} from '../../../../src/domain/common/types';
import type { IGatheringCard, IRecipeCard, IEnhancementCard } from '../../../../src/domain/card/Card';

describe('DeckService', () => {
  // テスト用データ
  const sampleGatheringCardData: IGatheringCard = {
    id: 'gathering_forest',
    name: '森の採取地',
    type: CardType.GATHERING,
    rarity: Rarity.COMMON,
    unlockRank: GuildRank.G,
    cost: 1,
    materials: [
      { materialId: 'herb', quantity: 2, probability: 0.8 },
      { materialId: 'flower', quantity: 1, probability: 0.5 },
    ],
  };

  const sampleRecipeCardData: IRecipeCard = {
    id: 'recipe_healing_potion',
    name: 'ヒーリングポーション',
    type: CardType.RECIPE,
    rarity: Rarity.COMMON,
    unlockRank: GuildRank.G,
    cost: 1,
    requiredMaterials: [{ materialId: 'herb', quantity: 2 }],
    outputItemId: 'healing_potion',
    category: ItemCategory.MEDICINE,
  };

  const sampleEnhancementCardData: IEnhancementCard = {
    id: 'enhancement_quality_up',
    name: '品質向上',
    type: CardType.ENHANCEMENT,
    rarity: Rarity.UNCOMMON,
    unlockRank: GuildRank.G,
    cost: 0,
    effect: { type: EffectType.QUALITY_UP, value: 10 },
    targetAction: EnhancementTarget.ALCHEMY,
  };

  let deckService: DeckService;

  beforeEach(() => {
    deckService = new DeckService();
  });

  describe('Deck（デッキデータ構造）', () => {
    it('空のデッキを生成できる', () => {
      const deck = createDeck();

      expect(deck.cards).toEqual([]);
      expect(deck.hand).toEqual([]);
      expect(deck.discardPile).toEqual([]);
    });

    it('カードリストからデッキを生成できる', () => {
      const cards = [
        createGatheringCard(sampleGatheringCardData),
        createRecipeCard(sampleRecipeCardData),
      ];
      const deck = createDeck(cards);

      expect(deck.cards).toHaveLength(2);
      expect(deck.hand).toEqual([]);
      expect(deck.discardPile).toEqual([]);
    });
  });

  describe('addCard（カード追加）', () => {
    it('デッキにカードを追加できる', () => {
      const deck = createDeck();
      const card = createGatheringCard(sampleGatheringCardData);

      const result = deckService.addCard(deck, card);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.cards).toHaveLength(1);
        expect(result.value.cards[0].id).toBe('gathering_forest');
      }
    });

    it('複数のカードを順番に追加できる', () => {
      let deck = createDeck();
      const card1 = createGatheringCard(sampleGatheringCardData);
      const card2 = createRecipeCard(sampleRecipeCardData);

      const result1 = deckService.addCard(deck, card1);
      expect(result1.success).toBe(true);
      if (result1.success) {
        deck = result1.value;
      }

      const result2 = deckService.addCard(deck, card2);
      expect(result2.success).toBe(true);
      if (result2.success) {
        expect(result2.value.cards).toHaveLength(2);
      }
    });

    it('デッキ上限（30枚）を超えると追加できない', () => {
      // 30枚のカードでデッキを作成
      const cards = Array.from({ length: 30 }, (_, i) =>
        createGatheringCard({ ...sampleGatheringCardData, id: `card_${i}` })
      );
      const deck = createDeck(cards);

      // 31枚目を追加しようとする
      const newCard = createGatheringCard({
        ...sampleGatheringCardData,
        id: 'card_31',
      });
      const result = deckService.addCard(deck, newCard);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('デッキは最大30枚までです');
      }
    });
  });

  describe('removeCard（カード削除）', () => {
    it('デッキからカードを削除できる', () => {
      const cards = [
        createGatheringCard({ ...sampleGatheringCardData, id: 'card_1' }),
        createGatheringCard({ ...sampleGatheringCardData, id: 'card_2' }),
      ];
      const deck = createDeck(cards);

      const result = deckService.removeCard(deck, 'card_1');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.cards).toHaveLength(1);
        expect(result.value.cards[0].id).toBe('card_2');
      }
    });

    it('存在しないカードIDで削除しようとするとエラー', () => {
      const deck = createDeck([createGatheringCard(sampleGatheringCardData)]);

      const result = deckService.removeCard(deck, 'non_existent');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('指定されたカードが見つかりません');
      }
    });
  });

  describe('draw（ドロー）', () => {
    it('手札にカードをドローできる', () => {
      const cards = [
        createGatheringCard({ ...sampleGatheringCardData, id: 'card_1' }),
        createGatheringCard({ ...sampleGatheringCardData, id: 'card_2' }),
        createGatheringCard({ ...sampleGatheringCardData, id: 'card_3' }),
      ];
      const deck = createDeck(cards);

      const result = deckService.draw(deck, 2);

      expect(result.success).toBe(true);
      if (result.success) {
        const [newDeck, drawnCards] = result.value;
        expect(drawnCards).toHaveLength(2);
        expect(newDeck.hand).toHaveLength(2);
        expect(newDeck.cards).toHaveLength(1);
      }
    });

    it('デッキ枚数より多くドローすると残り全てをドロー', () => {
      const cards = [
        createGatheringCard({ ...sampleGatheringCardData, id: 'card_1' }),
        createGatheringCard({ ...sampleGatheringCardData, id: 'card_2' }),
      ];
      const deck = createDeck(cards);

      const result = deckService.draw(deck, 5);

      expect(result.success).toBe(true);
      if (result.success) {
        const [newDeck, drawnCards] = result.value;
        expect(drawnCards).toHaveLength(2);
        expect(newDeck.hand).toHaveLength(2);
        expect(newDeck.cards).toHaveLength(0);
      }
    });

    it('デッキが空で捨て札がある場合、捨て札をシャッフルしてデッキに戻す', () => {
      const discardCards = [
        createGatheringCard({ ...sampleGatheringCardData, id: 'card_1' }),
        createGatheringCard({ ...sampleGatheringCardData, id: 'card_2' }),
      ];
      const deck: Deck = {
        cards: [],
        hand: [],
        discardPile: discardCards,
      };

      const result = deckService.draw(deck, 1);

      expect(result.success).toBe(true);
      if (result.success) {
        const [newDeck, drawnCards] = result.value;
        expect(drawnCards).toHaveLength(1);
        expect(newDeck.hand).toHaveLength(1);
        // 捨て札が空になり、残りがデッキに戻る
        expect(newDeck.discardPile).toHaveLength(0);
        expect(newDeck.cards.length + newDeck.hand.length).toBe(2);
      }
    });

    it('デッキも捨て札も空の場合は何もドローできない', () => {
      const deck: Deck = {
        cards: [],
        hand: [],
        discardPile: [],
      };

      const result = deckService.draw(deck, 1);

      expect(result.success).toBe(true);
      if (result.success) {
        const [newDeck, drawnCards] = result.value;
        expect(drawnCards).toHaveLength(0);
        expect(newDeck.hand).toHaveLength(0);
      }
    });
  });

  describe('useCard（カード使用）', () => {
    it('手札からカードを使用できる', () => {
      const handCards = [
        createGatheringCard({ ...sampleGatheringCardData, id: 'card_1' }),
        createGatheringCard({ ...sampleGatheringCardData, id: 'card_2' }),
      ];
      const deck: Deck = {
        cards: [],
        hand: handCards,
        discardPile: [],
      };

      const result = deckService.useCard(deck, 'card_1');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.hand).toHaveLength(1);
        expect(result.value.hand[0].id).toBe('card_2');
      }
    });

    it('使用済みカードは捨て札に移動する', () => {
      const handCards = [
        createGatheringCard({ ...sampleGatheringCardData, id: 'card_1' }),
      ];
      const deck: Deck = {
        cards: [],
        hand: handCards,
        discardPile: [],
      };

      const result = deckService.useCard(deck, 'card_1');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.discardPile).toHaveLength(1);
        expect(result.value.discardPile[0].id).toBe('card_1');
      }
    });

    it('手札にないカードを使用しようとするとエラー', () => {
      const deck: Deck = {
        cards: [createGatheringCard(sampleGatheringCardData)],
        hand: [],
        discardPile: [],
      };

      const result = deckService.useCard(deck, 'gathering_forest');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('指定されたカードが手札にありません');
      }
    });
  });

  describe('shuffle（シャッフル）', () => {
    it('デッキをシャッフルできる', () => {
      const cards = Array.from({ length: 10 }, (_, i) =>
        createGatheringCard({ ...sampleGatheringCardData, id: `card_${i}` })
      );
      const deck = createDeck(cards);
      const originalOrder = deck.cards.map((c) => c.id);

      // シャッフルを複数回実行して少なくとも1回は順序が変わることを確認
      let orderChanged = false;
      for (let i = 0; i < 10; i++) {
        const shuffledDeck = deckService.shuffle(deck);
        const newOrder = shuffledDeck.cards.map((c) => c.id);
        if (JSON.stringify(originalOrder) !== JSON.stringify(newOrder)) {
          orderChanged = true;
          break;
        }
      }

      expect(orderChanged).toBe(true);
    });

    it('シャッフル後もカード枚数は変わらない', () => {
      const cards = Array.from({ length: 5 }, (_, i) =>
        createGatheringCard({ ...sampleGatheringCardData, id: `card_${i}` })
      );
      const deck = createDeck(cards);

      const shuffledDeck = deckService.shuffle(deck);

      expect(shuffledDeck.cards).toHaveLength(5);
    });

    it('捨て札をシャッフルしてデッキに戻せる', () => {
      const discardCards = [
        createGatheringCard({ ...sampleGatheringCardData, id: 'card_1' }),
        createGatheringCard({ ...sampleGatheringCardData, id: 'card_2' }),
      ];
      const deck: Deck = {
        cards: [],
        hand: [],
        discardPile: discardCards,
      };

      const result = deckService.shuffleDiscardIntoDeck(deck);

      expect(result.cards).toHaveLength(2);
      expect(result.discardPile).toHaveLength(0);
    });
  });

  describe('createInitialDeck（初期デッキ生成）', () => {
    it('初期デッキを生成できる', () => {
      const deck = deckService.createInitialDeck();

      expect(deck).toBeDefined();
      expect(deck.cards.length).toBeGreaterThan(0);
      expect(deck.hand).toEqual([]);
      expect(deck.discardPile).toEqual([]);
    });

    it('初期デッキはGランクのカードのみ含む', () => {
      const deck = deckService.createInitialDeck();

      for (const card of deck.cards) {
        expect(card.unlockRank).toBe(GuildRank.G);
      }
    });
  });

  describe('getTotalCardCount（総カード数取得）', () => {
    it('デッキ・手札・捨て札の合計枚数を取得できる', () => {
      const deck: Deck = {
        cards: [
          createGatheringCard({ ...sampleGatheringCardData, id: 'card_1' }),
          createGatheringCard({ ...sampleGatheringCardData, id: 'card_2' }),
        ],
        hand: [
          createGatheringCard({ ...sampleGatheringCardData, id: 'card_3' }),
        ],
        discardPile: [
          createGatheringCard({ ...sampleGatheringCardData, id: 'card_4' }),
          createGatheringCard({ ...sampleGatheringCardData, id: 'card_5' }),
        ],
      };

      const count = deckService.getTotalCardCount(deck);

      expect(count).toBe(5);
    });
  });

  describe('getCardById（カード取得）', () => {
    it('IDでデッキからカードを取得できる', () => {
      const cards = [
        createGatheringCard({ ...sampleGatheringCardData, id: 'card_1' }),
        createRecipeCard({ ...sampleRecipeCardData, id: 'card_2' }),
      ];
      const deck = createDeck(cards);

      const card = deckService.getCardById(deck, 'card_2');

      expect(card).toBeDefined();
      expect(card?.id).toBe('card_2');
    });

    it('手札からもカードを取得できる', () => {
      const deck: Deck = {
        cards: [],
        hand: [createGatheringCard({ ...sampleGatheringCardData, id: 'hand_card' })],
        discardPile: [],
      };

      const card = deckService.getCardById(deck, 'hand_card');

      expect(card).toBeDefined();
      expect(card?.id).toBe('hand_card');
    });

    it('捨て札からもカードを取得できる', () => {
      const deck: Deck = {
        cards: [],
        hand: [],
        discardPile: [createGatheringCard({ ...sampleGatheringCardData, id: 'discard_card' })],
      };

      const card = deckService.getCardById(deck, 'discard_card');

      expect(card).toBeDefined();
      expect(card?.id).toBe('discard_card');
    });

    it('存在しないIDの場合はundefinedを返す', () => {
      const deck = createDeck();

      const card = deckService.getCardById(deck, 'non_existent');

      expect(card).toBeUndefined();
    });
  });

  describe('不変性', () => {
    it('addCardは元のデッキを変更しない', () => {
      const deck = createDeck();
      const originalCards = [...deck.cards];

      const result = deckService.addCard(deck, createGatheringCard(sampleGatheringCardData));

      expect(deck.cards).toEqual(originalCards);
      if (result.success) {
        expect(result.value.cards).not.toBe(deck.cards);
      }
    });

    it('removeCardは元のデッキを変更しない', () => {
      const cards = [createGatheringCard(sampleGatheringCardData)];
      const deck = createDeck(cards);
      const originalLength = deck.cards.length;

      const result = deckService.removeCard(deck, 'gathering_forest');

      expect(deck.cards).toHaveLength(originalLength);
      if (result.success) {
        expect(result.value.cards).not.toBe(deck.cards);
      }
    });

    it('drawは元のデッキを変更しない', () => {
      const cards = [
        createGatheringCard({ ...sampleGatheringCardData, id: 'card_1' }),
        createGatheringCard({ ...sampleGatheringCardData, id: 'card_2' }),
      ];
      const deck = createDeck(cards);
      const originalLength = deck.cards.length;

      const result = deckService.draw(deck, 1);

      expect(deck.cards).toHaveLength(originalLength);
      if (result.success) {
        expect(result.value[0].cards).not.toBe(deck.cards);
      }
    });
  });
});
