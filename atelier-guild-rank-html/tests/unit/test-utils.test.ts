import { describe, it, expect } from 'vitest';
import {
  createMockLocalStorage,
  deepCopy,
  generateRandomId,
  shuffleArray,
  randomInRange,
} from '../utils/test-utils';

describe('Test Utils', () => {
  describe('createMockLocalStorage', () => {
    it('データを保存・取得できること', () => {
      const storage = createMockLocalStorage();
      storage.setItem('key', 'value');
      expect(storage.getItem('key')).toBe('value');
    });

    it('存在しないキーはnullを返すこと', () => {
      const storage = createMockLocalStorage();
      expect(storage.getItem('nonexistent')).toBeNull();
    });

    it('データを削除できること', () => {
      const storage = createMockLocalStorage();
      storage.setItem('key', 'value');
      storage.removeItem('key');
      expect(storage.getItem('key')).toBeNull();
    });

    it('全データをクリアできること', () => {
      const storage = createMockLocalStorage();
      storage.setItem('key1', 'value1');
      storage.setItem('key2', 'value2');
      storage.clear();
      expect(storage.length).toBe(0);
    });

    it('lengthが正しいこと', () => {
      const storage = createMockLocalStorage();
      storage.setItem('key1', 'value1');
      storage.setItem('key2', 'value2');
      expect(storage.length).toBe(2);
    });

    it('keyでインデックスからキーを取得できること', () => {
      const storage = createMockLocalStorage();
      storage.setItem('testKey', 'value');
      expect(storage.key(0)).toBe('testKey');
    });
  });

  describe('deepCopy', () => {
    it('オブジェクトの深いコピーを作成すること', () => {
      const original = { a: 1, b: { c: 2 } };
      const copied = deepCopy(original);

      expect(copied).toEqual(original);
      expect(copied).not.toBe(original);
      expect(copied.b).not.toBe(original.b);
    });

    it('配列の深いコピーを作成すること', () => {
      const original = [1, [2, 3], { a: 4 }];
      const copied = deepCopy(original);

      expect(copied).toEqual(original);
      expect(copied).not.toBe(original);
    });
  });

  describe('generateRandomId', () => {
    it('プレフィックス付きのIDを生成すること', () => {
      const id = generateRandomId('test');
      expect(id).toMatch(/^test_[a-z0-9]+$/);
    });

    it('デフォルトプレフィックスが"test"であること', () => {
      const id = generateRandomId();
      expect(id).toMatch(/^test_[a-z0-9]+$/);
    });

    it('毎回異なるIDを生成すること', () => {
      const id1 = generateRandomId();
      const id2 = generateRandomId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('shuffleArray', () => {
    it('配列の要素数が変わらないこと', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(original);
      expect(shuffled).toHaveLength(original.length);
    });

    it('元の配列を変更しないこと', () => {
      const original = [1, 2, 3, 4, 5];
      const originalCopy = [...original];
      shuffleArray(original);
      expect(original).toEqual(originalCopy);
    });

    it('同じ要素を含むこと', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(original);
      expect(shuffled.sort()).toEqual(original.sort());
    });
  });

  describe('randomInRange', () => {
    it('範囲内の数値を返すこと', () => {
      for (let i = 0; i < 100; i++) {
        const value = randomInRange(1, 10);
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThanOrEqual(10);
      }
    });

    it('整数を返すこと', () => {
      const value = randomInRange(1, 10);
      expect(Number.isInteger(value)).toBe(true);
    });
  });
});
