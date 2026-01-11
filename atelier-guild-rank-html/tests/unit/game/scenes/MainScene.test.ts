/**
 * MainScene単体テスト
 *
 * TASK-0235: MainScene基本レイアウト実装のテスト
 * TASK-0236: MainSceneフェーズ切替機能のテスト
 * メインシーンの基本レイアウト、データ設定、フェーズ切替をテストする。
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MainScene } from '../../../../src/game/scenes/MainScene';
import {
  MainSceneLayout,
  MainScenePhases,
  MainScenePhaseLabels,
} from '../../../../src/game/scenes/MainSceneConstants';
import type { PlayerData, GameState } from '../../../../src/game/scenes/MainScene';

// Phaserをモック
vi.mock('phaser', () => {
  class MockRectangle {
    x: number;
    y: number;
    width: number;
    height: number;
    constructor(x: number, y: number, width: number, height: number) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
    }
    static Contains = vi.fn().mockReturnValue(true);
  }

  return {
    default: {
      Scene: class MockScene {
        key: string;
        add: any;
        plugins: any;
        scene: any;
        registry: any;
        cameras: any;

        constructor(config: { key: string }) {
          this.key = config.key;
        }
      },
      Geom: {
        Rectangle: MockRectangle,
      },
      Math: {
        Between: vi.fn().mockReturnValue(0),
        DegToRad: vi.fn((deg: number) => (deg * Math.PI) / 180),
      },
    },
    Scene: class MockScene {
      key: string;
      add: any;
      plugins: any;
      scene: any;
      registry: any;
      cameras: any;

      constructor(config: { key: string }) {
        this.key = config.key;
      }
    },
    Geom: {
      Rectangle: MockRectangle,
    },
    Math: {
      Between: vi.fn().mockReturnValue(0),
      DegToRad: vi.fn((deg: number) => (deg * Math.PI) / 180),
    },
  };
});

/**
 * モックGraphicsオブジェクト作成
 */
function createMockGraphics() {
  const data: Map<string, unknown> = new Map();
  return {
    fillStyle: vi.fn().mockReturnThis(),
    fillRoundedRect: vi.fn().mockReturnThis(),
    fillRect: vi.fn().mockReturnThis(),
    fillCircle: vi.fn().mockReturnThis(),
    lineStyle: vi.fn().mockReturnThis(),
    strokeRoundedRect: vi.fn().mockReturnThis(),
    strokeRect: vi.fn().mockReturnThis(),
    strokeCircle: vi.fn().mockReturnThis(),
    clear: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
    setData: vi.fn().mockImplementation(function (this: any, key: string, value: unknown) {
      data.set(key, value);
      return this;
    }),
    getData: vi.fn().mockImplementation((key: string) => data.get(key)),
  };
}

/**
 * モックPhaserシーン作成
 */
function createMockScene(): Phaser.Scene {
  const createMockContainer = () => {
    const children: unknown[] = [];
    const container: any = {
      setDepth: vi.fn().mockReturnThis(),
      setVisible: vi.fn().mockReturnThis(),
      setAlpha: vi.fn().mockReturnThis(),
      add: vi.fn().mockImplementation((child: unknown) => {
        children.push(child);
        return container;
      }),
      destroy: vi.fn(),
      setData: vi.fn().mockReturnThis(),
      getData: vi.fn(),
      setInteractive: vi.fn().mockReturnThis(),
      disableInteractive: vi.fn().mockReturnThis(),
      on: vi.fn().mockReturnThis(),
      setPosition: vi.fn().mockReturnThis(),
      setScale: vi.fn().mockReturnThis(),
      x: 0,
      y: 0,
    };
    return container;
  };

  const createMockText = () => ({
    setOrigin: vi.fn().mockReturnThis(),
    setAlpha: vi.fn().mockReturnThis(),
    setText: vi.fn().mockReturnThis(),
    setColor: vi.fn().mockReturnThis(),
    setData: vi.fn().mockReturnThis(),
    getData: vi.fn(),
    destroy: vi.fn(),
    text: '',
  });

  const createMockRectangle = () => ({
    setInteractive: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
  });

  return {
    add: {
      container: vi.fn().mockImplementation((_x, _y) => createMockContainer()),
      graphics: vi.fn().mockImplementation(() => createMockGraphics()),
      text: vi.fn().mockImplementation(() => createMockText()),
      rectangle: vi.fn().mockImplementation(() => createMockRectangle()),
    },
    plugins: {
      get: vi.fn().mockReturnValue({}),
    },
    scene: {
      start: vi.fn(),
      launch: vi.fn(),
      pause: vi.fn(),
      stop: vi.fn(),
      resume: vi.fn(),
    },
    registry: {
      get: vi.fn(),
      set: vi.fn(),
    },
    cameras: {
      main: {
        width: 1024,
        height: 768,
      },
    },
    tweens: {
      add: vi.fn().mockImplementation((config) => {
        // 即座にonCompleteを呼び出す
        if (config.onComplete) {
          config.onComplete();
        }
        return { stop: vi.fn() };
      }),
    },
  } as unknown as Phaser.Scene;
}

