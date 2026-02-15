/**
 * MasterDataRepository テストケース
 * TASK-0006 マスターデータローダー実装
 *
 * @description
 * T-0006-01 〜 T-0006-05 を実装
 */

import type { IMasterDataRepository } from '@domain/interfaces';
import type { IJsonLoader } from '@shared/services/loaders';
import { MasterDataRepository } from '@shared/services/repositories';
import {
  ApplicationError,
  Attribute,
  CardType,
  ErrorCodes,
  GuildRank,
  toArtifactId,
  toCardId,
  toClientId,
  toItemId,
  toMaterialId,
} from '@shared/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// モックデータ
const mockGatheringCards = [
  {
    id: 'gathering_backyard',
    name: '裏庭',
    type: 'GATHERING',
    baseCost: 0,
    presentationCount: 2,
    rareRate: 0,
    materialPool: ['weed', 'water'],
    rarity: 'COMMON',
    unlockRank: 'G',
    description: 'いつでも使える',
  },
];

const mockRecipeCards = [
  {
    id: 'recipe_healing_potion',
    name: '回復薬',
    type: 'RECIPE',
    cost: 1,
    requiredMaterials: [
      { materialId: 'herb', quantity: 2 },
      { materialId: 'pure_water', quantity: 1 },
    ],
    outputItemId: 'healing_potion',
    category: 'MEDICINE',
    rarity: 'COMMON',
    unlockRank: 'G',
    description: '医療系の基本',
  },
];

const mockEnhancementCards = [
  {
    id: 'enhance_sage_catalyst',
    name: '賢者の触媒',
    type: 'ENHANCEMENT',
    cost: 0,
    effect: { type: 'QUALITY_UP', value: 1 },
    targetAction: 'ALCHEMY',
    rarity: 'COMMON',
    unlockRank: 'G',
    description: '調合品質+1ランク',
  },
];

const mockMaterials = [
  {
    id: 'herb',
    name: '薬草',
    baseQuality: 'C',
    attributes: ['GRASS', 'WATER'],
    description: '薬の基本素材',
  },
  {
    id: 'pure_water',
    name: '清水',
    baseQuality: 'C',
    attributes: ['WATER'],
    description: '澄んだ水',
  },
];

const mockItems = [
  {
    id: 'healing_potion',
    name: '回復薬',
    category: 'MEDICINE',
    effects: [{ type: 'HP_RECOVERY', baseValue: 30 }],
    description: 'HPを回復する薬',
  },
];

const mockRanks = [
  {
    id: 'G',
    name: '見習い',
    requiredContribution: 100,
    dayLimit: 30,
    specialRules: [],
    promotionTest: {
      requirements: [{ itemId: 'healing_potion', quantity: 2 }],
      dayLimit: 5,
    },
    unlockedGatheringCards: ['gathering_backyard'],
    unlockedRecipeCards: ['recipe_healing_potion'],
  },
  {
    id: 'F',
    name: '新人',
    requiredContribution: 200,
    dayLimit: 30,
    specialRules: [{ type: 'QUEST_LIMIT', value: 2, description: '同時受注2件まで' }],
    promotionTest: {
      requirements: [{ itemId: 'healing_potion', quantity: 3, minQuality: 'B' }],
      dayLimit: 5,
    },
    unlockedGatheringCards: ['gathering_riverside'],
    unlockedRecipeCards: ['recipe_antidote'],
  },
];

const mockClients = [
  {
    id: 'villager',
    name: '村人',
    type: 'VILLAGER',
    contributionMultiplier: 0.8,
    goldMultiplier: 0.8,
    deadlineModifier: 1,
    preferredQuestTypes: ['CATEGORY', 'QUANTITY'],
    unlockRank: 'G',
    dialoguePatterns: ['何か薬が欲しいんだ'],
  },
];

const mockQuests = [
  {
    id: 'quest_potion_01',
    clientId: 'villager',
    condition: { type: 'SPECIFIC', itemId: 'potion' },
    contribution: 100,
    gold: 50,
    deadline: 5,
    difficulty: 'normal',
    flavorText: 'ポーションが必要です',
  },
];

const mockArtifacts = [
  {
    id: 'artifact_alchemist_glasses',
    name: '錬金術師の眼鏡',
    effect: { type: 'QUALITY_UP', value: 1 },
    rarity: 'COMMON',
    description: '調合品質+1',
  },
];

