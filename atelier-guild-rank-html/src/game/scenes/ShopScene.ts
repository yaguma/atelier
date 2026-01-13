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
  CardType,
  CardRarity,
  CardTypeIcons,
  CardTypeLabels,
  RarityColors,
  RarityColorStrings,
  CardItemRowLayout,
  CardDetailPanelLayout,
  CardPreviewSize,
  LoadingOverlayConfig,
  PurchaseAnimationConfig,
  MaterialQuality,
  MaterialQualityThresholds,
  MaterialQualityColors,
  MaterialQualityColorStrings,
  MaterialQualityLabels,
  MaterialItemRowLayout,
  MaterialDetailPanelLayout,
  QuantitySelectorLayout,
  QuantitySelectorConfig,
  ArtifactItemRowLayout,
  ArtifactDetailPanelLayout,
  ArtifactRarityLabels,
  ArtifactIcon,
  StockDisplayConfig,
} from './ShopSceneConstants';
import { SceneKeys } from '../config/SceneKeys';
import { UIFactory } from '../ui/UIFactory';
import { Colors } from '../config/ColorPalette';
import { TextStyles } from '../config/TextStyles';
import type Label from 'phaser3-rex-plugins/templates/ui/label/Label';
import type ScrollablePanel from 'phaser3-rex-plugins/templates/ui/scrollablepanel/ScrollablePanel';
import type Sizer from 'phaser3-rex-plugins/templates/ui/sizer/Sizer';

/**
 * カードの素材情報
 */
export interface CardMaterial {
  name: string;
  probability?: number;
  quantity?: number;
}

/**
 * カードの出力アイテム情報
 */
export interface CardOutputItem {
  name: string;
}

/**
 * カードの効果情報
 */
export interface CardEffect {
  description: string;
}

/**
 * ショップカード商品の型
 */
export interface ShopCardItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  category: 'cards';
  type: CardType;
  rarity: CardRarity;
  materials?: CardMaterial[];
  outputItem?: CardOutputItem;
  requiredMaterials?: CardMaterial[];
  effect?: CardEffect;
  data?: unknown;
}

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
 * ショップ素材商品の型
 */
export interface ShopMaterialItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  category: 'materials';
  quality: number;
  materialCategory?: string;
  stock: number; // -1 = 無限
  data?: unknown;
}

/**
 * アーティファクト効果の型
 */
export interface ArtifactEffect {
  description: string;
}

/**
 * ショップアーティファクト商品の型
 */
export interface ShopArtifactItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  category: 'artifacts';
  rarity: CardRarity;
  effects?: ArtifactEffect[];
  requirement?: string;
  data?: unknown;
}

/**
 * ショップ商品の統合型
 */
export type ShopItemUnion = ShopItem | ShopCardItem | ShopMaterialItem | ShopArtifactItem;

/**
 * 型ガード: ShopCardItemかどうか判定
 */
export function isShopCardItem(item: ShopItemUnion): item is ShopCardItem {
  return item.category === 'cards' && 'type' in item && 'rarity' in item;
}

/**
 * 型ガード: ShopMaterialItemかどうか判定
 */
export function isShopMaterialItem(item: ShopItemUnion): item is ShopMaterialItem {
  return item.category === 'materials' && 'quality' in item && 'stock' in item;
}

/**
 * 型ガード: ShopArtifactItemかどうか判定
 */
export function isShopArtifactItem(item: ShopItemUnion): item is ShopArtifactItem {
  return item.category === 'artifacts' && 'rarity' in item;
}

/**
 * 数量セレクタの状態
 */
export interface QuantitySelectorState {
  container: Phaser.GameObjects.Container;
  quantity: number;
  minusButton: Phaser.GameObjects.Container;
  plusButton: Phaser.GameObjects.Container;
  quantityText: Phaser.GameObjects.Text;
  totalText: Phaser.GameObjects.Text | null;
}

/**
 * ショップシーン初期化データ
 */
export interface ShopSceneData extends SceneInitData {
  playerGold: number;
  availableCards?: ShopCardItem[];
  availableMaterials?: ShopMaterialItem[];
  availableArtifacts?: ShopArtifactItem[];
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
  private selectedItem: ShopItemUnion | null = null;
  private playerGold: number = 0;
  private shopData: ShopSceneData = {} as ShopSceneData;
  private currentLoadingOverlay: Phaser.GameObjects.Container | null = null;
  private confirmDialog: Phaser.GameObjects.Container | null = null;
  private quantitySelector: QuantitySelectorState | null = null;

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
  private rebuildItemListContent(items: ShopItemUnion[]): void {
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
   * 商品行を作成（カテゴリに応じて適切な行を生成）
   */
  private createShopItemRow(item: ShopItemUnion): Phaser.GameObjects.Container {
    // カード商品の場合はカード専用の行を作成
    if (isShopCardItem(item)) {
      return this.createCardItemRow(item);
    }
    // 素材商品の場合は汎用の行を作成
    if (isShopMaterialItem(item)) {
      return this.createGenericItemRow(item);
    }
    // アーティファクト商品の場合は汎用の行を作成
    if (isShopArtifactItem(item)) {
      return this.createGenericItemRow(item);
    }
    // それ以外は通常の商品行
    return this.createGenericItemRow(item);
  }

  /**
   * カード商品行を作成
   */
  private createCardItemRow(card: ShopCardItem): Phaser.GameObjects.Container {
    const container = this.add.container(0, 0);
    const { WIDTH, HEIGHT } = CardItemRowLayout;

    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(Colors.backgroundLight, 1);
    bg.fillRoundedRect(0, 0, WIDTH, HEIGHT, 8);
    bg.setName('bg');
    container.add(bg);

    // カードタイプアイコン
    const typeIcon = CardTypeIcons[card.type] ?? '🃏';
    const icon = this.add.text(CardItemRowLayout.ICON_X, CardItemRowLayout.ICON_Y, typeIcon, {
      fontSize: '24px',
    }).setOrigin(0, 0.5);
    container.add(icon);

    // カード名
    const name = this.add.text(CardItemRowLayout.NAME_X, CardItemRowLayout.NAME_Y, card.name, {
      ...TextStyles.body,
      fontSize: '16px',
      fontStyle: 'bold',
    });
    container.add(name);

    // カード効果簡易説明
    const effectText = this.getCardEffectSummary(card);
    const effect = this.add.text(CardItemRowLayout.EFFECT_X, CardItemRowLayout.EFFECT_Y, effectText, {
      ...TextStyles.body,
      fontSize: '12px',
      color: '#aaaaaa',
    });
    container.add(effect);

    // レアリティ表示（色付き丸）
    const rarityColor = RarityColors[card.rarity] ?? 0xaaaaaa;
    const rarity = this.add.graphics();
    rarity.fillStyle(rarityColor, 1);
    rarity.fillCircle(CardItemRowLayout.RARITY_X, CardItemRowLayout.RARITY_Y, CardItemRowLayout.RARITY_RADIUS);
    container.add(rarity);

    // 価格
    const canAfford = card.price <= this.playerGold;
    const price = this.add.text(CardItemRowLayout.PRICE_X, CardItemRowLayout.PRICE_Y, `${card.price} G`, {
      ...TextStyles.body,
      fontSize: '16px',
      color: canAfford ? '#ffcc00' : ShopColors.priceCannotAfford,
    });
    container.add(price);

    // インタラクション
    container.setSize(WIDTH, HEIGHT);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(Colors.panelBackgroundLight, 1);
      bg.fillRoundedRect(0, 0, WIDTH, HEIGHT, 8);
    });

