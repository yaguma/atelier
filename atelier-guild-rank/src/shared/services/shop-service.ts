/**
 * shop-service.ts - ShopService実装
 *
 * TASK-0016: ShopService・ArtifactService実装
 *
 * @description
 * ショップ管理サービスの実装。
 * アイテム購入処理を提供する。
 *
 * @信頼性レベル 🔵
 * - 設計文書・要件定義書に基づいた実装
 */

import { MaterialInstance } from '@domain/entities/MaterialInstance';
import type { IDeckService } from '@domain/interfaces/deck-service.interface';
import type { IInventoryService } from '@domain/interfaces/inventory-service.interface';
import type { IMasterDataRepository } from '@domain/interfaces/master-data-repository.interface';
import type {
  IPurchaseResult,
  IShopItem,
  IShopService,
} from '@domain/interfaces/shop-service.interface';
import { GuildRank, Quality, RankOrder, toArtifactId, toCardId, toMaterialId } from '@shared/types';
import { generateUniqueId } from '@shared/utils';

// =============================================================================
// ランク比較ヘルパー
// =============================================================================

/**
 * ランクを比較
 * @param current - 現在のランク
 * @param required - 必要なランク
 * @returns 現在のランクが必要なランク以上の場合true
 */
function isRankSufficient(current: GuildRank, required: GuildRank): boolean {
  return RankOrder[current] >= RankOrder[required];
}

// =============================================================================
// ShopService実装
// =============================================================================

/**
 * 【機能概要】: ShopService実装クラス
 * 【実装方針】: ショップでの購入処理を提供
 * 🔵 信頼性レベル: 設計文書・要件定義書に明記
 */
export class ShopService implements IShopService {
  // ===========================================================================
  // フィールド
  // ===========================================================================

  /** デッキサービス */
  private readonly deckService: IDeckService;

  /** インベントリサービス */
  private readonly inventoryService: IInventoryService;

  /** マスターデータリポジトリ */
  private readonly masterDataRepository: IMasterDataRepository;

  /** ショップアイテム（在庫管理用にコピー） */
  private shopItems: Map<string, IShopItem>;

  /** ゴールド取得関数 */
  private readonly getGold: () => number;

  /** ゴールド消費関数 */
  private readonly spendGold: (amount: number) => void;

  /** 現在ランク取得関数 */
  private readonly getCurrentRank: () => GuildRank;

  // ===========================================================================
  // コンストラクタ
  // ===========================================================================

  /**
   * ShopServiceを初期化
   *
   * @param deckService - デッキサービス
   * @param inventoryService - インベントリサービス
   * @param masterDataRepository - マスターデータリポジトリ
   * @param shopItems - ショップアイテム一覧
   * @param getGold - ゴールド取得関数
   * @param spendGold - ゴールド消費関数
   * @param getCurrentRank - 現在ランク取得関数（オプション、デフォルトはランクG）
   */
  constructor(
    deckService: IDeckService,
    inventoryService: IInventoryService,
    masterDataRepository: IMasterDataRepository,
    shopItems: IShopItem[],
    getGold: () => number,
    spendGold: (amount: number) => void,
    getCurrentRank: () => GuildRank = () => GuildRank.G,
  ) {
    this.deckService = deckService;
    this.inventoryService = inventoryService;
    this.masterDataRepository = masterDataRepository;
    this.shopItems = new Map(shopItems.map((item) => [item.id, { ...item }]));
    this.getGold = getGold;
    this.spendGold = spendGold;
    this.getCurrentRank = getCurrentRank;
  }

  // ===========================================================================
  // ショップアイテム取得
  // ===========================================================================

  /**
   * 【機能概要】: 購入可能なアイテム一覧取得
   * 【実装方針】: ランクで解放されたアイテムかつ在庫ありのアイテムを返す
   * 🔵 信頼性レベル: 設計文書に明記
   */
  getAvailableItems(currentRank: GuildRank): IShopItem[] {
    const items: IShopItem[] = [];

    for (const item of this.shopItems.values()) {
      // 在庫チェック（0は売り切れ、-1は無制限）
      if (item.stock === 0) {
        continue;
      }

      // ランクチェック
      if (!isRankSufficient(currentRank, item.unlockRank)) {
        continue;
      }

      items.push({ ...item });
    }

    return items;
  }

  /**
   * 【機能概要】: 全ショップアイテム取得
   * 【実装方針】: 解放条件に関係なく全アイテムを返す
   * 🟡 信頼性レベル: 設計文書から妥当な推測
   */
  getAllItems(): IShopItem[] {
    return Array.from(this.shopItems.values()).map((item) => ({ ...item }));
  }

