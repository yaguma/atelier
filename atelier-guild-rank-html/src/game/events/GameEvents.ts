/**
 * ゲームイベント型定義
 *
 * TASK-0250: EventBus-UseCase連携設計
 * UI層 ↔ Application層のイベント通信を型安全に行う。
 * 設計文書: docs/design/atelier-guild-rank-phaser/dataflow.md
 */

// =====================================================
// UI → Application イベント
// =====================================================

/**
 * 依頼受注リクエストイベント
 */
export interface QuestAcceptRequestEvent {
  type: 'quest:accept:request';
  payload: {
    questId: string;
  };
}

/**
 * 依頼納品リクエストイベント
 */
export interface QuestDeliveryRequestEvent {
  type: 'quest:delivery:request';
  payload: {
    questId: string;
    itemIds: string[];
  };
}

/**
 * 採取実行リクエストイベント
 */
export interface GatheringExecuteRequestEvent {
  type: 'gathering:execute:request';
  payload: {
    cardId: string;
    selectedMaterialIds: string[];
  };
}

/**
 * 調合リクエストイベント
 */
export interface AlchemyCraftRequestEvent {
  type: 'alchemy:craft:request';
  payload: {
    recipeCardId: string;
    materialIds: string[];
  };
}

/**
 * ショップ購入リクエストイベント
 */
export interface ShopPurchaseRequestEvent {
  type: 'shop:purchase:request';
  payload: {
    category: 'card' | 'material' | 'artifact';
    itemId: string;
    quantity?: number;
  };
}

/**
 * カードドローリクエストイベント
 */
export interface CardDrawRequestEvent {
  type: 'card:draw:request';
  payload: {
    count: number;
  };
}

/**
 * デッキシャッフルリクエストイベント
 */
export interface DeckShuffleRequestEvent {
  type: 'deck:shuffle:request';
  payload: Record<string, never>;
}

/**
 * フェーズスキップリクエストイベント
 */
export interface PhaseSkipRequestEvent {
  type: 'phase:skip:request';
  payload: {
    phase: string;
  };
}

/**
 * 日終了リクエストイベント
 */
export interface DayEndRequestEvent {
  type: 'day:end:request';
  payload: Record<string, never>;
}

/**
 * ゲームセーブリクエストイベント
 */
export interface GameSaveRequestEvent {
  type: 'game:save:request';
  payload: {
    slotId: number;
  };
}

/**
 * ゲームロードリクエストイベント
 */
export interface GameLoadRequestEvent {
  type: 'game:load:request';
  payload: {
    slotId: number;
  };
}

/**
 * 昇格試験リクエストイベント
 */
export interface RankUpChallengeRequestEvent {
  type: 'rankup:challenge:request';
  payload: {
    targetRank: string;
  };
}

/**
 * UI → Application イベント共用体型
 */
export type UIToAppEvent =
  | QuestAcceptRequestEvent
  | QuestDeliveryRequestEvent
  | GatheringExecuteRequestEvent
  | AlchemyCraftRequestEvent
  | ShopPurchaseRequestEvent
  | CardDrawRequestEvent
  | DeckShuffleRequestEvent
  | PhaseSkipRequestEvent
  | DayEndRequestEvent
  | GameSaveRequestEvent
  | GameLoadRequestEvent
  | RankUpChallengeRequestEvent;

// =====================================================
// Application → UI イベント
// =====================================================

/**
 * ゲーム状態更新イベント
 */
export interface GameStateUpdatedEvent {
  type: 'game:state:updated';
  payload: {
    currentPhase: string;
    currentDay: number;
    playerRank: string;
    gold: number;
    ap: { current: number; max: number };
  };
}

/**
 * 依頼受注完了イベント
 */
export interface QuestAcceptedEvent {
  type: 'quest:accepted';
  payload: {
    quest: unknown;
    acceptedQuests: unknown[];
  };
}

/**
 * 依頼納品完了イベント
 */
