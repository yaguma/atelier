/**
 * ap-overflow.ts - AP超過計算関連の型定義
 *
 * TASK-0103: APOverflowService実装
 *
 * AP超過計算の入力と結果の型を定義する。
 * 設計文書: docs/design/free-phase-navigation/interfaces.ts
 */

/**
 * AP超過計算入力
 *
 * @description
 * AP消費アクション実行時に、超過判定の入力として使用する。
 * maxAPはデフォルト値としてMAX_ACTION_POINTS(=3)を想定。
 */
export interface IAPConsumptionInput {
  /** 現在のAP残量 */
  readonly currentAP: number;
  /** 消費するAP */
  readonly consumeAP: number;
  /** AP上限（正の整数、デフォルト: MAX_ACTION_POINTS = 3） */
  readonly maxAP?: number;
}

/**
 * AP超過計算結果
 *
 * @description
 * calculateOverflow()の戻り値。
 * AP超過の有無、超過量、消費日数、翌日AP、残APを含む。
 */
export interface IAPOverflowResult {
  /** AP超過が発生するか */
  readonly hasOverflow: boolean;
  /** 超過APポイント数 */
  readonly overflowAP: number;
  /** 消費する日数 */
  readonly daysConsumed: number;
  /** 翌日開始時のAP（hasOverflow=trueの場合のみ有効、falseの場合は0） */
  readonly nextDayAP: number;
  /** 行動後の残りAP（超過なしの場合のみ意味あり） */
  readonly remainingAP: number;
}
