/**
 * quest.ts - 依頼関連の型定義
 *
 * TASK-0080: features/quest/types作成
 *
 * shared/typesの依頼型を再エクスポートし、
 * features/quest経由でアクセスできるようにする。
 */

export type {
  IActiveQuest,
  IQuest,
  IQuestCondition,
  QuestDifficulty,
} from '@shared/types/quests';