    container.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(Colors.backgroundLight, 1);
      bg.fillRoundedRect(0, 0, WIDTH, HEIGHT, 8);
    });

    container.on('pointerdown', () => {
      this.selectItem(card);
    });

    return container;
  }

  /**
   * カード効果の簡易説明を取得
   */
  private getCardEffectSummary(card: ShopCardItem): string {
    switch (card.type) {
      case 'gathering':
        if (card.materials && card.materials.length > 0) {
          const names = card.materials.slice(0, 3).map(m => m.name).join(', ');
          return `採取: ${names}${card.materials.length > 3 ? '...' : ''}`;
        }
        return '採取地カード';
      case 'recipe':
        return `調合: ${card.outputItem?.name ?? '不明'}`;
      case 'enhance':
        return card.effect?.description ?? 'カード強化';
      default:
        return '';
    }
  }

  /**
   * 通常の商品行を作成
   */
  private createGenericItemRow(item: ShopItem): Phaser.GameObjects.Container {
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
   * 素材商品行を作成
   */
  private createMaterialItemRow(material: ShopMaterialItem): Phaser.GameObjects.Container {
    const container = this.add.container(0, 0);
    const { WIDTH, HEIGHT } = MaterialItemRowLayout;

    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(Colors.backgroundLight, 1);
    bg.fillRoundedRect(0, 0, WIDTH, HEIGHT, 8);
    bg.setName('bg');
    container.add(bg);

    // 素材アイコン（品質カラー）
    const qualityColor = this.getQualityColor(material.quality);
    const iconBg = this.add.graphics();
    iconBg.fillStyle(qualityColor, 0.3);
    iconBg.fillRoundedRect(
      MaterialItemRowLayout.ICON_BG_X,
      MaterialItemRowLayout.ICON_BG_Y,
      MaterialItemRowLayout.ICON_BG_SIZE,
      MaterialItemRowLayout.ICON_BG_SIZE,
      8
    );
    iconBg.lineStyle(2, qualityColor);
    iconBg.strokeRoundedRect(
      MaterialItemRowLayout.ICON_BG_X,
      MaterialItemRowLayout.ICON_BG_Y,
      MaterialItemRowLayout.ICON_BG_SIZE,
      MaterialItemRowLayout.ICON_BG_SIZE,
      8
    );
    container.add(iconBg);

    // 素材名
    const name = this.add.text(MaterialItemRowLayout.NAME_X, MaterialItemRowLayout.NAME_Y, material.name, {
      ...TextStyles.body,
      fontSize: '16px',
      fontStyle: 'bold',
    });
    container.add(name);

    // カテゴリ
    const category = this.add.text(
      MaterialItemRowLayout.CATEGORY_X,
      MaterialItemRowLayout.CATEGORY_Y,
      material.materialCategory ?? '素材',
      {
        ...TextStyles.body,
        fontSize: '12px',
        color: '#888888',
      }
    );
    container.add(category);

    // 単価
    const unitPrice = this.add.text(
      MaterialItemRowLayout.UNIT_PRICE_X,
      MaterialItemRowLayout.UNIT_PRICE_Y,
      `${material.price} G / 個`,
      {
        ...TextStyles.body,
        fontSize: '14px',
        color: '#ffcc00',
      }
    );
    container.add(unitPrice);

    // 在庫
    const stockText = material.stock === QuantitySelectorConfig.INFINITE_STOCK
      ? StockDisplayConfig.INFINITE_SYMBOL
      : `${StockDisplayConfig.STOCK_PREFIX} ${material.stock}`;
    const stock = this.add.text(
      MaterialItemRowLayout.STOCK_X,
      MaterialItemRowLayout.STOCK_Y,
      stockText,
      {
        ...TextStyles.body,
        fontSize: '14px',
        color: material.stock === 0 ? StockDisplayConfig.OUT_OF_STOCK_COLOR : StockDisplayConfig.IN_STOCK_COLOR,
      }
    );
    container.add(stock);

    // インタラクション
    container.setSize(WIDTH, HEIGHT);
    container.setInteractive({ useHandCursor: material.stock !== 0 });

    container.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(Colors.panelBackgroundLight, 1);
      bg.fillRoundedRect(0, 0, WIDTH, HEIGHT, 8);
    });

    container.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(Colors.backgroundLight, 1);
      bg.fillRoundedRect(0, 0, WIDTH, HEIGHT, 8);
    });

    container.on('pointerdown', () => {
      if (material.stock !== 0) {
        this.selectMaterial(material);
      }
    });

    return container;
  }

  /**
   * 品質に応じた色を取得
   */
  private getQualityColor(quality: number): number {
    if (quality >= MaterialQualityThresholds.HIGH_MIN) {
      return MaterialQualityColors.high;
    }
    if (quality >= MaterialQualityThresholds.MEDIUM_MIN) {
      return MaterialQualityColors.medium;
    }
    return MaterialQualityColors.low;
  }

  /**
   * 品質レベルを取得
   */
  private getQualityLevel(quality: number): MaterialQuality {
    if (quality >= MaterialQualityThresholds.HIGH_MIN) {
      return 'high';
    }
    if (quality >= MaterialQualityThresholds.MEDIUM_MIN) {
      return 'medium';
    }
    return 'low';
  }

  /**
   * 素材を選択
   */
  private selectMaterial(material: ShopMaterialItem): void {
    this.selectedItem = material;
    this.updateMaterialDetailPanel(material);
    this.purchaseButton.setVisible(true);
  }

  /**
   * アーティファクト商品行を作成
   */
  private createArtifactItemRow(artifact: ShopArtifactItem): Phaser.GameObjects.Container {
    const container = this.add.container(0, 0);
    const { WIDTH, HEIGHT } = ArtifactItemRowLayout;

    // 背景（レア度に応じた装飾）
    const rarityColor = RarityColors[artifact.rarity] ?? RarityColors.common;
    const bg = this.add.graphics();
    bg.fillStyle(Colors.backgroundLight, 1);
    bg.fillRoundedRect(0, 0, WIDTH, HEIGHT, 8);
    bg.lineStyle(2, rarityColor, 0.5);
    bg.strokeRoundedRect(0, 0, WIDTH, HEIGHT, 8);
    bg.setName('bg');
    container.add(bg);

    // アイコン
    const iconBg = this.add.graphics();
    iconBg.fillStyle(rarityColor, 0.3);
    iconBg.fillRoundedRect(
      ArtifactItemRowLayout.ICON_BG_X,
      ArtifactItemRowLayout.ICON_BG_Y,
      ArtifactItemRowLayout.ICON_BG_WIDTH,
      ArtifactItemRowLayout.ICON_BG_HEIGHT,
      8
    );
    container.add(iconBg);

    const icon = this.add.text(
      ArtifactItemRowLayout.ICON_CENTER_X,
      ArtifactItemRowLayout.ICON_CENTER_Y,
      ArtifactIcon,
      { fontSize: '32px' }
    ).setOrigin(0.5);
    container.add(icon);

    // 名前
    const name = this.add.text(ArtifactItemRowLayout.NAME_X, ArtifactItemRowLayout.NAME_Y, artifact.name, {
      ...TextStyles.body,
      fontSize: '16px',
      fontStyle: 'bold',
    });
    container.add(name);

    // レアリティ
    const rarityLabel = ArtifactRarityLabels[artifact.rarity] ?? ArtifactRarityLabels.common;
    const rarity = this.add.text(ArtifactItemRowLayout.RARITY_X, ArtifactItemRowLayout.RARITY_Y, rarityLabel, {
      ...TextStyles.body,
      fontSize: '12px',
      color: `#${rarityColor.toString(16).padStart(6, '0')}`,
    });
    container.add(rarity);

    // 効果概要
    const effectSummary = artifact.effects?.[0]?.description ?? '特殊効果';
    const truncatedEffect = effectSummary.length > 30 ? effectSummary.slice(0, 27) + '...' : effectSummary;
    const effect = this.add.text(ArtifactItemRowLayout.EFFECT_X, ArtifactItemRowLayout.EFFECT_Y, truncatedEffect, {
      ...TextStyles.body,
      fontSize: '11px',
      color: '#aaaaaa',
    });
    container.add(effect);

    // 価格
    const canAfford = artifact.price <= this.playerGold;
    const price = this.add.text(ArtifactItemRowLayout.PRICE_X, ArtifactItemRowLayout.PRICE_Y, `${artifact.price} G`, {
      ...TextStyles.body,
      fontSize: '18px',
      fontStyle: 'bold',
      color: canAfford ? '#ffcc00' : ShopColors.priceCannotAfford,
    });
    container.add(price);

    // インタラクション
    container.setSize(WIDTH, HEIGHT);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(Colors.panelBackgroundLight, 1);
      bg.fillRoundedRect(0, 0, WIDTH, HEIGHT, 8);
      bg.lineStyle(2, rarityColor, 0.7);
      bg.strokeRoundedRect(0, 0, WIDTH, HEIGHT, 8);
    });

    container.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(Colors.backgroundLight, 1);
      bg.fillRoundedRect(0, 0, WIDTH, HEIGHT, 8);
      bg.lineStyle(2, rarityColor, 0.5);
      bg.strokeRoundedRect(0, 0, WIDTH, HEIGHT, 8);
    });

    container.on('pointerdown', () => {
      this.selectArtifact(artifact);
    });

    return container;
  }

  /**
   * アーティファクトを選択
   */
  private selectArtifact(artifact: ShopArtifactItem): void {
    this.selectedItem = artifact;
    this.updateArtifactDetailPanel(artifact);
    this.purchaseButton.setVisible(true);
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
    let items: ShopItemUnion[] = [];
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
  selectItem(item: ShopItemUnion): void {
    this.selectedItem = item;
    this.updateDetailPanel();
    this.purchaseButton.setVisible(true);
  }

  /**
   * 詳細パネルを更新
   */
  private updateDetailPanel(): void {
    // 詳細コンテンツをクリア（背景とプレースホルダー以外）
    this.clearDetailPanelContent();

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

    // 数量セレクタをクリア
    this.quantitySelector = null;

    // 価格を先に取得（型ガードの前）
    const itemPrice = this.selectedItem.price;

    // カテゴリに応じた詳細表示
    if (isShopCardItem(this.selectedItem)) {
      this.updateCardDetailPanel(this.selectedItem);
    } else if (isShopMaterialItem(this.selectedItem)) {
      this.updateMaterialDetailPanel(this.selectedItem);
    } else if (isShopArtifactItem(this.selectedItem)) {
      this.updateArtifactDetailPanel(this.selectedItem);
    } else {
      this.updateGenericDetailPanel(this.selectedItem);
    }

    // 購入ボタンの有効/無効（素材は数量に応じて計算）
    let canAfford = itemPrice <= this.playerGold;
    // 注: updateMaterialDetailPanel内でquantitySelectorが再設定される
    // TypeScriptの制御フロー分析では追跡できないため、明示的な型キャストを使用
    const qsAfterUpdate = this.quantitySelector as QuantitySelectorState | null;
    if (this.currentCategory === 'materials' && qsAfterUpdate !== null) {
      const qty = qsAfterUpdate.quantity;
      const total = itemPrice * qty;
      canAfford = total <= this.playerGold;
    }
    this.uiFactory.setButtonEnabled(this.purchaseButton, canAfford);
  }

  /**
   * 詳細パネルの内容をクリア
   */
  private clearDetailPanelContent(): void {
    const childrenToRemove: Phaser.GameObjects.GameObject[] = [];
    this.detailPanel.each((child: Phaser.GameObjects.GameObject) => {
      if (child.name !== 'background' && child.name !== 'placeholder') {
        childrenToRemove.push(child);
      }
    });
    childrenToRemove.forEach(child => {
      this.detailPanel.remove(child, true);
    });
  }

  /**
   * カード詳細パネルを更新
   */
  private updateCardDetailPanel(card: ShopCardItem): void {
    const { DETAIL_AREA } = ShopSceneLayout;

    // カードプレビュー
    const cardPreview = this.createCardPreview(card, DETAIL_AREA.WIDTH / 2, CardDetailPanelLayout.PREVIEW_Y);
    this.detailPanel.add(cardPreview);

    // カード名
    const nameText = this.add.text(DETAIL_AREA.WIDTH / 2, CardDetailPanelLayout.NAME_Y, card.name, {
      ...TextStyles.titleSmall,
    }).setOrigin(0.5);
    this.detailPanel.add(nameText);

    // タイプ・レアリティ
    const typeLabel = CardTypeLabels[card.type] ?? 'カード';
    const typeText = this.add.text(DETAIL_AREA.WIDTH / 2, CardDetailPanelLayout.TYPE_Y, typeLabel, {
      ...TextStyles.body,
      fontSize: '14px',
      color: '#888888',
    }).setOrigin(0.5);
    this.detailPanel.add(typeText);

    // 効果説明
    const effectDescription = this.getCardFullDescription(card);
    const descText = this.add.text(20, CardDetailPanelLayout.DESCRIPTION_Y, effectDescription, {
      ...TextStyles.body,
      fontSize: '13px',
      wordWrap: { width: DETAIL_AREA.WIDTH - 40 },
      lineSpacing: CardDetailPanelLayout.DESCRIPTION_LINE_SPACING,
    });
    this.detailPanel.add(descText);

    // 価格
    const canAfford = card.price <= this.playerGold;
    const priceText = this.add.text(DETAIL_AREA.WIDTH / 2, CardDetailPanelLayout.PRICE_Y, `${card.price} G`, {
      ...TextStyles.body,
      fontSize: '24px',
      color: canAfford ? '#ffcc00' : ShopColors.priceCannotAfford,
    }).setOrigin(0.5);
    this.detailPanel.add(priceText);

    // 購入不可メッセージ
    if (!canAfford) {
      const warningText = this.add.text(DETAIL_AREA.WIDTH / 2, CardDetailPanelLayout.WARNING_Y, 'ゴールドが足りません', {
        ...TextStyles.body,
        fontSize: '12px',
        color: ShopColors.priceCannotAfford,
      }).setOrigin(0.5);
      this.detailPanel.add(warningText);
    }
  }

  /**
   * カードプレビューを作成
   */
  private createCardPreview(card: ShopCardItem, x: number, y: number): Phaser.GameObjects.Container {
    const preview = this.add.container(x, y);
    const { WIDTH, HEIGHT, BORDER_RADIUS } = CardPreviewSize;

    // カード背景
    const bg = this.add.graphics();
    const rarityColor = RarityColors[card.rarity] ?? 0xaaaaaa;
    bg.fillStyle(rarityColor, 0.3);
    bg.fillRoundedRect(-WIDTH / 2, -HEIGHT / 2, WIDTH, HEIGHT, BORDER_RADIUS);
    bg.lineStyle(2, rarityColor);
    bg.strokeRoundedRect(-WIDTH / 2, -HEIGHT / 2, WIDTH, HEIGHT, BORDER_RADIUS);
    preview.add(bg);

    // タイプアイコン
    const typeIcon = CardTypeIcons[card.type] ?? '🃏';
    const icon = this.add.text(0, -20, typeIcon, {
      fontSize: `${CardPreviewSize.ICON_SIZE}px`,
    }).setOrigin(0.5);
    preview.add(icon);

    // 名前（短縮）
    const maxLen = CardPreviewSize.NAME_MAX_LENGTH;
    const shortName = card.name.length > maxLen ? card.name.slice(0, maxLen - 1) + '…' : card.name;
    const nameText = this.add.text(0, 30, shortName, {
      fontSize: '12px',
      color: '#ffffff',
    }).setOrigin(0.5);
    preview.add(nameText);

    return preview;
  }

  /**
   * カードの詳細説明を取得
   */
  private getCardFullDescription(card: ShopCardItem): string {
    let desc = '';

    switch (card.type) {
      case 'gathering':
        desc = '【採取地】\n';
        desc += '採取可能素材:\n';
        if (card.materials && card.materials.length > 0) {
          card.materials.forEach((mat) => {
            const prob = mat.probability !== undefined ? ` (${mat.probability}%)` : '';
            desc += `  • ${mat.name}${prob}\n`;
          });
        } else {
          desc += '  なし\n';
        }
        break;

      case 'recipe':
        desc = '【レシピ】\n';
        desc += `作成アイテム: ${card.outputItem?.name ?? '不明'}\n`;
        desc += '必要素材:\n';
        if (card.requiredMaterials && card.requiredMaterials.length > 0) {
          card.requiredMaterials.forEach((mat) => {
            const qty = mat.quantity !== undefined ? ` x${mat.quantity}` : '';
            desc += `  • ${mat.name}${qty}\n`;
          });
        } else {
          desc += '  なし\n';
        }
        break;

      case 'enhance':
        desc = '【強化】\n';
        desc += card.effect?.description ?? '効果不明';
        break;
    }

    return desc;
  }

  /**
   * 一般商品の詳細パネルを更新
   */
  private updateGenericDetailPanel(item: ShopItem): void {
    const { DETAIL_AREA } = ShopSceneLayout;

    // 選択商品の詳細表示
    const nameText = this.add.text(20, 20, item.name, {
      ...TextStyles.titleSmall,
    });
    this.detailPanel.add(nameText);

    const canAfford = item.price <= this.playerGold;
    const priceText = this.add.text(20, 60, `価格: ${item.price} G`, {
      ...TextStyles.body,
      color: canAfford ? ShopColors.priceAffordable : ShopColors.priceCannotAfford,
    });
    this.detailPanel.add(priceText);

    if (item.description) {
      const descText = this.add.text(20, 100, item.description, {
        ...TextStyles.body,
        wordWrap: { width: DETAIL_AREA.WIDTH - 40 },
      });
      this.detailPanel.add(descText);
    }
  }

  /**
   * 素材詳細パネルを更新
   */
  private updateMaterialDetailPanel(material: ShopMaterialItem): void {
    const { DETAIL_AREA } = ShopSceneLayout;

    // 素材名
    const nameText = this.add.text(DETAIL_AREA.WIDTH / 2, MaterialDetailPanelLayout.NAME_Y, material.name, {
      ...TextStyles.titleSmall,
    }).setOrigin(0.5);
    this.detailPanel.add(nameText);

    // 品質
    const qualityLevel = this.getQualityLevel(material.quality);
    const qualityColor = MaterialQualityColorStrings[qualityLevel];
    const qualityLabel = MaterialQualityLabels[qualityLevel];
    const qualityText = this.add.text(
      DETAIL_AREA.WIDTH / 2,
      MaterialDetailPanelLayout.QUALITY_Y,
      `品質: ${material.quality} (${qualityLabel})`,
      {
        ...TextStyles.body,
        color: qualityColor,
      }
    ).setOrigin(0.5);
    this.detailPanel.add(qualityText);

    // カテゴリ
    const categoryText = this.add.text(
      DETAIL_AREA.WIDTH / 2,
      MaterialDetailPanelLayout.CATEGORY_Y,
      material.materialCategory ?? '素材',
      {
        ...TextStyles.body,
        fontSize: '14px',
        color: '#888888',
      }
    ).setOrigin(0.5);
    this.detailPanel.add(categoryText);

    // 説明
    if (material.description) {
      const descText = this.add.text(
        MaterialDetailPanelLayout.DESCRIPTION_X,
        MaterialDetailPanelLayout.DESCRIPTION_Y,
        material.description,
        {
          ...TextStyles.body,
          fontSize: '13px',
          wordWrap: { width: DETAIL_AREA.WIDTH - 40 },
        }
      );
      this.detailPanel.add(descText);
    }

    // 数量選択UI
    this.createQuantitySelector(material, DETAIL_AREA.WIDTH / 2, MaterialDetailPanelLayout.QUANTITY_SELECTOR_Y);

    // 合計金額コンテナ
    const totalContainer = this.add.container(DETAIL_AREA.WIDTH / 2, MaterialDetailPanelLayout.TOTAL_Y);
    this.detailPanel.add(totalContainer);

    const totalLabel = this.add.text(-50, 0, '合計:', {
      ...TextStyles.body,
      fontSize: '16px',
    });
    totalContainer.add(totalLabel);

    const totalValue = this.add.text(50, 0, `${material.price} G`, {
      ...TextStyles.titleSmall,
      fontSize: '20px',
      color: '#ffcc00',
    }).setOrigin(0.5);
    totalValue.setName('totalValue');
    totalContainer.add(totalValue);

    // 数量セレクタの合計テキストを設定
    if (this.quantitySelector) {
      this.quantitySelector.totalText = totalValue;
    }
  }

  /**
   * 数量セレクタを作成
   */
  private createQuantitySelector(material: ShopMaterialItem, x: number, y: number): void {
    const container = this.add.container(x, y);
    this.detailPanel.add(container);

    // ラベル
    const label = this.add.text(0, QuantitySelectorLayout.LABEL_OFFSET_Y, '購入数量', {
      ...TextStyles.body,
      fontSize: '14px',
    }).setOrigin(0.5);
    container.add(label);

    // マイナスボタン
    const minusBtn = this.createQuantityButton('-', QuantitySelectorLayout.MINUS_X, 0, () => {
      this.changeQuantity(-1, material);
    });
    container.add(minusBtn);

    // 数量テキスト
    const quantityText = this.add.text(0, 0, '1', {
      ...TextStyles.titleSmall,
      fontSize: `${QuantitySelectorLayout.QUANTITY_FONT_SIZE}px`,
    }).setOrigin(0.5);
    container.add(quantityText);

    // プラスボタン
    const plusBtn = this.createQuantityButton('+', QuantitySelectorLayout.PLUS_X, 0, () => {
      this.changeQuantity(1, material);
    });
    container.add(plusBtn);

    // 最大購入ボタン
    const maxBtn = this.uiFactory.createSecondaryButton({
      x: 0,
      y: QuantitySelectorLayout.MAX_BUTTON_Y,
      width: QuantitySelectorLayout.MAX_BUTTON_WIDTH,
      height: QuantitySelectorLayout.MAX_BUTTON_HEIGHT,
      text: 'MAX',
      onClick: () => this.setMaxQuantity(material),
    });
    container.add(maxBtn);

    this.quantitySelector = {
      container,
      quantity: 1,
      minusButton: minusBtn,
      plusButton: plusBtn,
      quantityText,
      totalText: null,
    };
  }

  /**
   * 数量ボタンを作成
   */
  private createQuantityButton(
    label: string,
    x: number,
    y: number,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const btn = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(Colors.primary, 1);
    bg.fillCircle(0, 0, QuantitySelectorLayout.BUTTON_RADIUS);
    bg.setName('bg');
    btn.add(bg);

    const text = this.add.text(0, 0, label, {
      fontSize: '20px',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    btn.add(text);

    btn.setSize(QuantitySelectorLayout.BUTTON_RADIUS * 2, QuantitySelectorLayout.BUTTON_RADIUS * 2);
    btn.setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(Colors.primaryHover, 1);
      bg.fillCircle(0, 0, QuantitySelectorLayout.BUTTON_RADIUS);
    });

    btn.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(Colors.primary, 1);
      bg.fillCircle(0, 0, QuantitySelectorLayout.BUTTON_RADIUS);
    });

    btn.on('pointerdown', onClick);

    return btn;
  }

  /**
   * 数量を変更
   */
  private changeQuantity(delta: number, material: ShopMaterialItem): void {
    if (!this.quantitySelector) return;

    const maxQuantity = this.calculateMaxQuantity(material);
    let newQuantity = this.quantitySelector.quantity + delta;
    newQuantity = Phaser.Math.Clamp(newQuantity, QuantitySelectorConfig.MIN_QUANTITY, maxQuantity);

    this.quantitySelector.quantity = newQuantity;
    this.quantitySelector.quantityText.setText(newQuantity.toString());

    // 合計金額更新
    const total = newQuantity * material.price;
    const canAfford = total <= this.playerGold;
    if (this.quantitySelector.totalText) {
      this.quantitySelector.totalText.setText(`${total} G`);
      this.quantitySelector.totalText.setColor(canAfford ? '#ffcc00' : ShopColors.priceCannotAfford);
    }

    // 購入ボタンの有効/無効
    this.uiFactory.setButtonEnabled(this.purchaseButton, canAfford);
  }

  /**
   * 最大数量を設定
   */
  private setMaxQuantity(material: ShopMaterialItem): void {
    if (!this.quantitySelector) return;

    const maxQuantity = this.calculateMaxQuantity(material);
    this.quantitySelector.quantity = maxQuantity;
    this.quantitySelector.quantityText.setText(maxQuantity.toString());

    const total = maxQuantity * material.price;
    const canAfford = total <= this.playerGold;
    if (this.quantitySelector.totalText) {
      this.quantitySelector.totalText.setText(`${total} G`);
      this.quantitySelector.totalText.setColor(canAfford ? '#ffcc00' : ShopColors.priceCannotAfford);
    }

    // 購入ボタンの有効/無効
    this.uiFactory.setButtonEnabled(this.purchaseButton, canAfford);
  }

  /**
   * 最大購入可能数を計算
   */
  private calculateMaxQuantity(material: ShopMaterialItem): number {
    // 所持金で買える最大数
    const maxByGold = Math.floor(this.playerGold / material.price);

    // 在庫制限
    const maxByStock = material.stock === QuantitySelectorConfig.INFINITE_STOCK
      ? QuantitySelectorConfig.MAX_QUANTITY
      : material.stock;

    return Math.min(maxByGold, maxByStock, QuantitySelectorConfig.MAX_QUANTITY);
  }

  /**
   * アーティファクト詳細パネルを更新
   */
  private updateArtifactDetailPanel(artifact: ShopArtifactItem): void {
    const { DETAIL_AREA } = ShopSceneLayout;

    // 名前
    const nameText = this.add.text(DETAIL_AREA.WIDTH / 2, ArtifactDetailPanelLayout.NAME_Y, artifact.name, {
      ...TextStyles.titleSmall,
    }).setOrigin(0.5);
    this.detailPanel.add(nameText);

    // レアリティ
    const rarityColor = RarityColors[artifact.rarity] ?? RarityColors.common;
    const rarityLabel = ArtifactRarityLabels[artifact.rarity] ?? ArtifactRarityLabels.common;
    const rarityText = this.add.text(DETAIL_AREA.WIDTH / 2, ArtifactDetailPanelLayout.RARITY_Y, rarityLabel, {
      ...TextStyles.body,
      color: `#${rarityColor.toString(16).padStart(6, '0')}`,
    }).setOrigin(0.5);
    this.detailPanel.add(rarityText);

    // 効果一覧
    let y: number = ArtifactDetailPanelLayout.EFFECTS_LABEL_Y;
    const effectsLabel = this.add.text(ArtifactDetailPanelLayout.EFFECTS_LABEL_X, y, '【効果】', {
      ...TextStyles.body,
      fontStyle: 'bold',
    });
    this.detailPanel.add(effectsLabel);
    y = ArtifactDetailPanelLayout.EFFECTS_START_Y;

    if (artifact.effects && artifact.effects.length > 0) {
      artifact.effects.forEach((effect) => {
        const effectText = this.add.text(ArtifactDetailPanelLayout.EFFECTS_ITEM_X, y, `• ${effect.description}`, {
          ...TextStyles.body,
          fontSize: '13px',
          wordWrap: { width: DETAIL_AREA.WIDTH - 60 },
        });
        this.detailPanel.add(effectText);
        y += effectText.height + ArtifactDetailPanelLayout.EFFECTS_LINE_HEIGHT;
      });
    } else {
      const noEffectText = this.add.text(ArtifactDetailPanelLayout.EFFECTS_ITEM_X, y, '• 特殊効果', {
        ...TextStyles.body,
        fontSize: '13px',
      });
      this.detailPanel.add(noEffectText);
      y += noEffectText.height + ArtifactDetailPanelLayout.EFFECTS_LINE_HEIGHT;
    }

    // 装備条件（あれば）
    if (artifact.requirement) {
      y += ArtifactDetailPanelLayout.REQUIREMENT_LABEL_OFFSET_Y;
      const reqLabel = this.add.text(ArtifactDetailPanelLayout.EFFECTS_LABEL_X, y, '【装備条件】', {
        ...TextStyles.body,
        fontStyle: 'bold',
      });
      this.detailPanel.add(reqLabel);
      y += ArtifactDetailPanelLayout.REQUIREMENT_TEXT_OFFSET_Y;

      const reqText = this.add.text(ArtifactDetailPanelLayout.EFFECTS_ITEM_X, y, artifact.requirement, {
        ...TextStyles.body,
        fontSize: '13px',
      });
      this.detailPanel.add(reqText);
    }

    // 価格
    const canAfford = artifact.price <= this.playerGold;
    const priceText = this.add.text(DETAIL_AREA.WIDTH / 2, ArtifactDetailPanelLayout.PRICE_Y, `${artifact.price} G`, {
      ...TextStyles.titleSmall,
      fontSize: '24px',
      color: canAfford ? '#ffcc00' : ShopColors.priceCannotAfford,
    }).setOrigin(0.5);
    this.detailPanel.add(priceText);

    // 購入不可メッセージ
    if (!canAfford) {
      const warningText = this.add.text(DETAIL_AREA.WIDTH / 2, ArtifactDetailPanelLayout.PRICE_Y + 30, 'ゴールドが足りません', {
        ...TextStyles.body,
        fontSize: '12px',
        color: ShopColors.priceCannotAfford,
      }).setOrigin(0.5);
      this.detailPanel.add(warningText);
    }
  }

  /**
   * 購入処理（購入確認ダイアログを表示）
   */
  private handlePurchase(): void {
    if (!this.selectedItem) return;

    // 素材の場合は数量を考慮
    if (isShopMaterialItem(this.selectedItem) && this.quantitySelector) {
      const totalPrice = this.selectedItem.price * this.quantitySelector.quantity;
      if (totalPrice > this.playerGold) {
        this.showPurchaseError('ゴールドが足りません');
        return;
      }
      this.showMaterialPurchaseConfirmDialog(this.selectedItem, this.quantitySelector.quantity);
      return;
    }

    if (this.selectedItem.price > this.playerGold) {
      this.showPurchaseError('ゴールドが足りません');
      return;
    }

    // 購入確認ダイアログを表示
    this.showPurchaseConfirmDialog(this.selectedItem);
  }

  /**
   * 素材購入確認ダイアログを表示
   */
  private showMaterialPurchaseConfirmDialog(material: ShopMaterialItem, quantity: number): void {
    // 既存ダイアログがあれば破棄
    if (this.confirmDialog) {
      this.confirmDialog.destroy();
      this.confirmDialog = null;
    }

    const totalPrice = material.price * quantity;

    const dialog = this.add.container(0, 0);
    dialog.setDepth(150);

    // オーバーレイ背景
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, ShopSceneLayout.SCREEN_WIDTH, ShopSceneLayout.SCREEN_HEIGHT);
    overlay.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, ShopSceneLayout.SCREEN_WIDTH, ShopSceneLayout.SCREEN_HEIGHT),
      Phaser.Geom.Rectangle.Contains
    );
    dialog.add(overlay);

    // ダイアログボックス
    const boxWidth = 400;
    const boxHeight = 220;
    const boxX = (ShopSceneLayout.SCREEN_WIDTH - boxWidth) / 2;
    const boxY = (ShopSceneLayout.SCREEN_HEIGHT - boxHeight) / 2;

    const box = this.add.graphics();
    box.fillStyle(Colors.panelBackground, 1);
    box.fillRoundedRect(boxX, boxY, boxWidth, boxHeight, 12);
    box.lineStyle(2, Colors.panelBorder);
    box.strokeRoundedRect(boxX, boxY, boxWidth, boxHeight, 12);
    dialog.add(box);

    // タイトル
    const title = this.add.text(ShopSceneLayout.SCREEN_WIDTH / 2, boxY + 30, '購入確認', {
      ...TextStyles.titleSmall,
    }).setOrigin(0.5);
    dialog.add(title);

    // メッセージ
    const message = this.add.text(
      ShopSceneLayout.SCREEN_WIDTH / 2,
      boxY + 90,
      `「${material.name}」× ${quantity}\n合計 ${totalPrice} G で購入しますか？`,
      {
        ...TextStyles.body,
        align: 'center',
      }
    ).setOrigin(0.5);
    dialog.add(message);

    // ボタン
    const buttonY = boxY + boxHeight - 50;
    const cancelBtn = this.uiFactory.createSecondaryButton({
      x: boxX + 60,
      y: buttonY,
      width: 120,
      height: 40,
      text: 'キャンセル',
      onClick: () => this.closePurchaseConfirmDialog(),
    });
    dialog.add(cancelBtn);

    const confirmBtn = this.uiFactory.createPrimaryButton({
      x: boxX + boxWidth - 180,
      y: buttonY,
      width: 120,
      height: 40,
      text: '購入',
      onClick: () => this.executeMaterialPurchase(material, quantity),
    });
    dialog.add(confirmBtn);

    this.confirmDialog = dialog;
  }

  /**
   * 素材購入を実行
   */
  private executeMaterialPurchase(material: ShopMaterialItem, quantity: number): void {
    // ダイアログを閉じる
    this.closePurchaseConfirmDialog();

    // ローディングオーバーレイを表示
    this.showLoadingOverlay('購入中...');

    // イベント発火
    this.eventBus.emit('shop:purchase:requested', {
      item: {
        id: material.id,
        name: material.name,
        price: material.price,
        description: material.description,
        category: 'materials' as const,
        data: material.data,
      },
      category: 'materials',
      quantity: quantity,
      totalPrice: material.price * quantity,
    });
  }

  /**
   * 購入確認ダイアログを表示
   */
  private showPurchaseConfirmDialog(item: ShopItemUnion): void {
    // 既存ダイアログがあれば破棄
    if (this.confirmDialog) {
      this.confirmDialog.destroy();
      this.confirmDialog = null;
    }

    const dialog = this.add.container(0, 0);
    dialog.setDepth(150);

    // オーバーレイ背景
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, ShopSceneLayout.SCREEN_WIDTH, ShopSceneLayout.SCREEN_HEIGHT);
    overlay.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, ShopSceneLayout.SCREEN_WIDTH, ShopSceneLayout.SCREEN_HEIGHT),
      Phaser.Geom.Rectangle.Contains
    );
    dialog.add(overlay);

    // ダイアログボックス
    const boxWidth = 400;
    const boxHeight = 200;
    const boxX = (ShopSceneLayout.SCREEN_WIDTH - boxWidth) / 2;
    const boxY = (ShopSceneLayout.SCREEN_HEIGHT - boxHeight) / 2;

    const box = this.add.graphics();
    box.fillStyle(Colors.panelBackground, 1);
    box.fillRoundedRect(boxX, boxY, boxWidth, boxHeight, 12);
    box.lineStyle(2, Colors.panelBorder);
    box.strokeRoundedRect(boxX, boxY, boxWidth, boxHeight, 12);
    dialog.add(box);

    // タイトル
    const title = this.add.text(ShopSceneLayout.SCREEN_WIDTH / 2, boxY + 30, '購入確認', {
      ...TextStyles.titleSmall,
    }).setOrigin(0.5);
    dialog.add(title);

    // メッセージ
    const message = this.add.text(
      ShopSceneLayout.SCREEN_WIDTH / 2,
      boxY + 80,
      `「${item.name}」を\n${item.price} G で購入しますか？`,
      {
        ...TextStyles.body,
        align: 'center',
      }
    ).setOrigin(0.5);
    dialog.add(message);

    // ボタン
    const buttonY = boxY + boxHeight - 50;
    const cancelBtn = this.uiFactory.createSecondaryButton({
      x: boxX + 60,
      y: buttonY,
      width: 120,
      height: 40,
      text: 'キャンセル',
      onClick: () => this.closePurchaseConfirmDialog(),
    });
    dialog.add(cancelBtn);

    const confirmBtn = this.uiFactory.createPrimaryButton({
      x: boxX + boxWidth - 180,
      y: buttonY,
      width: 120,
      height: 40,
      text: '購入',
      onClick: () => this.executePurchase(item),
    });
    dialog.add(confirmBtn);

    this.confirmDialog = dialog;
  }

  /**
   * 購入確認ダイアログを閉じる
   */
  private closePurchaseConfirmDialog(): void {
    if (this.confirmDialog) {
      this.confirmDialog.destroy();
      this.confirmDialog = null;
    }
  }

  /**
   * 購入を実行
   */
  private executePurchase(item: ShopItemUnion): void {
    // ダイアログを閉じる
    this.closePurchaseConfirmDialog();

    // ローディングオーバーレイを表示
    this.showLoadingOverlay('購入中...');

    // イベント発火（Application層で処理）
    this.eventBus.emit('shop:purchase:requested', {
      item: item,
      category: this.currentCategory,
    });
  }

  /**
   * ローディングオーバーレイを表示
   */
  private showLoadingOverlay(message: string): void {
    // 既存のオーバーレイがあれば削除
    this.hideLoadingOverlay();

    const overlay = this.add.container(0, 0);
    overlay.setDepth(LoadingOverlayConfig.DEPTH);

    // 半透明背景
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.7);
    bg.fillRect(0, 0, ShopSceneLayout.SCREEN_WIDTH, ShopSceneLayout.SCREEN_HEIGHT);
    overlay.add(bg);

    // ローディングスピナー
    const spinner = this.add.graphics();
    spinner.lineStyle(LoadingOverlayConfig.SPINNER_LINE_WIDTH, Colors.primary);
    spinner.arc(
      ShopSceneLayout.SCREEN_WIDTH / 2,
      ShopSceneLayout.SCREEN_HEIGHT / 2,
      LoadingOverlayConfig.SPINNER_RADIUS,
      0,
      Phaser.Math.PI2 * LoadingOverlayConfig.SPINNER_ANGLE
    );
    spinner.strokePath();
    overlay.add(spinner);

    // 回転アニメーション
    this.tweens.add({
      targets: spinner,
      angle: 360,
      duration: LoadingOverlayConfig.ROTATION_DURATION,
      repeat: -1,
    });

    // メッセージ
    const text = this.add.text(
      ShopSceneLayout.SCREEN_WIDTH / 2,
      ShopSceneLayout.SCREEN_HEIGHT / 2 + LoadingOverlayConfig.MESSAGE_OFFSET_Y,
      message,
      { ...TextStyles.body }
    ).setOrigin(0.5);
    overlay.add(text);

    this.currentLoadingOverlay = overlay;
  }

  /**
   * ローディングオーバーレイを非表示
   */
  private hideLoadingOverlay(): void {
    if (this.currentLoadingOverlay) {
      this.currentLoadingOverlay.destroy();
      this.currentLoadingOverlay = null;
    }
  }

  /**
   * 戻る処理
   */
  private handleBack(): void {
    const returnScene = this.shopData.returnScene ?? SceneKeys.MAIN;
    // 戻り先シーンを再開
    this.scene.resume(returnScene);
    // このシーンを停止
    this.scene.stop();
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
  onPurchaseComplete(item: ShopItemUnion & { _purchaseQuantity?: number }): void {
    // ローディングオーバーレイを非表示
    this.hideLoadingOverlay();

    // カテゴリに応じた処理
    if (isShopCardItem(item)) {
      // カードの場合はアニメーションを再生
      this.playPurchaseAnimation(item);
      // 商品リストから除外
      if (this.shopData.availableCards) {
        this.shopData.availableCards = this.shopData.availableCards.filter(
          c => c.id !== item.id
        );
      }
      this.showPurchaseSuccess(`${item.name}を購入しました！`);
    } else if (isShopMaterialItem(item)) {
      // 素材の場合は在庫を更新
      const quantity = item._purchaseQuantity ?? 1;
      const material = this.shopData.availableMaterials?.find(m => m.id === item.id);
      if (material && material.stock !== QuantitySelectorConfig.INFINITE_STOCK) {
        material.stock -= quantity;
      }
      this.showPurchaseSuccess(`${item.name} × ${quantity} を購入しました！`);
    } else if (isShopArtifactItem(item)) {
      // アーティファクトの場合は商品リストから除外
      if (this.shopData.availableArtifacts) {
        this.shopData.availableArtifacts = this.shopData.availableArtifacts.filter(
          a => a.id !== item.id
        );
      }
      this.showPurchaseSuccess(`${item.name}を購入しました！`);
    } else {
      this.showPurchaseSuccess(`${item.name}を購入しました！`);
    }

    this.updateItemList();

    // 選択解除
    this.selectedItem = null;
    this.quantitySelector = null;
    this.updateDetailPanel();
    this.purchaseButton.setVisible(false);
  }

  /**
   * 素材購入完了通知（Application層から呼び出し）
   */
  onMaterialPurchaseComplete(result: { material: ShopMaterialItem; quantity: number; newGold: number }): void {
    this.updateGold(result.newGold);

    // 在庫更新
    const material = this.shopData.availableMaterials?.find(m => m.id === result.material.id);
    if (material && material.stock !== QuantitySelectorConfig.INFINITE_STOCK) {
      material.stock -= result.quantity;
    }

    this.hideLoadingOverlay();
    this.updateItemList();
    this.showPurchaseSuccess(`${result.material.name} × ${result.quantity} を購入しました！`);

    // 選択解除
    this.selectedItem = null;
    this.quantitySelector = null;
    this.updateDetailPanel();
    this.purchaseButton.setVisible(false);
  }

  /**
   * アーティファクト購入完了通知（Application層から呼び出し）
   */
  onArtifactPurchaseComplete(result: { artifact: ShopArtifactItem; newGold: number }): void {
    this.updateGold(result.newGold);

    // 購入済みアーティファクトを除外
    if (this.shopData.availableArtifacts) {
      this.shopData.availableArtifacts = this.shopData.availableArtifacts.filter(
        a => a.id !== result.artifact.id
      );
    }

    this.hideLoadingOverlay();
    this.updateItemList();
    this.showPurchaseSuccess(`${result.artifact.name} を購入しました！`);

    // 選択解除
    this.selectedItem = null;
    this.updateDetailPanel();
    this.purchaseButton.setVisible(false);
  }

  /**
   * 購入アニメーションを再生
   */
  private playPurchaseAnimation(card: ShopCardItem): void {
    const { DETAIL_AREA } = ShopSceneLayout;

    // アニメーション用カードプレビュー
    const animCard = this.createCardPreview(
      card,
      DETAIL_AREA.X + DETAIL_AREA.WIDTH / 2,
      DETAIL_AREA.Y + CardDetailPanelLayout.PREVIEW_Y
    );
    animCard.setDepth(PurchaseAnimationConfig.DEPTH);

    // カードが飛んでいくアニメーション
    this.tweens.add({
      targets: animCard,
      x: ShopSceneLayout.SCREEN_WIDTH + PurchaseAnimationConfig.END_X_OFFSET,
      y: PurchaseAnimationConfig.END_Y,
      scale: PurchaseAnimationConfig.END_SCALE,
      alpha: PurchaseAnimationConfig.END_ALPHA,
      duration: PurchaseAnimationConfig.DURATION,
      ease: PurchaseAnimationConfig.EASE,
      onComplete: () => {
        animCard.destroy();
      },
    });
  }

  /**
   * 購入失敗通知
   */
  onPurchaseFailed(error: { message: string }): void {
    this.hideLoadingOverlay();
    this.showPurchaseError(error.message);
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
  getSelectedItem(): ShopItemUnion | null {
    return this.selectedItem;
  }

  /**
   * プレイヤーの所持金を取得
   */
  getPlayerGold(): number {
    return this.playerGold;
  }

  /**
   * 購入確認ダイアログが表示中か確認
   */
  isConfirmDialogShowing(): boolean {
    return this.confirmDialog !== null;
  }

  /**
   * ローディング中か確認
   */
  isLoading(): boolean {
    return this.currentLoadingOverlay !== null;
  }
}
