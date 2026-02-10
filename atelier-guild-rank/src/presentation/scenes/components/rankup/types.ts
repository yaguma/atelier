/**
 * RankUp コンポーネント型定義
 * TASK-0055 RankUpSceneリファクタリング
 */

/**
 * 品質タイプ
 */
export type Quality = 'C' | 'B' | 'A' | 'S';

/**
 * ランクタイプ
 */
export type Rank = 'G' | 'F' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

/**
 * 試験状態タイプ
 */
export type TestState = 'NotStarted' | 'InProgress' | 'Completed' | 'Failed';

/**
 * RankTestTaskインターフェース
 */
export interface RankTestTask {
  taskId: string;
  description: string;
  itemId: string;
  count: number;
  qualityRequired?: Quality;
  completed: number;
  isCompleted: boolean;
}

/**
 * RankTestインターフェース
 */
export interface RankTest {
  testId: string;
  fromRank: Rank;
  toRank: Rank;
  tasks: RankTestTask[];
  timeLimitDays: number;
  remainingDays: number;
  state: TestState;
}

/**
 * Artifactインターフェース
 */
export interface Artifact {
  id: string;
  name: string;
  rarity: string;
  effect: string;
  description: string;
}

/**
 * RankUpRewardインターフェース
 */
export interface RankUpReward {
  bonusGold: number;
  artifacts: Artifact[];
}

/**
 * TestPanelCallbacksインターフェース
 */
export interface TestPanelCallbacks {
  onStartTest: () => void;
  onDeclineTest: () => void;
  onToTitle: () => void;
}
