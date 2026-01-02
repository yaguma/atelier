import { describe, it, expect, beforeEach } from 'vitest';
import { LocalStorageRepository } from '@infrastructure/storage/LocalStorageRepository';
import { createMockLocalStorage } from '../../utils/test-utils';

describe('LocalStorageRepository', () => {
  let repository: LocalStorageRepository<{ name: string; value: number }>;
  let mockStorage: Storage;

  beforeEach(() => {
    mockStorage = createMockLocalStorage();
    repository = new LocalStorageRepository<{ name: string; value: number }>(mockStorage);
  });

  describe('save', () => {
    it('データを保存できる', () => {
      const data = { name: 'test', value: 42 };
      repository.save('testKey', data);

      const stored = mockStorage.getItem('testKey');
      expect(stored).not.toBeNull();
      expect(JSON.parse(stored!)).toEqual(data);
    });

    it('複数のデータを別々のキーで保存できる', () => {
      const data1 = { name: 'test1', value: 1 };
      const data2 = { name: 'test2', value: 2 };

      repository.save('key1', data1);
      repository.save('key2', data2);

      expect(JSON.parse(mockStorage.getItem('key1')!)).toEqual(data1);
      expect(JSON.parse(mockStorage.getItem('key2')!)).toEqual(data2);
    });

    it('同じキーに保存すると上書きされる', () => {
      repository.save('testKey', { name: 'old', value: 1 });
      repository.save('testKey', { name: 'new', value: 2 });

      const stored = JSON.parse(mockStorage.getItem('testKey')!);
      expect(stored.name).toBe('new');
      expect(stored.value).toBe(2);
    });
  });

  describe('load', () => {
    it('データを読み込める', () => {
      const data = { name: 'test', value: 42 };
      mockStorage.setItem('testKey', JSON.stringify(data));

      const loaded = repository.load('testKey');
      expect(loaded).toEqual(data);
    });

    it('存在しないキーはnullを返す', () => {
      const loaded = repository.load('nonexistent');
      expect(loaded).toBeNull();
    });

    it('不正なJSONはnullを返す', () => {
      mockStorage.setItem('invalidKey', 'not valid json');

      const loaded = repository.load('invalidKey');
      expect(loaded).toBeNull();
    });
  });

  describe('delete', () => {
    it('データを削除できる', () => {
      mockStorage.setItem('testKey', JSON.stringify({ name: 'test', value: 1 }));

      repository.delete('testKey');

      expect(mockStorage.getItem('testKey')).toBeNull();
    });

    it('存在しないキーの削除は何もしない', () => {
      expect(() => repository.delete('nonexistent')).not.toThrow();
    });
  });

  describe('exists', () => {
    it('存在するキーはtrueを返す', () => {
      mockStorage.setItem('testKey', JSON.stringify({ name: 'test', value: 1 }));

      expect(repository.exists('testKey')).toBe(true);
    });

    it('存在しないキーはfalseを返す', () => {
      expect(repository.exists('nonexistent')).toBe(false);
    });
  });

  describe('JSONシリアライズ/デシリアライズ', () => {
    it('複雑なオブジェクトを正しくシリアライズ/デシリアライズできる', () => {
      const complexData = {
        name: 'complex',
        value: 100,
        nested: {
          array: [1, 2, 3],
          object: { a: 'b' },
        },
      };

      // 型を any で回避（複雑なオブジェクトのテスト用）
      const typedRepository = new LocalStorageRepository<typeof complexData>(mockStorage);
      typedRepository.save('complexKey', complexData);
      const loaded = typedRepository.load('complexKey');

      expect(loaded).toEqual(complexData);
    });

    it('日本語文字列を正しく保存・読み込みできる', () => {
      const jaData = { name: 'テスト', value: 42 };
      repository.save('jaKey', jaData);
      const loaded = repository.load('jaKey');

      expect(loaded).toEqual(jaData);
    });

    it('空オブジェクトを正しく保存・読み込みできる', () => {
      const emptyData = { name: '', value: 0 };
      repository.save('emptyKey', emptyData);
      const loaded = repository.load('emptyKey');

      expect(loaded).toEqual(emptyData);
    });
  });
});
