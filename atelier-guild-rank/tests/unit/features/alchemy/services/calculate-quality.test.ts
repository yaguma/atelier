/**
 * calculate-quality.test.ts - calculateQuality関数のユニットテスト
 *
 * TASK-0077: features/alchemy/services作成
 */

import { calculateQuality } from '@features/alchemy/services/calculate-quality';
import type { Quality } from '@shared/types';
import { describe, expect, it } from 'vitest';

describe('calculateQuality', () => {
  describe('空の素材リスト', () => {
    it('空配列の場合D品質を返す', () => {
      expect(calculateQuality([])).toBe('D');
    });
  });

  describe('単一素材', () => {
    it('D品質素材1つでD品質を返す', () => {
      expect(calculateQuality(['D'])).toBe('D');
    });

    it('C品質素材1つでC品質を返す', () => {
      expect(calculateQuality(['C'])).toBe('C');
    });

    it('B品質素材1つでB品質を返す', () => {
      expect(calculateQuality(['B'])).toBe('B');
    });

    it('A品質素材1つでA品質を返す', () => {
      expect(calculateQuality(['A'])).toBe('A');
    });

    it('S品質素材1つでS品質を返す', () => {
      expect(calculateQuality(['S'])).toBe('S');
    });
  });

  describe('複数素材の平均品質', () => {
    it('全てS品質ならS品質を返す', () => {
      expect(calculateQuality(['S', 'S', 'S'])).toBe('S');
    });

    it('全てD品質ならD品質を返す', () => {
      expect(calculateQuality(['D', 'D', 'D'])).toBe('D');
    });

    it('混合品質の場合、平均に基づく品質を返す', () => {
      // A(4) + B(3) = 7, 平均3.5, percentage = (3.5-1)/4*100 = 62.5%
      // QUALITY_THRESHOLDS: S=80, A=60 なので A品質
      const result = calculateQuality(['A', 'B']);
      expect(result).toBe('A');
    });

    it('低品質混合の場合、適切な品質を返す', () => {
      // D(1) + C(2) = 3, 平均1.5, percentage = (1.5-1)/4*100 = 12.5%
      // QUALITY_THRESHOLDS: D=0, C=20 なのでD品質
      const result = calculateQuality(['D', 'C']);
      expect(result).toBe('D');
    });

    it('B品質とC品質の混合', () => {
      // B(3) + C(2) = 5, 平均2.5, percentage = (2.5-1)/4*100 = 37.5%
      // QUALITY_THRESHOLDS: B=40, C=20 なのでC品質
      const result = calculateQuality(['B', 'C']);
      expect(result).toBe('C');
    });
  });

  describe('readonly配列のサポート', () => {
    it('readonlyな品質配列を受け取れる', () => {
      const qualities: readonly Quality[] = ['A', 'B', 'S'] as const;
      const result = calculateQuality(qualities);
      expect(typeof result).toBe('string');
    });
  });
});
