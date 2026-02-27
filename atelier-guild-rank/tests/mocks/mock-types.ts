/**
 * Phaserモック型定義
 * Issue #313: テストモック共通化
 *
 * @description
 * テスト用モックの型定義を集約する。
 * phaser-mocks.ts から分割された型定義モジュール。
 */

import type { vi } from 'vitest';

// =============================================================================
// GameObjectモック型
// =============================================================================

/**
 * モックコンテナの型
 */
export interface MockPhaserContainer {
  setVisible: ReturnType<typeof vi.fn>;
  setPosition: ReturnType<typeof vi.fn>;
  setDepth: ReturnType<typeof vi.fn>;
  setAlpha: ReturnType<typeof vi.fn>;
  setInteractive: ReturnType<typeof vi.fn>;
  on: ReturnType<typeof vi.fn>;
  off: ReturnType<typeof vi.fn>;
  add: ReturnType<typeof vi.fn>;
  removeAll: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
  bringToTop: ReturnType<typeof vi.fn>;
  name: string;
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  visible: boolean;
}

/**
 * モックテキストの型
 */
export interface MockPhaserText {
  setText: ReturnType<typeof vi.fn>;
  setOrigin: ReturnType<typeof vi.fn>;
  setStyle: ReturnType<typeof vi.fn>;
  setColor: ReturnType<typeof vi.fn>;
  setFontSize: ReturnType<typeof vi.fn>;
  setAlpha: ReturnType<typeof vi.fn>;
  setVisible: ReturnType<typeof vi.fn>;
  setPosition: ReturnType<typeof vi.fn>;
  setInteractive: ReturnType<typeof vi.fn>;
  setWordWrapWidth: ReturnType<typeof vi.fn>;
  on: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
  text: string;
}

/**
 * モックグラフィックスの型
 */
export interface MockPhaserGraphics {
  fillStyle: ReturnType<typeof vi.fn>;
  fillRect: ReturnType<typeof vi.fn>;
  fillRoundedRect: ReturnType<typeof vi.fn>;
  clear: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
  lineStyle: ReturnType<typeof vi.fn>;
  strokeRoundedRect: ReturnType<typeof vi.fn>;
  beginPath: ReturnType<typeof vi.fn>;
  moveTo: ReturnType<typeof vi.fn>;
  lineTo: ReturnType<typeof vi.fn>;
  stroke: ReturnType<typeof vi.fn>;
  strokePath: ReturnType<typeof vi.fn>;
}

/**
 * モック矩形の型
 */
export interface MockPhaserRectangle {
  setFillStyle: ReturnType<typeof vi.fn>;
  setStrokeStyle: ReturnType<typeof vi.fn>;
  setOrigin: ReturnType<typeof vi.fn>;
  setInteractive: ReturnType<typeof vi.fn>;
  disableInteractive: ReturnType<typeof vi.fn>;
  setAlpha: ReturnType<typeof vi.fn>;
  setDepth: ReturnType<typeof vi.fn>;
  on: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
}

/**
 * モック円の型
 */
export interface MockPhaserCircle {
  setFillStyle: ReturnType<typeof vi.fn>;
  setStrokeStyle: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
}

/**
 * モックカメラの型
 */
export interface MockPhaserCamera {
  fadeIn: ReturnType<typeof vi.fn>;
  fadeOut: ReturnType<typeof vi.fn>;
  once: ReturnType<typeof vi.fn>;
  centerX: number;
  centerY: number;
  width: number;
  height: number;
}

/**
 * モックrexUIの型
 */
export interface MockRexUI {
  add: {
    sizer: ReturnType<typeof vi.fn>;
    label: ReturnType<typeof vi.fn>;
    roundRectangle: ReturnType<typeof vi.fn>;
    scrollablePanel: ReturnType<typeof vi.fn>;
    dialog: ReturnType<typeof vi.fn>;
  };
}

/**
 * モックデータの型
 */
export interface MockSceneData {
  get: ReturnType<typeof vi.fn>;
  set: ReturnType<typeof vi.fn>;
}

// =============================================================================
// ファクトリ戻り値型
// =============================================================================

/**
 * createMockSceneの戻り値型
 */
export interface MockSceneResult {
  scene: Phaser.Scene;
  mockContainer: MockPhaserContainer;
  mockText: MockPhaserText;
  mockGraphics: MockPhaserGraphics;
  mockRectangle: MockPhaserRectangle;
  mockCamera: MockPhaserCamera;
  mockRexUI: MockRexUI;
  mockData: MockSceneData;
}

/**
 * createMockEventBusの戻り値型（リスナー管理付き）
 */
export interface MockEventBusWithListeners {
  emit: ReturnType<typeof vi.fn>;
  on: ReturnType<typeof vi.fn>;
  off: ReturnType<typeof vi.fn>;
  once: ReturnType<typeof vi.fn>;
  listeners: Map<string, Array<(...args: unknown[]) => void>>;
}
