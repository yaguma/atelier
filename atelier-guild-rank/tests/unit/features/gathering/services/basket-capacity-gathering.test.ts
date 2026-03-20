/**
 * basket-capacity-gathering.test.ts - バスケット容量ベースの採取テスト
 *
 * Issue #408: かごの容量分だけ繰り返し採取できるようにする
 *
 * @description
 * 採取回数の上限をバスケット容量に変更し、presentationCount超過後は
 * 追加APコストが発生する仕組みをテストする。
 */

import { Card } from '@domain/entities/Card';
import { MaterialInstance } from '@domain/entities/MaterialInstance';
import type { IGatheringService } from '@domain/interfaces/gathering-service.interface';
import type { IMasterDataRepository } from '@domain/interfaces/master-data-repository.interface';
import type { IMaterialService } from '@domain/interfaces/material-service.interface';
import type { IEventBus } from '@shared/services/event-bus';
import { GatheringService } from '@shared/services/gathering-service';
import type { IGatheringCardMaster, IMaterial, MaterialId, Quality } from '@shared/types';
import { Attribute, GuildRank, Rarity, toMaterialId } from '@shared/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// モック素材マスターデータ
const mockMaterials: Record<string, IMaterial> = {
  herb: {
    id: toMaterialId('herb'),
    name: '薬草',
    baseQuality: 'B' as Quality,
    attributes: [Attribute.GRASS],
    description: '基本的な薬草',
  },
  mushroom: {
    id: toMaterialId('mushroom'),
    name: 'キノコ',
    baseQuality: 'B' as Quality,
    attributes: [Attribute.GRASS],
    description: '普通のキノコ',
  },
  wood: {
    id: toMaterialId('wood'),
    name: '木材',
    baseQuality: 'C' as Quality,
    attributes: [Attribute.GRASS],
    description: '普通の木材',
  },
};

// バスケット容量付きの採取地カード
const mockGatheringCardWithBasket: IGatheringCardMaster = {
  id: 'gathering_forest',
  name: '近くの森',
  type: 'GATHERING',
  baseCost: 0,
  presentationCount: 3,
  basketCapacity: 6,
  materialPool: [toMaterialId('herb'), toMaterialId('mushroom'), toMaterialId('wood')],
  rareRate: 10,
  rarity: Rarity.COMMON,
  unlockRank: GuildRank.RANK_F,
  description: '自宅近くの森',
};

// バスケット容量なしのカード（後方互換性テスト用）
const mockGatheringCardWithoutBasket: IGatheringCardMaster = {
  id: 'gathering_backyard',
  name: '裏庭',
  type: 'GATHERING',
  baseCost: 0,
  presentationCount: 2,
  materialPool: [toMaterialId('herb'), toMaterialId('wood')],
  rareRate: 0,
  rarity: Rarity.COMMON,
  unlockRank: GuildRank.RANK_F,
  description: '自宅の裏庭',
};

// モックMasterDataRepository
class MockMasterDataRepo {
  isLoaded(): boolean {
    return true;
  }
  getMaterialById(id: unknown): IMaterial | undefined {
    return mockMaterials[String(id)];
  }
}

// モックEventBus
class MockEventBus {
  emit = vi.fn();
  on = vi.fn();
  off = vi.fn();
  once = vi.fn();
}

// モックMaterialService
class MockMaterialService {
  createInstance = vi.fn((materialId: MaterialId, quality: Quality) => {
    const material = mockMaterials[String(materialId)];
    if (!material) throw new Error(`Material not found: ${String(materialId)}`);
    return new MaterialInstance(
      `material_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      material,
      quality,
    );
  });
  generateRandomQuality = vi.fn((baseQuality: Quality) => baseQuality);
}

describe('Issue #408: バスケット容量ベースの採取', () => {
  let gatheringService: IGatheringService;
  let mockMaterialService: IMaterialService;
  let mockMasterDataRepo: MockMasterDataRepo;
  let mockEventBus: IEventBus;

  beforeEach(() => {
    mockMaterialService = new MockMaterialService() as unknown as IMaterialService;
    mockMasterDataRepo = new MockMasterDataRepo();
    mockEventBus = new MockEventBus() as IEventBus;
    gatheringService = new GatheringService(
      mockMaterialService,
      mockMasterDataRepo as unknown as IMasterDataRepository,
      mockEventBus,
    );
  });

  describe('maxRoundsがバスケット容量に基づく', () => {
    it('basketCapacityが設定されている場合、maxRoundsはbasketCapacityになる', () => {
      const card = new Card('card_forest_001', mockGatheringCardWithBasket);
      const session = gatheringService.startDraftGathering(card);

      expect(session.maxRounds).toBe(6); // basketCapacity=6
    });

    it('basketCapacityが未設定の場合、presentationCountにフォールバック', () => {
      const card = new Card('card_backyard_001', mockGatheringCardWithoutBasket);
      const session = gatheringService.startDraftGathering(card);

      expect(session.maxRounds).toBe(2); // presentationCount=2
    });
  });

  describe('presentationCount超過後の追加ラウンド', () => {
    it('presentationCount以降も採取を継続できる', () => {
      const card = new Card('card_forest_002', mockGatheringCardWithBasket);
      const session = gatheringService.startDraftGathering(card);

      // presentationCount(3)を超えて4回目まで選択
      for (let i = 0; i < 4; i++) {
        gatheringService.selectMaterial(session.sessionId, 0);
      }

      expect(session.selectedMaterials).toHaveLength(4);
      expect(session.isComplete).toBe(false); // まだbasketCapacity(6)に達していない
    });

    it('basketCapacityに到達したら採取が完了する', () => {
      const card = new Card('card_forest_003', mockGatheringCardWithBasket);
      const session = gatheringService.startDraftGathering(card);

      // basketCapacity(6)回分選択
      for (let i = 0; i < 6; i++) {
        gatheringService.selectMaterial(session.sessionId, 0);
      }

      expect(session.isComplete).toBe(true);
      expect(session.selectedMaterials).toHaveLength(6);
    });
  });

  describe('DraftSessionのpresentationCount情報', () => {
    it('セッションにpresentationCountが保持される', () => {
      const card = new Card('card_forest_004', mockGatheringCardWithBasket);
      const session = gatheringService.startDraftGathering(card);

      expect(session.presentationCount).toBe(3);
    });
  });
});
