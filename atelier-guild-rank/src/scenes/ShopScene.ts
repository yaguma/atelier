/**
 * ShopScene.ts - ショップシーン
 * TASK-0050: ShopScene実装
 *
 * @description
 * ショップ画面を表示するシーン。
 * カード・アイテムの購入機能を提供する。
 *
 * @信頼性レベル 🔵 TASK-0050.md セクション2に基づく
 */

import type { IPurchaseResult, IShopItem, IShopService } from '@features/shop';
import type { RexLabel, RexSizer, RexUIPlugin } from '@presentation/types/rexui';
import { THEME } from '@presentation/ui/theme';
import { MAIN_LAYOUT } from '@shared/constants';
import { Container, ServiceKeys } from '@shared/services/di/container';
import type { GuildRank } from '@shared/types';
import Phaser from 'phaser';

// =============================================================================
// 定数
// =============================================================================

/**
 * レイアウト定数
 */
const LAYOUT = {
  /** ヘッダー高さ（MAIN_LAYOUT から参照） */
  HEADER_HEIGHT: MAIN_LAYOUT.HEADER_HEIGHT,
  /** フッター高さ */
  FOOTER_HEIGHT: 80,
  /** サイドパディング */
  SIDE_PADDING: 40,
  /** グリッド列数 */
  GRID_COLS: 3,
  /** アイテムカードの幅 */
  ITEM_WIDTH: 200,
  /** アイテムカードの高さ */
  ITEM_HEIGHT: 250,
  /** アイテム間のスペーシング */
  ITEM_SPACING: 20,
  /** ボタンの幅 */
  BUTTON_WIDTH: 120,
  /** ボタンの高さ */
  BUTTON_HEIGHT: 40,
  /** ボタンの角丸半径 */
  BUTTON_RADIUS: 8,
} as const;

/**
 * スタイル定数
 */
const STYLES = {
  /** ヘッダーフォントサイズ */
  HEADER_FONT_SIZE: '28px',
  /** アイテム名フォントサイズ */
  ITEM_NAME_FONT_SIZE: '16px',
  /** 価格フォントサイズ */
  PRICE_FONT_SIZE: '14px',
  /** 説明フォントサイズ */
  DESCRIPTION_FONT_SIZE: '12px',
  /** ボタンフォントサイズ */
  BUTTON_FONT_SIZE: '14px',
  /** フッターフォントサイズ */
  FOOTER_FONT_SIZE: '18px',
  /** 価格の色（ゴールド） */
  PRICE_COLOR: '#FFD700',
  /** 購入不可の色 */
  UNAVAILABLE_COLOR: '#999999',
  /** 在庫切れの色 */
  OUT_OF_STOCK_COLOR: '#FF6B6B',
} as const;

/**
 * テキスト定数
 */
const TEXT = {
  HEADER: 'ショップ',
  BACK: '戻る',
  BUY: '購入',
  SOLD_OUT: '売切',
  GOLD_LABEL: '所持金: ',
  GOLD_UNIT: 'G',
  STOCK_UNLIMITED: '∞',
} as const;

/**
 * アニメーション定数
 */
const ANIMATION = {
  /** フェードイン・アウトの時間（ミリ秒） */
  FADE_DURATION: 300,
  /** 無効化時のアルファ値 */
  DISABLED_ALPHA: 0.5,
} as const;

// =============================================================================
// 型定義
// =============================================================================

/**
 * StateManager インターフェース（依存注入用）
 */
interface IStateManager {
  getState(): {
    currentRank: GuildRank;
    gold: number;
  };
}

/**
 * EventBus インターフェース（依存注入用）
 */
interface IEventBus {
  emit(event: string, data: unknown): void;
  on(event: string, handler: (...args: unknown[]) => void): () => void;
  off(event: string, handler?: (...args: unknown[]) => void): void;
}

// =============================================================================
// ShopSceneクラス
// =============================================================================

/**
 * ShopScene - ショップ画面シーン
 *
 * 【責務】:
 * - ショップアイテムの一覧表示
 * - 購入処理の実行
 * - MainSceneへの戻り処理
 *
 * @信頼性レベル 🔵 TASK-0050.md セクション2に基づく
 */
export class ShopScene extends Phaser.Scene {
  // ===========================================================================
  // 依存サービス
  // ===========================================================================

  /** 状態管理サービス */
  private stateManager!: IStateManager;

  /** ショップサービス */
  private shopService!: IShopService;

  /** イベントバス */
  private eventBus!: IEventBus;

  // ===========================================================================
  // UIコンポーネント
  // ===========================================================================

  /** 戻るボタン - TASK-0059: rexUI型定義を適用 */
  private backButton!: RexLabel;

