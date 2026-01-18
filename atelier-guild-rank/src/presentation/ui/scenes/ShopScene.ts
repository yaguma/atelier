/**
 * ShopSceneコンポーネント
 * TASK-0026 ショップ画面実装
 *
 * @description
 * ショップ画面全体のUI管理を担当するコンポーネント。
 * カード購入、アーティファクト購入、アイテム売却機能を提供する。
 */

import type Phaser from 'phaser';

// =============================================================================
// 定数定義
// =============================================================================

/** UI配置定数 */
const UI_LAYOUT = {
  /** コンポーネント初期X座標 */
  COMPONENT_X: 160,
  /** コンポーネント初期Y座標 */
  COMPONENT_Y: 80,
  /** カテゴリサイドバーX座標 */
  CATEGORY_X: -100,
  /** カテゴリサイドバーY座標 */
  CATEGORY_Y: 60,
  /** 商品グリッドX座標 */
  ITEM_GRID_X: 50,
  /** 商品グリッドY座標 */
  ITEM_GRID_Y: 60,
  /** 詳細パネルX座標 */
  DETAIL_PANEL_X: 50,
  /** 詳細パネルY座標 */
  DETAIL_PANEL_Y: 300,
  /** 所持金表示X座標 */
  GOLD_DISPLAY_X: 400,
  /** 所持金表示Y座標 */
  GOLD_DISPLAY_Y: 0,
  /** タイトルX座標 */
  TITLE_X: 0,
  /** タイトルY座標 */
  TITLE_Y: 0,
} as const;

/** 商品グリッド関連定数 */
const ITEM_GRID = {
  /** 商品カード幅 */
  CARD_WIDTH: 100,
  /** 商品カード高さ */
  CARD_HEIGHT: 120,
  /** 商品カード間隔X */
  CARD_SPACING_X: 10,
  /** 商品カード間隔Y */
  CARD_SPACING_Y: 10,
  /** 1行あたりの表示数 */
  ITEMS_PER_ROW: 4,
} as const;

/** エラーメッセージ定数 */
const ERROR_MESSAGES = {
  EVENT_BUS_NOT_AVAILABLE: 'EventBus is not available in scene.data',
  SHOP_SERVICE_NOT_AVAILABLE: 'ShopService is not available',
  INVENTORY_SERVICE_NOT_AVAILABLE: 'InventoryService is not available',
  FAILED_TO_EMIT_EVENT: 'Failed to emit event:',
  INSUFFICIENT_GOLD: 'ゴールドが足りません',
  DECK_FULL: 'デッキが満杯です',
  INVENTORY_FULL: '所持品が満杯です',
} as const;

/** UIテキスト定数 */
const UI_TEXT = {
  PHASE_TITLE: '🏪 ショップ',
  CATEGORY_CARDS: 'カード',
  CATEGORY_MATERIALS: '素材',
  CATEGORY_ENHANCEMENTS: '強化カード',
  CATEGORY_ARTIFACTS: 'アーティファクト',
  GOLD_FORMAT: '💰 所持金: {gold}G',
  PURCHASE_BUTTON: '購入する',
  SELL_BUTTON: '売却する',
  CLOSE_BUTTON: '閉じる',
  SELECT_ITEM: 'アイテムを選択してください',
  PURCHASE_SUCCESS: '購入しました！',
  SELL_SUCCESS: '売却しました！',
} as const;

/** スタイル定数 */
const UI_STYLES = {
  TITLE: {
    fontSize: '24px',
    color: '#ffffff',
  },
  CATEGORY_BUTTON: {
    fontSize: '16px',
    color: '#ffffff',
  },
  CATEGORY_BUTTON_SELECTED: {
    fontSize: '16px',
    color: '#ffd700',
  },
  ITEM_NAME: {
    fontSize: '14px',
    color: '#ffffff',
  },
  ITEM_PRICE: {
    fontSize: '12px',
    color: '#ffcc00',
  },
  GOLD_DISPLAY: {
    fontSize: '18px',
    color: '#ffd700',
  },
  DETAIL_TEXT: {
    fontSize: '14px',
    color: '#cccccc',
  },
} as const;

/** キーボードショートカット定数 */
const KEYBOARD_KEYS = {
  /** カテゴリ切替キー */
  CATEGORY_1: '1',
  CATEGORY_2: '2',
  CATEGORY_3: '3',
  CATEGORY_4: '4',
  /** 購入/売却キー */
  PURCHASE: 'Enter',
  /** 閉じるキー */
  CLOSE: 'Escape',
} as const;

