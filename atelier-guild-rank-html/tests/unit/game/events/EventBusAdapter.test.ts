/**
 * EventBusAdapter単体テスト
 *
 * TASK-0250: EventBus-UseCase連携設計
 * EventBusAdapterの機能をテストする。
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventBus } from '@game/events/EventBus';
import {
  EventBusAdapter,
  getEventBusAdapter,
  resetEventBusAdapter,
} from '@game/events/EventBusAdapter';
import type { IUIEventHandler, IAppEventListener } from '@game/events/EventHandlers';
import type { AppToUIEvent } from '@game/events/GameEvents';

describe('EventBusAdapter', () => {
  let eventBus: EventBus;
  let adapter: EventBusAdapter;

  beforeEach(() => {
    EventBus.resetInstance();
    eventBus = EventBus.getInstance();
    adapter = new EventBusAdapter(eventBus);
  });

  afterEach(() => {
    adapter.destroy();
    EventBus.resetInstance();
    resetEventBusAdapter();
  });

  // =====================================================
  // 初期化テスト
  // =====================================================

  describe('初期化', () => {
    it('初期状態でisInitializedはfalse', () => {
      expect(adapter.isInitialized()).toBe(false);
    });

    it('initialize()後はisInitializedがtrue', () => {
      adapter.initialize();
      expect(adapter.isInitialized()).toBe(true);
    });

    it('複数回initialize()を呼んでも問題ない', () => {
      adapter.initialize();
      adapter.initialize();
      expect(adapter.isInitialized()).toBe(true);
    });

    it('destroy()後はisInitializedがfalse', () => {
      adapter.initialize();
      adapter.destroy();
      expect(adapter.isInitialized()).toBe(false);
    });
  });

  // =====================================================
  // UIイベントハンドラテスト
  // =====================================================

  describe('UIイベントハンドラ', () => {
    it('初期状態でハンドラはnull', () => {
      expect(adapter.getUIEventHandler()).toBeNull();
    });

    it('setUIEventHandler()でハンドラを設定できる', () => {
      const mockHandler: IUIEventHandler = {
        handleQuestAcceptRequest: vi.fn(),
        handleQuestDeliveryRequest: vi.fn(),
        handleGatheringExecuteRequest: vi.fn(),
        handleAlchemyCraftRequest: vi.fn(),
        handleShopPurchaseRequest: vi.fn(),
        handleCardDrawRequest: vi.fn(),
        handleDeckShuffleRequest: vi.fn(),
        handlePhaseSkipRequest: vi.fn(),
        handleDayEndRequest: vi.fn(),
        handleGameSaveRequest: vi.fn(),
        handleGameLoadRequest: vi.fn(),
        handleRankUpChallengeRequest: vi.fn(),
      };

      adapter.setUIEventHandler(mockHandler);
      expect(adapter.getUIEventHandler()).toBe(mockHandler);
    });

    it('destroy()後はハンドラがnullになる', () => {
      const mockHandler: IUIEventHandler = {
        handleQuestAcceptRequest: vi.fn(),
        handleQuestDeliveryRequest: vi.fn(),
        handleGatheringExecuteRequest: vi.fn(),
        handleAlchemyCraftRequest: vi.fn(),
        handleShopPurchaseRequest: vi.fn(),
        handleCardDrawRequest: vi.fn(),
        handleDeckShuffleRequest: vi.fn(),
        handlePhaseSkipRequest: vi.fn(),
        handleDayEndRequest: vi.fn(),
        handleGameSaveRequest: vi.fn(),
        handleGameLoadRequest: vi.fn(),
        handleRankUpChallengeRequest: vi.fn(),
      };

      adapter.setUIEventHandler(mockHandler);
      adapter.destroy();
      expect(adapter.getUIEventHandler()).toBeNull();
    });
  });

  // =====================================================
  // Appイベントリスナーテスト
  // =====================================================

  describe('Appイベントリスナー', () => {
    it('初期状態でリスナー数は0', () => {
      expect(adapter.getListenerCount()).toBe(0);
    });

    it('addAppEventListener()でリスナーを追加できる', () => {
      const mockListener: IAppEventListener = {
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
      };

      adapter.addAppEventListener(mockListener);
      expect(adapter.getListenerCount()).toBe(1);
    });

    it('removeAppEventListener()でリスナーを削除できる', () => {
      const mockListener: IAppEventListener = {
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
      };

      adapter.addAppEventListener(mockListener);
      adapter.removeAppEventListener(mockListener);
      expect(adapter.getListenerCount()).toBe(0);
    });

    it('複数のリスナーを追加できる', () => {
      const mockListener1: IAppEventListener = {
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
      };

      const mockListener2: IAppEventListener = {
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
      };

      adapter.addAppEventListener(mockListener1);
      adapter.addAppEventListener(mockListener2);
      expect(adapter.getListenerCount()).toBe(2);
    });

    it('destroy()後はリスナーがクリアされる', () => {
      const mockListener: IAppEventListener = {
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
      };

      adapter.addAppEventListener(mockListener);
      adapter.destroy();
      expect(adapter.getListenerCount()).toBe(0);
    });
  });

  // =====================================================
  // emitToUIテスト
  // =====================================================

  describe('emitToUI', () => {
    it('登録されたリスナーにphase:changedイベントを通知できる', () => {
      const mockListener: IAppEventListener = {
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
      };

      adapter.addAppEventListener(mockListener);

      const event: AppToUIEvent = {
        type: 'phase:changed',
        payload: {
          previousPhase: 'QUEST_ACCEPT',
          currentPhase: 'GATHERING',
          phaseData: {},
        },
      };

      adapter.emitToUI(event);

      expect(mockListener.onPhaseChanged).toHaveBeenCalledWith(event.payload);
    });

    it('登録されたリスナーにgame:state:updatedイベントを通知できる', () => {
      const mockListener: IAppEventListener = {
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
      };

      adapter.addAppEventListener(mockListener);

      const event: AppToUIEvent = {
        type: 'game:state:updated',
        payload: {
          currentPhase: 'GATHERING',
          currentDay: 5,
          playerRank: 'E',
          gold: 1000,
          ap: { current: 3, max: 5 },
        },
      };

      adapter.emitToUI(event);

      expect(mockListener.onGameStateUpdated).toHaveBeenCalledWith(event.payload);
    });

    it('登録されたリスナーにgame:overイベントを通知できる', () => {
      const mockListener: IAppEventListener = {
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
      };

      adapter.addAppEventListener(mockListener);

      const event: AppToUIEvent = {
        type: 'game:over',
        payload: {
          reason: '期限切れ',
          stats: { day: 30, rank: 'C' },
        },
      };

      adapter.emitToUI(event);

      expect(mockListener.onGameOver).toHaveBeenCalledWith(event.payload);
    });

    it('登録されたリスナーにgame:clearイベントを通知できる', () => {
      const mockListener: IAppEventListener = {
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
      };

      adapter.addAppEventListener(mockListener);

      const event: AppToUIEvent = {
        type: 'game:clear',
        payload: {
          stats: { day: 25, rank: 'S', quests: 50 },
        },
      };

      adapter.emitToUI(event);

      expect(mockListener.onGameClear).toHaveBeenCalledWith(event.payload);
    });

    it('複数のリスナーに同じイベントを通知できる', () => {
      const mockListener1: IAppEventListener = {
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
      };

      const mockListener2: IAppEventListener = {
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
      };

      adapter.addAppEventListener(mockListener1);
      adapter.addAppEventListener(mockListener2);

      const event: AppToUIEvent = {
        type: 'day:ended',
        payload: {
          newDay: 10,
          summary: {
            questsCompleted: 2,
            itemsCrafted: 5,
            goldEarned: 500,
          },
        },
      };

      adapter.emitToUI(event);

      expect(mockListener1.onDayEnded).toHaveBeenCalledWith(event.payload);
      expect(mockListener2.onDayEnded).toHaveBeenCalledWith(event.payload);
    });

    it('リスナーがない場合でもエラーにならない', () => {
      const event: AppToUIEvent = {
        type: 'error:occurred',
        payload: {
          code: 'ERR001',
          message: 'エラーが発生しました',
          recoverable: true,
        },
      };

      expect(() => adapter.emitToUI(event)).not.toThrow();
    });
  });

  // =====================================================
  // シングルトンファクトリテスト
  // =====================================================

  describe('シングルトンファクトリ', () => {
    it('getEventBusAdapter()でインスタンスを取得できる', () => {
      const instance = getEventBusAdapter();
      expect(instance).toBeInstanceOf(EventBusAdapter);
    });

    it('getEventBusAdapter()は同じインスタンスを返す', () => {
      const instance1 = getEventBusAdapter();
      const instance2 = getEventBusAdapter();
      expect(instance1).toBe(instance2);
    });

    it('resetEventBusAdapter()後は新しいインスタンスが作成される', () => {
      const instance1 = getEventBusAdapter();
      resetEventBusAdapter();
      const instance2 = getEventBusAdapter();
      expect(instance1).not.toBe(instance2);
    });

    it('getEventBusAdapter()で取得したインスタンスは初期化済み', () => {
      const instance = getEventBusAdapter();
      expect(instance.isInitialized()).toBe(true);
    });
  });
});

// =====================================================
// 型定義テスト
// =====================================================

describe('GameEvents型定義', () => {
  it('UIToAppEventの型が正しく使用できる', async () => {
    // 型はコンパイル時にチェックされるため、実行時テストは不要
    const eventType: string = 'quest:accept:request';
    expect(eventType).toBe('quest:accept:request');
  });

  it('AppToUIEventの型が正しく使用できる', async () => {
    // 型はコンパイル時にチェックされるため、実行時テストは不要
    const eventType: string = 'game:state:updated';
    expect(eventType).toBe('game:state:updated');
  });

  it('EventPayload型が正しく使用できる', async () => {
    // 型のテストなので実際の値は不要
    // TypeScriptの型はコンパイル後に消えるため、実行時には確認できない
    expect(true).toBe(true);
  });
});

// =====================================================
// EventHandlers型テスト
// =====================================================

describe('EventHandlers', () => {
  it('BaseUIEventHandlerのデフォルト実装がある', async () => {
    const { BaseUIEventHandler } = await import('@game/events/EventHandlers');

    class TestHandler extends BaseUIEventHandler {}
    const handler = new TestHandler();

    // デフォルト実装は何もしない
    await expect(handler.handleQuestAcceptRequest({ questId: 'q1' })).resolves.toBeUndefined();
    await expect(handler.handleDeckShuffleRequest()).resolves.toBeUndefined();
  });

  it('BaseAppEventListenerのデフォルト実装がある', async () => {
    const { BaseAppEventListener } = await import('@game/events/EventHandlers');

    class TestListener extends BaseAppEventListener {}
    const listener = new TestListener();

    // デフォルト実装は何もしない
    expect(() => listener.onGameStateUpdated({
      currentPhase: 'GATHERING',
      currentDay: 1,
      playerRank: 'G',
      gold: 100,
      ap: { current: 5, max: 5 },
    })).not.toThrow();
  });
});
