/**
 * PhaseContainerインターフェース定義
 *
 * 各ゲームフェーズ（依頼受注、採取、調合、納品）のコンテナに共通する
 * インターフェースと設定型を定義する。
 * 設計文書: docs/tasks/atelier-guild-rank-phaser/TASK-0212.md
 */

import Phaser from 'phaser';
import { GamePhase } from '../../../domain/common/types';
import type { EventBus } from '../../events/EventBus';

/**
 * PhaseContainer設定
 */
export interface PhaseContainerConfig {
  /** シーン参照 */
  scene: Phaser.Scene;
  /** EventBus参照 */
  eventBus: EventBus;
  /** X座標（省略時は200） */
  x?: number;
  /** Y座標（省略時は150） */
  y?: number;
  /** 幅（省略時は800） */
  width?: number;
  /** 高さ（省略時は500） */
  height?: number;
}

/**
 * PhaseContainerインターフェース
 *
 * 各フェーズコンテナが実装すべきメソッドを定義する。
 */
export interface IPhaseContainer {
  // =====================================================
  // 識別
  // =====================================================

  /** このコンテナが担当するゲームフェーズ */
  readonly phase: GamePhase;

  /** Phaserコンテナオブジェクト */
  readonly container: Phaser.GameObjects.Container;

  // =====================================================
  // ライフサイクル
  // =====================================================

  /**
   * フェーズに入る
   * フェードインアニメーションと初期化処理を行う
   */
  enter(): Promise<void>;

  /**
   * フェーズから出る
   * フェードアウトアニメーションと終了処理を行う
   */
  exit(): Promise<void>;

  /**
   * 毎フレーム更新
   * @param delta 前フレームからの経過時間（ミリ秒）
   */
  update(delta: number): void;

  // =====================================================
  // 表示制御
  // =====================================================

  /**
   * 表示/非表示を設定
   * @param visible 表示するかどうか
   */
  setVisible(visible: boolean): void;

  /**
   * 有効/無効を設定
   * @param enabled 有効かどうか
   */
  setEnabled(enabled: boolean): void;

  // =====================================================
  // アクション
  // =====================================================

  /**
   * フェーズを完了できるかどうか
   * @returns 完了可能ならtrue
   */
  canComplete(): boolean;

  /**
   * フェーズを完了する
   * phase:completeイベントを発火する
   */
  complete(): void;

  /**
   * フェーズをキャンセルする
   * phase:cancelイベントを発火する
   */
  cancel(): void;

  // =====================================================
  // 破棄
  // =====================================================

  /**
   * コンテナを破棄する
   * イベントリスナーの解除とPhaserオブジェクトの破棄を行う
   */
  destroy(): void;
}
