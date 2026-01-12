/**
 * イベントハンドラインターフェース
 *
 * TASK-0250: EventBus-UseCase連携設計
 * UI層とApplication層のイベントハンドリングインターフェース定義。
 * 設計文書: docs/design/atelier-guild-rank-phaser/dataflow.md
 */

import type {
  QuestAcceptRequestEvent,
  QuestDeliveryRequestEvent,
  GatheringExecuteRequestEvent,
  AlchemyCraftRequestEvent,
  ShopPurchaseRequestEvent,
  CardDrawRequestEvent,
  PhaseSkipRequestEvent,
  GameSaveRequestEvent,
  GameLoadRequestEvent,
  RankUpChallengeRequestEvent,
  GameStateUpdatedEvent,
  QuestAcceptedEvent,
  QuestDeliveredEvent,
  GatheringCompleteEvent,
  AlchemyCraftedEvent,
  ShopPurchasedEvent,
  HandUpdatedEvent,
  DeckUpdatedEvent,
  InventoryUpdatedEvent,
  PhaseChangedEvent,
  DayEndedEvent,
  RankUpSuccessEvent,
  RankUpFailedEvent,
  GameOverEvent,
  GameClearEvent,
  ErrorOccurredEvent,
} from './GameEvents';

// =====================================================
// UIイベントハンドラインターフェース
// =====================================================

/**
 * UIからのイベントを処理するハンドラインターフェース
 * Application層が実装する
 */
export interface IUIEventHandler {
  /**
   * 依頼受注リクエストを処理
   */
  handleQuestAcceptRequest(
    payload: QuestAcceptRequestEvent['payload']
  ): Promise<void>;

  /**
   * 依頼納品リクエストを処理
   */
  handleQuestDeliveryRequest(
    payload: QuestDeliveryRequestEvent['payload']
  ): Promise<void>;

  /**
   * 採取実行リクエストを処理
   */
  handleGatheringExecuteRequest(
    payload: GatheringExecuteRequestEvent['payload']
  ): Promise<void>;

  /**
   * 調合リクエストを処理
   */
  handleAlchemyCraftRequest(
    payload: AlchemyCraftRequestEvent['payload']
  ): Promise<void>;

  /**
   * ショップ購入リクエストを処理
   */
  handleShopPurchaseRequest(
    payload: ShopPurchaseRequestEvent['payload']
  ): Promise<void>;

  /**
   * カードドローリクエストを処理
   */
  handleCardDrawRequest(
    payload: CardDrawRequestEvent['payload']
  ): Promise<void>;

  /**
   * デッキシャッフルリクエストを処理
   */
  handleDeckShuffleRequest(): Promise<void>;

  /**
   * フェーズスキップリクエストを処理
   */
  handlePhaseSkipRequest(
    payload: PhaseSkipRequestEvent['payload']
  ): Promise<void>;

  /**
   * 日終了リクエストを処理
   */
  handleDayEndRequest(): Promise<void>;

  /**
   * ゲームセーブリクエストを処理
   */
  handleGameSaveRequest(
    payload: GameSaveRequestEvent['payload']
  ): Promise<void>;

  /**
   * ゲームロードリクエストを処理
   */
  handleGameLoadRequest(
    payload: GameLoadRequestEvent['payload']
  ): Promise<void>;

  /**
   * 昇格試験リクエストを処理
   */
  handleRankUpChallengeRequest(
    payload: RankUpChallengeRequestEvent['payload']
  ): Promise<void>;
}

// =====================================================
// Appイベントリスナーインターフェース
// =====================================================

/**
 * Applicationからのイベントを受け取るリスナーインターフェース
 * UI層が実装する
 */
export interface IAppEventListener {
  /**
   * ゲーム状態更新時
   */
  onGameStateUpdated(payload: GameStateUpdatedEvent['payload']): void;

  /**
   * 依頼受注完了時
   */
  onQuestAccepted(payload: QuestAcceptedEvent['payload']): void;

  /**
   * 依頼納品完了時
   */
  onQuestDelivered(payload: QuestDeliveredEvent['payload']): void;

  /**
   * 採取完了時
   */
  onGatheringComplete(payload: GatheringCompleteEvent['payload']): void;

  /**
   * 調合完了時
   */
  onAlchemyCrafted(payload: AlchemyCraftedEvent['payload']): void;

  /**
   * ショップ購入完了時
   */
  onShopPurchased(payload: ShopPurchasedEvent['payload']): void;

  /**
   * 手札更新時
   */
  onHandUpdated(payload: HandUpdatedEvent['payload']): void;

  /**
   * デッキ更新時
   */
  onDeckUpdated(payload: DeckUpdatedEvent['payload']): void;

  /**
   * インベントリ更新時
   */
  onInventoryUpdated(payload: InventoryUpdatedEvent['payload']): void;

  /**
   * フェーズ変更時
   */
  onPhaseChanged(payload: PhaseChangedEvent['payload']): void;

  /**
   * 日終了時
   */
  onDayEnded(payload: DayEndedEvent['payload']): void;

