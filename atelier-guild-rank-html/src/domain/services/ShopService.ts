/**
 * ショップドメインサービス
 * TASK-0098: ショップドメインサービス
 *
 * ショップでの購入処理を担当する
 */

import { GuildRank, Rarity, EffectType } from '@domain/common/types';

/**
 * ショップアイテム種別
 */
export enum ShopItemType {
  /** カード（採取地・レシピ・強化） */
  CARD = 'CARD',
  /** 素材 */
  MATERIAL = 'MATERIAL',
  /** アーティファクト */
  ARTIFACT = 'ARTIFACT',
}

/**
 * ショップアイテム
 */
export interface ShopItem {
  /** ショップアイテムID */
  id: string;
  /** アイテム種別 */
  type: ShopItemType;
  /** 実際のアイテムID（カードID、素材ID、アーティファクトID） */
  itemId: string;
  /** 表示名 */
  name: string;
  /** 価格 */
  price: number;
  /** 在庫数（-1は無限在庫） */
  stock: number;
  /** 解放ランク */
  unlockRank: GuildRank;
  /** 説明 */
  description: string;
  /** レアリティ（アーティファクト用） */
  rarity?: Rarity;
  /** 効果（アーティファクト用） */
  effect?: { type: EffectType; value: number };
}

/**
 * ショップ状態
 */
export interface ShopState {
  /** 現在のランク */
  currentRank: GuildRank;
  /** 所持ゴールド */
  gold: number;
  /** 在庫マップ（商品ID -> 残り在庫数） */
  stockMap: Record<string, number>;
}

/**
 * 購入結果
 */
export interface PurchaseResult {
  /** 購入した商品 */
  purchasedItem: ShopItem;
  /** 更新後のショップ状態 */
  newState: ShopState;
}

/**
 * 操作結果型
 */
export type Result<T> =
  | { success: true; value: T }
  | { success: false; error: string };

/**
 * ランク順序マップ
 */
const RankOrder: Record<GuildRank, number> = {
  [GuildRank.G]: 0,
  [GuildRank.F]: 1,
  [GuildRank.E]: 2,
  [GuildRank.D]: 3,
  [GuildRank.C]: 4,
  [GuildRank.B]: 5,
  [GuildRank.A]: 6,
  [GuildRank.S]: 7,
};

/**
 * ショップ状態を生成する
 * @param currentRank 現在のランク
 * @param gold 所持ゴールド
 * @param stockMap 在庫マップ（省略可）
 * @returns ショップ状態
 */
export function createShopState(
  currentRank: GuildRank,
  gold: number,
  stockMap: Record<string, number> = {}
): ShopState {
  return {
    currentRank,
    gold,
    stockMap,
  };
}

/**
 * ショップドメインサービス
 */
export class ShopService {
  private shopItems: Map<string, ShopItem>;

  /**
   * コンストラクタ
   * @param items ショップアイテム一覧
   */
  constructor(items: ShopItem[]) {
    this.shopItems = new Map(items.map((item) => [item.id, item]));
  }

  /**
   * 購入可能な商品リストを取得する
   * @param state ショップ状態
   * @returns 購入可能な商品リスト
   */
  getAvailableItems(state: ShopState): ShopItem[] {
    const currentRankOrder = RankOrder[state.currentRank];

    return Array.from(this.shopItems.values()).filter((item) => {
      // ランクチェック
      const requiredRankOrder = RankOrder[item.unlockRank];
      if (requiredRankOrder > currentRankOrder) {
        return false;
      }

      // 在庫チェック
      const stock = this.getStock(state, item.id);
      if (stock === 0) {
        return false;
      }

      return true;
    });
  }

  /**
   * 購入可能かどうかを判定する
   * @param state ショップ状態
   * @param itemId 商品ID
   * @returns 購入可能な場合true
   */
  canPurchase(state: ShopState, itemId: string): boolean {
    const item = this.shopItems.get(itemId);
    if (!item) {
      return false;
    }

    // ランクチェック
    const currentRankOrder = RankOrder[state.currentRank];
    const requiredRankOrder = RankOrder[item.unlockRank];
    if (requiredRankOrder > currentRankOrder) {
      return false;
    }

    // ゴールドチェック
    if (state.gold < item.price) {
      return false;
    }

    // 在庫チェック
    const stock = this.getStock(state, itemId);
    if (stock === 0) {
      return false;
    }

    return true;
  }

  /**
   * 商品を購入する
   * @param state ショップ状態
   * @param itemId 商品ID
   * @returns 購入結果
   */
  purchase(state: ShopState, itemId: string): Result<PurchaseResult> {
    const item = this.shopItems.get(itemId);
    if (!item) {
      return { success: false, error: '商品が見つかりません' };
    }

    // ランクチェック
    const currentRankOrder = RankOrder[state.currentRank];
    const requiredRankOrder = RankOrder[item.unlockRank];
    if (requiredRankOrder > currentRankOrder) {
      return { success: false, error: 'ランクが足りません' };
    }

    // ゴールドチェック
    if (state.gold < item.price) {
      return { success: false, error: 'ゴールドが不足しています' };
    }

    // 在庫チェック
    const currentStock = this.getStock(state, itemId);
    if (currentStock === 0) {
      return { success: false, error: '在庫がありません' };
    }

    // 新しい状態を作成
    const newStockMap = { ...state.stockMap };

    // 無限在庫でない場合は在庫を減らす
    if (currentStock > 0) {
      newStockMap[itemId] = currentStock - 1;
    }

    const newState: ShopState = {
      ...state,
      gold: state.gold - item.price,
      stockMap: newStockMap,
    };

    return {
      success: true,
      value: {
        purchasedItem: item,
        newState,
      },
    };
  }

  /**
   * 商品の価格を取得する
   * @param itemId 商品ID
   * @returns 価格（存在しない場合は0）
   */
  getItemPrice(itemId: string): number {
    const item = this.shopItems.get(itemId);
    return item?.price ?? 0;
  }

  /**
   * 商品の在庫を取得する
   * @param state ショップ状態
   * @param itemId 商品ID
   * @returns 在庫数（-1は無限在庫）
   */
  getStock(state: ShopState, itemId: string): number {
    const item = this.shopItems.get(itemId);
    if (!item) {
      return 0;
    }

    // 無限在庫の場合
    if (item.stock === -1) {
      return -1;
    }

    // 在庫マップに記録がある場合はそちらを使用
    if (itemId in state.stockMap) {
      return state.stockMap[itemId];
    }

    // デフォルト在庫を返す
    return item.stock;
  }

  /**
   * IDで商品情報を取得する
   * @param itemId 商品ID
   * @returns 商品情報（存在しない場合はundefined）
   */
  getShopItemById(itemId: string): ShopItem | undefined {
    return this.shopItems.get(itemId);
  }
}
