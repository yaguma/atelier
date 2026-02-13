/**
 * rank-types.test.ts - features/rank/types エクスポートテスト
 *
 * TASK-0091: features/rank/types作成
 * 型定義が正しくエクスポートされていることを確認する
 */

import type {
  IGuildRankMaster,
  IPromotionRequirement,
  IPromotionTest,
  IRankService,
  ISpecialRule,
  PromotionResult,
  PromotionTest,
  PromotionTestRequirement,
  RankProgress,
} from '@features/rank/types';
import { GuildRank, SpecialRuleType } from '@features/rank/types';
import { describe, expect, it } from 'vitest';

describe('features/rank/types', () => {
  describe('GuildRank型', () => {
    it('GuildRank値オブジェクトが正しくエクスポートされること', () => {
      expect(GuildRank).toBeDefined();
    });

    it('ランクレベル（G〜S）が定義されていること', () => {
      expect(GuildRank.G).toBe('G');
      expect(GuildRank.F).toBe('F');
      expect(GuildRank.E).toBe('E');
      expect(GuildRank.D).toBe('D');
      expect(GuildRank.C).toBe('C');
      expect(GuildRank.B).toBe('B');
      expect(GuildRank.A).toBe('A');
      expect(GuildRank.S).toBe('S');
    });

    it('8段階のランクが定義されていること', () => {
      const ranks = Object.values(GuildRank);
      expect(ranks).toHaveLength(8);
    });
  });

  describe('SpecialRuleType型', () => {
    it('SpecialRuleType値オブジェクトが正しくエクスポートされること', () => {
      expect(SpecialRuleType).toBeDefined();
    });

    it('ルール種別が定義されていること', () => {
      expect(SpecialRuleType.QUEST_LIMIT).toBe('QUEST_LIMIT');
      expect(SpecialRuleType.QUALITY_PENALTY).toBe('QUALITY_PENALTY');
      expect(SpecialRuleType.DEADLINE_REDUCTION).toBe('DEADLINE_REDUCTION');
      expect(SpecialRuleType.QUALITY_REQUIRED).toBe('QUALITY_REQUIRED');
    });
  });

  describe('ISpecialRule型', () => {
    it('ISpecialRuleオブジェクトを作成できること', () => {
      const rule: ISpecialRule = {
        type: SpecialRuleType.QUEST_LIMIT,
        value: 3,
        description: '受注可能な依頼数を制限',
      };
      expect(rule.type).toBe(SpecialRuleType.QUEST_LIMIT);
      expect(rule.value).toBe(3);
      expect(rule.description).toBe('受注可能な依頼数を制限');
    });

    it('conditionがオプションであること', () => {
      const rule: ISpecialRule = {
        type: SpecialRuleType.QUALITY_REQUIRED,
        condition: 'rank >= C',
        description: '品質条件を追加',
      };
      expect(rule.condition).toBe('rank >= C');
      expect(rule.value).toBeUndefined();
    });
  });

  describe('RankProgress型', () => {
    it('RankProgressオブジェクトを作成できること', () => {
      const progress: RankProgress = {
        currentRank: GuildRank.D,
        accumulatedContribution: 150,
        requiredContribution: 300,
        promotionGauge: 50,
        remainingContribution: 150,
        canPromote: false,
        nextRank: GuildRank.C,
      };
      expect(progress.currentRank).toBe(GuildRank.D);
      expect(progress.accumulatedContribution).toBe(150);
      expect(progress.requiredContribution).toBe(300);
      expect(progress.promotionGauge).toBe(50);
      expect(progress.remainingContribution).toBe(150);
      expect(progress.canPromote).toBe(false);
      expect(progress.nextRank).toBe(GuildRank.C);
    });

    it('最高ランクではnextRankがnullであること', () => {
      const progress: RankProgress = {
        currentRank: GuildRank.S,
        accumulatedContribution: 0,
        requiredContribution: 0,
        promotionGauge: 0,
        remainingContribution: 0,
        canPromote: false,
        nextRank: null,
      };
      expect(progress.nextRank).toBeNull();
    });
  });

  describe('PromotionResult型', () => {
    it('PromotionResultオブジェクトを作成できること', () => {
      const result: PromotionResult = {
        previousRank: GuildRank.E,
        newRank: GuildRank.D,
        bonusReward: 400,
      };
      expect(result.previousRank).toBe(GuildRank.E);
      expect(result.newRank).toBe(GuildRank.D);
      expect(result.bonusReward).toBe(400);
    });
  });

  describe('PromotionTest型', () => {
    it('PromotionTestオブジェクトを作成できること', () => {
      const test: PromotionTest = {
        targetRank: GuildRank.C,
        requirements: [
          { itemId: 'item-001', quantity: 2 },
          { itemId: 'item-002', quantity: 1, minQuality: 'B' },
        ],
        remainingDays: 5,
        completedRequirements: [0],
      };
      expect(test.targetRank).toBe(GuildRank.C);
      expect(test.requirements).toHaveLength(2);
      expect(test.remainingDays).toBe(5);
      expect(test.completedRequirements).toContain(0);
    });
  });

  describe('PromotionTestRequirement型', () => {
    it('PromotionTestRequirementオブジェクトを作成できること', () => {
      const req: PromotionTestRequirement = {
        itemId: 'item-001',
        quantity: 3,
      };
      expect(req.itemId).toBe('item-001');
      expect(req.quantity).toBe(3);
    });

    it('minQualityがオプションであること', () => {
      const req: PromotionTestRequirement = {
        itemId: 'item-002',
        quantity: 1,
        minQuality: 'A',
      };
      expect(req.minQuality).toBe('A');
    });
  });

  describe('IGuildRankMaster型', () => {
    it('IGuildRankMasterオブジェクトを作成できること', () => {
      const rankMaster: IGuildRankMaster = {
        id: GuildRank.D,
        name: 'Dランク',
        requiredContribution: 300,
        dayLimit: 30,
        specialRules: [],
        promotionTest: null,
        unlockedGatheringCards: ['card-001'],
        unlockedRecipeCards: ['recipe-001'],
      };
      expect(rankMaster.id).toBe(GuildRank.D);
      expect(rankMaster.name).toBe('Dランク');
      expect(rankMaster.requiredContribution).toBe(300);
    });
  });

  describe('IPromotionTest型', () => {
    it('IPromotionTestオブジェクトを作成できること', () => {
      const test: IPromotionTest = {
        requirements: [{ itemId: 'item-001', quantity: 1 }],
        dayLimit: 7,
      };
      expect(test.requirements).toHaveLength(1);
      expect(test.dayLimit).toBe(7);
    });
  });

  describe('IPromotionRequirement型', () => {
    it('IPromotionRequirementオブジェクトを作成できること', () => {
      const req: IPromotionRequirement = {
        itemId: 'item-001',
        quantity: 2,
      };
      expect(req.itemId).toBe('item-001');
      expect(req.quantity).toBe(2);
    });
  });

  describe('IRankService型', () => {
    it('@features/rank/typesからIRankServiceがインポートできること', () => {
      const _typeCheck: IRankService | undefined = undefined;
      expect(_typeCheck).toBeUndefined();
    });
  });

  describe('index.tsバレルエクスポート', () => {
    it('すべての型が@features/rank/typesから一括インポートできること', async () => {
      const mod = await import('@features/rank/types');
      expect(mod).toBeDefined();
      expect(mod.GuildRank).toBeDefined();
      expect(mod.SpecialRuleType).toBeDefined();
    });
  });
});
