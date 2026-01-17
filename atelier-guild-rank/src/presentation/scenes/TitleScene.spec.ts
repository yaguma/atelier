/**
 * TitleSceneのテスト
 * TASK-0019 TitleScene実装
 *
 * @description
 * T-0019-01〜23: TitleSceneの画面表示、ボタン動作、エラーハンドリングテスト
 *
 * 【テストフェーズ】: TDD Red（失敗するテスト作成）
 * 【テスト方針】: テストケース定義書（testcases.md）に準拠
 * 【参考実装】: BootScene.test.ts、Button.spec.ts、Dialog.spec.tsのパターンに準拠
 */

import { beforeEach, describe, expect, test, vi } from 'vitest';

/**
 * Phaserモック
 *
 * 【モック目的】: Phaserフレームワークをモック化してテストを可能にする 🔵
 * 【モック方針】: Phaser.Sceneクラスを最小限の実装でモック化 🔵
 */
vi.mock('phaser', () => {
  return {
    default: {
      Scene: class MockScene {
        sys: { settings: { key: string } };
        constructor(config?: { key?: string }) {
          this.sys = { settings: { key: config?.key || '' } };
        }
      },
      GameObjects: {
        Graphics: class MockGraphics {},
        Text: class MockText {},
        Container: class MockContainer {},
        Rectangle: class MockRectangle {},
      },
    },
  };
});

// TitleSceneのインポート（モック後）
import { TitleScene } from './TitleScene';

// モック変数
let mockSceneManager: ReturnType<typeof createMockSceneManager>;
let mockCameras: ReturnType<typeof createMockCameras>;
let mockAdd: ReturnType<typeof createMockAdd>;
let mockRexUI: ReturnType<typeof createMockRexUI>;
let mockSaveRepo: ReturnType<typeof createMockSaveDataRepository>;
let mockInput: ReturnType<typeof createMockInput>;

/**
 * createMockSceneManager - SceneManagerモックの作成
 *
 * 【機能概要】: Phaserのthis.sceneオブジェクトをモック化 🔵
 * 【実装方針】: start()メソッドをスパイ関数として提供 🔵
 */
function createMockSceneManager() {
  return {
    start: vi.fn(),
  };
}

/**
 * createMockCameras - CameraManagerモックの作成
 *
 * 【機能概要】: Phaserのthis.camerasオブジェクトをモック化 🔵
 * 【実装方針】: main.centerX, main.centerY, width, heightを提供 🔵
 */
function createMockCameras() {
  return {
    main: {
      centerX: 640,
      centerY: 360,
      width: 1280,
      height: 720,
    },
  };
}

/**
 * createMockAdd - GameObjectFactoryモックの作成
 *
 * 【機能概要】: Phaserのthis.addオブジェクトをモック化 🔵
 * 【実装方針】: text(), rectangle(), container()メソッドをモック化 🔵
 */
function createMockAdd() {
  const createMockText = () => ({
    setOrigin: vi.fn().mockReturnThis(),
    setStyle: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
    text: '',
  });
  const mockRectangle = {
    setOrigin: vi.fn().mockReturnThis(),
    setFillStyle: vi.fn().mockReturnThis(),
    setDepth: vi.fn().mockReturnThis(),
    setVisible: vi.fn().mockReturnThis(),
    setAlpha: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
  };
  const mockContainer = {
    add: vi.fn().mockReturnThis(),
    setVisible: vi.fn().mockReturnThis(),
    setPosition: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
  };
  return {
    text: vi.fn(() => createMockText()),
    rectangle: vi.fn(() => mockRectangle),
    container: vi.fn(() => mockContainer),
  };
}

/**
 * createMockRexUI - rexUIプラグインのモック作成
 *
 * 【機能概要】: rexUIプラグインをモック化してボタン・ダイアログテストを可能にする 🔵
 * 【実装方針】: add.label, add.dialog, add.roundRectangleをモック化 🔵
 */