// モックローダー
class MockJsonLoader implements IJsonLoader {
  private failOnPath: string | null = null;

  async load<T>(path: string): Promise<T> {
    if (this.failOnPath && path.includes(this.failOnPath)) {
      throw new ApplicationError(ErrorCodes.DATA_LOAD_FAILED, `Failed to load: ${path}`);
    }

    if (path.includes('gathering_cards.json')) {
      return mockGatheringCards as T;
    }
    if (path.includes('recipe_cards.json')) {
      return mockRecipeCards as T;
    }
    if (path.includes('enhancement_cards.json')) {
      return mockEnhancementCards as T;
    }
    if (path.includes('materials.json')) {
      return mockMaterials as T;
    }
    if (path.includes('items.json')) {
      return mockItems as T;
    }
    if (path.includes('guild_ranks.json')) {
      return mockRanks as T;
    }
    if (path.includes('clients.json')) {
      return mockClients as T;
    }
    if (path.includes('quest_templates.json')) {
      return mockQuests as T;
    }
    if (path.includes('artifacts.json')) {
      return mockArtifacts as T;
    }

    throw new ApplicationError(ErrorCodes.DATA_LOAD_FAILED, `Unknown path: ${path}`);
  }

  setFailOnPath(path: string | null): void {
    this.failOnPath = path;
  }
}

