/**
 * ContextPanel - 選択中オブジェクトの詳細表示スロット composite
 * Issue #456: UI刷新 Phase 2
 */

import { BaseComponent, type BaseComponentOptions } from '@shared/components';
import { Colors, DesignTokens } from '@shared/theme';
import type Phaser from 'phaser';

export interface ContextPanelOptions extends BaseComponentOptions {
  width?: number;
  height?: number;
  title?: string;
}

export class ContextPanel extends BaseComponent {
  private width: number;
  private height: number;
  private title: string;
  private body = '';
  private bg?: Phaser.GameObjects.Rectangle;
  private titleText?: Phaser.GameObjects.Text;
  private bodyText?: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number, options: ContextPanelOptions = {}) {
    super(scene, x, y, options);
    this.width = options.width ?? 280;
    this.height = options.height ?? 320;
    this.title = options.title ?? '';
  }

  create(): void {
    const bg = this.scene.add.rectangle(0, 0, this.width, this.height, Colors.background.card);
    bg.setStrokeStyle(DesignTokens.border.thin, Colors.border.primary);
    this.bg = bg;
    this.container.add(bg);
    this.container.setDepth(DesignTokens.zIndex.content);

    const titleText = this.scene.add.text(
      0,
      -this.height / 2 + DesignTokens.spacing.md,
      this.title,
      {
        fontFamily: DesignTokens.fonts.primary,
        fontSize: `${DesignTokens.sizes.medium}px`,
        color: '#333333',
        padding: { top: 4 },
      },
    );
    titleText.setOrigin(0.5, 0);
    this.titleText = titleText;
    this.container.add(titleText);

    const bodyText = this.scene.add.text(0, 0, this.body, {
      fontFamily: DesignTokens.fonts.primary,
      fontSize: `${DesignTokens.sizes.small}px`,
      color: '#666666',
      padding: { top: 4 },
    });
    bodyText.setOrigin(0.5);
    this.bodyText = bodyText;
    this.container.add(bodyText);
  }

  setContent(title: string, body: string): this {
    this.title = title;
    this.body = body;
    this.titleText?.setText(title);
    this.bodyText?.setText(body);
    return this;
  }

  clear(): this {
    return this.setContent('', '');
  }

  getTitle(): string {
    return this.title;
  }

  getBody(): string {
    return this.body;
  }

  destroy(): void {
    this.bodyText?.destroy();
    this.titleText?.destroy();
    this.bg?.destroy();
    this.container.destroy(true);
  }
}
