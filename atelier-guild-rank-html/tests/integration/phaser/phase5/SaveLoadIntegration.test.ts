/**
 * セーブ・ロード統合テスト
 *
 * TASK-0268: セーブ・ロード統合テスト
 * 手動セーブ、オートセーブ、ロード、データ整合性が正しく動作することを検証する。
 *
 * 【テスト対象】
 * - 手動セーブ（スロット1-3）
 * - 手動ロード
 * - オートセーブ
 * - セーブスロット管理
 * - プレイ時間追跡
 * - データ整合性
 * - エッジケース
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createMockEventBus,
  createMockStateManager,
  createMockStorage,
} from '../../../utils/phaserTestUtils';
import { createMockSceneManager } from '../../../utils/sceneManagerMock';

/**
 * SaveLoadManagerのモック
 *
 * 【機能】: セーブ・ロード機能のテスト用モック
 */
function createMockSaveLoadManager(
  stateManager: ReturnType<typeof createMockStateManager>,
  eventBus: ReturnType<typeof createMockEventBus>,
  storage: Storage
) {
  // 【状態】: オートセーブの有効状態とプレイ時間
  let autoSaveEnabled = false;
  let autoSaveInterval: NodeJS.Timeout | null = null;
  let playtime = 0;
  let playtimeInterval: NodeJS.Timeout | null = null;

  // 【セーブキー】: localStorageのキープレフィックス
  const SAVE_KEY_PREFIX = 'atelier_guild_rank_save_';
  const AUTO_SAVE_KEY = 'atelier_guild_rank_autosave';
  const SAVE_VERSION = '1.0.0';

  const saveLoadManager = {
    /**
     * セーブ: 指定スロットに現在の状態を保存
     */
    save: vi.fn(async (slotId: number): Promise<boolean> => {
      // 【バリデーション】: スロットIDが1-3の範囲内かチェック
      if (slotId < 1 || slotId > 3) {
        return false;
      }

      try {
        const snapshot = stateManager.getSnapshot();
        const saveData = {
          version: SAVE_VERSION,
          timestamp: Date.now(),
          playtime,
          ...snapshot,
        };

        storage.setItem(`${SAVE_KEY_PREFIX}${slotId}`, JSON.stringify(saveData));
        eventBus.emit('save:complete', { slotId });
        return true;
      } catch (error) {
        eventBus.emit('save:failed', { slotId, error });
        return false;
      }
    }),

    /**
     * ロード: 指定スロットから状態を復元
     */
    load: vi.fn(async (slotId: number): Promise<boolean> => {
      // 【バリデーション】: スロットIDが1-3の範囲内かチェック
      if (slotId < 1 || slotId > 3) {
        return false;
      }

      try {
        const savedJson = storage.getItem(`${SAVE_KEY_PREFIX}${slotId}`);
        if (!savedJson) {
          return false;
        }

        const saveData = JSON.parse(savedJson);

        // 【バージョンチェック】: 警告のみでロード継続
        if (saveData.version !== SAVE_VERSION) {
          console.warn(`Save version mismatch: ${saveData.version} !== ${SAVE_VERSION}`);
        }

        // 【状態復元】
        stateManager.restoreFromSnapshot({
          game: saveData.game,
          player: saveData.player,
          quests: saveData.quests,
          deck: saveData.deck,
          inventory: saveData.inventory,
        });

        playtime = saveData.playtime || 0;
        eventBus.emit('load:complete', { slotId });
        return true;
      } catch (error) {
        return false;
      }
    }),

    /**
     * オートセーブの有効化
     */
    enableAutoSave: vi.fn((intervalMs: number = 60000) => {
      autoSaveEnabled = true;
      autoSaveInterval = setTimeout(() => {
        const snapshot = stateManager.getSnapshot();
        const saveData = {
          version: SAVE_VERSION,
          timestamp: Date.now(),
          playtime,
          ...snapshot,
        };
        storage.setItem(AUTO_SAVE_KEY, JSON.stringify(saveData));
        eventBus.emit('autosave:complete');
      }, intervalMs);
    }),

    /**
     * オートセーブの無効化
     */
    disableAutoSave: vi.fn(() => {
      autoSaveEnabled = false;
      if (autoSaveInterval) {
        clearTimeout(autoSaveInterval);
        autoSaveInterval = null;
      }
    }),

    /**
     * オートセーブが存在するか
     */
    hasAutoSave: vi.fn((): boolean => {
      return storage.getItem(AUTO_SAVE_KEY) !== null;
    }),

    /**
     * オートセーブからロード
     */
    loadAutoSave: vi.fn(async (): Promise<boolean> => {
      try {
        const savedJson = storage.getItem(AUTO_SAVE_KEY);
        if (!savedJson) {
          return false;
        }

        const saveData = JSON.parse(savedJson);
        stateManager.restoreFromSnapshot({
          game: saveData.game,
          player: saveData.player,
          quests: saveData.quests,
          deck: saveData.deck,
          inventory: saveData.inventory,
        });

        playtime = saveData.playtime || 0;
        eventBus.emit('load:complete', { slotId: 'auto' });
        return true;
      } catch (error) {
        return false;
      }
    }),

    /**
     * セーブスロット情報の取得
     */
    getSaveSlots: vi.fn(
      (): Array<{
        slotId: number;
        exists: boolean;
        day?: number;
        rank?: string;
        timestamp?: number;
        playtime?: number;
      }> => {
        return [1, 2, 3].map((slotId) => {
          const savedJson = storage.getItem(`${SAVE_KEY_PREFIX}${slotId}`);
          if (!savedJson) {
            return { slotId, exists: false };
          }

          try {
            const saveData = JSON.parse(savedJson);
            return {
              slotId,
              exists: true,
              day: saveData.game?.currentDay,
              rank: saveData.player?.rank,
              timestamp: saveData.timestamp,
              playtime: saveData.playtime,
            };
          } catch {
            return { slotId, exists: false };
          }
        });
      }
    ),

    /**
     * セーブデータの削除
     */
    deleteSave: vi.fn((slotId: number) => {
      storage.removeItem(`${SAVE_KEY_PREFIX}${slotId}`);
      eventBus.emit('save:deleted', { slotId });
    }),

    /**
     * プレイ時間追跡の開始
     */
    startPlaytimeTracking: vi.fn(() => {
      playtimeInterval = setInterval(() => {
        playtime++;
      }, 1000);
    }),

    /**
     * プレイ時間追跡の停止
     */
    stopPlaytimeTracking: vi.fn(() => {
      if (playtimeInterval) {
        clearInterval(playtimeInterval);
        playtimeInterval = null;
      }
    }),

    /**
     * プレイ時間の取得
     */
    getPlaytime: vi.fn((): number => playtime),

    /**
     * プレイ時間の設定
     */
    setPlaytime: vi.fn((time: number) => {
      playtime = time;
    }),
  };

  // 【フェーズ変更時のオートセーブ】
  eventBus.on('app:phase:changed', () => {
    if (autoSaveEnabled) {
      const snapshot = stateManager.getSnapshot();
      const saveData = {
        version: SAVE_VERSION,
        timestamp: Date.now(),
        playtime,
        ...snapshot,
      };
      storage.setItem(AUTO_SAVE_KEY, JSON.stringify(saveData));
      eventBus.emit('autosave:complete');
    }
  });

  return saveLoadManager;
}

