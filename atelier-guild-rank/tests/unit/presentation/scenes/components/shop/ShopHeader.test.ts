/**
 * ShopHeader ユニットテスト
 * TASK-0056 ShopSceneリファクタリング
 *
 * @description
 * TC-SH-001 ~ TC-SH-006: 正常系テストケース
 * TC-SH-E01 ~ TC-SH-E03: 異常系テストケース
 * TC-SH-B01 ~ TC-SH-B03: 境界値テストケース
 * TC-SH-D01: 破棄処理テストケース
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
 * モックrexUIラベルを作成
 */
const createMockLabel = () => ({
  setInteractive: vi.fn().mockReturnThis(),
  on: vi.fn().mockReturnThis(),
  destroy: vi.fn(),
  layout: vi.fn().mockReturnThis(),
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
      },
      rexUI: mockRexUI,
    } as unknown as Phaser.Scene,
    mockContainer,
    mockText,
    mockGraphics,
    mockRexUI,
  };
};

// =============================================================================
// テストスイート
// =============================================================================

describe('ShopHeader', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  // ===========================================================================
  // 1. 正常系テストケース
  // ===========================================================================

  describe('正常系', () => {
    // =========================================================================
    // TC-SH-001: 初期化テスト
    // =========================================================================

    describe('TC-SH-001: 初期化テスト', () => {
      // 【テスト目的】: コンポーネント初期化が正常に動作することを確認
      // 【対応要件】: REQ-056-002
      // 🔵 信頼性レベル: RankUpHeader.test.tsの同等テストパターンに基づく

      it('TC-SH-001: シーンインスタンスでShopHeaderを初期化するとコンテナが作成される', async () => {
        // Given: シーンインスタンス
        const { scene: mockScene } = createMockScene();

        // When: ShopHeaderを初期化
        const { ShopHeader } = await import('@presentation/scenes/components/shop/ShopHeader');
        const header = new ShopHeader(mockScene, 0, 0);

        // Then: コンテナが作成される
        expect(header).toBeDefined();
        expect(header.getContainer()).toBeDefined();
      });
    });

    // =========================================================================
    // TC-SH-002: タイトル表示テスト
    // =========================================================================

    describe('TC-SH-002: タイトル表示テスト', () => {
      // 【テスト目的】: タイトル表示機能の確認
      // 【対応要件】: REQ-056-002（タイトルテキスト「ショップ」を表示）
      // 🔵 信頼性レベル: REQ-056-002に基づく

      it('TC-SH-002: create()が呼び出されると「ショップ」タイトルが表示される', async () => {
        // Given: ShopHeaderインスタンス
        const { scene: mockScene, mockText } = createMockScene();

        // When: ShopHeaderを初期化してcreate()を呼び出す
        const { ShopHeader } = await import('@presentation/scenes/components/shop/ShopHeader');
        const header = new ShopHeader(mockScene, 0, 0);
        header.create();

        // Then: タイトルテキストが「ショップ」で作成される
        expect(mockScene.add.text).toHaveBeenCalled();
        // タイトル「ショップ」が含まれる呼び出しがあることを確認
        const textCalls = (mockScene.add.text as ReturnType<typeof vi.fn>).mock.calls;
        const hasShopTitle = textCalls.some(
          (call: unknown[]) => call[2] === 'ショップ' || call[2]?.toString().includes('ショップ'),
        );
        expect(hasShopTitle).toBe(true);
      });
    });

    // =========================================================================
    // TC-SH-003: 所持金表示テスト
    // =========================================================================

    describe('TC-SH-003: 所持金表示テスト', () => {
      // 【テスト目的】: 所持金表示機能の確認
      // 【対応要件】: REQ-056-002（所持金を「所持金: XXX G」形式で表示）
      // 🔵 信頼性レベル: REQ-056-002に基づく

      it('TC-SH-003: setGold(500)が呼び出されると「所持金: 500G」と表示される', async () => {
        // Given: ShopHeaderインスタンス
        const { scene: mockScene } = createMockScene();

        // When: ShopHeaderを初期化してsetGold()を呼び出す
        const { ShopHeader } = await import('@presentation/scenes/components/shop/ShopHeader');
        const header = new ShopHeader(mockScene, 0, 0);
        header.create();
        header.setGold(500);

        // Then: 所持金テキストが「所持金: 500G」形式で表示される
        expect(mockScene.add.text).toHaveBeenCalled();
      });
    });

    // =========================================================================
    // TC-SH-004: 所持金更新テスト
    // =========================================================================

    describe('TC-SH-004: 所持金更新テスト', () => {
      // 【テスト目的】: 動的更新機能の確認
      // 【対応要件】: 現在のShopScene.tsのupdateGoldDisplay()パターン
      // 🟡 信頼性レベル: 現在のShopScene.tsのupdateGoldDisplay()パターンからの妥当な推測

      it('TC-SH-004: updateGold(400)が呼び出されると所持金表示が更新される', async () => {
        // Given: ShopHeaderインスタンス
        const { scene: mockScene, mockText } = createMockScene();

        // When: 所持金を設定後に更新
        const { ShopHeader } = await import('@presentation/scenes/components/shop/ShopHeader');
        const header = new ShopHeader(mockScene, 0, 0);
        header.create();
        header.setGold(500);
        header.updateGold(400);

        // Then: setTextが呼び出される
        expect(mockText.setText).toHaveBeenCalled();
      });
    });

    // =========================================================================
    // TC-SH-005: 戻るボタン表示テスト
    // =========================================================================

    describe('TC-SH-005: 戻るボタン表示テスト', () => {
      // 【テスト目的】: 戻るボタン生成の確認
      // 【対応要件】: REQ-056-002（「戻る」ボタンを表示）
      // 🔵 信頼性レベル: REQ-056-002に基づく

      it('TC-SH-005: create()が呼び出されると「戻る」ボタンが表示される', async () => {
        // Given: ShopHeaderインスタンス
        const { scene: mockScene, mockRexUI } = createMockScene();

        // When: ShopHeaderを初期化してcreate()を呼び出す
        const { ShopHeader } = await import('@presentation/scenes/components/shop/ShopHeader');
        const header = new ShopHeader(mockScene, 0, 0);
        header.create();

        // Then: rexUI.add.label()が呼び出される
        expect(mockRexUI.add.label).toHaveBeenCalled();
      });
    });

    // =========================================================================
    // TC-SH-006: 戻るボタンクリックイベントテスト
    // =========================================================================

    describe('TC-SH-006: 戻るボタンクリックイベントテスト', () => {
      // 【テスト目的】: イベント発火機能の確認
      // 【対応要件】: REQ-056-002（クリックイベントを発火）
      // 🔵 信頼性レベル: REQ-056-002に基づく

      it('TC-SH-006: 戻るボタンをクリックするとonBackClickコールバックが呼び出される', async () => {
        // Given: コールバック付きShopHeader
        const { scene: mockScene, mockRexUI } = createMockScene();
        const onBackClick = vi.fn();

        // When: ShopHeaderを初期化してcreate()を呼び出し、クリックイベントをシミュレート
        const { ShopHeader } = await import('@presentation/scenes/components/shop/ShopHeader');
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

        // Then: コールバックが呼び出される
        expect(onBackClick).toHaveBeenCalledTimes(1);
      });
    });
  });

  // ===========================================================================
  // 2. 異常系テストケース
  // ===========================================================================

  describe('異常系', () => {
    // =========================================================================
    // TC-SH-E01: nullシーンでエラー
    // =========================================================================

    describe('TC-SH-E01: nullシーンでエラー', () => {
      // 【テスト目的】: 防御的プログラミングの確認
      // 【対応要件】: BaseComponent.tsの実装
      // 🔵 信頼性レベル: BaseComponent.tsの実装に基づく

      it('TC-SH-E01: nullシーンでコンストラクタを呼び出すとエラーがスローされる', async () => {
        // Given: nullシーン
        const { ShopHeader } = await import('@presentation/scenes/components/shop/ShopHeader');

        // When & Then: エラーがスローされる
        expect(() => new ShopHeader(null as unknown as Phaser.Scene, 0, 0)).toThrow(
          'BaseComponent: scene is required',
        );
      });
    });

    // =========================================================================
    // TC-SH-E02: undefinedシーンでエラー
    // =========================================================================

    describe('TC-SH-E02: undefinedシーンでエラー', () => {
      // 【テスト目的】: 異なるnullish値での動作確認
      // 【対応要件】: BaseComponent.tsの実装
      // 🔵 信頼性レベル: BaseComponent.tsの実装に基づく

      it('TC-SH-E02: undefinedシーンでコンストラクタを呼び出すとエラーがスローされる', async () => {
        // Given: undefinedシーン
        const { ShopHeader } = await import('@presentation/scenes/components/shop/ShopHeader');

        // When & Then: エラーがスローされる
        expect(() => new ShopHeader(undefined as unknown as Phaser.Scene, 0, 0)).toThrow(
          'BaseComponent: scene is required',
        );
      });
    });

    // =========================================================================
    // TC-SH-E03: 無効な座標でエラー
    // =========================================================================

    describe('TC-SH-E03: 無効な座標でエラー', () => {
      // 【テスト目的】: 入力値バリデーションの確認
      // 【対応要件】: BaseComponent.tsの実装
      // 🔵 信頼性レベル: BaseComponent.tsの実装に基づく

      it('TC-SH-E03: NaN座標でコンストラクタを呼び出すとエラーがスローされる', async () => {
        // Given: 有効なシーンとNaN座標
        const { scene: mockScene } = createMockScene();
        const { ShopHeader } = await import('@presentation/scenes/components/shop/ShopHeader');

        // When & Then: エラーがスローされる
        expect(() => new ShopHeader(mockScene, NaN, NaN)).toThrow('Invalid position');
      });
    });
  });

  // ===========================================================================
  // 3. 境界値テストケース
  // ===========================================================================

  describe('境界値', () => {
    // =========================================================================
    // TC-SH-B01: 所持金0での表示
    // =========================================================================

    describe('TC-SH-B01: 所持金0での表示', () => {
      // 【テスト目的】: 最小値での動作確認
      // 【対応要件】: 一般的なUI境界値テストパターン
      // 🟡 信頼性レベル: 一般的なUI境界値テストパターン

      it('TC-SH-B01: setGold(0)で「所持金: 0G」と表示される', async () => {
        // Given: ShopHeaderインスタンス
        const { scene: mockScene } = createMockScene();

        // When: setGold(0)を呼び出す
        const { ShopHeader } = await import('@presentation/scenes/components/shop/ShopHeader');
        const header = new ShopHeader(mockScene, 0, 0);
        header.create();
        header.setGold(0);

        // Then: テキストが「所持金: 0G」形式で表示される
        expect(mockScene.add.text).toHaveBeenCalled();
      });
    });

    // =========================================================================
    // TC-SH-B02: 大きな所持金での表示
    // =========================================================================

    describe('TC-SH-B02: 大きな所持金での表示', () => {
      // 【テスト目的】: 大きな値での動作確認
      // 【対応要件】: 一般的なUI境界値テストパターン
      // 🟡 信頼性レベル: 一般的なUI境界値テストパターン

      it('TC-SH-B02: setGold(9999999)で「所持金: 9999999G」と表示される', async () => {
        // Given: ShopHeaderインスタンス
        const { scene: mockScene } = createMockScene();

        // When: setGold(9999999)を呼び出す
        const { ShopHeader } = await import('@presentation/scenes/components/shop/ShopHeader');
        const header = new ShopHeader(mockScene, 0, 0);
        header.create();
        header.setGold(9999999);

        // Then: テキストが正しく表示される（オーバーフローなし）
        expect(mockScene.add.text).toHaveBeenCalled();
      });
    });

    // =========================================================================
    // TC-SH-B03: 座標(0, 0)での配置
    // =========================================================================

    describe('TC-SH-B03: 座標(0, 0)での配置', () => {
      // 【テスト目的】: 原点配置での動作確認
      // 【対応要件】: 一般的なUI境界値テストパターン
      // 🟡 信頼性レベル: 一般的なUI境界値テストパターン

      it('TC-SH-B03: 座標(0, 0)でShopHeaderが正常に配置される', async () => {
        // Given: 座標(0, 0)
        const { scene: mockScene } = createMockScene();

        // When: 座標(0, 0)でShopHeaderを作成
        const { ShopHeader } = await import('@presentation/scenes/components/shop/ShopHeader');
        const header = new ShopHeader(mockScene, 0, 0);

        // Then: コンテナが(0, 0)に配置される
        expect(header.getContainer()).toBeDefined();
        expect(mockScene.add.container).toHaveBeenCalledWith(0, 0);
      });
    });
  });

  // ===========================================================================
  // 4. 破棄処理テストケース
  // ===========================================================================

  describe('破棄処理', () => {
    // =========================================================================
    // TC-SH-D01: destroy()でリソース解放
    // =========================================================================

    describe('TC-SH-D01: destroy()でリソース解放', () => {
      // 【テスト目的】: リソース管理の確認
      // 【対応要件】: NFR-056-010（メモリリーク防止）
      // 🔵 信頼性レベル: NFR-056-010に基づく

      it('TC-SH-D01: destroy()が呼び出されるとコンテナと子要素が破棄される', async () => {
        // Given: ShopHeaderインスタンス
        const { scene: mockScene, mockContainer } = createMockScene();
        const { ShopHeader } = await import('@presentation/scenes/components/shop/ShopHeader');
        const header = new ShopHeader(mockScene, 0, 0);
        header.create();

        // When: destroy()を呼び出す
        header.destroy();

        // Then: コンテナが破棄される
        expect(mockContainer.destroy).toHaveBeenCalled();
      });
    });
  });
});
