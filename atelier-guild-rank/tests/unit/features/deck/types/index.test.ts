/**
 * features/deck/types エクスポートテスト
 *
 * TASK-0068: features/deck/types作成
 *
 * @description
 * デッキ機能の型定義が正しくエクスポートされていることを確認する。
 */

import type {
  CardData,
  CardId,
  CardMaster,
  ICard,
  ICardEffect,
  IDeckService,
  IEnhancementCard,
  IEnhancementCardMaster,
  IEnhancementEffect,
  IGatheringCard,
  IGatheringCardMaster,
  IGatheringMaterial,
  IRecipeCard,
  IRecipeCardMaster,
  IRecipeRequiredMaterial,
  IRequiredMaterial,
} from '@features/deck/types';
import {
  Card,
  CardType,
  isEnhancementCard,
  isEnhancementCardMaster,
  isGatheringCard,
  isGatheringCardMaster,
  isRecipeCard,
  isRecipeCardMaster,
  toCardId,
} from '@features/deck/types';
import { describe, expect, it } from 'vitest';

describe('features/deck/types', () => {
  describe('Card型', () => {
    it('@features/deck/typesからCardクラスがインポートできること', () => {
      expect(Card).toBeDefined();
      expect(typeof Card).toBe('function');
    });

    it('CardType定数がインポートできること', () => {
      expect(CardType).toBeDefined();
      expect(CardType.GATHERING).toBe('GATHERING');
      expect(CardType.RECIPE).toBe('RECIPE');
      expect(CardType.ENHANCEMENT).toBe('ENHANCEMENT');
    });

    it('toCardId関数がインポートできること', () => {
      expect(toCardId).toBeDefined();
      const id: CardId = toCardId('test-card');
      expect(id).toBe('test-card');
    });

    it('CardData型（ユニオン型）が利用できること', () => {
      const gatheringCard: CardData = {
        id: toCardId('gather-1'),
        name: '森の採取地',
        type: CardType.GATHERING,
        rarity: 'COMMON',
        unlockRank: 'G',
        cost: 1,
        materials: [],
      };
      expect(gatheringCard.type).toBe('GATHERING');
    });

    it('ICard型が利用できること', () => {
      const card: ICard = {
        id: toCardId('card-1'),
        name: 'テストカード',
        type: CardType.GATHERING,
        rarity: 'COMMON',
        unlockRank: 'G',
      };
      expect(card.name).toBe('テストカード');
    });

    it('ICardEffect型が利用できること', () => {
      const effect: ICardEffect = {
        type: 'QUALITY_UP',
        value: 10,
      };
      expect(effect.type).toBe('QUALITY_UP');
    });
  });

  describe('型ガード関数', () => {
    const gatheringCard: CardData = {
      id: toCardId('gather-1'),
      name: '森の採取地',
      type: CardType.GATHERING,
      rarity: 'COMMON',
      unlockRank: 'G',
      cost: 1,
      materials: [],
    };

    const recipeCard: CardData = {
      id: toCardId('recipe-1'),
      name: '回復薬レシピ',
      type: CardType.RECIPE,
      rarity: 'COMMON',
      unlockRank: 'G',
      cost: 2,
      requiredMaterials: [],
      outputItemId: 'item-1',
      category: 'CONSUMABLE',
    };

    const enhancementCard: CardData = {
      id: toCardId('enhance-1'),
      name: '品質向上',
      type: CardType.ENHANCEMENT,
      rarity: 'COMMON',
      unlockRank: 'G',
      cost: 0 as const,
      effect: { type: 'QUALITY_UP', value: 10 },
      targetAction: 'ALCHEMY',
    };

    it('isGatheringCard型ガードが正しく動作すること', () => {
      expect(isGatheringCard(gatheringCard)).toBe(true);
      expect(isGatheringCard(recipeCard)).toBe(false);
      expect(isGatheringCard(enhancementCard)).toBe(false);
    });

    it('isRecipeCard型ガードが正しく動作すること', () => {
      expect(isRecipeCard(gatheringCard)).toBe(false);
      expect(isRecipeCard(recipeCard)).toBe(true);
      expect(isRecipeCard(enhancementCard)).toBe(false);
    });

    it('isEnhancementCard型ガードが正しく動作すること', () => {
      expect(isEnhancementCard(gatheringCard)).toBe(false);
      expect(isEnhancementCard(recipeCard)).toBe(false);
      expect(isEnhancementCard(enhancementCard)).toBe(true);
    });
  });

  describe('カードマスターデータ型', () => {
    it('isGatheringCardMaster型ガードが正しく動作すること', () => {
      const master: CardMaster = {
        id: toCardId('gather-master-1'),
        name: '森の採取地',
        type: 'GATHERING',
        baseCost: 1,
        presentationCount: 3,
        rareRate: 10,
        materialPool: ['mat-1', 'mat-2'],
        rarity: 'COMMON',
        unlockRank: 'G',
        description: 'テスト',
      };
      expect(isGatheringCardMaster(master)).toBe(true);
    });

    it('isRecipeCardMaster型ガードが正しく動作すること', () => {
      const master: CardMaster = {
        id: toCardId('recipe-master-1'),
        name: '回復薬',
        type: 'RECIPE',
        cost: 2,
        requiredMaterials: [],
        outputItemId: 'item-1',
        category: 'CONSUMABLE',
        rarity: 'COMMON',
        unlockRank: 'G',
        description: 'テスト',
      };
      expect(isRecipeCardMaster(master)).toBe(true);
    });

    it('isEnhancementCardMaster型ガードが正しく動作すること', () => {
      const master: CardMaster = {
        id: toCardId('enhance-master-1'),
        name: '品質向上',
        type: 'ENHANCEMENT',
        cost: 0,
        effect: { type: 'QUALITY_UP', value: 10 },
        targetAction: 'ALCHEMY',
        rarity: 'COMMON',
        unlockRank: 'G',
        description: 'テスト',
      };
      expect(isEnhancementCardMaster(master)).toBe(true);
    });
  });

  describe('IDeckService', () => {
    it('@features/deck/typesからIDeckService型がインポートできること', () => {
      // IDeckServiceは型のみなので、型を使ったオブジェクトを作成して検証
      const mockService: Partial<IDeckService> = {
        initialize: () => {},
        reset: () => {},
        shuffle: () => {},
        getHandSize: () => 0,
      };
      expect(mockService.initialize).toBeDefined();
      expect(mockService.reset).toBeDefined();
      expect(mockService.shuffle).toBeDefined();
      expect(mockService.getHandSize).toBeDefined();
    });

    it('インターフェースの全メソッドが定義されていること', () => {
      // IDeckServiceの全メソッドを型レベルで検証
      const mockService: IDeckService = {
        initialize: (_cardIds) => {},
        reset: () => {},
        shuffle: () => {},
        draw: (_count) => [],
        playCard: (_card) => {},
        discardHand: () => {},
        refillHand: () => {},
        getDeck: () => [],
        getHand: () => [],
        getDiscard: () => [],
        getHandSize: () => 0,
        addCard: (_cardId) => {},
        removeCard: (_cardId) => {},
      };
      expect(mockService).toBeDefined();
      expect(typeof mockService.initialize).toBe('function');
      expect(typeof mockService.draw).toBe('function');
      expect(typeof mockService.playCard).toBe('function');
      expect(typeof mockService.getDeck).toBe('function');
      expect(typeof mockService.getHand).toBe('function');
      expect(typeof mockService.getDiscard).toBe('function');
      expect(typeof mockService.getHandSize).toBe('function');
      expect(typeof mockService.addCard).toBe('function');
      expect(typeof mockService.removeCard).toBe('function');
      expect(typeof mockService.discardHand).toBe('function');
      expect(typeof mockService.refillHand).toBe('function');
      expect(typeof mockService.reset).toBe('function');
      expect(typeof mockService.shuffle).toBe('function');
    });
  });

  describe('サブタイプ型のエクスポート確認', () => {
    it('IGatheringCard関連型が利用できること', () => {
      const material: IGatheringMaterial = {
        materialId: 'mat-1' as unknown as import('@shared/types').MaterialId,
        quantity: 2,
        probability: 0.8,
      };
      expect(material.quantity).toBe(2);

      const card: IGatheringCard = {
        id: toCardId('gather-1'),
        name: 'テスト',
        type: CardType.GATHERING,
        rarity: 'COMMON',
        unlockRank: 'G',
        cost: 1,
        materials: [material],
      };
      expect(card.materials).toHaveLength(1);
    });

    it('IRecipeCard関連型が利用できること', () => {
      const req: IRequiredMaterial = {
        materialId: 'mat-1' as unknown as import('@shared/types').MaterialId,
        quantity: 3,
      };
      expect(req.quantity).toBe(3);

      const card: IRecipeCard = {
        id: toCardId('recipe-1'),
        name: 'テスト',
        type: CardType.RECIPE,
        rarity: 'COMMON',
        unlockRank: 'G',
        cost: 2,
        requiredMaterials: [req],
        outputItemId: 'item-1',
        category: 'CONSUMABLE',
      };
      expect(card.requiredMaterials).toHaveLength(1);
    });

    it('IEnhancementCard関連型が利用できること', () => {
      const card: IEnhancementCard = {
        id: toCardId('enhance-1'),
        name: 'テスト',
        type: CardType.ENHANCEMENT,
        rarity: 'COMMON',
        unlockRank: 'G',
        cost: 0,
        effect: { type: 'QUALITY_UP', value: 10 },
        targetAction: 'ALCHEMY',
      };
      expect(card.effect.value).toBe(10);
    });

    it('カードマスターサブタイプが利用できること', () => {
      const gatheringMaster: IGatheringCardMaster = {
        id: toCardId('master-1'),
        name: 'テスト',
        type: 'GATHERING',
        baseCost: 1,
        presentationCount: 3,
        rareRate: 10,
        materialPool: [],
        rarity: 'COMMON',
        unlockRank: 'G',
        description: 'テスト',
      };
      expect(gatheringMaster.baseCost).toBe(1);

      const recipeMaster: IRecipeCardMaster = {
        id: toCardId('master-2'),
        name: 'テスト',
        type: 'RECIPE',
        cost: 2,
        requiredMaterials: [],
        outputItemId: 'item-1',
        category: 'CONSUMABLE',
        rarity: 'COMMON',
        unlockRank: 'G',
        description: 'テスト',
      };
      expect(recipeMaster.cost).toBe(2);

      const enhanceMaster: IEnhancementCardMaster = {
        id: toCardId('master-3'),
        name: 'テスト',
        type: 'ENHANCEMENT',
        cost: 0,
        effect: { type: 'QUALITY_UP', value: 10 },
        targetAction: 'ALCHEMY',
        rarity: 'COMMON',
        unlockRank: 'G',
        description: 'テスト',
      };
      expect(enhanceMaster.effect.value).toBe(10);

      const reqMaterial: IRecipeRequiredMaterial = {
        materialId: 'mat-1',
        quantity: 2,
      };
      expect(reqMaterial.quantity).toBe(2);

      const enhanceEffect: IEnhancementEffect = {
        type: 'QUALITY_UP',
        value: 10,
      };
      expect(enhanceEffect.value).toBe(10);
    });
  });
});
