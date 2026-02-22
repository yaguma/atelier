/**
 * RewardCardSelectionDialogコンポーネント
 * Issue #263: 納品フェーズに報酬カード選択ダイアログを実装
 *
 * @description
 * 納品成功後に表示される報酬カード選択ダイアログ。
 * 3枚のカード候補から1枚を選択してデッキに追加する。
 */

import { Colors, THEME } from '@presentation/ui/theme';
import { AnimationPresets } from '@presentation/ui/utils/AnimationPresets';
import { BaseComponent } from '@shared/components';
import type Phaser from 'phaser';
import type { RewardCard, RewardCardSelectionCallbacks } from './types';

// =============================================================================
// 定数定義
// =============================================================================

/** ダイアログレイアウト定数 */
const LAYOUT = {
  DIALOG_WIDTH: 600,
  DIALOG_HEIGHT: 350,
  TITLE_OFFSET_Y: 30,
  CARDS_OFFSET_Y: 100,
  CARD_WIDTH: 150,
  CARD_HEIGHT: 200,
  CARD_SPACING: 170,
  CARD_NAME_OFFSET_Y: -70,
  CARD_TYPE_OFFSET_Y: -45,
  CARD_RARITY_OFFSET_Y: -20,
  CARD_DESC_OFFSET_Y: 10,
  SKIP_BUTTON_OFFSET_Y: 310,
} as const;

/** UIテキスト定数 */
const UI_TEXT = {
  TITLE: '報酬カードを選択',
  SKIP_BUTTON: 'スキップ',
  NO_CARDS: 'カード候補がありません',
} as const;

/** レアリティ表示名 */
const RARITY_LABELS: Record<RewardCard['rarity'], string> = {
  common: 'コモン',
  uncommon: 'アンコモン',
  rare: 'レア',
};

/** カードタイプ表示名 */
const CARD_TYPE_LABELS: Record<RewardCard['cardType'], string> = {
  gathering: '採取地',
  recipe: 'レシピ',
  enhancement: '強化',
};

/** レアリティ別ボーダー色 */
const RARITY_COLORS: Record<RewardCard['rarity'], number> = {
  common: 0x808080,
  uncommon: 0x2e7d32,
  rare: 0xf9a825,
};

/** テキスト色ヘルパー */
const TEXT_COLOR = {
  muted: `#${Colors.text.muted.toString(16).padStart(6, '0')}`,
  secondary: `#${Colors.text.secondary.toString(16).padStart(6, '0')}`,
} as const;

/** UIスタイル定数 */
const UI_STYLES = {
  TITLE: {
    fontSize: `${THEME.sizes.large}px`,
    color: THEME.colors.textOnPrimary,
    fontFamily: THEME.fonts.primary,
    fontStyle: 'bold',
  },
  CARD_NAME: {
    fontSize: `${THEME.sizes.medium}px`,
    color: THEME.colors.textOnPrimary,
    fontFamily: THEME.fonts.primary,
    fontStyle: 'bold',
    wordWrap: { width: LAYOUT.CARD_WIDTH - 20 },
    align: 'center',
  },
  CARD_TYPE: {
    fontSize: `${THEME.sizes.small}px`,
    color: TEXT_COLOR.muted,
    fontFamily: THEME.fonts.primary,
  },
  CARD_RARITY: {
    fontSize: `${THEME.sizes.small}px`,
    fontFamily: THEME.fonts.primary,
  },
  CARD_DESC: {
    fontSize: `${THEME.sizes.small}px`,
    color: TEXT_COLOR.secondary,
    fontFamily: THEME.fonts.primary,
    wordWrap: { width: LAYOUT.CARD_WIDTH - 20 },
    align: 'center',
  },
  SKIP: {
    fontSize: `${THEME.sizes.small}px`,
    color: TEXT_COLOR.muted,
    fontFamily: THEME.fonts.primary,
  },
  NO_CARDS: {
    fontSize: `${THEME.sizes.medium}px`,
    color: TEXT_COLOR.muted,
    fontFamily: THEME.fonts.primary,
  },
} as const;

// =============================================================================
// クラス定義
// =============================================================================

/**
 * 報酬カード選択ダイアログコンポーネント
 */
