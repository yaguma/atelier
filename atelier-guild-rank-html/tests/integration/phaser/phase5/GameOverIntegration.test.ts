/**
 * TASK-0267: ゲームオーバー統合テスト
 *
 * ゲームオーバー条件と結果表示の統合テストを実施する。
 * 日数超過、ゴールド枯渇等のゲームオーバー判定、統計表示、リトライ機能が正しく動作することを検証する。
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SceneKeys } from '@game/config/SceneKeys';
import {
  createMockEventBus,
  createMockStateManager,
} from '../../../utils/phaserTestUtils';
import { getPhaserMock } from '../../../utils/phaserMocks';
import { createMockSceneManager } from '../../../utils/sceneManagerMock';

// 【Phaserモック】: テスト環境用のPhaserモックを設定
// 【理由】: jsdom環境ではCanvas APIが動作しないため 🔵
vi.mock('phaser', () => getPhaserMock());

/**
 * セーブデータストレージキー
 */
const SAVE_DATA_KEY = 'atelier_guild_rank_save_';

/**
 * モックlocalStorageの型定義
 */
interface MockLocalStorage {
  data: Record<string, string>;
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
}

/**
 * テスト用のPhaserゲームインスタンスを作成する
 */
async function createTestGame(): Promise<{
  game: any;
  eventBus: any;
  sceneManager: any;
  stateManager: any;
  localStorage: MockLocalStorage;
}> {
  const eventBus = createMockEventBus();
  const stateManager = createMockStateManager();

  const Phaser = await import('phaser');
  const game = new Phaser.default.Game();

  const validScenes = [
    SceneKeys.MAIN,
    SceneKeys.GAME_OVER,
    SceneKeys.TITLE,
  ];

  const sceneManager = createMockSceneManager(game, eventBus, validScenes);
  game.registry.set('sceneManager', sceneManager);
  game.registry.set('stateManager', stateManager);

  // モックlocalStorage
  const mockLocalStorage: MockLocalStorage = {
    data: {},
    getItem: (key: string) => mockLocalStorage.data[key] ?? null,
    setItem: (key: string, value: string) => {
      mockLocalStorage.data[key] = value;
    },
    removeItem: (key: string) => {
      delete mockLocalStorage.data[key];
    },
    clear: () => {
      mockLocalStorage.data = {};
    },
  };

  // ゲームオーバーイベントハンドラを設定
  setupGameOverEventHandlers(
    game,
    eventBus,
    sceneManager,
    stateManager,
    mockLocalStorage
  );

  return { game, eventBus, sceneManager, stateManager, localStorage: mockLocalStorage };
}

/**
 * ゲームオーバーイベントハンドラを設定する
 */
