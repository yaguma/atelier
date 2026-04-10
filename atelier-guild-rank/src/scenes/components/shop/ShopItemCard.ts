/**
 * ShopItemCardコンポーネント
 * TASK-0056 ShopSceneリファクタリング
 *
 * @description
 * 個別商品カードを表示するコンポーネント
 * - 商品名、タイプ、価格、在庫表示
 * - 購入ボタン
 * - ホバーエフェクト
 */

import type { RexLabel } from '@presentation/types/rexui';
import { BaseComponent } from '@presentation/ui/components/BaseComponent';
import { Colors, THEME } from '@presentation/ui/theme';
import { AnimationPresets, UIBackgroundBuilder } from '@presentation/ui/utils';
import Phaser from 'phaser';
import type { IShopItem, OnPurchaseCallback, ShopItemCardConfig } from './types';

/** タイプ表示名マッピング */
const TYPE_LABELS: Record<string, string> = {
  card: 'カード',
  material: '素材',
  artifact: 'アーティファクト',
};

/**
 * ShopItemCardコンポーネント
 * 個別商品カードのUI表示を担当
 */
export class ShopItemCard extends BaseComponent {
  /** 商品情報 */
  private item: IShopItem;

  /** 現在の所持金 */
  private currentGold: number;

  /** 購入コールバック */
  private onPurchase: OnPurchaseCallback;

  /**
   * 購入ボタン
   * TASK-0059: rexUI型定義を適用
   */
  private purchaseButton: RexLabel | null = null;

  /** カード背景 */
  private background: Phaser.GameObjects.Graphics | null = null;

  /**
   * コンストラクタ
   * @param scene Phaserシーン
   * @param config 設定
   * @throws {Error} itemがnullまたはundefinedの場合
   */
  constructor(scene: Phaser.Scene, config: ShopItemCardConfig) {
    super(scene, config.x, config.y);

    if (!config.item) {
      throw new Error('ShopItemCard: item is required');
    }

    this.item = config.item;
    this.currentGold = config.currentGold;
    this.onPurchase = config.onPurchase;
  }

  /**
   * コンポーネントを作成
   */
  create(): void {
    // カード背景を作成（UIBackgroundBuilder使用）
    this.background = new UIBackgroundBuilder(this.scene)
      .setPosition(0, 0)
      .setSize(200, 180)
      .setFill(Colors.background.card, 0.95)
      .setBorder(Colors.border.primary, 2)
      .setRadius(8)
      .build();
    this.container.add(this.background);

    // 商品名
    const nameText = this.scene.make.text({
      x: 10,
      y: 10,
      text: this.item.name,
      style: {
        fontSize: `${THEME.sizes.medium}px`,
        color: `#${Colors.text.primary.toString(16).padStart(6, '0')}`,
      },
      add: false,
    });
    nameText.setOrigin(0, 0);
    this.container.add(nameText);

    // タイプ表示
    const typeLabel = TYPE_LABELS[this.item.type] || this.item.type;
    const typeText = this.scene.make.text({
      x: 10,
      y: 35,
      text: `[${typeLabel}]`,
      style: {
        fontSize: `${THEME.sizes.small}px`,
        color: `#${Colors.text.secondary.toString(16).padStart(6, '0')}`,
      },
      add: false,
    });
    typeText.setOrigin(0, 0);
    this.container.add(typeText);

    // 価格表示
    const priceText = this.scene.make.text({
      x: 10,
      y: 60,
      text: `${this.item.price}G`,
      style: {
        fontSize: `${THEME.sizes.medium}px`,
        color: `#${Colors.text.accent.toString(16).padStart(6, '0')}`,
      },
      add: false,
    });
    priceText.setOrigin(0, 0);
    this.container.add(priceText);

    // 在庫表示
    const stockDisplay = this.item.stock === -1 ? '∞' : this.item.stock.toString();
    const stockText = this.scene.make.text({
      x: 10,
      y: 85,
      text: `在庫: ${stockDisplay}`,
      style: {
        fontSize: `${THEME.sizes.small}px`,
        color: `#${Colors.text.secondary.toString(16).padStart(6, '0')}`,
      },
      add: false,
    });
    stockText.setOrigin(0, 0);
    this.container.add(stockText);

    // 購入ボタンを作成
    this.createPurchaseButton();

    // ホバーアニメーションを設定
    this.setupHoverAnimation();
  }

