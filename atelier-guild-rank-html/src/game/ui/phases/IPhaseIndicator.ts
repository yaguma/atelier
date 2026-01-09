/**
 * IPhaseIndicatorインターフェース
 *
 * フェーズインジケーターUIのインターフェース定義
 */

import Phaser from 'phaser';
import { GamePhase } from '../../../domain/common/types';

/**
 * PhaseIndicatorオプション
 */
export interface PhaseIndicatorOptions {
  /** X座標 */
  x?: number;
  /** Y座標 */
  y?: number;
  /** フェーズクリック時コールバック */
  onPhaseClick?: (phase: GamePhase) => void;
  /** クリック可能かどうか */
  clickable?: boolean;
}

/**
 * IPhaseIndicatorインターフェース
 */
export interface IPhaseIndicator {
  // ========================================
  // コンテナ参照
  // ========================================
  readonly container: Phaser.GameObjects.Container;

  // ========================================
  // 現在フェーズ
  // ========================================
  /**
   * 現在フェーズを設定
   * @param phase フェーズ
   * @param animate アニメーション有無
   */
  setCurrentPhase(phase: GamePhase, animate?: boolean): void;

  /**
   * 現在フェーズを取得
   */
  getCurrentPhase(): GamePhase;

  // ========================================
  // 完了フェーズ
  // ========================================
  /**
   * フェーズを完了としてマーク
   * @param phase フェーズ
   */
  markPhaseCompleted(phase: GamePhase): void;

  /**
   * 完了フェーズをクリア
   */
  clearCompletedPhases(): void;

  // ========================================
  // フェーズの有効/無効
  // ========================================
  /**
   * フェーズの有効/無効を設定
   * @param phase フェーズ
   * @param enabled 有効かどうか
   */
  setPhaseEnabled(phase: GamePhase, enabled: boolean): void;

  // ========================================
  // 表示制御
  // ========================================
  /**
   * 表示/非表示を設定
   * @param visible 表示するかどうか
   */
  setVisible(visible: boolean): void;

  // ========================================
  // 破棄
  // ========================================
  /**
   * コンポーネントを破棄
   */
  destroy(): void;
}
