/**
 * RankUpScene - 昇格試験シーン
 *
 * TASK-0244: RankUpSceneレイアウト設計
 * 昇格試験の要件表示と進捗状況を管理するシーン。
 */

import Phaser from 'phaser';
import { BaseGameScene, SceneInitData } from './BaseGameScene';
import {
  RankUpSceneLayout,
  RankExamRequirement,
  RankUpReward,
  RequirementIcons,
  RewardIcons,
  ProgressBarColors,
  OverallProgressBarLayout,
  IndividualProgressBarLayout,
} from './RankUpSceneConstants';
import { SceneKeys } from '../config/SceneKeys';
import { Colors } from '../config/ColorPalette';
import { TextStyles } from '../config/TextStyles';

/**
 * RankUpSceneの初期化データ
 */
export interface RankUpSceneData extends SceneInitData {
  currentRank: string;
  targetRank: string;
  examTitle: string;
  examDescription: string;
  requirements: RankExamRequirement[];
  rewards: RankUpReward[];
  returnScene?: string;
}

/**
 * 昇格試験シーン
 */
export class RankUpScene extends BaseGameScene {
  // UI要素
  private headerContainer!: Phaser.GameObjects.Container;
  private titleContainer!: Phaser.GameObjects.Container;
  private requirementsPanel!: Phaser.GameObjects.Container;
  private progressPanel!: Phaser.GameObjects.Container;
  private rewardsPanel!: Phaser.GameObjects.Container;
  private challengeButton!: Phaser.GameObjects.Container;
  private backButton!: Phaser.GameObjects.Container;

  // データ
  private sceneData!: RankUpSceneData;
  private allRequirementsMet: boolean = false;

  constructor() {
    super(SceneKeys.RANK_UP);
  }

  protected onInit(data?: RankUpSceneData): void {
    if (data) {
      this.sceneData = data;
    } else {
      // デフォルトデータ
      this.sceneData = this.getDefaultSceneData();
    }
  }

  protected onPreload(): void {
    // RankUpScene固有アセット（現時点では不要）
  }

  protected onCreate(_data?: RankUpSceneData): void {
    this.createBackground();
    this.createHeader();
    this.createTitleArea();
    this.createRequirementsPanel();
    this.createProgressPanel();
    this.createRewardsPanel();
    this.createButtons();

    // 要件達成判定
    this.checkRequirements();
  }

  protected setupEventListeners(): void {
    // 昇格関連イベントのリスナー設定
  }

  // =====================================================
  // デフォルトデータ
  // =====================================================

  private getDefaultSceneData(): RankUpSceneData {
    return {
      currentRank: 'G',
      targetRank: 'F',
      examTitle: 'Fランク昇格試験',
      examDescription: '基本的な依頼をこなして、Fランクへ昇格しましょう。',
      requirements: [
        { type: 'quest', description: '依頼を3件完了', targetValue: 3, currentValue: 0 },
        { type: 'alchemy', description: '調合を5回成功', targetValue: 5, currentValue: 0 },
        { type: 'gold', description: '500G以上所持', targetValue: 500, currentValue: 0 },
      ],
      rewards: [
        { type: 'card', name: '新しいレシピ', description: '中級調合レシピが解放' },
        { type: 'unlock', name: '新エリア解放', description: '森の奥地が探索可能に' },
      ],
      returnScene: SceneKeys.MAIN,
    };
  }

  // =====================================================
  // 背景
  // =====================================================

  private createBackground(): void {
    const bg = this.add.graphics();
    bg.fillStyle(Colors.backgroundDark, 1);
    bg.fillRect(0, 0, RankUpSceneLayout.SCREEN_WIDTH, RankUpSceneLayout.SCREEN_HEIGHT);

    // 装飾的な光彩
    const glow = this.add.graphics();
    glow.fillStyle(Colors.primary, 0.1);
    glow.fillCircle(RankUpSceneLayout.SCREEN_WIDTH / 2, 200, 300);
  }

  // =====================================================
  // ヘッダー
  // =====================================================

