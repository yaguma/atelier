/**
 * Divider - 区切り線 primitive
 * Issue #456: UI刷新 Phase 2
 */

import { BaseComponent, type BaseComponentOptions } from '@shared/components';
import { Colors, DesignTokens } from '@shared/theme';
import type Phaser from 'phaser';

export type DividerOrientation = 'horizontal' | 'vertical';

export interface DividerOptions extends BaseComponentOptions {
  length?: number;
  thickness?: number;
  color?: number;
  orientation?: DividerOrientation;
}

export class Divider extends BaseComponent {
  private length: number;
  private thickness: number;
  private color: number;
  private orientation: DividerOrientation;
  private line?: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, x: number, y: number, options: DividerOptions = {}) {
    super(scene, x, y, options);
    this.length = options.length ?? 200;
    this.thickness = options.thickness ?? DesignTokens.border.hairline;
    this.color = options.color ?? Colors.border.secondary;
    this.orientation = options.orientation ?? 'horizontal';
  }

  create(): void {
    const w = this.orientation === 'horizontal' ? this.length : this.thickness;
    const h = this.orientation === 'horizontal' ? this.thickness : this.length;
    const rect = this.scene.add.rectangle(0, 0, w, h, this.color);
    this.line = rect;
    this.container.add(rect);
  }

  getOrientation(): DividerOrientation {
    return this.orientation;
  }

  destroy(): void {
    this.line?.destroy();
    this.container.destroy(true);
  }
}
