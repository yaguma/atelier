/**
 * ProgressBar - 貢献度/AP/昇格ゲージ汎用 primitive
 * Issue #456: UI刷新 Phase 2
 */

import { BaseComponent, type BaseComponentOptions } from '@shared/components';
import { Colors, DesignTokens } from '@shared/theme';
import type Phaser from 'phaser';

export interface ProgressBarOptions extends BaseComponentOptions {
  width?: number;
  height?: number;
  value?: number;
  max?: number;
  fillColor?: number;
  bgColor?: number;
}

export class ProgressBar extends BaseComponent {
  private width: number;
  private height: number;
  private value: number;
  private max: number;
  private fillColor: number;
  private bgColor: number;
  private bg?: Phaser.GameObjects.Rectangle;
  private fill?: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, x: number, y: number, options: ProgressBarOptions = {}) {
    super(scene, x, y, options);
    this.width = options.width ?? 160;
    this.height = options.height ?? 12;
    this.value = options.value ?? 0;
    this.max = options.max ?? 100;
    this.fillColor = options.fillColor ?? Colors.ui.progress.fill;
    this.bgColor = options.bgColor ?? Colors.ui.progress.background;
  }

  create(): void {
    const bg = this.scene.add.rectangle(0, 0, this.width, this.height, this.bgColor);
    bg.setStrokeStyle(DesignTokens.border.hairline, Colors.border.primary);
    bg.setOrigin(0, 0.5);
    this.bg = bg;
    this.container.add(bg);

    const fill = this.scene.add.rectangle(
      0,
      0,
      this.computeFillWidth(),
      this.height,
      this.fillColor,
    );
    fill.setOrigin(0, 0.5);
    this.fill = fill;
    this.container.add(fill);
  }

  private computeFillWidth(): number {
    if (this.max <= 0) return 0;
    const ratio = Math.max(0, Math.min(1, this.value / this.max));
    return this.width * ratio;
  }

  setValue(value: number): this {
    this.value = value;
    this.fill?.setSize(this.computeFillWidth(), this.height);
    return this;
  }

  getValue(): number {
    return this.value;
  }

  setMax(max: number): this {
    this.max = max;
    this.fill?.setSize(this.computeFillWidth(), this.height);
    return this;
  }

  destroy(): void {
    this.fill?.destroy();
    this.bg?.destroy();
    this.container.destroy(true);
  }
}
