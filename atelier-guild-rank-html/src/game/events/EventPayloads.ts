/**
 * イベントペイロード型定義
 *
 * EventBusで使用するイベントのペイロード型を定義する。
 * 型安全なイベント発行・購読を実現するための型マッピングも含む。
 * 設計文書: docs/design/atelier-guild-rank-phaser/core-systems.md
 */

/**
 * ゲームフェーズ型（ドメイン層が実装されるまでの暫定型）
 */
export type GamePhase =
  | 'QUEST_ACCEPT'
  | 'GATHERING'
  | 'ALCHEMY'
  | 'DELIVERY'
  | 'DAY_END'
  | 'SHOP';

/**
 * ギルドランク型（ドメイン層が実装されるまでの暫定型）
 */
export type GuildRank = 'G' | 'F' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

/**
 * ゲーム状態型
 */
export type GameState = 'title' | 'playing' | 'gameOver' | 'gameClear';

// =====================================================
// UIアクションペイロード（UI → Application）
// =====================================================

/**
 * 依頼選択時のペイロード
 */
export interface QuestSelectedPayload {
  questId: string;
}

/**
 * 依頼受注時のペイロード
 */
export interface QuestAcceptedPayload {
  questId: string;
}

/**
 * 採取カード選択時のペイロード
 */
export interface GatheringCardSelectedPayload {
  cardId: string;
}

/**
 * 素材オプション選択時のペイロード
 */
export interface MaterialOptionSelectedPayload {
  optionIndex: number;
}

/**
 * レシピカード選択時のペイロード
 */
export interface RecipeCardSelectedPayload {
  cardId: string;
}

/**
 * 素材スロット選択時のペイロード
 */
export interface MaterialSlotSelectedPayload {
  slotIndex: number;
  materialId: string;
}

/**
 * 納品アイテム選択時のペイロード
 */
export interface DeliveryItemSelectedPayload {
  itemId: string;
  questId: string;
}

/**
 * 報酬カード選択時のペイロード
 */
export interface RewardCardSelectedPayload {
  cardId: string;
}

/**
 * ショップアイテム購入時のペイロード
 */
export interface ShopItemPurchasedPayload {
  itemId: string;
  itemType: 'card' | 'material' | 'artifact';
}

/**
 * ショップ購入リクエスト時のペイロード
 */
export interface ShopPurchaseRequestedPayload {
  item: {
    id: string;
    name: string;
    price: number;
    description?: string;
    category: 'cards' | 'materials' | 'artifacts';
    data?: unknown;
  };
  category: 'cards' | 'materials' | 'artifacts';
  /** 素材購入時の数量（1以上、素材以外は未設定） */
  quantity?: number;
  /** 素材購入時の合計金額（素材以外は未設定） */
  totalPrice?: number;
}

/**
 * ショップ購入完了時のペイロード
 */
export interface ShopPurchaseCompletePayload {
  item: {
    id: string;
    name: string;
    price: number;
    description?: string;
    category: 'cards' | 'materials' | 'artifacts';
    data?: unknown;
  };
}

/**
 * ショップゴールド更新時のペイロード
 */
export interface ShopGoldUpdatedPayload {
  gold: number;
}

// =====================================================
// 状態更新ペイロード（Application → UI）
// =====================================================

/**
 * ゲーム状態変更時のペイロード
 */
export interface GameStateChangedPayload {
  state: GameState;
}

/**
 * フェーズ変更時のペイロード
 */
export interface PhaseChangedPayload {
  phase: GamePhase;
  previousPhase?: GamePhase;
}

/**
 * 日数変更時のペイロード
 */
export interface DayChangedPayload {
  day: number;
  maxDays: number;
}

/**
 * ゴールド変更時のペイロード
 */
export interface GoldChangedPayload {
  gold: number;
  delta: number;
}

/**
 * AP変更時のペイロード
 */
export interface APChangedPayload {
  ap: number;
  maxAP: number;
}

/**
 * ランク変更時のペイロード
 */
export interface RankChangedPayload {
  rank: GuildRank;
  previousRank?: GuildRank;
}

/**
 * 貢献度変更時のペイロード
 */
export interface ContributionChangedPayload {
  contribution: number;
  maxContribution: number;
}

/**
 * 手札更新時のペイロード
 */
export interface HandUpdatedPayload {
  cardIds: string[];
}

/**
 * デッキ更新時のペイロード
 */
export interface DeckUpdatedPayload {
  deckCount: number;
  discardCount: number;
}

/**
 * インベントリ更新時のペイロード
 */
export interface InventoryUpdatedPayload {
  materialIds: string[];
  itemIds: string[];
}

/**
 * 依頼一覧更新時のペイロード
 */
export interface QuestsUpdatedPayload {
  questIds: string[];
}

/**
 * アクティブ依頼更新時のペイロード
 */
