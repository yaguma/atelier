/**
 * constants.ts - 定数定義
 *
 * ゲーム全体で使用される定数値
 *
 * @remarks
 * ゲームバランスに関する定数は @shared/constants/game-config に一元管理されている。
 * このファイルの定数はgame-configから導出し、後方互換性を維持する。
 */

import {
  PLAYER_INITIAL,
  QUALITY_REWARD_MULTIPLIER,
  QUALITY_VALUE,
} from '@shared/constants/game-config';
import { GuildRank, Quality } from './common';

// =============================================================================
// 品質関連定数
// =============================================================================

/**
 * 品質値マッピング
 * 品質から数値への変換テーブル
 *
 * @remarks ソースは QUALITY_VALUE (game-config)
 */
export const QualityValue: Record<Quality, number> = {
  [Quality.D]: QUALITY_VALUE.D,
  [Quality.C]: QUALITY_VALUE.C,
  [Quality.B]: QUALITY_VALUE.B,
  [Quality.A]: QUALITY_VALUE.A,
  [Quality.S]: QUALITY_VALUE.S,
} as const;

/**
 * 品質倍率マッピング
 * 品質から報酬倍率への変換テーブル
 *
 * @remarks ソースは QUALITY_REWARD_MULTIPLIER (game-config)
 */
export const QualityMultiplier: Record<Quality, number> = {
  [Quality.D]: QUALITY_REWARD_MULTIPLIER.D,
  [Quality.C]: QUALITY_REWARD_MULTIPLIER.C,
  [Quality.B]: QUALITY_REWARD_MULTIPLIER.B,
  [Quality.A]: QUALITY_REWARD_MULTIPLIER.A,
  [Quality.S]: QUALITY_REWARD_MULTIPLIER.S,
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
 *
 * @remarks ソースは PLAYER_INITIAL (game-config)
 * 後方互換性のために従来のプロパティ名を維持する。
 */
export const InitialParameters = {
  /** 初期デッキサイズ */
  INITIAL_DECK_SIZE: PLAYER_INITIAL.DECK_SIZE,
  /** デッキ上限 */
  DECK_LIMIT: PLAYER_INITIAL.DECK_LIMIT,
  /** 手札上限 */
  HAND_LIMIT: PLAYER_INITIAL.HAND_LIMIT,
  /** 1日あたりの行動ポイント */
  ACTION_POINTS_PER_DAY: PLAYER_INITIAL.ACTION_POINTS_PER_DAY,
  /** 初期ゴールド */
  INITIAL_GOLD: PLAYER_INITIAL.INITIAL_GOLD,
  /** 初期保管上限 */
  INITIAL_STORAGE_LIMIT: PLAYER_INITIAL.STORAGE_LIMIT,
  /** 同時受注可能な依頼数 */
  MAX_ACTIVE_QUESTS: PLAYER_INITIAL.MAX_ACTIVE_QUESTS,
  /** 手札補充枚数 */
  HAND_REFILL_COUNT: PLAYER_INITIAL.HAND_REFILL_COUNT,
} as const;
