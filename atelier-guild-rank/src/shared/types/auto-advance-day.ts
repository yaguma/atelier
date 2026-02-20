/**
 * auto-advance-day.ts - 自動日進行処理の型定義
 *
 * TASK-0107: GameFlowManager - processAPOverflow()メソッド追加
 *
 * AP超過時の自動日進行処理結果を定義する。
 * 設計文書: docs/design/free-phase-navigation/interfaces.ts
 * 要件: REQ-003, REQ-003-02, REQ-003-04
 */

// =============================================================================
// 自動日進行結果
// =============================================================================

/**
 * 自動日進行処理結果
 *
 * processAPOverflow()の戻り値。消費日数分のendDay()実行結果を含む。
 * 🔵 信頼性: REQ-003-02・REQ-003-04・ヒアリングQ10「既存処理を維持」より
 */
export interface IAutoAdvanceDayResult {
  /** 消費した日数 */
  readonly daysAdvanced: number;
  /** 新しい現在日 */
  readonly newCurrentDay: number;
  /** 新しい残り日数 */
  readonly newRemainingDays: number;
  /** 新しいAP */
  readonly newActionPoints: number;
  /** ゲームオーバーになったか */
  readonly isGameOver: boolean;
}
