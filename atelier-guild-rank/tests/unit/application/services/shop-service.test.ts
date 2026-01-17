/**
 * shop-service.test.ts - ShopServiceテスト
 *
 * TASK-0016: ShopService・ArtifactService実装
 *
 * @description
 * ShopServiceの単体テスト。
 * ショップでの購入処理をテストする。
 */

import { ShopService } from '@application/services/shop-service';
import type { IDeckService } from '@domain/interfaces/deck-service.interface';
import type { IInventoryService } from '@domain/interfaces/inventory-service.interface';
import type { IMasterDataRepository } from '@domain/interfaces/master-data-repository.interface';
import type { IShopItem } from '@domain/interfaces/shop-service.interface';
import { GuildRank, toArtifactId, toCardId } from '@shared/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// =============================================================================
// モック
// =============================================================================

const createMockDeckService = (): IDeckService =>
  ({
    addCard: vi.fn(),
    removeCard: vi.fn().mockReturnValue(true),
    getOwnedCards: vi.fn().mockReturnValue([]),
    hasCard: vi.fn().mockReturnValue(false),
    // 以下は使用しないがインターフェース要件
    shuffle: vi.fn(),
    draw: vi.fn().mockReturnValue([]),
    playCard: vi.fn(),
    discardCard: vi.fn(),
    refillHand: vi.fn(),
    reshuffleDiscard: vi.fn(),
    getHand: vi.fn().mockReturnValue([]),
    getDeck: vi.fn().mockReturnValue([]),
    getDiscard: vi.fn().mockReturnValue([]),
    reset: vi.fn(),
    getDeckSize: vi.fn().mockReturnValue(0),
    getHandSize: vi.fn().mockReturnValue(0),
    getDiscardSize: vi.fn().mockReturnValue(0),
  }) as unknown as IDeckService;

const createMockInventoryService = (): IInventoryService =>
  ({
    getArtifacts: vi.fn().mockReturnValue([]),
    hasArtifact: vi.fn().mockReturnValue(false),
    addArtifact: vi.fn(),
    removeArtifact: vi.fn().mockReturnValue(true),
    getArtifactCount: vi.fn().mockReturnValue(0),
    getArtifactCapacity: vi.fn().mockReturnValue(10),
    getArtifactRemainingCapacity: vi.fn().mockReturnValue(10),
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
    getMaterialById: vi.fn().mockImplementation((id: string) => ({
      id,
      name: `素材_${id}`,
      baseQuality: 'C',
      attributes: [],
    })),
    getAllCards: vi.fn().mockReturnValue([]),
    getCardById: vi.fn(),
    getCardsByType: vi.fn().mockReturnValue([]),
    getAllMaterials: vi.fn().mockReturnValue([]),
    getMaterialsByAttribute: vi.fn().mockReturnValue([]),
    getAllItems: vi.fn().mockReturnValue([]),
    getItemById: vi.fn(),
    getAllRanks: vi.fn().mockReturnValue([]),
    getRankByValue: vi.fn(),
    getAllClients: vi.fn().mockReturnValue([]),
    getClientById: vi.fn(),
    getAllQuests: vi.fn().mockReturnValue([]),
    getQuestById: vi.fn(),
    getAllArtifacts: vi.fn().mockReturnValue([]),
    getArtifactById: vi.fn(),
    load: vi.fn().mockResolvedValue(undefined),
    isLoaded: vi.fn().mockReturnValue(true),
  }) as unknown as IMasterDataRepository;

// ゲーム状態のモック
interface MockGameState {
  gold: number;
  currentRank: GuildRank;
}

const createMockGameState = (gold = 1000, rank: GuildRank = GuildRank.G): MockGameState => ({
  gold,
  currentRank: rank,
});

