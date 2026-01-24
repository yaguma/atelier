/**
 * サービスモック定義
 * TASK-0057 DeliveryPhaseUIリファクタリング
 *
 * @description
 * DeliveryPhaseUIコンポーネントテストで使用するサービスのモック
 */

import { vi } from 'vitest';

// =============================================================================
// 型定義
// =============================================================================

/** 品質タイプ */
export type Quality = 'C' | 'B' | 'A' | 'S';

/** 依頼データ */
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

/** アイテムインスタンス */
export interface ItemInstance {
  instanceId: string;
  itemId: string;
  name: string;
  quality: Quality;
  attributes: { name: string; value: number }[];
}

/** 報酬カード */
export interface RewardCard {
  id: string;
  name: string;
  rarity: 'common' | 'uncommon' | 'rare';
  cardType: 'gathering' | 'recipe' | 'enhancement';
  description: string;
  effectDescription: string;
}

/** 納品結果 */
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

/** 貢献度プレビュー */
export interface ContributionPreviewData {
  baseReward: number;
  qualityModifier: number;
  qualityBonus: number;
  totalContribution: number;
}

// =============================================================================
// サービスインターフェース
// =============================================================================

/** QuestServiceインターフェース */
export interface IQuestService {
  getAcceptedQuests(): Quest[];
  deliver(questId: string, items: ItemInstance[]): DeliveryResult;
  canDeliver(questId: string, items: ItemInstance[]): boolean;
}

/** InventoryServiceインターフェース */
export interface IInventoryService {
  getItems(): ItemInstance[];
  removeItems(itemIds: string[]): void;
}

/** ContributionCalculatorインターフェース */
export interface IContributionCalculator {
  calculatePreview(quest: Quest, items: ItemInstance[]): ContributionPreviewData;
}

/** EventBusインターフェース */
export interface IEventBus {
  emit(event: string, payload?: unknown): void;
  on(event: string, callback: (payload?: unknown) => void): void;
  off(event: string, callback: (payload?: unknown) => void): void;
  once(event: string, callback: (payload?: unknown) => void): void;
}

// =============================================================================
// モックファクトリ関数
// =============================================================================

/**
 * QuestServiceモックを作成
 */
export const createMockQuestService = (): IQuestService => ({
  getAcceptedQuests: vi.fn().mockReturnValue([]),
  deliver: vi.fn().mockReturnValue({
    success: true,
    questId: 'quest-001',
    itemId: 'item-001',
    contribution: 100,
    gold: 50,
    rewardCards: [],
    newPromotionGauge: 100,
    promotionGaugeMax: 1000,
    questCompleted: true,
  } as DeliveryResult),
  canDeliver: vi.fn().mockReturnValue(true),
});

/**
 * InventoryServiceモックを作成
 */
export const createMockInventoryService = (): IInventoryService => ({
  getItems: vi.fn().mockReturnValue([]),
  removeItems: vi.fn(),
});

/**
 * ContributionCalculatorモックを作成
 */
export const createMockContributionCalculator = (): IContributionCalculator => ({
  calculatePreview: vi.fn().mockReturnValue({
    baseReward: 100,
    qualityModifier: 1.5,
    qualityBonus: 50,
    totalContribution: 150,
  } as ContributionPreviewData),
});

/**
 * EventBusモックを作成
 */
export const createMockEventBus = (): IEventBus => ({
  emit: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  once: vi.fn(),
});
