/**
 * GameClearScene
 *
 * TASK-0248: GameClearScene実装
 * ゲームクリア画面を表示するシーン。
 * 達成統計の表示、トロフィー演出、紙吹雪エフェクトを提供する。
 */

import Phaser from 'phaser';
import { BaseGameScene, SceneInitData } from './BaseGameScene';
import { SceneKeys } from '../config/SceneKeys';
import { TextStyles } from '../config/TextStyles';
import {
  GameClearSceneLayout,
  GameClearColors,
  GameClearAnimations,
  type GameClearStats,
} from './GameClearSceneConstants';

/**
 * GameClearSceneデータ
 */
export interface GameClearSceneData extends SceneInitData {
  /** クリア日数 */
  clearDay: number;
  /** 最終ランク */
  finalRank: string;
  /** 総依頼完了数 */
  totalQuests: number;
  /** 総調合回数 */
  totalAlchemy: number;
  /** 総獲得ゴールド */
  totalGold: number;
  /** レアアイテムリスト */
  rareItems: string[];
  /** プレイ時間（秒） */
  playTime: number;
}

/**
 * GameClearScene
 *
 * 機能：
 * - ゲームクリア画面の表示
 * - 達成統計（日数、依頼、調合、ゴールド）の表示
 * - トロフィー演出
 * - 紙吹雪エフェクト
 * - 星空背景
 * - レアアイテム表示
 * - タイトルへ戻る機能
 */
export class GameClearScene extends BaseGameScene {
  /** シーンデータ */
  private sceneData!: GameClearSceneData;
  /** メインコンテナ */
  private mainContainer!: Phaser.GameObjects.Container;

  constructor() {
    super(SceneKeys.GAME_CLEAR);
  }

  protected onInit(data?: GameClearSceneData): void {
    if (data) {
      this.sceneData = data;
    } else {
      // デフォルトデータ
      this.sceneData = {
        clearDay: 1,
        finalRank: 'S',
        totalQuests: 0,
        totalAlchemy: 0,
        totalGold: 0,
        rareItems: [],
        playTime: 0,
      };
    }
  }

  protected onPreload(): void {
    // GameClearScene固有アセット（現時点では不要）
  }

  protected onCreate(_data?: GameClearSceneData): void {
    this.createBackground();
    this.createStarField();
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
    const bg = this.add.graphics();
    const { backgroundStart, backgroundEnd } = GameClearColors;

    // グラデーション背景
    for (let i = 0; i < GameClearSceneLayout.SCREEN_HEIGHT; i++) {
      const ratio = i / GameClearSceneLayout.SCREEN_HEIGHT;
      const r = Math.floor(backgroundStart.r + ratio * (backgroundEnd.r - backgroundStart.r));
      const g = Math.floor(backgroundStart.g + ratio * (backgroundEnd.g - backgroundStart.g));
      const b = Math.floor(backgroundStart.b + ratio * (backgroundEnd.b - backgroundStart.b));
      const color = (r << 16) + (g << 8) + b;

      bg.fillStyle(color, 1);
      bg.fillRect(0, i, GameClearSceneLayout.SCREEN_WIDTH, 1);
    }
  }

  private createStarField(): void {
    for (let i = 0; i < GameClearAnimations.STAR_COUNT; i++) {
      const star = this.add.graphics();
      const size = Phaser.Math.Between(1, 3);
      star.fillStyle(GameClearColors.starColor, Phaser.Math.FloatBetween(0.3, 1));
      star.fillCircle(0, 0, size);
      star.x = Phaser.Math.Between(0, GameClearSceneLayout.SCREEN_WIDTH);
      star.y = Phaser.Math.Between(0, GameClearSceneLayout.SCREEN_HEIGHT);

      // 瞬きアニメーション
      this.tweens.add({
        targets: star,
        alpha: Phaser.Math.FloatBetween(0.2, 0.5),
        duration: Phaser.Math.Between(
          GameClearAnimations.STAR_TWINKLE_MIN_DURATION,
          GameClearAnimations.STAR_TWINKLE_MAX_DURATION
        ),
        yoyo: true,
        repeat: -1,
      });
    }
  }

  // =====================================================
  // メインコンテンツ
  // =====================================================