/** ショップカテゴリ定義 */
const ShopCategory = {
  CARDS: 'cards',
  MATERIALS: 'materials',
  ENHANCEMENTS: 'enhancements',
  ARTIFACTS: 'artifacts',
} as const;

type ShopCategoryType = (typeof ShopCategory)[keyof typeof ShopCategory];

/**
 * EventBusインターフェース
 */
interface IEventBus {
  emit(event: string, payload?: unknown): void;
  on(event: string, callback: (payload?: unknown) => void): void;
  off(event: string, callback: (payload?: unknown) => void): void;
  once(event: string, callback: (payload?: unknown) => void): void;
}

/**
 * ShopItemインターフェース
 */
interface ShopItem {
  id: string;
  name: string;
  category: ShopCategoryType;
  price: number;
  description: string;
  icon?: string;
  rankRequired?: string;
  isAvailable: boolean;
}

/**
 * IShopServiceインターフェース
 */
interface IShopService {
  getItemsByCategory(category: ShopCategoryType): ShopItem[];
  purchaseItem(itemId: string, playerId: string): PurchaseResult;
  sellItem(itemId: string, playerId: string): SellResult;
  canPurchase(itemId: string, playerId: string): boolean;
  canSell(itemId: string, playerId: string): boolean;
}

/**
 * IInventoryServiceインターフェース
 */
interface IInventoryService {
  getGold(): number;
  addGold(amount: number): void;
  removeGold(amount: number): boolean;
  getItems(): unknown[];
  addItem(item: unknown): void;
  removeItem(itemId: string): void;
}

/**
 * PurchaseResultインターフェース
 */
interface PurchaseResult {
  success: boolean;
  item?: ShopItem;
  errorMessage?: string;
}

/**
 * SellResultインターフェース
 */
interface SellResult {
  success: boolean;
  soldPrice?: number;
  errorMessage?: string;
}

/**
 * ItemCardUIインターフェース
 */
interface ItemCardUI {
  item: ShopItem;
  container: Phaser.GameObjects.Container;
  destroy(): void;
}

/**
 * Buttonインターフェース
 */
interface Button {
  isEnabled(): boolean;
  setEnabled(enabled: boolean): void;
  destroy(): void;
}

/**
 * GameEventType定義
 */
const GameEventType = {
  SHOP_OPENED: 'SHOP_OPENED',
  SHOP_CLOSED: 'SHOP_CLOSED',
  CATEGORY_CHANGED: 'CATEGORY_CHANGED',
  ITEM_SELECTED: 'ITEM_SELECTED',
  ITEM_PURCHASED: 'ITEM_PURCHASED',
  ITEM_SOLD: 'ITEM_SOLD',
  GOLD_CHANGED: 'GOLD_CHANGED',
} as const;

/**
 * BaseComponentクラス（簡易実装）
 * UIコンポーネントの基底クラス
 */
export abstract class BaseComponent {
  protected scene: Phaser.Scene;
  protected container: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.container = scene.add.container(x, y);
  }

  public abstract create(): void;
  public abstract destroy(): void;

  public getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }

  public setVisible(visible: boolean): this {
    this.container.setVisible(visible);
    return this;
  }

  public setPosition(x: number, y: number): this {
    this.container.setPosition(x, y);
    return this;
  }
}

/**
 * ShopSceneコンポーネント
 *
 * ショップ画面のUIを管理するコンポーネント。
 * カード・素材・強化カード・アーティファクトの購入と売却を行う。
 */
export class ShopScene extends BaseComponent {
  /** EventBus参照 */
  private eventBus: IEventBus | null = null;

  /** ShopService参照 */
  private shopService: IShopService | null = null;

  /** InventoryService参照 */
  private inventoryService: IInventoryService | null = null;

  /** 現在のカテゴリ */
  private currentCategory: ShopCategoryType = ShopCategory.CARDS;

  /** 商品カードリスト */
  private itemCards: ItemCardUI[] = [];

  /** 所持金表示テキスト */
  private goldDisplay: Phaser.GameObjects.Text | null = null;

  /** 詳細パネル */
  private detailPanel: Phaser.GameObjects.Container | null = null;

  /** 詳細テキスト */
  private detailText: Phaser.GameObjects.Text | null = null;

  /** 購入ボタン */
  private purchaseButton: Button | null = null;

