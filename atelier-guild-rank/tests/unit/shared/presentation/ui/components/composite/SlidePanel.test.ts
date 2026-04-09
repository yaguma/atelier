import { SlidePanel } from '@shared/presentation/ui/components/composite/SlidePanel';
import type Phaser from 'phaser';
import { beforeEach, describe, expect, it } from 'vitest';
import { createComponentMockScene } from '../test-helpers';

describe('SlidePanel', () => {
  let scene: Phaser.Scene;
  beforeEach(() => {
    scene = createComponentMockScene();
  });

  it('create 直後は閉じている', () => {
    const p = new SlidePanel(scene, 0, 0);
    p.create();
    expect(p.isOpen()).toBe(false);
  });

  it('open / close で状態が切り替わる', () => {
    const p = new SlidePanel(scene, 0, 0);
    p.create();
    p.open();
    expect(p.isOpen()).toBe(true);
    p.close();
    expect(p.isOpen()).toBe(false);
  });

  it('destroy が例外を投げない', () => {
    const p = new SlidePanel(scene, 0, 0);
    p.create();
    p.open();
    expect(() => p.destroy()).not.toThrow();
  });
});
