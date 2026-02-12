/**
 * calculate-materials.test.ts - calculateMaterials関数のユニットテスト
 *
 * TASK-0073: features/gathering/services作成
 */

import type { GatheringCostResult } from '@features/gathering';
import { calculateGatheringCost } from '@features/gathering';
import { describe, expect, it } from 'vitest';

describe('calculateGatheringCost', () => {
  describe('基本コスト計算', () => {
    it('0個選択で基本コストのみを返すこと', () => {
      const result = calculateGatheringCost(1, 0);

      expect(result.actionPointCost).toBe(1);
      expect(result.extraDays).toBe(0);
    });

    it('1個選択で基本コスト+1を返すこと', () => {
      const result = calculateGatheringCost(1, 1);

      expect(result.actionPointCost).toBe(2);
      expect(result.extraDays).toBe(0);
    });

    it('2個選択で基本コスト+1を返すこと', () => {
      const result = calculateGatheringCost(1, 2);

      expect(result.actionPointCost).toBe(2);
      expect(result.extraDays).toBe(0);
    });

    it('3個選択で基本コスト+2を返すこと', () => {
      const result = calculateGatheringCost(1, 3);

      expect(result.actionPointCost).toBe(3);
      expect(result.extraDays).toBe(0);
    });

    it('4個選択で基本コスト+2を返すこと', () => {
      const result = calculateGatheringCost(1, 4);

      expect(result.actionPointCost).toBe(3);
      expect(result.extraDays).toBe(0);
    });

    it('5個選択で基本コスト+3を返すこと', () => {
      const result = calculateGatheringCost(1, 5);

      expect(result.actionPointCost).toBe(4);
      expect(result.extraDays).toBe(0);
    });

    it('6個選択で基本コスト+3でextraDays=0を返すこと', () => {
      const result = calculateGatheringCost(1, 6);

      expect(result.actionPointCost).toBe(4);
      expect(result.extraDays).toBe(0);
    });
  });

  describe('翌日持越しペナルティ', () => {
    it('7個選択で基本コスト+3でextraDays=1を返すこと', () => {
      const result = calculateGatheringCost(1, 7);

      expect(result.actionPointCost).toBe(4);
      expect(result.extraDays).toBe(1);
    });

    it('10個選択でextraDays=1を返すこと', () => {
      const result = calculateGatheringCost(1, 10);

      expect(result.actionPointCost).toBe(4);
      expect(result.extraDays).toBe(1);
    });
  });

  describe('異なる基本コスト', () => {
    it('基本コスト2の場合に正しく計算されること', () => {
      const result = calculateGatheringCost(2, 3);

      expect(result.actionPointCost).toBe(4);
      expect(result.extraDays).toBe(0);
    });

    it('基本コスト0の場合に正しく計算されること', () => {
      const result = calculateGatheringCost(0, 0);

      expect(result.actionPointCost).toBe(0);
      expect(result.extraDays).toBe(0);
    });
  });

  describe('純粋関数性', () => {
    it('同じ入力に対して同じ結果を返すこと', () => {
      const result1 = calculateGatheringCost(1, 5);
      const result2 = calculateGatheringCost(1, 5);

      expect(result1).toEqual(result2);
    });
  });

  describe('戻り値の型', () => {
    it('GatheringCostResult型のオブジェクトを返すこと', () => {
      const result: GatheringCostResult = calculateGatheringCost(1, 3);

      expect(result).toHaveProperty('actionPointCost');
      expect(result).toHaveProperty('extraDays');
      expect(typeof result.actionPointCost).toBe('number');
      expect(typeof result.extraDays).toBe('number');
    });
  });
});
