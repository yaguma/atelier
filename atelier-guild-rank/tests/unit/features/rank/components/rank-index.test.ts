/**
 * rank/index.ts - 公開APIテスト
 * TASK-0093: features/rank/index.ts作成
 */

import type {
  ContributionContext,
  ContributionResult,
  DisplayRule,
  IGuildRankMaster,
  IRankService,
  ISpecialRule,
  PromotionDialogConfig,
  PromotionResult,
  PromotionTest,
  PromotionTestRequirement,
  RankBadgeConfig,
  RankProgress,
  RankProgressBarConfig,
  SpecialRuleDisplayConfig,
  SpecialRuleEffect,
} from '@features/rank';
import {
  applySpecialRules,
  calculateContribution,
  calculatePromotionBonus,
  calculateRankProgress,
  checkPromotion,
  GuildRank,
  getClientModifier,
  getComboModifier,
  getNextRank,
  getQualityModifier,
  getRankOrder,
  PromotionDialog,
  RankBadge,
  RankProgressBar,
  SpecialRuleDisplay,
  SpecialRuleType,
} from '@features/rank';
import { describe, expect, it } from 'vitest';

describe('features/rank/index.ts', () => {
  describe('型エクスポート', () => {
    it('RankProgress型がインポートできること', () => {
      const progress: RankProgress = {
        currentRank: 'D',
        accumulatedContribution: 150,
        requiredContribution: 300,
        promotionGauge: 50,
        remainingContribution: 150,
        canPromote: false,
        nextRank: 'C',
      };
      expect(progress.currentRank).toBe('D');
    });

    it('ContributionContext型がインポートできること', () => {
      const context: ContributionContext = {
        baseContribution: 100,
        itemQuality: 'B',
        clientType: 'VILLAGER',
        deliveryCount: 1,
      };
      expect(context.baseContribution).toBe(100);
    });

    it('ContributionResult型がインポートできること', () => {
      const result: ContributionResult = {
        contribution: 100,
        qualityModifier: 1.0,
        clientModifier: 1.0,
        comboModifier: 1.0,
      };
      expect(result.contribution).toBe(100);
    });

    it('SpecialRuleEffect型がインポートできること', () => {
      const effect: SpecialRuleEffect = {
        questLimit: null,
        qualityPenalty: 1.0,
        deadlineReduction: 0,
        qualityRequired: null,
      };
      expect(effect.qualityPenalty).toBe(1.0);
    });

    it('コンポーネント設定型がインポートできること', () => {
      const barConfig: RankProgressBarConfig = { rank: 'D', gaugePercent: 50 };
      const badgeConfig: RankBadgeConfig = { rank: 'A' };
      const dialogConfig: PromotionDialogConfig = {
        fromRank: 'D',
        toRank: 'C',
        bonusGold: 400,
      };
      const displayConfig: SpecialRuleDisplayConfig = { rules: [] };
      const displayRule: DisplayRule = {
        rule: {
          type: SpecialRuleType.QUEST_LIMIT,
          description: 'テスト',
          value: 3,
        } as ISpecialRule,
        active: true,
      };

      expect(barConfig.rank).toBe('D');
      expect(badgeConfig.rank).toBe('A');
      expect(dialogConfig.bonusGold).toBe(400);
      expect(displayConfig.rules).toHaveLength(0);
      expect(displayRule.active).toBe(true);
    });

    it('マスターデータ型がインポートできること', () => {
      // 型のみの検証（コンパイルが通ればOK）
      const _rankMaster: IGuildRankMaster | null = null;
      const _specialRule: ISpecialRule | null = null;
      const _rankService: IRankService | null = null;
      const _promotionResult: PromotionResult | null = null;
      const _promotionTest: PromotionTest | null = null;
      const _promotionTestReq: PromotionTestRequirement | null = null;
      expect(_rankMaster).toBeNull();
      expect(_specialRule).toBeNull();
      expect(_rankService).toBeNull();
      expect(_promotionResult).toBeNull();
      expect(_promotionTest).toBeNull();
      expect(_promotionTestReq).toBeNull();
    });
  });

  describe('列挙値エクスポート', () => {
    it('GuildRankがエクスポートされていること', () => {
      expect(GuildRank.G).toBe('G');
      expect(GuildRank.S).toBe('S');
    });

    it('SpecialRuleTypeがエクスポートされていること', () => {
      expect(SpecialRuleType.QUEST_LIMIT).toBe('QUEST_LIMIT');
      expect(SpecialRuleType.QUALITY_PENALTY).toBe('QUALITY_PENALTY');
    });
  });

  describe('サービス関数エクスポート', () => {
    it('calculateRankProgressが使用できること', () => {
      expect(typeof calculateRankProgress).toBe('function');
    });

    it('checkPromotionが使用できること', () => {
      expect(typeof checkPromotion).toBe('function');
    });

    it('calculatePromotionBonusが使用できること', () => {
      expect(typeof calculatePromotionBonus).toBe('function');
    });

    it('getNextRankが使用できること', () => {
      expect(typeof getNextRank).toBe('function');
    });

    it('getRankOrderが使用できること', () => {
      expect(typeof getRankOrder).toBe('function');
    });

    it('applySpecialRulesが使用できること', () => {
      expect(typeof applySpecialRules).toBe('function');
    });

    it('calculateContributionが使用できること', () => {
      expect(typeof calculateContribution).toBe('function');
    });

    it('getQualityModifierが使用できること', () => {
      expect(typeof getQualityModifier).toBe('function');
    });

    it('getClientModifierが使用できること', () => {
      expect(typeof getClientModifier).toBe('function');
    });

    it('getComboModifierが使用できること', () => {
      expect(typeof getComboModifier).toBe('function');
    });
  });

  describe('コンポーネントエクスポート', () => {
    it('RankProgressBarがエクスポートされていること', () => {
      expect(RankProgressBar).toBeDefined();
    });

    it('RankBadgeがエクスポートされていること', () => {
      expect(RankBadge).toBeDefined();
    });

    it('PromotionDialogがエクスポートされていること', () => {
      expect(PromotionDialog).toBeDefined();
    });

    it('SpecialRuleDisplayがエクスポートされていること', () => {
      expect(SpecialRuleDisplay).toBeDefined();
    });
  });
});