export interface ActiveQuestsUpdatedPayload {
  questIds: string[];
}

/**
 * ダイアログ表示時のペイロード
 */
export interface DialogOpenedPayload {
  dialogType: string;
  data?: unknown;
}

/**
 * ダイアログ閉じた時のペイロード
 */
export interface DialogClosedPayload {
  dialogType: string;
}

/**
 * トースト表示時のペイロード
 */
export interface ToastShownPayload {
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

// =====================================================
// シーン遷移ペイロード
// =====================================================

/**
 * シーン遷移開始時のペイロード
 */
export interface SceneTransitionStartPayload {
  from: string | null;
  to: string;
}

/**
 * シーン遷移完了時のペイロード
 */
export interface SceneTransitionCompletePayload {
  from: string | null;
  to: string;
}

/**
 * オーバーレイ開始時のペイロード
 */
export interface SceneOverlayOpenedPayload {
  sceneKey: string;
}

/**
 * オーバーレイ終了時のペイロード
 */
export interface SceneOverlayClosedPayload {
  sceneKey: string;
}

// =====================================================
// イベントペイロードマップ
// =====================================================

/**
 * イベントキーとペイロード型のマッピング
 * 型安全なイベント発行・購読を実現する
 */
export interface EventPayloadMap {
  // ゲーム開始（ペイロードなし）
  'ui:newGame:clicked': undefined;
  'ui:continue:clicked': undefined;

  // 依頼受注フェーズ
  'ui:quest:selected': QuestSelectedPayload;
  'ui:quest:accepted': QuestAcceptedPayload;
  'ui:questPhase:completed': undefined;

  // 採取フェーズ
  'ui:gatheringCard:selected': GatheringCardSelectedPayload;
  'ui:materialOption:selected': MaterialOptionSelectedPayload;
  'ui:gathering:confirmed': undefined;
  'ui:gathering:skipped': undefined;

  // 調合フェーズ
  'ui:recipeCard:selected': RecipeCardSelectedPayload;
  'ui:materialSlot:selected': MaterialSlotSelectedPayload;
  'ui:alchemy:confirmed': undefined;
  'ui:alchemy:skipped': undefined;

  // 納品フェーズ
  'ui:deliveryItem:selected': DeliveryItemSelectedPayload;
  'ui:delivery:confirmed': undefined;
  'ui:rewardCard:selected': RewardCardSelectedPayload;

  // ショップ
  'ui:shopItem:purchased': ShopItemPurchasedPayload;
  'ui:shop:closed': undefined;
  'shop:purchase:requested': ShopPurchaseRequestedPayload;
  'shop:purchase:complete': ShopPurchaseCompletePayload;
  'shop:gold:updated': ShopGoldUpdatedPayload;

  // 日終了
  'ui:dayEnd:confirmed': undefined;

  // セーブ・ロード
  'ui:save:requested': undefined;
  'ui:load:requested': undefined;

  // ゲーム状態
  'state:game:changed': GameStateChangedPayload;
  'state:phase:changed': PhaseChangedPayload;
  'state:day:changed': DayChangedPayload;

  // リソース
  'state:gold:changed': GoldChangedPayload;
  'state:ap:changed': APChangedPayload;
  'state:rank:changed': RankChangedPayload;
  'state:contribution:changed': ContributionChangedPayload;

  // 手札・デッキ
  'state:hand:updated': HandUpdatedPayload;
  'state:deck:updated': DeckUpdatedPayload;

  // インベントリ
  'state:inventory:updated': InventoryUpdatedPayload;

  // 依頼
  'state:quests:updated': QuestsUpdatedPayload;
  'state:activeQuests:updated': ActiveQuestsUpdatedPayload;
  'quest:accept': { quest: unknown };

  // ダイアログ
  'ui:dialog:opened': DialogOpenedPayload;
  'ui:dialog:closed': DialogClosedPayload;
  'ui:toast:shown': ToastShownPayload;

  // シーン
  'scene:ready': undefined;
  'scene:shutdown': undefined;

  // シーン遷移
  'scene:transition:start': SceneTransitionStartPayload;
  'scene:transition:complete': SceneTransitionCompletePayload;
  'scene:overlay:opened': SceneOverlayOpenedPayload;
  'scene:overlay:closed': SceneOverlayClosedPayload;

  // ゲーム制御
  'game:restart': undefined;
}

/**
 * ペイロードありイベントのキー型
 */
export type PayloadEventKey = {
  [K in keyof EventPayloadMap]: EventPayloadMap[K] extends undefined
    ? never
    : K;
}[keyof EventPayloadMap];

/**
 * ペイロードなしイベントのキー型
 */
export type VoidEventKey = {
  [K in keyof EventPayloadMap]: EventPayloadMap[K] extends undefined
    ? K
    : never;
}[keyof EventPayloadMap];
