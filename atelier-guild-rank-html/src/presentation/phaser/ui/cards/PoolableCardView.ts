import Phaser from 'phaser';
import { PoolableContainer } from '../../utils/ObjectPool';

/**
 * カードタイプ
 */
export type CardType = 'gathering' | 'recipe' | 'enhancement';

/**
 * カードデータ
 */
export interface CardData {
  id: string;
  name: string;
  type: CardType;
  description?: string;
  cost?: number;
  rarity?: number;
}

/**
 * カード色定義
 */
const CARD_COLORS: Record<CardType, number> = {
  gathering: 0x4a7c59, // 緑系
  recipe: 0x7c4a5c, // 赤系
  enhancement: 0x5c5a7c, // 紫系
};

/**
 * カードサイズ定義
 */
const CARD_SIZE = {
  width: 100,
  height: 140,
  cornerRadius: 8,
};

/**
 * プール対応カードビュー
 *
 * オブジェクトプールに対応したカードの表示コンポーネント。
 * 頻繁な生成・破棄を避け、再利用することでパフォーマンスを向上させる。
 */
export class PoolableCardView extends PoolableContainer {
  private cardData: CardData | null = null;
  private background: Phaser.GameObjects.Graphics;
  private nameText: Phaser.GameObjects.Text;
  private descText: Phaser.GameObjects.Text;
  private costText: Phaser.GameObjects.Text;
  private typeIcon: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, x: number = 0, y: number = 0) {
    super(scene, x, y);

    // 背景グラフィクス
    this.background = scene.add.graphics();
    this.add(this.background);

    // タイプアイコン
    this.typeIcon = scene.add.graphics();
    this.add(this.typeIcon);

    // カード名テキスト
    this.nameText = scene.add
      .text(0, -CARD_SIZE.height / 2 + 25, '', {
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#ffffff',
        align: 'center',
        wordWrap: { width: CARD_SIZE.width - 10 },
      })
      .setOrigin(0.5);
    this.add(this.nameText);

    // 説明テキスト
    this.descText = scene.add
      .text(0, 15, '', {
        fontSize: '9px',
        color: '#cccccc',
        align: 'center',
        wordWrap: { width: CARD_SIZE.width - 15 },
      })
      .setOrigin(0.5);
    this.add(this.descText);

    // コストテキスト
    this.costText = scene.add
      .text(
        -CARD_SIZE.width / 2 + 15,
        -CARD_SIZE.height / 2 + 15,
        '',
        {
          fontSize: '14px',
          fontStyle: 'bold',
          color: '#ffcc00',
        }
      )
      .setOrigin(0.5);
    this.add(this.costText);

    this.setSize(CARD_SIZE.width, CARD_SIZE.height);
  }

  /**
   * カードデータを設定
   */
  setCardData(data: CardData): this {
    this.cardData = data;
    this.updateVisuals();
    return this;
  }

  /**
   * ビジュアルを更新
   */
  private updateVisuals(): void {
    if (!this.cardData) return;

    const { type, name, description, cost } = this.cardData;
    const color = CARD_COLORS[type] ?? 0x555555;

    // 背景描画
    this.background.clear();
    this.background.fillStyle(color, 1);
    this.background.fillRoundedRect(
      -CARD_SIZE.width / 2,
      -CARD_SIZE.height / 2,
      CARD_SIZE.width,
      CARD_SIZE.height,
      CARD_SIZE.cornerRadius
    );

    // 枠線
    this.background.lineStyle(2, 0xffffff, 0.5);
    this.background.strokeRoundedRect(
      -CARD_SIZE.width / 2,
      -CARD_SIZE.height / 2,
      CARD_SIZE.width,
      CARD_SIZE.height,
      CARD_SIZE.cornerRadius
    );

    // タイプアイコン
    this.drawTypeIcon(type);

    // テキスト更新
    this.nameText.setText(name);
    this.descText.setText(description ?? '');
    this.costText.setText(cost !== undefined ? cost.toString() : '');
  }

  /**
   * タイプアイコンを描画
   */
  private drawTypeIcon(type: CardType): void {
    this.typeIcon.clear();
    const iconX = CARD_SIZE.width / 2 - 15;
    const iconY = -CARD_SIZE.height / 2 + 15;

    this.typeIcon.fillStyle(0xffffff, 0.8);

    switch (type) {
      case 'gathering':
        // 葉っぱのアイコン
        this.typeIcon.fillCircle(iconX, iconY, 6);
        break;
      case 'recipe':
        // 薬瓶のアイコン
        this.typeIcon.fillRoundedRect(iconX - 5, iconY - 5, 10, 10, 2);
        break;
      case 'enhancement':
        // 星のアイコン
        this.typeIcon.fillTriangle(
          iconX, iconY - 6,
          iconX - 5, iconY + 4,
          iconX + 5, iconY + 4
        );
        break;
    }
  }

  /**
   * インタラクティブに設定
   */
  makeInteractive(): this {
    this.setInteractive(
      new Phaser.Geom.Rectangle(
        -CARD_SIZE.width / 2,
        -CARD_SIZE.height / 2,
        CARD_SIZE.width,
        CARD_SIZE.height
      ),
      Phaser.Geom.Rectangle.Contains
    );
    return this;
  }

  /**
   * ホバー効果を有効化
   */
  enableHoverEffect(scale: number = 1.1): this {
    this.on('pointerover', () => {
      this.scene.tweens.add({
        targets: this,
        scaleX: scale,
        scaleY: scale,
        duration: 100,
        ease: 'Power2',
      });
    });

    this.on('pointerout', () => {
      this.scene.tweens.add({
        targets: this,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
        ease: 'Power2',
      });
    });

    return this;
  }

  /**
   * 選択状態を設定
   */
  setSelected(selected: boolean): this {
    if (selected) {
      this.background.lineStyle(3, 0xffcc00, 1);
      this.background.strokeRoundedRect(
        -CARD_SIZE.width / 2,
        -CARD_SIZE.height / 2,
        CARD_SIZE.width,
        CARD_SIZE.height,
        CARD_SIZE.cornerRadius
      );
    } else {
      this.updateVisuals();
    }
    return this;
  }

  /**
   * リセット（プール返却時）
   */
  reset(): void {
    this.resetBase();
    this.cardData = null;

    // グラフィクスをクリア
    this.background.clear();
    this.typeIcon.clear();

    // テキストをクリア
    this.nameText.setText('');
    this.descText.setText('');
    this.costText.setText('');

    // Tweenを停止
    this.scene.tweens.killTweensOf(this);
  }

  /**
   * カードデータを取得
   */
  getCardData(): CardData | null {
    return this.cardData;
  }

  /**
   * カードIDを取得
   */
  getCardId(): string | null {
    return this.cardData?.id ?? null;
  }

  /**
   * カードタイプを取得
   */
  getCardType(): CardType | null {
    return this.cardData?.type ?? null;
  }
}
