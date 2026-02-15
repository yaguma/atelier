/**
 * ItemInventoryUIコンポーネント
 * TASK-0025 納品フェーズUI - アイテムインベントリ
 *
 * @description
 * 所持アイテム一覧を表示し、アイテム選択機能を提供するコンポーネント。
 * 納品フェーズで使用するアイテムを選択する。
 */

import type Phaser from 'phaser';

// =============================================================================
// 定数定義
// =============================================================================

/** UI配置定数 */
const UI_LAYOUT = {
  /** ラベルY座標 */
  LABEL_Y: 0,
  /** アイテムリストY座標 */
  ITEM_LIST_Y: 25,
  /** アイテムカード幅 */
  ITEM_CARD_WIDTH: 80,
  /** アイテムカード高さ */
  ITEM_CARD_HEIGHT: 100,
  /** アイテムカード間隔 */
  ITEM_CARD_SPACING: 16,
  /** 最大表示数 */
  MAX_DISPLAY_COUNT: 8,
} as const;

/** スタイル定数 */
const UI_STYLES = {
  LABEL: {
    fontSize: '16px',
    color: '#ffffff',
  },
  ITEM_NAME: {
    fontSize: '12px',
    color: '#ffffff',
  },
  ITEM_QUALITY: {
    fontSize: '10px',
    color: '#cccccc',
  },
} as const;

/** 色定数 */
const ITEM_COLORS = {
  /** 通常状態の枠線色 */
  BORDER_NORMAL: 0xe0e0e0,
  /** 選択状態の枠線色 */
  BORDER_SELECTED: 0x2196f3,
  /** ホバー状態の背景色 */
  HOVER_BACKGROUND: 0xf5f5f5,
  /** 通常状態の背景色 */
  NORMAL_BACKGROUND: 0xffffff,
  /** 選択状態の背景色 */
  SELECTED_BACKGROUND: 0xe3f2fd,
} as const;

/** 品質色定数 */
const QUALITY_COLORS = {
  C: 0x9e9e9e,
  B: 0x4caf50,
  A: 0x2196f3,
  S: 0xffd700,
} as const;

/**
 * 品質タイプ
 */
type Quality = 'C' | 'B' | 'A' | 'S';

/**
 * ItemInstanceインターフェース
 */
interface ItemInstance {
  instanceId: string;
  itemId: string;
  name: string;
  quality: Quality;
  attributes: { name: string; value: number }[];
}

/**
 * ItemCardUIインターフェース
 */
interface ItemCardUI {
  item: ItemInstance;
  container: Phaser.GameObjects.Container;
  background: Phaser.GameObjects.Rectangle;
  destroy(): void;
}

/**
 * ItemInventoryUIOptionsインターフェース
 */
interface ItemInventoryUIOptions {
  x: number;
  y: number;
  items: ItemInstance[];
  onItemSelect: (item: ItemInstance) => void;
}

/**
 * ItemInventoryUIコンポーネント
 *
 * 所持アイテム一覧を表示し、アイテム選択機能を提供する。
 */
export class ItemInventoryUI {
  private scene: Phaser.Scene;
  private options: ItemInventoryUIOptions;
  private container: Phaser.GameObjects.Container | null = null;
  private labelText: Phaser.GameObjects.Text | null = null;
  private itemCards: ItemCardUI[] = [];
  private selectedItem: ItemInstance | null = null;

  /**
   * コンストラクタ
   * @param scene - Phaserシーンインスタンス
   * @param options - インベントリオプション
   */
  constructor(scene: Phaser.Scene, options: ItemInventoryUIOptions) {
    this.scene = scene;
    this.options = options;
  }

  /**
   * インベントリを作成
   */
  public create(): void {
    this.container = this.scene.add.container(this.options.x, this.options.y);

    // ラベルを作成
    this.createLabel();

    // アイテムカードを作成
    this.createItemCards();
  }

  /**
   * ラベルを作成
   */
  private createLabel(): void {
    this.labelText = this.scene.add.text(0, UI_LAYOUT.LABEL_Y, '所持アイテム:', UI_STYLES.LABEL);
    this.container?.add(this.labelText);
  }

  /**
   * アイテムカードを作成
   */
  private createItemCards(): void {
    this.destroyItemCards();

    const items = this.options.items.slice(0, UI_LAYOUT.MAX_DISPLAY_COUNT);

    items.forEach((item, index) => {
      const cardX = index * (UI_LAYOUT.ITEM_CARD_WIDTH + UI_LAYOUT.ITEM_CARD_SPACING);
      const cardY = UI_LAYOUT.ITEM_LIST_Y;

      const card = this.createItemCard(item, cardX, cardY);
      this.itemCards.push(card);
      this.container?.add(card.container);
    });
  }

