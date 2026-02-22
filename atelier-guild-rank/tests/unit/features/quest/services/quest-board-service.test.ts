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

  // ===========================================================================
  // TC-005-04: 訪問依頼の数日ごとの更新（REQ-005-02）
  // ===========================================================================

  describe('TC-005-04: 訪問依頼の数日ごとの更新（REQ-005-02）', () => {
    it('デフォルト間隔（3日）で訪問依頼が更新される', () => {
      // 【テスト目的】: visitorUpdateInterval未指定時にDEFAULT_VISITOR_UPDATE_INTERVAL=3が適用される
      // 🔵 REQ-005-02: 訪問依頼は一定日数ごとに入れ替わる
      const oldVisitor = createVisitorQuest({ questId: 'old-visitor' });
      const newVisitor = createVisitorQuest({ questId: 'new-visitor', visitStartDay: 4 });
      const board = createBoardState({
        visitorQuests: [oldVisitor],
        lastVisitorUpdateDay: 1,
      });

      // visitorUpdateInterval未指定 → デフォルト3日が適用される
      const result = updateBoard({
        currentDay: 4,
        currentBoard: board,
        newVisitorQuestCandidates: [newVisitor],
      });

      expect(result.visitorQuestsUpdated).toBe(true);
      expect(result.newBoard.visitorQuests).toHaveLength(1);
      expect(result.newBoard.visitorQuests[0].questId).toBe('new-visitor');
      expect(result.newBoard.lastVisitorUpdateDay).toBe(4);
    });

    it('複数サイクルにわたり訪問依頼が繰り返し更新される', () => {
      // 【テスト目的】: updateBoardを連続呼び出しして訪問依頼が正しく入れ替わることを確認
      const visitor1 = createVisitorQuest({ questId: 'visitor-cycle1' });
      const visitor2 = createVisitorQuest({ questId: 'visitor-cycle2', visitStartDay: 4 });
      const visitor3 = createVisitorQuest({ questId: 'visitor-cycle3', visitStartDay: 7 });

      // サイクル1: day=1 → lastVisitorUpdateDay=1, visitor1
      let board = createBoardState({
        visitorQuests: [visitor1],
        lastVisitorUpdateDay: 1,
      });

      // サイクル2: day=4（3日経過）→ visitor2に更新
      const result1 = updateBoard({
        currentDay: 4,
        currentBoard: board,
        newVisitorQuestCandidates: [visitor2],
        visitorUpdateInterval: 3,
      });

      expect(result1.visitorQuestsUpdated).toBe(true);
      expect(result1.newBoard.visitorQuests[0].questId).toBe('visitor-cycle2');
      expect(result1.newBoard.lastVisitorUpdateDay).toBe(4);

      // サイクル3: day=7（さらに3日経過）→ visitor3に更新
      board = result1.newBoard;
      const result2 = updateBoard({
        currentDay: 7,
        currentBoard: board,
        newVisitorQuestCandidates: [visitor3],
        visitorUpdateInterval: 3,
      });

      expect(result2.visitorQuestsUpdated).toBe(true);
      expect(result2.newBoard.visitorQuests[0].questId).toBe('visitor-cycle3');
      expect(result2.newBoard.lastVisitorUpdateDay).toBe(7);
    });

    it('境界値: ちょうど間隔日数が経過した場合に更新される', () => {
      // 【テスト目的】: daysSinceLastUpdate === visitorUpdateInterval で更新が発生する
      const oldVisitor = createVisitorQuest({ questId: 'old' });
      const newVisitor = createVisitorQuest({ questId: 'new' });
      const board = createBoardState({
        visitorQuests: [oldVisitor],
        lastVisitorUpdateDay: 5,
      });

      // daysSinceLastUpdate = 8 - 5 = 3 === visitorUpdateInterval
      const result = updateBoard({
        currentDay: 8,
        currentBoard: board,
        newVisitorQuestCandidates: [newVisitor],
        visitorUpdateInterval: 3,
      });

      expect(result.visitorQuestsUpdated).toBe(true);
      expect(result.newBoard.visitorQuests[0].questId).toBe('new');
    });

    it('境界値: 間隔日数に1日足りない場合は更新されない', () => {
      // 【テスト目的】: daysSinceLastUpdate === visitorUpdateInterval - 1 では更新されない
      const oldVisitor = createVisitorQuest({ questId: 'old' });
      const newVisitor = createVisitorQuest({ questId: 'new' });
      const board = createBoardState({
        visitorQuests: [oldVisitor],
        lastVisitorUpdateDay: 5,
      });

      // daysSinceLastUpdate = 7 - 5 = 2 < visitorUpdateInterval(3)
      const result = updateBoard({
        currentDay: 7,
        currentBoard: board,
        newVisitorQuestCandidates: [newVisitor],
        visitorUpdateInterval: 3,
      });

      expect(result.visitorQuestsUpdated).toBe(false);
      expect(result.newBoard.visitorQuests[0].questId).toBe('old');
    });

    it('複数の訪問依頼候補がある場合、全て差し替えられる', () => {
      // 【テスト目的】: 候補が複数ある場合に全て反映される
      const oldVisitor = createVisitorQuest({ questId: 'old-1' });
      const newVisitors = [
        createVisitorQuest({ questId: 'new-1', visitStartDay: 4 }),
        createVisitorQuest({ questId: 'new-2', visitStartDay: 4 }),
      ];
      const board = createBoardState({
        visitorQuests: [oldVisitor],
        lastVisitorUpdateDay: 1,
      });

      const result = updateBoard({
        currentDay: 4,
        currentBoard: board,
        newVisitorQuestCandidates: newVisitors,
        visitorUpdateInterval: 3,
      });

      expect(result.visitorQuestsUpdated).toBe(true);
      expect(result.newBoard.visitorQuests).toHaveLength(2);
      expect(result.newBoard.visitorQuests[0].questId).toBe('new-1');
      expect(result.newBoard.visitorQuests[1].questId).toBe('new-2');
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
