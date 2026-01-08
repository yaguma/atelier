/**
 * Phaser UI イベント型定義
 *
 * Phaser UIとApplication層の疎結合通信を実現するイベント定義。
 * 設計文書: docs/design/atelier-guild-rank-phaser/core-systems.md
 */

/**
 * UIアクションイベント（UI → Application）
 * ユーザー操作をApplication層に通知するイベント
 */
export const UIActionEvents = {
  // ゲーム開始
  NEW_GAME_CLICKED: 'ui:newGame:clicked',
  CONTINUE_CLICKED: 'ui:continue:clicked',

  // 依頼受注フェーズ
  QUEST_SELECTED: 'ui:quest:selected',
  QUEST_ACCEPTED: 'ui:quest:accepted',
  QUEST_PHASE_COMPLETED: 'ui:questPhase:completed',

  // 採取フェーズ
  GATHERING_CARD_SELECTED: 'ui:gatheringCard:selected',
  MATERIAL_OPTION_SELECTED: 'ui:materialOption:selected',
  GATHERING_CONFIRMED: 'ui:gathering:confirmed',
  GATHERING_SKIPPED: 'ui:gathering:skipped',

  // 調合フェーズ
  RECIPE_CARD_SELECTED: 'ui:recipeCard:selected',
  MATERIAL_SLOT_SELECTED: 'ui:materialSlot:selected',
  ALCHEMY_CONFIRMED: 'ui:alchemy:confirmed',
  ALCHEMY_SKIPPED: 'ui:alchemy:skipped',

  // 納品フェーズ
  DELIVERY_ITEM_SELECTED: 'ui:deliveryItem:selected',
  DELIVERY_CONFIRMED: 'ui:delivery:confirmed',
  REWARD_CARD_SELECTED: 'ui:rewardCard:selected',

  // ショップ
  SHOP_ITEM_PURCHASED: 'ui:shopItem:purchased',
  SHOP_CLOSED: 'ui:shop:closed',

  // 日終了
  DAY_END_CONFIRMED: 'ui:dayEnd:confirmed',

  // セーブ・ロード
  SAVE_REQUESTED: 'ui:save:requested',
  LOAD_REQUESTED: 'ui:load:requested',
} as const;

/**
 * 状態更新イベント（Application → UI）
 * ゲーム状態変更をUI層に通知するイベント
 */
export const StateUpdateEvents = {
  // ゲーム状態
  GAME_STATE_CHANGED: 'state:game:changed',
  PHASE_CHANGED: 'state:phase:changed',
  DAY_CHANGED: 'state:day:changed',

  // リソース
  GOLD_CHANGED: 'state:gold:changed',
  AP_CHANGED: 'state:ap:changed',
  RANK_CHANGED: 'state:rank:changed',
  CONTRIBUTION_CHANGED: 'state:contribution:changed',

  // 手札・デッキ
  HAND_UPDATED: 'state:hand:updated',
  DECK_UPDATED: 'state:deck:updated',

  // インベントリ
  INVENTORY_UPDATED: 'state:inventory:updated',

  // 依頼
  QUESTS_UPDATED: 'state:quests:updated',
  ACTIVE_QUESTS_UPDATED: 'state:activeQuests:updated',
} as const;

/**
 * UIダイアログイベント
 */
export const UIDialogEvents = {
  DIALOG_OPENED: 'ui:dialog:opened',
  DIALOG_CLOSED: 'ui:dialog:closed',
  TOAST_SHOWN: 'ui:toast:shown',
} as const;

/**
 * シーン遷移イベント
 */
export const SceneEvents = {
  SCENE_READY: 'scene:ready',
  SCENE_SHUTDOWN: 'scene:shutdown',
} as const;

/**
 * UIアクションイベントキーの型
 */
export type UIActionEventKey = (typeof UIActionEvents)[keyof typeof UIActionEvents];

/**
 * 状態更新イベントキーの型
 */
export type StateUpdateEventKey = (typeof StateUpdateEvents)[keyof typeof StateUpdateEvents];

/**
 * UIダイアログイベントキーの型
 */
export type UIDialogEventKey = (typeof UIDialogEvents)[keyof typeof UIDialogEvents];

/**
 * シーンイベントキーの型
 */
export type SceneEventKey = (typeof SceneEvents)[keyof typeof SceneEvents];

/**
 * すべてのイベントキーの型
 */
export type EventKey = UIActionEventKey | StateUpdateEventKey | UIDialogEventKey | SceneEventKey;

/**
 * 全イベントキーの配列
 */
export const AllEventKeys = [
  ...Object.values(UIActionEvents),
  ...Object.values(StateUpdateEvents),
  ...Object.values(UIDialogEvents),
  ...Object.values(SceneEvents),
] as const;
