/**
 * PhaseRail - フェーズ進行常時表示バー composite
 * Issue #456: UI刷新 Phase 2
 */

import { BaseComponent, type BaseComponentOptions } from '@shared/components';
import { Colors, DesignTokens } from '@shared/theme';
import type Phaser from 'phaser';

export interface PhaseRailOptions extends BaseComponentOptions {
  phases?: readonly string[];
  current?: string;
  width?: number;
}

const DEFAULT_PHASES = ['QUEST_ACCEPT', 'GATHERING', 'ALCHEMY', 'DELIVERY', 'DAY_END'] as const;

export class PhaseRail extends BaseComponent {
  private phases: readonly string[];
  private current: string;
  private width: number;
  private bg?: Phaser.GameObjects.Rectangle;
  private labels: Phaser.GameObjects.Text[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number, options: PhaseRailOptions = {}) {
    super(scene, x, y, options);
    this.phases = options.phases ?? DEFAULT_PHASES;
    this.current = options.current ?? this.phases[0] ?? '';
    this.width = options.width ?? 640;
  }

  create(): void {
    const height = Math.max(44, DesignTokens.spacing.lg);
    const bg = this.scene.add.rectangle(0, 0, this.width, height, Colors.background.secondary);
    bg.setStrokeStyle(DesignTokens.border.hairline, Colors.border.primary);
    this.bg = bg;
    this.container.add(bg);
    this.container.setDepth(DesignTokens.zIndex.phaseRail);

    const step = this.width / Math.max(1, this.phases.length);
    this.phases.forEach((phase, idx) => {
      const xPos = -this.width / 2 + step * idx + step / 2;
      const isActive = phase === this.current;
      const label = this.scene.add.text(xPos, 0, phase, {
        fontFamily: DesignTokens.fonts.primary,
        fontSize: `${DesignTokens.sizes.small}px`,
        color: isActive ? '#ffd54f' : '#cccccc',
        padding: { top: 2 },
      });
      label.setOrigin(0.5);
      this.labels.push(label);
      this.container.add(label);
    });
  }

  setCurrent(current: string): this {
    this.current = current;
    this.phases.forEach((phase, idx) => {
      const label = this.labels[idx];
      if (label) {
        label.setColor(phase === current ? '#ffd54f' : '#cccccc');
      }
    });
    return this;
  }

  getCurrent(): string {
    return this.current;
  }

  destroy(): void {
    for (const l of this.labels) l.destroy();
    this.labels = [];
    this.bg?.destroy();
    this.container.destroy(true);
  }
}
