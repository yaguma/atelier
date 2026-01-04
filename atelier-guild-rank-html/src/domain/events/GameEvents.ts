/**
 * ゲームイベント定義
 * TASK-0101: ゲームイベント定義
 *
 * イベントバス/パブサブパターンによる疎結合なコンポーネント間通信
 */

import { GamePhase, GuildRank, Quality, ItemCategory } from '@domain/common/types';

// ============================================================================
// イベントタイプ定義
// ============================================================================

/**
 * ゲームイベントタイプ
 */
export enum GameEventType {
  /** ゲーム開始 */
  GAME_STARTED = 'GAME_STARTED',
  /** ゲーム再開 */
  GAME_CONTINUED = 'GAME_CONTINUED',
  /** フェーズ変更 */
  PHASE_CHANGED = 'PHASE_CHANGED',
  /** 日数進行 */
  DAY_ADVANCED = 'DAY_ADVANCED',
  /** 依頼受注 */
  QUEST_ACCEPTED = 'QUEST_ACCEPTED',
  /** 依頼完了 */
  QUEST_COMPLETED = 'QUEST_COMPLETED',
  /** アイテム調合 */
  ITEM_CRAFTED = 'ITEM_CRAFTED',
  /** 昇格試験開始 */
  RANK_UP_TEST_STARTED = 'RANK_UP_TEST_STARTED',
  /** ランクアップ */
  RANK_UP = 'RANK_UP',
  /** ゲームクリア */
  GAME_CLEAR = 'GAME_CLEAR',
  /** ゲームオーバー */
  GAME_OVER = 'GAME_OVER',
  /** アイテム購入 */
  ITEM_PURCHASED = 'ITEM_PURCHASED',
}

// ============================================================================
// イベントペイロード型定義
// ============================================================================

/**
 * ゲーム開始イベント
 */
export interface GameStartedEvent {
  type: GameEventType.GAME_STARTED;
  payload: Record<string, never>;
}

/**
 * ゲーム再開イベント
 */
export interface GameContinuedEvent {
  type: GameEventType.GAME_CONTINUED;
  payload: Record<string, never>;
}

/**
 * フェーズ変更イベント
 */
export interface PhaseChangedEvent {
  type: GameEventType.PHASE_CHANGED;
  payload: {
    phase: GamePhase;
  };
}

/**
 * 日数進行イベント
 */
export interface DayAdvancedEvent {
  type: GameEventType.DAY_ADVANCED;
  payload: {
    day: number;
  };
}

/**
 * 依頼受注イベント
 */
export interface QuestAcceptedEvent {
  type: GameEventType.QUEST_ACCEPTED;
  payload: {
    questId: string;
  };
}

/**
 * 報酬情報
 */
export interface Reward {
  gold: number;
  contribution: number;
}

/**
 * 依頼完了イベント
 */
export interface QuestCompletedEvent {
  type: GameEventType.QUEST_COMPLETED;
  payload: {
    questId: string;
    reward: Reward;
  };
}

/**
 * 調合アイテム情報
 */
export interface CraftedItemInfo {
  itemId: string;
  name: string;
  quality: Quality;
  category: ItemCategory;
}

/**
 * アイテム調合イベント
 */
export interface ItemCraftedEvent {
  type: GameEventType.ITEM_CRAFTED;
  payload: {
    item: CraftedItemInfo;
  };
}

/**
 * 昇格試験開始イベント
 */
export interface RankUpTestStartedEvent {
  type: GameEventType.RANK_UP_TEST_STARTED;
  payload: {
    fromRank: GuildRank;
    toRank: GuildRank;
  };
}

/**
 * ランクアップイベント
 */
export interface RankUpEvent {
  type: GameEventType.RANK_UP;
  payload: {
    newRank: GuildRank;
  };
}

/**
 * ゲームクリアイベント
 */
export interface GameClearEvent {
  type: GameEventType.GAME_CLEAR;
  payload: Record<string, never>;
}

/**
 * ゲームオーバーイベント
 */
export interface GameOverEvent {
  type: GameEventType.GAME_OVER;
  payload: {
    reason: string;
  };
}

/**
 * アイテム購入イベント
 */
export interface ItemPurchasedEvent {
  type: GameEventType.ITEM_PURCHASED;
  payload: {
    shopItemId: string;
    itemType: string;
    itemId: string;
    price: number;
  };
}

/**
 * ゲームイベント（Discriminated Union）
 */
export type GameEvent =
  | GameStartedEvent
  | GameContinuedEvent
  | PhaseChangedEvent
  | DayAdvancedEvent
  | QuestAcceptedEvent
  | QuestCompletedEvent
  | ItemCraftedEvent
  | RankUpTestStartedEvent
  | RankUpEvent
  | GameClearEvent
  | GameOverEvent
  | ItemPurchasedEvent;

// ============================================================================
// イベントバス
// ============================================================================

/**
 * イベントハンドラ型
 */
export type EventHandler<T extends GameEvent = GameEvent> = (event: T) => void;

/**
 * 購読解除関数
 */
export type Unsubscribe = () => void;

/**
 * イベントバスインターフェース
 */
export interface EventBus {
  /**
   * イベントを購読する
   * @param eventType 購読するイベントタイプ
   * @param handler イベントハンドラ
   * @returns 購読解除関数
   */
  subscribe<T extends GameEvent>(
    eventType: T['type'],
    handler: EventHandler<T>
  ): Unsubscribe;

  /**
   * イベントを発行する
   * @param event 発行するイベント
   */
  publish<T extends GameEvent>(event: T): void;

  /**
   * 全購読を解除する
   * @param eventType 特定タイプのみ解除する場合に指定
   */
  unsubscribeAll(eventType?: GameEventType): void;
}

/**
 * イベントバスを作成する
 * @returns イベントバスインスタンス
 */
export function createEventBus(): EventBus {
  const handlers = new Map<GameEventType, Set<EventHandler>>();

  return {
    subscribe<T extends GameEvent>(
      eventType: T['type'],
      handler: EventHandler<T>
    ): Unsubscribe {
      if (!handlers.has(eventType)) {
        handlers.set(eventType, new Set());
      }
      const typeHandlers = handlers.get(eventType)!;
      typeHandlers.add(handler as EventHandler);

      return () => {
        typeHandlers.delete(handler as EventHandler);
      };
    },

    publish<T extends GameEvent>(event: T): void {
      const typeHandlers = handlers.get(event.type);
      if (typeHandlers) {
        typeHandlers.forEach((handler) => handler(event));
      }
    },

    unsubscribeAll(eventType?: GameEventType): void {
      if (eventType) {
        handlers.delete(eventType);
      } else {
        handlers.clear();
      }
    },
  };
}