  /**
   * 昇格成功時
   */
  onRankUpSuccess(payload: RankUpSuccessEvent['payload']): void;

  /**
   * 昇格失敗時
   */
  onRankUpFailed(payload: RankUpFailedEvent['payload']): void;

  /**
   * ゲームオーバー時
   */
  onGameOver(payload: GameOverEvent['payload']): void;

  /**
   * ゲームクリア時
   */
  onGameClear(payload: GameClearEvent['payload']): void;

  /**
   * エラー発生時
   */
  onErrorOccurred(payload: ErrorOccurredEvent['payload']): void;
}

// =====================================================
// 部分実装ヘルパー
// =====================================================

/**
 * IUIEventHandlerの部分型
 * 必要なハンドラのみ実装する場合に使用
 */
export type PartialUIEventHandler = Partial<IUIEventHandler>;

/**
 * IAppEventListenerの部分型
 * 必要なリスナーのみ実装する場合に使用
 */
export type PartialAppEventListener = Partial<IAppEventListener>;

/**
 * ベースUIイベントハンドラ抽象クラス
 * 継承して必要なメソッドのみオーバーライドする
 */
export abstract class BaseUIEventHandler implements IUIEventHandler {
  async handleQuestAcceptRequest(
    _payload: QuestAcceptRequestEvent['payload']
  ): Promise<void> {
    // デフォルト実装（何もしない）
  }

  async handleQuestDeliveryRequest(
    _payload: QuestDeliveryRequestEvent['payload']
  ): Promise<void> {
    // デフォルト実装
  }

  async handleGatheringExecuteRequest(
    _payload: GatheringExecuteRequestEvent['payload']
  ): Promise<void> {
    // デフォルト実装
  }

  async handleAlchemyCraftRequest(
    _payload: AlchemyCraftRequestEvent['payload']
  ): Promise<void> {
    // デフォルト実装
  }

  async handleShopPurchaseRequest(
    _payload: ShopPurchaseRequestEvent['payload']
  ): Promise<void> {
    // デフォルト実装
  }

  async handleCardDrawRequest(
    _payload: CardDrawRequestEvent['payload']
  ): Promise<void> {
    // デフォルト実装
  }

  async handleDeckShuffleRequest(): Promise<void> {
    // デフォルト実装
  }

  async handlePhaseSkipRequest(
    _payload: PhaseSkipRequestEvent['payload']
  ): Promise<void> {
    // デフォルト実装
  }

  async handleDayEndRequest(): Promise<void> {
    // デフォルト実装
  }

  async handleGameSaveRequest(
    _payload: GameSaveRequestEvent['payload']
  ): Promise<void> {
    // デフォルト実装
  }

  async handleGameLoadRequest(
    _payload: GameLoadRequestEvent['payload']
  ): Promise<void> {
    // デフォルト実装
  }

  async handleRankUpChallengeRequest(
    _payload: RankUpChallengeRequestEvent['payload']
  ): Promise<void> {
    // デフォルト実装
  }
}

/**
 * ベースAppイベントリスナー抽象クラス
 * 継承して必要なメソッドのみオーバーライドする
 */
export abstract class BaseAppEventListener implements IAppEventListener {
  onGameStateUpdated(_payload: GameStateUpdatedEvent['payload']): void {
    // デフォルト実装
  }

  onQuestAccepted(_payload: QuestAcceptedEvent['payload']): void {
    // デフォルト実装
  }

  onQuestDelivered(_payload: QuestDeliveredEvent['payload']): void {
    // デフォルト実装
  }

  onGatheringComplete(_payload: GatheringCompleteEvent['payload']): void {
    // デフォルト実装
  }

  onAlchemyCrafted(_payload: AlchemyCraftedEvent['payload']): void {
    // デフォルト実装
  }

  onShopPurchased(_payload: ShopPurchasedEvent['payload']): void {
    // デフォルト実装
  }

  onHandUpdated(_payload: HandUpdatedEvent['payload']): void {
    // デフォルト実装
  }

  onDeckUpdated(_payload: DeckUpdatedEvent['payload']): void {
    // デフォルト実装
  }

  onInventoryUpdated(_payload: InventoryUpdatedEvent['payload']): void {
    // デフォルト実装
  }

  onPhaseChanged(_payload: PhaseChangedEvent['payload']): void {
    // デフォルト実装
  }

  onDayEnded(_payload: DayEndedEvent['payload']): void {
    // デフォルト実装
  }

  onRankUpSuccess(_payload: RankUpSuccessEvent['payload']): void {
    // デフォルト実装
  }

  onRankUpFailed(_payload: RankUpFailedEvent['payload']): void {
    // デフォルト実装
  }

  onGameOver(_payload: GameOverEvent['payload']): void {
    // デフォルト実装
  }

  onGameClear(_payload: GameClearEvent['payload']): void {
    // デフォルト実装
  }

  onErrorOccurred(_payload: ErrorOccurredEvent['payload']): void {
    // デフォルト実装
  }
}
