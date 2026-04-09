/**
 * SlidePanel - 右からスライドインする詳細パネル composite
 * Issue #456: UI刷新 Phase 2
 */

import { BaseComponent, type BaseComponentOptions } from '@shared/components';
import { Colors, DesignTokens } from '@shared/theme';
import type Phaser from 'phaser';

export interface SlidePanelOptions extends BaseComponentOptions {
  width?: number;
  height?: number;
}

export class SlidePanel extends BaseComponent {
  private width: number;
  private height: number;
  private opened = false;
  private bg?: Phaser.GameObjects.Rectangle;
  private tween?: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene, x: number, y: number, options: SlidePanelOptions = {}) {
    super(scene, x, y, options);
    this.width = options.width ?? 320;
    this.height = options.height ?? 480;
  }

  create(): void {
    const bg = this.scene.add.rectangle(0, 0, this.width, this.height, Colors.background.dark);
    bg.setStrokeStyle(DesignTokens.border.thin, Colors.border.primary);
    bg.setOrigin(0, 0);
    this.bg = bg;
    this.container.add(bg);
    this.container.setDepth(DesignTokens.zIndex.slidePanel);
    this.container.setVisible(false);
  }

  open(): this {
    this.opened = true;
    this.container.setVisible(true);
    this.tween?.stop();
    this.tween = this.scene.tweens.add({
      targets: this.container,
      alpha: { from: 0, to: 1 },
      duration: DesignTokens.motion.duration.base,
      ease: DesignTokens.motion.easing.decelerate,
    }) as Phaser.Tweens.Tween | undefined;
    return this;
  }

  close(): this {
    this.opened = false;
    this.tween?.stop();
    this.container.setVisible(false);
    return this;
  }

  isOpen(): boolean {
    return this.opened;
  }

  destroy(): void {
    this.tween?.stop();
    this.tween = undefined;
    this.bg?.destroy();
    this.container.destroy(true);
  }
}
