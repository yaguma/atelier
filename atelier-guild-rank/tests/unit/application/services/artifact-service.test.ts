/**
 * artifact-service.test.ts - ArtifactServiceテスト
 *
 * TASK-0016: ShopService・ArtifactService実装
 *
 * @description
 * ArtifactServiceの単体テスト。
 * アーティファクト管理とボーナス計算をテストする。
 */

import { ArtifactService } from '@application/services/artifact-service';
import type { IInventoryService } from '@domain/interfaces/inventory-service.interface';
import type { IMasterDataRepository } from '@domain/interfaces/master-data-repository.interface';
import type { IArtifactMaster } from '@shared/types';
import { toArtifactId } from '@shared/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// =============================================================================
// モック
// =============================================================================

const createMockInventoryService = (): IInventoryService =>
  ({
    getArtifacts: vi.fn().mockReturnValue([]),
    hasArtifact: vi.fn().mockReturnValue(false),
    addArtifact: vi.fn(),
    removeArtifact: vi.fn().mockReturnValue(true),
    getArtifactCount: vi.fn().mockReturnValue(0),
    getArtifactCapacity: vi.fn().mockReturnValue(10),
    getArtifactRemainingCapacity: vi.fn().mockReturnValue(10),
    // 以下は使用しないがインターフェース要件
    addMaterial: vi.fn(),
    addMaterials: vi.fn(),
    removeMaterial: vi.fn().mockReturnValue(null),
    removeMaterials: vi.fn().mockReturnValue([]),
    getMaterials: vi.fn().mockReturnValue([]),
    getMaterialsByAttribute: vi.fn().mockReturnValue([]),
    getMaterialCount: vi.fn().mockReturnValue(0),
    addItem: vi.fn(),
    removeItem: vi.fn().mockReturnValue(null),
    getItems: vi.fn().mockReturnValue([]),
    getItemsByType: vi.fn().mockReturnValue([]),
    getItemCount: vi.fn().mockReturnValue(0),
    findMaterialById: vi.fn().mockReturnValue(null),
    findItemById: vi.fn().mockReturnValue(null),
    clear: vi.fn(),
    getMaterialCapacity: vi.fn().mockReturnValue(99),
    getMaterialRemainingCapacity: vi.fn().mockReturnValue(99),
    getItemCapacity: vi.fn().mockReturnValue(99),
    getItemRemainingCapacity: vi.fn().mockReturnValue(99),
  }) as unknown as IInventoryService;

