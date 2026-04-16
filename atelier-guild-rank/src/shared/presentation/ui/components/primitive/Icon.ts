/**
 * Icon - 絵文字/スプライト統一 primitive
 * Issue #456: UI刷新 Phase 2
 */

import { BaseComponent, type BaseComponentOptions } from '@shared/components';
import { Colors, DesignTokens, toColorStr } from '@shared/theme';
import type Phaser from 'phaser';

export interface IconOptions extends BaseComponentOptions {
  symbol?: string;
  size?: number;
  color?: string;
}

export class Icon extends BaseComponent {
  private symbol: string;
  private size: number;
  private color: string;
  private text?: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number, options: IconOptions = {}) {
    super(scene, x, y, options);
    this.symbol = options.symbol ?? '';
    this.size = options.size ?? DesignTokens.sizes.large;
    this.color = options.color ?? toColorStr(Colors.text.light);
  }

  create(): void {
    const text = this.scene.add.text(0, 0, this.symbol, {
      fontFamily: DesignTokens.fonts.primary,
      fontSize: `${this.size}px`,
      color: this.color,
      padding: { top: 4 },
    });
    text.setOrigin(0.5);
    this.text = text;
    this.container.add(text);
  }

  setSymbol(symbol: string): this {
    this.symbol = symbol;
    this.text?.setText(symbol);
    return this;
  }

  getSymbol(): string {
    return this.symbol;
  }

  destroy(): void {
    this.text?.destroy();
    this.container.destroy(true);
  }
}
