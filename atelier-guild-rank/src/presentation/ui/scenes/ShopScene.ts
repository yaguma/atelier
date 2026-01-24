/**
 * ShopSceneコンポーネント
 * TASK-0026 ショップ画面実装
 * TASK-0056 ShopSceneリファクタリング
 *
 * @description
 * ショップ画面全体のUI管理を担当するコンポーネント。
 * ShopHeader, ShopItemGrid, ShopItemCardコンポーネントを使用。
 */

import { BaseComponent } from '@presentation/ui/components/BaseComponent';
import type Phaser from 'phaser';
import { ShopHeader, ShopItemGrid } from './components/shop';
import type { IShopItem } from './components/shop/types';

// =============================================================================
// 定数定義
// =============================================================================

/** UI配置定数 */
const UI_LAYOUT = {
  COMPONENT_X: 160,
  COMPONENT_Y: 80,
  HEADER_X: 0,
  HEADER_Y: 0,
  ITEM_GRID_X: 50,
  ITEM_GRID_Y: 80,
  DETAIL_PANEL_X: 50,
  DETAIL_PANEL_Y: 450,
} as const;

/** UIスタイル・テキスト定数 */
const UI = {
  DETAIL_STYLE: { fontSize: '14px', color: '#cccccc' },
  TEXT_SELECT_ITEM: 'アイテムを選択してください',
  TEXT_PURCHASE_SUCCESS: '購入しました！',
} as const;

/** GameEventType定義 */
const GameEventType = {
  SHOP_OPENED: 'SHOP_OPENED',
  SHOP_CLOSED: 'SHOP_CLOSED',
  ITEM_PURCHASED: 'ITEM_PURCHASED',
  GOLD_CHANGED: 'GOLD_CHANGED',
} as const;

// =============================================================================
// 型定義
// =============================================================================

interface IEventBus {
  emit(event: string, payload?: unknown): void;
  on(event: string, callback: (payload?: unknown) => void): void;
  off(event: string, callback: (payload?: unknown) => void): void;
}

interface IShopService {
  getItems(): IShopItem[];
  purchaseItem(itemId: string, playerId: string): PurchaseResult;
  canPurchase(itemId: string, playerId: string): boolean;
}

interface IInventoryService {
  getGold(): number;
  removeGold(amount: number): boolean;
}

interface PurchaseResult {
  success: boolean;
  item?: IShopItem;
  errorMessage?: string;
}

// =============================================================================
// ShopSceneコンポーネント
// =============================================================================

/**
 * ShopSceneコンポーネント
 * ShopHeader, ShopItemGridを使用してショップ画面を構成
 */
export class ShopScene extends BaseComponent {
  private eventBus: IEventBus | null = null;
  private shopService: IShopService | null = null;
  private inventoryService: IInventoryService | null = null;
  private shopHeader: ShopHeader | null = null;
  private shopItemGrid: ShopItemGrid | null = null;
  private detailPanel: Phaser.GameObjects.Container | null = null;
  private detailText: Phaser.GameObjects.Text | null = null;
  private goldChangedHandler: ((payload?: unknown) => void) | null = null;

  constructor(scene: Phaser.Scene) {
    super(scene, UI_LAYOUT.COMPONENT_X, UI_LAYOUT.COMPONENT_Y);
    this.initializeServices();
    this.create();
  }

  private initializeServices(): void {
    this.eventBus = this.scene.data.get('eventBus');
    this.shopService = this.scene.data.get('shopService');
    this.inventoryService = this.scene.data.get('inventoryService');
  }

  public create(): void {
    this.createHeader();
    this.createItemGrid();
    this.createDetailPanel();
    this.subscribeToEvents();
    this.emitEvent(GameEventType.SHOP_OPENED, {});
  }

  private createHeader(): void {
    this.shopHeader = new ShopHeader(this.scene, UI_LAYOUT.HEADER_X, UI_LAYOUT.HEADER_Y, {
      onBackClick: () => this.onClose(),
    });
    this.shopHeader.create();
    this.shopHeader.setGold(this.inventoryService?.getGold() ?? 0);
    this.container.add(this.shopHeader.getContainer());
  }

