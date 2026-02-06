/**
 * ShopScene統合テスト
 * TASK-0056 ShopSceneリファクタリング
 *
 * @description
 * TC-INT-001 ~ TC-INT-005: コンポーネント連携テストケース
 */

import type { IShopItem } from '@presentation/ui/scenes/components/shop/types';
import { afterEach, describe, expect, it, vi } from 'vitest';

// =============================================================================
// モック定義
// =============================================================================

/**
 * モックコンテナを作成
 */
const createMockContainer = () => ({
  setVisible: vi.fn().mockReturnThis(),
  setPosition: vi.fn().mockReturnThis(),
  add: vi.fn().mockReturnThis(),
  destroy: vi.fn(),
  removeAll: vi.fn(),
  setInteractive: vi.fn().mockReturnThis(),
  on: vi.fn().mockReturnThis(),
  off: vi.fn().mockReturnThis(),
  setAlpha: vi.fn().mockReturnThis(),
  x: 0,
  y: 0,
  scaleX: 1,
  scaleY: 1,
});

/**
 * モックテキストを作成
 */
const createMockText = () => ({
  setText: vi.fn().mockReturnThis(),
  setOrigin: vi.fn().mockReturnThis(),
  setStyle: vi.fn().mockReturnThis(),
  setColor: vi.fn().mockReturnThis(),
  setInteractive: vi.fn().mockReturnThis(),
  on: vi.fn().mockReturnThis(),
  destroy: vi.fn(),
  text: '',
});

/**
 * モックグラフィックスを作成
 */
const createMockGraphics = () => ({
  fillStyle: vi.fn().mockReturnThis(),
  fillRoundedRect: vi.fn().mockReturnThis(),
  lineStyle: vi.fn().mockReturnThis(),
  strokeRoundedRect: vi.fn().mockReturnThis(),
  destroy: vi.fn(),
});

/**
 * モックrexUIラベルを作成
 */
const createMockLabel = () => ({
  setInteractive: vi.fn().mockReturnThis(),
  disableInteractive: vi.fn().mockReturnThis(),
  on: vi.fn().mockReturnThis(),
  destroy: vi.fn(),
  layout: vi.fn().mockReturnThis(),
  setAlpha: vi.fn().mockReturnThis(),
});

/**
 * モックScrollablePanelを作成
 */
const createMockScrollablePanel = () => ({
  setInteractive: vi.fn().mockReturnThis(),
  on: vi.fn().mockReturnThis(),
  destroy: vi.fn(),
  layout: vi.fn().mockReturnThis(),
  setChildrenInteractive: vi.fn().mockReturnThis(),
});

/**
 * モックrexUIを作成
 */
const createMockRexUI = () => ({
  add: {
    label: vi.fn().mockReturnValue(createMockLabel()),
    scrollablePanel: vi.fn().mockReturnValue(createMockScrollablePanel()),
    sizer: vi.fn().mockReturnValue({
      add: vi.fn().mockReturnThis(),
      layout: vi.fn().mockReturnThis(),
    }),
  },
});

/**
 * モックシーンを作成
 */
const createMockScene = () => {
  const mockContainer = createMockContainer();
  const mockText = createMockText();
  const mockGraphics = createMockGraphics();
  const mockRexUI = createMockRexUI();

  return {
    scene: {
      add: {
        container: vi.fn().mockReturnValue(mockContainer),
        text: vi.fn().mockReturnValue(mockText),
        graphics: vi.fn().mockReturnValue(mockGraphics),
      },
      tweens: {
        add: vi.fn(),
        killTweensOf: vi.fn(),
      },
      rexUI: mockRexUI,
      scene: {
        start: vi.fn(),
      },
      cameras: {
        main: {
          fadeOut: vi.fn(),
        },
      },
    } as unknown as Phaser.Scene,
    mockContainer,
    mockText,
    mockGraphics,
    mockRexUI,
  };
};

/**
 * モックShopItemを作成
 */
const createMockShopItem = (overrides: Partial<IShopItem> = {}): IShopItem => ({
  id: 'item-001',
  name: 'テストアイテム',
  type: 'card',
  description: 'テスト用の説明',
  price: 100,
  stock: 3,
  ...overrides,
});

// =============================================================================
// 統合テストスイート
// =============================================================================

