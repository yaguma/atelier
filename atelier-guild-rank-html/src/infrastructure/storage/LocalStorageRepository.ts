/**
 * LocalStorageリポジトリ
 *
 * @description localStorage への読み書きを行うリポジトリ実装
 * @see docs/design/atelier-guild-rank/data-schema.md
 */

import type { IStorageRepository } from './IStorageRepository';

/**
 * LocalStorageリポジトリ実装
 * @template T データ型
 */
export class LocalStorageRepository<T> implements IStorageRepository<T> {
  private readonly storage: Storage;

  /**
   * コンストラクタ
   * @param storage Storage インスタンス（デフォルト: localStorage）
   */
  constructor(storage: Storage = localStorage) {
    this.storage = storage;
  }

  /**
   * データを保存する
   * @param key 保存キー
   * @param data 保存するデータ
   */
  save(key: string, data: T): void {
    const serialized = JSON.stringify(data);
    this.storage.setItem(key, serialized);
  }

  /**
   * データを読み込む
   * @param key 読み込みキー
   * @returns データ、存在しない場合やパースエラー時はnull
   */
  load(key: string): T | null {
    const stored = this.storage.getItem(key);
    if (stored === null) {
      return null;
    }

    try {
      return JSON.parse(stored) as T;
    } catch {
      // パースエラー時はnullを返す
      return null;
    }
  }

  /**
   * データを削除する
   * @param key 削除キー
   */
  delete(key: string): void {
    this.storage.removeItem(key);
  }

  /**
   * キーが存在するか確認する
   * @param key 確認キー
   * @returns 存在する場合true
   */
  exists(key: string): boolean {
    return this.storage.getItem(key) !== null;
  }
}
