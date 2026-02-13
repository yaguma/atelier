/**
 * RankBadge コンポーネント
 * TASK-0093: features/rank/components作成
 *
 * ランクバッジ（ランクアイコンと名前）を表示するコンポーネント。
 * 現在のギルドランクを視覚的に表現する。
 */

import { BaseComponent } from '@shared/components';
import { Colors, THEME } from '@shared/theme';
import type { GuildRank } from '@shared/types';
import type Phaser from 'phaser';

// =============================================================================
// 定数
// =============================================================================

/** バッジ寸法 */
const BADGE = {
  SIZE: 48,
  RADIUS: 8,
} as const;

/** テキストスタイル */
const TEXT_STYLES = {
  RANK: { fontSize: `${THEME.sizes.xlarge}px`, color: '#ffffff', fontStyle: 'bold' },
  NAME: { fontSize: `${THEME.sizes.small}px`, color: '#cccccc' },
} as const;

/** ランクごとのバッジ色 */
const RANK_BADGE_COLORS: Record<GuildRank, number> = {
  G: 0x808080,
  F: 0x6b8e23,
  E: 0x2e8b57,
  D: 0x4169e1,
  C: 0x9932cc,
  B: 0xdc143c,
  A: 0xffd700,
  S: 0xff1493,
};

/** ランク名称 */
const RANK_NAMES: Record<GuildRank, string> = {
  G: 'Gランク',
  F: 'Fランク',
  E: 'Eランク',
  D: 'Dランク',
  C: 'Cランク',
  B: 'Bランク',
  A: 'Aランク',
  S: 'Sランク',
};

/** レイアウトオフセット */
const OFFSET = {
  NAME_Y: BADGE.SIZE / 2 + 8,
} as const;

// =============================================================================
// 型定義
// =============================================================================

/** RankBadgeの設定 */
export interface RankBadgeConfig {
  /** 表示するランク */
  rank: GuildRank;
}

// =============================================================================
// コンポーネント
// =============================================================================

/**
 * ランクバッジ
 *
 * ギルドランクをアイコンとテキストで表示する。
 * ランクに応じた色でバッジが表示される。
 */
export class RankBadge extends BaseComponent {
  private config: RankBadgeConfig;
  private created = false;
  private badgeBg!: Phaser.GameObjects.Rectangle;
  private rankText!: Phaser.GameObjects.Text;
  private nameText!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number, config: RankBadgeConfig) {
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

    this.createBadge();
    this.createNameLabel();
  }

  destroy(): void {
    this.container.destroy(true);
  }

  /** ランクを更新 */
  updateRank(rank: GuildRank): void {
    this.config.rank = rank;
    if (this.badgeBg) {
      this.badgeBg.setFillStyle(RANK_BADGE_COLORS[rank] ?? Colors.ui.button.normal);
    }
    if (this.rankText) {
      this.rankText.setText(rank);
    }
    if (this.nameText) {
      this.nameText.setText(RANK_NAMES[rank] ?? rank);
    }
  }

  // ===========================================================================
  // private
  // ===========================================================================

  private createBadge(): void {
    // バッジ背景
    this.badgeBg = this.scene.add.rectangle(
      0,
      0,
      BADGE.SIZE,
      BADGE.SIZE,
      RANK_BADGE_COLORS[this.config.rank] ?? Colors.ui.button.normal,
    );
    this.badgeBg.setStrokeStyle(2, Colors.border.gold);
    this.container.add(this.badgeBg);

    // ランク文字
    this.rankText = this.scene.add.text(0, 0, this.config.rank, TEXT_STYLES.RANK);
    this.rankText.setOrigin(0.5);
    this.container.add(this.rankText);
  }

  private createNameLabel(): void {
    const name = RANK_NAMES[this.config.rank] ?? this.config.rank;
    this.nameText = this.scene.add.text(0, OFFSET.NAME_Y, name, TEXT_STYLES.NAME);
    this.nameText.setOrigin(0.5, 0);
    this.container.add(this.nameText);
  }
}
