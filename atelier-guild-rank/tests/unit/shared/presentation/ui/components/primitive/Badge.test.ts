import { Badge } from '@shared/presentation/ui/components/primitive/Badge';
import type Phaser from 'phaser';
import { beforeEach, describe, expect, it } from 'vitest';
import { createComponentMockScene } from '../test-helpers';

describe('Badge', () => {
  let scene: Phaser.Scene;
  beforeEach(() => {
    scene = createComponentMockScene();
  });

  it('生成と create が成功する', () => {
    const badge = new Badge(scene, 0, 0, { label: 'A' });
    expect(() => badge.create()).not.toThrow();
    expect(badge.getLabel()).toBe('A');
  });

  it('setLabel でラベルが更新される', () => {
    const badge = new Badge(scene, 0, 0, { label: 'A' });
    badge.create();
    badge.setLabel('B');
    expect(badge.getLabel()).toBe('B');
  });

  it('setVariant が例外を投げない', () => {
    const badge = new Badge(scene, 0, 0);
    badge.create();
    expect(() => badge.setVariant('success')).not.toThrow();
  });

  it('destroy が例外を投げない', () => {
    const badge = new Badge(scene, 0, 0);
    badge.create();
    expect(() => badge.destroy()).not.toThrow();
  });
});
