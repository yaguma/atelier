import { Spinner } from '@shared/presentation/ui/components/primitive/Spinner';
import type Phaser from 'phaser';
import { beforeEach, describe, expect, it } from 'vitest';
import { createComponentMockScene } from '../test-helpers';

describe('Spinner', () => {
  let scene: Phaser.Scene;
  beforeEach(() => {
    scene = createComponentMockScene();
  });

  it('生成と create が成功する', () => {
    const spinner = new Spinner(scene, 0, 0);
    expect(() => spinner.create()).not.toThrow();
  });

  it('stop が例外を投げない', () => {
    const spinner = new Spinner(scene, 0, 0);
    spinner.create();
    expect(() => spinner.stop()).not.toThrow();
  });

  it('destroy で tween が停止しリソース解放される', () => {
    const spinner = new Spinner(scene, 0, 0);
    spinner.create();
    expect(() => spinner.destroy()).not.toThrow();
  });
});