  /**
   * 購入ボタンを作成
   */
  private createPurchaseButton(): void {
    if (!this.rexUI?.add?.label) {
      return;
    }

    // 購入可否を判定 - Issue #460: A11y - 無効理由をテキスト表示
    const canPurchase = this.canPurchase();
    const buttonText = this.item.stock === 0 ? '売切' : !canPurchase ? '購入(金不足)' : '購入';
    const buttonColor = canPurchase ? Colors.ui.button.normal : Colors.ui.button.disabled;

    // rexUIラベルで購入ボタンを作成
    // Issue #460: A11y - タッチターゲット最小44px
    this.purchaseButton = this.rexUI.add.label({
      x: 100,
      y: 145,
      width: 100,
      height: 44,
      background: this.scene.add
        .graphics()
        .fillStyle(buttonColor, 1)
        .fillRoundedRect(0, 0, 100, 44, 4),
      // rexUI labelのtext引数にはシーンに追加済みのGameObjectが必要なため scene.add.text を使用
      text: this.scene.add.text(0, 0, buttonText, {
        fontSize: `${THEME.sizes.small}px`,
        color: `#${Colors.text.primary.toString(16).padStart(6, '0')}`,
      }),
      align: 'center',
      // テスト検証用: ボタンテキストを名前として保持
      name: buttonText,
    });

    if (canPurchase) {
      this.purchaseButton.setInteractive();
      this.purchaseButton.on('pointerdown', () => {
        this.onPurchase(this.item.id);
      });
    } else {
      this.purchaseButton.setAlpha(0.5);
    }

    this.container.add(this.purchaseButton);
  }

  /**
   * 購入可否を判定
   * @returns 購入可能ならtrue
   */
  private canPurchase(): boolean {
    // 在庫切れチェック
    if (this.item.stock === 0) {
      return false;
    }
    // 所持金チェック
    if (this.currentGold < this.item.price) {
      return false;
    }
    return true;
  }

  /**
   * ホバーアニメーションを設定
   */
  private setupHoverAnimation(): void {
    // setInteractiveが存在しない場合はスキップ
    if (typeof this.container.setInteractive !== 'function') {
      return;
    }

    // Phaserが利用可能かチェック
    if (Phaser?.Geom?.Rectangle) {
      // コンテナをインタラクティブに
      this.container.setInteractive(
        new Phaser.Geom.Rectangle(0, 0, 200, 180),
        Phaser.Geom.Rectangle.Contains,
      );
    } else {
      // テスト環境などでPhaserがない場合は単純にインタラクティブに設定
      this.container.setInteractive();
    }

    // 【ホバー時の拡大】: AnimationPresetsを使用して一貫したアニメーションを適用 🔵
    this.container.on('pointerover', () => {
      this.scene.tweens.add({
        targets: this.container,
        ...AnimationPresets.scale.hover,
        scaleX: AnimationPresets.scale.hover.scale,
        scaleY: AnimationPresets.scale.hover.scale,
        duration: AnimationPresets.timing.fast,
      });
    });

    // 【ホバー終了時のリセット】: AnimationPresetsを使用して通常状態に戻す 🔵
    this.container.on('pointerout', () => {
      this.scene.tweens.add({
        targets: this.container,
        ...AnimationPresets.scale.resetXY,
      });
    });
  }

  /**
   * アイテム情報を取得
   * @returns アイテム情報
   */
  getItem(): IShopItem {
    return this.item;
  }

  /**
   * コンポーネントを破棄
   */
  destroy(): void {
    // ホバーイベントを解除（offメソッドが存在する場合のみ）
    if (typeof this.container.off === 'function') {
      this.container.off('pointerover');
      this.container.off('pointerout');
    }

    if (this.purchaseButton) {
      this.purchaseButton.destroy();
      this.purchaseButton = null;
    }
    if (this.background) {
      this.background.destroy();
      this.background = null;
    }
    this.container.destroy();
  }
}
