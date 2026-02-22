/**
 * DeliveryPhaseUI 型定義
 * TASK-0057 DeliveryPhaseUIリファクタリング
 *
 * @description
 * DeliveryPhaseUIおよびサブコンポーネントで使用するローカル型を一元管理
 */

// =============================================================================
// 基本型定義
// =============================================================================

/**
 * 品質タイプ
 */
export type Quality = 'C' | 'B' | 'A' | 'S';

/**
 * Questインターフェース - 依頼データ
 */
export interface Quest {
  id: string;
  clientName: string;
  clientType: string;
  description: string;
  requiredItem: string;
  requiredCount: number;
  rewardContribution: number;
  rewardGold: number;
  remainingDays: number;
  status: 'available' | 'accepted' | 'completed' | 'failed';
}

/**
 * ItemInstanceインターフェース - アイテムインスタンス
 */
export interface ItemInstance {
  instanceId: string;
  itemId: string;
  name: string;
  quality: Quality;
  attributes: { name: string; value: number }[];
}

/**
 * RewardCardインターフェース - 報酬カード
 */
export interface RewardCard {
  id: string;
  name: string;
  rarity: 'common' | 'uncommon' | 'rare';
  cardType: 'gathering' | 'recipe' | 'enhancement';
  description: string;
}

/**
 * DeliveryResultインターフェース - 納品結果
 */
export interface DeliveryResult {
  success: boolean;
  questId: string;
  itemId: string;
  contribution: number;
  gold: number;
  rewardCards: RewardCard[];
  newPromotionGauge: number;
  promotionGaugeMax: number;
  questCompleted: boolean;
}

/**
 * ContributionPreviewDataインターフェース - 貢献度プレビュー
 */
export interface ContributionPreviewData {
  baseReward: number;
  qualityModifier: number;
  qualityBonus: number;
  totalContribution: number;
}

// =============================================================================
// サービスインターフェース
// =============================================================================

/**
 * IQuestServiceインターフェース - 依頼サービス
 */
export interface IQuestService {
  getAcceptedQuests(): Quest[];
  deliver(questId: string, items: ItemInstance[]): DeliveryResult;
  canDeliver(questId: string, items: ItemInstance[]): boolean;
}

/**
 * IInventoryServiceインターフェース - インベントリサービス
 */
export interface IInventoryService {
  getItems(): ItemInstance[];
  removeItems(itemIds: string[]): void;
}

/**
 * IContributionCalculatorインターフェース - 貢献度計算サービス
 */
export interface IContributionCalculator {
  calculatePreview(quest: Quest, items: ItemInstance[]): ContributionPreviewData;
}

/**
 * IEventBusインターフェース - イベントバス
 */
export interface IEventBus {
  emit(event: string, payload?: unknown): void;
  on(event: string, callback: (payload?: unknown) => void): void;
  off(event: string, callback: (payload?: unknown) => void): void;
  once(event: string, callback: (payload?: unknown) => void): void;
}

// =============================================================================
// コールバックインターフェース
// =============================================================================

/**
 * QuestDeliveryListCallbacks - 依頼リストコールバック
 */
export interface QuestDeliveryListCallbacks {
  onQuestSelect: (quest: Quest) => void;
}

/**
 * ItemSelectorCallbacks - アイテム選択コールバック
 */
export interface ItemSelectorCallbacks {
  onItemSelect: (item: ItemInstance) => void;
}

/**
 * DeliveryResultPanelCallbacks - 納品結果パネルコールバック
 */
export interface DeliveryResultPanelCallbacks {
  onClose: () => void;
}

/**
 * RewardCardSelectionCallbacks - 報酬カード選択コールバック
 * Issue #263: 報酬カード選択ダイアログ
 */
export interface RewardCardSelectionCallbacks {
  onCardSelect: (card: RewardCard) => void;
  onSkip: () => void;
}

/**
 * IDeckServiceインターフェース - デッキサービス（報酬カード追加用）
 * Issue #263: 報酬カード選択ダイアログ
 */
export interface IDeckService {
  addCard(cardId: string): void;
}
