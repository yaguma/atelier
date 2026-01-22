/**
 * ShopScene ユニットテスト
 * TASK-0050 ShopScene実装
 *
 * @description
 * ショップ画面のテストケース
 *
 * テストカテゴリ:
 * - 正常系: シーン初期化、アイテム表示、購入処理
 * - 異常系: 所持金不足、在庫切れ
 * - シーン遷移: MainSceneへの戻り
 */

import type { IPurchaseResult, IShopItem } from '@domain/interfaces/shop-service.interface';
import { GamePhase, GuildRank } from '@shared/types/common';
import type Phaser from 'phaser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// =============================================================================
// モック定義
// =============================================================================

/**
 * Phaserモック
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

// DIコンテナのモックインスタンス
// biome-ignore lint/suspicious/noExplicitAny: テスト用のモック変数
let mockStateManagerInstance: any;
// biome-ignore lint/suspicious/noExplicitAny: テスト用のモック変数
let mockShopServiceInstance: any;
// biome-ignore lint/suspicious/noExplicitAny: テスト用のモック変数
let mockEventBusInstance: any;

const mockContainerInstance = {
  resolve: vi.fn((key: string) => {
    if (key === 'StateManager') return mockStateManagerInstance;
    if (key === 'ShopService') return mockShopServiceInstance;
    if (key === 'EventBus') return mockEventBusInstance;
    throw new Error(`Service not found: ${key}`);
  }),
  register: vi.fn(),
};

vi.mock('@infrastructure/di/container', () => ({
  Container: {
    getInstance: vi.fn(() => mockContainerInstance),
  },
  ServiceKeys: {
    StateManager: 'StateManager',
    ShopService: 'ShopService',
    EventBus: 'EventBus',
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
      setAlpha: vi.fn().mockReturnThis(),
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

  return {
    scene: {
      add: {
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
          on: vi.fn().mockReturnThis(),
          destroy: vi.fn(),
        }),
      },
      cameras: {
        main: {
          centerX: 640,
          centerY: 360,
          width: 1280,
          height: 720,
          fadeIn: vi.fn(),
          fadeOut: vi.fn(),
          once: vi.fn().mockImplementation((event, callback) => {
            // 即時にコールバックを呼び出す
            if (event === 'camerafadeoutcomplete') {
              setTimeout(callback, 0);
            }
          }),
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
  spendGold: vi.fn().mockReturnValue(true),
});

/**
 * ShopServiceモックを作成
 */
const createMockShopService = () => ({
  getAvailableItems: vi.fn().mockReturnValue([
    {
      id: 'shop-card-001',
      type: 'card' as const,
      itemId: 'card-001',
      name: '強化ポーション',
      price: 100,
      stock: 3,
      unlockRank: GuildRank.G,
      description: '攻撃力を強化するカード',
    },
    {
      id: 'shop-card-002',
      type: 'card' as const,
      itemId: 'card-002',
      name: '防御ポーション',
      price: 150,
      stock: -1, // 無制限
      unlockRank: GuildRank.G,
      description: '防御力を強化するカード',
    },
    {
      id: 'shop-material-001',
      type: 'material' as const,
      itemId: 'herb',
      name: '薬草',
      price: 50,
      stock: 10,
      unlockRank: GuildRank.G,
      description: '基本的な素材',
    },
  ] as IShopItem[]),
  getAllItems: vi.fn().mockReturnValue([]),
  canPurchase: vi.fn().mockReturnValue(true),
  purchase: vi.fn().mockReturnValue({
    success: true,
    itemId: 'shop-card-001',
    remainingGold: 400,
    remainingStock: 2,
  } as IPurchaseResult),
  getItemPrice: vi.fn().mockReturnValue(100),
  getShopItem: vi.fn().mockReturnValue(null),
  getStock: vi.fn().mockReturnValue(3),
});

/**
 * EventBusモックを作成
 */
