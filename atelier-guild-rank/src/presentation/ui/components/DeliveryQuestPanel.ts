/**
 * DeliveryQuestPanelコンポーネント
 * TASK-0025 納品フェーズUI - 納品依頼パネル
 *
 * @description
 * 納品依頼の詳細情報と納品ボタンを表示するパネルコンポーネント。
 * 依頼内容、報酬、期限などを表示し、納品処理を実行する。
 */

import type Phaser from 'phaser';

// =============================================================================
// 定数定義
// =============================================================================

/** UI配置定数 */
const UI_LAYOUT = {
  /** パネル幅 */
  PANEL_WIDTH: 400,
  /** パネル高さ */
  PANEL_HEIGHT: 90,
  /** 内部パディング */
  PADDING: 20,
  /** テキスト間隔 */
  TEXT_SPACING: 20,
} as const;

/** スタイル定数 */
const UI_STYLES = {
  TITLE: {
    fontSize: '16px',
    color: '#ffffff',
    fontStyle: 'bold',
  },
  DESCRIPTION: {
    fontSize: '14px',
    color: '#cccccc',
  },
  REWARD: {
    fontSize: '14px',
    color: '#4caf50',
  },
  DEADLINE_NORMAL: {
    fontSize: '14px',
    color: '#2196f3',
  },
  DEADLINE_WARNING: {
    fontSize: '14px',
    color: '#ff9800',
  },
  DEADLINE_DANGER: {
    fontSize: '14px',
    color: '#f44336',
  },
} as const;

/** 色定数 */
const PANEL_COLORS = {
  /** 通常状態の枠線色 */
  BORDER_NORMAL: 0x4caf50,
  /** 選択状態の枠線色 */
  BORDER_SELECTED: 0x2196f3,
  /** 期限間近の枠線色 */
  BORDER_WARNING: 0xff9800,
  /** 期限切れ間近の枠線色 */
  BORDER_DANGER: 0xf44336,
  /** 背景色 */
  BACKGROUND: 0x333333,
} as const;

/** 期限警告定数 */
const DEADLINE_THRESHOLDS = {
  /** 期限警告（3日以内） */
  WARNING_DAYS: 3,
  /** 期限危険（1日以内） */
  DANGER_DAYS: 1,
} as const;

/**
 * 品質タイプ
 */
type Quality = 'C' | 'B' | 'A' | 'S';

/**
 * Questインターフェース
 */
interface Quest {
  id: string;
  clientName: string;
  clientType: string;
  description: string;
  requiredItem: string;
  requiredCount: number;
  rewardContribution: number;
  rewardGold: number;
  remainingDays: number;
  status: 'available' | 'accepted' | 'completed' | 'failed';
}

/**
 * ItemInstanceインターフェース
 */
interface ItemInstance {
  instanceId: string;
  itemId: string;
  name: string;
  quality: Quality;
  attributes: { name: string; value: number }[];
}

/**
 * ContributionPreviewインターフェース
 */
interface ContributionPreview {
  baseReward: number;
  qualityModifier: number;
  qualityBonus: number;
  totalContribution: number;
}

/**
 * ContributionCalculatorインターフェース
 */
interface IContributionCalculator {
  calculatePreview(
    quest: Quest,
    items: ItemInstance[],
  ): ContributionPreview;
}

/**
 * DeliveryQuestPanelOptionsインターフェース
 */
interface DeliveryQuestPanelOptions {
  quest: Quest;
  x: number;
  y: number;
  onDeliver: (items: ItemInstance[]) => void;
  contributionCalculator: IContributionCalculator;
}

/**
 * DeliveryQuestPanelコンポーネント
 *
 * 納品依頼の詳細情報を表示し、納品処理を実行するパネル。
 */
export class DeliveryQuestPanel {
  private scene: Phaser.Scene;
  private options: DeliveryQuestPanelOptions;
  private container: Phaser.GameObjects.Container | null = null;
  private panelBg: Phaser.GameObjects.Rectangle | null = null;
  private titleText: Phaser.GameObjects.Text | null = null;
  private requirementText: Phaser.GameObjects.Text | null = null;
  private rewardText: Phaser.GameObjects.Text | null = null;
  private deadlineText: Phaser.GameObjects.Text | null = null;
  private deliverButton: Phaser.GameObjects.Rectangle | null = null;
  private deliverButtonText: Phaser.GameObjects.Text | null = null;
  private isSelected = false;

  /**
   * コンストラクタ
   * @param scene - Phaserシーンインスタンス
   * @param options - パネルオプション
   */
  constructor(scene: Phaser.Scene, options: DeliveryQuestPanelOptions) {
    this.scene = scene;
    this.options = options;
  }

  /**
   * パネルを作成
   */
  public create(): void {
    this.container = this.scene.add.container(
      this.options.x,
      this.options.y,
    );

    // パネル背景を作成
    this.createPanelBackground();

    // 依頼情報を作成
    this.createQuestInfo();

    // 納品ボタンを作成
    this.createDeliverButton();
  }

  /**
   * パネル背景を作成
   */
  private createPanelBackground(): void {
    const borderColor = this.getBorderColor();

    this.panelBg = this.scene.add.rectangle(
      0,
      0,
      UI_LAYOUT.PANEL_WIDTH,
      UI_LAYOUT.PANEL_HEIGHT,
      PANEL_COLORS.BACKGROUND,
      0.8,
    );
    this.panelBg.setStrokeStyle(2, borderColor);
    this.panelBg.setInteractive({ useHandCursor: true });
    this.panelBg.on('pointerdown', () => this.onPanelClick());

    this.container?.add(this.panelBg);
  }

