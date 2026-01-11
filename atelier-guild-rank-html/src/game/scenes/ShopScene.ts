/**
 * ShopScene - ショップシーン
 *
 * カード、素材、アーティファクトの購入UIを提供するシーン。
 * 設計文書: docs/tasks/atelier-guild-rank-phaser/TASK-0240.md
 */

import Phaser from 'phaser';
import { BaseGameScene, SceneInitData } from './BaseGameScene';
import {
  ShopSceneLayout,
  ShopCategory,
  ShopCategories,
  ShopColors,
} from './ShopSceneConstants';
import { SceneKeys } from '../config/SceneKeys';
import { UIFactory } from '../ui/UIFactory';
import { Colors } from '../config/ColorPalette';
import { TextStyles } from '../config/TextStyles';
import type Label from 'phaser3-rex-plugins/templates/ui/label/Label';
import type ScrollablePanel from 'phaser3-rex-plugins/templates/ui/scrollablepanel/ScrollablePanel';
import type Sizer from 'phaser3-rex-plugins/templates/ui/sizer/Sizer';

/**
 * ショップ商品の型
 */
export interface ShopItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  category: ShopCategory;
  data?: unknown;
}

/**
 * ショップシーン初期化データ
 */
export interface ShopSceneData extends SceneInitData {
  playerGold: number;
  availableCards?: ShopItem[];
  availableMaterials?: ShopItem[];
  availableArtifacts?: ShopItem[];
  returnScene?: string;
}

/**
 * ShopScene クラス
 *
 * ショップ画面のメインシーン。
 * カテゴリタブで商品の種類を切り替え、商品選択・購入を行う。
 */
export class ShopScene extends BaseGameScene {
  // UIファクトリ
  private uiFactory!: UIFactory;

  // UI要素
  private goldDisplay!: Phaser.GameObjects.Container;
  private categoryTabs!: Map<ShopCategory, Phaser.GameObjects.Container>;
  private itemListPanel!: ScrollablePanel;
  private itemListSizer!: Sizer;
  private detailPanel!: Phaser.GameObjects.Container;
  private purchaseButton!: Label;
  private backButton!: Label;

  // 状態
  private currentCategory: ShopCategory = 'cards';
  private selectedItem: ShopItem | null = null;
  private playerGold: number = 0;
  private shopData: ShopSceneData = {} as ShopSceneData;

  constructor() {
    super(SceneKeys.SHOP);
  }

  protected onInit(data?: ShopSceneData): void {
    if (data) {
      this.shopData = data;
      this.playerGold = data.playerGold ?? 0;
    }
  }

  protected onPreload(): void {
    // ショップ固有アセットがあればここで読み込み
  }

  protected onCreate(data?: ShopSceneData): void {
    // UIファクトリの初期化
    this.uiFactory = new UIFactory(this, this.rexUI);

    // 初期データ設定
    if (data) {
      this.shopData = data;
      this.playerGold = data.playerGold ?? 0;
    }

    // UI構築
    this.createBackground();
    this.createHeader();
    this.createCategoryTabs();
    this.createItemList();
    this.createDetailPanel();
    this.createPurchaseButton();
    this.createBackButton();

    // 初期カテゴリ表示
    this.switchCategory('cards');
  }

  protected setupEventListeners(): void {
    // EventBus購読
    this.subscribe(
      this.eventBus.on('shop:purchase:complete', (payload) => {
        this.onPurchaseComplete(payload.item);
      })
    );

    this.subscribe(
      this.eventBus.on('shop:gold:updated', (payload) => {
        this.updateGold(payload.gold);
      })
    );
  }

  // =====================================================
  // UI構築メソッド
  // =====================================================

  /**
   * 背景を作成
   */
  private createBackground(): void {
    const bg = this.add.graphics();
    bg.fillStyle(Colors.backgroundDark, 1);
    bg.fillRect(0, 0, ShopSceneLayout.SCREEN_WIDTH, ShopSceneLayout.SCREEN_HEIGHT);
  }

