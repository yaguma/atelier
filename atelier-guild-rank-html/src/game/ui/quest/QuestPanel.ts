/**
 * QuestPanel実装
 *
 * 依頼の詳細を表示するパネルコンポーネント。
 * 依頼名、期限、報酬、必要アイテムを表示する。
 * 設計文書: docs/tasks/atelier-guild-rank-phaser/TASK-0214.md
 */

import Phaser from 'phaser';
import { Quest } from '../../../domain/quest/QuestEntity';
import type { IQuestPanel, QuestPanelOptions, QuestProgress } from './IQuestPanel';
import { QuestPanelLayout, QuestDifficultyColors } from './QuestPanelConstants';
import { Colors } from '../../config/ColorPalette';
import { TextStyles } from '../../config/TextStyles';

/**
 * QuestPanelクラス
 */
export class QuestPanel implements IQuestPanel {
  public readonly container: Phaser.GameObjects.Container;

  private readonly scene: Phaser.Scene;
  private readonly width: number;
  private readonly height: number;

  private quest: Quest | null = null;

  // UI要素
  private background!: Phaser.GameObjects.Graphics;
  private questNameText!: Phaser.GameObjects.Text;
  private deadlineText!: Phaser.GameObjects.Text;
  private difficultyBadge!: Phaser.GameObjects.Container;
  private rewardSection!: Phaser.GameObjects.Container;
  private requirementSection!: Phaser.GameObjects.Container;
  private progressSection!: Phaser.GameObjects.Container;
  private acceptButton!: Phaser.GameObjects.Container;
  private deliverButton!: Phaser.GameObjects.Container;

  // コールバック
  private onAccept?: (quest: Quest) => void;
  private onReject?: (quest: Quest) => void;
  private onDeliver?: (quest: Quest) => void;

  constructor(scene: Phaser.Scene, options: QuestPanelOptions = {}) {
    this.scene = scene;
    this.width = options.width ?? QuestPanelLayout.WIDTH;
    this.height = options.height ?? QuestPanelLayout.HEIGHT;
    this.onAccept = options.onAccept;
    this.onReject = options.onReject;
    this.onDeliver = options.onDeliver;

    const x = options.x ?? 0;
    const y = options.y ?? 0;

    this.container = scene.add.container(x, y);
    this.container.setDepth(250);

    this.createBackground();
    this.createHeader();
    this.createRewardSection();
    this.createRequirementSection();
    this.createProgressSection();
    this.createButtons();

    // 初期状態は空
    this.showEmptyState();
  }

  // ====================================
  // 公開メソッド
  // ====================================

  setQuest(quest: Quest | null): void {
    this.quest = quest;

    if (!quest) {
      this.showEmptyState();
      return;
    }

    // 依頼名
    this.questNameText.setText(quest.flavorText || '依頼');

    // 期限
    const deadline = quest.deadline;
    this.deadlineText.setText(`期限: ${deadline}日`);
    this.deadlineText.setColor(deadline <= 3 ? '#ff4444' : '#aaaaaa');

    // 難易度バッジ
    this.updateDifficultyBadge(quest.difficulty);

    // 報酬
    this.updateRewardSection(quest);

    // 必要アイテム
    this.updateRequirementSection(quest);

    // ボタン表示
    this.acceptButton.setVisible(true);
    this.deliverButton.setVisible(false);
  }

  getQuest(): Quest | null {
    return this.quest;
  }

  updateProgress(progress: QuestProgress): void {
    this.progressSection.setVisible(true);
    this.updateProgressBar(progress);
  }

  setAcceptEnabled(enabled: boolean): void {
    this.setButtonEnabled(this.acceptButton, enabled);
  }

  setDeliverEnabled(enabled: boolean): void {
    this.setButtonEnabled(this.deliverButton, enabled);
  }

  showDeliverButton(show: boolean): void {
    this.acceptButton.setVisible(!show);
    this.deliverButton.setVisible(show);
  }

  setVisible(visible: boolean): void {
    this.container.setVisible(visible);
  }

  destroy(): void {
    this.container.destroy();
  }

  // ====================================
  // プライベートメソッド - UI作成
  // ====================================

  private createBackground(): void {
    this.background = this.scene.add.graphics();
    this.background.fillStyle(Colors.panelBackground, 0.98);
    this.background.fillRoundedRect(0, 0, this.width, this.height, 12);
    this.background.lineStyle(2, Colors.panelBorder);
    this.background.strokeRoundedRect(0, 0, this.width, this.height, 12);
    this.container.add(this.background);
  }

  private createHeader(): void {
    const { PADDING, HEADER_HEIGHT } = QuestPanelLayout;

    // 依頼名
    this.questNameText = this.scene.add.text(PADDING, PADDING, '依頼を選択してください', {
      ...TextStyles.heading,
      fontSize: '18px',
      wordWrap: { width: this.width - PADDING * 2 - 80 },
    });
    this.container.add(this.questNameText);

    // 難易度バッジ
    this.difficultyBadge = this.scene.add.container(this.width - PADDING - 40, PADDING + 10);
    this.container.add(this.difficultyBadge);

    // 期限
    this.deadlineText = this.scene.add.text(PADDING, PADDING + 30, '', {
      ...TextStyles.bodySmall,
      fontSize: '12px',
      color: '#aaaaaa',
    });
    this.container.add(this.deadlineText);

    // 区切り線
    const divider = this.scene.add.graphics();
    divider.lineStyle(1, Colors.panelBorder);
    divider.lineBetween(PADDING, HEADER_HEIGHT, this.width - PADDING, HEADER_HEIGHT);
    this.container.add(divider);
  }

