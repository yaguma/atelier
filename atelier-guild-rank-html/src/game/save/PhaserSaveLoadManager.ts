/**
 * Phaser環境向けセーブ・ロード管理
 *
 * TASK-0255: セーブ・ロード Phaser対応
 * セーブ・ロード機能をPhaser環境に対応させる。
 * 既存のSaveLoadUseCaseとPhaserStateManagerの連携を実装する。
 */

import { EventBus } from '../events/EventBus';
import type { PhaserStateManager } from '../state/PhaserStateManager';
import type { PhaserGameFlowManager } from '../flow/PhaserGameFlowManager';

/**
 * セーブスロット情報
 */
export interface SaveSlotInfo {
  /** スロットID */
  slotId: number;
  /** データが存在するか */
  exists: boolean;
  /** 保存日時（タイムスタンプ） */
  timestamp?: number;
  /** ゲーム日数 */
  day?: number;
  /** ギルドランク */
  rank?: string;
  /** プレイ時間（秒） */
  playtime?: number;
}

/**
 * セーブデータ構造
 */
export interface SaveData {
  /** セーブデータバージョン */
  version: string;
  /** 保存日時（タイムスタンプ） */
  timestamp: number;
  /** プレイ時間（秒） */
  playtime: number;
  /** シリアライズされた状態データ */
  state: string;
}

/** セーブデータキープレフィックス */
export const SAVE_KEY_PREFIX = 'atelier_guild_rank_save_';

/** セーブデータバージョン */
export const SAVE_VERSION = '1.0.0';

/** 最大スロット数 */
export const MAX_SLOTS = 3;

/**
 * PhaserSaveLoadManagerオプション
 */
export interface PhaserSaveLoadManagerOptions {
  /** EventBusインスタンス */
  eventBus: EventBus;
  /** PhaserStateManagerインスタンス */
  stateManager: PhaserStateManager;
  /** PhaserGameFlowManagerインスタンス */
  flowManager: PhaserGameFlowManager;
  /** Storageインスタンス（テスト用、省略時はlocalStorage） */
  storage?: Storage;
}

/**
 * Phaser環境向けのセーブ・ロード管理クラス
 *
 * @example
 * ```typescript
 * const saveLoadManager = new PhaserSaveLoadManager({
 *   eventBus,
 *   stateManager: phaserStateManager,
 *   flowManager: phaserGameFlowManager,
 * });
 *
 * // セーブ
 * await saveLoadManager.save(1);
 *
 * // ロード
 * await saveLoadManager.load(1);
 *
 * // オートセーブ有効化
 * saveLoadManager.enableAutoSave(60000);
 * ```
 */
export class PhaserSaveLoadManager {
  private eventBus: EventBus;
  private stateManager: PhaserStateManager;
  private flowManager: PhaserGameFlowManager;
  private storage: Storage;
  private playtime: number = 0;
  private playtimeTimer: ReturnType<typeof setInterval> | null = null;
  private autoSaveTimer: ReturnType<typeof setInterval> | null = null;
  private autoSaveInterval: number = 60000; // 1分
  private phaseChangeHandler: (() => void) | null = null;

  constructor(options: PhaserSaveLoadManagerOptions) {
    this.eventBus = options.eventBus;
    this.stateManager = options.stateManager;
    this.flowManager = options.flowManager;
    this.storage = options.storage ?? localStorage;
  }

  // ===== プレイ時間管理 =====

  /**
   * プレイ時間追跡を開始する
   */
  startPlaytimeTracking(): void {
    if (this.playtimeTimer !== null) return;

    this.playtimeTimer = setInterval(() => {
      this.playtime++;
    }, 1000);
  }

  /**
   * プレイ時間追跡を停止する
   */
  stopPlaytimeTracking(): void {
    if (this.playtimeTimer !== null) {
      clearInterval(this.playtimeTimer);
      this.playtimeTimer = null;
    }
  }

  /**
   * 現在のプレイ時間を取得する
   * @returns プレイ時間（秒）
   */
  getPlaytime(): number {
    return this.playtime;
  }

  /**
   * プレイ時間を設定する
   * @param time プレイ時間（秒）
   */
  setPlaytime(time: number): void {
    this.playtime = time;
  }

  // ===== スロット管理 =====

  /**
   * セーブスロット一覧を取得する
   * @returns セーブスロット情報の配列
   */
  getSaveSlots(): SaveSlotInfo[] {
    const slots: SaveSlotInfo[] = [];

    for (let i = 1; i <= MAX_SLOTS; i++) {
      const key = `${SAVE_KEY_PREFIX}${i}`;
      const dataStr = this.storage.getItem(key);

      if (dataStr) {
        try {
          const data = JSON.parse(dataStr) as SaveData;
          const state = JSON.parse(data.state);

          slots.push({
            slotId: i,
            exists: true,
            timestamp: data.timestamp,
            day: state.progress?.currentDay,
            rank: state.player?.rank,
            playtime: data.playtime,
          });
        } catch {
          slots.push({
            slotId: i,
            exists: false,
          });
        }
      } else {
        slots.push({
          slotId: i,
          exists: false,
        });
      }
    }

    return slots;
  }

  // ===== セーブ =====

  /**
   * 指定スロットにセーブする
   * @param slotId スロットID（1〜MAX_SLOTS）
   * @returns 成功時true
   */
  async save(slotId: number): Promise<boolean> {
    if (slotId < 1 || slotId > MAX_SLOTS) {
      console.error(`Invalid slot ID: ${slotId}`);
      return false;
    }

    try {
      const saveData: SaveData = {
        version: SAVE_VERSION,
        timestamp: Date.now(),
        playtime: this.playtime,
        state: this.stateManager.serialize(),
      };

      const key = `${SAVE_KEY_PREFIX}${slotId}`;
      this.storage.setItem(key, JSON.stringify(saveData));

      this.eventBus.emit('save:complete', { slotId });

      return true;
    } catch (error) {
      console.error('Save failed:', error);
      this.eventBus.emit('save:failed', { slotId, error });
      return false;
    }
  }

