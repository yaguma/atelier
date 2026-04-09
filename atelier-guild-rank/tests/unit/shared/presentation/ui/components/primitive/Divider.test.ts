import { Divider } from '@shared/presentation/ui/components/primitive/Divider';
import type Phaser from 'phaser';
import { beforeEach, describe, expect, it } from 'vitest';
import { createComponentMockScene } from '../test-helpers';

describe('Divider', () => {
  let scene: Phaser.Scene;
  beforeEach(() => {
    scene = createComponentMockScene();
  });

  it('horizontal の生成と create が成功する', () => {
    const div = new Divider(scene, 0, 0);
    expect(() => div.create()).not.toThrow();
    expect(div.getOrientation()).toBe('horizontal');
  });

  it('vertical を指定できる', () => {
    const div = new Divider(scene, 0, 0, { orientation: 'vertical' });
    div.create();
    expect(div.getOrientation()).toBe('vertical');
  });

  it('destroy が例外を投げない', () => {
    const div = new Divider(scene, 0, 0);
    div.create();
    expect(() => div.destroy()).not.toThrow();
  });
});