  /** 所持金テキスト */
  private goldText!: Phaser.GameObjects.Text;

  /** アイテムコンテナ */
  private itemContainer!: Phaser.GameObjects.Container;

  /** ショップアイテムリスト */
  private shopItems: IShopItem[] = [];

  /**
   * アイテムUIリスト
   * 各アイテムUIにはrexUIコンポーネントとショップアイテムの参照を保持
   */
  private itemUIs: Array<{ card: RexSizer; item: IShopItem; buyButton: RexLabel }> = [];

  // ===========================================================================
  // rexUIプラグイン
  // ===========================================================================

  /** rexUIプラグイン参照 - TASK-0059: rexUI型定義を適用 */
  declare rexUI: RexUIPlugin;

  // ===========================================================================
  // コンストラクタ
  // ===========================================================================

  constructor() {
    super({ key: 'ShopScene' });
  }

  // ===========================================================================
  // ライフサイクルメソッド
  // ===========================================================================

  /**
   * create() - ショップ画面の生成
   *
   * @throws {Error} StateManagerが未初期化の場合
   * @throws {Error} ShopServiceが未初期化の場合
   */
  create(): void {
    // DIコンテナからサービスを取得
    this.initializeServicesFromContainer();

    // サービスの検証
    this.validateServices();

    // UIコンポーネントの作成
    this.createHeader();
    this.createItemGrid();
    this.createFooter();

    // フェードイン
    this.fadeIn();
  }

  // ===========================================================================
  // プライベートメソッド - 初期化
  // ===========================================================================

  /**
   * DIコンテナからサービスを取得
   */
  private initializeServicesFromContainer(): void {
    const container = Container.getInstance();
    this.stateManager = container.resolve(ServiceKeys.StateManager);
    this.shopService = container.resolve(ServiceKeys.ShopService);
    this.eventBus = container.resolve(ServiceKeys.EventBus);
  }

  /**
   * サービスの存在を検証
   *
   * @throws {Error} 必要なサービスが未初期化の場合
   */
  private validateServices(): void {
    if (!this.stateManager) {
      throw new Error('StateManager is required');
    }
    if (!this.shopService) {
      throw new Error('ShopService is required');
    }
    if (!this.eventBus) {
      throw new Error('EventBus is required');
    }
  }

  // ===========================================================================
  // プライベートメソッド - UI作成
  // ===========================================================================

  /**
   * ヘッダーを作成
   */
  private createHeader(): void {
    // ヘッダー背景
    const headerBg = this.add.graphics();
    headerBg.fillStyle(THEME.colors.primary, 1);
    headerBg.fillRect(0, 0, this.cameras.main.width, LAYOUT.HEADER_HEIGHT);

    // タイトルテキスト
    this.add
      .text(LAYOUT.SIDE_PADDING, LAYOUT.HEADER_HEIGHT / 2, TEXT.HEADER, {
        fontFamily: THEME.fonts.primary,
        fontSize: STYLES.HEADER_FONT_SIZE,
        color: THEME.colors.textOnPrimary,
      })
      .setOrigin(0, 0.5);

    // 戻るボタン
    this.createBackButton();
  }

  /**
   * 戻るボタンを作成
   */
  private createBackButton(): void {
    const buttonX = this.cameras.main.width - LAYOUT.SIDE_PADDING - LAYOUT.BUTTON_WIDTH / 2;
    const buttonY = LAYOUT.HEADER_HEIGHT / 2;

    const buttonBackground = this.rexUI.add.roundRectangle(
      0,
      0,
      LAYOUT.BUTTON_WIDTH,
      LAYOUT.BUTTON_HEIGHT,
      LAYOUT.BUTTON_RADIUS,
      THEME.colors.secondary,
    );

    const buttonText = this.add.text(0, 0, TEXT.BACK, {
      fontFamily: THEME.fonts.primary,
      fontSize: STYLES.BUTTON_FONT_SIZE,
      color: THEME.colors.textOnPrimary,
    });

    this.backButton = this.rexUI.add.label({
      width: LAYOUT.BUTTON_WIDTH,
      height: LAYOUT.BUTTON_HEIGHT,
      background: buttonBackground,
      text: buttonText,
      align: 'center',
      space: {
        left: 10,
        right: 10,
        top: 5,
        bottom: 5,
      },
      x: buttonX,
      y: buttonY,
    });

    this.backButton.setInteractive();
    this.backButton.on('pointerdown', () => this.onBackButtonClick());
    this.backButton.layout();
  }

