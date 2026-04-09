/**
 * MainScene ヘッダー更新テスト
 * Issue #443: 採取フェーズで採取してもAPが消費されない（再発）
 *
 * @description
 * GATHERING_ENDEDイベントおよびPHASE_CHANGEDイベント発行時に
 * ヘッダーUI（AP表示等）が正しく更新されることを検証する。
 *
 * @信頼性レベル 🔵 REQ-002・Issue #443修正
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

const mockHeaderUpdateFn = vi.fn();

vi.mock('@presentation/ui/components/FooterUI', () => ({
  FooterUI: class MockFooterUI {
    create() {}
    destroy() {}
    getPhaseTabUI() {
      return null;
    }
  },
}));

// Issue #458 Phase 4 A: HeaderUI → HUDBar へ置換
vi.mock('@presentation/ui/components/composite', () => ({
  HUDBar: class MockHUDBar {
    create() {}
    updateFromHeader = mockHeaderUpdateFn;
    update = vi.fn();
    getData = vi.fn(() => ({}));
  },
  PhaseRail: class MockPhaseRail {
    create() {}
    setCurrent = vi.fn();
    setTabsDisabled = vi.fn();
    setConditionText = vi.fn();
    destroy() {}
  },
  ContextPanel: class MockContextPanel {
    create() {}
    setContent = vi.fn();
    destroy() {}
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
  switchPhase: vi.fn().mockResolvedValue({ success: true }),
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
      return vi.fn(); // 購読解除関数を返す
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

async function createAndInitMainScene() {
  const { mockScene, mockStateManager, mockGameFlowManager, mockEventBus } = setupMainScene();
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

  return { mainScene, mockStateManager, mockGameFlowManager, mockEventBus };
}

// =============================================================================
// テスト
// =============================================================================

describe('MainSceneヘッダー更新（Issue #443）', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================================================
  // GATHERING_ENDEDイベントでヘッダー更新
  // ===========================================================================

  describe('GATHERING_ENDEDイベントでヘッダーが更新される', () => {
    it('GATHERING_ENDEDイベント発行時にupdateHeader()が呼ばれる', async () => {
      const { mockEventBus, mockStateManager } = await createAndInitMainScene();

      // create()時のupdateHeader呼び出しをリセット
      mockHeaderUpdateFn.mockClear();
      mockStateManager.getState.mockClear();

      // AP消費後の状態をシミュレート
      mockStateManager.getState.mockReturnValue({
        currentRank: GuildRank.E,
        promotionGauge: 35,
        remainingDays: 25,
        currentDay: 6,
        currentPhase: GamePhase.GATHERING,
        gold: 500,
        actionPoints: 1, // AP消費後（3 → 1）
        comboCount: 0,
        rankHp: 100,
        isPromotionTest: false,
      });

      // GATHERING_ENDEDイベントを発行
      mockEventBus.emit(GameEventType.GATHERING_ENDED, {
        materials: [],
        cost: { actionPointCost: 2, extraDays: 0 },
      });

      // ヘッダーが更新されることを確認
      expect(mockHeaderUpdateFn).toHaveBeenCalledWith(
        expect.objectContaining({
          actionPoints: 1,
        }),
      );
    });
  });

  // ===========================================================================
  // PHASE_CHANGEDイベントでヘッダー更新
  // ===========================================================================

  describe('PHASE_CHANGEDイベントでヘッダーが更新される', () => {
    it('PHASE_CHANGEDイベント発行時にupdateHeader()が呼ばれる', async () => {
      const { mockEventBus } = await createAndInitMainScene();

      // create()時の呼び出しをリセット
      mockHeaderUpdateFn.mockClear();

      // PHASE_CHANGEDイベントを発行
      mockEventBus.emit(GameEventType.PHASE_CHANGED, {
        previousPhase: GamePhase.GATHERING,
        newPhase: GamePhase.ALCHEMY,
      });

      // ヘッダーが更新されることを確認
      expect(mockHeaderUpdateFn).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // GATHERING_ENDEDイベントの購読確認
  // ===========================================================================

  // ===========================================================================
  // DAY_ENDEDイベントでヘッダー更新
  // ===========================================================================

  describe('DAY_ENDEDイベントでヘッダーが更新される', () => {
    it('DAY_ENDEDイベント発行時にupdateHeader()が呼ばれる', async () => {
      const { mockEventBus, mockStateManager } = await createAndInitMainScene();

      mockHeaderUpdateFn.mockClear();

      // AP超過による日進行後の状態をシミュレート
      mockStateManager.getState.mockReturnValue({
        currentRank: GuildRank.E,
        promotionGauge: 35,
        remainingDays: 18,
        currentDay: 3,
        currentPhase: GamePhase.GATHERING,
        gold: 500,
        actionPoints: 2,
        comboCount: 0,
        rankHp: 100,
        isPromotionTest: false,
      });

      mockEventBus.emit(GameEventType.DAY_ENDED, {
        failedQuests: [],
        remainingDays: 18,
        currentDay: 3,
      });

      expect(mockHeaderUpdateFn).toHaveBeenCalledWith(
        expect.objectContaining({
          actionPoints: 2,
          remainingDays: 18,
        }),
      );
    });
  });

  describe('GATHERING_ENDEDイベント購読', () => {
    it('MainScene.create()でGATHERING_ENDEDイベントが購読される', async () => {
      const { mockEventBus } = await createAndInitMainScene();

      // eventBus.on()がGATHERING_ENDEDで呼ばれたことを確認
      const gatheringEndedCalls = mockEventBus.on.mock.calls.filter(
        (call: unknown[]) => call[0] === GameEventType.GATHERING_ENDED,
      );
      expect(gatheringEndedCalls.length).toBe(1);
    });
  });

  // ===========================================================================
  // Issue #471: 受注後のGATHERING自動遷移
  // ===========================================================================

  describe('QUEST_ACCEPTEDイベントでGATHERINGへ自動遷移（Issue #471）', () => {
    it('QUEST_ACCEPT中に受注するとswitchPhase(GATHERING)が呼ばれる', async () => {
      const { mockEventBus, mockGameFlowManager } = await createAndInitMainScene();
      mockGameFlowManager.switchPhase.mockClear();

      // QUEST_ACCEPTEDイベントを発行
      mockEventBus.emit(GameEventType.QUEST_ACCEPTED, {
        quest: { id: 'q1', name: 'テスト依頼' },
      });

      // switchPhase(GATHERING)が呼ばれることを確認
      expect(mockGameFlowManager.switchPhase).toHaveBeenCalledWith({
        targetPhase: GamePhase.GATHERING,
      });
    });

    it('GATHERING中に受注してもswitchPhaseは呼ばれない', async () => {
      const { mockEventBus, mockStateManager, mockGameFlowManager } =
        await createAndInitMainScene();
      mockGameFlowManager.switchPhase.mockClear();

      // 現在フェーズをGATHERINGに変更
      mockStateManager.getState.mockReturnValue({
        currentRank: GuildRank.E,
        promotionGauge: 35,
        remainingDays: 25,
        currentDay: 6,
        currentPhase: GamePhase.GATHERING,
        gold: 500,
        actionPoints: 3,
        comboCount: 0,
        rankHp: 100,
        isPromotionTest: false,
      });

      // QUEST_ACCEPTEDイベントを発行
      mockEventBus.emit(GameEventType.QUEST_ACCEPTED, {
        quest: { id: 'q1', name: 'テスト依頼' },
      });

      // switchPhaseは呼ばれないことを確認
      expect(mockGameFlowManager.switchPhase).not.toHaveBeenCalled();
    });
  });
});