  private createMainContent(): void {
    this.mainContainer = this.add.container(
      GameClearSceneLayout.CENTER_X,
      GameClearSceneLayout.CENTER_Y
    );
    this.mainContainer.setAlpha(0);

    // クリアテキスト
    const clearText = this.add
      .text(0, GameClearSceneLayout.CLEAR_TEXT.Y, 'CONGRATULATIONS!', {
        fontSize: GameClearSceneLayout.CLEAR_TEXT.FONT_SIZE,
        fontStyle: 'bold',
        color: GameClearColors.text,
      })
      .setOrigin(0.5);
    this.mainContainer.add(clearText);

    // サブタイトル
    const subText = this.add
      .text(0, GameClearSceneLayout.SUB_TEXT.Y, 'S級錬金術師に昇格しました！', {
        ...TextStyles.heading,
        fontSize: GameClearSceneLayout.SUB_TEXT.FONT_SIZE,
        color: GameClearColors.subText,
      })
      .setOrigin(0.5);
    this.mainContainer.add(subText);

    // トロフィー
    const trophy = this.createTrophy();
    trophy.setY(GameClearSceneLayout.TROPHY_AREA.Y);
    this.mainContainer.add(trophy);

    // 統計パネル
    const statsPanel = this.createStatsPanel();
    statsPanel.setY(GameClearSceneLayout.STATS_PANEL.Y);
    this.mainContainer.add(statsPanel);

    // レアアイテム表示
    if (this.sceneData.rareItems && this.sceneData.rareItems.length > 0) {
      const rareItems = this.createRareItemsDisplay();
      rareItems.setY(GameClearSceneLayout.RARE_ITEMS_AREA.Y);
      this.mainContainer.add(rareItems);
    }

    // プレイ時間表示
    this.addPlayTimeToStats();

    // タイトルへボタン
    const titleButton = this.createButton(
      0,
      GameClearSceneLayout.BUTTON_AREA.Y,
      GameClearSceneLayout.BUTTON_AREA.BUTTON_WIDTH,
      GameClearSceneLayout.BUTTON_AREA.BUTTON_HEIGHT,
      'タイトルへ',
      0x4a90d9,
      () => this.handleTitle()
    );
    this.mainContainer.add(titleButton);
  }

  private createTrophy(): Phaser.GameObjects.Container {
    const container = this.add.container(0, 0);

    // トロフィー光彩
    const glow = this.add.graphics();
    glow.fillStyle(GameClearColors.trophyGlow, 0.3);
    glow.fillCircle(0, 0, GameClearSceneLayout.TROPHY_AREA.GLOW_RADIUS);
    container.add(glow);

    // 光彩アニメーション
    this.tweens.add({
      targets: glow,
      scaleX: 1.2,
      scaleY: 1.2,
      alpha: 0.1,
      duration: GameClearAnimations.TROPHY_GLOW_DURATION,
      yoyo: true,
      repeat: -1,
    });

    // トロフィーアイコン
    const trophy = this.add
      .text(0, 0, '🏆', {
        fontSize: GameClearSceneLayout.TROPHY_AREA.ICON_SIZE,
      })
      .setOrigin(0.5);
    container.add(trophy);

    return container;
  }

  private createStatsPanel(): Phaser.GameObjects.Container {
    const panel = this.add.container(0, 0);
    const layout = GameClearSceneLayout.STATS_PANEL;

    // パネル背景
    const bg = this.add.graphics();
    bg.fillStyle(GameClearColors.statsBackground, 0.8);
    bg.fillRoundedRect(-layout.WIDTH / 2, -layout.HEIGHT / 2, layout.WIDTH, layout.HEIGHT, layout.BORDER_RADIUS);
    bg.lineStyle(2, GameClearColors.statsBorder, 0.5);
    bg.strokeRoundedRect(-layout.WIDTH / 2, -layout.HEIGHT / 2, layout.WIDTH, layout.HEIGHT, layout.BORDER_RADIUS);
    panel.add(bg);

    // 統計情報
    const stats = [
      { label: 'クリア日数', value: `${this.sceneData.clearDay} 日目`, icon: '📅' },
      { label: '完了依頼', value: `${this.sceneData.totalQuests} 件`, icon: '📋' },
      { label: '調合回数', value: `${this.sceneData.totalAlchemy} 回`, icon: '⚗️' },
      { label: '獲得ゴールド', value: `${this.sceneData.totalGold} G`, icon: '💰' },
    ];

    const leftStats = stats.slice(0, 2);
    const rightStats = stats.slice(2);

    leftStats.forEach((stat, index) => {
      const y = -40 + index * 50;
      const item = this.createStatItem(stat, -120, y);
      panel.add(item);
    });

    rightStats.forEach((stat, index) => {
      const y = -40 + index * 50;
      const item = this.createStatItem(stat, 120, y);
      panel.add(item);
    });

    return panel;
  }

  private createStatItem(
    stat: { label: string; value: string; icon: string },
    x: number,
    y: number
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const icon = this.add
      .text(-80, 0, stat.icon, {
        fontSize: '20px',
      })
      .setOrigin(0.5);
    container.add(icon);

    const label = this.add.text(-50, -10, stat.label, {
      ...TextStyles.body,
      fontSize: '12px',
      color: GameClearColors.labelColor,
    });
    container.add(label);

    const value = this.add.text(-50, 10, stat.value, {
      ...TextStyles.body,
      fontSize: '16px',
      color: GameClearColors.valueColor,
    });
    container.add(value);

    return container;
  }

