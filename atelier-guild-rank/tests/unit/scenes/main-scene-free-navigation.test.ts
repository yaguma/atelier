/**
 * MainScene自由遷移テスト
 * TASK-0116: MainScene変更
 *
 * @description
 * MainSceneのタブ切り替え連携・自由遷移対応を検証する。
 * _completedPhasesの廃止、showPhase()の自由遷移対応、PhaseTabUI連携を確認。
 *
 * @信頼性レベル 🔵 REQ-001・architecture.md・既存MainScene実装より
 */

import { GamePhase, GuildRank } from '@shared/types/common';
import { GameEventType } from '@shared/types/events';
import type Phaser from 'phaser';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// =============================================================================
// モック定義
// =============================================================================

vi.mock('phaser', () => {
  return {
    default: {
      Scene: class MockScene {},
      GameObjects: {
        Container: class MockContainer {},
        Graphics: class MockGraphics {},
        Text: class MockText {},
        Rectangle: class MockRectangle {},
      },
    },
  };
});

// biome-ignore lint/suspicious/noExplicitAny: テスト用モック変数
let mockStateManagerInstance: any;
// biome-ignore lint/suspicious/noExplicitAny: テスト用モック変数
let mockGameFlowManagerInstance: any;
// biome-ignore lint/suspicious/noExplicitAny: テスト用モック変数
let mockEventBusInstance: any;
// biome-ignore lint/suspicious/noExplicitAny: テスト用モック変数
let mockQuestServiceInstance: any;

const mockContainerInstance = {
  resolve: vi.fn((key: string) => {
    if (key === 'StateManager') return mockStateManagerInstance;
    if (key === 'GameFlowManager') return mockGameFlowManagerInstance;
    if (key === 'EventBus') return mockEventBusInstance;
    if (key === 'QuestService') return mockQuestServiceInstance;
    throw new Error(`Service not found: ${key}`);
  }),
  register: vi.fn(),
  has: vi.fn((key: string) => {
    return ['StateManager', 'GameFlowManager', 'EventBus', 'QuestService'].includes(key);
  }),
};

vi.mock('@shared/services/di/container', () => ({
  Container: {
    getInstance: vi.fn(() => mockContainerInstance),
  },
  ServiceKeys: {
    StateManager: 'StateManager',
    GameFlowManager: 'GameFlowManager',
    EventBus: 'EventBus',
    QuestService: 'QuestService',
    GatheringService: 'GatheringService',
    AlchemyService: 'AlchemyService',
    MasterDataRepository: 'MasterDataRepository',
  },
}));

vi.mock('@domain/entities/Quest', () => ({
  Quest: class MockQuest {},
}));

vi.mock('@domain/entities/Card', () => ({
  Card: class MockCard {},
}));

vi.mock('@presentation/ui/components/FooterUI', () => ({
  FooterUI: class MockFooterUI {
    create() {}
    destroy() {}
    getPhaseTabUI() {
      return null;
    }
  },
}));

vi.mock('@presentation/ui/components/HeaderUI', () => ({
  HeaderUI: class MockHeaderUI {
    create() {}
    update() {}
  },
}));

vi.mock('@presentation/ui/components/SidebarUI', () => ({
  SidebarUI: class MockSidebarUI {
    create() {}
    update() {}
    updateAcceptedQuests() {}
  },
}));

vi.mock('@presentation/ui/phases/AlchemyPhaseUI', () => ({
  AlchemyPhaseUI: class MockAlchemyPhaseUI {
    create() {}
    getContainer() {
      return {};
    }
    setVisible() {
      return this;
    }
    destroy() {}
  },
}));

vi.mock('@presentation/ui/phases/DeliveryPhaseUI', () => ({
  DeliveryPhaseUI: class MockDeliveryPhaseUI {
    getContainer() {
      return {};
    }
    setVisible() {
      return this;
    }
    destroy() {}
  },
}));

vi.mock('@presentation/ui/phases/GatheringPhaseUI', () => ({
  GatheringPhaseUI: class MockGatheringPhaseUI {
    create() {}
    getContainer() {
      return {};
    }
    setVisible() {
      return this;
    }
    destroy() {}
    updateSession() {}
  },
}));

vi.mock('@presentation/ui/phases/QuestAcceptPhaseUI', () => ({
  QuestAcceptPhaseUI: class MockQuestAcceptPhaseUI {
    getContainer() {
      return {};
    }
    setVisible() {
      return this;
    }
    destroy() {}
    updateQuests() {}
  },
}));

