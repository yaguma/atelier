/**
 * セーブデータリポジトリのテスト
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SaveDataRepository } from '@infrastructure/repository/SaveDataRepository';
import { ISaveData } from '@domain/save/SaveData';
import { GamePhase, GuildRank } from '@domain/common/types';
import { createMockLocalStorage } from '../../utils/test-utils';

describe('SaveDataRepository', () => {
  let repository: SaveDataRepository;
  let mockLocalStorage: Storage;

  // テスト用の初期セーブデータ
  const createTestSaveData = (overrides: Partial<ISaveData> = {}): ISaveData => ({
    version: '1.0.0',
    lastSaved: '2026-01-01T12:00:00.000Z',
    gameState: {
      currentRank: GuildRank.G,
      promotionGauge: 0,
      requiredContribution: 100,
      remainingDays: 30,
      currentDay: 1,
      currentPhase: GamePhase.QUEST_ACCEPT,
      gold: 100,
      comboCount: 0,
      actionPoints: 3,
      isPromotionTest: false,
      promotionTestRemainingDays: null,
    },
    deckState: {
      deck: ['card_1', 'card_2', 'card_3'],
      hand: [],
      discard: [],
      ownedCards: ['card_1', 'card_2', 'card_3'],
    },
    inventoryState: {
      materials: [],
      craftedItems: [],
      storageLimit: 20,
    },
    questState: {
      activeQuests: [],
      todayClients: [],
      questLimit: 3,
    },
    artifacts: [],
    ...overrides,
  });

  beforeEach(() => {
    mockLocalStorage = createMockLocalStorage();
    repository = new SaveDataRepository(mockLocalStorage);
  });

  describe('create', () => {
    it('新規セーブデータを作成できる', () => {
      const saveData = createTestSaveData();
      repository.create(saveData);

      expect(repository.exists()).toBe(true);
    });

    it('作成したデータが正しく保存されている', () => {
      const saveData = createTestSaveData();
      repository.create(saveData);

      const loaded = repository.load();
      expect(loaded).toEqual(saveData);
    });
  });

  describe('load', () => {
    it('セーブデータを読み込める', () => {
      const saveData = createTestSaveData();
      repository.create(saveData);

      const loaded = repository.load();
      expect(loaded).not.toBeNull();
      expect(loaded?.version).toBe('1.0.0');
      expect(loaded?.gameState.currentRank).toBe(GuildRank.G);
    });

    it('存在しない場合はnullを返す', () => {
      const loaded = repository.load();
      expect(loaded).toBeNull();
    });

    it('不正なJSONはnullを返す', () => {
      mockLocalStorage.setItem('atelier_save_data', 'invalid json');
      const loaded = repository.load();
      expect(loaded).toBeNull();
    });
  });

  describe('save', () => {
    it('セーブデータを更新できる', () => {
      const initialData = createTestSaveData();
      repository.create(initialData);

      const updatedData = createTestSaveData({
        gameState: {
          ...initialData.gameState,
          gold: 500,
          currentDay: 5,
        },
      });
      repository.save(updatedData);

      const loaded = repository.load();
      expect(loaded?.gameState.gold).toBe(500);
      expect(loaded?.gameState.currentDay).toBe(5);
    });

    it('lastSavedが更新されている', () => {
      const initialData = createTestSaveData();
      repository.create(initialData);

      // 1秒待って更新
      const newLastSaved = '2026-01-02T00:00:00.000Z';
      const updatedData = createTestSaveData({
        lastSaved: newLastSaved,
      });
      repository.save(updatedData);

      const loaded = repository.load();
      expect(loaded?.lastSaved).toBe(newLastSaved);
    });
  });

  describe('delete', () => {
    it('セーブデータを削除できる', () => {
      const saveData = createTestSaveData();
      repository.create(saveData);

      expect(repository.exists()).toBe(true);
      repository.delete();
      expect(repository.exists()).toBe(false);
    });

    it('存在しないデータの削除は何もしない', () => {
      expect(repository.exists()).toBe(false);
      repository.delete();
      expect(repository.exists()).toBe(false);
    });
  });

  describe('exists', () => {
    it('セーブデータの存在確認ができる - 存在する場合', () => {
      const saveData = createTestSaveData();
      repository.create(saveData);

      expect(repository.exists()).toBe(true);
    });

    it('セーブデータの存在確認ができる - 存在しない場合', () => {
      expect(repository.exists()).toBe(false);
    });
  });

  describe('getVersion', () => {
    it('セーブデータのバージョン管理ができる', () => {
      const saveData = createTestSaveData({ version: '1.2.0' });
      repository.create(saveData);

      expect(repository.getVersion()).toBe('1.2.0');
    });

    it('存在しない場合はnullを返す', () => {
      expect(repository.getVersion()).toBeNull();
    });
  });

  describe('複雑なデータの保存・読み込み', () => {
    it('ゲーム進行中のデータを正しく保存・読み込みできる', () => {
      const saveData = createTestSaveData({
        gameState: {
          currentRank: GuildRank.E,
          promotionGauge: 180,
          requiredContribution: 350,
          remainingDays: 25,
          currentDay: 10,
          currentPhase: GamePhase.ALCHEMY,
          gold: 850,
          comboCount: 3,
          actionPoints: 1,
          isPromotionTest: false,
          promotionTestRemainingDays: null,
        },
        deckState: {
          deck: ['card_1', 'card_2'],
          hand: ['card_3', 'card_4', 'card_5'],
          discard: ['card_6'],
          ownedCards: [
            'card_1',
            'card_2',
            'card_3',
            'card_4',
            'card_5',
            'card_6',
          ],
        },
        inventoryState: {
          materials: [
            { materialId: 'mat_herb', quality: 'C' as const, quantity: 5 },
            { materialId: 'mat_water', quality: 'B' as const, quantity: 3 },
          ],
          craftedItems: [
            {
              itemId: 'item_healing_potion',
              quality: 'B' as const,
              attributeValues: [{ attribute: 'WATER' as const, value: 8 }],
              effectValues: [{ type: 'HP_RECOVERY' as const, value: 45 }],
              usedMaterials: [
                {
                  materialId: 'mat_herb',
                  quantity: 2,
                  quality: 'C' as const,
                  isRare: false,
                },
              ],
            },
          ],
          storageLimit: 25,
        },
        questState: {
          activeQuests: [
            { questId: 'quest_001', remainingDays: 3, acceptedDay: 8 },
          ],
          todayClients: ['villager', 'adventurer'],
          questLimit: 3,
        },
        artifacts: ['artifact_quality_ring', 'artifact_f_rank_medal'],
      });

      repository.create(saveData);
      const loaded = repository.load();

      expect(loaded).not.toBeNull();
      expect(loaded?.gameState.currentRank).toBe(GuildRank.E);
      expect(loaded?.gameState.promotionGauge).toBe(180);
      expect(loaded?.deckState.hand).toHaveLength(3);
      expect(loaded?.inventoryState.materials).toHaveLength(2);
      expect(loaded?.inventoryState.craftedItems).toHaveLength(1);
      expect(loaded?.questState.activeQuests).toHaveLength(1);
      expect(loaded?.artifacts).toHaveLength(2);
    });

    it('昇格試験中のデータを正しく保存・読み込みできる', () => {
      const saveData = createTestSaveData({
        gameState: {
          currentRank: GuildRank.F,
          promotionGauge: 200,
          requiredContribution: 200,
          remainingDays: 0,
          currentDay: 30,
          currentPhase: GamePhase.GATHERING,
          gold: 300,
          comboCount: 0,
          actionPoints: 3,
          isPromotionTest: true,
          promotionTestRemainingDays: 4,
        },
      });

      repository.create(saveData);
      const loaded = repository.load();

      expect(loaded?.gameState.isPromotionTest).toBe(true);
      expect(loaded?.gameState.promotionTestRemainingDays).toBe(4);
    });
  });
});
