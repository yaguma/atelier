/**
 * EventBusアダプター
 *
 * TASK-0250: EventBus-UseCase連携設計
 * EventBusとUseCase/UIを橋渡しするアダプター。
 * UI層とApplication層の疎結合通信を実現する。
 * 設計文書: docs/design/atelier-guild-rank-phaser/dataflow.md
 */

import { EventBus } from './EventBus';
import type { AppToUIEvent, UIToAppEventType } from './GameEvents';
import type { IUIEventHandler, IAppEventListener } from './EventHandlers';

/**
 * EventBusアダプター
 *
 * UI層とApplication層の橋渡しを行う。
 * - UIイベントをApplication層のハンドラに転送
 * - ApplicationイベントをUI層のリスナーに通知
 *
 * @example
 * ```typescript
 * const adapter = new EventBusAdapter(eventBus);
 *
 * // Application層からハンドラを設定
 * adapter.setUIEventHandler(useCaseHandler);
 *
 * // UI層からリスナーを登録
 * adapter.addAppEventListener(sceneListener);
 *
 * // Application層からUIへイベント発火
 * adapter.emitToUI({ type: 'phase:changed', payload: { ... } });
 * ```
 */
export class EventBusAdapter {
  /** EventBusインスタンス */
  private eventBus: EventBus;

  /** UIイベントハンドラ（Application層が設定） */
  private uiEventHandler: IUIEventHandler | null = null;

  /** Appイベントリスナー（UI層が登録） */
  private appEventListeners: Set<IAppEventListener> = new Set();

  /** 初期化済みフラグ */
  private initialized = false;

  /**
   * コンストラクタ
   * @param eventBus EventBusインスタンス
   */
  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  /**
   * UIイベントリスナーを設定する
   * Application層の初期化時に呼び出す
   */
  initialize(): void {
    if (this.initialized) {
      return;
    }

    this.setupUIEventListeners();
    this.initialized = true;
  }

  /**
   * UIイベントハンドラを設定する
   * Application層のUseCaseコントローラが設定する
   * @param handler UIイベントハンドラ
   */
  setUIEventHandler(handler: IUIEventHandler): void {
    this.uiEventHandler = handler;
  }

  /**
   * UIイベントハンドラを取得する
   * @returns 設定されているハンドラ、未設定の場合はnull
   */
  getUIEventHandler(): IUIEventHandler | null {
    return this.uiEventHandler;
  }

  /**
   * Appイベントリスナーを追加する
   * UI層のシーンが登録する
   * @param listener Appイベントリスナー
   */
  addAppEventListener(listener: IAppEventListener): void {
    this.appEventListeners.add(listener);
  }

  /**
   * Appイベントリスナーを削除する
   * UI層のシーン終了時に呼び出す
   * @param listener Appイベントリスナー
   */
  removeAppEventListener(listener: IAppEventListener): void {
    this.appEventListeners.delete(listener);
  }

  /**
   * 登録されているリスナー数を取得する
   * @returns リスナー数
   */
  getListenerCount(): number {
    return this.appEventListeners.size;
  }

