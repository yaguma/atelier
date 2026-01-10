/**
 * QuestPanel定数
 *
 * 依頼パネルのレイアウトと表示に関する定数を定義する。
 * 設計文書: docs/tasks/atelier-guild-rank-phaser/TASK-0214.md
 */

/**
 * レイアウト定数
 */
export const QuestPanelLayout = {
  /** パネル幅 */
  WIDTH: 400,
  /** パネル高さ */
  HEIGHT: 500,
  /** 内部パディング */
  PADDING: 15,

  // セクション高さ
  /** ヘッダーセクション高さ */
  HEADER_HEIGHT: 60,
  /** 報酬セクション高さ */
  REWARD_HEIGHT: 80,
  /** 必要アイテムセクション高さ */
  REQUIREMENT_HEIGHT: 200,
  /** 進捗セクション高さ */
  PROGRESS_HEIGHT: 60,
} as const;

/**
 * 難易度カラー
 */
export const QuestDifficultyColors: Record<string, number> = {
  easy: 0x00aa00,
  normal: 0x0088ff,
  hard: 0xaa00ff,
  expert: 0xff4400,
};
