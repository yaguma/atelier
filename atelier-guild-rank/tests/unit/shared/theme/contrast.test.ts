/**
 * Contrast tests
 * Issue #457: UI刷新 Phase 3
 *
 * 設計レポート §4.4 の主要組み合わせが WCAG AA (4.5:1) を満たすことを検証する。
 */

import { contrastRatio, meetsWcagAa, relativeLuminance } from '@shared/theme/contrast';
import { SemanticColors } from '@shared/theme/semantic-colors';
import { describe, expect, it } from 'vitest';

describe('relativeLuminance', () => {
  describe('正常系', () => {
    it('純白 (#FFFFFF) は輝度 1.0 を返す', () => {
      expect(relativeLuminance(0xffffff)).toBeCloseTo(1, 5);
    });

    it('純黒 (#000000) は輝度 0 を返す', () => {
      expect(relativeLuminance(0x000000)).toBeCloseTo(0, 5);
    });
  });
});

describe('contrastRatio', () => {
  describe('正常系', () => {
    it('白と黒は 21:1 を返す', () => {
      expect(contrastRatio(0xffffff, 0x000000)).toBeCloseTo(21, 1);
    });

    it('同色同士は 1:1 を返す', () => {
      expect(contrastRatio(0x123456, 0x123456)).toBeCloseTo(1, 5);
    });

    it('引数の順序に依存しない', () => {
      const a = contrastRatio(0xf2f4f8, 0x0e1118);
      const b = contrastRatio(0x0e1118, 0xf2f4f8);
      expect(a).toBeCloseTo(b, 5);
    });
  });
});

describe('meetsWcagAa', () => {
  describe('正常系', () => {
    it('白と黒の組み合わせは AA を満たす (true)', () => {
      expect(meetsWcagAa(0xffffff, 0x000000)).toBe(true);
    });
  });

  describe('異常系', () => {
    it('同色同士は AA を満たさない (false)', () => {
      expect(meetsWcagAa(0x808080, 0x808080)).toBe(false);
    });

    it('近似した明度同士は AA を満たさない (false)', () => {
      // 4.5:1 未満になる近い色
      expect(meetsWcagAa(0x777777, 0x888888)).toBe(false);
    });

    it('閾値直下 (4:1 程度) は AA を満たさない (false)', () => {
      // #595959 on #ffffff は約 7:1 なので満たす
      // #878787 on #ffffff は約 3.9:1 で満たさない
      expect(meetsWcagAa(0x878787, 0xffffff)).toBe(false);
    });
  });
});

describe('月下の錬金工房パレット WCAG AA 検証', () => {
  const { surface, text, brand, status, quality } = SemanticColors;

  // 設計レポート §4.4: AA (4.5:1) を満たすべき主要組み合わせ。
  // brand.primary / brand.secondary / quality.A / quality.D / text.muted / status.danger は
  // 非テキスト用途（アイコン・枠・アクセント）または補助テキストとして扱うため本テストの対象外。
  describe('Text on Surface', () => {
    it.each([
      ['text.primary on base', text.primary, surface.base],
      ['text.primary on raised', text.primary, surface.raised],
      ['text.primary on panel', text.primary, surface.panel],
      ['text.primary on inset', text.primary, surface.inset],
      ['text.secondary on base', text.secondary, surface.base],
      ['text.secondary on raised', text.secondary, surface.raised],
      ['text.secondary on panel', text.secondary, surface.panel],
      ['text.secondary on inset', text.secondary, surface.inset],
    ])('%s は AA を満たす', (_label, fg, bg) => {
      expect(meetsWcagAa(fg, bg)).toBe(true);
    });
  });

  describe('Accent / Status on Surface', () => {
    it.each([
      ['brand.accent on base', brand.accent, surface.base],
      ['brand.accent on panel', brand.accent, surface.panel],
      ['status.success on base', status.success, surface.base],
      ['status.success on panel', status.success, surface.panel],
      ['status.warning on base', status.warning, surface.base],
      ['status.info on base', status.info, surface.base],
    ])('%s は AA を満たす', (_label, fg, bg) => {
      expect(meetsWcagAa(fg, bg)).toBe(true);
    });
  });

  describe('Quality label on panel', () => {
    it.each([
      ['quality.C on panel', quality.C, surface.panel],
      ['quality.B on panel', quality.B, surface.panel],
      ['quality.S on panel', quality.S, surface.panel],
    ])('%s は AA を満たす', (_label, fg, bg) => {
      expect(meetsWcagAa(fg, bg)).toBe(true);
    });
  });

  // Issue #460: A11y - 追加のコントラスト検証
  describe('Quality label on base surface', () => {
    it.each([
      ['quality.C on base', quality.C, surface.base],
      ['quality.B on base', quality.B, surface.base],
      ['quality.S on base', quality.S, surface.base],
    ])('%s は AA を満たす', (_label, fg, bg) => {
      expect(meetsWcagAa(fg, bg)).toBe(true);
    });
  });

  describe('Quality label on raised surface', () => {
    it.each([
      ['quality.C on raised', quality.C, surface.raised],
      ['quality.B on raised', quality.B, surface.raised],
      ['quality.S on raised', quality.S, surface.raised],
    ])('%s は AA を満たす', (_label, fg, bg) => {
      expect(meetsWcagAa(fg, bg)).toBe(true);
    });
  });

  describe('Status colors on all surfaces', () => {
    it.each([
      ['status.success on raised', status.success, surface.raised],
      ['status.warning on raised', status.warning, surface.raised],
      ['status.info on raised', status.info, surface.raised],
      ['status.success on inset', status.success, surface.inset],
      ['status.warning on inset', status.warning, surface.inset],
    ])('%s は AA を満たす', (_label, fg, bg) => {
      expect(meetsWcagAa(fg, bg)).toBe(true);
    });
  });
});