const createMockMasterDataRepository = (): IMasterDataRepository =>
  ({
    getArtifactById: vi.fn().mockImplementation((id: string): IArtifactMaster | undefined => {
      const artifacts: Record<string, IArtifactMaster> = {
        artifact_alchemist_glasses: {
          id: 'artifact_alchemist_glasses',
          name: '錬金術師の眼鏡',
          effect: { type: 'QUALITY_UP', value: 1 },
          rarity: 'COMMON',
          description: '調合品質+1',
        },
        artifact_storage_bag: {
          id: 'artifact_storage_bag',
          name: '採取袋の拡張',
          effect: { type: 'STORAGE_EXPANSION', value: 5 },
          rarity: 'COMMON',
          description: '素材保管+5枠',
        },
        artifact_merchant_ring: {
          id: 'artifact_merchant_ring',
          name: '商人の指輪',
          effect: { type: 'GOLD_BONUS', value: 20 },
          rarity: 'COMMON',
          description: '報酬金+20%',
        },
        artifact_four_leaf: {
          id: 'artifact_four_leaf',
          name: '幸運の四つ葉',
          effect: { type: 'RARE_CHANCE_UP', value: 15 },
          rarity: 'COMMON',
          description: 'レア素材確率+15%',
        },
        artifact_hourglass: {
          id: 'artifact_hourglass',
          name: '時の砂時計',
          effect: { type: 'ACTION_POINT_BONUS', value: 1 },
          rarity: 'RARE',
          description: '行動ポイント+1/日',
        },
        artifact_fake_stone: {
          id: 'artifact_fake_stone',
          name: '賢者の石（偽）',
          effect: { type: 'QUALITY_UP', value: 1 },
          rarity: 'RARE',
          description: '全調合品質+1',
        },
        artifact_guildmaster_seal: {
          id: 'artifact_guildmaster_seal',
          name: 'ギルドマスターの印',
          effect: { type: 'CONTRIBUTION_BONUS', value: 20 },
          rarity: 'RARE',
          description: '貢献度+20%',
        },
        artifact_legendary_cauldron: {
          id: 'artifact_legendary_cauldron',
          name: '伝説の釜',
          effect: { type: 'ALCHEMY_COST_REDUCTION', value: 1 },
          rarity: 'EPIC',
          description: '調合コスト-1',
        },
        artifact_ancient_map: {
          id: 'artifact_ancient_map',
          name: '古代の地図',
          effect: { type: 'PRESENTATION_BONUS', value: 1 },
          rarity: 'EPIC',
          description: '採取の提示回数+1',
        },
        artifact_alchemy_crown: {
          id: 'artifact_alchemy_crown',
          name: '錬金王の冠',
          effect: { type: 'ALL_BONUS', value: 10 },
          rarity: 'LEGENDARY',
          description: '全効果+10%',
        },
      };
      return artifacts[id];
    }),
    // 以下は使用しないがインターフェース要件
    getMaterial: vi.fn(),
    getItem: vi.fn(),
    getCard: vi.fn(),
    getRecipe: vi.fn(),
    getGuildRank: vi.fn(),
    getClient: vi.fn(),
    getQuest: vi.fn(),
    getAllMaterials: vi.fn().mockReturnValue([]),
    getAllItems: vi.fn().mockReturnValue([]),
    getAllCards: vi.fn().mockReturnValue([]),
    getAllRecipes: vi.fn().mockReturnValue([]),
    getAllGuildRanks: vi.fn().mockReturnValue([]),
    getAllClients: vi.fn().mockReturnValue([]),
    getAllQuests: vi.fn().mockReturnValue([]),
    getAllArtifacts: vi.fn().mockReturnValue([]),
    loadAll: vi.fn(),
    isLoaded: vi.fn().mockReturnValue(true),
  }) as unknown as IMasterDataRepository;

// =============================================================================
// テスト
// =============================================================================

