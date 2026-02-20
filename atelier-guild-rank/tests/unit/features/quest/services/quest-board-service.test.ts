/**
 * quest-board-service.test.ts - 掲示板管理サービスのテスト
 *
 * TASK-0104: QuestBoardService実装
 *
 * updateBoard(), acceptBoardQuest(), canAcceptVisitorQuest()の動作を検証する。
 */

import {
  acceptBoardQuest,
  canAcceptVisitorQuest,
  updateBoard,
} from '@features/quest/services/quest-board-service';
import type { IBoardQuest, IQuestBoardState, IVisitorQuest } from '@shared/types';
import { describe, expect, it } from 'vitest';

// =============================================================================
// テストヘルパー
// =============================================================================

function createBoardQuest(overrides: Partial<IBoardQuest> = {}): IBoardQuest {
  return {
    questId: 'board-quest-1',
    postedDay: 1,
    expiryDay: 5,
    ...overrides,
  };
}

function createVisitorQuest(overrides: Partial<IVisitorQuest> = {}): IVisitorQuest {
  return {
    questId: 'visitor-quest-1',
    visitStartDay: 1,
    visitEndDay: 3,
    ...overrides,
  };
}

function createBoardState(overrides: Partial<IQuestBoardState> = {}): IQuestBoardState {
  return {
    boardQuests: [],
    visitorQuests: [],
    lastVisitorUpdateDay: 0,
    ...overrides,
  };
}

// =============================================================================
// updateBoard テスト
// =============================================================================

