/**
 * Rank tokens - ギルドランクごとの色定義
 * Issue #457: UI刷新 Phase 3 で新パレットへ移行
 *
 * @remarks
 * 月下の錬金工房パレット（color-palette.ts）の Rank カラーを参照する。
 */

import type { GuildRank } from '@shared/types';
import { Rank } from './color-palette';

export const RANK_COLORS: Record<GuildRank, number> = {
  G: Rank.G,
  F: Rank.F,
  E: Rank.E,
  D: Rank.D,
  C: Rank.C,
  B: Rank.B,
  A: Rank.A,
  S: Rank.S,
};
