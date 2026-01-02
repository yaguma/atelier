/**
 * ストレージリポジトリインターフェース
 *
 * @description localStorage への読み書きを抽象化するインターフェース
 * @see docs/design/atelier-guild-rank/data-schema.md
 */

/**
 * ストレージリポジトリインターフェース
 * @template T データ型
 */
export interface IStorageRepository<T> {
  /**
   * データを保存する
   * @param key 保存キー
   * @param data 保存するデータ
   */
  save(key: string, data: T): void;

  /**
   * データを読み込む
   * @param key 読み込みキー
   * @returns データ、存在しない場合はnull
   */
  load(key: string): T | null;

  /**
   * データを削除する
   * @param key 削除キー
   */
  delete(key: string): void;

  /**
   * キーが存在するか確認する
   * @param key 確認キー
   * @returns 存在する場合true
   */
  exists(key: string): boolean;
}
