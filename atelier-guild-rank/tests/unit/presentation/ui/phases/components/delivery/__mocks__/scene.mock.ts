/**
 * Phaserシーンモック定義
 * TASK-0057 DeliveryPhaseUIリファクタリング
 *
 * @description
 * DeliveryPhaseUIコンポーネントテストで使用するPhaserシーンのモック
 */

import { vi } from 'vitest';

// =============================================================================
// モックインターフェース定義
// =============================================================================

/**
 * モックコンテナインターフェース
 */
export interface MockContainer {
  setVisible: ReturnType<typeof vi.fn>;
  setPosition: ReturnType<typeof vi.fn>;
  setDepth: ReturnType<typeof vi.fn>;
  setAlpha: ReturnType<typeof vi.fn>;
  add: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
  x: number;
  y: number;
  visible: boolean;
}

/**
 * モックテキストインターフェース
 */
export interface MockText {
  setText: ReturnType<typeof vi.fn>;
  setOrigin: ReturnType<typeof vi.fn>;
  setStyle: ReturnType<typeof vi.fn>;
  setColor: ReturnType<typeof vi.fn>;
  setInteractive: ReturnType<typeof vi.fn>;
  on: ReturnType<typeof vi.fn>;
  off: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
  text: string;
}

/**
 * モック矩形インターフェース
 */
export interface MockRectangle {
  setStrokeStyle: ReturnType<typeof vi.fn>;
  setFillStyle: ReturnType<typeof vi.fn>;
  setInteractive: ReturnType<typeof vi.fn>;
  setAlpha: ReturnType<typeof vi.fn>;
  on: ReturnType<typeof vi.fn>;
  off: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
}

/**
 * モックグラフィックスインターフェース
 */
export interface MockGraphics {
  fillStyle: ReturnType<typeof vi.fn>;
  fillRoundedRect: ReturnType<typeof vi.fn>;
  lineStyle: ReturnType<typeof vi.fn>;
  strokeRoundedRect: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
}

// =============================================================================
// モックファクトリ関数
// =============================================================================

/**
 * モックコンテナを作成
 */
export const createMockContainer = (): MockContainer => ({
  setVisible: vi.fn().mockReturnThis(),
  setPosition: vi.fn().mockReturnThis(),
  setDepth: vi.fn().mockReturnThis(),
  setAlpha: vi.fn().mockReturnThis(),
  add: vi.fn().mockReturnThis(),
  destroy: vi.fn(),
  x: 0,
  y: 0,
  visible: true,
});

/**
 * モックテキストを作成
 */
export const createMockText = (): MockText => ({
  setText: vi.fn().mockReturnThis(),
  setOrigin: vi.fn().mockReturnThis(),
  setStyle: vi.fn().mockReturnThis(),
  setColor: vi.fn().mockReturnThis(),
  setInteractive: vi.fn().mockReturnThis(),
  on: vi.fn().mockReturnThis(),
  off: vi.fn().mockReturnThis(),
  destroy: vi.fn(),
  text: '',
});

/**
 * モック矩形を作成
 */
export const createMockRectangle = (): MockRectangle => ({
  setStrokeStyle: vi.fn().mockReturnThis(),
  setFillStyle: vi.fn().mockReturnThis(),
  setInteractive: vi.fn().mockReturnThis(),
  setAlpha: vi.fn().mockReturnThis(),
  on: vi.fn().mockReturnThis(),
  off: vi.fn().mockReturnThis(),
  destroy: vi.fn(),
});

/**
 * モックグラフィックスを作成
 */
export const createMockGraphics = (): MockGraphics => ({
  fillStyle: vi.fn().mockReturnThis(),
  fillRoundedRect: vi.fn().mockReturnThis(),
  lineStyle: vi.fn().mockReturnThis(),
  strokeRoundedRect: vi.fn().mockReturnThis(),
  destroy: vi.fn(),
});

/**
 * Phaserシーンモックを作成
 */
export const createMockScene = () => {
  const mockContainer = createMockContainer();
  const mockText = createMockText();
  const mockRectangle = createMockRectangle();
  const mockGraphics = createMockGraphics();

  const scene = {
    add: {
      container: vi.fn().mockReturnValue(mockContainer),
      text: vi.fn().mockReturnValue(mockText),
      rectangle: vi.fn().mockReturnValue(mockRectangle),
      graphics: vi.fn().mockReturnValue(mockGraphics),
    },
    tweens: {
      add: vi.fn().mockReturnValue({ remove: vi.fn() }),
    },
    input: {
      keyboard: {
        on: vi.fn(),
        off: vi.fn(),
      },
    },
    data: {
      get: vi.fn(),
      set: vi.fn(),
    },
    cameras: {
      main: {
        centerX: 640,
        centerY: 360,
        width: 1280,
        height: 720,
      },
    },
  } as unknown as Phaser.Scene;

  return {
    scene,
    mockContainer,
    mockText,
    mockRectangle,
    mockGraphics,
  };
};
