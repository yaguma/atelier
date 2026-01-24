/**
 * テストデータファクトリ
 * TASK-0057 DeliveryPhaseUIリファクタリング
 *
 * @description
 * DeliveryPhaseUIコンポーネントテストで使用するテストデータを生成するファクトリ関数
 */

import type { DeliveryResult, ItemInstance, Quality, Quest } from './services.mock';

// =============================================================================
// テストデータファクトリ関数
// =============================================================================

/**
 * テスト用依頼データを作成
 */
export const createTestQuest = (overrides?: Partial<Quest>): Quest => ({
  id: 'quest-001',
  clientName: 'テスト依頼主',
  clientType: 'merchant',
  description: 'テスト依頼',
  requiredItem: 'ポーション',
  requiredCount: 1,
  rewardContribution: 100,
  rewardGold: 50,
  remainingDays: 3,
  status: 'accepted',
  ...overrides,
});

/**
 * テスト用アイテムデータを作成
 */
export const createTestItem = (overrides?: Partial<ItemInstance>): ItemInstance => ({
  instanceId: 'inst-001',
  itemId: 'potion',
  name: 'ポーション',
  quality: 'B' as Quality,
  attributes: [{ name: 'HP回復', value: 50 }],
  ...overrides,
});

/**
 * テスト用納品結果データを作成
 */
export const createTestDeliveryResult = (overrides?: Partial<DeliveryResult>): DeliveryResult => ({
  success: true,
  questId: 'quest-001',
  itemId: 'potion',
  contribution: 150,
  gold: 75,
  rewardCards: [],
  newPromotionGauge: 150,
  promotionGaugeMax: 1000,
  questCompleted: true,
  ...overrides,
});

/**
 * 複数のテスト用依頼を作成
 */
export const createTestQuests = (count: number): Quest[] =>
  Array.from({ length: count }, (_, i) =>
    createTestQuest({
      id: `quest-${i + 1}`,
      description: `テスト依頼${i + 1}`,
      clientName: `依頼主${i + 1}`,
    }),
  );

/**
 * 複数のテスト用アイテムを作成
 */
export const createTestItems = (count: number): ItemInstance[] =>
  Array.from({ length: count }, (_, i) =>
    createTestItem({
      instanceId: `inst-${i + 1}`,
      name: `アイテム${i + 1}`,
    }),
  );

/**
 * 品質別アイテムを作成
 */
export const createQualityItems = (): ItemInstance[] => [
  createTestItem({ instanceId: 'inst-c', name: 'C品質アイテム', quality: 'C' }),
  createTestItem({ instanceId: 'inst-b', name: 'B品質アイテム', quality: 'B' }),
  createTestItem({ instanceId: 'inst-a', name: 'A品質アイテム', quality: 'A' }),
  createTestItem({ instanceId: 'inst-s', name: 'S品質アイテム', quality: 'S' }),
];
