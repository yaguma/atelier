/**
 * shop-service.ts - ショップサービスインターフェース
 *
 * TASK-0088: features/shop/types作成
 *
 * domain/interfaces/shop-service.interface.tsから移行。
 * ショップサービスのインターフェースを定義する。
 */

import type { GuildRank } from '@shared/types';
import type { IPurchaseResult } from './purchase-result';
import type { IShopItem } from './shop-item';

/**
 * ショップサービスインターフェース
 * ショップでの購入処理を提供する
 */
export interface IShopService {
  /**
   * 購入可能なアイテム一覧取得
   * ランクで解放されたアイテムかつ在庫ありのアイテムを返す
   *
   * @param currentRank - 現在のギルドランク
   * @returns 購入可能なショップアイテムの配列
   */
  getAvailableItems(currentRank: GuildRank): IShopItem[];

  /**
   * 全ショップアイテム取得
   * 解放条件に関係なく全アイテムを返す
   *
   * @returns 全ショップアイテムの配列
   */
  getAllItems(): IShopItem[];

  /**
   * 購入可能判定
   * ゴールド、在庫、ランク条件をチェック
   *
   * @param itemId - ショップアイテムID
   * @param currentGold - 現在のゴールド
   * @param currentRank - 現在のランク
   * @returns 購入可能かどうか
   */
  canPurchase(itemId: string, currentGold: number, currentRank: GuildRank): boolean;

  /**
   * 購入処理
   * ゴールド消費、アイテム追加、在庫減少
   *
   * @param itemId - ショップアイテムID
   * @returns 購入結果
   */
  purchase(itemId: string): IPurchaseResult;

  /**
   * 価格取得
   *
   * @param itemId - ショップアイテムID
   * @returns 価格
   */
  getItemPrice(itemId: string): number;

  /**
   * ショップアイテム情報取得
   *
   * @param itemId - ショップアイテムID
   * @returns ショップアイテム（存在しない場合はnull）
   */
  getShopItem(itemId: string): IShopItem | null;

  /**
   * 在庫取得
   *
   * @param itemId - ショップアイテムID
   * @returns 在庫数（-1は無制限）
   */
  getStock(itemId: string): number;
}