  private createItemGrid(): void {
    const items = this.shopService?.getItems() ?? [];
    this.shopItemGrid = new ShopItemGrid(this.scene, UI_LAYOUT.ITEM_GRID_X, UI_LAYOUT.ITEM_GRID_Y, {
      items,
      onItemSelect: (item) => this.onItemSelect(item),
      onPurchase: (itemId) => this.onPurchase(itemId),
      currentGold: this.inventoryService?.getGold() ?? 0,
    });
    this.shopItemGrid.create();
    this.container.add(this.shopItemGrid.getContainer());
  }

  private createDetailPanel(): void {
    this.detailPanel = this.scene.add.container(UI_LAYOUT.DETAIL_PANEL_X, UI_LAYOUT.DETAIL_PANEL_Y);
    const panelBg = this.scene.add.rectangle(0, 0, 500, 100, 0x333333, 0.9);
    panelBg.setStrokeStyle(2, 0x666666);
    this.detailPanel.add(panelBg);
    this.detailText = this.scene.add.text(-240, -40, UI.TEXT_SELECT_ITEM, UI.DETAIL_STYLE);
    this.detailPanel.add(this.detailText);
    this.container.add(this.detailPanel);
  }

  private onItemSelect(item: IShopItem): void {
    this.updateDetailPanel(item);
  }

  private updateDetailPanel(item: IShopItem): void {
    if (!this.detailText) return;
    const typeLabel =
      item.type === 'card' ? 'カード' : item.type === 'material' ? '素材' : 'アーティファクト';
    const stockDisplay = item.stock === -1 ? '無制限' : item.stock.toString();
    const detailInfo = [
      `名前: ${item.name}`,
      `タイプ: ${typeLabel}`,
      `価格: ${item.price}G`,
      `在庫: ${stockDisplay}`,
      item.description ? `説明: ${item.description}` : '',
    ]
      .filter((line) => line !== '')
      .join('\n');
    this.detailText.setText(detailInfo);
  }

  private onPurchase(itemId: string): void {
    if (!this.shopService || !this.inventoryService) return;
    const items = this.shopService.getItems();
    const item = items.find((i) => i.id === itemId);
    if (!item || !this.shopService.canPurchase(itemId, 'player')) return;

    const result = this.shopService.purchaseItem(itemId, 'player');
    if (result.success) {
      this.inventoryService.removeGold(item.price);
      this.updateGoldDisplay();
      if (this.detailText) this.detailText.setText(UI.TEXT_PURCHASE_SUCCESS);
      this.emitEvent(GameEventType.ITEM_PURCHASED, { itemId: item.id, price: item.price });
      this.refreshItemGrid();
    } else if (this.detailText && result.errorMessage) {
      this.detailText.setText(result.errorMessage);
    }
  }

  private updateGoldDisplay(): void {
    const gold = this.inventoryService?.getGold() ?? 0;
    this.shopHeader?.updateGold(gold);
    this.shopItemGrid?.updateGold(gold);
  }

  private refreshItemGrid(): void {
    if (!this.shopService || !this.shopItemGrid) return;
    this.shopItemGrid.updateItems(this.shopService.getItems());
  }

  private onClose(): void {
    this.emitEvent(GameEventType.SHOP_CLOSED, {});
    this.setVisible(false);
  }

  private subscribeToEvents(): void {
    if (this.eventBus) {
      this.goldChangedHandler = () => this.updateGoldDisplay();
      this.eventBus.on(GameEventType.GOLD_CHANGED, this.goldChangedHandler);
    }
  }

  private unsubscribeFromEvents(): void {
    if (this.eventBus && this.goldChangedHandler) {
      this.eventBus.off(GameEventType.GOLD_CHANGED, this.goldChangedHandler);
      this.goldChangedHandler = null;
    }
  }

  private emitEvent(eventType: string, payload: unknown): void {
    if (!this.eventBus) return;
    try {
      this.eventBus.emit(eventType, payload);
    } catch (error) {
      console.error('Failed to emit event:', eventType, error);
    }
  }

  public destroy(): void {
    this.unsubscribeFromEvents();
    if (this.shopHeader) {
      this.shopHeader.destroy();
      this.shopHeader = null;
    }
    if (this.shopItemGrid) {
      this.shopItemGrid.destroy();
      this.shopItemGrid = null;
    }
    if (this.detailPanel) {
      this.detailPanel.destroy();
      this.detailPanel = null;
    }
    this.container.destroy();
  }
}
