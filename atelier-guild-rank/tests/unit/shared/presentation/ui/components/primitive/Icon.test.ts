import { Icon } from '@shared/presentation/ui/components/primitive/Icon';
import type Phaser from 'phaser';
import { beforeEach, describe, expect, it } from 'vitest';
import { createComponentMockScene } from '../test-helpers';

describe('Icon', () => {
  let scene: Phaser.Scene;
  beforeEach(() => {
    scene = createComponentMockScene();
  });

  it('生成と create が成功する', () => {
    const icon = new Icon(scene, 0, 0, { symbol: '⚒' });
    expect(() => icon.create()).not.toThrow();
    expect(icon.getSymbol()).toBe('⚒');
  });

  it('setSymbol でシンボルが更新される', () => {
    const icon = new Icon(scene, 0, 0, { symbol: 'a' });
    icon.create();
    icon.setSymbol('b');
    expect(icon.getSymbol()).toBe('b');
  });

  it('destroy が例外を投げない', () => {
    const icon = new Icon(scene, 0, 0);
    icon.create();
    expect(() => icon.destroy()).not.toThrow();
  });
});
