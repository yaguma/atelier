/**
 * Quest Services - 依頼機能サービスのバレルエクスポート
 *
 * TASK-0081: features/quest/services作成
 */

// --- 報酬・依頼定数（@shared/constants/game-config から再エクスポート） ---
export {
  CLIENT_COUNT_BY_RANK,
  DAILY_QUEST_COUNT_BY_RANK,
  QUALITY_REWARD_MULTIPLIER,
  QUEST_LIMIT_BY_RANK,
  QUEST_TYPE_CONTRIBUTION_MULTIPLIER,
} from '@shared/constants';
// --- 報酬計算 ---
export type { RewardableItem, RewardCalculationResult } from './calculate-reward';
export { calculateAverageQualityMultiplier, calculateReward } from './calculate-reward';

// --- 依頼生成 ---
export type { GenerateQuestsConfig, GenerateQuestsResult } from './generate-quests';
export {
  generateQuests,
  getDefaultClientCount,
  getDefaultQuestCount,
  getQuestLimitForRank,
} from './generate-quests';
// --- 掲示板管理 ---
export {
  acceptBoardQuest,
  canAcceptVisitorQuest,
  updateBoard,
} from './quest-board-service';
// --- 依頼バリデーション ---
export type { ValidatableItem, ValidationError, ValidationResult } from './validate-quest';
export { validateQuest, validateQuestWithMultipleItems } from './validate-quest';
