/**
 * events.ts - イベント関連型定義
 *
 * ゲームイベントのインターフェース定義
 */

import type { GamePhase, GuildRank } from './common';
import type { ICraftedItem, IMaterialInstance } from './materials';
import type { IQuest } from './quests';

// =============================================================================
// イベント種別列挙型
// =============================================================================

/** ゲームイベント種別 */
export const GameEventType = {
  PHASE_CHANGED: 'PHASE_CHANGED',
  DAY_ENDED: 'DAY_ENDED',
  DAY_STARTED: 'DAY_STARTED',
  QUEST_GENERATED: 'QUEST_GENERATED',
  QUEST_ACCEPTED: 'QUEST_ACCEPTED',
  QUEST_CANCELLED: 'QUEST_CANCELLED',
  QUEST_COMPLETED: 'QUEST_COMPLETED',
  QUEST_FAILED: 'QUEST_FAILED',
  GATHERING_STARTED: 'GATHERING_STARTED',
  MATERIAL_SELECTED: 'MATERIAL_SELECTED',
  GATHERING_ENDED: 'GATHERING_ENDED',
  GATHERING_COMPLETED: 'GATHERING_COMPLETED',
  ALCHEMY_COMPLETED: 'ALCHEMY_COMPLETED',
  RANK_DAMAGED: 'RANK_DAMAGED',
  RANK_UP: 'RANK_UP',
  CONTRIBUTION_ADDED: 'CONTRIBUTION_ADDED',
  GAME_OVER: 'GAME_OVER',
  GAME_CLEARED: 'GAME_CLEARED',
  // カード関連イベント
  CARD_DRAWN: 'CARD_DRAWN',
  CARD_PLAYED: 'CARD_PLAYED',
  CARD_DISCARDED: 'CARD_DISCARDED',
  HAND_REFILLED: 'HAND_REFILLED',
} as const;

export type GameEventType = (typeof GameEventType)[keyof typeof GameEventType];

// =============================================================================
// 基底イベント
// =============================================================================

/**
 * ゲームイベント基底インターフェース
 */
export interface IGameEvent {
  /** イベント種別 */
  type: GameEventType;
  /** タイムスタンプ */
  timestamp: number;
}

// =============================================================================
// フェーズ変更イベント
// =============================================================================

/**
 * フェーズ変更イベント
 */
export interface IPhaseChangedEvent extends IGameEvent {
  type: typeof GameEventType.PHASE_CHANGED;
  /** 変更前のフェーズ */
  previousPhase: GamePhase;
  /** 変更後のフェーズ */
  newPhase: GamePhase;
}

// =============================================================================
// 依頼関連イベント
// =============================================================================

/**
 * 依頼完了イベント
 */
export interface IQuestCompletedEvent extends IGameEvent {
  type: typeof GameEventType.QUEST_COMPLETED;
  /** 完了した依頼 */
  quest: IQuest;
  /** 納品したアイテム */
  deliveredItem: ICraftedItem;
}

// =============================================================================
// 採取・調合イベント
// =============================================================================

/**
 * 採取完了イベント
 */
export interface IGatheringCompletedEvent extends IGameEvent {
  type: typeof GameEventType.GATHERING_COMPLETED;
  /** 取得した素材リスト */
  obtainedMaterials: IMaterialInstance[];
}

/**
 * 調合完了イベント
 */
export interface IAlchemyCompletedEvent extends IGameEvent {
  type: typeof GameEventType.ALCHEMY_COMPLETED;
  /** 調合したアイテム */
  craftedItem: ICraftedItem;
}

// =============================================================================
// ランク関連イベント
// =============================================================================

/**
 * ランクダメージイベント
 */
export interface IRankDamagedEvent extends IGameEvent {
  type: typeof GameEventType.RANK_DAMAGED;
  /** ダメージ量 */
  damage: number;
  /** 残りHP */
  remainingHp: number;
  /** 現在のランク */
  currentRank: GuildRank;
}

/**
 * ランクアップイベント
 */
export interface IRankUpEvent extends IGameEvent {
  type: typeof GameEventType.RANK_UP;
  /** 変更前のランク */
  previousRank: GuildRank;
  /** 変更後のランク */
  newRank: GuildRank;
}

/**
 * 貢献度追加イベント
 */
export interface IContributionAddedEvent extends IGameEvent {
  type: typeof GameEventType.CONTRIBUTION_ADDED;
  /** 追加された貢献度 */
  amount: number;
  /** 追加後の昇格ゲージ */
  newPromotionGauge: number;
}

// =============================================================================
// ゲーム終了イベント
// =============================================================================

/** ゲームオーバー理由 */
export type GameOverReason = 'day_limit_exceeded' | 'rank_demoted';

/**
 * ゲームオーバーイベント
 */
export interface IGameOverEvent extends IGameEvent {
  type: typeof GameEventType.GAME_OVER;
  /** ゲームオーバー理由 */
  reason: GameOverReason;
  /** 最終ランク */
  finalRank: GuildRank;
}

/**
 * ゲームクリアイベント
 */
export interface IGameClearedEvent extends IGameEvent {
  type: typeof GameEventType.GAME_CLEARED;
  /** 総日数 */
  totalDays: number;
  /** 最終スコア */
  finalScore: number;
}