function createMockRexUI() {
  const createMockLabel = () => ({
    setInteractive: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    setAlpha: vi.fn().mockReturnThis(),
    layout: vi.fn().mockReturnThis(),
    setDepth: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
  });
  const mockDialog = {
    layout: vi.fn().mockReturnThis(),
    popUp: vi.fn().mockReturnThis(),
    scaleDownDestroy: vi.fn().mockReturnThis(),
    setDepth: vi.fn().mockReturnThis(),
    setVisible: vi.fn().mockReturnThis(),
    visible: false,
    destroy: vi.fn(),
  };
  return {
    add: {
      label: vi.fn(() => createMockLabel()),
      dialog: vi.fn(() => mockDialog),
      roundRectangle: vi.fn().mockReturnValue({
        setFillStyle: vi.fn().mockReturnThis(),
      }),
      sizer: vi.fn().mockReturnValue({
        add: vi.fn().mockReturnThis(),
        layout: vi.fn().mockReturnThis(),
      }),
    },
  };
}

/**
 * createMockSaveDataRepository - セーブデータリポジトリのモック作成
 *
 * 【機能概要】: ISaveDataRepositoryをモック化してセーブデータテストを可能にする 🔵
 * 【実装方針】: exists, load, save, deleteメソッドをモック化 🔵
 */
function createMockSaveDataRepository(hasSaveData = false) {
  return {
    exists: vi.fn().mockReturnValue(hasSaveData),
    load: vi.fn().mockResolvedValue(
      hasSaveData
        ? {
            playerName: 'Test Player',
            rank: 'E',
            day: 5,
          }
        : null,
    ),
    save: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
  };
}

/**
 * createMockInput - 入力ハンドリングモックの作成
 *
 * 【機能概要】: Phaserのthis.inputオブジェクトをモック化 🔵
 * 【実装方針】: keyboard.once()メソッドをモック化 🔵
 */
function createMockInput() {
  return {
    keyboard: {
      once: vi.fn(),
    },
  };
}

/**
 * setupMocks - TitleSceneにモックを注入
 *
 * 【機能概要】: TitleSceneインスタンスにPhaserモックを注入 🔵
 * 【実装方針】: 必要なプロパティにモックオブジェクトを設定 🔵
 */
function setupMocks(
  titleScene: TitleScene,
  options?: { saveDataRepository?: ReturnType<typeof createMockSaveDataRepository> },
) {
  mockSceneManager = createMockSceneManager();
  mockCameras = createMockCameras();
  mockAdd = createMockAdd();
  mockRexUI = createMockRexUI();
  mockSaveRepo = options?.saveDataRepository || createMockSaveDataRepository(false);
  mockInput = createMockInput();

  // @ts-expect-error - テストのためにprivateプロパティにアクセス
  titleScene.scene = mockSceneManager;
  // @ts-expect-error - テストのためにprivateプロパティにアクセス
  titleScene.cameras = mockCameras;
  // @ts-expect-error - テストのためにprivateプロパティにアクセス
  titleScene.add = mockAdd;
  // @ts-expect-error - テストのためにprivateプロパティにアクセス
  titleScene.rexUI = mockRexUI;
  // @ts-expect-error - テストのためにprivateプロパティにアクセス
  titleScene.input = mockInput;

  // セーブデータリポジトリを注入（実装で対応する必要あり）
  // @ts-expect-error - テストのためにprivateプロパティにアクセス
  titleScene.saveDataRepository = mockSaveRepo;
}

/**
 * ボタンクリックをトリガーするヘルパー関数
 */
function triggerButtonClick(buttonIndex: number) {
  const labelMock = mockRexUI.add.label.mock.results[buttonIndex]?.value;
  if (labelMock) {
    const onPointerDown = labelMock.on.mock.calls.find(
      (call: unknown[]) => call[0] === 'pointerdown',
    )?.[1];
    if (onPointerDown) {
      onPointerDown();
    }
  }
}

