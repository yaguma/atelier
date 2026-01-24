/**
 * ShopItemGridコンポーネント
 * TASK-0056 ShopSceneリファクタリング
 *
 * @description
 * 商品カードをグリッド配置で表示するコンポーネント
 * - 3列グリッドレイアウト
 * - ShopItemCardの管理
 * - アイテム選択イベントの伝播
 */

import { BaseComponent } from '@presentation/ui/components/BaseComponent';
import type Phaser from 'phaser';
import { ShopItemCard } from './ShopItemCard';
import type {
  IShopItem,
  OnItemSelectCallback,
  OnPurchaseCallback,
  ShopItemGridConfig,
} from './types';

/** グリッドレイアウト定数 */
const GRID_LAYOUT = {
  /** 列数 */
  COLS: 3,
  /** カード幅 */
  CARD_WIDTH: 200,
  /** カード高さ */
  CARD_HEIGHT: 180,
  /** カード間の水平マージン */
  MARGIN_X: 20,
  /** カード間の垂直マージン */
  MARGIN_Y: 20,
} as const;

/**
 * ShopItemGridコンポーネント
 * 商品カードのグリッド表示を担当
 */
export class ShopItemGrid extends BaseComponent {
  /** アイテムリスト */
  private items: IShopItem[];

  /** アイテム選択コールバック */
  private onItemSelect: OnItemSelectCallback;

  /** 購入コールバック */
  private onPurchase?: OnPurchaseCallback;

  /** 現在の所持金 */
  private currentGold: number;

  /** ShopItemCardインスタンスのリスト */
  private itemCards: ShopItemCard[] = [];

  /**
   * コンストラクタ
   * @param scene Phaserシーン
   * @param x X座標
   * @param y Y座標
   * @param config 設定
   * @throws {Error} itemsがnullまたはundefinedの場合
   */
  constructor(scene: Phaser.Scene, x: number, y: number, config: ShopItemGridConfig) {
    super(scene, x, y);

    if (!config.items) {
      throw new Error('ShopItemGrid: items is required');
    }

    this.items = config.items;
    this.onItemSelect = config.onItemSelect;
    this.onPurchase = config.onPurchase;
    this.currentGold = config.currentGold ?? 0;
  }

  /**
   * コンポーネントを作成
   */
  create(): void {
    this.createItemCards();
  }

  /**
   * アイテムカードを作成
   */
  private createItemCards(): void {
    // 既存のカードをクリア
    this.clearItemCards();

    // 各アイテムに対してカードを作成
    this.items.forEach((item, index) => {
      const col = index % GRID_LAYOUT.COLS;
      const row = Math.floor(index / GRID_LAYOUT.COLS);

      const cardX = col * (GRID_LAYOUT.CARD_WIDTH + GRID_LAYOUT.MARGIN_X);
      const cardY = row * (GRID_LAYOUT.CARD_HEIGHT + GRID_LAYOUT.MARGIN_Y);

      const card = new ShopItemCard(this.scene, {
        item,
        x: cardX,
        y: cardY,
        currentGold: this.currentGold,
        onPurchase: (itemId: string) => {
          if (this.onPurchase) {
            this.onPurchase(itemId);
          }
        },
      });

      card.create();
      this.container.add(card.getContainer());
      this.itemCards.push(card);
    });
  }

  /**
   * アイテムカードをクリア
   */
  private clearItemCards(): void {
    for (const card of this.itemCards) {
      card.destroy();
    }
    this.itemCards = [];
  }

  /**
   * アイテム数を取得
   * @returns アイテム数
   */
  getItemCount(): number {
    return this.items.length;
  }

  /**
   * 行数を取得
   * @returns 行数
   */
  getRowCount(): number {
    return Math.ceil(this.items.length / GRID_LAYOUT.COLS);
  }

  /**
   * アイテムカードのリストを取得
   * @returns ShopItemCardの配列
   */
  getItemCards(): ShopItemCard[] {
    return this.itemCards;
  }

  /**
   * アイテムを選択
   * @param itemId 選択するアイテムのID
   */
  selectItem(itemId: string): void {
    const item = this.items.find((i) => i.id === itemId);
    if (item) {
      this.onItemSelect(item);
    }
  }

  /**
   * 購入イベントを処理
   * @param itemId 購入するアイテムのID
   */
  handleItemPurchase(itemId: string): void {
    if (this.onPurchase) {
      this.onPurchase(itemId);
    }
  }

  /**
   * アイテムリストを更新
   * @param newItems 新しいアイテムリスト
   */
  updateItems(newItems: IShopItem[]): void {
    this.items = newItems;
    this.createItemCards();
  }

  /**
   * 所持金を更新
   * @param gold 新しい所持金
   */
  updateGold(gold: number): void {
    this.currentGold = gold;
    // カードを再作成して状態を更新
    this.createItemCards();
  }

  /**
   * コンポーネントを破棄
   */
  destroy(): void {
    this.clearItemCards();
    this.container.destroy();
  }
}