export interface QuestDeliveredEvent {
  type: 'quest:delivered';
  payload: {
    quest: unknown;
    rewards: {
      gold: number;
      exp: number;
      items: unknown[];
    };
    rewardCards: unknown[];
  };
}

/**
 * 採取完了イベント
 */
export interface GatheringCompleteEvent {
  type: 'gathering:complete';
  payload: {
    materials: unknown[];
    apUsed: number;
    remainingAp: number;
  };
}

/**
 * 調合完了イベント
 */
export interface AlchemyCraftedEvent {
  type: 'alchemy:crafted';
  payload: {
    item: unknown;
    quality: number;
    traits: string[];
    success: boolean;
  };
}

/**
 * ショップ購入完了イベント
 */
export interface ShopPurchasedEvent {
  type: 'shop:purchased';
  payload: {
    item: unknown;
    quantity: number;
    newGold: number;
  };
}

/**
 * 手札更新イベント
 */
export interface HandUpdatedEvent {
  type: 'hand:updated';
  payload: {
    cards: unknown[];
  };
}

/**
 * デッキ更新イベント
 */
export interface DeckUpdatedEvent {
  type: 'deck:updated';
  payload: {
    deckCount: number;
    discardCount: number;
  };
}

/**
 * インベントリ更新イベント
 */
export interface InventoryUpdatedEvent {
  type: 'inventory:updated';
  payload: {
    items: unknown[];
  };
}

/**
 * フェーズ変更イベント
 */
export interface PhaseChangedEvent {
  type: 'phase:changed';
  payload: {
    previousPhase: string | null;
    currentPhase: string;
    phaseData: unknown;
  };
}

/**
 * 日終了イベント
 */
export interface DayEndedEvent {
  type: 'day:ended';
  payload: {
    newDay: number;
    summary: {
      questsCompleted: number;
      itemsCrafted: number;
      goldEarned: number;
    };
  };
}

/**
 * 昇格成功イベント
 */
export interface RankUpSuccessEvent {
  type: 'rankup:success';
  payload: {
    newRank: string;
    rewards: unknown[];
  };
}

/**
 * 昇格失敗イベント
 */
export interface RankUpFailedEvent {
  type: 'rankup:failed';
  payload: {
    reason: string;
  };
}

/**
 * ゲームオーバーイベント
 */
export interface GameOverEvent {
  type: 'game:over';
  payload: {
    reason: string;
    stats: unknown;
  };
}

/**
 * ゲームクリアイベント
 */
export interface GameClearEvent {
  type: 'game:clear';
  payload: {
    stats: unknown;
  };
}

/**
 * エラー発生イベント
 */
export interface ErrorOccurredEvent {
  type: 'error:occurred';
  payload: {
    code: string;
    message: string;
    recoverable: boolean;
  };
}

/**
 * Application → UI イベント共用体型
 */
export type AppToUIEvent =
  | GameStateUpdatedEvent
  | QuestAcceptedEvent
  | QuestDeliveredEvent
  | GatheringCompleteEvent
  | AlchemyCraftedEvent
  | ShopPurchasedEvent
  | HandUpdatedEvent
  | DeckUpdatedEvent
  | InventoryUpdatedEvent
  | PhaseChangedEvent
  | DayEndedEvent
  | RankUpSuccessEvent
  | RankUpFailedEvent
  | GameOverEvent
  | GameClearEvent
  | ErrorOccurredEvent;

/**
 * 全ゲームイベント共用体型
 */
export type GameEvent = UIToAppEvent | AppToUIEvent;

/**
 * イベントタイプからペイロード型を取得するユーティリティ型
 */
export type EventPayload<T extends GameEvent['type']> = Extract<
  GameEvent,
  { type: T }
>['payload'];

/**
 * UI→Appイベントタイプ
 */
export type UIToAppEventType = UIToAppEvent['type'];

/**
 * App→UIイベントタイプ
 */
export type AppToUIEventType = AppToUIEvent['type'];