  /**
   * アイテムグリッドを作成
   */
  private createItemGrid(): void {
    const state = this.stateManager.getState();
    this.shopItems = this.shopService.getAvailableItems(state.currentRank);

    // アイテムコンテナを作成
    const contentY = LAYOUT.HEADER_HEIGHT + LAYOUT.ITEM_SPACING;
    this.itemContainer = this.add.container(0, contentY);
    this.itemContainer.name = 'ShopScene.itemContainer';

    // グリッドでアイテムを配置
    const startX = LAYOUT.SIDE_PADDING + LAYOUT.ITEM_WIDTH / 2;
    const startY = LAYOUT.ITEM_SPACING + LAYOUT.ITEM_HEIGHT / 2;

    this.shopItems.forEach((item, index) => {
      const col = index % LAYOUT.GRID_COLS;
      const row = Math.floor(index / LAYOUT.GRID_COLS);

      const x = startX + col * (LAYOUT.ITEM_WIDTH + LAYOUT.ITEM_SPACING);
      const y = startY + row * (LAYOUT.ITEM_HEIGHT + LAYOUT.ITEM_SPACING);

      this.createItemCard(item, x, y);
    });
  }

  /**
   * アイテムカードを作成
   *
   * @param item - ショップアイテム
   * @param x - X座標
   * @param y - Y座標
   */
  private createItemCard(item: IShopItem, x: number, y: number): void {
    const state = this.stateManager.getState();
    const canPurchase = this.shopService.canPurchase(item.id, state.gold, state.currentRank);
    const isSoldOut = item.stock === 0;

    // カード背景
    const cardBg = this.rexUI.add.roundRectangle(
      0,
      0,
      LAYOUT.ITEM_WIDTH,
      LAYOUT.ITEM_HEIGHT,
      8,
      THEME.colors.background,
    );

    // アイテム名
    const nameText = this.add
      .text(0, -80, item.name, {
        fontFamily: THEME.fonts.primary,
        fontSize: STYLES.ITEM_NAME_FONT_SIZE,
        color: `#${THEME.colors.text.toString(16)}`,
      })
      .setOrigin(0.5, 0.5);

    // タイプ表示
    const typeLabel =
      item.type === 'card' ? 'カード' : item.type === 'material' ? '素材' : 'アーティファクト';
    const typeText = this.add
      .text(0, -55, `[${typeLabel}]`, {
        fontFamily: THEME.fonts.primary,
        fontSize: STYLES.DESCRIPTION_FONT_SIZE,
        color: `#${THEME.colors.textLight.toString(16)}`,
      })
      .setOrigin(0.5, 0.5);

    // 説明
    const descText = this.add
      .text(0, -20, item.description, {
        fontFamily: THEME.fonts.primary,
        fontSize: STYLES.DESCRIPTION_FONT_SIZE,
        color: `#${THEME.colors.textLight.toString(16)}`,
        wordWrap: { width: LAYOUT.ITEM_WIDTH - 20 },
        align: 'center',
      })
      .setOrigin(0.5, 0.5);

    // 価格
    const priceColor = canPurchase ? STYLES.PRICE_COLOR : STYLES.UNAVAILABLE_COLOR;
    const priceText = this.add
      .text(0, 30, `${item.price}${TEXT.GOLD_UNIT}`, {
        fontFamily: THEME.fonts.primary,
        fontSize: STYLES.PRICE_FONT_SIZE,
        color: priceColor,
      })
      .setOrigin(0.5, 0.5);

    // 在庫表示
    const stockDisplay = item.stock === -1 ? TEXT.STOCK_UNLIMITED : `在庫: ${item.stock}`;
    const stockColor = isSoldOut
      ? STYLES.OUT_OF_STOCK_COLOR
      : `#${THEME.colors.textLight.toString(16)}`;
    const stockText = this.add
      .text(0, 50, stockDisplay, {
        fontFamily: THEME.fonts.primary,
        fontSize: STYLES.DESCRIPTION_FONT_SIZE,
        color: stockColor,
      })
      .setOrigin(0.5, 0.5);

    // 購入ボタン
    const buttonLabel = isSoldOut ? TEXT.SOLD_OUT : TEXT.BUY;
    const buttonColor = isSoldOut
      ? THEME.colors.disabled
      : canPurchase
        ? THEME.colors.primary
        : THEME.colors.disabled;

    const buyButtonBg = this.rexUI.add.roundRectangle(0, 0, 80, 30, 4, buttonColor);

    const buyButtonText = this.add.text(0, 0, buttonLabel, {
      fontFamily: THEME.fonts.primary,
      fontSize: STYLES.DESCRIPTION_FONT_SIZE,
      color: THEME.colors.textOnPrimary,
    });

    const buyButton = this.rexUI.add.label({
      width: 80,
      height: 30,
      background: buyButtonBg,
      text: buyButtonText,
      align: 'center',
      space: { left: 5, right: 5, top: 3, bottom: 3 },
    });

    if (canPurchase && !isSoldOut) {
      buyButton.setInteractive();
      buyButton.on('pointerdown', () => this.handlePurchase(item.id));
    } else {
      buyButton.setAlpha(ANIMATION.DISABLED_ALPHA);
    }

    buyButton.layout();

    // カードにすべての要素を配置
    const card = this.rexUI.add.sizer({
      x,
      y,
      orientation: 'y',
      space: { item: 5 },
    });

    card.add(cardBg);
    card.add(nameText);
    card.add(typeText);
    card.add(descText);
    card.add(priceText);
    card.add(stockText);
    card.add(buyButton);
    card.layout();

    this.itemUIs.push({ card, item, buyButton });
    this.itemContainer.add(card);
  }

