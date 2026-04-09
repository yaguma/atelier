/**
 * Test helpers for primitive/composite component tests (Issue #456)
 * 共有モックを薄く拡張し、setSize / time.delayedCall などの追加メソッドを補う。
 */

import { createMockScene } from '@test-mocks/phaser-mocks';
import type Phaser from 'phaser';
import { vi } from 'vitest';

export function createComponentMockScene(): Phaser.Scene {
  const { scene } = createMockScene();
  const sceneAny = scene as unknown as {
    add: {
      rectangle: ReturnType<typeof vi.fn>;
      text: ReturnType<typeof vi.fn>;
    };
    time: { delayedCall: ReturnType<typeof vi.fn> };
    children: { remove: ReturnType<typeof vi.fn> };
  };

  // setSize 等を持つ rectangle モックに差し替え
  sceneAny.add.rectangle = vi.fn().mockImplementation(() => ({
    setFillStyle: vi.fn().mockReturnThis(),
    setStrokeStyle: vi.fn().mockReturnThis(),
    setOrigin: vi.fn().mockReturnThis(),
    setInteractive: vi.fn().mockReturnThis(),
    setSize: vi.fn().mockReturnThis(),
    setAlpha: vi.fn().mockReturnThis(),
    setDepth: vi.fn().mockReturnThis(),
    setVisible: vi.fn().mockReturnThis(),
    setName: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    off: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
  }));

  // text モックに width/height/setColor を追加
  sceneAny.add.text = vi.fn().mockImplementation((_x: number, _y: number, value: string) => {
    let current = value ?? '';
    const obj: Record<string, unknown> = {};
    obj.setText = vi.fn().mockImplementation((next: string) => {
      current = next;
      return obj;
    });
    Object.assign(obj, {
      setOrigin: vi.fn().mockReturnThis(),
      setStyle: vi.fn().mockReturnThis(),
      setColor: vi.fn().mockReturnThis(),
      setFontSize: vi.fn().mockReturnThis(),
      setAlpha: vi.fn().mockReturnThis(),
      setVisible: vi.fn().mockReturnThis(),
      setPosition: vi.fn().mockReturnThis(),
      setInteractive: vi.fn().mockReturnThis(),
      setWordWrapWidth: vi.fn().mockReturnThis(),
      setName: vi.fn().mockReturnThis(),
      setDepth: vi.fn().mockReturnThis(),
      on: vi.fn().mockReturnThis(),
      destroy: vi.fn(),
      get text() {
        return current;
      },
      width: 80,
      height: 16,
    });
    Object.defineProperty(obj, 'text', { get: () => current });
    return obj;
  });

  sceneAny.time = {
    delayedCall: vi.fn().mockReturnValue({ remove: vi.fn() }),
  };
  sceneAny.children = { remove: vi.fn() };

  // tweens.add の戻り値に stop を持たせる（共有モックは remove のみ）
  (scene as unknown as { tweens: { add: ReturnType<typeof vi.fn> } }).tweens.add = vi
    .fn()
    .mockReturnValue({ stop: vi.fn(), remove: vi.fn() });

  return scene;
}
