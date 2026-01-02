import { describe, it, expect, beforeAll } from 'vitest';
import { CardType, GuildRank, Quality, Rarity, EnhancementTarget, EffectType, ItemCategory } from '../../../src/domain/common/types';
import { IGatheringCard, IRecipeCard, IEnhancementCard } from '../../../src/domain/card/Card';

// テスト用にJSONファイルを直接インポート
import gatheringCards from '../../../data/master/cards/gathering.json';
import recipeCards from '../../../data/master/cards/recipe.json';
import enhancementCards from '../../../data/master/cards/enhancement.json';

describe('CardMaster', () => {
  describe('GatheringCardMaster', () => {
    const cards = gatheringCards as IGatheringCard[];

    it('採取地カードが10種類以上存在する', () => {
      expect(cards.length).toBeGreaterThanOrEqual(10);
    });

    it('採取地カードのスキーマが正しい', () => {
      cards.forEach((card) => {
        // 必須フィールドの存在チェック
        expect(card.id).toBeDefined();
        expect(typeof card.id).toBe('string');
        expect(card.name).toBeDefined();
        expect(typeof card.name).toBe('string');
        expect(card.type).toBe(CardType.GATHERING);
        expect(Object.values(Rarity)).toContain(card.rarity);
        expect(Object.values(GuildRank)).toContain(card.unlockRank);
        expect(typeof card.cost).toBe('number');
        expect(Array.isArray(card.materials)).toBe(true);
      });
    });

    it('行動コストが0〜3の範囲である', () => {
      cards.forEach((card) => {
        expect(card.cost).toBeGreaterThanOrEqual(0);
        expect(card.cost).toBeLessThanOrEqual(3);
      });
    });

    it('獲得素材リストが正しく解析される', () => {
      cards.forEach((card) => {
        expect(card.materials.length).toBeGreaterThan(0);
        card.materials.forEach((mat) => {
          expect(mat.materialId).toBeDefined();
          expect(typeof mat.materialId).toBe('string');
          expect(typeof mat.quantity).toBe('number');
          expect(mat.quantity).toBeGreaterThan(0);
          expect(typeof mat.probability).toBe('number');
        });
      });
    });

    it('獲得確率が0〜1の範囲である', () => {
      cards.forEach((card) => {
        card.materials.forEach((mat) => {
          expect(mat.probability).toBeGreaterThanOrEqual(0);
          expect(mat.probability).toBeLessThanOrEqual(1);
        });
      });
    });

    it('素材の品質が指定されている場合、有効な品質である', () => {
      cards.forEach((card) => {
        card.materials.forEach((mat) => {
          if (mat.quality !== undefined) {
            expect(Object.values(Quality)).toContain(mat.quality);
          }
        });
      });
    });
  });

  describe('RecipeCardMaster', () => {
    const cards = recipeCards as IRecipeCard[];

    it('レシピカードが15種類以上存在する', () => {
      expect(cards.length).toBeGreaterThanOrEqual(15);
    });

    it('レシピカードのスキーマが正しい', () => {
      cards.forEach((card) => {
        expect(card.id).toBeDefined();
        expect(typeof card.id).toBe('string');
        expect(card.name).toBeDefined();
        expect(typeof card.name).toBe('string');
        expect(card.type).toBe(CardType.RECIPE);
        expect(Object.values(Rarity)).toContain(card.rarity);
        expect(Object.values(GuildRank)).toContain(card.unlockRank);
        expect(typeof card.cost).toBe('number');
        expect(Array.isArray(card.requiredMaterials)).toBe(true);
        expect(typeof card.outputItemId).toBe('string');
        expect(Object.values(ItemCategory)).toContain(card.category);
      });
    });

    it('行動コストが1〜3の範囲である', () => {
      cards.forEach((card) => {
        expect(card.cost).toBeGreaterThanOrEqual(1);
        expect(card.cost).toBeLessThanOrEqual(3);
      });
    });

    it('必要素材リストが正しく解析される', () => {
      cards.forEach((card) => {
        expect(card.requiredMaterials.length).toBeGreaterThan(0);
        card.requiredMaterials.forEach((mat) => {
          expect(mat.materialId).toBeDefined();
          expect(typeof mat.materialId).toBe('string');
          expect(typeof mat.quantity).toBe('number');
          expect(mat.quantity).toBeGreaterThan(0);
        });
      });
    });

    it('必要素材の最低品質が指定されている場合、有効な品質である', () => {
      cards.forEach((card) => {
        card.requiredMaterials.forEach((mat) => {
          if (mat.minQuality !== undefined) {
            expect(Object.values(Quality)).toContain(mat.minQuality);
          }
        });
      });
    });

    it('完成アイテムIDが正しく参照される', () => {
      cards.forEach((card) => {
        expect(card.outputItemId).toBeDefined();
        expect(card.outputItemId.length).toBeGreaterThan(0);
      });
    });
  });

  describe('EnhancementCardMaster', () => {
    const cards = enhancementCards as IEnhancementCard[];

    it('強化カードが5種類以上存在する', () => {
      expect(cards.length).toBeGreaterThanOrEqual(5);
    });

    it('強化カードのスキーマが正しい', () => {
      cards.forEach((card) => {
        expect(card.id).toBeDefined();
        expect(typeof card.id).toBe('string');
        expect(card.name).toBeDefined();
        expect(typeof card.name).toBe('string');
        expect(card.type).toBe(CardType.ENHANCEMENT);
        expect(Object.values(Rarity)).toContain(card.rarity);
        expect(Object.values(GuildRank)).toContain(card.unlockRank);
        expect(card.cost).toBe(0);
        expect(card.effect).toBeDefined();
        expect(Object.values(EnhancementTarget)).toContain(card.targetAction);
      });
    });

    it('コストが常に0である', () => {
      cards.forEach((card) => {
        expect(card.cost).toBe(0);
      });
    });

    it('効果タイプと効果値が正しく解析される', () => {
      cards.forEach((card) => {
        expect(card.effect).toBeDefined();
        expect(Object.values(EffectType)).toContain(card.effect.type);
        expect(typeof card.effect.value).toBe('number');
        expect(card.effect.value).toBeGreaterThan(0);
      });
    });

    it('対象行動が有効な値である', () => {
      cards.forEach((card) => {
        expect(Object.values(EnhancementTarget)).toContain(card.targetAction);
      });
    });
  });

  describe('カード全般', () => {
    const allGathering = gatheringCards as IGatheringCard[];
    const allRecipe = recipeCards as IRecipeCard[];
    const allEnhancement = enhancementCards as IEnhancementCard[];

    it('全カードのIDがユニークである', () => {
      const allIds = [
        ...allGathering.map((c) => c.id),
        ...allRecipe.map((c) => c.id),
        ...allEnhancement.map((c) => c.id),
      ];
      const uniqueIds = new Set(allIds);
      expect(uniqueIds.size).toBe(allIds.length);
    });

    it('各ランクで利用可能なカードが存在する', () => {
      const allCards = [...allGathering, ...allRecipe, ...allEnhancement];
      const ranksWithCards = new Set(allCards.map((c) => c.unlockRank));

      // 最低でもG, F, Eランクのカードがあること
      expect(ranksWithCards.has(GuildRank.G)).toBe(true);
      expect(ranksWithCards.has(GuildRank.F)).toBe(true);
      expect(ranksWithCards.has(GuildRank.E)).toBe(true);
    });
  });
});