  /**
   * フッターを作成
   */
  private createFooter(): void {
    const state = this.stateManager.getState();
    const footerY = this.cameras.main.height - LAYOUT.FOOTER_HEIGHT;

    // フッター背景
    const footerBg = this.add.graphics();
    footerBg.fillStyle(THEME.colors.primary, 1);
    footerBg.fillRect(0, footerY, this.cameras.main.width, LAYOUT.FOOTER_HEIGHT);

    // 所持金表示
    this.goldText = this.add
      .text(
        LAYOUT.SIDE_PADDING,
        footerY + LAYOUT.FOOTER_HEIGHT / 2,
        `${TEXT.GOLD_LABEL}${state.gold}${TEXT.GOLD_UNIT}`,
        {
          fontFamily: THEME.fonts.primary,
          fontSize: STYLES.FOOTER_FONT_SIZE,
          color: THEME.colors.textOnPrimary,
        },
      )
      .setOrigin(0, 0.5);
  }

  // ===========================================================================
  // 購入処理
  // ===========================================================================

  /**
   * アイテム購入可能かチェック
   *
   * @param itemId - ショップアイテムID
   * @returns 購入可能な場合true
   */
  canPurchaseItem(itemId: string): boolean {
    const state = this.stateManager.getState();
    return this.shopService.canPurchase(itemId, state.gold, state.currentRank);
  }

  /**
   * 購入処理を実行
   *
   * @param itemId - ショップアイテムID
   * @returns 購入結果
   */
  handlePurchase(itemId: string): IPurchaseResult {
    const result = this.shopService.purchase(itemId);

    if (result.success) {
      // 所持金表示を更新
      this.updateGoldDisplay();

      // アイテムリストを更新
      this.refreshItemList();
    }

    return result;
  }

  /**
   * 所持金表示を更新
   */
  private updateGoldDisplay(): void {
    const state = this.stateManager.getState();
    this.goldText.setText(`${TEXT.GOLD_LABEL}${state.gold}${TEXT.GOLD_UNIT}`);
  }

  /**
   * アイテムリストを更新
   */
  private refreshItemList(): void {
    const state = this.stateManager.getState();
    this.shopItems = this.shopService.getAvailableItems(state.currentRank);

    // 購入ボタンの状態を更新
    for (const ui of this.itemUIs) {
      const canPurchase = this.shopService.canPurchase(ui.item.id, state.gold, state.currentRank);
      const item = this.shopService.getShopItem(ui.item.id);
      const isSoldOut = item ? item.stock === 0 : false;

      if (!canPurchase || isSoldOut) {
        ui.buyButton.setAlpha(ANIMATION.DISABLED_ALPHA);
        ui.buyButton.removeInteractive();
      }
    }
  }

  // ===========================================================================
  // 公開メソッド（テスト用）
  // ===========================================================================

  /**
   * 所持金テキストを取得
   *
   * @returns 所持金表示テキスト
   */
  getGoldText(): string {
    const state = this.stateManager.getState();
    return `${TEXT.GOLD_LABEL}${state.gold}${TEXT.GOLD_UNIT}`;
  }

  // ===========================================================================
  // シーン遷移
  // ===========================================================================

  /**
   * 戻るボタンクリック処理
   */
  onBackButtonClick(): void {
    this.fadeOutToScene('MainScene');
  }

  // ===========================================================================
  // アニメーション
  // ===========================================================================

  /**
   * フェードイン処理
   */
  private fadeIn(): void {
    this.cameras.main.fadeIn(ANIMATION.FADE_DURATION, 0, 0, 0);
  }

  /**
   * フェードアウト後にシーン遷移
   *
   * @param targetScene - 遷移先のシーン名
   */
  private fadeOutToScene(targetScene: string): void {
    this.cameras.main.fadeOut(ANIMATION.FADE_DURATION, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(targetScene);
    });
  }
}
