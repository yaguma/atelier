/**
 * RewardCardDialogコンポーネント
 * TASK-0025 納品フェーズUI - 報酬カード選択ダイアログ
 *
 * @description
 * 納品成功時に表示される報酬カード選択ダイアログ。
 * 3枚のカードから1枚を選択するか、選ばない選択が可能。
 */

import Phaser from 'phaser';

// =============================================================================
// 定数定義
// =============================================================================

/** UI配置定数 */
const UI_LAYOUT = {
  /** ダイアログ幅 */
  DIALOG_WIDTH: 700,
  /** ダイアログ高さ */
  DIALOG_HEIGHT: 500,
  /** カード幅 */
  CARD_WIDTH: 180,
  /** カード高さ */
  CARD_HEIGHT: 240,
  /** カード間隔 */
  CARD_SPACING: 40,
  /** タイトルY座標 */
  TITLE_Y: -200,
  /** メッセージY座標 */
  MESSAGE_Y: -150,
  /** カードリストY座標 */
  CARD_LIST_Y: 0,
  /** スキップボタンY座標 */
  SKIP_BUTTON_Y: 180,
} as const;

/** スタイル定数 */
const UI_STYLES = {
  TITLE: {
    fontSize: '24px',
    color: '#ffffff',
    fontStyle: 'bold',
  },
  MESSAGE: {
    fontSize: '16px',
    color: '#ffffff',
  },
  CARD_NAME: {
    fontSize: '14px',
    color: '#ffffff',
    fontStyle: 'bold',
  },
  CARD_TYPE: {
    fontSize: '12px',
    color: '#cccccc',
  },
  CARD_DESCRIPTION: {
    fontSize: '11px',
    color: '#ffffff',
  },
  RARITY: {
    fontSize: '12px',
    color: '#ffd700',
  },
  BUTTON: {
    fontSize: '14px',
    color: '#ffffff',
  },
} as const;

/** 色定数 */
const DIALOG_COLORS = {
  /** オーバーレイ背景色 */
  OVERLAY: 0x000000,
  /** オーバーレイ透明度 */
  OVERLAY_ALPHA: 0.6,
  /** ダイアログ背景色 */
  DIALOG_BACKGROUND: 0xfff8e1,
  /** ダイアログ枠線色 */
  DIALOG_BORDER: 0xffd54f,
  /** カード背景色（コモン） */
  CARD_COMMON: 0x9e9e9e,
  /** カード背景色（アンコモン） */
  CARD_UNCOMMON: 0x4caf50,
  /** カード背景色（レア） */
  CARD_RARE: 0xffd700,
  /** カード枠線色 */
  CARD_BORDER: 0xffffff,
  /** カード選択時の枠線色 */
  CARD_SELECTED_BORDER: 0x2196f3,
  /** スキップボタン背景色 */
  SKIP_BUTTON: 0x666666,
} as const;

/** レアリティ表示定数 */
const RARITY_DISPLAY = {
  common: '★ コモン',
  uncommon: '★★ アンコモン',
  rare: '★★★ レア',
} as const;

/** アニメーション定数 */
const ANIMATION = {
  /** ダイアログ表示時間 */
  DIALOG_SHOW_DURATION: 300,
  /** カード表示遅延（1枚目） */
  CARD_DELAY_1: 100,
  /** カード表示遅延（2枚目） */
  CARD_DELAY_2: 200,
  /** カード表示遅延（3枚目） */
  CARD_DELAY_3: 300,
  /** カード表示時間 */
  CARD_SHOW_DURATION: 200,
} as const;

/**
 * レアリティタイプ
 */
type Rarity = 'common' | 'uncommon' | 'rare';

/**
 * カードタイプ
 */
type CardType = 'gathering' | 'recipe' | 'enhancement';

/**
 * RewardCardインターフェース
 */
interface RewardCard {
  id: string;
  name: string;
  rarity: Rarity;
  cardType: CardType;
  description: string;
  effectDescription: string;
}

/**
 * RewardCardUIインターフェース
 */
interface RewardCardUI {
  card: RewardCard;
  container: Phaser.GameObjects.Container;
  background: Phaser.GameObjects.Rectangle;
  destroy(): void;
}

/**
 * RewardCardDialogコンポーネント
 *
 * 報酬カード選択ダイアログを表示し、カード選択処理を行う。
 */
export class RewardCardDialog extends Phaser.Events.EventEmitter {
  private scene: Phaser.Scene;
  private cards: RewardCard[];
  private container: Phaser.GameObjects.Container | null = null;
  private overlay: Phaser.GameObjects.Rectangle | null = null;
  private dialogBg: Phaser.GameObjects.Rectangle | null = null;
  private cardUIs: RewardCardUI[] = [];

  /**
   * コンストラクタ
   * @param scene - Phaserシーンインスタンス
   * @param cards - 報酬カードリスト（3枚）
   */
  constructor(scene: Phaser.Scene, cards: RewardCard[]) {
    super();
    this.scene = scene;
    this.cards = cards.slice(0, 3); // 最大3枚まで
  }

