/**
 * rank-operations.test.ts - ランク操作テスト
 * TASK-0092: features/rank/services作成
 */

import {
  applySpecialRules,
  calculatePromotionBonus,
  calculateRankProgress,
  checkPromotion,
  getNextRank,
  getRankOrder,
} from '@features/rank/services/rank-operations';
import type { GuildRank } from '@shared/types';
import { SpecialRuleType } from '@shared/types';
import type { IGuildRankMaster, ISpecialRule } from '@shared/types/master-data';
import { describe, expect, it } from 'vitest';

// =============================================================================
// ヘルパー
// =============================================================================

function createRankMaster(overrides: Partial<IGuildRankMaster> = {}): IGuildRankMaster {
  return {
    id: 'D' as GuildRank,
    name: 'Dランク',
    requiredContribution: 300,
    dayLimit: 30,
    specialRules: [],
    promotionTest: null,
    unlockedGatheringCards: [],
    unlockedRecipeCards: [],
    ...overrides,
  };
}

// =============================================================================
// テスト
// =============================================================================

describe('rank-operations', () => {
  describe('calculateRankProgress', () => {
    it('現在の進捗率を正しく計算すること', () => {
      const result = calculateRankProgress('D', 150, createRankMaster());
      expect(result.currentRank).toBe('D');
      expect(result.accumulatedContribution).toBe(150);
      expect(result.requiredContribution).toBe(300);
      expect(result.promotionGauge).toBe(50);
      expect(result.remainingContribution).toBe(150);
      expect(result.canPromote).toBe(false);
    });

    it('必要貢献度に達した場合にゲージ100になること', () => {
      const result = calculateRankProgress('D', 300, createRankMaster());
      expect(result.promotionGauge).toBe(100);
      expect(result.canPromote).toBe(true);
      expect(result.remainingContribution).toBe(0);
    });

    it('超過貢献度でもゲージが100以上になること', () => {
      const result = calculateRankProgress('D', 450, createRankMaster());
      expect(result.promotionGauge).toBe(150);
      expect(result.canPromote).toBe(true);
    });

    it('最高ランク（S）ではcanPromoteがfalseであること', () => {
      const result = calculateRankProgress('S', 1000, createRankMaster({ id: 'S' as GuildRank }));
      expect(result.canPromote).toBe(false);
      expect(result.nextRank).toBeNull();
    });

    it('rankMasterがnullの場合にゲージ0を返すこと', () => {
      const result = calculateRankProgress('D', 150, null);
      expect(result.promotionGauge).toBe(0);
      expect(result.requiredContribution).toBe(0);
      expect(result.canPromote).toBe(false);
    });

    it('nextRankが正しく設定されること', () => {
      const result = calculateRankProgress('E', 100, createRankMaster({ id: 'E' as GuildRank }));
      expect(result.nextRank).toBe('D');
    });
  });

  describe('checkPromotion', () => {
    it('昇格条件を満たす場合にtrueを返すこと', () => {
      expect(checkPromotion('D', 300, createRankMaster())).toBe(true);
    });

    it('昇格条件を満たさない場合にfalseを返すこと', () => {
      expect(checkPromotion('D', 100, createRankMaster())).toBe(false);
    });

    it('最高ランクでは常にfalseを返すこと', () => {
      expect(checkPromotion('S', 9999, createRankMaster({ id: 'S' as GuildRank }))).toBe(false);
    });

    it('rankMasterがnullの場合にfalseを返すこと', () => {
      expect(checkPromotion('D', 300, null)).toBe(false);
    });
  });

  describe('calculatePromotionBonus', () => {
    it('ランクに応じたボーナスを計算すること', () => {
      expect(calculatePromotionBonus('G')).toBe(100);
      expect(calculatePromotionBonus('F')).toBe(200);
      expect(calculatePromotionBonus('E')).toBe(300);
      expect(calculatePromotionBonus('D')).toBe(400);
      expect(calculatePromotionBonus('S')).toBe(800);
    });
  });

  describe('getNextRank', () => {
    it('次のランクを正しく返すこと', () => {
      expect(getNextRank('G')).toBe('F');
      expect(getNextRank('F')).toBe('E');
      expect(getNextRank('E')).toBe('D');
      expect(getNextRank('D')).toBe('C');
      expect(getNextRank('C')).toBe('B');
      expect(getNextRank('B')).toBe('A');
      expect(getNextRank('A')).toBe('S');
    });

    it('最高ランク（S）の次はnullを返すこと', () => {
      expect(getNextRank('S')).toBeNull();
    });
  });

  describe('getRankOrder', () => {
    it('ランクの順序値を正しく返すこと', () => {
      expect(getRankOrder('G')).toBe(0);
      expect(getRankOrder('F')).toBe(1);
      expect(getRankOrder('S')).toBe(7);
    });
  });

  describe('applySpecialRules', () => {
    it('QUEST_LIMITルールを適用すること', () => {
      const rules: ISpecialRule[] = [
        { type: SpecialRuleType.QUEST_LIMIT, value: 3, description: '依頼数制限' },
      ];
      const effect = applySpecialRules(rules);
      expect(effect.questLimit).toBe(3);
    });

    it('QUALITY_PENALTYルールを適用すること', () => {
      const rules: ISpecialRule[] = [
        { type: SpecialRuleType.QUALITY_PENALTY, value: 0.8, description: '品質ペナルティ' },
      ];
      const effect = applySpecialRules(rules);
      expect(effect.qualityPenalty).toBeCloseTo(0.8);
    });

    it('DEADLINE_REDUCTIONルールを適用すること', () => {
      const rules: ISpecialRule[] = [
        { type: SpecialRuleType.DEADLINE_REDUCTION, value: 2, description: '期限短縮' },
      ];
      const effect = applySpecialRules(rules);
      expect(effect.deadlineReduction).toBe(2);
    });

    it('QUALITY_REQUIREDルールを適用すること', () => {
      const rules: ISpecialRule[] = [
        {
          type: SpecialRuleType.QUALITY_REQUIRED,
          condition: 'B',
          description: '品質要求',
        },
      ];
      const effect = applySpecialRules(rules);
      expect(effect.qualityRequired).toBe('B');
    });

    it('複数ルールを組み合わせて処理すること', () => {
      const rules: ISpecialRule[] = [
        { type: SpecialRuleType.QUEST_LIMIT, value: 2, description: '依頼数制限' },
        { type: SpecialRuleType.DEADLINE_REDUCTION, value: 1, description: '期限短縮' },
        { type: SpecialRuleType.DEADLINE_REDUCTION, value: 2, description: '追加期限短縮' },
      ];
      const effect = applySpecialRules(rules);
      expect(effect.questLimit).toBe(2);
      expect(effect.deadlineReduction).toBe(3);
    });

    it('空のルール配列でデフォルト値を返すこと', () => {
      const effect = applySpecialRules([]);
      expect(effect.questLimit).toBeNull();
      expect(effect.qualityPenalty).toBe(1.0);
      expect(effect.deadlineReduction).toBe(0);
      expect(effect.qualityRequired).toBeNull();
    });
  });

  describe('純粋関数検証', () => {
    it('同じ入力に対して同じ出力を返すこと', () => {
      const rankMaster = createRankMaster();
      const result1 = calculateRankProgress('D', 150, rankMaster);
      const result2 = calculateRankProgress('D', 150, rankMaster);
      expect(result1).toEqual(result2);
    });

    it('入力オブジェクトを変更しないこと', () => {
      const rules: ISpecialRule[] = [
        { type: SpecialRuleType.QUEST_LIMIT, value: 3, description: 'テスト' },
      ];
      const rulesCopy = [...rules];
      applySpecialRules(rules);
      expect(rules).toEqual(rulesCopy);
    });
  });
});
