/**
 * RankUpRewards コンポーネント
 * TASK-0055 RankUpSceneリファクタリング
 *
 * @description
 * 昇格試験クリア時の報酬表示コンポーネント。
 * ボーナスゴールドとアーティファクト選択UIを提供する。
 */

import { applyHoverAnimation } from '@presentation/ui/utils';
import Phaser from 'phaser';
import type { Artifact, RankUpReward } from './types';

// =============================================================================
// 定数定義
// =============================================================================

/** UIテキスト定数 */
const UI_TEXT = {
  REWARD_BONUS_FORMAT: '💰 ボーナスゴールド: +{gold}G',
  REWARD_SELECT_TITLE: 'アーティファクトを選択してください:',
  SELECT_ARTIFACT_BUTTON: '選択',
} as const;

/** スタイル定数 */
const UI_STYLES = {
  REWARD_TEXT: {
    fontSize: '16px',
    color: '#ffd700',
  },
  TASK_TITLE: {
    fontSize: '18px',
    color: '#ffffff',
  },
  ARTIFACT_NAME: {
    fontSize: '16px',
    color: '#ffffff',
  },
  ARTIFACT_EFFECT: {
    fontSize: '16px',
    color: '#aaaaaa',
  },
  BUTTON_TEXT: {
    fontSize: '18px',
    color: '#ffffff',
  },
} as const;

/** レイアウト定数 */
const LAYOUT = {
  CARD_WIDTH: 130,
  CARD_HEIGHT: 180,
  CARD_SPACING: 150,
  SELECT_TITLE_Y: 40,
  CARD_START_Y: 120,
} as const;

/** カラー定数 */
const CARD_COLORS = {
  BACKGROUND: 0x444444,
  BORDER: 0xcccccc,
  BORDER_HOVER: 0xffd700,
  SELECT_BUTTON: 0xff9800,
} as const;

// =============================================================================
// RankUpRewards クラス
// =============================================================================

/**
 * RankUpRewards - 報酬コンポーネント
 *
 * 【責務】
 * - ボーナスゴールド表示
 * - アーティファクトカード表示（3択）
 * - アーティファクト選択処理
 */
export class RankUpRewards {
  /** Phaserシーン */
  private scene: Phaser.Scene;

  /** メインコンテナ */
  private container: Phaser.GameObjects.Container;

  /** アーティファクト選択コールバック */
  private onSelectArtifact: (artifact: Artifact) => void;

  /** 現在のアーティファクトリスト */
  private currentArtifacts: Artifact[] = [];

  /** ボーナステキスト */
  private bonusText: Phaser.GameObjects.Text | null = null;

  /** 選択タイトルテキスト */
  private selectTitleText: Phaser.GameObjects.Text | null = null;

  /** アーティファクトカードコンテナリスト */
  private artifactCards: Phaser.GameObjects.Container[] = [];

