/**
 * SidebarUI定数定義
 *
 * サイドバーUIのレイアウト、色、スタイルの定数を定義する。
 * 設計文書: docs/tasks/atelier-guild-rank-phaser/TASK-0205.md
 */

/**
 * サイドバータブ種別
 */
export type SidebarTab = 'quests' | 'inventory';

/**
 * インベントリフィルター種別 (TASK-0207)
 */
export type InventoryFilter = 'all' | 'material' | 'item' | 'artifact';

/**
 * サイドバーレイアウト定数
 */
export const SidebarLayout = {
  // 位置・サイズ
  X: 1000,
  Y: 80,
  WIDTH: 280,
  HEIGHT: 640,

  // パディング
  PADDING: 10,

  // タブ
  TAB_HEIGHT: 40,
  TAB_WIDTH: 130,

  // コンテンツエリア
  CONTENT_Y: 50,
  CONTENT_HEIGHT: 580,

  // リストアイテム
  ITEM_HEIGHT: 60,
  ITEM_SPACING: 5,
} as const;

/**
 * サイドバー色定数
 */
export const SidebarColors = {
  BACKGROUND: 0x1a1a2e,
  BACKGROUND_ALPHA: 0.95,
  TAB_ACTIVE: 0x4a4a8a,
  TAB_INACTIVE: 0x2a2a4a,
  BORDER: 0x4a4a6a,

  // リストアイテム
  ITEM_BACKGROUND: 0x2a2a4a,
  ITEM_HOVER: 0x3a3a5a,
  ITEM_SELECTED: 0x4a4a8a,
} as const;
