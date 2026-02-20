/**
 * ap-overflow-service.test.ts - AP超過計算サービスのテスト
 *
 * TASK-0103: APOverflowService実装
 *
 * calculateOverflow()の動作を検証する。
 * 境界値テスト（AP0、AP超過なし、1日超過、複数日超過）を網羅。
 */

import { calculateOverflow } from '@features/gathering/services/ap-overflow-service';
import { describe, expect, it } from 'vitest';

describe('calculateOverflow', () => {
  describe('正常系: AP超過なし', () => {
    it('消費APが現在APより少ない場合、超過なしで残APが返る', () => {
      // Arrange
      const input = { currentAP: 3, consumeAP: 2 };

      // Act
      const result = calculateOverflow(input);

      // Assert
      expect(result).toEqual({
        hasOverflow: false,
        overflowAP: 0,
        daysConsumed: 0,
        nextDayAP: 0,
        remainingAP: 1,
      });
    });

    it('消費APが現在APとちょうど同じ場合、超過なしで残AP 0が返る', () => {
      // Arrange
      const input = { currentAP: 3, consumeAP: 3 };

      // Act
      const result = calculateOverflow(input);

      // Assert
      expect(result).toEqual({
        hasOverflow: false,
        overflowAP: 0,
        daysConsumed: 0,
        nextDayAP: 0,
        remainingAP: 0,
      });
    });
  });

  describe('正常系: 1日分のAP超過', () => {
    it('1ポイント超過の場合、1日消費で翌日AP 2が返る', () => {
      // Arrange: currentAP=3, consumeAP=4 → overflowAP=1
      const input = { currentAP: 3, consumeAP: 4 };

      // Act
      const result = calculateOverflow(input);

      // Assert
      expect(result).toEqual({
        hasOverflow: true,
        overflowAP: 1,
        daysConsumed: 1,
        nextDayAP: 2,
        remainingAP: 0,
      });
    });

    it('2ポイント超過の場合、1日消費で翌日AP 1が返る', () => {
      // Arrange: currentAP=3, consumeAP=5 → overflowAP=2
      const input = { currentAP: 3, consumeAP: 5 };

      // Act
      const result = calculateOverflow(input);

      // Assert
      expect(result).toEqual({
        hasOverflow: true,
        overflowAP: 2,
        daysConsumed: 1,
        nextDayAP: 1,
        remainingAP: 0,
      });
    });
  });

  describe('正常系: ちょうどMAX_AP分の超過', () => {
    it('超過APがMAX_APと同じ場合、1日消費で翌日AP=MAX_APが返る', () => {
      // Arrange: currentAP=3, consumeAP=6 → overflowAP=3(=MAX_AP)
      const input = { currentAP: 3, consumeAP: 6 };

      // Act
      const result = calculateOverflow(input);

      // Assert
      expect(result).toEqual({
        hasOverflow: true,
        overflowAP: 3,
        daysConsumed: 1,
        nextDayAP: 3, // MAX_AP（0ではない）
        remainingAP: 0,
      });
    });
  });

  describe('正常系: 複数日分のAP超過', () => {
    it('4ポイント超過の場合、2日消費で翌日AP 2が返る', () => {
      // Arrange: currentAP=3, consumeAP=7 → overflowAP=4
      const input = { currentAP: 3, consumeAP: 7 };

      // Act
      const result = calculateOverflow(input);

      // Assert
      expect(result).toEqual({
        hasOverflow: true,
        overflowAP: 4,
        daysConsumed: 2,
        nextDayAP: 2,
        remainingAP: 0,
      });
    });

    it('6ポイント超過の場合、2日消費で翌日AP=MAX_APが返る', () => {
      // Arrange: currentAP=3, consumeAP=9 → overflowAP=6(=MAX_AP*2)
      const input = { currentAP: 3, consumeAP: 9 };

      // Act
      const result = calculateOverflow(input);

      // Assert
      expect(result).toEqual({
        hasOverflow: true,
        overflowAP: 6,
        daysConsumed: 2,
        nextDayAP: 3, // MAX_AP（0ではない）
        remainingAP: 0,
      });
    });
  });

  describe('境界値: AP残量0からの消費', () => {
    it('AP 0から3消費すると1日消費で翌日AP=MAX_APが返る', () => {
      // Arrange: currentAP=0, consumeAP=3 → overflowAP=3(=MAX_AP)
      const input = { currentAP: 0, consumeAP: 3 };

      // Act
      const result = calculateOverflow(input);

      // Assert
      expect(result).toEqual({
        hasOverflow: true,
        overflowAP: 3,
        daysConsumed: 1,
        nextDayAP: 3,
        remainingAP: 0,
      });
    });

    it('AP 0から1消費すると1日消費で翌日AP 2が返る', () => {
      // Arrange: currentAP=0, consumeAP=1 → overflowAP=1
      const input = { currentAP: 0, consumeAP: 1 };

      // Act
      const result = calculateOverflow(input);

      // Assert
      expect(result).toEqual({
        hasOverflow: true,
        overflowAP: 1,
        daysConsumed: 1,
        nextDayAP: 2,
        remainingAP: 0,
      });
    });
  });

  describe('境界値: 消費AP 0', () => {
    it('消費APが0の場合、超過なしで現在AP全量が残る', () => {
      // Arrange
      const input = { currentAP: 3, consumeAP: 0 };

      // Act
      const result = calculateOverflow(input);

      // Assert
      expect(result).toEqual({
        hasOverflow: false,
        overflowAP: 0,
        daysConsumed: 0,
        nextDayAP: 0,
        remainingAP: 3,
      });
    });
  });

  describe('カスタムmaxAP', () => {
    it('maxAP=5の場合の超過計算が正しい', () => {
      // Arrange: currentAP=3, consumeAP=6, maxAP=5 → overflowAP=3
      const input = { currentAP: 3, consumeAP: 6, maxAP: 5 };

      // Act
      const result = calculateOverflow(input);

      // Assert
      expect(result).toEqual({
        hasOverflow: true,
        overflowAP: 3,
        daysConsumed: 1,
        nextDayAP: 2, // 5 - (3 % 5) = 5 - 3 = 2
        remainingAP: 0,
      });
    });

    it('maxAP=5で超過APがmaxAPの倍数の場合、翌日AP=maxAPが返る', () => {
      // Arrange: currentAP=0, consumeAP=10, maxAP=5 → overflowAP=10(=5*2)
      const input = { currentAP: 0, consumeAP: 10, maxAP: 5 };

      // Act
      const result = calculateOverflow(input);

      // Assert
      expect(result).toEqual({
        hasOverflow: true,
        overflowAP: 10,
        daysConsumed: 2,
        nextDayAP: 5, // maxAP（0ではない）
        remainingAP: 0,
      });
    });
  });

  describe('異常系: 不正なmaxAP', () => {
    it('maxAPが0の場合、エラーを投げる', () => {
      const input = { currentAP: 3, consumeAP: 4, maxAP: 0 };

      expect(() => calculateOverflow(input)).toThrow('maxAP must be a positive integer');
    });

    it('maxAPが負の場合、エラーを投げる', () => {
      const input = { currentAP: 3, consumeAP: 4, maxAP: -1 };

      expect(() => calculateOverflow(input)).toThrow('maxAP must be a positive integer');
    });
  });

  describe('純粋関数の検証', () => {
    it('同じ入力に対して常に同じ結果を返す', () => {
      const input = { currentAP: 3, consumeAP: 4 };

      const result1 = calculateOverflow(input);
      const result2 = calculateOverflow(input);

      expect(result1).toEqual(result2);
    });

    it('入力オブジェクトが変更されない', () => {
      const input = { currentAP: 3, consumeAP: 4 };
      const inputCopy = { ...input };

      calculateOverflow(input);

      expect(input).toEqual(inputCopy);
    });
  });

  describe('設計文書の計算例テーブル', () => {
    // architecture.md計算ロジック表より
    it.each([
      {
        currentAP: 3,
        consumeAP: 2,
        expected: {
          hasOverflow: false,
          overflowAP: 0,
          daysConsumed: 0,
          nextDayAP: 0,
          remainingAP: 1,
        },
      },
      {
        currentAP: 3,
        consumeAP: 3,
        expected: {
          hasOverflow: false,
          overflowAP: 0,
          daysConsumed: 0,
          nextDayAP: 0,
          remainingAP: 0,
        },
      },
      {
        currentAP: 3,
        consumeAP: 4,
        expected: {
          hasOverflow: true,
          overflowAP: 1,
          daysConsumed: 1,
          nextDayAP: 2,
          remainingAP: 0,
        },
      },
      {
        currentAP: 3,
        consumeAP: 6,
        expected: {
          hasOverflow: true,
          overflowAP: 3,
          daysConsumed: 1,
          nextDayAP: 3,
          remainingAP: 0,
        },
      },
      {
        currentAP: 3,
        consumeAP: 7,
        expected: {
          hasOverflow: true,
          overflowAP: 4,
          daysConsumed: 2,
          nextDayAP: 2,
          remainingAP: 0,
        },
      },
      {
        currentAP: 2,
        consumeAP: 5,
        expected: {
          hasOverflow: true,
          overflowAP: 3,
          daysConsumed: 1,
          nextDayAP: 3,
          remainingAP: 0,
        },
      },
      {
        currentAP: 1,
        consumeAP: 4,
        expected: {
          hasOverflow: true,
          overflowAP: 3,
          daysConsumed: 1,
          nextDayAP: 3,
          remainingAP: 0,
        },
      },
      {
        currentAP: 0,
        consumeAP: 3,
        expected: {
          hasOverflow: true,
          overflowAP: 3,
          daysConsumed: 1,
          nextDayAP: 3,
          remainingAP: 0,
        },
      },
    ])('currentAP=$currentAP, consumeAP=$consumeAP → overflow=$expected.overflowAP, days=$expected.daysConsumed', ({
      currentAP,
      consumeAP,
      expected,
    }) => {
      const result = calculateOverflow({ currentAP, consumeAP });
      expect(result).toEqual(expected);
    });
  });
});
