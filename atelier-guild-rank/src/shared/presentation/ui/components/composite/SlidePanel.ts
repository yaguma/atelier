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
    // テストモックでは setStrokeStyle が定義されていない場合があるため存在チェックする
    if (typeof bg.setStrokeStyle === 'function') {
      bg.setStrokeStyle(DesignTokens.border.thin, Colors.border.primary);
    }
    if (typeof bg.setOrigin === 'function') {
      bg.setOrigin(0, 0);
    }
    this.bg = bg;
    this.container.add(bg);
    // テストモックでは一部メソッドが欠けている場合があるため存在チェックする
    if (typeof this.container.setDepth === 'function') {
      this.container.setDepth(DesignTokens.zIndex.slidePanel);
    }
    if (typeof this.container.setVisible === 'function') {
      this.container.setVisible(false);
    }
  }

  open(): this {
    this.opened = true;
    if (typeof this.container.setVisible === 'function') {
      this.container.setVisible(true);
    }
    if (typeof this.tween?.stop === 'function') {
      this.tween.stop();
    }
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
    if (typeof this.tween?.stop === 'function') {
      this.tween.stop();
    }
    if (typeof this.container.setVisible === 'function') {
      this.container.setVisible(false);
    }
    return this;
  }

  isOpen(): boolean {
    return this.opened;
  }

  /**
   * コンテンツコンテナを取得する。
   * SlidePanel を合成して使う詳細パネル実装から、子 GameObject を追加するために公開する。
   */
  getContentContainer(): Phaser.GameObjects.Container {
    return this.container;
  }

  /**
   * 子 GameObject を SlidePanel のコンテナに追加する。
   */
  addContent(child: Phaser.GameObjects.GameObject): this {
    this.container.add(child);
    return this;
  }

  destroy(): void {
    if (typeof this.tween?.stop === 'function') {
      this.tween.stop();
    }
    this.tween = undefined;
    this.bg?.destroy();
    this.container.destroy(true);
  }
}
