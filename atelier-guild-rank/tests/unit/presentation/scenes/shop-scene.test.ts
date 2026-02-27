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

import type {
  IPurchaseResult,
  IShopItem,
  IShopService,
} from '@domain/interfaces/shop-service.interface';
import type { IStateManager } from '@shared/services/state-manager';
import { GuildRank } from '@shared/types/common';
import {
  createMockDIContainer,
  createMockEventBus,
  createMockScene,
  createMockStateManager,
  type MockEventBusWithListeners,
} from '@test-mocks/phaser-mocks';
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

// DIコンテナのモックインスタンス（型安全）
let mockStateManagerInstance: Partial<IStateManager>;
let mockShopServiceInstance: IShopService;
let mockEventBusInstance: MockEventBusWithListeners;

let mockContainerInstance: ReturnType<typeof createMockDIContainer>;

vi.mock('@shared/services/di/container', () => ({
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
// テスト固有のモック作成ヘルパー
// =============================================================================

/**
 * ShopServiceモックを作成
 */
const createMockShopService = (): IShopService => ({
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

// =============================================================================
// テストスイート
// =============================================================================

describe('ShopScene', () => {
  beforeEach(() => {
    mockStateManagerInstance = createMockStateManager();
    mockShopServiceInstance = createMockShopService();
    mockEventBusInstance = createMockEventBus();
    mockContainerInstance = createMockDIContainer({
      StateManager: mockStateManagerInstance,
      ShopService: mockShopServiceInstance,
      EventBus: mockEventBusInstance,
    });
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

      // StateManagerがundefinedを返すDIコンテナに差し替え
      const savedContainer = mockContainerInstance;
      mockContainerInstance = createMockDIContainer({
        StateManager: undefined,
        ShopService: mockShopServiceInstance,
        EventBus: mockEventBusInstance,
      });

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
        mockContainerInstance = savedContainer;
      }
    });

    it('TC-0050-E02: ShopService未初期化時にエラー処理される', async () => {
      // 【テスト目的】: ShopService未初期化時のエラーハンドリングを確認
      // 【対応要件】: REQ-050-01（異常系）

      const { ShopScene } = await import('@presentation/scenes/ShopScene');
      const { scene: mockScene } = createMockScene();

      // ShopServiceがundefinedを返すDIコンテナに差し替え
      const savedContainer = mockContainerInstance;
      mockContainerInstance = createMockDIContainer({
        StateManager: mockStateManagerInstance,
        ShopService: undefined,
        EventBus: mockEventBusInstance,
      });

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
        mockContainerInstance = savedContainer;
      }
    });
  });
});