  /**
   * ダイアログを表示
   */
  public show(): void {
    const centerX = this.scene.cameras.main.centerX;
    const centerY = this.scene.cameras.main.centerY;

    this.container = this.scene.add.container(centerX, centerY);
    this.container.setDepth(1000);

    // オーバーレイを作成
    this.createOverlay(centerX, centerY);

    // ダイアログ背景を作成
    this.createDialogBackground();

    // タイトルを作成
    this.createTitle();

    // メッセージを作成
    this.createMessage();

    // カードを作成
    this.createCards();

    // スキップボタンを作成
    this.createSkipButton();

    // アニメーション表示
    this.playShowAnimation();
  }

  /**
   * オーバーレイを作成
   * @param centerX - 中央X座標
   * @param centerY - 中央Y座標
   */
  private createOverlay(centerX: number, centerY: number): void {
    this.overlay = this.scene.add.rectangle(
      0,
      0,
      this.scene.cameras.main.width,
      this.scene.cameras.main.height,
      DIALOG_COLORS.OVERLAY,
      DIALOG_COLORS.OVERLAY_ALPHA,
    );
    this.overlay.setOrigin(0.5);
    this.overlay.setDepth(999);
    this.overlay.setPosition(
      centerX - this.scene.cameras.main.scrollX,
      centerY - this.scene.cameras.main.scrollY,
    );
  }

  /**
   * ダイアログ背景を作成
   */
  private createDialogBackground(): void {
    this.dialogBg = this.scene.add.rectangle(
      0,
      0,
      UI_LAYOUT.DIALOG_WIDTH,
      UI_LAYOUT.DIALOG_HEIGHT,
      DIALOG_COLORS.DIALOG_BACKGROUND,
      1,
    );
    this.dialogBg.setStrokeStyle(3, DIALOG_COLORS.DIALOG_BORDER);
    this.container?.add(this.dialogBg);
  }

  /**
   * タイトルを作成
   */
  private createTitle(): void {
    const title = this.scene.add.text(0, UI_LAYOUT.TITLE_Y, '報酬カードを選択', UI_STYLES.TITLE);
    title.setOrigin(0.5);
    this.container?.add(title);
  }

  /**
   * メッセージを作成
   */
  private createMessage(): void {
    const message = this.scene.add.text(
      0,
      UI_LAYOUT.MESSAGE_Y,
      '納品成功！貢献度とお金を獲得しました',
      UI_STYLES.MESSAGE,
    );
    message.setOrigin(0.5);
    this.container?.add(message);
  }

  /**
   * カードを作成
   */
  private createCards(): void {
    this.destroyCards();

    const totalWidth =
      this.cards.length * UI_LAYOUT.CARD_WIDTH + (this.cards.length - 1) * UI_LAYOUT.CARD_SPACING;
    const startX = -totalWidth / 2 + UI_LAYOUT.CARD_WIDTH / 2;

    this.cards.forEach((card, index) => {
      const cardX = startX + index * (UI_LAYOUT.CARD_WIDTH + UI_LAYOUT.CARD_SPACING);
      const cardY = UI_LAYOUT.CARD_LIST_Y;

      const cardUI = this.createCard(card, cardX, cardY);
      this.cardUIs.push(cardUI);
      this.container?.add(cardUI.container);
    });
  }

  /**
   * カードを作成
   * @param card - 報酬カード
   * @param x - X座標
   * @param y - Y座標
   * @returns カードUI
   */
  private createCard(card: RewardCard, x: number, y: number): RewardCardUI {
    const cardContainer = this.scene.add.container(x, y);

    // カード背景
    const backgroundColor = this.getCardBackgroundColor(card.rarity);
    const background = this.scene.add.rectangle(
      0,
      0,
      UI_LAYOUT.CARD_WIDTH,
      UI_LAYOUT.CARD_HEIGHT,
      backgroundColor,
      1,
    );
    background.setStrokeStyle(2, DIALOG_COLORS.CARD_BORDER);
    background.setInteractive({ useHandCursor: true });
    background.on('pointerdown', () => this.onCardClick(card));
    cardContainer.add(background);

    // レアリティ表示
    const rarityText = this.scene.add.text(
      0,
      -UI_LAYOUT.CARD_HEIGHT / 2 + 20,
      RARITY_DISPLAY[card.rarity],
      UI_STYLES.RARITY,
    );
    rarityText.setOrigin(0.5);
    cardContainer.add(rarityText);

    // カード名
    const nameText = this.scene.add.text(
      0,
      -UI_LAYOUT.CARD_HEIGHT / 2 + 50,
      card.name,
      UI_STYLES.CARD_NAME,
    );
    nameText.setOrigin(0.5);
    nameText.setWordWrapWidth(UI_LAYOUT.CARD_WIDTH - 20);
    cardContainer.add(nameText);

    // カードタイプ
    const typeText = this.scene.add.text(
      0,
      -UI_LAYOUT.CARD_HEIGHT / 2 + 80,
      this.getCardTypeDisplay(card.cardType),
      UI_STYLES.CARD_TYPE,
    );
    typeText.setOrigin(0.5);
    cardContainer.add(typeText);

    // 説明文
    const descriptionText = this.scene.add.text(
      0,
      -20,
      card.description,
      UI_STYLES.CARD_DESCRIPTION,
    );
    descriptionText.setOrigin(0.5);
    descriptionText.setWordWrapWidth(UI_LAYOUT.CARD_WIDTH - 20);
    cardContainer.add(descriptionText);

    // 効果説明
    const effectText = this.scene.add.text(
      0,
      30,
      card.effectDescription,
      UI_STYLES.CARD_DESCRIPTION,
    );
    effectText.setOrigin(0.5);
    effectText.setWordWrapWidth(UI_LAYOUT.CARD_WIDTH - 20);
    cardContainer.add(effectText);

    // 選択ボタン
    const selectButton = this.scene.add.text(
      0,
      UI_LAYOUT.CARD_HEIGHT / 2 - 30,
      '[選択]',
      UI_STYLES.BUTTON,
    );
    selectButton.setOrigin(0.5);
    cardContainer.add(selectButton);

    return {
      card,
      container: cardContainer,
      background,
      destroy: () => cardContainer.destroy(),
    };
  }