  private createRewardSection(): void {
    const { PADDING, HEADER_HEIGHT, REWARD_HEIGHT } = QuestPanelLayout;
    const y = HEADER_HEIGHT + 10;

    this.rewardSection = this.scene.add.container(PADDING, y);

    // セクションタイトル
    const title = this.scene.add.text(0, 0, '📦 報酬', {
      ...TextStyles.body,
      fontSize: '14px',
      fontStyle: 'bold',
    });
    this.rewardSection.add(title);

    this.container.add(this.rewardSection);

    // 区切り線
    const divider = this.scene.add.graphics();
    divider.lineStyle(1, Colors.panelBorder);
    divider.lineBetween(PADDING, y + REWARD_HEIGHT, this.width - PADDING, y + REWARD_HEIGHT);
    this.container.add(divider);
  }

  private createRequirementSection(): void {
    const { PADDING, HEADER_HEIGHT, REWARD_HEIGHT } = QuestPanelLayout;
    const y = HEADER_HEIGHT + REWARD_HEIGHT + 20;

    this.requirementSection = this.scene.add.container(PADDING, y);

    // セクションタイトル
    const title = this.scene.add.text(0, 0, '📋 必要アイテム', {
      ...TextStyles.body,
      fontSize: '14px',
      fontStyle: 'bold',
    });
    this.requirementSection.add(title);

    this.container.add(this.requirementSection);
  }

  private createProgressSection(): void {
    const { PADDING } = QuestPanelLayout;
    const y = this.height - 130;

    this.progressSection = this.scene.add.container(PADDING, y);
    this.progressSection.setVisible(false);

    // プログレスバー背景
    const progressBg = this.scene.add.graphics();
    progressBg.fillStyle(Colors.backgroundDark, 1);
    progressBg.fillRoundedRect(0, 0, this.width - PADDING * 2, 20, 4);
    this.progressSection.add(progressBg);

    this.container.add(this.progressSection);
  }

  private createButtons(): void {
    const buttonY = this.height - 50;

    // 受注ボタン
    this.acceptButton = this.createButton(this.width / 2, buttonY, '依頼を受ける', () => {
      if (this.quest && this.onAccept) {
        this.onAccept(this.quest);
      }
    }, true);
    this.container.add(this.acceptButton);

    // 納品ボタン（初期非表示）
    this.deliverButton = this.createButton(this.width / 2, buttonY, '納品する', () => {
      if (this.quest && this.onDeliver) {
        this.onDeliver(this.quest);
      }
    }, true);
    this.deliverButton.setVisible(false);
    this.container.add(this.deliverButton);
  }

  // ====================================
  // プライベートメソッド - 更新
  // ====================================

  private showEmptyState(): void {
    this.questNameText.setText('依頼を選択してください');
    this.deadlineText.setText('');
    this.clearDifficultyBadge();
    this.clearSection(this.rewardSection);
    this.clearSection(this.requirementSection);
    this.progressSection.setVisible(false);
    this.acceptButton.setVisible(false);
    this.deliverButton.setVisible(false);
  }