vi.mock('@shared/types/ids', () => ({
  toCardId: vi.fn((id: string) => id),
  toMaterialId: vi.fn((id: string) => id),
}));

vi.mock('@shared/utils', () => ({
  generateUniqueId: vi.fn(() => 'mock-id'),
}));

// =============================================================================
// モック作成ヘルパー
// =============================================================================

const createMockContainer = () => ({
  setVisible: vi.fn().mockReturnThis(),
  setPosition: vi.fn().mockReturnThis(),
  setDepth: vi.fn().mockReturnThis(),
  setAlpha: vi.fn().mockReturnThis(),
  add: vi.fn().mockReturnThis(),
  destroy: vi.fn(),
  bringToTop: vi.fn().mockReturnThis(),
  name: '',
  x: 0,
  y: 0,
  visible: true,
});

const createMockText = () => ({
  setText: vi.fn().mockReturnThis(),
  setOrigin: vi.fn().mockReturnThis(),
  setStyle: vi.fn().mockReturnThis(),
  setColor: vi.fn().mockReturnThis(),
  setFontSize: vi.fn().mockReturnThis(),
  destroy: vi.fn(),
  text: '',
});

const createMockScene = () => {
  const mockContainer = createMockContainer();
  const mockText = createMockText();

  const mockData = {
    get: vi.fn().mockImplementation((key: string) => {
      if (key === 'eventBus') return mockEventBusInstance;
      return null;
    }),
    set: vi.fn(),
  };

  return {
    scene: {
      add: {
        container: vi.fn().mockImplementation((x: number, y: number) => ({
          ...mockContainer,
          x,
          y,
        })),
        text: vi.fn().mockReturnValue(mockText),
        graphics: vi.fn().mockReturnValue({
          fillStyle: vi.fn().mockReturnThis(),
          fillRect: vi.fn().mockReturnThis(),
          clear: vi.fn().mockReturnThis(),
          destroy: vi.fn(),
        }),
        rectangle: vi.fn().mockReturnValue({
          setFillStyle: vi.fn().mockReturnThis(),
          setStrokeStyle: vi.fn().mockReturnThis(),
          setOrigin: vi.fn().mockReturnThis(),
          setInteractive: vi.fn().mockReturnThis(),
          disableInteractive: vi.fn().mockReturnThis(),
          setAlpha: vi.fn().mockReturnThis(),
          on: vi.fn().mockReturnThis(),
          destroy: vi.fn(),
        }),
        circle: vi.fn().mockReturnValue({
          setFillStyle: vi.fn().mockReturnThis(),
          setStrokeStyle: vi.fn().mockReturnThis(),
          destroy: vi.fn(),
        }),
      },
      make: {
        text: vi.fn().mockReturnValue({
          ...mockText,
          setOrigin: vi.fn().mockReturnThis(),
          setColor: vi.fn().mockReturnThis(),
          setAlpha: vi.fn().mockReturnThis(),
        }),
        container: vi
          .fn()
          .mockImplementation((config: { x?: number; y?: number; add?: boolean }) => ({
            ...mockContainer,
            x: config?.x ?? 0,
            y: config?.y ?? 0,
          })),
      },
      cameras: {
        main: { centerX: 640, centerY: 360, width: 1280, height: 720 },
      },
      data: mockData,
      input: {
        keyboard: { on: vi.fn(), off: vi.fn() },
      },
      rexUI: {
        add: {
          sizer: vi.fn().mockReturnValue({
            layout: vi.fn(),
            add: vi.fn().mockReturnThis(),
            destroy: vi.fn(),
          }),
          label: vi.fn().mockReturnValue({
            layout: vi.fn(),
            setInteractive: vi.fn().mockReturnThis(),
            on: vi.fn().mockReturnThis(),
            destroy: vi.fn(),
            setText: vi.fn().mockReturnThis(),
          }),
          roundRectangle: vi.fn().mockReturnValue({
            setFillStyle: vi.fn().mockReturnThis(),
            destroy: vi.fn(),
          }),
        },
      },
      tweens: {
        add: vi.fn().mockImplementation((config) => {
          if (config.onComplete) config.onComplete();
          return {};
        }),
        killTweensOf: vi.fn(),
      },
      scene: { start: vi.fn() },
    } as unknown as Phaser.Scene,
    mockContainer,
    mockText,
    mockData,
  };
};

