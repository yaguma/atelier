/**
 * initial-state.ts - 初期ゲーム状態定義
 *
 * TASK-0066: shared/services移行
 * ゲーム開始時のデフォルト状態を定義する
 */

import type { IGameState } from '@shared/types';
import { GamePhase, GuildRank, InitialParameters } from '@shared/types';

/**
 * 初期ゲーム状態
 *
 * ゲーム開始時のデフォルト値を定義
 */
export const INITIAL_GAME_STATE: IGameState = {
  /** 初期ランク: G */
  currentRank: GuildRank.G,
  /** ランクHP: 初期値3（ランクダメージ3回で降格） */
  rankHp: 3,
  /** 昇格ゲージ: 初期値0 */
  promotionGauge: 0,
  /** 残り日数: 30日 */
  remainingDays: 30,
  /** 現在の日数: 1日目 */
  currentDay: 1,
  /** 現在のフェーズ: 依頼受注 */
  currentPhase: GamePhase.QUEST_ACCEPT,
  /** 初期ゴールド */
  gold: InitialParameters.INITIAL_GOLD,
  /** コンボカウント: 0 */
  comboCount: 0,
  /** 行動ポイント */
  actionPoints: InitialParameters.ACTION_POINTS_PER_DAY,
  /** 昇格試験中: false */
  isPromotionTest: false,
} as const;

/**
 * 最大行動ポイント
 */
export const MAX_ACTION_POINTS = InitialParameters.ACTION_POINTS_PER_DAY;

/**
 * フェーズ遷移ルール
 *
 * 各フェーズから遷移可能なフェーズのリスト
 */
export const VALID_PHASE_TRANSITIONS: Record<GamePhase, GamePhase[]> = {
  [GamePhase.QUEST_ACCEPT]: [GamePhase.GATHERING],
  [GamePhase.GATHERING]: [GamePhase.ALCHEMY],
  [GamePhase.ALCHEMY]: [GamePhase.DELIVERY],
  [GamePhase.DELIVERY]: [GamePhase.QUEST_ACCEPT],
} as const;
