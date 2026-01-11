/**
 * RewardCardSelector実装
 *
 * TASK-0231: RewardCardSelector設計・実装
 * 依頼納品成功時の報酬カード選択UIを実装する。
 * 複数のカードから1枚を選択するダイアログ形式のコンポーネント。
 *
 * 設計文書: docs/tasks/atelier-guild-rank-phaser/TASK-0231.md
 */

import Phaser from 'phaser';
import type { Card } from '@domain/card/Card';
import {
  IRewardCardSelector,
  RewardCardSelectorOptions,
} from './IRewardCardSelector';
import { createCardView } from '../card/CardViewFactory';
import { ICardView } from '../card/ICardView';
import { Colors } from '../../config/ColorPalette';
import { TextStyles } from '../../config/TextStyles';

/**
 * レイアウト定数
 */
const LAYOUT = {
  PANEL_WIDTH: 700,
  PANEL_HEIGHT: 450,
  PANEL_BORDER_RADIUS: 16,
  TITLE_Y: 30,
  SUBTITLE_Y: 65,
  CARD_Y_OFFSET: -30,
  CARD_WIDTH: 120,
  CARD_SPACING: 30,
  BUTTON_Y_OFFSET: 50,
  BUTTON_WIDTH: 120,
  BUTTON_HEIGHT: 36,
  BUTTON_SPACING: 160,
} as const;

/**
 * RewardCardSelectorクラス
 *
 * 報酬カード選択ダイアログを管理する。
 */
export class RewardCardSelector implements IRewardCardSelector {
  /** Phaserコンテナ */
  public readonly container: Phaser.GameObjects.Container;

  /** シーン参照 */
  private scene: Phaser.Scene;

  /** カードリスト */
  private cards: Card[] = [];

  /** 選択中のカード */
  private selectedCard: Card | null = null;

  /** ダイアログタイトル */
  private title: string;

  // UI要素
  private overlay!: Phaser.GameObjects.Graphics;
  private panel!: Phaser.GameObjects.Graphics;
  private titleText!: Phaser.GameObjects.Text;
  private cardViews: ICardView[] = [];
  private confirmButton!: Phaser.GameObjects.Container;
  private cancelButton?: Phaser.GameObjects.Container;
  private selectedHighlight?: Phaser.GameObjects.Graphics;

  // コールバック
  private onSelect?: (card: Card) => void;
  private onCancel?: () => void;

  /**
   * コンストラクタ
   * @param options オプション
   */
  constructor(options: RewardCardSelectorOptions) {
    this.scene = options.scene;
    this.cards = options.cards;
    this.title = options.title ?? '🎁 報酬を選択してください';
    this.onSelect = options.onSelect;
    this.onCancel = options.onCancel;

    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(200);

    this.create();
    this.displayCards();
  }

