/**
 * Rank tokens - ギルドランクごとの色定義
 * Issue #455: UI刷新 Phase 1
 *
 * RankBadge / RankProgressBar で重複定義されていた RANK_COLORS を一元化。
 */

import type { GuildRank } from '@shared/types';

export const RANK_COLORS: Record<GuildRank, number> = {
  G: 0x808080,
  F: 0x6b8e23,
  E: 0x2e8b57,
  D: 0x4169e1,
  C: 0x9932cc,
  B: 0xdc143c,
  A: 0xffd700,
  S: 0xff1493,
};
