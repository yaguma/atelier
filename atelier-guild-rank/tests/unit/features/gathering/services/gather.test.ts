/**
 * gather.test.ts - gather関数のユニットテスト
 *
 * TASK-0073: features/gathering/services作成
 */

import { gather } from '@features/gathering/services/gather';
import type { MaterialId, Quality } from '@shared/types';
import { describe, expect, it } from 'vitest';

// テスト用の素材プールデータ
const testMaterialPool: MaterialId[] = [
  'mat-herb' as MaterialId,
  'mat-ore' as MaterialId,
  'mat-crystal' as MaterialId,
  'mat-wood' as MaterialId,
];

// テスト用の素材基本品質マップ
const testBaseQualities: Record<string, Quality> = {
  'mat-herb': 'C',
  'mat-ore': 'D',
  'mat-crystal': 'B',
  'mat-wood': 'D',
};

describe('gather', () => {
  describe('基本動作', () => {
    it('指定された数の素材オプションを生成すること', () => {
      const result = gather({
        materialPool: testMaterialPool,
        baseQualities: testBaseQualities,
        optionCount: 3,
        randomValues: [0.1, 0.5, 0.9],
        qualityRandomValues: [0.5, 0.5, 0.5],
      });

      expect(result.options).toHaveLength(3);
    });

    it('各オプションがmaterialId, quality, quantityを持つこと', () => {
      const result = gather({
        materialPool: testMaterialPool,
        baseQualities: testBaseQualities,
        optionCount: 3,
        randomValues: [0.0, 0.25, 0.5],
        qualityRandomValues: [0.5, 0.5, 0.5],
      });

      for (const option of result.options) {
        expect(option.materialId).toBeDefined();
        expect(option.quality).toBeDefined();
        expect(option.quantity).toBeGreaterThan(0);
      }
    });

    it('素材プールから素材が選択されること', () => {
      const result = gather({
        materialPool: testMaterialPool,
        baseQualities: testBaseQualities,
        optionCount: 3,
        randomValues: [0.0, 0.25, 0.5],
        qualityRandomValues: [0.5, 0.5, 0.5],
      });

      for (const option of result.options) {
        expect(testMaterialPool).toContain(option.materialId);
      }
    });
  });

  describe('純粋関数性', () => {
    it('同じ入力に対して同じ結果を返すこと', () => {
      const input = {
        materialPool: testMaterialPool,
        baseQualities: testBaseQualities,
        optionCount: 3,
        randomValues: [0.2, 0.6, 0.8],
        qualityRandomValues: [0.3, 0.7, 0.1],
      };

      const result1 = gather(input);
      const result2 = gather(input);

      expect(result1).toEqual(result2);
    });

    it('入力配列を変更しないこと（イミュータブル）', () => {
      const materialPool = [...testMaterialPool];
      const randomValues = [0.1, 0.5, 0.9];
      const qualityRandomValues = [0.5, 0.5, 0.5];
      const originalPool = [...materialPool];
      const originalRandom = [...randomValues];

      gather({
        materialPool,
        baseQualities: testBaseQualities,
        optionCount: 3,
        randomValues,
        qualityRandomValues,
      });

      expect(materialPool).toEqual(originalPool);
      expect(randomValues).toEqual(originalRandom);
    });
  });

  describe('乱数による素材選択', () => {
    it('randomValue=0.0でプールの最初の素材が選択されること', () => {
      const result = gather({
        materialPool: testMaterialPool,
        baseQualities: testBaseQualities,
        optionCount: 1,
        randomValues: [0.0],
        qualityRandomValues: [0.5],
      });

      expect(result.options[0]?.materialId).toBe('mat-herb');
    });

    it('randomValue=0.99でプールの最後の素材が選択されること', () => {
      const result = gather({
        materialPool: testMaterialPool,
        baseQualities: testBaseQualities,
        optionCount: 1,
        randomValues: [0.99],
        qualityRandomValues: [0.5],
      });

      expect(result.options[0]?.materialId).toBe('mat-wood');
    });
  });

  describe('エッジケース', () => {
    it('素材プールが空の場合、空のオプションを返すこと', () => {
      const result = gather({
        materialPool: [],
        baseQualities: {},
        optionCount: 3,
        randomValues: [0.1, 0.5, 0.9],
        qualityRandomValues: [0.5, 0.5, 0.5],
      });

      expect(result.options).toEqual([]);
    });

    it('optionCountが0の場合、空のオプションを返すこと', () => {
      const result = gather({
        materialPool: testMaterialPool,
        baseQualities: testBaseQualities,
        optionCount: 0,
        randomValues: [],
        qualityRandomValues: [],
      });

      expect(result.options).toEqual([]);
    });
  });
});
