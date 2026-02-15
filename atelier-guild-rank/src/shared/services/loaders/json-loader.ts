/**
 * json-loader.ts - JSONローダー実装
 *
 * TASK-0006: マスターデータローダー実装
 * JSONファイルを非同期で読み込むユーティリティクラス
 */

import { ApplicationError, ErrorCodes } from '@shared/types';

/**
 * JSONローダーインターフェース
 */
export interface IJsonLoader {
  /**
   * JSONファイルを読み込む
   *
   * @param path ファイルパス
   * @returns 読み込んだデータ
   * @throws 読み込みに失敗した場合
   */
  load<T>(path: string): Promise<T>;
}

/**
 * JSONローダー実装
 *
 * @example
 * ```typescript
 * const loader = new JsonLoader();
 * const data = await loader.load<MyData[]>('/assets/data/my-data.json');
 * ```
 */
export class JsonLoader implements IJsonLoader {
  /**
   * JSONファイルを読み込む
   *
   * @param path ファイルパス
   * @returns 読み込んだデータ
   * @throws 読み込みに失敗した場合
   */
  async load<T>(path: string): Promise<T> {
    try {
      const response = await fetch(path);

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCodes.DATA_LOAD_FAILED,
          `Failed to load: ${path} (status: ${response.status})`,
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof ApplicationError) {
        throw error;
      }

      throw new ApplicationError(
        ErrorCodes.DATA_LOAD_FAILED,
        `Failed to load: ${path}`,
        error instanceof Error ? error : undefined,
      );
    }
  }
}
