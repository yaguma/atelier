/**
 * Tag - 属性・カードタイプラベル primitive
 * Issue #456: UI刷新 Phase 2
 */

import { BaseComponent, type BaseComponentOptions } from '@shared/components';
import { Colors, DesignTokens, toColorStr } from '@shared/theme';
import type Phaser from 'phaser';

export interface TagOptions extends BaseComponentOptions {
  label?: string;
  color?: number;
  textColor?: string;
}

export class Tag extends BaseComponent {
  private label: string;
  private color: number;
  private textColor: string;
  private bg?: Phaser.GameObjects.Rectangle;
  private text?: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number, options: TagOptions = {}) {
    super(scene, x, y, options);
    this.label = options.label ?? '';
    this.color = options.color ?? Colors.cardType.default;
    this.textColor = options.textColor ?? toColorStr(Colors.text.primary);
  }

  create(): void {
    const padX = DesignTokens.spacing.sm;
    const padY = DesignTokens.spacing.xs;
    const text = this.scene.add.text(0, 0, this.label, {
      fontFamily: DesignTokens.fonts.primary,
      fontSize: `${DesignTokens.sizes.small}px`,
      color: this.textColor,
      padding: { top: 2 },
    });
    text.setOrigin(0.5);

    const w = Math.max(44, (text.width || this.label.length * 10) + padX * 2);
    const h = Math.max(44, (text.height || DesignTokens.sizes.small) + padY * 2);

    const bg = this.scene.add.rectangle(0, 0, w, h, this.color);
    bg.setStrokeStyle(DesignTokens.border.hairline, Colors.border.secondary);
    this.bg = bg;
    this.container.add(bg);
    this.container.add(text);
    this.text = text;
  }

  setLabel(label: string): this {
    this.label = label;
    this.text?.setText(label);
    return this;
  }

  getLabel(): string {
    return this.label;
  }

  destroy(): void {
    this.text?.destroy();
    this.bg?.destroy();
    this.container.destroy(true);
  }
}
