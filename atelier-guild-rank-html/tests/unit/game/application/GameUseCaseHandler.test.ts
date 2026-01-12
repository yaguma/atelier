/**
 * GameUseCaseHandler単体テスト
 *
 * TASK-0251: EventBus-UseCase連携実装
 * GameUseCaseHandlerの機能をテストする。
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventBus } from '@game/events/EventBus';
import {
  EventBusAdapter,
  resetEventBusAdapter,
} from '@game/events/EventBusAdapter';
import {
  GameUseCaseHandler,
  createGameUseCaseHandler,
  UseCaseDependencies,
} from '@game/application/GameUseCaseHandler';
import type { IAppEventListener } from '@game/events/EventHandlers';
import { GamePhase, GuildRank } from '@domain/common/types';

// モックStateManager
const createMockStateManager = () => ({
  getGameState: vi.fn(() => ({
    currentDay: 1,
    currentPhase: GamePhase.QUEST_ACCEPT,
    gold: 100,
    ap: 5,
    maxAp: 5,
  })),
  getPlayerState: vi.fn(() => ({
    rank: GuildRank.G,
    promotionGauge: 0,
    promotionGaugeMax: 100,
    rankDaysRemaining: 30,
  })),
  getQuestState: vi.fn(() => ({
    availableQuests: [],
    activeQuests: [],
    completedQuests: [],
  })),
  getDeckState: vi.fn(() => ({
    cards: [],
    hand: [],
    discardPile: [],
  })),
  getInventoryState: vi.fn(() => ({
    items: [],
    materials: [],
  })),
  updateQuestState: vi.fn(),
  updateDeckState: vi.fn(),
  updateInventoryState: vi.fn(),
});

// モックUseCases
const createMockUseCases = (): Partial<UseCaseDependencies> => ({
  acceptQuestUseCase: {
    execute: vi.fn().mockResolvedValue({ success: true }),
  } as any,
  deliverItemUseCase: {
    execute: vi.fn().mockResolvedValue({
      success: true,
      quest: { id: 'q1' },
      rewards: { gold: 100, exp: 10, items: [] },
      rewardCards: [],
    }),
  } as any,
  draftGatheringUseCase: {
    selectCard: vi.fn().mockResolvedValue({
      success: true,
      obtainedMaterials: [{ id: 'm1', name: 'Test Material' }],
      apUsed: 1,
    }),
  } as any,
  craftItemUseCase: {
    execute: vi.fn().mockResolvedValue({
      success: true,
      item: { id: 'i1', name: 'Test Item' },
      quality: 80,
      traits: ['trait1'],
    }),
  } as any,
  purchaseItemUseCase: {
    execute: vi.fn().mockResolvedValue({
      success: true,
      item: { id: 'p1', name: 'Purchased Item' },
    }),
  } as any,
  phaseTransitionUseCase: {
    execute: vi.fn().mockResolvedValue({ success: true }),
  } as any,
  advanceDayUseCase: {
    execute: vi.fn().mockResolvedValue({
      success: true,
      newDay: 2,
      summary: { questsCompleted: 1, itemsCrafted: 2, goldEarned: 100 },
      isGameOver: false,
      isGameClear: false,
    }),
  } as any,
  autoSaveUseCase: {
    execute: vi.fn().mockResolvedValue(undefined),
  } as any,
  continueGameUseCase: {
    execute: vi.fn().mockResolvedValue({ success: true }),
  } as any,
  startPromotionTestUseCase: {
    execute: vi.fn().mockResolvedValue({
      success: true,
      newRank: GuildRank.F,
      rewards: [],
    }),
  } as any,
});

// モックAppEventListener
const createMockListener = (): IAppEventListener => ({
  onGameStateUpdated: vi.fn(),
  onQuestAccepted: vi.fn(),
  onQuestDelivered: vi.fn(),
  onGatheringComplete: vi.fn(),
  onAlchemyCrafted: vi.fn(),
  onShopPurchased: vi.fn(),
  onHandUpdated: vi.fn(),
  onDeckUpdated: vi.fn(),
  onInventoryUpdated: vi.fn(),
  onPhaseChanged: vi.fn(),
  onDayEnded: vi.fn(),
  onRankUpSuccess: vi.fn(),
  onRankUpFailed: vi.fn(),
  onGameOver: vi.fn(),
  onGameClear: vi.fn(),
  onErrorOccurred: vi.fn(),
});

describe('GameUseCaseHandler', () => {
  let eventBus: EventBus;
  let adapter: EventBusAdapter;
  let handler: GameUseCaseHandler;
  let mockStateManager: ReturnType<typeof createMockStateManager>;
  let mockUseCases: Partial<UseCaseDependencies>;
  let mockListener: IAppEventListener;

  beforeEach(() => {
    EventBus.resetInstance();
    eventBus = EventBus.getInstance();
    adapter = new EventBusAdapter(eventBus);
    adapter.initialize();

    mockStateManager = createMockStateManager();
    mockUseCases = createMockUseCases();
    mockListener = createMockListener();

    handler = new GameUseCaseHandler({
      eventBusAdapter: adapter,
      stateManager: mockStateManager as any,
      useCases: mockUseCases,
    });

    adapter.addAppEventListener(mockListener);
  });

  afterEach(() => {
    adapter.destroy();
    EventBus.resetInstance();
    resetEventBusAdapter();
  });

  // =====================================================
  // 依頼受注テスト
  // =====================================================

  describe('handleQuestAcceptRequest', () => {
    it('依頼受注に成功するとquest:acceptedイベントが発火される', async () => {
      await handler.handleQuestAcceptRequest({ questId: 'q1' });

      expect(mockUseCases.acceptQuestUseCase!.execute).toHaveBeenCalledWith('q1');
      expect(mockListener.onQuestAccepted).toHaveBeenCalled();
      expect(mockListener.onGameStateUpdated).toHaveBeenCalled();
    });

    it('依頼受注に失敗するとerror:occurredイベントが発火される', async () => {
      (mockUseCases.acceptQuestUseCase!.execute as any).mockResolvedValue({
        success: false,
        error: 'QUEST_NOT_FOUND',
      });

      await handler.handleQuestAcceptRequest({ questId: 'invalid' });

      expect(mockListener.onErrorOccurred).toHaveBeenCalled();
    });
  });

  // =====================================================
  // 依頼納品テスト
  // =====================================================

  describe('handleQuestDeliveryRequest', () => {
    it('納品に成功するとquest:deliveredイベントが発火される', async () => {
      await handler.handleQuestDeliveryRequest({
        questId: 'q1',
        itemIds: ['i1', 'i2'],
      });

      expect(mockUseCases.deliverItemUseCase!.execute).toHaveBeenCalledWith(
        'q1',
        ['i1', 'i2']
      );
      expect(mockListener.onQuestDelivered).toHaveBeenCalled();
      expect(mockListener.onInventoryUpdated).toHaveBeenCalled();
      expect(mockListener.onGameStateUpdated).toHaveBeenCalled();
    });
  });

  // =====================================================
  // 採取テスト
  // =====================================================

  describe('handleGatheringExecuteRequest', () => {
    it('採取に成功するとgathering:completeイベントが発火される', async () => {
      await handler.handleGatheringExecuteRequest({
        cardId: 'c1',
        selectedMaterialIds: [],
      });

      expect(mockUseCases.draftGatheringUseCase!.selectCard).toHaveBeenCalledWith('c1');
      expect(mockListener.onGatheringComplete).toHaveBeenCalled();
      expect(mockListener.onInventoryUpdated).toHaveBeenCalled();
      expect(mockListener.onHandUpdated).toHaveBeenCalled();
      expect(mockListener.onDeckUpdated).toHaveBeenCalled();
    });
  });

  // =====================================================
  // 調合テスト
  // =====================================================

  describe('handleAlchemyCraftRequest', () => {
    it('調合に成功するとalchemy:craftedイベントが発火される', async () => {
      await handler.handleAlchemyCraftRequest({
        recipeCardId: 'r1',
        materialIds: ['m1', 'm2'],
      });

      expect(mockUseCases.craftItemUseCase!.execute).toHaveBeenCalledWith(
        'r1',
        ['m1', 'm2']
      );
      expect(mockListener.onAlchemyCrafted).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          quality: 80,
        })
      );
    });

    it('調合に失敗してもalchemy:craftedイベントが発火される（success=false）', async () => {
      (mockUseCases.craftItemUseCase!.execute as any).mockResolvedValue({
        success: false,
        error: 'INSUFFICIENT_MATERIALS',
      });

      await handler.handleAlchemyCraftRequest({
        recipeCardId: 'r1',
        materialIds: [],
      });

      expect(mockListener.onAlchemyCrafted).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
        })
      );
    });
  });

  // =====================================================
  // ショップテスト
  // =====================================================

  describe('handleShopPurchaseRequest', () => {
    it('購入に成功するとshop:purchasedイベントが発火される', async () => {
      await handler.handleShopPurchaseRequest({
        category: 'material',
        itemId: 'item1',
        quantity: 2,
      });

      expect(mockUseCases.purchaseItemUseCase!.execute).toHaveBeenCalledWith(
        'material',
        'item1',
        2
      );
      expect(mockListener.onShopPurchased).toHaveBeenCalled();
      expect(mockListener.onInventoryUpdated).toHaveBeenCalled();
    });

    it('カード購入の場合は手札・デッキが更新される', async () => {
      await handler.handleShopPurchaseRequest({
        category: 'card',
        itemId: 'card1',
      });

      expect(mockListener.onHandUpdated).toHaveBeenCalled();
      expect(mockListener.onDeckUpdated).toHaveBeenCalled();
    });
  });

  // =====================================================
  // カードドロー・シャッフルテスト
  // =====================================================

  describe('handleCardDrawRequest', () => {
    it('カードドローでhand:updated/deck:updatedイベントが発火される', async () => {
      (mockStateManager.getDeckState as ReturnType<typeof vi.fn>).mockReturnValue({
        cards: [{ id: 'c1' }, { id: 'c2' }],
        hand: [],
        discardPile: [],
      });

      await handler.handleCardDrawRequest({ count: 2 });

      expect(mockStateManager.updateDeckState).toHaveBeenCalled();
      expect(mockListener.onHandUpdated).toHaveBeenCalled();
      expect(mockListener.onDeckUpdated).toHaveBeenCalled();
    });
  });

  describe('handleDeckShuffleRequest', () => {
    it('シャッフルでdeck:updatedイベントが発火される', async () => {
      (mockStateManager.getDeckState as ReturnType<typeof vi.fn>).mockReturnValue({
        cards: [],
        hand: [],
        discardPile: [{ id: 'c1' }, { id: 'c2' }],
      });

      await handler.handleDeckShuffleRequest();

      expect(mockStateManager.updateDeckState).toHaveBeenCalled();
      expect(mockListener.onDeckUpdated).toHaveBeenCalled();
    });
  });

  // =====================================================
  // フェーズ・日送りテスト
  // =====================================================

  describe('handlePhaseSkipRequest', () => {
    it('フェーズスキップでphase:changedイベントが発火される', async () => {
      await handler.handlePhaseSkipRequest({ phase: 'GATHERING' });

      expect(mockUseCases.phaseTransitionUseCase!.execute).toHaveBeenCalled();
      expect(mockListener.onPhaseChanged).toHaveBeenCalled();
    });
  });

  describe('handleDayEndRequest', () => {
    it('日終了でday:endedイベントが発火される', async () => {
      await handler.handleDayEndRequest();

      expect(mockUseCases.advanceDayUseCase!.execute).toHaveBeenCalled();
      expect(mockListener.onDayEnded).toHaveBeenCalledWith(
        expect.objectContaining({
          newDay: 2,
        })
      );
    });

    it('ゲームオーバー時はgame:overイベントが発火される', async () => {
      (mockUseCases.advanceDayUseCase!.execute as any).mockResolvedValue({
        success: true,
        newDay: 31,
        summary: { questsCompleted: 0, itemsCrafted: 0, goldEarned: 0 },
        isGameOver: true,
        gameOverReason: 'DEADLINE_EXCEEDED',
        stats: {},
      });

      await handler.handleDayEndRequest();

      expect(mockListener.onGameOver).toHaveBeenCalledWith(
        expect.objectContaining({
          reason: 'DEADLINE_EXCEEDED',
        })
      );
    });

    it('ゲームクリア時はgame:clearイベントが発火される', async () => {
      (mockUseCases.advanceDayUseCase!.execute as any).mockResolvedValue({
        success: true,
        newDay: 25,
        summary: { questsCompleted: 50, itemsCrafted: 100, goldEarned: 10000 },
        isGameOver: false,
        isGameClear: true,
        stats: { totalQuests: 50 },
      });

      await handler.handleDayEndRequest();

      expect(mockListener.onGameClear).toHaveBeenCalled();
    });
  });

  // =====================================================
  // セーブ・ロードテスト
  // =====================================================

  describe('handleGameSaveRequest', () => {
    it('セーブが実行される', async () => {
      await handler.handleGameSaveRequest({ slotId: 0 });

      expect(mockUseCases.autoSaveUseCase!.execute).toHaveBeenCalled();
      expect(mockListener.onGameStateUpdated).toHaveBeenCalled();
    });
  });

  describe('handleGameLoadRequest', () => {
    it('ロードに成功すると全状態更新が通知される', async () => {
      await handler.handleGameLoadRequest({ slotId: 0 });

      expect(mockUseCases.continueGameUseCase!.execute).toHaveBeenCalled();
      expect(mockListener.onGameStateUpdated).toHaveBeenCalled();
      expect(mockListener.onInventoryUpdated).toHaveBeenCalled();
      expect(mockListener.onHandUpdated).toHaveBeenCalled();
      expect(mockListener.onDeckUpdated).toHaveBeenCalled();
    });
  });

  // =====================================================
  // 昇格試験テスト
  // =====================================================

  describe('handleRankUpChallengeRequest', () => {
    it('昇格成功時はrankup:successイベントが発火される', async () => {
      await handler.handleRankUpChallengeRequest({ targetRank: 'F' });

      expect(mockUseCases.startPromotionTestUseCase!.execute).toHaveBeenCalledWith('F');
      expect(mockListener.onRankUpSuccess).toHaveBeenCalled();
    });

    it('昇格失敗時はrankup:failedイベントが発火される', async () => {
      (mockUseCases.startPromotionTestUseCase!.execute as any).mockResolvedValue({
        success: false,
        reason: 'PROMOTION_GAUGE_NOT_FULL',
      });

      await handler.handleRankUpChallengeRequest({ targetRank: 'F' });

      expect(mockListener.onRankUpFailed).toHaveBeenCalledWith(
        expect.objectContaining({
          reason: 'PROMOTION_GAUGE_NOT_FULL',
        })
      );
    });
  });

  // =====================================================
  // エラーハンドリングテスト
  // =====================================================

  describe('エラーハンドリング', () => {
    it('UseCaseが未設定の場合はエラーイベントが発火される', async () => {
      const handlerWithoutUseCases = new GameUseCaseHandler({
        eventBusAdapter: adapter,
        stateManager: mockStateManager as any,
        useCases: {},
      });

      await handlerWithoutUseCases.handleQuestAcceptRequest({ questId: 'q1' });

      expect(mockListener.onErrorOccurred).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('not available'),
          recoverable: true,
        })
      );
    });

    it('UseCase実行時の例外がキャッチされる', async () => {
      (mockUseCases.acceptQuestUseCase!.execute as any).mockRejectedValue(
        new Error('Unexpected error')
      );

      await handler.handleQuestAcceptRequest({ questId: 'q1' });

      expect(mockListener.onErrorOccurred).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Unexpected error',
        })
      );
    });
  });

  // =====================================================
  // ファクトリ関数テスト
  // =====================================================

  describe('createGameUseCaseHandler', () => {
    it('ファクトリ関数でインスタンスを生成できる', () => {
      const instance = createGameUseCaseHandler({
        eventBusAdapter: adapter,
        stateManager: mockStateManager as any,
        useCases: mockUseCases,
      });

      expect(instance).toBeInstanceOf(GameUseCaseHandler);
    });
  });
});