// ショップアイテムのモックデータ
const mockShopItems: IShopItem[] = [
  {
    id: 'shop_card_riverside',
    type: 'card',
    itemId: 'gathering_riverside',
    name: '川辺の採取地',
    price: 80,
    stock: -1,
    unlockRank: GuildRank.F,
    description: '川辺で採取ができるカード',
  },
  {
    id: 'shop_card_mountain',
    type: 'card',
    itemId: 'gathering_mountain_rocks',
    name: '山岳地帯',
    price: 150,
    stock: -1,
    unlockRank: GuildRank.E,
    description: '山で採取ができるカード',
  },
  {
    id: 'shop_material_herb',
    type: 'material',
    itemId: 'herb',
    name: '薬草',
    price: 15,
    stock: 5,
    unlockRank: GuildRank.G,
    description: '薬の基本素材',
  },
  {
    id: 'shop_artifact_glasses',
    type: 'artifact',
    itemId: 'artifact_alchemist_glasses',
    name: '錬金術師の眼鏡',
    price: 300,
    stock: 1,
    unlockRank: GuildRank.F,
    description: '調合品質+1',
  },
  {
    id: 'shop_artifact_hourglass',
    type: 'artifact',
    itemId: 'artifact_hourglass',
    name: '時の砂時計',
    price: 500,
    stock: 1,
    unlockRank: GuildRank.D,
    description: '行動ポイント+1/日',
  },
  {
    id: 'shop_item_sold_out',
    type: 'material',
    itemId: 'pure_water',
    name: '清水',
    price: 20,
    stock: 0,
    unlockRank: GuildRank.G,
    description: '澄んだ水（売り切れ）',
  },
];

// =============================================================================
// テスト
// =============================================================================

