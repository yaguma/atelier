/**
 * セーブ・ロード管理モジュール
 *
 * TASK-0255: セーブ・ロード Phaser対応
 */

export {
  PhaserSaveLoadManager,
  createPhaserSaveLoadManager,
  getPhaserSaveLoadManager,
  resetPhaserSaveLoadManager,
  SAVE_KEY_PREFIX,
  SAVE_VERSION,
  MAX_SLOTS,
  type SaveSlotInfo,
  type SaveData,
  type PhaserSaveLoadManagerOptions,
} from './PhaserSaveLoadManager';
