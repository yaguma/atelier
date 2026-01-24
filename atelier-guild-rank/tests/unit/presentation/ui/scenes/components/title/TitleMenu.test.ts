/**
 * TitleMenu ユニットテスト
 * TASK-0058 TitleSceneリファクタリング
 *
 * @description
 * TC-TM-001 ~ TC-TM-009: 正常系テストケース
 * TC-TM-E01 ~ TC-TM-E02: 異常系テストケース
 * TC-TM-B01: 境界値テストケース
 * TC-TM-D01: 破棄処理テストケース
 */

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
 * モックrexUI RoundRectangleを作成
 */
const createMockRoundRectangle = () => ({
  setInteractive: vi.fn().mockReturnThis(),
  on: vi.fn().mockReturnThis(),
  destroy: vi.fn(),
});

/**
 * モックrexUIを作成
 */
const createMockRexUI = () => ({
  add: {
    label: vi.fn().mockReturnValue(createMockLabel()),
    roundRectangle: vi.fn().mockReturnValue(createMockRoundRectangle()),
  },
});

/**
 * モックシーンを作成
 */
const createMockScene = () => {
  const mockContainer = createMockContainer();
  const mockText = createMockText();
  const mockRexUI = createMockRexUI();

  return {
    scene: {
      add: {
        container: vi.fn().mockReturnValue(mockContainer),
        text: vi.fn().mockReturnValue(mockText),
      },
      rexUI: mockRexUI,
      cameras: {
        main: {
          centerX: 640,
          centerY: 360,
        },
      },
    } as unknown as Phaser.Scene,
    mockContainer,
    mockText,
    mockRexUI,
  };
};

// =============================================================================
// テストスイート
// =============================================================================

