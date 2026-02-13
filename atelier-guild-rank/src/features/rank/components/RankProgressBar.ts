/**
 * RankProgressBar コンポーネント
 * TASK-0093: features/rank/components作成
 *
 * ランク進捗バーを表示するコンポーネント。
 * 現在の貢献度と昇格に必要な貢献度をバーで可視化する。
 */

import { BaseComponent } from '@shared/components';
import { Colors, THEME } from '@shared/theme';
import type { GuildRank } from '@shared/types';
import type Phaser from 'phaser';

// =============================================================================
// 定数
// =============================================================================

/** バー寸法 */
const BAR = {
  WIDTH: 300,
  HEIGHT: 24,
  RADIUS: 4,
  PADDING: 2,
} as const;

/** テキストスタイル */
const TEXT_STYLES = {
  LABEL: { fontSize: `${THEME.sizes.small}px`, color: '#ffffff' },
  GAUGE: { fontSize: `${THEME.sizes.small}px`, color: '#ffffff' },
} as const;

/** ランクごとのバー色 */
const RANK_COLORS: Record<GuildRank, number> = {
  G: 0x808080,
  F: 0x6b8e23,
  E: 0x2e8b57,
  D: 0x4169e1,
  C: 0x9932cc,
  B: 0xdc143c,
  A: 0xffd700,
  S: 0xff1493,
};

/** レイアウトオフセット */
const OFFSET = {
  LABEL_Y: -20,
  GAUGE_Y: -20,
} as const;

// =============================================================================
// 型定義
// =============================================================================

/** RankProgressBarの設定 */
export interface RankProgressBarConfig {
  /** 現在のランク */
  rank: GuildRank;
  /** 進捗率（0-100+） */
  gaugePercent: number;
  /** 表示ラベル（省略時は「昇格ゲージ」） */
  label?: string;
}

// =============================================================================
// コンポーネント
// =============================================================================

/**
 * ランク進捗バー
 *
 * 昇格ゲージの進捗状況をバーで表示する。
 * ランクに応じた色でバーが塗られる。
 */
export class RankProgressBar extends BaseComponent {
  private config: RankProgressBarConfig;
  private created = false;
  private barBg!: Phaser.GameObjects.Rectangle;
  private barFill!: Phaser.GameObjects.Rectangle;
  private labelText!: Phaser.GameObjects.Text;
  private gaugeText!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number, config: RankProgressBarConfig) {
    super(scene, x, y);
    if (!config) {
      throw new Error('config is required');
    }
    this.config = config;
  }

  create(): void {
    if (this.created) {
      return;
    }
    this.created = true;

    this.createBar();
    this.createLabels();
    this.updateFill();
  }

  destroy(): void {
    this.container.destroy(true);
  }

  /** 進捗を更新 */
  updateProgress(gaugePercent: number, rank?: GuildRank): void {
    this.config.gaugePercent = gaugePercent;
    if (rank !== undefined) {
      this.config.rank = rank;
    }
    this.updateFill();
  }

  // ===========================================================================
  // private
  // ===========================================================================

  private createBar(): void {
    // バー背景
    this.barBg = this.scene.add.rectangle(
      0,
      0,
      BAR.WIDTH,
      BAR.HEIGHT,
      Colors.ui.progress.background,
    );
    this.barBg.setStrokeStyle(1, Colors.border.primary);
    this.container.add(this.barBg);

    // バー塗り部分（初期幅0）
    this.barFill = this.scene.add.rectangle(
      -(BAR.WIDTH / 2) + BAR.PADDING,
      0,
      0,
      BAR.HEIGHT - BAR.PADDING * 2,
      this.getBarColor(),
    );
    this.barFill.setOrigin(0, 0.5);
    this.container.add(this.barFill);
  }

  private createLabels(): void {
    const label = this.config.label ?? '昇格ゲージ';

    this.labelText = this.scene.add.text(
      -(BAR.WIDTH / 2),
      OFFSET.LABEL_Y,
      label,
      TEXT_STYLES.LABEL,
    );
    this.labelText.setOrigin(0, 1);
    this.container.add(this.labelText);

    this.gaugeText = this.scene.add.text(
      BAR.WIDTH / 2,
      OFFSET.GAUGE_Y,
      `${Math.min(this.config.gaugePercent, 100)}%`,
      TEXT_STYLES.GAUGE,
    );
    this.gaugeText.setOrigin(1, 1);
    this.container.add(this.gaugeText);
  }

  private updateFill(): void {
    const clampedPercent = Math.min(Math.max(this.config.gaugePercent, 0), 100);
    const maxFillWidth = BAR.WIDTH - BAR.PADDING * 2;
    const fillWidth = (clampedPercent / 100) * maxFillWidth;

    if (this.barFill) {
      this.barFill.setSize(fillWidth, BAR.HEIGHT - BAR.PADDING * 2);
      this.barFill.setFillStyle(this.getBarColor());
    }
    if (this.gaugeText) {
      this.gaugeText.setText(`${Math.min(this.config.gaugePercent, 100)}%`);
    }
  }

  private getBarColor(): number {
    return RANK_COLORS[this.config.rank] ?? Colors.ui.progress.fill;
  }
}
