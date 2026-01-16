/**
 * Quality.ts - 品質値オブジェクト
 *
 * TASK-0010: 素材エンティティ・MaterialService実装
 *
 * @description
 * 品質（Quality）の比較・順序付けを行うユーティリティ関数群。
 * 品質はD, C, B, A, Sの5段階で表現される。
 *
 * @信頼性レベル 🔵
 * - note.mdに基づいた実装
 * - 品質の順序: D(1) < C(2) < B(3) < A(4) < S(5)
 */

import type { Quality } from '@shared/types';

/**
 * 【定数定義】: 品質の順序定義
 * 【実装方針】: 品質を数値にマッピングすることで、簡単に比較演算が可能になる
 * 【順序】: D=1, C=2, B=3, A=4, S=5
 * 🔵 信頼性レベル: note.md・設計文書に明記
 */
export const QUALITY_ORDER: Record<Quality, number> = {
  D: 1,
  C: 2,
  B: 3,
  A: 4,
  S: 5,
};

/**
 * 【定数定義】: 品質の配列（順序値からの逆引き用）
 * 【実装方針】: インデックス0〜4がD〜Sに対応
 * 🔵 信頼性レベル: note.md・設計文書に明記
 */
export const QUALITIES: readonly Quality[] = ['D', 'C', 'B', 'A', 'S'] as const;

/**
 * 【機能概要】: 順序値（1〜5）を品質（D〜S）に変換
 * 【実装方針】: 境界値チェック後、配列インデックスで変換
 * 【境界値】: 1未満は1に、5超過は5にクランプ
 * 🔵 信頼性レベル: note.md・設計文書に明記
 *
 * @param order - 順序値（1=D, 2=C, 3=B, 4=A, 5=S）
 * @returns 品質
 *
 * @example
 * ```typescript
 * orderToQuality(1); // => 'D'
 * orderToQuality(3); // => 'B'
 * orderToQuality(5); // => 'S'
 * ```
 */
export function orderToQuality(order: number): Quality {
  // 【境界値処理】: 1〜5の範囲にクランプ
  const clamped = Math.max(1, Math.min(5, order));
  // 【配列インデックス】: 1〜5 を 0〜4 に変換
  return QUALITIES[clamped - 1];
}

/**
 * 【機能概要】: 2つの品質を比較する
 * 【実装方針】: 品質を数値に変換して引き算で比較
 * 【戻り値】:
 *   - a > b の場合: 正の数
 *   - a == b の場合: 0
 *   - a < b の場合: 負の数
 * 🔵 信頼性レベル: note.md・設計文書に明記
 *
 * @param a - 比較する品質A
 * @param b - 比較する品質B
 * @returns 比較結果（正: a > b, 0: a == b, 負: a < b）
 *
 * @example
 * ```typescript
 * compareQuality('S', 'A'); // => 1 (S > A)
 * compareQuality('B', 'B'); // => 0 (B == B)
 * compareQuality('C', 'B'); // => -1 (C < B)
 * ```
 */
export function compareQuality(a: Quality, b: Quality): number {
  // 【比較処理】: 数値順序の引き算で比較結果を算出
  // 🔵 信頼性レベル: note.md・設計文書に明記
  return QUALITY_ORDER[a] - QUALITY_ORDER[b];
}

/**
 * 【機能概要】: より高い品質を返す
 * 【実装方針】: compareQuality()を使って比較し、高い方を返す
 * 【同値時】: aを返す（a >= bの場合にa）
 * 🔵 信頼性レベル: note.md・設計文書に明記
 *
 * @param a - 比較する品質A
 * @param b - 比較する品質B
 * @returns 高い方の品質（同じ場合はa）
 *
 * @example
 * ```typescript
 * getHigherQuality('A', 'C'); // => 'A'
 * getHigherQuality('B', 'B'); // => 'B'
 * getHigherQuality('D', 'S'); // => 'S'
 * ```
 */
export function getHigherQuality(a: Quality, b: Quality): Quality {
  // 【比較処理】: a >= bの場合にaを返す
  // 【同値時の動作】: a == bの場合もaを返す
  // 🔵 信頼性レベル: note.md・設計文書に明記
  return compareQuality(a, b) >= 0 ? a : b;
}

/**
 * 【機能概要】: より低い品質を返す
 * 【実装方針】: compareQuality()を使って比較し、低い方を返す
 * 【同値時】: aを返す（a <= bの場合にa）
 * 🔵 信頼性レベル: note.md・設計文書に明記
 *
 * @param a - 比較する品質A
 * @param b - 比較する品質B
 * @returns 低い方の品質（同じ場合はa）
 *
 * @example
 * ```typescript
 * getLowerQuality('A', 'C'); // => 'C'
 * getLowerQuality('B', 'B'); // => 'B'
 * getLowerQuality('D', 'S'); // => 'D'
 * ```
 */
export function getLowerQuality(a: Quality, b: Quality): Quality {
  // 【比較処理】: a <= bの場合にaを返す
  // 【同値時の動作】: a == bの場合もaを返す
  // 🔵 信頼性レベル: note.md・設計文書に明記
  return compareQuality(a, b) <= 0 ? a : b;
}