  private updateDifficultyBadge(difficulty: string): void {
    this.clearDifficultyBadge();

    const color = QuestDifficultyColors[difficulty] ?? 0x888888;
    const bg = this.scene.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(-30, -10, 60, 20, 4);
    this.difficultyBadge.add(bg);

    const text = this.scene.add.text(0, 0, difficulty.toUpperCase(), {
      fontSize: '10px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    text.setOrigin(0.5);
    this.difficultyBadge.add(text);
  }

  private clearDifficultyBadge(): void {
    this.difficultyBadge.removeAll(true);
  }

  private updateRewardSection(quest: Quest): void {
    this.clearSection(this.rewardSection);

    // 再度タイトルを追加
    const title = this.scene.add.text(0, 0, '📦 報酬', {
      ...TextStyles.body,
      fontSize: '14px',
      fontStyle: 'bold',
    });
    this.rewardSection.add(title);

    const rewards: string[] = [];
    if (quest.gold) rewards.push(`💰 ${quest.gold} ゴールド`);
    if (quest.contribution) rewards.push(`✨ ${quest.contribution} 貢献度`);

    rewards.forEach((reward, index) => {
      const text = this.scene.add.text(0, 25 + index * 20, reward, {
        ...TextStyles.body,
        fontSize: '13px',
      });
      this.rewardSection.add(text);
    });
  }

  private updateRequirementSection(quest: Quest): void {
    this.clearSection(this.requirementSection);

    // 再度タイトルを追加
    const title = this.scene.add.text(0, 0, '📋 必要アイテム', {
      ...TextStyles.body,
      fontSize: '14px',
      fontStyle: 'bold',
    });
    this.requirementSection.add(title);

    // 条件から必要アイテムを表示
    const condition = quest.condition;
    const items: string[] = [];

    if (condition.itemId) {
      items.push(`・アイテムID: ${condition.itemId} x${condition.quantity || 1}`);
    } else if (condition.category) {
      items.push(`・カテゴリ: ${condition.category} x${condition.quantity || 1}`);
    }

    if (condition.minQuality) {
      items.push(`・品質: ${condition.minQuality}以上`);
    }

    items.forEach((item, index) => {
      const text = this.scene.add.text(0, 25 + index * 20, item, {
        ...TextStyles.body,
        fontSize: '13px',
      });
      this.requirementSection.add(text);
    });
  }

  private updateProgressBar(progress: QuestProgress): void {
    // プログレスバーを更新
    // 既存の要素をクリア（背景以外）
    while (this.progressSection.length > 1) {
      const element = this.progressSection.getAt(1) as Phaser.GameObjects.GameObject;
      element.destroy();
      this.progressSection.removeAt(1);
    }

    const { PADDING } = QuestPanelLayout;
    const barWidth = this.width - PADDING * 2;

    // 完了率を計算
    let totalRequired = 0;
    let totalCurrent = 0;
    progress.items.forEach((item) => {
      totalRequired += item.required;
      totalCurrent += Math.min(item.current, item.required);
    });

    const ratio = totalRequired > 0 ? totalCurrent / totalRequired : 0;

    // プログレスバー本体
    const progressBar = this.scene.add.graphics();
    progressBar.fillStyle(progress.isComplete ? 0x00aa00 : Colors.primary, 1);
    progressBar.fillRoundedRect(0, 0, barWidth * ratio, 20, 4);
    this.progressSection.add(progressBar);

    // テキスト
    const progressText = this.scene.add.text(barWidth / 2, 10, `${Math.floor(ratio * 100)}%`, {
      fontSize: '12px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    progressText.setOrigin(0.5);
    this.progressSection.add(progressText);
  }

  private clearSection(section: Phaser.GameObjects.Container): void {
    section.removeAll(true);
  }

  // ====================================
  // ボタンヘルパー
  // ====================================

  private createButton(
    x: number,
    y: number,
    label: string,
    onClick: () => void,
    primary: boolean = false,
    enabled: boolean = true
  ): Phaser.GameObjects.Container {
    const buttonContainer = this.scene.add.container(x, y);
    const width = 140;
    const height = 40;

    const bg = this.scene.add.graphics();
    const bgColor = primary ? Colors.primary : Colors.backgroundDark;
    bg.fillStyle(bgColor, enabled ? 1 : 0.5);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 6);
    bg.lineStyle(2, primary ? Colors.primaryHover : Colors.panelBorder);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 6);
    buttonContainer.add(bg);

    const text = this.scene.add.text(0, 0, label, {
      ...TextStyles.button,
      fontSize: '14px',
    });
    text.setOrigin(0.5);
    text.setAlpha(enabled ? 1 : 0.5);
    buttonContainer.add(text);

    if (enabled) {
      buttonContainer.setInteractive(
        new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
        Phaser.Geom.Rectangle.Contains
      );

      buttonContainer.on('pointerover', () => {
        bg.clear();
        bg.fillStyle(primary ? Colors.primaryHover : 0x4a4a6a, 1);
        bg.fillRoundedRect(-width / 2, -height / 2, width, height, 6);
        bg.lineStyle(2, primary ? Colors.primaryHover : Colors.panelBorder);
        bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 6);
      });

      buttonContainer.on('pointerout', () => {
        bg.clear();
        bg.fillStyle(bgColor, 1);
        bg.fillRoundedRect(-width / 2, -height / 2, width, height, 6);
        bg.lineStyle(2, primary ? Colors.primaryHover : Colors.panelBorder);
        bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 6);
      });

      buttonContainer.on('pointerdown', onClick);
    }

    buttonContainer.setData('bg', bg);
    buttonContainer.setData('text', text);
    buttonContainer.setData('enabled', enabled);
    buttonContainer.setData('primary', primary);
    buttonContainer.setData('bgColor', bgColor);

    return buttonContainer;
  }

  private setButtonEnabled(button: Phaser.GameObjects.Container, enabled: boolean): void {
    const bg = button.getData('bg') as Phaser.GameObjects.Graphics;
    const text = button.getData('text') as Phaser.GameObjects.Text;
    const primary = button.getData('primary') as boolean;
    const bgColor = button.getData('bgColor') as number;
    button.setData('enabled', enabled);

    text.setAlpha(enabled ? 1 : 0.5);

    const width = 140;
    const height = 40;

    bg.clear();
    bg.fillStyle(bgColor, enabled ? 1 : 0.5);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 6);
    bg.lineStyle(2, primary ? Colors.primaryHover : Colors.panelBorder);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 6);

    if (enabled) {
      button.setInteractive(
        new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
        Phaser.Geom.Rectangle.Contains
      );
    } else {
      button.disableInteractive();
    }
  }
}
