/**
 * random.ts - ランダム関数ユーティリティ
 *
 * テスト可能性のため、Math.random()の直接使用を避け、
 * 差し替え可能なランダム関数を提供する。
 */

/** ランダム関数の型（0以上1未満の値を返す） */
export type RandomFn = () => number;

/** デフォルトのランダム関数（Math.random()ラッパー） */
export const defaultRandomFn: RandomFn = () => Math.random();
