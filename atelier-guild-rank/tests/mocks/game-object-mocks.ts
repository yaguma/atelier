/**
 * Phaser GameObjectモックファクトリ
 * Issue #313: テストモック共通化
 *
 * @description
 * Phaserの各GameObject（Container, Text, Graphics, Rectangle, Circle, RexUI）の
 * モックファクトリ関数を提供する。
 */

import { vi } from 'vitest';
import type {
  MockPhaserCircle,
  MockPhaserContainer,
  MockPhaserGraphics,
  MockPhaserRectangle,
  MockPhaserText,
  MockRexUI,
} from './mock-types';

// =============================================================================
// 基本GameObjectモック
// =============================================================================

/**
 * Phaserコンテナのモックを作成
 */
export const createMockContainer = (): MockPhaserContainer => ({
  setVisible: vi.fn().mockReturnThis(),
  setPosition: vi.fn().mockReturnThis(),
  setDepth: vi.fn().mockReturnThis(),
  setAlpha: vi.fn().mockReturnThis(),
  setInteractive: vi.fn().mockReturnThis(),
  on: vi.fn().mockReturnThis(),
  off: vi.fn().mockReturnThis(),
  add: vi.fn().mockReturnThis(),
  removeAll: vi.fn().mockReturnThis(),
  destroy: vi.fn(),
  bringToTop: vi.fn().mockReturnThis(),
  name: '',
  x: 0,
  y: 0,
  scaleX: 1,
  scaleY: 1,
  visible: true,
});

/**
 * Phaserテキストのモックを作成
 */
export const createMockText = (): MockPhaserText => ({
  setText: vi.fn().mockReturnThis(),
  setOrigin: vi.fn().mockReturnThis(),
  setStyle: vi.fn().mockReturnThis(),
  setColor: vi.fn().mockReturnThis(),
  setFontSize: vi.fn().mockReturnThis(),
  setAlpha: vi.fn().mockReturnThis(),
  setVisible: vi.fn().mockReturnThis(),
  setPosition: vi.fn().mockReturnThis(),
  setInteractive: vi.fn().mockReturnThis(),
  setWordWrapWidth: vi.fn().mockReturnThis(),
  on: vi.fn().mockReturnThis(),
  destroy: vi.fn(),
  text: '',
});

/**
 * Phaserグラフィックスのモックを作成
 */
export const createMockGraphics = (): MockPhaserGraphics => ({
  fillStyle: vi.fn().mockReturnThis(),
  fillRect: vi.fn().mockReturnThis(),
  fillRoundedRect: vi.fn().mockReturnThis(),
  clear: vi.fn().mockReturnThis(),
  destroy: vi.fn(),
  lineStyle: vi.fn().mockReturnThis(),
  strokeRoundedRect: vi.fn().mockReturnThis(),
  beginPath: vi.fn().mockReturnThis(),
  moveTo: vi.fn().mockReturnThis(),
  lineTo: vi.fn().mockReturnThis(),
  stroke: vi.fn().mockReturnThis(),
  strokePath: vi.fn().mockReturnThis(),
});

/**
 * Phaser矩形のモックを作成
 */
export const createMockRectangle = (): MockPhaserRectangle => ({
  setFillStyle: vi.fn().mockReturnThis(),
  setStrokeStyle: vi.fn().mockReturnThis(),
  setOrigin: vi.fn().mockReturnThis(),
  setInteractive: vi.fn().mockReturnThis(),
  disableInteractive: vi.fn().mockReturnThis(),
  setAlpha: vi.fn().mockReturnThis(),
  setDepth: vi.fn().mockReturnThis(),
  on: vi.fn().mockReturnThis(),
  destroy: vi.fn(),
});

/**
 * Phaser円のモックを作成
 */
export const createMockCircle = (): MockPhaserCircle => ({
  setFillStyle: vi.fn().mockReturnThis(),
  setStrokeStyle: vi.fn().mockReturnThis(),
  destroy: vi.fn(),
});

// =============================================================================
// rexUIプラグインモック
// =============================================================================

/**
 * rexUIプラグインのモックを作成
 */
export const createMockRexUI = (): MockRexUI => ({
  add: {
    sizer: vi.fn().mockReturnValue({
      layout: vi.fn(),
      add: vi.fn().mockReturnThis(),
      destroy: vi.fn(),
    }),
    label: vi.fn().mockReturnValue({
      layout: vi.fn(),
      setInteractive: vi.fn().mockReturnThis(),
      disableInteractive: vi.fn().mockReturnThis(),
      removeInteractive: vi.fn().mockReturnThis(),
      on: vi.fn().mockReturnThis(),
      destroy: vi.fn(),
      setText: vi.fn().mockReturnThis(),
      setAlpha: vi.fn().mockReturnThis(),
      setVisible: vi.fn().mockReturnThis(),
    }),
    roundRectangle: vi.fn().mockReturnValue({
      setFillStyle: vi.fn().mockReturnThis(),
      setStrokeStyle: vi.fn().mockReturnThis(),
      setInteractive: vi.fn().mockReturnThis(),
      on: vi.fn().mockReturnThis(),
      destroy: vi.fn(),
    }),
    scrollablePanel: vi.fn().mockReturnValue({
      layout: vi.fn(),
      destroy: vi.fn(),
      setInteractive: vi.fn().mockReturnThis(),
      on: vi.fn().mockReturnThis(),
      setChildrenInteractive: vi.fn().mockReturnThis(),
    }),
    dialog: vi.fn().mockReturnValue({
      layout: vi.fn().mockReturnThis(),
      setInteractive: vi.fn().mockReturnThis(),
      on: vi.fn().mockReturnThis(),
      destroy: vi.fn(),
      setDepth: vi.fn().mockReturnThis(),
      popUp: vi.fn().mockReturnThis(),
    }),
  },
});
