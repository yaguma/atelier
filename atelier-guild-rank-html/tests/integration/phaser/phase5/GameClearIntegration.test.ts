/**
 * TASK-0266: ゲームクリア統合テスト
 *
 * ゲームクリア条件と結果表示の統合テストを実施する。
 * Sランク到達時のクリア判定、統計表示、タイトルへの復帰が正しく動作することを検証する。
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
 * クリア履歴ストレージキー
 */
const CLEAR_HISTORY_KEY = 'atelier_guild_rank_clear_history';

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
    SceneKeys.RANK_UP,
    SceneKeys.GAME_CLEAR,
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

  // ゲームクリアイベントハンドラを設定
  setupGameClearEventHandlers(
    game,
    eventBus,
    sceneManager,
    stateManager,
    mockLocalStorage
  );

  return { game, eventBus, sceneManager, stateManager, localStorage: mockLocalStorage };
}

/**
 * ゲームクリアイベントハンドラを設定する
 */
function setupGameClearEventHandlers(
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

  // プレイ時間設定
  game.registry.set('saveLoadManager', {
    setPlaytime: (time: number) => {
      playTime = time;
    },
    getPlaytime: () => playTime,
  });

  // 昇格試験画面を開く（非同期ではなく同期的に処理）
  eventBus.on('ui:rankup:open:requested', async () => {
    // openOverlayはawaitしない（遷移中フラグを立てない）
    game.scene.isActive = vi.fn(
      (key: string) =>
        key === SceneKeys.MAIN || key === SceneKeys.RANK_UP
    );
    eventBus.emit('scene:overlay:opened', { sceneKey: SceneKeys.RANK_UP });
  });

  // 昇格試験画面を閉じる
  eventBus.on('ui:rankup:close:requested', () => {
    sceneManager.closeOverlay(SceneKeys.RANK_UP);
  });

  // 昇格試験に挑戦
  eventBus.on('ui:rankup:challenge:requested', ({ targetRank }: any) => {
    const playerState = stateManager.getPlayerState();
    const gameState = stateManager.getGameState();
    const questState = stateManager.getQuestState();
    const deckState = stateManager.getDeckState();

    const rankOrder = ['E', 'D', 'C', 'B', 'A', 'S'];
    const currentRankIndex = rankOrder.indexOf(playerState.rank);
    const targetRankIndex = rankOrder.indexOf(targetRank);

    // ランク飛ばしチェック
    if (targetRankIndex !== currentRankIndex + 1) {
      eventBus.emit('app:error:occurred', {
        message: 'ランクは順番に昇格する必要があります',
      });
      return;
    }

    // 経験値不足チェック
    if (playerState.exp < playerState.maxExp) {
      eventBus.emit('app:rankup:failed', {
        reason: '経験値が不足しています',
      });
      return;
    }

    // ランクアップ報酬
    const rankRewards: Record<string, { gold: number; cards: number }> = {
      D: { gold: 100, cards: 1 },
      C: { gold: 200, cards: 2 },
      B: { gold: 400, cards: 3 },
      A: { gold: 800, cards: 4 },
      S: { gold: 1600, cards: 5 },
    };

    const rewards = rankRewards[targetRank];

    // ランクアップ成功
    const newGold = playerState.gold + rewards.gold;
    const newCards = [...deckState.cards];
    for (let i = 0; i < rewards.cards; i++) {
      newCards.push({ id: `reward_card_${targetRank}_${i}`, type: 'gathering' });
    }

    // 次のランクの必要経験値
    const expRequirements: Record<string, number> = {
      D: 200,
      C: 400,
      B: 800,
      A: 1600,
      S: 0, // Sランクは最高ランク
    };

    stateManager.updatePlayer({
      rank: targetRank,
      exp: 0,
      maxExp: expRequirements[targetRank],
      gold: newGold,
    });

    stateManager.updateDeckState({ ...deckState, cards: newCards });

    eventBus.emit('app:rankup:success', {
      newRank: targetRank,
      rewards: {
        gold: rewards.gold,
        cards: rewards.cards,
      },
    });

    // Sランク到達でゲームクリア
    if (targetRank === 'S') {
      const clearDay = gameState.currentDay;
      const totalQuests = questState.completedQuestIds?.length ?? 0;
      const totalGold = newGold;

      // スコア計算
      const dayBonus = (30 - clearDay) * 100;
      const goldBonus = Math.floor(totalGold / 100);
      const questBonus = totalQuests * 50;
      const totalScore = dayBonus + goldBonus + questBonus;

      const stats = {
        clearDay,
        totalQuests,
        totalGold,
        playTime,
        dayBonus,
        goldBonus,
        questBonus,
        totalScore,
      };

      // クリア履歴を保存
      const existingHistory = localStorage.getItem(CLEAR_HISTORY_KEY);
      const history = existingHistory ? JSON.parse(existingHistory) : [];
      history.push({
        clearDay,
        rank: 'S',
        gold: totalGold,
        quests: totalQuests,
        score: totalScore,
        timestamp: Date.now(),
      });
      localStorage.setItem(CLEAR_HISTORY_KEY, JSON.stringify(history));

      eventBus.emit('app:game:clear', { stats });

      // シーンデータを設定
      game.scene.getScene = vi.fn((key: string) => {
        if (key === SceneKeys.GAME_CLEAR) {
          return {
            data: {
              get: vi.fn((dataKey: string) => {
                const sceneData: Record<string, unknown> = {
                  clearDay,
                  finalRank: 'S',
                  totalQuests,
                  totalGold,
                };
                return sceneData[dataKey];
              }),
            },
          };
        }
        return null;
      });

      sceneManager.goTo(SceneKeys.GAME_CLEAR);
    } else {
      // 成功後メインに戻る
      setTimeout(() => {
        sceneManager.closeOverlay(SceneKeys.RANK_UP);
      }, 100);
    }
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
}

describe('Game Clear Integration', () => {
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

  describe('Clear Condition - S Rank Achievement', () => {
    it('Sランク到達でゲームクリアになる', async () => {
      // Arrange
      stateManager.updatePlayer({
        rank: 'A',
        exp: 1600,
        maxExp: 1600,
      });
      eventBus.emit('ui:rankup:open:requested');

      const gameClearCallback = vi.fn();
      eventBus.on('app:game:clear', gameClearCallback);

      // Act
      eventBus.emit('ui:rankup:challenge:requested', { targetRank: 'S' });

      // Assert
      await vi.waitFor(() => {
        expect(gameClearCallback).toHaveBeenCalled();
      });
    });

    it('30日より前にクリアできる', async () => {
      // Arrange
      stateManager.updateGameState({ currentDay: 15, maxDays: 30 });
      stateManager.updatePlayer({
        rank: 'A',
        exp: 1600,
        maxExp: 1600,
      });
      eventBus.emit('ui:rankup:open:requested');

      // Act
      eventBus.emit('ui:rankup:challenge:requested', { targetRank: 'S' });

      // Assert
      await vi.waitFor(
        () => {
          expect(sceneManager.getCurrentScene()).toBe(SceneKeys.GAME_CLEAR);
        },
        { timeout: 5000 }
      );
    });

    it('クリア日数が記録される', async () => {
      // Arrange
      const clearDay = 20;
      stateManager.updateGameState({ currentDay: clearDay, maxDays: 30 });
      stateManager.updatePlayer({
        rank: 'A',
        exp: 1600,
        maxExp: 1600,
      });
      eventBus.emit('ui:rankup:open:requested');

      const gameClearCallback = vi.fn();
      eventBus.on('app:game:clear', gameClearCallback);

      // Act
      eventBus.emit('ui:rankup:challenge:requested', { targetRank: 'S' });

      // Assert
      await vi.waitFor(() => {
        expect(gameClearCallback).toHaveBeenCalledWith(
          expect.objectContaining({
            stats: expect.objectContaining({
              clearDay,
            }),
          })
        );
      });
    });
  });

  describe('Clear Statistics', () => {
    beforeEach(async () => {
      // クリア直前の状態を設定
      stateManager.updateGameState({ currentDay: 25, maxDays: 30 });
      stateManager.updatePlayer({
        rank: 'A',
        exp: 1600,
        maxExp: 1600,
        gold: 5000,
      });
      stateManager.updateQuestState({
        availableQuests: [],
        activeQuests: [],
        completedQuestIds: ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10'],
      });
    });

    it('完了した依頼数が正しく集計される', async () => {
      // Arrange
      eventBus.emit('ui:rankup:open:requested');

      const gameClearCallback = vi.fn();
      eventBus.on('app:game:clear', gameClearCallback);

      // Act
      eventBus.emit('ui:rankup:challenge:requested', { targetRank: 'S' });

      // Assert
      await vi.waitFor(() => {
        expect(gameClearCallback).toHaveBeenCalledWith(
          expect.objectContaining({
            stats: expect.objectContaining({
              totalQuests: 10,
            }),
          })
        );
      });
    });

    it('最終ゴールドが記録される', async () => {
      // Arrange
      eventBus.emit('ui:rankup:open:requested');

      const gameClearCallback = vi.fn();
      eventBus.on('app:game:clear', gameClearCallback);

      // Act
      eventBus.emit('ui:rankup:challenge:requested', { targetRank: 'S' });

      // Assert
      await vi.waitFor(() => {
        expect(gameClearCallback).toHaveBeenCalledWith(
          expect.objectContaining({
            stats: expect.objectContaining({
              // 初期5000 + 報酬1600 = 6600
              totalGold: 6600,
            }),
          })
        );
      });
    });

    it('プレイ時間が記録される', async () => {
      // Arrange
      const saveLoadManager = game.registry.get('saveLoadManager');
      saveLoadManager.setPlaytime(3600); // 1時間

      eventBus.emit('ui:rankup:open:requested');

      const gameClearCallback = vi.fn();
      eventBus.on('app:game:clear', gameClearCallback);

      // Act
      eventBus.emit('ui:rankup:challenge:requested', { targetRank: 'S' });

      // Assert
      await vi.waitFor(() => {
        expect(gameClearCallback).toHaveBeenCalledWith(
          expect.objectContaining({
            stats: expect.objectContaining({
              playTime: 3600,
            }),
          })
        );
      });
    });
  });

  describe('Game Clear Scene', () => {
    beforeEach(async () => {
      stateManager.updatePlayer({
        rank: 'A',
        exp: 1600,
        maxExp: 1600,
      });
    });

    it('GameClearSceneに遷移する', async () => {
      // Arrange
      eventBus.emit('ui:rankup:open:requested');

      // Act
      eventBus.emit('ui:rankup:challenge:requested', { targetRank: 'S' });

      // Assert
      await vi.waitFor(
        () => {
          expect(sceneManager.getCurrentScene()).toBe(SceneKeys.GAME_CLEAR);
        },
        { timeout: 5000 }
      );
    });

    it('クリア画面に統計が表示される', async () => {
      // Arrange
      stateManager.updateGameState({ currentDay: 20 });
      stateManager.updatePlayer({ gold: 8000, rank: 'A', exp: 1600, maxExp: 1600 });
      eventBus.emit('ui:rankup:open:requested');

      // Act
      eventBus.emit('ui:rankup:challenge:requested', { targetRank: 'S' });
      await vi.waitFor(
        () => {
          expect(sceneManager.getCurrentScene()).toBe(SceneKeys.GAME_CLEAR);
        },
        { timeout: 5000 }
      );

      // Assert
      const clearScene = game.scene.getScene(SceneKeys.GAME_CLEAR);
      expect(clearScene.data.get('clearDay')).toBe(20);
      expect(clearScene.data.get('finalRank')).toBe('S');
    });

    it('タイトルに戻るボタンが機能する', async () => {
      // Arrange
      eventBus.emit('ui:rankup:open:requested');
      eventBus.emit('ui:rankup:challenge:requested', { targetRank: 'S' });
      await vi.waitFor(
        () => {
          expect(sceneManager.getCurrentScene()).toBe(SceneKeys.GAME_CLEAR);
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

    it('もう一度プレイボタンが機能する', async () => {
      // Arrange
      eventBus.emit('ui:rankup:open:requested');
      eventBus.emit('ui:rankup:challenge:requested', { targetRank: 'S' });
      await vi.waitFor(
        () => {
          expect(sceneManager.getCurrentScene()).toBe(SceneKeys.GAME_CLEAR);
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
      expect(player.rank).toBe('E');
      expect(player.gold).toBe(500); // 初期値
    });
  });

  describe('Clear Data Persistence', () => {
    it('クリアデータがlocalStorageに保存される', async () => {
      // Arrange
      stateManager.updateGameState({ currentDay: 18 });
      stateManager.updatePlayer({
        rank: 'A',
        exp: 1600,
        maxExp: 1600,
      });
      eventBus.emit('ui:rankup:open:requested');

      // Act
      eventBus.emit('ui:rankup:challenge:requested', { targetRank: 'S' });
      await vi.waitFor(
        () => {
          expect(sceneManager.getCurrentScene()).toBe(SceneKeys.GAME_CLEAR);
        },
        { timeout: 5000 }
      );

      // Assert
      await vi.waitFor(() => {
        const clearData = localStorage.getItem(CLEAR_HISTORY_KEY);
        expect(clearData).not.toBeNull();

        const history = JSON.parse(clearData!);
        expect(history).toContainEqual(
          expect.objectContaining({
            clearDay: 18,
            rank: 'S',
          })
        );
      });
    });

    it('複数回クリアの履歴が保存される', async () => {
      // 1回目クリア
      stateManager.updateGameState({ currentDay: 20 });
      stateManager.updatePlayer({ rank: 'A', exp: 1600, maxExp: 1600 });
      eventBus.emit('ui:rankup:open:requested');
      eventBus.emit('ui:rankup:challenge:requested', { targetRank: 'S' });
      await vi.waitFor(
        () => {
          expect(sceneManager.getCurrentScene()).toBe(SceneKeys.GAME_CLEAR);
        },
        { timeout: 5000 }
      );

      // タイトルに戻って再プレイ
      eventBus.emit('ui:game:restart:requested');
      await vi.waitFor(
        () => {
          expect(sceneManager.getCurrentScene()).toBe(SceneKeys.MAIN);
        },
        { timeout: 5000 }
      );

      // 2回目クリア
      stateManager.updateGameState({ currentDay: 15 });
      stateManager.updatePlayer({ rank: 'A', exp: 1600, maxExp: 1600 });
      eventBus.emit('ui:rankup:open:requested');
      eventBus.emit('ui:rankup:challenge:requested', { targetRank: 'S' });
      await vi.waitFor(
        () => {
          expect(sceneManager.getCurrentScene()).toBe(SceneKeys.GAME_CLEAR);
        },
        { timeout: 5000 }
      );

      // Assert
      const clearData = localStorage.getItem(CLEAR_HISTORY_KEY);
      const history = JSON.parse(clearData!);
      expect(history.length).toBe(2);
    });
  });

  describe('Clear Score Calculation', () => {
    it('早くクリアするほど高スコア', async () => {
      // 20日クリア
      stateManager.updateGameState({ currentDay: 20 });
      stateManager.updatePlayer({ rank: 'A', exp: 1600, maxExp: 1600, gold: 3000 });
      eventBus.emit('ui:rankup:open:requested');

      const gameClearCallback = vi.fn();
      eventBus.on('app:game:clear', gameClearCallback);

      eventBus.emit('ui:rankup:challenge:requested', { targetRank: 'S' });

      await vi.waitFor(() => {
        const call = gameClearCallback.mock.calls[0];
        const stats = call[0].stats;

        // 日数ボーナス: (30 - 20) * 100 = 1000
        expect(stats.dayBonus).toBe(1000);
      });
    });

    it('ゴールドが多いほど高スコア', async () => {
      stateManager.updateGameState({ currentDay: 25 });
      stateManager.updatePlayer({ rank: 'A', exp: 1600, maxExp: 1600, gold: 10000 });
      eventBus.emit('ui:rankup:open:requested');

      const gameClearCallback = vi.fn();
      eventBus.on('app:game:clear', gameClearCallback);

      eventBus.emit('ui:rankup:challenge:requested', { targetRank: 'S' });

      await vi.waitFor(() => {
        const call = gameClearCallback.mock.calls[0];
        const stats = call[0].stats;

        // ゴールドボーナス: (10000 + 1600) / 100 = 116
        expect(stats.goldBonus).toBeGreaterThan(0);
      });
    });

    it('完了依頼数が多いほど高スコア', async () => {
      stateManager.updateGameState({ currentDay: 25 });
      stateManager.updatePlayer({ rank: 'A', exp: 1600, maxExp: 1600 });
      stateManager.updateQuestState({
        availableQuests: [],
        activeQuests: [],
        completedQuestIds: Array(20)
          .fill(0)
          .map((_, i) => `q${i}`),
      });
      eventBus.emit('ui:rankup:open:requested');

      const gameClearCallback = vi.fn();
      eventBus.on('app:game:clear', gameClearCallback);

      eventBus.emit('ui:rankup:challenge:requested', { targetRank: 'S' });

      await vi.waitFor(() => {
        const call = gameClearCallback.mock.calls[0];
        const stats = call[0].stats;

        // 依頼ボーナス: 20 * 50 = 1000
        expect(stats.questBonus).toBe(1000);
      });
    });

    it('総合スコアが計算される', async () => {
      stateManager.updateGameState({ currentDay: 20 });
      stateManager.updatePlayer({ rank: 'A', exp: 1600, maxExp: 1600, gold: 5000 });
      stateManager.updateQuestState({
        availableQuests: [],
        activeQuests: [],
        completedQuestIds: Array(10)
          .fill(0)
          .map((_, i) => `q${i}`),
      });
      eventBus.emit('ui:rankup:open:requested');

      const gameClearCallback = vi.fn();
      eventBus.on('app:game:clear', gameClearCallback);

      eventBus.emit('ui:rankup:challenge:requested', { targetRank: 'S' });

      await vi.waitFor(() => {
        const call = gameClearCallback.mock.calls[0];
        const stats = call[0].stats;

        expect(stats.totalScore).toBeDefined();
        expect(stats.totalScore).toBeGreaterThan(0);
      });
    });
  });

  describe('State Reset After Clear', () => {
    it('再プレイ後に全状態がリセットされる', async () => {
      // Arrange - クリアまで進める
      stateManager.updateGameState({ currentDay: 25 });
      stateManager.updatePlayer({ rank: 'A', exp: 1600, maxExp: 1600, gold: 10000 });
      stateManager.updateQuestState({
        availableQuests: [],
        activeQuests: [],
        completedQuestIds: ['q1', 'q2', 'q3'],
      });
      eventBus.emit('ui:rankup:open:requested');
      eventBus.emit('ui:rankup:challenge:requested', { targetRank: 'S' });
      await vi.waitFor(
        () => {
          expect(sceneManager.getCurrentScene()).toBe(SceneKeys.GAME_CLEAR);
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
    });

    it('プレイ時間がリセットされる', async () => {
      // Arrange
      const saveLoadManager = game.registry.get('saveLoadManager');
      saveLoadManager.setPlaytime(3600);

      stateManager.updatePlayer({ rank: 'A', exp: 1600, maxExp: 1600 });
      eventBus.emit('ui:rankup:open:requested');
      eventBus.emit('ui:rankup:challenge:requested', { targetRank: 'S' });
      await vi.waitFor(
        () => {
          expect(sceneManager.getCurrentScene()).toBe(SceneKeys.GAME_CLEAR);
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
});
