/**
 * Phaserテストユーティリティ
 *
 * TASK-0259: Phase4統合テスト
 * Phaser関連のテストで使用する共通のモック・ヘルパー関数を提供する。
 */

import { vi } from 'vitest';

/**
 * モックEventBusを作成する
 */
export function createMockEventBus() {
  const listeners = new Map<string, Set<(...args: unknown[]) => void>>();

  return {
    emit: vi.fn((event: string, payload?: unknown) => {
      const eventListeners = listeners.get(event);
      if (eventListeners) {
        eventListeners.forEach((callback) => callback(payload));
      }
    }),
    on: vi.fn((event: string, callback: (...args: unknown[]) => void) => {
      if (!listeners.has(event)) {
        listeners.set(event, new Set());
      }
      listeners.get(event)!.add(callback);
      return () => {
        listeners.get(event)?.delete(callback);
      };
    }),
    once: vi.fn((event: string, callback: (...args: unknown[]) => void) => {
      const wrapper = (...args: unknown[]) => {
        callback(...args);
        listeners.get(event)?.delete(wrapper);
      };
      if (!listeners.has(event)) {
        listeners.set(event, new Set());
      }
      listeners.get(event)!.add(wrapper);
      return () => {
        listeners.get(event)?.delete(wrapper);
      };
    }),
    off: vi.fn((event: string, callback?: (...args: unknown[]) => void) => {
      if (callback) {
        listeners.get(event)?.delete(callback);
      } else {
        listeners.get(event)?.clear();
      }
    }),
    clear: vi.fn(() => {
      listeners.clear();
    }),
    listenerCount: vi.fn((event?: string) => {
      if (event) {
        return listeners.get(event)?.size ?? 0;
      }
      let count = 0;
      listeners.forEach((set) => {
        count += set.size;
      });
      return count;
    }),
    _listeners: listeners,
  };
}

/**
 * テスト用ゲームフェーズ型
 */
type TestGamePhase = 'morning' | 'gathering' | 'alchemy' | 'delivery' | 'evening';

/**
 * モックStateManagerを作成する
 */
export function createMockStateManager() {
  const defaultGameState: {
    currentDay: number;
    currentPhase: TestGamePhase;
    maxDays: number;
  } = {
    currentDay: 1,
    currentPhase: 'morning',
    maxDays: 30,
  };

  const defaultPlayerState = {
    rank: 'G',
    promotionGauge: 0,
    promotionGaugeMax: 100,
    gold: 1000,
    actionPoints: 5,
    actionPointsMax: 5,
    rankDaysRemaining: 30,
  };

  const defaultQuestState = {
    availableQuests: [],
    activeQuests: [],
    completedQuestIds: [],
  };

  const defaultDeckState = {
    cards: [],
    hand: [],
    discardPile: [],
  };

  const defaultInventoryState = {
    materials: [],
    items: [],
  };

  let gameState = { ...defaultGameState };
  let playerState = { ...defaultPlayerState };
  let questState = { ...defaultQuestState };
  let deckState = { ...defaultDeckState };
  let inventoryState = { ...defaultInventoryState };

  return {
    getGameState: vi.fn(() => ({ ...gameState })),
    getPlayerState: vi.fn(() => ({ ...playerState })),
    getQuestState: vi.fn(() => ({ ...questState })),
    getDeckState: vi.fn(() => ({ ...deckState })),
    getInventoryState: vi.fn(() => ({ ...inventoryState })),
    // エイリアス（テスト互換性のため）
    getProgressData: vi.fn(() => ({ ...gameState })),
    getPlayerData: vi.fn(() => ({ ...playerState })),
    getSnapshot: vi.fn(() => ({
      game: gameState,
      player: playerState,
      quests: questState,
      deck: deckState,
      inventory: inventoryState,
    })),
    updateGameState: vi.fn((state: Partial<typeof gameState>) => {
      gameState = { ...gameState, ...state };
    }),
    updatePlayerState: vi.fn((state: Partial<typeof playerState>) => {
      playerState = { ...playerState, ...state };
    }),
    // エイリアス（テスト互換性のため）
    updateProgress: vi.fn((state: Partial<typeof gameState>) => {
      gameState = { ...gameState, ...state };
    }),
    updatePlayer: vi.fn((state: Partial<typeof playerState>) => {
      playerState = { ...playerState, ...state };
    }),
    updateQuestState: vi.fn((state: Partial<typeof questState>) => {
      questState = { ...questState, ...state };
    }),
    updateDeckState: vi.fn((state: typeof deckState) => {
      deckState = state;
    }),
    updateInventoryState: vi.fn((state: typeof inventoryState) => {
      inventoryState = state;
    }),
    reset: vi.fn(() => {
      gameState = { ...defaultGameState };
      playerState = { ...defaultPlayerState };
      questState = { ...defaultQuestState };
      deckState = { ...defaultDeckState };
      inventoryState = { ...defaultInventoryState };
    }),
    serialize: vi.fn(() =>
      JSON.stringify({
        game: gameState,
        player: playerState,
        quests: questState,
        deck: deckState,
        inventory: inventoryState,
      })
    ),
    deserialize: vi.fn((data: string) => {
      const parsed = JSON.parse(data);
      gameState = parsed.game ?? { ...defaultGameState };
      playerState = parsed.player ?? { ...defaultPlayerState };
      questState = parsed.quests ?? { ...defaultQuestState };
      deckState = parsed.deck ?? { ...defaultDeckState };
      inventoryState = parsed.inventory ?? { ...defaultInventoryState };
    }),
    restoreFromSnapshot: vi.fn((snapshot: Record<string, unknown>) => {
      gameState = (snapshot.game as typeof gameState) ?? { ...defaultGameState };
      playerState =
        (snapshot.player as typeof playerState) ?? { ...defaultPlayerState };
      questState =
        (snapshot.quests as typeof questState) ?? { ...defaultQuestState };
      deckState = (snapshot.deck as typeof deckState) ?? { ...defaultDeckState };
      inventoryState =
        (snapshot.inventory as typeof inventoryState) ?? {
          ...defaultInventoryState,
        };
    }),
    subscribe: vi.fn(() => vi.fn()),
    destroy: vi.fn(),
    initialize: vi.fn(),
    isInitialized: vi.fn(() => true),
    _setGameState: (state: Partial<typeof gameState>) => {
      gameState = { ...gameState, ...state };
    },
    _setPlayerState: (state: Partial<typeof playerState>) => {
      playerState = { ...playerState, ...state };
    },
    _setQuestState: (state: Partial<typeof questState>) => {
      questState = { ...questState, ...state };
    },
  };
}