  /**
   * スキップボタンを作成
   */
  private createSkipButton(): void {
    const buttonWidth = 200;
    const buttonHeight = 40;

    const skipButtonBg = this.scene.add.rectangle(
      0,
      UI_LAYOUT.SKIP_BUTTON_Y,
      buttonWidth,
      buttonHeight,
      DIALOG_COLORS.SKIP_BUTTON,
    );
    skipButtonBg.setInteractive({ useHandCursor: true });
    skipButtonBg.on('pointerdown', () => this.onSkipClick());
    this.container?.add(skipButtonBg);

    const skipButtonText = this.scene.add.text(
      0,
      UI_LAYOUT.SKIP_BUTTON_Y,
      '選ばない',
      UI_STYLES.BUTTON,
    );
    skipButtonText.setOrigin(0.5);
    this.container?.add(skipButtonText);
  }

  /**
   * カードクリック時の処理
   * @param card - クリックされたカード
   */
  private onCardClick(card: RewardCard): void {
    this.emit('card-selected', card.id);
    this.close();
  }

  /**
   * スキップクリック時の処理
   */
  private onSkipClick(): void {
    this.emit('skip');
    this.close();
  }

  /**
   * 表示アニメーションを再生
   */
  private playShowAnimation(): void {
    if (!this.container || !this.dialogBg) {
      return;
    }

    // ダイアログ背景のアニメーション
    this.container.setAlpha(0);
    this.container.setScale(0.8);

    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      scale: 1,
      duration: ANIMATION.DIALOG_SHOW_DURATION,
      ease: 'Back.Out',
    });

    // カードのアニメーション
    this.cardUIs.forEach((cardUI, index) => {
      cardUI.container.setAlpha(0);
      cardUI.container.setY(cardUI.container.y + 30);

      this.scene.tweens.add({
        targets: cardUI.container,
        alpha: 1,
        y: cardUI.container.y - 30,
        duration: ANIMATION.CARD_SHOW_DURATION,
        delay:
          ANIMATION.DIALOG_SHOW_DURATION +
          index * (ANIMATION.CARD_DELAY_2 - ANIMATION.CARD_DELAY_1) +
          ANIMATION.CARD_DELAY_1,
        ease: 'Quad.Out',
      });
    });
  }

  /**
   * カード背景色を取得
   * @param rarity - レアリティ
   * @returns 背景色
   */
  private getCardBackgroundColor(rarity: Rarity): number {
    switch (rarity) {
      case 'common':
        return DIALOG_COLORS.CARD_COMMON;
      case 'uncommon':
        return DIALOG_COLORS.CARD_UNCOMMON;
      case 'rare':
        return DIALOG_COLORS.CARD_RARE;
      default:
        return DIALOG_COLORS.CARD_COMMON;
    }
  }

  /**
   * カードタイプ表示を取得
   * @param cardType - カードタイプ
   * @returns 表示テキスト
   */
  private getCardTypeDisplay(cardType: CardType): string {
    switch (cardType) {
      case 'gathering':
        return '採取地カード';
      case 'recipe':
        return 'レシピカード';
      case 'enhancement':
        return '強化カード';
      default:
        return '';
    }
  }

  /**
   * カードを全て破棄
   */
  private destroyCards(): void {
    for (const cardUI of this.cardUIs) {
      cardUI.destroy();
    }
    this.cardUIs = [];
  }

  /**
   * ダイアログを閉じる
   */
  public close(): void {
    this.destroyCards();

    if (this.overlay) {
      this.overlay.destroy();
      this.overlay = null;
    }

    if (this.container) {
      this.container.destroy();
      this.container = null;
    }

    this.dialogBg = null;
  }
}
