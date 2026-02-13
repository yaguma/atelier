/**
 * execute-purchase.ts - 購入処理の純粋関数
 *
 * TASK-0089: features/shop/services作成
 *
 * 購入結果の計算を行う純粋関数。
 * 副作用なしで購入後の状態を返す。
 * 実際の状態変更はImperative Shell（シーンやサービス）が担当する。
 */

import type { GuildRank } from '@shared/types';
import type { IPurchaseResult, IShopItem } from '../types';
import { canPurchase } from './purchase-validator';

/**
 * 購入処理の入力パラメータ
 */
export interface PurchaseInput {
  /** 購入対象アイテム（undefinedの場合はアイテム未発見） */
  item: IShopItem | undefined;
  /** 現在の所持ゴールド */
  currentGold: number;
  /** 現在のギルドランク */
  currentRank: GuildRank;
}

/**
 * 購入処理を実行する（純粋関数）
 *
 * 購入可否の判定と購入結果の計算を行う。
 * 実際のゴールド消費やアイテム追加は行わない。
 * 入力を変更せず、新しい結果オブジェクトを返す。
 *
 * @param input - 購入処理の入力パラメータ
 * @returns 購入結果
 */
export function executePurchase(input: PurchaseInput): IPurchaseResult {
  const { item, currentGold, currentRank } = input;

  const itemId = item?.id ?? '';

  const checkResult = canPurchase(item, currentGold, currentRank);

  if (!checkResult.canPurchase) {
    return {
      success: false,
      itemId,
      remainingGold: currentGold,
      remainingStock: item?.stock ?? 0,
      errorMessage: checkResult.errorMessage,
    };
  }

  // 購入成功の場合、新しい状態を計算（副作用なし）
  // biome-ignore lint/style/noNonNullAssertion: canPurchaseがtrueの場合、itemは必ず存在する
  const purchasedItem = item!;
  const remainingGold = currentGold - purchasedItem.price;
  const remainingStock = purchasedItem.stock > 0 ? purchasedItem.stock - 1 : purchasedItem.stock;

  return {
    success: true,
    itemId: purchasedItem.id,
    remainingGold,
    remainingStock,
  };
}