/**
 * モックFlowManagerを作成する
 */
export function createMockFlowManager() {
  return {
    loadGame: vi.fn().mockResolvedValue(undefined),
    startNewGame: vi.fn().mockResolvedValue(undefined),
    advancePhase: vi.fn(),
    advanceDay: vi.fn(),
    getCurrentPhase: vi.fn().mockReturnValue('morning'),
    destroy: vi.fn(),
  };
}

/**
 * モックSceneを作成する
 */
export function createMockScene() {
  const mockTweens = {
    add: vi.fn().mockReturnValue({
      on: vi.fn(),
      play: vi.fn(),
      destroy: vi.fn(),
    }),
    timeline: vi.fn().mockReturnValue({
      add: vi.fn().mockReturnThis(),
      play: vi.fn(),
      destroy: vi.fn(),
    }),
  };

  const mockAdd = {
    graphics: vi.fn().mockReturnValue({
      fillStyle: vi.fn().mockReturnThis(),
      fillRoundedRect: vi.fn().mockReturnThis(),
      fillRect: vi.fn().mockReturnThis(),
      lineStyle: vi.fn().mockReturnThis(),
      strokeRoundedRect: vi.fn().mockReturnThis(),
      lineBetween: vi.fn().mockReturnThis(),
      clear: vi.fn().mockReturnThis(),
      destroy: vi.fn(),
    }),
    text: vi.fn().mockReturnValue({
      setOrigin: vi.fn().mockReturnThis(),
      setText: vi.fn().mockReturnThis(),
      setAlpha: vi.fn().mockReturnThis(),
      destroy: vi.fn(),
    }),
    container: vi.fn().mockReturnValue({
      add: vi.fn().mockReturnThis(),
      setAlpha: vi.fn().mockReturnThis(),
      setName: vi.fn().mockReturnThis(),
      setSize: vi.fn().mockReturnThis(),
      setInteractive: vi.fn().mockReturnThis(),
      on: vi.fn().mockReturnThis(),
      getByName: vi.fn(),
      destroy: vi.fn(),
      list: [],
    }),
    existing: vi.fn((obj) => obj),
  };

  const mockCameras = {
    main: {
      centerX: 640,
      centerY: 360,
      width: 1280,
      height: 720,
    },
  };

  return {
    add: mockAdd,
    tweens: mockTweens,
    cameras: mockCameras,
    scene: {
      start: vi.fn(),
      stop: vi.fn(),
      launch: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
    },
    destroy: vi.fn(),
  };
}

/**
 * モックLocalStorageを作成する
 */
export function createMockStorage(): Storage {
  const store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach((key) => delete store[key]);
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  };
}

/**
 * テスト用のゲームインスタンスを作成する
 */
export async function createTestGame() {
  const Phaser = (await import('phaser')).default;
  const { EventBus } = await import('@/game/events/EventBus');
  const { PhaserStateManager } = await import('@/game/state/PhaserStateManager');
  const { SceneKeys } = await import('@/game/config/SceneKeys');

  // 最小限のPhaser Game設定
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.HEADLESS,
    width: 1280,
    height: 720,
    parent: 'game-container',
    scene: [], // テスト用に空のシーン配列
    callbacks: {
      postBoot: (game) => {
        // EventBusとStateManagerをセットアップ
        const eventBus = EventBus.getInstance();
        const stateManager = new PhaserStateManager();
        game.registry.set('eventBus', eventBus);
        game.registry.set('stateManager', stateManager);
      },
    },
  };

  const game = new Phaser.Game(config);

  // ゲームの初期化を待つ
  await new Promise((resolve) => {
    game.events.once('ready', resolve);
  });

  const eventBus = game.registry.get('eventBus');
  const stateManager = game.registry.get('stateManager');

  return { game, eventBus, stateManager };
}

/**
 * 指定したシーンがアクティブになるまで待つ
 */
export async function waitForScene(game: Phaser.Game, sceneKey: string): Promise<void> {
  return new Promise((resolve) => {
    const checkScene = () => {
      if (game.scene.isActive(sceneKey)) {
        resolve();
      } else {
        setTimeout(checkScene, 50);
      }
    };
    checkScene();
  });
}

/**
 * ショップシーンに遷移する
 */
export async function navigateToShop(game: Phaser.Game, eventBus: any): Promise<void> {
  const { SceneKeys } = await import('@/game/config/SceneKeys');

  // メインシーンへ遷移
  await waitForScene(game, SceneKeys.MAIN);

  // ショップを開く
  eventBus.emit('ui:shop:open:requested');

  // ショップシーンがアクティブになるまで待つ
  await waitForScene(game, SceneKeys.SHOP);
}