  /** 閉じるボタン */
  private closeButton: Button | null = null;

  /** 選択中のアイテム */
  private selectedItem: ShopItem | null = null;

  /** カテゴリボタンリスト */
  private categoryButtons: Map<ShopCategoryType, Phaser.GameObjects.Text> = new Map();

  /** キーボードリスナー関数 */
  private keyboardHandler: ((event: { key: string }) => void) | null = null;

  /** GOLD_CHANGEDイベントハンドラ */
  private goldChangedHandler: ((payload?: unknown) => void) | null = null;

  /**
   * コンストラクタ
   * @param scene - Phaserシーンインスタンス
   */
  constructor(scene: Phaser.Scene) {
    super(scene, UI_LAYOUT.COMPONENT_X, UI_LAYOUT.COMPONENT_Y);

    this.initializeServices();
    this.create();
  }

  /**
   * サービスを初期化
   */
  private initializeServices(): void {
    this.eventBus = this.scene.data.get('eventBus');
    if (!this.eventBus) {
      console.warn(ERROR_MESSAGES.EVENT_BUS_NOT_AVAILABLE);
    }

    this.shopService = this.scene.data.get('shopService');
    if (!this.shopService) {
      console.warn(ERROR_MESSAGES.SHOP_SERVICE_NOT_AVAILABLE);
    }

    this.inventoryService = this.scene.data.get('inventoryService');
    if (!this.inventoryService) {
      console.warn(ERROR_MESSAGES.INVENTORY_SERVICE_NOT_AVAILABLE);
    }
  }

  /**
   * UIコンポーネント初期化
   */
  public create(): void {
    // タイトルを作成
    this.createTitle();

    // 所持金表示を作成
    this.createGoldDisplay();

    // カテゴリサイドバーを作成
    this.createCategorySidebar();

    // 商品グリッドを作成
    this.createItemGrid();

    // 詳細パネルを作成
    this.createDetailPanel();

    // 閉じるボタンを作成
    this.createCloseButton();

    // キーボードリスナーを登録
    this.setupKeyboardListener();

    // イベント購読
    this.subscribeToEvents();

    // SHOP_OPENEDイベントを発行
    this.emitEvent(GameEventType.SHOP_OPENED, {});
  }

  /**
   * タイトルを作成
   */
  private createTitle(): void {
    const title = this.scene.add.text(
      UI_LAYOUT.TITLE_X,
      UI_LAYOUT.TITLE_Y,
      UI_TEXT.PHASE_TITLE,
      UI_STYLES.TITLE,
    );
    this.container.add(title);
  }

  /**
   * 所持金表示を作成
   */
  private createGoldDisplay(): void {
    const goldText = this.formatGoldText(this.inventoryService?.getGold() ?? 0);
    this.goldDisplay = this.scene.add.text(
      UI_LAYOUT.GOLD_DISPLAY_X,
      UI_LAYOUT.GOLD_DISPLAY_Y,
      goldText,
      UI_STYLES.GOLD_DISPLAY,
    );
    this.container.add(this.goldDisplay);
  }

  /**
   * 所持金表示を更新
   */
  private updateGoldDisplay(): void {
    if (!this.goldDisplay || !this.inventoryService) {
      return;
    }
    const goldText = this.formatGoldText(this.inventoryService.getGold());
    this.goldDisplay.setText(goldText);
  }

  /**
   * 所持金テキストをフォーマット
   * @param gold - 所持金
   * @returns フォーマットされたテキスト
   */
  private formatGoldText(gold: number): string {
    return UI_TEXT.GOLD_FORMAT.replace('{gold}', gold.toString());
  }

  /**
   * カテゴリサイドバーを作成
   */
  private createCategorySidebar(): void {
    const sidebarContainer = this.scene.add.container(UI_LAYOUT.CATEGORY_X, UI_LAYOUT.CATEGORY_Y);

    const categories: { key: ShopCategoryType; label: string }[] = [
      { key: ShopCategory.CARDS, label: UI_TEXT.CATEGORY_CARDS },
      { key: ShopCategory.MATERIALS, label: UI_TEXT.CATEGORY_MATERIALS },
      { key: ShopCategory.ENHANCEMENTS, label: UI_TEXT.CATEGORY_ENHANCEMENTS },
      { key: ShopCategory.ARTIFACTS, label: UI_TEXT.CATEGORY_ARTIFACTS },
    ];

    categories.forEach((cat, index) => {
      const isSelected = cat.key === this.currentCategory;
      const style = isSelected ? UI_STYLES.CATEGORY_BUTTON_SELECTED : UI_STYLES.CATEGORY_BUTTON;

      const categoryText = this.scene.add.text(0, index * 30, `● ${cat.label}`, style);
      categoryText.setInteractive({ useHandCursor: true });
      categoryText.on('pointerdown', () => this.onCategoryChange(cat.key));

      sidebarContainer.add(categoryText);
      this.categoryButtons.set(cat.key, categoryText);
    });

    this.container.add(sidebarContainer);
  }

