/**
 * quest-service.interface.ts - QuestServiceインターフェース
 *
 * TASK-0013: 依頼エンティティ・QuestService実装
 *
 * @description
 * 依頼システムのインターフェース定義。
 * 依頼の生成、受注、納品、期限管理などの機能を提供する。
 *
 * @信頼性レベル 🔵
 * - 設計文書・要件定義書に基づいた定義
 * - 依頼タイプに応じた条件判定
 * - 報酬カード生成システム
 */

import type { ItemInstance } from '@domain/entities/ItemInstance';
import type { CardId, GuildRank, QuestId, Rarity } from '@shared/types';
import type { IActiveQuest, IClient, IQuest, IQuestCondition } from '@shared/types/quests';

// =============================================================================
// 日次依頼生成結果
// =============================================================================

/**
 * 【機能概要】: 日次依頼生成結果
 * 【実装方針】: 今日の依頼者と依頼を格納
 * 🔵 信頼性レベル: 設計文書に明記
 */
export interface DailyQuestResult {
  /** 今日の依頼者リスト */
  clients: IClient[];
  /** 今日の依頼リスト */
  quests: IQuest[];
}

// =============================================================================
// 報酬カード候補
// =============================================================================

/**
 * 【機能概要】: 報酬カード候補
 * 【実装方針】: 納品成功時に提示される選択肢
 * 🔵 信頼性レベル: 設計文書に明記
 */
export interface RewardCardCandidate {
  /** カードID */
  cardId: CardId;
  /** レアリティ */
  rarity: Rarity;
  /** 選択理由（依頼者タイプ、依頼タイプ、ランダム） */
  reason: 'client_type' | 'quest_type' | 'random';
}

// =============================================================================
// 納品結果
// =============================================================================

/**
 * 【機能概要】: 納品結果
 * 【実装方針】: 納品成功時に返される報酬情報
 * 🔵 信頼性レベル: 設計文書に明記
 */
export interface DeliveryResult {
  /** 納品成功フラグ */
  success: boolean;
  /** 貢献度報酬 */
  contribution: number;
  /** ゴールド報酬 */
  gold: number;
  /** 報酬カード候補 */
  rewardCards: RewardCardCandidate[];
  /** 消費されたアイテム */
  consumedItems: ItemInstance[];
}

// =============================================================================
// 失敗した依頼
// =============================================================================

/**
 * 【機能概要】: 失敗した依頼
 * 【実装方針】: 期限切れで失敗した依頼の情報
 * 🔵 信頼性レベル: 設計文書に明記
 */
export interface FailedQuest {
  /** 依頼 */
  quest: IQuest;
  /** 失敗理由 */
  reason: 'deadline_expired';
}

// =============================================================================
// QuestServiceインターフェース
// =============================================================================

/**
 * 【機能概要】: QuestServiceインターフェース
 * 【実装方針】: 依頼生成、受注、納品、期限管理を提供
 * 🔵 信頼性レベル: 設計文書・要件定義書に明記
 */
export interface IQuestService {
  /**
   * 【機能概要】: 日次依頼を生成
   * 【実装方針】: ランクに応じた依頼者と依頼を生成
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @param rank - 現在のギルドランク
   * @returns 日次依頼生成結果
   */
  generateDailyQuests(rank: GuildRank): DailyQuestResult;

  /**
   * 【機能概要】: 依頼を受注
   * 【実装方針】: 依頼をアクティブリストに追加
   * 【エラー】: 依頼上限超過時、依頼未発見時
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @param questId - 受注する依頼ID
   * @returns 受注成功時true
   */
  acceptQuest(questId: QuestId): boolean;

  /**
   * 【機能概要】: 依頼をキャンセル
   * 【実装方針】: アクティブリストから依頼を削除
   * 【エラー】: 依頼未発見時
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @param questId - キャンセルする依頼ID
   */
  cancelQuest(questId: QuestId): void;

  /**
   * 【機能概要】: 納品可能かどうかを判定
   * 【実装方針】: アイテムが依頼条件を満たすか判定
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @param questId - 依頼ID
   * @param item - 納品するアイテム
   * @returns 納品可能な場合true
   */
  canDeliver(questId: QuestId, item: ItemInstance): boolean;

  /**
   * 【機能概要】: 納品を実行
   * 【実装方針】: 条件を満たすアイテムを納品し報酬を計算
   * 【エラー】: 条件未達成時、依頼未発見時
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @param questId - 依頼ID
   * @param item - 納品するアイテム
   * @param enhancementIds - 強化カードID（オプション）
   * @returns 納品結果
   */
  deliver(questId: QuestId, item: ItemInstance, enhancementIds?: CardId[]): DeliveryResult;

  /**
   * 【機能概要】: 受注中の依頼を取得
   * 【実装方針】: アクティブな依頼リストを返す
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @returns 受注中の依頼リスト
   */
  getActiveQuests(): IActiveQuest[];

  /**
   * 【機能概要】: 利用可能な依頼を取得
   * 【実装方針】: 今日生成された未受注の依頼リストを返す
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @returns 利用可能な依頼リスト
   */
  getAvailableQuests(): IQuest[];

  /**
   * 【機能概要】: 依頼の期限を更新（日終了処理）
   * 【実装方針】: 全依頼の残り日数を-1し、期限切れを判定
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @returns 期限切れで失敗した依頼リスト
   */
  updateDeadlines(): FailedQuest[];

  /**
   * 【機能概要】: 依頼条件を判定
   * 【実装方針】: 依頼タイプに応じた条件判定を実行
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @param condition - 依頼条件
   * @param item - 判定するアイテム
   * @returns 条件を満たす場合true
   */
  checkCondition(condition: IQuestCondition, item: ItemInstance): boolean;

  /**
   * 【機能概要】: 依頼の同時受注上限を取得
   * 【実装方針】: ランクに応じた上限を返す
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @returns 同時受注上限
   */
  getQuestLimit(): number;

  /**
   * 【機能概要】: 依頼の同時受注上限を設定
   * 【実装方針】: ランク特殊ルールによる上限変更
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @param limit - 新しい上限
   */
  setQuestLimit(limit: number): void;
}