  private createHeader(): void {
    const { HEADER } = RankUpSceneLayout;

    this.headerContainer = this.add.container(HEADER.X, HEADER.Y);

    // ヘッダー背景
    const bg = this.add.graphics();
    bg.fillStyle(Colors.panelBackground, 1);
    bg.fillRect(0, 0, HEADER.WIDTH, HEADER.HEIGHT);
    this.headerContainer.add(bg);

    // 現在ランク
    const currentRankLabel = this.add.text(100, 20, '現在のランク', {
      ...TextStyles.body,
      fontSize: '14px',
      color: '#888888',
    });
    this.headerContainer.add(currentRankLabel);

    const currentRankValue = this.add.text(100, 42, this.sceneData.currentRank, {
      ...TextStyles.heading,
      fontSize: '24px',
    });
    this.headerContainer.add(currentRankValue);

    // 矢印
    const arrow = this.add.text(HEADER.WIDTH / 2, HEADER.HEIGHT / 2, '→', {
      fontSize: '32px',
      color: '#ffcc00',
    }).setOrigin(0.5);
    this.headerContainer.add(arrow);

    // 目標ランク
    const targetRankLabel = this.add.text(HEADER.WIDTH - 200, 20, '目標ランク', {
      ...TextStyles.body,
      fontSize: '14px',
      color: '#888888',
    });
    this.headerContainer.add(targetRankLabel);

    const targetRankValue = this.add.text(HEADER.WIDTH - 200, 42, this.sceneData.targetRank, {
      ...TextStyles.heading,
      fontSize: '24px',
      color: '#ffcc00',
    });
    this.headerContainer.add(targetRankValue);
  }

  // =====================================================
  // タイトルエリア
  // =====================================================

  private createTitleArea(): void {
    const { TITLE_AREA } = RankUpSceneLayout;

    this.titleContainer = this.add.container(TITLE_AREA.X, TITLE_AREA.Y);

    // 試験タイトル
    const title = this.add.text(
      TITLE_AREA.WIDTH / 2,
      20,
      `【昇格試験】${this.sceneData.examTitle}`,
      {
        ...TextStyles.titleSmall,
        fontSize: '24px',
      }
    ).setOrigin(0.5, 0);
    this.titleContainer.add(title);

    // 説明文
    const description = this.add.text(
      TITLE_AREA.WIDTH / 2,
      60,
      this.sceneData.examDescription,
      {
        ...TextStyles.body,
        fontSize: '14px',
        color: '#aaaaaa',
        wordWrap: { width: TITLE_AREA.WIDTH - 40 },
        align: 'center',
      }
    ).setOrigin(0.5, 0);
    this.titleContainer.add(description);
  }

  // =====================================================
  // 要件パネル
  // =====================================================

  private createRequirementsPanel(): void {
    const { REQUIREMENTS_AREA } = RankUpSceneLayout;

    this.requirementsPanel = this.add.container(REQUIREMENTS_AREA.X, REQUIREMENTS_AREA.Y);

    // パネル背景
    const bg = this.add.graphics();
    bg.fillStyle(Colors.panelBackground, 1);
    bg.fillRoundedRect(0, 0, REQUIREMENTS_AREA.WIDTH, REQUIREMENTS_AREA.HEIGHT, 8);
    bg.lineStyle(1, Colors.panelBorder);
    bg.strokeRoundedRect(0, 0, REQUIREMENTS_AREA.WIDTH, REQUIREMENTS_AREA.HEIGHT, 8);
    this.requirementsPanel.add(bg);

    // タイトル
    const panelTitle = this.add.text(REQUIREMENTS_AREA.WIDTH / 2, 20, '試験要件', {
      ...TextStyles.heading,
      fontSize: '18px',
    }).setOrigin(0.5);
    this.requirementsPanel.add(panelTitle);

    // 要件リスト
    let y = 60;
    this.sceneData.requirements.forEach((req) => {
      const reqItem = this.createRequirementItem(req, 20, y);
      this.requirementsPanel.add(reqItem);
      y += 50;
    });
  }

  private createRequirementItem(
    req: RankExamRequirement,
    x: number,
    y: number
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    // アイコン
    const icon = RequirementIcons[req.type] ?? '📌';
    const iconText = this.add.text(0, 10, icon, { fontSize: '20px' });
    container.add(iconText);

    // 説明
    const desc = this.add.text(40, 0, req.description, {
      ...TextStyles.body,
      fontSize: '14px',
    });
    container.add(desc);

    // 達成状況
    const isMet = req.currentValue >= req.targetValue;
    const statusText = `${req.currentValue} / ${req.targetValue}`;
    const status = this.add.text(40, 22, statusText, {
      ...TextStyles.body,
      fontSize: '12px',
      color: isMet ? '#00ff00' : '#ffcc00',
    });
    container.add(status);

    // チェックマーク
    if (isMet) {
      const check = this.add.text(380, 10, '✓', {
        fontSize: '20px',
        color: '#00ff00',
      });
      container.add(check);
    }

    return container;
  }

  // =====================================================
  // 進捗パネル
  // =====================================================

