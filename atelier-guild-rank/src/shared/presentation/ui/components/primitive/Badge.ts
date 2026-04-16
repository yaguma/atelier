/**
 * Badge - グレード/ランク/状態バッジ汎用 primitive
 * Issue #456: UI刷新 Phase 2
 */

import { BaseComponent, type BaseComponentOptions } from '@shared/components';
import { Colors, DesignTokens, toColorStr } from '@shared/theme';
import type Phaser from 'phaser';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

export interface BadgeOptions extends BaseComponentOptions {
  label?: string;
  variant?: BadgeVariant;
  /** 矩形最小サイズ。ヒット領域は最小 44x44 を保証する */
  width?: number;
  height?: number;
}

const VARIANT_BG: Record<BadgeVariant, number> = {
  default: Colors.background.secondary,
  success: Colors.ui.progress.success,
  warning: Colors.ui.progress.warning,
  danger: Colors.ui.progress.danger,
  info: Colors.ui.progress.info,
};

const MIN_HIT = 44;

export class Badge extends BaseComponent {
  private label: string;
  private variant: BadgeVariant;
  private width: number;
  private height: number;
  private bg?: Phaser.GameObjects.Rectangle;
  private text?: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number, options: BadgeOptions = {}) {
    super(scene, x, y, options);
    this.label = options.label ?? '';
    this.variant = options.variant ?? 'default';
    this.width = Math.max(MIN_HIT, options.width ?? 56);
    this.height = Math.max(MIN_HIT, options.height ?? MIN_HIT);
  }

  create(): void {
    const bg = this.scene.add.rectangle(0, 0, this.width, this.height, VARIANT_BG[this.variant]);
    bg.setStrokeStyle(DesignTokens.border.thin, Colors.border.primary);
    this.bg = bg;
    this.container.add(bg);

    const text = this.scene.add.text(0, 0, this.label, {
      fontFamily: DesignTokens.fonts.primary,
      fontSize: `${DesignTokens.sizes.small}px`,
      color: toColorStr(Colors.text.light),
    });
    text.setOrigin(0.5);
    this.text = text;
    this.container.add(text);
  }

  setLabel(label: string): this {
    this.label = label;
    this.text?.setText(label);
    return this;
  }

  getLabel(): string {
    return this.label;
  }

  setVariant(variant: BadgeVariant): this {
    this.variant = variant;
    this.bg?.setFillStyle(VARIANT_BG[variant]);
    return this;
  }

  destroy(): void {
    this.text?.destroy();
    this.bg?.destroy();
    this.container.destroy(true);
  }
}
