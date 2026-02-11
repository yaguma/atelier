/**
 * quest-service.ts - QuestService関連の型定義
 *
 * TASK-0080: features/quest/types作成
 *
 * domain/interfacesのIQuestService関連型を再エクスポートし、
 * features/quest経由でアクセスできるようにする。
 */

export type {
  DailyQuestResult,
  DeliveryResult,
  FailedQuest,
  IQuestService,
  RewardCardCandidate,
} from '@domain/interfaces/quest-service.interface';
