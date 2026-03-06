/**
 * MainScene ゲーム終了イベント購読テスト
 * Issue #361: 最後の1日で日終了・休憩を押してもゲームオーバーに遷移しない
 *
 * テストケース:
 * - GAME_OVERイベント受信時にGameOverSceneへ遷移する
 * - GAME_CLEAREDイベント受信時にGameClearSceneへ遷移する
 * - 遷移時にGameEndStatsが正しく構築される
 * - shutdown時にイベント購読が解除される
 */

import { GamePhase, GuildRank } from '@shared/types/common';
import { GameEventType } from '@shared/types/events';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// =============================================================================
// モック定義
// =============================================================================

vi.mock('phaser', () => ({
  default: {
    Scene: class MockScene {},
    GameObjects: {
      Container: class MockContainer {},
      Text: class MockText {},
      Graphics: class MockGraphics {
        fillStyle = vi.fn().mockReturnThis();
        fillRect = vi.fn().mockReturnThis();
        fillRoundedRect = vi.fn().mockReturnThis();
        clear = vi.fn().mockReturnThis();
        lineStyle = vi.fn().mockReturnThis();
        beginPath = vi.fn().mockReturnThis();
        moveTo = vi.fn().mockReturnThis();
        lineTo = vi.fn().mockReturnThis();
        stroke = vi.fn().mockReturnThis();
        strokePath = vi.fn().mockReturnThis();
        destroy = vi.fn();
      },
      Rectangle: class MockRectangle {
        setFillStyle = vi.fn().mockReturnThis();
        setStrokeStyle = vi.fn().mockReturnThis();
        setOrigin = vi.fn().mockReturnThis();
        setInteractive = vi.fn().mockReturnThis();
        disableInteractive = vi.fn().mockReturnThis();
        setAlpha = vi.fn().mockReturnThis();
        on = vi.fn().mockReturnThis();
        destroy = vi.fn();
      },
      Arc: class MockArc {
        setFillStyle = vi.fn().mockReturnThis();
        setStrokeStyle = vi.fn().mockReturnThis();
        destroy = vi.fn();
      },
    },
  },
}));

// biome-ignore lint/suspicious/noExplicitAny: テスト用のモック変数
let mockStateManagerInstance: any;
// biome-ignore lint/suspicious/noExplicitAny: テスト用のモック変数
let mockGameFlowManagerInstance: any;
// biome-ignore lint/suspicious/noExplicitAny: テスト用のモック変数
let mockEventBusInstance: any;
// biome-ignore lint/suspicious/noExplicitAny: テスト用のモック変数
let mockQuestServiceInstance: any;

const KNOWN_SERVICES = ['StateManager', 'GameFlowManager', 'EventBus', 'QuestService'];

const mockContainerInstance = {
  resolve: vi.fn((key: string) => {
    if (key === 'StateManager') return mockStateManagerInstance;
    if (key === 'GameFlowManager') return mockGameFlowManagerInstance;
    if (key === 'EventBus') return mockEventBusInstance;
    if (key === 'QuestService') return mockQuestServiceInstance;
    throw new Error(`Service not found: ${key}`);
  }),
  register: vi.fn(),
  has: vi.fn((key: string) => KNOWN_SERVICES.includes(key)),
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
  },
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

const createMockRexUI = () => ({
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
    scrollablePanel: vi.fn().mockReturnValue({
      layout: vi.fn(),
      destroy: vi.fn(),
    }),
  },
});

/**
 * EventBusモック（unsubscribe関数を返す版）
 */
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
      // unsubscribe関数を返す
      return () => {
        const current = listeners.get(event) || [];
        const index = current.indexOf(handler);
        if (index >= 0) current.splice(index, 1);
      };
    }),
    off: vi.fn(),
    listeners,
  };
};

