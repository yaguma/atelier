/**
 * セーブデータリポジトリインターフェース
 */

import { ISaveData } from '@domain/save/SaveData';

/**
 * セーブデータリポジトリインターフェース
 */
export interface ISaveDataRepository {
  /**
   * 新規セーブデータを作成
   * @param initialData 初期セーブデータ
   */
  create(initialData: ISaveData): void;

  /**
   * セーブデータを読み込み
   * @returns セーブデータ（存在しない場合はnull）
   */
  load(): ISaveData | null;

  /**
   * セーブデータを保存
   * @param data 保存するセーブデータ
   */
  save(data: ISaveData): void;

  /**
   * セーブデータを削除
   */
  delete(): void;

  /**
   * セーブデータの存在確認
   * @returns 存在する場合true
   */
  exists(): boolean;

  /**
   * セーブデータのバージョン取得
   * @returns バージョン文字列（存在しない場合はnull）
   */
  getVersion(): string | null;
}
