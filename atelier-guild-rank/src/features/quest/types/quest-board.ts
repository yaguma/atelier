/**
 * quest-board.ts - 掲示板管理関連の型定義
 *
 * TASK-0104: QuestBoardService実装
 *
 * 掲示板更新の入力・結果型と定数を定義する。
 * 設計文書: docs/design/free-phase-navigation/interfaces.ts
 */

import type { IBoardQuest, IQuestBoardState, IVisitorQuest } from '@shared/types';

// =============================================================================
// 定数
// =============================================================================

/** 掲示板の最大依頼数（デフォルト） */
export const DEFAULT_BOARD_CAPACITY = 5;

/** 訪問依頼の更新間隔（デフォルト: 3日） */
export const DEFAULT_VISITOR_UPDATE_INTERVAL = 3;

/** 掲示板依頼の有効期間（デフォルト: 5日） */
export const DEFAULT_BOARD_QUEST_DURATION = 5;

// =============================================================================
// 入力・結果型
// =============================================================================

/**
 * 掲示板更新入力
 *
 * @description
 * 日開始時の掲示板更新に必要な情報。
 * newBoardQuestCandidatesが指定されていれば、空き枠に新規追加される。
 */
export interface IQuestBoardUpdateInput {
  /** 現在の日 */
  readonly currentDay: number;
  /** 現在の掲示板状態 */
  readonly currentBoard: IQuestBoardState;
  /** 新規掲示板依頼候補（空き枠があれば追加される） */
  readonly newBoardQuestCandidates?: readonly IBoardQuest[];
  /** 新規訪問依頼候補（更新タイミングであれば差し替えられる） */
  readonly newVisitorQuestCandidates?: readonly IVisitorQuest[];
  /** 掲示板の最大依頼数（正の整数、デフォルト: DEFAULT_BOARD_CAPACITY） */
  readonly boardCapacity?: number;
  /** 訪問依頼の更新間隔日数（デフォルト: DEFAULT_VISITOR_UPDATE_INTERVAL） */
  readonly visitorUpdateInterval?: number;
}

/**
 * 掲示板更新結果
 *
 * @description
 * updateBoard()の戻り値。
 * 更新後の掲示板状態と変更内容を含む。
 */
export interface IQuestBoardUpdateResult {
  /** 更新後の掲示板状態 */
  readonly newBoard: IQuestBoardState;
  /** 期限切れで削除された依頼ID */
  readonly expiredQuestIds: readonly string[];
  /** 新しく追加された掲示板依頼 */
  readonly addedBoardQuests: readonly IBoardQuest[];
  /** 訪問依頼が更新されたか */
  readonly visitorQuestsUpdated: boolean;
}
