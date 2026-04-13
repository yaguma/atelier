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

describe('水彩ファンタジーパレット WCAG AA 検証', () => {
  const { surface, text } = SemanticColors;

  // design-guide.md §2.3: テキスト色のWCAG AAコントラスト比を満たすこと。
  // brand / status / quality カラーは非テキスト用途（アイコン・枠・バッジ）として扱うため
  // WCAG AA テキストコントラスト検証の対象外。
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

  // brand / status カラーは非テキスト用途（アイコン・枠・バッジ背景）のため
  // テキストコントラストのWCAG AA検証は対象外。
  // ボタン上の白文字はフォントサイズ・太さで補完する設計。
});