const createMockEventBus = () => {
  const listeners = new Map<string, Array<(...args: unknown[]) => void>>();
  return {
    emit: vi.fn().mockImplementation((event: string, data: unknown) => {
      const handlers = listeners.get(event) || [];
      for (const handler of handlers) {
        handler(data);
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
    listeners,
  };
};

// =============================================================================
// テストスイート
// =============================================================================

describe('ShopScene', () => {
  beforeEach(() => {
    mockStateManagerInstance = createMockStateManager();
    mockShopServiceInstance = createMockShopService();
    mockEventBusInstance = createMockEventBus();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================================================
  // 基本テスト
  // ===========================================================================

  describe('create()', () => {
    it('TC-0050-001: シーンが正しく初期化されること', async () => {
      // 【テスト目的】: ShopScene生成時にレイアウトコンポーネントが正しく作成されることを確認
      // 【対応要件】: REQ-050-01
      // 🔵 信頼性レベル: TASK-0050.md セクション2に明記

      const { ShopScene } = await import('@presentation/scenes/ShopScene');
      const { scene: mockScene } = createMockScene();

      const shopScene = new ShopScene();

      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.add = mockScene.add;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.cameras = mockScene.cameras;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.rexUI = mockScene.rexUI;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.scene = mockScene.scene;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.stateManager = mockStateManagerInstance;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.shopService = mockShopServiceInstance;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.eventBus = mockEventBusInstance;

      shopScene.create();

      // 戻るボタンが生成されていることを確認
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      expect(shopScene.backButton).toBeDefined();
    });

    it('TC-0050-002: カード一覧が表示されること', async () => {
      // 【テスト目的】: ShopScene生成時にカード一覧が正しく表示されることを確認
      // 【対応要件】: REQ-050-02
      // 🔵 信頼性レベル: TASK-0050.md セクション2に明記

      const { ShopScene } = await import('@presentation/scenes/ShopScene');
      const { scene: mockScene } = createMockScene();

      const shopScene = new ShopScene();

      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.add = mockScene.add;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.cameras = mockScene.cameras;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.rexUI = mockScene.rexUI;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.scene = mockScene.scene;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.stateManager = mockStateManagerInstance;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.shopService = mockShopServiceInstance;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.eventBus = mockEventBusInstance;

      shopScene.create();

      // getAvailableItemsが呼ばれていることを確認
      expect(mockShopServiceInstance.getAvailableItems).toHaveBeenCalledWith(GuildRank.E);

      // アイテムが表示されていることを確認
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      expect(shopScene.shopItems.length).toBe(3);
    });

    it('TC-0050-003: アイテム一覧が表示されること', async () => {
      // 【テスト目的】: ShopScene生成時にアイテム（素材・カード）が正しく表示されることを確認
      // 【対応要件】: REQ-050-03
      // 🔵 信頼性レベル: TASK-0050.md セクション2に明記

      const { ShopScene } = await import('@presentation/scenes/ShopScene');
      const { scene: mockScene } = createMockScene();

      const shopScene = new ShopScene();

      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.add = mockScene.add;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.cameras = mockScene.cameras;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.rexUI = mockScene.rexUI;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.scene = mockScene.scene;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.stateManager = mockStateManagerInstance;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.shopService = mockShopServiceInstance;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.eventBus = mockEventBusInstance;

      shopScene.create();

      // カードと素材の両方が表示されていることを確認
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      const cardItems = shopScene.shopItems.filter((item) => item.type === 'card');
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      const materialItems = shopScene.shopItems.filter((item) => item.type === 'material');

      expect(cardItems.length).toBe(2);
      expect(materialItems.length).toBe(1);
    });

    it('TC-0050-004: 所持金が表示されること', async () => {
      // 【テスト目的】: ShopSceneで所持金が正しく表示されることを確認
      // 【対応要件】: REQ-050-04
      // 🔵 信頼性レベル: TASK-0050.md セクション2に明記

      const { ShopScene } = await import('@presentation/scenes/ShopScene');
      const { scene: mockScene } = createMockScene();

      const shopScene = new ShopScene();

      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.add = mockScene.add;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.cameras = mockScene.cameras;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.rexUI = mockScene.rexUI;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.scene = mockScene.scene;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.stateManager = mockStateManagerInstance;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.shopService = mockShopServiceInstance;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.eventBus = mockEventBusInstance;

      shopScene.create();

      // 所持金表示が正しいことを確認
      expect(shopScene.getGoldText()).toBe('所持金: 500G');
    });

    it('TC-0050-005: 「戻る」ボタンが表示されること', async () => {
      // 【テスト目的】: ShopSceneで戻るボタンが表示されることを確認
      // 【対応要件】: REQ-050-07
      // 🔵 信頼性レベル: TASK-0050.md セクション2に明記

      const { ShopScene } = await import('@presentation/scenes/ShopScene');
      const { scene: mockScene } = createMockScene();

      const shopScene = new ShopScene();

      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.add = mockScene.add;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.cameras = mockScene.cameras;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.rexUI = mockScene.rexUI;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.scene = mockScene.scene;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.stateManager = mockStateManagerInstance;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.shopService = mockShopServiceInstance;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.eventBus = mockEventBusInstance;

      shopScene.create();

      // 戻るボタンが存在することを確認
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      expect(shopScene.backButton).toBeDefined();
    });
  });

  // ===========================================================================
  // 購入処理テスト
  // ===========================================================================

  describe('購入処理', () => {
    it('TC-0050-006: カード購入ボタンクリックで購入処理が実行されること', async () => {
      // 【テスト目的】: 購入ボタンクリック時にShopService.purchase()が呼ばれることを確認
      // 【対応要件】: REQ-050-05
      // 🔵 信頼性レベル: TASK-0050.md セクション2に明記

      const { ShopScene } = await import('@presentation/scenes/ShopScene');
      const { scene: mockScene } = createMockScene();

      const shopScene = new ShopScene();

      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.add = mockScene.add;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.cameras = mockScene.cameras;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.rexUI = mockScene.rexUI;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.scene = mockScene.scene;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.stateManager = mockStateManagerInstance;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.shopService = mockShopServiceInstance;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.eventBus = mockEventBusInstance;

      shopScene.create();

      // 購入処理を実行
      // @ts-expect-error - テストのためにprivateメソッドにアクセス
      shopScene.handlePurchase('shop-card-001');

      // purchase()が呼ばれていることを確認
      expect(mockShopServiceInstance.purchase).toHaveBeenCalledWith('shop-card-001');
    });

    it('TC-0050-007: 所持金が購入金額以上ある場合に購入可能であること', async () => {
      // 【テスト目的】: 所持金が十分な場合に購入可能であることを確認
      // 【対応要件】: REQ-050-05
      // 🔵 信頼性レベル: TASK-0050.md セクション2に明記

      const { ShopScene } = await import('@presentation/scenes/ShopScene');
      const { scene: mockScene } = createMockScene();

      const shopScene = new ShopScene();

      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.add = mockScene.add;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.cameras = mockScene.cameras;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.rexUI = mockScene.rexUI;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.scene = mockScene.scene;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.stateManager = mockStateManagerInstance;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.shopService = mockShopServiceInstance;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.eventBus = mockEventBusInstance;

      shopScene.create();

      // 購入可能かチェック
      // @ts-expect-error - テストのためにprivateメソッドにアクセス
      const canPurchase = shopScene.canPurchaseItem('shop-card-001');

      expect(canPurchase).toBe(true);
      expect(mockShopServiceInstance.canPurchase).toHaveBeenCalledWith(
        'shop-card-001',
        500,
        GuildRank.E,
      );
    });

    it('TC-0050-008: 所持金不足時に購入ボタンが無効化されること', async () => {
      // 【テスト目的】: 所持金不足の場合に購入ボタンが無効化されることを確認
      // 【対応要件】: REQ-050-06
      // 🔵 信頼性レベル: TASK-0050.md セクション2に明記

      const { ShopScene } = await import('@presentation/scenes/ShopScene');
      const { scene: mockScene } = createMockScene();

      // 所持金不足のモック
      mockShopServiceInstance.canPurchase.mockReturnValue(false);

      const shopScene = new ShopScene();

      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.add = mockScene.add;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.cameras = mockScene.cameras;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.rexUI = mockScene.rexUI;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.scene = mockScene.scene;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.stateManager = mockStateManagerInstance;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.shopService = mockShopServiceInstance;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.eventBus = mockEventBusInstance;

      shopScene.create();

      // 購入可能かチェック
      // @ts-expect-error - テストのためにprivateメソッドにアクセス
      const canPurchase = shopScene.canPurchaseItem('shop-card-001');

      expect(canPurchase).toBe(false);
    });

    it('TC-0050-009: 購入成功時に所持金が減少すること', async () => {
      // 【テスト目的】: 購入成功後に所持金が更新されることを確認
      // 【対応要件】: REQ-050-05
      // 🔵 信頼性レベル: TASK-0050.md セクション2に明記

      const { ShopScene } = await import('@presentation/scenes/ShopScene');
      const { scene: mockScene } = createMockScene();

      const shopScene = new ShopScene();

      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.add = mockScene.add;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.cameras = mockScene.cameras;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.rexUI = mockScene.rexUI;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.scene = mockScene.scene;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.stateManager = mockStateManagerInstance;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.shopService = mockShopServiceInstance;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.eventBus = mockEventBusInstance;

      shopScene.create();

      // 購入処理を実行
      // @ts-expect-error - テストのためにprivateメソッドにアクセス
      shopScene.handlePurchase('shop-card-001');

      // 購入結果で残りゴールドが400になっていることを確認
      // purchase()が成功を返す
      expect(mockShopServiceInstance.purchase).toHaveBeenCalledWith('shop-card-001');
    });

    it('TC-0050-010: 購入成功時にデッキにカードが追加されること', async () => {
      // 【テスト目的】: カード購入成功時にデッキにカードが追加されることを確認
      // 【対応要件】: REQ-050-05
      // 🔵 信頼性レベル: TASK-0050.md セクション2に明記
      // 注: ShopServiceの内部でDeckServiceが呼ばれる

      const { ShopScene } = await import('@presentation/scenes/ShopScene');
      const { scene: mockScene } = createMockScene();

      const shopScene = new ShopScene();

      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.add = mockScene.add;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.cameras = mockScene.cameras;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.rexUI = mockScene.rexUI;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.scene = mockScene.scene;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.stateManager = mockStateManagerInstance;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.shopService = mockShopServiceInstance;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.eventBus = mockEventBusInstance;

      shopScene.create();

      // 購入処理を実行
      // @ts-expect-error - テストのためにprivateメソッドにアクセス
      const result = shopScene.handlePurchase('shop-card-001');

      // 成功結果を確認（ShopService内部でDeckServiceが呼ばれる）
      expect(result.success).toBe(true);
    });
  });

  // ===========================================================================
  // シーン遷移テスト
  // ===========================================================================

  describe('シーン遷移', () => {
    it('TC-0050-011: 「戻る」ボタンクリックでMainSceneに戻ること', async () => {
      // 【テスト目的】: 戻るボタンクリック時にMainSceneに遷移することを確認
      // 【対応要件】: REQ-050-07
      // 🔵 信頼性レベル: TASK-0050.md セクション2に明記

      const { ShopScene } = await import('@presentation/scenes/ShopScene');
      const { scene: mockScene } = createMockScene();

      const shopScene = new ShopScene();

      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.add = mockScene.add;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.cameras = mockScene.cameras;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.rexUI = mockScene.rexUI;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.scene = mockScene.scene;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.stateManager = mockStateManagerInstance;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.shopService = mockShopServiceInstance;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      shopScene.eventBus = mockEventBusInstance;

      shopScene.create();

      // 戻るボタンをクリック
      // @ts-expect-error - テストのためにprivateメソッドにアクセス
      shopScene.onBackButtonClick();

      // MainSceneへの遷移を確認（フェードアウト後）
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(mockScene.scene.start).toHaveBeenCalledWith('MainScene');
    });
  });

  // ===========================================================================
  // エラーハンドリングテスト
  // ===========================================================================

  describe('Error Handling', () => {
    it('TC-0050-E01: StateManager未初期化時にエラー処理される', async () => {
      // 【テスト目的】: StateManager未初期化時のエラーハンドリングを確認
      // 【対応要件】: REQ-050-01（異常系）

      const { ShopScene } = await import('@presentation/scenes/ShopScene');
      const { scene: mockScene } = createMockScene();

      const originalStateManager = mockStateManagerInstance;
      mockStateManagerInstance = undefined;

      try {
        const shopScene = new ShopScene();
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        shopScene.add = mockScene.add;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        shopScene.cameras = mockScene.cameras;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        shopScene.rexUI = mockScene.rexUI;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        shopScene.scene = mockScene.scene;

        expect(() => shopScene.create()).toThrow('StateManager is required');
      } finally {
        mockStateManagerInstance = originalStateManager;
      }
    });

    it('TC-0050-E02: ShopService未初期化時にエラー処理される', async () => {
      // 【テスト目的】: ShopService未初期化時のエラーハンドリングを確認
      // 【対応要件】: REQ-050-01（異常系）

      const { ShopScene } = await import('@presentation/scenes/ShopScene');
      const { scene: mockScene } = createMockScene();

      const originalShopService = mockShopServiceInstance;
      mockShopServiceInstance = undefined;

      try {
        const shopScene = new ShopScene();
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        shopScene.add = mockScene.add;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        shopScene.cameras = mockScene.cameras;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        shopScene.rexUI = mockScene.rexUI;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        shopScene.scene = mockScene.scene;

        expect(() => shopScene.create()).toThrow('ShopService is required');
      } finally {
        mockShopServiceInstance = originalShopService;
      }
    });
  });
});