  /**
   * アイテムカードを作成
   * @param item - アイテムインスタンス
   * @param x - X座標
   * @param y - Y座標
   * @returns アイテムカード
   */
  private createItemCard(item: ItemInstance, x: number, y: number): ItemCardUI {
    const cardContainer = this.scene.add.container(x, y);

    // カード背景
    const background = this.scene.add.rectangle(
      0,
      0,
      UI_LAYOUT.ITEM_CARD_WIDTH,
      UI_LAYOUT.ITEM_CARD_HEIGHT,
      ITEM_COLORS.NORMAL_BACKGROUND,
      1,
    );
    background.setStrokeStyle(2, ITEM_COLORS.BORDER_NORMAL);
    background.setInteractive({ useHandCursor: true });
    background.on('pointerdown', () => this.onItemClick(item));
    background.on('pointerover', () => this.onItemHover(background));
    background.on('pointerout', () => this.onItemOut(background, item));
    cardContainer.add(background);

    // 品質インジケーター
    const qualityColor = QUALITY_COLORS[item.quality];
    const qualityIndicator = this.scene.add.rectangle(
      0,
      -UI_LAYOUT.ITEM_CARD_HEIGHT / 2 + 5,
      UI_LAYOUT.ITEM_CARD_WIDTH - 10,
      3,
      qualityColor,
    );
    cardContainer.add(qualityIndicator);

    // アイテム名
    const nameText = this.scene.add.text(0, -15, item.name, UI_STYLES.ITEM_NAME);
    nameText.setOrigin(0.5);
    nameText.setWordWrapWidth(UI_LAYOUT.ITEM_CARD_WIDTH - 10);
    cardContainer.add(nameText);

    // 品質表示
    const qualityText = this.scene.add.text(0, 10, `品質: ${item.quality}`, UI_STYLES.ITEM_QUALITY);
    qualityText.setOrigin(0.5);
    cardContainer.add(qualityText);

    return {
      item,
      container: cardContainer,
      background,
      destroy: () => cardContainer.destroy(),
    };
  }

  /**
   * アイテムクリック時の処理
   * @param item - クリックされたアイテム
   */
  private onItemClick(item: ItemInstance): void {
    // 選択状態を更新
    this.selectedItem = item;
    this.updateItemCardStyles();

    // コールバックを実行
    this.options.onItemSelect(item);
  }

  /**
   * アイテムホバー時の処理
   * @param background - カード背景
   */
  private onItemHover(background: Phaser.GameObjects.Rectangle): void {
    if (this.isItemSelected(background)) {
      return;
    }

    background.setFillStyle(ITEM_COLORS.HOVER_BACKGROUND, 1);
  }

  /**
   * アイテムホバー解除時の処理
   * @param background - カード背景
   * @param item - アイテムインスタンス
   */
  private onItemOut(background: Phaser.GameObjects.Rectangle, item: ItemInstance): void {
    if (this.selectedItem?.instanceId === item.instanceId) {
      background.setFillStyle(ITEM_COLORS.SELECTED_BACKGROUND, 1);
    } else {
      background.setFillStyle(ITEM_COLORS.NORMAL_BACKGROUND, 1);
    }
  }

  /**
   * アイテムカードスタイルを更新
   */
  private updateItemCardStyles(): void {
    for (const card of this.itemCards) {
      const isSelected = this.selectedItem?.instanceId === card.item.instanceId;

      if (isSelected) {
        card.background.setFillStyle(ITEM_COLORS.SELECTED_BACKGROUND, 1);
        card.background.setStrokeStyle(3, ITEM_COLORS.BORDER_SELECTED);
      } else {
        card.background.setFillStyle(ITEM_COLORS.NORMAL_BACKGROUND, 1);
        card.background.setStrokeStyle(2, ITEM_COLORS.BORDER_NORMAL);
      }
    }
  }

  /**
   * アイテムが選択状態か判定
   * @param background - カード背景
   * @returns 選択状態の場合true
   */
  private isItemSelected(background: Phaser.GameObjects.Rectangle): boolean {
    if (!this.selectedItem) {
      return false;
    }

    const selectedCard = this.itemCards.find(
      (card) => card.item.instanceId === this.selectedItem?.instanceId,
    );

    return selectedCard?.background === background;
  }

  /**
   * 選択中のアイテムを取得
   * @returns 選択中のアイテム
   */
  public getSelectedItem(): ItemInstance | null {
    return this.selectedItem;
  }

  /**
   * 選択をクリア
   */
  public clearSelection(): void {
    this.selectedItem = null;
    this.updateItemCardStyles();
  }

  /**
   * アイテムリストを更新
   * @param items - 新しいアイテムリスト
   */
  public updateItems(items: ItemInstance[]): void {
    this.options.items = items;
    this.createItemCards();
  }

  /**
   * アイテムカードを全て破棄
   */
  private destroyItemCards(): void {
    for (const card of this.itemCards) {
      card.destroy();
    }
    this.itemCards = [];
  }

  /**
   * リソースを解放
   */
  public destroy(): void {
    this.destroyItemCards();

    if (this.container) {
      this.container.destroy();
      this.container = null;
    }

    this.labelText = null;
    this.selectedItem = null;
  }
}
