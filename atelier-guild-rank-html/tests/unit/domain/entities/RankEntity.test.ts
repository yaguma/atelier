/**
 * ランクエンティティのテスト
 * TASK-0088: ランクエンティティ
 *
 * ギルドランクエンティティをテストする
 */

import { describe, it, expect } from 'vitest';
import {
  Rank,
  PromotionTest,
  PromotionRequirement,
  SpecialRule,
  createRank,
  createPromotionTest,
} from '../../../../src/domain/rank/RankEntity';
import { GuildRank, Quality, SpecialRuleType } from '../../../../src/domain/common/types';

describe('Rank Entity', () => {
  // テスト用データ
  const sampleSpecialRules = [
    {
      type: SpecialRuleType.QUEST_LIMIT,
      value: 2,
      description: '同時受注上限: 2件',
    },
  ];

  const samplePromotionRequirements = [
    { itemId: 'item_healing_potion', quantity: 3 },
  ];

  const samplePromotionTest = {
    requirements: samplePromotionRequirements,
    dayLimit: 5,
  };

  const sampleRankData = {
    id: GuildRank.G,
    name: '見習い錬金術師',
    maxPromotionGauge: 50,
    dayLimit: 30,
    specialRules: [],
    promotionTest: samplePromotionTest,
    unlockedGatheringCards: ['gather_grassland', 'gather_forest'],
    unlockedRecipeCards: ['recipe_healing_potion'],
  };

  const advancedRankData = {
    id: GuildRank.E,
    name: '一人前錬金術師',
    maxPromotionGauge: 120,
    dayLimit: 30,
    specialRules: [
      {
        type: SpecialRuleType.QUEST_LIMIT,
        value: 3,
        description: '同時受注上限: 3件',
      },
      {
        type: SpecialRuleType.QUALITY_PENALTY,
        condition: Quality.D,
        description: '品質D以下の納品は貢献度半減',
      },
    ],
    promotionTest: {
      requirements: [
        { itemId: 'item_high_healing_potion', quantity: 2, minQuality: Quality.C },
      ],
      dayLimit: 7,
    },
    unlockedGatheringCards: ['gather_mountain'],
    unlockedRecipeCards: ['recipe_magic_potion', 'recipe_high_healing_potion'],
  };

  const sRankData = {
    id: GuildRank.S,
    name: '伝説の錬金術師',
    maxPromotionGauge: 999,
    dayLimit: 30,
    specialRules: [
      {
        type: SpecialRuleType.QUEST_LIMIT,
        value: 5,
        description: '同時受注上限: 5件',
      },
      {
        type: SpecialRuleType.QUALITY_REQUIRED,
        condition: Quality.A,
        description: '品質A以上が納品条件',
      },
      {
        type: SpecialRuleType.DEADLINE_REDUCTION,
        value: 3,
        description: '期限が3日短縮',
      },
    ],
    promotionTest: null,
    unlockedGatheringCards: [],
    unlockedRecipeCards: ['recipe_dragon_blade'],
  };

  describe('Rank（ギルドランク）', () => {
    it('ランクを生成できる', () => {
      const rank = createRank(sampleRankData);

      expect(rank).toBeInstanceOf(Rank);
      expect(rank.id).toBe(GuildRank.G);
      expect(rank.name).toBe('見習い錬金術師');
    });

    it('ランク順序を比較できる', () => {
      const rankG = createRank(sampleRankData);
      const rankE = createRank(advancedRankData);
      const rankS = createRank(sRankData);

      // G < E < S
      expect(rankG.compareTo(rankE)).toBeLessThan(0);
      expect(rankE.compareTo(rankG)).toBeGreaterThan(0);
      expect(rankG.compareTo(rankS)).toBeLessThan(0);
      expect(rankS.compareTo(rankG)).toBeGreaterThan(0);
      expect(rankG.compareTo(rankG)).toBe(0);
    });

    it('昇格ゲージ最大値を取得できる', () => {
      const rankG = createRank(sampleRankData);
      const rankE = createRank(advancedRankData);

      expect(rankG.getMaxPromotionGauge()).toBe(50);
      expect(rankE.getMaxPromotionGauge()).toBe(120);
    });

    it('次ランクを取得できる', () => {
      const rankG = createRank(sampleRankData);
      const rankE = createRank(advancedRankData);

      expect(rankG.getNextRank()).toBe(GuildRank.F);
      expect(rankE.getNextRank()).toBe(GuildRank.D);
    });

    it('最高ランク（S）で次ランクはnull', () => {
      const rankS = createRank(sRankData);

      expect(rankS.getNextRank()).toBeNull();
    });

    it('昇格試験内容を取得できる', () => {
      const rankG = createRank(sampleRankData);
      const promotionTest = rankG.getPromotionTest();

      expect(promotionTest).not.toBeNull();
      expect(promotionTest?.getDayLimit()).toBe(5);
    });

    it('Sランクは昇格試験がnull', () => {
      const rankS = createRank(sRankData);

      expect(rankS.getPromotionTest()).toBeNull();
    });

    it('制限日数を取得できる', () => {
      const rank = createRank(sampleRankData);

      expect(rank.getDayLimit()).toBe(30);
    });

    it('特殊ルールを取得できる', () => {
      const rankE = createRank(advancedRankData);
      const rules = rankE.getSpecialRules();

      expect(rules).toHaveLength(2);
      expect(rules[0].type).toBe(SpecialRuleType.QUEST_LIMIT);
      expect(rules[0].value).toBe(3);
      expect(rules[1].type).toBe(SpecialRuleType.QUALITY_PENALTY);
      expect(rules[1].condition).toBe(Quality.D);
    });

    it('解放カードリストを取得できる', () => {
      const rank = createRank(sampleRankData);

      const gatheringCards = rank.getUnlockedGatheringCards();
      const recipeCards = rank.getUnlockedRecipeCards();

      expect(gatheringCards).toContain('gather_grassland');
      expect(gatheringCards).toContain('gather_forest');
      expect(recipeCards).toContain('recipe_healing_potion');
    });

    it('最高ランクかどうかを判定できる', () => {
      const rankG = createRank(sampleRankData);
      const rankS = createRank(sRankData);

      expect(rankG.isMaxRank()).toBe(false);
      expect(rankS.isMaxRank()).toBe(true);
    });

    it('不変オブジェクトとして設計されている', () => {
      const rank = createRank(sampleRankData);

      const rules1 = rank.getSpecialRules();
      const rules2 = rank.getSpecialRules();

      // 異なるオブジェクトが返される（コピーされている）
      expect(rules1).not.toBe(rules2);
    });
  });

  describe('PromotionTest（昇格試験）', () => {
    it('昇格試験を生成できる', () => {
      const test = createPromotionTest(samplePromotionTest);

      expect(test).toBeInstanceOf(PromotionTest);
    });

    it('試験要件を取得できる', () => {
      const test = createPromotionTest(advancedRankData.promotionTest!);
      const requirements = test.getRequirements();

      expect(requirements).toHaveLength(1);
      expect(requirements[0].itemId).toBe('item_high_healing_potion');
      expect(requirements[0].quantity).toBe(2);
      expect(requirements[0].minQuality).toBe(Quality.C);
    });

    it('制限日数を取得できる', () => {
      const test = createPromotionTest(samplePromotionTest);

      expect(test.getDayLimit()).toBe(5);
    });

    it('不変オブジェクトとして設計されている', () => {
      const test = createPromotionTest(samplePromotionTest);

      const requirements1 = test.getRequirements();
      const requirements2 = test.getRequirements();

      // 異なるオブジェクトが返される（コピーされている）
      expect(requirements1).not.toBe(requirements2);
    });
  });

  describe('SpecialRule（特殊ルール）', () => {
    it('特殊ルールを生成できる', () => {
      const rule = new SpecialRule(sampleSpecialRules[0]);

      expect(rule.type).toBe(SpecialRuleType.QUEST_LIMIT);
      expect(rule.getValue()).toBe(2);
    });

    it('品質ペナルティルールを処理できる', () => {
      const rule = new SpecialRule({
        type: SpecialRuleType.QUALITY_PENALTY,
        condition: Quality.D,
        description: '品質D以下の納品は貢献度半減',
      });

      expect(rule.type).toBe(SpecialRuleType.QUALITY_PENALTY);
      expect(rule.getCondition()).toBe(Quality.D);
    });

    it('期限短縮ルールを処理できる', () => {
      const rule = new SpecialRule({
        type: SpecialRuleType.DEADLINE_REDUCTION,
        value: 2,
        description: '期限が2日短縮',
      });

      expect(rule.type).toBe(SpecialRuleType.DEADLINE_REDUCTION);
      expect(rule.getValue()).toBe(2);
    });
  });

  describe('PromotionRequirement（昇格試験要件）', () => {
    it('昇格試験要件を生成できる', () => {
      const requirement = new PromotionRequirement({
        itemId: 'item_healing_potion',
        quantity: 3,
      });

      expect(requirement.itemId).toBe('item_healing_potion');
      expect(requirement.quantity).toBe(3);
    });

    it('最低品質要件を持つ要件を処理できる', () => {
      const requirement = new PromotionRequirement({
        itemId: 'item_high_healing_potion',
        quantity: 2,
        minQuality: Quality.C,
      });

      expect(requirement.minQuality).toBe(Quality.C);
      expect(requirement.hasQualityRequirement()).toBe(true);
    });

    it('最低品質要件がない場合を判定できる', () => {
      const requirement = new PromotionRequirement({
        itemId: 'item_healing_potion',
        quantity: 3,
      });

      expect(requirement.hasQualityRequirement()).toBe(false);
    });
  });
});
