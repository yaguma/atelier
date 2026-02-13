/**
 * purchase-validator.ts - 購入可能判定の純粋関数
 *
 * TASK-0089: features/shop/services作成
 *
 * 購入条件（ゴールド、在庫、ランク）のチェックを行う純粋関数群。
 * application/services/shop-service.tsのcanPurchaseロジックを抽出。
 */

import type { GuildRank } from '@shared/types';
import { RankOrder } from '@shared/types';
import type { IShopItem } from '../types';

/**
 * 購入不可理由
 */
export type PurchaseError =
  | 'ITEM_NOT_FOUND'
  | 'INSUFFICIENT_GOLD'
  | 'OUT_OF_STOCK'
  | 'RANK_INSUFFICIENT';

/**
 * 購入可否チェック結果
 */
export interface CanPurchaseResult {
  /** 購入可能かどうか */
  canPurchase: boolean;
  /** 購入不可の場合の理由 */
  error?: PurchaseError;
  /** エラーメッセージ */
  errorMessage?: string;
}

/**
 * ランクが十分かどうかを判定する（純粋関数）
 *
 * @param currentRank - 現在のギルドランク
 * @param requiredRank - 必要なギルドランク
 * @returns 現在のランクが必要ランク以上の場合true
 */
export function isRankSufficient(currentRank: GuildRank, requiredRank: GuildRank): boolean {
  return RankOrder[currentRank] >= RankOrder[requiredRank];
}

/**
 * アイテムの購入可否を判定する（純粋関数）
 *
 * @param item - ショップアイテム（undefinedの場合はアイテム未発見）
 * @param currentGold - 現在の所持ゴールド
 * @param currentRank - 現在のギルドランク
 * @returns 購入可否チェック結果
 */
export function canPurchase(
  item: IShopItem | undefined,
  currentGold: number,
  currentRank: GuildRank,
): CanPurchaseResult {
  if (!item) {
    return {
      canPurchase: false,
      error: 'ITEM_NOT_FOUND',
      errorMessage: 'アイテムが見つかりません',
    };
  }

  if (item.stock === 0) {
    return {
      canPurchase: false,
      error: 'OUT_OF_STOCK',
      errorMessage: '在庫がありません',
    };
  }

  if (currentGold < item.price) {
    return {
      canPurchase: false,
      error: 'INSUFFICIENT_GOLD',
      errorMessage: 'ゴールドが不足しています',
    };
  }

  if (!isRankSufficient(currentRank, item.unlockRank)) {
    return {
      canPurchase: false,
      error: 'RANK_INSUFFICIENT',
      errorMessage: `ランク${item.unlockRank}以上が必要です`,
    };
  }

  return { canPurchase: true };
}
