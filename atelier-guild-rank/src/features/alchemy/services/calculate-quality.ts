/**
 * calculate-quality.ts - 品質計算純粋関数
 *
 * TASK-0077: features/alchemy/services作成
 *
 * 素材の品質から調合結果の品質を計算する純粋関数。
 * QUALITY_THRESHOLDSに基づいてスコアから品質ランクを決定する。
 */

import { QUALITY_ORDER } from '@domain/value-objects/Quality';
import type { Quality } from '@shared/types';
import { QUALITY_THRESHOLDS } from '../types';

/**
 * 品質からスコアを取得する
 *
 * @param quality - 品質ランク
 * @returns 品質スコア（1〜5の範囲）
 */
function getQualityScore(quality: Quality): number {
  return QUALITY_ORDER[quality];
}

/**
 * スコアから品質ランクを決定する
 *
 * @param score - 品質スコア（1〜5の範囲の平均値）
 * @returns 品質ランク
 */
function scoreToQuality(score: number): Quality {
  // QUALITY_THRESHOLDSは「そのランクに到達するためのパーセンテージ」
  // スコア(1〜5)を0〜100にマッピング: (score - 1) / 4 * 100
  const percentage = ((score - 1) / 4) * 100;

  if (percentage >= QUALITY_THRESHOLDS.S) return 'S';
  if (percentage >= QUALITY_THRESHOLDS.A) return 'A';
  if (percentage >= QUALITY_THRESHOLDS.B) return 'B';
  if (percentage >= QUALITY_THRESHOLDS.C) return 'C';
  return 'D';
}

/**
 * 素材の品質から調合結果の品質を計算する
 *
 * 素材の品質スコアの平均値を算出し、QUALITY_THRESHOLDSに基づいて
 * 品質ランクを決定する。
 *
 * @param qualities - 素材の品質リスト
 * @returns 算出された品質ランク
 */
export function calculateQuality(qualities: readonly Quality[]): Quality {
  if (qualities.length === 0) {
    return 'D';
  }

  const totalScore = qualities.reduce((sum, q) => sum + getQualityScore(q), 0);
  const averageScore = totalScore / qualities.length;

  return scoreToQuality(averageScore);
}
