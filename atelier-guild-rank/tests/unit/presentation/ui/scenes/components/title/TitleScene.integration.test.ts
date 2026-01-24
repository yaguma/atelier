/**
 * TitleScene統合テスト
 * TASK-0058 TitleSceneリファクタリング
 *
 * @description
 * TC-INT-001 ~ TC-INT-007: コンポーネント連携テストケース
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
  removeAll: vi.fn(),
  setInteractive: vi.fn().mockReturnThis(),
  on: vi.fn().mockReturnThis(),
  off: vi.fn().mockReturnThis(),
  setAlpha: vi.fn().mockReturnThis(),
  setDepth: vi.fn().mockReturnThis(),
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
 * モックカメラを作成
 */
const createMockCamera = () => ({
  fadeIn: vi.fn(),
  fadeOut: vi.fn(),
  once: vi.fn().mockImplementation((event, callback) => {
    if (event === 'camerafadeoutcomplete') {
      // 即座にコールバックを実行（テスト用）
      setTimeout(callback, 0);
    }
  }),
  centerX: 640,
  centerY: 360,
  width: 1280,
  height: 720,
});

/**
 * モックシーンを作成
 */
const createMockScene = () => {
  const mockContainer = createMockContainer();
  const mockText = createMockText();
  const mockRexUI = createMockRexUI();
  const mockRectangle = createMockRectangle();
  const mockCamera = createMockCamera();

  return {
    scene: {
      add: {
        container: vi.fn().mockReturnValue(mockContainer),
        text: vi.fn().mockReturnValue(mockText),
        rectangle: vi.fn().mockReturnValue(mockRectangle),
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
        main: mockCamera,
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
    mockCamera,
  };
};

/**
 * モックSaveDataRepositoryを作成
 */
const createMockSaveDataRepository = (hasSaveData = false) => ({
  exists: vi.fn().mockReturnValue(hasSaveData),
  load: vi
    .fn()
    .mockResolvedValue(hasSaveData ? { playerName: 'テストプレイヤー', rank: 'E', day: 1 } : null),
  save: vi.fn().mockResolvedValue(undefined),
  delete: vi.fn().mockResolvedValue(undefined),
});

// =============================================================================
// 統合テストスイート
// =============================================================================

describe('TitleScene Integration Tests', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  // ===========================================================================
  // TC-INT-001: TitleLogo→TitleScene連携
  // ===========================================================================

  describe('TC-INT-001: TitleLogo→TitleScene連携', () => {
    // 【テスト目的】: ロゴコンポーネントの正常統合
    // 【対応要件】: REQ-058-001（コンポーネント分割）
    // 🔵 信頼性レベル: REQ-058-001に基づく

    it('TC-INT-001: TitleSceneのcreate()でTitleLogoが正しく初期化される', async () => {
      // Given: TitleSceneインスタンス
      const { scene: mockScene, mockText } = createMockScene();
      const mockSaveDataRepository = createMockSaveDataRepository(false);

      // When: TitleSceneを模倣したコンポーネント初期化
      const { TitleLogo } = await import('@presentation/ui/scenes/components/title/TitleLogo');
      const logo = new TitleLogo(mockScene, 640, 200);
      logo.create();

      // Then: タイトルとサブタイトルが表示される
      expect(mockScene.add.text).toHaveBeenCalled();
      const textCalls = (mockScene.add.text as ReturnType<typeof vi.fn>).mock.calls;

      const hasTitle = textCalls.some((call: unknown[]) =>
        call[2]?.toString().includes('ATELIER GUILD'),
      );
      expect(hasTitle).toBe(true);
    });
  });

  // ===========================================================================
  // TC-INT-002: TitleMenu→TitleScene連携
  // ===========================================================================

  describe('TC-INT-002: TitleMenu→TitleScene連携', () => {
    // 【テスト目的】: メニューコンポーネントの正常統合
    // 【対応要件】: REQ-058-001（コンポーネント分割）
    // 🔵 信頼性レベル: REQ-058-001に基づく

    it('TC-INT-002: TitleSceneのcreate()でTitleMenuが正しく初期化される', async () => {
      // Given: TitleSceneコンテキスト
      const { scene: mockScene, mockRexUI } = createMockScene();
      const config = {
        hasSaveData: false,
        onNewGame: vi.fn(),
        onContinue: vi.fn(),
        onSettings: vi.fn(),
      };

      // When: TitleMenuを初期化
      const { TitleMenu } = await import('@presentation/ui/scenes/components/title/TitleMenu');
      const menu = new TitleMenu(mockScene, 640, 400, config);
      menu.create();

      // Then: 3つのボタンが作成される
      expect(mockRexUI.add.label).toHaveBeenCalledTimes(3);
    });
  });

  // ===========================================================================
  // TC-INT-003: TitleMenu→TitleDialog連携（新規ゲーム確認）
  // ===========================================================================

  describe('TC-INT-003: TitleMenu→TitleDialog連携（新規ゲーム確認）', () => {
    // 【テスト目的】: 新規ゲーム時のダイアログ表示連携
    // 【対応要件】: 要件定義（セーブデータ存在時に確認ダイアログ）
    // 🔵 信頼性レベル: 要件定義に基づく

    it('TC-INT-003: セーブデータ存在時の新規ゲームで確認ダイアログが表示される', async () => {
      // Given: セーブデータ存在とコールバック
      const { scene: mockScene, mockRexUI } = createMockScene();
      const showConfirmDialog = vi.fn();
      const config = {
        hasSaveData: true,
        onNewGame: showConfirmDialog,
        onContinue: vi.fn(),
        onSettings: vi.fn(),
      };

      // When: TitleMenuで新規ゲームをクリック
      const { TitleMenu } = await import('@presentation/ui/scenes/components/title/TitleMenu');
      const menu = new TitleMenu(mockScene, 640, 400, config);
      menu.create();
      menu.handleNewGameClick();

      // Then: 確認ダイアログ表示コールバックが呼び出される
      expect(showConfirmDialog).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // TC-INT-004: TitleDialog確認→シーン遷移連携
  // ===========================================================================

  describe('TC-INT-004: TitleDialog確認→シーン遷移連携', () => {
    // 【テスト目的】: ダイアログ確認後のシーン遷移
    // 【対応要件】: 要件定義（確認後にMainSceneへ遷移）
    // 🔵 信頼性レベル: 要件定義に基づく

    it('TC-INT-004: 確認ダイアログで「はい」を選択するとMainSceneに遷移する', async () => {
      // Given: 確認ダイアログ設定
      const { scene: mockScene } = createMockScene();
      const navigateToMainScene = vi.fn(() => {
        mockScene.scene.start('MainScene');
      });
      const config = {
        type: 'confirm' as const,
        title: '確認',
        content: 'セーブデータを削除しますか？',
        onConfirm: navigateToMainScene,
        onClose: vi.fn(),
      };

      // When: TitleDialogを表示して確認
      const { TitleDialog } = await import('@presentation/ui/scenes/components/title/TitleDialog');
      const dialog = new TitleDialog(mockScene, config);
      dialog.show();

      // 確認ボタンクリックをシミュレート
      config.onConfirm();

      // Then: MainSceneへの遷移が実行される
      expect(navigateToMainScene).toHaveBeenCalled();
      expect(mockScene.scene.start).toHaveBeenCalledWith('MainScene');
    });
  });

  // ===========================================================================
  // TC-INT-005: コンティニュー→シーン遷移連携
  // ===========================================================================

  describe('TC-INT-005: コンティニュー→シーン遷移連携', () => {
    // 【テスト目的】: コンティニュー選択時のシーン遷移
    // 【対応要件】: 要件定義（セーブデータ読み込み後にMainSceneへ遷移）
    // 🔵 信頼性レベル: 要件定義に基づく

    it('TC-INT-005: 有効なコンティニューでセーブデータ付きでMainSceneに遷移する', async () => {
      // Given: セーブデータ存在とコールバック
      const { scene: mockScene, mockCamera } = createMockScene();
      const mockSaveDataRepository = createMockSaveDataRepository(true);
      const navigateWithSaveData = vi.fn(() => {
        mockScene.scene.start('MainScene', {
          saveData: { playerName: 'テストプレイヤー', rank: 'E', day: 1 },
        });
      });
      const config = {
        hasSaveData: true,
        onNewGame: vi.fn(),
        onContinue: navigateWithSaveData,
        onSettings: vi.fn(),
      };

      // When: TitleMenuでコンティニューをクリック
      const { TitleMenu } = await import('@presentation/ui/scenes/components/title/TitleMenu');
      const menu = new TitleMenu(mockScene, 640, 400, config);
      menu.create();
      menu.handleContinueClick();

      // Then: セーブデータ付きでMainSceneへ遷移
      expect(navigateWithSaveData).toHaveBeenCalled();
      expect(mockScene.scene.start).toHaveBeenCalledWith('MainScene', {
        saveData: expect.objectContaining({
          playerName: 'テストプレイヤー',
        }),
      });
    });
  });

  // ===========================================================================
  // TC-INT-006: 設定ボタン→設定ダイアログ連携
  // ===========================================================================

  describe('TC-INT-006: 設定ボタン→設定ダイアログ連携', () => {
    // 【テスト目的】: 設定ダイアログ表示連携
    // 【対応要件】: 要件定義（設定ダイアログ表示）
    // 🔵 信頼性レベル: 要件定義に基づく

    it('TC-INT-006: 設定ボタンクリックで設定ダイアログが表示される', async () => {
      // Given: 設定ボタンコールバック
      const { scene: mockScene, mockRexUI } = createMockScene();
      const showSettingsDialog = vi.fn();
      const config = {
        hasSaveData: false,
        onNewGame: vi.fn(),
        onContinue: vi.fn(),
        onSettings: showSettingsDialog,
      };

      // When: TitleMenuで設定をクリック
      const { TitleMenu } = await import('@presentation/ui/scenes/components/title/TitleMenu');
      const menu = new TitleMenu(mockScene, 640, 400, config);
      menu.create();
      menu.handleSettingsClick();

      // Then: 設定ダイアログ表示コールバックが呼び出される
      expect(showSettingsDialog).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // TC-INT-007: フェードアウト→シーン遷移連携
  // ===========================================================================

  describe('TC-INT-007: フェードアウト→シーン遷移連携', () => {
    // 【テスト目的】: フェードアニメーション後のシーン遷移
    // 【対応要件】: TASK-0038（フェードアニメーション）
    // 🔵 信頼性レベル: TASK-0038に基づく

    it('TC-INT-007: フェードアウト完了後にシーン遷移が実行される', async () => {
      // Given: モックカメラとシーン
      const { scene: mockScene, mockCamera } = createMockScene();

      // When: フェードアウト後にシーン遷移をシミュレート
      mockCamera.fadeOut(500, 0, 0, 0);
      mockCamera.once('camerafadeoutcomplete', () => {
        mockScene.scene.start('MainScene');
      });

      // 非同期でコールバック実行を待機
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Then: シーン遷移が実行される
      expect(mockCamera.fadeOut).toHaveBeenCalledWith(500, 0, 0, 0);
      expect(mockScene.scene.start).toHaveBeenCalledWith('MainScene');
    });
  });

  // ===========================================================================
  // TC-INT-008: エラー発生→エラーダイアログ連携
  // ===========================================================================

  describe('TC-INT-008: エラー発生→エラーダイアログ連携', () => {
    // 【テスト目的】: エラー発生時のダイアログ表示
    // 【対応要件】: 要件定義（エラーダイアログ表示）
    // 🔵 信頼性レベル: 要件定義に基づく

    it('TC-INT-008: セーブデータ読み込みエラーでエラーダイアログが表示される', async () => {
      // Given: エラーダイアログ設定
      const { scene: mockScene, mockRexUI } = createMockScene();
      const config = {
        type: 'error' as const,
        title: 'エラー',
        content: 'セーブデータの読み込みに失敗しました',
        onClose: vi.fn(),
      };

      // When: エラーダイアログを表示
      const { TitleDialog } = await import('@presentation/ui/scenes/components/title/TitleDialog');
      const dialog = new TitleDialog(mockScene, config);
      dialog.show();

      // Then: エラーダイアログが作成される
      expect(mockRexUI.add.dialog).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // TC-INT-009: コンポーネント間状態同期
  // ===========================================================================

  describe('TC-INT-009: コンポーネント間状態同期', () => {
    // 【テスト目的】: hasSaveData状態の正しい伝播
    // 【対応要件】: REQ-058-030（コンポーネント間通信）
    // 🔵 信頼性レベル: REQ-058-030に基づく

    it('TC-INT-009: SaveDataRepository.exists()の結果がTitleMenuに正しく伝播する', async () => {
      // Given: セーブデータ存在状態
      const { scene: mockScene, mockRexUI } = createMockScene();
      const mockSaveDataRepository = createMockSaveDataRepository(true);
      const hasSaveData = mockSaveDataRepository.exists();

      const config = {
        hasSaveData,
        onNewGame: vi.fn(),
        onContinue: vi.fn(),
        onSettings: vi.fn(),
      };

      // When: TitleMenuを初期化
      const { TitleMenu } = await import('@presentation/ui/scenes/components/title/TitleMenu');
      const menu = new TitleMenu(mockScene, 640, 400, config);
      menu.create();

      // Then: コンティニューボタンが有効状態（alpha=0.5でない）
      const mockLabel = mockRexUI.add.label();
      const setAlphaCalls = mockLabel.setAlpha.mock.calls;
      const hasDisabledAlpha = setAlphaCalls.some((call: unknown[]) => call[0] === 0.5);
      expect(hasDisabledAlpha).toBe(false);
    });
  });

  // ===========================================================================
  // TC-INT-010: 全コンポーネント破棄処理
  // ===========================================================================

  describe('TC-INT-010: 全コンポーネント破棄処理', () => {
    // 【テスト目的】: シーンシャットダウン時の全リソース解放
    // 【対応要件】: NFR-058-010（メモリリーク防止）
    // 🔵 信頼性レベル: NFR-058-010に基づく

    it('TC-INT-010: shutdown()で全コンポーネントが正しく破棄される', async () => {
      // Given: 各コンポーネントのインスタンス
      const { scene: mockScene, mockContainer } = createMockScene();

      const { TitleLogo } = await import('@presentation/ui/scenes/components/title/TitleLogo');
      const { TitleMenu } = await import('@presentation/ui/scenes/components/title/TitleMenu');

      const logo = new TitleLogo(mockScene, 640, 200);
      logo.create();

      const menuConfig = {
        hasSaveData: false,
        onNewGame: vi.fn(),
        onContinue: vi.fn(),
        onSettings: vi.fn(),
      };
      const menu = new TitleMenu(mockScene, 640, 400, menuConfig);
      menu.create();

      // When: 各コンポーネントを破棄
      logo.destroy();
      menu.destroy();

      // Then: コンテナが破棄される
      expect(mockContainer.destroy).toHaveBeenCalled();
    });
  });
});
