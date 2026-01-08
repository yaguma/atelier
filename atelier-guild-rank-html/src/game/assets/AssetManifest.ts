/**
 * アセットマニフェスト
 *
 * ロード対象のアセット一覧を管理する。
 * BootSceneでこのマニフェストを使用してアセットをプリロードする。
 * 設計文書: docs/design/atelier-guild-rank-phaser/architecture.md
 */
import { ImageKeys, AudioKeys } from './AssetKeys';
import { AssetPaths } from './AssetPaths';

/**
 * アセットエントリ
 */
export interface AssetEntry {
  /** アセットキー */
  key: string;
  /** アセットファイルパス */
  path: string;
}

/**
 * 音声アセットエントリ（複数フォーマット対応）
 */
export interface AudioAssetEntry {
  /** アセットキー */
  key: string;
  /** 音声ファイルパス配列（フォールバック順） */
  paths: string[];
}

/**
 * 画像アセットマニフェスト
 */
export const ImageManifest: AssetEntry[] = Object.values(ImageKeys).map((key) => ({
  key,
  path: AssetPaths.image(key),
}));

/**
 * 音声アセットマニフェスト
 */
export const AudioManifest: AudioAssetEntry[] = Object.values(AudioKeys).map((key) => ({
  key,
  paths: [AssetPaths.audio(key), AssetPaths.audioOgg(key)],
}));

/**
 * 必須アセットキー（BootSceneでプリロード必須）
 */
export const RequiredImageKeys: string[] = [
  ImageKeys.BUTTON_PRIMARY,
  ImageKeys.BUTTON_SECONDARY,
  ImageKeys.PANEL_BACKGROUND,
  ImageKeys.PLACEHOLDER,
];

/**
 * 必須音声キー（BootSceneでプリロード必須）
 */
export const RequiredAudioKeys: string[] = [ImageKeys.PLACEHOLDER];