  /**
   * ヘッダーを作成（タイトル・所持金表示）
   */
  private createHeader(): void {
    const { HEADER } = ShopSceneLayout;

    // ヘッダー背景
    const headerBg = this.add.graphics();
    headerBg.fillStyle(Colors.panelBackground, 1);
    headerBg.fillRect(HEADER.X, HEADER.Y, HEADER.WIDTH, HEADER.HEIGHT);

    // タイトル
    this.add.text(HEADER.WIDTH / 2, HEADER.HEIGHT / 2, 'ショップ', {
      ...TextStyles.titleMedium,
    }).setOrigin(0.5);

    // 所持金表示
    this.goldDisplay = this.add.container(HEADER.WIDTH - 100, HEADER.HEIGHT / 2);

    const goldIcon = this.add.text(-50, 0, '💰', { fontSize: '20px' }).setOrigin(0.5);
    const goldText = this.add.text(0, 0, `${this.playerGold} G`, {
      ...TextStyles.gold,
      fontSize: '18px',
    }).setOrigin(0.5);
    goldText.setName('goldText');

    this.goldDisplay.add([goldIcon, goldText]);
  }

  /**
   * カテゴリタブを作成
   */
  private createCategoryTabs(): void {
    const { CATEGORY_TAB } = ShopSceneLayout;

    this.categoryTabs = new Map();

    ShopCategories.forEach((cat, index) => {
      const x = CATEGORY_TAB.X + index * (CATEGORY_TAB.TAB_WIDTH + 10);
      const tab = this.createCategoryTab(cat.key, cat.label, x, CATEGORY_TAB.Y);
      this.categoryTabs.set(cat.key, tab);
    });
  }