export class RewardCardSelectionDialog extends BaseComponent {
  private callbacks: RewardCardSelectionCallbacks;
  private overlay: Phaser.GameObjects.Rectangle | null = null;
  private isDialogVisible: boolean = false;
  private elements: Phaser.GameObjects.GameObject[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number, callbacks: RewardCardSelectionCallbacks) {
    // Issue #137: 親コンテナに追加されるため、シーンには直接追加しない
    super(scene, x, y, { addToScene: false });
    this.callbacks = callbacks;
    this.container.setVisible(false);
    this.container.setAlpha(0);
    this.container.setDepth(100);
  }

  /**
   * UIコンポーネント初期化
   */
  public create(): void {
    // 初期化時はダイアログを非表示
  }

  /**
   * ダイアログを表示
   * @param cards - 報酬カード候補
   */
  public show(cards: RewardCard[]): void {
    if (this.isDialogVisible) return;
    this.clearElements();

    // 半透明オーバーレイ
    this.overlay = this.scene.add.rectangle(
      0,
      0,
      this.scene.scale.width * 2,
      this.scene.scale.height * 2,
      Colors.background.overlay,
      0.6,
    );
    this.overlay.setInteractive();
    this.container.add(this.overlay);
    this.elements.push(this.overlay);

    // ダイアログ背景
    const background = this.scene.add.rectangle(
      0,
      0,
      LAYOUT.DIALOG_WIDTH,
      LAYOUT.DIALOG_HEIGHT,
      Colors.background.card,
      0.98,
    );
    background.setStrokeStyle(2, Colors.border.gold);
    this.container.add(background);
    this.elements.push(background);

    // タイトル
    const title = this.scene.add.text(
      0,
      -LAYOUT.DIALOG_HEIGHT / 2 + LAYOUT.TITLE_OFFSET_Y,
      UI_TEXT.TITLE,
      UI_STYLES.TITLE,
    );
    title.setOrigin(0.5);
    this.container.add(title);
    this.elements.push(title);

    if (cards.length === 0) {
      this.showNoCardsMessage();
    } else {
      this.createCardChoices(cards);
    }

    // スキップボタン
    const skipButton = this.scene.add.text(
      0,
      -LAYOUT.DIALOG_HEIGHT / 2 + LAYOUT.SKIP_BUTTON_OFFSET_Y,
      UI_TEXT.SKIP_BUTTON,
      UI_STYLES.SKIP,
    );
    skipButton.setOrigin(0.5);
    skipButton.setInteractive({ useHandCursor: true });
    skipButton.on('pointerdown', () => this.onSkip());
    skipButton.on('pointerover', () => skipButton.setColor('#ffffff'));
    skipButton.on('pointerout', () => skipButton.setColor(TEXT_COLOR.muted));
    this.container.add(skipButton);
    this.elements.push(skipButton);

    // 表示アニメーション
    this.container.setVisible(true);
    this.isDialogVisible = true;
    this.scene.tweens.add({
      targets: this.container,
      ...AnimationPresets.fade.in,
    });
  }

  /**
   * カード選択肢を作成
   */
  private createCardChoices(cards: RewardCard[]): void {
    const startX = -((cards.length - 1) * LAYOUT.CARD_SPACING) / 2;
    const centerY = -LAYOUT.DIALOG_HEIGHT / 2 + LAYOUT.CARDS_OFFSET_Y;

    cards.forEach((card, index) => {
      const x = startX + index * LAYOUT.CARD_SPACING;
      this.createCardUI(card, x, centerY);
    });
  }

