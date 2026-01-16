/**
 * utils.ts - ユーティリティ型定義
 *
 * 汎用的に使用できる型ユーティリティ
 */

// =============================================================================
// ユーティリティ型
// =============================================================================

/**
 * 深い読み取り専用型
 * オブジェクトのすべてのプロパティを再帰的に読み取り専用にする
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * 部分的に必須な型
 * 指定したキーのみを必須にする
 */
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Nullableを除外した型
 * すべてのフィールドからnull/undefinedを除外する
 */
export type NonNullableFields<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};