  /**
   * カテゴリタブを1つ作成
   */
  private createCategoryTab(
    category: ShopCategory,
    label: string,
    x: number,
    y: number
  ): Phaser.GameObjects.Container {
    const { CATEGORY_TAB } = ShopSceneLayout;

    const container = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(Colors.secondary, 1);
    bg.fillRoundedRect(0, 0, CATEGORY_TAB.TAB_WIDTH, CATEGORY_TAB.TAB_HEIGHT, 8);
    bg.setName('bg');
    container.add(bg);

    const text = this.add.text(
      CATEGORY_TAB.TAB_WIDTH / 2,
      CATEGORY_TAB.TAB_HEIGHT / 2,
      label,
      { ...TextStyles.body }
    ).setOrigin(0.5);
    container.add(text);

    container.setSize(CATEGORY_TAB.TAB_WIDTH, CATEGORY_TAB.TAB_HEIGHT);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      if (this.currentCategory !== category) {
        bg.clear();
        bg.fillStyle(Colors.secondaryHover, 1);
        bg.fillRoundedRect(0, 0, CATEGORY_TAB.TAB_WIDTH, CATEGORY_TAB.TAB_HEIGHT, 8);
      }
    });

    container.on('pointerout', () => {
      if (this.currentCategory !== category) {
        bg.clear();
        bg.fillStyle(Colors.secondary, 1);
        bg.fillRoundedRect(0, 0, CATEGORY_TAB.TAB_WIDTH, CATEGORY_TAB.TAB_HEIGHT, 8);
      }
    });

    container.on('pointerdown', () => {
      this.switchCategory(category);
    });

    return container;
  }

  /**
   * 商品リストパネルを作成
   */
  private createItemList(): void {
    const { ITEM_LIST } = ShopSceneLayout;

    // コンテンツSizer
    this.itemListSizer = this.rexUI.add.sizer({
      orientation: 'y',
      space: { item: 8 },
    });

    // スクロール可能なパネル
    this.itemListPanel = this.rexUI.add.scrollablePanel({
      x: ITEM_LIST.X,
      y: ITEM_LIST.Y,
      width: ITEM_LIST.WIDTH,
      height: ITEM_LIST.HEIGHT,
      scrollMode: 0, // vertical

      background: this.rexUI.add.roundRectangle(0, 0, 0, 0, 8, Colors.panelBackground),

      panel: {
        child: this.itemListSizer,
        mask: { padding: 1 },
      },

      slider: {
        track: this.rexUI.add.roundRectangle(0, 0, 10, 0, 5, Colors.backgroundDark),
        thumb: this.rexUI.add.roundRectangle(0, 0, 10, 40, 5, Colors.primary),
      },

      mouseWheelScroller: {
        focus: false,
        speed: 0.1,
      },

      space: { left: 10, right: 10, top: 10, bottom: 10, panel: 10 },
    }).setOrigin(0, 0).layout();
  }

  /**
   * 商品リストの内容を再構築
   */
  private rebuildItemListContent(items: ShopItem[]): void {
    // 既存アイテムをクリア
    this.itemListSizer.removeAll(true);

    // 新しいアイテムを追加
    items.forEach(item => {
      const itemRow = this.createShopItemRow(item);
      this.itemListSizer.add(itemRow);
    });

    // 空の場合のメッセージ
    if (items.length === 0) {
      const emptyText = this.add.text(0, 0, '商品がありません', {
        ...TextStyles.body,
        color: '#888888',
      });
      this.itemListSizer.add(emptyText);
    }

    // レイアウト再計算
    this.itemListPanel.layout();
  }

  /**
   * 商品行を作成
   */
  private createShopItemRow(item: ShopItem): Phaser.GameObjects.Container {
    const container = this.add.container(0, 0);
    const width = ShopSceneLayout.ITEM_LIST.WIDTH - 40;
    const height = 60;

    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(Colors.backgroundLight, 1);
    bg.fillRoundedRect(0, 0, width, height, 8);
    bg.setName('bg');
    container.add(bg);

    // 名前
    const name = this.add.text(20, height / 2, item.name, {
      ...TextStyles.body,
      fontSize: '16px',
    }).setOrigin(0, 0.5);
    container.add(name);

    // 価格
    const canAfford = item.price <= this.playerGold;
    const price = this.add.text(width - 20, height / 2, `${item.price} G`, {
      ...TextStyles.body,
      fontSize: '16px',
      color: canAfford ? ShopColors.priceNormal : ShopColors.priceCannotAfford,
    }).setOrigin(1, 0.5);
    container.add(price);

    container.setSize(width, height);
    container.setInteractive({ useHandCursor: true });

    // ホバー効果
    container.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(Colors.panelBackgroundLight, 1);
      bg.fillRoundedRect(0, 0, width, height, 8);
    });

    container.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(Colors.backgroundLight, 1);
      bg.fillRoundedRect(0, 0, width, height, 8);
    });

    container.on('pointerdown', () => {
      this.selectItem(item);
    });

    return container;
  }

  /**
   * 詳細パネルを作成
   */
  private createDetailPanel(): void {
    const { DETAIL_AREA } = ShopSceneLayout;

    this.detailPanel = this.add.container(DETAIL_AREA.X, DETAIL_AREA.Y);

    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(Colors.panelBackground, 1);
    bg.fillRoundedRect(0, 0, DETAIL_AREA.WIDTH, DETAIL_AREA.HEIGHT, 8);
    bg.lineStyle(1, Colors.panelBorder);
    bg.strokeRoundedRect(0, 0, DETAIL_AREA.WIDTH, DETAIL_AREA.HEIGHT, 8);
    bg.setName('background');
    this.detailPanel.add(bg);

    // 初期メッセージ
    const placeholder = this.add.text(
      DETAIL_AREA.WIDTH / 2,
      DETAIL_AREA.HEIGHT / 2,
      '商品を選択してください',
      { ...TextStyles.body, color: '#888888' }
    ).setOrigin(0.5);
    placeholder.setName('placeholder');
    this.detailPanel.add(placeholder);
  }

  /**
   * 購入ボタンを作成
   */
  private createPurchaseButton(): void {
    const { PURCHASE_BUTTON } = ShopSceneLayout;

    this.purchaseButton = this.uiFactory.createPrimaryButton({
      x: PURCHASE_BUTTON.X,
      y: PURCHASE_BUTTON.Y,
      width: PURCHASE_BUTTON.WIDTH,
      height: PURCHASE_BUTTON.HEIGHT,
      text: '購入',
      onClick: () => this.handlePurchase(),
    });

    this.purchaseButton.setVisible(false);
  }

  /**
   * 戻るボタンを作成
   */
  private createBackButton(): void {
    const { BACK_BUTTON } = ShopSceneLayout;

    this.backButton = this.uiFactory.createSecondaryButton({
      x: BACK_BUTTON.X,
      y: BACK_BUTTON.Y,
      width: BACK_BUTTON.WIDTH,
      height: BACK_BUTTON.HEIGHT,
      text: '戻る',
      onClick: () => this.handleBack(),
    });
  }

  // =====================================================
  // 操作メソッド
  // =====================================================

  /**
   * カテゴリを切り替え
   */
  switchCategory(category: ShopCategory): void {
    this.currentCategory = category;

    // タブ状態更新
    this.categoryTabs.forEach((tab, key) => {
      const bg = tab.getByName('bg') as Phaser.GameObjects.Graphics;
      bg.clear();
      if (key === category) {
        bg.fillStyle(Colors.primary, 1);
      } else {
        bg.fillStyle(Colors.secondary, 1);
      }
      bg.fillRoundedRect(
        0, 0,
        ShopSceneLayout.CATEGORY_TAB.TAB_WIDTH,
        ShopSceneLayout.CATEGORY_TAB.TAB_HEIGHT,
        8
      );
    });

    // 商品リスト更新
    this.updateItemList();

    // 選択解除
    this.selectedItem = null;
    this.updateDetailPanel();
  }

  /**
   * 商品リストを更新
   */
  private updateItemList(): void {
    // カテゴリに応じた商品リスト取得
    let items: ShopItem[] = [];
    switch (this.currentCategory) {
      case 'cards':
        items = this.shopData.availableCards ?? [];
        break;
      case 'materials':
        items = this.shopData.availableMaterials ?? [];
        break;
      case 'artifacts':
        items = this.shopData.availableArtifacts ?? [];
        break;
    }

    // リスト再構築
    this.rebuildItemListContent(items);
  }

  /**
   * 商品を選択
   */
  selectItem(item: ShopItem): void {
    this.selectedItem = item;
    this.updateDetailPanel();
    this.purchaseButton.setVisible(true);
  }

  /**
   * 詳細パネルを更新
   */
  private updateDetailPanel(): void {
    const { DETAIL_AREA } = ShopSceneLayout;

    // 詳細コンテンツをクリア（背景とプレースホルダー以外）
    const childrenToRemove: Phaser.GameObjects.GameObject[] = [];
    this.detailPanel.each((child: Phaser.GameObjects.GameObject) => {
      if (child.name !== 'background' && child.name !== 'placeholder') {
        childrenToRemove.push(child);
      }
    });
    childrenToRemove.forEach(child => {
      this.detailPanel.remove(child, true);
    });

    const placeholder = this.detailPanel.getByName('placeholder') as Phaser.GameObjects.Text;

    if (!this.selectedItem) {
      if (placeholder) {
        placeholder.setVisible(true);
      }
      this.purchaseButton.setVisible(false);
      return;
    }

    if (placeholder) {
      placeholder.setVisible(false);
    }

    // 選択商品の詳細表示
    const nameText = this.add.text(20, 20, this.selectedItem.name, {
      ...TextStyles.titleSmall,
    });
    this.detailPanel.add(nameText);

    const canAfford = this.selectedItem.price <= this.playerGold;
    const priceText = this.add.text(20, 60, `価格: ${this.selectedItem.price} G`, {
      ...TextStyles.body,
      color: canAfford ? ShopColors.priceAffordable : ShopColors.priceCannotAfford,
    });
    this.detailPanel.add(priceText);

    if (this.selectedItem.description) {
      const descText = this.add.text(20, 100, this.selectedItem.description, {
        ...TextStyles.body,
        wordWrap: { width: DETAIL_AREA.WIDTH - 40 },
      });
      this.detailPanel.add(descText);
    }

    // 購入ボタンの有効/無効
    this.uiFactory.setButtonEnabled(this.purchaseButton, canAfford);
  }

  /**
   * 購入処理
   */
  private handlePurchase(): void {
    if (!this.selectedItem) return;
    if (this.selectedItem.price > this.playerGold) {
      this.showPurchaseError('ゴールドが足りません');
      return;
    }

    this.eventBus.emit('shop:purchase:requested', {
      item: this.selectedItem,
      category: this.currentCategory,
    });
  }

  /**
   * 戻る処理
   */
  private handleBack(): void {
    const returnScene = this.shopData.returnScene ?? SceneKeys.MAIN;
    this.goToScene(returnScene);
  }

  // =====================================================
  // 公開メソッド
  // =====================================================

  /**
   * 所持金を更新
   */
  updateGold(newGold: number): void {
    this.playerGold = newGold;
    const goldText = this.goldDisplay.getByName('goldText') as Phaser.GameObjects.Text;
    if (goldText) {
      goldText.setText(`${this.playerGold} G`);
    }
    // 選択中商品があれば詳細も更新
    this.updateDetailPanel();
    // 商品リストの価格表示も更新
    this.updateItemList();
  }

  /**
   * 購入完了通知
   */
  onPurchaseComplete(item: ShopItem): void {
    this.showPurchaseSuccess(`${item.name}を購入しました！`);
    this.updateItemList();
    this.selectedItem = null;
    this.updateDetailPanel();
    this.purchaseButton.setVisible(false);
  }

  /**
   * 購入成功メッセージを表示
   */
  private showPurchaseSuccess(message: string): void {
    // 簡易トースト表示
    const toast = this.add.text(
      ShopSceneLayout.SCREEN_WIDTH / 2,
      ShopSceneLayout.SCREEN_HEIGHT - 100,
      message,
      { ...TextStyles.success, backgroundColor: '#28a745', padding: { x: 20, y: 10 } }
    ).setOrigin(0.5);

    this.tweens.add({
      targets: toast,
      alpha: 0,
      y: ShopSceneLayout.SCREEN_HEIGHT - 150,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => toast.destroy(),
    });
  }

  /**
   * 購入エラーメッセージを表示
   */
  private showPurchaseError(message: string): void {
    // 簡易トースト表示
    const toast = this.add.text(
      ShopSceneLayout.SCREEN_WIDTH / 2,
      ShopSceneLayout.SCREEN_HEIGHT - 100,
      message,
      { ...TextStyles.warning, backgroundColor: '#dc3545', padding: { x: 20, y: 10 } }
    ).setOrigin(0.5);

    this.tweens.add({
      targets: toast,
      alpha: 0,
      y: ShopSceneLayout.SCREEN_HEIGHT - 150,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => toast.destroy(),
    });
  }

  /**
   * 現在選択中のカテゴリを取得
   */
  getCurrentCategory(): ShopCategory {
    return this.currentCategory;
  }

  /**
   * 現在選択中の商品を取得
   */
  getSelectedItem(): ShopItem | null {
    return this.selectedItem;
  }

  /**
   * プレイヤーの所持金を取得
   */
  getPlayerGold(): number {
    return this.playerGold;
  }
}
