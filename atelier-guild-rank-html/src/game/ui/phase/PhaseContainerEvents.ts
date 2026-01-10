/**
 * PhaseContainerイベント定義
 *
 * フェーズコンテナが発火するイベントの型を定義する。
 * 設計文書: docs/tasks/atelier-guild-rank-phaser/TASK-0212.md
 */

import type { GamePhase } from '../../../domain/common/types';

/**
 * フェーズ完了イベントペイロード
 */
export interface PhaseCompletePayload {
  /** 完了したフェーズ */
  phase: GamePhase;
  /** フェーズの実行結果（フェーズ固有のデータ） */
  result?: unknown;
}

/**
 * フェーズキャンセルイベントペイロード
 */
export interface PhaseCancelPayload {
  /** キャンセルされたフェーズ */
  phase: GamePhase;
}

/**
 * フェーズアクションイベントペイロード
 */
export interface PhaseActionPayload {
  /** アクションが発生したフェーズ */
  phase: GamePhase;
  /** アクション名 */
  action: string;
  /** アクション固有のデータ */
  data?: unknown;
}

/**
 * フェーズエラーイベントペイロード
 */
export interface PhaseErrorPayload {
  /** エラーが発生したフェーズ */
  phase: GamePhase;
  /** エラー情報 */
  error: Error;
}

/**
 * PhaseContainerイベントマップ
 * EventBusに登録するイベント型
 */
export interface PhaseContainerEvents {
  /** フェーズ完了イベント */
  'phase:complete': PhaseCompletePayload;
  /** フェーズキャンセルイベント */
  'phase:cancel': PhaseCancelPayload;
  /** フェーズ内アクションイベント */
  'phase:action': PhaseActionPayload;
  /** フェーズエラーイベント */
  'phase:error': PhaseErrorPayload;
}
