/**
 * quests.ts - 依頼関連型定義
 *
 * 依頼者と依頼のインターフェース定義
 */

import type { ClientType, GuildRank, ItemCategory, Quality, QuestType } from './common';
import type { ClientId, QuestId } from './ids';

// =============================================================================
// 依頼者
// =============================================================================

/**
 * 依頼者インターフェース
 */
export interface IClient {
  /** 依頼者ID */
  id: ClientId;
  /** 依頼者名 */
  name: string;
  /** 依頼者種別 */
  type: ClientType;
  /** 貢献度倍率 */
  contributionMultiplier: number;
  /** ゴールド倍率 */
  goldMultiplier: number;
  /** 期限修正値 */
  deadlineModifier: number;
  /** 好む依頼種別リスト */
  preferredQuestTypes: QuestType[];
  /** 解禁ランク */
  unlockRank: GuildRank;
  /** セリフパターン（オプション） */
  dialoguePatterns?: string[];
}

// =============================================================================
// 依頼条件
// =============================================================================

/**
 * 依頼条件インターフェース
 */
export interface IQuestCondition {
  /** 条件種別 */
  type: QuestType;
  /** 指定アイテムID（オプション） */
  itemId?: string;
  /** 指定カテゴリ（オプション） */
  category?: ItemCategory;
  /** 最低品質（オプション） */
  minQuality?: Quality;
  /** 必要数量（オプション） */
  quantity?: number;
  /** サブ条件（複合条件用、オプション） */
  subConditions?: IQuestCondition[];
}

// =============================================================================
// 依頼
// =============================================================================

/** 依頼難易度 */
export type QuestDifficulty = 'easy' | 'normal' | 'hard';

/**
 * 依頼インターフェース
 */
export interface IQuest {
  /** 依頼ID */
  id: QuestId;
  /** 依頼者ID */
  clientId: ClientId;
  /** 達成条件 */
  condition: IQuestCondition;
  /** 貢献度報酬 */
  contribution: number;
  /** ゴールド報酬 */
  gold: number;
  /** 期限（日数） */
  deadline: number;
  /** 難易度 */
  difficulty: QuestDifficulty;
  /** フレーバーテキスト */
  flavorText: string;
}

// =============================================================================
// アクティブな依頼
// =============================================================================

/**
 * アクティブな依頼インターフェース
 */
export interface IActiveQuest {
  /** 依頼情報 */
  quest: IQuest;
  /** 残り日数 */
  remainingDays: number;
  /** 受注した日 */
  acceptedDay: number;
}
