/**
 * ショップドメインサービスのテスト
 * TASK-0098: ショップドメインサービス
 *
 * ショップでの購入処理をテストする
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  ShopService,
  type ShopItem,
  type ShopState,
  type PurchaseResult,
  createShopState,
  ShopItemType,
} from '../../../../src/domain/services/ShopService';
import { GuildRank, Rarity, EffectType } from '../../../../src/domain/common/types';

describe('ShopService', () => {
  // テスト用のショップアイテムデータ
  const sampleCardItem: ShopItem = {
    id: 'shop_card_1',
    type: ShopItemType.CARD,
    itemId: 'gathering_riverside',
    name: '川辺',
    price: 80,
    stock: -1, // 無限在庫
    unlockRank: GuildRank.F,
    description: '水属性の採取地カード',
  };

  const sampleMaterialItem: ShopItem = {
    id: 'shop_material_1',
    type: ShopItemType.MATERIAL,
    itemId: 'herb',
    name: '薬草',
    price: 15,
    stock: 5,
    unlockRank: GuildRank.G,
    description: '基本的な薬草',
  };

  const sampleArtifactItem: ShopItem = {
    id: 'shop_artifact_1',
    type: ShopItemType.ARTIFACT,
    itemId: 'artifact_alchemist_glasses',
    name: '錬金術師の眼鏡',
    price: 300,
    stock: 1,
    unlockRank: GuildRank.F,
    description: '調合品質+1',
    rarity: Rarity.COMMON,
    effect: { type: EffectType.QUALITY_UP, value: 1 },
  };

  const sampleEnhancementCardItem: ShopItem = {
    id: 'shop_enhancement_1',
    type: ShopItemType.CARD,
    itemId: 'enhance_sage_catalyst',
    name: '賢者の触媒',
    price: 80,
    stock: 3,
    unlockRank: GuildRank.G,
    description: '調合品質+1ランク',
  };

  let shopService: ShopService;
  let allShopItems: ShopItem[];

  beforeEach(() => {
    allShopItems = [
      sampleCardItem,
      sampleMaterialItem,
      sampleArtifactItem,
      sampleEnhancementCardItem,
    ];
    shopService = new ShopService(allShopItems);
  });

  describe('getAvailableItems（購入可能な商品リストを取得）', () => {
    it('購入可能な商品リストを取得できる', () => {
      const state = createShopState(GuildRank.G, 1000);

      const items = shopService.getAvailableItems(state);

      expect(items.length).toBeGreaterThan(0);
    });

    it('ランクに応じて商品がフィルタされる', () => {
      // Gランクの場合、Fランク以上が必要な商品は表示されない
      const stateG = createShopState(GuildRank.G, 1000);
      const itemsG = shopService.getAvailableItems(stateG);

      // Gランクで解放される商品のみ
      const gRankItems = itemsG.filter(
        (item) => item.unlockRank === GuildRank.G
      );
      expect(itemsG).toEqual(gRankItems);

      // Fランクの場合、GとF両方の商品が表示される
      const stateF = createShopState(GuildRank.F, 1000);
      const itemsF = shopService.getAvailableItems(stateF);

      expect(itemsF.length).toBeGreaterThan(gRankItems.length);
    });

    it('在庫切れの商品は表示されない', () => {
      // 在庫を0にした状態を作成
      const stateWithoutStock = createShopState(GuildRank.G, 1000, {
        [sampleMaterialItem.id]: 0,
      });

      const items = shopService.getAvailableItems(stateWithoutStock);

      // 在庫切れの素材は含まれない
      const materialItem = items.find(
        (item) => item.id === sampleMaterialItem.id
      );
      expect(materialItem).toBeUndefined();
    });

    it('無限在庫（stock: -1）の商品は常に表示される', () => {
      const state = createShopState(GuildRank.F, 1000);

      const items = shopService.getAvailableItems(state);

      // 無限在庫のカードは表示される
      const cardItem = items.find((item) => item.id === sampleCardItem.id);
      expect(cardItem).toBeDefined();
    });
  });

  describe('canPurchase（購入可能か判定）', () => {
    it('ゴールドが足りて在庫があれば購入できる', () => {
      const state = createShopState(GuildRank.G, 1000);

      const canPurchase = shopService.canPurchase(
        state,
        sampleMaterialItem.id
      );

      expect(canPurchase).toBe(true);
    });

    it('ゴールド不足で購入できない', () => {
      const state = createShopState(GuildRank.G, 10); // 15Gの商品を買うには足りない

      const canPurchase = shopService.canPurchase(
        state,
        sampleMaterialItem.id
      );

      expect(canPurchase).toBe(false);
    });

    it('在庫切れで購入できない', () => {
      const stateWithoutStock = createShopState(GuildRank.G, 1000, {
        [sampleMaterialItem.id]: 0,
      });

      const canPurchase = shopService.canPurchase(
        stateWithoutStock,
        sampleMaterialItem.id
      );

      expect(canPurchase).toBe(false);
    });

    it('ランク未到達で購入できない', () => {
      // Gランクで、Fランク以上必要な商品
      const state = createShopState(GuildRank.G, 1000);

      const canPurchase = shopService.canPurchase(state, sampleCardItem.id);

      expect(canPurchase).toBe(false);
    });
  });

  describe('purchase（商品を購入）', () => {
    it('商品を購入できる', () => {
      const state = createShopState(GuildRank.G, 100);

      const result = shopService.purchase(state, sampleMaterialItem.id);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.purchasedItem).toBeDefined();
        expect(result.value.purchasedItem.id).toBe(sampleMaterialItem.id);
      }
    });

    it('購入時にゴールドが減少する', () => {
      const initialGold = 100;
      const state = createShopState(GuildRank.G, initialGold);

      const result = shopService.purchase(state, sampleMaterialItem.id);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.newState.gold).toBe(
          initialGold - sampleMaterialItem.price
        );
      }
    });

    it('購入時に在庫が減少する', () => {
      const initialStock = 5;
      const state = createShopState(GuildRank.G, 100, {
        [sampleMaterialItem.id]: initialStock,
      });

      const result = shopService.purchase(state, sampleMaterialItem.id);

      expect(result.success).toBe(true);
      if (result.success) {
        const newStock =
          result.value.newState.stockMap[sampleMaterialItem.id];
        expect(newStock).toBe(initialStock - 1);
      }
    });

    it('無限在庫の商品は在庫が減らない', () => {
      const state = createShopState(GuildRank.F, 1000);

      const result = shopService.purchase(state, sampleCardItem.id);

      expect(result.success).toBe(true);
      if (result.success) {
        // 無限在庫なので在庫情報は記録されない
        const stock = result.value.newState.stockMap[sampleCardItem.id];
        expect(stock).toBeUndefined();
      }
    });

    it('カード購入時はデッキに追加される情報が返される', () => {
      const state = createShopState(GuildRank.F, 1000);

      const result = shopService.purchase(state, sampleCardItem.id);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.purchasedItem.type).toBe(ShopItemType.CARD);
        expect(result.value.purchasedItem.itemId).toBe('gathering_riverside');
      }
    });

    it('アーティファクト購入時はインベントリに追加される情報が返される', () => {
      const state = createShopState(GuildRank.F, 1000);

      const result = shopService.purchase(state, sampleArtifactItem.id);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.purchasedItem.type).toBe(ShopItemType.ARTIFACT);
        expect(result.value.purchasedItem.itemId).toBe(
          'artifact_alchemist_glasses'
        );
      }
    });

    it('素材購入時はインベントリに追加される情報が返される', () => {
      const state = createShopState(GuildRank.G, 100);

      const result = shopService.purchase(state, sampleMaterialItem.id);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.purchasedItem.type).toBe(ShopItemType.MATERIAL);
        expect(result.value.purchasedItem.itemId).toBe('herb');
      }
    });

    it('ゴールド不足の場合はエラーを返す', () => {
      const state = createShopState(GuildRank.G, 10);

      const result = shopService.purchase(state, sampleMaterialItem.id);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('ゴールドが不足しています');
      }
    });

    it('在庫切れの場合はエラーを返す', () => {
      const state = createShopState(GuildRank.G, 1000, {
        [sampleMaterialItem.id]: 0,
      });

      const result = shopService.purchase(state, sampleMaterialItem.id);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('在庫がありません');
      }
    });

    it('ランク未到達の場合はエラーを返す', () => {
      const state = createShopState(GuildRank.G, 1000);

      const result = shopService.purchase(state, sampleCardItem.id);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('ランクが足りません');
      }
    });

    it('存在しない商品IDの場合はエラーを返す', () => {
      const state = createShopState(GuildRank.G, 1000);

      const result = shopService.purchase(state, 'non_existent_item');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('商品が見つかりません');
      }
    });
  });

  describe('getItemPrice（価格を取得）', () => {
    it('商品の価格を取得できる', () => {
      const price = shopService.getItemPrice(sampleMaterialItem.id);

      expect(price).toBe(15);
    });

    it('存在しない商品の場合は0を返す', () => {
      const price = shopService.getItemPrice('non_existent');

      expect(price).toBe(0);
    });
  });

  describe('getStock（在庫を取得）', () => {
    it('商品の在庫を取得できる', () => {
      const state = createShopState(GuildRank.G, 1000, {
        [sampleMaterialItem.id]: 3,
      });

      const stock = shopService.getStock(state, sampleMaterialItem.id);

      expect(stock).toBe(3);
    });

    it('在庫情報がない場合はデフォルト在庫を返す', () => {
      const state = createShopState(GuildRank.G, 1000);

      const stock = shopService.getStock(state, sampleMaterialItem.id);

      expect(stock).toBe(sampleMaterialItem.stock);
    });

    it('無限在庫の場合は-1を返す', () => {
      const state = createShopState(GuildRank.F, 1000);

      const stock = shopService.getStock(state, sampleCardItem.id);

      expect(stock).toBe(-1);
    });
  });

  describe('getShopItemById（商品情報を取得）', () => {
    it('IDで商品情報を取得できる', () => {
      const item = shopService.getShopItemById(sampleMaterialItem.id);

      expect(item).toBeDefined();
      expect(item?.name).toBe('薬草');
    });

    it('存在しないIDの場合はundefinedを返す', () => {
      const item = shopService.getShopItemById('non_existent');

      expect(item).toBeUndefined();
    });
  });

  describe('不変性', () => {
    it('purchaseは元のShopStateを変更しない', () => {
      const state = createShopState(GuildRank.G, 100);
      const originalGold = state.gold;
      const originalStockMap = { ...state.stockMap };

      shopService.purchase(state, sampleMaterialItem.id);

      expect(state.gold).toBe(originalGold);
      expect(state.stockMap).toEqual(originalStockMap);
    });
  });
});
