/**
 * contribution-calculator.test.ts - 貢献度計算テスト
 * TASK-0092: features/rank/services作成
 */

import type { ContributionContext } from '@features/rank/services/contribution-calculator';
import {
  calculateContribution,
  getClientModifier,
  getComboModifier,
  getQualityModifier,
} from '@features/rank/services/contribution-calculator';
import { describe, expect, it } from 'vitest';

// =============================================================================
// ヘルパー
// =============================================================================

function createContext(overrides: Partial<ContributionContext> = {}): ContributionContext {
  return {
    baseContribution: 100,
    itemQuality: 'B',
    clientType: 'VILLAGER',
    deliveryCount: 1,
    ...overrides,
  };
}

// =============================================================================
// テスト
// =============================================================================

describe('contribution-calculator', () => {
  describe('calculateContribution', () => {
    it('基本的な貢献度を計算すること', () => {
      const result = calculateContribution(createContext());
      // 100 * 1.0(B) * 1.0(VILLAGER) * 1.0(1回目) = 100
      expect(result.contribution).toBe(100);
    });

    it('品質ボーナスを適用すること', () => {
      const result = calculateContribution(createContext({ itemQuality: 'A' }));
      // 100 * 1.5(A) * 1.0 * 1.0 = 150
      expect(result.contribution).toBe(150);
      expect(result.qualityModifier).toBe(1.5);
    });

    it('依頼者補正を適用すること', () => {
      const result = calculateContribution(createContext({ clientType: 'MERCHANT' }));
      // 100 * 1.0(B) * 1.2(MERCHANT) * 1.0 = 120
      expect(result.contribution).toBe(120);
      expect(result.clientModifier).toBe(1.2);
    });

    it('コンボ補正を適用すること', () => {
      const result = calculateContribution(createContext({ deliveryCount: 3 }));
      // 100 * 1.0(B) * 1.0(VILLAGER) * 1.3(3回目) = 130
      expect(result.contribution).toBe(130);
      expect(result.comboModifier).toBeCloseTo(1.3);
    });

    it('全補正の組み合わせを計算すること', () => {
      const result = calculateContribution(
        createContext({
          baseContribution: 100,
          itemQuality: 'A',
          clientType: 'MERCHANT',
          deliveryCount: 2,
        }),
      );
      // 100 * 1.5(A) * 1.2(MERCHANT) * 1.1(2回目) = 198
      expect(result.contribution).toBe(198);
    });

    it('高コンボ(7回以上)でx2.0が適用されること', () => {
      const result = calculateContribution(createContext({ deliveryCount: 7 }));
      // 100 * 1.0(B) * 1.0(VILLAGER) * 2.0(7回目) = 200
      expect(result.contribution).toBe(200);
      expect(result.comboModifier).toBeCloseTo(2.0);
    });

    it('結果を切り捨てで整数化すること', () => {
      const result = calculateContribution(
        createContext({
          baseContribution: 100,
          itemQuality: 'C',
          clientType: 'ADVENTURER',
          deliveryCount: 1,
        }),
      );
      // 100 * 0.75(C) * 1.1(ADVENTURER) * 1.0 = 82.5 → 82
      expect(result.contribution).toBe(82);
    });

    it('品質Dの低品質補正を適用すること', () => {
      const result = calculateContribution(createContext({ itemQuality: 'D' }));
      // 100 * 0.5(D) * 1.0 * 1.0 = 50
      expect(result.contribution).toBe(50);
    });

    it('品質Sの高品質補正を適用すること', () => {
      const result = calculateContribution(createContext({ itemQuality: 'S' }));
      // 100 * 2.0(S) * 1.0 * 1.0 = 200
      expect(result.contribution).toBe(200);
    });

    it('GUILD依頼者の最大補正を適用すること', () => {
      const result = calculateContribution(createContext({ clientType: 'GUILD' }));
      // 100 * 1.0(B) * 1.5(GUILD) * 1.0 = 150
      expect(result.contribution).toBe(150);
    });
  });

  describe('getQualityModifier', () => {
    it('各品質の補正値が正しいこと', () => {
      expect(getQualityModifier('D')).toBe(0.5);
      expect(getQualityModifier('C')).toBe(0.75);
      expect(getQualityModifier('B')).toBe(1.0);
      expect(getQualityModifier('A')).toBe(1.5);
      expect(getQualityModifier('S')).toBe(2.0);
    });
  });

  describe('getClientModifier', () => {
    it('各依頼者タイプの補正値が正しいこと', () => {
      expect(getClientModifier('VILLAGER')).toBe(1.0);
      expect(getClientModifier('ADVENTURER')).toBe(1.1);
      expect(getClientModifier('MERCHANT')).toBe(1.2);
      expect(getClientModifier('NOBLE')).toBe(1.3);
      expect(getClientModifier('GUILD')).toBe(1.5);
    });
  });

  describe('getComboModifier', () => {
    it('1回目は補正なし（1.0）であること', () => {
      expect(getComboModifier(1)).toBe(1.0);
    });

    it('2回目は1.1であること', () => {
      expect(getComboModifier(2)).toBeCloseTo(1.1);
    });

    it('3回目は1.3であること（段階的閾値）', () => {
      expect(getComboModifier(3)).toBeCloseTo(1.3);
    });

    it('4回目は1.3であること（次の閾値まで同値）', () => {
      expect(getComboModifier(4)).toBeCloseTo(1.3);
    });

    it('5回目は1.5であること', () => {
      expect(getComboModifier(5)).toBeCloseTo(1.5);
    });

    it('6回目は1.5であること（次の閾値まで同値）', () => {
      expect(getComboModifier(6)).toBeCloseTo(1.5);
    });

    it('7回目は2.0であること（最大補正）', () => {
      expect(getComboModifier(7)).toBeCloseTo(2.0);
    });

    it('10回目は2.0であること（7以上は全て最大補正）', () => {
      expect(getComboModifier(10)).toBeCloseTo(2.0);
    });
  });

  describe('純粋関数検証', () => {
    it('同じ入力に対して同じ出力を返すこと', () => {
      const context = createContext({ itemQuality: 'A', clientType: 'NOBLE' });
      const result1 = calculateContribution(context);
      const result2 = calculateContribution(context);
      expect(result1).toEqual(result2);
    });

    it('入力オブジェクトを変更しないこと', () => {
      const context = createContext();
      const contextCopy = { ...context };
      calculateContribution(context);
      expect(context).toEqual(contextCopy);
    });
  });
});