  // ===== ロード =====

  /**
   * 指定スロットからロードする
   * @param slotId スロットID（1〜MAX_SLOTS）
   * @returns 成功時true
   */
  async load(slotId: number): Promise<boolean> {
    if (slotId < 1 || slotId > MAX_SLOTS) {
      console.error(`Invalid slot ID: ${slotId}`);
      return false;
    }

    try {
      const key = `${SAVE_KEY_PREFIX}${slotId}`;
      const dataStr = this.storage.getItem(key);

      if (!dataStr) {
        console.error('Save data not found');
        return false;
      }

      const saveData = JSON.parse(dataStr) as SaveData;

      // バージョンチェック
      if (saveData.version !== SAVE_VERSION) {
        console.warn(
          `Save version mismatch: ${saveData.version} vs ${SAVE_VERSION}`
        );
        // 将来的にはマイグレーション処理
      }

      // プレイ時間復元
      this.playtime = saveData.playtime;

      // 状態復元
      this.stateManager.deserialize(saveData.state);

      // ゲームフロー復元
      await this.flowManager.loadGame(saveData.state);

      this.eventBus.emit('load:complete', { slotId });

      return true;
    } catch (error) {
      console.error('Load failed:', error);
      this.eventBus.emit('load:failed', { slotId, error });
      return false;
    }
  }

  // ===== 削除 =====

  /**
   * 指定スロットのセーブデータを削除する
   * @param slotId スロットID（1〜MAX_SLOTS）
   * @returns 成功時true
   */
  deleteSave(slotId: number): boolean {
    if (slotId < 1 || slotId > MAX_SLOTS) {
      console.error(`Invalid slot ID: ${slotId}`);
      return false;
    }

    try {
      const key = `${SAVE_KEY_PREFIX}${slotId}`;
      this.storage.removeItem(key);

      this.eventBus.emit('save:deleted', { slotId });

      return true;
    } catch (error) {
      console.error('Delete failed:', error);
      return false;
    }
  }

  // ===== オートセーブ =====

  /**
   * オートセーブを有効化する
   * @param intervalMs オートセーブ間隔（ミリ秒、省略時は60000）
   */
  enableAutoSave(intervalMs?: number): void {
    if (intervalMs) {
      this.autoSaveInterval = intervalMs;
    }

    if (this.autoSaveTimer !== null) {
      this.disableAutoSave();
    }

    this.autoSaveTimer = setInterval(() => {
      this.autoSave();
    }, this.autoSaveInterval);

    // フェーズ変更時にもオートセーブ
    this.phaseChangeHandler = () => {
      this.autoSave();
    };
    this.eventBus.on('app:phase:changed', this.phaseChangeHandler);
  }

  /**
   * オートセーブを無効化する
   */
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

  /**
   * オートセーブを実行する
   */
  private async autoSave(): Promise<void> {
    const autoSaveKey = `${SAVE_KEY_PREFIX}auto`;

    try {
      const saveData: SaveData = {
        version: SAVE_VERSION,
        timestamp: Date.now(),
        playtime: this.playtime,
        state: this.stateManager.serialize(),
      };

      this.storage.setItem(autoSaveKey, JSON.stringify(saveData));
      console.log('Auto-save complete');
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }

  /**
   * オートセーブデータが存在するか確認する
   * @returns 存在する場合true
   */
  hasAutoSave(): boolean {
    return this.storage.getItem(`${SAVE_KEY_PREFIX}auto`) !== null;
  }

  /**
   * オートセーブデータをロードする
   * @returns 成功時true
   */
  async loadAutoSave(): Promise<boolean> {
    try {
      const dataStr = this.storage.getItem(`${SAVE_KEY_PREFIX}auto`);

      if (!dataStr) {
        return false;
      }

      const saveData = JSON.parse(dataStr) as SaveData;
      this.playtime = saveData.playtime;
      this.stateManager.deserialize(saveData.state);
      await this.flowManager.loadGame(saveData.state);

      return true;
    } catch (error) {
      console.error('Load auto-save failed:', error);
      return false;
    }
  }

  // ===== クリーンアップ =====

  /**
   * リソースを解放する
   */
  destroy(): void {
    this.stopPlaytimeTracking();
    this.disableAutoSave();
  }
}

// ===== シングルトンインスタンス管理 =====

let saveLoadManagerInstance: PhaserSaveLoadManager | null = null;

/**
 * PhaserSaveLoadManagerシングルトンを作成する
 * @param options オプション
 * @returns PhaserSaveLoadManagerインスタンス
 */
export function createPhaserSaveLoadManager(
  options: PhaserSaveLoadManagerOptions
): PhaserSaveLoadManager {
  if (saveLoadManagerInstance !== null) {
    saveLoadManagerInstance.destroy();
  }
  saveLoadManagerInstance = new PhaserSaveLoadManager(options);
  return saveLoadManagerInstance;
}

/**
 * PhaserSaveLoadManagerシングルトンを取得する
 * @returns PhaserSaveLoadManagerインスタンス（未作成時はnull）
 */
export function getPhaserSaveLoadManager(): PhaserSaveLoadManager | null {
  return saveLoadManagerInstance;
}

/**
 * PhaserSaveLoadManagerシングルトンをリセットする
 */
export function resetPhaserSaveLoadManager(): void {
  if (saveLoadManagerInstance !== null) {
    saveLoadManagerInstance.destroy();
    saveLoadManagerInstance = null;
  }
}