  // ===========================================================================
  // 購入処理
  // ===========================================================================

  /**
   * 【機能概要】: 購入可能判定
   * 【実装方針】: ゴールド、在庫、ランク条件をチェック
   * 🔵 信頼性レベル: 設計文書に明記
   */
  canPurchase(itemId: string, currentGold: number, currentRank: GuildRank): boolean {
    const item = this.shopItems.get(itemId);
    if (!item) {
      return false;
    }

    // 在庫チェック
    if (item.stock === 0) {
      return false;
    }

    // ゴールドチェック
    if (currentGold < item.price) {
      return false;
    }

    // ランクチェック
    if (!isRankSufficient(currentRank, item.unlockRank)) {
      return false;
    }

    return true;
  }

  /**
   * 【機能概要】: 購入処理
   * 【実装方針】: ゴールド消費、アイテム追加、在庫減少
   * 【エラー】: ゴールド不足、在庫切れ、ランク不足
   * 🔵 信頼性レベル: 設計文書に明記
   */
  purchase(itemId: string): IPurchaseResult {
    const item = this.shopItems.get(itemId);
    if (!item) {
      return {
        success: false,
        itemId,
        remainingGold: this.getGold(),
        remainingStock: 0,
        errorMessage: 'アイテムが見つかりません',
      };
    }

    const currentGold = this.getGold();
    const currentRank = this.getCurrentRank();

    // 在庫チェック
    if (item.stock === 0) {
      return {
        success: false,
        itemId,
        remainingGold: currentGold,
        remainingStock: 0,
        errorMessage: '在庫がありません',
      };
    }

    // ゴールドチェック
    if (currentGold < item.price) {
      return {
        success: false,
        itemId,
        remainingGold: currentGold,
        remainingStock: item.stock,
        errorMessage: 'ゴールドが不足しています',
      };
    }

    // ランクチェック
    if (!isRankSufficient(currentRank, item.unlockRank)) {
      return {
        success: false,
        itemId,
        remainingGold: currentGold,
        remainingStock: item.stock,
        errorMessage: `ランク${item.unlockRank}以上が必要です`,
      };
    }

    // ゴールド消費
    this.spendGold(item.price);

    // アイテム種別に応じた処理
    switch (item.type) {
      case 'card':
        this.deckService.addCard(toCardId(item.itemId));
        break;
      case 'material':
        this.addMaterialToInventory(item.itemId);
        break;
      case 'artifact':
        this.inventoryService.addArtifact(toArtifactId(item.itemId));
        break;
    }

    // 在庫を減らす（無制限でない場合）
    if (item.stock > 0) {
      item.stock -= 1;
    }

    return {
      success: true,
      itemId,
      remainingGold: this.getGold(),
      remainingStock: item.stock,
    };
  }

  // ===========================================================================
  // 価格・情報取得
  // ===========================================================================

  /**
   * 【機能概要】: 価格取得
   * 【実装方針】: アイテムIDから価格を取得
   * 🔵 信頼性レベル: 設計文書に明記
   */
  getItemPrice(itemId: string): number {
    const item = this.shopItems.get(itemId);
    return item?.price ?? 0;
  }

  /**
   * 【機能概要】: ショップアイテム情報取得
   * 【実装方針】: アイテムIDからショップアイテム情報を取得
   * 🟡 信頼性レベル: 設計文書から妥当な推測
   */
  getShopItem(itemId: string): IShopItem | null {
    const item = this.shopItems.get(itemId);
    return item ? { ...item } : null;
  }

  /**
   * 【機能概要】: 在庫取得
   * 【実装方針】: アイテムIDから現在の在庫数を取得
   * 🟡 信頼性レベル: 設計文書から妥当な推測
   */
  getStock(itemId: string): number {
    const item = this.shopItems.get(itemId);
    return item?.stock ?? 0;
  }

  // ===========================================================================
  // プライベートメソッド
  // ===========================================================================

  /**
   * 素材をインベントリに追加
   *
   * @param materialId - 素材ID
   */
  private addMaterialToInventory(materialId: string): void {
    // マスターデータを取得
    const master = this.masterDataRepository.getMaterialById(toMaterialId(materialId));
    if (!master) {
      throw new Error(`素材マスター「${materialId}」が見つかりません`);
    }

    // 購入した素材はデフォルト品質Cで追加
    const instanceId = generateUniqueId('material');
    const material = new MaterialInstance(instanceId, master, Quality.C);
    this.inventoryService.addMaterial(material);
  }
}
