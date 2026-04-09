/**
 * HUDBar - ゴールド/AP/日数/ランク/貢献度 共通HUD composite
 * Issue #456: UI刷新 Phase 2
 */

import { BaseComponent, type BaseComponentOptions } from '@shared/components';
import { Colors, DesignTokens } from '@shared/theme';
import type Phaser from 'phaser';

export interface HUDBarData {
  gold: number;
  actionPoints: number;
  maxActionPoints: number;
  day: number;
  rank: string;
  contribution: number;
}

export interface HUDBarOptions extends BaseComponentOptions {
  width?: number;
  data?: HUDBarData;
}

const DEFAULT_DATA: HUDBarData = {
  gold: 0,
  actionPoints: 0,
  maxActionPoints: 0,
  day: 0,
  rank: '',
  contribution: 0,
};

export class HUDBar extends BaseComponent {
  private width: number;
  private data: HUDBarData;
  private bg?: Phaser.GameObjects.Rectangle;
  private text?: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number, options: HUDBarOptions = {}) {
    super(scene, x, y, options);
    this.width = options.width ?? 480;
    this.data = { ...DEFAULT_DATA, ...(options.data ?? {}) };
  }

  create(): void {
    const height = Math.max(44, DesignTokens.spacing.lg * 2);
    const bg = this.scene.add.rectangle(0, 0, this.width, height, Colors.background.dark);
    bg.setStrokeStyle(DesignTokens.border.thin, Colors.border.primary);
    this.bg = bg;
    this.container.add(bg);
    this.container.setDepth(DesignTokens.zIndex.hud);

    const text = this.scene.add.text(0, 0, this.formatLabel(), {
      fontFamily: DesignTokens.fonts.primary,
      fontSize: `${DesignTokens.sizes.medium}px`,
      color: '#ffffff',
      padding: { top: 4 },
    });
    text.setOrigin(0.5);
    this.text = text;
    this.container.add(text);
  }

  private formatLabel(): string {
    const d = this.data;
    return `${d.rank} | Day ${d.day} | ${d.gold}G | AP ${d.actionPoints}/${d.maxActionPoints} | 貢献 ${d.contribution}`;
  }

  update(data: Partial<HUDBarData>): this {
    this.data = { ...this.data, ...data };
    this.text?.setText(this.formatLabel());
    return this;
  }

  getData(): HUDBarData {
    return this.data;
  }

  destroy(): void {
    this.text?.destroy();
    this.bg?.destroy();
    this.container.destroy(true);
  }
}
