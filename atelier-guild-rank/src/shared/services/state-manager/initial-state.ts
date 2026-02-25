/**
 * initial-state.ts - 初期ゲーム状態定義
 *
 * TASK-0066: shared/services移行
 * ゲーム開始時のデフォルト状態を定義する
 */

import { PLAYER_INITIAL, RANK_CONFIG } from '@shared/constants';
import type { IGameState } from '@shared/types';
import { GamePhase, GuildRank, InitialParameters } from '@shared/types';

/**
 * 初期ゲーム状態
 *
 * ゲーム開始時のデフォルト値を定義
 * バランスパラメータは PLAYER_INITIAL / RANK_CONFIG から参照
 */
export const INITIAL_GAME_STATE: IGameState = {
  /** 初期ランク: G */
  currentRank: GuildRank.G,
  /** ランクHP: 初期値（PLAYER_INITIAL.RANK_HP） */
  rankHp: PLAYER_INITIAL.RANK_HP,
  /** 昇格ゲージ: 初期値0 */
  promotionGauge: 0,
  /** 残り日数: Gランクの制限日数 */
  remainingDays: RANK_CONFIG.G.dayLimit,
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
  /** AP超過分: 0 */
  apOverflow: 0,
  /** 掲示板状態: 初期値 */
  questBoard: {
    boardQuests: [],
    visitorQuests: [],
    lastVisitorUpdateDay: 0,
  },
};

/**
 * 最大行動ポイント
 */
export const MAX_ACTION_POINTS = InitialParameters.ACTION_POINTS_PER_DAY;

/**
 * フェーズ遷移ルール（TASK-0102: 自由遷移対応）
 *
 * 各フェーズから他の全フェーズへ遷移可能（自フェーズ除く）
 */
export const VALID_PHASE_TRANSITIONS: Record<GamePhase, GamePhase[]> = {
  [GamePhase.QUEST_ACCEPT]: [GamePhase.GATHERING, GamePhase.ALCHEMY, GamePhase.DELIVERY],
  [GamePhase.GATHERING]: [GamePhase.QUEST_ACCEPT, GamePhase.ALCHEMY, GamePhase.DELIVERY],
  [GamePhase.ALCHEMY]: [GamePhase.QUEST_ACCEPT, GamePhase.GATHERING, GamePhase.DELIVERY],
  [GamePhase.DELIVERY]: [GamePhase.QUEST_ACCEPT, GamePhase.GATHERING, GamePhase.ALCHEMY],
};
