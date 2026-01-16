/**
 * cards.ts テストケース
 * カード関連型の型安全性テスト
 *
 * @description
 * TC-CARDS-001 〜 TC-CARDS-047 を実装
 */

// 型インポート（TDD Red: これらの型はまだ存在しない）
import type {
  Card,
  ICard,
  ICardEffect,
  IEnhancementCard,
  IGatheringCard,
  IGatheringMaterial,
  IRecipeCard,
  IRequiredMaterial,
} from '@shared/types';
// 列挙型・ID型インポート
import {
  CardType,
  EffectType,
  EnhancementTarget,
  GuildRank,
  ItemCategory,
  isEnhancementCard,
  isGatheringCard,
  isRecipeCard,
  Rarity,
  toCardId,
  toMaterialId,
} from '@shared/types';
import { describe, expect, it } from 'vitest';

// =============================================================================
// 4.1 ICardインターフェース
// =============================================================================

describe('cards.ts', () => {
  describe('ICardインターフェース', () => {
    // TC-CARDS-001
    it('ICard型がインポート可能', () => {
      const card: ICard = {
        id: toCardId('card-001'),
        name: 'Test Card',
        type: CardType.GATHERING,
        rarity: Rarity.COMMON,
        unlockRank: GuildRank.G,
      };
      expect(card).toBeDefined();
    });

    // TC-CARDS-002
    it('ICardにid, name, type, rarity, unlockRankが必須', () => {
      // @ts-expect-error - 必須プロパティなしで型エラー
      const invalidCard: ICard = {
        id: toCardId('card-001'),
        name: 'Test Card',
        // type, rarity, unlockRank が欠けている
      };
      expect(invalidCard).toBeDefined();
    });

    // TC-CARDS-003
    it('ICard.descriptionがオプショナル', () => {
      const cardWithDesc: ICard = {
        id: toCardId('card-001'),
        name: 'Test Card',
        type: CardType.GATHERING,
        rarity: Rarity.COMMON,
        unlockRank: GuildRank.G,
        description: 'Optional description',
      };
      const cardWithoutDesc: ICard = {
        id: toCardId('card-002'),
        name: 'Test Card 2',
        type: CardType.RECIPE,
        rarity: Rarity.RARE,
        unlockRank: GuildRank.F,
      };
      expect(cardWithDesc.description).toBeDefined();
      expect(cardWithoutDesc.description).toBeUndefined();
    });

    // TC-CARDS-004
    it('ICard.typeがCardType型', () => {
      // @ts-expect-error - 不正な値で型エラー
      const invalidCard: ICard = {
        id: toCardId('card-001'),
        name: 'Test Card',
        type: 'INVALID_TYPE',
        rarity: Rarity.COMMON,
        unlockRank: GuildRank.G,
      };
      expect(invalidCard).toBeDefined();
    });

    // TC-CARDS-005
    it('ICard.rarityがRarity型', () => {
      // @ts-expect-error - 不正な値で型エラー
      const invalidCard: ICard = {
        id: toCardId('card-001'),
        name: 'Test Card',
        type: CardType.GATHERING,
        rarity: 'INVALID_RARITY',
        unlockRank: GuildRank.G,
      };
      expect(invalidCard).toBeDefined();
    });

    // TC-CARDS-006
    it('ICard.unlockRankがGuildRank型', () => {
      // @ts-expect-error - 不正な値で型エラー
      const invalidCard: ICard = {
        id: toCardId('card-001'),
        name: 'Test Card',
        type: CardType.GATHERING,
        rarity: Rarity.COMMON,
        unlockRank: 'INVALID_RANK',
      };
      expect(invalidCard).toBeDefined();
    });
  });

  // =============================================================================
  // 4.2 IGatheringCardインターフェース
  // =============================================================================

  describe('IGatheringCardインターフェース', () => {
    // TC-CARDS-007
    it('IGatheringCard型がインポート可能', () => {
      const gatheringCard: IGatheringCard = {
        id: toCardId('gathering-001'),
        name: 'Forest',
        type: CardType.GATHERING,
        rarity: Rarity.COMMON,
        unlockRank: GuildRank.G,
        cost: 1,
        materials: [],
      };
      expect(gatheringCard).toBeDefined();
    });

    // TC-CARDS-008
    it('IGatheringCardがICardを拡張している', () => {
      const gatheringCard: IGatheringCard = {
        id: toCardId('gathering-001'),
        name: 'Forest',
        type: CardType.GATHERING,
        rarity: Rarity.COMMON,
        unlockRank: GuildRank.G,
        cost: 1,
        materials: [],
      };
      // 基底プロパティがアクセス可能
      expect(gatheringCard.id).toBeDefined();
      expect(gatheringCard.name).toBe('Forest');
      expect(gatheringCard.rarity).toBe(Rarity.COMMON);
    });

    // TC-CARDS-009
    it('IGatheringCard.typeがCardType.GATHERINGに限定', () => {
      // @ts-expect-error - 他の値で型エラー
      const invalidCard: IGatheringCard = {
        id: toCardId('gathering-001'),
        name: 'Forest',
        type: CardType.RECIPE,
        rarity: Rarity.COMMON,
        unlockRank: GuildRank.G,
        cost: 1,
        materials: [],
      };
      expect(invalidCard).toBeDefined();
    });

    // TC-CARDS-010
    it('IGatheringCard.costがnumber型', () => {
      // @ts-expect-error - 文字列で型エラー
      const invalidCard: IGatheringCard = {
        id: toCardId('gathering-001'),
        name: 'Forest',
        type: CardType.GATHERING,
        rarity: Rarity.COMMON,
        unlockRank: GuildRank.G,
        cost: '1',
        materials: [],
      };
      expect(invalidCard).toBeDefined();
    });

    // TC-CARDS-011
    it('IGatheringCard.materialsがIGatheringMaterial[]型', () => {
      // @ts-expect-error - 配列以外で型エラー
      const invalidCard: IGatheringCard = {
        id: toCardId('gathering-001'),
        name: 'Forest',
        type: CardType.GATHERING,
        rarity: Rarity.COMMON,
        unlockRank: GuildRank.G,
        cost: 1,
        materials: 'not-an-array',
      };
      expect(invalidCard).toBeDefined();
    });
  });

  // =============================================================================
  // 4.3 IGatheringMaterialインターフェース
  // =============================================================================

  describe('IGatheringMaterialインターフェース', () => {
    // TC-CARDS-012
    it('IGatheringMaterial型がインポート可能', () => {
      const gatheringMaterial: IGatheringMaterial = {
        materialId: toMaterialId('mat-001'),
        quantity: 1,
        probability: 0.5,
      };
      expect(gatheringMaterial).toBeDefined();
    });

    // TC-CARDS-013
    it('IGatheringMaterial.materialIdが必須', () => {
      // @ts-expect-error - undefined不可
      const invalid: IGatheringMaterial = {
        quantity: 1,
        probability: 0.5,
      };
      expect(invalid).toBeDefined();
    });

    // TC-CARDS-014
    it('IGatheringMaterial.quantityが必須', () => {
      // @ts-expect-error - undefined不可
      const invalid: IGatheringMaterial = {
        materialId: toMaterialId('mat-001'),
        probability: 0.5,
      };
      expect(invalid).toBeDefined();
    });

    // TC-CARDS-015
    it('IGatheringMaterial.probabilityが必須', () => {
      // @ts-expect-error - undefined不可
      const invalid: IGatheringMaterial = {
        materialId: toMaterialId('mat-001'),
        quantity: 1,
      };
      expect(invalid).toBeDefined();
    });

    // TC-CARDS-016
    it('IGatheringMaterial.qualityがオプショナル', () => {
      const withQuality: IGatheringMaterial = {
        materialId: toMaterialId('mat-001'),
        quantity: 1,
        probability: 0.5,
        quality: 'A' as any, // Quality型を使用
      };
      const withoutQuality: IGatheringMaterial = {
        materialId: toMaterialId('mat-002'),
        quantity: 1,
        probability: 0.5,
      };
      expect(withQuality.quality).toBeDefined();
      expect(withoutQuality.quality).toBeUndefined();
    });
  });

  // =============================================================================
  // 4.4 IRecipeCardインターフェース
  // =============================================================================

  describe('IRecipeCardインターフェース', () => {
    // TC-CARDS-017
    it('IRecipeCard型がインポート可能', () => {
      const recipeCard: IRecipeCard = {
        id: toCardId('recipe-001'),
        name: 'Potion',
        type: CardType.RECIPE,
        rarity: Rarity.COMMON,
        unlockRank: GuildRank.G,
        cost: 1,
        requiredMaterials: [],
        outputItemId: 'item-001',
        category: ItemCategory.MEDICINE,
      };
      expect(recipeCard).toBeDefined();
    });

    // TC-CARDS-018
    it('IRecipeCardがICardを拡張している', () => {
      const recipeCard: IRecipeCard = {
        id: toCardId('recipe-001'),
        name: 'Potion',
        type: CardType.RECIPE,
        rarity: Rarity.COMMON,
        unlockRank: GuildRank.G,
        cost: 1,
        requiredMaterials: [],
        outputItemId: 'item-001',
        category: ItemCategory.MEDICINE,
      };
      // 基底プロパティがアクセス可能
      expect(recipeCard.id).toBeDefined();
      expect(recipeCard.name).toBe('Potion');
    });

    // TC-CARDS-019
    it('IRecipeCard.typeがCardType.RECIPEに限定', () => {
      // @ts-expect-error - 他の値で型エラー
      const invalidCard: IRecipeCard = {
        id: toCardId('recipe-001'),
        name: 'Potion',
        type: CardType.GATHERING,
        rarity: Rarity.COMMON,
        unlockRank: GuildRank.G,
        cost: 1,
        requiredMaterials: [],
        outputItemId: 'item-001',
        category: ItemCategory.MEDICINE,
      };
      expect(invalidCard).toBeDefined();
    });

    // TC-CARDS-020
    it('IRecipeCard.costがnumber型', () => {
      // @ts-expect-error - 文字列で型エラー
      const invalidCard: IRecipeCard = {
        id: toCardId('recipe-001'),
        name: 'Potion',
        type: CardType.RECIPE,
        rarity: Rarity.COMMON,
        unlockRank: GuildRank.G,
        cost: '1',
        requiredMaterials: [],
        outputItemId: 'item-001',
        category: ItemCategory.MEDICINE,
      };
      expect(invalidCard).toBeDefined();
    });

    // TC-CARDS-021
    it('IRecipeCard.requiredMaterialsがIRequiredMaterial[]型', () => {
      // @ts-expect-error - 型違いで型エラー
      const invalidCard: IRecipeCard = {
        id: toCardId('recipe-001'),
        name: 'Potion',
        type: CardType.RECIPE,
        rarity: Rarity.COMMON,
        unlockRank: GuildRank.G,
        cost: 1,
        requiredMaterials: 'not-an-array',
        outputItemId: 'item-001',
        category: ItemCategory.MEDICINE,
      };
      expect(invalidCard).toBeDefined();
    });

    // TC-CARDS-022
    it('IRecipeCard.outputItemIdがstring型', () => {
      // @ts-expect-error - 数値で型エラー
      const invalidCard: IRecipeCard = {
        id: toCardId('recipe-001'),
        name: 'Potion',
        type: CardType.RECIPE,
        rarity: Rarity.COMMON,
        unlockRank: GuildRank.G,
        cost: 1,
        requiredMaterials: [],
        outputItemId: 12345,
        category: ItemCategory.MEDICINE,
      };
      expect(invalidCard).toBeDefined();
    });

    // TC-CARDS-023
    it('IRecipeCard.categoryがItemCategory型', () => {
      // @ts-expect-error - 不正な値で型エラー
      const invalidCard: IRecipeCard = {
        id: toCardId('recipe-001'),
        name: 'Potion',
        type: CardType.RECIPE,
        rarity: Rarity.COMMON,
        unlockRank: GuildRank.G,
        cost: 1,
        requiredMaterials: [],
        outputItemId: 'item-001',
        category: 'INVALID_CATEGORY',
      };
      expect(invalidCard).toBeDefined();
    });
  });

  // =============================================================================
  // 4.5 IRequiredMaterialインターフェース
  // =============================================================================

  describe('IRequiredMaterialインターフェース', () => {
    // TC-CARDS-024
    it('IRequiredMaterial型がインポート可能', () => {
      const requiredMaterial: IRequiredMaterial = {
        materialId: toMaterialId('mat-001'),
        quantity: 2,
      };
      expect(requiredMaterial).toBeDefined();
    });

    // TC-CARDS-025
    it('IRequiredMaterial.materialIdが必須', () => {
      // @ts-expect-error - undefined不可
      const invalid: IRequiredMaterial = {
        quantity: 2,
      };
      expect(invalid).toBeDefined();
    });

    // TC-CARDS-026
    it('IRequiredMaterial.quantityが必須', () => {
      // @ts-expect-error - undefined不可
      const invalid: IRequiredMaterial = {
        materialId: toMaterialId('mat-001'),
      };
      expect(invalid).toBeDefined();
    });

    // TC-CARDS-027
    it('IRequiredMaterial.minQualityがオプショナル', () => {
      const withMinQuality: IRequiredMaterial = {
        materialId: toMaterialId('mat-001'),
        quantity: 2,
        minQuality: 'B' as any, // Quality型を使用
      };
      const withoutMinQuality: IRequiredMaterial = {
        materialId: toMaterialId('mat-002'),
        quantity: 1,
      };
      expect(withMinQuality.minQuality).toBeDefined();
      expect(withoutMinQuality.minQuality).toBeUndefined();
    });
  });

  // =============================================================================
  // 4.6 IEnhancementCardインターフェース
  // =============================================================================

  describe('IEnhancementCardインターフェース', () => {
    // TC-CARDS-028
    it('IEnhancementCard型がインポート可能', () => {
      const enhancementCard: IEnhancementCard = {
        id: toCardId('enhancement-001'),
        name: 'Quality Boost',
        type: CardType.ENHANCEMENT,
        rarity: Rarity.RARE,
        unlockRank: GuildRank.E,
        cost: 0,
        effect: {
          type: EffectType.QUALITY_UP,
          value: 10,
        },
        targetAction: EnhancementTarget.ALCHEMY,
      };
      expect(enhancementCard).toBeDefined();
    });

    // TC-CARDS-029
    it('IEnhancementCardがICardを拡張している', () => {
      const enhancementCard: IEnhancementCard = {
        id: toCardId('enhancement-001'),
        name: 'Quality Boost',
        type: CardType.ENHANCEMENT,
        rarity: Rarity.RARE,
        unlockRank: GuildRank.E,
        cost: 0,
        effect: {
          type: EffectType.QUALITY_UP,
          value: 10,
        },
        targetAction: EnhancementTarget.ALCHEMY,
      };
      // 基底プロパティがアクセス可能
      expect(enhancementCard.id).toBeDefined();
      expect(enhancementCard.name).toBe('Quality Boost');
    });

    // TC-CARDS-030
    it('IEnhancementCard.typeがCardType.ENHANCEMENTに限定', () => {
      // @ts-expect-error - 他の値で型エラー
      const invalidCard: IEnhancementCard = {
        id: toCardId('enhancement-001'),
        name: 'Quality Boost',
        type: CardType.GATHERING,
        rarity: Rarity.RARE,
        unlockRank: GuildRank.E,
        cost: 0,
        effect: {
          type: EffectType.QUALITY_UP,
          value: 10,
        },
        targetAction: EnhancementTarget.ALCHEMY,
      };
      expect(invalidCard).toBeDefined();
    });

    // TC-CARDS-031
    it('IEnhancementCard.costが0リテラル型', () => {
      // @ts-expect-error - 1で型エラー
      const invalidCard: IEnhancementCard = {
        id: toCardId('enhancement-001'),
        name: 'Quality Boost',
        type: CardType.ENHANCEMENT,
        rarity: Rarity.RARE,
        unlockRank: GuildRank.E,
        cost: 1,
        effect: {
          type: EffectType.QUALITY_UP,
          value: 10,
        },
        targetAction: EnhancementTarget.ALCHEMY,
      };
      expect(invalidCard).toBeDefined();
    });

    // TC-CARDS-032
    it('IEnhancementCard.effectがICardEffect型', () => {
      // @ts-expect-error - 型違いで型エラー
      const invalidCard: IEnhancementCard = {
        id: toCardId('enhancement-001'),
        name: 'Quality Boost',
        type: CardType.ENHANCEMENT,
        rarity: Rarity.RARE,
        unlockRank: GuildRank.E,
        cost: 0,
        effect: 'not-an-effect',
        targetAction: EnhancementTarget.ALCHEMY,
      };
      expect(invalidCard).toBeDefined();
    });

    // TC-CARDS-033
    it('IEnhancementCard.targetActionがEnhancementTarget型', () => {
      // @ts-expect-error - 不正な値で型エラー
      const invalidCard: IEnhancementCard = {
        id: toCardId('enhancement-001'),
        name: 'Quality Boost',
        type: CardType.ENHANCEMENT,
        rarity: Rarity.RARE,
        unlockRank: GuildRank.E,
        cost: 0,
        effect: {
          type: EffectType.QUALITY_UP,
          value: 10,
        },
        targetAction: 'INVALID_TARGET',
      };
      expect(invalidCard).toBeDefined();
    });
  });

  // =============================================================================
  // 4.7 ICardEffectインターフェース
  // =============================================================================

  describe('ICardEffectインターフェース', () => {
    // TC-CARDS-034
    it('ICardEffect型がインポート可能', () => {
      const cardEffect: ICardEffect = {
        type: EffectType.QUALITY_UP,
        value: 10,
      };
      expect(cardEffect).toBeDefined();
    });

    // TC-CARDS-035
    it('ICardEffect.typeがEffectType型', () => {
      // @ts-expect-error - 不正な値で型エラー
      const invalid: ICardEffect = {
        type: 'INVALID_EFFECT',
        value: 10,
      };
      expect(invalid).toBeDefined();
    });

    // TC-CARDS-036
    it('ICardEffect.valueがnumber型', () => {
      // @ts-expect-error - 文字列で型エラー
      const invalid: ICardEffect = {
        type: EffectType.QUALITY_UP,
        value: '10',
      };
      expect(invalid).toBeDefined();
    });
  });

  // =============================================================================
  // 4.8 Cardユニオン型
  // =============================================================================

  describe('Cardユニオン型', () => {
    // TC-CARDS-037
    it('Card型がインポート可能', () => {
      const gatheringCard: Card = {
        id: toCardId('gathering-001'),
        name: 'Forest',
        type: CardType.GATHERING,
        rarity: Rarity.COMMON,
        unlockRank: GuildRank.G,
        cost: 1,
        materials: [],
      };
      expect(gatheringCard).toBeDefined();
    });

    // TC-CARDS-038
    it('IGatheringCardがCard型に代入可能', () => {
      const gatheringCard: IGatheringCard = {
        id: toCardId('gathering-001'),
        name: 'Forest',
        type: CardType.GATHERING,
        rarity: Rarity.COMMON,
        unlockRank: GuildRank.G,
        cost: 1,
        materials: [],
      };
      const card: Card = gatheringCard;
      expect(card).toBeDefined();
    });

    // TC-CARDS-039
    it('IRecipeCardがCard型に代入可能', () => {
      const recipeCard: IRecipeCard = {
        id: toCardId('recipe-001'),
        name: 'Potion',
        type: CardType.RECIPE,
        rarity: Rarity.COMMON,
        unlockRank: GuildRank.G,
        cost: 1,
        requiredMaterials: [],
        outputItemId: 'item-001',
        category: ItemCategory.MEDICINE,
      };
      const card: Card = recipeCard;
      expect(card).toBeDefined();
    });

    // TC-CARDS-040
    it('IEnhancementCardがCard型に代入可能', () => {
      const enhancementCard: IEnhancementCard = {
        id: toCardId('enhancement-001'),
        name: 'Quality Boost',
        type: CardType.ENHANCEMENT,
        rarity: Rarity.RARE,
        unlockRank: GuildRank.E,
        cost: 0,
        effect: {
          type: EffectType.QUALITY_UP,
          value: 10,
        },
        targetAction: EnhancementTarget.ALCHEMY,
      };
      const card: Card = enhancementCard;
      expect(card).toBeDefined();
    });

    // TC-CARDS-041
    it('Card.typeで型絞り込みが可能', () => {
      const card: Card = {
        id: toCardId('gathering-001'),
        name: 'Forest',
        type: CardType.GATHERING,
        rarity: Rarity.COMMON,
        unlockRank: GuildRank.G,
        cost: 1,
        materials: [],
      };

      if (card.type === CardType.GATHERING) {
        // ナローイングによりIGatheringCardとして扱える
        expect(card.materials).toBeDefined();
      }
    });
  });

  // =============================================================================
  // 4.9 型ガード関数
  // =============================================================================

  describe('型ガード関数', () => {
    // TC-CARDS-042
    it('isGatheringCard関数が存在する', () => {
      expect(isGatheringCard).toBeDefined();
      expect(typeof isGatheringCard).toBe('function');
    });

    // TC-CARDS-043
    it('isGatheringCardがtrue時にIGatheringCardに絞り込み', () => {
      const card: Card = {
        id: toCardId('gathering-001'),
        name: 'Forest',
        type: CardType.GATHERING,
        rarity: Rarity.COMMON,
        unlockRank: GuildRank.G,
        cost: 1,
        materials: [],
      };

      if (isGatheringCard(card)) {
        // 型絞り込みによりmaterialsプロパティにアクセス可能
        expect(card.materials).toBeDefined();
      }
    });

    // TC-CARDS-044
    it('isRecipeCard関数が存在する', () => {
      expect(isRecipeCard).toBeDefined();
      expect(typeof isRecipeCard).toBe('function');
    });

    // TC-CARDS-045
    it('isRecipeCardがtrue時にIRecipeCardに絞り込み', () => {
      const card: Card = {
        id: toCardId('recipe-001'),
        name: 'Potion',
        type: CardType.RECIPE,
        rarity: Rarity.COMMON,
        unlockRank: GuildRank.G,
        cost: 1,
        requiredMaterials: [],
        outputItemId: 'item-001',
        category: ItemCategory.MEDICINE,
      };

      if (isRecipeCard(card)) {
        // 型絞り込みによりrequiredMaterialsプロパティにアクセス可能
        expect(card.requiredMaterials).toBeDefined();
      }
    });

    // TC-CARDS-046
    it('isEnhancementCard関数が存在する', () => {
      expect(isEnhancementCard).toBeDefined();
      expect(typeof isEnhancementCard).toBe('function');
    });

    // TC-CARDS-047
    it('isEnhancementCardがtrue時にIEnhancementCardに絞り込み', () => {
      const card: Card = {
        id: toCardId('enhancement-001'),
        name: 'Quality Boost',
        type: CardType.ENHANCEMENT,
        rarity: Rarity.RARE,
        unlockRank: GuildRank.E,
        cost: 0,
        effect: {
          type: EffectType.QUALITY_UP,
          value: 10,
        },
        targetAction: EnhancementTarget.ALCHEMY,
      };

      if (isEnhancementCard(card)) {
        // 型絞り込みによりeffectプロパティにアクセス可能
        expect(card.effect).toBeDefined();
      }
    });
  });
});
