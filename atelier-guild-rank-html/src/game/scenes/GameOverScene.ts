/**
 * GameOverScene
 *
 * TASK-0247: GameOverScene実装
 * ゲームオーバー画面を表示するシーン。
 * 失敗理由の表示、統計情報、再挑戦・タイトルへ戻る機能を提供する。
 */

import Phaser from 'phaser';
import { BaseGameScene, SceneInitData } from './BaseGameScene';
import { SceneKeys } from '../config/SceneKeys';
import { TextStyles } from '../config/TextStyles';
import {
  GameOverSceneLayout,
  GameOverColors,
  GameOverAnimations,
  GameOverReasonDefaults,
  type GameOverReason,
  type GameOverReasonType,
  type GameOverStats,
} from './GameOverSceneConstants';

/**
 * GameOverSceneデータ
 */
export interface GameOverSceneData extends SceneInitData {
  /** 失敗理由 */
  reason: string;
  /** 最終日数 */
  finalDay: number;
  /** 最終ランク */
  finalRank: string;
  /** 総依頼完了数 */
  totalQuests: number;
  /** 総調合回数 */
  totalAlchemy: number;
}

/**
 * GameOverScene
 *
 * 機能：
 * - ゲームオーバー画面の表示
 * - 失敗理由の種類別表示
 * - プレイ統計の表示
 * - 再挑戦・タイトルへ戻る機能
 * - 演出エフェクト
 */
export class GameOverScene extends BaseGameScene {
  /** シーンデータ */
  private sceneData!: GameOverSceneData;
  /** メインコンテナ */
  private mainContainer!: Phaser.GameObjects.Container;

  constructor() {
    super(SceneKeys.GAME_OVER);
  }

  protected onInit(data?: GameOverSceneData): void {
    if (data) {
      this.sceneData = data;
    } else {
      // デフォルトデータ
      this.sceneData = {
        reason: 'ゲームオーバー',
        finalDay: 1,
        finalRank: 'G',
        totalQuests: 0,
        totalAlchemy: 0,
      };
    }
  }

  protected onPreload(): void {
    // GameOverScene固有アセット（現時点では不要）
  }

  protected onCreate(_data?: GameOverSceneData): void {
    this.createBackground();
    this.createDramaticEffect();
    this.createMainContent();
    this.playEntranceAnimation();
  }

  protected setupEventListeners(): void {
    // イベントリスナー（必要に応じて追加）
  }

  // =====================================================
  // 背景・エフェクト
  // =====================================================

  private createBackground(): void {
    // 暗い背景
    const bg = this.add.graphics();
    bg.fillStyle(GameOverColors.background, 1);
    bg.fillRect(0, 0, GameOverSceneLayout.SCREEN_WIDTH, GameOverSceneLayout.SCREEN_HEIGHT);

    // 暗い霧エフェクト
    for (let i = 0; i < 5; i++) {
      const fog = this.add.graphics();
      fog.fillStyle(GameOverColors.fog, 0.3);
      fog.fillCircle(
        Phaser.Math.Between(0, GameOverSceneLayout.SCREEN_WIDTH),
        Phaser.Math.Between(0, GameOverSceneLayout.SCREEN_HEIGHT),
        Phaser.Math.Between(100, 300)
      );
    }
  }

  private createDramaticEffect(): void {
    // ビネットエフェクト（画面端を暗くする）
    const vignette = this.add.graphics();

    // グラデーションビネット
    const gradientRadius = 600;
    for (let i = 0; i < 10; i++) {
      const alpha = 0.1 * (i / 10);
      vignette.fillStyle(0x000000, alpha);
      vignette.fillCircle(
        GameOverSceneLayout.CENTER_X,
        GameOverSceneLayout.CENTER_Y,
        gradientRadius - i * 40
      );
    }

    // 灰パーティクル
    this.createAshParticles();
  }