  private createProgressPanel(): void {
    const { PROGRESS_AREA } = RankUpSceneLayout;

    this.progressPanel = this.add.container(PROGRESS_AREA.X, PROGRESS_AREA.Y);

    // パネル背景
    const bg = this.add.graphics();
    bg.fillStyle(Colors.panelBackground, 1);
    bg.fillRoundedRect(0, 0, PROGRESS_AREA.WIDTH, PROGRESS_AREA.HEIGHT, 8);
    bg.lineStyle(1, Colors.panelBorder);
    bg.strokeRoundedRect(0, 0, PROGRESS_AREA.WIDTH, PROGRESS_AREA.HEIGHT, 8);
    this.progressPanel.add(bg);

    // タイトル
    const panelTitle = this.add.text(PROGRESS_AREA.WIDTH / 2, 20, '達成進捗', {
      ...TextStyles.heading,
      fontSize: '18px',
    }).setOrigin(0.5);
    this.progressPanel.add(panelTitle);

    // 総合進捗バー
    this.createOverallProgressBar();

    // 個別進捗
    let y = 120;
    this.sceneData.requirements.forEach((req) => {
      const progressBar = this.createIndividualProgressBar(req, 30, y);
      this.progressPanel.add(progressBar);
      y += 45;
    });
  }

  private createOverallProgressBar(): void {
    const totalRequirements = this.sceneData.requirements.length;
    const metRequirements = this.sceneData.requirements.filter(
      (req) => req.currentValue >= req.targetValue
    ).length;

    const progress = totalRequirements > 0 ? metRequirements / totalRequirements : 0;

    const { X, Y, WIDTH, HEIGHT, BORDER_RADIUS } = OverallProgressBarLayout;

    // 背景
    const bgBar = this.add.graphics();
    bgBar.fillStyle(ProgressBarColors.background, 1);
    bgBar.fillRoundedRect(X, Y, WIDTH, HEIGHT, BORDER_RADIUS);
    this.progressPanel.add(bgBar);

    // 進捗バー
    if (progress > 0) {
      const progressBar = this.add.graphics();
      const color = progress >= 1 ? ProgressBarColors.complete : ProgressBarColors.warning;
      progressBar.fillStyle(color, 1);
      progressBar.fillRoundedRect(X, Y, WIDTH * progress, HEIGHT, BORDER_RADIUS);
      this.progressPanel.add(progressBar);
    }

    // パーセント表示
    const percentText = this.add.text(X + WIDTH / 2, Y + HEIGHT / 2, `${Math.round(progress * 100)}%`, {
      ...TextStyles.heading,
      fontSize: '16px',
    }).setOrigin(0.5);
    this.progressPanel.add(percentText);
  }

  private createIndividualProgressBar(
    req: RankExamRequirement,
    x: number,
    y: number
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const { BAR_X, BAR_WIDTH, BAR_HEIGHT, BORDER_RADIUS, VALUE_X } = IndividualProgressBarLayout;

    // ラベル（短縮）
    const labelText = req.description.length > 15
      ? req.description.slice(0, 15) + '...'
      : req.description;
    const label = this.add.text(0, 0, labelText, {
      ...TextStyles.body,
      fontSize: '12px',
    });
    container.add(label);

    // バー背景
    const bgBar = this.add.graphics();
    bgBar.fillStyle(ProgressBarColors.background, 1);
    bgBar.fillRoundedRect(BAR_X, -5, BAR_WIDTH, BAR_HEIGHT, BORDER_RADIUS);
    container.add(bgBar);

    // 進捗バー
    const progress = Math.min(req.currentValue / req.targetValue, 1);
    if (progress > 0) {
      const progressBar = this.add.graphics();
      const color = progress >= 1 ? ProgressBarColors.complete : ProgressBarColors.incomplete;
      progressBar.fillStyle(color, 1);
      progressBar.fillRoundedRect(BAR_X, -5, BAR_WIDTH * progress, BAR_HEIGHT, BORDER_RADIUS);
      container.add(progressBar);
    }

    // 数値
    const valueText = this.add.text(VALUE_X, 0, `${req.currentValue}/${req.targetValue}`, {
      ...TextStyles.body,
      fontSize: '11px',
    });
    container.add(valueText);

    return container;
  }

  // =====================================================
  // 報酬パネル
  // =====================================================

  private createRewardsPanel(): void {
    const { REWARDS_AREA } = RankUpSceneLayout;

    this.rewardsPanel = this.add.container(REWARDS_AREA.X, REWARDS_AREA.Y);

    // パネル背景
    const bg = this.add.graphics();
    bg.fillStyle(Colors.panelBackground, 1);
    bg.fillRoundedRect(0, 0, REWARDS_AREA.WIDTH, REWARDS_AREA.HEIGHT, 8);
    bg.lineStyle(1, Colors.panelBorder);
    bg.strokeRoundedRect(0, 0, REWARDS_AREA.WIDTH, REWARDS_AREA.HEIGHT, 8);
    this.rewardsPanel.add(bg);

    // タイトル
    const panelTitle = this.add.text(20, 15, '昇格報酬', {
      ...TextStyles.heading,
      fontSize: '16px',
    });
    this.rewardsPanel.add(panelTitle);

    // 報酬リスト
    let x = 30;
    this.sceneData.rewards.forEach((reward) => {
      const rewardItem = this.createRewardItem(reward, x, 50);
      this.rewardsPanel.add(rewardItem);
      x += 220;
    });
  }

