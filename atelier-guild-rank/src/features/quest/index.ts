/**
 * @module features/quest
 * @description 依頼機能モジュール
 *
 * ギルド依頼の生成、受注、納品バリデーション、報酬計算、
 * およびUI表示コンポーネントを提供する。
 *
 * TASK-0083: features/quest/index.ts公開API作成
 *
 * @example
 * ```typescript
 * import {
 *   generateQuests,
 *   validateQuest,
 *   calculateReward,
 *   QuestDetailModal,
 * } from '@features/quest';
 *
 * // 依頼生成
 * const result = generateQuests({ rank: 2, clients, seed: 12345 });
 *
 * // 納品バリデーション
 * const validation = validateQuest(quest, item);
 *
 * // 報酬計算
 * const reward = calculateReward(quest, deliveredItems);
 * ```
 */

// =============================================================================
// Types - 依頼関連の型定義
// =============================================================================

export type {
  Client,
  ClientDialogue,
  ClientPersonality,
  DailyQuestResult,
  DeliveryResult,
  FailedQuest,
  IActiveQuest,
  IClient,
  IQuest,
  IQuestCondition,
  IQuestService,
  QuestDifficulty,
  RewardCardCandidate,
} from './types';

// =============================================================================
// Services - 依頼関連のビジネスロジック（純粋関数）
// =============================================================================

export type {
  GenerateQuestsConfig,
  GenerateQuestsResult,
  RewardableItem,
  RewardCalculationResult,
  ValidatableItem,
  ValidationError,
  ValidationResult,
} from './services';
export {
  CLIENT_COUNT_BY_RANK,
  calculateAverageQualityMultiplier,
  calculateReward,
  DAILY_QUEST_COUNT_BY_RANK,
  generateQuests,
  getDefaultClientCount,
  getDefaultQuestCount,
  getQuestLimitForRank,
  QUALITY_REWARD_MULTIPLIER,
  QUEST_LIMIT_BY_RANK,
  QUEST_TYPE_CONTRIBUTION_MULTIPLIER,
  validateQuest,
  validateQuestWithMultipleItems,
} from './services';

// =============================================================================
// Components - 依頼関連UIコンポーネント
// =============================================================================

export type {
  DeliveryQuestPanelConfig,
  QuestCardUIConfig,
  QuestDetailModalConfig,
} from './components';
export { DeliveryQuestPanel, QuestCardUI, QuestDetailModal } from './components';
