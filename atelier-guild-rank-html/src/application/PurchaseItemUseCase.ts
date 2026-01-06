/**
 * ショップ購入ユースケース
 * TASK-0112: ショップ購入ユースケース
 *
 * ショップでの購入処理を担当するユースケース
 * カード・素材・アーティファクトの購入とアイテム追加を行う
 */

import { StateManager } from '@application/StateManager';
import { EventBus, GameEventType } from '@domain/events/GameEvents';
import {
  ShopService,
  ShopItem,
  ShopItemType,
  createShopState,
} from '@domain/services/ShopService';
import { createMaterialInstance } from '@domain/material/MaterialEntity';
import { Quality, GuildRank, CardType, Rarity, ItemCategory } from '@domain/common/types';
import {
  createGatheringCard,
  createRecipeCard,
  createEnhancementCard,
} from '@domain/card/CardEntity';

/**
 * 購入リクエスト
 */
export interface PurchaseItemRequest {
  /** ショップアイテムID */
  shopItemId: string;
}

/**
 * 購入エラー種別
 */
export type PurchaseItemError =
  | 'ITEM_NOT_FOUND'
  | 'INSUFFICIENT_GOLD'
  | 'INSUFFICIENT_RANK'
  | 'OUT_OF_STOCK'
  | 'INSUFFICIENT_ACTION_POINTS';

/**
 * 購入結果
 */
export interface PurchaseItemResult {
  /** 成功したかどうか */
  success: boolean;
  /** 購入したアイテム */
  purchasedItem?: ShopItem;
  /** エラー種別 */
  error?: PurchaseItemError;
}

/**
 * ショップ購入ユースケースインターフェース
 */
export interface PurchaseItemUseCase {
  /**
   * 購入を実行する
   * @param request 購入リクエスト
   * @returns 購入結果
   */
  execute(request: PurchaseItemRequest): Promise<PurchaseItemResult>;
}

/**
 * ショップ購入ユースケースを生成する
 * @param stateManager ステートマネージャー
 * @param eventBus イベントバス
 * @param shopService ショップサービス
 * @returns ショップ購入ユースケース
 */
export function createPurchaseItemUseCase(
  stateManager: StateManager,
  eventBus: EventBus,
  shopService: ShopService
): PurchaseItemUseCase {
  // 在庫マップをクロージャで保持
  let stockMap: Record<string, number> = {};

  return {
    async execute(request: PurchaseItemRequest): Promise<PurchaseItemResult> {
      const { shopItemId } = request;
      let playerState = stateManager.getPlayerState();

      // 行動ポイントチェック
      if (playerState.actionPoints < 1) {
        return {
          success: false,
          error: 'INSUFFICIENT_ACTION_POINTS',
        };
      }

      // 商品を取得
      const shopItem = shopService.getShopItemById(shopItemId);
      if (!shopItem) {
        return {
          success: false,
          error: 'ITEM_NOT_FOUND',
        };
      }

      // ショップ状態を作成
      const shopState = createShopState(
        playerState.rank,
        playerState.gold,
        stockMap
      );

      // ゴールドチェック
      if (playerState.gold < shopItem.price) {
        return {
          success: false,
          error: 'INSUFFICIENT_GOLD',
        };
      }

      // ランクチェック
      const RankOrder: Record<GuildRank, number> = {
        [GuildRank.G]: 0,
        [GuildRank.F]: 1,
        [GuildRank.E]: 2,
        [GuildRank.D]: 3,
        [GuildRank.C]: 4,
        [GuildRank.B]: 5,
        [GuildRank.A]: 6,
        [GuildRank.S]: 7,
      };

      const currentRankOrder = RankOrder[playerState.rank];
      const requiredRankOrder = RankOrder[shopItem.unlockRank];
      if (requiredRankOrder > currentRankOrder) {
        return {
          success: false,
          error: 'INSUFFICIENT_RANK',
        };
      }

      // 在庫チェック
      const stock = shopService.getStock(shopState, shopItemId);
      if (stock === 0) {
        return {
          success: false,
          error: 'OUT_OF_STOCK',
        };
      }

      // 購入処理
      const purchaseResult = shopService.purchase(shopState, shopItemId);
      if (!purchaseResult.success) {
        return {
          success: false,
          error: 'ITEM_NOT_FOUND',
        };
      }

      // 在庫マップを更新
      stockMap = purchaseResult.value.newState.stockMap;

      // ゴールドを減らす
      playerState = stateManager.getPlayerState();
      stateManager.updatePlayerState({
        ...playerState,
        gold: playerState.gold - shopItem.price,
        actionPoints: playerState.actionPoints - 1,
      });

      // アイテム種別に応じてアイテムを追加
      switch (shopItem.type) {
        case ShopItemType.CARD:
          addCardToDeck(stateManager, shopItem);
          break;
        case ShopItemType.MATERIAL:
          addMaterialToInventory(stateManager, shopItem);
          break;
        case ShopItemType.ARTIFACT:
          addArtifactToPlayer(stateManager, shopItem);
          break;
      }

      // イベントを発行
      eventBus.publish({
        type: GameEventType.ITEM_PURCHASED,
        payload: {
          shopItemId: shopItem.id,
          itemType: shopItem.type,
          itemId: shopItem.itemId,
          price: shopItem.price,
        },
      });

      return {
        success: true,
        purchasedItem: shopItem,
      };
    },
  };
}

/**
 * カードをデッキに追加する
 */
function addCardToDeck(stateManager: StateManager, shopItem: ShopItem): void {
  const deckState = stateManager.getDeckState();

  // 簡易的なカード作成（実際にはマスターデータから取得する）
  const card = createRecipeCard({
    id: shopItem.itemId,
    name: shopItem.name,
    type: CardType.RECIPE,
    rarity: shopItem.rarity ?? Rarity.COMMON,
    unlockRank: shopItem.unlockRank,
    description: shopItem.description,
    cost: 1,
    outputItemId: 'dummy_item',
    requiredMaterials: [],
    category: ItemCategory.MEDICINE,
  });

  stateManager.updateDeckState({
    ...deckState,
    cards: [...deckState.cards, card],
  });
}

/**
 * 素材をインベントリに追加する
 */
function addMaterialToInventory(stateManager: StateManager, shopItem: ShopItem): void {
  const inventoryState = stateManager.getInventoryState();

  // 素材インスタンスを作成
  const material = createMaterialInstance({
    materialId: shopItem.itemId,
    quality: Quality.C,
    quantity: 1,
  });

  stateManager.updateInventoryState({
    ...inventoryState,
    materials: [...inventoryState.materials, material],
  });
}

/**
 * アーティファクトをプレイヤー状態に追加する
 */
function addArtifactToPlayer(stateManager: StateManager, shopItem: ShopItem): void {
  const playerState = stateManager.getPlayerState();

  stateManager.updatePlayerState({
    ...playerState,
    artifacts: [...playerState.artifacts, shopItem.itemId],
  });
}
