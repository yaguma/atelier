import { toColorStr } from '@shared/theme';
import { describe, expect, it } from 'vitest';

describe('toColorStr', () => {
  describe('正常系', () => {
    it('6桁の16進カラーをCSS文字列に変換する', () => {
      expect(toColorStr(0xff0000)).toBe('#ff0000');
    });

    it('先頭がゼロの場合もゼロ埋めされる', () => {
      expect(toColorStr(0x003300)).toBe('#003300');
    });

    it('0x000000は#000000を返す', () => {
      expect(toColorStr(0x000000)).toBe('#000000');
    });

    it('0xffffffは#ffffffを返す', () => {
      expect(toColorStr(0xffffff)).toBe('#ffffff');
    });

    it('代表的なテーマカラーを正しく変換する', () => {
      // Colors.text.primary = 0x333333
      expect(toColorStr(0x333333)).toBe('#333333');
    });
  });
});
