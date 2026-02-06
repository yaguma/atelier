/**
 * ShopItemGrid ユニットテスト
 * TASK-0056 ShopSceneリファクタリング
 *
 * @description
 * TC-SG-001 ~ TC-SG-006: 正常系テストケース
 * TC-SG-E01 ~ TC-SG-E02: 異常系テストケース
 * TC-SG-B01 ~ TC-SG-B02: 境界値テストケース
 * TC-SG-D01: 破棄処理テストケース
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
  x: 0,
  y: 0,
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
      },
      rexUI: mockRexUI,
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
// テストスイート
// =============================================================================

describe('ShopItemGrid', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  // ===========================================================================
  // 1. 正常系テストケース
  // ===========================================================================

  describe('正常系', () => {
    // =========================================================================
    // TC-SG-001: 初期化テスト
    // =========================================================================

    describe('TC-SG-001: 初期化テスト', () => {
      // 【テスト目的】: コンポーネント初期化が正常に動作することを確認
      // 【対応要件】: RankUpコンポーネントの同等テストパターン
      // 🔵 信頼性レベル: RankUpコンポーネントの同等テストパターンに基づく

      it('TC-SG-001: シーンインスタンスでShopItemGridを初期化するとコンテナが作成される', async () => {
        // Given: シーンインスタンスと設定
        const { scene: mockScene } = createMockScene();
        const config = {
          items: [],
          onItemSelect: vi.fn(),
        };

        // When: ShopItemGridを初期化
        const { ShopItemGrid } = await import(
          '@presentation/ui/scenes/components/shop/ShopItemGrid'
        );
        const grid = new ShopItemGrid(mockScene, 0, 100, config);

        // Then: コンテナが作成される
        expect(grid).toBeDefined();
        expect(grid.getContainer()).toBeDefined();
      });
    });

    // =========================================================================
    // TC-SG-002: 空アイテムリストでの表示
    // =========================================================================

    describe('TC-SG-002: 空アイテムリストでの表示', () => {
      // 【テスト目的】: エッジケースの動作確認
      // 【対応要件】: 一般的な配列処理の境界値テスト
      // 🟡 信頼性レベル: 一般的な配列処理の境界値テスト

      it('TC-SG-002: 空のアイテムリストでcreate()を呼び出しても正常に動作する', async () => {
        // Given: 空のアイテムリスト
        const { scene: mockScene } = createMockScene();
        const config = {
          items: [],
          onItemSelect: vi.fn(),
        };

        // When: ShopItemGridを初期化してcreate()を呼び出す
        const { ShopItemGrid } = await import(
          '@presentation/ui/scenes/components/shop/ShopItemGrid'
        );
        const grid = new ShopItemGrid(mockScene, 0, 100, config);

        // Then: エラーなく動作する
        expect(() => grid.create()).not.toThrow();
      });
    });

    // =========================================================================
    // TC-SG-003: 複数アイテムのグリッド配置
    // =========================================================================

    describe('TC-SG-003: 複数アイテムのグリッド配置', () => {
      // 【テスト目的】: レイアウト計算の確認
      // 【対応要件】: REQ-056-003（3列グリッドレイアウト）
      // 🔵 信頼性レベル: REQ-056-003に基づく

      it('TC-SG-003: 3件のアイテムで3列1行のグリッドが作成される', async () => {
        // Given: 3件のアイテム
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
        const { ShopItemGrid } = await import(
          '@presentation/ui/scenes/components/shop/ShopItemGrid'
        );
        const grid = new ShopItemGrid(mockScene, 0, 100, config);
        grid.create();

        // Then: 3件のアイテムカードが作成される（グリッド配置）
        expect(grid.getItemCount()).toBe(3);
      });
    });

    // =========================================================================
    // TC-SG-004: 6件アイテムで2行グリッド
    // =========================================================================

    describe('TC-SG-004: 6件アイテムで2行グリッド', () => {
      // 【テスト目的】: 複数行レイアウトの確認
      // 【対応要件】: REQ-056-003（グリッドレイアウト）
      // 🔵 信頼性レベル: REQ-056-003に基づく

      it('TC-SG-004: 6件のアイテムで3列2行のグリッドが作成される', async () => {
        // Given: 6件のアイテム
        const { scene: mockScene } = createMockScene();
        const items = Array.from({ length: 6 }, (_, i) =>
          createMockShopItem({ id: `item-00${i + 1}`, name: `アイテム${i + 1}` }),
        );
        const config = {
          items,
          onItemSelect: vi.fn(),
        };

        // When: ShopItemGridを初期化してcreate()を呼び出す
        const { ShopItemGrid } = await import(
          '@presentation/ui/scenes/components/shop/ShopItemGrid'
        );
        const grid = new ShopItemGrid(mockScene, 0, 100, config);
        grid.create();

        // Then: 6件のアイテムカードが作成される（2行構成）
        expect(grid.getItemCount()).toBe(6);
        expect(grid.getRowCount()).toBe(2);
      });
    });

    // =========================================================================
    // TC-SG-005: アイテム選択イベント
    // =========================================================================

    describe('TC-SG-005: アイテム選択イベント', () => {
      // 【テスト目的】: イベント伝播の確認
      // 【対応要件】: REQ-056-003（商品選択時にイベントを発火）
      // 🔵 信頼性レベル: REQ-056-003に基づく

      it('TC-SG-005: アイテムカードがクリックされるとonItemSelectが呼び出される', async () => {
        // Given: アイテムと選択コールバック
        const { scene: mockScene } = createMockScene();
        const item = createMockShopItem();
        const onItemSelect = vi.fn();
        const config = {
          items: [item],
          onItemSelect,
        };

        // When: ShopItemGridを初期化してアイテムを選択
        const { ShopItemGrid } = await import(
          '@presentation/ui/scenes/components/shop/ShopItemGrid'
        );
        const grid = new ShopItemGrid(mockScene, 0, 100, config);
        grid.create();
        grid.selectItem(item.id);

        // Then: onItemSelectが呼び出される
        expect(onItemSelect).toHaveBeenCalledWith(item);
      });
    });

    // =========================================================================
    // TC-SG-006: アイテムリスト更新
    // =========================================================================

    describe('TC-SG-006: アイテムリスト更新', () => {
      // 【テスト目的】: 動的更新機能の確認
      // 【対応要件】: refreshItemList()の動作
      // 🟡 信頼性レベル: refreshItemList()の動作からの妥当な推測

      it('TC-SG-006: updateItems()で新しいアイテムリストに更新される', async () => {
        // Given: 初期アイテムリスト
        const { scene: mockScene } = createMockScene();
        const initialItems = [createMockShopItem({ id: 'item-001' })];
        const config = {
          items: initialItems,
          onItemSelect: vi.fn(),
        };

        // When: ShopItemGridを初期化して新しいアイテムリストに更新
        const { ShopItemGrid } = await import(
          '@presentation/ui/scenes/components/shop/ShopItemGrid'
        );
        const grid = new ShopItemGrid(mockScene, 0, 100, config);
        grid.create();

        const newItems = [
          createMockShopItem({ id: 'item-002', name: '新アイテム1' }),
          createMockShopItem({ id: 'item-003', name: '新アイテム2' }),
        ];
        grid.updateItems(newItems);

        // Then: アイテム数が更新される
        expect(grid.getItemCount()).toBe(2);
      });
    });
  });

  // ===========================================================================
  // 2. 異常系テストケース
  // ===========================================================================

  describe('異常系', () => {
    // =========================================================================
    // TC-SG-E01: nullシーンでエラー
    // =========================================================================

    describe('TC-SG-E01: nullシーンでエラー', () => {
      // 【テスト目的】: 防御的プログラミングの確認
      // 【対応要件】: BaseComponent.tsの実装
      // 🔵 信頼性レベル: BaseComponent.tsの実装に基づく

      it('TC-SG-E01: nullシーンでコンストラクタを呼び出すとエラーがスローされる', async () => {
        // Given: nullシーン
        const { ShopItemGrid } = await import(
          '@presentation/ui/scenes/components/shop/ShopItemGrid'
        );
        const config = {
          items: [],
          onItemSelect: vi.fn(),
        };

        // When & Then: エラーがスローされる
        expect(() => new ShopItemGrid(null as unknown as Phaser.Scene, 0, 100, config)).toThrow(
          'BaseComponent: scene is required',
        );
      });
    });

    // =========================================================================
    // TC-SG-E02: nullアイテムリストでエラー
    // =========================================================================

    describe('TC-SG-E02: nullアイテムリストでエラー', () => {
      // 【テスト目的】: 入力バリデーションの確認
      // 【対応要件】: 一般的な入力バリデーションパターン
      // 🟡 信頼性レベル: 一般的な入力バリデーションパターン

      it('TC-SG-E02: nullアイテムリストでコンストラクタを呼び出すとエラーがスローされる', async () => {
        // Given: nullアイテムリスト
        const { scene: mockScene } = createMockScene();
        const { ShopItemGrid } = await import(
          '@presentation/ui/scenes/components/shop/ShopItemGrid'
        );
        const config = {
          items: null as unknown as IShopItem[],
          onItemSelect: vi.fn(),
        };

        // When & Then: エラーがスローされる
        expect(() => new ShopItemGrid(mockScene, 0, 100, config)).toThrow(
          'ShopItemGrid: items is required',
        );
      });
    });
  });

  // ===========================================================================
  // 3. 境界値テストケース
  // ===========================================================================

  describe('境界値', () => {
    // =========================================================================
    // TC-SG-B01: 1件アイテムでのグリッド
    // =========================================================================

    describe('TC-SG-B01: 1件アイテムでのグリッド', () => {
      // 【テスト目的】: 最小アイテム数での動作確認
      // 【対応要件】: 一般的な境界値テストパターン
      // 🟡 信頼性レベル: 一般的な境界値テストパターン

      it('TC-SG-B01: 1件のアイテムで単一カードが正しく配置される', async () => {
        // Given: 1件のアイテム
        const { scene: mockScene } = createMockScene();
        const singleItem = createMockShopItem();
        const config = {
          items: [singleItem],
          onItemSelect: vi.fn(),
        };

        // When: ShopItemGridを初期化してcreate()を呼び出す
        const { ShopItemGrid } = await import(
          '@presentation/ui/scenes/components/shop/ShopItemGrid'
        );
        const grid = new ShopItemGrid(mockScene, 0, 100, config);
        grid.create();

        // Then: 1つのShopItemCardが作成される
        expect(grid.getItemCount()).toBe(1);
      });
    });

    // =========================================================================
    // TC-SG-B02: 大量アイテム（50件）でのパフォーマンス
    // =========================================================================

    describe('TC-SG-B02: 大量アイテム（50件）でのパフォーマンス', () => {
      // 【テスト目的】: 大量データでの動作確認
      // 【対応要件】: NFR-056-011（描画最適化）
      // 🟡 信頼性レベル: NFR-056-011からの妥当な推測

      it('TC-SG-B02: 50件のアイテムでも正常にグリッドが作成される', async () => {
        // Given: 50件のアイテム
        const { scene: mockScene } = createMockScene();
        const items = Array.from({ length: 50 }, (_, i) =>
          createMockShopItem({ id: `item-${i + 1}`, name: `アイテム${i + 1}` }),
        );
        const config = {
          items,
          onItemSelect: vi.fn(),
        };

        // When: ShopItemGridを初期化してcreate()を呼び出す
        const { ShopItemGrid } = await import(
          '@presentation/ui/scenes/components/shop/ShopItemGrid'
        );
        const grid = new ShopItemGrid(mockScene, 0, 100, config);
        grid.create();

        // Then: 50件のShopItemCardが作成される
        expect(grid.getItemCount()).toBe(50);
      });
    });
  });

  // ===========================================================================
  // 4. 破棄処理テストケース
  // ===========================================================================

  describe('破棄処理', () => {
    // =========================================================================
    // TC-SG-D01: destroy()で全カード破棄
    // =========================================================================

    describe('TC-SG-D01: destroy()で全カード破棄', () => {
      // 【テスト目的】: リソース管理の確認
      // 【対応要件】: NFR-056-010（メモリリーク防止）
      // 🔵 信頼性レベル: NFR-056-010に基づく

      it('TC-SG-D01: destroy()が呼び出されると全てのShopItemCardが破棄される', async () => {
        // Given: 3件のアイテムを持つShopItemGrid
        const { scene: mockScene, mockContainer } = createMockScene();
        const items = [
          createMockShopItem({ id: 'item-001' }),
          createMockShopItem({ id: 'item-002' }),
          createMockShopItem({ id: 'item-003' }),
        ];
        const config = {
          items,
          onItemSelect: vi.fn(),
        };

        // When: ShopItemGridを初期化してdestroy()を呼び出す
        const { ShopItemGrid } = await import(
          '@presentation/ui/scenes/components/shop/ShopItemGrid'
        );
        const grid = new ShopItemGrid(mockScene, 0, 100, config);
        grid.create();
        grid.destroy();

        // Then: コンテナが破棄される
        expect(mockContainer.destroy).toHaveBeenCalled();
      });
    });
  });
});
