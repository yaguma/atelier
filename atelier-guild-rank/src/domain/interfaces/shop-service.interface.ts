/**
 * shop-service.interface.ts - ShopServiceインターフェース
 *
 * TASK-0016: ShopService・ArtifactService実装
 *
 * @description
 * ショップ管理のインターフェース定義。
 * アイテム購入処理を提供する。
 *
 * @信頼性レベル 🔵
 * - 設計文書・要件定義書に基づいた定義
 */

import type { GuildRank } from '@shared/types';

// =============================================================================
// ショップアイテム型
// =============================================================================

/**
 * 【機能概要】: ショップアイテムタイプ
 * 🟡 信頼性レベル: 設計文書から妥当な推測
 */
export type ShopItemType = 'card' | 'material' | 'artifact';

/**
 * 【機能概要】: ショップアイテム
 * 🟡 信頼性レベル: 設計文書から妥当な推測
 */
export interface IShopItem {
  /** ショップアイテムの一意識別子 */
  id: string;
  /** アイテムタイプ */
  type: ShopItemType;
  /** 実際のアイテムID（カードID、素材ID、アーティファクトID） */
  itemId: string;
  /** 表示名 */
  name: string;
  /** 価格 */
  price: number;
  /** 在庫（-1は無制限） */
  stock: number;
  /** 解放ランク */
  unlockRank: GuildRank;
  /** 説明 */
  description: string;
}

/**
 * 【機能概要】: 購入結果
 * 🔵 信頼性レベル: 設計文書に明記
 */
export interface IPurchaseResult {
  /** 購入成功フラグ */
  success: boolean;
  /** 購入したアイテムID */
  itemId: string;
  /** 残りゴールド */
  remainingGold: number;
  /** 残り在庫 */
  remainingStock: number;
  /** エラーメッセージ（失敗時） */
  errorMessage?: string;
}

// =============================================================================
// ShopServiceインターフェース
// =============================================================================

/**
 * 【機能概要】: ShopServiceインターフェース
 * 【実装方針】: ショップでの購入処理を提供
 * 🔵 信頼性レベル: 設計文書・要件定義書に明記
 */
export interface IShopService {
  // ===========================================================================
  // ショップアイテム取得
  // ===========================================================================

  /**
   * 【機能概要】: 購入可能なアイテム一覧取得
   * 【実装方針】: ランクで解放されたアイテムかつ在庫ありのアイテムを返す
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @param currentRank - 現在のギルドランク
   * @returns 購入可能なショップアイテムの配列
   */
  getAvailableItems(currentRank: GuildRank): IShopItem[];

  /**
   * 【機能概要】: 全ショップアイテム取得
   * 【実装方針】: 解放条件に関係なく全アイテムを返す
   * 🟡 信頼性レベル: 設計文書から妥当な推測
   *
   * @returns 全ショップアイテムの配列
   */
  getAllItems(): IShopItem[];

  // ===========================================================================
  // 購入処理
  // ===========================================================================

  /**
   * 【機能概要】: 購入可能判定
   * 【実装方針】: ゴールド、在庫、ランク条件をチェック
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @param itemId - ショップアイテムID
   * @param currentGold - 現在のゴールド
   * @param currentRank - 現在のランク
   * @returns 購入可能かどうか
   */
  canPurchase(itemId: string, currentGold: number, currentRank: GuildRank): boolean;

  /**
   * 【機能概要】: 購入処理
   * 【実装方針】: ゴールド消費、アイテム追加、在庫減少
   * 【エラー】: ゴールド不足、在庫切れ、ランク不足
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @param itemId - ショップアイテムID
   * @returns 購入結果
   */
  purchase(itemId: string): IPurchaseResult;

  // ===========================================================================
  // 価格・情報取得
  // ===========================================================================

  /**
   * 【機能概要】: 価格取得
   * 【実装方針】: アイテムIDから価格を取得
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @param itemId - ショップアイテムID
   * @returns 価格
   */
  getItemPrice(itemId: string): number;

  /**
   * 【機能概要】: ショップアイテム情報取得
   * 【実装方針】: アイテムIDからショップアイテム情報を取得
   * 🟡 信頼性レベル: 設計文書から妥当な推測
   *
   * @param itemId - ショップアイテムID
   * @returns ショップアイテム（存在しない場合はnull）
   */
  getShopItem(itemId: string): IShopItem | null;

  /**
   * 【機能概要】: 在庫取得
   * 【実装方針】: アイテムIDから現在の在庫数を取得
   * 🟡 信頼性レベル: 設計文書から妥当な推測
   *
   * @param itemId - ショップアイテムID
   * @returns 在庫数（-1は無制限）
   */
  getStock(itemId: string): number;
}