  /**
   * コンストラクタ
   * @param scene - Phaserシーンインスタンス
   * @param x - X座標
   * @param y - Y座標
   * @param callbacks - コールバック関数
   */
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    callbacks: { onSelectArtifact: (artifact: Artifact) => void },
  ) {
    this.scene = scene;
    this.container = scene.add.container(x, y);
    this.onSelectArtifact = callbacks.onSelectArtifact;
  }

  /**
   * UIコンポーネントを作成
   */
  public create(): void {
    // 初期状態は空
  }

  /**
   * 報酬を設定
   * @param reward - 報酬情報
   */
  public setReward(reward: RankUpReward): void {
    this.clearContent();
    this.currentArtifacts = reward.artifacts;

    // ボーナスゴールド表示
    this.createBonusDisplay(reward.bonusGold);

    // アーティファクト選択UI（アーティファクトがある場合のみ）
    if (reward.artifacts.length > 0) {
      this.createSelectTitle();
      this.createArtifactCards(reward.artifacts);
    }
  }

  /**
   * インデックスでアーティファクトを選択
   * @param index - アーティファクトのインデックス
   */
  public selectArtifactByIndex(index: number): void {
    if (index >= 0 && index < this.currentArtifacts.length) {
      this.handleSelectArtifact(this.currentArtifacts[index]);
    }
  }

  /**
   * コンテンツをクリア
   */
  private clearContent(): void {
    this.currentArtifacts = [];
    if (this.bonusText) {
      this.bonusText.destroy();
      this.bonusText = null;
    }
    if (this.selectTitleText) {
      this.selectTitleText.destroy();
      this.selectTitleText = null;
    }
    for (const card of this.artifactCards) {
      card.destroy();
    }
    this.artifactCards = [];
  }

  /**
   * ボーナス表示を作成
   * @param bonusGold - ボーナスゴールド量
   */
  private createBonusDisplay(bonusGold: number): void {
    const bonusTextContent = UI_TEXT.REWARD_BONUS_FORMAT.replace('{gold}', bonusGold.toString());
    this.bonusText = this.scene.make.text({
      x: 0,
      y: 0,
      text: bonusTextContent,
      style: UI_STYLES.REWARD_TEXT,
      add: false,
    });
    this.bonusText.setOrigin(0.5);
    this.container.add(this.bonusText);
  }

  /**
   * 選択タイトルを作成
   */
  private createSelectTitle(): void {
    this.selectTitleText = this.scene.make.text({
      x: 0,
      y: LAYOUT.SELECT_TITLE_Y,
      text: UI_TEXT.REWARD_SELECT_TITLE,
      style: UI_STYLES.TASK_TITLE,
      add: false,
    });
    this.selectTitleText.setOrigin(0.5);
    this.container.add(this.selectTitleText);
  }

  /**
   * アーティファクトカードを作成
   * @param artifacts - アーティファクトリスト
   */
  private createArtifactCards(artifacts: Artifact[]): void {
    artifacts.forEach((artifact, index) => {
      const cardX = (index - 1) * LAYOUT.CARD_SPACING;
      const cardY = LAYOUT.CARD_START_Y;
      const cardContainer = this.createArtifactCard(artifact, cardX, cardY);
      this.artifactCards.push(cardContainer);
      this.container.add(cardContainer);
    });
  }

  /**
   * アーティファクトカードを作成
   * @param artifact - アーティファクト情報
   * @param x - X座標
   * @param y - Y座標
   * @returns カードコンテナ
   */
  private createArtifactCard(
    artifact: Artifact,
    x: number,
    y: number,
  ): Phaser.GameObjects.Container {
    const cardContainer = this.scene.make.container({ x, y, add: false });

    // カード背景
    const cardBg = new Phaser.GameObjects.Rectangle(
      this.scene,
      0,
      0,
      LAYOUT.CARD_WIDTH,
      LAYOUT.CARD_HEIGHT,
      CARD_COLORS.BACKGROUND,
      0.9,
    );
    cardBg.setStrokeStyle(2, CARD_COLORS.BORDER);
    cardContainer.add(cardBg);

    // レアリティ表示
    const rarityText = this.scene.make.text({
      x: 0,
      y: -75,
      text: `★ ${artifact.rarity}`,
      style: UI_STYLES.ARTIFACT_NAME,
      add: false,
    });
    rarityText.setOrigin(0.5);
    cardContainer.add(rarityText);

    // 名前
    const nameText = this.scene.make.text({
      x: 0,
      y: -50,
      text: artifact.name,
      style: UI_STYLES.ARTIFACT_NAME,
      add: false,
    });
    nameText.setOrigin(0.5);
    cardContainer.add(nameText);

    // 効果
    const effectText = this.scene.make.text({
      x: 0,
      y: -10,
      text: artifact.effect,
      style: UI_STYLES.ARTIFACT_EFFECT,
      add: false,
    });
    effectText.setOrigin(0.5);
    cardContainer.add(effectText);

    // 選択ボタン
    const selectButton = new Phaser.GameObjects.Rectangle(
      this.scene,
      0,
      60,
      100,
      30,
      CARD_COLORS.SELECT_BUTTON,
    );
    selectButton.setInteractive({ useHandCursor: true });
    selectButton.on('pointerdown', () => this.handleSelectArtifact(artifact));
    applyHoverAnimation(selectButton, this.scene);
    cardContainer.add(selectButton);

    const selectText = this.scene.make.text({
      x: 0,
      y: 60,
      text: UI_TEXT.SELECT_ARTIFACT_BUTTON,
      style: UI_STYLES.BUTTON_TEXT,
      add: false,
    });
    selectText.setOrigin(0.5);
    cardContainer.add(selectText);

    // カードホバーエフェクト
    cardBg.setInteractive({ useHandCursor: true });
    cardBg.on('pointerover', () => cardBg.setStrokeStyle(2, CARD_COLORS.BORDER_HOVER));
    cardBg.on('pointerout', () => cardBg.setStrokeStyle(2, CARD_COLORS.BORDER));

    return cardContainer;
  }

  /**
   * アーティファクト選択ハンドラ
   * @param artifact - 選択されたアーティファクト
   */
  private handleSelectArtifact(artifact: Artifact): void {
    this.onSelectArtifact(artifact);
  }

  /**
   * コンテナを取得
   * @returns コンテナオブジェクト
   */
  public getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }

  /**
   * 表示状態を設定
   * @param visible - 表示状態
   */
  public setVisible(visible: boolean): this {
    this.container.setVisible(visible);
    return this;
  }

  /**
   * 位置を設定
   * @param x - X座標
   * @param y - Y座標
   */
  public setPosition(x: number, y: number): this {
    this.container.setPosition(x, y);
    return this;
  }

  /**
   * リソースを解放
   */
  public destroy(): void {
    this.clearContent();
    if (this.container) {
      this.container.destroy();
    }
  }
}
