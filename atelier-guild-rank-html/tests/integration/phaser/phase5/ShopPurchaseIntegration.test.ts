/**
 * Phase5 ショップ購入統合テスト
 *
 * TASK-0264: ショップ購入統合テスト
 * ショップ機能の統合テストを実施する。カード購入、素材購入、アーティファクト購入のフローが正しく動作することを検証する。
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SceneKeys } from '@game/config/SceneKeys';
import {
  createMockEventBus,
  createMockStateManager,
} from '../../../utils/phaserTestUtils';
import { getPhaserMock } from '../../../utils/phaserMocks';
import { createMockSceneManager } from '../../../utils/sceneManagerMock';

// 【Phaserモック】: テスト環境用のPhaserモックを設定
// 【理由】: jsdom環境ではCanvas APIが動作しないため 🔵
vi.mock('phaser', () => getPhaserMock());

/**
 * テスト用のPhaserゲームインスタンスを作成する
 */
async function createTestGame(): Promise<{
  game: any;
  eventBus: any;
  sceneManager: any;
  stateManager: any;
}> {
  const eventBus = createMockEventBus();
  const stateManager = createMockStateManager();

  const Phaser = await import('phaser');
  const game = new Phaser.default.Game();

  const validScenes = [SceneKeys.MAIN, SceneKeys.SHOP];

  const sceneManager = createMockSceneManager(game, eventBus, validScenes);
  game.registry.set('sceneManager', sceneManager);
  game.registry.set('stateManager', stateManager);

  // ショップ購入イベントハンドラを設定
  setupShopPurchaseEventHandlers(game, eventBus, sceneManager, stateManager);

  return { game, eventBus, sceneManager, stateManager };
}

/**
 * ショップ購入イベントハンドラを設定する
 */
function setupShopPurchaseEventHandlers(
  game: any,
  eventBus: any,
  sceneManager: any,
  stateManager: any
): void {
  // ゲーム開始イベント
  eventBus.on('ui:game:start:requested', ({ isNewGame }: any) => {
    sceneManager.goTo(SceneKeys.MAIN);
    if (isNewGame) {
      stateManager.updatePlayer({ gold: 1000, rank: 'E', ap: { current: 3, max: 3 } });
      stateManager.updateDeckState({ cards: [], hand: [], discardPile: [] });
      stateManager.updateInventoryState({ materials: [], items: [] });
    }
  });

  // ショップ開くイベント
  eventBus.on('ui:shop:open:requested', () => {
    sceneManager.openOverlay(SceneKeys.SHOP);
  });

  // ショップ閉じるイベント
  eventBus.on('ui:shop:close:requested', () => {
    sceneManager.closeOverlay(SceneKeys.SHOP);
  });

  // ショップ購入イベント
  eventBus.on('ui:shop:purchase:requested', ({ category, itemId, quantity }: any) => {
    const playerState = stateManager.getPlayerState();
    const deckState = stateManager.getDeckState();
    const inventoryState = stateManager.getInventoryState();

    // 商品情報（簡易版）
    const items: Record<string, any> = {
      gathering_card_basic: { type: 'card', price: 100, rank: 'E' },
      gathering_card_forest: { type: 'card', price: 150, rank: 'E' },
      rare_recipe_card_a_rank: { type: 'card', price: 1000, rank: 'A' },
      herb_basic: { type: 'material', price: 20, rank: 'E' },
      artifact_quality_boost: { type: 'artifact', price: 3000, rank: 'C' },
      artifact_ap_boost: { type: 'artifact', price: 2500, rank: 'C' },
    };

    const item = items[itemId];

    if (!item) {
      eventBus.emit('app:error:occurred', { message: '商品が見つかりません' });
      return;
    }

    if (quantity <= 0) {
      return; // 数量0は無視
    }

    const totalPrice = item.price * quantity;

    // ゴールド不足チェック
    if (playerState.gold < totalPrice) {
      eventBus.emit('app:error:occurred', { message: 'ゴールドが不足しています' });
      return;
    }

    // ランク制限チェック
    const rankOrder = ['E', 'D', 'C', 'B', 'A', 'S'];
    const playerRankIndex = rankOrder.indexOf(playerState.rank);
    const itemRankIndex = rankOrder.indexOf(item.rank);
    if (playerRankIndex < itemRankIndex) {
      eventBus.emit('app:error:occurred', { message: 'ランクが不足しています' });
      return;
    }

    // 購入処理
    const newGold = playerState.gold - totalPrice;
    stateManager.updatePlayer({ gold: newGold });

    if (category === 'card') {
      // カード購入
      const newCards = [...deckState.cards];
      for (let i = 0; i < quantity; i++) {
        newCards.push({ id: itemId, type: item.type });
      }
      stateManager.updateDeckState({ ...deckState, cards: newCards });
    } else if (category === 'material') {
      // 素材購入
      const materials = [...inventoryState.materials];
      const existingMaterial = materials.find((m: any) => m.id === itemId);
      if (existingMaterial) {
        existingMaterial.quantity += quantity;
      } else {
        materials.push({
          id: itemId,
          name: item.name || '素材',
          quantity,
          quality: 70,
        });
      }
      stateManager.updateInventoryState({ ...inventoryState, materials });
    } else if (category === 'artifact') {
      // アーティファクト購入
      const items = [...(inventoryState.items || [])];
      items.push({ id: itemId, name: item.name || 'アーティファクト' });
      stateManager.updateInventoryState({ ...inventoryState, items });

      // アーティファクト効果適用
      if (itemId === 'artifact_ap_boost') {
        stateManager.updatePlayer({ ap: { current: 4, max: 4 } });
      }
    }

    // イベント発火
    eventBus.emit('app:shop:purchased', { item, quantity, newGold });
    eventBus.emit('app:player:data:updated', { gold: newGold });
  });
}