describe('ShopService', () => {
  let service: ShopService;
  let mockDeckService: IDeckService;
  let mockInventoryService: IInventoryService;
  let mockMasterDataRepository: IMasterDataRepository;
  let mockGameState: MockGameState;

  beforeEach(() => {
    mockDeckService = createMockDeckService();
    mockInventoryService = createMockInventoryService();
    mockMasterDataRepository = createMockMasterDataRepository();
    mockGameState = createMockGameState();
    service = new ShopService(
      mockDeckService,
      mockInventoryService,
      mockMasterDataRepository,
      mockShopItems,
      () => mockGameState.gold,
      (amount: number) => {
        mockGameState.gold -= amount;
      },
    );
  });

  // ===========================================================================
  // getAvailableItems
  // ===========================================================================

  describe('getAvailableItems', () => {
    it('T-SHOP-001: ランクGでアイテム一覧取得', () => {
      const result = service.getAvailableItems(GuildRank.G);

      // ランクG以下で解放 & 在庫あり のアイテムのみ
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((item) => item.unlockRank === GuildRank.G)).toBe(true);
      expect(result.every((item) => item.stock !== 0)).toBe(true);
    });

    it('T-SHOP-002: ランクSでアイテム一覧取得', () => {
      const result = service.getAvailableItems(GuildRank.S);

      // 在庫切れ以外の全アイテムが含まれる
      expect(result.length).toBe(mockShopItems.filter((i) => i.stock !== 0).length);
    });

    it('T-SHOP-003: 在庫0のアイテムは除外', () => {
      const result = service.getAvailableItems(GuildRank.S);

      expect(result.find((item) => item.id === 'shop_item_sold_out')).toBeUndefined();
    });

    it('T-SHOP-004: 無制限在庫(-1)のアイテムは含む', () => {
      const result = service.getAvailableItems(GuildRank.S);

      const unlimitedItems = result.filter((item) => item.stock === -1);
      expect(unlimitedItems.length).toBeGreaterThan(0);
    });
  });

  // ===========================================================================
  // canPurchase
  // ===========================================================================

  describe('canPurchase', () => {
    it('T-SHOP-005: 十分なゴールドで購入可能', () => {
      mockGameState.gold = 1000;
      const result = service.canPurchase('shop_material_herb', mockGameState.gold, GuildRank.G);
      expect(result).toBe(true);
    });

    it('T-SHOP-006: ゴールド不足で購入不可', () => {
      mockGameState.gold = 10;
      const result = service.canPurchase('shop_material_herb', mockGameState.gold, GuildRank.G);
      expect(result).toBe(false);
    });

    it('T-SHOP-007: 在庫切れで購入不可', () => {
      const result = service.canPurchase('shop_item_sold_out', 1000, GuildRank.G);
      expect(result).toBe(false);
    });

    it('T-SHOP-008: ランク不足で購入不可', () => {
      const result = service.canPurchase('shop_card_mountain', 1000, GuildRank.G);
      expect(result).toBe(false);
    });

    it('T-SHOP-009: 存在しないアイテムで購入不可', () => {
      const result = service.canPurchase('nonexistent_item', 1000, GuildRank.S);
      expect(result).toBe(false);
    });

    it('T-SHOP-010: ゴールドちょうどで購入可能', () => {
      mockGameState.gold = 15;
      const result = service.canPurchase('shop_material_herb', mockGameState.gold, GuildRank.G);
      expect(result).toBe(true);
    });
  });

  // ===========================================================================
  // purchase
  // ===========================================================================

  describe('purchase', () => {
    it('T-SHOP-011: カード購入成功', () => {
      mockGameState.gold = 1000;
      service = new ShopService(
        mockDeckService,
        mockInventoryService,
        mockMasterDataRepository,
        mockShopItems,
        () => mockGameState.gold,
        (amount: number) => {
          mockGameState.gold -= amount;
        },
        () => GuildRank.F,
      );

      const result = service.purchase('shop_card_riverside');

      expect(result.success).toBe(true);
      expect(mockDeckService.addCard).toHaveBeenCalledWith(toCardId('gathering_riverside'));
      expect(result.remainingGold).toBe(920); // 1000 - 80
    });

    it('T-SHOP-012: 素材購入成功', () => {
      mockGameState.gold = 1000;

      const result = service.purchase('shop_material_herb');

      expect(result.success).toBe(true);
      expect(mockInventoryService.addMaterial).toHaveBeenCalled();
      expect(result.remainingGold).toBe(985); // 1000 - 15
    });

    it('T-SHOP-013: アーティファクト購入成功', () => {
      mockGameState.gold = 1000;
      service = new ShopService(
        mockDeckService,
        mockInventoryService,
        mockMasterDataRepository,
        mockShopItems,
        () => mockGameState.gold,
        (amount: number) => {
          mockGameState.gold -= amount;
        },
        () => GuildRank.F,
      );

      const result = service.purchase('shop_artifact_glasses');

      expect(result.success).toBe(true);
      expect(mockInventoryService.addArtifact).toHaveBeenCalledWith(
        toArtifactId('artifact_alchemist_glasses'),
      );
      expect(result.remainingGold).toBe(700); // 1000 - 300
    });

    it('T-SHOP-014: ゴールド不足時エラー', () => {
      mockGameState.gold = 10;

      const result = service.purchase('shop_material_herb');

      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('ゴールド');
    });

    it('T-SHOP-015: 在庫切れ時エラー', () => {
      mockGameState.gold = 1000;

      const result = service.purchase('shop_item_sold_out');

      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('在庫');
    });

    it('T-SHOP-016: ランク不足時エラー', () => {
      mockGameState.gold = 1000;
      // デフォルトランクGでランクE必要のアイテムを購入

      const result = service.purchase('shop_card_mountain');

      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('ランク');
    });

    it('T-SHOP-017: 購入後在庫が減少する', () => {
      mockGameState.gold = 1000;

      const beforeStock = service.getStock('shop_material_herb');
      service.purchase('shop_material_herb');
      const afterStock = service.getStock('shop_material_herb');

      expect(afterStock).toBe(beforeStock - 1);
    });

    it('T-SHOP-018: 無制限在庫購入後も在庫-1維持', () => {
      mockGameState.gold = 1000;
      service = new ShopService(
        mockDeckService,
        mockInventoryService,
        mockMasterDataRepository,
        mockShopItems,
        () => mockGameState.gold,
        (amount: number) => {
          mockGameState.gold -= amount;
        },
        () => GuildRank.F,
      );

      const beforeStock = service.getStock('shop_card_riverside');
      service.purchase('shop_card_riverside');
      const afterStock = service.getStock('shop_card_riverside');

      expect(beforeStock).toBe(-1);
      expect(afterStock).toBe(-1);
    });
  });

  // ===========================================================================
  // getItemPrice
  // ===========================================================================

  describe('getItemPrice', () => {
    it('T-SHOP-019: 存在するアイテムの価格取得', () => {
      const price = service.getItemPrice('shop_material_herb');
      expect(price).toBe(15);
    });

    it('T-SHOP-020: 存在しないアイテムの価格取得', () => {
      const price = service.getItemPrice('nonexistent_item');
      expect(price).toBe(0);
    });
  });
});