  private createAshParticles(): void {
    for (let i = 0; i < GameOverAnimations.ASH_PARTICLE_COUNT; i++) {
      const ash = this.add.graphics();
      ash.fillStyle(0x666666, 0.5);
      ash.fillCircle(0, 0, Phaser.Math.Between(2, 5));
      ash.x = Phaser.Math.Between(0, GameOverSceneLayout.SCREEN_WIDTH);
      ash.y = Phaser.Math.Between(-50, -10);

      this.tweens.add({
        targets: ash,
        y: GameOverSceneLayout.SCREEN_HEIGHT + 50,
        x: ash.x + Phaser.Math.Between(-100, 100),
        alpha: 0,
        duration: Phaser.Math.Between(
          GameOverAnimations.ASH_FALL_MIN_DURATION,
          GameOverAnimations.ASH_FALL_MAX_DURATION
        ),
        delay: Phaser.Math.Between(0, 2000),
        repeat: -1,
        onRepeat: () => {
          ash.x = Phaser.Math.Between(0, GameOverSceneLayout.SCREEN_WIDTH);
          ash.y = -10;
          ash.setAlpha(0.5);
        },
      });
    }
  }

  // =====================================================
  // メインコンテンツ
  // =====================================================

  private createMainContent(): void {
    this.mainContainer = this.add.container(
      GameOverSceneLayout.CENTER_X,
      GameOverSceneLayout.CENTER_Y
    );
    this.mainContainer.setAlpha(0);

    // ゲームオーバーテキスト
    const gameOverText = this.add
      .text(0, GameOverSceneLayout.GAME_OVER_TEXT.Y, 'GAME OVER', {
        fontSize: GameOverSceneLayout.GAME_OVER_TEXT.FONT_SIZE,
        fontStyle: 'bold',
        color: GameOverColors.text,
      })
      .setOrigin(0.5);
    this.mainContainer.add(gameOverText);

    // 失敗理由表示
    const reasonContainer = this.createDetailedReason();
    this.mainContainer.add(reasonContainer);

    // 統計パネル
    const statsPanel = this.createStatsPanel();
    statsPanel.setY(GameOverSceneLayout.STATS_PANEL.Y);
    this.mainContainer.add(statsPanel);

    // ボタン
    this.createButtons();
  }

  private createDetailedReason(): Phaser.GameObjects.Container {
    const container = this.add.container(0, GameOverSceneLayout.REASON_AREA.Y);
    const reasonInfo = this.getGameOverReason();

    // アイコン
    const icon = this.add
      .text(0, -40, reasonInfo.icon, {
        fontSize: '48px',
      })
      .setOrigin(0.5);
    container.add(icon);

    // タイトル
    const title = this.add
      .text(0, 10, reasonInfo.title, {
        ...TextStyles.heading,
        fontSize: '24px',
        color: '#ff6666',
      })
      .setOrigin(0.5);
    container.add(title);

    // 説明
    const desc = this.add
      .text(0, 50, reasonInfo.description, {
        ...TextStyles.body,
        fontSize: '16px',
        color: '#aaaaaa',
        wordWrap: { width: 500 },
        align: 'center',
      })
      .setOrigin(0.5);
    container.add(desc);

    return container;
  }

  private createStatsPanel(): Phaser.GameObjects.Container {
    const panel = this.add.container(0, 0);
    const layout = GameOverSceneLayout.STATS_PANEL;

    // パネル背景
    const bg = this.add.graphics();
    bg.fillStyle(GameOverColors.statsBackground, 0.8);
    bg.fillRoundedRect(-layout.WIDTH / 2, -layout.HEIGHT / 2, layout.WIDTH, layout.HEIGHT, layout.BORDER_RADIUS);
    bg.lineStyle(1, GameOverColors.statsBorder, 0.5);
    bg.strokeRoundedRect(-layout.WIDTH / 2, -layout.HEIGHT / 2, layout.WIDTH, layout.HEIGHT, layout.BORDER_RADIUS);
    panel.add(bg);

    // 統計情報
    const stats = [
      { label: '到達日数', value: `${this.sceneData.finalDay} 日目` },
      { label: '最終ランク', value: this.sceneData.finalRank },
      { label: '完了依頼', value: `${this.sceneData.totalQuests} 件` },
      { label: '調合回数', value: `${this.sceneData.totalAlchemy} 回` },
    ];

    stats.forEach((stat, index) => {
      const y = -60 + index * 35;

      const label = this.add.text(-150, y, stat.label, {
        ...TextStyles.body,
        fontSize: '14px',
        color: GameOverColors.labelColor,
      });
      panel.add(label);

      const value = this.add
        .text(150, y, stat.value, {
          ...TextStyles.body,
          fontSize: '16px',
          color: GameOverColors.valueColor,
        })
        .setOrigin(1, 0);
      panel.add(value);
    });

    return panel;
  }