  private createRewardItem(reward: RankUpReward, x: number, y: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    // アイコン背景
    const iconBg = this.add.graphics();
    iconBg.fillStyle(0xffaa00, 0.2);
    iconBg.fillRoundedRect(0, 0, 50, 50, 8);
    container.add(iconBg);

    // アイコン
    const icon = RewardIcons[reward.type] ?? '🎁';
    const iconText = this.add.text(25, 25, icon, { fontSize: '24px' }).setOrigin(0.5);
    container.add(iconText);

    // 名前
    const nameText = this.add.text(60, 10, reward.name, {
      ...TextStyles.body,
      fontSize: '14px',
    });
    container.add(nameText);

    // 説明
    if (reward.description) {
      const descText = this.add.text(60, 30, reward.description, {
        ...TextStyles.body,
        fontSize: '11px',
        color: '#888888',
      });
      container.add(descText);
    }

    return container;
  }

  // =====================================================
  // ボタン
  // =====================================================

  private createButtons(): void {
    const { BUTTON_AREA } = RankUpSceneLayout;

    // 挑戦ボタン
    this.challengeButton = this.createButton(
      '試験に挑戦',
      BUTTON_AREA.WIDTH / 2 + 100,
      BUTTON_AREA.Y + 44,
      200,
      50,
      () => this.handleChallenge()
    );

    // 戻るボタン
    this.backButton = this.createButton(
      '戻る',
      BUTTON_AREA.WIDTH / 2 - 100,
      BUTTON_AREA.Y + 44,
      150,
      50,
      () => this.handleBack(),
      true
    );
  }

  private createButton(
    text: string,
    x: number,
    y: number,
    width: number,
    height: number,
    onClick: () => void,
    isSecondary: boolean = false
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    // 背景
    const bg = this.add.graphics();
    const bgColor = isSecondary ? 0x444466 : Colors.primary;
    bg.fillStyle(bgColor, 1);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8);
    container.add(bg);

    // テキスト
    const btnText = this.add.text(0, 0, text, {
      ...TextStyles.button,
      fontSize: '16px',
    }).setOrigin(0.5);
    container.add(btnText);

    // インタラクティブ
    container.setSize(width, height);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(isSecondary ? 0x555588 : 0x4488ff, 1);
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8);
    });

    container.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(bgColor, 1);
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8);
    });

    container.on('pointerdown', onClick);

    return container;
  }

  // =====================================================
  // 要件判定
  // =====================================================

  private checkRequirements(): void {
    this.allRequirementsMet = this.sceneData.requirements.every(
      (req) => req.currentValue >= req.targetValue
    );

    this.updateChallengeButton();
  }

  private updateChallengeButton(): void {
    if (this.allRequirementsMet) {
      this.challengeButton.setAlpha(1);
      this.challengeButton.setInteractive();
    } else {
      this.challengeButton.setAlpha(0.5);
      this.challengeButton.disableInteractive();
    }
  }

  // =====================================================
  // イベントハンドラ
  // =====================================================

  private handleChallenge(): void {
    if (!this.allRequirementsMet) return;

    // 昇格試験開始イベントを発行（Application層が購読）
    // NOTE: このイベントはEventPayloadMapに追加が必要な場合がある
    (this.eventBus as unknown as { emit: (event: string, payload: unknown) => void }).emit(
      'rankup:challenge:start',
      {
        currentRank: this.sceneData.currentRank,
        targetRank: this.sceneData.targetRank,
      }
    );
  }

  private handleBack(): void {
    const returnScene = this.sceneData.returnScene ?? SceneKeys.MAIN;
    this.scene.start(returnScene);
  }

  // =====================================================
  // 公開メソッド
  // =====================================================

  /**
   * 要件の達成状況を更新
   */
  updateRequirement(index: number, currentValue: number): void {
    if (index >= 0 && index < this.sceneData.requirements.length) {
      this.sceneData.requirements[index].currentValue = currentValue;
      this.refreshUI();
    }
  }

  /**
   * 全要件が達成されているか
   */
  isAllRequirementsMet(): boolean {
    return this.allRequirementsMet;
  }

  /**
   * UIを再描画
   */
  private refreshUI(): void {
    // 既存パネルを削除
    this.requirementsPanel.destroy();
    this.progressPanel.destroy();

    // パネルを再作成
    this.createRequirementsPanel();
    this.createProgressPanel();

    // 要件判定を更新
    this.checkRequirements();
  }
}
