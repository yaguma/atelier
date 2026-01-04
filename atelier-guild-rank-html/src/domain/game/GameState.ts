/**
 * ゲーム状態エンティティ
 * TASK-0099: ゲーム状態エンティティ
 *
 * ゲームの進行状態を管理するイミュータブルなエンティティ
 */

import { GamePhase } from '@domain/common/types';

/**
 * ゲーム進行状態
 */
export enum GameProgress {
  /** ゲーム進行中 */
  IN_PROGRESS = 'IN_PROGRESS',
  /** ゲームクリア */
  GAME_CLEAR = 'GAME_CLEAR',
  /** ゲームオーバー */
  GAME_OVER = 'GAME_OVER',
}

/**
 * ゲーム状態
 */
export interface GameState {
  /** 現在のフェーズ */
  readonly currentPhase: GamePhase;
  /** 現在の日数（1始まり） */
  readonly currentDay: number;
  /** 昇格試験中かどうか */
  readonly isInPromotionTest: boolean;
  /** 昇格試験の残り日数（試験中でなければnull） */
  readonly promotionTestDaysRemaining: number | null;
  /** ゲーム進行状態 */
  readonly gameProgress: GameProgress;
}

/**
 * ゲーム状態生成オプション
 */
export interface GameStateOptions {
  currentPhase?: GamePhase;
  currentDay?: number;
  isInPromotionTest?: boolean;
  promotionTestDaysRemaining?: number | null;
  gameProgress?: GameProgress;
}

/**
 * フェーズ順序
 */
const PhaseOrder: GamePhase[] = [
  GamePhase.QUEST_ACCEPT,
  GamePhase.GATHERING,
  GamePhase.ALCHEMY,
  GamePhase.DELIVERY,
];

/**
 * ゲーム状態を生成する
 * @param options 生成オプション
 * @returns ゲーム状態
 */
export function createGameState(options: GameStateOptions = {}): GameState {
  return {
    currentPhase: options.currentPhase ?? GamePhase.QUEST_ACCEPT,
    currentDay: options.currentDay ?? 1,
    isInPromotionTest: options.isInPromotionTest ?? false,
    promotionTestDaysRemaining: options.promotionTestDaysRemaining ?? null,
    gameProgress: options.gameProgress ?? GameProgress.IN_PROGRESS,
  };
}

/**
 * ゲーム状態を更新する（イミュータブル）
 * @param state 現在の状態
 * @param updates 更新内容
 * @returns 新しいゲーム状態
 */
export function updateGameState(
  state: GameState,
  updates: Partial<GameStateOptions>
): GameState {
  return {
    currentPhase: updates.currentPhase ?? state.currentPhase,
    currentDay: updates.currentDay ?? state.currentDay,
    isInPromotionTest: updates.isInPromotionTest ?? state.isInPromotionTest,
    promotionTestDaysRemaining:
      updates.promotionTestDaysRemaining !== undefined
        ? updates.promotionTestDaysRemaining
        : state.promotionTestDaysRemaining,
    gameProgress: updates.gameProgress ?? state.gameProgress,
  };
}

/**
 * フェーズを進める
 * @param state 現在の状態
 * @returns 新しいゲーム状態
 */
export function advancePhase(state: GameState): GameState {
  const currentIndex = PhaseOrder.indexOf(state.currentPhase);
  const nextIndex = (currentIndex + 1) % PhaseOrder.length;
  const nextPhase = PhaseOrder[nextIndex];

  return updateGameState(state, { currentPhase: nextPhase });
}

/**
 * 日数を進める
 * @param state 現在の状態
 * @returns 新しいゲーム状態
 */
export function advanceDay(state: GameState): GameState {
  return updateGameState(state, { currentDay: state.currentDay + 1 });
}

/**
 * 昇格試験を開始する
 * @param state 現在の状態
 * @param dayLimit 試験日数
 * @returns 新しいゲーム状態
 */
export function startPromotionTest(
  state: GameState,
  dayLimit: number
): GameState {
  return updateGameState(state, {
    isInPromotionTest: true,
    promotionTestDaysRemaining: dayLimit,
  });
}

/**
 * 昇格試験の残り日数を減らす
 * @param state 現在の状態
 * @returns 新しいゲーム状態
 */
export function decrementPromotionTestDays(state: GameState): GameState {
  if (!state.isInPromotionTest || state.promotionTestDaysRemaining === null) {
    return state;
  }

  return updateGameState(state, {
    promotionTestDaysRemaining: Math.max(
      0,
      state.promotionTestDaysRemaining - 1
    ),
  });
}

/**
 * ゲーム進行状態を設定する
 * @param state 現在の状態
 * @param progress ゲーム進行状態
 * @returns 新しいゲーム状態
 */
export function setGameProgress(
  state: GameState,
  progress: GameProgress
): GameState {
  return updateGameState(state, { gameProgress: progress });
}

/**
 * 昇格試験を終了する
 * @param state 現在の状態
 * @returns 新しいゲーム状態
 */
export function endPromotionTest(state: GameState): GameState {
  return updateGameState(state, {
    isInPromotionTest: false,
    promotionTestDaysRemaining: null,
  });
}
