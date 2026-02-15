/**
 * RankUp Types（後方互換性用再エクスポート）
 *
 * @description
 * 実体は scenes/components/rankup/types.ts に移動済み。
 * 後方互換性のため再エクスポートを提供する。
 *
 * 新規コードでは @scenes/components/rankup を使用すること。
 */
export type {
  Artifact,
  Quality,
  Rank,
  RankTest,
  RankTestTask,
  RankUpReward,
  TestPanelCallbacks,
  TestState,
} from '@scenes/components/rankup/types';
