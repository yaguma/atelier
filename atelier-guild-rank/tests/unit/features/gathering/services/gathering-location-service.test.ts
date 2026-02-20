/**
 * gathering-location-service.test.ts - 採取場所サービスのテスト
 *
 * TASK-0105: 採取場所データ定義とGatheringService拡張
 *
 * getAvailableLocations(), getLocationDetail(), getSelectableLocations()の動作を検証する。
 */

import type { IGatheringLocationData } from '@features/gathering';
import {
  GATHERING_LOCATIONS,
  getAvailableLocations,
  getLocationDetail,
  getSelectableLocations,
} from '@features/gathering';
import type { Card, IGatheringCard, IRecipeCard } from '@shared/types';
import { CardType, GuildRank, ItemCategory, Rarity, toCardId } from '@shared/types';
import { describe, expect, it } from 'vitest';

// =============================================================================
// テストヘルパー
// =============================================================================

function createGatheringCard(overrides: Partial<IGatheringCard> = {}): IGatheringCard {
  return {
    id: toCardId('gathering-forest'),
    name: '近くの森',
    type: CardType.GATHERING,
    rarity: Rarity.COMMON,
    unlockRank: GuildRank.G,
    cost: 1,
    materials: [],
    ...overrides,
  };
}

function createNonGatheringCard(): IRecipeCard {
  return {
    id: toCardId('recipe-potion'),
    name: '回復薬レシピ',
    type: CardType.RECIPE,
    rarity: Rarity.COMMON,
    unlockRank: GuildRank.G,
    cost: 1,
    requiredMaterials: [],
    outputItemId: 'potion',
    category: ItemCategory.MEDICINE,
  };
}

const testLocations: readonly IGatheringLocationData[] = [
  {
    cardId: toCardId('gathering-forest'),
    name: '近くの森',
    movementAPCost: 1,
    availableMaterials: [
      { name: '薬草', rarity: 'Common', dropRate: 'high' },
      { name: '毒草', rarity: 'Common', dropRate: 'medium' },
    ],
    mapX: 100,
    mapY: 200,
  },
  {
    cardId: toCardId('gathering-mine'),
    name: '鉱山',
    movementAPCost: 1,
    availableMaterials: [{ name: '鉄鉱石', rarity: 'Common', dropRate: 'high' }],
    mapX: 300,
    mapY: 150,
  },
  {
    cardId: toCardId('gathering-ruins'),
    name: '古代遺跡',
    movementAPCost: 2,
    availableMaterials: [{ name: '古代の欠片', rarity: 'Uncommon', dropRate: 'high' }],
    mapX: 400,
    mapY: 100,
  },
];

// =============================================================================
// getAvailableLocations テスト
// =============================================================================

describe('getAvailableLocations', () => {
  it('手札カードに対応する場所のみisSelectable=trueになる', () => {
    const hand: Card[] = [
      createGatheringCard({ id: toCardId('gathering-forest') }),
      createGatheringCard({ id: toCardId('gathering-mine') }),
    ];

    const result = getAvailableLocations(hand, testLocations);

    expect(result).toHaveLength(3);
    expect(result[0].cardId).toBe('gathering-forest');
    expect(result[0].isSelectable).toBe(true);
    expect(result[1].cardId).toBe('gathering-mine');
    expect(result[1].isSelectable).toBe(true);
    expect(result[2].cardId).toBe('gathering-ruins');
    expect(result[2].isSelectable).toBe(false);
  });

  it('手札に採取地カードがない場合、全てisSelectable=falseになる', () => {
    const hand: Card[] = [createNonGatheringCard()];

    const result = getAvailableLocations(hand, testLocations);

    expect(result).toHaveLength(3);
    for (const location of result) {
      expect(location.isSelectable).toBe(false);
    }
  });

  it('手札が空の場合、全てisSelectable=falseになる', () => {
    const result = getAvailableLocations([], testLocations);

    expect(result).toHaveLength(3);
    for (const location of result) {
      expect(location.isSelectable).toBe(false);
    }
  });

  it('場所データが空の場合、空配列が返る', () => {
    const hand: Card[] = [createGatheringCard()];

    const result = getAvailableLocations(hand, []);

    expect(result).toHaveLength(0);
  });

  it('各場所にAPコストと素材プレビューが含まれる', () => {
    const hand: Card[] = [createGatheringCard({ id: toCardId('gathering-forest') })];

    const result = getAvailableLocations(hand, testLocations);

    const forest = result.find((l) => l.cardId === 'gathering-forest');
    expect(forest).toBeDefined();
    expect(forest?.movementAPCost).toBe(1);
    expect(forest?.availableMaterials).toHaveLength(2);
    expect(forest?.availableMaterials[0].name).toBe('薬草');
    expect(forest?.availableMaterials[0].dropRate).toBe('high');
  });

  it('マップ座標が保持される', () => {
    const result = getAvailableLocations([], testLocations);

    expect(result[0].mapX).toBe(100);
    expect(result[0].mapY).toBe(200);
    expect(result[1].mapX).toBe(300);
    expect(result[1].mapY).toBe(150);
  });

  it('手札に非採取カードが混在しても正しくフィルタリングされる', () => {
    const hand: Card[] = [
      createNonGatheringCard(),
      createGatheringCard({ id: toCardId('gathering-mine') }),
      createNonGatheringCard(),
    ];

    const result = getAvailableLocations(hand, testLocations);

    const selectableCount = result.filter((l) => l.isSelectable).length;
    expect(selectableCount).toBe(1);
    expect(result.find((l) => l.cardId === 'gathering-mine')?.isSelectable).toBe(true);
  });

  describe('純粋関数の検証', () => {
    it('同じ入力に対して常に同じ結果を返す', () => {
      const hand: Card[] = [createGatheringCard({ id: toCardId('gathering-forest') })];

      const result1 = getAvailableLocations(hand, testLocations);
      const result2 = getAvailableLocations(hand, testLocations);

      expect(result1).toEqual(result2);
    });

    it('入力の手札配列が変更されない', () => {
      const hand: Card[] = [createGatheringCard({ id: toCardId('gathering-forest') })];
      const handCopy = [...hand];

      getAvailableLocations(hand, testLocations);

      expect(hand).toEqual(handCopy);
    });
  });
});

