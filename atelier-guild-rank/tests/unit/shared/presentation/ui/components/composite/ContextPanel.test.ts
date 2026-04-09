import { ContextPanel } from '@shared/presentation/ui/components/composite/ContextPanel';
import type Phaser from 'phaser';
import { beforeEach, describe, expect, it } from 'vitest';
import { createComponentMockScene } from '../test-helpers';

describe('ContextPanel', () => {
  let scene: Phaser.Scene;
  beforeEach(() => {
    scene = createComponentMockScene();
  });

  it('生成と create が成功する', () => {
    const panel = new ContextPanel(scene, 0, 0, { title: 'タイトル' });
    expect(() => panel.create()).not.toThrow();
    expect(panel.getTitle()).toBe('タイトル');
  });

  it('setContent でタイトルと本文が更新される', () => {
    const panel = new ContextPanel(scene, 0, 0);
    panel.create();
    panel.setContent('t', 'b');
    expect(panel.getTitle()).toBe('t');
    expect(panel.getBody()).toBe('b');
  });

  it('clear で空になる', () => {
    const panel = new ContextPanel(scene, 0, 0);
    panel.create();
    panel.setContent('t', 'b');
    panel.clear();
    expect(panel.getTitle()).toBe('');
    expect(panel.getBody()).toBe('');
  });

  it('destroy が例外を投げない', () => {
    const panel = new ContextPanel(scene, 0, 0);
    panel.create();
    expect(() => panel.destroy()).not.toThrow();
  });
});
