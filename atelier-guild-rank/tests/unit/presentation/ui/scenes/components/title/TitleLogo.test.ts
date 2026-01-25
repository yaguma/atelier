/**
 * TitleLogo ユニットテスト
 * TASK-0058 TitleSceneリファクタリング
 *
 * @description
 * TC-TL-001 ~ TC-TL-006: 正常系テストケース
 * TC-TL-E01 ~ TC-TL-E02: 異常系テストケース
 * TC-TL-B01: 境界値テストケース
 * TC-TL-D01: 破棄処理テストケース
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
  destroy: vi.fn(),
  text: '',
});

/**
 * モックシーンを作成
 */
const createMockScene = () => {
  const mockContainer = createMockContainer();
  const mockText = createMockText();

  return {
    scene: {
      add: {
        container: vi.fn().mockReturnValue(mockContainer),
        text: vi.fn().mockReturnValue(mockText),
      },
      cameras: {
        main: {
          centerX: 640,
          centerY: 360,
          width: 1280,
          height: 720,
        },
      },
    } as unknown as Phaser.Scene,
    mockContainer,
    mockText,
  };
};

// =============================================================================
// テストスイート
// =============================================================================

describe('TitleLogo', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  // ===========================================================================
  // 1. 正常系テストケース
  // ===========================================================================

  describe('正常系', () => {
    // =========================================================================
    // TC-TL-001: 初期化テスト
    // =========================================================================

    describe('TC-TL-001: 初期化テスト', () => {
      // 【テスト目的】: コンポーネント初期化が正常に動作することを確認
      // 【対応要件】: REQ-058-002
      // 🔵 信頼性レベル: ShopHeader.test.tsの同等テストパターンに基づく

      it('TC-TL-001: シーンインスタンスでTitleLogoを初期化するとコンテナが作成される', async () => {
        // Given: シーンインスタンス
        const { scene: mockScene } = createMockScene();

        // When: TitleLogoを初期化
        const { TitleLogo } = await import('@presentation/ui/scenes/components/title/TitleLogo');
        const logo = new TitleLogo(mockScene, 640, 200);

        // Then: コンテナが作成される
        expect(logo).toBeDefined();
        expect(logo.getContainer()).toBeDefined();
      });
    });

    // =========================================================================
    // TC-TL-002: タイトル表示テスト
    // =========================================================================

    describe('TC-TL-002: タイトル表示テスト', () => {
      // 【テスト目的】: タイトルテキスト表示機能の確認
      // 【対応要件】: REQ-058-002（タイトル「ATELIER GUILD」を表示）
      // 🔵 信頼性レベル: REQ-058-002に基づく

      it('TC-TL-002: create()が呼び出されると「ATELIER GUILD」タイトルが表示される', async () => {
        // Given: TitleLogoインスタンス
        const { scene: mockScene, mockText } = createMockScene();

        // When: TitleLogoを初期化してcreate()を呼び出す
        const { TitleLogo } = await import('@presentation/ui/scenes/components/title/TitleLogo');
        const logo = new TitleLogo(mockScene, 640, 200);
        logo.create();

        // Then: タイトルテキストが「ATELIER GUILD」で作成される
        expect(mockScene.add.text).toHaveBeenCalled();
        const textCalls = (mockScene.add.text as ReturnType<typeof vi.fn>).mock.calls;
        const hasTitle = textCalls.some(
          (call: unknown[]) =>
            call[2] === 'ATELIER GUILD' || call[2]?.toString().includes('ATELIER GUILD'),
        );
        expect(hasTitle).toBe(true);
      });
    });

    // =========================================================================
    // TC-TL-003: サブタイトル表示テスト
    // =========================================================================

    describe('TC-TL-003: サブタイトル表示テスト', () => {
      // 【テスト目的】: サブタイトル表示機能の確認
      // 【対応要件】: REQ-058-002（サブタイトル「錬金術師ギルド」を表示）
      // 🔵 信頼性レベル: REQ-058-002に基づく

      it('TC-TL-003: create()が呼び出されると「錬金術師ギルド」サブタイトルが表示される', async () => {
        // Given: TitleLogoインスタンス
        const { scene: mockScene } = createMockScene();

        // When: TitleLogoを初期化してcreate()を呼び出す
        const { TitleLogo } = await import('@presentation/ui/scenes/components/title/TitleLogo');
        const logo = new TitleLogo(mockScene, 640, 200);
        logo.create();

        // Then: サブタイトルテキストが「錬金術師ギルド」で作成される
        expect(mockScene.add.text).toHaveBeenCalled();
        const textCalls = (mockScene.add.text as ReturnType<typeof vi.fn>).mock.calls;
        const hasSubtitle = textCalls.some(
          (call: unknown[]) =>
            call[2] === '錬金術師ギルド' || call[2]?.toString().includes('錬金術師ギルド'),
        );
        expect(hasSubtitle).toBe(true);
      });
    });

    // =========================================================================
    // TC-TL-004: バージョン表示テスト
    // =========================================================================

    describe('TC-TL-004: バージョン表示テスト', () => {
      // 【テスト目的】: バージョン情報表示機能の確認
      // 【対応要件】: REQ-058-002（バージョン情報を表示）
      // 🔵 信頼性レベル: REQ-058-002に基づく

      it('TC-TL-004: create()が呼び出されるとバージョン情報が右下に表示される', async () => {
        // Given: TitleLogoインスタンス
        const { scene: mockScene } = createMockScene();

        // When: TitleLogoを初期化してcreate()を呼び出す
        const { TitleLogo } = await import('@presentation/ui/scenes/components/title/TitleLogo');
        const logo = new TitleLogo(mockScene, 640, 200);
        logo.create();

        // Then: バージョンテキストが「Version」を含んで作成される
        expect(mockScene.add.text).toHaveBeenCalled();
        const textCalls = (mockScene.add.text as ReturnType<typeof vi.fn>).mock.calls;
        const hasVersion = textCalls.some((call: unknown[]) =>
          call[2]?.toString().includes('Version'),
        );
        expect(hasVersion).toBe(true);
      });
    });

    // =========================================================================
    // TC-TL-005: タイトルスタイルテスト
    // =========================================================================

    describe('TC-TL-005: タイトルスタイルテスト', () => {
      // 【テスト目的】: スタイル設定の確認
      // 【対応要件】: 現在のTitleScene.tsのSTYLES定数
      // 🔵 信頼性レベル: 現在のTitleScene.tsの実装に基づく

      it('TC-TL-005: タイトルが48px、#8B4513で表示される', async () => {
        // Given: TitleLogoインスタンス
        const { scene: mockScene } = createMockScene();

        // When: TitleLogoを初期化してcreate()を呼び出す
        const { TitleLogo } = await import('@presentation/ui/scenes/components/title/TitleLogo');
        const logo = new TitleLogo(mockScene, 640, 200);
        logo.create();

        // Then: タイトルのスタイルが正しく設定される
        expect(mockScene.add.text).toHaveBeenCalled();
        const textCalls = (mockScene.add.text as ReturnType<typeof vi.fn>).mock.calls;

        // スタイル設定を含む呼び出しがあることを確認
        const hasTitleStyle = textCalls.some(
          (call: unknown[]) =>
            call[2]?.toString().includes('ATELIER GUILD') &&
            JSON.stringify(call[3]).includes('48px') &&
            JSON.stringify(call[3]).includes('#8B4513'),
        );
        expect(hasTitleStyle).toBe(true);
      });
    });

    // =========================================================================
    // TC-TL-006: 中央配置テスト
    // =========================================================================

    describe('TC-TL-006: 中央配置テスト', () => {
      // 【テスト目的】: 配置位置の確認
      // 【対応要件】: 現在のTitleScene.tsのレイアウト
      // 🔵 信頼性レベル: 現在のTitleScene.tsの実装に基づく

      it('TC-TL-006: テキストがorigin(0.5)で中央揃えされる', async () => {
        // Given: TitleLogoインスタンス
        const { scene: mockScene, mockText } = createMockScene();

        // When: TitleLogoを初期化してcreate()を呼び出す
        const { TitleLogo } = await import('@presentation/ui/scenes/components/title/TitleLogo');
        const logo = new TitleLogo(mockScene, 640, 200);
        logo.create();

        // Then: setOriginが0.5で呼び出される
        expect(mockText.setOrigin).toHaveBeenCalledWith(0.5);
      });
    });
  });

  // ===========================================================================
  // 2. 異常系テストケース
  // ===========================================================================

  describe('異常系', () => {
    // =========================================================================
    // TC-TL-E01: nullシーンでエラー
    // =========================================================================

    describe('TC-TL-E01: nullシーンでエラー', () => {
      // 【テスト目的】: 防御的プログラミングの確認
      // 【対応要件】: BaseComponent.tsの実装
      // 🔵 信頼性レベル: BaseComponent.tsの実装に基づく

      it('TC-TL-E01: nullシーンでコンストラクタを呼び出すとエラーがスローされる', async () => {
        // Given: nullシーン
        const { TitleLogo } = await import('@presentation/ui/scenes/components/title/TitleLogo');

        // When & Then: エラーがスローされる
        expect(() => new TitleLogo(null as unknown as Phaser.Scene, 640, 200)).toThrow(
          'BaseComponent: scene is required',
        );
      });
    });

    // =========================================================================
    // TC-TL-E02: undefinedシーンでエラー
    // =========================================================================

    describe('TC-TL-E02: undefinedシーンでエラー', () => {
      // 【テスト目的】: 異なるnullish値での動作確認
      // 【対応要件】: BaseComponent.tsの実装
      // 🔵 信頼性レベル: BaseComponent.tsの実装に基づく

      it('TC-TL-E02: undefinedシーンでコンストラクタを呼び出すとエラーがスローされる', async () => {
        // Given: undefinedシーン
        const { TitleLogo } = await import('@presentation/ui/scenes/components/title/TitleLogo');

        // When & Then: エラーがスローされる
        expect(() => new TitleLogo(undefined as unknown as Phaser.Scene, 640, 200)).toThrow(
          'BaseComponent: scene is required',
        );
      });
    });
  });

  // ===========================================================================
  // 3. 境界値テストケース
  // ===========================================================================

  describe('境界値', () => {
    // =========================================================================
    // TC-TL-B01: 座標(0, 0)での配置
    // =========================================================================

    describe('TC-TL-B01: 座標(0, 0)での配置', () => {
      // 【テスト目的】: 原点配置での動作確認
      // 【対応要件】: 一般的なUI境界値テストパターン
      // 🟡 信頼性レベル: 一般的なUI境界値テストパターン

      it('TC-TL-B01: 座標(0, 0)でTitleLogoが正常に配置される', async () => {
        // Given: 座標(0, 0)
        const { scene: mockScene } = createMockScene();

        // When: 座標(0, 0)でTitleLogoを作成
        const { TitleLogo } = await import('@presentation/ui/scenes/components/title/TitleLogo');
        const logo = new TitleLogo(mockScene, 0, 0);

        // Then: コンテナが(0, 0)に配置される
        expect(logo.getContainer()).toBeDefined();
        expect(mockScene.add.container).toHaveBeenCalledWith(0, 0);
      });
    });
  });

  // ===========================================================================
  // 4. 破棄処理テストケース
  // ===========================================================================

  describe('破棄処理', () => {
    // =========================================================================
    // TC-TL-D01: destroy()でリソース解放
    // =========================================================================

    describe('TC-TL-D01: destroy()でリソース解放', () => {
      // 【テスト目的】: リソース管理の確認
      // 【対応要件】: NFR-058-010（メモリリーク防止）
      // 🔵 信頼性レベル: NFR-058-010に基づく

      it('TC-TL-D01: destroy()が呼び出されるとコンテナと子要素が破棄される', async () => {
        // Given: TitleLogoインスタンス
        const { scene: mockScene, mockContainer } = createMockScene();
        const { TitleLogo } = await import('@presentation/ui/scenes/components/title/TitleLogo');
        const logo = new TitleLogo(mockScene, 640, 200);
        logo.create();

        // When: destroy()を呼び出す
        logo.destroy();

        // Then: コンテナが破棄される
        expect(mockContainer.destroy).toHaveBeenCalled();
      });
    });
  });
});
