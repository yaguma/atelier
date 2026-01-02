import { describe, it, expect } from 'vitest';

/**
 * サンプルテスト
 * テスト環境が正しく設定されていることを確認するためのテスト
 */
describe('Sample Test', () => {
  describe('基本的な演算', () => {
    it('1 + 1 = 2 であること', () => {
      expect(1 + 1).toBe(2);
    });

    it('2 * 3 = 6 であること', () => {
      expect(2 * 3).toBe(6);
    });
  });

  describe('文字列操作', () => {
    it('文字列の連結ができること', () => {
      expect('hello' + ' ' + 'world').toBe('hello world');
    });

    it('文字列のトリムができること', () => {
      expect('  hello  '.trim()).toBe('hello');
    });
  });

  describe('配列操作', () => {
    it('配列の長さが正しいこと', () => {
      expect([1, 2, 3]).toHaveLength(3);
    });

    it('配列に要素が含まれること', () => {
      expect([1, 2, 3]).toContain(2);
    });
  });

  describe('オブジェクト操作', () => {
    it('オブジェクトのプロパティが正しいこと', () => {
      const obj = { name: 'test', value: 42 };
      expect(obj).toHaveProperty('name', 'test');
      expect(obj).toHaveProperty('value', 42);
    });

    it('オブジェクトの比較ができること', () => {
      expect({ a: 1, b: 2 }).toEqual({ a: 1, b: 2 });
    });
  });
});