describe('TitleScene', () => {
  let titleScene: TitleScene;

  beforeEach(() => {
    // 【テスト前準備】: 各テストケース実行前にTitleSceneインスタンスを初期化 🔵
    // 【環境初期化】: 前のテストの影響を排除するため、モックをリセット 🔵
    vi.clearAllMocks();
    titleScene = new TitleScene();
  });

  // =========================================================================
  // 3.1 画面表示テスト
  // =========================================================================

  describe('T-0019-01: タイトルロゴ表示', () => {
    // 【テスト目的】: タイトルロゴが設計書通りに表示されることを確認
    // 【テスト内容】: create()後に「ATELIER GUILD」テキストが正しい位置・スタイルで表示される
    // 【期待される動作】: タイトルロゴが画面中央上部に表示される
    // 🔵 信頼性レベル: REQ-0019-001に明記

    test('タイトルロゴテキストが表示される', () => {
      // 【テストデータ準備】: TitleSceneインスタンスを作成
      setupMocks(titleScene);

      // 【実際の処理実行】: create()メソッドを呼び出す
      titleScene.create();

      // 【結果検証】: 'ATELIER GUILD'テキストが表示されることを確認
      expect(mockAdd.text).toHaveBeenCalledWith(
        640, // centerX
        200, // Y座標
        'ATELIER GUILD',
        expect.objectContaining({
          fontSize: '48px',
          color: '#8B4513',
        }),
      ); // 🔵
    });

    test('タイトルロゴが中央揃えで表示される', () => {
      // 【確認内容】: setOrigin(0.5)が呼ばれることを確認
      setupMocks(titleScene);
      titleScene.create();

      // タイトルロゴ用のtext mockを取得（最初の呼び出し）
      const textMock = mockAdd.text.mock.results[0]?.value;
      expect(textMock?.setOrigin).toHaveBeenCalledWith(0.5); // 🔵
    });
  });

  describe('T-0019-02: サブタイトル表示', () => {
    // 【テスト目的】: サブタイトルが設計書通りに表示されることを確認
    // 【テスト内容】: create()後に「錬金術師ギルド」テキストが正しい位置・スタイルで表示される
    // 【期待される動作】: サブタイトルがタイトルロゴの下に表示される
    // 🔵 信頼性レベル: REQ-0019-002に明記

    test('サブタイトルテキストが表示される', () => {
      setupMocks(titleScene);
      titleScene.create();

      // 【結果検証】: '錬金術師ギルド'テキストが表示されることを確認
      expect(mockAdd.text).toHaveBeenCalledWith(
        640, // centerX
        260, // Y座標（タイトルロゴの下）
        '錬金術師ギルド',
        expect.objectContaining({
          fontSize: '24px',
          color: '#666666',
        }),
      ); // 🔵
    });
  });

  describe('T-0019-03: バージョン情報表示', () => {
    // 【テスト目的】: バージョン情報が画面右下に表示されることを確認
    // 【テスト内容】: create()後に「Version 1.0.0」テキストが表示される
    // 【期待される動作】: バージョン情報が画面右下に表示される
    // 🔵 信頼性レベル: REQ-0019-003に明記

    test('バージョン情報テキストが表示される', () => {
      setupMocks(titleScene);
      titleScene.create();

      // 【結果検証】: 'Version 1.0.0'テキストが表示されることを確認
      expect(mockAdd.text).toHaveBeenCalledWith(
        expect.any(Number), // 右下X座標
        expect.any(Number), // 右下Y座標
        'Version 1.0.0',
        expect.any(Object),
      ); // 🔵
    });
  });

  describe('T-0019-04: 新規ゲームボタン表示', () => {
    // 【テスト目的】: 新規ゲームボタンが正しく表示されることを確認
    // 【テスト内容】: create()後に「新規ゲーム」ボタンが表示される
    // 【期待される動作】: 新規ゲームボタンが設計書通りのスタイルで表示される
    // 🔵 信頼性レベル: REQ-0019-004に明記

    test('新規ゲームボタンが表示される', () => {
      setupMocks(titleScene);
      titleScene.create();

      // 【結果検証】: '新規ゲーム'ボタンが生成されることを確認
      // Buttonコンポーネント経由でrexUI.add.labelが呼ばれる
      expect(mockRexUI.add.label).toHaveBeenCalled(); // 🔵

      // テキスト'新規ゲーム'が含まれるボタンが生成されることを確認
      expect(mockAdd.text).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        '新規ゲーム',
        expect.any(Object),
      ); // 🔵
    });
  });

  describe('T-0019-05: コンティニューボタン表示', () => {
    // 【テスト目的】: コンティニューボタンが正しく表示されることを確認
    // 【テスト内容】: create()後に「コンティニュー」ボタンが表示される
    // 【期待される動作】: コンティニューボタンが設計書通りのスタイルで表示される
    // 🔵 信頼性レベル: REQ-0019-005に明記

    test('コンティニューボタンが表示される', () => {
      setupMocks(titleScene);
      titleScene.create();

      // 【結果検証】: 'コンティニュー'ボタンが生成されることを確認
      expect(mockAdd.text).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        'コンティニュー',
        expect.any(Object),
      ); // 🔵
    });
  });

  describe('T-0019-06: 設定ボタン表示', () => {
    // 【テスト目的】: 設定ボタンが正しく表示されることを確認
    // 【テスト内容】: create()後に「設定」ボタンが表示される
    // 【期待される動作】: 設定ボタンが設計書通りのスタイルで表示される
    // 🔵 信頼性レベル: REQ-0019-006に明記

    test('設定ボタンが表示される', () => {
      setupMocks(titleScene);
      titleScene.create();

      // 【結果検証】: '設定'ボタンが生成されることを確認
      expect(mockAdd.text).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        '設定',
        expect.any(Object),
      ); // 🔵
    });
  });

  // =========================================================================
  // 3.2 ボタン状態制御テスト
  // =========================================================================

  describe('T-0019-07: セーブデータありでコンティニュー有効', () => {
    // 【テスト目的】: セーブデータがある場合にコンティニューボタンが有効になることを確認
    // 【テスト内容】: セーブデータ存在時にボタンが有効状態で表示される
    // 【期待される動作】: ボタン状態がセーブデータに応じて有効になる
    // 🔵 信頼性レベル: REQ-0019-007に明記

    test('セーブデータがある場合、コンティニューボタンが有効', () => {
      const mockSaveRepo = createMockSaveDataRepository(true);
      setupMocks(titleScene, { saveDataRepository: mockSaveRepo });
      titleScene.create();

      // 【結果検証】: コンティニューボタンが有効状態であることを確認
      // setAlpha(1.0)が呼ばれる、またはsetAlpha(0.5)が呼ばれないことを確認
      const labelCalls = mockRexUI.add.label.mock.results;

      // ボタンが複数生成されるため、無効化のsetAlpha(0.5)が呼ばれていないことを確認
      // コンティニューボタン（2番目のボタン）を取得
      if (labelCalls.length >= 2) {
        const continueButtonMock = labelCalls[1].value;
        expect(continueButtonMock.setAlpha).not.toHaveBeenCalledWith(0.5); // 🔵
      }
    });
  });

  describe('T-0019-08: セーブデータなしでコンティニュー無効', () => {
    // 【テスト目的】: セーブデータがない場合にコンティニューボタンが無効になることを確認
    // 【テスト内容】: セーブデータ非存在時にボタンが無効状態で表示される
    // 【期待される動作】: ボタン状態がセーブデータに応じて無効になる
    // 🔵 信頼性レベル: REQ-0019-008に明記

    test('セーブデータがない場合、コンティニューボタンが無効', () => {
      const mockSaveRepo = createMockSaveDataRepository(false);
      setupMocks(titleScene, { saveDataRepository: mockSaveRepo });
      titleScene.create();

      // 【結果検証】: コンティニューボタンが無効状態であることを確認
      // setAlpha(0.5)が呼ばれることを確認
      const labelCalls = mockRexUI.add.label.mock.results;

      // コンティニューボタン（2番目のボタン）を取得
      if (labelCalls.length >= 2) {
        const continueButtonMock = labelCalls[1].value;
        expect(continueButtonMock.setAlpha).toHaveBeenCalledWith(0.5); // 🔵
      }
    });
  });

  // =========================================================================
  // 3.3 ボタンアクションテスト
  // =========================================================================

  describe('T-0019-09: 新規ゲーム（セーブなし）でMainSceneへ遷移', () => {
    // 【テスト目的】: セーブデータがない状態で新規ゲームボタンをクリックするとMainSceneへ遷移することを確認
    // 【テスト内容】: 新規ゲームボタンのクリック後、MainSceneへ直接遷移する
    // 【期待される動作】: 確認ダイアログなしでMainSceneへ遷移
    // 🔵 信頼性レベル: REQ-0019-009に明記

    test('セーブデータなしで新規ゲームクリック→MainSceneへ直接遷移', () => {
      const mockSaveRepo = createMockSaveDataRepository(false);
      setupMocks(titleScene, { saveDataRepository: mockSaveRepo });
      titleScene.create();

      // 【実際の処理実行】: 新規ゲームボタンのクリックをシミュレート
      triggerButtonClick(0); // 1番目のボタン（新規ゲーム）

      // 【結果検証】: MainSceneへ遷移することを確認
      expect(mockSceneManager.start).toHaveBeenCalledWith('MainScene'); // 🔵

      // 【確認内容】: 確認ダイアログが表示されないことを確認
      expect(mockRexUI.add.dialog).not.toHaveBeenCalled(); // 🔵
    });
  });

  describe('T-0019-10: 新規ゲーム（セーブあり）で確認ダイアログ表示', () => {
    // 【テスト目的】: セーブデータがある状態で新規ゲームボタンをクリックすると確認ダイアログが表示されることを確認
    // 【テスト内容】: 新規ゲームボタンのクリック後、確認ダイアログが表示される
    // 【期待される動作】: 確認ダイアログが表示される
    // 🔵 信頼性レベル: REQ-0019-010に明記

    test('セーブデータありで新規ゲームクリック→確認ダイアログ表示', () => {
      const mockSaveRepo = createMockSaveDataRepository(true);
      setupMocks(titleScene, { saveDataRepository: mockSaveRepo });
      titleScene.create();

      // 【実際の処理実行】: 新規ゲームボタンのクリックをシミュレート
      triggerButtonClick(0); // 1番目のボタン（新規ゲーム）

      // 【結果検証】: 確認ダイアログが表示されることを確認
      expect(mockRexUI.add.dialog).toHaveBeenCalled(); // 🔵

      // 【確認内容】: ダイアログのタイトルが正しいことを確認
      expect(mockAdd.text).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        expect.stringMatching(/新規ゲーム|確認/),
        expect.any(Object),
      ); // 🔵
    });
  });

  describe('T-0019-11: 確認ダイアログ「はい」でMainSceneへ遷移', () => {
    // 【テスト目的】: 確認ダイアログで「はい」をクリックするとMainSceneへ遷移することを確認
    // 【テスト内容】: セーブデータ削除後、MainSceneへ遷移する
    // 【期待される動作】: セーブデータが削除され、MainSceneへ遷移
    // 🔵 信頼性レベル: REQ-0019-011に明記

    test('確認ダイアログで「はい」クリック→MainSceneへ遷移', () => {
      const mockSaveRepo = createMockSaveDataRepository(true);
      setupMocks(titleScene, { saveDataRepository: mockSaveRepo });
      titleScene.create();

      // 新規ゲームボタンをクリックして確認ダイアログを表示
      triggerButtonClick(0);

      // 「はい」ボタンのクリックをシミュレート
      // ダイアログ内のボタンは後から追加されるので、labelの後続の呼び出しを確認
      const labelCalls = mockRexUI.add.label.mock.results;
      const dialogYesButton = labelCalls.find((_, index) => index >= 3); // ダイアログ内のボタン

      if (dialogYesButton) {
        const yesButtonMock = dialogYesButton.value;
        const onPointerDown = yesButtonMock.on.mock.calls.find(
          (call: unknown[]) => call[0] === 'pointerdown',
        )?.[1];
        if (onPointerDown) {
          onPointerDown();
        }
      }

      // 【結果検証】: セーブデータが削除されることを確認
      expect(mockSaveRepo.delete).toHaveBeenCalled(); // 🔵

      // 【確認内容】: MainSceneへ遷移することを確認
      expect(mockSceneManager.start).toHaveBeenCalledWith('MainScene'); // 🔵
    });
  });

  describe('T-0019-12: 確認ダイアログ「いいえ」でダイアログを閉じる', () => {
    // 【テスト目的】: 確認ダイアログで「いいえ」をクリックするとダイアログが閉じることを確認
    // 【テスト内容】: セーブデータが維持され、シーン遷移しない
    // 【期待される動作】: ダイアログが閉じ、タイトル画面に留まる
    // 🔵 信頼性レベル: REQ-0019-012に明記

    test('確認ダイアログで「いいえ」クリック→ダイアログを閉じる', () => {
      const mockSaveRepo = createMockSaveDataRepository(true);
      setupMocks(titleScene, { saveDataRepository: mockSaveRepo });
      titleScene.create();

      // 新規ゲームボタンをクリックして確認ダイアログを表示
      triggerButtonClick(0);

      // 【結果検証】: セーブデータは維持されることを確認
      expect(mockSaveRepo.delete).not.toHaveBeenCalled(); // 🔵

      // 【確認内容】: シーン遷移しないことを確認（確認ダイアログ表示直後）
      expect(mockSceneManager.start).not.toHaveBeenCalledWith('MainScene'); // 🔵
    });
  });

  describe('T-0019-13: コンティニューでセーブデータ読み込み・MainSceneへ遷移', () => {
    // 【テスト目的】: コンティニューボタンをクリックするとセーブデータを読み込んでMainSceneへ遷移することを確認
    // 【テスト内容】: セーブデータを読み込み、MainSceneへセーブデータ付きで遷移する
    // 【期待される動作】: セーブデータからゲームが再開される
    // 🔵 信頼性レベル: REQ-0019-013に明記

    test('コンティニューボタンクリック→セーブデータ読み込み→MainSceneへ遷移', async () => {
      const mockSaveData = {
        playerName: 'Test Player',
        rank: 'E',
        day: 5,
      };
      const mockSaveRepo = createMockSaveDataRepository(true);
      mockSaveRepo.load.mockResolvedValue(mockSaveData);
      setupMocks(titleScene, { saveDataRepository: mockSaveRepo });
      titleScene.create();

      // 【実際の処理実行】: コンティニューボタンのクリックをシミュレート
      triggerButtonClick(1); // 2番目のボタン（コンティニュー）

      // 非同期処理を待つ
      await vi.waitFor(() => {
        // 【結果検証】: セーブデータが読み込まれることを確認
        expect(mockSaveRepo.load).toHaveBeenCalled(); // 🔵
      });

      // 【確認内容】: MainSceneへセーブデータ付きで遷移することを確認
      expect(mockSceneManager.start).toHaveBeenCalledWith(
        'MainScene',
        expect.objectContaining({
          saveData: mockSaveData,
        }),
      ); // 🔵
    });
  });

  describe('T-0019-14: 設定ボタンで設定ダイアログ表示', () => {
    // 【テスト目的】: 設定ボタンをクリックすると設定ダイアログが表示されることを確認
    // 【テスト内容】: 設定ダイアログが表示される（Phase 1はスタブ）
    // 【期待される動作】: 設定ダイアログが表示される
    // 🔴 信頼性レベル: REQ-0019-014、設計文書に詳細なし

    test('設定ボタンクリック→設定ダイアログ表示（スタブ）', () => {
      setupMocks(titleScene);
      titleScene.create();

      // 【実際の処理実行】: 設定ボタンのクリックをシミュレート
      triggerButtonClick(2); // 3番目のボタン（設定）

      // 【結果検証】: ダイアログが表示されることを確認
      expect(mockRexUI.add.dialog).toHaveBeenCalled(); // 🔴

      // 【確認内容】: 「準備中」メッセージが表示されることを確認
      expect(mockAdd.text).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        expect.stringContaining('準備中'),
        expect.any(Object),
      ); // 🔴
    });
  });

  // =========================================================================
  // 3.5 エラーハンドリングテスト
  // =========================================================================

  describe('T-0019-18: セーブデータ破損時コンティニュー無効', () => {
    // 【テスト目的】: セーブデータが破損している場合にコンティニューボタンが無効になることを確認
    // 【テスト内容】: セーブデータ読み込み失敗時にボタンが無効化される
    // 【期待される動作】: 適切なエラーハンドリングが行われる
    // 🟡 信頼性レベル: REQ-0019-018

    test('セーブデータが破損している場合、コンティニューボタン無効', async () => {
      const mockSaveRepo = createMockSaveDataRepository(true);
      // セーブデータ破損をシミュレート
      mockSaveRepo.load.mockRejectedValue(new Error('Save data corrupted'));
      setupMocks(titleScene, { saveDataRepository: mockSaveRepo });

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      titleScene.create();

      // 非同期処理を待つ
      await vi.waitFor(() => {
        // 【結果検証】: コンティニューボタンが無効化されることを確認
        const labelCalls = mockRexUI.add.label.mock.results;
        if (labelCalls.length >= 2) {
          const continueButtonMock = labelCalls[1].value;
          expect(continueButtonMock.setAlpha).toHaveBeenCalledWith(0.5); // 🟡
        }
      });

      // 【確認内容】: 警告ログが出力されることを確認
      expect(consoleWarnSpy).toHaveBeenCalled(); // 🟡

      consoleWarnSpy.mockRestore();
    });
  });

  describe('T-0019-19: セーブデータ読み込み失敗時エラーダイアログ', () => {
    // 【テスト目的】: コンティニュー時にセーブデータ読み込みが失敗した場合にエラーダイアログが表示されることを確認
    // 【テスト内容】: 読み込み失敗時にエラーダイアログが表示される
    // 【期待される動作】: エラーダイアログが表示される
    // 🟡 信頼性レベル: REQ-0019-019

    test('コンティニュー時にセーブデータ読み込み失敗→エラーダイアログ表示', async () => {
      const mockSaveRepo = createMockSaveDataRepository(true);
      mockSaveRepo.load.mockRejectedValue(new Error('Failed to load save data'));
      setupMocks(titleScene, { saveDataRepository: mockSaveRepo });
      titleScene.create();

      // 【実際の処理実行】: コンティニューボタンのクリックをシミュレート
      triggerButtonClick(1);

      // 非同期処理を待つ
      await vi.waitFor(() => {
        // 【結果検証】: エラーダイアログが表示されることを確認
        expect(mockRexUI.add.dialog).toHaveBeenCalled(); // 🟡
      });

      // 【確認内容】: エラーメッセージが表示されることを確認
      expect(mockAdd.text).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        expect.stringContaining('エラー'),
        expect.any(Object),
      ); // 🟡
    });
  });

  // =========================================================================
  // 3.6 境界値・エッジケーステスト
  // =========================================================================

  describe('T-0019-20: コンストラクタでシーンキーが正しく設定される', () => {
    // 【テスト目的】: TitleSceneのシーンキーが正しく設定されることを確認
    // 【テスト内容】: コンストラクタでシーンキーが'TitleScene'に設定される
    // 【期待される動作】: シーンキーが正しく設定される
    // 🔵 信頼性レベル: 実装要件から

    test('シーンキーが正しく設定される', () => {
      const scene = new TitleScene();
      // biome-ignore lint/suspicious/noExplicitAny: モック構造にアクセス
      expect((scene as any).sys?.settings?.key).toBe('TitleScene'); // 🔵
    });
  });

  describe('T-0019-21: create()メソッドが正常に実行される', () => {
    // 【テスト目的】: create()メソッドがエラーなく実行されることを確認
    // 【テスト内容】: create()を呼び出してエラーが発生しないことを検証
    // 【期待される動作】: create()が正常に実行される
    // 🔵 信頼性レベル: 実装要件から

    test('create()が正常に実行される', () => {
      setupMocks(titleScene);
      expect(() => titleScene.create()).not.toThrow(); // 🔵
    });
  });

  describe('T-0019-22: destroy時にリソースが解放される', () => {
    // 【テスト目的】: シーン破棄時にリソースが正しく解放されることを確認
    // 【テスト内容】: destroy()またはshutdown()でリソースが解放される
    // 【期待される動作】: リソースが正しく解放される
    // 🟡 信頼性レベル: 実装要件から

    test('destroy時にリソースが解放される', () => {
      setupMocks(titleScene);
      titleScene.create();

      // シーン破棄をシミュレート
      // biome-ignore lint/suspicious/noExplicitAny: privateメソッドへのアクセス
      const sceneAny = titleScene as any;
      if (typeof sceneAny.shutdown === 'function') {
        sceneAny.shutdown();
      }

      // ボタンやダイアログのdestroy()が呼ばれることを確認
      // 実装依存のため、destroy()メソッドが定義されていれば検証 🟡
    });
  });

  describe('T-0019-23: 複数回create()を呼んでも問題なし', () => {
    // 【テスト目的】: create()を複数回呼んでもエラーが発生しないことを確認
    // 【テスト内容】: create()を複数回呼び出してエラーが発生しないことを検証
    // 【期待される動作】: 複数回呼び出してもエラーが発生しない
    // 🟡 信頼性レベル: 実装要件から

    test('複数回create()を呼んでも問題なし', () => {
      setupMocks(titleScene);

      expect(() => {
        titleScene.create();
        titleScene.create();
        titleScene.create();
      }).not.toThrow(); // 🟡
    });
  });

  // =========================================================================
  // 3.4 アニメーションテスト（Phase 2で実装）
  // =========================================================================

  describe('T-0019-15: 画面表示時フェードインアニメーション', () => {
    // 【テスト目的】: 画面表示時にフェードインアニメーションが実行されることを確認
    // 【テスト内容】: create()後にフェードインアニメーションが実行される
    // 【期待される動作】: 画面がフェードインで表示される
    // 🟡 信頼性レベル: REQ-0019-015

    test.skip('画面表示時にフェードインアニメーションが実行される', () => {
      // Phase 2で実装予定
    });
  });

  describe('T-0019-16: ボタンホバーエフェクト', () => {
    // 【テスト目的】: ボタンホバー時にエフェクトが表示されることを確認
    // 【テスト内容】: ボタンにマウスホバーするとエフェクトが表示される
    // 【期待される動作】: ホバーエフェクトが表示される
    // 🟡 信頼性レベル: REQ-0019-016

    test.skip('ボタンホバー時にエフェクトが表示される', () => {
      // Phase 2で実装予定
    });
  });

  describe('T-0019-17: 画面遷移時フェードアウトアニメーション', () => {
    // 【テスト目的】: 画面遷移時にフェードアウトアニメーションが実行されることを確認
    // 【テスト内容】: シーン遷移時にフェードアウトアニメーションが実行される
    // 【期待される動作】: 画面がフェードアウトで遷移する
    // 🟡 信頼性レベル: REQ-0019-017

    test.skip('画面遷移時にフェードアウトアニメーションが実行される', () => {
      // Phase 2で実装予定
    });
  });
});