  /**
   * UI → Application イベントのリスナー設定
   */
  private setupUIEventListeners(): void {
    // 依頼受注リクエスト
    this.eventBus.on('ui:quest:accepted', async (payload) => {
      if (this.uiEventHandler) {
        await this.uiEventHandler.handleQuestAcceptRequest({
          questId: payload.questId,
        });
      }
    });

    // ショップ購入リクエスト
    this.eventBus.on('shop:purchase:requested', async (payload) => {
      if (this.uiEventHandler) {
        await this.uiEventHandler.handleShopPurchaseRequest({
          category: payload.category === 'cards' ? 'card' : payload.category === 'materials' ? 'material' : 'artifact',
          itemId: payload.item.id,
          quantity: payload.quantity,
        });
      }
    });

    // 採取カード選択
    this.eventBus.on('ui:gatheringCard:selected', async (payload) => {
      if (this.uiEventHandler) {
        await this.uiEventHandler.handleGatheringExecuteRequest({
          cardId: payload.cardId,
          selectedMaterialIds: [],
        });
      }
    });

    // レシピカード選択（調合）
    this.eventBus.on('ui:recipeCard:selected', async (payload) => {
      if (this.uiEventHandler) {
        await this.uiEventHandler.handleAlchemyCraftRequest({
          recipeCardId: payload.cardId,
          materialIds: [],
        });
      }
    });

    // 日終了確認
    this.eventBus.onVoid('ui:dayEnd:confirmed', async () => {
      if (this.uiEventHandler) {
        await this.uiEventHandler.handleDayEndRequest();
      }
    });

    // 採取スキップ
    this.eventBus.onVoid('ui:gathering:skipped', async () => {
      if (this.uiEventHandler) {
        await this.uiEventHandler.handlePhaseSkipRequest({ phase: 'GATHERING' });
      }
    });

    // 調合スキップ
    this.eventBus.onVoid('ui:alchemy:skipped', async () => {
      if (this.uiEventHandler) {
        await this.uiEventHandler.handlePhaseSkipRequest({ phase: 'ALCHEMY' });
      }
    });

    // セーブリクエスト
    this.eventBus.onVoid('ui:save:requested', async () => {
      if (this.uiEventHandler) {
        await this.uiEventHandler.handleGameSaveRequest({ slotId: 0 });
      }
    });

    // ロードリクエスト
    this.eventBus.onVoid('ui:load:requested', async () => {
      if (this.uiEventHandler) {
        await this.uiEventHandler.handleGameLoadRequest({ slotId: 0 });
      }
    });
  }

  /**
   * Application → UI イベント発火
   * Application層がUI層に通知する際に使用
   * @param event 発火するイベント
   */
  emitToUI(event: AppToUIEvent): void {
    // 登録されたリスナーに通知
    this.appEventListeners.forEach((listener) => {
      this.dispatchToListener(listener, event);
    });
  }

  /**
   * リスナーにイベントをディスパッチする
   */
  private dispatchToListener(
    listener: IAppEventListener,
    event: AppToUIEvent
  ): void {
    try {
      switch (event.type) {
        case 'game:state:updated':
          listener.onGameStateUpdated(event.payload);
          break;
        case 'quest:accepted':
          listener.onQuestAccepted(event.payload);
          break;
        case 'quest:delivered':
          listener.onQuestDelivered(event.payload);
          break;
        case 'gathering:complete':
          listener.onGatheringComplete(event.payload);
          break;
        case 'alchemy:crafted':
          listener.onAlchemyCrafted(event.payload);
          break;
        case 'shop:purchased':
          listener.onShopPurchased(event.payload);
          break;
        case 'hand:updated':
          listener.onHandUpdated(event.payload);
          break;
        case 'deck:updated':
          listener.onDeckUpdated(event.payload);
          break;
        case 'inventory:updated':
          listener.onInventoryUpdated(event.payload);
          break;
        case 'phase:changed':
          listener.onPhaseChanged(event.payload);
          break;
        case 'day:ended':
          listener.onDayEnded(event.payload);
          break;
        case 'rankup:success':
          listener.onRankUpSuccess(event.payload);
          break;
        case 'rankup:failed':
          listener.onRankUpFailed(event.payload);
          break;
        case 'game:over':
          listener.onGameOver(event.payload);
          break;
        case 'game:clear':
          listener.onGameClear(event.payload);
          break;
        case 'error:occurred':
          listener.onErrorOccurred(event.payload);
          break;
      }
    } catch (error) {
      console.error(`[EventBusAdapter] Error dispatching event ${event.type}:`, error);
    }
  }

  /**
   * クリーンアップ
   * アプリケーション終了時に呼び出す
   */
  destroy(): void {
    this.uiEventHandler = null;
    this.appEventListeners.clear();
    this.initialized = false;
  }

  /**
   * 初期化済みかどうかを返す
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

/**
 * シングルトンEventBusAdapterファクトリ
 */
let adapterInstance: EventBusAdapter | null = null;

/**
 * EventBusAdapterのシングルトンインスタンスを取得する
 * @returns EventBusAdapterインスタンス
 */
export function getEventBusAdapter(): EventBusAdapter {
  if (!adapterInstance) {
    adapterInstance = new EventBusAdapter(EventBus.getInstance());
    adapterInstance.initialize();
  }
  return adapterInstance;
}

/**
 * EventBusAdapterのシングルトンインスタンスをリセットする
 * テスト用途で使用する
 */
export function resetEventBusAdapter(): void {
  if (adapterInstance) {
    adapterInstance.destroy();
    adapterInstance = null;
  }
}