  /**
   * UIを構築
   */
  private create(): void {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    // オーバーレイ
    this.overlay = this.scene.add.graphics();
    this.overlay.fillStyle(0x000000, 0.8);
    this.overlay.fillRect(0, 0, width, height);
    this.container.add(this.overlay);

    // パネル
    const panelX = (width - LAYOUT.PANEL_WIDTH) / 2;
    const panelY = (height - LAYOUT.PANEL_HEIGHT) / 2;

    this.panel = this.scene.add.graphics();
    this.panel.fillStyle(Colors.panelBackground, 1);
    this.panel.fillRoundedRect(panelX, panelY, LAYOUT.PANEL_WIDTH, LAYOUT.PANEL_HEIGHT, LAYOUT.PANEL_BORDER_RADIUS);
    this.panel.lineStyle(2, Colors.accent);
    this.panel.strokeRoundedRect(panelX, panelY, LAYOUT.PANEL_WIDTH, LAYOUT.PANEL_HEIGHT, LAYOUT.PANEL_BORDER_RADIUS);
    this.container.add(this.panel);

    // タイトル
    this.titleText = this.scene.add.text(width / 2, panelY + LAYOUT.TITLE_Y, this.title, {
      ...TextStyles.titleSmall,
      fontSize: '22px',
      color: '#ffd700',
    }).setOrigin(0.5, 0);
    this.container.add(this.titleText);

    // サブタイトル
    const subTitle = this.scene.add.text(width / 2, panelY + LAYOUT.SUBTITLE_Y, '1枚を選択してください', {
      ...TextStyles.body,
      fontSize: '14px',
      color: '#aaaaaa',
    }).setOrigin(0.5, 0);
    this.container.add(subTitle);

    // 確定ボタン
    this.confirmButton = this.createButton(
      width / 2 + LAYOUT.BUTTON_SPACING / 2,
      panelY + LAYOUT.PANEL_HEIGHT - LAYOUT.BUTTON_Y_OFFSET,
      '✅ 選択する',
      () => this.confirm(),
      true
    );
    this.confirmButton.setAlpha(0.5); // 初期は非活性
    this.container.add(this.confirmButton);

    // キャンセルボタン（オプション）
    if (this.onCancel) {
      this.cancelButton = this.createButton(
        width / 2 - LAYOUT.BUTTON_SPACING / 2,
        panelY + LAYOUT.PANEL_HEIGHT - LAYOUT.BUTTON_Y_OFFSET,
        'キャンセル',
        () => this.cancel(),
        false
      );
      this.container.add(this.cancelButton);
    }

    // 出現アニメーション
    this.container.setAlpha(0);
    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      duration: 300,
      ease: 'Power2',
    });
  }

  /**
   * ボタンを作成
   */
  private createButton(
    x: number,
    y: number,
    text: string,
    onClick: () => void,
    primary: boolean
  ): Phaser.GameObjects.Container {
    const btn = this.scene.add.container(x, y);

    const bg = this.scene.add.graphics();
    const bgColor = primary ? Colors.accent : 0x4a4a6a;
    const halfWidth = LAYOUT.BUTTON_WIDTH / 2;
    const halfHeight = LAYOUT.BUTTON_HEIGHT / 2;
    bg.fillStyle(bgColor, 1);
    bg.fillRoundedRect(-halfWidth, -halfHeight, LAYOUT.BUTTON_WIDTH, LAYOUT.BUTTON_HEIGHT, 8);
    btn.add(bg);

    const label = this.scene.add.text(0, 0, text, {
      ...TextStyles.body,
      fontSize: '14px',
    }).setOrigin(0.5);
    btn.add(label);

    btn.setInteractive(
      new Phaser.Geom.Rectangle(-halfWidth, -halfHeight, LAYOUT.BUTTON_WIDTH, LAYOUT.BUTTON_HEIGHT),
      Phaser.Geom.Rectangle.Contains
    );

    btn.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(primary ? 0x7a7aff : 0x6a6a8a, 1);
      bg.fillRoundedRect(-halfWidth, -halfHeight, LAYOUT.BUTTON_WIDTH, LAYOUT.BUTTON_HEIGHT, 8);
    });

    btn.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(bgColor, 1);
      bg.fillRoundedRect(-halfWidth, -halfHeight, LAYOUT.BUTTON_WIDTH, LAYOUT.BUTTON_HEIGHT, 8);
    });

    btn.on('pointerdown', onClick);

    return btn;
  }

  /**
   * カードを表示
   */
  private displayCards(): void {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    const startY = height / 2 + LAYOUT.CARD_Y_OFFSET;

    const totalWidth = this.cards.length * LAYOUT.CARD_WIDTH + (this.cards.length - 1) * LAYOUT.CARD_SPACING;
    const startX = (width - totalWidth) / 2 + LAYOUT.CARD_WIDTH / 2;

    this.cards.forEach((card, index) => {
      const x = startX + index * (LAYOUT.CARD_WIDTH + LAYOUT.CARD_SPACING);
      const y = startY;

      const cardView = createCardView(this.scene, {
        x: x,
        y: y,
        card: card,
        interactive: true,
        onClick: () => this.handleCardClick(card, index),
        onHover: (_card, isHovering) => {
          if (isHovering) {
            this.handleCardHover(card, index);
          } else {
            this.handleCardHoverOut(card, index);
          }
        },
      });

      cardView.setScale(0.9);

      // 出現アニメーション
      cardView.container.setAlpha(0);
      cardView.container.y = y + 50;
      this.scene.tweens.add({
        targets: cardView.container,
        alpha: 1,
        y: y,
        duration: 300,
        delay: index * 100,
        ease: 'Back.easeOut',
      });

      this.container.add(cardView.container);
      this.cardViews.push(cardView);
    });
  }

  /**
   * カードクリック時の処理
   */
  private handleCardClick(card: Card, index: number): void {
    // 前の選択をクリア
    this.clearSelection();

    // 新しい選択
    this.selectedCard = card;
    this.showSelectionHighlight(index);

    // 確定ボタンを有効化
    this.confirmButton.setAlpha(1);

    // 選択アニメーション
    const cardView = this.cardViews[index];
    this.scene.tweens.add({
      targets: cardView.container,
      y: cardView.container.y - 20,
      duration: 200,
      ease: 'Back.easeOut',
    });
    cardView.setScale(1.0);
  }

  /**
   * カードホバー時の処理
   */
  private handleCardHover(_card: Card, index: number): void {
    if (this.selectedCard === this.cards[index]) return;

    const cardView = this.cardViews[index];
    this.scene.tweens.add({
      targets: cardView.container,
      duration: 100,
      ease: 'Power2',
    });
    cardView.setScale(0.95);
  }

  /**
   * カードホバー解除時の処理
   */
  private handleCardHoverOut(_card: Card, index: number): void {
    if (this.selectedCard === this.cards[index]) return;

    const cardView = this.cardViews[index];
    this.scene.tweens.add({
      targets: cardView.container,
      duration: 100,
      ease: 'Power2',
    });
    cardView.setScale(0.9);
  }

  /**
   * 選択をクリア
   */
  private clearSelection(): void {
    if (this.selectedHighlight) {
      this.selectedHighlight.destroy();
      this.selectedHighlight = undefined;
    }

    // 前の選択カードを元の位置に戻す
    this.cardViews.forEach((cv, i) => {
      if (this.cards[i] === this.selectedCard) {
        this.scene.tweens.add({
          targets: cv.container,
          y: cv.container.y + 20,
          duration: 200,
        });
        cv.setScale(0.9);
      }
    });

    this.selectedCard = null;
  }

  /**
   * 選択ハイライトを表示
   */
  private showSelectionHighlight(index: number): void {
    const cardView = this.cardViews[index];
    const x = cardView.container.x;
    const y = cardView.container.y;

    this.selectedHighlight = this.scene.add.graphics();
    this.selectedHighlight.lineStyle(4, Colors.accent);
    this.selectedHighlight.strokeRoundedRect(x - 65, y - 95, 130, 190, 12);

    // グロー効果
    this.scene.tweens.add({
      targets: this.selectedHighlight,
      alpha: 0.5,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.container.add(this.selectedHighlight);
  }

  /**
   * カードを設定する
   */
  setCards(cards: Card[]): void {
    // 既存のカードビューを破棄
    this.cardViews.forEach(cv => cv.destroy());
    this.cardViews = [];

    this.cards = cards;
    this.selectedCard = null;
    this.displayCards();
  }

  /**
   * 設定されているカードを取得する
   */
  getCards(): Card[] {
    return [...this.cards];
  }

  /**
   * 選択中のカードを取得する
   */
  getSelectedCard(): Card | null {
    return this.selectedCard;
  }

  /**
   * カードを選択する
   */
  selectCard(card: Card): void {
    const index = this.cards.indexOf(card);
    if (index >= 0) {
      this.handleCardClick(card, index);
    }
  }

  /**
   * 選択を確定する
   */
  confirm(): void {
    if (!this.selectedCard) return;

    // 確定アニメーション
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        if (this.onSelect && this.selectedCard) {
          this.onSelect(this.selectedCard);
        }
      },
    });
  }

  /**
   * 選択をキャンセルする
   */
  cancel(): void {
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        if (this.onCancel) {
          this.onCancel();
        }
      },
    });
  }

  /**
   * ダイアログを表示する
   */
  show(): void {
    this.container.setVisible(true);
    this.container.setAlpha(0);
    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      duration: 300,
      ease: 'Power2',
    });
  }

  /**
   * ダイアログを非表示にする
   */
  hide(): void {
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      duration: 200,
      ease: 'Power2',
      onComplete: () => this.container.setVisible(false),
    });
  }

  /**
   * リソースを破棄する
   */
  destroy(): void {
    this.cardViews.forEach(cv => cv.destroy());
    this.container.destroy();
  }
}
