/**
 * DayEndPanel
 *
 * TASK-0258: DayEndUI実装
 * 1日終了時のサマリー表示パネル。
 * その日の成果を表示し、次の日への遷移を行う。
 * 設計文書: docs/design/atelier-guild-rank-phaser/ui-design/overview.md
 */

import Phaser from 'phaser';
import { Colors } from '../../config/ColorPalette';
import { TextStyles } from '../../config/TextStyles';

/**
 * 1日のサマリーデータ
 */
export interface DaySummary {
  /** 日数 */
  day: number;
  /** 完了した依頼数 */
  questsCompleted: number;
  /** 総依頼数 */
  questsTotal: number;
  /** 採取した素材数 */
  materialsGathered: number;
  /** 合成したアイテム数 */
  itemsCrafted: number;
  /** 獲得したゴールド */
  goldEarned: number;
  /** 使用したゴールド */
  goldSpent: number;
  /** 獲得した経験値/貢献度 */
  expGained: number;
  /** 現在のランク */
  currentRank: string;
  /** 次のランクへの進捗（0-1） */
  nextRankProgress: number;
}

/**
 * DayEndPanelのオプション
 */
export interface DayEndPanelOptions {
  /** シーン */
  scene: Phaser.Scene;
  /** X座標 */
  x: number;
  /** Y座標 */
  y: number;
  /** サマリーデータ */
  summary: DaySummary;
  /** 続けるボタン押下時のコールバック */
  onContinue: () => void;
}

/**
 * 1日終了時のサマリー表示パネル
 *
 * @example
 * ```typescript
 * const panel = new DayEndPanel({
 *   scene: this,
 *   x: 640,
 *   y: 360,
 *   summary: {
 *     day: 1,
 *     questsCompleted: 2,
 *     questsTotal: 3,
 *     materialsGathered: 15,
 *     itemsCrafted: 3,
 *     goldEarned: 500,
 *     goldSpent: 100,
 *     expGained: 50,
 *     currentRank: 'G',
 *     nextRankProgress: 0.3,
 *   },
 *   onContinue: () => console.log('続行'),
 * });
 * ```
 */
export class DayEndPanel extends Phaser.GameObjects.Container {
  private summary: DaySummary;
  private onContinue: () => void;
  private animationTweens: Phaser.Tweens.Tween[] = [];
  private continueButton: Phaser.GameObjects.Container | null = null;

  constructor(options: DayEndPanelOptions) {
    super(options.scene, options.x, options.y);

    this.summary = options.summary;
    this.onContinue = options.onContinue;

    this.createPanel();
    options.scene.add.existing(this);

    // 表示アニメーション開始
    this.playShowAnimation();
  }

