/**
 * HeaderUI定数定義
 *
 * ヘッダーUIのレイアウト、色、スタイルの定数を定義する。
 * 設計文書: docs/tasks/atelier-guild-rank-phaser/TASK-0201.md
 */

import { GuildRank } from '@domain/common/types';

/**
 * ヘッダーレイアウト定数
 */
export const HeaderLayout = {
  // 位置・サイズ
  X: 0,
  Y: 0,
  WIDTH: 1280,
  HEIGHT: 80,

  // パディング
  PADDING_X: 20,
  PADDING_Y: 10,

  // ランク表示エリア
  RANK_X: 20,
  RANK_WIDTH: 200,

  // 経験値ゲージ
  EXP_GAUGE_X: 230,
  EXP_GAUGE_WIDTH: 300,
  EXP_GAUGE_HEIGHT: 20,

  // 日数表示
  DAY_X: 600,

  // ゴールド表示
  GOLD_X: 800,

  // AP表示
  AP_X: 1000,
  AP_GAUGE_WIDTH: 200,
  AP_GAUGE_HEIGHT: 20,

  // メニューボタン
  MENU_X: 1220,
} as const;

/**
 * ヘッダー色定数
 */
export const HeaderColors = {
  BACKGROUND: 0x1a1a2e,
  BACKGROUND_ALPHA: 0.95,
  BORDER: 0x4a4a6a,

  // ゲージ色
  GAUGE_BACKGROUND: 0x333355,
  GAUGE_EXP: 0x4a90d9,
  GAUGE_AP: 0x28a745,
  GAUGE_AP_LOW: 0xffc107,
  GAUGE_AP_EMPTY: 0xdc3545,
} as const;

/**
 * ランク別カラー定義
 */
export const RankColors: Record<GuildRank, number> = {
  [GuildRank.G]: 0x808080, // グレー
  [GuildRank.F]: 0xcd7f32, // ブロンズ
  [GuildRank.E]: 0xc0c0c0, // シルバー
  [GuildRank.D]: 0xffd700, // ゴールド
  [GuildRank.C]: 0x00ff00, // エメラルド
  [GuildRank.B]: 0x00bfff, // サファイア
  [GuildRank.A]: 0xff00ff, // アメジスト
  [GuildRank.S]: 0xff4500, // ルビー
};
