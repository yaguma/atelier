/**
 * ItemInventoryUI コンポーネント
 * TASK-0086: features/inventory/components作成
 *
 * 所持アイテム一覧を表示し、アイテム選択機能を提供するコンポーネント。
 * BaseComponentを継承し、統一されたライフサイクルに従う。
 */

import type { ItemInstance } from '@domain/entities/ItemInstance';
import { BaseComponent } from '@shared/components';
import { Colors, THEME } from '@shared/theme';
import Phaser from 'phaser';

// =============================================================================
// 定数
// =============================================================================

/** カード寸法 */
const CARD = {
  WIDTH: 80,
  HEIGHT: 100,
  SPACING: 16,
  MAX_DISPLAY: 8,
} as const;

/** テキストスタイル */
const TEXT_STYLES = {
  LABEL: { fontSize: `${THEME.sizes.medium}px`, color: '#ffffff' },
  ITEM_NAME: { fontSize: `${THEME.sizes.small}px`, color: '#ffffff' },
  ITEM_QUALITY: { fontSize: '10px', color: '#cccccc' },
  EMPTY_MESSAGE: { fontSize: `${THEME.sizes.small}px`, color: '#888888' },
} as const;

/** レイアウト */
const LAYOUT = {
  LABEL_Y: 0,
  ITEM_LIST_Y: 25,
  QUALITY_INDICATOR_HEIGHT: 3,
  QUALITY_INDICATOR_MARGIN: 5,
} as const;

// =============================================================================
// 型定義
// =============================================================================

/** ItemInventoryUIの設定 */
export interface ItemInventoryUIConfig {
  /** 表示するアイテムリスト */
  items: ItemInstance[];
  /** アイテム選択時のコールバック */
  onItemSelect: (item: ItemInstance) => void;
}

/** アイテムカード内部型 */
interface ItemCardEntry {
  item: ItemInstance;
  cardContainer: Phaser.GameObjects.Container;
  background: Phaser.GameObjects.Rectangle;
}

// =============================================================================
// コンポーネント
// =============================================================================

/**
 * アイテムインベントリUI
 *
 * 所持アイテム一覧をカード形式で表示し、選択機能を提供する。
 */
export class ItemInventoryUI extends BaseComponent {
  private readonly config: ItemInventoryUIConfig;
  private itemCards: ItemCardEntry[] = [];
  private selectedItem: ItemInstance | null = null;
  private created = false;

  constructor(scene: Phaser.Scene, x: number, y: number, config: ItemInventoryUIConfig) {
    super(scene, x, y);
    if (!config) {
      throw new Error('config is required');
    }
    this.config = config;
  }

  create(): void {
    if (this.created) {
      return;
    }
    this.created = true;

    this.createLabel();

    if (this.config.items.length === 0) {
      this.createEmptyMessage();
    } else {
      this.createItemCards();
    }
  }

  destroy(): void {
    this.destroyItemCards();
    this.selectedItem = null;
    this.container.destroy(true);
  }

  /** 選択中のアイテムを取得 */
  getSelectedItem(): ItemInstance | null {
    return this.selectedItem;
  }

  /** 選択をクリア */
  clearSelection(): void {
    this.selectedItem = null;
    this.updateCardStyles();
  }

  /** アイテムリストを更新 */
  updateItems(items: ItemInstance[]): void {
    this.config.items = items;
    this.destroyItemCards();

    if (items.length === 0) {
      this.createEmptyMessage();
    } else {
      this.createItemCards();
    }
  }

  // ===========================================================================
  // private
  // ===========================================================================

  private createLabel(): void {
    const label = this.scene.make.text({
      x: 0,
      y: LAYOUT.LABEL_Y,
      text: '所持アイテム:',
      style: TEXT_STYLES.LABEL,
      add: false,
    });
    this.container.add(label);
  }

