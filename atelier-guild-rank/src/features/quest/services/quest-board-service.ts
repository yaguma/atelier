/**
 * quest-board-service.ts - 掲示板管理の純粋関数
 *
 * TASK-0104: QuestBoardService実装
 *
 * @description
 * 掲示板依頼の累積・期限切れ削除、訪問依頼の数日ごとの更新を行うFunctional Core。
 * 副作用なし、外部状態を参照・変更しない純粋関数として実装。
 *
 * 設計文書: docs/design/free-phase-navigation/architecture.md
 * 要件: REQ-005, REQ-005-01〜REQ-005-03
 */

import type { IQuestBoardState } from '@shared/types';
import {
  DEFAULT_BOARD_CAPACITY,
  DEFAULT_VISITOR_UPDATE_INTERVAL,
  type IQuestBoardUpdateInput,
  type IQuestBoardUpdateResult,
} from '../types/quest-board';

/**
 * 掲示板を更新する純粋関数
 *
 * 処理内容:
 * 1. 期限切れ掲示板依頼の除去（expiryDay < currentDay）
 * 2. 訪問依頼の更新判定（lastVisitorUpdateDayからの経過日数が更新間隔以上）
 * 3. 掲示板枠に空きがあれば新規依頼追加
 *
 * @param input - 掲示板更新入力
 * @returns 掲示板更新結果
 */
export function updateBoard(input: IQuestBoardUpdateInput): IQuestBoardUpdateResult {
  const {
    currentDay,
    currentBoard,
    newBoardQuestCandidates = [],
    newVisitorQuestCandidates = [],
    boardCapacity = DEFAULT_BOARD_CAPACITY,
    visitorUpdateInterval = DEFAULT_VISITOR_UPDATE_INTERVAL,
  } = input;

  // 1. 期限切れ掲示板依頼の除去
  const activeQuests = currentBoard.boardQuests.filter((quest) => quest.expiryDay >= currentDay);
  const expiredQuestIds = currentBoard.boardQuests
    .filter((quest) => quest.expiryDay < currentDay)
    .map((quest) => quest.questId);

  // 2. 掲示板枠に空きがあれば新規依頼追加
  const availableSlots = Math.max(0, boardCapacity - activeQuests.length);
  const addedBoardQuests = newBoardQuestCandidates.slice(0, availableSlots);
  const finalBoardQuests = [...activeQuests, ...addedBoardQuests];

  // 3. 訪問依頼の更新判定
  const daysSinceLastUpdate = currentDay - currentBoard.lastVisitorUpdateDay;
  const shouldUpdateVisitors = daysSinceLastUpdate >= visitorUpdateInterval;

  const finalVisitorQuests =
    shouldUpdateVisitors && newVisitorQuestCandidates.length > 0
      ? [...newVisitorQuestCandidates]
      : [...currentBoard.visitorQuests];
  const lastVisitorUpdateDay =
    shouldUpdateVisitors && newVisitorQuestCandidates.length > 0
      ? currentDay
      : currentBoard.lastVisitorUpdateDay;

  return {
    newBoard: {
      boardQuests: finalBoardQuests,
      visitorQuests: finalVisitorQuests,
      lastVisitorUpdateDay,
    },
    expiredQuestIds,
    addedBoardQuests,
    visitorQuestsUpdated: shouldUpdateVisitors && newVisitorQuestCandidates.length > 0,
  };
}

/**
 * 掲示板から依頼を受注する純粋関数
 *
 * @param board - 現在の掲示板状態
 * @param questId - 受注する依頼ID
 * @returns 受注後の掲示板状態（依頼が見つからない場合はnull）
 */
export function acceptBoardQuest(
  board: IQuestBoardState,
  questId: string,
): IQuestBoardState | null {
  const questIndex = board.boardQuests.findIndex((q) => q.questId === questId);
  if (questIndex === -1) {
    return null;
  }

  return {
    ...board,
    boardQuests: board.boardQuests.filter((q) => q.questId !== questId),
  };
}

/**
 * 訪問依頼を受注する純粋関数
 *
 * 訪問依頼は受注しても掲示板から消えない（訪問期間中は継続表示）。
 * 呼び出し側で受注済みフラグの管理を行う。
 *
 * @param board - 現在の掲示板状態
 * @param questId - 受注する依頼ID
 * @returns 受注可能な場合true（訪問依頼リストに存在するか）
 */
export function canAcceptVisitorQuest(board: IQuestBoardState, questId: string): boolean {
  return board.visitorQuests.some((q) => q.questId === questId);
}
