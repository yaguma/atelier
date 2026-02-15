/**
 * save-data-repository.interface.ts - セーブデータリポジトリインターフェース
 *
 * セーブデータの保存・読み込み・削除を行うリポジトリのインターフェース定義
 */

import type { ISaveData } from '@shared/types';

// =============================================================================
// セーブデータリポジトリインターフェース
// =============================================================================

/**
 * セーブデータリポジトリインターフェース
 *
 * LocalStorageやIndexedDB等の永続化層の抽象化
 */
export interface ISaveDataRepository {
  /**
   * セーブデータを保存
   * @param data 保存するセーブデータ
   * @throws {ApplicationError} 保存失敗時（ErrorCodes.SAVE_FAILED）
   */
  save(data: ISaveData): Promise<void>;

  /**
   * セーブデータを読み込み
   * @returns セーブデータ（存在しない場合null）
   * @throws {ApplicationError} 読み込み失敗時（ErrorCodes.LOAD_FAILED）
   */
  load(): Promise<ISaveData | null>;

  /**
   * セーブデータの存在チェック
   * @returns 存在する場合true
   */
  exists(): boolean;

  /**
   * セーブデータを削除
   * @throws {ApplicationError} 削除失敗時
   */
  delete(): Promise<void>;

  /**
   * 最終保存日時を取得
   * @returns 最終保存日時（存在しない場合null）
   */
  getLastSavedTime(): Date | null;
}