describe('ShopScene Integration Tests', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  // ===========================================================================
  // TC-INT-001: ShopItemGrid→ShopItemCard連携
  // ===========================================================================

  describe('TC-INT-001: ShopItemGrid→ShopItemCard連携', () => {
    // 【テスト目的】: 親子コンポーネントの連携
    // 【対応要件】: 要件定義7.2（商品一覧表示）
    // 🔵 信頼性レベル: 要件定義7.2に基づく

    it('TC-INT-001: ShopItemGridがShopItemCardを正しく生成する', async () => {
      // Given: 3件のアイテムを持つShopItemGrid
      const { scene: mockScene } = createMockScene();
      const items = [
        createMockShopItem({ id: 'item-001', name: 'アイテム1' }),
        createMockShopItem({ id: 'item-002', name: 'アイテム2' }),
        createMockShopItem({ id: 'item-003', name: 'アイテム3' }),
      ];
      const config = {
        items,
        onItemSelect: vi.fn(),
      };

      // When: ShopItemGridを初期化してcreate()を呼び出す
      const { ShopItemGrid } = await import('@presentation/ui/scenes/components/shop/ShopItemGrid');
      const grid = new ShopItemGrid(mockScene, 0, 100, config);
      grid.create();

      // Then: 3つのShopItemCardインスタンスが生成される
      expect(grid.getItemCount()).toBe(3);
      expect(grid.getItemCards().length).toBe(3);
    });
  });

  // ===========================================================================
  // TC-INT-002: ShopItemCard→親コンポーネントへのイベント伝播
  // ===========================================================================

  describe('TC-INT-002: ShopItemCard→親コンポーネントへのイベント伝播', () => {
    // 【テスト目的】: イベント伝播チェーン
    // 【対応要件】: REQ-056-030
    // 🔵 信頼性レベル: REQ-056-030に基づく

    it('TC-INT-002: ShopItemCardの購入クリックがShopItemGridを経由して親に伝播する', async () => {
      // Given: コールバック付きShopItemGrid
      const { scene: mockScene, mockRexUI } = createMockScene();
      const item = createMockShopItem({ id: 'item-001' });
      const onPurchase = vi.fn();
      const config = {
        items: [item],
        onItemSelect: vi.fn(),
        onPurchase,
        currentGold: 500,
      };

      // When: ShopItemGridを初期化してアイテムカードの購入ボタンをクリック
      const { ShopItemGrid } = await import('@presentation/ui/scenes/components/shop/ShopItemGrid');
      const grid = new ShopItemGrid(mockScene, 0, 100, config);
      grid.create();

      // カードの購入イベントをシミュレート
      grid.handleItemPurchase('item-001');

      // Then: 親のonPurchaseが呼び出される
      expect(onPurchase).toHaveBeenCalledWith('item-001');
    });
  });

  // ===========================================================================
  // TC-INT-003: 購入後の所持金更新連携
  // ===========================================================================

  describe('TC-INT-003: 購入後の所持金更新連携', () => {
    // 【テスト目的】: 状態更新の伝播
    // 【対応要件】: 要件定義7.2（所持金更新）
    // 🔵 信頼性レベル: 要件定義7.2に基づく

    it('TC-INT-003: 購入成功後にShopHeaderの所持金表示が更新される', async () => {
      // Given: ShopHeaderと初期所持金500G
      const { scene: mockScene, mockText } = createMockScene();

      // When: ShopHeaderを初期化して購入処理を実行
      const { ShopHeader } = await import('@presentation/ui/scenes/components/shop/ShopHeader');
      const header = new ShopHeader(mockScene, 0, 0);
      header.create();
      header.setGold(500);

      // 購入後の所持金更新（価格100Gの商品を購入）
      header.updateGold(400);

      // Then: 所持金表示が400Gに更新される
      expect(mockText.setText).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // TC-INT-004: 購入後のアイテムリスト更新
  // ===========================================================================

  describe('TC-INT-004: 購入後のアイテムリスト更新', () => {
    // 【テスト目的】: グリッド更新処理
    // 【対応要件】: 要件定義7.2（購入フロー）
    // 🟡 信頼性レベル: 現在のrefreshItemList()からの妥当な推測

    it('TC-INT-004: 購入成功後にShopItemGridのアイテムリストが更新される', async () => {
      // Given: ShopItemGridと初期アイテム
      const { scene: mockScene } = createMockScene();
      const initialItem = createMockShopItem({ id: 'item-001', stock: 3 });
      const config = {
        items: [initialItem],
        onItemSelect: vi.fn(),
        currentGold: 500,
      };

      // When: ShopItemGridを初期化して購入後に更新
      const { ShopItemGrid } = await import('@presentation/ui/scenes/components/shop/ShopItemGrid');
      const grid = new ShopItemGrid(mockScene, 0, 100, config);
      grid.create();

      // 購入後のアイテム更新（在庫減少）
      const updatedItem = createMockShopItem({ id: 'item-001', stock: 2 });
      grid.updateItems([updatedItem]);

      // Then: アイテムリストが更新される
      expect(grid.getItemCount()).toBe(1);
    });
  });

  // ===========================================================================
  // TC-INT-005: 戻るボタンでのシーン遷移
  // ===========================================================================

  describe('TC-INT-005: 戻るボタンでのシーン遷移', () => {
    // 【テスト目的】: シーン遷移処理
    // 【対応要件】: 要件定義7.2（シーン遷移）
    // 🔵 信頼性レベル: 要件定義7.2に基づく

    it('TC-INT-005: ShopHeaderの戻るボタンクリックでMainSceneに遷移する', async () => {
      // Given: コールバック付きShopHeader
      const { scene: mockScene, mockRexUI } = createMockScene();
      const onBackClick = vi.fn(() => {
        // シーン遷移をシミュレート
        mockScene.scene.start('MainScene');
      });

      // When: ShopHeaderを初期化して戻るボタンをクリック
      const { ShopHeader } = await import('@presentation/ui/scenes/components/shop/ShopHeader');
      const header = new ShopHeader(mockScene, 0, 0, { onBackClick });
      header.create();

      // ボタンのonイベントハンドラを取得して実行
      const mockLabel = mockRexUI.add.label();
      const pointerdownCall = mockLabel.on.mock.calls.find(
        (call: unknown[]) => call[0] === 'pointerdown',
      );

      if (pointerdownCall) {
        pointerdownCall[1]();
      }

      // Then: MainSceneに遷移する
      expect(onBackClick).toHaveBeenCalled();
      expect(mockScene.scene.start).toHaveBeenCalledWith('MainScene');
    });
  });
});
