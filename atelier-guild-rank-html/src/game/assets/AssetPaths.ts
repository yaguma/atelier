/**
 * アセットパスユーティリティ
 *
 * アセットファイルパスを生成するユーティリティ関数を提供する。
 * 設計文書: docs/design/atelier-guild-rank-phaser/architecture.md
 */

/** アセットベースパス */
const BASE_PATH = 'assets';

/**
 * アセットパス生成関数群
 */
export const AssetPaths = {
  /**
   * 画像アセットのパスを生成する
   * @param key アセットキー
   * @returns 画像ファイルパス
   */
  image: (key: string): string => `${BASE_PATH}/images/${key}.png`,

  /**
   * 音声アセットのパスを生成する（MP3形式）
   * @param key アセットキー
   * @returns 音声ファイルパス
   */
  audio: (key: string): string => `${BASE_PATH}/audio/${key}.mp3`,

  /**
   * 音声アセットのパスを生成する（OGG形式）
   * @param key アセットキー
   * @returns 音声ファイルパス
   */
  audioOgg: (key: string): string => `${BASE_PATH}/audio/${key}.ogg`,

  /**
   * フォントアセットのパスを生成する
   * @param key アセットキー
   * @returns フォントファイルパス
   */
  font: (key: string): string => `${BASE_PATH}/fonts/${key}.ttf`,

  /**
   * JSONデータのパスを生成する
   * @param key アセットキー
   * @returns JSONファイルパス
   */
  json: (key: string): string => `${BASE_PATH}/data/${key}.json`,

  /**
   * テクスチャアトラスのパスを生成する
   * @param key アセットキー
   * @returns アトラス画像とJSONのパス
   */
  atlas: (key: string): { texture: string; data: string } => ({
    texture: `${BASE_PATH}/atlas/${key}.png`,
    data: `${BASE_PATH}/atlas/${key}.json`,
  }),
} as const;
