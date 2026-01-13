import { describe, it, expect, beforeEach } from 'vitest';
import { WeakCache } from '@/presentation/phaser/utils/WeakCache';

describe('WeakCache', () => {
  let cache: WeakCache<string, object>;

  beforeEach(() => {
    cache = new WeakCache<string, object>();
  });

  describe('set / get', () => {
    it('値を設定して取得できる', () => {
      const obj = { name: 'test' };

      cache.set('key1', obj);
      const result = cache.get('key1');

      expect(result).toBe(obj);
    });

    it('存在しないキーはundefinedを返す', () => {
      const result = cache.get('nonexistent');

      expect(result).toBeUndefined();
    });

    it('同じキーで上書きできる', () => {
      const obj1 = { name: 'first' };
      const obj2 = { name: 'second' };

      cache.set('key1', obj1);
      cache.set('key1', obj2);
      const result = cache.get('key1');

      expect(result).toBe(obj2);
    });
  });

  describe('delete', () => {
    it('キーを削除できる', () => {
      const obj = { name: 'test' };

      cache.set('key1', obj);
      const deleted = cache.delete('key1');

      expect(deleted).toBe(true);
      expect(cache.get('key1')).toBeUndefined();
    });

    it('存在しないキーの削除はfalseを返す', () => {
      const deleted = cache.delete('nonexistent');

      expect(deleted).toBe(false);
    });
  });

  describe('clear', () => {
    it('全エントリをクリアできる', () => {
      cache.set('key1', { a: 1 });
      cache.set('key2', { b: 2 });

      cache.clear();

      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBeUndefined();
    });
  });

  describe('has', () => {
    it('存在するキーはtrueを返す', () => {
      const obj = { name: 'test' };

      cache.set('key1', obj);

      expect(cache.has('key1')).toBe(true);
    });

    it('存在しないキーはfalseを返す', () => {
      expect(cache.has('nonexistent')).toBe(false);
    });
  });

  describe('size', () => {
    it('有効なエントリ数を返す', () => {
      cache.set('key1', { a: 1 });
      cache.set('key2', { b: 2 });
      cache.set('key3', { c: 3 });

      expect(cache.size).toBe(3);
    });

    it('空のキャッシュは0を返す', () => {
      expect(cache.size).toBe(0);
    });
  });

  describe('keys', () => {
    it('有効なキーの配列を返す', () => {
      cache.set('key1', { a: 1 });
      cache.set('key2', { b: 2 });

      const keys = cache.keys();

      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys.length).toBe(2);
    });
  });

  describe('getStats', () => {
    it('統計情報を取得できる', () => {
      cache.set('key1', { a: 1 });
      cache.set('key2', { b: 2 });

      const stats = cache.getStats();

      expect(stats.totalEntries).toBe(2);
      expect(stats.validEntries).toBe(2);
    });
  });

  // WeakRefとガベージコレクションのテストは
  // JavaScriptのGCタイミングが不確定なため、
  // 実際のGC動作の検証は困難
  // ここでは基本的な動作のみをテスト
});