  /**
   * カテゴリを更新
   * @param category - カテゴリ
   */
  private updateCategoryButtons(category: ShopCategoryType): void {
    for (const [key, button] of this.categoryButtons) {
      const isSelected = key === category;
      const style = isSelected ? UI_STYLES.CATEGORY_BUTTON_SELECTED : UI_STYLES.CATEGORY_BUTTON;
      button.setStyle(style);
    }
  }

  /**
   * カテゴリ変更処理
   * @param category - 新しいカテゴリ
   */
  private onCategoryChange(category: ShopCategoryType): void {
    this.currentCategory = category;
    this.updateCategoryButtons(category);
    this.createItemGrid();

    // CATEGORY_CHANGEDイベントを発行
    this.emitEvent(GameEventType.CATEGORY_CHANGED, {
      category,
    });
  }

  /**
   * 商品グリッドを作成
   */
  private createItemGrid(): void {
    // 既存の商品カードを破棄
    this.destroyItemCards();

    if (!this.shopService) {
      return;
    }

    // カテゴリに応じた商品を取得
    const items = this.shopService.getItemsByCategory(this.currentCategory);

    // 商品カードを作成
    items.forEach((item, index) => {
      const col = index % ITEM_GRID.ITEMS_PER_ROW;
      const row = Math.floor(index / ITEM_GRID.ITEMS_PER_ROW);

      const cardX = UI_LAYOUT.ITEM_GRID_X + col * (ITEM_GRID.CARD_WIDTH + ITEM_GRID.CARD_SPACING_X);
      const cardY =
        UI_LAYOUT.ITEM_GRID_Y + row * (ITEM_GRID.CARD_HEIGHT + ITEM_GRID.CARD_SPACING_Y);

      const cardUI = this.createItemCard(item, cardX, cardY);
      this.itemCards.push(cardUI);
    });
  }

  /**
   * 商品カードを作成
   * @param item - 商品アイテム
   * @param x - X座標
   * @param y - Y座標
   * @returns 商品カードUI
   */
  private createItemCard(item: ShopItem, x: number, y: number): ItemCardUI {
    const cardContainer = this.scene.add.container(x, y);

    // カード背景
    const cardBg = this.scene.add.rectangle(
      0,
      0,
      ITEM_GRID.CARD_WIDTH,
      ITEM_GRID.CARD_HEIGHT,
      item.isAvailable ? 0x444444 : 0x222222,
      0.8,
    );
    cardBg.setStrokeStyle(2, item.isAvailable ? 0xcccccc : 0x666666);
    cardContainer.add(cardBg);

    // アイテム名
    const itemName = this.scene.add.text(
      0,
      -ITEM_GRID.CARD_HEIGHT / 2 + 15,
      item.name,
      UI_STYLES.ITEM_NAME,
    );
    itemName.setOrigin(0.5, 0);
    cardContainer.add(itemName);

    // 価格表示
    const priceText = this.scene.add.text(
      0,
      ITEM_GRID.CARD_HEIGHT / 2 - 25,
      `${item.price}G`,
      UI_STYLES.ITEM_PRICE,
    );
    priceText.setOrigin(0.5);
    cardContainer.add(priceText);

    // 購入不可の場合はロックアイコン表示
    if (!item.isAvailable) {
      const lockText = this.scene.add.text(0, 0, '🔒', {
        fontSize: '24px',
      });
      lockText.setOrigin(0.5);
      cardContainer.add(lockText);
    }

    // インタラクション
    if (item.isAvailable) {
      cardBg.setInteractive({ useHandCursor: true });
      cardBg.on('pointerdown', () => this.onItemSelect(item));
      cardBg.on('pointerover', () => cardBg.setStrokeStyle(2, 0xffd700));
      cardBg.on('pointerout', () => cardBg.setStrokeStyle(2, 0xcccccc));
    }

    this.container.add(cardContainer);

    return {
      item,
      container: cardContainer,
      destroy: () => cardContainer.destroy(),
    };
  }

