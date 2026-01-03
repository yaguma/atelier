/**
 * デッキドメインサービス
 * TASK-0090: デッキドメインサービス
 *
 * デッキの操作（追加、削除、ドロー、使用、シャッフル）を管理する
 */

import {
  GatheringCard,
  RecipeCard,
  EnhancementCard,
  createGatheringCard,
  createRecipeCard,
  createEnhancementCard,
} from '@domain/card/CardEntity';
import type { Card } from '@domain/card/Card';
import { CardType, GuildRank, Rarity, EffectType, EnhancementTarget, ItemCategory } from '@domain/common/types';

/**
 * 操作結果型
 * 成功時はvalueを、失敗時はerrorを持つ
 */
export type Result<T> =
  | { success: true; value: T }
  | { success: false; error: string };

/**
 * デッキデータ構造
 */
export interface Deck {
  /** デッキ内のカード（ドロー可能） */
  cards: (GatheringCard | RecipeCard | EnhancementCard)[];
  /** 手札のカード */
  hand: (GatheringCard | RecipeCard | EnhancementCard)[];
  /** 捨て札のカード */
  discardPile: (GatheringCard | RecipeCard | EnhancementCard)[];
}

/**
 * デッキの最大枚数
 */
const MAX_DECK_SIZE = 30;

/**
 * 初期デッキのカード定義（Gランク用）
 */
const INITIAL_DECK_CARDS = {
  gathering: [
    {
      id: 'gathering_forest_basic',
      name: '森の入口',
      type: CardType.GATHERING as const,
      rarity: Rarity.COMMON,
      unlockRank: GuildRank.G,
      cost: 1,
      materials: [
        { materialId: 'herb', quantity: 2, probability: 0.9 },
        { materialId: 'flower', quantity: 1, probability: 0.6 },
      ],
    },
    {
      id: 'gathering_cave_basic',
      name: '洞窟入口',
      type: CardType.GATHERING as const,
      rarity: Rarity.COMMON,
      unlockRank: GuildRank.G,
      cost: 1,
      materials: [
        { materialId: 'ore', quantity: 1, probability: 0.8 },
        { materialId: 'crystal', quantity: 1, probability: 0.3 },
      ],
    },
  ],
  recipe: [
    {
      id: 'recipe_healing_basic',
      name: '初級ヒーリングポーション',
      type: CardType.RECIPE as const,
      rarity: Rarity.COMMON,
      unlockRank: GuildRank.G,
      cost: 1,
      requiredMaterials: [{ materialId: 'herb', quantity: 2 }],
      outputItemId: 'healing_potion_basic',
      category: ItemCategory.MEDICINE,
    },
  ],
  enhancement: [
    {
      id: 'enhancement_quality_basic',
      name: '品質向上・初級',
      type: CardType.ENHANCEMENT as const,
      rarity: Rarity.COMMON,
      unlockRank: GuildRank.G,
      cost: 0 as const,
      effect: { type: EffectType.QUALITY_UP, value: 5 },
      targetAction: EnhancementTarget.ALCHEMY,
    },
  ],
};

/**
 * 空のデッキを生成する
 * @param cards 初期カード（オプション）
 * @returns 新しいデッキ
 */
export function createDeck(cards: (GatheringCard | RecipeCard | EnhancementCard)[] = []): Deck {
  return {
    cards: [...cards],
    hand: [],
    discardPile: [],
  };
}

/**
 * デッキドメインサービス
 * デッキに関するビジネスロジックを提供する
 */
export class DeckService {
  /**
   * デッキにカードを追加する
   * @param deck 対象デッキ
   * @param card 追加するカード
   * @returns 操作結果
   */
  addCard(deck: Deck, card: GatheringCard | RecipeCard | EnhancementCard): Result<Deck> {
    const totalCount = this.getTotalCardCount(deck);

    if (totalCount >= MAX_DECK_SIZE) {
      return { success: false, error: 'デッキは最大30枚までです' };
    }

    return {
      success: true,
      value: {
        ...deck,
        cards: [...deck.cards, card],
      },
    };
  }

  /**
   * デッキからカードを削除する
   * @param deck 対象デッキ
   * @param cardId 削除するカードID
   * @returns 操作結果
   */
  removeCard(deck: Deck, cardId: string): Result<Deck> {
    const cardIndex = deck.cards.findIndex((c) => c.id === cardId);

    if (cardIndex === -1) {
      return { success: false, error: '指定されたカードが見つかりません' };
    }

    const newCards = [...deck.cards];
    newCards.splice(cardIndex, 1);

    return {
      success: true,
      value: {
        ...deck,
        cards: newCards,
      },
    };
  }