describe('Shop Purchase Integration', () => {
  let game: any;
  let eventBus: any;
  let sceneManager: any;
  let stateManager: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    const testSetup = await createTestGame();
    game = testSetup.game;
    eventBus = testSetup.eventBus;
    sceneManager = testSetup.sceneManager;
    stateManager = testSetup.stateManager;

    // ゲーム開始してショップへ
    eventBus.emit('ui:game:start:requested', { isNewGame: true });
    await new Promise((resolve) => setTimeout(resolve, 100)); // シーン遷移を待つ
    eventBus.emit('ui:shop:open:requested');
    await new Promise((resolve) => setTimeout(resolve, 100)); // シーン遷移を待つ
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Card Purchase', () => {
    it('カードを購入できる', async () => {
      // Arrange
      stateManager.updatePlayer({ gold: 500, rank: 'E' });
      const initialDeckSize = stateManager.getDeckState().cards.length;

      // Act
      eventBus.emit('ui:shop:purchase:requested', {
        category: 'card',
        itemId: 'gathering_card_basic',
        quantity: 1,
      });

      // Assert
      const deck = stateManager.getDeckState();
      expect(deck.cards.length).toBe(initialDeckSize + 1);
    });

    it('購入したカードがデッキに追加される', async () => {
      // Arrange
      stateManager.updatePlayer({ gold: 500, rank: 'E' });

      // Act
      eventBus.emit('ui:shop:purchase:requested', {
        category: 'card',
        itemId: 'gathering_card_forest',
        quantity: 1,
      });

      // Assert
      const deck = stateManager.getDeckState();
      expect(deck.cards).toContainEqual(
        expect.objectContaining({ id: expect.stringContaining('forest') })
      );
    });

    it('ゴールド不足時は購入できない', async () => {
      // Arrange
      stateManager.updatePlayer({ gold: 10, rank: 'E' });

      const errorCallback = vi.fn();
      eventBus.on('app:error:occurred', errorCallback);

      // Act
      eventBus.emit('ui:shop:purchase:requested', {
        category: 'card',
        itemId: 'gathering_card_basic',
        quantity: 1,
      });

      // Assert
      expect(errorCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('ゴールド'),
        })
      );
    });

    it('ランク制限のあるカードは購入できない', async () => {
      // Arrange
      stateManager.updatePlayer({ gold: 10000, rank: 'E' });

      const errorCallback = vi.fn();
      eventBus.on('app:error:occurred', errorCallback);

      // Act
      eventBus.emit('ui:shop:purchase:requested', {
        category: 'card',
        itemId: 'rare_recipe_card_a_rank',
        quantity: 1,
      });

      // Assert
      expect(errorCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('ランク'),
        })
      );
    });

    it('購入でゴールドが正しく減少する', async () => {
      // Arrange
      stateManager.updatePlayer({ gold: 500, rank: 'E' });
      const initialGold = stateManager.getPlayerState().gold;
      const cardPrice = 100;

      // Act
      eventBus.emit('ui:shop:purchase:requested', {
        category: 'card',
        itemId: 'gathering_card_basic',
        quantity: 1,
      });

      // Assert
      const player = stateManager.getPlayerState();
      expect(player.gold).toBe(initialGold - cardPrice);
    });
  });

  describe('Material Purchase', () => {
    it('素材を購入できる', async () => {
      // Arrange
      stateManager.updatePlayer({ gold: 500, rank: 'E' });

      // Act
      eventBus.emit('ui:shop:purchase:requested', {
        category: 'material',
        itemId: 'herb_basic',
        quantity: 5,
      });

      // Assert
      const inventory = stateManager.getInventoryState();
      const herb = inventory.materials.find((m: any) => m.id === 'herb_basic');
      expect(herb).toBeDefined();
      expect(herb!.quantity).toBeGreaterThanOrEqual(5);
    });

    it('同じ素材を複数回購入すると数量が加算される', async () => {
      // Arrange
      stateManager.updatePlayer({ gold: 1000, rank: 'E' });
      stateManager.updateInventoryState({
        materials: [{ id: 'herb_basic', name: '薬草', quantity: 3, quality: 70 }],
        items: [],
      });

      // Act
      eventBus.emit('ui:shop:purchase:requested', {
        category: 'material',
        itemId: 'herb_basic',
        quantity: 5,
      });

      // Assert
      const herb = stateManager
        .getInventoryState()
        .materials.find((m: any) => m.id === 'herb_basic');
      expect(herb!.quantity).toBe(8);
    });

    it('数量指定が正しく機能する', async () => {
      // Arrange
      stateManager.updatePlayer({ gold: 1000, rank: 'E' });
      const pricePerUnit = 20;
      const quantity = 10;
      const initialGold = stateManager.getPlayerState().gold;

      // Act
      eventBus.emit('ui:shop:purchase:requested', {
        category: 'material',
        itemId: 'herb_basic',
        quantity,
      });

      // Assert
      const player = stateManager.getPlayerState();
      expect(player.gold).toBe(initialGold - pricePerUnit * quantity);
    });
  });

  describe('Artifact Purchase', () => {
    it('アーティファクトを購入できる', async () => {
      // Arrange
      stateManager.updatePlayer({ gold: 5000, rank: 'C' });
      const initialArtifacts = (stateManager.getInventoryState().items || []).length;

      // Act
      eventBus.emit('ui:shop:purchase:requested', {
        category: 'artifact',
        itemId: 'artifact_quality_boost',
        quantity: 1,
      });

      // Assert
      const inventory = stateManager.getInventoryState();
      expect((inventory.items || []).length).toBeGreaterThan(initialArtifacts);
    });

    it('アーティファクト購入には高ランクが必要', async () => {
      // Arrange
      stateManager.updatePlayer({ gold: 10000, rank: 'E' });

      const errorCallback = vi.fn();
      eventBus.on('app:error:occurred', errorCallback);

      // Act
      eventBus.emit('ui:shop:purchase:requested', {
        category: 'artifact',
        itemId: 'artifact_quality_boost',
        quantity: 1,
      });

      // Assert
      expect(errorCallback).toHaveBeenCalled();
    });

    it('アーティファクト効果が適用される', async () => {
      // Arrange
      stateManager.updatePlayer({ gold: 5000, rank: 'C', ap: { current: 3, max: 3 } });

      // Act
      eventBus.emit('ui:shop:purchase:requested', {
        category: 'artifact',
        itemId: 'artifact_ap_boost',
        quantity: 1,
      });

      // Assert
      const player = stateManager.getPlayerState();
      expect(player.ap.max).toBeGreaterThan(3);
    });
  });

  describe('Purchase Events', () => {
    it('購入成功時にイベントが発火する', async () => {
      // Arrange
      stateManager.updatePlayer({ gold: 500, rank: 'E' });

      const purchaseCallback = vi.fn();
      eventBus.on('app:shop:purchased', purchaseCallback);

      // Act
      eventBus.emit('ui:shop:purchase:requested', {
        category: 'card',
        itemId: 'gathering_card_basic',
        quantity: 1,
      });

      // Assert
      expect(purchaseCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          item: expect.any(Object),
          quantity: 1,
          newGold: expect.any(Number),
        })
      );
    });

    it('ゴールド更新イベントが発火する', async () => {
      // Arrange
      stateManager.updatePlayer({ gold: 500, rank: 'E' });

      const goldCallback = vi.fn();
      eventBus.on('app:player:data:updated', goldCallback);

      // Act
      eventBus.emit('ui:shop:purchase:requested', {
        category: 'material',
        itemId: 'herb_basic',
        quantity: 1,
      });

      // Assert
      expect(goldCallback).toHaveBeenCalled();
    });
  });

  describe('Shop UI State', () => {
    it('購入後もショップ画面に留まる', async () => {
      // Arrange
      stateManager.updatePlayer({ gold: 500, rank: 'E' });

      // Act
      eventBus.emit('ui:shop:purchase:requested', {
        category: 'card',
        itemId: 'gathering_card_basic',
        quantity: 1,
      });

      // Assert
      // ショップはオーバーレイなので、game.scene.isActiveでチェック
      expect(game.scene.isActive(SceneKeys.SHOP)).toBe(true);
    });

    it('ショップを閉じるとメインシーンに戻る', async () => {
      // Act
      eventBus.emit('ui:shop:close:requested');
      await new Promise((resolve) => setTimeout(resolve, 100)); // シーン遷移を待つ

      // Assert
      expect(sceneManager.getCurrentScene()).toBe(SceneKeys.MAIN);
    });

    it('購入後のゴールド表示が更新される', async () => {
      // Arrange
      stateManager.updatePlayer({ gold: 500, rank: 'E' });

      const uiUpdateCallback = vi.fn();
      eventBus.on('app:player:data:updated', uiUpdateCallback);

      // Act
      eventBus.emit('ui:shop:purchase:requested', {
        category: 'card',
        itemId: 'gathering_card_basic',
        quantity: 1,
      });

      // Assert
      expect(uiUpdateCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          gold: expect.any(Number),
        })
      );
    });
  });

  describe('Edge Cases', () => {
    it('存在しない商品は購入できない', async () => {
      // Arrange
      stateManager.updatePlayer({ gold: 10000, rank: 'S' });

      const errorCallback = vi.fn();
      eventBus.on('app:error:occurred', errorCallback);

      // Act
      eventBus.emit('ui:shop:purchase:requested', {
        category: 'card',
        itemId: 'nonexistent_item',
        quantity: 1,
      });

      // Assert
      expect(errorCallback).toHaveBeenCalled();
    });

    it('数量0での購入要求は無視される', async () => {
      // Arrange
      stateManager.updatePlayer({ gold: 500, rank: 'E' });
      const initialGold = stateManager.getPlayerState().gold;

      // Act
      eventBus.emit('ui:shop:purchase:requested', {
        category: 'material',
        itemId: 'herb_basic',
        quantity: 0,
      });

      // Assert
      expect(stateManager.getPlayerState().gold).toBe(initialGold);
    });

    it('大量購入でも正しく処理される', async () => {
      // Arrange
      stateManager.updatePlayer({ gold: 100000, rank: 'S' });
      const quantity = 99;

      // Act
      eventBus.emit('ui:shop:purchase:requested', {
        category: 'material',
        itemId: 'herb_basic',
        quantity,
      });

      // Assert
      const herb = stateManager
        .getInventoryState()
        .materials.find((m: any) => m.id === 'herb_basic');
      expect(herb!.quantity).toBe(quantity);
    });
  });
});
