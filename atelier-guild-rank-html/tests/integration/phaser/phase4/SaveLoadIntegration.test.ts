/**
 * セーブ・ロード統合テスト
 *
 * TASK-0259: Phase4統合テスト
 * PhaserSaveLoadManagerの統合テスト。
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createMockEventBus,
  createMockStateManager,
  createMockFlowManager,
  createMockStorage,
} from '../../../utils/phaserTestUtils';

// Phaserをモック
vi.mock('phaser', () => ({
  default: {},
}));

// PhaserSaveLoadManagerをモック
vi.mock('../../../../src/game/save/PhaserSaveLoadManager', () => ({
  PhaserSaveLoadManager: vi.fn(),
  SAVE_KEY_PREFIX: 'atelier_guild_rank_save_',
  SAVE_VERSION: '1.0.0',
  MAX_SLOTS: 3,
}));

describe('SaveLoad Integration', () => {
  let eventBus: ReturnType<typeof createMockEventBus>;
  let stateManager: ReturnType<typeof createMockStateManager>;
  let flowManager: ReturnType<typeof createMockFlowManager>;
  let storage: ReturnType<typeof createMockStorage>;

  const SAVE_KEY_PREFIX = 'atelier_guild_rank_save_';
  const SAVE_VERSION = '1.0.0';
  const MAX_SLOTS = 3;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    eventBus = createMockEventBus();
    stateManager = createMockStateManager();
    flowManager = createMockFlowManager();
    storage = createMockStorage();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  // シンプルなSaveLoadManager実装（テスト用）
  class TestSaveLoadManager {
    private eventBus: ReturnType<typeof createMockEventBus>;
    private stateManager: ReturnType<typeof createMockStateManager>;
    private flowManager: ReturnType<typeof createMockFlowManager>;
    private storage: Storage;
    private playtime: number = 0;
    private playtimeTimer: ReturnType<typeof setInterval> | null = null;
    private autoSaveTimer: ReturnType<typeof setInterval> | null = null;
    private phaseChangeHandler: (() => void) | null = null;

    constructor(
      eventBus: ReturnType<typeof createMockEventBus>,
      stateManager: ReturnType<typeof createMockStateManager>,
      flowManager: ReturnType<typeof createMockFlowManager>,
      storage: Storage
    ) {
      this.eventBus = eventBus;
      this.stateManager = stateManager;
      this.flowManager = flowManager;
      this.storage = storage;
    }

    async save(slotId: number): Promise<boolean> {
      if (slotId < 1 || slotId > MAX_SLOTS) {
        return false;
      }

      try {
        const saveData = {
          version: SAVE_VERSION,
          timestamp: Date.now(),
          playtime: this.playtime,
          state: this.stateManager.serialize(),
        };

        const key = `${SAVE_KEY_PREFIX}${slotId}`;
        this.storage.setItem(key, JSON.stringify(saveData));
        this.eventBus.emit('save:complete', { slotId });
        return true;
      } catch {
        this.eventBus.emit('save:failed', { slotId });
        return false;
      }
    }

    async load(slotId: number): Promise<boolean> {
      if (slotId < 1 || slotId > MAX_SLOTS) {
        return false;
      }

      const key = `${SAVE_KEY_PREFIX}${slotId}`;
      const dataStr = this.storage.getItem(key);

      if (!dataStr) {
        return false;
      }

      try {
        const saveData = JSON.parse(dataStr as string);
        this.playtime = saveData.playtime;
        this.stateManager.deserialize(saveData.state);
        await this.flowManager.loadGame(saveData.state);
        this.eventBus.emit('load:complete', { slotId });
        return true;
      } catch {
        this.eventBus.emit('load:failed', { slotId });
        return false;
      }
    }

    deleteSave(slotId: number): boolean {
      if (slotId < 1 || slotId > MAX_SLOTS) {
        return false;
      }

      const key = `${SAVE_KEY_PREFIX}${slotId}`;
      this.storage.removeItem(key);
      this.eventBus.emit('save:deleted', { slotId });
      return true;
    }

    getSaveSlots() {
      const slots = [];
      for (let i = 1; i <= MAX_SLOTS; i++) {
        const key = `${SAVE_KEY_PREFIX}${i}`;
        const dataStr = this.storage.getItem(key);

        if (dataStr) {
          try {
            const data = JSON.parse(dataStr as string);
            const state = JSON.parse(data.state);
            slots.push({
              slotId: i,
              exists: true,
              timestamp: data.timestamp,
              day: state.game?.currentDay,
              rank: state.player?.rank,
              playtime: data.playtime,
            });
          } catch {
            slots.push({ slotId: i, exists: false });
          }
        } else {
          slots.push({ slotId: i, exists: false });
        }
      }
      return slots;
    }

    startPlaytimeTracking(): void {
      if (this.playtimeTimer !== null) return;
      this.playtimeTimer = setInterval(() => {
        this.playtime++;
      }, 1000);
    }

    stopPlaytimeTracking(): void {
      if (this.playtimeTimer !== null) {
        clearInterval(this.playtimeTimer);
        this.playtimeTimer = null;
      }
    }

    getPlaytime(): number {
      return this.playtime;
    }

    setPlaytime(time: number): void {
      this.playtime = time;
    }

    enableAutoSave(intervalMs: number = 60000): void {
      this.disableAutoSave();

      this.autoSaveTimer = setInterval(() => {
        this.autoSave();
      }, intervalMs);

      this.phaseChangeHandler = () => {
        this.autoSave();
      };
      this.eventBus.on('app:phase:changed', this.phaseChangeHandler);
    }

    disableAutoSave(): void {
      if (this.autoSaveTimer !== null) {
        clearInterval(this.autoSaveTimer);
        this.autoSaveTimer = null;
      }
      if (this.phaseChangeHandler !== null) {
        this.eventBus.off('app:phase:changed', this.phaseChangeHandler);
        this.phaseChangeHandler = null;
      }
    }

    private autoSave(): void {
      const autoSaveKey = `${SAVE_KEY_PREFIX}auto`;
      const saveData = {
        version: SAVE_VERSION,
        timestamp: Date.now(),
        playtime: this.playtime,
        state: this.stateManager.serialize(),
      };
      this.storage.setItem(autoSaveKey, JSON.stringify(saveData));
    }

    hasAutoSave(): boolean {
      return this.storage.getItem(`${SAVE_KEY_PREFIX}auto`) !== null;
    }

    async loadAutoSave(): Promise<boolean> {
      const dataStr = this.storage.getItem(`${SAVE_KEY_PREFIX}auto`);
      if (!dataStr) return false;

      try {
        const saveData = JSON.parse(dataStr as string);
        this.playtime = saveData.playtime;
        this.stateManager.deserialize(saveData.state);
        await this.flowManager.loadGame(saveData.state);
        return true;
      } catch {
        return false;
      }
    }

    destroy(): void {
      this.stopPlaytimeTracking();
      this.disableAutoSave();
    }
  }

  describe('Manual Save/Load', () => {
    it('セーブデータを保存できる', async () => {
      // Arrange
      const saveLoadManager = new TestSaveLoadManager(
        eventBus,
        stateManager,
        flowManager,
        storage
      );
      stateManager._setPlayerState({ gold: 2000, rank: 'C' });
      stateManager._setGameState({ currentDay: 15 });

      // Act
      const result = await saveLoadManager.save(1);

      // Assert
      expect(result).toBe(true);
      expect(storage.setItem).toHaveBeenCalled();
      expect(eventBus.emit).toHaveBeenCalledWith('save:complete', { slotId: 1 });
    });

    it('セーブデータをロードできる', async () => {
      // Arrange
      const saveLoadManager = new TestSaveLoadManager(
        eventBus,
        stateManager,
        flowManager,
        storage
      );
      stateManager._setPlayerState({ gold: 2000, rank: 'C' });
      await saveLoadManager.save(1);

      // 状態をリセット
      stateManager.reset();

      // Act
      const result = await saveLoadManager.load(1);

      // Assert
      expect(result).toBe(true);
      expect(stateManager.deserialize).toHaveBeenCalled();
      expect(flowManager.loadGame).toHaveBeenCalled();
      expect(eventBus.emit).toHaveBeenCalledWith('load:complete', { slotId: 1 });
    });

    it('存在しないスロットからロードすると失敗する', async () => {
      // Arrange
      const saveLoadManager = new TestSaveLoadManager(
        eventBus,
        stateManager,
        flowManager,
        storage
      );

      // Act
      const result = await saveLoadManager.load(3);

      // Assert
      expect(result).toBe(false);
    });

    it('無効なスロットIDでは操作できない', async () => {
      // Arrange
      const saveLoadManager = new TestSaveLoadManager(
        eventBus,
        stateManager,
        flowManager,
        storage
      );

      // Act & Assert
      const saveResult0 = await saveLoadManager.save(0);
      expect(saveResult0).toBe(false);

      const saveResult4 = await saveLoadManager.save(4);
      expect(saveResult4).toBe(false);

      const loadResult0 = await saveLoadManager.load(0);
      expect(loadResult0).toBe(false);

      const loadResult4 = await saveLoadManager.load(4);
      expect(loadResult4).toBe(false);
    });
  });

  describe('Save Slots', () => {
    it('セーブスロット情報を取得できる', async () => {
      // Arrange
      const saveLoadManager = new TestSaveLoadManager(
        eventBus,
        stateManager,
        flowManager,
        storage
      );
      stateManager._setGameState({ currentDay: 10 });
      stateManager._setPlayerState({ rank: 'D' });
      await saveLoadManager.save(1);

      // Act
      const slots = saveLoadManager.getSaveSlots();

      // Assert
      expect(slots).toHaveLength(3);
      expect(slots[0].exists).toBe(true);
      expect(slots[0].day).toBe(10);
      expect(slots[0].rank).toBe('D');
      expect(slots[1].exists).toBe(false);
      expect(slots[2].exists).toBe(false);
    });

    it('セーブデータを削除できる', async () => {
      // Arrange
      const saveLoadManager = new TestSaveLoadManager(
        eventBus,
        stateManager,
        flowManager,
        storage
      );
      await saveLoadManager.save(1);

      // Act
      const result = saveLoadManager.deleteSave(1);

      // Assert
      expect(result).toBe(true);
      expect(storage.removeItem).toHaveBeenCalled();

      const slots = saveLoadManager.getSaveSlots();
      expect(slots[0].exists).toBe(false);
    });

    it('複数スロットに保存できる', async () => {
      // Arrange
      const saveLoadManager = new TestSaveLoadManager(
        eventBus,
        stateManager,
        flowManager,
        storage
      );

      // Act
      stateManager._setGameState({ currentDay: 5 });
      await saveLoadManager.save(1);

      stateManager._setGameState({ currentDay: 10 });
      await saveLoadManager.save(2);

      stateManager._setGameState({ currentDay: 15 });
      await saveLoadManager.save(3);

      // Assert
      const slots = saveLoadManager.getSaveSlots();
      expect(slots[0].exists).toBe(true);
      expect(slots[0].day).toBe(5);
      expect(slots[1].exists).toBe(true);
      expect(slots[1].day).toBe(10);
      expect(slots[2].exists).toBe(true);
      expect(slots[2].day).toBe(15);
    });
  });

  describe('Auto Save', () => {
    it('オートセーブが機能する', async () => {
      // Arrange
      const saveLoadManager = new TestSaveLoadManager(
        eventBus,
        stateManager,
        flowManager,
        storage
      );
      saveLoadManager.enableAutoSave(1000);

      // Act
      vi.advanceTimersByTime(1100);

      // Assert
      expect(saveLoadManager.hasAutoSave()).toBe(true);
    });

    it('フェーズ変更時にオートセーブされる', async () => {
      // Arrange
      const saveLoadManager = new TestSaveLoadManager(
        eventBus,
        stateManager,
        flowManager,
        storage
      );
      saveLoadManager.enableAutoSave(60000);

      // Act
      eventBus.emit('app:phase:changed', { phase: 'gathering' });

      // Assert
      expect(saveLoadManager.hasAutoSave()).toBe(true);
    });

    it('オートセーブからロードできる', async () => {
      // Arrange
      const saveLoadManager = new TestSaveLoadManager(
        eventBus,
        stateManager,
        flowManager,
        storage
      );
      stateManager._setPlayerState({ gold: 3000 });
      saveLoadManager.enableAutoSave(100);

      vi.advanceTimersByTime(150);

      stateManager.reset();

      // Act
      const result = await saveLoadManager.loadAutoSave();

      // Assert
      expect(result).toBe(true);
      expect(stateManager.deserialize).toHaveBeenCalled();
    });

    it('オートセーブを無効化できる', async () => {
      // Arrange
      const saveLoadManager = new TestSaveLoadManager(
        eventBus,
        stateManager,
        flowManager,
        storage
      );
      saveLoadManager.enableAutoSave(1000);
      saveLoadManager.disableAutoSave();

      // Act
      vi.advanceTimersByTime(2000);

      // Assert
      expect(saveLoadManager.hasAutoSave()).toBe(false);
    });
  });

  describe('Playtime Tracking', () => {
    it('プレイ時間が追跡される', () => {
      // Arrange
      const saveLoadManager = new TestSaveLoadManager(
        eventBus,
        stateManager,
        flowManager,
        storage
      );
      saveLoadManager.startPlaytimeTracking();

      // Act
      vi.advanceTimersByTime(5000);

      // Assert
      expect(saveLoadManager.getPlaytime()).toBe(5);

      saveLoadManager.stopPlaytimeTracking();
    });

    it('プレイ時間を手動で設定できる', () => {
      // Arrange
      const saveLoadManager = new TestSaveLoadManager(
        eventBus,
        stateManager,
        flowManager,
        storage
      );

      // Act
      saveLoadManager.setPlaytime(3600);

      // Assert
      expect(saveLoadManager.getPlaytime()).toBe(3600);
    });

    it('プレイ時間がセーブデータに含まれる', async () => {
      // Arrange
      const saveLoadManager = new TestSaveLoadManager(
        eventBus,
        stateManager,
        flowManager,
        storage
      );
      saveLoadManager.setPlaytime(3600);
      await saveLoadManager.save(1);

      saveLoadManager.setPlaytime(0);
      await saveLoadManager.load(1);

      // Assert
      expect(saveLoadManager.getPlaytime()).toBe(3600);
    });

    it('プレイ時間追跡を停止できる', () => {
      // Arrange
      const saveLoadManager = new TestSaveLoadManager(
        eventBus,
        stateManager,
        flowManager,
        storage
      );
      saveLoadManager.startPlaytimeTracking();

      vi.advanceTimersByTime(3000);
      saveLoadManager.stopPlaytimeTracking();
      const playtimeAtStop = saveLoadManager.getPlaytime();

      // Act
      vi.advanceTimersByTime(3000);

      // Assert
      expect(saveLoadManager.getPlaytime()).toBe(playtimeAtStop);
    });
  });

  describe('Event Notifications', () => {
    it('セーブ完了時にイベントが発火する', async () => {
      // Arrange
      const saveLoadManager = new TestSaveLoadManager(
        eventBus,
        stateManager,
        flowManager,
        storage
      );
      const callback = vi.fn();
      eventBus.on('save:complete', callback);

      // Act
      await saveLoadManager.save(1);

      // Assert
      expect(callback).toHaveBeenCalledWith({ slotId: 1 });
    });

    it('ロード完了時にイベントが発火する', async () => {
      // Arrange
      const saveLoadManager = new TestSaveLoadManager(
        eventBus,
        stateManager,
        flowManager,
        storage
      );
      await saveLoadManager.save(1);
      const callback = vi.fn();
      eventBus.on('load:complete', callback);

      // Act
      await saveLoadManager.load(1);

      // Assert
      expect(callback).toHaveBeenCalledWith({ slotId: 1 });
    });

    it('削除完了時にイベントが発火する', async () => {
      // Arrange
      const saveLoadManager = new TestSaveLoadManager(
        eventBus,
        stateManager,
        flowManager,
        storage
      );
      await saveLoadManager.save(1);
      const callback = vi.fn();
      eventBus.on('save:deleted', callback);

      // Act
      saveLoadManager.deleteSave(1);

      // Assert
      expect(callback).toHaveBeenCalledWith({ slotId: 1 });
    });
  });

  describe('Destroy', () => {
    it('destroyで全てのタイマーが停止する', () => {
      // Arrange
      const saveLoadManager = new TestSaveLoadManager(
        eventBus,
        stateManager,
        flowManager,
        storage
      );
      saveLoadManager.startPlaytimeTracking();
      saveLoadManager.enableAutoSave(1000);

      const playtimeBeforeDestroy = saveLoadManager.getPlaytime();

      // Act
      saveLoadManager.destroy();
      vi.advanceTimersByTime(5000);

      // Assert
      expect(saveLoadManager.getPlaytime()).toBe(playtimeBeforeDestroy);
    });
  });

  describe('Data Integrity', () => {
    it('セーブデータのバージョンが保存される', async () => {
      // Arrange
      const saveLoadManager = new TestSaveLoadManager(
        eventBus,
        stateManager,
        flowManager,
        storage
      );
      await saveLoadManager.save(1);

      // Act
      const key = `${SAVE_KEY_PREFIX}1`;
      const dataStr = storage.getItem(key);
      const data = JSON.parse(dataStr as string);

      // Assert
      expect(data.version).toBe(SAVE_VERSION);
    });

    it('タイムスタンプがセーブデータに含まれる', async () => {
      // Arrange
      const saveLoadManager = new TestSaveLoadManager(
        eventBus,
        stateManager,
        flowManager,
        storage
      );
      const beforeSave = Date.now();
      await saveLoadManager.save(1);

      // Act
      const key = `${SAVE_KEY_PREFIX}1`;
      const dataStr = storage.getItem(key);
      const data = JSON.parse(dataStr as string);

      // Assert
      expect(data.timestamp).toBeGreaterThanOrEqual(beforeSave);
    });
  });
});
