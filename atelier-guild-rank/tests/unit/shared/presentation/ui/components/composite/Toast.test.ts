import { Toast } from '@shared/presentation/ui/components/composite/Toast';
import type Phaser from 'phaser';
import { beforeEach, describe, expect, it } from 'vitest';
import { createComponentMockScene } from '../test-helpers';

describe('Toast', () => {
  let scene: Phaser.Scene;
  beforeEach(() => {
    scene = createComponentMockScene();
  });

  it('生成と create が成功する', () => {
    const toast = new Toast(scene, 0, 0, { message: 'hello' });
    expect(() => toast.create()).not.toThrow();
    expect(toast.getMessage()).toBe('hello');
  });

  it('show でメッセージを更新できる', () => {
    const toast = new Toast(scene, 0, 0);
    toast.create();
    toast.show('updated');
    expect(toast.getMessage()).toBe('updated');
  });

  it('hide が例外を投げない', () => {
    const toast = new Toast(scene, 0, 0);
    toast.create();
    toast.show('a');
    expect(() => toast.hide()).not.toThrow();
  });

  it('destroy が例外を投げない', () => {
    const toast = new Toast(scene, 0, 0);
    toast.create();
    expect(() => toast.destroy()).not.toThrow();
  });
});