  /**
   * アイテム選択処理
   * @param item - 選択されたアイテム
   */
  private onItemSelect(item: ShopItem): void {
    this.selectedItem = item;
    this.updateDetailPanel(item);

    // 購入ボタンの有効/無効を更新
    const canPurchase = this.shopService?.canPurchase(item.id, 'player') ?? false;
    this.purchaseButton?.setEnabled(canPurchase);

    // ITEM_SELECTEDイベントを発行
    this.emitEvent(GameEventType.ITEM_SELECTED, {
      itemId: item.id,
    });
  }

  /**
   * 詳細パネルを作成
   */
  private createDetailPanel(): void {
    this.detailPanel = this.scene.add.container(UI_LAYOUT.DETAIL_PANEL_X, UI_LAYOUT.DETAIL_PANEL_Y);

    // 詳細パネル背景
    const panelBg = this.scene.add.rectangle(0, 0, 500, 120, 0x333333, 0.9);
    panelBg.setStrokeStyle(2, 0x666666);
    this.detailPanel.add(panelBg);

    // 詳細テキスト
    this.detailText = this.scene.add.text(-240, -50, UI_TEXT.SELECT_ITEM, UI_STYLES.DETAIL_TEXT);
    this.detailPanel.add(this.detailText);

    // 購入ボタン
    this.createPurchaseButton();

    this.container.add(this.detailPanel);
  }

  /**
   * 購入ボタンを作成
   */
  private createPurchaseButton(): void {
    if (!this.detailPanel) {
      return;
    }

    const buttonX = 180;
    const buttonY = 40;

    const buttonRect = this.scene.add.rectangle(buttonX, buttonY, 120, 40, 0xff9800);
    buttonRect.setInteractive({ useHandCursor: true });
    buttonRect.on('pointerdown', () => this.onPurchase());

    const buttonText = this.scene.add.text(
      buttonX,
      buttonY,
      UI_TEXT.PURCHASE_BUTTON,
      UI_STYLES.CATEGORY_BUTTON,
    );
    buttonText.setOrigin(0.5);

    this.detailPanel.add([buttonRect, buttonText]);

    this.purchaseButton = {
      isEnabled: () => true,
      setEnabled: (enabled: boolean) => {
        buttonRect.setAlpha(enabled ? 1 : 0.5);
        buttonRect.setInteractive(enabled);
      },
      destroy: () => {
        buttonRect.destroy();
        buttonText.destroy();
      },
    };

    // 初期状態は無効
    this.purchaseButton.setEnabled(false);
  }

  /**
   * 詳細パネルを更新
   * @param item - 表示するアイテム
   */
  private updateDetailPanel(item: ShopItem): void {
    if (!this.detailText) {
      return;
    }

    const detailInfo = [
      `名前: ${item.name}`,
      `価格: ${item.price}G`,
      `説明: ${item.description}`,
      item.rankRequired ? `必要ランク: ${item.rankRequired}` : '',
    ]
      .filter((line) => line !== '')
      .join('\n');

    this.detailText.setText(detailInfo);
  }

  /**
   * 購入処理
   */
  private onPurchase(): void {
    if (!this.selectedItem || !this.shopService || !this.inventoryService) {
      return;
    }

    // 購入処理
    const result = this.shopService.purchaseItem(this.selectedItem.id, 'player');

    if (result.success) {
      // 所持金を減算
      this.inventoryService.removeGold(this.selectedItem.price);
      this.updateGoldDisplay();

      // 成功メッセージを表示
      if (this.detailText) {
        this.detailText.setText(UI_TEXT.PURCHASE_SUCCESS);
      }

      // ITEM_PURCHASEDイベントを発行
      this.emitEvent(GameEventType.ITEM_PURCHASED, {
        itemId: this.selectedItem.id,
        price: this.selectedItem.price,
      });

      // 商品グリッドを更新
      this.createItemGrid();

      // 選択をクリア
      this.selectedItem = null;
      this.purchaseButton?.setEnabled(false);
    } else {
      // エラーメッセージを表示
      if (this.detailText && result.errorMessage) {
        this.detailText.setText(result.errorMessage);
      }
    }
  }

