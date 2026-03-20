/**
 * extra-gathering-ap-cost.test.ts - 追加採取APコスト計算のテスト
 *
 * Issue #408: かごの容量分だけ繰り返し採取できるようにする
 *
 * @description
 * presentationCount超過後の追加採取に対するAPコスト増加ロジックをテストする。
 * calculateExtraGatheringApCost は純粋関数として実装される。
 */

import { calculateExtraGatheringApCost } from '@features/gathering';
import { describe, expect, it } from 'vitest';

describe('calculateExtraGatheringApCost', () => {
  describe('正常系', () => {
    it('currentRoundがpresentationCount以下の場合、追加APコストは0', () => {
      // presentationCount=3, currentRound=1（基本範囲内）
      const result = calculateExtraGatheringApCost(1, 3);
      expect(result).toBe(0);
    });

    it('currentRoundがpresentationCountと等しい場合、追加APコストは0', () => {
      const result = calculateExtraGatheringApCost(3, 3);
      expect(result).toBe(0);
    });

    it('presentationCountを1超過した場合、追加APコストは1', () => {
      // presentationCount=3, currentRound=4（1回超過）
      const result = calculateExtraGatheringApCost(4, 3);
      expect(result).toBe(1);
    });

    it('presentationCountを2超過した場合、追加APコストは1', () => {
      // 同じ閾値内なので1のまま
      const result = calculateExtraGatheringApCost(5, 3);
      expect(result).toBe(1);
    });

    it('presentationCountを3超過した場合、追加APコストは2', () => {
      const result = calculateExtraGatheringApCost(6, 3);
      expect(result).toBe(2);
    });

    it('presentationCountを4超過した場合、追加APコストは2', () => {
      const result = calculateExtraGatheringApCost(7, 3);
      expect(result).toBe(2);
    });

    it('presentationCountを5超過した場合、追加APコストは3', () => {
      const result = calculateExtraGatheringApCost(8, 3);
      expect(result).toBe(3);
    });
  });

  describe('境界値', () => {
    it('presentationCount=2の裏庭カードでの追加コスト', () => {
      // 基本範囲内
      expect(calculateExtraGatheringApCost(1, 2)).toBe(0);
      expect(calculateExtraGatheringApCost(2, 2)).toBe(0);
      // 1回超過
      expect(calculateExtraGatheringApCost(3, 2)).toBe(1);
      // 2回超過
      expect(calculateExtraGatheringApCost(4, 2)).toBe(1);
    });

    it('presentationCount=5の火山カードでの追加コスト', () => {
      // 基本範囲内
      expect(calculateExtraGatheringApCost(5, 5)).toBe(0);
      // 1回超過
      expect(calculateExtraGatheringApCost(6, 5)).toBe(1);
    });
  });
});
