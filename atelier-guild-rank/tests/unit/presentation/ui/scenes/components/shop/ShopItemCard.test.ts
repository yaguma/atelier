/**
 * ShopItemCard ユニットテスト
 * TASK-0056 ShopSceneリファクタリング
 *
 * @description
 * TC-SC-001 ~ TC-SC-014: 正常系テストケース
 * TC-SC-E01 ~ TC-SC-E02: 異常系テストケース
 * TC-SC-B01 ~ TC-SC-B03: 境界値テストケース
 * TC-SC-D01 ~ TC-SC-D02: 破棄処理テストケース
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
 * モックrexUIを作成
 */
const createMockRexUI = () => ({
  add: {
    label: vi.fn().mockReturnValue(createMockLabel()),
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

describe('ShopItemCard', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  // ===========================================================================
  // 1. 正常系テストケース
  // ===========================================================================

  describe('正常系', () => {
    // =========================================================================
    // TC-SC-001: 初期化テスト
    // =========================================================================

    describe('TC-SC-001: 初期化テスト', () => {
      // 【テスト目的】: コンポーネント初期化の確認
      // 【対応要件】: 既存コンポーネントテストパターン
      // 🔵 信頼性レベル: 既存コンポーネントテストパターンに基づく

      it('TC-SC-001: シーンとアイテム情報でShopItemCardを初期化するとコンテナが作成される', async () => {
        // Given: シーンとアイテム情報
        const { scene: mockScene } = createMockScene();
        const mockItem = createMockShopItem();
        const config = {
          item: mockItem,
          x: 0,
          y: 0,
          currentGold: 500,
          onPurchase: vi.fn(),
        };

        // When: ShopItemCardを初期化
        const { ShopItemCard } = await import(
          '@presentation/ui/scenes/components/shop/ShopItemCard'
        );
        const card = new ShopItemCard(mockScene, config);

        // Then: コンテナが作成される
        expect(card).toBeDefined();
        expect(card.getContainer()).toBeDefined();
      });
    });

    // =========================================================================
    // TC-SC-002: 商品名表示テスト
    // =========================================================================

    describe('TC-SC-002: 商品名表示テスト', () => {
      // 【テスト目的】: 商品名表示機能の確認
      // 【対応要件】: REQ-056-004（商品名を表示）
      // 🔵 信頼性レベル: REQ-056-004に基づく

      it('TC-SC-002: create()で商品名が正しく表示される', async () => {
        // Given: ShopItemCardインスタンス
        const { scene: mockScene } = createMockScene();
        const mockItem = createMockShopItem({ name: '強化ポーション' });
        const config = {
          item: mockItem,
          x: 0,
          y: 0,
          currentGold: 500,
          onPurchase: vi.fn(),
        };

        // When: create()を呼び出す
        const { ShopItemCard } = await import(
          '@presentation/ui/scenes/components/shop/ShopItemCard'
        );
        const card = new ShopItemCard(mockScene, config);
        card.create();

        // Then: 商品名テキストが表示される
        expect(mockScene.add.text).toHaveBeenCalled();
        const textCalls = (mockScene.add.text as ReturnType<typeof vi.fn>).mock.calls;
        const hasItemName = textCalls.some(
          (call: unknown[]) =>
            call[2] === '強化ポーション' || call[2]?.toString().includes('強化ポーション'),
        );
        expect(hasItemName).toBe(true);
      });
    });

    // =========================================================================
    // TC-SC-003: タイプ表示テスト（カード）
    // =========================================================================

    describe('TC-SC-003: タイプ表示テスト（カード）', () => {
      // 【テスト目的】: タイプ表示の確認
      // 【対応要件】: REQ-056-004（タイプを表示）
      // 🔵 信頼性レベル: REQ-056-004に基づく

      it('TC-SC-003: type="card"の商品で「[カード]」と表示される', async () => {
        // Given: カードタイプのアイテム
        const { scene: mockScene } = createMockScene();
        const mockItem = createMockShopItem({ type: 'card' });
        const config = {
          item: mockItem,
          x: 0,
          y: 0,
          currentGold: 500,
          onPurchase: vi.fn(),
        };

        // When: create()を呼び出す
        const { ShopItemCard } = await import(
          '@presentation/ui/scenes/components/shop/ShopItemCard'
        );
        const card = new ShopItemCard(mockScene, config);
        card.create();

        // Then: 「[カード]」テキストが表示される
        expect(mockScene.add.text).toHaveBeenCalled();
        const textCalls = (mockScene.add.text as ReturnType<typeof vi.fn>).mock.calls;
        const hasCardType = textCalls.some((call: unknown[]) =>
          call[2]?.toString().includes('[カード]'),
        );
        expect(hasCardType).toBe(true);
      });
    });

    // =========================================================================
    // TC-SC-004: タイプ表示テスト（素材）
    // =========================================================================

    describe('TC-SC-004: タイプ表示テスト（素材）', () => {
      // 【テスト目的】: タイプ変換の網羅確認
      // 【対応要件】: 現在のShopScene.tsの実装
      // 🔵 信頼性レベル: 現在のShopScene.tsの実装に基づく

      it('TC-SC-004: type="material"の商品で「[素材]」と表示される', async () => {
        // Given: 素材タイプのアイテム
        const { scene: mockScene } = createMockScene();
        const mockItem = createMockShopItem({ type: 'material' });
        const config = {
          item: mockItem,
          x: 0,
          y: 0,
          currentGold: 500,
          onPurchase: vi.fn(),
        };

        // When: create()を呼び出す
        const { ShopItemCard } = await import(
          '@presentation/ui/scenes/components/shop/ShopItemCard'
        );
        const card = new ShopItemCard(mockScene, config);
        card.create();

        // Then: 「[素材]」テキストが表示される
        expect(mockScene.add.text).toHaveBeenCalled();
        const textCalls = (mockScene.add.text as ReturnType<typeof vi.fn>).mock.calls;
        const hasMaterialType = textCalls.some((call: unknown[]) =>
          call[2]?.toString().includes('[素材]'),
        );
        expect(hasMaterialType).toBe(true);
      });
    });

    // =========================================================================
    // TC-SC-005: タイプ表示テスト（アーティファクト）
    // =========================================================================

    describe('TC-SC-005: タイプ表示テスト（アーティファクト）', () => {
      // 【テスト目的】: タイプ変換の網羅確認
      // 【対応要件】: 現在のShopScene.tsの実装
      // 🔵 信頼性レベル: 現在のShopScene.tsの実装に基づく

      it('TC-SC-005: type="artifact"の商品で「[アーティファクト]」と表示される', async () => {
        // Given: アーティファクトタイプのアイテム
        const { scene: mockScene } = createMockScene();
        const mockItem = createMockShopItem({ type: 'artifact' });
        const config = {
          item: mockItem,
          x: 0,
          y: 0,
          currentGold: 500,
          onPurchase: vi.fn(),
        };

        // When: create()を呼び出す
        const { ShopItemCard } = await import(
          '@presentation/ui/scenes/components/shop/ShopItemCard'
        );
        const card = new ShopItemCard(mockScene, config);
        card.create();

        // Then: 「[アーティファクト]」テキストが表示される
        expect(mockScene.add.text).toHaveBeenCalled();
        const textCalls = (mockScene.add.text as ReturnType<typeof vi.fn>).mock.calls;
        const hasArtifactType = textCalls.some((call: unknown[]) =>
          call[2]?.toString().includes('[アーティファクト]'),
        );
        expect(hasArtifactType).toBe(true);
      });
    });

    // =========================================================================
    // TC-SC-006: 価格表示テスト
    // =========================================================================

    describe('TC-SC-006: 価格表示テスト', () => {
      // 【テスト目的】: 価格表示の確認
      // 【対応要件】: REQ-056-004（価格を表示）
      // 🔵 信頼性レベル: REQ-056-004に基づく

      it('TC-SC-006: price=100の商品で「100G」と表示される', async () => {
        // Given: 価格100のアイテム
        const { scene: mockScene } = createMockScene();
        const mockItem = createMockShopItem({ price: 100 });
        const config = {
          item: mockItem,
          x: 0,
          y: 0,
          currentGold: 500,
          onPurchase: vi.fn(),
        };

        // When: create()を呼び出す
        const { ShopItemCard } = await import(
          '@presentation/ui/scenes/components/shop/ShopItemCard'
        );
        const card = new ShopItemCard(mockScene, config);
        card.create();

        // Then: 「100G」が表示される
        expect(mockScene.add.text).toHaveBeenCalled();
        const textCalls = (mockScene.add.text as ReturnType<typeof vi.fn>).mock.calls;
        const hasPrice = textCalls.some(
          (call: unknown[]) => call[2] === '100G' || call[2]?.toString().includes('100G'),
        );
        expect(hasPrice).toBe(true);
      });
    });

    // =========================================================================
    // TC-SC-007: 在庫表示テスト（有限）
    // =========================================================================

    describe('TC-SC-007: 在庫表示テスト（有限）', () => {
      // 【テスト目的】: 在庫表示の確認
      // 【対応要件】: REQ-056-004（在庫を表示）
      // 🔵 信頼性レベル: REQ-056-004に基づく

      it('TC-SC-007: stock=3の商品で「在庫: 3」と表示される', async () => {
        // Given: 在庫3のアイテム
        const { scene: mockScene } = createMockScene();
        const mockItem = createMockShopItem({ stock: 3 });
        const config = {
          item: mockItem,
          x: 0,
          y: 0,
          currentGold: 500,
          onPurchase: vi.fn(),
        };

        // When: create()を呼び出す
        const { ShopItemCard } = await import(
          '@presentation/ui/scenes/components/shop/ShopItemCard'
        );
        const card = new ShopItemCard(mockScene, config);
        card.create();

        // Then: 「在庫: 3」が表示される
        expect(mockScene.add.text).toHaveBeenCalled();
        const textCalls = (mockScene.add.text as ReturnType<typeof vi.fn>).mock.calls;
        const hasStock = textCalls.some(
          (call: unknown[]) =>
            call[2]?.toString().includes('在庫') && call[2]?.toString().includes('3'),
        );
        expect(hasStock).toBe(true);
      });
    });

    // =========================================================================
    // TC-SC-008: 在庫表示テスト（無制限）
    // =========================================================================

    describe('TC-SC-008: 在庫表示テスト（無制限）', () => {
      // 【テスト目的】: 特殊値の表示確認
      // 【対応要件】: 現在のShopScene.tsの実装（TEXT.STOCK_UNLIMITED）
      // 🔵 信頼性レベル: 現在のShopScene.tsの実装に基づく

      it('TC-SC-008: stock=-1の商品で「∞」と表示される', async () => {
        // Given: 無制限在庫のアイテム
        const { scene: mockScene } = createMockScene();
        const mockItem = createMockShopItem({ stock: -1 });
        const config = {
          item: mockItem,
          x: 0,
          y: 0,
          currentGold: 500,
          onPurchase: vi.fn(),
        };

        // When: create()を呼び出す
        const { ShopItemCard } = await import(
          '@presentation/ui/scenes/components/shop/ShopItemCard'
        );
        const card = new ShopItemCard(mockScene, config);
        card.create();

        // Then: 「∞」が表示される
        expect(mockScene.add.text).toHaveBeenCalled();
        const textCalls = (mockScene.add.text as ReturnType<typeof vi.fn>).mock.calls;
        const hasUnlimited = textCalls.some((call: unknown[]) => call[2]?.toString().includes('∞'));
        expect(hasUnlimited).toBe(true);
      });
    });

    // =========================================================================
    // TC-SC-009: 購入ボタン表示テスト
    // =========================================================================

    describe('TC-SC-009: 購入ボタン表示テスト', () => {
      // 【テスト目的】: ボタン状態の確認
      // 【対応要件】: REQ-056-004（購入可否に応じてボタンの有効/無効）
      // 🔵 信頼性レベル: REQ-056-004に基づく

      it('TC-SC-009: 購入可能な商品で「購入」ボタンが有効状態で表示される', async () => {
        // Given: 購入可能なアイテム（所持金500G、価格100G）
        const { scene: mockScene, mockRexUI } = createMockScene();
        const mockItem = createMockShopItem({ price: 100, stock: 3 });
        const config = {
          item: mockItem,
          x: 0,
          y: 0,
          currentGold: 500,
          onPurchase: vi.fn(),
        };

        // When: create()を呼び出す
        const { ShopItemCard } = await import(
          '@presentation/ui/scenes/components/shop/ShopItemCard'
        );
        const card = new ShopItemCard(mockScene, config);
        card.create();

        // Then: 購入ボタンが有効状態
        expect(mockRexUI.add.label).toHaveBeenCalled();
        const mockLabel = mockRexUI.add.label();
        expect(mockLabel.setInteractive).toHaveBeenCalled();
      });
    });

    // =========================================================================
    // TC-SC-010: 購入ボタン無効化テスト
    // =========================================================================

    describe('TC-SC-010: 購入ボタン無効化テスト', () => {
      // 【テスト目的】: ボタン無効化の確認
      // 【対応要件】: REQ-056-004
      // 🔵 信頼性レベル: REQ-056-004に基づく

      it('TC-SC-010: 所持金不足で購入ボタンが無効化される', async () => {
        // Given: 所持金不足のアイテム（所持金100G、価格1000G）
        const { scene: mockScene, mockRexUI } = createMockScene();
        const mockItem = createMockShopItem({ price: 1000, stock: 3 });
        const config = {
          item: mockItem,
          x: 0,
          y: 0,
          currentGold: 100,
          onPurchase: vi.fn(),
        };

        // When: create()を呼び出す
        const { ShopItemCard } = await import(
          '@presentation/ui/scenes/components/shop/ShopItemCard'
        );
        const card = new ShopItemCard(mockScene, config);
        card.create();

        // Then: 購入ボタンが無効状態（alpha=0.5）
        const mockLabel = mockRexUI.add.label();
        expect(mockLabel.setAlpha).toHaveBeenCalledWith(0.5);
      });
    });

    // =========================================================================
    // TC-SC-011: 在庫切れ表示テスト
    // =========================================================================

    describe('TC-SC-011: 在庫切れ表示テスト', () => {
      // 【テスト目的】: 在庫切れ表示の確認
      // 【対応要件】: REQ-056-004（在庫切れ時に「売切」表示）
      // 🔵 信頼性レベル: REQ-056-004に基づく

      it('TC-SC-011: stock=0で「売切」ボタンが表示される', async () => {
        // Given: 在庫切れのアイテム
        const { scene: mockScene, mockRexUI } = createMockScene();
        const mockItem = createMockShopItem({ stock: 0 });
        const config = {
          item: mockItem,
          x: 0,
          y: 0,
          currentGold: 500,
          onPurchase: vi.fn(),
        };

        // When: create()を呼び出す
        const { ShopItemCard } = await import(
          '@presentation/ui/scenes/components/shop/ShopItemCard'
        );
        const card = new ShopItemCard(mockScene, config);
        card.create();

        // Then: 「売切」ボタンが無効状態で表示
        const labelCalls = mockRexUI.add.label.mock.calls;
        const hasSoldOutText = labelCalls.some((call: unknown[]) =>
          JSON.stringify(call).includes('売切'),
        );
        expect(hasSoldOutText).toBe(true);
      });
    });

    // =========================================================================
    // TC-SC-012: 購入ボタンクリックイベント
    // =========================================================================

    describe('TC-SC-012: 購入ボタンクリックイベント', () => {
      // 【テスト目的】: イベント発火の確認
      // 【対応要件】: REQ-056-030（コンポーネント間通信）
      // 🔵 信頼性レベル: REQ-056-030に基づく

      it('TC-SC-012: 購入ボタンをクリックするとonPurchaseコールバックが呼び出される', async () => {
        // Given: コールバック付きShopItemCard
        const { scene: mockScene, mockRexUI } = createMockScene();
        const mockItem = createMockShopItem({ id: 'item-001' });
        const onPurchase = vi.fn();
        const config = {
          item: mockItem,
          x: 0,
          y: 0,
          currentGold: 500,
          onPurchase,
        };

        // When: create()を呼び出し、クリックイベントをシミュレート
        const { ShopItemCard } = await import(
          '@presentation/ui/scenes/components/shop/ShopItemCard'
        );
        const card = new ShopItemCard(mockScene, config);
        card.create();

        // ボタンのonイベントハンドラを取得して実行
        const mockLabel = mockRexUI.add.label();
        const pointerdownCall = mockLabel.on.mock.calls.find(
          (call: unknown[]) => call[0] === 'pointerdown',
        );

        if (pointerdownCall) {
          pointerdownCall[1]();
        }

        // Then: onPurchaseがアイテムIDで呼び出される
        expect(onPurchase).toHaveBeenCalledWith('item-001');
      });
    });

    // =========================================================================
    // TC-SC-013: UIBackgroundBuilder使用テスト
    // =========================================================================

    describe('TC-SC-013: UIBackgroundBuilder使用テスト', () => {
      // 【テスト目的】: 共通ユーティリティ使用の確認
      // 【対応要件】: REQ-056-011（UIBackgroundBuilderの使用）
      // 🔵 信頼性レベル: REQ-056-011に基づく

      it('TC-SC-013: create()でUIBackgroundBuilderを使用してカード背景が作成される', async () => {
        // Given: ShopItemCardインスタンス
        const { scene: mockScene, mockGraphics } = createMockScene();
        const mockItem = createMockShopItem();
        const config = {
          item: mockItem,
          x: 0,
          y: 0,
          currentGold: 500,
          onPurchase: vi.fn(),
        };

        // When: create()を呼び出す
        const { ShopItemCard } = await import(
          '@presentation/ui/scenes/components/shop/ShopItemCard'
        );
        const card = new ShopItemCard(mockScene, config);
        card.create();

        // Then: Graphicsが作成される（UIBackgroundBuilder使用の証拠）
        expect(mockScene.add.graphics).toHaveBeenCalled();
        expect(mockGraphics.fillRoundedRect).toHaveBeenCalled();
      });
    });

    // =========================================================================
    // TC-SC-014: applyHoverAnimation使用テスト
    // =========================================================================

    describe('TC-SC-014: applyHoverAnimation使用テスト', () => {
      // 【テスト目的】: ホバーアニメーション適用の確認
      // 【対応要件】: REQ-056-013（applyHoverAnimationの使用）
      // 🔵 信頼性レベル: REQ-056-013に基づく

      it('TC-SC-014: create()でapplyHoverAnimationがカードに適用される', async () => {
        // Given: ShopItemCardインスタンス
        const { scene: mockScene, mockContainer } = createMockScene();
        const mockItem = createMockShopItem();
        const config = {
          item: mockItem,
          x: 0,
          y: 0,
          currentGold: 500,
          onPurchase: vi.fn(),
        };

        // When: create()を呼び出す
        const { ShopItemCard } = await import(
          '@presentation/ui/scenes/components/shop/ShopItemCard'
        );
        const card = new ShopItemCard(mockScene, config);
        card.create();

        // Then: ホバーイベントが設定される
        expect(mockContainer.on).toHaveBeenCalledWith('pointerover', expect.any(Function));
        expect(mockContainer.on).toHaveBeenCalledWith('pointerout', expect.any(Function));
      });
    });
  });

  // ===========================================================================
  // 2. 異常系テストケース
  // ===========================================================================

  describe('異常系', () => {
    // =========================================================================
    // TC-SC-E01: nullシーンでエラー
    // =========================================================================

    describe('TC-SC-E01: nullシーンでエラー', () => {
      // 【テスト目的】: 防御的プログラミングの確認
      // 【対応要件】: BaseComponent.tsの実装
      // 🔵 信頼性レベル: BaseComponent.tsの実装に基づく

      it('TC-SC-E01: nullシーンでコンストラクタを呼び出すとエラーがスローされる', async () => {
        // Given: nullシーン
        const { ShopItemCard } = await import(
          '@presentation/ui/scenes/components/shop/ShopItemCard'
        );
        const mockItem = createMockShopItem();
        const config = {
          item: mockItem,
          x: 0,
          y: 0,
          currentGold: 500,
          onPurchase: vi.fn(),
        };

        // When & Then: エラーがスローされる
        expect(() => new ShopItemCard(null as unknown as Phaser.Scene, config)).toThrow(
          'BaseComponent: scene is required',
        );
      });
    });

    // =========================================================================
    // TC-SC-E02: nullアイテムでエラー
    // =========================================================================

    describe('TC-SC-E02: nullアイテムでエラー', () => {
      // 【テスト目的】: 入力バリデーションの確認
      // 【対応要件】: CardUIのconfig.cardバリデーションパターン
      // 🟡 信頼性レベル: CardUIのconfig.cardバリデーションパターンに基づく

      it('TC-SC-E02: nullアイテムでコンストラクタを呼び出すとエラーがスローされる', async () => {
        // Given: nullアイテム
        const { scene: mockScene } = createMockScene();
        const { ShopItemCard } = await import(
          '@presentation/ui/scenes/components/shop/ShopItemCard'
        );
        const config = {
          item: null as unknown as IShopItem,
          x: 0,
          y: 0,
          currentGold: 500,
          onPurchase: vi.fn(),
        };

        // When & Then: エラーがスローされる
        expect(() => new ShopItemCard(mockScene, config)).toThrow('ShopItemCard: item is required');
      });
    });
  });

  // ===========================================================================
  // 3. 境界値テストケース
  // ===========================================================================

  describe('境界値', () => {
    // =========================================================================
    // TC-SC-B01: 価格0の商品
    // =========================================================================

    describe('TC-SC-B01: 価格0の商品', () => {
      // 【テスト目的】: 最小価格での動作確認
      // 【対応要件】: 一般的な境界値テストパターン
      // 🟡 信頼性レベル: 一般的な境界値テストパターン

      it('TC-SC-B01: price=0の商品で「0G」と表示される', async () => {
        // Given: 価格0のアイテム
        const { scene: mockScene } = createMockScene();
        const mockItem = createMockShopItem({ price: 0 });
        const config = {
          item: mockItem,
          x: 0,
          y: 0,
          currentGold: 500,
          onPurchase: vi.fn(),
        };

        // When: create()を呼び出す
        const { ShopItemCard } = await import(
          '@presentation/ui/scenes/components/shop/ShopItemCard'
        );
        const card = new ShopItemCard(mockScene, config);
        card.create();

        // Then: 「0G」が表示される
        expect(mockScene.add.text).toHaveBeenCalled();
        const textCalls = (mockScene.add.text as ReturnType<typeof vi.fn>).mock.calls;
        const hasZeroPrice = textCalls.some(
          (call: unknown[]) => call[2] === '0G' || call[2]?.toString().includes('0G'),
        );
        expect(hasZeroPrice).toBe(true);
      });
    });

    // =========================================================================
    // TC-SC-B02: 長い商品名の表示
    // =========================================================================

    describe('TC-SC-B02: 長い商品名の表示', () => {
      // 【テスト目的】: 長い文字列での動作確認
      // 【対応要件】: 一般的なUI境界値テスト
      // 🟡 信頼性レベル: 一般的なUI境界値テスト

      it('TC-SC-B02: 50文字の商品名が正しく表示される', async () => {
        // Given: 50文字の商品名
        const { scene: mockScene } = createMockScene();
        const longName = 'あ'.repeat(50);
        const mockItem = createMockShopItem({ name: longName });
        const config = {
          item: mockItem,
          x: 0,
          y: 0,
          currentGold: 500,
          onPurchase: vi.fn(),
        };

        // When: create()を呼び出す
        const { ShopItemCard } = await import(
          '@presentation/ui/scenes/components/shop/ShopItemCard'
        );
        const card = new ShopItemCard(mockScene, config);
        card.create();

        // Then: テキストが表示される
        expect(mockScene.add.text).toHaveBeenCalled();
      });
    });

    // =========================================================================
    // TC-SC-B03: 在庫1（最小有効値）
    // =========================================================================

    describe('TC-SC-B03: 在庫1（最小有効値）', () => {
      // 【テスト目的】: 最小在庫での動作確認
      // 【対応要件】: 一般的な境界値テストパターン
      // 🟡 信頼性レベル: 一般的な境界値テストパターン

      it('TC-SC-B03: stock=1の商品で「在庫: 1」と表示され購入可能', async () => {
        // Given: 在庫1のアイテム
        const { scene: mockScene, mockRexUI } = createMockScene();
        const mockItem = createMockShopItem({ stock: 1, price: 100 });
        const config = {
          item: mockItem,
          x: 0,
          y: 0,
          currentGold: 500,
          onPurchase: vi.fn(),
        };

        // When: create()を呼び出す
        const { ShopItemCard } = await import(
          '@presentation/ui/scenes/components/shop/ShopItemCard'
        );
        const card = new ShopItemCard(mockScene, config);
        card.create();

        // Then: 「在庫: 1」が表示され、ボタンが有効
        expect(mockScene.add.text).toHaveBeenCalled();
        const textCalls = (mockScene.add.text as ReturnType<typeof vi.fn>).mock.calls;
        const hasStock1 = textCalls.some(
          (call: unknown[]) =>
            call[2]?.toString().includes('在庫') && call[2]?.toString().includes('1'),
        );
        expect(hasStock1).toBe(true);

        const mockLabel = mockRexUI.add.label();
        expect(mockLabel.setInteractive).toHaveBeenCalled();
      });
    });
  });

  // ===========================================================================
  // 4. 破棄処理テストケース
  // ===========================================================================

  describe('破棄処理', () => {
    // =========================================================================
    // TC-SC-D01: destroy()でリソース解放
    // =========================================================================

    describe('TC-SC-D01: destroy()でリソース解放', () => {
      // 【テスト目的】: リソース管理の確認
      // 【対応要件】: NFR-056-010（メモリリーク防止）
      // 🔵 信頼性レベル: NFR-056-010に基づく

      it('TC-SC-D01: destroy()が呼び出されるとUIオブジェクトが破棄される', async () => {
        // Given: ShopItemCardインスタンス
        const { scene: mockScene, mockContainer } = createMockScene();
        const mockItem = createMockShopItem();
        const config = {
          item: mockItem,
          x: 0,
          y: 0,
          currentGold: 500,
          onPurchase: vi.fn(),
        };

        // When: create()を呼び出してからdestroy()
        const { ShopItemCard } = await import(
          '@presentation/ui/scenes/components/shop/ShopItemCard'
        );
        const card = new ShopItemCard(mockScene, config);
        card.create();
        card.destroy();

        // Then: コンテナが破棄される
        expect(mockContainer.destroy).toHaveBeenCalled();
      });
    });

    // =========================================================================
    // TC-SC-D02: removeHoverAnimationの呼び出し
    // =========================================================================

    describe('TC-SC-D02: removeHoverAnimationの呼び出し', () => {
      // 【テスト目的】: イベントリスナー解除の確認
      // 【対応要件】: NFR-056-010（イベントリスナーの解除）
      // 🔵 信頼性レベル: NFR-056-010に基づく

      it('TC-SC-D02: destroy()でremoveHoverAnimationが呼び出される', async () => {
        // Given: ホバーアニメーション適用済みのShopItemCard
        const { scene: mockScene, mockContainer } = createMockScene();
        const mockItem = createMockShopItem();
        const config = {
          item: mockItem,
          x: 0,
          y: 0,
          currentGold: 500,
          onPurchase: vi.fn(),
        };

        // When: create()を呼び出してからdestroy()
        const { ShopItemCard } = await import(
          '@presentation/ui/scenes/components/shop/ShopItemCard'
        );
        const card = new ShopItemCard(mockScene, config);
        card.create();
        card.destroy();

        // Then: イベントが解除される
        expect(mockContainer.off).toHaveBeenCalledWith('pointerover');
        expect(mockContainer.off).toHaveBeenCalledWith('pointerout');
      });
    });
  });
});
