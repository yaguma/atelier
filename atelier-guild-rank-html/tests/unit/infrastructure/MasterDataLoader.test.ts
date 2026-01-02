import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MasterDataLoader } from '../../../src/infrastructure/loader/MasterDataLoader';
import { MasterDataLoadError, MasterDataParseError } from '../../../src/infrastructure/loader/MasterDataLoader';

describe('MasterDataLoader', () => {
  let loader: MasterDataLoader;
  let fetchMock: ReturnType<typeof vi.fn>;
  const originalFetch = global.fetch;

  beforeEach(() => {
    loader = new MasterDataLoader('/data/master');
    fetchMock = vi.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('load', () => {
    it('JSONファイルを読み込める', async () => {
      const mockData = { id: 'test', name: 'テストデータ' };
      fetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await loader.load<typeof mockData>('test.json');

      expect(result).toEqual(mockData);
      expect(fetchMock).toHaveBeenCalledWith('/data/master/test.json');
    });

    it('存在しないファイルでMasterDataLoadErrorをスローする', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(loader.load('nonexistent.json')).rejects.toThrow(
        MasterDataLoadError
      );
    });

    it('不正なJSONでMasterDataParseErrorをスローする', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.reject(new SyntaxError('Invalid JSON')),
      });

      await expect(loader.load('invalid.json')).rejects.toThrow(
        MasterDataParseError
      );
    });

    it('キャッシュが機能する', async () => {
      const mockData = { id: 'cached', name: 'キャッシュテスト' };
      fetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      // 1回目の読み込み
      const result1 = await loader.load<typeof mockData>('cached.json');
      // 2回目の読み込み（キャッシュから）
      const result2 = await loader.load<typeof mockData>('cached.json');

      expect(result1).toEqual(mockData);
      expect(result2).toEqual(mockData);
      // fetchは1回しか呼ばれないはず
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('ネットワークエラーでMasterDataLoadErrorをスローする', async () => {
      fetchMock.mockRejectedValue(new Error('Network error'));

      await expect(loader.load('network-error.json')).rejects.toThrow(
        MasterDataLoadError
      );
    });
  });

  describe('loadAll', () => {
    it('複数のマスターデータを一括ロードできる', async () => {
      const mockGathering = [{ id: 'g1', name: '草原' }];
      const mockRecipe = [{ id: 'r1', name: '回復薬' }];
      const mockEnhancement = [{ id: 'e1', name: '品質アップ' }];
      const mockMaterials = [{ id: 'm1', name: '薬草' }];
      const mockItems = [{ id: 'i1', name: '回復薬' }];
      const mockQuests = [{ id: 'q1', type: 'SPECIFIC' }];
      const mockRanks = [{ id: 'G', name: 'Gランク' }];
      const mockArtifacts = [{ id: 'a1', name: '錬金術の指輪' }];

      fetchMock.mockImplementation((url: string) => {
        const responseMap: Record<string, unknown> = {
          '/data/master/cards/gathering.json': mockGathering,
          '/data/master/cards/recipe.json': mockRecipe,
          '/data/master/cards/enhancement.json': mockEnhancement,
          '/data/master/materials.json': mockMaterials,
          '/data/master/items.json': mockItems,
          '/data/master/quests.json': mockQuests,
          '/data/master/ranks.json': mockRanks,
          '/data/master/artifacts.json': mockArtifacts,
        };

        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(responseMap[url] || []),
        });
      });

      const result = await loader.loadAll();

      expect(result.cards.gathering).toEqual(mockGathering);
      expect(result.cards.recipe).toEqual(mockRecipe);
      expect(result.cards.enhancement).toEqual(mockEnhancement);
      expect(result.materials).toEqual(mockMaterials);
      expect(result.items).toEqual(mockItems);
      expect(result.quests).toEqual(mockQuests);
      expect(result.ranks).toEqual(mockRanks);
      expect(result.artifacts).toEqual(mockArtifacts);
    });

    it('1つのファイル読み込み失敗で全体がエラーになる', async () => {
      fetchMock.mockImplementation((url: string) => {
        if (url.includes('materials.json')) {
          return Promise.resolve({
            ok: false,
            status: 404,
            statusText: 'Not Found',
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      });

      await expect(loader.loadAll()).rejects.toThrow(MasterDataLoadError);
    });
  });

  describe('clearCache', () => {
    it('キャッシュをクリアできる', async () => {
      const mockData1 = { id: 'test1', version: 1 };
      const mockData2 = { id: 'test1', version: 2 };

      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockData1),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockData2),
        });

      // 1回目の読み込み
      const result1 = await loader.load<typeof mockData1>('test.json');
      expect(result1).toEqual(mockData1);

      // キャッシュクリア
      loader.clearCache();

      // 2回目の読み込み（新しいデータ）
      const result2 = await loader.load<typeof mockData2>('test.json');
      expect(result2).toEqual(mockData2);

      // fetchは2回呼ばれるはず
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });

  describe('カスタムベースパス', () => {
    it('ベースパスなしで初期化できる', async () => {
      const customLoader = new MasterDataLoader();
      const mockData = { id: 'test' };
      fetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      await customLoader.load('custom/path.json');

      expect(fetchMock).toHaveBeenCalledWith('custom/path.json');
    });

    it('末尾スラッシュがあっても正しくパスを構築する', async () => {
      const customLoader = new MasterDataLoader('/data/');
      const mockData = { id: 'test' };
      fetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      await customLoader.load('test.json');

      expect(fetchMock).toHaveBeenCalledWith('/data/test.json');
    });
  });
});
