/**
 * Phaserモック共通定義
 * Issue #313: テストモック共通化
 *
 * @description
 * テストファイル間で重複していたPhaserシーン関連のモックを共通化する。
 * createMockScene, createMockEventBus, createMockStateManager等の
 * ファクトリ関数を提供し、テストの保守性を向上させる。
 *
 * 使用方法:
 *   import { createMockScene, createMockEventBus } from '../../mocks/phaser-mocks';
 *   // または vitest.config.ts の alias を利用:
 *   import { createMockScene, createMockEventBus } from '@test-mocks/phaser-mocks';
 */

import type { IEventBus } from '@shared/services/event-bus';
import type { IGameFlowManager } from '@shared/services/game-flow/game-flow-manager.interface';
import type { IStateManager } from '@shared/services/state-manager';
import type { IGameState } from '@shared/types';
import { GamePhase, GuildRank } from '@shared/types/common';
import type Phaser from 'phaser';
import { vi } from 'vitest';

// =============================================================================
// 型定義
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

// =============================================================================
// Phaser GameObjectモックファクトリ
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

// =============================================================================
// Phaserシーンモックファクトリ
// =============================================================================

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

// =============================================================================
// サービスモックファクトリ
// =============================================================================

/**
 * EventBusモックを作成（リスナー管理付き）
 *
 * 実際のEventBusと同様に、emit時にBusEvent形式でラップしてリスナーに配信する。
 * テストでイベント駆動の連携を検証するために使用する。
 */
export const createMockEventBus = (): MockEventBusWithListeners => {
  const listeners = new Map<string, Array<(...args: unknown[]) => void>>();
  return {
    emit: vi.fn().mockImplementation((type: string, payload: unknown) => {
      const busEvent = {
        type,
        payload,
        timestamp: Date.now(),
      };
      const handlers = listeners.get(type) || [];
      for (const handler of handlers) {
        handler(busEvent);
      }
    }),
    on: vi.fn().mockImplementation((event: string, handler: (...args: unknown[]) => void) => {
      const existing = listeners.get(event) || [];
      existing.push(handler);
      listeners.set(event, existing);
      return () => {
        const index = existing.indexOf(handler);
        if (index > -1) {
          existing.splice(index, 1);
        }
      };
    }),
    off: vi.fn(),
    once: vi.fn(),
    listeners,
  };
};

/**
 * EventBusモックを作成（シンプル版）
 *
 * リスナー管理不要な場合に使用する軽量版。
 * サービステスト等でイベント発行の検証のみ行う場合に適している。
 */
export const createMockEventBusSimple = (): IEventBus =>
  ({
    emit: vi.fn(),
    on: vi.fn().mockReturnValue(vi.fn()),
    off: vi.fn(),
    once: vi.fn(),
  }) as unknown as IEventBus;

/**
 * StateManagerモックを作成
 *
 * @param stateOverrides - デフォルトの状態を部分的に上書きする
 */
export const createMockStateManager = (
  stateOverrides?: Partial<IGameState>,
): Partial<IStateManager> => ({
  getState: vi.fn().mockReturnValue({
    currentRank: GuildRank.E,
    promotionGauge: 35,
    remainingDays: 25,
    currentDay: 6,
    currentPhase: GamePhase.QUEST_ACCEPT,
    gold: 500,
    actionPoints: 3,
    maxActionPoints: 3,
    comboCount: 0,
    rankHp: 100,
    isPromotionTest: false,
    contribution: 0,
    apOverflow: 0,
    questBoard: {
      boardQuests: [],
      visitorQuests: [],
      lastVisitorUpdateDay: 0,
    },
    ...stateOverrides,
  } as IGameState),
  updateState: vi.fn(),
  setPhase: vi.fn(),
  canTransitionTo: vi.fn().mockReturnValue(true),
  addGold: vi.fn(),
  spendGold: vi.fn().mockReturnValue(true),
  spendActionPoints: vi.fn().mockReturnValue(true),
  addContribution: vi.fn(),
  advanceDay: vi.fn(),
  initialize: vi.fn(),
  reset: vi.fn(),
});

/**
 * GameFlowManagerモックを作成
 */
export const createMockGameFlowManager = (): Partial<IGameFlowManager> => ({
  getCurrentPhase: vi.fn().mockReturnValue(GamePhase.QUEST_ACCEPT),
  canAdvancePhase: vi.fn().mockReturnValue(true),
  startPhase: vi.fn(),
  endPhase: vi.fn(),
  startNewGame: vi.fn(),
  continueGame: vi.fn(),
  startDay: vi.fn(),
  endDay: vi.fn(),
  skipPhase: vi.fn(),
  requestEndDay: vi.fn(),
  rest: vi.fn(),
  switchPhase: vi.fn().mockResolvedValue({
    success: true,
    previousPhase: GamePhase.QUEST_ACCEPT,
    newPhase: GamePhase.ALCHEMY,
  }),
  checkGameOver: vi.fn().mockReturnValue(null),
  checkGameClear: vi.fn().mockReturnValue(null),
});

// =============================================================================
// DIコンテナモックファクトリ
// =============================================================================

/**
 * DIコンテナ（Container）モックを作成
 *
 * @param services - サービスキーとモックインスタンスのマッピング
 */
export const createMockDIContainer = (
  services: Record<string, unknown>,
): {
  resolve: ReturnType<typeof vi.fn>;
  register: ReturnType<typeof vi.fn>;
  has: ReturnType<typeof vi.fn>;
} => ({
  resolve: vi.fn((key: string) => {
    if (key in services) return services[key];
    throw new Error(`Service not found: ${key}`);
  }),
  register: vi.fn(),
  has: vi.fn((key: string) => key in services),
});