  private createRareItemsDisplay(): Phaser.GameObjects.Container {
    const container = this.add.container(0, 0);
    const layout = GameClearSceneLayout.RARE_ITEMS_AREA;

    // タイトル
    const title = this.add
      .text(0, 0, '獲得したレアアイテム', {
        ...TextStyles.heading,
        fontSize: '16px',
        color: GameClearColors.text,
      })
      .setOrigin(0.5);
    container.add(title);

    // アイテムリスト（最大5つ表示）
    const displayItems = this.sceneData.rareItems.slice(0, layout.MAX_DISPLAY);
    const startX = -((displayItems.length - 1) * layout.ITEM_SPACING) / 2;

    displayItems.forEach((item, index) => {
      const x = startX + index * layout.ITEM_SPACING;
      const itemContainer = this.add.container(x, 40);

      // アイテム背景
      const bg = this.add.graphics();
      bg.fillStyle(GameClearColors.rareItemBackground, 0.3);
      bg.fillRoundedRect(-25, -25, layout.ITEM_SIZE, layout.ITEM_SIZE, 8);
      itemContainer.add(bg);

      // アイテムアイコン
      const iconText = this.add
        .text(0, 0, '✨', {
          fontSize: '24px',
        })
        .setOrigin(0.5);
      itemContainer.add(iconText);

      container.add(itemContainer);
    });

    // 追加アイテムがある場合
    if (this.sceneData.rareItems.length > layout.MAX_DISPLAY) {
      const moreText = this.add
        .text(0, 80, `+${this.sceneData.rareItems.length - layout.MAX_DISPLAY} more`, {
          ...TextStyles.body,
          fontSize: '12px',
          color: GameClearColors.labelColor,
        })
        .setOrigin(0.5);
      container.add(moreText);
    }

    return container;
  }

  private addPlayTimeToStats(): void {
    const playTimeText = this.add
      .text(0, GameClearSceneLayout.PLAY_TIME.Y, `プレイ時間: ${this.formatPlayTime(this.sceneData.playTime)}`, {
        ...TextStyles.body,
        fontSize: GameClearSceneLayout.PLAY_TIME.FONT_SIZE,
        color: GameClearColors.labelColor,
      })
      .setOrigin(0.5);
    this.mainContainer.add(playTimeText);
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
    // 紙吹雪エフェクト
    this.playConfettiEffect();

    // メインコンテンツフェードイン
    await this.delay(GameClearAnimations.FADE_IN_DELAY);

    this.tweens.add({
      targets: this.mainContainer,
      alpha: 1,
      y: this.mainContainer.y - 30,
      duration: GameClearAnimations.FADE_IN_DURATION,
      ease: 'Power2.easeOut',
    });
  }

  private playConfettiEffect(): void {
    const colors = GameClearColors.confettiColors;

    for (let i = 0; i < GameClearAnimations.CONFETTI_COUNT; i++) {
      const confetti = this.add.graphics();
      const color = colors[i % colors.length];
      confetti.fillStyle(color, 1);

      const shape = Phaser.Math.Between(0, 1);
      if (shape === 0) {
        confetti.fillRect(-4, -4, 8, 8);
      } else {
        confetti.fillCircle(0, 0, 4);
      }

      confetti.x = Phaser.Math.Between(0, GameClearSceneLayout.SCREEN_WIDTH);
      confetti.y = -20;
      confetti.setDepth(10);

      this.tweens.add({
        targets: confetti,
        y: GameClearSceneLayout.SCREEN_HEIGHT + 50,
        x: confetti.x + Phaser.Math.Between(-200, 200),
        angle: Phaser.Math.Between(0, 720),
        alpha: { from: 1, to: 0 },
        duration: Phaser.Math.Between(
          GameClearAnimations.CONFETTI_FALL_MIN_DURATION,
          GameClearAnimations.CONFETTI_FALL_MAX_DURATION
        ),
        delay: Phaser.Math.Between(0, GameClearAnimations.CONFETTI_DELAY_MAX),
        ease: 'Power1.easeIn',
        onComplete: () => confetti.destroy(),
      });
    }
  }

  // =====================================================
  // イベントハンドラ
  // =====================================================

  private handleTitle(): void {
    this.goToScene(SceneKeys.TITLE);
  }

  // =====================================================
  // ユーティリティ
  // =====================================================

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => this.time.delayedCall(ms, resolve));
  }

  /**
   * プレイ時間をフォーマットする
   * @param seconds プレイ時間（秒）
   * @returns フォーマットされた文字列
   */
  formatPlayTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}時間${minutes}分`;
    }
    return `${minutes}分${secs}秒`;
  }

  // =====================================================
  // テストアクセサ (TASK-0248)
  // =====================================================

  /** クリア日数を取得 */
  getClearDay(): number {
    return this.sceneData.clearDay;
  }

  /** レアアイテムを取得 */
  getRareItems(): string[] {
    return this.sceneData.rareItems;
  }

  /** 統計情報を取得 */
  getStats(): GameClearStats {
    return {
      clearDay: this.sceneData.clearDay,
      finalRank: this.sceneData.finalRank,
      totalQuests: this.sceneData.totalQuests,
      totalAlchemy: this.sceneData.totalAlchemy,
      totalGold: this.sceneData.totalGold,
      rareItems: this.sceneData.rareItems,
      playTime: this.sceneData.playTime,
    };
  }
}
