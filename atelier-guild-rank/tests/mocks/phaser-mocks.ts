/**
 * Phaserモック共通定義 - バレルエクスポート
 * Issue #313: テストモック共通化
 *
 * @description
 * テストファイル間で重複していたPhaserシーン関連のモックを共通化する。
 * 各モジュールから型・ファクトリ関数を集約して再エクスポートする。
 *
 * 使用方法:
 *   import { createMockScene, createMockEventBus } from '../../mocks/phaser-mocks';
 *   // または vitest.config.ts の alias を利用:
 *   import { createMockScene, createMockEventBus } from '@test-mocks/phaser-mocks';
 */

// GameObjectモックファクトリ
export {
  createMockCircle,
  createMockContainer,
  createMockGraphics,
  createMockRectangle,
  createMockRexUI,
  createMockText,
} from './game-object-mocks';
// 型定義
export type {
  MockEventBusWithListeners,
  MockPhaserCamera,
  MockPhaserCircle,
  MockPhaserContainer,
  MockPhaserGraphics,
  MockPhaserRectangle,
  MockPhaserText,
  MockRexUI,
  MockSceneData,
  MockSceneResult,
} from './mock-types';

// シーンモックファクトリ
export { createMockScene } from './scene-mocks';

// サービス・DIコンテナモックファクトリ
export {
  createMockDIContainer,
  createMockEventBus,
  createMockEventBusSimple,
  createMockGameFlowManager,
  createMockStateManager,
} from './service-mocks';
