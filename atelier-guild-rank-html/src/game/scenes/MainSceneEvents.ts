/**
 * MainSceneイベント定義
 *
 * TASK-0238: MainScene EventBus統合
 * UI層とApplication層の間のイベント通信を定義する。
 */

/**
 * MainSceneで発火・購読するイベント定義
 */
export const MainSceneEvents = {
  // UI → Application (ユーザー操作)
  UI_TO_APP: {
    // フェーズ操作
    PHASE_SKIP_REQUESTED: 'ui:phase:skip:requested',
    PHASE_COMPLETE: 'ui:phase:complete',

    // 依頼操作
    QUEST_ACCEPT_REQUESTED: 'ui:quest:accept:requested',
    QUEST_DELIVERY_REQUESTED: 'ui:quest:delivery:requested',

    // 採取操作
    GATHERING_CONFIRM_REQUESTED: 'ui:gathering:confirm:requested',
    GATHERING_MATERIAL_SELECTED: 'ui:gathering:material:selected',

    // 調合操作
    ALCHEMY_CRAFT_REQUESTED: 'ui:alchemy:craft:requested',
    ALCHEMY_RECIPE_SELECTED: 'ui:alchemy:recipe:selected',
    ALCHEMY_MATERIAL_SELECTED: 'ui:alchemy:material:selected',

    // カード操作
    CARD_DRAW_REQUESTED: 'ui:card:draw:requested',
    CARD_USE_REQUESTED: 'ui:card:use:requested',
    DECK_SHUFFLE_REQUESTED: 'ui:deck:shuffle:requested',

    // サイドバー操作
    SIDEBAR_QUEST_SELECTED: 'ui:sidebar:quest:selected',
    SIDEBAR_ITEM_SELECTED: 'ui:sidebar:item:selected',
  },

  // Application → UI (状態更新)
  APP_TO_UI: {
    // ゲーム状態
    GAME_STATE_UPDATED: 'app:game:state:updated',
    PLAYER_DATA_UPDATED: 'app:player:data:updated',

    // フェーズ
    PHASE_CHANGED: 'app:phase:changed',
    PHASE_DATA_LOADED: 'app:phase:data:loaded',

    // 依頼
    AVAILABLE_QUESTS_UPDATED: 'app:quests:available:updated',
    ACCEPTED_QUESTS_UPDATED: 'app:quests:accepted:updated',

    // インベントリ
    INVENTORY_UPDATED: 'app:inventory:updated',

    // デッキ・手札
    HAND_UPDATED: 'app:hand:updated',
    DECK_UPDATED: 'app:deck:updated',

    // 通知
    NOTIFICATION_SHOW: 'app:notification:show',
    ERROR_OCCURRED: 'app:error:occurred',
  },
} as const;

/**
 * UI → Applicationイベント型
 */
export type UIToAppEvent =
  (typeof MainSceneEvents.UI_TO_APP)[keyof typeof MainSceneEvents.UI_TO_APP];

/**
 * Application → UIイベント型
 */
export type AppToUIEvent =
  (typeof MainSceneEvents.APP_TO_UI)[keyof typeof MainSceneEvents.APP_TO_UI];

/**
 * 通知タイプ
 */
export type NotificationType = 'success' | 'info' | 'warning' | 'error';

/**
 * 通知データ
 */
export interface NotificationData {
  message: string;
  type: NotificationType;
}

/**
 * プレイヤーデータ更新ペイロード
 */
export interface PlayerDataUpdatePayload {
  rank?: string;
  exp?: number;
  maxExp?: number;
  day?: number;
  maxDay?: number;
  gold?: number;
  ap?: number;
  maxAP?: number;
}

/**
 * フェーズ変更ペイロード
 */
export interface PhaseChangedPayload {
  phase: string;
}

/**
 * デッキ更新ペイロード
 */
export interface DeckUpdatePayload {
  deckCount: number;
  discardCount: number;
}
