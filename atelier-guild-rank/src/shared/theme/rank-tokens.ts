/**
 * Rank tokens - ギルドランクごとの色定義
 * Issue #455: UI刷新 Phase 1
 *
 * RankBadge / RankProgressBar で重複定義されていた RANK_COLORS を一元化。
 *
 * TODO(#455 Phase 2): 設計レポート §4.2 の新カラーへ移行する。
 *   G:#7A8496 / F:#A3B1BF / E:#4FC3A1 / D:#3FAE6A
 *   C:#3FA3D6 / B:#2D6CDF / A:#9B7BE8 / S:#F3A93C
 *   Phase 1 は互換維持のため旧値のままとする。
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
