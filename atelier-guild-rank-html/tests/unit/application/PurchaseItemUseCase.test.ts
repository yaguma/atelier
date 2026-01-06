/**
 * PurchaseItemUseCaseテスト
 * TASK-0112: ショップ購入ユースケース
 *
 * ショップでの購入処理をテストする
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  PurchaseItemUseCase,
  createPurchaseItemUseCase,
  PurchaseItemResult,
} from '@application/PurchaseItemUseCase';
import { StateManager, createStateManager } from '@application/StateManager';
import { EventBus, createEventBus, GameEventType } from '@domain/events/GameEvents';
import { GamePhase, GuildRank, CardType, Rarity } from '@domain/common/types';
import { ShopItem, ShopItemType, ShopService, createShopState } from '@domain/services/ShopService';
import { createMaterial } from '@domain/material/MaterialEntity';
import { Quality } from '@domain/common/types';

describe('PurchaseItemUseCase', () => {
  let purchaseItemUseCase: PurchaseItemUseCase;
  let stateManager: StateManager;
  let eventBus: EventBus;
  let shopService: ShopService;

  // テスト用ショップアイテム
  const testShopItems: ShopItem[] = [
    {
      id: 'shop_card_1',
      type: ShopItemType.CARD,
      itemId: 'card_recipe_1',
      name: 'テストレシピカード',
      price: 100,
      stock: 3,
      unlockRank: GuildRank.G,
      description: 'テスト用レシピカード',
    },
    {
      id: 'shop_material_1',
      type: ShopItemType.MATERIAL,
      itemId: 'material_1',
      name: 'テスト素材',
      price: 50,
      stock: -1, // 無限在庫
      unlockRank: GuildRank.G,
      description: 'テスト用素材',
    },
    {
      id: 'shop_artifact_1',
      type: ShopItemType.ARTIFACT,
      itemId: 'artifact_1',
      name: 'テストアーティファクト',
      price: 500,
      stock: 1,
      unlockRank: GuildRank.G,
      description: 'テスト用アーティファクト',
      rarity: Rarity.RARE,
    },
    {
      id: 'shop_card_f_rank',
      type: ShopItemType.CARD,
      itemId: 'card_recipe_f',
      name: 'Fランクカード',
      price: 200,
      stock: 1,
      unlockRank: GuildRank.F,
      description: 'Fランク以上で購入可能',
    },
  ];

  beforeEach(() => {
    // イベントバスを生成
    eventBus = createEventBus();
    // ステートマネージャーを生成
    stateManager = createStateManager();
    // ショップサービスを生成
    shopService = new ShopService(testShopItems);

    // 初期状態を設定
    const playerState = stateManager.getPlayerState();
    stateManager.updatePlayerState({
      ...playerState,
      actionPoints: 3,
      actionPointsMax: 3,
      gold: 1000,
      rank: GuildRank.G,
    });

    // ゲーム状態を設定
    const gameState = stateManager.getGameState();
    stateManager.updateGameState({
      ...gameState,
      currentPhase: GamePhase.QUEST_ACCEPT,
      currentDay: 1,
    });

    // ユースケースを生成
    purchaseItemUseCase = createPurchaseItemUseCase(stateManager, eventBus, shopService);
  });

  describe('購入処理', () => {
    it('商品を購入できる', async () => {
      const result = await purchaseItemUseCase.execute({
        shopItemId: 'shop_card_1',
      });

      expect(result.success).toBe(true);
      expect(result.purchasedItem).toBeDefined();
      expect(result.purchasedItem?.id).toBe('shop_card_1');
    });

    it('ゴールドが減少する', async () => {
      const initialGold = stateManager.getPlayerState().gold;

      await purchaseItemUseCase.execute({
        shopItemId: 'shop_card_1',
      });

      const newGold = stateManager.getPlayerState().gold;
      expect(newGold).toBe(initialGold - 100);
    });

    it('カード購入でデッキに追加', async () => {
      const initialDeckSize = stateManager.getDeckState().cards.length;

      await purchaseItemUseCase.execute({
        shopItemId: 'shop_card_1',
      });

      const newDeckSize = stateManager.getDeckState().cards.length;
      expect(newDeckSize).toBe(initialDeckSize + 1);
    });

    it('素材購入でインベントリに追加', async () => {
      const result = await purchaseItemUseCase.execute({
        shopItemId: 'shop_material_1',
      });

      expect(result.success).toBe(true);

      // インベントリに素材が追加されていることを確認
      const inventory = stateManager.getInventoryState();
      expect(inventory.materials.length).toBeGreaterThan(0);
    });

    it('アーティファクト購入で所持アーティファクトに追加', async () => {
      const result = await purchaseItemUseCase.execute({
        shopItemId: 'shop_artifact_1',
      });

      expect(result.success).toBe(true);

      // プレイヤー状態にアーティファクトが追加されていることを確認
      const playerState = stateManager.getPlayerState();
      expect(playerState.artifacts).toContain('artifact_1');
    });
  });

  describe('購入失敗', () => {
    it('ゴールド不足で購入できない', async () => {
      // ゴールドを不足させる
      const playerState = stateManager.getPlayerState();
      stateManager.updatePlayerState({
        ...playerState,
        gold: 10,
      });

      const result = await purchaseItemUseCase.execute({
        shopItemId: 'shop_card_1',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('INSUFFICIENT_GOLD');
    });

    it('ランク不足で購入できない', async () => {
      // Gランクプレイヤーが、Fランク商品を購入しようとする
      const result = await purchaseItemUseCase.execute({
        shopItemId: 'shop_card_f_rank',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('INSUFFICIENT_RANK');
    });

    it('在庫切れで購入できない', async () => {
      // 在庫1の商品を2回購入
      await purchaseItemUseCase.execute({
        shopItemId: 'shop_artifact_1',
      });

      const result = await purchaseItemUseCase.execute({
        shopItemId: 'shop_artifact_1',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('OUT_OF_STOCK');
    });

    it('存在しない商品は購入できない', async () => {
      const result = await purchaseItemUseCase.execute({
        shopItemId: 'nonexistent',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('ITEM_NOT_FOUND');
    });
  });

  describe('行動ポイント', () => {
    it('行動ポイントを1消費する', async () => {
      const initialAP = stateManager.getPlayerState().actionPoints;

      await purchaseItemUseCase.execute({
        shopItemId: 'shop_card_1',
      });

      const newAP = stateManager.getPlayerState().actionPoints;
      expect(newAP).toBe(initialAP - 1);
    });

    it('行動ポイント不足で購入できない', async () => {
      // 行動ポイントを0にする
      const playerState = stateManager.getPlayerState();
      stateManager.updatePlayerState({
        ...playerState,
        actionPoints: 0,
      });

      const result = await purchaseItemUseCase.execute({
        shopItemId: 'shop_card_1',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('INSUFFICIENT_ACTION_POINTS');
    });
  });

  describe('イベント発行', () => {
    it('購入成功イベントが発行される', async () => {
      const eventHandler = vi.fn();
      eventBus.subscribe(GameEventType.ITEM_PURCHASED, eventHandler);

      await purchaseItemUseCase.execute({
        shopItemId: 'shop_card_1',
      });

      expect(eventHandler).toHaveBeenCalled();
    });
  });
});
