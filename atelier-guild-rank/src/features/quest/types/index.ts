/**
 * Quest Types - 依頼機能の型定義バレルエクスポート
 *
 * TASK-0080: features/quest/types作成
 */

// --- QuestService関連型 ---
export type {
  DailyQuestResult,
  DeliveryResult,
  FailedQuest,
  IQuestService,
  RewardCardCandidate,
} from '@domain/interfaces/quest-service.interface';

// --- 依頼・依頼者関連型（@shared/types再エクスポート） ---
export type {
  IActiveQuest,
  IClient,
  IQuest,
  IQuestCondition,
  QuestDifficulty,
} from '@shared/types';

// --- 依頼者関連型（features/quest固有） ---
export type { Client, ClientDialogue, ClientPersonality } from './client';