const createMockStateManager = () => ({
  getState: vi.fn().mockReturnValue({
    currentRank: GuildRank.E,
    promotionGauge: 35,
    remainingDays: 25,
    currentDay: 6,
    currentPhase: GamePhase.QUEST_ACCEPT,
    gold: 500,
    actionPoints: 3,
    comboCount: 0,
    rankHp: 100,
    isPromotionTest: false,
  }),
  updateState: vi.fn(),
  setPhase: vi.fn(),
  canTransitionTo: vi.fn().mockReturnValue(true),
  addGold: vi.fn(),
  spendGold: vi.fn().mockReturnValue(true),
  addContribution: vi.fn(),
});

const createMockGameFlowManager = () => ({
  getCurrentPhase: vi.fn().mockReturnValue(GamePhase.QUEST_ACCEPT),
  canAdvancePhase: vi.fn().mockReturnValue(true),
  startPhase: vi.fn(),
  endPhase: vi.fn(),
  startNewGame: vi.fn(),
  continueGame: vi.fn(),
  startDay: vi.fn(),
  endDay: vi.fn(),
  skipPhase: vi.fn(),
});

const createMockEventBus = () => {
  const listeners = new Map<string, Array<(...args: unknown[]) => void>>();
  return {
    emit: vi.fn().mockImplementation((type: string, payload: unknown) => {
      const busEvent = { type, payload, timestamp: Date.now() };
      const handlers = listeners.get(type) || [];
      for (const handler of handlers) {
        handler(busEvent);
      }
    }),
    on: vi.fn().mockImplementation((event: string, handler: (...args: unknown[]) => void) => {
      const existing = listeners.get(event) || [];
      existing.push(handler);
      listeners.set(event, existing);
    }),
    off: vi.fn(),
  };
};

function setupMainScene() {
  const { scene: mockScene } = createMockScene();
  const mockStateManager = createMockStateManager();
  const mockGameFlowManager = createMockGameFlowManager();
  const mockEventBus = createMockEventBus();
  const mockQuestService = {
    getActiveQuests: vi.fn(() => []),
    getAvailableQuests: vi.fn(() => []),
  };

  mockStateManagerInstance = mockStateManager;
  mockGameFlowManagerInstance = mockGameFlowManager;
  mockEventBusInstance = mockEventBus;
  mockQuestServiceInstance = mockQuestService;

  return { mockScene, mockStateManager, mockGameFlowManager, mockEventBus };
}

// =============================================================================
// テスト
// =============================================================================

