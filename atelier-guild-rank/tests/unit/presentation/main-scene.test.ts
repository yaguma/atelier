/**
 * MainScene共通レイアウト ユニットテスト
 * TASK-0046 MainScene共通レイアウト実装
 *
 * @description
 * MainScene、HeaderUI、SidebarUI、FooterUIのテストケース
 *
 * テストカテゴリ:
 * - 正常系: 32テストケース
 * - 異常系: 8テストケース
 * - 境界値: 10テストケース
 */

import { BaseComponent } from '@presentation/ui/components/BaseComponent';
import { GamePhase, GuildRank, Quality } from '@shared/types/common';
import { GameEventType } from '@shared/types/events';
import type { ICraftedItem, IMaterialInstance } from '@shared/types/materials';
import type { IActiveQuest } from '@shared/types/quests';
import type Phaser from 'phaser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// =============================================================================
// モック定義
// =============================================================================

/**
 * Phaserモック
 * Phaserフレームワークをモック化してテストを可能にする
 */
vi.mock('phaser', () => {
  return {
    default: {
      Scene: class MockScene {},
      GameObjects: {
        Container: class MockContainer {},
        Text: class MockText {},
        Graphics: class MockGraphics {},
      },
    },
  };
});

// DIコンテナのモックインスタンス（テスト時に設定を変更可能）
// biome-ignore lint/suspicious/noExplicitAny: テスト用のモック変数
let mockStateManagerInstance: any;
// biome-ignore lint/suspicious/noExplicitAny: テスト用のモック変数
let mockGameFlowManagerInstance: any;
// biome-ignore lint/suspicious/noExplicitAny: テスト用のモック変数
let mockEventBusInstance: any;
// biome-ignore lint/suspicious/noExplicitAny: テスト用のモック変数
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