const createMockStateManager = () => ({
  getState: vi.fn().mockReturnValue({
    currentRank: GuildRank.E,
    promotionGauge: 35,
    remainingDays: 0,
    currentDay: 30,
    currentPhase: GamePhase.QUEST_ACCEPT,
    gold: 1500,
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

const createMockQuestService = () => ({
  acceptQuest: vi.fn().mockReturnValue(true),
  cancelQuest: vi.fn(),
  getActiveQuests: vi.fn().mockReturnValue([]),
  getAvailableQuests: vi.fn().mockReturnValue([]),
  generateDailyQuests: vi.fn(),
  canDeliver: vi.fn().mockReturnValue(false),
  deliver: vi.fn(),
  updateDeadlines: vi.fn().mockReturnValue([]),
  checkCondition: vi.fn().mockReturnValue(false),
  getQuestLimit: vi.fn().mockReturnValue(2),
  setQuestLimit: vi.fn(),
});

const createMockScene = () => {
  const mockContainer = createMockContainer();
  const mockText = createMockText();
  const mockRexUI = createMockRexUI();

  return {
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
        fillRoundedRect: vi.fn().mockReturnThis(),
        clear: vi.fn().mockReturnThis(),
        destroy: vi.fn(),
        lineStyle: vi.fn().mockReturnThis(),
        beginPath: vi.fn().mockReturnThis(),
        moveTo: vi.fn().mockReturnThis(),
        lineTo: vi.fn().mockReturnThis(),
        stroke: vi.fn().mockReturnThis(),
        strokePath: vi.fn().mockReturnThis(),
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
      container: vi.fn().mockImplementation((config: { x?: number; y?: number }) => ({
        ...mockContainer,
        x: config?.x ?? 0,
        y: config?.y ?? 0,
      })),
    },
    cameras: {
      main: {
        centerX: 640,
        centerY: 360,
        width: 1280,
        height: 720,
      },
    },
    data: {
      get: vi.fn().mockImplementation((key: string) => {
        if (key === 'eventBus') return mockEventBusInstance;
        return null;
      }),
      set: vi.fn(),
    },
    input: {
      keyboard: { on: vi.fn(), off: vi.fn() },
    },
    rexUI: mockRexUI,
    tweens: {
      add: vi.fn().mockImplementation((config) => {
        if (config.onComplete) config.onComplete();
        return {};
      }),
      killTweensOf: vi.fn(),
    },
    scene: {
      start: vi.fn(),
    },
  };
};

// =============================================================================
// テストスイート
// =============================================================================

describe('MainScene ゲーム終了イベント購読 (Issue #361)', () => {
  beforeEach(() => {
    mockStateManagerInstance = createMockStateManager();
    mockGameFlowManagerInstance = createMockGameFlowManager();
    mockEventBusInstance = createMockEventBus();
    mockQuestServiceInstance = createMockQuestService();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  /**
   * MainSceneインスタンスを作成してcreate()を実行するヘルパー
   */
  // biome-ignore lint/suspicious/noExplicitAny: テスト用のモック設定
  const setupMainScene = async (): Promise<{ mainScene: any; mockScene: any }> => {
    const { MainScene } = await import('@presentation/scenes/MainScene');
    const mockScene = createMockScene();
    const mainScene = new MainScene();

    // モックを注入
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
    // @ts-expect-error - テストのためにprivateプロパティにアクセス
    mainScene.scene = mockScene.scene;

    mainScene.create();

    return { mainScene, mockScene };
  };

  describe('GAME_OVERイベント', () => {
    it('GAME_OVERイベント受信時にGameOverSceneへ遷移する', async () => {
      const { mockScene } = await setupMainScene();

      // GAME_OVERイベントを発行
      mockEventBusInstance.emit(GameEventType.GAME_OVER, {
        type: 'game_over',
        reason: 'time_expired',
        finalRank: GuildRank.E,
        totalDays: 30,
      });

      // GameOverSceneへ遷移すること
      expect(mockScene.scene.start).toHaveBeenCalledWith('GameOverScene', {
        stats: expect.objectContaining({
          finalRank: GuildRank.E,
          totalDays: 30,
        }),
      });
    });

    it('遷移時にGameEndStatsが正しく構築される', async () => {
      // ゴールド1500の状態
      mockStateManagerInstance.getState.mockReturnValue({
        currentRank: GuildRank.D,
        promotionGauge: 50,
        remainingDays: 0,
        currentDay: 30,
        currentPhase: GamePhase.DELIVERY,
        gold: 2500,
        actionPoints: 0,
        comboCount: 0,
        rankHp: 80,
        isPromotionTest: false,
      });

      const { mockScene } = await setupMainScene();

      mockEventBusInstance.emit(GameEventType.GAME_OVER, {
        type: 'game_over',
        reason: 'time_expired',
        finalRank: GuildRank.D,
        totalDays: 30,
      });

      expect(mockScene.scene.start).toHaveBeenCalledWith('GameOverScene', {
        stats: {
          finalRank: GuildRank.D,
          totalDays: 30,
          totalDeliveries: 0,
          totalGold: 2500,
        },
      });
    });
  });

  describe('GAME_CLEAREDイベント', () => {
    it('GAME_CLEAREDイベント受信時にGameClearSceneへ遷移する', async () => {
      const { mockScene } = await setupMainScene();

      // GAME_CLEAREDイベントを発行
      mockEventBusInstance.emit(GameEventType.GAME_CLEARED, {
        type: 'game_clear',
        reason: 's_rank_achieved',
        finalRank: GuildRank.S,
        totalDays: 20,
      });

      // GameClearSceneへ遷移すること
      expect(mockScene.scene.start).toHaveBeenCalledWith('GameClearScene', {
        stats: expect.objectContaining({
          finalRank: GuildRank.S,
          totalDays: 20,
        }),
      });
    });

    it('遷移時にGameEndStatsが正しく構築される', async () => {
      mockStateManagerInstance.getState.mockReturnValue({
        currentRank: GuildRank.S,
        promotionGauge: 100,
        remainingDays: 5,
        currentDay: 20,
        currentPhase: GamePhase.DELIVERY,
        gold: 5000,
        actionPoints: 2,
        comboCount: 3,
        rankHp: 100,
        isPromotionTest: false,
      });

      const { mockScene } = await setupMainScene();

      mockEventBusInstance.emit(GameEventType.GAME_CLEARED, {
        type: 'game_clear',
        reason: 's_rank_achieved',
        finalRank: GuildRank.S,
        totalDays: 20,
      });

      expect(mockScene.scene.start).toHaveBeenCalledWith('GameClearScene', {
        stats: {
          finalRank: GuildRank.S,
          totalDays: 20,
          totalDeliveries: 0,
          totalGold: 5000,
        },
      });
    });
  });

  describe('イベント購読の登録', () => {
    it('GAME_OVERイベントが購読される', async () => {
      await setupMainScene();

      // EventBus.on がGAME_OVERイベントで呼ばれたか確認
      const onCalls = mockEventBusInstance.on.mock.calls;
      const gameOverSubscription = onCalls.find(
        // biome-ignore lint/suspicious/noExplicitAny: テスト用
        (call: any) => call[0] === GameEventType.GAME_OVER,
      );
      expect(gameOverSubscription).toBeDefined();
    });

    it('GAME_CLEAREDイベントが購読される', async () => {
      await setupMainScene();

      const onCalls = mockEventBusInstance.on.mock.calls;
      const gameClearedSubscription = onCalls.find(
        // biome-ignore lint/suspicious/noExplicitAny: テスト用
        (call: any) => call[0] === GameEventType.GAME_CLEARED,
      );
      expect(gameClearedSubscription).toBeDefined();
    });
  });

  describe('shutdown時のクリーンアップ', () => {
    it('shutdown時にGAME_OVERイベント購読が解除される', async () => {
      const { mainScene } = await setupMainScene();

      // shutdown前にイベントが反応することを確認
      mockEventBusInstance.emit(GameEventType.GAME_OVER, {
        type: 'game_over',
        reason: 'time_expired',
        finalRank: GuildRank.E,
        totalDays: 30,
      });

      const sceneStartMock = mainScene.scene.start;
      expect(sceneStartMock).toHaveBeenCalledTimes(1);

      // shutdownを実行
      mainScene.shutdown();

      // shutdown後はイベントが反応しないことを確認
      sceneStartMock.mockClear();
      mockEventBusInstance.emit(GameEventType.GAME_OVER, {
        type: 'game_over',
        reason: 'time_expired',
        finalRank: GuildRank.E,
        totalDays: 30,
      });

      expect(sceneStartMock).not.toHaveBeenCalled();
    });
  });
});
