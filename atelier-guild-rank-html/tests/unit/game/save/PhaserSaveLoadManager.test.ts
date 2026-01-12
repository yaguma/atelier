/**
 * PhaserSaveLoadManager テスト
 *
 * TASK-0255: セーブ・ロード Phaser対応
 * セーブ・ロード機能のテストケース。
 * - セーブ機能
 * - ロード機能
 * - スロット管理
 * - オートセーブ機能
 * - プレイ時間追跡
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  PhaserSaveLoadManager,
  SAVE_KEY_PREFIX,
  MAX_SLOTS,
  SAVE_VERSION,
} from '@game/save/PhaserSaveLoadManager';
import {
  PhaserStateManager,
  resetPhaserStateManager,
} from '@game/state/PhaserStateManager';
import {
  PhaserGameFlowManager,
  resetPhaserGameFlowManager,
} from '@game/flow/PhaserGameFlowManager';
import { createStateManager, type StateManager } from '@application/StateManager';
import { EventBus } from '@game/events/EventBus';

describe('PhaserSaveLoadManager', () => {
  let stateManager: StateManager;
  let phaserStateManager: PhaserStateManager;
  let phaserGameFlowManager: PhaserGameFlowManager;
  let saveLoadManager: PhaserSaveLoadManager;
  let eventBus: EventBus;
  let mockStorage: Storage;

  beforeEach(() => {
    // モックStorage
    const storage: Record<string, string> = {};
    mockStorage = {
      getItem: vi.fn((key: string) => storage[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        storage[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete storage[key];
      }),
      clear: vi.fn(() => {
        Object.keys(storage).forEach((key) => delete storage[key]);
      }),
      key: vi.fn((index: number) => Object.keys(storage)[index] ?? null),
      length: 0,
    } as Storage;

    // シングルトンリセット
    EventBus.resetInstance();
    resetPhaserStateManager();
    resetPhaserGameFlowManager();

    eventBus = EventBus.getInstance();
    stateManager = createStateManager();
    phaserStateManager = new PhaserStateManager({
      stateManager,
      eventBus,
    });
    phaserGameFlowManager = new PhaserGameFlowManager({
      stateManager: phaserStateManager,
      eventBus,
    });

    saveLoadManager = new PhaserSaveLoadManager({
      eventBus,
      stateManager: phaserStateManager,
      flowManager: phaserGameFlowManager,
      storage: mockStorage,
    });
  });

  afterEach(() => {
    saveLoadManager.destroy();
    resetPhaserGameFlowManager();
    resetPhaserStateManager();
    EventBus.resetInstance();
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe('セーブ機能', () => {
    it('スロット1にセーブできる', async () => {
      const result = await saveLoadManager.save(1);

      expect(result).toBe(true);
      expect(mockStorage.setItem).toHaveBeenCalledWith(
        `${SAVE_KEY_PREFIX}1`,
        expect.any(String)
      );
    });

    it('スロット2にセーブできる', async () => {
      const result = await saveLoadManager.save(2);

      expect(result).toBe(true);
      expect(mockStorage.setItem).toHaveBeenCalledWith(
        `${SAVE_KEY_PREFIX}2`,
        expect.any(String)
      );
    });

    it('スロット3にセーブできる', async () => {
      const result = await saveLoadManager.save(3);

      expect(result).toBe(true);
      expect(mockStorage.setItem).toHaveBeenCalledWith(
        `${SAVE_KEY_PREFIX}3`,
        expect.any(String)
      );
    });

    it('無効なスロットID（0以下）にはセーブできない', async () => {
      const result = await saveLoadManager.save(0);

      expect(result).toBe(false);
      expect(mockStorage.setItem).not.toHaveBeenCalled();
    });

    it('無効なスロットID（MAX_SLOTS超過）にはセーブできない', async () => {
      const result = await saveLoadManager.save(MAX_SLOTS + 1);

      expect(result).toBe(false);
      expect(mockStorage.setItem).not.toHaveBeenCalled();
    });

    it('セーブ完了イベントが発行される', async () => {
      const callback = vi.fn();
      eventBus.on('save:complete', callback);

      await saveLoadManager.save(1);

      expect(callback).toHaveBeenCalledWith({ slotId: 1 });
    });

    it('セーブデータにバージョン情報が含まれる', async () => {
      await saveLoadManager.save(1);

      const savedData = JSON.parse(
        (mockStorage.setItem as ReturnType<typeof vi.fn>).mock.calls[0][1]
      );
      expect(savedData.version).toBe(SAVE_VERSION);
    });

    it('セーブデータにタイムスタンプが含まれる', async () => {
      await saveLoadManager.save(1);

      const savedData = JSON.parse(
        (mockStorage.setItem as ReturnType<typeof vi.fn>).mock.calls[0][1]
      );
      expect(savedData.timestamp).toBeDefined();
      expect(typeof savedData.timestamp).toBe('number');
    });

    it('セーブデータにプレイ時間が含まれる', async () => {
      saveLoadManager.setPlaytime(3600);
      await saveLoadManager.save(1);

      const savedData = JSON.parse(
        (mockStorage.setItem as ReturnType<typeof vi.fn>).mock.calls[0][1]
      );
      expect(savedData.playtime).toBe(3600);
    });
  });

  describe('ロード機能', () => {
    it('保存したデータをロードできる', async () => {
      await saveLoadManager.save(1);
      const result = await saveLoadManager.load(1);

      expect(result).toBe(true);
    });

    it('存在しないスロットからはロードできない', async () => {
      const result = await saveLoadManager.load(1);

      expect(result).toBe(false);
    });

    it('無効なスロットID（0以下）からはロードできない', async () => {
      const result = await saveLoadManager.load(0);

      expect(result).toBe(false);
    });

    it('無効なスロットID（MAX_SLOTS超過）からはロードできない', async () => {
      const result = await saveLoadManager.load(MAX_SLOTS + 1);

      expect(result).toBe(false);
    });

    it('ロード完了イベントが発行される', async () => {
      const callback = vi.fn();
      eventBus.on('load:complete', callback);

      await saveLoadManager.save(1);
      await saveLoadManager.load(1);

      expect(callback).toHaveBeenCalledWith({ slotId: 1 });
    });

    it('プレイ時間がロード時に復元される', async () => {
      saveLoadManager.setPlaytime(7200);
      await saveLoadManager.save(1);
      saveLoadManager.setPlaytime(0);

      await saveLoadManager.load(1);

      expect(saveLoadManager.getPlaytime()).toBe(7200);
    });
  });

  describe('スロット管理', () => {
    it('空のスロット一覧を取得できる', () => {
      const slots = saveLoadManager.getSaveSlots();

      expect(slots).toHaveLength(MAX_SLOTS);
      slots.forEach((slot, index) => {
        expect(slot.slotId).toBe(index + 1);
        expect(slot.exists).toBe(false);
      });
    });

    it('セーブ後にスロット情報が更新される', async () => {
      await saveLoadManager.save(1);

      const slots = saveLoadManager.getSaveSlots();

      expect(slots[0].exists).toBe(true);
      expect(slots[0].timestamp).toBeDefined();
    });

    it('セーブデータを削除できる', async () => {
      await saveLoadManager.save(1);
      const result = saveLoadManager.deleteSave(1);

      expect(result).toBe(true);
      expect(mockStorage.removeItem).toHaveBeenCalledWith(`${SAVE_KEY_PREFIX}1`);
    });

    it('削除後にスロットが空になる', async () => {
      await saveLoadManager.save(1);
      saveLoadManager.deleteSave(1);

      const slots = saveLoadManager.getSaveSlots();

      expect(slots[0].exists).toBe(false);
    });

    it('削除イベントが発行される', async () => {
      const callback = vi.fn();
      eventBus.on('save:deleted', callback);

      await saveLoadManager.save(1);
      saveLoadManager.deleteSave(1);

      expect(callback).toHaveBeenCalledWith({ slotId: 1 });
    });
  });

  describe('プレイ時間追跡', () => {
    it('プレイ時間追跡を開始できる', () => {
      vi.useFakeTimers();

      saveLoadManager.startPlaytimeTracking();

      vi.advanceTimersByTime(5000);

      expect(saveLoadManager.getPlaytime()).toBe(5);
    });

    it('プレイ時間追跡を停止できる', () => {
      vi.useFakeTimers();

      saveLoadManager.startPlaytimeTracking();
      vi.advanceTimersByTime(3000);
      saveLoadManager.stopPlaytimeTracking();
      vi.advanceTimersByTime(2000);

      expect(saveLoadManager.getPlaytime()).toBe(3);
    });

    it('プレイ時間を手動で設定できる', () => {
      saveLoadManager.setPlaytime(100);

      expect(saveLoadManager.getPlaytime()).toBe(100);
    });

    it('重複してプレイ時間追跡を開始しても二重カウントされない', () => {
      vi.useFakeTimers();

      saveLoadManager.startPlaytimeTracking();
      saveLoadManager.startPlaytimeTracking();

      vi.advanceTimersByTime(3000);

      expect(saveLoadManager.getPlaytime()).toBe(3);
    });
  });

  describe('オートセーブ機能', () => {
    it('オートセーブを有効化できる', () => {
      vi.useFakeTimers();

      saveLoadManager.enableAutoSave(10000);

      vi.advanceTimersByTime(10000);

      expect(mockStorage.setItem).toHaveBeenCalledWith(
        `${SAVE_KEY_PREFIX}auto`,
        expect.any(String)
      );
    });

    it('オートセーブを無効化できる', () => {
      vi.useFakeTimers();

      saveLoadManager.enableAutoSave(10000);
      saveLoadManager.disableAutoSave();

      vi.advanceTimersByTime(20000);

      expect(mockStorage.setItem).not.toHaveBeenCalled();
    });

    it('フェーズ変更時にオートセーブが実行される', async () => {
      saveLoadManager.enableAutoSave();

      eventBus.emit('app:phase:changed', { phase: 'GATHERING' });

      // オートセーブが実行されるまで待つ
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockStorage.setItem).toHaveBeenCalledWith(
        `${SAVE_KEY_PREFIX}auto`,
        expect.any(String)
      );
    });

    it('オートセーブの存在を確認できる', async () => {
      expect(saveLoadManager.hasAutoSave()).toBe(false);

      saveLoadManager.enableAutoSave();
      eventBus.emit('app:phase:changed', { phase: 'GATHERING' });
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(saveLoadManager.hasAutoSave()).toBe(true);
    });

    it('オートセーブをロードできる', async () => {
      saveLoadManager.enableAutoSave();
      eventBus.emit('app:phase:changed', { phase: 'GATHERING' });
      await new Promise((resolve) => setTimeout(resolve, 10));

      const result = await saveLoadManager.loadAutoSave();

      expect(result).toBe(true);
    });

    it('オートセーブが存在しない場合はロードに失敗する', async () => {
      const result = await saveLoadManager.loadAutoSave();

      expect(result).toBe(false);
    });
  });

  describe('クリーンアップ', () => {
    it('destroyでタイマーが停止される', () => {
      vi.useFakeTimers();

      saveLoadManager.startPlaytimeTracking();
      saveLoadManager.enableAutoSave(10000);
      saveLoadManager.destroy();

      vi.advanceTimersByTime(15000);

      // プレイ時間が増えていない
      expect(saveLoadManager.getPlaytime()).toBe(0);
      // オートセーブが実行されていない
      expect(mockStorage.setItem).not.toHaveBeenCalled();
    });
  });
});
