/**
 * Quality labels tests
 * Issue #460: 色非依存の情報表現 - 品質テキストラベル
 */

import { THEME } from '@shared/theme/theme';
import { describe, expect, it } from 'vitest';

describe('THEME.qualityLabels', () => {
  describe('正常系', () => {
    it('全ての品質グレード(D/C/B/A/S)にラベルが定義されている', () => {
      const grades = ['D', 'C', 'B', 'A', 'S'] as const;
      for (const grade of grades) {
        expect(THEME.qualityLabels[grade]).toBeDefined();
        expect(typeof THEME.qualityLabels[grade]).toBe('string');
        expect(THEME.qualityLabels[grade].length).toBeGreaterThan(0);
      }
    });

    it('qualityLabelsのキーがqualityColorsのキーと一致する', () => {
      const labelKeys = Object.keys(THEME.qualityLabels).sort();
      const colorKeys = Object.keys(THEME.qualityColors).sort();
      expect(labelKeys).toEqual(colorKeys);
    });
  });
});

describe('THEME.sizes', () => {
  describe('A11yフォントサイズ', () => {
    it('最小フォントサイズ(small)が14px以上である', () => {
      expect(THEME.sizes.small).toBeGreaterThanOrEqual(14);
    });

    it('medium以上のフォントサイズが16px以上である', () => {
      expect(THEME.sizes.medium).toBeGreaterThanOrEqual(16);
      expect(THEME.sizes.large).toBeGreaterThanOrEqual(16);
      expect(THEME.sizes.xlarge).toBeGreaterThanOrEqual(16);
    });
  });
});
