/**
 * constants.ts - 定数定義
 *
 * ゲーム全体で使用される定数値
 */

import { GuildRank, Quality } from './common';

// =============================================================================
// 品質関連定数
// =============================================================================

/**
 * 品質値マッピング
 * 品質から数値への変換テーブル
 */
export const QualityValue: Record<Quality, number> = {
  [Quality.D]: 1,
  [Quality.C]: 2,
  [Quality.B]: 3,
  [Quality.A]: 4,
  [Quality.S]: 5,
} as const;

/**
 * 品質倍率マッピング
 * 品質から報酬倍率への変換テーブル
 */
export const QualityMultiplier: Record<Quality, number> = {
  [Quality.D]: 0.5,
  [Quality.C]: 1.0,
  [Quality.B]: 1.5,
  [Quality.A]: 2.0,
  [Quality.S]: 3.0,
} as const;

// =============================================================================
// ランク関連定数
// =============================================================================

/**
 * ランク順序マッピング
 * ランクから順序値への変換テーブル（GからSへ昇順）
 */
export const RankOrder: Record<GuildRank, number> = {
  [GuildRank.G]: 0,
  [GuildRank.F]: 1,
  [GuildRank.E]: 2,
  [GuildRank.D]: 3,
  [GuildRank.C]: 4,
  [GuildRank.B]: 5,
  [GuildRank.A]: 6,
  [GuildRank.S]: 7,
} as const;

// =============================================================================
// 初期パラメータ定数
// =============================================================================

/**
 * ゲーム初期パラメータ
 */
export const InitialParameters = {
  /** 初期デッキサイズ */
  INITIAL_DECK_SIZE: 15,
  /** デッキ上限 */
  DECK_LIMIT: 30,
  /** 手札上限 */
  HAND_LIMIT: 7,
  /** 1日あたりの行動ポイント */
  ACTION_POINTS_PER_DAY: 3,
  /** 初期ゴールド */
  INITIAL_GOLD: 100,
  /** 初期保管上限 */
  INITIAL_STORAGE_LIMIT: 20,
  /** 同時受注可能な依頼数 */
  MAX_ACTIVE_QUESTS: 3,
  /** 手札補充枚数 */
  HAND_REFILL_COUNT: 5,
} as const;