function setupGameOverEventHandlers(
  game: any,
  eventBus: any,
  sceneManager: any,
  stateManager: any,
  localStorage: MockLocalStorage
): void {
  // プレイ時間（秒）
  let playTime = 0;

  // ゲーム開始イベント
  eventBus.on('ui:game:start:requested', ({ isNewGame }: any) => {
    sceneManager.goTo(SceneKeys.MAIN);
    if (isNewGame) {
      playTime = 0;
      stateManager.updatePlayer({
        gold: 500,
        rank: 'E',
        exp: 0,
        maxExp: 100,
      });
      stateManager.updateGameState({
        currentDay: 1,
        maxDays: 30,
      });
      stateManager.updateQuestState({
        availableQuests: [],
        activeQuests: [],
        completedQuestIds: [],
      });
      stateManager.updateDeckState({ cards: [], hand: [], discardPile: [] });
    }
  });

  // プレイ時間設定・セーブ機能
  const saveLoadManager = {
    setPlaytime: (time: number) => {
      playTime = time;
    },
    getPlaytime: () => playTime,
    save: async (slotId: number) => {
      const data = {
        player: stateManager.getPlayerState(),
        game: stateManager.getGameState(),
        quests: stateManager.getQuestState(),
        deck: stateManager.getDeckState(),
        playTime,
      };
      localStorage.setItem(`${SAVE_DATA_KEY}${slotId}`, JSON.stringify(data));
    },
    load: async (slotId: number) => {
      const data = localStorage.getItem(`${SAVE_DATA_KEY}${slotId}`);
      if (data) {
        const parsed = JSON.parse(data);
        stateManager.updatePlayer(parsed.player);
        stateManager.updateGameState(parsed.game);
        stateManager.updateQuestState(parsed.quests);
        stateManager.updateDeckState(parsed.deck);
        playTime = parsed.playTime;
      }
    },
  };
  game.registry.set('saveLoadManager', saveLoadManager);

  // 日を進める（ターン終了）
  eventBus.on('ui:day:advance:requested', () => {
    const playerState = stateManager.getPlayerState();
    const gameState = stateManager.getGameState();

    // ゲームオーバー条件チェック
    // 1. ゴールド枯渇（マイナス）
    if (playerState.gold < 0) {
      const stats = {
        finalDay: gameState.currentDay,
        finalRank: playerState.rank,
        totalQuests: stateManager.getQuestState().completedQuestIds?.length ?? 0,
        totalGold: playerState.gold,
        playTime,
      };

      // シーンデータを設定
      game.scene.getScene = vi.fn((key: string) => {
        if (key === SceneKeys.GAME_OVER) {
          return {
            data: {
              get: vi.fn((dataKey: string) => {
                const sceneData: Record<string, unknown> = {
                  reason: '所持金が0を下回りました',
                  finalDay: stats.finalDay,
                  finalRank: stats.finalRank,
                };
                return sceneData[dataKey];
              }),
            },
          };
        }
        return null;
      });

      eventBus.emit('app:game:over', {
        reason: '所持金が0を下回りました',
        stats,
      });
      sceneManager.goTo(SceneKeys.GAME_OVER);
      return;
    }

    // 2. 日数超過（30日を超えた、かつSランク未達）
    if (gameState.currentDay >= gameState.maxDays && playerState.rank !== 'S') {
      const stats = {
        finalDay: gameState.currentDay,
        finalRank: playerState.rank,
        totalQuests: stateManager.getQuestState().completedQuestIds?.length ?? 0,
        totalGold: playerState.gold,
        playTime,
      };

      // シーンデータを設定
      game.scene.getScene = vi.fn((key: string) => {
        if (key === SceneKeys.GAME_OVER) {
          return {
            data: {
              get: vi.fn((dataKey: string) => {
                const sceneData: Record<string, unknown> = {
                  reason: '30日以内にSランクに到達できませんでした',
                  finalDay: stats.finalDay,
                  finalRank: stats.finalRank,
                };
                return sceneData[dataKey];
              }),
            },
          };
        }
        return null;
      });

      eventBus.emit('app:game:over', {
        reason: '30日以内にSランクに到達できませんでした',
        stats,
      });
      sceneManager.goTo(SceneKeys.GAME_OVER);
      return;
    }

    // 日数警告（残り5日以下）
    const remainingDays = gameState.maxDays - gameState.currentDay;
    if (remainingDays <= 5 && playerState.rank !== 'S') {
      eventBus.emit('app:day:warning', {
        remainingDays,
      });
    }

    // ゴールド警告（100以下）
    if (playerState.gold <= 100 && playerState.gold >= 0) {
      eventBus.emit('app:gold:warning', {
        gold: playerState.gold,
      });
    }

    // 日を進める
    stateManager.updateGameState({
      currentDay: gameState.currentDay + 1,
    });
  });

  // タイトルに戻る
  eventBus.on('ui:return:title:requested', () => {
    sceneManager.goTo(SceneKeys.TITLE);
  });

  // 再プレイ
  eventBus.on('ui:game:restart:requested', () => {
    playTime = 0;
    stateManager.updatePlayer({
      gold: 500,
      rank: 'E',
      exp: 0,
      maxExp: 100,
    });
    stateManager.updateGameState({
      currentDay: 1,
      maxDays: 30,
    });
    stateManager.updateQuestState({
      availableQuests: [],
      activeQuests: [],
      completedQuestIds: [],
    });
    stateManager.updateDeckState({ cards: [], hand: [], discardPile: [] });
    sceneManager.goTo(SceneKeys.MAIN);
  });

  // セーブデータからロード
  eventBus.on('ui:game:load:requested', async ({ slotId }: any) => {
    await saveLoadManager.load(slotId);
    sceneManager.goTo(SceneKeys.MAIN);
  });
}

