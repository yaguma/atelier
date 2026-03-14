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
import {
  createMockEventBus,
  createMockGameFlowManager,
  createMockScene,
  createMockStateManager,
} from '@test-mocks/phaser-mocks';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// =============================================================================
// モック定義
// =============================================================================

vi.mock('phaser', () => ({
  default: {
    Scene: class MockScene {},
    GameObjects: {
      Container: class MockContainer {},
      Text: class MockText {
        setName = vi.fn().mockReturnThis();
      },
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
        setName = vi.fn().mockReturnThis();
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
// テスト固有のモックヘルパー
// =============================================================================

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

// =============================================================================
// テストスイート
// =============================================================================

describe('MainScene ゲーム終了イベント購読 (Issue #361)', () => {
  beforeEach(() => {
    mockStateManagerInstance = createMockStateManager({
      remainingDays: 0,
      currentDay: 30,
      gold: 1500,
    });
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
  const setupMainScene = async (): Promise<{ mainScene: any; mockSceneResult: any }> => {
    const { MainScene } = await import('@presentation/scenes/MainScene');
    const mockSceneResult = createMockScene({
      dataGetHandler: (key: string) => {
        if (key === 'eventBus') return mockEventBusInstance;
        return null;
      },
    });
    const mainScene = new MainScene();
    const sceneObj = mockSceneResult.scene as Record<string, unknown>;

    // モックを注入
    // @ts-expect-error - テストのためにprivateプロパティにアクセス
    mainScene.add = sceneObj.add;
    // @ts-expect-error - テストのためにprivateプロパティにアクセス
    mainScene.make = sceneObj.make;
    // @ts-expect-error - テストのためにprivateプロパティにアクセス
    mainScene.cameras = sceneObj.cameras;
    // @ts-expect-error - テストのためにprivateプロパティにアクセス
    mainScene.rexUI = sceneObj.rexUI;
    // @ts-expect-error - テストのためにprivateプロパティにアクセス
    mainScene.data = sceneObj.data;
    // @ts-expect-error - テストのためにprivateプロパティにアクセス
    mainScene.input = sceneObj.input;
    // @ts-expect-error - テストのためにprivateプロパティにアクセス
    mainScene.scene = sceneObj.scene;

    mainScene.create();

    return { mainScene, mockSceneResult };
  };

  describe('GAME_OVERイベント', () => {
    it('GAME_OVERイベント受信時にGameOverSceneへ遷移する', async () => {
      const { mockSceneResult } = await setupMainScene();

      // GAME_OVERイベントを発行
      mockEventBusInstance.emit(GameEventType.GAME_OVER, {
        type: 'game_over',
        reason: 'time_expired',
        finalRank: GuildRank.E,
        totalDays: 30,
      });

      // GameOverSceneへ遷移すること
      const sceneObj = mockSceneResult.scene as Record<string, unknown>;
      const sceneManager = sceneObj.scene as { start: ReturnType<typeof vi.fn> };
      expect(sceneManager.start).toHaveBeenCalledWith('GameOverScene', {
        stats: expect.objectContaining({
          finalRank: GuildRank.E,
          totalDays: 30,
        }),
      });
    });

    it('遷移時にGameEndStatsが正しく構築される', async () => {
      // ゴールド2500の状態に設定
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

      const { mockSceneResult } = await setupMainScene();

      mockEventBusInstance.emit(GameEventType.GAME_OVER, {
        type: 'game_over',
        reason: 'time_expired',
        finalRank: GuildRank.D,
        totalDays: 30,
      });

      const sceneObj = mockSceneResult.scene as Record<string, unknown>;
      const sceneManager = sceneObj.scene as { start: ReturnType<typeof vi.fn> };
      expect(sceneManager.start).toHaveBeenCalledWith('GameOverScene', {
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
      const { mockSceneResult } = await setupMainScene();

      // GAME_CLEAREDイベントを発行
      mockEventBusInstance.emit(GameEventType.GAME_CLEARED, {
        type: 'game_clear',
        reason: 's_rank_achieved',
        finalRank: GuildRank.S,
        totalDays: 20,
      });

      // GameClearSceneへ遷移すること
      const sceneObj = mockSceneResult.scene as Record<string, unknown>;
      const sceneManager = sceneObj.scene as { start: ReturnType<typeof vi.fn> };
      expect(sceneManager.start).toHaveBeenCalledWith('GameClearScene', {
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

      const { mockSceneResult } = await setupMainScene();

      mockEventBusInstance.emit(GameEventType.GAME_CLEARED, {
        type: 'game_clear',
        reason: 's_rank_achieved',
        finalRank: GuildRank.S,
        totalDays: 20,
      });

      const sceneObj = mockSceneResult.scene as Record<string, unknown>;
      const sceneManager = sceneObj.scene as { start: ReturnType<typeof vi.fn> };
      expect(sceneManager.start).toHaveBeenCalledWith('GameClearScene', {
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
      const { mainScene, mockSceneResult } = await setupMainScene();

      // shutdown前にイベントが反応することを確認
      mockEventBusInstance.emit(GameEventType.GAME_OVER, {
        type: 'game_over',
        reason: 'time_expired',
        finalRank: GuildRank.E,
        totalDays: 30,
      });

      const sceneObj = mockSceneResult.scene as Record<string, unknown>;
      const sceneManager = sceneObj.scene as { start: ReturnType<typeof vi.fn> };
      expect(sceneManager.start).toHaveBeenCalledTimes(1);

      // shutdownを実行
      mainScene.shutdown();

      // shutdown後はイベントが反応しないことを確認
      sceneManager.start.mockClear();
      mockEventBusInstance.emit(GameEventType.GAME_OVER, {
        type: 'game_over',
        reason: 'time_expired',
        finalRank: GuildRank.E,
        totalDays: 30,
      });

      expect(sceneManager.start).not.toHaveBeenCalled();
    });
  });
});
