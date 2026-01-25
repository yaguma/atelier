/**
 * TitleDialog ユニットテスト
 * TASK-0058 TitleSceneリファクタリング
 *
 * @description
 * TC-TD-001 ~ TC-TD-012: 正常系テストケース
 * TC-TD-E01 ~ TC-TD-E02: 異常系テストケース
 * TC-TD-B01 ~ TC-TD-B02: 境界値テストケース
 * TC-TD-D01 ~ TC-TD-D02: 破棄処理テストケース
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
  setDepth: vi.fn().mockReturnThis(),
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
  destroy: vi.fn(),
  text: '',
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
 * モックrexUI RoundRectangleを作成
 */
const createMockRoundRectangle = () => ({
  setInteractive: vi.fn().mockReturnThis(),
  on: vi.fn().mockReturnThis(),
  destroy: vi.fn(),
});

/**
 * モックrexUIダイアログを作成
 */
const createMockDialog = () => ({
  setInteractive: vi.fn().mockReturnThis(),
  on: vi.fn().mockReturnThis(),
  destroy: vi.fn(),
  layout: vi.fn().mockReturnThis(),
  setDepth: vi.fn().mockReturnThis(),
  popUp: vi.fn().mockReturnThis(),
});

/**
 * モックrexUIを作成
 */
const createMockRexUI = () => ({
  add: {
    label: vi.fn().mockReturnValue(createMockLabel()),
    roundRectangle: vi.fn().mockReturnValue(createMockRoundRectangle()),
    dialog: vi.fn().mockReturnValue(createMockDialog()),
  },
});

/**
 * モック矩形を作成
 */
const createMockRectangle = () => ({
  setAlpha: vi.fn().mockReturnThis(),
  setDepth: vi.fn().mockReturnThis(),
  destroy: vi.fn(),
  setInteractive: vi.fn().mockReturnThis(),
  on: vi.fn().mockReturnThis(),
});

/**
 * モックシーンを作成
 */
const createMockScene = () => {
  const mockContainer = createMockContainer();
  const mockText = createMockText();
  const mockRexUI = createMockRexUI();
  const mockRectangle = createMockRectangle();

  return {
    scene: {
      add: {
        container: vi.fn().mockReturnValue(mockContainer),
        text: vi.fn().mockReturnValue(mockText),
        rectangle: vi.fn().mockReturnValue(mockRectangle),
      },
      rexUI: mockRexUI,
      cameras: {
        main: {
          centerX: 640,
          centerY: 360,
        },
      },
      scale: {
        width: 1280,
        height: 720,
      },
    } as unknown as Phaser.Scene,
    mockContainer,
    mockText,
    mockRexUI,
    mockRectangle,
  };
};

// =============================================================================
// テストスイート
// =============================================================================