  /**
   * 依頼情報を作成
   */
  private createQuestInfo(): void {
    const { quest } = this.options;

    // タイトル（依頼説明 - 依頼者）
    this.titleText = this.scene.add.text(
      -UI_LAYOUT.PANEL_WIDTH / 2 + UI_LAYOUT.PADDING,
      -UI_LAYOUT.PANEL_HEIGHT / 2 + UI_LAYOUT.PADDING,
      `${quest.description} - ${quest.clientName}`,
      UI_STYLES.TITLE,
    );
    this.container?.add(this.titleText);

    // 要求アイテム
    this.requirementText = this.scene.add.text(
      -UI_LAYOUT.PANEL_WIDTH / 2 + UI_LAYOUT.PADDING,
      -UI_LAYOUT.PANEL_HEIGHT / 2 + UI_LAYOUT.PADDING + UI_LAYOUT.TEXT_SPACING,
      `要求: ${quest.requiredItem}`,
      UI_STYLES.DESCRIPTION,
    );
    this.container?.add(this.requirementText);

    // 報酬
    this.rewardText = this.scene.add.text(
      -UI_LAYOUT.PANEL_WIDTH / 2 + UI_LAYOUT.PADDING,
      -UI_LAYOUT.PANEL_HEIGHT / 2 + UI_LAYOUT.PADDING + UI_LAYOUT.TEXT_SPACING * 2,
      `報酬: 貢献度${quest.rewardContribution} + ${quest.rewardGold}G`,
      UI_STYLES.REWARD,
    );
    this.container?.add(this.rewardText);

    // 期限
    const deadlineStyle = this.getDeadlineStyle();
    this.deadlineText = this.scene.add.text(
      UI_LAYOUT.PANEL_WIDTH / 2 - UI_LAYOUT.PADDING - 100,
      -UI_LAYOUT.PANEL_HEIGHT / 2 + UI_LAYOUT.PADDING + UI_LAYOUT.TEXT_SPACING,
      `期限: あと${quest.remainingDays}日`,
      deadlineStyle,
    );
    this.container?.add(this.deadlineText);
  }

  /**
   * 納品ボタンを作成
   */
  private createDeliverButton(): void {
    const buttonWidth = 100;
    const buttonHeight = 30;
    const buttonX = UI_LAYOUT.PANEL_WIDTH / 2 - UI_LAYOUT.PADDING - buttonWidth / 2;
    const buttonY = UI_LAYOUT.PANEL_HEIGHT / 2 - UI_LAYOUT.PADDING - buttonHeight / 2;

    this.deliverButton = this.scene.add.rectangle(
      buttonX,
      buttonY,
      buttonWidth,
      buttonHeight,
      0x4caf50,
    );
    this.deliverButton.setInteractive({ useHandCursor: true });
    this.deliverButton.on('pointerdown', () => this.onDeliverClick());
    this.container?.add(this.deliverButton);

    this.deliverButtonText = this.scene.add.text(
      buttonX,
      buttonY,
      '納品する',
      UI_STYLES.DESCRIPTION,
    );
    this.deliverButtonText.setOrigin(0.5);
    this.container?.add(this.deliverButtonText);
  }

  /**
   * パネルクリック時の処理
   */
  private onPanelClick(): void {
    this.isSelected = !this.isSelected;
    this.updatePanelStyle();
  }

  /**
   * 納品ボタンクリック時の処理
   */
  private onDeliverClick(): void {
    // 簡易実装: 空の配列を渡す（実際は選択されたアイテムを渡す）
    this.options.onDeliver([]);
  }

  /**
   * パネルスタイルを更新
   */
  private updatePanelStyle(): void {
    if (!this.panelBg) {
      return;
    }

    const borderColor = this.isSelected
      ? PANEL_COLORS.BORDER_SELECTED
      : this.getBorderColor();

    this.panelBg.setStrokeStyle(this.isSelected ? 3 : 2, borderColor);
  }

  /**
   * 枠線色を取得
   * @returns 枠線色
   */
  private getBorderColor(): number {
    const { remainingDays } = this.options.quest;

    if (remainingDays <= DEADLINE_THRESHOLDS.DANGER_DAYS) {
      return PANEL_COLORS.BORDER_DANGER;
    }

    if (remainingDays <= DEADLINE_THRESHOLDS.WARNING_DAYS) {
      return PANEL_COLORS.BORDER_WARNING;
    }

    return PANEL_COLORS.BORDER_NORMAL;
  }

  /**
   * 期限スタイルを取得
   * @returns 期限テキストスタイル
   */
  private getDeadlineStyle(): Phaser.Types.GameObjects.Text.TextStyle {
    const { remainingDays } = this.options.quest;

    if (remainingDays <= DEADLINE_THRESHOLDS.DANGER_DAYS) {
      return UI_STYLES.DEADLINE_DANGER;
    }

    if (remainingDays <= DEADLINE_THRESHOLDS.WARNING_DAYS) {
      return UI_STYLES.DEADLINE_WARNING;
    }

    return UI_STYLES.DEADLINE_NORMAL;
  }

  /**
   * 選択状態を設定
   * @param selected - 選択状態
   */
  public setSelected(selected: boolean): void {
    this.isSelected = selected;
    this.updatePanelStyle();
  }

  /**
   * 選択状態を取得
   * @returns 選択状態
   */
  public isQuestSelected(): boolean {
    return this.isSelected;
  }

  /**
   * 依頼を取得
   * @returns 依頼データ
   */
  public getQuest(): Quest {
    return this.options.quest;
  }

  /**
   * リソースを解放
   */
  public destroy(): void {
    if (this.container) {
      this.container.destroy();
      this.container = null;
    }

    this.panelBg = null;
    this.titleText = null;
    this.requirementText = null;
    this.rewardText = null;
    this.deadlineText = null;
    this.deliverButton = null;
    this.deliverButtonText = null;
  }
}