  /**
   * パネルを作成する
   */
  private createPanel(): void {
    const width = 500;
    const height = 480;

    // オーバーレイ背景
    const overlay = this.scene.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(
      -this.scene.cameras.main.width / 2,
      -this.scene.cameras.main.height / 2,
      this.scene.cameras.main.width,
      this.scene.cameras.main.height
    );
    this.add(overlay);

    // パネル背景
    const bg = this.scene.add.graphics();
    bg.fillStyle(Colors.panelBackground, 0.98);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 16);
    bg.lineStyle(3, Colors.accent);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 16);
    this.add(bg);

    // タイトル
    const title = this.scene.add
      .text(0, -height / 2 + 40, `${this.summary.day}日目 終了`, {
        ...TextStyles.heading,
        fontSize: '28px',
        color: '#e94560',
      })
      .setOrigin(0.5);
    this.add(title);

    // 区切り線
    const divider = this.scene.add.graphics();
    divider.lineStyle(1, 0x444466);
    divider.lineBetween(
      -width / 2 + 30,
      -height / 2 + 70,
      width / 2 - 30,
      -height / 2 + 70
    );
    this.add(divider);

    // サマリー項目（初期状態は透明）
    const startY = -height / 2 + 100;
    const lineHeight = 45;

    this.createSummaryRow(
      '完了した依頼',
      `${this.summary.questsCompleted} / ${this.summary.questsTotal}`,
      0,
      startY,
      'row-1'
    );
    this.createSummaryRow(
      '採取した素材',
      `${this.summary.materialsGathered}個`,
      0,
      startY + lineHeight,
      'row-2'
    );
    this.createSummaryRow(
      '合成したアイテム',
      `${this.summary.itemsCrafted}個`,
      0,
      startY + lineHeight * 2,
      'row-3'
    );

    // 収支
    const profit = this.summary.goldEarned - this.summary.goldSpent;
    const profitColor = profit >= 0 ? '#4ade80' : '#f87171';
    this.createSummaryRow(
      '収入',
      `+${this.summary.goldEarned}G`,
      0,
      startY + lineHeight * 3,
      'row-4',
      '#4ade80'
    );
    this.createSummaryRow(
      '支出',
      `-${this.summary.goldSpent}G`,
      0,
      startY + lineHeight * 4,
      'row-5',
      '#f87171'
    );
    this.createSummaryRow(
      '収支',
      `${profit >= 0 ? '+' : ''}${profit}G`,
      0,
      startY + lineHeight * 5,
      'row-6',
      profitColor
    );

    // 区切り線2
    const divider2 = this.scene.add.graphics();
    divider2.lineStyle(1, 0x444466);
    divider2.lineBetween(
      -width / 2 + 30,
      startY + lineHeight * 5 + 30,
      width / 2 - 30,
      startY + lineHeight * 5 + 30
    );
    this.add(divider2);

    // 経験値・ランク
    this.createSummaryRow(
      '獲得貢献度',
      `+${this.summary.expGained}`,
      0,
      startY + lineHeight * 6,
      'row-7',
      '#60a5fa'
    );

    // ランク進捗バー
    const progressBarY = startY + lineHeight * 7 + 10;
    this.createRankProgressBar(0, progressBarY);

    // 続けるボタン（初期状態は非表示）
    this.continueButton = this.createContinueButton(0, height / 2 - 50);
    this.continueButton.setAlpha(0);
    this.add(this.continueButton);
  }

  /**
   * サマリー行を作成する
   */
  private createSummaryRow(
    label: string,
    value: string,
    x: number,
    y: number,
    name: string,
    valueColor: string = '#ffffff'
  ): void {
    const container = this.scene.add.container(x, y);
    container.setAlpha(0);
    container.setName(name);

    const labelText = this.scene.add
      .text(-180, 0, label, {
        ...TextStyles.body,
        fontSize: '16px',
        color: '#a0a0c0',
      })
      .setOrigin(0, 0.5);

    const valueText = this.scene.add
      .text(180, 0, value, {
        ...TextStyles.body,
        fontSize: '18px',
        fontStyle: 'bold',
        color: valueColor,
      })
      .setOrigin(1, 0.5);

    container.add([labelText, valueText]);
    this.add(container);
  }

  /**
   * ランク進捗バーを作成する
   */
  private createRankProgressBar(x: number, y: number): void {
    const container = this.scene.add.container(x, y);
    container.setAlpha(0);
    container.setName('rank-progress');

    // ランクラベル
    const rankLabel = this.scene.add
      .text(-180, 0, `現在のランク: ${this.summary.currentRank}`, {
        ...TextStyles.body,
        fontSize: '14px',
        color: '#a0a0c0',
      })
      .setOrigin(0, 0.5);

    // プログレスバー背景
    const barWidth = 200;
    const barHeight = 16;
    const barBg = this.scene.add.graphics();
    barBg.fillStyle(0x333344, 1);
    barBg.fillRoundedRect(0, -barHeight / 2, barWidth, barHeight, 4);

    // プログレスバー
    const progress = Math.min(this.summary.nextRankProgress, 1);
    const progressBar = this.scene.add.graphics();
    progressBar.fillStyle(Colors.accent, 1);
    if (progress > 0) {
      progressBar.fillRoundedRect(
        0,
        -barHeight / 2,
        barWidth * progress,
        barHeight,
        4
      );
    }
    progressBar.setName('progress-fill');

    // パーセンテージ
    const percentText = this.scene.add
      .text(barWidth + 10, 0, `${Math.floor(progress * 100)}%`, {
        ...TextStyles.body,
        fontSize: '12px',
        color: '#e94560',
      })
      .setOrigin(0, 0.5);

    container.add([rankLabel, barBg, progressBar, percentText]);
    this.add(container);
  }

  /**
   * 続けるボタンを作成する
   */
  private createContinueButton(
    x: number,
    y: number
  ): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);
    const width = 180;
    const height = 50;

    // 背景
    const bg = this.scene.add.graphics();
    bg.fillStyle(Colors.primary, 1);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8);
    container.add(bg);

    // テキスト
    const text = this.scene.add
      .text(0, 0, '次の日へ', {
        ...TextStyles.button,
        fontSize: '18px',
      })
      .setOrigin(0.5);
    container.add(text);

    // インタラクション
    container.setSize(width, height);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(Colors.primaryHover, 1);
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8);
    });

    container.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(Colors.primary, 1);
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8);
    });

    container.on('pointerdown', () => {
      this.scene.tweens.add({
        targets: container,
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 50,
      });
    });

    container.on('pointerup', () => {
      this.scene.tweens.add({
        targets: container,
        scaleX: 1,
        scaleY: 1,
        duration: 50,
        onComplete: () => {
          this.handleContinue();
        },
      });
    });

    return container;
  }

  /**
   * 表示アニメーションを再生する
   */
  private playShowAnimation(): void {
    const rows = [
      'row-1',
      'row-2',
      'row-3',
      'row-4',
      'row-5',
      'row-6',
      'row-7',
      'rank-progress',
    ];

    // パネル全体のフェードイン
    this.setAlpha(0);
    let delay = 0;
    
    this.animationTweens.push(
      this.scene.tweens.add({
        targets: this,
        alpha: 1,
        duration: 300,
        ease: 'Power2',
        delay: delay,
      })
    );
    delay += 200; // 300 - 100 (overlap)

    // 各行を順番に表示
    rows.forEach((rowName, index) => {
      const row = this.getByName(rowName);
      if (row) {
        const isLast = index === rows.length - 1;
        this.animationTweens.push(
          this.scene.tweens.add({
            targets: row,
            alpha: 1,
            y: '-=10',
            duration: 200,
            ease: 'Power2',
            delay: delay,
            onComplete: isLast ? () => this.showContinueButton() : undefined,
          })
        );
        delay += 100; // 200 - 100 (overlap)
      }
    });
  }

  /**
   * 続けるボタンを表示する
   */
  private showContinueButton(): void {
    if (this.continueButton) {
      this.scene.tweens.add({
        targets: this.continueButton,
        alpha: 1,
        scale: { from: 0.8, to: 1 },
        duration: 300,
        ease: 'Back.easeOut',
      });
    }
  }

  /**
   * 続けるボタン押下時の処理
   */
  private handleContinue(): void {
    // 閉じるアニメーション
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scale: 0.9,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        this.onContinue();
        this.destroy();
      },
    });
  }

  /**
   * 破棄処理
   */
  destroy(fromScene?: boolean): void {
    if (this.animationTweens.length > 0) {
      this.animationTweens.forEach(tween => tween.destroy()); this.animationTweens = [];
    }
    super.destroy(fromScene);
  }
}
