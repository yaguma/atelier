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

  // 試験進行用
  private examOverlay!: Phaser.GameObjects.Container | null;
  private isExamInProgress: boolean = false;
  private progressSteps: Phaser.GameObjects.Container[] = [];

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

    // 試験開始
    this.startExam();
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

  // =====================================================
  // 試験進行機能 (TASK-0245)
  // =====================================================

  /**
   * 試験を開始
   */
  async startExam(): Promise<void> {
    if (this.isExamInProgress) return;
    this.isExamInProgress = true;

    // オーバーレイ作成
    this.createExamOverlay();

    // 開始演出
    await this.playExamStartAnimation();

    // 試験進行表示
    await this.showExamProgress();

    // 結果判定
    this.evaluateExam();
  }

  /**
   * 試験オーバーレイを作成
   */
  private createExamOverlay(): void {
    this.examOverlay = this.add.container(0, 0);
    this.examOverlay.setDepth(100);

    // 半透明背景
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.8);
    bg.fillRect(0, 0, RankUpSceneLayout.SCREEN_WIDTH, RankUpSceneLayout.SCREEN_HEIGHT);
    this.examOverlay.add(bg);
  }

  /**
   * 試験開始アニメーション
   */
  private async playExamStartAnimation(): Promise<void> {
    if (!this.examOverlay) return;

    return new Promise((resolve) => {
      const centerX = RankUpSceneLayout.SCREEN_WIDTH / 2;
      const centerY = RankUpSceneLayout.SCREEN_HEIGHT / 2;

      // 試験開始テキスト
      const startText = this.add.text(centerX, centerY, '昇格試験開始', {
        fontSize: '48px',
        fontStyle: 'bold',
        color: '#ffcc00',
      }).setOrigin(0.5).setAlpha(0).setScale(2);
      this.examOverlay!.add(startText);

      // 光彩エフェクト
      const glow = this.add.graphics();
      glow.fillStyle(0xffcc00, 0.3);
      glow.fillCircle(centerX, centerY, 50);
      this.examOverlay!.add(glow);

      // 光彩拡大アニメーション
      this.tweens.add({
        targets: glow,
        scaleX: 5,
        scaleY: 5,
        alpha: 0,
        duration: 1000,
        ease: 'Power2',
      });

      // テキストアニメーション
      this.tweens.add({
        targets: startText,
        alpha: 1,
        scale: 1,
        duration: 500,
        ease: 'Back.easeOut',
        onComplete: () => {
          // フェードアウト
          this.time.delayedCall(1000, () => {
            this.tweens.add({
              targets: startText,
              alpha: 0,
              y: centerY - 50,
              duration: 300,
              onComplete: () => {
                startText.destroy();
                resolve();
              },
            });
          });
        },
      });
    });
  }

  /**
   * 試験進行表示
   */
  private async showExamProgress(): Promise<void> {
    if (!this.examOverlay) return;

    const centerY = RankUpSceneLayout.SCREEN_HEIGHT / 2;

    // 進行ステップ表示
    const steps = [
      { text: '依頼達成状況を確認中...', delay: 500 },
      { text: '調合実績を確認中...', delay: 800 },
      { text: '採取実績を確認中...', delay: 600 },
      { text: '最終判定中...', delay: 1000 },
    ];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      await this.showProgressStep(step.text, centerY - 50 + i * 40, step.delay);
    }
  }

  /**
   * 進行ステップを表示
   */
  private async showProgressStep(text: string, y: number, duration: number): Promise<void> {
    if (!this.examOverlay) return;

    return new Promise((resolve) => {
      const centerX = RankUpSceneLayout.SCREEN_WIDTH / 2;

      const stepContainer = this.add.container(centerX, y);
      this.examOverlay!.add(stepContainer);
      this.progressSteps.push(stepContainer);

      // ローディングアイコン
      const loader = this.add.graphics();
      loader.lineStyle(3, Colors.primary);
      loader.arc(-100, 0, 12, 0, Math.PI * 1.5);
      loader.strokePath();
      stepContainer.add(loader);

      // 回転アニメーション
      this.tweens.add({
        targets: loader,
        angle: 360,
        duration: 800,
        repeat: -1,
      });

      // テキスト
      const stepText = this.add.text(-70, 0, text, {
        ...TextStyles.body,
        fontSize: '16px',
      }).setOrigin(0, 0.5).setAlpha(0);
      stepContainer.add(stepText);

      // フェードイン
      this.tweens.add({
        targets: stepText,
        alpha: 1,
        duration: 200,
      });

      // 完了
      this.time.delayedCall(duration, () => {
        // ローディングアイコンを消す
        loader.destroy();

        // チェックマーク
        const check = this.add.text(-100, 0, '✓', {
          fontSize: '20px',
          color: '#00ff00',
        }).setOrigin(0.5);
        stepContainer.add(check);

        resolve();
      });
    });
  }

  /**
   * 試験結果を判定
   */
  private evaluateExam(): void {
    // 全要件が達成されているか確認
    const passed = this.sceneData.requirements.every(
      (req) => req.currentValue >= req.targetValue
    );

    // 結果表示
    this.time.delayedCall(500, () => {
      if (passed) {
        this.showExamSuccess(this.sceneData.targetRank);
      } else {
        const failedReqs = this.sceneData.requirements
          .filter((req) => req.currentValue < req.targetValue)
          .map((req) => req.description);
        this.showExamFailure(`未達成の条件: ${failedReqs.join(', ')}`);
      }
    });
  }

  /**
   * 試験成功演出
   */
  async showExamSuccess(newRank: string): Promise<void> {
    if (!this.examOverlay) return;

    // 進行ステップをクリア
    this.clearProgressSteps();

    const centerX = RankUpSceneLayout.SCREEN_WIDTH / 2;
    const centerY = RankUpSceneLayout.SCREEN_HEIGHT / 2;

    // 成功パーティクル
    await this.playSuccessParticles();

    // ランクアップ表示
    const resultContainer = this.add.container(centerX, centerY);
    this.examOverlay.add(resultContainer);

    // 成功テキスト
    const successText = this.add.text(0, -80, '🎉 昇格成功！', {
      fontSize: '36px',
      fontStyle: 'bold',
      color: '#00ff00',
    }).setOrigin(0.5).setAlpha(0);
    resultContainer.add(successText);

    // 新ランク表示
    const newRankContainer = this.createNewRankDisplay(newRank);
    newRankContainer.setAlpha(0);
    resultContainer.add(newRankContainer);

    // 報酬リスト
    const rewardsText = this.add.text(0, 100, '獲得報酬:', {
      ...TextStyles.heading,
      fontSize: '18px',
    }).setOrigin(0.5).setAlpha(0);
    resultContainer.add(rewardsText);

    const rewardsList = this.createExamRewardsDisplay();
    rewardsList.setY(140);
    rewardsList.setAlpha(0);
    resultContainer.add(rewardsList);

    // アニメーション
    await this.tweenPromise({
      targets: successText,
      alpha: 1,
      y: successText.y - 20,
      duration: 500,
      ease: 'Power2',
    });

    await this.tweenPromise({
      targets: newRankContainer,
      alpha: 1,
      scale: { from: 0.5, to: 1 },
      duration: 500,
      ease: 'Back.easeOut',
    });

    await this.delay(300);

    await this.tweenPromise({
      targets: [rewardsText, rewardsList],
      alpha: 1,
      duration: 300,
    });

    // 続けるボタン
    await this.delay(500);
    this.showContinueButton();
  }

  /**
   * 新ランク表示を作成
   */
  private createNewRankDisplay(rank: string): Phaser.GameObjects.Container {
    const container = this.add.container(0, 0);

    // 光彩背景
    const glow = this.add.graphics();
    glow.fillStyle(0xffcc00, 0.3);
    glow.fillCircle(0, 0, 80);
    container.add(glow);

    // ランクバッジ
    const badge = this.add.graphics();
    badge.fillStyle(0xffcc00, 1);
    badge.fillCircle(0, 0, 50);
    container.add(badge);

    // ランク文字
    const rankText = this.add.text(0, 0, rank, {
      fontSize: '36px',
      fontStyle: 'bold',
      color: '#000000',
    }).setOrigin(0.5);
    container.add(rankText);

    return container;
  }

  /**
   * 試験報酬表示を作成
   */
  private createExamRewardsDisplay(): Phaser.GameObjects.Container {
    const container = this.add.container(0, 0);

    let x = -((this.sceneData.rewards.length - 1) * 100) / 2;
    this.sceneData.rewards.forEach((reward) => {
      const rewardItem = this.add.container(x, 0);

      const icon = RewardIcons[reward.type] ?? '🎁';
      const iconText = this.add.text(0, 0, icon, {
        fontSize: '32px',
      }).setOrigin(0.5);
      rewardItem.add(iconText);

      const name = this.add.text(0, 30, reward.name, {
        ...TextStyles.body,
        fontSize: '12px',
      }).setOrigin(0.5);
      rewardItem.add(name);

      container.add(rewardItem);
      x += 100;
    });

    return container;
  }

  /**
   * 成功パーティクル
   */
  private async playSuccessParticles(): Promise<void> {
    if (!this.examOverlay) return;

    return new Promise((resolve) => {
      const centerX = RankUpSceneLayout.SCREEN_WIDTH / 2;
      const centerY = RankUpSceneLayout.SCREEN_HEIGHT / 2;

      // 紙吹雪エフェクト
      for (let i = 0; i < 50; i++) {
        const confetti = this.add.graphics();
        const colors = [0xffcc00, 0x00ff00, 0xff00ff, 0x00ffff];
        confetti.fillStyle(colors[i % colors.length], 1);
        confetti.fillRect(-5, -5, 10, 10);
        confetti.x = centerX + Phaser.Math.Between(-100, 100);
        confetti.y = centerY;
        confetti.setDepth(101);
        this.examOverlay!.add(confetti);

        this.tweens.add({
          targets: confetti,
          x: confetti.x + Phaser.Math.Between(-200, 200),
          y: RankUpSceneLayout.SCREEN_HEIGHT + 50,
          angle: Phaser.Math.Between(0, 720),
          duration: Phaser.Math.Between(1500, 2500),
          ease: 'Power1',
          onComplete: () => confetti.destroy(),
        });
      }

      this.time.delayedCall(500, () => resolve());
    });
  }

  /**
   * 試験失敗演出
   */
  async showExamFailure(reason: string): Promise<void> {
    if (!this.examOverlay) return;

    // 進行ステップをクリア
    this.clearProgressSteps();

    const centerX = RankUpSceneLayout.SCREEN_WIDTH / 2;
    const centerY = RankUpSceneLayout.SCREEN_HEIGHT / 2;

    const resultContainer = this.add.container(centerX, centerY);
    this.examOverlay.add(resultContainer);

    // 失敗テキスト
    const failText = this.add.text(0, -60, '試験不合格', {
      fontSize: '32px',
      fontStyle: 'bold',
      color: '#ff4444',
    }).setOrigin(0.5).setAlpha(0);
    resultContainer.add(failText);

    // 理由
    const reasonText = this.add.text(0, 0, reason, {
      ...TextStyles.body,
      fontSize: '16px',
      color: '#aaaaaa',
      wordWrap: { width: 400 },
      align: 'center',
    }).setOrigin(0.5).setAlpha(0);
    resultContainer.add(reasonText);

    // アドバイス
    const adviceText = this.add.text(0, 60, '条件を満たしてから再挑戦してください', {
      ...TextStyles.body,
      fontSize: '14px',
      color: '#888888',
    }).setOrigin(0.5).setAlpha(0);
    resultContainer.add(adviceText);

    // アニメーション
    await this.tweenPromise({
      targets: failText,
      alpha: 1,
      duration: 300,
    });

    // 画面揺れ
    this.cameras.main.shake(200, 0.01);

    await this.delay(200);

    await this.tweenPromise({
      targets: [reasonText, adviceText],
      alpha: 1,
      duration: 300,
    });

    // 戻るボタン
    await this.delay(500);
    this.showRetryButton();
  }

  /**
   * 再挑戦ボタンを表示
   */
  private showRetryButton(): void {
    if (!this.examOverlay) return;

    const centerX = RankUpSceneLayout.SCREEN_WIDTH / 2;
    const centerY = RankUpSceneLayout.SCREEN_HEIGHT / 2;

    const retryBtn = this.createExamButton(
      '戻る',
      centerX,
      centerY + 150,
      200,
      50,
      () => this.closeExamOverlay()
    );
    retryBtn.setDepth(102);
    this.examOverlay.add(retryBtn);
  }

  /**
   * 続けるボタンを表示
   */
  private showContinueButton(): void {
    if (!this.examOverlay) return;

    const centerX = RankUpSceneLayout.SCREEN_WIDTH / 2;
    const centerY = RankUpSceneLayout.SCREEN_HEIGHT / 2;

    const continueBtn = this.createExamButton(
      '続ける',
      centerX,
      centerY + 200,
      200,
      50,
      () => this.onExamComplete()
    );
    continueBtn.setDepth(102);
    this.examOverlay.add(continueBtn);
  }

  /**
   * 試験用ボタンを作成
   */
  private createExamButton(
    text: string,
    x: number,
    y: number,
    width: number,
    height: number,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(Colors.primary, 1);
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
      bg.fillStyle(0x4488ff, 1);
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8);
    });

    container.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(Colors.primary, 1);
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8);
    });

    container.on('pointerdown', onClick);

    return container;
  }

  /**
   * 進行ステップをクリア
   */
  private clearProgressSteps(): void {
    this.progressSteps.forEach((step) => step.destroy());
    this.progressSteps = [];
  }

  /**
   * 試験オーバーレイを閉じる
   */
  private closeExamOverlay(): void {
    if (!this.examOverlay) return;

    this.tweens.add({
      targets: this.examOverlay,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        this.examOverlay?.destroy();
        this.examOverlay = null;
        this.isExamInProgress = false;
      },
    });
  }

  /**
   * 試験完了処理
   */
  private onExamComplete(): void {
    // 昇格完了イベントを発行
    (this.eventBus as unknown as { emit: (event: string, payload: unknown) => void }).emit(
      'rankup:exam:complete',
      {
        newRank: this.sceneData.targetRank,
        rewards: this.sceneData.rewards,
      }
    );

    // メインシーンに戻る
    this.scene.start(SceneKeys.MAIN);
  }

  // =====================================================
  // ユーティリティ
  // =====================================================

  /**
   * Tweenをプロミス化
   */
  private tweenPromise(config: Phaser.Types.Tweens.TweenBuilderConfig): Promise<void> {
    return new Promise((resolve) => {
      this.tweens.add({
        ...config,
        onComplete: () => resolve(),
      });
    });
  }

  /**
   * 遅延
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => this.time.delayedCall(ms, () => resolve()));
  }

  /**
   * 試験が進行中かどうか
   */
  isExamRunning(): boolean {
    return this.isExamInProgress;
  }

  // =====================================================
  // テスト用アクセサ (TASK-0246)
  // =====================================================

  /**
   * 現在ランクを取得
   */
  getCurrentRank(): string {
    return this.sceneData.currentRank;
  }

  /**
   * 目標ランクを取得
   */
  getTargetRank(): string {
    return this.sceneData.targetRank;
  }

  /**
   * 表示中の要件リストを取得
   */
  getDisplayedRequirements(): RankExamRequirement[] {
    return [...this.sceneData.requirements];
  }

  /**
   * 表示中の報酬リストを取得
   */
  getDisplayedRewards(): RankUpReward[] {
    return [...this.sceneData.rewards];
  }

  /**
   * すべての要件が達成されているか（isAllRequirementsMetのエイリアス）
   */
  areAllRequirementsMet(): boolean {
    return this.allRequirementsMet;
  }

  /**
   * 挑戦ボタンが有効かどうか
   */
  isChallengeButtonEnabled(): boolean {
    return this.allRequirementsMet;
  }

  /**
   * 総合進捗率を取得（0〜1）
   */
  getOverallProgress(): number {
    const total = this.sceneData.requirements.length;
    if (total === 0) return 0;

    const met = this.sceneData.requirements.filter(
      (req) => req.currentValue >= req.targetValue
    ).length;

    return met / total;
  }

  /**
   * 個別要件の進捗率を取得（0〜1）
   */
  getRequirementProgress(index: number): number {
    const req = this.sceneData.requirements[index];
    if (!req) return 0;

    return Math.min(req.currentValue / req.targetValue, 1);
  }

  /**
   * 達成した要件数を取得
   */
  getMetRequirementsCount(): number {
    return this.sceneData.requirements.filter(
      (req) => req.currentValue >= req.targetValue
    ).length;
  }

  /**
   * 試験完了処理（公開版）
   */
  completeExam(): void {
    this.onExamComplete();
  }
}
