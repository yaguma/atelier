/**
 * DeckView
 *
 * デッキ（山札）の視覚的表現を行うコンポーネント
 */

import Phaser from 'phaser';
import { IDeckView, DeckViewOptions } from './IDeckView';
import { DeckViewLayout, DeckColors } from './DeckViewConstants';

/**
 * DeckView実装
 */
export class DeckView implements IDeckView {
  public readonly container: Phaser.GameObjects.Container;

  private scene: Phaser.Scene;
  private count: number = 0;
  private onClick?: () => void;

  private stackCards: Phaser.GameObjects.Container[] = [];
  private countBadge!: Phaser.GameObjects.Container;
  private countText!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, options: DeckViewOptions = {}) {
    this.scene = scene;
    this.onClick = options.onClick;

    const x = options.x ?? DeckViewLayout.X;
    const y = options.y ?? DeckViewLayout.Y;

    this.container = scene.add.container(x, y);
    this.container.setDepth(50);

    this.createDeckStack();
    this.createCountBadge();
    this.setupInteraction();
  }

  /**
   * デッキスタックを作成
   */
  private createDeckStack(): void {
    const { STACK_OFFSET, MAX_VISIBLE_STACK } = DeckViewLayout;

    for (let i = 0; i < MAX_VISIBLE_STACK; i++) {
      const cardBack = this.createCardBack(
        -i * STACK_OFFSET,
        -i * STACK_OFFSET
      );
      this.stackCards.push(cardBack);
      this.container.add(cardBack);
    }

    // 逆順で追加（下から上へ）
    this.stackCards.reverse();
  }

  /**
   * カード背面を作成
   */
  private createCardBack(
    offsetX: number,
    offsetY: number
  ): Phaser.GameObjects.Container {
    const { CARD_WIDTH, CARD_HEIGHT } = DeckViewLayout;
    const cardContainer = this.scene.add.container(offsetX, offsetY);

    // カード背面
    const card = this.scene.add.graphics();
    card.fillStyle(DeckColors.CARD_BACK, 1);
    card.fillRoundedRect(
      -CARD_WIDTH / 2,
      -CARD_HEIGHT / 2,
      CARD_WIDTH,
      CARD_HEIGHT,
      8
    );
    card.lineStyle(2, DeckColors.CARD_BORDER);
    card.strokeRoundedRect(
      -CARD_WIDTH / 2,
      -CARD_HEIGHT / 2,
      CARD_WIDTH,
      CARD_HEIGHT,
      8
    );
    cardContainer.add(card);

    // 裏面パターン
    const pattern = this.scene.add.graphics();
    pattern.fillStyle(DeckColors.CARD_PATTERN, 1);
    pattern.fillRoundedRect(
      -CARD_WIDTH / 2 + 10,
      -CARD_HEIGHT / 2 + 10,
      CARD_WIDTH - 20,
      CARD_HEIGHT - 20,
      4
    );
    cardContainer.add(pattern);

    // 中央のシンボル
    const symbol = this.scene.add
      .text(0, 0, '⚗️', {
        fontSize: '32px',
      })
      .setOrigin(0.5);
    cardContainer.add(symbol);

    return cardContainer;
  }

  /**
   * 枚数バッジを作成
   */
  private createCountBadge(): void {
    const { CARD_WIDTH, CARD_HEIGHT } = DeckViewLayout;

    this.countBadge = this.scene.add.container(CARD_WIDTH / 2, CARD_HEIGHT / 2);

    // バッジ背景
    const bg = this.scene.add.graphics();
    bg.fillStyle(DeckColors.COUNT_BG, 0.9);
    bg.fillCircle(0, 0, 20);
    bg.lineStyle(2, DeckColors.CARD_BORDER);
    bg.strokeCircle(0, 0, 20);
    this.countBadge.add(bg);

    // 枚数テキスト
    this.countText = this.scene.add
      .text(0, 0, '0', {
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5);
    this.countBadge.add(this.countText);

    this.container.add(this.countBadge);
  }

  /**
   * インタラクションをセットアップ
   */
  private setupInteraction(): void {
    const { CARD_WIDTH, CARD_HEIGHT } = DeckViewLayout;

    this.container.setInteractive(
      new Phaser.Geom.Rectangle(
        -CARD_WIDTH / 2,
        -CARD_HEIGHT / 2,
        CARD_WIDTH,
        CARD_HEIGHT
      ),
      Phaser.Geom.Rectangle.Contains
    );

    this.container.on('pointerdown', () => {
      if (this.onClick) this.onClick();
    });

    this.container.on('pointerover', () => {
      this.scene.tweens.add({
        targets: this.container,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100,
        ease: 'Power2',
      });
    });

    this.container.on('pointerout', () => {
      this.scene.tweens.add({
        targets: this.container,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
        ease: 'Power2',
      });
    });
  }

  /**
   * 枚数を設定
   */
  setCount(count: number): void {
    this.count = count;
    this.countText.setText(`${count}`);

    // 残り枚数に応じてスタックの見た目を変更
    const visibleCount = Math.min(count, DeckViewLayout.MAX_VISIBLE_STACK);
    this.stackCards.forEach((card, index) => {
      card.setVisible(index < visibleCount);
    });

    // 0枚時は全て非表示
    if (count === 0) {
      this.stackCards.forEach((card) => card.setVisible(false));
    }
  }

  /**
   * 枚数を取得
   */
  getCount(): number {
    return this.count;
  }

  /**
   * ドローアニメーション
   */
  async animateDraw(): Promise<Phaser.GameObjects.Container> {
    return new Promise((resolve) => {
      const { DRAW_DURATION } = DeckViewLayout;

      // 一番上のカードをコピーして飛ばす
      const topCard = this.createCardBack(0, 0);
      this.scene.add.existing(topCard);
      topCard.setPosition(this.container.x, this.container.y);
      topCard.setDepth(150);

      // カードを手札位置に移動
      this.scene.tweens.add({
        targets: topCard,
        x: 640, // 画面中央（手札位置）
        y: 650,
        scaleX: 0.8,
        scaleY: 0.8,
        rotation: Phaser.Math.DegToRad(5),
        duration: DRAW_DURATION,
        ease: 'Power2.easeOut',
        onComplete: () => {
          // 枚数を減らす
          if (this.count > 0) {
            this.setCount(this.count - 1);
          }
          resolve(topCard);
        },
      });
    });
  }

  /**
   * シャッフルアニメーション
   */
  async animateShuffle(): Promise<void> {
    return new Promise((resolve) => {
      const { SHUFFLE_DURATION, STACK_OFFSET } = DeckViewLayout;

      // シャッフルアニメーション（カードが散らばって戻る）
      const timeline = this.scene.tweens.createTimeline();

      // 散らばる
      this.stackCards.forEach((card) => {
        timeline.add({
          targets: card,
          x: Phaser.Math.Between(-20, 20),
          y: Phaser.Math.Between(-20, 20),
          rotation: Phaser.Math.DegToRad(Phaser.Math.Between(-15, 15)),
          duration: SHUFFLE_DURATION / 3,
          ease: 'Power2.easeOut',
        });
      });

      // 戻る
      this.stackCards.forEach((card, index) => {
        timeline.add({
          targets: card,
          x: -index * STACK_OFFSET,
          y: -index * STACK_OFFSET,
          rotation: 0,
          duration: SHUFFLE_DURATION / 3,
          ease: 'Back.easeOut',
        });
      });

      timeline.on('complete', resolve);
      timeline.play();
    });
  }

  /**
   * カード追加アニメーション
   */
  async animateAddCard(): Promise<void> {
    return new Promise((resolve) => {
      // カードがデッキに追加されるアニメーション
      const newCard = this.createCardBack(0, 0);
      this.scene.add.existing(newCard);
      newCard.setPosition(640, 650); // 手札位置から
      newCard.setDepth(150);

      this.scene.tweens.add({
        targets: newCard,
        x: this.container.x,
        y: this.container.y,
        scaleX: 1,
        scaleY: 1,
        duration: 300,
        ease: 'Power2.easeIn',
        onComplete: () => {
          newCard.destroy();
          this.setCount(this.count + 1);
          resolve();
        },
      });
    });
  }

  /**
   * インタラクティブ状態を設定
   */
  setInteractive(enabled: boolean): void {
    if (enabled) {
      this.container.setInteractive();
    } else {
      this.container.disableInteractive();
    }
  }

  /**
   * 表示/非表示を設定
   */
  setVisible(visible: boolean): void {
    this.container.setVisible(visible);
  }

  /**
   * コンポーネントを破棄
   */
  destroy(): void {
    this.container.destroy();
  }
}