  /**
   * 個別カードUIを作成
   */
  private createCardUI(card: RewardCard, x: number, baseY: number): void {
    const rarityColor = RARITY_COLORS[card.rarity] ?? 0x808080;

    // カード背景
    const cardBg = this.scene.add.rectangle(
      x,
      baseY + LAYOUT.CARD_HEIGHT / 2,
      LAYOUT.CARD_WIDTH,
      LAYOUT.CARD_HEIGHT,
      Colors.background.secondary,
      0.9,
    );
    cardBg.setStrokeStyle(2, rarityColor);
    cardBg.setInteractive({ useHandCursor: true });
    this.container.add(cardBg);
    this.elements.push(cardBg);

    const centerY = baseY + LAYOUT.CARD_HEIGHT / 2;

    // カード名
    const nameText = this.scene.add.text(
      x,
      centerY + LAYOUT.CARD_NAME_OFFSET_Y,
      card.name,
      UI_STYLES.CARD_NAME,
    );
    nameText.setOrigin(0.5);
    this.container.add(nameText);
    this.elements.push(nameText);

    // カードタイプ
    const typeLabel = CARD_TYPE_LABELS[card.cardType] ?? card.cardType;
    const typeText = this.scene.add.text(
      x,
      centerY + LAYOUT.CARD_TYPE_OFFSET_Y,
      typeLabel,
      UI_STYLES.CARD_TYPE,
    );
    typeText.setOrigin(0.5);
    this.container.add(typeText);
    this.elements.push(typeText);

    // レアリティ
    const rarityLabel = RARITY_LABELS[card.rarity] ?? card.rarity;
    const rarityText = this.scene.add.text(x, centerY + LAYOUT.CARD_RARITY_OFFSET_Y, rarityLabel, {
      ...UI_STYLES.CARD_RARITY,
      color: `#${rarityColor.toString(16).padStart(6, '0')}`,
    });
    rarityText.setOrigin(0.5);
    this.container.add(rarityText);
    this.elements.push(rarityText);

    // 説明
    const descText = this.scene.add.text(
      x,
      centerY + LAYOUT.CARD_DESC_OFFSET_Y,
      card.description,
      UI_STYLES.CARD_DESC,
    );
    descText.setOrigin(0.5, 0);
    this.container.add(descText);
    this.elements.push(descText);

    // ホバーエフェクト
    cardBg.on('pointerover', () => {
      this.scene.tweens.add({
        targets: cardBg,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100,
      });
      cardBg.setStrokeStyle(3, Colors.border.gold);
    });

    cardBg.on('pointerout', () => {
      this.scene.tweens.add({
        targets: cardBg,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
      });
      cardBg.setStrokeStyle(2, rarityColor);
    });

    // クリックでカード選択
    cardBg.on('pointerdown', () => this.onCardSelect(card));
  }

  /**
   * カード候補なしメッセージを表示
   */
  private showNoCardsMessage(): void {
    const text = this.scene.add.text(0, 0, UI_TEXT.NO_CARDS, UI_STYLES.NO_CARDS);
    text.setOrigin(0.5);
    this.container.add(text);
    this.elements.push(text);
  }

  /**
   * カード選択時の処理
   * 二重クリック防止のためフラグを即座に落とす
   */
  private onCardSelect(card: RewardCard): void {
    if (!this.isDialogVisible) return;
    this.isDialogVisible = false;
    this.disableAllInteractions();
    this.hideWithCallback(() => this.callbacks.onCardSelect(card));
  }

  /**
   * スキップ時の処理
   */
  private onSkip(): void {
    if (!this.isDialogVisible) return;
    this.isDialogVisible = false;
    this.disableAllInteractions();
    this.hideWithCallback(() => this.callbacks.onSkip());
  }

  /**
   * すべてのインタラクションを無効化
   */
  private disableAllInteractions(): void {
    for (const element of this.elements) {
      if ('disableInteractive' in element && typeof element.disableInteractive === 'function') {
        (
          element as Phaser.GameObjects.GameObject & { disableInteractive: () => void }
        ).disableInteractive();
      }
    }
  }

  /**
   * アニメーション完了後にコールバックを実行するhide
   */
  private hideWithCallback(onComplete?: () => void): void {
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        this.container.setVisible(false);
        this.clearElements();
        onComplete?.();
      },
    });
  }

  /**
   * ダイアログを非表示
   */
  public hide(): void {
    this.isDialogVisible = false;
    this.hideWithCallback();
  }

  /**
   * 表示状態を取得
   */
  public isVisible(): boolean {
    return this.isDialogVisible;
  }

  /**
   * 要素をクリア
   */
  private clearElements(): void {
    for (const element of this.elements) {
      element.destroy();
    }
    this.elements = [];
  }

  /**
   * リソースを解放
   */
  public destroy(): void {
    this.clearElements();
    this.container.destroy();
  }
}
