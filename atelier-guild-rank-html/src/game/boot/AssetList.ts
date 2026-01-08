/**
 * アセットリスト定義
 *
 * BootSceneでプリロードする全アセット（画像、音声、JSON）のリストを定義する。
 * 設計文書: docs/design/atelier-guild-rank-phaser/architecture.md
 */

import { ImageKeys, AudioKeys } from '../assets/AssetKeys';
import { AssetPaths } from '../assets/AssetPaths';

/**
 * アセット種別
 */
export type AssetType = 'image' | 'audio' | 'json' | 'spritesheet' | 'atlas';

/**
 * ロードするアセット情報
 */
export interface AssetLoadItem {
  /** アセットキー（一意） */
  key: string;
  /** アセットファイルパス */
  path: string;
  /** アセット種別 */
  type: AssetType;
  /** スプライトシートのフレーム設定（任意） */
  frameConfig?: {
    frameWidth: number;
    frameHeight: number;
    startFrame?: number;
    endFrame?: number;
  };
}

/**
 * 画像アセット
 */
export const ImageAssets: AssetLoadItem[] = [
  // UI部品
  {
    key: ImageKeys.BUTTON_PRIMARY,
    path: AssetPaths.image(ImageKeys.BUTTON_PRIMARY),
    type: 'image',
  },
  {
    key: ImageKeys.BUTTON_SECONDARY,
    path: AssetPaths.image(ImageKeys.BUTTON_SECONDARY),
    type: 'image',
  },
  {
    key: ImageKeys.PANEL_BACKGROUND,
    path: AssetPaths.image(ImageKeys.PANEL_BACKGROUND),
    type: 'image',
  },
  {
    key: ImageKeys.CARD_FRAME,
    path: AssetPaths.image(ImageKeys.CARD_FRAME),
    type: 'image',
  },
  {
    key: ImageKeys.DIALOG_BACKGROUND,
    path: AssetPaths.image(ImageKeys.DIALOG_BACKGROUND),
    type: 'image',
  },

  // カード種別
  {
    key: ImageKeys.CARD_GATHERING,
    path: AssetPaths.image(ImageKeys.CARD_GATHERING),
    type: 'image',
  },
  {
    key: ImageKeys.CARD_RECIPE,
    path: AssetPaths.image(ImageKeys.CARD_RECIPE),
    type: 'image',
  },
  {
    key: ImageKeys.CARD_ENHANCEMENT,
    path: AssetPaths.image(ImageKeys.CARD_ENHANCEMENT),
    type: 'image',
  },

  // アイコン
  {
    key: ImageKeys.ICON_GOLD,
    path: AssetPaths.image(ImageKeys.ICON_GOLD),
    type: 'image',
  },
  {
    key: ImageKeys.ICON_AP,
    path: AssetPaths.image(ImageKeys.ICON_AP),
    type: 'image',
  },
  {
    key: ImageKeys.ICON_RANK,
    path: AssetPaths.image(ImageKeys.ICON_RANK),
    type: 'image',
  },
  {
    key: ImageKeys.ICON_DAY,
    path: AssetPaths.image(ImageKeys.ICON_DAY),
    type: 'image',
  },
  {
    key: ImageKeys.ICON_CONTRIBUTION,
    path: AssetPaths.image(ImageKeys.ICON_CONTRIBUTION),
    type: 'image',
  },
  {
    key: ImageKeys.ICON_MATERIAL,
    path: AssetPaths.image(ImageKeys.ICON_MATERIAL),
    type: 'image',
  },

  // 背景
  {
    key: ImageKeys.BG_TITLE,
    path: AssetPaths.image(ImageKeys.BG_TITLE),
    type: 'image',
  },
  {
    key: ImageKeys.BG_MAIN,
    path: AssetPaths.image(ImageKeys.BG_MAIN),
    type: 'image',
  },
  {
    key: ImageKeys.BG_SHOP,
    path: AssetPaths.image(ImageKeys.BG_SHOP),
    type: 'image',
  },
  {
    key: ImageKeys.BG_RANK_UP,
    path: AssetPaths.image(ImageKeys.BG_RANK_UP),
    type: 'image',
  },
  {
    key: ImageKeys.BG_GAME_OVER,
    path: AssetPaths.image(ImageKeys.BG_GAME_OVER),
    type: 'image',
  },
  {
    key: ImageKeys.BG_GAME_CLEAR,
    path: AssetPaths.image(ImageKeys.BG_GAME_CLEAR),
    type: 'image',
  },

  // プレースホルダー
  {
    key: ImageKeys.PLACEHOLDER,
    path: AssetPaths.image(ImageKeys.PLACEHOLDER),
    type: 'image',
  },
];