  private createButtons(): void {
    const buttonY = GameOverSceneLayout.BUTTON_AREA.Y;
    const buttonWidth = GameOverSceneLayout.BUTTON_AREA.BUTTON_WIDTH;
    const buttonHeight = GameOverSceneLayout.BUTTON_AREA.BUTTON_HEIGHT;
    const spacing = GameOverSceneLayout.BUTTON_AREA.BUTTON_SPACING;

    // 最初からボタン
    const retryButton = this.createButton(
      -spacing,
      buttonY,
      buttonWidth,
      buttonHeight,
      '最初から',
      0x4a90d9,
      () => this.handleRetry()
    );
    this.mainContainer.add(retryButton);

    // タイトルへボタン
    const titleButton = this.createButton(
      spacing,
      buttonY,
      buttonWidth,
      buttonHeight,
      'タイトルへ',
      0x6c757d,
      () => this.handleTitle()
    );
    this.mainContainer.add(titleButton);
  }

  private createButton(
    x: number,
    y: number,
    width: number,
    height: number,
    text: string,
    color: number,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const button = this.add.container(x, y);

    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8);
    button.add(bg);

    // テキスト
    const label = this.add
      .text(0, 0, text, TextStyles.button)
      .setOrigin(0.5);
    button.add(label);

    // インタラクション
    button.setSize(width, height);
    button.setInteractive({ useHandCursor: true });

    button.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(color + 0x111111, 1);
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8);
    });

    button.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(color, 1);
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8);
    });

    button.on('pointerdown', onClick);

    return button;
  }

  // =====================================================
  // アニメーション
  // =====================================================

  private async playEntranceAnimation(): Promise<void> {
    // フェードイン
    this.tweens.add({
      targets: this.mainContainer,
      alpha: 1,
      duration: GameOverAnimations.FADE_IN_DURATION,
      ease: 'Power2.easeOut',
    });

    // 画面揺れ
    await this.delay(GameOverAnimations.SHAKE_DELAY);
    this.cameras.main.shake(
      GameOverAnimations.SHAKE_DURATION,
      GameOverAnimations.SHAKE_INTENSITY
    );
  }

  // =====================================================
  // 理由判定
  // =====================================================

  private getGameOverReason(): GameOverReason {
    const reason = this.sceneData.reason;

    if (reason.includes('期限') || reason.includes('日数')) {
      return {
        type: 'deadline',
        ...GameOverReasonDefaults.deadline,
      };
    }

    if (reason.includes('所持金') || reason.includes('ゴールド') || reason.includes('資金')) {
      return {
        type: 'bankruptcy',
        ...GameOverReasonDefaults.bankruptcy,
      };
    }

    if (reason.includes('ランク') || reason.includes('降格')) {
      return {
        type: 'rankDown',
        ...GameOverReasonDefaults.rankDown,
      };
    }

    return {
      type: 'other',
      title: 'ゲームオーバー',
      description: reason,
      icon: '❌',
    };
  }

  // =====================================================
  // イベントハンドラ
  // =====================================================

  private handleRetry(): void {
    this.eventBus.emitVoid('game:restart');
    this.goToScene(SceneKeys.BOOT);
  }

  private handleTitle(): void {
    this.goToScene(SceneKeys.TITLE);
  }

  // =====================================================
  // ユーティリティ
  // =====================================================

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => this.time.delayedCall(ms, resolve));
  }

  // =====================================================
  // テストアクセサ (TASK-0247)
  // =====================================================

  /** 失敗理由を取得 */
  getReason(): string {
    return this.sceneData.reason;
  }

  /** 統計情報を取得 */
  getStats(): GameOverStats {
    return {
      finalDay: this.sceneData.finalDay,
      finalRank: this.sceneData.finalRank,
      totalQuests: this.sceneData.totalQuests,
      totalAlchemy: this.sceneData.totalAlchemy,
    };
  }

  /** 理由タイプを取得 */
  getReasonType(): GameOverReasonType {
    return this.getGameOverReason().type;
  }
}
