/**
 * game-state.ts - ゲーム状態関連型定義
 *
 * ゲーム状態を管理するためのインターフェース定義
 */

import type { GamePhase, GuildRank } from './common';
import type { CardId, ClientId } from './ids';
import type { ICraftedItem, IMaterialInstance } from './materials';
import type { IActiveQuest, IQuest } from './quests';

// =============================================================================
// 掲示板関連型
// =============================================================================

/**
 * 掲示板依頼
 *
 * 掲示板に累積的に掲載される依頼。期限切れで消える。
 */
export interface IBoardQuest {
  /** 依頼ID */
  questId: string;
  /** 掲示日 */
  postedDay: number;
  /** 掲示期限（この日を過ぎると消える） */
  expiryDay: number;
}

/**
 * 訪問依頼
 *
 * 訪問者が持ち込む依頼。数日ごとに更新される。
 */
export interface IVisitorQuest {
  /** 依頼ID */
  questId: string;
  /** 訪問開始日 */
  visitStartDay: number;
  /** 訪問終了日（次回更新日） */
  visitEndDay: number;
}

/**
 * 掲示板管理状態
 *
 * 掲示板依頼と訪問依頼の管理状態
 */
export interface IQuestBoardState {
  /** 掲示板の依頼リスト */
  boardQuests: IBoardQuest[];
  /** 訪問者の依頼リスト */
  visitorQuests: IVisitorQuest[];
  /** 訪問依頼の最終更新日 */
  lastVisitorUpdateDay: number;
}

// =============================================================================
// ゲーム状態
// =============================================================================

/**
 * ゲーム状態インターフェース
 */
export interface IGameState {
  /** 現在のギルドランク */
  currentRank: GuildRank;
  /** ランクHP（降格までの残りポイント） */
  rankHp: number;
  /** 昇格ゲージ（0-100、100で昇格可能） */
  promotionGauge: number;
  /** 残り日数 */
  remainingDays: number;
  /** 現在の日数 */
  currentDay: number;
  /** 現在のフェーズ */
  currentPhase: GamePhase;
  /** 所持ゴールド */
  gold: number;
  /** コンボカウント */
  comboCount: number;
  /** 行動ポイント */
  actionPoints: number;
  /** 昇格試験中かどうか */
  isPromotionTest: boolean;
  /** 昇格試験残り日数（オプション） */
  promotionTestRemainingDays?: number;
  /** 前日のAP超過分（翌日AP回復時に差し引き） */
  apOverflow: number;
  /** 掲示板状態 */
  questBoard: IQuestBoardState;
}

// =============================================================================
// デッキ状態
// =============================================================================

/**
 * デッキ状態インターフェース
 */
export interface IDeckState {
  /** 山札 */
  deck: CardId[];
  /** 手札 */
  hand: CardId[];
  /** 捨て札 */
  discard: CardId[];
  /** 所有カード全体 */
  ownedCards: CardId[];
}

// =============================================================================
// インベントリ状態
// =============================================================================

/**
 * インベントリ状態インターフェース
 */
export interface IInventoryState {
  /** 素材リスト */
  materials: IMaterialInstance[];
  /** 調合済みアイテムリスト */
  craftedItems: ICraftedItem[];
  /** 保管上限 */
  storageLimit: number;
}

// =============================================================================
// 依頼状態
// =============================================================================

/**
 * 依頼状態インターフェース
 */
export interface IQuestState {
  /** アクティブな依頼リスト */
  activeQuests: IActiveQuest[];
  /** 今日の依頼者リスト */
  todayClients: ClientId[];
  /** 今日の依頼リスト */
  todayQuests: IQuest[];
  /** 同時受注可能な依頼数 */
  questLimit: number;
}
