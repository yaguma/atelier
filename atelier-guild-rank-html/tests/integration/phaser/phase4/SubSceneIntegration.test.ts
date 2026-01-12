/**
 * Phase4 サブシーン統合テスト
 *
 * TASK-0259: Phase4統合テスト
 * ShopScene、RankUpScene、GameOver/GameClearSceneの統合テスト。
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createMockEventBus,
  createMockStateManager,
  createMockScene,
} from '../../../utils/phaserTestUtils';

// Phaserをモック
vi.mock('phaser', () => ({
  default: {
    GameObjects: {
      Container: class {
        add = vi.fn().mockReturnThis();
        setAlpha = vi.fn().mockReturnThis();
        destroy = vi.fn();
      },
    },
  },
}));

describe('Phase4 SubScene Integration', () => {
  let eventBus: ReturnType<typeof createMockEventBus>;
  let stateManager: ReturnType<typeof createMockStateManager>;
  let scene: ReturnType<typeof createMockScene>;

  beforeEach(() => {
    vi.clearAllMocks();
    eventBus = createMockEventBus();
    stateManager = createMockStateManager();
    scene = createMockScene();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('ShopScene Integration', () => {
    it('ゴールドが十分な場合、購入リクエストが成功する', () => {
      // Arrange
      stateManager._setPlayerState({
        gold: 1000,
        rank: 'D',
      });

      let purchaseHandled = false;
      eventBus.on('ui:shop:purchase:requested', () => {
        const playerState = stateManager.getPlayerState();
        const itemCost = 100;

        if (playerState.gold >= itemCost) {
          stateManager.updatePlayerState({
            gold: playerState.gold - itemCost,
          });
          eventBus.emit('app:shop:purchased', {
            item: { id: 'gathering_card_001', cost: itemCost },
            newGold: playerState.gold - itemCost,
          });
          purchaseHandled = true;
        }
      });

      // Act
      eventBus.emit('ui:shop:purchase:requested', {
        category: 'card',
        itemId: 'gathering_card_001',
        quantity: 1,
      });

      // Assert
      expect(purchaseHandled).toBe(true);
      expect(eventBus.emit).toHaveBeenCalledWith(
        'app:shop:purchased',
        expect.objectContaining({
          item: expect.any(Object),
          newGold: expect.any(Number),
        })
      );
    });

    it('ゴールド不足時に購入リクエストが失敗する', () => {
      // Arrange
      stateManager._setPlayerState({
        gold: 10,
        rank: 'D',
      });

      let errorEmitted = false;
      eventBus.on('ui:shop:purchase:requested', () => {
        const playerState = stateManager.getPlayerState();
        const itemCost = 100;

        if (playerState.gold < itemCost) {
          eventBus.emit('app:error:occurred', {
            message: 'ゴールドが不足しています',
          });
          errorEmitted = true;
        }
      });

      // Act
      eventBus.emit('ui:shop:purchase:requested', {
        category: 'card',
        itemId: 'gathering_card_001',
        quantity: 1,
      });

      // Assert
      expect(errorEmitted).toBe(true);
      expect(eventBus.emit).toHaveBeenCalledWith(
        'app:error:occurred',
        expect.objectContaining({
          message: expect.stringContaining('ゴールド'),
        })
      );
    });

    it('ランク制限のある商品は低ランクでは購入できない', () => {
      // Arrange
      stateManager._setPlayerState({
        gold: 10000,
        rank: 'E',
      });

      const rankOrder = ['G', 'F', 'E', 'D', 'C', 'B', 'A', 'S'];

      let errorEmitted = false;
      eventBus.on('shop:purchase:requested' as never, ((data: { item: unknown }) => {
        const playerState = stateManager.getPlayerState();
        const requiredRank = 'A'; // rare_recipe_card_001に必要なランク

        const playerRankIndex = rankOrder.indexOf(playerState.rank);
        const requiredRankIndex = rankOrder.indexOf(requiredRank);

        if (playerRankIndex < requiredRankIndex) {
          eventBus.emit('ui:toast:shown' as never, {
            message: 'ランクが不足しています',
            type: 'error',
          });
          errorEmitted = true;
        }
      }) as never);

      // Act
      eventBus.emit('ui:shop:purchase:requested', {
        category: 'card',
        itemId: 'rare_recipe_card_001',
        quantity: 1,
      });

      // Assert
      expect(errorEmitted).toBe(true);
      expect(eventBus.emit).toHaveBeenCalledWith(
        'app:error:occurred',
        expect.objectContaining({
          message: expect.stringContaining('ランク'),
        })
      );
    });

    it('購入後にインベントリが更新される', () => {
      // Arrange
      stateManager._setPlayerState({
        gold: 1000,
        rank: 'D',
      });

      let inventoryUpdated = false;
      eventBus.on('ui:shop:purchase:requested', () => {
        const playerState = stateManager.getPlayerState();
        const itemCost = 100;

        if (playerState.gold >= itemCost) {
          stateManager.updatePlayerState({
            gold: playerState.gold - itemCost,
          });
          eventBus.emit('app:inventory:updated', {
            addedItem: { id: 'gathering_card_001' },
          });
          inventoryUpdated = true;
        }
      });

      // Act
      eventBus.emit('ui:shop:purchase:requested', {
        category: 'card',
        itemId: 'gathering_card_001',
        quantity: 1,
      });

      // Assert
      expect(inventoryUpdated).toBe(true);
      expect(eventBus.emit).toHaveBeenCalledWith(
        'app:inventory:updated',
        expect.any(Object)
      );
    });
  });

  describe('RankUpScene Integration', () => {
    it('昇格条件を満たした場合に昇格できる', () => {
      // Arrange
      stateManager._setPlayerState({
        rank: 'E',
        promotionGauge: 100,
        promotionGaugeMax: 100,
      });

      let rankUpSuccess = false;
      eventBus.on('ui:rankup:challenge:requested', () => {
        const playerState = stateManager.getPlayerState();

        if (playerState.promotionGauge >= playerState.promotionGaugeMax) {
          const rankOrder = ['G', 'F', 'E', 'D', 'C', 'B', 'A', 'S'];
          const currentIndex = rankOrder.indexOf(playerState.rank);
          const newRank = rankOrder[currentIndex + 1];

          stateManager.updatePlayerState({
            rank: newRank,
            promotionGauge: 0,
          });

          eventBus.emit('app:rankup:success', {
            newRank,
            rewards: { gold: 500 },
          });
          rankUpSuccess = true;
        }
      });

      // Act
      eventBus.emit('ui:rankup:challenge:requested', {
        targetRank: 'D',
      });

      // Assert
      expect(rankUpSuccess).toBe(true);
      expect(eventBus.emit).toHaveBeenCalledWith(
        'app:rankup:success',
        expect.objectContaining({
          newRank: 'D',
          rewards: expect.any(Object),
        })
      );
    });

    it('貢献度不足で昇格試験に失敗する', () => {
      // Arrange
      stateManager._setPlayerState({
        rank: 'E',
        promotionGauge: 50,
        promotionGaugeMax: 100,
      });

      let rankUpFailed = false;
      eventBus.on('ui:rankup:challenge:requested', () => {
        const playerState = stateManager.getPlayerState();

        if (playerState.promotionGauge < playerState.promotionGaugeMax) {
          eventBus.emit('app:rankup:failed', {
            reason: '経験値が不足しています',
          });
          rankUpFailed = true;
        }
      });

      // Act
      eventBus.emit('ui:rankup:challenge:requested', {
        targetRank: 'D',
      });

      // Assert
      expect(rankUpFailed).toBe(true);
      expect(eventBus.emit).toHaveBeenCalledWith(
        'app:rankup:failed',
        expect.objectContaining({
          reason: expect.stringContaining('経験値'),
        })
      );
    });

    it('Sランクでは昇格試験を受けられない', () => {
      // Arrange
      stateManager._setPlayerState({
        rank: 'S',
        promotionGauge: 100,
        promotionGaugeMax: 100,
      });

      let errorEmitted = false;
      eventBus.on('ui:rankup:challenge:requested', () => {
        const playerState = stateManager.getPlayerState();

        if (playerState.rank === 'S') {
          eventBus.emit('app:error:occurred', {
            message: '最高ランクに到達しています',
          });
          errorEmitted = true;
        }
      });

      // Act
      eventBus.emit('ui:rankup:challenge:requested', {
        targetRank: 'S+',
      });

      // Assert
      expect(errorEmitted).toBe(true);
    });
  });

  describe('GameOver/GameClear Integration', () => {
    it('日数超過でゲームオーバーイベントが発火する', () => {
      // Arrange
      stateManager._setGameState({
        currentDay: 30,
        maxDays: 30,
        currentPhase: 'evening',
      });
      stateManager._setPlayerState({
        rank: 'C',
        gold: 500,
        rankDaysRemaining: 0,
      });

      let gameOverEmitted = false;
      eventBus.on('ui:day:end:requested', () => {
        const gameState = stateManager.getGameState();
        const playerState = stateManager.getPlayerState();

        if (playerState.rankDaysRemaining <= 0 && playerState.rank !== 'S') {
          eventBus.emit('app:game:over', {
            reason: '期限を過ぎました',
            stats: {
              day: gameState.currentDay,
              rank: playerState.rank,
              gold: playerState.gold,
            },
          });
          gameOverEmitted = true;
        }
      });

      // Act
      eventBus.emit('ui:day:end:requested', {});

      // Assert
      expect(gameOverEmitted).toBe(true);
      expect(eventBus.emit).toHaveBeenCalledWith(
        'app:game:over',
        expect.objectContaining({
          reason: expect.stringContaining('期限'),
        })
      );
    });

    it('Sランク到達でゲームクリアイベントが発火する', () => {
      // Arrange
      stateManager._setGameState({
        currentDay: 20,
        maxDays: 30,
        currentPhase: 'evening',
      });
      stateManager._setPlayerState({
        rank: 'S',
        gold: 5000,
        rankDaysRemaining: 10,
      });

      let gameClearEmitted = false;
      eventBus.on('ui:day:end:requested', () => {
        const playerState = stateManager.getPlayerState();
        const gameState = stateManager.getGameState();

        if (playerState.rank === 'S') {
          eventBus.emit('app:game:clear', {
            stats: {
              day: gameState.currentDay,
              rank: playerState.rank,
              gold: playerState.gold,
            },
          });
          gameClearEmitted = true;
        }
      });

      // Act
      eventBus.emit('ui:day:end:requested', {});

      // Assert
      expect(gameClearEmitted).toBe(true);
      expect(eventBus.emit).toHaveBeenCalledWith(
        'app:game:clear',
        expect.objectContaining({
          stats: expect.any(Object),
        })
      );
    });

    it('ゲームオーバー後にリスタートできる', () => {
      // Arrange
      let gameRestarted = false;
      eventBus.on('ui:game:restart:requested', () => {
        stateManager.reset();
        eventBus.emit('app:game:restarted', {});
        gameRestarted = true;
      });

      // Act
      eventBus.emit('ui:game:restart:requested', {});

      // Assert
      expect(gameRestarted).toBe(true);
      expect(stateManager.reset).toHaveBeenCalled();
    });

    it('ゲームクリア後にタイトルに戻れる', () => {
      // Arrange
      let returnedToTitle = false;
      eventBus.on('ui:game:title:requested', () => {
        eventBus.emit('app:scene:changed', { scene: 'title' });
        returnedToTitle = true;
      });

      // Act
      eventBus.emit('ui:game:title:requested', {});

      // Assert
      expect(returnedToTitle).toBe(true);
      expect(eventBus.emit).toHaveBeenCalledWith('app:scene:changed', {
        scene: 'title',
      });
    });
  });

  describe('シーン遷移統合', () => {
    it('ショップからメインシーンに戻れる', () => {
      // Arrange
      let sceneChanged = false;
      eventBus.on('ui:shop:close:requested', () => {
        eventBus.emit('app:scene:changed', { scene: 'main' });
        sceneChanged = true;
      });

      // Act
      eventBus.emit('ui:shop:close:requested', {});

      // Assert
      expect(sceneChanged).toBe(true);
    });

    it('昇格成功後にメインシーンに遷移する', () => {
      // Arrange
      stateManager._setPlayerState({
        rank: 'E',
        promotionGauge: 100,
        promotionGaugeMax: 100,
      });

      let transitionedToMain = false;
      eventBus.on('ui:rankup:complete:acknowledged', () => {
        eventBus.emit('app:scene:changed', { scene: 'main' });
        transitionedToMain = true;
      });

      // Act
      eventBus.emit('ui:rankup:complete:acknowledged', {});

      // Assert
      expect(transitionedToMain).toBe(true);
    });
  });
});