// 【有効なシーンリスト】: シーン遷移に必要な定義
const validScenes = [
  'BootScene',
  'PreloadScene',
  'TitleScene',
  'MainScene',
  'ShopScene',
  'RankUpScene',
  'GameOverScene',
  'GameClearScene',
];

describe('Save/Load Integration', () => {
  let game: { scene: { isActive: ReturnType<typeof vi.fn> }; registry: Map<string, unknown> };
  let eventBus: ReturnType<typeof createMockEventBus>;
  let stateManager: ReturnType<typeof createMockStateManager>;
  let saveLoadManager: ReturnType<typeof createMockSaveLoadManager>;
  let sceneManager: ReturnType<typeof createMockSceneManager>;
  let storage: Storage;

  beforeEach(async () => {
    // 【モック初期化】
    eventBus = createMockEventBus();
    stateManager = createMockStateManager();
    storage = createMockStorage();

    // 【ゲームモック初期化】
    game = {
      scene: {
        isActive: vi.fn((key: string) => key === 'BootScene'),
      },
      registry: new Map(),
    };

    // 【SceneManager初期化】
    sceneManager = createMockSceneManager(game, eventBus, validScenes);

    // 【SaveLoadManager初期化】
    saveLoadManager = createMockSaveLoadManager(stateManager, eventBus, storage);

    // 【レジストリ設定】
    game.registry.set('eventBus', eventBus);
    game.registry.set('stateManager', stateManager);
    game.registry.set('sceneManager', sceneManager);
    game.registry.set('saveLoadManager', saveLoadManager);

    // 【ゲーム開始処理】
    eventBus.on('ui:game:start:requested', async (payload: { isNewGame?: boolean }) => {
      if (payload?.isNewGame) {
        stateManager.reset();
      }
      await sceneManager.goTo('MainScene');
    });

    // 【ゲーム開始】
    eventBus.emit('ui:game:start:requested', { isNewGame: true });
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  afterEach(() => {
    storage.clear();
    saveLoadManager.disableAutoSave();
    saveLoadManager.stopPlaytimeTracking();
  });

  describe('Manual Save', () => {
    it('スロット1にセーブできる', async () => {
      // Arrange
      stateManager.updateGameState({ currentDay: 10 });
      stateManager.updatePlayerState({ rank: 'C', gold: 2000 });

      // Act
      const result = await saveLoadManager.save(1);

      // Assert
      expect(result).toBe(true);
      expect(storage.setItem).toHaveBeenCalledWith(
        'atelier_guild_rank_save_1',
        expect.any(String)
      );
    });

    it('スロット2にセーブできる', async () => {
      // Arrange
      stateManager.updateGameState({ currentDay: 15 });

      // Act
      const result = await saveLoadManager.save(2);

      // Assert
      expect(result).toBe(true);
      expect(storage.setItem).toHaveBeenCalledWith(
        'atelier_guild_rank_save_2',
        expect.any(String)
      );
    });

    it('スロット3にセーブできる', async () => {
      // Act
      const result = await saveLoadManager.save(3);

      // Assert
      expect(result).toBe(true);
      expect(storage.setItem).toHaveBeenCalledWith(
        'atelier_guild_rank_save_3',
        expect.any(String)
      );
    });

    it('セーブ完了イベントが発火する', async () => {
      // Arrange
      const saveCompleteCallback = vi.fn();
      eventBus.on('save:complete', saveCompleteCallback);

      // Act
      await saveLoadManager.save(1);

      // Assert
      expect(saveCompleteCallback).toHaveBeenCalledWith({ slotId: 1 });
    });

    it('同じスロットに上書きセーブできる', async () => {
      // Arrange
      stateManager.updateGameState({ currentDay: 5 });
      await saveLoadManager.save(1);

      stateManager.updateGameState({ currentDay: 10 });

      // Act
      await saveLoadManager.save(1);

      // Assert
      const slots = saveLoadManager.getSaveSlots();
      expect(slots[0].day).toBe(10);
    });
  });

  describe('Manual Load', () => {
    it('セーブデータをロードできる', async () => {
      // Arrange
      stateManager.updateGameState({ currentDay: 15 });
      stateManager.updatePlayerState({ rank: 'B', gold: 3000 });
      await saveLoadManager.save(1);

      // 状態をリセット
      stateManager.reset();
      expect(stateManager.getGameState().currentDay).toBe(1);

      // Act
      const result = await saveLoadManager.load(1);

      // Assert
      expect(result).toBe(true);
      expect(stateManager.getGameState().currentDay).toBe(15);
      expect(stateManager.getPlayerState().rank).toBe('B');
      expect(stateManager.getPlayerState().gold).toBe(3000);
    });

    it('ロード完了イベントが発火する', async () => {
      // Arrange
      await saveLoadManager.save(1);
      const loadCompleteCallback = vi.fn();
      eventBus.on('load:complete', loadCompleteCallback);

      // Act
      await saveLoadManager.load(1);

      // Assert
      expect(loadCompleteCallback).toHaveBeenCalledWith({ slotId: 1 });
    });

    it('存在しないスロットからロードすると失敗する', async () => {
      // Act
      const result = await saveLoadManager.load(2);

      // Assert
      expect(result).toBe(false);
    });

    it('ロード後にゲームが正しいフェーズで再開する', async () => {
      // Arrange
      stateManager.updateGameState({ currentDay: 10, currentPhase: 'gathering' });
      await saveLoadManager.save(1);
      stateManager.reset();

      // Act
      await saveLoadManager.load(1);

      // Assert
      expect(stateManager.getGameState().currentPhase).toBe('gathering');
    });
  });

  describe('Auto Save', () => {
    it('オートセーブが有効化できる', async () => {
      // Act
      saveLoadManager.enableAutoSave(100);

      // Assert - まだ実行されていない
      expect(saveLoadManager.hasAutoSave()).toBe(false);

      // 時間を進める
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(saveLoadManager.hasAutoSave()).toBe(true);
    });

    it('フェーズ変更時にオートセーブされる', async () => {
      // Arrange
      saveLoadManager.enableAutoSave();
      const hasAutoSaveBefore = saveLoadManager.hasAutoSave();
      expect(hasAutoSaveBefore).toBe(false);

      // Act
      eventBus.emit('app:phase:changed', { phase: 'gathering' });

      // Assert
      await vi.waitFor(() => {
        expect(saveLoadManager.hasAutoSave()).toBe(true);
      });
    });

    it('オートセーブからロードできる', async () => {
      // Arrange
      stateManager.updateGameState({ currentDay: 12 });
      stateManager.updatePlayerState({ gold: 4000 });
      saveLoadManager.enableAutoSave(50);

      await new Promise((resolve) => setTimeout(resolve, 100));

      stateManager.reset();

      // Act
      const result = await saveLoadManager.loadAutoSave();

      // Assert
      expect(result).toBe(true);
      expect(stateManager.getGameState().currentDay).toBe(12);
    });

    it('オートセーブを無効化できる', async () => {
      // Arrange
      saveLoadManager.enableAutoSave(100);

      // Act
      saveLoadManager.disableAutoSave();

      await new Promise((resolve) => setTimeout(resolve, 150));

      // 新しいオートセーブは作成されない（既存のものがあれば残る）
      // 【注意】: 無効化後はオートセーブが作成されないことを確認
      expect(saveLoadManager.hasAutoSave()).toBe(false);
    });
  });

  describe('Save Slot Management', () => {
    it('空のスロット情報を取得できる', async () => {
      // Act
      const slots = saveLoadManager.getSaveSlots();

      // Assert
      expect(slots).toHaveLength(3);
      expect(slots[0].exists).toBe(false);
      expect(slots[1].exists).toBe(false);
      expect(slots[2].exists).toBe(false);
    });

    it('セーブ済みスロット情報を取得できる', async () => {
      // Arrange
      stateManager.updateGameState({ currentDay: 8 });
      stateManager.updatePlayerState({ rank: 'D' });
      await saveLoadManager.save(1);

      // Act
      const slots = saveLoadManager.getSaveSlots();

      // Assert
      expect(slots[0].exists).toBe(true);
      expect(slots[0].day).toBe(8);
      expect(slots[0].rank).toBe('D');
      expect(slots[0].timestamp).toBeDefined();
    });

    it('セーブデータを削除できる', async () => {
      // Arrange
      await saveLoadManager.save(1);
      expect(saveLoadManager.getSaveSlots()[0].exists).toBe(true);

      // Act
      saveLoadManager.deleteSave(1);

      // Assert
      expect(saveLoadManager.getSaveSlots()[0].exists).toBe(false);
    });

    it('削除イベントが発火する', async () => {
      // Arrange
      await saveLoadManager.save(1);
      const deleteCallback = vi.fn();
      eventBus.on('save:deleted', deleteCallback);

      // Act
      saveLoadManager.deleteSave(1);

      // Assert
      expect(deleteCallback).toHaveBeenCalledWith({ slotId: 1 });
    });
  });

  describe('Playtime Tracking', () => {
    it('プレイ時間が追跡される', async () => {
      // Arrange
      vi.useFakeTimers();
      saveLoadManager.startPlaytimeTracking();

      // Act
      vi.advanceTimersByTime(10000); // 10秒

      // Assert
      expect(saveLoadManager.getPlaytime()).toBe(10);

      saveLoadManager.stopPlaytimeTracking();
      vi.useRealTimers();
    });

    it('プレイ時間がセーブデータに保存される', async () => {
      // Arrange
      saveLoadManager.setPlaytime(3600);
      await saveLoadManager.save(1);

      // Act
      const slots = saveLoadManager.getSaveSlots();

      // Assert
      expect(slots[0].playtime).toBe(3600);
    });

    it('ロード時にプレイ時間が復元される', async () => {
      // Arrange
      saveLoadManager.setPlaytime(7200);
      await saveLoadManager.save(1);
      saveLoadManager.setPlaytime(0);

      // Act
      await saveLoadManager.load(1);

      // Assert
      expect(saveLoadManager.getPlaytime()).toBe(7200);
    });
  });

  describe('Data Integrity', () => {
    it('全ての状態がセーブ・ロードで保持される', async () => {
      // Arrange - 複雑な状態を設定
      stateManager.updateGameState({ currentDay: 20, currentPhase: 'gathering' });
      stateManager.updatePlayerState({
        rank: 'B',
        promotionGauge: 500,
        promotionGaugeMax: 800,
        gold: 3500,
        actionPoints: 2,
        actionPointsMax: 4,
      });
      stateManager.updateQuestState({
        availableQuests: [{ id: 'q1' }],
        activeQuests: [{ id: 'q2' }, { id: 'q3' }],
        completedQuestIds: ['q4', 'q5'],
      });
      stateManager.updateInventoryState({
        materials: [
          { id: 'm1', quantity: 5, quality: 80 },
          { id: 'm2', quantity: 3, quality: 90 },
        ],
        items: [{ id: 'c1', quantity: 2, quality: 85 }],
      });
      stateManager.updateDeckState({
        cards: [{ id: 'd1' }, { id: 'd2' }],
        hand: [{ id: 'h1' }, { id: 'h2' }, { id: 'h3' }],
        discardPile: [{ id: 'x1' }],
      });

      await saveLoadManager.save(1);

      // 状態を完全リセット
      stateManager.reset();

      // Act
      await saveLoadManager.load(1);

      // Assert
      const gameState = stateManager.getGameState();
      expect(gameState.currentDay).toBe(20);
      expect(gameState.currentPhase).toBe('gathering');

      const playerState = stateManager.getPlayerState();
      expect(playerState.rank).toBe('B');
      expect(playerState.promotionGauge).toBe(500);
      expect(playerState.gold).toBe(3500);
      expect(playerState.actionPoints).toBe(2);

      const questState = stateManager.getQuestState();
      expect(questState.availableQuests).toHaveLength(1);
      expect(questState.activeQuests).toHaveLength(2);
      expect(questState.completedQuestIds).toHaveLength(2);

      const inventoryState = stateManager.getInventoryState();
      expect(inventoryState.materials).toHaveLength(2);
      expect(inventoryState.items).toHaveLength(1);

      const deckState = stateManager.getDeckState();
      expect(deckState.cards).toHaveLength(2);
      expect(deckState.hand).toHaveLength(3);
      expect(deckState.discardPile).toHaveLength(1);
    });

    it('破損したセーブデータはエラーになる', async () => {
      // Arrange
      (storage.getItem as ReturnType<typeof vi.fn>).mockReturnValueOnce('invalid json');

      // Act
      const result = await saveLoadManager.load(1);

      // Assert
      expect(result).toBe(false);
    });

    it('バージョン不一致でも警告のみでロードできる', async () => {
      // Arrange
      await saveLoadManager.save(1);

      // バージョンを変更
      const savedJson = (storage.getItem as ReturnType<typeof vi.fn>)(
        'atelier_guild_rank_save_1'
      );
      const savedData = JSON.parse(savedJson);
      savedData.version = '0.9.0';
      (storage.getItem as ReturnType<typeof vi.fn>).mockReturnValueOnce(
        JSON.stringify(savedData)
      );

      const consoleSpy = vi.spyOn(console, 'warn');

      // Act
      await saveLoadManager.load(1);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('version'));
      consoleSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    it('無効なスロットIDでセーブ失敗', async () => {
      // Act
      const result1 = await saveLoadManager.save(0);
      const result2 = await saveLoadManager.save(4);
      const result3 = await saveLoadManager.save(-1);

      // Assert
      expect(result1).toBe(false);
      expect(result2).toBe(false);
      expect(result3).toBe(false);
    });

    it('無効なスロットIDでロード失敗', async () => {
      // Act
      const result1 = await saveLoadManager.load(0);
      const result2 = await saveLoadManager.load(4);

      // Assert
      expect(result1).toBe(false);
      expect(result2).toBe(false);
    });

    it('localStorage容量超過時にエラーが発生', async () => {
      // Arrange
      (storage.setItem as ReturnType<typeof vi.fn>).mockImplementationOnce(() => {
        throw new Error('QuotaExceededError');
      });

      const failedCallback = vi.fn();
      eventBus.on('save:failed', failedCallback);

      // Act
      const result = await saveLoadManager.save(1);

      // Assert
      expect(result).toBe(false);
      expect(failedCallback).toHaveBeenCalled();
    });

    it('連続セーブが正しく処理される', async () => {
      // Act - 連続でセーブ
      await Promise.all([
        saveLoadManager.save(1),
        saveLoadManager.save(2),
        saveLoadManager.save(3),
      ]);

      // Assert
      const slots = saveLoadManager.getSaveSlots();
      expect(slots[0].exists).toBe(true);
      expect(slots[1].exists).toBe(true);
      expect(slots[2].exists).toBe(true);
    });
  });

  describe('Save Load via EventBus', () => {
    beforeEach(() => {
      // 【イベントハンドラ設定】: UIからのセーブ・ロードリクエスト
      eventBus.on(
        'ui:game:save:requested',
        async (payload: { slotId: number }) => {
          await saveLoadManager.save(payload.slotId);
        }
      );

      eventBus.on(
        'ui:game:load:requested',
        async (payload: { slotId: number }) => {
          const result = await saveLoadManager.load(payload.slotId);
          if (result) {
            await sceneManager.goTo('MainScene');
          }
        }
      );
    });

    it('イベント経由でセーブできる', async () => {
      // Arrange
      stateManager.updateGameState({ currentDay: 12 });
      const saveCompleteCallback = vi.fn();
      eventBus.on('save:complete', saveCompleteCallback);

      // Act
      eventBus.emit('ui:game:save:requested', { slotId: 1 });

      // Assert
      await vi.waitFor(() => {
        expect(saveCompleteCallback).toHaveBeenCalledWith({ slotId: 1 });
      });
    });

    it('イベント経由でロードできる', async () => {
      // Arrange
      stateManager.updateGameState({ currentDay: 18 });
      stateManager.updatePlayerState({ rank: 'A' });
      await saveLoadManager.save(2);

      stateManager.reset();
      const loadCompleteCallback = vi.fn();
      eventBus.on('load:complete', loadCompleteCallback);

      // Act
      eventBus.emit('ui:game:load:requested', { slotId: 2 });

      // Assert
      await vi.waitFor(() => {
        expect(loadCompleteCallback).toHaveBeenCalledWith({ slotId: 2 });
        expect(stateManager.getGameState().currentDay).toBe(18);
      });
    });
  });

  describe('Continue Game', () => {
    it('最新のセーブから続きをプレイできる', async () => {
      // Arrange - 複数のセーブを作成（タイムスタンプに差をつける）
      stateManager.updateGameState({ currentDay: 5 });
      await saveLoadManager.save(1);

      // 【重要】: タイムスタンプに差をつけるため待機
      await new Promise((resolve) => setTimeout(resolve, 10));

      stateManager.updateGameState({ currentDay: 12 });
      await saveLoadManager.save(2);

      await new Promise((resolve) => setTimeout(resolve, 10));

      stateManager.updateGameState({ currentDay: 8 });
      await saveLoadManager.save(3);

      stateManager.reset();

      // 最新のセーブを特定（タイムスタンプで判定）
      const slots = saveLoadManager.getSaveSlots();
      const latestSlot = slots
        .filter((s) => s.exists)
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))[0];

      // Act
      await saveLoadManager.load(latestSlot.slotId);

      // Assert - 最新のセーブ（スロット3、day=8）がロードされる
      expect(stateManager.getGameState().currentDay).toBe(8);
    });
  });
});