  /**
   * デッキからカードをドローする
   * @param deck 対象デッキ
   * @param count ドロー枚数
   * @returns 操作結果（新しいデッキとドローしたカード）
   */
  draw(deck: Deck, count: number): Result<[Deck, (GatheringCard | RecipeCard | EnhancementCard)[]]> {
    let currentDeck = { ...deck };

    // デッキが空で捨て札がある場合、捨て札をシャッフルしてデッキに戻す
    if (currentDeck.cards.length === 0 && currentDeck.discardPile.length > 0) {
      currentDeck = this.shuffleDiscardIntoDeck(currentDeck);
    }

    // ドロー可能な枚数を計算
    const actualDrawCount = Math.min(count, currentDeck.cards.length);

    if (actualDrawCount === 0) {
      return {
        success: true,
        value: [currentDeck, []],
      };
    }

    // ドローするカードを取得
    const drawnCards = currentDeck.cards.slice(0, actualDrawCount);
    const remainingCards = currentDeck.cards.slice(actualDrawCount);

    const newDeck: Deck = {
      cards: remainingCards,
      hand: [...currentDeck.hand, ...drawnCards],
      discardPile: [...currentDeck.discardPile],
    };

    return {
      success: true,
      value: [newDeck, drawnCards],
    };
  }

  /**
   * 手札からカードを使用する
   * @param deck 対象デッキ
   * @param cardId 使用するカードID
   * @returns 操作結果
   */
  useCard(deck: Deck, cardId: string): Result<Deck> {
    const cardIndex = deck.hand.findIndex((c) => c.id === cardId);

    if (cardIndex === -1) {
      return { success: false, error: '指定されたカードが手札にありません' };
    }

    const usedCard = deck.hand[cardIndex];
    const newHand = [...deck.hand];
    newHand.splice(cardIndex, 1);

    return {
      success: true,
      value: {
        ...deck,
        hand: newHand,
        discardPile: [...deck.discardPile, usedCard],
      },
    };
  }

  /**
   * デッキをシャッフルする
   * @param deck 対象デッキ
   * @returns シャッフルされたデッキ
   */
  shuffle(deck: Deck): Deck {
    const shuffledCards = [...deck.cards];

    // Fisher-Yates シャッフル
    for (let i = shuffledCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]];
    }

    return {
      ...deck,
      cards: shuffledCards,
    };
  }

  /**
   * 捨て札をシャッフルしてデッキに戻す
   * @param deck 対象デッキ
   * @returns 新しいデッキ
   */
  shuffleDiscardIntoDeck(deck: Deck): Deck {
    const combinedCards = [...deck.cards, ...deck.discardPile];

    // Fisher-Yates シャッフル
    for (let i = combinedCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [combinedCards[i], combinedCards[j]] = [combinedCards[j], combinedCards[i]];
    }

    return {
      cards: combinedCards,
      hand: [...deck.hand],
      discardPile: [],
    };
  }

  /**
   * 初期デッキを生成する
   * @returns 初期デッキ
   */
  createInitialDeck(): Deck {
    const cards: (GatheringCard | RecipeCard | EnhancementCard)[] = [];

    // 採取地カードを追加（各2枚）
    for (const data of INITIAL_DECK_CARDS.gathering) {
      cards.push(createGatheringCard(data));
      cards.push(createGatheringCard({ ...data, id: `${data.id}_2` }));
    }

    // レシピカードを追加（各2枚）
    for (const data of INITIAL_DECK_CARDS.recipe) {
      cards.push(createRecipeCard(data));
      cards.push(createRecipeCard({ ...data, id: `${data.id}_2` }));
    }

    // 強化カードを追加（各2枚）
    for (const data of INITIAL_DECK_CARDS.enhancement) {
      cards.push(createEnhancementCard(data));
      cards.push(createEnhancementCard({ ...data, id: `${data.id}_2` }));
    }

    return createDeck(cards);
  }

  /**
   * デッキ・手札・捨て札の合計枚数を取得する
   * @param deck 対象デッキ
   * @returns 合計枚数
   */
  getTotalCardCount(deck: Deck): number {
    return deck.cards.length + deck.hand.length + deck.discardPile.length;
  }

  /**
   * IDでカードを検索する
   * @param deck 対象デッキ
   * @param cardId カードID
   * @returns カード（見つからない場合はundefined）
   */
  getCardById(deck: Deck, cardId: string): GatheringCard | RecipeCard | EnhancementCard | undefined {
    // デッキを検索
    const inDeck = deck.cards.find((c) => c.id === cardId);
    if (inDeck) return inDeck;

    // 手札を検索
    const inHand = deck.hand.find((c) => c.id === cardId);
    if (inHand) return inHand;

    // 捨て札を検索
    const inDiscard = deck.discardPile.find((c) => c.id === cardId);
    if (inDiscard) return inDiscard;

    return undefined;
  }
}
