/**
 * PhaseManager リゾルバ生成テスト
 * Issue #428: リゾルバ注入時のユニットテスト追加
 *
 * @description
 * PhaseManagerのcreateMaterialNameResolver()とcreateItemNameResolver()を検証する。
 * MasterDataRepositoryの有無に応じた動作を確認する。
 */

import type { IMasterDataRepository } from '@domain/interfaces/master-data-repository.interface';
import { Container, ServiceKeys } from '@shared/services/di/container';
import { toItemId, toMaterialId } from '@shared/types/ids';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Phaser依存を排除するためのモック
vi.mock('phaser', () => ({
  default: {
    Scene: class MockScene {},
    GameObjects: {
      Container: class MockContainer {},
    },
  },
}));

// PhaseManagerの依存モジュールをモック
vi.mock('@domain/entities/Quest', () => ({
  Quest: class MockQuest {},
}));

vi.mock('@presentation/ui/phases/QuestAcceptPhaseUI', () => ({
  QuestAcceptPhaseUI: class MockQuestAcceptPhaseUI {},
}));

vi.mock('@presentation/ui/phases/DeliveryPhaseUI', () => ({
  DeliveryPhaseUI: class MockDeliveryPhaseUI {},
}));

vi.mock('@features/alchemy', () => ({
  AlchemyPhaseUI: class MockAlchemyPhaseUI {},
}));

vi.mock('@features/gathering', () => ({
  GatheringPhaseUI: class MockGatheringPhaseUI {},
  GATHERING_LOCATIONS: [],
}));

// PhaseManagerをインポート（モック設定後）
import { PhaseManager } from '@scenes/helpers/PhaseManager';

describe('PhaseManager リゾルバ生成', () => {
  let container: ReturnType<typeof Container.getInstance>;

  beforeEach(() => {
    Container.reset();
    container = Container.getInstance();
  });

  afterEach(() => {
    Container.reset();
  });

  // テスト用のPhaseManagerインスタンスを作成するヘルパー
  function createPhaseManager(): PhaseManager {
    const mockScene = {} as unknown as import('phaser').Scene;
    const mockContainer = {} as unknown as import('phaser').GameObjects.Container;
    const mockQuestService = {
      getActiveQuests: vi.fn().mockReturnValue([]),
      acceptQuest: vi.fn(),
    } as unknown as import('@features/quest').IQuestService;

    return new PhaseManager(mockScene, mockContainer, mockQuestService);
  }

  describe('createMaterialNameResolver', () => {
    it('MasterDataRepositoryが登録されていない場合、undefinedを返す', () => {
      const phaseManager = createPhaseManager();

      const resolver = phaseManager.createMaterialNameResolver();

      expect(resolver).toBeUndefined();
    });

    it('MasterDataRepositoryが登録されている場合、リゾルバ関数を返す', () => {
      const mockRepo: Partial<IMasterDataRepository> = {
        getMaterialById: vi.fn(),
      };
      container.register(ServiceKeys.MasterDataRepository, mockRepo);

      const phaseManager = createPhaseManager();
      const resolver = phaseManager.createMaterialNameResolver();

      expect(resolver).toBeTypeOf('function');
    });

    it('リゾルバが素材IDから日本語名を解決する', () => {
      const mockRepo: Partial<IMasterDataRepository> = {
        getMaterialById: vi.fn((id) => {
          if (id === toMaterialId('mat_001')) {
            return {
              id: toMaterialId('mat_001'),
              name: '薬草',
              baseQuality: 50,
              attributes: [],
            };
          }
          return undefined;
        }),
      };
      container.register(ServiceKeys.MasterDataRepository, mockRepo);

      const phaseManager = createPhaseManager();
      const resolver = phaseManager.createMaterialNameResolver();

      expect(resolver).toBeDefined();
      expect(resolver?.('mat_001')).toBe('薬草');
    });

    it('マスターデータに存在しない素材IDの場合、IDをそのまま返す', () => {
      const mockRepo: Partial<IMasterDataRepository> = {
        getMaterialById: vi.fn().mockReturnValue(undefined),
      };
      container.register(ServiceKeys.MasterDataRepository, mockRepo);

      const phaseManager = createPhaseManager();
      const resolver = phaseManager.createMaterialNameResolver();

      expect(resolver).toBeDefined();
      expect(resolver?.('unknown_mat')).toBe('unknown_mat');
    });

    it('リゾルバがtoMaterialIdで正しく型変換して呼び出す', () => {
      const getMaterialById = vi.fn().mockReturnValue(undefined);
      const mockRepo: Partial<IMasterDataRepository> = { getMaterialById };
      container.register(ServiceKeys.MasterDataRepository, mockRepo);

      const phaseManager = createPhaseManager();
      const resolver = phaseManager.createMaterialNameResolver();
      resolver?.('mat_test');

      expect(getMaterialById).toHaveBeenCalledWith(toMaterialId('mat_test'));
    });
  });

  describe('createItemNameResolver', () => {
    it('MasterDataRepositoryが登録されていない場合、undefinedを返す', () => {
      const phaseManager = createPhaseManager();

      const resolver = phaseManager.createItemNameResolver();

      expect(resolver).toBeUndefined();
    });

    it('MasterDataRepositoryが登録されている場合、リゾルバ関数を返す', () => {
      const mockRepo: Partial<IMasterDataRepository> = {
        getItemById: vi.fn(),
      };
      container.register(ServiceKeys.MasterDataRepository, mockRepo);

      const phaseManager = createPhaseManager();
      const resolver = phaseManager.createItemNameResolver();

      expect(resolver).toBeTypeOf('function');
    });

    it('リゾルバがアイテムIDから日本語名を解決する', () => {
      const mockRepo: Partial<IMasterDataRepository> = {
        getItemById: vi.fn((id) => {
          if (id === toItemId('item_001')) {
            return {
              id: toItemId('item_001'),
              name: '癒しの軟膏',
              category: 'MEDICINE',
              effects: [],
            };
          }
          return undefined;
        }),
      };
      container.register(ServiceKeys.MasterDataRepository, mockRepo);

      const phaseManager = createPhaseManager();
      const resolver = phaseManager.createItemNameResolver();

      expect(resolver).toBeDefined();
      expect(resolver?.('item_001')).toBe('癒しの軟膏');
    });

    it('マスターデータに存在しないアイテムIDの場合、IDをそのまま返す', () => {
      const mockRepo: Partial<IMasterDataRepository> = {
        getItemById: vi.fn().mockReturnValue(undefined),
      };
      container.register(ServiceKeys.MasterDataRepository, mockRepo);

      const phaseManager = createPhaseManager();
      const resolver = phaseManager.createItemNameResolver();

      expect(resolver).toBeDefined();
      expect(resolver?.('unknown_item')).toBe('unknown_item');
    });

    it('リゾルバがtoItemIdで正しく型変換して呼び出す', () => {
      const getItemById = vi.fn().mockReturnValue(undefined);
      const mockRepo: Partial<IMasterDataRepository> = { getItemById };
      container.register(ServiceKeys.MasterDataRepository, mockRepo);

      const phaseManager = createPhaseManager();
      const resolver = phaseManager.createItemNameResolver();
      resolver?.('item_test');

      expect(getItemById).toHaveBeenCalledWith(toItemId('item_test'));
    });
  });
});
