/**
 * セーブデータリポジトリ実装
 */

import { ISaveDataRepository } from './ISaveDataRepository';
import { ISaveData } from '@domain/save/SaveData';

/** セーブデータ保存用のキー */
const SAVE_DATA_KEY = 'atelier_save_data';

/**
 * LocalStorageを使用したセーブデータリポジトリ
 */
export class SaveDataRepository implements ISaveDataRepository {
  private readonly storage: Storage;

  /**
   * @param storage 使用するStorageオブジェクト（テスト用にDI可能）
   */
  constructor(storage: Storage = localStorage) {
    this.storage = storage;
  }

  /**
   * 新規セーブデータを作成
   */
  create(initialData: ISaveData): void {
    this.save(initialData);
  }

  /**
   * セーブデータを読み込み
   */
  load(): ISaveData | null {
    const data = this.storage.getItem(SAVE_DATA_KEY);
    if (data === null) {
      return null;
    }

    try {
      return JSON.parse(data) as ISaveData;
    } catch {
      // 不正なJSONの場合はnullを返す
      return null;
    }
  }

  /**
   * セーブデータを保存
   */
  save(data: ISaveData): void {
    const json = JSON.stringify(data);
    this.storage.setItem(SAVE_DATA_KEY, json);
  }

  /**
   * セーブデータを削除
   */
  delete(): void {
    this.storage.removeItem(SAVE_DATA_KEY);
  }

  /**
   * セーブデータの存在確認
   */
  exists(): boolean {
    return this.storage.getItem(SAVE_DATA_KEY) !== null;
  }

  /**
   * セーブデータのバージョン取得
   */
  getVersion(): string | null {
    const data = this.load();
    return data?.version ?? null;
  }
}
