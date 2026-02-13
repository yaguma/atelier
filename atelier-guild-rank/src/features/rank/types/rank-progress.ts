/**
 * RankProgress型定義
 * TASK-0091: features/rank/types作成
 *
 * ランク進捗情報を表す型。現在のランク、貢献度、
 * 昇格ゲージなどのランク進行状態を集約する。
 */

import type { GuildRank } from '@shared/types';

// =============================================================================
// RankProgress型
// =============================================================================

/** ランク進捗情報 */
export interface RankProgress {
  /** 現在のランク */
  currentRank: GuildRank;
  /** 累積貢献度 */
  accumulatedContribution: number;
  /** 昇格に必要な貢献度 */
  requiredContribution: number;
  /** 昇格ゲージ（0〜100のパーセンテージ） */
  promotionGauge: number;
  /** 昇格に必要な残り貢献度 */
  remainingContribution: number;
  /** 昇格可能かどうか */
  canPromote: boolean;
  /** 次のランク（最高ランクの場合はnull） */
  nextRank: GuildRank | null;
}
