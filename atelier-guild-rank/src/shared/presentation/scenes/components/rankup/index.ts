/**
 * RankUp Components（後方互換性用再エクスポート）
 *
 * @description
 * 実体は scenes/components/rankup/ に移動済み。
 * 後方互換性のため再エクスポートを提供する。
 *
 * 新規コードでは @scenes/components/rankup を使用すること。
 */
export { RankUpHeader } from '@scenes/components/rankup/RankUpHeader';
export { RankUpRequirements } from '@scenes/components/rankup/RankUpRequirements';
export { RankUpRewards } from '@scenes/components/rankup/RankUpRewards';
export { RankUpTestPanel } from '@scenes/components/rankup/RankUpTestPanel';
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
