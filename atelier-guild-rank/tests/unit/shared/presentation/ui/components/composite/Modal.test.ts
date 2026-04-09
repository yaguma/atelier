import { Modal } from '@shared/presentation/ui/components/composite/Modal';
import type Phaser from 'phaser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createComponentMockScene } from '../test-helpers';

describe('Modal', () => {
  let scene: Phaser.Scene;
  beforeEach(() => {
    scene = createComponentMockScene();
  });

  it('create 直後は閉じている', () => {
    const m = new Modal(scene, 0, 0);
    m.create();
    expect(m.isOpen()).toBe(false);
  });

  it('show / confirm で onConfirm が呼ばれる', () => {
    const m = new Modal(scene, 0, 0);
    m.create();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    m.show(onConfirm, onCancel);
    expect(m.isOpen()).toBe(true);
    m.confirm();
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(m.isOpen()).toBe(false);
  });

  it('show / cancel で onCancel が呼ばれる', () => {
    const m = new Modal(scene, 0, 0);
    m.create();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    m.show(onConfirm, onCancel);
    m.cancel();
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(m.isOpen()).toBe(false);
  });

  it('destroy が例外を投げない', () => {
    const m = new Modal(scene, 0, 0);
    m.create();
    expect(() => m.destroy()).not.toThrow();
  });

  it('show 時に keyboard.on が呼ばれ、ESC で cancel される', () => {
    const m = new Modal(scene, 0, 0);
    m.create();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    m.show(onConfirm, onCancel);

    const keyboardOn = (
      scene as unknown as { input: { keyboard: { on: ReturnType<typeof vi.fn> } } }
    ).input.keyboard.on;
    expect(keyboardOn).toHaveBeenCalledWith('keydown', expect.any(Function));
    const handler = keyboardOn.mock.calls[0]?.[1] as (e: KeyboardEvent) => void;

    handler({ key: 'Escape' } as KeyboardEvent);
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
    expect(m.isOpen()).toBe(false);
  });

  it('Enter キーで confirm される', () => {
    const m = new Modal(scene, 0, 0);
    m.create();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    m.show(onConfirm, onCancel);

    const keyboardOn = (
      scene as unknown as { input: { keyboard: { on: ReturnType<typeof vi.fn> } } }
    ).input.keyboard.on;
    const handler = keyboardOn.mock.calls[0]?.[1] as (e: KeyboardEvent) => void;
    handler({ key: 'Enter' } as KeyboardEvent);

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('confirm/cancel/destroy で keyboard.off が呼ばれる', () => {
    const m = new Modal(scene, 0, 0);
    m.create();
    m.show();
    m.confirm();
    const keyboardOff = (
      scene as unknown as {
        input: { keyboard: { off: ReturnType<typeof vi.fn> } };
      }
    ).input.keyboard.off;
    expect(keyboardOff).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});
