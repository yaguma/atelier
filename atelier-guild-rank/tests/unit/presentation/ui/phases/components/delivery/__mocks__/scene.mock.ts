/**
 * Phaserシーンモック定義
 * TASK-0057 DeliveryPhaseUIリファクタリング
 *
 * @description
 * DeliveryPhaseUIコンポーネントテストで使用するPhaserシーンのモック。
 * 共通モック（@test-mocks/phaser-mocks）の低レベルファクトリを利用しつつ、
 * delivery固有のシーン構造（単一mockRectangle参照等）を維持する。
 *
 * Issue #313: テストモック共通化
 */

import {
  createMockContainer as createMockContainerBase,
  createMockGraphics as createMockGraphicsBase,
  createMockRectangle as createMockRectangleBase,
  createMockText as createMockTextBase,
  type MockPhaserContainer,
  type MockPhaserGraphics,
  type MockPhaserRectangle,
  type MockPhaserText,
} from '@test-mocks/phaser-mocks';
import { vi } from 'vitest';

// =============================================================================
// 型の再エクスポート（既存テストとの互換性維持）
// =============================================================================

export type MockContainer = MockPhaserContainer;
export type MockText = MockPhaserText;
export type MockRectangle = MockPhaserRectangle;
export type MockGraphics = MockPhaserGraphics;

// =============================================================================
// ファクトリ関数の再エクスポート
// =============================================================================

export const createMockContainer = createMockContainerBase;
export const createMockText = createMockTextBase;
export const createMockRectangle = createMockRectangleBase;
export const createMockGraphics = createMockGraphicsBase;

/**
 * Phaserシーンモックを作成（delivery固有の戻り値形式）
 *
 * 既存のdeliveryテストとの互換性を維持するため、
 * 単一のmockRectangle参照を含む戻り値形式を提供する。
 * (deliveryテストはmockRectangle.on.mock.callsで直接イベント検証を行う)
 */
export const createMockScene = () => {
  const mockContainer = createMockContainerBase();
  const mockText = createMockTextBase();
  const mockRectangle = createMockRectangleBase();
  const mockGraphics = createMockGraphicsBase();

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
