/**
 * BootScene テストケース
 * TASK-0008 Phaser基本設定とBootScene
 *
 * @description
 * BootSceneのpreload()、create()、プログレスバー更新のテスト
 * T-0008-02: シーン遷移テスト
 *
 * 【リファクタリング内容】: モックではなく実際のBootSceneクラスをテストするように修正 🔴
 * 【改善ポイント】: Phaserシーンのライフサイクルメソッドを適切にモックし、実装クラスを直接テスト 🔴
 * 【品質向上】: 実装の動作を正確に検証できるようになった 🔴
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

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
        constructor(_config?: unknown) {
          // モックシーンコンストラクタ
        }
      },
      GameObjects: {
        Graphics: class MockGraphics {},
        Text: class MockText {},
      },
    },
  };
});

import { BootScene } from '@presentation/scenes/BootScene';

/**
 * Phaserシーンの基本モック
 *
 * 【モック目的】: Phaserのシーンライフサイクルメソッドを模倣 🔵
 * 【モック方針】: 必要最小限のプロパティとメソッドのみをモック化 🔵
 * 【テスト容易性】: 実装クラスの動作を検証しやすくする 🔵
 */
describe('BootScene', () => {
  let bootScene: BootScene;
  let mockLoad: ReturnType<typeof createMockLoad>;
  let mockScene: ReturnType<typeof createMockScene>;
  let mockAdd: ReturnType<typeof createMockAdd>;
  let mockCache: ReturnType<typeof createMockCache>;
  let mockCameras: ReturnType<typeof createMockCameras>;

  /**
   * createMockLoad - Loaderモックの作成
   *
   * 【機能概要】: Phaserのthis.loadオブジェクトをモック化 🔵
   * 【実装方針】: json(), on()メソッドをスパイ関数として提供 🔵
   */
  function createMockLoad() {
    return {
      json: vi.fn(),
      on: vi.fn(),
    };
  }

  /**
   * createMockScene - SceneManagerモックの作成
   *
   * 【機能概要】: Phaserのthis.sceneオブジェクトをモック化 🔵
   * 【実装方針】: start()メソッドをスパイ関数として提供 🔵
   */
  function createMockScene() {
    return {
      start: vi.fn(),
    };
  }

  /**
   * createMockAdd - GameObjectFactoryモックの作成
   *
   * 【機能概要】: Phaserのthis.addオブジェクトをモック化 🔵
   * 【実装方針】: graphics(), text()メソッドをモック化 🔵
   */
  function createMockAdd() {
    const mockGraphics = {
      fillStyle: vi.fn(),
      fillRect: vi.fn(),
      clear: vi.fn(),
      destroy: vi.fn(),
    };
    const mockText = {
      setOrigin: vi.fn().mockReturnThis(),
      destroy: vi.fn(),
    };
    return {
      graphics: vi.fn(() => mockGraphics),
      text: vi.fn(() => mockText),
    };
  }

  /**
   * createMockCache - CacheManagerモックの作成
   *
   * 【機能概要】: Phaserのthis.cacheオブジェクトをモック化 🔵
   * 【実装方針】: json.get()メソッドをスパイ関数として提供 🔵
   */
  function createMockCache() {
    return {
      json: {
        get: vi.fn((key: string) => {
          // 【テストデータ】: 各マスターデータに対して配列を返す 🔵
          return [];
        }),
      },
    };
  }

  /**
   * createMockCameras - CameraManagerモックの作成
   *
   * 【機能概要】: Phaserのthis.camerasオブジェクトをモック化 🔵
   * 【実装方針】: main.centerX, main.centerYを提供 🔵
   */
  function createMockCameras() {
    return {
      main: {
        centerX: 640,
        centerY: 360,
      },
    };
  }

  beforeEach(() => {
    // 【テスト前準備】: 各テストケース実行前にBootSceneインスタンスを初期化 🔵
    // 【環境初期化】: 前のテストの影響を排除するため、モックをリセット 🔵
    bootScene = new BootScene();

    // 【モック注入】: BootSceneにPhaserのモックオブジェクトを注入 🔵
    mockLoad = createMockLoad();
    mockScene = createMockScene();
    mockAdd = createMockAdd();
    mockCache = createMockCache();
    mockCameras = createMockCameras();

    // @ts-expect-error - テストのためにprivateプロパティにアクセス
    bootScene.load = mockLoad;
    // @ts-expect-error - テストのためにprivateプロパティにアクセス
    bootScene.scene = mockScene;
    // @ts-expect-error - テストのためにprivateプロパティにアクセス
    bootScene.add = mockAdd;
    // @ts-expect-error - テストのためにprivateプロパティにアクセス
    bootScene.cache = mockCache;
    // @ts-expect-error - テストのためにprivateプロパティにアクセス
    bootScene.cameras = mockCameras;

    vi.clearAllMocks();
  });

  describe('preload() - マスターデータ読み込み', () => {
    it('全てのマスターデータJSONファイルが読み込まれる', () => {
      // 【テスト目的】: マスターデータの初期読み込みが正常に完了することを確認 🔵
      // 【テスト内容】: this.load.json()で6種類のマスターデータが読み込まれることを検証 🔵
      // 【期待される動作】: cards, materials, recipes, quests, ranks, artifactsの全てが読み込まれる 🔵

      // 【実際の処理実行】: BootScene.preload()を呼び出す 🔵
      bootScene.preload();

      // 【結果検証】: this.load.json()が6回呼ばれたことを確認 🔵
      expect(mockLoad.json).toHaveBeenCalledTimes(6);

      // 【検証項目】: cardsマスターデータが正しいパスで読み込まれる 🔵
      expect(mockLoad.json).toHaveBeenCalledWith('cards', '/data/cards.json');

      // 【確認内容】: materialsマスターデータが正しいパスで読み込まれる 🔵
      expect(mockLoad.json).toHaveBeenCalledWith('materials', '/data/materials.json');

      // 【確認内容】: recipesマスターデータが正しいパスで読み込まれる 🔵
      expect(mockLoad.json).toHaveBeenCalledWith('recipes', '/data/recipes.json');

      // 【確認内容】: questsマスターデータが正しいパスで読み込まれる 🔵
      expect(mockLoad.json).toHaveBeenCalledWith('quests', '/data/quests.json');

      // 【確認内容】: ranksマスターデータが正しいパスで読み込まれる 🔵
      expect(mockLoad.json).toHaveBeenCalledWith('ranks', '/data/ranks.json');

      // 【確認内容】: artifactsマスターデータが正しいパスで読み込まれる 🔵
      expect(mockLoad.json).toHaveBeenCalledWith('artifacts', '/data/artifacts.json');
    });

    it('プログレスイベントが登録される', () => {
      // 【テスト目的】: ローディングUIのイベントハンドリングが正常に設定されることを確認 🔵
      // 【テスト内容】: progressイベントとcompleteイベントが登録されることを検証 🔵
      // 【期待される動作】: load.on()が適切なイベント名で呼ばれる 🔵

      // 【実際の処理実行】: BootScene.preload()を呼び出す 🔵
      bootScene.preload();

      // 【結果検証】: progressイベントが登録されることを確認 🔵
      expect(mockLoad.on).toHaveBeenCalledWith('progress', expect.any(Function), bootScene);

      // 【確認内容】: completeイベントが登録されることを確認 🔵
      expect(mockLoad.on).toHaveBeenCalledWith('complete', expect.any(Function), bootScene);

      // 【確認内容】: loaderrorイベントが登録されることを確認 🔵
      expect(mockLoad.on).toHaveBeenCalledWith('loaderror', expect.any(Function), bootScene);
    });

    it('プログレスバーのGraphicsオブジェクトが作成される', () => {
      // 【テスト目的】: プログレスバー表示のためのGraphicsオブジェクトが正しく生成されることを確認 🔵
      // 【テスト内容】: this.add.graphics()が呼ばれ、プログレスバー用のオブジェクトが作成されることを検証 🔵
      // 【期待される動作】: プログレスバー背景とプログレスバー本体の2つのGraphicsが作成される 🔵

      // 【実際の処理実行】: BootScene.preload()でプログレスバーを作成 🔵
      bootScene.preload();

      // 【結果検証】: this.add.graphics()が最低2回呼ばれることを確認 🔵
      expect(mockAdd.graphics).toHaveBeenCalledTimes(2);
    });

    it('ローディングテキストが表示される', () => {
      // 【テスト目的】: ローディング中のテキスト表示が正しく機能することを確認 🔵
      // 【テスト内容】: "Loading..."テキストが画面に表示されることを検証 🔵
      // 【期待される動作】: 画面中央にローディングテキストが表示される 🔵

      // 【実際の処理実行】: BootScene.preload()でローディングテキストを作成 🔵
      bootScene.preload();

      // 【結果検証】: this.add.text()が呼ばれることを確認 🔵
      expect(mockAdd.text).toHaveBeenCalledWith(640, 240, 'Loading...', expect.any(Object));
    });
  });

  describe('create() - サービス初期化とシーン遷移', () => {
    it('T-0008-02: TitleSceneへ自動遷移する', () => {
      // 【テスト目的】: シーン遷移フローが正常に動作することを確認 🔵
      // 【テスト内容】: this.scene.start('TitleScene')が呼ばれることを検証 🔵
      // 【期待される動作】: BootScene完了後、TitleSceneが開始される 🔵

      // 【実際の処理実行】: BootScene.create()を呼び出し 🔵
      bootScene.create();

      // 【結果検証】: TitleSceneへの遷移が実行されたことを確認 🔵
      expect(mockScene.start).toHaveBeenCalledWith('TitleScene');
    });

    it('マスターデータがキャッシュから取得される', () => {
      // 【テスト目的】: preload()で読み込んだマスターデータがcreate()で利用可能であることを確認 🔵
      // 【テスト内容】: this.cache.json.get()でマスターデータにアクセスできることを検証 🔵
      // 【期待される動作】: 各マスターデータがキャッシュから取得できる 🔵

      // 【実際の処理実行】: BootScene.create()でマスターデータを取得 🔵
      bootScene.create();

      // 【結果検証】: cache.json.get()が各マスターデータに対して呼ばれることを確認 🔵
      expect(mockCache.json.get).toHaveBeenCalledWith('cards');
      expect(mockCache.json.get).toHaveBeenCalledWith('materials');
      expect(mockCache.json.get).toHaveBeenCalledWith('recipes');
      expect(mockCache.json.get).toHaveBeenCalledWith('quests');
      expect(mockCache.json.get).toHaveBeenCalledWith('ranks');
      expect(mockCache.json.get).toHaveBeenCalledWith('artifacts');
    });
  });
});
