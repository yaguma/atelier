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