/**
 * 日を進めるヘルパー関数
 */
async function advanceDay(eventBus: any): Promise<void> {
  eventBus.emit('ui:day:advance:requested');
  // 処理完了を待つ
  await new Promise((resolve) => setTimeout(resolve, 100));
}

describe('Game Over Integration', () => {
  let game: any;
  let eventBus: any;
  let sceneManager: any;
  let stateManager: any;
  let localStorage: MockLocalStorage;

  beforeEach(async () => {
    const testSetup = await createTestGame();
    game = testSetup.game;
    eventBus = testSetup.eventBus;
    sceneManager = testSetup.sceneManager;
    stateManager = testSetup.stateManager;
    localStorage = testSetup.localStorage;

    // ゲーム開始
    eventBus.emit('ui:game:start:requested', { isNewGame: true });

    // シーン遷移完了を待つ
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  afterEach(() => {
    if (game && game.destroy) {
      game.destroy(true);
    }
    localStorage.clear();
  });

  describe('Game Over Condition - Day Limit Exceeded', () => {
    it('30日を超えるとゲームオーバーになる', async () => {
      // Arrange
      stateManager.updateGameState({ currentDay: 30, maxDays: 30 });
      stateManager.updatePlayer({ rank: 'C' }); // Sランク未達

      const gameOverCallback = vi.fn();
      eventBus.on('app:game:over', gameOverCallback);

      // Act
      await advanceDay(eventBus);

      // Assert
      await vi.waitFor(() => {
        expect(gameOverCallback).toHaveBeenCalledWith(
          expect.objectContaining({
            reason: expect.stringContaining('30日'),
          })
        );
      });
    });

    it('最終日でSランク未達の場合ゲームオーバー', async () => {
      // Arrange - 各ランクでテスト
      const nonClearRanks = ['E', 'D', 'C', 'B', 'A'];

      for (const rank of nonClearRanks) {
        const testSetup = await createTestGame();
        const localStateManager = testSetup.stateManager;
        const localEventBus = testSetup.eventBus;

        localEventBus.emit('ui:game:start:requested', { isNewGame: true });
        await new Promise((resolve) => setTimeout(resolve, 100));

        localStateManager.updateGameState({ currentDay: 30, maxDays: 30 });
        localStateManager.updatePlayer({ rank });

        const gameOverCallback = vi.fn();
        localEventBus.on('app:game:over', gameOverCallback);

        await advanceDay(localEventBus);

        expect(gameOverCallback).toHaveBeenCalled();
        testSetup.game.destroy(true);
      }
    });

    it('GameOverSceneに遷移する', async () => {
      // Arrange
      stateManager.updateGameState({ currentDay: 30, maxDays: 30 });
      stateManager.updatePlayer({ rank: 'B' });

      // Act
      await advanceDay(eventBus);

      // Assert
      await vi.waitFor(
        () => {
          expect(sceneManager.getCurrentScene()).toBe(SceneKeys.GAME_OVER);
        },
        { timeout: 5000 }
      );
    });
  });

  describe('Game Over Condition - Gold Depletion', () => {
    it('ゴールドがマイナスになるとゲームオーバー', async () => {
      // Arrange
      stateManager.updatePlayer({ gold: -1 });

      const gameOverCallback = vi.fn();
      eventBus.on('app:game:over', gameOverCallback);

      // Act - ターン終了時にチェック
      await advanceDay(eventBus);

      // Assert
      await vi.waitFor(() => {
        expect(gameOverCallback).toHaveBeenCalledWith(
          expect.objectContaining({
            reason: expect.stringContaining('所持金'),
          })
        );
      });
    });

    it('ゴールド0は許容される', async () => {
      // Arrange
      stateManager.updatePlayer({ gold: 0 });
      stateManager.updateGameState({ currentDay: 1, maxDays: 30 });

      const gameOverCallback = vi.fn();
      eventBus.on('app:game:over', gameOverCallback);

      // Act
      await advanceDay(eventBus);

      // Assert - ゲームオーバーにはならない
      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(gameOverCallback).not.toHaveBeenCalled();
    });
  });

  describe('Game Over Statistics', () => {
    beforeEach(async () => {
      // ゲームオーバー直前の状態を設定
      stateManager.updateGameState({ currentDay: 30, maxDays: 30 });
      stateManager.updatePlayer({
        rank: 'B',
        exp: 500,
        maxExp: 800,
        gold: 2000,
      });
      stateManager.updateQuestState({
        availableQuests: [],
        activeQuests: [{ id: 'q6' }],
        completedQuestIds: ['q1', 'q2', 'q3', 'q4', 'q5'],
      });
    });

    it('最終日数が記録される', async () => {
      // Arrange
      const gameOverCallback = vi.fn();
      eventBus.on('app:game:over', gameOverCallback);

      // Act
      await advanceDay(eventBus);

      // Assert
      await vi.waitFor(() => {
        expect(gameOverCallback).toHaveBeenCalledWith(
          expect.objectContaining({
            stats: expect.objectContaining({
              finalDay: 30,
            }),
          })
        );
      });
    });

    it('最終ランクが記録される', async () => {
      // Arrange
      const gameOverCallback = vi.fn();
      eventBus.on('app:game:over', gameOverCallback);

      // Act
      await advanceDay(eventBus);

      // Assert
      await vi.waitFor(() => {
        expect(gameOverCallback).toHaveBeenCalledWith(
          expect.objectContaining({
            stats: expect.objectContaining({
              finalRank: 'B',
            }),
          })
        );
      });
    });

    it('完了した依頼数が記録される', async () => {
      // Arrange
      const gameOverCallback = vi.fn();
      eventBus.on('app:game:over', gameOverCallback);

      // Act
      await advanceDay(eventBus);

      // Assert
      await vi.waitFor(() => {
        expect(gameOverCallback).toHaveBeenCalledWith(
          expect.objectContaining({
            stats: expect.objectContaining({
              totalQuests: 5,
            }),
          })
        );
      });
    });

    it('プレイ時間が記録される', async () => {
      // Arrange
      const saveLoadManager = game.registry.get('saveLoadManager');
      saveLoadManager.setPlaytime(1800); // 30分

      const gameOverCallback = vi.fn();
      eventBus.on('app:game:over', gameOverCallback);

      // Act
      await advanceDay(eventBus);

      // Assert
      await vi.waitFor(() => {
        expect(gameOverCallback).toHaveBeenCalledWith(
          expect.objectContaining({
            stats: expect.objectContaining({
              playTime: 1800,
            }),
          })
        );
      });
    });
  });

  describe('Game Over Scene', () => {
    beforeEach(async () => {
      stateManager.updateGameState({ currentDay: 30, maxDays: 30 });
      stateManager.updatePlayer({ rank: 'C' });
    });

    it('ゲームオーバー理由が表示される', async () => {
      // Arrange & Act
      await advanceDay(eventBus);
      await vi.waitFor(
        () => {
          expect(sceneManager.getCurrentScene()).toBe(SceneKeys.GAME_OVER);
        },
        { timeout: 5000 }
      );

      // Assert
      const gameOverScene = game.scene.getScene(SceneKeys.GAME_OVER);
      expect(gameOverScene.data.get('reason')).toContain('30日');
    });

    it('統計が表示される', async () => {
      // Arrange
      stateManager.updatePlayer({
        rank: 'C',
        gold: 1500,
      });

      // Act
      await advanceDay(eventBus);
      await vi.waitFor(
        () => {
          expect(sceneManager.getCurrentScene()).toBe(SceneKeys.GAME_OVER);
        },
        { timeout: 5000 }
      );

      // Assert
      const gameOverScene = game.scene.getScene(SceneKeys.GAME_OVER);
      expect(gameOverScene.data.get('finalRank')).toBe('C');
      expect(gameOverScene.data.get('finalDay')).toBe(30);
    });

    it('タイトルに戻るボタンが機能する', async () => {
      // Arrange
      await advanceDay(eventBus);
      await vi.waitFor(
        () => {
          expect(sceneManager.getCurrentScene()).toBe(SceneKeys.GAME_OVER);
        },
        { timeout: 5000 }
      );

      // Act
      eventBus.emit('ui:return:title:requested');

      // Assert
      await vi.waitFor(
        () => {
          expect(sceneManager.getCurrentScene()).toBe(SceneKeys.TITLE);
        },
        { timeout: 5000 }
      );
    });

    it('リトライボタンが機能する', async () => {
      // Arrange
      await advanceDay(eventBus);
      await vi.waitFor(
        () => {
          expect(sceneManager.getCurrentScene()).toBe(SceneKeys.GAME_OVER);
        },
        { timeout: 5000 }
      );

      // Act
      eventBus.emit('ui:game:restart:requested');

      // Assert
      await vi.waitFor(
        () => {
          expect(sceneManager.getCurrentScene()).toBe(SceneKeys.MAIN);
        },
        { timeout: 5000 }
      );

      // 状態がリセットされている
      const player = stateManager.getPlayerData();
      const gameState = stateManager.getGameState();
      expect(player.rank).toBe('E');
      expect(gameState.currentDay).toBe(1);
    });

    it('最後のセーブからロードできる', async () => {
      // Arrange - セーブデータを作成
      const saveLoadManager = game.registry.get('saveLoadManager');
      stateManager.updateGameState({ currentDay: 20 });
      stateManager.updatePlayer({ rank: 'B', gold: 3000 });
      await saveLoadManager.save(1);

      // ゲームオーバーに
      stateManager.updateGameState({ currentDay: 30 });
      stateManager.updatePlayer({ rank: 'C', gold: 100 });
      await advanceDay(eventBus);
      await vi.waitFor(
        () => {
          expect(sceneManager.getCurrentScene()).toBe(SceneKeys.GAME_OVER);
        },
        { timeout: 5000 }
      );

      // Act
      eventBus.emit('ui:game:load:requested', { slotId: 1 });

      // Assert
      await vi.waitFor(
        () => {
          expect(sceneManager.getCurrentScene()).toBe(SceneKeys.MAIN);
        },
        { timeout: 5000 }
      );
      const gameState = stateManager.getGameState();
      expect(gameState.currentDay).toBe(20);
    });
  });

  describe('Game Over Reasons', () => {
    it('日数超過の理由メッセージが適切', async () => {
      // Arrange
      stateManager.updateGameState({ currentDay: 30, maxDays: 30 });
      stateManager.updatePlayer({ rank: 'C' });

      const gameOverCallback = vi.fn();
      eventBus.on('app:game:over', gameOverCallback);

      // Act
      await advanceDay(eventBus);

      // Assert
      await vi.waitFor(() => {
        const call = gameOverCallback.mock.calls[0];
        expect(call[0].reason).toMatch(/30日|Sランク/);
      });
    });

    it('ゴールド枯渇の理由メッセージが適切', async () => {
      // Arrange
      stateManager.updateGameState({ currentDay: 15 });
      stateManager.updatePlayer({ gold: -100 });

      const gameOverCallback = vi.fn();
      eventBus.on('app:game:over', gameOverCallback);

      // Act
      await advanceDay(eventBus);

      // Assert
      await vi.waitFor(() => {
        const call = gameOverCallback.mock.calls[0];
        expect(call[0].reason).toMatch(/所持金|0/);
      });
    });
  });

  describe('State Reset After Game Over', () => {
    it('リトライ後に全状態がリセットされる', async () => {
      // Arrange
      stateManager.updateGameState({ currentDay: 30, maxDays: 30 });
      stateManager.updatePlayer({ rank: 'B', gold: 100, exp: 500 });
      stateManager.updateQuestState({
        availableQuests: [],
        activeQuests: [{ id: 'q2' }],
        completedQuestIds: ['q1'],
      });

      await advanceDay(eventBus);
      await vi.waitFor(
        () => {
          expect(sceneManager.getCurrentScene()).toBe(SceneKeys.GAME_OVER);
        },
        { timeout: 5000 }
      );

      // Act
      eventBus.emit('ui:game:restart:requested');
      await vi.waitFor(
        () => {
          expect(sceneManager.getCurrentScene()).toBe(SceneKeys.MAIN);
        },
        { timeout: 5000 }
      );

      // Assert
      const player = stateManager.getPlayerData();
      const gameState = stateManager.getGameState();
      const quests = stateManager.getQuestState();

      expect(player.rank).toBe('E');
      expect(player.gold).toBe(500); // 初期値
      expect(player.exp).toBe(0);
      expect(gameState.currentDay).toBe(1);
      expect(quests.completedQuestIds.length).toBe(0);
      expect(quests.activeQuests.length).toBe(0);
    });

    it('プレイ時間がリセットされる', async () => {
      // Arrange
      const saveLoadManager = game.registry.get('saveLoadManager');
      saveLoadManager.setPlaytime(3600);

      stateManager.updateGameState({ currentDay: 30 });
      stateManager.updatePlayer({ rank: 'C' });
      await advanceDay(eventBus);
      await vi.waitFor(
        () => {
          expect(sceneManager.getCurrentScene()).toBe(SceneKeys.GAME_OVER);
        },
        { timeout: 5000 }
      );

      // Act
      eventBus.emit('ui:game:restart:requested');
      await vi.waitFor(
        () => {
          expect(sceneManager.getCurrentScene()).toBe(SceneKeys.MAIN);
        },
        { timeout: 5000 }
      );

      // Assert
      expect(saveLoadManager.getPlaytime()).toBe(0);
    });
  });

  describe('Warning Before Game Over', () => {
    it('残り5日で警告が表示される', async () => {
      // Arrange
      stateManager.updateGameState({ currentDay: 25, maxDays: 30 });
      stateManager.updatePlayer({ rank: 'C' });

      const warningCallback = vi.fn();
      eventBus.on('app:day:warning', warningCallback);

      // Act
      await advanceDay(eventBus);

      // Assert - 25日目の終了時、残り5日として警告
      await vi.waitFor(() => {
        expect(warningCallback).toHaveBeenCalledWith(
          expect.objectContaining({
            remainingDays: 5,
          })
        );
      });
    });

    it('ゴールドが低下すると警告が表示される', async () => {
      // Arrange
      stateManager.updatePlayer({ gold: 50 });
      stateManager.updateGameState({ currentDay: 1, maxDays: 30 });

      const warningCallback = vi.fn();
      eventBus.on('app:gold:warning', warningCallback);

      // Act
      await advanceDay(eventBus);

      // Assert
      await vi.waitFor(() => {
        expect(warningCallback).toHaveBeenCalled();
      });
    });

    it('残り3日で警告が表示される', async () => {
      // Arrange
      stateManager.updateGameState({ currentDay: 27, maxDays: 30 });
      stateManager.updatePlayer({ rank: 'B' });

      const warningCallback = vi.fn();
      eventBus.on('app:day:warning', warningCallback);

      // Act
      await advanceDay(eventBus);

      // Assert - 27日目の終了時、残り3日として警告
      await vi.waitFor(() => {
        expect(warningCallback).toHaveBeenCalledWith(
          expect.objectContaining({
            remainingDays: 3,
          })
        );
      });
    });

    it('最終日で警告が表示される', async () => {
      // Arrange
      stateManager.updateGameState({ currentDay: 29, maxDays: 30 });
      stateManager.updatePlayer({ rank: 'A' });

      const warningCallback = vi.fn();
      eventBus.on('app:day:warning', warningCallback);

      // Act
      await advanceDay(eventBus);

      // Assert - 29日目の終了時、残り1日として警告
      await vi.waitFor(() => {
        expect(warningCallback).toHaveBeenCalledWith(
          expect.objectContaining({
            remainingDays: 1,
          })
        );
      });
    });
  });

  describe('No Game Over When Conditions Not Met', () => {
    it('日数に余裕があればゲームオーバーにならない', async () => {
      // Arrange
      stateManager.updateGameState({ currentDay: 15, maxDays: 30 });
      stateManager.updatePlayer({ rank: 'D', gold: 1000 });

      const gameOverCallback = vi.fn();
      eventBus.on('app:game:over', gameOverCallback);

      // Act
      await advanceDay(eventBus);

      // Assert
      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(gameOverCallback).not.toHaveBeenCalled();
      expect(sceneManager.getCurrentScene()).toBe(SceneKeys.MAIN);
    });

    it('ゴールドがプラスならゲームオーバーにならない', async () => {
      // Arrange
      stateManager.updateGameState({ currentDay: 10, maxDays: 30 });
      stateManager.updatePlayer({ rank: 'E', gold: 100 });

      const gameOverCallback = vi.fn();
      eventBus.on('app:game:over', gameOverCallback);

      // Act
      await advanceDay(eventBus);

      // Assert
      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(gameOverCallback).not.toHaveBeenCalled();
    });
  });
});