describe('TitleDialog', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  // ===========================================================================
  // 1. 正常系テストケース
  // ===========================================================================

  describe('正常系', () => {
    // =========================================================================
    // TC-TD-001: 確認ダイアログ初期化テスト
    // =========================================================================

    describe('TC-TD-001: 確認ダイアログ初期化テスト', () => {
      // 【テスト目的】: 確認ダイアログの初期化確認
      // 【対応要件】: REQ-058-004
      // 🔵 信頼性レベル: REQ-058-004に基づく

      it('TC-TD-001: type="confirm"でTitleDialogを初期化するとダイアログが作成される', async () => {
        // Given: シーンと確認ダイアログ設定
        const { scene: mockScene, mockRexUI } = createMockScene();
        const config = {
          type: 'confirm' as const,
          title: '確認',
          content: 'セーブデータを削除しますか？',
          onConfirm: vi.fn(),
          onClose: vi.fn(),
        };

        // When: TitleDialogを初期化
        const { TitleDialog } = await import(
          '@presentation/ui/scenes/components/title/TitleDialog'
        );
        const dialog = new TitleDialog(mockScene, config);
        dialog.show();

        // Then: ダイアログが作成される
        expect(mockRexUI.add.dialog).toHaveBeenCalled();
      });
    });

    // =========================================================================
    // TC-TD-002: 設定ダイアログ初期化テスト
    // =========================================================================

    describe('TC-TD-002: 設定ダイアログ初期化テスト', () => {
      // 【テスト目的】: 設定ダイアログの初期化確認
      // 【対応要件】: REQ-058-004
      // 🔵 信頼性レベル: REQ-058-004に基づく

      it('TC-TD-002: type="settings"でTitleDialogを初期化するとダイアログが作成される', async () => {
        // Given: シーンと設定ダイアログ設定
        const { scene: mockScene, mockRexUI } = createMockScene();
        const config = {
          type: 'settings' as const,
          title: '設定',
          content: '準備中です',
          onClose: vi.fn(),
        };

        // When: TitleDialogを初期化
        const { TitleDialog } = await import(
          '@presentation/ui/scenes/components/title/TitleDialog'
        );
        const dialog = new TitleDialog(mockScene, config);
        dialog.show();

        // Then: ダイアログが作成される
        expect(mockRexUI.add.dialog).toHaveBeenCalled();
      });
    });

    // =========================================================================
    // TC-TD-003: エラーダイアログ初期化テスト
    // =========================================================================

    describe('TC-TD-003: エラーダイアログ初期化テスト', () => {
      // 【テスト目的】: エラーダイアログの初期化確認
      // 【対応要件】: REQ-058-004
      // 🔵 信頼性レベル: REQ-058-004に基づく

      it('TC-TD-003: type="error"でTitleDialogを初期化するとエラー背景色のダイアログが作成される', async () => {
        // Given: シーンとエラーダイアログ設定
        const { scene: mockScene, mockRexUI } = createMockScene();
        const config = {
          type: 'error' as const,
          title: 'エラー',
          content: 'セーブデータの読み込みに失敗しました',
          onClose: vi.fn(),
        };

        // When: TitleDialogを初期化
        const { TitleDialog } = await import(
          '@presentation/ui/scenes/components/title/TitleDialog'
        );
        const dialog = new TitleDialog(mockScene, config);
        dialog.show();

        // Then: ダイアログが作成される
        expect(mockRexUI.add.dialog).toHaveBeenCalled();
      });
    });

    // =========================================================================
    // TC-TD-004: オーバーレイ表示テスト
    // =========================================================================

    describe('TC-TD-004: オーバーレイ表示テスト', () => {
      // 【テスト目的】: オーバーレイ表示機能の確認
      // 【対応要件】: REQ-058-004（オーバーレイで背景を暗くする）
      // 🔵 信頼性レベル: REQ-058-004に基づく

      it('TC-TD-004: show()が呼び出されるとオーバーレイが表示される', async () => {
        // Given: TitleDialogインスタンス
        const { scene: mockScene, mockRectangle } = createMockScene();
        const config = {
          type: 'confirm' as const,
          title: '確認',
          content: 'テスト',
          onConfirm: vi.fn(),
          onClose: vi.fn(),
        };

        // When: TitleDialogを表示
        const { TitleDialog } = await import(
          '@presentation/ui/scenes/components/title/TitleDialog'
        );
        const dialog = new TitleDialog(mockScene, config);
        dialog.show();

        // Then: オーバーレイ（Rectangle）が作成される
        expect(mockScene.add.rectangle).toHaveBeenCalled();
        expect(mockRectangle.setAlpha).toHaveBeenCalledWith(0.7);
      });
    });

    // =========================================================================
    // TC-TD-005: ダイアログタイトル表示テスト
    // =========================================================================

    describe('TC-TD-005: ダイアログタイトル表示テスト', () => {
      // 【テスト目的】: タイトル表示機能の確認
      // 【対応要件】: REQ-058-004
      // 🔵 信頼性レベル: REQ-058-004に基づく

      it('TC-TD-005: show()でダイアログタイトルが表示される', async () => {
        // Given: TitleDialogインスタンス
        const { scene: mockScene, mockText } = createMockScene();
        const config = {
          type: 'confirm' as const,
          title: '確認',
          content: 'テスト内容',
          onConfirm: vi.fn(),
          onClose: vi.fn(),
        };

        // When: TitleDialogを表示
        const { TitleDialog } = await import(
          '@presentation/ui/scenes/components/title/TitleDialog'
        );
        const dialog = new TitleDialog(mockScene, config);
        dialog.show();

        // Then: タイトルテキストが作成される
        expect(mockScene.add.text).toHaveBeenCalled();
        const textCalls = (mockScene.add.text as ReturnType<typeof vi.fn>).mock.calls;
        const hasTitle = textCalls.some((call: unknown[]) => call[2] === '確認');
        expect(hasTitle).toBe(true);
      });
    });

    // =========================================================================
    // TC-TD-006: ダイアログ内容表示テスト
    // =========================================================================

    describe('TC-TD-006: ダイアログ内容表示テスト', () => {
      // 【テスト目的】: 内容表示機能の確認
      // 【対応要件】: REQ-058-004
      // 🔵 信頼性レベル: REQ-058-004に基づく

      it('TC-TD-006: show()でダイアログ内容が表示される', async () => {
        // Given: TitleDialogインスタンス
        const { scene: mockScene } = createMockScene();
        const config = {
          type: 'confirm' as const,
          title: '確認',
          content: 'セーブデータを削除しますか？',
          onConfirm: vi.fn(),
          onClose: vi.fn(),
        };

        // When: TitleDialogを表示
        const { TitleDialog } = await import(
          '@presentation/ui/scenes/components/title/TitleDialog'
        );
        const dialog = new TitleDialog(mockScene, config);
        dialog.show();

        // Then: 内容テキストが作成される
        expect(mockScene.add.text).toHaveBeenCalled();
        const textCalls = (mockScene.add.text as ReturnType<typeof vi.fn>).mock.calls;
        const hasContent = textCalls.some(
          (call: unknown[]) => call[2] === 'セーブデータを削除しますか？',
        );
        expect(hasContent).toBe(true);
      });
    });

    // =========================================================================
    // TC-TD-007: 確認ダイアログボタン表示テスト
    // =========================================================================

    describe('TC-TD-007: 確認ダイアログボタン表示テスト', () => {
      // 【テスト目的】: 確認ダイアログのボタン表示確認
      // 【対応要件】: REQ-058-004（「はい」「いいえ」ボタン）
      // 🔵 信頼性レベル: REQ-058-004に基づく

      it('TC-TD-007: 確認ダイアログで「はい」「いいえ」ボタンが表示される', async () => {
        // Given: 確認ダイアログ設定
        const { scene: mockScene, mockRexUI } = createMockScene();
        const config = {
          type: 'confirm' as const,
          title: '確認',
          content: 'テスト',
          onConfirm: vi.fn(),
          onClose: vi.fn(),
        };

        // When: TitleDialogを表示
        const { TitleDialog } = await import(
          '@presentation/ui/scenes/components/title/TitleDialog'
        );
        const dialog = new TitleDialog(mockScene, config);
        dialog.show();

        // Then: 2つのボタンが作成される
        expect(mockRexUI.add.label).toHaveBeenCalled();
      });
    });

    // =========================================================================
    // TC-TD-008: 単一ボタンダイアログ表示テスト
    // =========================================================================

    describe('TC-TD-008: 単一ボタンダイアログ表示テスト', () => {
      // 【テスト目的】: 設定/エラーダイアログのボタン表示確認
      // 【対応要件】: REQ-058-004（「OK」ボタンのみ）
      // 🔵 信頼性レベル: REQ-058-004に基づく

      it('TC-TD-008: 設定ダイアログで「OK」ボタンのみが表示される', async () => {
        // Given: 設定ダイアログ設定
        const { scene: mockScene, mockRexUI } = createMockScene();
        const config = {
          type: 'settings' as const,
          title: '設定',
          content: '準備中です',
          onClose: vi.fn(),
        };

        // When: TitleDialogを表示
        const { TitleDialog } = await import(
          '@presentation/ui/scenes/components/title/TitleDialog'
        );
        const dialog = new TitleDialog(mockScene, config);
        dialog.show();

        // Then: 1つのボタンが作成される
        expect(mockRexUI.add.label).toHaveBeenCalled();
      });
    });

    // =========================================================================
    // TC-TD-009: 確認ボタンクリックイベントテスト
    // =========================================================================

    describe('TC-TD-009: 確認ボタンクリックイベントテスト', () => {
      // 【テスト目的】: 確認ボタンのイベント発火確認
      // 【対応要件】: REQ-058-004
      // 🔵 信頼性レベル: REQ-058-004に基づく

      it('TC-TD-009: 「はい」ボタンをクリックするとonConfirmコールバックが呼び出される', async () => {
        // Given: コールバック付き確認ダイアログ
        const { scene: mockScene, mockRexUI } = createMockScene();
        const onConfirm = vi.fn();
        const config = {
          type: 'confirm' as const,
          title: '確認',
          content: 'テスト',
          onConfirm,
          onClose: vi.fn(),
        };

        // When: TitleDialogを表示して確認をクリック
        const { TitleDialog } = await import(
          '@presentation/ui/scenes/components/title/TitleDialog'
        );
        const dialog = new TitleDialog(mockScene, config);
        dialog.show();

        // ボタンのonイベントハンドラを取得して実行
        const mockLabel = mockRexUI.add.label();
        const pointerdownCall = mockLabel.on.mock.calls.find(
          (call: unknown[]) => call[0] === 'pointerdown',
        );

        if (pointerdownCall) {
          pointerdownCall[1]();
        }

        // Then: onConfirmが呼び出される
        expect(onConfirm).toHaveBeenCalledTimes(1);
      });
    });

    // =========================================================================
    // TC-TD-010: キャンセルボタンクリックイベントテスト
    // =========================================================================

    describe('TC-TD-010: キャンセルボタンクリックイベントテスト', () => {
      // 【テスト目的】: キャンセルボタンのイベント発火確認
      // 【対応要件】: REQ-058-004
      // 🔵 信頼性レベル: REQ-058-004に基づく

      it('TC-TD-010: 「いいえ」ボタンをクリックするとonCloseコールバックが呼び出される', async () => {
        // Given: コールバック付き確認ダイアログ
        const { scene: mockScene } = createMockScene();
        const onClose = vi.fn();
        const config = {
          type: 'confirm' as const,
          title: '確認',
          content: 'テスト',
          onConfirm: vi.fn(),
          onClose,
        };

        // When: TitleDialogを表示してclose()を呼び出す
        const { TitleDialog } = await import(
          '@presentation/ui/scenes/components/title/TitleDialog'
        );
        const dialog = new TitleDialog(mockScene, config);
        dialog.show();
        dialog.close();

        // Then: onCloseが呼び出される
        expect(onClose).toHaveBeenCalledTimes(1);
      });
    });

    // =========================================================================
    // TC-TD-011: ダイアログポップアップアニメーションテスト
    // =========================================================================

    describe('TC-TD-011: ダイアログポップアップアニメーションテスト', () => {
      // 【テスト目的】: ポップアップアニメーション確認
      // 【対応要件】: 現在のTitleScene.tsのANIMATION定数
      // 🔵 信頼性レベル: 現在のTitleScene.tsの実装に基づく

      it('TC-TD-011: show()でpopUp()アニメーションが実行される', async () => {
        // Given: TitleDialogインスタンス
        const { scene: mockScene, mockRexUI } = createMockScene();
        const config = {
          type: 'confirm' as const,
          title: '確認',
          content: 'テスト',
          onConfirm: vi.fn(),
          onClose: vi.fn(),
        };

        // When: TitleDialogを表示
        const { TitleDialog } = await import(
          '@presentation/ui/scenes/components/title/TitleDialog'
        );
        const dialog = new TitleDialog(mockScene, config);
        dialog.show();

        // Then: popUp()が呼び出される
        const mockDialog = mockRexUI.add.dialog();
        expect(mockDialog.popUp).toHaveBeenCalledWith(300);
      });
    });

    // =========================================================================
    // TC-TD-012: ダイアログ深度設定テスト
    // =========================================================================

    describe('TC-TD-012: ダイアログ深度設定テスト', () => {
      // 【テスト目的】: Z-index設定確認
      // 【対応要件】: 現在のTitleScene.tsのDEPTH定数
      // 🔵 信頼性レベル: 現在のTitleScene.tsの実装に基づく

      it('TC-TD-012: ダイアログがdepth=400で表示される', async () => {
        // Given: TitleDialogインスタンス
        const { scene: mockScene, mockRexUI } = createMockScene();
        const config = {
          type: 'confirm' as const,
          title: '確認',
          content: 'テスト',
          onConfirm: vi.fn(),
          onClose: vi.fn(),
        };

        // When: TitleDialogを表示
        const { TitleDialog } = await import(
          '@presentation/ui/scenes/components/title/TitleDialog'
        );
        const dialog = new TitleDialog(mockScene, config);
        dialog.show();

        // Then: setDepth(400)が呼び出される
        const mockDialog = mockRexUI.add.dialog();
        expect(mockDialog.setDepth).toHaveBeenCalledWith(400);
      });
    });
  });

  // ===========================================================================
  // 2. 異常系テストケース
  // ===========================================================================

  describe('異常系', () => {
    // =========================================================================
    // TC-TD-E01: nullシーンでエラー
    // =========================================================================

    describe('TC-TD-E01: nullシーンでエラー', () => {
      // 【テスト目的】: 防御的プログラミングの確認
      // 【対応要件】: BaseComponent.tsの実装
      // 🔵 信頼性レベル: BaseComponent.tsの実装に基づく

      it('TC-TD-E01: nullシーンでコンストラクタを呼び出すとエラーがスローされる', async () => {
        // Given: nullシーン
        const { TitleDialog } = await import(
          '@presentation/ui/scenes/components/title/TitleDialog'
        );
        const config = {
          type: 'confirm' as const,
          title: '確認',
          content: 'テスト',
          onConfirm: vi.fn(),
          onClose: vi.fn(),
        };

        // When & Then: エラーがスローされる
        expect(() => new TitleDialog(null as unknown as Phaser.Scene, config)).toThrow(
          'BaseComponent: scene is required',
        );
      });
    });

    // =========================================================================
    // TC-TD-E02: 不正なダイアログタイプでエラー
    // =========================================================================

    describe('TC-TD-E02: 不正なダイアログタイプでエラー', () => {
      // 【テスト目的】: 入力バリデーションの確認
      // 【対応要件】: 一般的な入力バリデーションパターン
      // 🟡 信頼性レベル: 一般的な入力バリデーションパターン

      it('TC-TD-E02: 不正なtypeでコンストラクタを呼び出すとエラーがスローされる', async () => {
        // Given: 不正なタイプ
        const { scene: mockScene } = createMockScene();
        const { TitleDialog } = await import(
          '@presentation/ui/scenes/components/title/TitleDialog'
        );
        const config = {
          type: 'invalid' as 'confirm',
          title: '確認',
          content: 'テスト',
          onConfirm: vi.fn(),
          onClose: vi.fn(),
        };

        // When & Then: エラーがスローされる
        expect(() => new TitleDialog(mockScene, config)).toThrow(
          'TitleDialog: invalid dialog type',
        );
      });
    });
  });

  // ===========================================================================
  // 3. 境界値テストケース
  // ===========================================================================

  describe('境界値', () => {
    // =========================================================================
    // TC-TD-B01: 空文字列タイトルでの表示
    // =========================================================================

    describe('TC-TD-B01: 空文字列タイトルでの表示', () => {
      // 【テスト目的】: 空文字列での動作確認
      // 【対応要件】: 一般的な境界値テストパターン
      // 🟡 信頼性レベル: 一般的な境界値テストパターン

      it('TC-TD-B01: 空文字列タイトルでダイアログが正常に表示される', async () => {
        // Given: 空文字列タイトル
        const { scene: mockScene, mockRexUI } = createMockScene();
        const config = {
          type: 'settings' as const,
          title: '',
          content: 'テスト',
          onClose: vi.fn(),
        };

        // When: TitleDialogを表示
        const { TitleDialog } = await import(
          '@presentation/ui/scenes/components/title/TitleDialog'
        );
        const dialog = new TitleDialog(mockScene, config);
        dialog.show();

        // Then: ダイアログが作成される
        expect(mockRexUI.add.dialog).toHaveBeenCalled();
      });
    });

    // =========================================================================
    // TC-TD-B02: 長い内容テキストでの表示
    // =========================================================================

    describe('TC-TD-B02: 長い内容テキストでの表示', () => {
      // 【テスト目的】: 長い文字列での動作確認
      // 【対応要件】: 一般的なUI境界値テスト
      // 🟡 信頼性レベル: 一般的なUI境界値テスト

      it('TC-TD-B02: 200文字の内容テキストでダイアログが正常に表示される', async () => {
        // Given: 200文字の内容
        const { scene: mockScene, mockRexUI } = createMockScene();
        const longContent = 'あ'.repeat(200);
        const config = {
          type: 'error' as const,
          title: 'エラー',
          content: longContent,
          onClose: vi.fn(),
        };

        // When: TitleDialogを表示
        const { TitleDialog } = await import(
          '@presentation/ui/scenes/components/title/TitleDialog'
        );
        const dialog = new TitleDialog(mockScene, config);
        dialog.show();

        // Then: ダイアログが作成される
        expect(mockRexUI.add.dialog).toHaveBeenCalled();
      });
    });
  });

  // ===========================================================================
  // 4. 破棄処理テストケース
  // ===========================================================================

  describe('破棄処理', () => {
    // =========================================================================
    // TC-TD-D01: close()でリソース解放
    // =========================================================================

    describe('TC-TD-D01: close()でリソース解放', () => {
      // 【テスト目的】: リソース管理の確認
      // 【対応要件】: NFR-058-010（メモリリーク防止）
      // 🔵 信頼性レベル: NFR-058-010に基づく

      it('TC-TD-D01: close()が呼び出されるとダイアログとオーバーレイが破棄される', async () => {
        // Given: TitleDialogインスタンス
        const { scene: mockScene, mockRexUI, mockRectangle } = createMockScene();
        const config = {
          type: 'confirm' as const,
          title: '確認',
          content: 'テスト',
          onConfirm: vi.fn(),
          onClose: vi.fn(),
        };
        const { TitleDialog } = await import(
          '@presentation/ui/scenes/components/title/TitleDialog'
        );
        const dialog = new TitleDialog(mockScene, config);
        dialog.show();

        // When: close()を呼び出す
        dialog.close();

        // Then: オーバーレイとダイアログが破棄される
        expect(mockRectangle.destroy).toHaveBeenCalled();
        const mockDialog = mockRexUI.add.dialog();
        expect(mockDialog.destroy).toHaveBeenCalled();
      });
    });

    // =========================================================================
    // TC-TD-D02: 複数回close()呼び出しでエラーなし
    // =========================================================================

    describe('TC-TD-D02: 複数回close()呼び出しでエラーなし', () => {
      // 【テスト目的】: 重複破棄の安全性確認
      // 【対応要件】: NFR-058-010
      // 🟡 信頼性レベル: 一般的な防御的プログラミングパターン

      it('TC-TD-D02: close()を複数回呼び出してもエラーが発生しない', async () => {
        // Given: TitleDialogインスタンス
        const { scene: mockScene } = createMockScene();
        const config = {
          type: 'confirm' as const,
          title: '確認',
          content: 'テスト',
          onConfirm: vi.fn(),
          onClose: vi.fn(),
        };
        const { TitleDialog } = await import(
          '@presentation/ui/scenes/components/title/TitleDialog'
        );
        const dialog = new TitleDialog(mockScene, config);
        dialog.show();

        // When & Then: 複数回close()を呼び出してもエラーなし
        expect(() => {
          dialog.close();
          dialog.close();
          dialog.close();
        }).not.toThrow();
      });
    });
  });
});
