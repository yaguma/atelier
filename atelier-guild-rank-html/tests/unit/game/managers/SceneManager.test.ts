/**
 * SceneManager テスト
 *
 * SceneManagerの遷移機能をテストする。
 * Phaserはcanvas環境を必要とするため、モックを使用する。
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventBus } from '@game/events/EventBus';

// Phaserをモック
vi.mock('phaser', () => {
  const mockScene = {
    cameras: {
      main: {
        fadeOut: vi.fn(),
        fadeIn: vi.fn(),
        once: vi.fn((_event: string, callback: () => void) => {
          // 即座にコールバックを呼び出す
          setTimeout(callback, 0);
        }),
      },
    },
  };

  const mockScenePlugin = {
    start: vi.fn(),
    stop: vi.fn(),
    launch: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    getScene: vi.fn().mockReturnValue(mockScene),
  };

  const mockGame = {
    scene: mockScenePlugin,
  };

  return {
    default: {
      Game: vi.fn().mockImplementation(() => mockGame),
      Scene: class MockScene {},
    },
    Game: vi.fn().mockImplementation(() => mockGame),
    Scene: class MockScene {},
  };
});

// SceneManagerをモック後にインポート
import { SceneManager } from '@game/managers/SceneManager';
import { SceneKeys } from '@game/config/SceneKeys';
import { DefaultTransitions } from '@game/managers/SceneTransition';

describe('SceneManager', () => {
  let sceneManager: SceneManager;

  beforeEach(() => {
    EventBus.resetInstance();
    SceneManager.resetInstance();
    sceneManager = SceneManager.getInstance();
  });

  afterEach(() => {
    SceneManager.resetInstance();
    EventBus.resetInstance();
  });

  describe('シングルトン', () => {
    it('getInstance()で同じインスタンスを取得できる', () => {
      const instance1 = SceneManager.getInstance();
      const instance2 = SceneManager.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('resetInstance()でインスタンスがリセットされる', () => {
      const instance1 = SceneManager.getInstance();
      SceneManager.resetInstance();
      const instance2 = SceneManager.getInstance();
      expect(instance1).not.toBe(instance2);
    });
  });

  describe('状態取得', () => {
    it('初期状態でcurrentSceneはnull', () => {
      expect(sceneManager.getCurrentScene()).toBeNull();
    });

    it('初期状態でisTransitioning()はfalse', () => {
      expect(sceneManager.isTransitioning()).toBe(false);
    });
  });

  describe('goTo()', () => {
    it('シーン遷移でcurrentSceneが更新される', async () => {
      await sceneManager.goTo(SceneKeys.TITLE);
      expect(sceneManager.getCurrentScene()).toBe(SceneKeys.TITLE);
    });

    it('遷移が履歴に追加される', async () => {
      await sceneManager.goTo(SceneKeys.TITLE);
      await sceneManager.goTo(SceneKeys.MAIN);

      const history = sceneManager.getHistory();
      expect(history).toHaveLength(2);
      expect(history[0].from).toBeNull();
      expect(history[0].to).toBe(SceneKeys.TITLE);
      expect(history[1].from).toBe(SceneKeys.TITLE);
      expect(history[1].to).toBe(SceneKeys.MAIN);
    });

    it('遷移イベントが発火される', async () => {
      const eventBus = EventBus.getInstance();
      const startCallback = vi.fn();
      const completeCallback = vi.fn();

      eventBus.on('scene:transition:start', startCallback);
      eventBus.on('scene:transition:complete', completeCallback);

      await sceneManager.goTo(SceneKeys.TITLE);

      expect(startCallback).toHaveBeenCalledWith({
        from: null,
        to: SceneKeys.TITLE,
      });
      expect(completeCallback).toHaveBeenCalledWith({
        from: null,
        to: SceneKeys.TITLE,
      });
    });
  });

  describe('replace()', () => {
    it('シーンを置き換えてcurrentSceneが更新される', async () => {
      await sceneManager.goTo(SceneKeys.TITLE);
      await sceneManager.replace(SceneKeys.MAIN);
      expect(sceneManager.getCurrentScene()).toBe(SceneKeys.MAIN);
    });

    it('replaceは履歴に追加されない', async () => {
      await sceneManager.goTo(SceneKeys.TITLE);
      const historyBefore = sceneManager.getHistory().length;

      await sceneManager.replace(SceneKeys.MAIN);
      const historyAfter = sceneManager.getHistory().length;

      expect(historyAfter).toBe(historyBefore);
    });
  });

  describe('goBack()', () => {
    it('履歴がない場合はfalseを返す', async () => {
      const result = await sceneManager.goBack();
      expect(result).toBe(false);
    });

    it('履歴がある場合は前のシーンに戻りtrueを返す', async () => {
      await sceneManager.goTo(SceneKeys.TITLE);
      await sceneManager.goTo(SceneKeys.MAIN);

      const result = await sceneManager.goBack();
      expect(result).toBe(true);
      expect(sceneManager.getCurrentScene()).toBe(SceneKeys.TITLE);
    });

    it('canGoBack()が正しく動作する', async () => {
      expect(sceneManager.canGoBack()).toBe(false);

      await sceneManager.goTo(SceneKeys.TITLE);
      expect(sceneManager.canGoBack()).toBe(false); // fromがnullなので戻れない

      await sceneManager.goTo(SceneKeys.MAIN);
      expect(sceneManager.canGoBack()).toBe(true);
    });
  });

  describe('履歴管理', () => {
    it('getHistory()で履歴を取得できる', async () => {
      await sceneManager.goTo(SceneKeys.TITLE);
      const history = sceneManager.getHistory();

      expect(Array.isArray(history)).toBe(true);
      expect(history).toHaveLength(1);
    });

    it('clearHistory()で履歴をクリアできる', async () => {
      await sceneManager.goTo(SceneKeys.TITLE);
      await sceneManager.goTo(SceneKeys.MAIN);

      sceneManager.clearHistory();

      expect(sceneManager.getHistory()).toHaveLength(0);
      expect(sceneManager.canGoBack()).toBe(false);
    });

    it('履歴にタイムスタンプが含まれる', async () => {
      const before = Date.now();
      await sceneManager.goTo(SceneKeys.TITLE);
      const after = Date.now();

      const history = sceneManager.getHistory();
      expect(history[0].timestamp).toBeGreaterThanOrEqual(before);
      expect(history[0].timestamp).toBeLessThanOrEqual(after);
    });

    it('履歴に遷移設定が含まれる', async () => {
      await sceneManager.goTo(SceneKeys.TITLE, undefined, DefaultTransitions.quick);

      const history = sceneManager.getHistory();
      expect(history[0].transition.type).toBe('none');
      expect(history[0].transition.duration).toBe(0);
    });
  });

  describe('オーバーレイ管理', () => {
    const createMockGame = () => {
      const mockScene = {
        cameras: {
          main: {
            fadeOut: vi.fn(),
            fadeIn: vi.fn(),
            once: vi.fn((_event: string, callback: () => void) => {
              setTimeout(callback, 0);
            }),
          },
        },
      };

      return {
        scene: {
          start: vi.fn(),
          stop: vi.fn(),
          launch: vi.fn(),
          pause: vi.fn(),
          resume: vi.fn(),
          getScene: vi.fn().mockReturnValue(mockScene),
        },
      } as any;
    };

    it('初期状態でオーバーレイは開いていない', () => {
      expect(sceneManager.isOverlayOpen(SceneKeys.SHOP)).toBe(false);
      expect(sceneManager.getOpenOverlays()).toHaveLength(0);
    });

    it('openOverlay()でオーバーレイを開ける', async () => {
      sceneManager.setGame(createMockGame());
      await sceneManager.openOverlay(SceneKeys.SHOP);
      expect(sceneManager.isOverlayOpen(SceneKeys.SHOP)).toBe(true);
      expect(sceneManager.getOpenOverlays()).toContain(SceneKeys.SHOP);
    });

    it('closeOverlay()でオーバーレイを閉じられる', async () => {
      sceneManager.setGame(createMockGame());
      await sceneManager.openOverlay(SceneKeys.SHOP);
      await sceneManager.closeOverlay(SceneKeys.SHOP);
      expect(sceneManager.isOverlayOpen(SceneKeys.SHOP)).toBe(false);
    });

    it('closeAllOverlays()ですべてのオーバーレイを閉じられる', async () => {
      sceneManager.setGame(createMockGame());
      await sceneManager.openOverlay(SceneKeys.SHOP);
      await sceneManager.openOverlay(SceneKeys.RANK_UP);

      await sceneManager.closeAllOverlays();

      expect(sceneManager.getOpenOverlays()).toHaveLength(0);
    });

    it('同じオーバーレイを二重に開けない', async () => {
      sceneManager.setGame(createMockGame());
      await sceneManager.openOverlay(SceneKeys.SHOP);
      await sceneManager.openOverlay(SceneKeys.SHOP);

      expect(
        sceneManager.getOpenOverlays().filter(k => k === SceneKeys.SHOP)
      ).toHaveLength(1);
    });

    it('オーバーレイ開始イベントが発火される', async () => {
      const eventBus = EventBus.getInstance();
      const callback = vi.fn();
      eventBus.on('scene:overlay:opened', callback);

      sceneManager.setGame(createMockGame());
      await sceneManager.openOverlay(SceneKeys.SHOP);

      expect(callback).toHaveBeenCalledWith({ sceneKey: SceneKeys.SHOP });
    });

    it('オーバーレイ終了イベントが発火される', async () => {
      const eventBus = EventBus.getInstance();
      const callback = vi.fn();
      eventBus.on('scene:overlay:closed', callback);

      sceneManager.setGame(createMockGame());
      await sceneManager.openOverlay(SceneKeys.SHOP);
      await sceneManager.closeOverlay(SceneKeys.SHOP);

      expect(callback).toHaveBeenCalledWith({ sceneKey: SceneKeys.SHOP });
    });
  });

  describe('ゲームインスタンス管理', () => {
    it('setGame()でゲームインスタンスを設定できる', () => {
      const mockGame = { scene: {} } as any;
      sceneManager.setGame(mockGame);
      expect(sceneManager.getGame()).toBe(mockGame);
    });

    it('getGame()でゲームインスタンスを取得できる', () => {
      expect(sceneManager.getGame()).toBeNull();
    });
  });
});
