/**
 * CardUIコンポーネント
 * TASK-0021 カードUIコンポーネント
 *
 * @description
 * ゲーム内で使用されるカードの視覚的表現を提供するコンポーネント。
 * カードタイプに応じた色分け、インタラクティブな操作、アニメーション効果を実装。
 */

import type Phaser from 'phaser';
import type { Card } from '../../../domain/entities/Card';
import { BaseComponent } from './BaseComponent';

/**
 * カードUIの設定
 */
export interface CardUIConfig {
  /** 表示するカード */
  card: Card;
  /** X座標 */
  x: number;
  /** Y座標 */
  y: number;
  /** インタラクティブにするか（デフォルト: false） */
  interactive?: boolean;
  /** クリック時のコールバック */
  onClick?: (card: Card) => void;
}

/**
 * CardUIコンポーネント
 *
 * カードの視覚的表現を管理するコンポーネント。
 * 背景、アイコン、名前、コスト、効果テキストを表示し、
 * ホバー時の拡大やクリックイベントをサポートする。
 */
export class CardUI extends BaseComponent {
  private config: CardUIConfig;
  private card: Card;
  private background!: Phaser.GameObjects.Rectangle;
  private iconPlaceholder!: Phaser.GameObjects.Rectangle;
  private nameText!: Phaser.GameObjects.Text;
  private costText!: Phaser.GameObjects.Text;
  private effectText!: Phaser.GameObjects.Text;

  /**
   * カードの寸法定数
   */
  private static readonly CARD_WIDTH = 120;
  private static readonly CARD_HEIGHT = 160;
  private static readonly ICON_SIZE = 80;
  private static readonly PADDING = 8;

  constructor(scene: Phaser.Scene, config: CardUIConfig) {
    super(scene, config.x, config.y);

    // バリデーション: cardが必須
    if (!config.card) {
      throw new Error('CardUI: card is required');
    }

    this.config = {
      ...config,
      interactive: config.interactive ?? false,
    };
    this.card = config.card;

    // カードUIを生成
    this.create();
  }

  /**
   * カードUIを生成する（BaseComponentの抽象メソッド実装）
   */
  public create(): void {
    this.createBackground();
    this.createIcon();
    this.createName();
    this.createCost();
    this.createEffect();
    this.setupInteraction();
  }

  /**
   * カードの背景を作成
   * カードタイプに応じて色を変更する
   */
  private createBackground(): void {
    const color = this.getCardTypeColor();
    this.background = this.scene.add.rectangle(0, 0, CardUI.CARD_WIDTH, CardUI.CARD_HEIGHT, color);
    this.background.setStrokeStyle(2, 0x333333);
    this.container.add(this.background);
  }

  /**
   * カードタイプに応じた色を取得
   *
   * @returns カードタイプごとの色コード
   */
  private getCardTypeColor(): number {
    switch (this.card.type) {
      case 'GATHERING':
        return 0x90ee90; // LightGreen
      case 'RECIPE':
        return 0xffb6c1; // LightPink
      case 'ENHANCEMENT':
        return 0xadd8e6; // LightBlue
      default:
        return 0xffffff; // White
    }
  }

  /**
   * カードアイコンを作成
   * 現在はプレースホルダーとして矩形を表示
   */
  private createIcon(): void {
    const iconY = -CardUI.CARD_HEIGHT / 2 + CardUI.ICON_SIZE / 2 + CardUI.PADDING;

    // プレースホルダー：将来的には画像に置き換え
    this.iconPlaceholder = this.scene.add.rectangle(
      0,
      iconY,
      CardUI.ICON_SIZE,
      CardUI.ICON_SIZE,
      0xcccccc,
    );
    this.iconPlaceholder.setStrokeStyle(1, 0x666666);
    this.container.add(this.iconPlaceholder);
  }

  /**
   * カード名を作成
   */
  private createName(): void {
    const nameY = -CardUI.CARD_HEIGHT / 2 + CardUI.ICON_SIZE + CardUI.PADDING * 2;

    this.nameText = this.scene.add.text(0, nameY, this.card.name, {
      fontSize: '14px',
      color: '#000000',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: CardUI.CARD_WIDTH - CardUI.PADDING * 2 },
    });
    this.nameText.setOrigin(0.5, 0);
    this.container.add(this.nameText);
  }

  /**
   * カードコストを作成
   */
  private createCost(): void {
    const costY = -CardUI.CARD_HEIGHT / 2 + CardUI.ICON_SIZE + CardUI.PADDING * 3 + 20;

    this.costText = this.scene.add.text(0, costY, `⚡ ${this.card.cost}`, {
      fontSize: '12px',
      color: '#000000',
      align: 'center',
    });
    this.costText.setOrigin(0.5, 0);
    this.container.add(this.costText);
  }

  /**
   * カード効果テキストを作成
   */
  private createEffect(): void {
    const effectY = -CardUI.CARD_HEIGHT / 2 + CardUI.ICON_SIZE + CardUI.PADDING * 4 + 40;

    // 効果テキストの生成（簡易版）
    const effectDescription = this.getEffectDescription();

    this.effectText = this.scene.add.text(0, effectY, effectDescription, {
      fontSize: '10px',
      color: '#333333',
      align: 'center',
      wordWrap: { width: CardUI.CARD_WIDTH - CardUI.PADDING * 2 },
    });
    this.effectText.setOrigin(0.5, 0);
    this.container.add(this.effectText);
  }

  /**
   * カードの効果説明を取得（簡易版）
   *
   * @returns 効果の説明文
   */
  private getEffectDescription(): string {
    // カードタイプに応じた基本的な説明を生成
    if (this.card.isGatheringCard()) {
      const materialCount = this.card.master.materialPool?.length || 0;
      return `素材を${materialCount}種類採取`;
    }

    if (this.card.isRecipeCard()) {
      return `アイテムを調合`;
    }

    if (this.card.isEnhancementCard()) {
      return `効果を発動`;
    }

    return 'カード効果';
  }

  /**
   * インタラクティブ機能を設定
   * ホバー時の拡大とクリックイベントを追加
   */
  private setupInteraction(): void {
    if (!this.config.interactive) return;

    this.background.setInteractive({ useHandCursor: true });

    // ホバー時の拡大エフェクト
    this.background.on('pointerover', () => {
      this.scene.tweens.add({
        targets: this.container,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 100,
        ease: 'Power2',
      });
    });

    // ホバー解除時に元のサイズに戻す
    this.background.on('pointerout', () => {
      this.scene.tweens.add({
        targets: this.container,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
        ease: 'Power2',
      });
    });

    // クリックイベント
    this.background.on('pointerdown', () => {
      this.config.onClick?.(this.card);
    });
  }

  /**
   * コンポーネントを破棄する（BaseComponentの抽象メソッド実装）
   */
  public destroy(): void {
    // すべてのGameObjectsを破棄
    if (this.background) {
      this.background.destroy();
    }
    if (this.iconPlaceholder) {
      this.iconPlaceholder.destroy();
    }
    if (this.nameText) {
      this.nameText.destroy();
    }
    if (this.costText) {
      this.costText.destroy();
    }
    if (this.effectText) {
      this.effectText.destroy();
    }

    // コンテナを破棄
    if (this.container) {
      this.container.destroy();
    }
  }

  /**
   * カードデータを取得
   *
   * @returns カードエンティティ
   */
  public getCard(): Card {
    return this.card;
  }

  /**
   * コンテナを取得
   * HandDisplayなどの親コンポーネントからアクセスするために公開
   *
   * @returns Phaserコンテナ
   */
  public getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }
}
