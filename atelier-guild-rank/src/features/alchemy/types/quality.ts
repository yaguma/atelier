/**
 * quality.ts - 品質関連の型定義と定数
 *
 * TASK-0076: features/alchemy/types作成
 *
 * 調合機能で使用する品質閾値定数を定義する。
 * Quality型自体は@shared/typesで定義されているため再エクスポートする。
 */

import type { Quality } from '@shared/types';

/**
 * 品質スコア閾値
 * 調合時の素材品質スコアから品質ランクを決定するための閾値定義
 */
export const QUALITY_THRESHOLDS: Record<Quality, number> = {
  D: 0,
  C: 20,
  B: 40,
  A: 60,
  S: 80,
};