  /**
   * 閉じるボタンを作成
   */
  private createCloseButton(): void {
    const buttonX = 450;
    const buttonY = 0;

    const buttonRect = this.scene.add.rectangle(buttonX, buttonY, 100, 40, 0x666666);
    buttonRect.setInteractive({ useHandCursor: true });
    buttonRect.on('pointerdown', () => this.onClose());

    const buttonText = this.scene.add.text(
      buttonX,
      buttonY,
      UI_TEXT.CLOSE_BUTTON,
      UI_STYLES.CATEGORY_BUTTON,
    );
    buttonText.setOrigin(0.5);

    this.container.add([buttonRect, buttonText]);

    this.closeButton = {
      isEnabled: () => true,
      setEnabled: () => {},
      destroy: () => {
        buttonRect.destroy();
        buttonText.destroy();
      },
    };
  }

  /**
   * 閉じる処理
   */
  private onClose(): void {
    // SHOP_CLOSEDイベントを発行
    this.emitEvent(GameEventType.SHOP_CLOSED, {});

    // 画面を閉じる（実際の実装では親シーンへ遷移）
    this.setVisible(false);
  }

  /**
   * キーボードリスナーを設定
   */
  private setupKeyboardListener(): void {
    this.keyboardHandler = (event: { key: string }) => {
      this.handleKeyboardInput(event);
    };
    if (this.scene?.input?.keyboard) {
      this.scene.input.keyboard.on('keydown', this.keyboardHandler);
    }
  }

  /**
   * イベント購読を設定
   */
  private subscribeToEvents(): void {
    if (this.eventBus) {
      this.goldChangedHandler = () => {
        this.updateGoldDisplay();
      };
      this.eventBus.on(GameEventType.GOLD_CHANGED, this.goldChangedHandler);
    }
  }

  /**
   * キーボード入力を処理
   * @param event - キーボードイベント
   */
  private handleKeyboardInput(event: { key: string }): void {
    const { key } = event;

    switch (key) {
      case KEYBOARD_KEYS.CATEGORY_1:
        this.onCategoryChange(ShopCategory.CARDS);
        break;
      case KEYBOARD_KEYS.CATEGORY_2:
        this.onCategoryChange(ShopCategory.MATERIALS);
        break;
      case KEYBOARD_KEYS.CATEGORY_3:
        this.onCategoryChange(ShopCategory.ENHANCEMENTS);
        break;
      case KEYBOARD_KEYS.CATEGORY_4:
        this.onCategoryChange(ShopCategory.ARTIFACTS);
        break;
      case KEYBOARD_KEYS.PURCHASE:
        if (this.purchaseButton?.isEnabled()) {
          this.onPurchase();
        }
        break;
      case KEYBOARD_KEYS.CLOSE:
        this.onClose();
        break;
    }
  }

  /**
   * イベントを安全に発行
   * @param eventType - イベントタイプ
   * @param payload - ペイロード
   */
  private emitEvent(eventType: string, payload: unknown): void {
    if (!this.eventBus) {
      return;
    }

    try {
      this.eventBus.emit(eventType, payload);
    } catch (error) {
      console.error(ERROR_MESSAGES.FAILED_TO_EMIT_EVENT, eventType, error);
    }
  }

  /**
   * 商品カードを全て破棄
   */
  private destroyItemCards(): void {
    for (const card of this.itemCards) {
      card?.destroy?.();
    }
    this.itemCards = [];
  }

  /**
   * キーボードリスナーを解除
   */
  private removeKeyboardListener(): void {
    if (this.keyboardHandler && this.scene?.input?.keyboard) {
      this.scene.input.keyboard.off('keydown', this.keyboardHandler);
      this.keyboardHandler = null;
    }
  }

  /**
   * イベント購読を解除
   */
  private unsubscribeFromEvents(): void {
    if (this.eventBus && this.goldChangedHandler) {
      this.eventBus.off(GameEventType.GOLD_CHANGED, this.goldChangedHandler);
      this.goldChangedHandler = null;
    }
  }

  /**
   * リソース解放
   */
  public destroy(): void {
    this.destroyItemCards();
    this.removeKeyboardListener();
    this.unsubscribeFromEvents();

    if (this.purchaseButton) {
      this.purchaseButton.destroy();
      this.purchaseButton = null;
    }

    if (this.closeButton) {
      this.closeButton.destroy();
      this.closeButton = null;
    }

    if (this.detailPanel) {
      this.detailPanel.destroy();
      this.detailPanel = null;
    }

    if (this.container) {
      this.container.destroy();
    }
  }
}
