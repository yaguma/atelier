/**
 * validation-helpers.ts - バリデーション用ヘルパー関数
 *
 * Issue #340: save-data-validator.tsのバリデーション関数分割
 *
 * @description
 * セーブデータバリデーションで使用する型ガード関数・エラー生成ヘルパー・定数を提供する。
 * すべての関数は純粋関数（Functional Core）として実装。
 */

import { GamePhase, GuildRank } from '@shared/types';
import type { IValidationError } from './types';

// =============================================================================
// 定数
// =============================================================================

/** 有効な GamePhase 値の集合 */
export const VALID_GAME_PHASES = new Set<string>(Object.values(GamePhase));

/** 有効な GuildRank 値の集合 */
export const VALID_GUILD_RANKS = new Set<string>(Object.values(GuildRank));

// =============================================================================
// 型ガード関数
// =============================================================================

/**
 * 値が非空文字列であるか判定する
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

/**
 * 値が0以上の整数であるか判定する
 */
export function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

/**
 * 値が0以上の数値であるか判定する
 */
export function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

/**
 * 値が1以上の正の整数であるか判定する
 */
export function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1;
}

/**
 * 値が文字列の配列であるか判定する
 */
export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === 'string');
}

/**
 * 値が有効な列挙値であるか判定する
 */
export function isValidEnumValue(value: unknown, validSet: Set<string>): boolean {
  return typeof value === 'string' && validSet.has(value);
}

// =============================================================================
// エラー生成ヘルパー
// =============================================================================

/**
 * バリデーションエラーを生成する
 */
export function createError(
  path: string,
  expected: string,
  actual: string,
  message: string,
): IValidationError {
  return { path, expected, actual, message };
}
