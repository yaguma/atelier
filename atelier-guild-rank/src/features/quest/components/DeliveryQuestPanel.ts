/**
 * DeliveryQuestPanel コンポーネント
 * TASK-0082: features/quest/components作成
 *
 * 納品依頼の詳細情報と納品ボタンを表示するパネルコンポーネント。
 * 依頼内容、報酬、期限などを表示し、納品処理を実行する。
 */

import type { IQuest } from '@shared/types/quests';
import type Phaser from 'phaser';

// =============================================================================
// 定数
// =============================================================================

/** UI配置定数 */
const UI_LAYOUT = {
  PANEL_WIDTH: 400,
  PANEL_HEIGHT: 90,
  PADDING: 20,
  TEXT_SPACING: 20,
} as const;

/** スタイル定数 */
const UI_STYLES = {
  TITLE: { fontSize: '16px', color: '#ffffff', fontStyle: 'bold' },
  DESCRIPTION: { fontSize: '14px', color: '#cccccc' },
  REWARD: { fontSize: '14px', color: '#4caf50' },
  DEADLINE_NORMAL: { fontSize: '14px', color: '#2196f3' },
  DEADLINE_WARNING: { fontSize: '14px', color: '#ff9800' },
  DEADLINE_DANGER: { fontSize: '14px', color: '#f44336' },
} as const;

/** 色定数 */
const PANEL_COLORS = {
  BORDER_NORMAL: 0x4caf50,
  BORDER_SELECTED: 0x2196f3,
  BORDER_WARNING: 0xff9800,
  BORDER_DANGER: 0xf44336,
  BACKGROUND: 0x333333,
  DELIVER_BUTTON: 0x4caf50,
} as const;

/** 期限警告定数 */
const DEADLINE_THRESHOLDS = {
  WARNING_DAYS: 3,
  DANGER_DAYS: 1,
} as const;

// =============================================================================
// 型定義
// =============================================================================

/** DeliveryQuestPanelの設定 */
export interface DeliveryQuestPanelConfig {
  /** 表示する依頼 */
  quest: IQuest;
  /** X座標 */
  x: number;
  /** Y座標 */
  y: number;
  /** 依頼者名 */
  clientName: string;
  /** 残り日数 */
  remainingDays: number;
  /** 納品ボタンクリック時のコールバック */
  onDeliver: () => void;
}

// =============================================================================
// コンポーネント
// =============================================================================

/**
 * 納品依頼パネルコンポーネント
 *
 * 納品対象の依頼を表示し、納品処理を実行するパネル。
 */
export class DeliveryQuestPanel {
  private scene: Phaser.Scene;
  private config: DeliveryQuestPanelConfig;
  private container: Phaser.GameObjects.Container | null = null;
  private panelBg: Phaser.GameObjects.Rectangle | null = null;
  private titleText: Phaser.GameObjects.Text | null = null;
  private rewardText: Phaser.GameObjects.Text | null = null;
  private deadlineText: Phaser.GameObjects.Text | null = null;
  private deliverButton: Phaser.GameObjects.Rectangle | null = null;
  private deliverButtonText: Phaser.GameObjects.Text | null = null;
  private isSelected = false;

  constructor(scene: Phaser.Scene, config: DeliveryQuestPanelConfig) {
    this.scene = scene;
    this.config = config;
  }

  /** パネルを作成 */
  public create(): void {
    this.container = this.scene.add.container(this.config.x, this.config.y);
    this.createPanelBackground();
    this.createQuestInfo();
    this.createDeliverButton();
  }

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

  private createQuestInfo(): void {
    const { quest, clientName, remainingDays } = this.config;

    // タイトル
    this.titleText = this.scene.add.text(
      -UI_LAYOUT.PANEL_WIDTH / 2 + UI_LAYOUT.PADDING,
      -UI_LAYOUT.PANEL_HEIGHT / 2 + UI_LAYOUT.PADDING,
      `${quest.flavorText || '依頼'} - ${clientName}`,
      UI_STYLES.TITLE,
    );
    this.container?.add(this.titleText);

    // 報酬
    this.rewardText = this.scene.add.text(
      -UI_LAYOUT.PANEL_WIDTH / 2 + UI_LAYOUT.PADDING,
      -UI_LAYOUT.PANEL_HEIGHT / 2 + UI_LAYOUT.PADDING + UI_LAYOUT.TEXT_SPACING * 2,
      `報酬: 貢献度${quest.contribution} + ${quest.gold}G`,
      UI_STYLES.REWARD,
    );
    this.container?.add(this.rewardText);

    // 期限
    const deadlineStyle = this.getDeadlineStyle();
    this.deadlineText = this.scene.add.text(
      UI_LAYOUT.PANEL_WIDTH / 2 - UI_LAYOUT.PADDING - 100,
      -UI_LAYOUT.PANEL_HEIGHT / 2 + UI_LAYOUT.PADDING + UI_LAYOUT.TEXT_SPACING,
      `期限: あと${remainingDays}日`,
      deadlineStyle,
    );
    this.container?.add(this.deadlineText);
  }

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
      PANEL_COLORS.DELIVER_BUTTON,
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

  private onPanelClick(): void {
    this.isSelected = !this.isSelected;
    this.updatePanelStyle();
  }

  private onDeliverClick(): void {
    this.config.onDeliver();
  }

  private updatePanelStyle(): void {
    if (!this.panelBg) return;
    const borderColor = this.isSelected ? PANEL_COLORS.BORDER_SELECTED : this.getBorderColor();
    this.panelBg.setStrokeStyle(this.isSelected ? 3 : 2, borderColor);
  }

  private getBorderColor(): number {
    const { remainingDays } = this.config;
    if (remainingDays <= DEADLINE_THRESHOLDS.DANGER_DAYS) {
      return PANEL_COLORS.BORDER_DANGER;
    }
    if (remainingDays <= DEADLINE_THRESHOLDS.WARNING_DAYS) {
      return PANEL_COLORS.BORDER_WARNING;
    }
    return PANEL_COLORS.BORDER_NORMAL;
  }

  private getDeadlineStyle(): Phaser.Types.GameObjects.Text.TextStyle {
    const { remainingDays } = this.config;
    if (remainingDays <= DEADLINE_THRESHOLDS.DANGER_DAYS) {
      return UI_STYLES.DEADLINE_DANGER;
    }
    if (remainingDays <= DEADLINE_THRESHOLDS.WARNING_DAYS) {
      return UI_STYLES.DEADLINE_WARNING;
    }
    return UI_STYLES.DEADLINE_NORMAL;
  }

  /** 選択状態を設定 */
  public setSelected(selected: boolean): void {
    this.isSelected = selected;
    this.updatePanelStyle();
  }

  /** 選択状態を取得 */
  public isQuestSelected(): boolean {
    return this.isSelected;
  }

  /** 依頼データを取得 */
  public getQuest(): IQuest {
    return this.config.quest;
  }

  /** コンテナを取得 */
  public getContainer(): Phaser.GameObjects.Container | null {
    return this.container;
  }

  /** リソースを解放 */
  public destroy(): void {
    if (this.deliverButton) {
      this.deliverButton.off('pointerdown');
    }
    if (this.panelBg) {
      this.panelBg.off('pointerdown');
    }
    if (this.container) {
      this.container.destroy();
      this.container = null;
    }
    this.panelBg = null;
    this.titleText = null;
    this.rewardText = null;
    this.deadlineText = null;
    this.deliverButton = null;
    this.deliverButtonText = null;
  }
}
