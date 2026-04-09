import { Toast } from '@shared/presentation/ui/components/composite/Toast';
import type Phaser from 'phaser';
import { beforeEach, describe, expect, it, type vi } from 'vitest';
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

  it('show で scene.time.delayedCall が duration とコールバックで呼ばれる', () => {
    const toast = new Toast(scene, 0, 0, { duration: 1500 });
    toast.create();
    const delayedCall = (scene as unknown as { time: { delayedCall: ReturnType<typeof vi.fn> } })
      .time.delayedCall;
    delayedCall.mockClear();
    toast.show('msg');
    expect(delayedCall).toHaveBeenCalledTimes(1);
    expect(delayedCall).toHaveBeenCalledWith(1500, expect.any(Function));
  });
});
