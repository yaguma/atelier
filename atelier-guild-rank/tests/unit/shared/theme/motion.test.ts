/**
 * Motion tokens tests
 * Issue #460: prefers-reduced-motion 対応テスト
 */

import { Duration, motionSafeDuration, prefersReducedMotion } from '@shared/theme/motion';
import { afterEach, describe, expect, it, vi } from 'vitest';

describe('prefersReducedMotion', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('正常系', () => {
    it('matchMedia が reduce を返す場合 true を返す', () => {
      vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }));
      expect(prefersReducedMotion()).toBe(true);
    });

    it('matchMedia が no-preference を返す場合 false を返す', () => {
      vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }));
      expect(prefersReducedMotion()).toBe(false);
    });
  });

  describe('異常系', () => {
    it('window.matchMedia が未定義の場合 false を返す', () => {
      vi.stubGlobal('matchMedia', undefined);
      expect(prefersReducedMotion()).toBe(false);
    });
  });
});

describe('motionSafeDuration', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('正常系', () => {
    it('reduced-motion が無効な場合は指定値をそのまま返す', () => {
      vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }));
      expect(motionSafeDuration(Duration.base)).toBe(Duration.base);
      expect(motionSafeDuration(Duration.slow)).toBe(Duration.slow);
    });

    it('reduced-motion が有効な場合は instant (60ms) を返す', () => {
      vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }));
      expect(motionSafeDuration(Duration.base)).toBe(Duration.instant);
      expect(motionSafeDuration(Duration.slow)).toBe(Duration.instant);
    });
  });
});
