/**
 * ゲーム状態エンティティのテスト
 * TASK-0099: ゲーム状態エンティティ
 *
 * ゲームの進行状態を管理するエンティティをテストする
 */

import { describe, it, expect } from 'vitest';
import {
  GameState,
  GameProgress,
  createGameState,
  updateGameState,
  advancePhase,
  advanceDay,
  startPromotionTest,
  decrementPromotionTestDays,
  setGameProgress,
} from '../../../../src/domain/game/GameState';
import { GamePhase, GuildRank } from '../../../../src/domain/common/types';

describe('GameState Entity', () => {
  describe('createGameState（ゲーム状態を生成）', () => {
    it('ゲーム状態を生成できる', () => {
      const state = createGameState();

      expect(state).toBeDefined();
      expect(state.currentPhase).toBeDefined();
      expect(state.currentDay).toBeDefined();
      expect(state.gameProgress).toBeDefined();
    });

    it('デフォルト値で生成される', () => {
      const state = createGameState();

      expect(state.currentPhase).toBe(GamePhase.QUEST_ACCEPT);
      expect(state.currentDay).toBe(1);
      expect(state.isInPromotionTest).toBe(false);
      expect(state.promotionTestDaysRemaining).toBeNull();
      expect(state.gameProgress).toBe(GameProgress.IN_PROGRESS);
    });

    it('カスタム値で生成できる', () => {
      const state = createGameState({
        currentPhase: GamePhase.GATHERING,
        currentDay: 5,
        isInPromotionTest: true,
        promotionTestDaysRemaining: 3,
        gameProgress: GameProgress.IN_PROGRESS,
      });

      expect(state.currentPhase).toBe(GamePhase.GATHERING);
      expect(state.currentDay).toBe(5);
      expect(state.isInPromotionTest).toBe(true);
      expect(state.promotionTestDaysRemaining).toBe(3);
    });
  });

  describe('getCurrentPhase（現在フェーズを取得）', () => {
    it('現在フェーズを取得できる', () => {
      const state = createGameState({
        currentPhase: GamePhase.ALCHEMY,
      });

      expect(state.currentPhase).toBe(GamePhase.ALCHEMY);
    });

    it('各フェーズを正しく扱える', () => {
      const phases = [
        GamePhase.QUEST_ACCEPT,
        GamePhase.GATHERING,
        GamePhase.ALCHEMY,
        GamePhase.DELIVERY,
      ];

      for (const phase of phases) {
        const state = createGameState({ currentPhase: phase });
        expect(state.currentPhase).toBe(phase);
      }
    });
  });

  describe('getCurrentDay（現在日数を取得）', () => {
    it('現在日数を取得できる', () => {
      const state = createGameState({ currentDay: 10 });

      expect(state.currentDay).toBe(10);
    });

    it('日数は1以上の整数', () => {
      const state = createGameState({ currentDay: 1 });

      expect(state.currentDay).toBeGreaterThanOrEqual(1);
      expect(Number.isInteger(state.currentDay)).toBe(true);
    });
  });

  describe('getGameProgress（ゲーム進行状態を取得）', () => {
    it('ゲーム進行状態を取得できる', () => {
      const state = createGameState({
        gameProgress: GameProgress.IN_PROGRESS,
      });

      expect(state.gameProgress).toBe(GameProgress.IN_PROGRESS);
    });

    it('ゲームクリア状態を扱える', () => {
      const state = createGameState({
        gameProgress: GameProgress.GAME_CLEAR,
      });

      expect(state.gameProgress).toBe(GameProgress.GAME_CLEAR);
    });

    it('ゲームオーバー状態を扱える', () => {
      const state = createGameState({
        gameProgress: GameProgress.GAME_OVER,
      });

      expect(state.gameProgress).toBe(GameProgress.GAME_OVER);
    });
  });

  describe('updateGameState（ゲーム状態を更新・イミュータブル）', () => {
    it('ゲーム状態を更新できる（イミュータブル）', () => {
      const original = createGameState();

      const updated = updateGameState(original, {
        currentPhase: GamePhase.GATHERING,
      });

      // 新しいオブジェクトが返される
      expect(updated).not.toBe(original);
      expect(updated.currentPhase).toBe(GamePhase.GATHERING);
      // 元のオブジェクトは変更されない
      expect(original.currentPhase).toBe(GamePhase.QUEST_ACCEPT);
    });

    it('複数フィールドを同時に更新できる', () => {
      const original = createGameState();

      const updated = updateGameState(original, {
        currentPhase: GamePhase.DELIVERY,
        currentDay: 10,
        isInPromotionTest: true,
      });

      expect(updated.currentPhase).toBe(GamePhase.DELIVERY);
      expect(updated.currentDay).toBe(10);
      expect(updated.isInPromotionTest).toBe(true);
    });

    it('未指定フィールドは保持される', () => {
      const original = createGameState({
        currentPhase: GamePhase.ALCHEMY,
        currentDay: 5,
      });

      const updated = updateGameState(original, {
        currentDay: 6,
      });

      expect(updated.currentPhase).toBe(GamePhase.ALCHEMY);
      expect(updated.currentDay).toBe(6);
    });
  });

  describe('advancePhase（フェーズ進行）', () => {
    it('QUEST_ACCEPTからGATHERINGに進む', () => {
      const state = createGameState({ currentPhase: GamePhase.QUEST_ACCEPT });

      const next = advancePhase(state);

      expect(next.currentPhase).toBe(GamePhase.GATHERING);
    });

    it('GATHERINGからALCHEMYに進む', () => {
      const state = createGameState({ currentPhase: GamePhase.GATHERING });

      const next = advancePhase(state);

      expect(next.currentPhase).toBe(GamePhase.ALCHEMY);
    });

    it('ALCHEMYからDELIVERYに進む', () => {
      const state = createGameState({ currentPhase: GamePhase.ALCHEMY });

      const next = advancePhase(state);

      expect(next.currentPhase).toBe(GamePhase.DELIVERY);
    });

    it('DELIVERYからQUEST_ACCEPTに戻る', () => {
      const state = createGameState({ currentPhase: GamePhase.DELIVERY });

      const next = advancePhase(state);

      expect(next.currentPhase).toBe(GamePhase.QUEST_ACCEPT);
    });
  });

  describe('advanceDay（日数進行）', () => {
    it('日数が1増加する', () => {
      const state = createGameState({ currentDay: 5 });

      const next = advanceDay(state);

      expect(next.currentDay).toBe(6);
    });

    it('元のstateは変更されない', () => {
      const state = createGameState({ currentDay: 5 });

      advanceDay(state);

      expect(state.currentDay).toBe(5);
    });
  });

  describe('昇格試験関連', () => {
    it('昇格試験を開始できる', () => {
      const state = createGameState();

      const next = startPromotionTest(state, 5);

      expect(next.isInPromotionTest).toBe(true);
      expect(next.promotionTestDaysRemaining).toBe(5);
    });

    it('昇格試験日数を減らせる', () => {
      const state = createGameState({
        isInPromotionTest: true,
        promotionTestDaysRemaining: 5,
      });

      const next = decrementPromotionTestDays(state);

      expect(next.promotionTestDaysRemaining).toBe(4);
    });

    it('昇格試験中でない場合は何も変わらない', () => {
      const state = createGameState({
        isInPromotionTest: false,
        promotionTestDaysRemaining: null,
      });

      const next = decrementPromotionTestDays(state);

      expect(next.promotionTestDaysRemaining).toBeNull();
    });
  });

  describe('setGameProgress（ゲーム進行状態設定）', () => {
    it('ゲームクリアを設定できる', () => {
      const state = createGameState();

      const next = setGameProgress(state, GameProgress.GAME_CLEAR);

      expect(next.gameProgress).toBe(GameProgress.GAME_CLEAR);
    });

    it('ゲームオーバーを設定できる', () => {
      const state = createGameState();

      const next = setGameProgress(state, GameProgress.GAME_OVER);

      expect(next.gameProgress).toBe(GameProgress.GAME_OVER);
    });
  });

  describe('不変性', () => {
    it('すべての操作で元のオブジェクトは変更されない', () => {
      const original = createGameState({
        currentPhase: GamePhase.QUEST_ACCEPT,
        currentDay: 1,
        isInPromotionTest: false,
        promotionTestDaysRemaining: null,
        gameProgress: GameProgress.IN_PROGRESS,
      });

      // 各種操作を実行
      advancePhase(original);
      advanceDay(original);
      startPromotionTest(original, 5);
      setGameProgress(original, GameProgress.GAME_CLEAR);
      updateGameState(original, { currentDay: 100 });

      // 元のオブジェクトは変更されていない
      expect(original.currentPhase).toBe(GamePhase.QUEST_ACCEPT);
      expect(original.currentDay).toBe(1);
      expect(original.isInPromotionTest).toBe(false);
      expect(original.promotionTestDaysRemaining).toBeNull();
      expect(original.gameProgress).toBe(GameProgress.IN_PROGRESS);
    });
  });
});