vi.mock('@infrastructure/di/container', () => ({
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

/**
 * Phaserコンテナのモックを作成
 */
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

/**
 * Phaserテキストのモックを作成
 */
const createMockText = () => ({
  setText: vi.fn().mockReturnThis(),
  setOrigin: vi.fn().mockReturnThis(),
  setStyle: vi.fn().mockReturnThis(),
  setColor: vi.fn().mockReturnThis(),
  setFontSize: vi.fn().mockReturnThis(),
  destroy: vi.fn(),
  text: '',
});

/**
 * Phaserグラフィックスのモックを作成
 */
const createMockGraphics = () => ({
  fillStyle: vi.fn().mockReturnThis(),
  fillRect: vi.fn().mockReturnThis(),
  fillRoundedRect: vi.fn().mockReturnThis(),
  clear: vi.fn().mockReturnThis(),
  destroy: vi.fn(),
  // 線描画用メソッド
  lineStyle: vi.fn().mockReturnThis(),
  beginPath: vi.fn().mockReturnThis(),
  moveTo: vi.fn().mockReturnThis(),
  lineTo: vi.fn().mockReturnThis(),
  stroke: vi.fn().mockReturnThis(),
  strokePath: vi.fn().mockReturnThis(),
});

/**
 * rexUIモックを作成
 */
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
 * Phaserシーンのモックを作成
 */
const createMockScene = () => {
  const mockContainer = createMockContainer();
  const mockText = createMockText();
  const mockGraphics = createMockGraphics();
  const mockRexUI = createMockRexUI();

  // scene.data用のモック
  const mockData = {
    get: vi.fn().mockImplementation((key: string) => {
      if (key === 'eventBus') return mockEventBusInstance;
      if (key === 'questService') return null;
      if (key === 'inventoryService') return null;
      if (key === 'contributionCalculator') return null;
      return null;
    }),
    set: vi.fn(),
  };

  return {
    scene: {
      add: {
        // containerモックを修正: 渡された座標を持つオブジェクトを返す
        container: vi.fn().mockImplementation((x: number, y: number) => ({
          ...mockContainer,
          x,
          y,
        })),
        text: vi.fn().mockReturnValue(mockText),
        graphics: vi.fn().mockReturnValue(mockGraphics),
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
      cameras: {
        main: {
          centerX: 640,
          centerY: 360,
          width: 1280,
          height: 720,
        },
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
        add: vi.fn().mockImplementation((config) => {
          if (config.onComplete) {
            config.onComplete();
          }
          return {};
        }),
      },
      scene: {
        start: vi.fn(),
      },
    } as unknown as Phaser.Scene,
    mockContainer,
    mockText,
    mockGraphics,
    mockRexUI,
    mockData,
  };
};

/**
 * StateManagerモックを作成
 */
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

/**
 * GameFlowManagerモックを作成
 */
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

/**
 * EventBusモックを作成
 * Issue #111: 本物のEventBusと同じように{ type, payload, timestamp }形式でイベントをラップする
 */
const createMockEventBus = () => {
  const listeners = new Map<string, Array<(...args: unknown[]) => void>>();
  return {
    emit: vi.fn().mockImplementation((type: string, payload: unknown) => {
      // 本物のEventBusと同じ形式でイベントをラップ
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
    }),
    off: vi.fn(),
    listeners,
  };
};

// =============================================================================
// テストデータ
// =============================================================================

/**
 * HeaderUI用のデフォルトデータ
 */
const defaultHeaderData = {
  currentRank: GuildRank.E,
  promotionGauge: 35,
  remainingDays: 25,
  gold: 500,
  actionPoints: 3,
  maxActionPoints: 3,
};

/**
 * テスト用依頼データ
 */
const mockActiveQuests = [
  {
    quest: {
      id: 'quest-001',
      clientId: 'client-001',
      condition: {
        type: 'SPECIFIC',
        itemId: 'potion-001',
        quantity: 2,
      },
      contribution: 10,
      gold: 50,
      deadline: 3,
      difficulty: 'normal',
      flavorText: 'ポーションをお願いします',
    },
    client: {
      id: 'client-001',
      name: '村人A',
      type: 'VILLAGER',
      contributionMultiplier: 1.0,
      goldMultiplier: 1.0,
      deadlineModifier: 0,
      preferredQuestTypes: [],
      unlockRank: GuildRank.G,
    },
    remainingDays: 3,
    acceptedDay: 1,
  },
] as unknown as IActiveQuest[];

/**
 * テスト用素材データ
 */
const mockMaterials = [
  { materialId: 'herb', quality: Quality.C, quantity: 5 },
  { materialId: 'water', quality: Quality.B, quantity: 3 },
] as unknown as IMaterialInstance[];

/**
 * テスト用完成品データ
 */
const mockCraftedItems = [
  {
    itemId: 'potion-001',
    quality: Quality.B,
    attributeValues: [],
    effectValues: [],
    usedMaterials: [],
  },
] as unknown as ICraftedItem[];

// =============================================================================
// テストスイート
// =============================================================================

/**
 * QuestServiceのモックを作成
 * Issue #137: MainSceneでQuestServiceを使用するようになったため追加
 */
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

describe('MainScene共通レイアウト', () => {
  beforeEach(() => {
    // DIコンテナから返されるモックインスタンスを初期化
    mockStateManagerInstance = createMockStateManager();
    mockGameFlowManagerInstance = createMockGameFlowManager();
    mockEventBusInstance = createMockEventBus();
    mockQuestServiceInstance = createMockQuestService();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================================================
  // MainScene テスト
  // ===========================================================================

  describe('MainScene', () => {
    describe('create()', () => {
      it('TC-0046-001: MainScene create() でレイアウトコンポーネントが生成される', async () => {
        // 【テスト目的】: MainScene生成時にレイアウトコンポーネントが正しく作成されることを確認
        // 【対応要件】: REQ-0046-001
        // 🔵 信頼性レベル: requirements.md セクション2.1に明記

        // Given: MainSceneのモジュールをインポート
        const { MainScene } = await import('@presentation/scenes/MainScene');
        const { scene: mockScene } = createMockScene();
        const mockStateManager = createMockStateManager();
        const mockGameFlowManager = createMockGameFlowManager();
        const mockEventBus = createMockEventBus();

        // MainSceneインスタンスを作成
        const mainScene = new MainScene();

        // モックを注入
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.add = mockScene.add;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.cameras = mockScene.cameras;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.rexUI = mockScene.rexUI;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.data = mockScene.data;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.input = mockScene.input;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.data = mockScene.data;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.input = mockScene.input;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.stateManager = mockStateManager;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.gameFlowManager = mockGameFlowManager;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.eventBus = mockEventBus;

        // When: create()を呼び出す
        mainScene.create();

        // Then: レイアウトコンポーネントが生成される
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        expect(mainScene.headerUI).toBeDefined();
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        expect(mainScene.sidebarUI).toBeDefined();
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        expect(mainScene.footerUI).toBeDefined();
        expect(mainScene.getContentContainer()).toBeDefined();
      });

      it('TC-0046-002: MainScene create() でサービス参照が取得される', async () => {
        // 【テスト目的】: MainScene生成時にサービス参照が正しく取得されることを確認
        // 【対応要件】: REQ-0046-002
        // 🔵 信頼性レベル: requirements.md セクション2.1に明記

        // Given: MainSceneのモジュールをインポート
        const { MainScene } = await import('@presentation/scenes/MainScene');
        const { scene: mockScene } = createMockScene();
        const mockStateManager = createMockStateManager();
        const mockGameFlowManager = createMockGameFlowManager();
        const mockEventBus = createMockEventBus();

        // MainSceneインスタンスを作成
        const mainScene = new MainScene();

        // モックを注入
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.add = mockScene.add;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.cameras = mockScene.cameras;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.rexUI = mockScene.rexUI;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.data = mockScene.data;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.input = mockScene.input;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.data = mockScene.data;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.input = mockScene.input;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.stateManager = mockStateManager;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.gameFlowManager = mockGameFlowManager;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.eventBus = mockEventBus;

        // When: create()を呼び出す
        mainScene.create();

        // Then: サービス参照が取得される
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        expect(mainScene.stateManager).toBeDefined();
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        expect(mainScene.gameFlowManager).toBeDefined();
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        expect(mainScene.eventBus).toBeDefined();
      });
    });

    describe('showPhase()', () => {
      it('TC-0046-050: コンテンツエリアにフェーズUIコンテナが配置される', async () => {
        // 【テスト目的】: コンテンツコンテナが正しい座標に配置されることを確認
        // 【対応要件】: REQ-0046-040
        // 🔵 信頼性レベル: requirements.md セクション2.5に明記

        const { MainScene } = await import('@presentation/scenes/MainScene');
        const { scene: mockScene } = createMockScene();
        const mockStateManager = createMockStateManager();
        const mockGameFlowManager = createMockGameFlowManager();
        const mockEventBus = createMockEventBus();

        const mainScene = new MainScene();
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.add = mockScene.add;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.cameras = mockScene.cameras;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.rexUI = mockScene.rexUI;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.data = mockScene.data;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.input = mockScene.input;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.stateManager = mockStateManager;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.gameFlowManager = mockGameFlowManager;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.eventBus = mockEventBus;

        mainScene.create();

        // Then: contentContainerが指定座標に配置される
        const contentContainer = mainScene.getContentContainer();
        expect(contentContainer).toBeDefined();
        // サイドバー幅 200px、ヘッダー高さ 60px の右下に配置
        expect(contentContainer.x).toBe(200);
        expect(contentContainer.y).toBe(60);
      });

      it('TC-0046-051: フェーズ変更時にUIが切り替わる', async () => {
        // 【テスト目的】: showPhase()で正しいフェーズUIが表示されることを確認
        // 【対応要件】: REQ-0046-041
        // 🔵 信頼性レベル: requirements.md セクション2.5に明記

        const { MainScene } = await import('@presentation/scenes/MainScene');
        const { scene: mockScene } = createMockScene();
        const mockStateManager = createMockStateManager();
        const mockGameFlowManager = createMockGameFlowManager();
        const mockEventBus = createMockEventBus();

        const mainScene = new MainScene();
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.add = mockScene.add;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.cameras = mockScene.cameras;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.rexUI = mockScene.rexUI;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.data = mockScene.data;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.input = mockScene.input;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.stateManager = mockStateManager;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.gameFlowManager = mockGameFlowManager;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.eventBus = mockEventBus;

        mainScene.create();

        // When: showPhase(GATHERING)を呼び出す
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.showPhase(GamePhase.GATHERING);

        // Then: GATHERINGフェーズUIのみ表示、他は非表示
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        expect(mainScene.isPhaseUIVisible(GamePhase.GATHERING)).toBe(true);
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        expect(mainScene.isPhaseUIVisible(GamePhase.QUEST_ACCEPT)).toBe(false);
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        expect(mainScene.isPhaseUIVisible(GamePhase.ALCHEMY)).toBe(false);
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        expect(mainScene.isPhaseUIVisible(GamePhase.DELIVERY)).toBe(false);
      });
    });

    describe('Event Handling', () => {
      it('TC-0046-060: PHASE_CHANGEDイベントでUIが更新される', async () => {
        // 【テスト目的】: PHASE_CHANGEDイベント購読でUIが正しく更新されることを確認
        // 【対応要件】: REQ-0046-050
        // 🔵 信頼性レベル: requirements.md セクション2.6に明記

        const { MainScene } = await import('@presentation/scenes/MainScene');
        const { scene: mockScene } = createMockScene();

        const mainScene = new MainScene();
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.add = mockScene.add;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.cameras = mockScene.cameras;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.rexUI = mockScene.rexUI;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.data = mockScene.data;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.input = mockScene.input;

        mainScene.create();

        // When: グローバルなmockEventBusInstanceでPHASE_CHANGEDを発行
        mockEventBusInstance.emit(GameEventType.PHASE_CHANGED, {
          type: GameEventType.PHASE_CHANGED,
          previousPhase: GamePhase.QUEST_ACCEPT,
          newPhase: GamePhase.GATHERING,
          timestamp: Date.now(),
        });

        // Then: フェーズインジケーターとコンテンツエリアが更新される
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        expect(mainScene.footerUI.getPhaseIndicatorState(GamePhase.GATHERING)).toBe('CURRENT');
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        expect(mainScene.isPhaseUIVisible(GamePhase.GATHERING)).toBe(true);
      });

      it('TC-0046-061: DAY_STARTEDイベントで日数表示が更新される', async () => {
        // 【テスト目的】: DAY_STARTEDイベント購読で日数表示が正しく更新されることを確認
        // 【対応要件】: REQ-0046-051
        // 🔵 信頼性レベル: requirements.md セクション2.6に明記

        const { MainScene } = await import('@presentation/scenes/MainScene');
        const { scene: mockScene } = createMockScene();

        const mainScene = new MainScene();
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.add = mockScene.add;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.cameras = mockScene.cameras;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.rexUI = mockScene.rexUI;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.data = mockScene.data;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.input = mockScene.input;

        mainScene.create();

        // When: グローバルなmockEventBusInstanceでDAY_STARTEDを発行
        mockEventBusInstance.emit(GameEventType.DAY_STARTED, {
          type: GameEventType.DAY_STARTED,
          day: 2,
          remainingDays: 29,
          timestamp: Date.now(),
        });

        // Then: ヘッダーの残り日数表示が更新される
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        expect(mainScene.headerUI.getRemainingDaysText()).toBe('残り: 29日');
      });

      it('TC-0046-062: StateManager状態変更でヘッダー・サイドバーが更新される', async () => {
        // 【テスト目的】: StateManager状態変更でUIが正しく更新されることを確認
        // 【対応要件】: REQ-0046-052
        // 🔵 信頼性レベル: requirements.md セクション2.6に明記

        const { MainScene } = await import('@presentation/scenes/MainScene');
        const { scene: mockScene } = createMockScene();

        const mainScene = new MainScene();
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.add = mockScene.add;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.cameras = mockScene.cameras;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.rexUI = mockScene.rexUI;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.data = mockScene.data;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.input = mockScene.input;

        mainScene.create();

        // When: グローバルなmockStateManagerInstanceの状態を変更
        mockStateManagerInstance.getState.mockReturnValue({
          ...mockStateManagerInstance.getState(),
          gold: 1000,
        });
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.updateHeader();

        // Then: ヘッダーの表示が更新される
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        expect(mainScene.headerUI.getGoldText()).toBe('1000G');
      });
    });

    // =========================================================================
    // TASK-0052: フェーズUI統合テスト
    // =========================================================================

    describe('TASK-0052: フェーズUI統合', () => {
      describe('create()', () => {
        it('TC-0052-001: QuestAcceptPhaseUIインスタンスが作成されること', async () => {
          // 【テスト目的】: MainSceneでQuestAcceptPhaseUIが作成されることを確認
          // 【対応要件】: REQ-052-01
          // 🔵 信頼性レベル

          const { MainScene } = await import('@presentation/scenes/MainScene');
          const { scene: mockScene } = createMockScene();
          const mockStateManager = createMockStateManager();
          const mockGameFlowManager = createMockGameFlowManager();
          const mockEventBus = createMockEventBus();

          const mainScene = new MainScene();
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.add = mockScene.add;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.cameras = mockScene.cameras;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.rexUI = mockScene.rexUI;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.data = mockScene.data;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.input = mockScene.input;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.stateManager = mockStateManager;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.gameFlowManager = mockGameFlowManager;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.eventBus = mockEventBus;

          mainScene.create();

          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          expect(mainScene.phaseUIs.get(GamePhase.QUEST_ACCEPT)).toBeDefined();
        });

        it('TC-0052-002: GatheringPhaseUIインスタンスが作成されること', async () => {
          // 【テスト目的】: MainSceneでGatheringPhaseUIが作成されることを確認
          // 【対応要件】: REQ-052-01
          // 🔵 信頼性レベル

          const { MainScene } = await import('@presentation/scenes/MainScene');
          const { scene: mockScene } = createMockScene();
          const mockStateManager = createMockStateManager();
          const mockGameFlowManager = createMockGameFlowManager();
          const mockEventBus = createMockEventBus();

          const mainScene = new MainScene();
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.add = mockScene.add;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.cameras = mockScene.cameras;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.rexUI = mockScene.rexUI;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.data = mockScene.data;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.input = mockScene.input;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.stateManager = mockStateManager;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.gameFlowManager = mockGameFlowManager;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.eventBus = mockEventBus;

          mainScene.create();

          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          expect(mainScene.phaseUIs.get(GamePhase.GATHERING)).toBeDefined();
        });

        it('TC-0052-003: AlchemyPhaseUIインスタンスが作成されること', async () => {
          // 【テスト目的】: MainSceneでAlchemyPhaseUIが作成されることを確認
          // 【対応要件】: REQ-052-01
          // 🔵 信頼性レベル

          const { MainScene } = await import('@presentation/scenes/MainScene');
          const { scene: mockScene } = createMockScene();
          const mockStateManager = createMockStateManager();
          const mockGameFlowManager = createMockGameFlowManager();
          const mockEventBus = createMockEventBus();

          const mainScene = new MainScene();
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.add = mockScene.add;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.cameras = mockScene.cameras;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.rexUI = mockScene.rexUI;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.data = mockScene.data;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.input = mockScene.input;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.stateManager = mockStateManager;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.gameFlowManager = mockGameFlowManager;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.eventBus = mockEventBus;

          mainScene.create();

          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          expect(mainScene.phaseUIs.get(GamePhase.ALCHEMY)).toBeDefined();
        });

        it('TC-0052-004: DeliveryPhaseUIインスタンスが作成されること', async () => {
          // 【テスト目的】: MainSceneでDeliveryPhaseUIが作成されることを確認
          // 【対応要件】: REQ-052-01
          // 🔵 信頼性レベル

          const { MainScene } = await import('@presentation/scenes/MainScene');
          const { scene: mockScene } = createMockScene();
          const mockStateManager = createMockStateManager();
          const mockGameFlowManager = createMockGameFlowManager();
          const mockEventBus = createMockEventBus();

          const mainScene = new MainScene();
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.add = mockScene.add;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.cameras = mockScene.cameras;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.rexUI = mockScene.rexUI;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.data = mockScene.data;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.input = mockScene.input;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.stateManager = mockStateManager;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.gameFlowManager = mockGameFlowManager;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.eventBus = mockEventBus;

          mainScene.create();

          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          expect(mainScene.phaseUIs.get(GamePhase.DELIVERY)).toBeDefined();
        });

        it('TC-0052-005: 初期フェーズ（QUEST_ACCEPT）のUIのみが表示されること', async () => {
          // 【テスト目的】: create()後に初期フェーズのUIのみが表示されることを確認
          // 【対応要件】: REQ-052-02
          // 🔵 信頼性レベル

          const { MainScene } = await import('@presentation/scenes/MainScene');
          const { scene: mockScene } = createMockScene();
          const mockStateManager = createMockStateManager();
          const mockGameFlowManager = createMockGameFlowManager();
          const mockEventBus = createMockEventBus();

          const mainScene = new MainScene();
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.add = mockScene.add;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.cameras = mockScene.cameras;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.rexUI = mockScene.rexUI;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.data = mockScene.data;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.input = mockScene.input;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.stateManager = mockStateManager;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.gameFlowManager = mockGameFlowManager;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.eventBus = mockEventBus;

          mainScene.create();

          // 初期フェーズはQUEST_ACCEPT
          expect(mainScene.isPhaseUIVisible(GamePhase.QUEST_ACCEPT)).toBe(true);
          expect(mainScene.isPhaseUIVisible(GamePhase.GATHERING)).toBe(false);
          expect(mainScene.isPhaseUIVisible(GamePhase.ALCHEMY)).toBe(false);
          expect(mainScene.isPhaseUIVisible(GamePhase.DELIVERY)).toBe(false);
        });
      });

      describe('showPhase() - 表示切り替え', () => {
        it('TC-0052-010: QUEST_ACCEPT指定でQuestAcceptPhaseUIのみが表示されること', async () => {
          // 【テスト目的】: showPhase(QUEST_ACCEPT)で正しいUIが表示されることを確認
          // 【対応要件】: REQ-052-02
          // 🔵 信頼性レベル

          const { MainScene } = await import('@presentation/scenes/MainScene');
          const { scene: mockScene } = createMockScene();
          const mockStateManager = createMockStateManager();
          const mockGameFlowManager = createMockGameFlowManager();
          const mockEventBus = createMockEventBus();

          const mainScene = new MainScene();
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.add = mockScene.add;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.cameras = mockScene.cameras;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.rexUI = mockScene.rexUI;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.data = mockScene.data;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.input = mockScene.input;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.stateManager = mockStateManager;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.gameFlowManager = mockGameFlowManager;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.eventBus = mockEventBus;

          mainScene.create();
          mainScene.showPhase(GamePhase.QUEST_ACCEPT);

          expect(mainScene.isPhaseUIVisible(GamePhase.QUEST_ACCEPT)).toBe(true);
          expect(mainScene.isPhaseUIVisible(GamePhase.GATHERING)).toBe(false);
          expect(mainScene.isPhaseUIVisible(GamePhase.ALCHEMY)).toBe(false);
          expect(mainScene.isPhaseUIVisible(GamePhase.DELIVERY)).toBe(false);
        });

        it('TC-0052-011: GATHERING指定でGatheringPhaseUIのみが表示されること', async () => {
          // 【テスト目的】: showPhase(GATHERING)で正しいUIが表示されることを確認
          // 【対応要件】: REQ-052-03
          // 🔵 信頼性レベル

          const { MainScene } = await import('@presentation/scenes/MainScene');
          const { scene: mockScene } = createMockScene();
          const mockStateManager = createMockStateManager();
          const mockGameFlowManager = createMockGameFlowManager();
          const mockEventBus = createMockEventBus();

          const mainScene = new MainScene();
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.add = mockScene.add;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.cameras = mockScene.cameras;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.rexUI = mockScene.rexUI;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.data = mockScene.data;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.input = mockScene.input;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.stateManager = mockStateManager;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.gameFlowManager = mockGameFlowManager;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.eventBus = mockEventBus;

          mainScene.create();
          mainScene.showPhase(GamePhase.GATHERING);

          expect(mainScene.isPhaseUIVisible(GamePhase.QUEST_ACCEPT)).toBe(false);
          expect(mainScene.isPhaseUIVisible(GamePhase.GATHERING)).toBe(true);
          expect(mainScene.isPhaseUIVisible(GamePhase.ALCHEMY)).toBe(false);
          expect(mainScene.isPhaseUIVisible(GamePhase.DELIVERY)).toBe(false);
        });

        it('TC-0052-012: ALCHEMY指定でAlchemyPhaseUIのみが表示されること', async () => {
          // 【テスト目的】: showPhase(ALCHEMY)で正しいUIが表示されることを確認
          // 【対応要件】: REQ-052-04
          // 🔵 信頼性レベル

          const { MainScene } = await import('@presentation/scenes/MainScene');
          const { scene: mockScene } = createMockScene();
          const mockStateManager = createMockStateManager();
          const mockGameFlowManager = createMockGameFlowManager();
          const mockEventBus = createMockEventBus();

          const mainScene = new MainScene();
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.add = mockScene.add;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.cameras = mockScene.cameras;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.rexUI = mockScene.rexUI;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.data = mockScene.data;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.input = mockScene.input;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.stateManager = mockStateManager;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.gameFlowManager = mockGameFlowManager;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.eventBus = mockEventBus;

          mainScene.create();
          mainScene.showPhase(GamePhase.ALCHEMY);

          expect(mainScene.isPhaseUIVisible(GamePhase.QUEST_ACCEPT)).toBe(false);
          expect(mainScene.isPhaseUIVisible(GamePhase.GATHERING)).toBe(false);
          expect(mainScene.isPhaseUIVisible(GamePhase.ALCHEMY)).toBe(true);
          expect(mainScene.isPhaseUIVisible(GamePhase.DELIVERY)).toBe(false);
        });

        it('TC-0052-013: DELIVERY指定でDeliveryPhaseUIのみが表示されること', async () => {
          // 【テスト目的】: showPhase(DELIVERY)で正しいUIが表示されることを確認
          // 【対応要件】: REQ-052-05
          // 🔵 信頼性レベル

          const { MainScene } = await import('@presentation/scenes/MainScene');
          const { scene: mockScene } = createMockScene();
          const mockStateManager = createMockStateManager();
          const mockGameFlowManager = createMockGameFlowManager();
          const mockEventBus = createMockEventBus();

          const mainScene = new MainScene();
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.add = mockScene.add;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.cameras = mockScene.cameras;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.rexUI = mockScene.rexUI;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.data = mockScene.data;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.input = mockScene.input;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.stateManager = mockStateManager;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.gameFlowManager = mockGameFlowManager;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.eventBus = mockEventBus;

          mainScene.create();
          mainScene.showPhase(GamePhase.DELIVERY);

          expect(mainScene.isPhaseUIVisible(GamePhase.QUEST_ACCEPT)).toBe(false);
          expect(mainScene.isPhaseUIVisible(GamePhase.GATHERING)).toBe(false);
          expect(mainScene.isPhaseUIVisible(GamePhase.ALCHEMY)).toBe(false);
          expect(mainScene.isPhaseUIVisible(GamePhase.DELIVERY)).toBe(true);
        });

        it('TC-0052-014: フェーズ変更時に前のUIが非表示になること', async () => {
          // 【テスト目的】: フェーズ遷移時に前のフェーズUIが非表示になることを確認
          // 【対応要件】: REQ-052-06
          // 🔵 信頼性レベル

          const { MainScene } = await import('@presentation/scenes/MainScene');
          const { scene: mockScene } = createMockScene();
          const mockStateManager = createMockStateManager();
          const mockGameFlowManager = createMockGameFlowManager();
          const mockEventBus = createMockEventBus();

          const mainScene = new MainScene();
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.add = mockScene.add;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.cameras = mockScene.cameras;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.rexUI = mockScene.rexUI;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.data = mockScene.data;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.input = mockScene.input;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.stateManager = mockStateManager;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.gameFlowManager = mockGameFlowManager;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.eventBus = mockEventBus;

          mainScene.create();

          // QUEST_ACCEPT → GATHERING
          mainScene.showPhase(GamePhase.QUEST_ACCEPT);
          expect(mainScene.isPhaseUIVisible(GamePhase.QUEST_ACCEPT)).toBe(true);

          mainScene.showPhase(GamePhase.GATHERING);
          expect(mainScene.isPhaseUIVisible(GamePhase.QUEST_ACCEPT)).toBe(false);
          expect(mainScene.isPhaseUIVisible(GamePhase.GATHERING)).toBe(true);

          // GATHERING → ALCHEMY
          mainScene.showPhase(GamePhase.ALCHEMY);
          expect(mainScene.isPhaseUIVisible(GamePhase.GATHERING)).toBe(false);
          expect(mainScene.isPhaseUIVisible(GamePhase.ALCHEMY)).toBe(true);

          // ALCHEMY → DELIVERY
          mainScene.showPhase(GamePhase.DELIVERY);
          expect(mainScene.isPhaseUIVisible(GamePhase.ALCHEMY)).toBe(false);
          expect(mainScene.isPhaseUIVisible(GamePhase.DELIVERY)).toBe(true);
        });
      });

      describe('フェーズ遷移', () => {
        it('TC-0052-020: Footerの「次へ」ボタンクリックでフェーズが遷移すること', async () => {
          // 【テスト目的】: Footerの次へボタンでフェーズ遷移が行われることを確認
          // 【対応要件】: REQ-052-07
          // 🔵 信頼性レベル

          const { MainScene } = await import('@presentation/scenes/MainScene');
          const { scene: mockScene } = createMockScene();

          const mainScene = new MainScene();
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.add = mockScene.add;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.cameras = mockScene.cameras;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.rexUI = mockScene.rexUI;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.data = mockScene.data;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.input = mockScene.input;

          mainScene.create();

          // 次へボタンをシミュレート
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.footerUI.simulateNextButtonClick();

          // GameFlowManager.endPhase()が呼ばれることを確認（グローバルモックを使用）
          expect(mockGameFlowManagerInstance.endPhase).toHaveBeenCalled();
        });

        it('TC-0052-021: PHASE_CHANGEDイベントで正しいUIに切り替わること', async () => {
          // 【テスト目的】: PHASE_CHANGEDイベントでUIが正しく切り替わることを確認
          // 【対応要件】: REQ-052-02〜REQ-052-06
          // 🔵 信頼性レベル

          const { MainScene } = await import('@presentation/scenes/MainScene');
          const { scene: mockScene } = createMockScene();

          const mainScene = new MainScene();
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.add = mockScene.add;
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
          mockEventBusInstance.emit(GameEventType.PHASE_CHANGED, {
            type: GameEventType.PHASE_CHANGED,
            previousPhase: GamePhase.QUEST_ACCEPT,
            newPhase: GamePhase.GATHERING,
            timestamp: Date.now(),
          });

          // GatheringフェーズUIが表示されることを確認
          expect(mainScene.isPhaseUIVisible(GamePhase.GATHERING)).toBe(true);
          expect(mainScene.isPhaseUIVisible(GamePhase.QUEST_ACCEPT)).toBe(false);
        });
      });
    });

    describe('Error Handling', () => {
      it('TC-0046-E01: 無効なフェーズを指定した場合エラーが発生する', async () => {
        // 【テスト目的】: 無効なフェーズ指定時のエラーハンドリングを確認
        // 【対応要件】: REQ-0046-041（異常系）
        // 🔵 信頼性レベル: testcases.md セクション3.1に明記

        const { MainScene } = await import('@presentation/scenes/MainScene');
        const { scene: mockScene } = createMockScene();
        const mockStateManager = createMockStateManager();
        const mockGameFlowManager = createMockGameFlowManager();
        const mockEventBus = createMockEventBus();

        const mainScene = new MainScene();
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.add = mockScene.add;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.cameras = mockScene.cameras;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.rexUI = mockScene.rexUI;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.data = mockScene.data;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.input = mockScene.input;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.stateManager = mockStateManager;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.gameFlowManager = mockGameFlowManager;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        mainScene.eventBus = mockEventBus;

        mainScene.create();

        // When & Then: 無効なフェーズを指定するとエラー
        expect(() => {
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.showPhase('INVALID_PHASE' as GamePhase);
        }).toThrow();
      });

      it('TC-0046-E03: StateManager未初期化時にエラー処理される', async () => {
        // 【テスト目的】: StateManager未初期化時のエラーハンドリングを確認
        // 【対応要件】: REQ-0046-002（異常系）
        // 🔵 信頼性レベル: testcases.md セクション3.2に明記

        const { MainScene } = await import('@presentation/scenes/MainScene');
        const { scene: mockScene } = createMockScene();

        // DIコンテナのresolveがStateManagerにundefinedを返すように設定
        const originalStateManager = mockStateManagerInstance;
        mockStateManagerInstance = undefined;

        try {
          const mainScene = new MainScene();
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.add = mockScene.add;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.cameras = mockScene.cameras;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.rexUI = mockScene.rexUI;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.data = mockScene.data;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.input = mockScene.input;

          // When & Then: StateManager未初期化でエラー
          expect(() => mainScene.create()).toThrow('StateManager is required');
        } finally {
          // 元に戻す
          mockStateManagerInstance = originalStateManager;
        }
      });

      it('TC-0046-E04: GameFlowManager未初期化時にエラー処理される', async () => {
        // 【テスト目的】: GameFlowManager未初期化時のエラーハンドリングを確認
        // 【対応要件】: REQ-0046-002（異常系）
        // 🔵 信頼性レベル: testcases.md セクション3.2に明記

        const { MainScene } = await import('@presentation/scenes/MainScene');
        const { scene: mockScene } = createMockScene();

        // DIコンテナのresolveがGameFlowManagerにundefinedを返すように設定
        const originalGameFlowManager = mockGameFlowManagerInstance;
        mockGameFlowManagerInstance = undefined;

        try {
          const mainScene = new MainScene();
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.add = mockScene.add;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.cameras = mockScene.cameras;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.rexUI = mockScene.rexUI;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.data = mockScene.data;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.input = mockScene.input;

          // When & Then: GameFlowManager未初期化でエラー
          expect(() => mainScene.create()).toThrow('GameFlowManager is required');
        } finally {
          // 元に戻す
          mockGameFlowManagerInstance = originalGameFlowManager;
        }
      });

      it('TC-0046-E05: EventBus未初期化時にエラー処理される', async () => {
        // 【テスト目的】: EventBus未初期化時のエラーハンドリングを確認
        // 【対応要件】: REQ-0046-002（異常系）
        // 🔵 信頼性レベル: testcases.md セクション3.2に明記

        const { MainScene } = await import('@presentation/scenes/MainScene');
        const { scene: mockScene } = createMockScene();

        // DIコンテナのresolveがEventBusにundefinedを返すように設定
        const originalEventBus = mockEventBusInstance;
        mockEventBusInstance = undefined;

        try {
          const mainScene = new MainScene();
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.add = mockScene.add;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.cameras = mockScene.cameras;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.rexUI = mockScene.rexUI;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.data = mockScene.data;
          // @ts-expect-error - テストのためにprivateプロパティにアクセス
          mainScene.input = mockScene.input;

          // When & Then: EventBus未初期化でエラー
          expect(() => mainScene.create()).toThrow('EventBus is required');
        } finally {
          // 元に戻す
          mockEventBusInstance = originalEventBus;
        }
      });
    });
  });

  // ===========================================================================
  // HeaderUI テスト
  // ===========================================================================

  describe('HeaderUI', () => {
    describe('create()', () => {
      it('TC-0046-010: HeaderUI が BaseComponent を継承して正しく生成される', async () => {
        // 【テスト目的】: HeaderUIがBaseComponentを継承していることを確認
        // 【対応要件】: REQ-0046-010
        // 🔵 信頼性レベル: requirements.md セクション2.2に明記

        const { HeaderUI } = await import('@presentation/ui/components/HeaderUI');
        const { scene: mockScene } = createMockScene();

        // When: HeaderUIをインスタンス化してcreate()を呼び出す
        const headerUI = new HeaderUI(mockScene, 0, 0);
        headerUI.create();

        // Then: BaseComponentを継承している
        expect(headerUI).toBeInstanceOf(BaseComponent);
        expect(headerUI.getContainer()).toBeDefined();
      });
    });

    describe('update()', () => {
      describe('ランク表示', () => {
        it('TC-0046-011: HeaderUI にギルドランクが表示される', async () => {
          // 【テスト目的】: ランク表示が正しくフォーマットされることを確認
          // 【対応要件】: REQ-0046-010
          // 🔵 信頼性レベル: requirements.md セクション2.2に明記

          const { HeaderUI } = await import('@presentation/ui/components/HeaderUI');
          const { scene: mockScene } = createMockScene();

          const headerUI = new HeaderUI(mockScene, 0, 0);
          headerUI.create();

          // When: update()でランクを設定
          headerUI.update({
            ...defaultHeaderData,
            currentRank: GuildRank.E,
          });

          // Then: 「ランク: E」が表示される
          expect(headerUI.getRankText()).toBe('ランク: E');
        });
      });

      describe('昇格ゲージ表示', () => {
        it('TC-0046-012: HeaderUI に昇格ゲージが表示される', async () => {
          // 【テスト目的】: 昇格ゲージが正しく表示されることを確認
          // 【対応要件】: REQ-0046-011
          // 🔵 信頼性レベル: requirements.md セクション2.2に明記

          const { HeaderUI } = await import('@presentation/ui/components/HeaderUI');
          const { scene: mockScene } = createMockScene();

          const headerUI = new HeaderUI(mockScene, 0, 0);
          headerUI.create();

          // When: update()で昇格ゲージを設定
          headerUI.update({
            ...defaultHeaderData,
            promotionGauge: 35,
          });

          // Then: プログレスバーが35%表示される
          expect(headerUI.getPromotionGaugeValue()).toBe(35);
          expect(headerUI.getPromotionGaugeText()).toBe('35/100');
        });

        it('TC-0046-013: 昇格ゲージ 0〜30% で赤系色が適用される', async () => {
          // 【テスト目的】: 昇格ゲージ0-30%で赤系色になることを確認
          // 【対応要件】: REQ-0046-011
          // 🔵 信頼性レベル: requirements.md セクション2.2に明記

          const { HeaderUI } = await import('@presentation/ui/components/HeaderUI');
          const { scene: mockScene } = createMockScene();

          const headerUI = new HeaderUI(mockScene, 0, 0);
          headerUI.create();

          // When: 昇格ゲージ20%
          headerUI.update({ ...defaultHeaderData, promotionGauge: 20 });

          // Then: 赤系色（0xFF6B6B）
          expect(headerUI.getPromotionGaugeColor()).toBe(0xff6b6b);
        });

        it('TC-0046-014: 昇格ゲージ 30〜60% で黄系色が適用される', async () => {
          // 【テスト目的】: 昇格ゲージ30-60%で黄系色になることを確認
          // 【対応要件】: REQ-0046-011
          // 🔵 信頼性レベル: requirements.md セクション2.2に明記

          const { HeaderUI } = await import('@presentation/ui/components/HeaderUI');
          const { scene: mockScene } = createMockScene();

          const headerUI = new HeaderUI(mockScene, 0, 0);
          headerUI.create();

          // When: 昇格ゲージ45%
          headerUI.update({ ...defaultHeaderData, promotionGauge: 45 });

          // Then: 黄系色（0xFFD93D）
          expect(headerUI.getPromotionGaugeColor()).toBe(0xffd93d);
        });

        it('TC-0046-015: 昇格ゲージ 60〜99% で緑系色が適用される', async () => {
          // 【テスト目的】: 昇格ゲージ60-99%で緑系色になることを確認
          // 【対応要件】: REQ-0046-011
          // 🔵 信頼性レベル: requirements.md セクション2.2に明記

          const { HeaderUI } = await import('@presentation/ui/components/HeaderUI');
          const { scene: mockScene } = createMockScene();

          const headerUI = new HeaderUI(mockScene, 0, 0);
          headerUI.create();

          // When: 昇格ゲージ80%
          headerUI.update({ ...defaultHeaderData, promotionGauge: 80 });

          // Then: 緑系色（0x6BCB77）
          expect(headerUI.getPromotionGaugeColor()).toBe(0x6bcb77);
        });

        it('TC-0046-016: 昇格ゲージ 100% で水色が適用される', async () => {
          // 【テスト目的】: 昇格ゲージ100%で水色になることを確認
          // 【対応要件】: REQ-0046-011
          // 🔵 信頼性レベル: requirements.md セクション2.2に明記

          const { HeaderUI } = await import('@presentation/ui/components/HeaderUI');
          const { scene: mockScene } = createMockScene();

          const headerUI = new HeaderUI(mockScene, 0, 0);
          headerUI.create();

          // When: 昇格ゲージ100%
          headerUI.update({ ...defaultHeaderData, promotionGauge: 100 });

          // Then: 水色（0x4ECDC4）
          expect(headerUI.getPromotionGaugeColor()).toBe(0x4ecdc4);
        });
      });

      describe('残り日数表示', () => {
        it('TC-0046-017: 残り日数が通常表示される（11日以上）', async () => {
          // 【テスト目的】: 残り日数11日以上で白色表示されることを確認
          // 【対応要件】: REQ-0046-012
          // 🔵 信頼性レベル: requirements.md セクション2.2に明記

          const { HeaderUI } = await import('@presentation/ui/components/HeaderUI');
          const { scene: mockScene } = createMockScene();

          const headerUI = new HeaderUI(mockScene, 0, 0);
          headerUI.create();

          // When: 残り日数25日
          headerUI.update({ ...defaultHeaderData, remainingDays: 25 });

          // Then: 白色表示
          expect(headerUI.getRemainingDaysText()).toBe('残り: 25日');
          expect(headerUI.getRemainingDaysColor()).toBe(0xffffff);
        });

        it('TC-0046-018: 残り日数が警告表示される（6〜10日）', async () => {
          // 【テスト目的】: 残り日数6-10日で黄色表示されることを確認
          // 【対応要件】: REQ-0046-012
          // 🔵 信頼性レベル: requirements.md セクション2.2に明記

          const { HeaderUI } = await import('@presentation/ui/components/HeaderUI');
          const { scene: mockScene } = createMockScene();

          const headerUI = new HeaderUI(mockScene, 0, 0);
          headerUI.create();

          // When: 残り日数8日
          headerUI.update({ ...defaultHeaderData, remainingDays: 8 });

          // Then: 黄色表示
          expect(headerUI.getRemainingDaysText()).toBe('残り: 8日');
          expect(headerUI.getRemainingDaysColor()).toBe(0xffd93d);
        });

        it('TC-0046-019: 残り日数が緊急表示される（4〜5日）', async () => {
          // 【テスト目的】: 残り日数4-5日で赤色表示されることを確認
          // 【対応要件】: REQ-0046-012
          // 🔵 信頼性レベル: requirements.md セクション2.2に明記

          const { HeaderUI } = await import('@presentation/ui/components/HeaderUI');
          const { scene: mockScene } = createMockScene();

          const headerUI = new HeaderUI(mockScene, 0, 0);
          headerUI.create();

          // When: 残り日数5日
          headerUI.update({ ...defaultHeaderData, remainingDays: 5 });

          // Then: 赤色表示
          expect(headerUI.getRemainingDaysText()).toBe('残り: 5日');
          expect(headerUI.getRemainingDaysColor()).toBe(0xff6b6b);
        });

        it('TC-0046-020: 残り日数が危機表示される（1〜3日）', async () => {
          // 【テスト目的】: 残り日数1-3日で点滅赤色表示されることを確認
          // 【対応要件】: REQ-0046-012
          // 🔵 信頼性レベル: requirements.md セクション2.2に明記

          const { HeaderUI } = await import('@presentation/ui/components/HeaderUI');
          const { scene: mockScene } = createMockScene();

          const headerUI = new HeaderUI(mockScene, 0, 0);
          headerUI.create();

          // When: 残り日数2日
          headerUI.update({ ...defaultHeaderData, remainingDays: 2 });

          // Then: 明るい赤色＋点滅
          expect(headerUI.getRemainingDaysText()).toBe('残り: 2日');
          expect(headerUI.getRemainingDaysColor()).toBe(0xff0000);
          expect(headerUI.isRemainingDaysBlinking()).toBe(true);
        });
      });

      describe('所持金表示', () => {
        it('TC-0046-021: 所持金が正しく表示される', async () => {
          // 【テスト目的】: 所持金が正しくフォーマットされることを確認
          // 【対応要件】: REQ-0046-013
          // 🔵 信頼性レベル: requirements.md セクション2.2に明記

          const { HeaderUI } = await import('@presentation/ui/components/HeaderUI');
          const { scene: mockScene } = createMockScene();

          const headerUI = new HeaderUI(mockScene, 0, 0);
          headerUI.create();

          // When: 所持金500G
          headerUI.update({ ...defaultHeaderData, gold: 500 });

          // Then: 「500G」
          expect(headerUI.getGoldText()).toBe('500G');
        });
      });

      describe('行動ポイント表示', () => {
        it('TC-0046-022: 行動ポイントが正しく表示される', async () => {
          // 【テスト目的】: 行動ポイントが正しくフォーマットされることを確認
          // 【対応要件】: REQ-0046-014
          // 🔵 信頼性レベル: requirements.md セクション2.2に明記

          const { HeaderUI } = await import('@presentation/ui/components/HeaderUI');
          const { scene: mockScene } = createMockScene();

          const headerUI = new HeaderUI(mockScene, 0, 0);
          headerUI.create();

          // When: AP 3/3
          headerUI.update({ ...defaultHeaderData, actionPoints: 3, maxActionPoints: 3 });

          // Then: 「3/3 AP」
          expect(headerUI.getActionPointsText()).toBe('3/3 AP');
        });
      });

      describe('全体更新', () => {
        it('TC-0046-023: ヘッダー全体が更新される', async () => {
          // 【テスト目的】: update()で全項目が正しく更新されることを確認
          // 【対応要件】: REQ-0046-015
          // 🔵 信頼性レベル: requirements.md セクション2.2に明記

          const { HeaderUI } = await import('@presentation/ui/components/HeaderUI');
          const { scene: mockScene } = createMockScene();

          const headerUI = new HeaderUI(mockScene, 0, 0);
          headerUI.create();

          // When: 全項目を更新
          headerUI.update({
            currentRank: GuildRank.D,
            promotionGauge: 75,
            remainingDays: 15,
            gold: 1200,
            actionPoints: 2,
            maxActionPoints: 3,
          });

          // Then: すべて更新される
          expect(headerUI.getRankText()).toBe('ランク: D');
          expect(headerUI.getPromotionGaugeValue()).toBe(75);
          expect(headerUI.getRemainingDaysText()).toBe('残り: 15日');
          expect(headerUI.getGoldText()).toBe('1200G');
          expect(headerUI.getActionPointsText()).toBe('2/3 AP');
        });
      });
    });

    describe('Error Handling', () => {
      it('TC-0046-E06: 無効なシーンでHeaderUI生成時にエラーが発生する', async () => {
        // 【テスト目的】: null sceneでエラーがスローされることを確認
        // 【対応要件】: REQ-0046-001（異常系）
        // 🔵 信頼性レベル: testcases.md セクション3.3に明記

        const { HeaderUI } = await import('@presentation/ui/components/HeaderUI');

        // When & Then: null sceneでエラー
        // biome-ignore lint/suspicious/noExplicitAny: 異常系テストのためnullキャストが必要
        expect(() => new HeaderUI(null as any, 0, 0)).toThrow('scene is required');
      });
    });

    describe('境界値', () => {
      it('TC-0046-B01: 昇格ゲージ下限値（0）', async () => {
        // 【テスト目的】: 昇格ゲージ0で赤系色が適用されることを確認
        // 【対応要件】: REQ-0046-011
        // 🔵 信頼性レベル: testcases.md セクション4.1に明記

        const { HeaderUI } = await import('@presentation/ui/components/HeaderUI');
        const { scene: mockScene } = createMockScene();

        const headerUI = new HeaderUI(mockScene, 0, 0);
        headerUI.create();

        headerUI.update({ ...defaultHeaderData, promotionGauge: 0 });

        expect(headerUI.getPromotionGaugeColor()).toBe(0xff6b6b);
        expect(headerUI.getPromotionGaugeText()).toBe('0/100');
      });

      it('TC-0046-B02: 昇格ゲージ境界値（30）', async () => {
        // 【テスト目的】: 昇格ゲージ30で黄系色に切り替わることを確認
        // 【対応要件】: REQ-0046-011
        // 🔵 信頼性レベル: testcases.md セクション4.1に明記

        const { HeaderUI } = await import('@presentation/ui/components/HeaderUI');
        const { scene: mockScene } = createMockScene();

        const headerUI = new HeaderUI(mockScene, 0, 0);
        headerUI.create();

        headerUI.update({ ...defaultHeaderData, promotionGauge: 30 });

        expect(headerUI.getPromotionGaugeColor()).toBe(0xffd93d);
      });

      it('TC-0046-B03: 昇格ゲージ境界値（60）', async () => {
        // 【テスト目的】: 昇格ゲージ60で緑系色に切り替わることを確認
        // 【対応要件】: REQ-0046-011
        // 🔵 信頼性レベル: testcases.md セクション4.1に明記

        const { HeaderUI } = await import('@presentation/ui/components/HeaderUI');
        const { scene: mockScene } = createMockScene();

        const headerUI = new HeaderUI(mockScene, 0, 0);
        headerUI.create();

        headerUI.update({ ...defaultHeaderData, promotionGauge: 60 });

        expect(headerUI.getPromotionGaugeColor()).toBe(0x6bcb77);
      });

      it('TC-0046-B04: 昇格ゲージ上限値（100）', async () => {
        // 【テスト目的】: 昇格ゲージ100で水色が適用されることを確認
        // 【対応要件】: REQ-0046-011
        // 🔵 信頼性レベル: testcases.md セクション4.1に明記

        const { HeaderUI } = await import('@presentation/ui/components/HeaderUI');
        const { scene: mockScene } = createMockScene();

        const headerUI = new HeaderUI(mockScene, 0, 0);
        headerUI.create();

        headerUI.update({ ...defaultHeaderData, promotionGauge: 100 });

        expect(headerUI.getPromotionGaugeColor()).toBe(0x4ecdc4);
        expect(headerUI.getPromotionGaugeText()).toBe('100/100');
      });

      it('TC-0046-B05: 残り日数境界値（11日）', async () => {
        // 【テスト目的】: 残り日数11日で白色が適用されることを確認
        // 【対応要件】: REQ-0046-012
        // 🔵 信頼性レベル: testcases.md セクション4.2に明記

        const { HeaderUI } = await import('@presentation/ui/components/HeaderUI');
        const { scene: mockScene } = createMockScene();

        const headerUI = new HeaderUI(mockScene, 0, 0);
        headerUI.create();

        headerUI.update({ ...defaultHeaderData, remainingDays: 11 });

        expect(headerUI.getRemainingDaysColor()).toBe(0xffffff);
      });

      it('TC-0046-B06: 残り日数境界値（10日）', async () => {
        // 【テスト目的】: 残り日数10日で黄色が適用されることを確認
        // 【対応要件】: REQ-0046-012
        // 🔵 信頼性レベル: testcases.md セクション4.2に明記

        const { HeaderUI } = await import('@presentation/ui/components/HeaderUI');
        const { scene: mockScene } = createMockScene();

        const headerUI = new HeaderUI(mockScene, 0, 0);
        headerUI.create();

        headerUI.update({ ...defaultHeaderData, remainingDays: 10 });

        expect(headerUI.getRemainingDaysColor()).toBe(0xffd93d);
      });

      it('TC-0046-B07: 残り日数境界値（6日）', async () => {
        // 【テスト目的】: 残り日数6日で黄色が適用されることを確認
        // 【対応要件】: REQ-0046-012
        // 🔵 信頼性レベル: testcases.md セクション4.2に明記

        const { HeaderUI } = await import('@presentation/ui/components/HeaderUI');
        const { scene: mockScene } = createMockScene();

        const headerUI = new HeaderUI(mockScene, 0, 0);
        headerUI.create();

        headerUI.update({ ...defaultHeaderData, remainingDays: 6 });

        expect(headerUI.getRemainingDaysColor()).toBe(0xffd93d);
      });

      it('TC-0046-B08: 残り日数境界値（5日）', async () => {
        // 【テスト目的】: 残り日数5日で赤色が適用されることを確認
        // 【対応要件】: REQ-0046-012
        // 🔵 信頼性レベル: testcases.md セクション4.2に明記

        const { HeaderUI } = await import('@presentation/ui/components/HeaderUI');
        const { scene: mockScene } = createMockScene();

        const headerUI = new HeaderUI(mockScene, 0, 0);
        headerUI.create();

        headerUI.update({ ...defaultHeaderData, remainingDays: 5 });

        expect(headerUI.getRemainingDaysColor()).toBe(0xff6b6b);
      });

      it('TC-0046-B09: 残り日数境界値（3日）', async () => {
        // 【テスト目的】: 残り日数3日で点滅が開始されることを確認
        // 【対応要件】: REQ-0046-012
        // 🔵 信頼性レベル: testcases.md セクション4.2に明記

        const { HeaderUI } = await import('@presentation/ui/components/HeaderUI');
        const { scene: mockScene } = createMockScene();

        const headerUI = new HeaderUI(mockScene, 0, 0);
        headerUI.create();

        headerUI.update({ ...defaultHeaderData, remainingDays: 3 });

        expect(headerUI.getRemainingDaysColor()).toBe(0xff0000);
        expect(headerUI.isRemainingDaysBlinking()).toBe(true);
      });

      it('TC-0046-B10: 残り日数下限値（1日）', async () => {
        // 【テスト目的】: 残り日数1日で点滅表示されることを確認
        // 【対応要件】: REQ-0046-012
        // 🔵 信頼性レベル: testcases.md セクション4.2に明記

        const { HeaderUI } = await import('@presentation/ui/components/HeaderUI');
        const { scene: mockScene } = createMockScene();

        const headerUI = new HeaderUI(mockScene, 0, 0);
        headerUI.create();

        headerUI.update({ ...defaultHeaderData, remainingDays: 1 });

        expect(headerUI.getRemainingDaysColor()).toBe(0xff0000);
        expect(headerUI.isRemainingDaysBlinking()).toBe(true);
        expect(headerUI.getRemainingDaysText()).toBe('残り: 1日');
      });
    });
  });

  // ===========================================================================
  // SidebarUI テスト
  // ===========================================================================

  describe('SidebarUI', () => {
    describe('create()', () => {
      it('TC-0046-030: SidebarUI が BaseComponent を継承して正しく生成される', async () => {
        // 【テスト目的】: SidebarUIがBaseComponentを継承していることを確認
        // 【対応要件】: REQ-0046-020
        // 🔵 信頼性レベル: requirements.md セクション2.3に明記

        const { SidebarUI } = await import('@presentation/ui/components/SidebarUI');
        const { scene: mockScene } = createMockScene();

        const sidebarUI = new SidebarUI(mockScene, 0, 60);
        sidebarUI.create();

        expect(sidebarUI).toBeInstanceOf(BaseComponent);
        expect(sidebarUI.getContainer()).toBeDefined();
      });
    });

    describe('update()', () => {
      it('TC-0046-031: 受注依頼がアコーディオンセクションで表示される', async () => {
        // 【テスト目的】: 受注依頼セクションが正しく表示されることを確認
        // 【対応要件】: REQ-0046-020
        // 🔵 信頼性レベル: requirements.md セクション2.3に明記

        const { SidebarUI } = await import('@presentation/ui/components/SidebarUI');
        const { scene: mockScene } = createMockScene();

        const sidebarUI = new SidebarUI(mockScene, 0, 60);
        sidebarUI.create();

        sidebarUI.update({
          activeQuests: mockActiveQuests,
          materials: [],
          craftedItems: [],
          currentStorage: 0,
          maxStorage: 20,
        });

        expect(sidebarUI.getQuestsSection()).toBeDefined();
        expect(sidebarUI.getQuestsCount()).toBe(1);
      });

      it('TC-0046-032: 素材がアコーディオンセクションで表示される', async () => {
        // 【テスト目的】: 素材セクションが正しく表示されることを確認
        // 【対応要件】: REQ-0046-021
        // 🔵 信頼性レベル: requirements.md セクション2.3に明記

        const { SidebarUI } = await import('@presentation/ui/components/SidebarUI');
        const { scene: mockScene } = createMockScene();

        const sidebarUI = new SidebarUI(mockScene, 0, 60);
        sidebarUI.create();

        sidebarUI.update({
          activeQuests: [],
          materials: mockMaterials,
          craftedItems: [],
          currentStorage: 8,
          maxStorage: 20,
        });

        expect(sidebarUI.getMaterialsSection()).toBeDefined();
        expect(sidebarUI.getMaterialsCount()).toBe(2);
      });

      it('TC-0046-033: 完成品がアコーディオンセクションで表示される', async () => {
        // 【テスト目的】: 完成品セクションが正しく表示されることを確認
        // 【対応要件】: REQ-0046-022
        // 🔵 信頼性レベル: requirements.md セクション2.3に明記

        const { SidebarUI } = await import('@presentation/ui/components/SidebarUI');
        const { scene: mockScene } = createMockScene();

        const sidebarUI = new SidebarUI(mockScene, 0, 60);
        sidebarUI.create();

        sidebarUI.update({
          activeQuests: [],
          materials: [],
          craftedItems: mockCraftedItems,
          currentStorage: 2,
          maxStorage: 20,
        });

        expect(sidebarUI.getCraftedItemsSection()).toBeDefined();
        expect(sidebarUI.getCraftedItemsCount()).toBe(1);
      });

      it('TC-0046-034: 保管容量が正しく表示される', async () => {
        // 【テスト目的】: 保管容量が正しくフォーマットされることを確認
        // 【対応要件】: REQ-0046-023
        // 🟡 信頼性レベル: requirements.md セクション2.3に明記（黄信号）

        const { SidebarUI } = await import('@presentation/ui/components/SidebarUI');
        const { scene: mockScene } = createMockScene();

        const sidebarUI = new SidebarUI(mockScene, 0, 60);
        sidebarUI.create();

        sidebarUI.update({
          activeQuests: [],
          materials: [],
          craftedItems: [],
          currentStorage: 12,
          maxStorage: 20,
        });

        expect(sidebarUI.getStorageText()).toBe('保管: 12/20');
      });
    });

    describe('ショップボタン', () => {
      it('TC-0046-035: ショップボタンが表示される', async () => {
        // 【テスト目的】: ショップボタンが正しく表示されることを確認
        // 【対応要件】: REQ-0046-024
        // 🔵 信頼性レベル: requirements.md セクション2.3に明記

        const { SidebarUI } = await import('@presentation/ui/components/SidebarUI');
        const { scene: mockScene } = createMockScene();

        const sidebarUI = new SidebarUI(mockScene, 0, 60);
        sidebarUI.create();

        expect(sidebarUI.getShopButton()).toBeDefined();
      });
    });

    describe('toggleSection()', () => {
      it('TC-0046-036: セクションの折りたたみ切り替えができる', async () => {
        // 【テスト目的】: セクション折りたたみが正しく動作することを確認
        // 【対応要件】: REQ-0046-020
        // 🔵 信頼性レベル: requirements.md セクション2.3に明記

        const { SidebarUI } = await import('@presentation/ui/components/SidebarUI');
        const { scene: mockScene } = createMockScene();

        const sidebarUI = new SidebarUI(mockScene, 0, 60);
        sidebarUI.create();

        // 初期状態は展開
        expect(sidebarUI.isSectionCollapsed('quests')).toBe(false);

        // 折りたたみ
        sidebarUI.toggleSection('quests');
        expect(sidebarUI.isSectionCollapsed('quests')).toBe(true);

        // 展開
        sidebarUI.toggleSection('quests');
        expect(sidebarUI.isSectionCollapsed('quests')).toBe(false);
      });
    });

    describe('Error Handling', () => {
      it('TC-0046-E07: 無効なシーンでSidebarUI生成時にエラーが発生する', async () => {
        // 【テスト目的】: undefined sceneでエラーがスローされることを確認
        // 【対応要件】: REQ-0046-001（異常系）
        // 🔵 信頼性レベル: testcases.md セクション3.3に明記

        const { SidebarUI } = await import('@presentation/ui/components/SidebarUI');

        // biome-ignore lint/suspicious/noExplicitAny: 異常系テストのためundefinedキャストが必要
        expect(() => new SidebarUI(undefined as any, 0, 60)).toThrow('scene is required');
      });
    });
  });

  // ===========================================================================
  // FooterUI テスト
  // ===========================================================================

  describe('FooterUI', () => {
    describe('create()', () => {
      it('TC-0046-040: FooterUI が BaseComponent を継承して正しく生成される', async () => {
        // 【テスト目的】: FooterUIがBaseComponentを継承していることを確認
        // 【対応要件】: REQ-0046-030
        // 🔵 信頼性レベル: requirements.md セクション2.4に明記

        const { FooterUI } = await import('@presentation/ui/components/FooterUI');
        const { scene: mockScene } = createMockScene();

        const footerUI = new FooterUI(mockScene, 0, 600);
        footerUI.create();

        expect(footerUI).toBeInstanceOf(BaseComponent);
        expect(footerUI.getContainer()).toBeDefined();
      });

      it('TC-0046-041: 4フェーズのインジケーターが表示される', async () => {
        // 【テスト目的】: 4フェーズインジケーターが正しく表示されることを確認
        // 【対応要件】: REQ-0046-030
        // 🔵 信頼性レベル: requirements.md セクション2.4に明記

        const { FooterUI } = await import('@presentation/ui/components/FooterUI');
        const { scene: mockScene } = createMockScene();

        const footerUI = new FooterUI(mockScene, 0, 600);
        footerUI.create();

        expect(footerUI.getPhaseIndicators()).toHaveLength(4);
      });

      it('TC-0046-044: 手札表示エリアが配置される', async () => {
        // 【テスト目的】: 手札表示エリアが正しく配置されることを確認
        // 【対応要件】: REQ-0046-032
        // 🔵 信頼性レベル: requirements.md セクション2.4に明記

        const { FooterUI } = await import('@presentation/ui/components/FooterUI');
        const { scene: mockScene } = createMockScene();

        const footerUI = new FooterUI(mockScene, 0, 600);
        footerUI.create();

        expect(footerUI.getHandDisplayArea()).toBeDefined();
        expect(footerUI.getHandDisplayAreaCapacity()).toBe(5);
      });
    });

    describe('updatePhaseIndicator()', () => {
      it('TC-0046-042: QUEST_ACCEPTフェーズがハイライトされる', async () => {
        // 【テスト目的】: QUEST_ACCEPTフェーズが現在フェーズとしてハイライトされることを確認
        // 【対応要件】: REQ-0046-031
        // 🔵 信頼性レベル: requirements.md セクション2.4に明記

        const { FooterUI } = await import('@presentation/ui/components/FooterUI');
        const { scene: mockScene } = createMockScene();

        const footerUI = new FooterUI(mockScene, 0, 600);
        footerUI.create();

        footerUI.updatePhaseIndicator(GamePhase.QUEST_ACCEPT, []);

        expect(footerUI.getCurrentPhaseIndicatorState()).toBe('CURRENT');
        expect(footerUI.getPhaseIndicatorState(GamePhase.QUEST_ACCEPT)).toBe('CURRENT');
      });

      it('TC-0046-043: 完了したフェーズにチェックマークが表示される', async () => {
        // 【テスト目的】: 完了フェーズがCOMPLETED状態になることを確認
        // 【対応要件】: REQ-0046-030
        // 🔵 信頼性レベル: requirements.md セクション2.4に明記

        const { FooterUI } = await import('@presentation/ui/components/FooterUI');
        const { scene: mockScene } = createMockScene();

        const footerUI = new FooterUI(mockScene, 0, 600);
        footerUI.create();

        footerUI.updatePhaseIndicator(GamePhase.GATHERING, [GamePhase.QUEST_ACCEPT]);

        expect(footerUI.getPhaseIndicatorState(GamePhase.QUEST_ACCEPT)).toBe('COMPLETED');
        expect(footerUI.getPhaseIndicatorState(GamePhase.GATHERING)).toBe('CURRENT');
      });

      it('TC-0046-E02: 無効なフェーズでインジケーター更新時にエラー処理される', async () => {
        // 【テスト目的】: 無効なフェーズでエラーがスローされることを確認
        // 【対応要件】: REQ-0046-031（異常系）
        // 🔵 信頼性レベル: testcases.md セクション3.1に明記

        const { FooterUI } = await import('@presentation/ui/components/FooterUI');
        const { scene: mockScene } = createMockScene();

        const footerUI = new FooterUI(mockScene, 0, 600);
        footerUI.create();

        expect(() => {
          footerUI.updatePhaseIndicator('INVALID' as GamePhase, []);
        }).toThrow();
      });
    });

    describe('updateNextButton()', () => {
      it('TC-0046-045: QUEST_ACCEPTフェーズで「採取へ」ボタンが表示される', async () => {
        // 【テスト目的】: QUEST_ACCEPTフェーズで正しいボタンラベルが表示されることを確認
        // 【対応要件】: REQ-0046-033
        // 🔵 信頼性レベル: requirements.md セクション2.4に明記

        const { FooterUI } = await import('@presentation/ui/components/FooterUI');
        const { scene: mockScene } = createMockScene();

        const footerUI = new FooterUI(mockScene, 0, 600);
        footerUI.create();

        footerUI.updateNextButton('採取へ', true);

        expect(footerUI.getNextButtonLabel()).toBe('採取へ');
      });

      it('TC-0046-046: GATHERINGフェーズで「調合へ」ボタンが表示される', async () => {
        // 【テスト目的】: GATHERINGフェーズで正しいボタンラベルが表示されることを確認
        // 【対応要件】: REQ-0046-033
        // 🔵 信頼性レベル: requirements.md セクション2.4に明記

        const { FooterUI } = await import('@presentation/ui/components/FooterUI');
        const { scene: mockScene } = createMockScene();

        const footerUI = new FooterUI(mockScene, 0, 600);
        footerUI.create();

        footerUI.updateNextButton('調合へ', true);

        expect(footerUI.getNextButtonLabel()).toBe('調合へ');
      });

      it('TC-0046-047: ALCHEMYフェーズで「納品へ」ボタンが表示される', async () => {
        // 【テスト目的】: ALCHEMYフェーズで正しいボタンラベルが表示されることを確認
        // 【対応要件】: REQ-0046-033
        // 🔵 信頼性レベル: requirements.md セクション2.4に明記

        const { FooterUI } = await import('@presentation/ui/components/FooterUI');
        const { scene: mockScene } = createMockScene();

        const footerUI = new FooterUI(mockScene, 0, 600);
        footerUI.create();

        footerUI.updateNextButton('納品へ', true);

        expect(footerUI.getNextButtonLabel()).toBe('納品へ');
      });

      it('TC-0046-048: DELIVERYフェーズで「日終了」ボタンが表示される', async () => {
        // 【テスト目的】: DELIVERYフェーズで正しいボタンラベルが表示されることを確認
        // 【対応要件】: REQ-0046-033
        // 🔵 信頼性レベル: requirements.md セクション2.4に明記

        const { FooterUI } = await import('@presentation/ui/components/FooterUI');
        const { scene: mockScene } = createMockScene();

        const footerUI = new FooterUI(mockScene, 0, 600);
        footerUI.create();

        footerUI.updateNextButton('日終了', true);

        expect(footerUI.getNextButtonLabel()).toBe('日終了');
      });
    });

    describe('onNextClick()', () => {
      it('TC-0046-049: 次へボタンのクリックハンドラが呼び出される', async () => {
        // 【テスト目的】: 次へボタンクリック時にコールバックが呼ばれることを確認
        // 【対応要件】: REQ-0046-033
        // 🔵 信頼性レベル: requirements.md セクション2.4に明記

        const { FooterUI } = await import('@presentation/ui/components/FooterUI');
        const { scene: mockScene } = createMockScene();

        const footerUI = new FooterUI(mockScene, 0, 600);
        footerUI.create();
        const mockCallback = vi.fn();

        footerUI.onNextClick(mockCallback);
        footerUI.simulateNextButtonClick();

        expect(mockCallback).toHaveBeenCalled();
      });
    });

    describe('Error Handling', () => {
      it('TC-0046-E08: 無効な座標でFooterUI生成時にエラーが発生する', async () => {
        // 【テスト目的】: NaN座標でエラーがスローされることを確認
        // 【対応要件】: REQ-0046-001（異常系）
        // 🔵 信頼性レベル: testcases.md セクション3.3に明記

        const { FooterUI } = await import('@presentation/ui/components/FooterUI');
        const { scene: mockScene } = createMockScene();

        expect(() => new FooterUI(mockScene, NaN, 600)).toThrow('Invalid position');
      });
    });
  });
});
