/**
 * select-option.test.ts - selectGatheringOption関数のユニットテスト
 *
 * TASK-0073: features/gathering/services作成
 */

import type { MaterialOption } from '@features/gathering';
import { selectGatheringOption } from '@features/gathering';
import type { MaterialId, Quality } from '@shared/types';
import { describe, expect, it } from 'vitest';

// テスト用の素材オプション
function createTestOptions(): MaterialOption[] {
  return [
    { materialId: 'mat-herb' as MaterialId, quality: 'C' as Quality, quantity: 1 },
    { materialId: 'mat-ore' as MaterialId, quality: 'B' as Quality, quantity: 2 },
    { materialId: 'mat-crystal' as MaterialId, quality: 'A' as Quality, quantity: 1 },
  ];
}

describe('selectGatheringOption', () => {
  describe('正常系', () => {
    it('有効なインデックスで選択した素材オプションを返すこと', () => {
      const options = createTestOptions();

      const result = selectGatheringOption(options, 0);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.materialId).toBe('mat-herb');
        expect(result.value.quality).toBe('C');
      }
    });

    it('インデックス1で2番目のオプションを返すこと', () => {
      const options = createTestOptions();

      const result = selectGatheringOption(options, 1);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.materialId).toBe('mat-ore');
        expect(result.value.quality).toBe('B');
        expect(result.value.quantity).toBe(2);
      }
    });

    it('最後のインデックスで最後のオプションを返すこと', () => {
      const options = createTestOptions();

      const result = selectGatheringOption(options, 2);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.materialId).toBe('mat-crystal');
      }
    });
  });

  describe('異常系', () => {
    it('負のインデックスでエラーを返すこと', () => {
      const options = createTestOptions();

      const result = selectGatheringOption(options, -1);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('INVALID_INDEX');
      }
    });

    it('範囲外のインデックスでエラーを返すこと', () => {
      const options = createTestOptions();

      const result = selectGatheringOption(options, 3);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('INVALID_INDEX');
      }
    });

    it('空の選択肢でエラーを返すこと', () => {
      const result = selectGatheringOption([], 0);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('NO_OPTIONS');
      }
    });
  });

  describe('純粋関数性', () => {
    it('同じ入力に対して同じ結果を返すこと', () => {
      const options = createTestOptions();

      const result1 = selectGatheringOption(options, 1);
      const result2 = selectGatheringOption(options, 1);

      expect(result1).toEqual(result2);
    });

    it('入力配列を変更しないこと（イミュータブル）', () => {
      const options = createTestOptions();
      const originalOptions = options.map((o) => ({ ...o }));

      selectGatheringOption(options, 1);

      expect(options).toEqual(originalOptions);
    });
  });
});