describe('TitleMenu', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  // ===========================================================================
  // 1. 正常系テストケース
  // ===========================================================================

  describe('正常系', () => {
    // =========================================================================
    // TC-TM-001: 初期化テスト
    // =========================================================================

    describe('TC-TM-001: 初期化テスト', () => {
      // 【テスト目的】: コンポーネント初期化が正常に動作することを確認
      // 【対応要件】: REQ-058-003
      // 🔵 信頼性レベル: ShopHeader.test.tsの同等テストパターンに基づく

      it('TC-TM-001: シーンインスタンスでTitleMenuを初期化するとコンテナが作成される', async () => {
        // Given: シーンインスタンスと設定
        const { scene: mockScene } = createMockScene();
        const config = {
          hasSaveData: false,
          onNewGame: vi.fn(),
          onContinue: vi.fn(),
          onSettings: vi.fn(),
        };

        // When: TitleMenuを初期化
        const { TitleMenu } = await import('@presentation/ui/scenes/components/title/TitleMenu');
        const menu = new TitleMenu(mockScene, 640, 400, config);

        // Then: コンテナが作成される
        expect(menu).toBeDefined();
        expect(menu.getContainer()).toBeDefined();
      });
    });

    // =========================================================================
    // TC-TM-002: 新規ゲームボタン表示テスト
    // =========================================================================

    describe('TC-TM-002: 新規ゲームボタン表示テスト', () => {
      // 【テスト目的】: ボタン表示機能の確認
      // 【対応要件】: REQ-058-003（「新規ゲーム」ボタンを表示）
      // 🔵 信頼性レベル: REQ-058-003に基づく

      it('TC-TM-002: create()が呼び出されると「新規ゲーム」ボタンが表示される', async () => {
        // Given: TitleMenuインスタンス
        const { scene: mockScene, mockRexUI } = createMockScene();
        const config = {
          hasSaveData: false,
          onNewGame: vi.fn(),
          onContinue: vi.fn(),
          onSettings: vi.fn(),
        };

        // When: TitleMenuを初期化してcreate()を呼び出す
        const { TitleMenu } = await import('@presentation/ui/scenes/components/title/TitleMenu');
        const menu = new TitleMenu(mockScene, 640, 400, config);
        menu.create();

        // Then: rexUI.add.label()が呼び出される
        expect(mockRexUI.add.label).toHaveBeenCalled();
      });
    });

    // =========================================================================
    // TC-TM-003: コンティニューボタン表示テスト（有効状態）
    // =========================================================================

    describe('TC-TM-003: コンティニューボタン表示テスト（有効状態）', () => {
      // 【テスト目的】: セーブデータ存在時のボタン状態確認
      // 【対応要件】: REQ-058-003（セーブデータ存在時は有効化）
      // 🔵 信頼性レベル: REQ-058-003に基づく

      it('TC-TM-003: hasSaveData=trueで「コンティニュー」ボタンが有効状態になる', async () => {
        // Given: セーブデータ存在
        const { scene: mockScene, mockRexUI } = createMockScene();
        const config = {
          hasSaveData: true,
          onNewGame: vi.fn(),
          onContinue: vi.fn(),
          onSettings: vi.fn(),
        };

        // When: TitleMenuを初期化してcreate()を呼び出す
        const { TitleMenu } = await import('@presentation/ui/scenes/components/title/TitleMenu');
        const menu = new TitleMenu(mockScene, 640, 400, config);
        menu.create();

        // Then: setAlpha(0.5)が呼び出されない（有効状態）
        const mockLabel = mockRexUI.add.label();
        const setAlphaCalls = mockLabel.setAlpha.mock.calls;
        const hasDisabledAlpha = setAlphaCalls.some((call: unknown[]) => call[0] === 0.5);
        expect(hasDisabledAlpha).toBe(false);
      });
    });

    // =========================================================================
    // TC-TM-004: コンティニューボタン表示テスト（無効状態）
    // =========================================================================

    describe('TC-TM-004: コンティニューボタン表示テスト（無効状態）', () => {
      // 【テスト目的】: セーブデータなし時のボタン状態確認
      // 【対応要件】: REQ-058-003（セーブデータなし時は無効化）
      // 🔵 信頼性レベル: REQ-058-003に基づく

      it('TC-TM-004: hasSaveData=falseで「コンティニュー」ボタンが無効状態（alpha=0.5）になる', async () => {
        // Given: セーブデータなし
        const { scene: mockScene, mockRexUI } = createMockScene();
        const config = {
          hasSaveData: false,
          onNewGame: vi.fn(),
          onContinue: vi.fn(),
          onSettings: vi.fn(),
        };

        // When: TitleMenuを初期化してcreate()を呼び出す
        const { TitleMenu } = await import('@presentation/ui/scenes/components/title/TitleMenu');
        const menu = new TitleMenu(mockScene, 640, 400, config);
        menu.create();

        // Then: setAlpha(0.5)が呼び出される（無効状態）
        const mockLabel = mockRexUI.add.label();
        expect(mockLabel.setAlpha).toHaveBeenCalledWith(0.5);
      });
    });

    // =========================================================================
    // TC-TM-005: 設定ボタン表示テスト
    // =========================================================================

    describe('TC-TM-005: 設定ボタン表示テスト', () => {
      // 【テスト目的】: 設定ボタン表示機能の確認
      // 【対応要件】: REQ-058-003（「設定」ボタンを表示）
      // 🔵 信頼性レベル: REQ-058-003に基づく

      it('TC-TM-005: create()が呼び出されると「設定」ボタンが表示される', async () => {
        // Given: TitleMenuインスタンス
        const { scene: mockScene, mockRexUI } = createMockScene();
        const config = {
          hasSaveData: false,
          onNewGame: vi.fn(),
          onContinue: vi.fn(),
          onSettings: vi.fn(),
        };

        // When: TitleMenuを初期化してcreate()を呼び出す
        const { TitleMenu } = await import('@presentation/ui/scenes/components/title/TitleMenu');
        const menu = new TitleMenu(mockScene, 640, 400, config);
        menu.create();

        // Then: 3つのボタン（新規ゲーム、コンティニュー、設定）が作成される
        expect(mockRexUI.add.label).toHaveBeenCalledTimes(3);
      });
    });

    // =========================================================================
    // TC-TM-006: 新規ゲームボタンクリックイベントテスト
    // =========================================================================

    describe('TC-TM-006: 新規ゲームボタンクリックイベントテスト', () => {
      // 【テスト目的】: イベント発火機能の確認
      // 【対応要件】: REQ-058-003
      // 🔵 信頼性レベル: REQ-058-003に基づく

      it('TC-TM-006: 新規ゲームボタンをクリックするとonNewGameコールバックが呼び出される', async () => {
        // Given: コールバック付きTitleMenu
        const { scene: mockScene, mockRexUI } = createMockScene();
        const onNewGame = vi.fn();
        const config = {
          hasSaveData: false,
          onNewGame,
          onContinue: vi.fn(),
          onSettings: vi.fn(),
        };

        // When: TitleMenuを初期化してcreate()を呼び出し、クリックイベントをシミュレート
        const { TitleMenu } = await import('@presentation/ui/scenes/components/title/TitleMenu');
        const menu = new TitleMenu(mockScene, 640, 400, config);
        menu.create();

        // ボタンのonイベントハンドラを取得して実行
        const mockLabel = mockRexUI.add.label();
        const pointerdownCall = mockLabel.on.mock.calls.find(
          (call: unknown[]) => call[0] === 'pointerdown',
        );

        if (pointerdownCall) {
          pointerdownCall[1]();
        }

        // Then: onNewGameが呼び出される
        expect(onNewGame).toHaveBeenCalledTimes(1);
      });
    });

    // =========================================================================
    // TC-TM-007: コンティニューボタンクリックイベントテスト
    // =========================================================================

    describe('TC-TM-007: コンティニューボタンクリックイベントテスト', () => {
      // 【テスト目的】: コンティニューボタンのイベント発火確認
      // 【対応要件】: REQ-058-003
      // 🔵 信頼性レベル: REQ-058-003に基づく

      it('TC-TM-007: 有効なコンティニューボタンをクリックするとonContinueコールバックが呼び出される', async () => {
        // Given: セーブデータ存在で有効なコンティニュー
        const { scene: mockScene, mockRexUI } = createMockScene();
        const onContinue = vi.fn();
        const config = {
          hasSaveData: true,
          onNewGame: vi.fn(),
          onContinue,
          onSettings: vi.fn(),
        };

        // When: TitleMenuを初期化してcreate()を呼び出し、クリックイベントをシミュレート
        const { TitleMenu } = await import('@presentation/ui/scenes/components/title/TitleMenu');
        const menu = new TitleMenu(mockScene, 640, 400, config);
        menu.create();

        // コンティニューボタンのクリックをシミュレート
        menu.handleContinueClick();

        // Then: onContinueが呼び出される
        expect(onContinue).toHaveBeenCalledTimes(1);
      });
    });

    // =========================================================================
    // TC-TM-008: 無効なコンティニューボタンクリック無視テスト
    // =========================================================================

    describe('TC-TM-008: 無効なコンティニューボタンクリック無視テスト', () => {
      // 【テスト目的】: 無効ボタンのクリック無視確認
      // 【対応要件】: REQ-058-003
      // 🔵 信頼性レベル: REQ-058-003に基づく

      it('TC-TM-008: 無効なコンティニューボタンをクリックしてもonContinueは呼び出されない', async () => {
        // Given: セーブデータなしで無効なコンティニュー
        const { scene: mockScene } = createMockScene();
        const onContinue = vi.fn();
        const config = {
          hasSaveData: false,
          onNewGame: vi.fn(),
          onContinue,
          onSettings: vi.fn(),
        };

        // When: TitleMenuを初期化してcreate()を呼び出し、クリックイベントをシミュレート
        const { TitleMenu } = await import('@presentation/ui/scenes/components/title/TitleMenu');
        const menu = new TitleMenu(mockScene, 640, 400, config);
        menu.create();

        // 無効なコンティニューボタンのクリックを試行
        menu.handleContinueClick();

        // Then: onContinueは呼び出されない
        expect(onContinue).not.toHaveBeenCalled();
      });
    });

    // =========================================================================
    // TC-TM-009: 設定ボタンクリックイベントテスト
    // =========================================================================

    describe('TC-TM-009: 設定ボタンクリックイベントテスト', () => {
      // 【テスト目的】: 設定ボタンのイベント発火確認
      // 【対応要件】: REQ-058-003
      // 🔵 信頼性レベル: REQ-058-003に基づく

      it('TC-TM-009: 設定ボタンをクリックするとonSettingsコールバックが呼び出される', async () => {
        // Given: コールバック付きTitleMenu
        const { scene: mockScene } = createMockScene();
        const onSettings = vi.fn();
        const config = {
          hasSaveData: false,
          onNewGame: vi.fn(),
          onContinue: vi.fn(),
          onSettings,
        };

        // When: TitleMenuを初期化してcreate()を呼び出し、クリックイベントをシミュレート
        const { TitleMenu } = await import('@presentation/ui/scenes/components/title/TitleMenu');
        const menu = new TitleMenu(mockScene, 640, 400, config);
        menu.create();

        // 設定ボタンのクリックをシミュレート
        menu.handleSettingsClick();

        // Then: onSettingsが呼び出される
        expect(onSettings).toHaveBeenCalledTimes(1);
      });
    });
  });

  // ===========================================================================
  // 2. 異常系テストケース
  // ===========================================================================

  describe('異常系', () => {
    // =========================================================================
    // TC-TM-E01: nullシーンでエラー
    // =========================================================================

    describe('TC-TM-E01: nullシーンでエラー', () => {
      // 【テスト目的】: 防御的プログラミングの確認
      // 【対応要件】: BaseComponent.tsの実装
      // 🔵 信頼性レベル: BaseComponent.tsの実装に基づく

      it('TC-TM-E01: nullシーンでコンストラクタを呼び出すとエラーがスローされる', async () => {
        // Given: nullシーン
        const { TitleMenu } = await import('@presentation/ui/scenes/components/title/TitleMenu');
        const config = {
          hasSaveData: false,
          onNewGame: vi.fn(),
          onContinue: vi.fn(),
          onSettings: vi.fn(),
        };

        // When & Then: エラーがスローされる
        expect(() => new TitleMenu(null as unknown as Phaser.Scene, 640, 400, config)).toThrow(
          'BaseComponent: scene is required',
        );
      });
    });

    // =========================================================================
    // TC-TM-E02: undefinedコールバックでエラー
    // =========================================================================

    describe('TC-TM-E02: undefinedコールバックでエラー', () => {
      // 【テスト目的】: 入力バリデーションの確認
      // 【対応要件】: 一般的な入力バリデーションパターン
      // 🟡 信頼性レベル: 一般的な入力バリデーションパターン

      it('TC-TM-E02: undefinedコールバックでコンストラクタを呼び出すとエラーがスローされる', async () => {
        // Given: undefinedコールバック
        const { scene: mockScene } = createMockScene();
        const { TitleMenu } = await import('@presentation/ui/scenes/components/title/TitleMenu');
        const config = {
          hasSaveData: false,
          onNewGame: undefined as unknown as () => void,
          onContinue: vi.fn(),
          onSettings: vi.fn(),
        };

        // When & Then: エラーがスローされる
        expect(() => new TitleMenu(mockScene, 640, 400, config)).toThrow(
          'TitleMenu: onNewGame callback is required',
        );
      });
    });
  });

  // ===========================================================================
  // 3. 境界値テストケース
  // ===========================================================================

  describe('境界値', () => {
    // =========================================================================
    // TC-TM-B01: 座標(0, 0)での配置
    // =========================================================================

    describe('TC-TM-B01: 座標(0, 0)での配置', () => {
      // 【テスト目的】: 原点配置での動作確認
      // 【対応要件】: 一般的なUI境界値テストパターン
      // 🟡 信頼性レベル: 一般的なUI境界値テストパターン

      it('TC-TM-B01: 座標(0, 0)でTitleMenuが正常に配置される', async () => {
        // Given: 座標(0, 0)
        const { scene: mockScene } = createMockScene();
        const config = {
          hasSaveData: false,
          onNewGame: vi.fn(),
          onContinue: vi.fn(),
          onSettings: vi.fn(),
        };

        // When: 座標(0, 0)でTitleMenuを作成
        const { TitleMenu } = await import('@presentation/ui/scenes/components/title/TitleMenu');
        const menu = new TitleMenu(mockScene, 0, 0, config);

        // Then: コンテナが(0, 0)に配置される
        expect(menu.getContainer()).toBeDefined();
        expect(mockScene.add.container).toHaveBeenCalledWith(0, 0);
      });
    });
  });

  // ===========================================================================
  // 4. 破棄処理テストケース
  // ===========================================================================

  describe('破棄処理', () => {
    // =========================================================================
    // TC-TM-D01: destroy()でリソース解放
    // =========================================================================

    describe('TC-TM-D01: destroy()でリソース解放', () => {
      // 【テスト目的】: リソース管理の確認
      // 【対応要件】: NFR-058-010（メモリリーク防止）
      // 🔵 信頼性レベル: NFR-058-010に基づく

      it('TC-TM-D01: destroy()が呼び出されるとコンテナとボタンが破棄される', async () => {
        // Given: TitleMenuインスタンス
        const { scene: mockScene, mockContainer } = createMockScene();
        const config = {
          hasSaveData: false,
          onNewGame: vi.fn(),
          onContinue: vi.fn(),
          onSettings: vi.fn(),
        };
        const { TitleMenu } = await import('@presentation/ui/scenes/components/title/TitleMenu');
        const menu = new TitleMenu(mockScene, 640, 400, config);
        menu.create();

        // When: destroy()を呼び出す
        menu.destroy();

        // Then: コンテナが破棄される
        expect(mockContainer.destroy).toHaveBeenCalled();
      });
    });
  });
});