describe('MainScene自由遷移（TASK-0116）', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================================================
  // テストケース1: 任意のフェーズへの表示切り替え
  // ===========================================================================

  describe('任意のフェーズへの表示切り替え', () => {
    it('T-0116-01: showPhase(DELIVERY)でDELIVERYフェーズUIが表示される', async () => {
      // 【テスト目的】: QUEST_ACCEPTからDELIVERYへ直接切り替えできることを確認
      // 🔵 REQ-001「自由遷移」

      const { mockScene } = setupMainScene();
      const { MainScene } = await import('@scenes/MainScene');
      const mainScene = new MainScene();

      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      mainScene.add = mockScene.add;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      mainScene.make = mockScene.make;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      mainScene.cameras = mockScene.cameras;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      mainScene.rexUI = mockScene.rexUI;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      mainScene.data = mockScene.data;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      mainScene.input = mockScene.input;

      mainScene.create();

      // 初期状態はQUEST_ACCEPT
      expect(mainScene.isPhaseUIVisible(GamePhase.QUEST_ACCEPT)).toBe(true);

      // DELIVERY直接遷移
      // @ts-expect-error - テストのためにprotectedメソッドにアクセス
      mainScene.showPhase(GamePhase.DELIVERY);

      expect(mainScene.isPhaseUIVisible(GamePhase.DELIVERY)).toBe(true);
      expect(mainScene.isPhaseUIVisible(GamePhase.QUEST_ACCEPT)).toBe(false);
    });

    it('QUEST_ACCEPTからGATHERINGへ直接切り替えできる', async () => {
      const { mockScene } = setupMainScene();
      const { MainScene } = await import('@scenes/MainScene');
      const mainScene = new MainScene();

      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      mainScene.add = mockScene.add;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      mainScene.make = mockScene.make;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      mainScene.cameras = mockScene.cameras;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      mainScene.rexUI = mockScene.rexUI;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      mainScene.data = mockScene.data;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      mainScene.input = mockScene.input;

      mainScene.create();

      // @ts-expect-error - テストのためにprotectedメソッドにアクセス
      mainScene.showPhase(GamePhase.GATHERING);

      expect(mainScene.isPhaseUIVisible(GamePhase.GATHERING)).toBe(true);
      expect(mainScene.isPhaseUIVisible(GamePhase.QUEST_ACCEPT)).toBe(false);
    });
  });

  // ===========================================================================
  // テストケース2: PHASE_CHANGEDイベントで表示更新
  // ===========================================================================

  describe('PHASE_CHANGEDイベントで表示更新', () => {
    it('T-0116-02: PHASE_CHANGEDイベントで対応フェーズUIに切り替わる', async () => {
      // 【テスト目的】: PHASE_CHANGEDイベント発行でフェーズUIが更新されることを確認
      // 🔵 REQ-001「自由遷移」

      const { mockScene, mockEventBus } = setupMainScene();
      const { MainScene } = await import('@scenes/MainScene');
      const mainScene = new MainScene();

      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      mainScene.add = mockScene.add;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      mainScene.make = mockScene.make;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      mainScene.cameras = mockScene.cameras;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      mainScene.rexUI = mockScene.rexUI;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      mainScene.data = mockScene.data;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      mainScene.input = mockScene.input;

      mainScene.create();

      // PHASE_CHANGEDイベントを発行
      mockEventBus.emit(GameEventType.PHASE_CHANGED, {
        previousPhase: GamePhase.QUEST_ACCEPT,
        newPhase: GamePhase.ALCHEMY,
      });

      expect(mainScene.isPhaseUIVisible(GamePhase.ALCHEMY)).toBe(true);
      expect(mainScene.isPhaseUIVisible(GamePhase.QUEST_ACCEPT)).toBe(false);
    });
  });

  // ===========================================================================
  // テストケース3: _completedPhasesが存在しない
  // ===========================================================================

  describe('_completedPhasesが存在しない', () => {
    it('T-0116-03: フェーズを複数回切り替えてもエラーにならない', async () => {
      // 【テスト目的】: _completedPhasesの概念なしで複数回フェーズ切り替えが安全にできることを確認
      // 🔵 REQ-001「自由遷移」・architecture.md

      const { mockScene, mockEventBus } = setupMainScene();
      const { MainScene } = await import('@scenes/MainScene');
      const mainScene = new MainScene();

      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      mainScene.add = mockScene.add;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      mainScene.make = mockScene.make;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      mainScene.cameras = mockScene.cameras;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      mainScene.rexUI = mockScene.rexUI;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      mainScene.data = mockScene.data;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      mainScene.input = mockScene.input;

      mainScene.create();

      // 複数回のフェーズ切り替え（自由遷移）
      expect(() => {
        // QUEST_ACCEPT → GATHERING
        mockEventBus.emit(GameEventType.PHASE_CHANGED, {
          previousPhase: GamePhase.QUEST_ACCEPT,
          newPhase: GamePhase.GATHERING,
        });
        // GATHERING → DELIVERY（順序をスキップ）
        mockEventBus.emit(GameEventType.PHASE_CHANGED, {
          previousPhase: GamePhase.GATHERING,
          newPhase: GamePhase.DELIVERY,
        });
        // DELIVERY → QUEST_ACCEPT（逆方向の遷移）
        mockEventBus.emit(GameEventType.PHASE_CHANGED, {
          previousPhase: GamePhase.DELIVERY,
          newPhase: GamePhase.QUEST_ACCEPT,
        });
        // QUEST_ACCEPT → ALCHEMY（任意の遷移）
        mockEventBus.emit(GameEventType.PHASE_CHANGED, {
          previousPhase: GamePhase.QUEST_ACCEPT,
          newPhase: GamePhase.ALCHEMY,
        });
      }).not.toThrow();

      // 最終状態はALCHEMY
      expect(mainScene.isPhaseUIVisible(GamePhase.ALCHEMY)).toBe(true);
    });

    it('MainSceneに_completedPhasesプロパティが存在しない', async () => {
      // 【テスト目的】: _completedPhasesフィールドが廃止されていることを確認
      // 🔵 REQ-001「自由遷移」

      const { mockScene } = setupMainScene();
      const { MainScene } = await import('@scenes/MainScene');
      const mainScene = new MainScene();

      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      mainScene.add = mockScene.add;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      mainScene.make = mockScene.make;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      mainScene.cameras = mockScene.cameras;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      mainScene.rexUI = mockScene.rexUI;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      mainScene.data = mockScene.data;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      mainScene.input = mockScene.input;

      mainScene.create();

      // _completedPhasesフィールドが存在しないことを確認
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      expect(mainScene._completedPhases).toBeUndefined();
    });
  });
});
