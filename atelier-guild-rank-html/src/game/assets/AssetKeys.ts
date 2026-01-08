/**
 * アセットキー定数
 *
 * Phaserで使用するアセット（画像、音声、フォント等）のキーを一元管理する。
 * 設計文書: docs/design/atelier-guild-rank-phaser/architecture.md
 */

/**
 * 画像アセットキー
 */
export const ImageKeys = {
  // UI部品
  BUTTON_PRIMARY: 'button-primary',
  BUTTON_SECONDARY: 'button-secondary',
  PANEL_BACKGROUND: 'panel-bg',
  CARD_FRAME: 'card-frame',
  DIALOG_BACKGROUND: 'dialog-bg',

  // カード種別
  CARD_GATHERING: 'card-gathering',
  CARD_RECIPE: 'card-recipe',
  CARD_ENHANCEMENT: 'card-enhancement',

  // アイコン
  ICON_GOLD: 'icon-gold',
  ICON_AP: 'icon-ap',
  ICON_RANK: 'icon-rank',
  ICON_DAY: 'icon-day',
  ICON_CONTRIBUTION: 'icon-contribution',

  // 素材アイコン
  ICON_MATERIAL: 'icon-material',

  // 背景
  BG_TITLE: 'bg-title',
  BG_MAIN: 'bg-main',
  BG_SHOP: 'bg-shop',
  BG_RANK_UP: 'bg-rank-up',
  BG_GAME_OVER: 'bg-game-over',
  BG_GAME_CLEAR: 'bg-game-clear',

  // プレースホルダー
  PLACEHOLDER: 'placeholder',
} as const;

/**
 * 音声アセットキー
 */
export const AudioKeys = {
  // BGM
  BGM_TITLE: 'bgm-title',
  BGM_MAIN: 'bgm-main',
  BGM_SHOP: 'bgm-shop',
  BGM_RANK_UP: 'bgm-rank-up',
  BGM_GAME_OVER: 'bgm-game-over',
  BGM_GAME_CLEAR: 'bgm-game-clear',

  // SE
  SE_CLICK: 'se-click',
  SE_SUCCESS: 'se-success',
  SE_ERROR: 'se-error',
  SE_CARD_DRAW: 'se-card-draw',
  SE_CARD_PLAY: 'se-card-play',
  SE_ALCHEMY: 'se-alchemy',
  SE_QUEST_COMPLETE: 'se-quest-complete',
  SE_RANK_UP: 'se-rank-up',
} as const;

/**
 * フォントキー
 */
export const FontKeys = {
  MAIN: 'main-font',
  TITLE: 'title-font',
} as const;

/**
 * 画像アセットキーの型定義
 */
export type ImageKey = (typeof ImageKeys)[keyof typeof ImageKeys];

/**
 * 音声アセットキーの型定義
 */
export type AudioKey = (typeof AudioKeys)[keyof typeof AudioKeys];

/**
 * フォントキーの型定義
 */
export type FontKey = (typeof FontKeys)[keyof typeof FontKeys];
