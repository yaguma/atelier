/**
 * カードエンティティのテスト
 * TASK-0084: カードエンティティ
 *
 * 3種類のカードエンティティ（GatheringCard、RecipeCard、EnhancementCard）をテストする
 */

import { describe, it, expect, vi } from 'vitest';
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
  Quality,
  Rarity,
  EnhancementTarget,
  EffectType,
  ItemCategory,
} from '../../../../src/domain/common/types';
import type { IGatheringMaterial, IRequiredMaterial, ICardEffect } from '../../../../src/domain/card/Card';

describe('Card Entity', () => {
  describe('GatheringCard', () => {
    // テスト用データ
    const sampleMaterials: IGatheringMaterial[] = [
      { materialId: 'mat_herb', quantity: 2, probability: 0.8, quality: Quality.C },
      { materialId: 'mat_flower', quantity: 1, probability: 0.5 },
      { materialId: 'mat_rare', quantity: 1, probability: 0.1, quality: Quality.A },
    ];

    const sampleGatheringCardData = {
      id: 'card_forest',
      name: '森の採取地',
      type: CardType.GATHERING as const,
      rarity: Rarity.COMMON,
      unlockRank: GuildRank.G,
      cost: 1,
      materials: sampleMaterials,
      description: 'テスト用の採取地カード',
    };

    it('採取地カードを生成できる', () => {
      const card = createGatheringCard(sampleGatheringCardData);

      expect(card).toBeInstanceOf(GatheringCard);
      expect(card.id).toBe('card_forest');
      expect(card.name).toBe('森の採取地');
      expect(card.type).toBe(CardType.GATHERING);
    });

    it('コストを取得できる', () => {
      const card = createGatheringCard(sampleGatheringCardData);

      expect(card.getCost()).toBe(1);
    });

    it('獲得可能素材リストを取得できる', () => {
      const card = createGatheringCard(sampleGatheringCardData);

      const materials = card.getMaterials();

      expect(materials).toHaveLength(3);
      expect(materials[0].materialId).toBe('mat_herb');
      expect(materials[1].materialId).toBe('mat_flower');
      expect(materials[2].materialId).toBe('mat_rare');
    });

    it('確率に基づいて素材を決定できる', () => {
      const card = createGatheringCard(sampleGatheringCardData);

      // 乱数のモック（常に0.5を返す）
      // 条件は roll < probability なので:
      // mat_herb: 0.5 < 0.8 → 獲得
      // mat_flower: 0.5 < 0.5 → 獲得しない（0.5 は 0.5 未満ではない）
      // mat_rare: 0.5 < 0.1 → 獲得しない
      const mockRandom = vi.spyOn(Math, 'random').mockReturnValue(0.5);

      const obtainedMaterials = card.determineMaterials();

      expect(obtainedMaterials).toHaveLength(1);
      expect(obtainedMaterials.find((m) => m.materialId === 'mat_herb')).toBeDefined();
      expect(obtainedMaterials.find((m) => m.materialId === 'mat_flower')).toBeUndefined();

      mockRandom.mockRestore();
    });

    it('不変オブジェクトとして設計されている', () => {
      const card = createGatheringCard(sampleGatheringCardData);

      // materialsを変更しても元のカードには影響しない
      const materials = card.getMaterials();
      materials.push({ materialId: 'mat_new', quantity: 1, probability: 1 });

      expect(card.getMaterials()).toHaveLength(3);
    });
  });

  describe('RecipeCard', () => {
    const sampleRequiredMaterials: IRequiredMaterial[] = [
      { materialId: 'mat_herb', quantity: 2, minQuality: Quality.C },
      { materialId: 'mat_water', quantity: 1 },
    ];

    const sampleRecipeCardData = {
      id: 'card_potion',
      name: '回復薬のレシピ',
      type: CardType.RECIPE as const,
      rarity: Rarity.COMMON,
      unlockRank: GuildRank.G,
      cost: 1,
      requiredMaterials: sampleRequiredMaterials,
      outputItemId: 'item_potion',
      category: ItemCategory.MEDICINE,
      description: 'テスト用のレシピカード',
    };

    it('レシピカードを生成できる', () => {
      const card = createRecipeCard(sampleRecipeCardData);

      expect(card).toBeInstanceOf(RecipeCard);
      expect(card.id).toBe('card_potion');
      expect(card.name).toBe('回復薬のレシピ');
      expect(card.type).toBe(CardType.RECIPE);
    });

    it('必要素材リストを取得できる', () => {
      const card = createRecipeCard(sampleRecipeCardData);

      const materials = card.getRequiredMaterials();

      expect(materials).toHaveLength(2);
      expect(materials[0].materialId).toBe('mat_herb');
      expect(materials[0].quantity).toBe(2);
      expect(materials[0].minQuality).toBe(Quality.C);
    });

    it('完成アイテムを取得できる', () => {
      const card = createRecipeCard(sampleRecipeCardData);

      expect(card.getOutputItemId()).toBe('item_potion');
      expect(card.getCategory()).toBe(ItemCategory.MEDICINE);
    });

    it('コストを取得できる', () => {
      const card = createRecipeCard(sampleRecipeCardData);

      expect(card.getCost()).toBe(1);
    });

    it('不変オブジェクトとして設計されている', () => {
      const card = createRecipeCard(sampleRecipeCardData);

      const materials = card.getRequiredMaterials();
      materials.push({ materialId: 'mat_new', quantity: 1 });

      expect(card.getRequiredMaterials()).toHaveLength(2);
    });
  });

  describe('EnhancementCard', () => {
    const sampleEffect: ICardEffect = {
      type: EffectType.QUALITY_UP,
      value: 10,
    };

    const sampleEnhancementCardData = {
      id: 'card_enhance_quality',
      name: '品質強化',
      type: CardType.ENHANCEMENT as const,
      rarity: Rarity.UNCOMMON,
      unlockRank: GuildRank.F,
      cost: 0 as const,
      effect: sampleEffect,
      targetAction: EnhancementTarget.ALCHEMY,
      description: 'テスト用の強化カード',
    };

    it('強化カードを生成できる', () => {
      const card = createEnhancementCard(sampleEnhancementCardData);

      expect(card).toBeInstanceOf(EnhancementCard);
      expect(card.id).toBe('card_enhance_quality');
      expect(card.name).toBe('品質強化');
      expect(card.type).toBe(CardType.ENHANCEMENT);
    });

    it('効果を適用できる', () => {
      const card = createEnhancementCard(sampleEnhancementCardData);

      // 効果を適用（基本値50に効果値10を加算）
      const result = card.applyEffect(50);

      expect(result).toBe(60);
    });

    it('効果タイプを取得できる', () => {
      const card = createEnhancementCard(sampleEnhancementCardData);

      expect(card.getEffect()).toEqual(sampleEffect);
      expect(card.getEffectType()).toBe(EffectType.QUALITY_UP);
      expect(card.getEffectValue()).toBe(10);
    });

    it('対象行動を取得できる', () => {
      const card = createEnhancementCard(sampleEnhancementCardData);

      expect(card.getTargetAction()).toBe(EnhancementTarget.ALCHEMY);
    });

    it('コストは常に0である', () => {
      const card = createEnhancementCard(sampleEnhancementCardData);

      expect(card.getCost()).toBe(0);
    });

    it('不変オブジェクトとして設計されている', () => {
      const card = createEnhancementCard(sampleEnhancementCardData);

      const effect = card.getEffect();
      // オブジェクトを変更しようとしても元のカードには影響しない
      (effect as { value: number }).value = 999;

      expect(card.getEffectValue()).toBe(10);
    });

    it('対象行動がALLの場合、すべての行動に適用可能', () => {
      const allTargetCard = createEnhancementCard({
        ...sampleEnhancementCardData,
        targetAction: EnhancementTarget.ALL,
      });

      expect(allTargetCard.canApplyTo(EnhancementTarget.GATHERING)).toBe(true);
      expect(allTargetCard.canApplyTo(EnhancementTarget.ALCHEMY)).toBe(true);
      expect(allTargetCard.canApplyTo(EnhancementTarget.DELIVERY)).toBe(true);
    });

    it('対象行動が特定の場合、その行動にのみ適用可能', () => {
      const card = createEnhancementCard(sampleEnhancementCardData);

      expect(card.canApplyTo(EnhancementTarget.ALCHEMY)).toBe(true);
      expect(card.canApplyTo(EnhancementTarget.GATHERING)).toBe(false);
      expect(card.canApplyTo(EnhancementTarget.DELIVERY)).toBe(false);
    });
  });
});
