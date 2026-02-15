/**
 * JsonLoader テストケース
 * TASK-0006 マスターデータローダー実装
 *
 * @description
 * JSONローダーのテスト
 */

import { JsonLoader } from '@shared/services/loaders';
import { ApplicationError, ErrorCodes } from '@shared/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('JsonLoader', () => {
  let loader: JsonLoader;

  beforeEach(() => {
    loader = new JsonLoader();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('load', () => {
    it('正常なJSONを読み込める', async () => {
      const mockData = { id: 'test', name: 'テスト' };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const result = await loader.load<typeof mockData>('/test.json');

      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith('/test.json');
    });

    it('配列データを読み込める', async () => {
      const mockData = [
        { id: '1', name: 'アイテム1' },
        { id: '2', name: 'アイテム2' },
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const result = await loader.load<typeof mockData>('/items.json');

      expect(result).toEqual(mockData);
      expect(result.length).toBe(2);
    });

    it('HTTPエラー時にApplicationErrorを投げる', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      });

      await expect(loader.load('/not-found.json')).rejects.toThrow(ApplicationError);
    });

    it('ネットワークエラー時にApplicationErrorを投げる', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      await expect(loader.load('/network-error.json')).rejects.toThrow(ApplicationError);
    });

    it('エラーにDATA_LOAD_FAILEDコードが含まれる', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      });

      try {
        await loader.load('/error.json');
        expect.fail('エラーが投げられるべき');
      } catch (error) {
        expect(error).toBeInstanceOf(ApplicationError);
        expect((error as ApplicationError).code).toBe(ErrorCodes.DATA_LOAD_FAILED);
      }
    });
  });
});