/**
 * 音声アセット
 */
export const AudioAssets: AssetLoadItem[] = [
  // BGM
  {
    key: AudioKeys.BGM_TITLE,
    path: AssetPaths.audio(AudioKeys.BGM_TITLE),
    type: 'audio',
  },
  {
    key: AudioKeys.BGM_MAIN,
    path: AssetPaths.audio(AudioKeys.BGM_MAIN),
    type: 'audio',
  },
  {
    key: AudioKeys.BGM_SHOP,
    path: AssetPaths.audio(AudioKeys.BGM_SHOP),
    type: 'audio',
  },
  {
    key: AudioKeys.BGM_RANK_UP,
    path: AssetPaths.audio(AudioKeys.BGM_RANK_UP),
    type: 'audio',
  },
  {
    key: AudioKeys.BGM_GAME_OVER,
    path: AssetPaths.audio(AudioKeys.BGM_GAME_OVER),
    type: 'audio',
  },
  {
    key: AudioKeys.BGM_GAME_CLEAR,
    path: AssetPaths.audio(AudioKeys.BGM_GAME_CLEAR),
    type: 'audio',
  },

  // SE
  {
    key: AudioKeys.SE_CLICK,
    path: AssetPaths.audio(AudioKeys.SE_CLICK),
    type: 'audio',
  },
  {
    key: AudioKeys.SE_SUCCESS,
    path: AssetPaths.audio(AudioKeys.SE_SUCCESS),
    type: 'audio',
  },
  {
    key: AudioKeys.SE_ERROR,
    path: AssetPaths.audio(AudioKeys.SE_ERROR),
    type: 'audio',
  },
  {
    key: AudioKeys.SE_CARD_DRAW,
    path: AssetPaths.audio(AudioKeys.SE_CARD_DRAW),
    type: 'audio',
  },
  {
    key: AudioKeys.SE_CARD_PLAY,
    path: AssetPaths.audio(AudioKeys.SE_CARD_PLAY),
    type: 'audio',
  },
  {
    key: AudioKeys.SE_ALCHEMY,
    path: AssetPaths.audio(AudioKeys.SE_ALCHEMY),
    type: 'audio',
  },
  {
    key: AudioKeys.SE_QUEST_COMPLETE,
    path: AssetPaths.audio(AudioKeys.SE_QUEST_COMPLETE),
    type: 'audio',
  },
  {
    key: AudioKeys.SE_RANK_UP,
    path: AssetPaths.audio(AudioKeys.SE_RANK_UP),
    type: 'audio',
  },
];

/**
 * JSONアセット（マスターデータ）
 */
export const JsonAssets: AssetLoadItem[] = [
  // カードデータ
  {
    key: 'cards-gathering',
    path: 'data/master/gathering_cards.json',
    type: 'json',
  },
  {
    key: 'cards-recipe',
    path: 'data/master/recipe_cards.json',
    type: 'json',
  },
  {
    key: 'cards-enhancement',
    path: 'data/master/enhancement_cards.json',
    type: 'json',
  },

  // 素材・アイテム
  {
    key: 'materials',
    path: 'data/master/materials.json',
    type: 'json',
  },
  {
    key: 'items',
    path: 'data/master/items.json',
    type: 'json',
  },

  // 依頼・ランク
  {
    key: 'quests',
    path: 'data/master/quests.json',
    type: 'json',
  },
  {
    key: 'ranks',
    path: 'data/master/ranks.json',
    type: 'json',
  },

  // その他
  {
    key: 'artifacts',
    path: 'data/master/artifacts.json',
    type: 'json',
  },
  {
    key: 'clients',
    path: 'data/master/clients.json',
    type: 'json',
  },
  {
    key: 'initial-deck',
    path: 'data/master/initial_deck.json',
    type: 'json',
  },
  {
    key: 'shop-items',
    path: 'data/master/shop_items.json',
    type: 'json',
  },
];

/**
 * 全アセット
 */
export const AllAssets: AssetLoadItem[] = [
  ...ImageAssets,
  ...AudioAssets,
  ...JsonAssets,
];

/**
 * アセット総数を取得
 * @returns アセット総数
 */
export const getTotalAssetCount = (): number => AllAssets.length;

/**
 * 指定された種別のアセットを取得
 * @param type アセット種別
 * @returns 指定種別のアセット配列
 */
export const getAssetsByType = (type: AssetType): AssetLoadItem[] => {
  return AllAssets.filter((asset) => asset.type === type);
};