describe('updateBoard', () => {
  describe('期限切れ依頼の除去', () => {
    it('期限切れの掲示板依頼が除去される', () => {
      const expiredQuest = createBoardQuest({ questId: 'expired', expiryDay: 4 });
      const activeQuest = createBoardQuest({ questId: 'active', expiryDay: 6 });
      const board = createBoardState({
        boardQuests: [expiredQuest, activeQuest],
      });

      const result = updateBoard({ currentDay: 5, currentBoard: board });

      expect(result.newBoard.boardQuests).toHaveLength(1);
      expect(result.newBoard.boardQuests[0].questId).toBe('active');
      expect(result.expiredQuestIds).toEqual(['expired']);
    });

    it('期限当日の依頼は除去されない', () => {
      const quest = createBoardQuest({ questId: 'q1', expiryDay: 5 });
      const board = createBoardState({ boardQuests: [quest] });

      const result = updateBoard({ currentDay: 5, currentBoard: board });

      expect(result.newBoard.boardQuests).toHaveLength(1);
      expect(result.expiredQuestIds).toEqual([]);
    });

    it('複数の期限切れ依頼が全て除去される', () => {
      const quests = [
        createBoardQuest({ questId: 'exp1', expiryDay: 2 }),
        createBoardQuest({ questId: 'exp2', expiryDay: 3 }),
        createBoardQuest({ questId: 'active', expiryDay: 10 }),
      ];
      const board = createBoardState({ boardQuests: quests });

      const result = updateBoard({ currentDay: 5, currentBoard: board });

      expect(result.expiredQuestIds).toEqual(['exp1', 'exp2']);
      expect(result.newBoard.boardQuests).toHaveLength(1);
    });

    it('期限切れ依頼がない場合、空の配列が返る', () => {
      const quest = createBoardQuest({ questId: 'q1', expiryDay: 10 });
      const board = createBoardState({ boardQuests: [quest] });

      const result = updateBoard({ currentDay: 5, currentBoard: board });

      expect(result.expiredQuestIds).toEqual([]);
    });
  });

  describe('訪問依頼の更新', () => {
    it('更新間隔に達した場合、訪問依頼が差し替えられる', () => {
      const oldVisitor = createVisitorQuest({ questId: 'old-visitor' });
      const newVisitor = createVisitorQuest({ questId: 'new-visitor', visitStartDay: 4 });
      const board = createBoardState({
        visitorQuests: [oldVisitor],
        lastVisitorUpdateDay: 1,
      });

      const result = updateBoard({
        currentDay: 4,
        currentBoard: board,
        newVisitorQuestCandidates: [newVisitor],
        visitorUpdateInterval: 3,
      });

      expect(result.visitorQuestsUpdated).toBe(true);
      expect(result.newBoard.visitorQuests).toHaveLength(1);
      expect(result.newBoard.visitorQuests[0].questId).toBe('new-visitor');
      expect(result.newBoard.lastVisitorUpdateDay).toBe(4);
    });

    it('更新間隔に達していない場合、訪問依頼は変更されない', () => {
      const visitor = createVisitorQuest({ questId: 'visitor' });
      const board = createBoardState({
        visitorQuests: [visitor],
        lastVisitorUpdateDay: 2,
      });

      const result = updateBoard({
        currentDay: 3,
        currentBoard: board,
        visitorUpdateInterval: 3,
      });

      expect(result.visitorQuestsUpdated).toBe(false);
      expect(result.newBoard.visitorQuests[0].questId).toBe('visitor');
      expect(result.newBoard.lastVisitorUpdateDay).toBe(2);
    });

    it('更新タイミングだが候補がない場合、更新されない', () => {
      const visitor = createVisitorQuest({ questId: 'visitor' });
      const board = createBoardState({
        visitorQuests: [visitor],
        lastVisitorUpdateDay: 1,
      });

      const result = updateBoard({
        currentDay: 4,
        currentBoard: board,
        visitorUpdateInterval: 3,
        newVisitorQuestCandidates: [],
      });

      expect(result.visitorQuestsUpdated).toBe(false);
      expect(result.newBoard.visitorQuests[0].questId).toBe('visitor');
    });
  });

  describe('新規掲示板依頼の追加', () => {
    it('空き枠がある場合、新規候補が追加される', () => {
      const board = createBoardState({ boardQuests: [] });
      const newQuest = createBoardQuest({ questId: 'new-1' });

      const result = updateBoard({
        currentDay: 1,
        currentBoard: board,
        newBoardQuestCandidates: [newQuest],
        boardCapacity: 5,
      });

      expect(result.addedBoardQuests).toHaveLength(1);
      expect(result.newBoard.boardQuests).toHaveLength(1);
      expect(result.newBoard.boardQuests[0].questId).toBe('new-1');
    });

    it('掲示板が満杯の場合、新規候補は追加されない', () => {
      const existingQuests = Array.from({ length: 5 }, (_, i) =>
        createBoardQuest({ questId: `q${i}`, expiryDay: 10 }),
      );
      const board = createBoardState({ boardQuests: existingQuests });
      const newQuest = createBoardQuest({ questId: 'new-1' });

      const result = updateBoard({
        currentDay: 1,
        currentBoard: board,
        newBoardQuestCandidates: [newQuest],
        boardCapacity: 5,
      });

      expect(result.addedBoardQuests).toHaveLength(0);
      expect(result.newBoard.boardQuests).toHaveLength(5);
    });

    it('空き枠より多い候補がある場合、空き枠分のみ追加される', () => {
      const existingQuests = [
        createBoardQuest({ questId: 'existing-1', expiryDay: 10 }),
        createBoardQuest({ questId: 'existing-2', expiryDay: 10 }),
        createBoardQuest({ questId: 'existing-3', expiryDay: 10 }),
      ];
      const board = createBoardState({ boardQuests: existingQuests });
      const candidates = [
        createBoardQuest({ questId: 'new-1' }),
        createBoardQuest({ questId: 'new-2' }),
        createBoardQuest({ questId: 'new-3' }),
      ];

      const result = updateBoard({
        currentDay: 1,
        currentBoard: board,
        newBoardQuestCandidates: candidates,
        boardCapacity: 5,
      });

      expect(result.addedBoardQuests).toHaveLength(2);
      expect(result.newBoard.boardQuests).toHaveLength(5);
    });

    it('期限切れ除去後の空き枠に新規追加される', () => {
      const expiredQuest = createBoardQuest({ questId: 'expired', expiryDay: 2 });
      const activeQuest = createBoardQuest({ questId: 'active', expiryDay: 10 });
      const board = createBoardState({ boardQuests: [expiredQuest, activeQuest] });
      const newQuest = createBoardQuest({ questId: 'new-1' });

      const result = updateBoard({
        currentDay: 5,
        currentBoard: board,
        newBoardQuestCandidates: [newQuest],
        boardCapacity: 5,
      });

      expect(result.expiredQuestIds).toEqual(['expired']);
      expect(result.addedBoardQuests).toHaveLength(1);
      expect(result.newBoard.boardQuests).toHaveLength(2);
    });
  });

  describe('重複questIdの除外', () => {
    it('既存依頼と同じquestIdの候補は追加されない', () => {
      const existing = createBoardQuest({ questId: 'q1', expiryDay: 10 });
      const board = createBoardState({ boardQuests: [existing] });
      const duplicate = createBoardQuest({ questId: 'q1' });
      const unique = createBoardQuest({ questId: 'q2' });

      const result = updateBoard({
        currentDay: 1,
        currentBoard: board,
        newBoardQuestCandidates: [duplicate, unique],
        boardCapacity: 5,
      });

      expect(result.addedBoardQuests).toHaveLength(1);
      expect(result.addedBoardQuests[0].questId).toBe('q2');
      expect(result.newBoard.boardQuests).toHaveLength(2);
    });

    it('候補が全て重複する場合、追加されない', () => {
      const existing = createBoardQuest({ questId: 'q1', expiryDay: 10 });
      const board = createBoardState({ boardQuests: [existing] });

      const result = updateBoard({
        currentDay: 1,
        currentBoard: board,
        newBoardQuestCandidates: [createBoardQuest({ questId: 'q1' })],
        boardCapacity: 5,
      });

      expect(result.addedBoardQuests).toHaveLength(0);
      expect(result.newBoard.boardQuests).toHaveLength(1);
    });
  });

  describe('複合シナリオ', () => {
    it('期限切れ除去・訪問更新・新規追加が同時に行われる', () => {
      const board = createBoardState({
        boardQuests: [
          createBoardQuest({ questId: 'expired', expiryDay: 3 }),
          createBoardQuest({ questId: 'active', expiryDay: 10 }),
        ],
        visitorQuests: [createVisitorQuest({ questId: 'old-visitor' })],
        lastVisitorUpdateDay: 1,
      });

      const result = updateBoard({
        currentDay: 5,
        currentBoard: board,
        newBoardQuestCandidates: [createBoardQuest({ questId: 'new-board' })],
        newVisitorQuestCandidates: [createVisitorQuest({ questId: 'new-visitor' })],
        boardCapacity: 5,
        visitorUpdateInterval: 3,
      });

      expect(result.expiredQuestIds).toEqual(['expired']);
      expect(result.addedBoardQuests).toHaveLength(1);
      expect(result.visitorQuestsUpdated).toBe(true);
      expect(result.newBoard.boardQuests).toHaveLength(2);
      expect(result.newBoard.visitorQuests[0].questId).toBe('new-visitor');
    });

    it('空の掲示板でデフォルト設定のまま更新できる', () => {
      const board = createBoardState();

      const result = updateBoard({ currentDay: 1, currentBoard: board });

      expect(result.newBoard.boardQuests).toHaveLength(0);
      expect(result.newBoard.visitorQuests).toHaveLength(0);
      expect(result.expiredQuestIds).toEqual([]);
      expect(result.addedBoardQuests).toHaveLength(0);
      expect(result.visitorQuestsUpdated).toBe(false);
    });
  });

  describe('純粋関数の検証', () => {
    it('同じ入力に対して常に同じ結果を返す', () => {
      const board = createBoardState({
        boardQuests: [createBoardQuest({ questId: 'q1', expiryDay: 3 })],
      });
      const input = { currentDay: 5, currentBoard: board };

      const result1 = updateBoard(input);
      const result2 = updateBoard(input);

      expect(result1).toEqual(result2);
    });

    it('入力の掲示板状態が変更されない', () => {
      const board = createBoardState({
        boardQuests: [createBoardQuest({ questId: 'q1', expiryDay: 3 })],
      });
      const boardCopy = {
        ...board,
        boardQuests: [...board.boardQuests],
        visitorQuests: [...board.visitorQuests],
      };

      updateBoard({ currentDay: 5, currentBoard: board });

      expect(board.boardQuests).toEqual(boardCopy.boardQuests);
      expect(board.visitorQuests).toEqual(boardCopy.visitorQuests);
    });
  });
});

