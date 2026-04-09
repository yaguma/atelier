import { Tag } from '@shared/presentation/ui/components/primitive/Tag';
import type Phaser from 'phaser';
import { beforeEach, describe, expect, it } from 'vitest';
import { createComponentMockScene } from '../test-helpers';

describe('Tag', () => {
  let scene: Phaser.Scene;
  beforeEach(() => {
    scene = createComponentMockScene();
  });

  it('生成と create が成功する', () => {
    const tag = new Tag(scene, 0, 0, { label: '採取' });
    expect(() => tag.create()).not.toThrow();
    expect(tag.getLabel()).toBe('採取');
  });

  it('setLabel でラベルが更新される', () => {
    const tag = new Tag(scene, 0, 0, { label: 'a' });
    tag.create();
    tag.setLabel('b');
    expect(tag.getLabel()).toBe('b');
  });

  it('destroy が例外を投げない', () => {
    const tag = new Tag(scene, 0, 0);
    tag.create();
    expect(() => tag.destroy()).not.toThrow();
  });
});
