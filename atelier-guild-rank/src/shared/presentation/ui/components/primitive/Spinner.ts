/**
 * Spinner - ローディング表示 primitive
 * Issue #456: UI刷新 Phase 2
 */

import { BaseComponent, type BaseComponentOptions } from '@shared/components';
import { Colors, DesignTokens } from '@shared/theme';
import type Phaser from 'phaser';

export interface SpinnerOptions extends BaseComponentOptions {
  size?: number;
  color?: number;
}

export class Spinner extends BaseComponent {
  private size: number;
  private color: number;
  private indicator?: Phaser.GameObjects.Rectangle;
  private tween?: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene, x: number, y: number, options: SpinnerOptions = {}) {
    super(scene, x, y, options);
    this.size = options.size ?? 32;
    this.color = options.color ?? Colors.text.accent;
  }

  create(): void {
    const rect = this.scene.add.rectangle(0, 0, this.size, this.size, this.color);
    rect.setStrokeStyle(DesignTokens.border.thin, Colors.border.highlight);
    this.indicator = rect;
    this.container.add(rect);

    const tween = this.scene.tweens.add({
      targets: rect,
      angle: 360,
      duration: DesignTokens.motion.duration.slow,
      repeat: -1,
      ease: DesignTokens.motion.easing.standard,
    });
    this.tween = tween as Phaser.Tweens.Tween | undefined;
  }

  stop(): this {
    this.tween?.stop();
    this.tween = undefined;
    return this;
  }

  destroy(): void {
    this.stop();
    this.indicator?.destroy();
    this.container.destroy(true);
  }
}
