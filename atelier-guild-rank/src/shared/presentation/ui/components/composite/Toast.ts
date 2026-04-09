/**
 * Toast - 一時通知（右上、3秒自動消滅）composite
 * Issue #456: UI刷新 Phase 2
 */

import { BaseComponent, type BaseComponentOptions } from '@shared/components';
import { Colors, DesignTokens, toColorStr } from '@shared/theme';
import type Phaser from 'phaser';

export interface ToastOptions extends BaseComponentOptions {
  message?: string;
  duration?: number;
}

const DEFAULT_DURATION_MS = 3000;

export class Toast extends BaseComponent {
  private message: string;
  private duration: number;
  private bg?: Phaser.GameObjects.Rectangle;
  private text?: Phaser.GameObjects.Text;
  private timer?: Phaser.Time.TimerEvent;

  constructor(scene: Phaser.Scene, x: number, y: number, options: ToastOptions = {}) {
    super(scene, x, y, options);
    this.message = options.message ?? '';
    this.duration = options.duration ?? DEFAULT_DURATION_MS;
  }

  create(): void {
    const text = this.scene.add.text(0, 0, this.message, {
      fontFamily: DesignTokens.fonts.primary,
      fontSize: `${DesignTokens.sizes.small}px`,
      color: toColorStr(Colors.text.light),
      padding: { top: 4 },
    });
    text.setOrigin(0.5);

    const w = Math.max(44, (text.width || this.message.length * 12) + DesignTokens.spacing.md * 2);
    const h = Math.max(
      44,
      (text.height || DesignTokens.sizes.medium) + DesignTokens.spacing.sm * 2,
    );
    const bg = this.scene.add.rectangle(0, 0, w, h, Colors.background.dark);
    bg.setStrokeStyle(DesignTokens.border.thin, Colors.border.highlight);
    this.bg = bg;
    this.container.add(bg);
    this.container.add(text);
    this.text = text;
    this.container.setDepth(DesignTokens.zIndex.toast);
    this.container.setVisible(false);
  }

  show(message?: string): this {
    if (message !== undefined) {
      this.message = message;
      this.text?.setText(message);
    }
    this.container.setVisible(true);
    this.timer?.remove();
    // Phaser の Scene.time は常に存在するため握りつぶしを排除
    this.timer = this.scene.time.delayedCall(this.duration, () => this.hide());
    return this;
  }

  hide(): this {
    this.container.setVisible(false);
    this.timer?.remove();
    this.timer = undefined;
    return this;
  }

  getMessage(): string {
    return this.message;
  }

  destroy(): void {
    this.timer?.remove();
    this.timer = undefined;
    this.text?.destroy();
    this.bg?.destroy();
    this.container.destroy(true);
  }
}
