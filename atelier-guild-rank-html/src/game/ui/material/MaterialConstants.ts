/**
 * MaterialView定数定義
 *
 * 素材ビューのレイアウト、色、スタイルの定数を定義する。
 * 設計文書: docs/tasks/atelier-guild-rank-phaser/TASK-0199.md
 */

import { Quality } from '@domain/common/types';

/**
 * 素材ビューのレイアウト定数
 */
export const MaterialLayout = {
  /** アイコンサイズ */
  ICON_SIZE: 48,
  /** バッジサイズ */
  BADGE_SIZE: 20,

  /** コンパクト表示幅 */
  COMPACT_WIDTH: 60,
  /** コンパクト表示高さ */
  COMPACT_HEIGHT: 70,

  /** 詳細表示幅 */
  DETAIL_WIDTH: 200,
  /** 詳細表示高さ */
  DETAIL_HEIGHT: 60,

  /** 角丸半径 */
  BORDER_RADIUS: 6,
  /** 詳細モードの角丸半径 */
  DETAIL_BORDER_RADIUS: 8,
} as const;

/**
 * 品質ごとのカラー定義
 * Quality enum (E, D, C, B, A, S) に対応
 */
export const MaterialQualityColors: Record<Quality, number> = {
  [Quality.E]: 0x808080, // 灰色（普通）
  [Quality.D]: 0x00cc00, // 緑（やや良）
  [Quality.C]: 0x00ff00, // 明緑（良）
  [Quality.B]: 0x0080ff, // 青（優）
  [Quality.A]: 0xaa00ff, // 紫（秀）
  [Quality.S]: 0xffd700, // 金（極）
};

/**
 * 素材ビューの表示モード
 */
export type MaterialViewMode = 'compact' | 'detail';

/**
 * 素材選択肢グリッドのレイアウト定数
 * TASK-0220
 */
export const MaterialOptionLayout = {
  /** 列数 */
  COLUMNS: 3,
  /** アイテム幅 */
  ITEM_WIDTH: 180,
  /** アイテム高さ */
  ITEM_HEIGHT: 80,
  /** アイテム間隔 */
  ITEM_SPACING: 10,
  /** アイコンサイズ */
  ICON_SIZE: 48,
  /** パディング */
  PADDING: 10,
} as const;