  private createEmptyMessage(): void {
    const msg = this.scene.make.text({
      x: 0,
      y: LAYOUT.ITEM_LIST_Y,
      text: 'アイテムがありません',
      style: TEXT_STYLES.EMPTY_MESSAGE,
      add: false,
    });
    this.container.add(msg);
  }

  private createItemCards(): void {
    const items = this.config.items.slice(0, CARD.MAX_DISPLAY);

    items.forEach((item, index) => {
      const cardX = index * (CARD.WIDTH + CARD.SPACING);
      const entry = this.createItemCard(item, cardX, LAYOUT.ITEM_LIST_Y);
      this.itemCards.push(entry);
      this.container.add(entry.cardContainer);
    });
  }

  private createItemCard(item: ItemInstance, x: number, y: number): ItemCardEntry {
    const cardContainer = this.scene.make.container({ x, y, add: false });
    cardContainer.name = 'ItemInventoryUI.card';

    // カード背景
    const background = new Phaser.GameObjects.Rectangle(
      this.scene,
      0,
      0,
      CARD.WIDTH,
      CARD.HEIGHT,
      Colors.ui.button.normal,
    );
    background.setStrokeStyle(2, Colors.border.primary);
    background.setInteractive({ useHandCursor: true });
    background.on('pointerdown', () => this.onItemClick(item));
    background.on('pointerover', () => this.onItemHover(item, background));
    background.on('pointerout', () => this.onItemOut(item, background));
    cardContainer.add(background);

    // 品質インジケーター
    const qualityColor = THEME.qualityColors[item.quality] ?? Colors.text.muted;
    const indicator = new Phaser.GameObjects.Rectangle(
      this.scene,
      0,
      -CARD.HEIGHT / 2 + LAYOUT.QUALITY_INDICATOR_MARGIN,
      CARD.WIDTH - 10,
      LAYOUT.QUALITY_INDICATOR_HEIGHT,
      qualityColor,
    );
    cardContainer.add(indicator);

    // アイテム名
    const nameText = this.scene.make.text({
      x: 0,
      y: -15,
      text: item.name,
      style: TEXT_STYLES.ITEM_NAME,
      add: false,
    });
    nameText.setOrigin(0.5);
    nameText.setWordWrapWidth(CARD.WIDTH - 10);
    cardContainer.add(nameText);

    // 品質表示
    const qualityText = this.scene.make.text({
      x: 0,
      y: 10,
      text: `品質: ${item.quality}`,
      style: TEXT_STYLES.ITEM_QUALITY,
      add: false,
    });
    qualityText.setOrigin(0.5);
    cardContainer.add(qualityText);

    return { item, cardContainer, background };
  }

  private onItemClick(item: ItemInstance): void {
    this.selectedItem = item;
    this.updateCardStyles();
    this.config.onItemSelect(item);
  }

  private onItemHover(item: ItemInstance, background: Phaser.GameObjects.Rectangle): void {
    if (this.selectedItem?.instanceId === item.instanceId) {
      return;
    }
    background.setFillStyle(Colors.ui.button.hover);
  }

  private onItemOut(item: ItemInstance, background: Phaser.GameObjects.Rectangle): void {
    if (this.selectedItem?.instanceId === item.instanceId) {
      background.setFillStyle(Colors.ui.button.active);
    } else {
      background.setFillStyle(Colors.ui.button.normal);
    }
  }

  private updateCardStyles(): void {
    for (const entry of this.itemCards) {
      const isSelected = this.selectedItem?.instanceId === entry.item.instanceId;
      if (isSelected) {
        entry.background.setFillStyle(Colors.ui.button.active);
        entry.background.setStrokeStyle(3, Colors.border.gold);
      } else {
        entry.background.setFillStyle(Colors.ui.button.normal);
        entry.background.setStrokeStyle(2, Colors.border.primary);
      }
    }
  }

  private destroyItemCards(): void {
    for (const entry of this.itemCards) {
      entry.cardContainer.destroy();
    }
    this.itemCards = [];
  }
}
