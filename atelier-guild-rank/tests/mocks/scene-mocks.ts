/**
 * Phaserシーンモックファクトリ
 * Issue #313: テストモック共通化
 *
 * @description
 * Phaserシーンの標準的なモックを作成するファクトリ関数を提供する。
 * シーン内のadd, make, cameras, rexUI, tweens, scene, data, inputを含む。
 */

import type Phaser from 'phaser';
import { vi } from 'vitest';
import {
  createMockCircle,
  createMockContainer,
  createMockGraphics,
  createMockRectangle,
  createMockRexUI,
  createMockText,
} from './game-object-mocks';
import type { MockPhaserCamera, MockSceneData, MockSceneResult } from './mock-types';

/**
 * Phaserシーンのモックを作成
 *
 * シーン内のadd, make, cameras, rexUI, tweens, scene, data, inputを含む
 * 標準的なシーンモックを返す。
 *
 * @param options.dataGetHandler - scene.data.getのカスタム実装（DIコンテナ経由のサービス解決等）
 */
export const createMockScene = (options?: {
  dataGetHandler?: (key: string) => unknown;
}): MockSceneResult => {
  const mockContainer = createMockContainer();
  const mockText = createMockText();
  const mockGraphics = createMockGraphics();
  const mockRexUI = createMockRexUI();

  const mockData: MockSceneData = {
    get: vi.fn().mockImplementation(options?.dataGetHandler ?? (() => null)),
    set: vi.fn(),
  };

  const mockRectangle = createMockRectangle();

  const mockCamera: MockPhaserCamera = {
    fadeIn: vi.fn(),
    fadeOut: vi.fn(),
    once: vi.fn().mockImplementation((event: string, callback: () => void) => {
      if (event === 'camerafadeoutcomplete') {
        setTimeout(callback, 0);
      }
    }),
    centerX: 640,
    centerY: 360,
    width: 1280,
    height: 720,
  };

  const scene = {
    add: {
      container: vi.fn().mockImplementation((x: number, y: number) => {
        mockContainer.x = x;
        mockContainer.y = y;
        return mockContainer;
      }),
      text: vi.fn().mockReturnValue(mockText),
      graphics: vi.fn().mockReturnValue(mockGraphics),
      rectangle: vi.fn().mockReturnValue(mockRectangle),
      circle: vi.fn().mockReturnValue(createMockCircle()),
    },
    make: {
      text: vi.fn().mockReturnValue(mockText),
      container: vi.fn().mockImplementation((config: { x?: number; y?: number; add?: boolean }) => {
        mockContainer.x = config?.x ?? 0;
        mockContainer.y = config?.y ?? 0;
        return mockContainer;
      }),
    },
    cameras: {
      main: mockCamera,
    },
    scale: {
      width: 1280,
      height: 720,
    },
    data: mockData,
    input: {
      keyboard: {
        on: vi.fn(),
        off: vi.fn(),
      },
    },
    rexUI: mockRexUI,
    tweens: {
      add: vi.fn().mockImplementation((config: { onComplete?: () => void }) => {
        if (config.onComplete) {
          config.onComplete();
        }
        return { remove: vi.fn() };
      }),
      killTweensOf: vi.fn(),
    },
    scene: {
      start: vi.fn(),
    },
  } as unknown as Phaser.Scene;

  return {
    scene,
    mockContainer,
    mockText,
    mockGraphics,
    mockRectangle,
    mockCamera,
    mockRexUI,
    mockData,
  };
};