// =============================================================================
// acceptBoardQuest テスト
// =============================================================================

describe('acceptBoardQuest', () => {
  it('指定した依頼が掲示板から削除される', () => {
    const board = createBoardState({
      boardQuests: [createBoardQuest({ questId: 'q1' }), createBoardQuest({ questId: 'q2' })],
    });

    const result = acceptBoardQuest(board, 'q1');

    expect(result).not.toBeNull();
    expect(result?.boardQuests).toHaveLength(1);
    expect(result?.boardQuests[0].questId).toBe('q2');
  });

  it('存在しない依頼IDの場合、nullが返る', () => {
    const board = createBoardState({
      boardQuests: [createBoardQuest({ questId: 'q1' })],
    });

    const result = acceptBoardQuest(board, 'nonexistent');

    expect(result).toBeNull();
  });

  it('訪問依頼リストには影響しない', () => {
    const board = createBoardState({
      boardQuests: [createBoardQuest({ questId: 'q1' })],
      visitorQuests: [createVisitorQuest({ questId: 'v1' })],
    });

    const result = acceptBoardQuest(board, 'q1');

    expect(result).not.toBeNull();
    expect(result?.visitorQuests).toHaveLength(1);
    expect(result?.visitorQuests[0].questId).toBe('v1');
  });

  it('元の掲示板状態は変更されない', () => {
    const board = createBoardState({
      boardQuests: [createBoardQuest({ questId: 'q1' })],
    });

    acceptBoardQuest(board, 'q1');

    expect(board.boardQuests).toHaveLength(1);
  });
});

// =============================================================================
// canAcceptVisitorQuest テスト
// =============================================================================

describe('canAcceptVisitorQuest', () => {
  it('訪問依頼リストに存在する場合、trueが返る', () => {
    const board = createBoardState({
      visitorQuests: [createVisitorQuest({ questId: 'v1' })],
    });

    expect(canAcceptVisitorQuest(board, 'v1')).toBe(true);
  });

  it('訪問依頼リストに存在しない場合、falseが返る', () => {
    const board = createBoardState({
      visitorQuests: [createVisitorQuest({ questId: 'v1' })],
    });

    expect(canAcceptVisitorQuest(board, 'nonexistent')).toBe(false);
  });

  it('訪問依頼リストが空の場合、falseが返る', () => {
    const board = createBoardState();

    expect(canAcceptVisitorQuest(board, 'v1')).toBe(false);
  });
});
