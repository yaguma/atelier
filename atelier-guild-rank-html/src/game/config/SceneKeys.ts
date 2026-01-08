/**
 * シーンキー定数
 *
 * Phaserシーンのキー（識別子）を一元管理する。
 * 設計文書: docs/design/atelier-guild-rank-phaser/architecture.md
 */

/**
 * シーンキー定数オブジェクト
 */
export const SceneKeys = {
  /** 起動・プリロードシーン */
  BOOT: 'BootScene',
  /** タイトル画面シーン */
  TITLE: 'TitleScene',
  /** メインゲーム画面シーン */
  MAIN: 'MainScene',
  /** ショップ画面シーン（オーバーレイ） */
  SHOP: 'ShopScene',
  /** 昇格試験シーン */
  RANK_UP: 'RankUpScene',
  /** ゲームオーバーシーン */
  GAME_OVER: 'GameOverScene',
  /** ゲームクリアシーン */
  GAME_CLEAR: 'GameClearScene',
} as const;

/**
 * シーンキーの型定義
 */
export type SceneKey = (typeof SceneKeys)[keyof typeof SceneKeys];