describe('MasterDataRepository', () => {
  let repository: IMasterDataRepository;
  let mockLoader: MockJsonLoader;

  beforeEach(() => {
    mockLoader = new MockJsonLoader();
    repository = new MasterDataRepository({ basePath: '/test' }, mockLoader);
  });

  // =============================================================================
  // T-0006-01: カードマスター読み込み
  // =============================================================================

  describe('load / getAllCards', () => {
    it('T-0006-01: カードマスター読み込みで全カード取得可能', async () => {
      await repository.load();

      const cards = repository.getAllCards();

      // 3種類のカード（採取、レシピ、強化）が含まれている
      expect(cards.length).toBe(3);
      expect(cards.some((c) => c.type === 'GATHERING')).toBe(true);
      expect(cards.some((c) => c.type === 'RECIPE')).toBe(true);
      expect(cards.some((c) => c.type === 'ENHANCEMENT')).toBe(true);
    });

    it('カードを種別でフィルタリングできる', async () => {
      await repository.load();

      const gatheringCards = repository.getCardsByType(CardType.GATHERING);
      const recipeCards = repository.getCardsByType(CardType.RECIPE);
      const enhancementCards = repository.getCardsByType(CardType.ENHANCEMENT);

      expect(gatheringCards.length).toBe(1);
      expect(recipeCards.length).toBe(1);
      expect(enhancementCards.length).toBe(1);
    });
  });

  // =============================================================================
  // T-0006-02: IDによる検索
  // =============================================================================

  describe('getById methods', () => {
    it('T-0006-02: IDによる検索で正しいデータ返却', async () => {
      await repository.load();

      const card = repository.getCardById(toCardId('gathering_backyard'));
      expect(card).toBeDefined();
      expect(card?.name).toBe('裏庭');

      const material = repository.getMaterialById(toMaterialId('herb'));
      expect(material).toBeDefined();
      expect(material?.name).toBe('薬草');

      const item = repository.getItemById(toItemId('healing_potion'));
      expect(item).toBeDefined();
      expect(item?.name).toBe('回復薬');

      const rank = repository.getRankByValue(GuildRank.G);
      expect(rank).toBeDefined();
      expect(rank?.name).toBe('見習い');

      const client = repository.getClientById(toClientId('villager'));
      expect(client).toBeDefined();
      expect(client?.name).toBe('村人');

      const artifact = repository.getArtifactById(toArtifactId('artifact_alchemist_glasses'));
      expect(artifact).toBeDefined();
      expect(artifact?.name).toBe('錬金術師の眼鏡');
    });
  });

  // =============================================================================
  // T-0006-03: 存在しないID検索
  // =============================================================================

  describe('non-existent ID search', () => {
    it('T-0006-03: 存在しないID検索でundefined返却', async () => {
      await repository.load();

      expect(repository.getCardById(toCardId('non_existent'))).toBeUndefined();
      expect(repository.getMaterialById(toMaterialId('non_existent'))).toBeUndefined();
      expect(repository.getItemById(toItemId('non_existent'))).toBeUndefined();
      expect(repository.getRankByValue('X' as GuildRank)).toBeUndefined();
      expect(repository.getClientById(toClientId('non_existent'))).toBeUndefined();
      expect(repository.getArtifactById(toArtifactId('non_existent'))).toBeUndefined();
    });
  });

  // =============================================================================
  // T-0006-04: 読み込みエラー
  // =============================================================================

  describe('load errors', () => {
    it('T-0006-04: 読み込みエラー時にエラーをthrow', async () => {
      mockLoader.setFailOnPath('materials');

      await expect(repository.load()).rejects.toThrow(ApplicationError);
    });

    it('未読み込み状態でアクセスするとエラー', () => {
      expect(() => repository.getAllCards()).toThrow(ApplicationError);
      expect(() => repository.getAllMaterials()).toThrow(ApplicationError);
    });

    it('未読み込みエラーにDATA_NOT_LOADEDコードが含まれる', () => {
      try {
        repository.getAllCards();
        expect.fail('エラーが投げられるべき');
      } catch (error) {
        expect(error).toBeInstanceOf(ApplicationError);
        expect((error as ApplicationError).code).toBe(ErrorCodes.DATA_NOT_LOADED);
      }
    });
  });

  // =============================================================================
  // T-0006-05: 複数回load呼び出し
  // =============================================================================

  describe('multiple load calls', () => {
    it('T-0006-05: 複数回load呼び出しで2回目以降はキャッシュ使用', async () => {
      const loadSpy = vi.spyOn(mockLoader, 'load');

      await repository.load();
      expect(loadSpy).toHaveBeenCalled();

      loadSpy.mockClear();

      await repository.load();
      // 2回目のloadではローダーが呼ばれない（キャッシュ使用）
      expect(loadSpy).not.toHaveBeenCalled();

      // データは引き続き取得可能
      expect(repository.getAllCards().length).toBe(3);
    });

    it('isLoadedが正しく状態を返す', async () => {
      expect(repository.isLoaded()).toBe(false);

      await repository.load();

      expect(repository.isLoaded()).toBe(true);
    });
  });

  // =============================================================================
  // 追加テスト: 素材属性フィルタリング
  // =============================================================================

  describe('getMaterialsByAttribute', () => {
    it('属性で素材をフィルタリングできる', async () => {
      await repository.load();

      const waterMaterials = repository.getMaterialsByAttribute(Attribute.WATER);
      expect(waterMaterials.length).toBe(2); // herb, pure_water

      const grassMaterials = repository.getMaterialsByAttribute(Attribute.GRASS);
      expect(grassMaterials.length).toBe(1); // herb

      const fireMaterials = repository.getMaterialsByAttribute(Attribute.FIRE);
      expect(fireMaterials.length).toBe(0);
    });
  });

  // =============================================================================
  // 追加テスト: 全データ取得
  // =============================================================================

  describe('getAll methods', () => {
    it('全素材を取得できる', async () => {
      await repository.load();
      const materials = repository.getAllMaterials();
      expect(materials.length).toBe(2);
    });

    it('全アイテムを取得できる', async () => {
      await repository.load();
      const items = repository.getAllItems();
      expect(items.length).toBe(1);
    });

    it('全ランクを取得できる', async () => {
      await repository.load();
      const ranks = repository.getAllRanks();
      expect(ranks.length).toBe(2);
    });

    it('全依頼者を取得できる', async () => {
      await repository.load();
      const clients = repository.getAllClients();
      expect(clients.length).toBe(1);
    });

    it('全アーティファクトを取得できる', async () => {
      await repository.load();
      const artifacts = repository.getAllArtifacts();
      expect(artifacts.length).toBe(1);
    });
  });

  // =============================================================================
  // 追加テスト: 取得データのイミュータビリティ
  // =============================================================================

  describe('immutability', () => {
    it('取得した配列を変更しても元データに影響しない', async () => {
      await repository.load();

      const cards1 = repository.getAllCards();
      const originalLength = cards1.length;
      cards1.pop();

      const cards2 = repository.getAllCards();
      expect(cards2.length).toBe(originalLength);
    });
  });
});