/**
 * MainSceneインスタンスを作成（テスト用）
 */
function createMainScene(): MainScene {
  const scene = new MainScene();
  const mockScene = createMockScene();

  // モックシーンのプロパティを注入
  Object.assign(scene, {
    add: mockScene.add,
    plugins: mockScene.plugins,
    scene: mockScene.scene,
    registry: mockScene.registry,
    cameras: mockScene.cameras,
    tweens: (mockScene as any).tweens,
  });

  return scene;
}

describe('MainScene', () => {
  describe('MainSceneLayout定数', () => {
    it('画面サイズが定義されている', () => {
      expect(MainSceneLayout.SCREEN_WIDTH).toBe(1024);
      expect(MainSceneLayout.SCREEN_HEIGHT).toBe(768);
    });

    it('ヘッダーエリアが定義されている', () => {
      expect(MainSceneLayout.HEADER).toBeDefined();
      expect(MainSceneLayout.HEADER.X).toBe(0);
      expect(MainSceneLayout.HEADER.Y).toBe(0);
      expect(MainSceneLayout.HEADER.WIDTH).toBe(1024);
      expect(MainSceneLayout.HEADER.HEIGHT).toBe(60);
    });

    it('サイドバーエリアが定義されている', () => {
      expect(MainSceneLayout.SIDEBAR).toBeDefined();
      expect(MainSceneLayout.SIDEBAR.X).toBe(824);
      expect(MainSceneLayout.SIDEBAR.Y).toBe(60);
      expect(MainSceneLayout.SIDEBAR.WIDTH).toBe(200);
      expect(MainSceneLayout.SIDEBAR.HEIGHT).toBe(658);
    });

    it('メインエリアが定義されている', () => {
      expect(MainSceneLayout.MAIN_AREA).toBeDefined();
      expect(MainSceneLayout.MAIN_AREA.X).toBe(0);
      expect(MainSceneLayout.MAIN_AREA.Y).toBe(60);
      expect(MainSceneLayout.MAIN_AREA.WIDTH).toBe(824);
      expect(MainSceneLayout.MAIN_AREA.HEIGHT).toBe(658);
    });

    it('フッターエリアが定義されている', () => {
      expect(MainSceneLayout.FOOTER).toBeDefined();
      expect(MainSceneLayout.FOOTER.X).toBe(0);
      expect(MainSceneLayout.FOOTER.Y).toBe(718);
      expect(MainSceneLayout.FOOTER.WIDTH).toBe(824);
      expect(MainSceneLayout.FOOTER.HEIGHT).toBe(50);
    });

    it('フェーズコンテナ配置が定義されている', () => {
      expect(MainSceneLayout.PHASE_CONTAINER).toBeDefined();
      expect(MainSceneLayout.PHASE_CONTAINER.X).toBe(12);
      expect(MainSceneLayout.PHASE_CONTAINER.Y).toBe(70);
      expect(MainSceneLayout.PHASE_CONTAINER.WIDTH).toBe(800);
      expect(MainSceneLayout.PHASE_CONTAINER.HEIGHT).toBe(500);
    });
  });

  describe('MainScenePhases定数', () => {
    it('4つのフェーズが定義されている', () => {
      expect(MainScenePhases).toHaveLength(4);
      expect(MainScenePhases).toContain('quest-accept');
      expect(MainScenePhases).toContain('gathering');
      expect(MainScenePhases).toContain('alchemy');
      expect(MainScenePhases).toContain('delivery');
    });

    it('フェーズラベルが定義されている', () => {
      expect(MainScenePhaseLabels['quest-accept']).toBe('依頼受注');
      expect(MainScenePhaseLabels['gathering']).toBe('採取');
      expect(MainScenePhaseLabels['alchemy']).toBe('調合');
      expect(MainScenePhaseLabels['delivery']).toBe('納品');
    });
  });

  describe('コンストラクタ', () => {
    it('MainSceneインスタンスを生成できる', () => {
      const scene = new MainScene();
      expect(scene).toBeDefined();
    });
  });

  describe('シーン初期化', () => {
    let scene: MainScene;

    beforeEach(() => {
      scene = createMainScene();
      // init, preload, createを呼び出し
      (scene as any).init({});
      (scene as any).preload();
      (scene as any).create({});
    });

    it('ヘッダーコンテナが作成される', () => {
      expect(scene.getHeaderContainer()).toBeDefined();
    });

    it('サイドバーコンテナが作成される', () => {
      expect(scene.getSidebarContainer()).toBeDefined();
    });

    it('フッターコンテナが作成される', () => {
      expect(scene.getFooterContainer()).toBeDefined();
    });

    it('初期フェーズがquest-acceptである', () => {
      expect(scene.getCurrentPhase()).toBe('quest-accept');
    });
  });

  describe('データ設定', () => {
    let scene: MainScene;

    beforeEach(() => {
      scene = createMainScene();
      (scene as any).init({});
      (scene as any).preload();
      (scene as any).create({});
    });

    it('setPlayerDataでプレイヤーデータを設定できる', () => {
      const playerData: PlayerData = {
        rank: 'D',
        exp: 50,
        maxExp: 100,
        day: 10,
        maxDay: 30,
        gold: 500,
        ap: 2,
        maxAP: 3,
      };

      expect(() => scene.setPlayerData(playerData)).not.toThrow();
    });

    it('setGameStateでゲーム状態を設定できる', () => {
      const gameState: GameState = {
        currentPhase: 'gathering',
      };

      scene.setGameState(gameState);

      expect(scene.getCurrentPhase()).toBe('gathering');
    });

    it('setCurrentPhaseでフェーズを変更できる', () => {
      scene.setCurrentPhase('alchemy');

      expect(scene.getCurrentPhase()).toBe('alchemy');
    });
  });

  describe('getMainAreaBounds', () => {
    let scene: MainScene;

    beforeEach(() => {
      scene = createMainScene();
      (scene as any).init({});
      (scene as any).preload();
      (scene as any).create({});
    });

    it('フェーズコンテナの配置情報を返す', () => {
      const bounds = scene.getMainAreaBounds();

      expect(bounds.x).toBe(MainSceneLayout.PHASE_CONTAINER.X);
      expect(bounds.y).toBe(MainSceneLayout.PHASE_CONTAINER.Y);
      expect(bounds.width).toBe(MainSceneLayout.PHASE_CONTAINER.WIDTH);
      expect(bounds.height).toBe(MainSceneLayout.PHASE_CONTAINER.HEIGHT);
    });
  });

  describe('初期化データ付きシーン作成', () => {
    it('playerDataを渡してシーンを初期化できる', () => {
      const scene = createMainScene();
      const playerData: PlayerData = {
        rank: 'B',
        exp: 80,
        maxExp: 100,
        day: 25,
        maxDay: 30,
        gold: 2000,
        ap: 1,
        maxAP: 3,
      };

      (scene as any).init({ playerData });
      (scene as any).preload();
      (scene as any).create({ playerData });

      // エラーなく初期化完了
      expect(scene.getHeaderContainer()).toBeDefined();
    });

    it('gameStateを渡してシーンを初期化できる', () => {
      const scene = createMainScene();
      const gameState: GameState = {
        currentPhase: 'delivery',
      };

      (scene as any).init({ gameState });
      (scene as any).preload();
      (scene as any).create({ gameState });

      expect(scene.getCurrentPhase()).toBe('delivery');
    });
  });

  describe('フェーズ切替機能（TASK-0236）', () => {
    let scene: MainScene;

    beforeEach(() => {
      scene = createMainScene();
      (scene as any).init({});
      (scene as any).preload();
      (scene as any).create({});
    });

    describe('getNextPhase', () => {
      it('quest-acceptの次はgathering', () => {
        expect(scene.getNextPhase('quest-accept')).toBe('gathering');
      });

      it('gatheringの次はalchemy', () => {
        expect(scene.getNextPhase('gathering')).toBe('alchemy');
      });

      it('alchemyの次はdelivery', () => {
        expect(scene.getNextPhase('alchemy')).toBe('delivery');
      });

      it('deliveryの次はnull（最後のフェーズ）', () => {
        expect(scene.getNextPhase('delivery')).toBeNull();
      });
    });

    describe('isPhaseTransitioning', () => {
      it('初期状態では遷移中ではない', () => {
        expect(scene.isPhaseTransitioning()).toBe(false);
      });
    });

    describe('getActivePhaseContainer', () => {
      it('初期状態ではアクティブなコンテナはない', () => {
        expect(scene.getActivePhaseContainer()).toBeNull();
      });
    });

    describe('フェーズインジケーター更新', () => {
      it('setCurrentPhaseでインジケーターが更新される', () => {
        // setCurrentPhaseを呼び出しても例外が発生しない
        expect(() => scene.setCurrentPhase('gathering')).not.toThrow();
        expect(scene.getCurrentPhase()).toBe('gathering');
      });

      it('setGameStateでフェーズが変わるとインジケーターが更新される', () => {
        const gameState: GameState = {
          currentPhase: 'alchemy',
        };
        expect(() => scene.setGameState(gameState)).not.toThrow();
        expect(scene.getCurrentPhase()).toBe('alchemy');
      });
    });
  });

  describe('手札・デッキ統合機能（TASK-0237）', () => {
    let scene: MainScene;

    beforeEach(() => {
      scene = createMainScene();
      (scene as any).init({});
      (scene as any).preload();
      (scene as any).create({});
    });

    describe('getHandContainer', () => {
      it('HandContainerを取得できる', () => {
        expect(scene.getHandContainer()).toBeDefined();
      });
    });

    describe('getDeckView', () => {
      it('DeckViewを取得できる', () => {
        expect(scene.getDeckView()).toBeDefined();
      });
    });

    describe('手札管理', () => {
      it('getHandで手札を取得できる（初期状態は空）', () => {
        expect(scene.getHand()).toEqual([]);
      });

      it('getHandContainerのsetCardsメソッドが存在する', () => {
        expect(typeof scene.getHandContainer().setCards).toBe('function');
      });
    });

    describe('デッキ管理', () => {
      it('setDeckでデッキを設定できる', () => {
        const mockCards = [
          { id: 'card1', type: 'gathering', name: 'Test Card 1' },
          { id: 'card2', type: 'recipe', name: 'Test Card 2' },
          { id: 'card3', type: 'gathering', name: 'Test Card 3' },
        ] as any[];

        expect(() => scene.setDeck(mockCards)).not.toThrow();
        expect(scene.getDeck()).toHaveLength(3);
      });

      it('getDeckでデッキを取得できる（初期状態は空）', () => {
        expect(scene.getDeck()).toEqual([]);
      });
    });

    describe('drawCards', () => {
      it('drawCardsメソッドが存在する', () => {
        expect(typeof scene.drawCards).toBe('function');
      });

      it('デッキが空でもエラーにならない', async () => {
        const drawnCards = await scene.drawCards(1);
        expect(drawnCards).toHaveLength(0);
      });
    });

    describe('MainSceneLayout定数（TASK-0237追加分）', () => {
      it('手札エリアが定義されている', () => {
        expect(MainSceneLayout.HAND_AREA).toBeDefined();
        expect(MainSceneLayout.HAND_AREA.X).toBe(50);
        expect(MainSceneLayout.HAND_AREA.Y).toBe(580);
        expect(MainSceneLayout.HAND_AREA.WIDTH).toBe(700);
        expect(MainSceneLayout.HAND_AREA.HEIGHT).toBe(180);
      });

      it('デッキエリアが定義されている', () => {
        expect(MainSceneLayout.DECK_AREA).toBeDefined();
        expect(MainSceneLayout.DECK_AREA.X).toBe(850);
        expect(MainSceneLayout.DECK_AREA.Y).toBe(550);
        expect(MainSceneLayout.DECK_AREA.WIDTH).toBe(150);
        expect(MainSceneLayout.DECK_AREA.HEIGHT).toBe(100);
      });
    });
  });
});
