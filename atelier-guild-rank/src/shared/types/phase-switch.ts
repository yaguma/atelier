/**
 * phase-switch.ts - フェーズ切り替え関連の型定義
 *
 * TASK-0106: GameFlowManager - switchPhase()メソッド追加
 *
 * フェーズ自由遷移に必要なリクエスト・レスポンス型を定義する。
 * 設計文書: docs/design/free-phase-navigation/interfaces.ts
 * 要件: REQ-001, REQ-001-01〜REQ-001-03
 */

import type { GamePhase } from './common';

// =============================================================================
// フェーズ切り替え失敗理由
// =============================================================================

/** フェーズ切り替えが失敗した理由 */
export const PhaseSwitchFailureReason = {
  /** ユーザーが中断確認をキャンセルした */
  USER_CANCELLED: 'USER_CANCELLED',
  /** 進行中セッションの中断が拒否された */
  SESSION_ABORT_REJECTED: 'SESSION_ABORT_REJECTED',
} as const;

export type PhaseSwitchFailureReason =
  (typeof PhaseSwitchFailureReason)[keyof typeof PhaseSwitchFailureReason];

// =============================================================================
// フェーズ切り替えリクエスト
// =============================================================================

/**
 * フェーズ切り替えリクエスト
 *
 * PhaseTabUI等からswitchPhase()に渡すリクエストデータ。
 */
export interface IPhaseSwitchRequest {
  /** 遷移先フェーズ */
  readonly targetPhase: GamePhase;
  /** 進行中セッションを強制中断するか（デフォルト: false） */
  readonly forceAbort?: boolean;
}

// =============================================================================
// フェーズ切り替え結果
// =============================================================================

/**
 * フェーズ切り替え結果
 *
 * switchPhase()の戻り値。成功・失敗と遷移前後のフェーズ情報を含む。
 */
export interface IPhaseSwitchResult {
  /** 切り替え成功したか */
  readonly success: boolean;
  /** 遷移前のフェーズ */
  readonly previousPhase: GamePhase;
  /** 遷移後のフェーズ（失敗時は遷移前と同じ） */
  readonly newPhase: GamePhase;
  /** 失敗理由（成功時はundefined） */
  readonly failureReason?: PhaseSwitchFailureReason;
}