// =============================================================================
// getLocationDetail テスト
// =============================================================================

describe('getLocationDetail', () => {
  it('存在するカードIDに対して場所データが返る', () => {
    const result = getLocationDetail(toCardId('gathering-forest'), testLocations);

    expect(result).toBeDefined();
    expect(result?.name).toBe('近くの森');
    expect(result?.movementAPCost).toBe(1);
    expect(result?.availableMaterials).toHaveLength(2);
  });

  it('存在しないカードIDに対してundefinedが返る', () => {
    const result = getLocationDetail(toCardId('nonexistent'), testLocations);

    expect(result).toBeUndefined();
  });

  it('場所データが空の場合、undefinedが返る', () => {
    const result = getLocationDetail(toCardId('gathering-forest'), []);

    expect(result).toBeUndefined();
  });

  it('APコスト2の場所の詳細を正しく返す', () => {
    const result = getLocationDetail(toCardId('gathering-ruins'), testLocations);

    expect(result).toBeDefined();
    expect(result?.name).toBe('古代遺跡');
    expect(result?.movementAPCost).toBe(2);
  });
});

// =============================================================================
// getSelectableLocations テスト
// =============================================================================

describe('getSelectableLocations', () => {
  it('手札にある採取地カードに対応する場所のみ返す', () => {
    const hand: Card[] = [
      createGatheringCard({ id: toCardId('gathering-forest') }),
      createGatheringCard({ id: toCardId('gathering-mine') }),
    ];

    const result = getSelectableLocations(hand, testLocations);

    expect(result).toHaveLength(2);
    expect(result[0].cardId).toBe('gathering-forest');
    expect(result[1].cardId).toBe('gathering-mine');
    for (const location of result) {
      expect(location.isSelectable).toBe(true);
    }
  });

  it('手札に採取地カードがない場合、空配列が返る', () => {
    const hand: Card[] = [createNonGatheringCard()];

    const result = getSelectableLocations(hand, testLocations);

    expect(result).toHaveLength(0);
  });

  it('手札が空の場合、空配列が返る', () => {
    const result = getSelectableLocations([], testLocations);

    expect(result).toHaveLength(0);
  });
});

// =============================================================================
// マスタデータ検証テスト
// =============================================================================

describe('GATHERING_LOCATIONS マスタデータ', () => {
  it('全ての場所にcardIdが設定されている', () => {
    for (const location of GATHERING_LOCATIONS) {
      expect(location.cardId).toBeTruthy();
    }
  });

  it('全ての場所に正の移動APコストが設定されている', () => {
    for (const location of GATHERING_LOCATIONS) {
      expect(location.movementAPCost).toBeGreaterThan(0);
    }
  });

  it('全ての場所に1つ以上の素材プレビューがある', () => {
    for (const location of GATHERING_LOCATIONS) {
      expect(location.availableMaterials.length).toBeGreaterThan(0);
    }
  });

  it('全ての素材プレビューにdropRateが設定されている', () => {
    for (const location of GATHERING_LOCATIONS) {
      for (const material of location.availableMaterials) {
        expect(['high', 'medium', 'low']).toContain(material.dropRate);
      }
    }
  });

  it('全ての場所にマップ座標が設定されている', () => {
    for (const location of GATHERING_LOCATIONS) {
      expect(typeof location.mapX).toBe('number');
      expect(typeof location.mapY).toBe('number');
    }
  });

  it('cardIdが重複していない', () => {
    const cardIds = GATHERING_LOCATIONS.map((l) => l.cardId);
    const uniqueCardIds = new Set(cardIds);
    expect(uniqueCardIds.size).toBe(cardIds.length);
  });
});