describe('ArtifactService', () => {
  let service: ArtifactService;
  let mockInventoryService: IInventoryService;
  let mockMasterDataRepository: IMasterDataRepository;

  beforeEach(() => {
    mockInventoryService = createMockInventoryService();
    mockMasterDataRepository = createMockMasterDataRepository();
    service = new ArtifactService(mockInventoryService, mockMasterDataRepository);
  });

  // ===========================================================================
  // getOwnedArtifacts
  // ===========================================================================

  describe('getOwnedArtifacts', () => {
    it('T-ART-001: 初期状態で空配列を返す', () => {
      const result = service.getOwnedArtifacts();
      expect(result).toEqual([]);
    });

    it('T-ART-002: 追加後に所持リスト取得', () => {
      const artifactId = toArtifactId('artifact_alchemist_glasses');
      vi.mocked(mockInventoryService.getArtifacts).mockReturnValue([artifactId]);

      const result = service.getOwnedArtifacts();
      expect(result).toContain(artifactId);
    });

    it('T-ART-003: 複数所持時にすべて取得', () => {
      const artifactIds = [
        toArtifactId('artifact_alchemist_glasses'),
        toArtifactId('artifact_merchant_ring'),
      ];
      vi.mocked(mockInventoryService.getArtifacts).mockReturnValue(artifactIds);

      const result = service.getOwnedArtifacts();
      expect(result).toHaveLength(2);
      expect(result).toContain(artifactIds[0]);
      expect(result).toContain(artifactIds[1]);
    });
  });

  // ===========================================================================
  // addArtifact
  // ===========================================================================

  describe('addArtifact', () => {
    it('T-ART-004: 新規アーティファクト追加', () => {
      const artifactId = toArtifactId('artifact_alchemist_glasses');

      expect(() => service.addArtifact(artifactId)).not.toThrow();
      expect(mockInventoryService.addArtifact).toHaveBeenCalledWith(artifactId);
    });

    it('T-ART-005: 重複追加でエラー', () => {
      const artifactId = toArtifactId('artifact_alchemist_glasses');
      vi.mocked(mockInventoryService.hasArtifact).mockReturnValue(true);

      expect(() => service.addArtifact(artifactId)).toThrow();
    });
  });

  // ===========================================================================
  // hasArtifact
  // ===========================================================================

  describe('hasArtifact', () => {
    it('T-ART-006: 所持しているアーティファクト', () => {
      const artifactId = toArtifactId('artifact_alchemist_glasses');
      vi.mocked(mockInventoryService.hasArtifact).mockReturnValue(true);

      expect(service.hasArtifact(artifactId)).toBe(true);
    });

    it('T-ART-007: 所持していないアーティファクト', () => {
      const artifactId = toArtifactId('artifact_alchemist_glasses');
      vi.mocked(mockInventoryService.hasArtifact).mockReturnValue(false);

      expect(service.hasArtifact(artifactId)).toBe(false);
    });
  });

  // ===========================================================================
  // getQualityBonus
  // ===========================================================================

  describe('getQualityBonus', () => {
    it('T-ART-008: アーティファクトなしで0', () => {
      expect(service.getQualityBonus()).toBe(0);
    });

    it('T-ART-009: 錬金術師の眼鏡(QUALITY_UP+1)所持', () => {
      vi.mocked(mockInventoryService.getArtifacts).mockReturnValue([
        toArtifactId('artifact_alchemist_glasses'),
      ]);

      expect(service.getQualityBonus()).toBe(1);
    });

    it('T-ART-010: 賢者の石(偽)(QUALITY_UP+1)所持', () => {
      vi.mocked(mockInventoryService.getArtifacts).mockReturnValue([
        toArtifactId('artifact_fake_stone'),
      ]);

      expect(service.getQualityBonus()).toBe(1);
    });

    it('T-ART-011: 複数QUALITY_UP効果の累積', () => {
      vi.mocked(mockInventoryService.getArtifacts).mockReturnValue([
        toArtifactId('artifact_alchemist_glasses'),
        toArtifactId('artifact_fake_stone'),
      ]);

      expect(service.getQualityBonus()).toBe(2);
    });
  });

  // ===========================================================================
  // getContributionBonus
  // ===========================================================================

  describe('getContributionBonus', () => {
    it('T-ART-012: アーティファクトなしで0', () => {
      expect(service.getContributionBonus()).toBe(0);
    });

    it('T-ART-013: ギルドマスターの印(CONTRIBUTION_BONUS+20)所持', () => {
      vi.mocked(mockInventoryService.getArtifacts).mockReturnValue([
        toArtifactId('artifact_guildmaster_seal'),
      ]);

      expect(service.getContributionBonus()).toBe(20);
    });
  });

  // ===========================================================================
  // getGoldBonus
  // ===========================================================================

  describe('getGoldBonus', () => {
    it('T-ART-014: アーティファクトなしで0', () => {
      expect(service.getGoldBonus()).toBe(0);
    });

    it('T-ART-015: 商人の指輪(GOLD_BONUS+20)所持', () => {
      vi.mocked(mockInventoryService.getArtifacts).mockReturnValue([
        toArtifactId('artifact_merchant_ring'),
      ]);

      expect(service.getGoldBonus()).toBe(20);
    });
  });

  // ===========================================================================
  // getStorageBonus
  // ===========================================================================

  describe('getStorageBonus', () => {
    it('T-ART-016: アーティファクトなしで0', () => {
      expect(service.getStorageBonus()).toBe(0);
    });

    it('T-ART-017: 採取袋の拡張(STORAGE_EXPANSION+5)所持', () => {
      vi.mocked(mockInventoryService.getArtifacts).mockReturnValue([
        toArtifactId('artifact_storage_bag'),
      ]);

      expect(service.getStorageBonus()).toBe(5);
    });
  });

  // ===========================================================================
  // getActionPointBonus
  // ===========================================================================

  describe('getActionPointBonus', () => {
    it('T-ART-018: アーティファクトなしで0', () => {
      expect(service.getActionPointBonus()).toBe(0);
    });

    it('T-ART-019: 時の砂時計(ACTION_POINT_BONUS+1)所持', () => {
      vi.mocked(mockInventoryService.getArtifacts).mockReturnValue([
        toArtifactId('artifact_hourglass'),
      ]);

      expect(service.getActionPointBonus()).toBe(1);
    });
  });

  // ===========================================================================
  // getRareChanceBonus
  // ===========================================================================

  describe('getRareChanceBonus', () => {
    it('T-ART-020: アーティファクトなしで0', () => {
      expect(service.getRareChanceBonus()).toBe(0);
    });

    it('T-ART-021: 幸運の四つ葉(RARE_CHANCE_UP+15)所持', () => {
      vi.mocked(mockInventoryService.getArtifacts).mockReturnValue([
        toArtifactId('artifact_four_leaf'),
      ]);

      expect(service.getRareChanceBonus()).toBe(15);
    });
  });

  // ===========================================================================
  // getAlchemyCostReduction
  // ===========================================================================

  describe('getAlchemyCostReduction', () => {
    it('T-ART-022: アーティファクトなしで0', () => {
      expect(service.getAlchemyCostReduction()).toBe(0);
    });

    it('T-ART-023: 伝説の釜(ALCHEMY_COST_REDUCTION+1)所持', () => {
      vi.mocked(mockInventoryService.getArtifacts).mockReturnValue([
        toArtifactId('artifact_legendary_cauldron'),
      ]);

      expect(service.getAlchemyCostReduction()).toBe(1);
    });
  });

  // ===========================================================================
  // getPresentationBonus
  // ===========================================================================

  describe('getPresentationBonus', () => {
    it('T-ART-024: アーティファクトなしで0', () => {
      expect(service.getPresentationBonus()).toBe(0);
    });

    it('T-ART-025: 古代の地図(PRESENTATION_BONUS+1)所持', () => {
      vi.mocked(mockInventoryService.getArtifacts).mockReturnValue([
        toArtifactId('artifact_ancient_map'),
      ]);

      expect(service.getPresentationBonus()).toBe(1);
    });
  });

  // ===========================================================================
  // ALL_BONUS効果
  // ===========================================================================

  describe('ALL_BONUS効果', () => {
    it('T-ART-026: 錬金王の冠(ALL_BONUS+10)の品質ボーナス', () => {
      vi.mocked(mockInventoryService.getArtifacts).mockReturnValue([
        toArtifactId('artifact_alchemy_crown'),
      ]);

      // ALL_BONUS 10%を品質ボーナスとして1とみなす（10% = 1）
      expect(service.getQualityBonus()).toBe(1);
    });

    it('T-ART-027: 錬金王の冠(ALL_BONUS+10)の貢献度ボーナス', () => {
      vi.mocked(mockInventoryService.getArtifacts).mockReturnValue([
        toArtifactId('artifact_alchemy_crown'),
      ]);

      // ALL_BONUS 10%を貢献度ボーナスとして1とみなす（10% = 1）
      expect(service.getContributionBonus()).toBe(1);
    });

    it('T-ART-028: ALL_BONUSと個別効果の累積', () => {
      vi.mocked(mockInventoryService.getArtifacts).mockReturnValue([
        toArtifactId('artifact_alchemist_glasses'), // QUALITY_UP +1
        toArtifactId('artifact_alchemy_crown'), // ALL_BONUS +10 (= +1)
      ]);

      expect(service.getQualityBonus()).toBe(2);
    });
  });
});
