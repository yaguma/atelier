import { ProgressBar } from '@shared/presentation/ui/components/primitive/ProgressBar';
import type Phaser from 'phaser';
import { beforeEach, describe, expect, it } from 'vitest';
import { createComponentMockScene } from '../test-helpers';

describe('ProgressBar', () => {
  let scene: Phaser.Scene;
  beforeEach(() => {
    scene = createComponentMockScene();
  });

  it('生成と create が成功する', () => {
    const bar = new ProgressBar(scene, 0, 0, { value: 30, max: 100 });
    expect(() => bar.create()).not.toThrow();
    expect(bar.getValue()).toBe(30);
  });

  it('setValue で値が更新される', () => {
    const bar = new ProgressBar(scene, 0, 0, { value: 0, max: 100 });
    bar.create();
    bar.setValue(50);
    expect(bar.getValue()).toBe(50);
  });

  it('setMax が例外を投げない', () => {
    const bar = new ProgressBar(scene, 0, 0);
    bar.create();
    expect(() => bar.setMax(200)).not.toThrow();
  });

  it('destroy が例外を投げない', () => {
    const bar = new ProgressBar(scene, 0, 0);
    bar.create();
    expect(() => bar.destroy()).not.toThrow();
  });
});
