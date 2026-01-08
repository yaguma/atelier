/**
 * ISceneManagerインターフェース
 *
 * シーン遷移を管理するマネージャーのインターフェース。
 * 通常遷移とオーバーレイ遷移の両方をサポートする。
 * 設計文書: docs/design/atelier-guild-rank-phaser/core-systems.md
 */

import type { SceneKey } from '../config/SceneKeys';
import type { TransitionConfig, SceneTransitionData } from './SceneTransition';

/**
 * シーンマネージャーインターフェース
 *
 * シーン遷移を一元管理し、以下の機能を提供：
 * - シーン間の遷移（通常遷移）
 * - オーバーレイシーンの表示・非表示
 * - 遷移履歴の管理
 * - 遷移アニメーションの制御
 *
 * @example
 * ```typescript
 * const sceneManager = SceneManager.getInstance();
 *
 * // シーン遷移
 * await sceneManager.goTo(SceneKeys.MAIN);
 *
 * // オーバーレイを開く
 * await sceneManager.openOverlay(SceneKeys.SHOP);
 *
 * // 前のシーンに戻る
 * await sceneManager.goBack();
 * ```
 */
export interface ISceneManager {
  // =====================================================
  // 状態取得
  // =====================================================

  /**
   * 現在のシーンキーを取得
   * @returns 現在アクティブなシーンのキー
   */
  getCurrentScene(): SceneKey | null;

  /**
   * 遷移中かどうかを取得
   * @returns 遷移アニメーション中の場合true
   */
  isTransitioning(): boolean;

  // =====================================================
  // 通常遷移
  // =====================================================

  /**
   * シーンに遷移する
   *
   * 既存のシーンを停止し、新しいシーンを開始する。
   * 遷移は履歴に記録される。
   *
   * @param sceneKey 遷移先シーンのキー
   * @param data シーンに渡すデータ
   * @param transition 遷移アニメーション設定
   * @returns 遷移完了を待つPromise
   */
  goTo(
    sceneKey: SceneKey,
    data?: Record<string, unknown>,
    transition?: TransitionConfig
  ): Promise<void>;

  /**
   * シーンを置き換える
   *
   * 現在のシーンを新しいシーンで置き換える。
   * goToと異なり、履歴に記録されない（戻れない）。
   *
   * @param sceneKey 遷移先シーンのキー
   * @param data シーンに渡すデータ
   * @param transition 遷移アニメーション設定
   * @returns 遷移完了を待つPromise
   */
  replace(
    sceneKey: SceneKey,
    data?: Record<string, unknown>,
    transition?: TransitionConfig
  ): Promise<void>;

  /**
   * 前のシーンに戻る
   *
   * 履歴から前のシーンを取得し、遷移する。
   *
   * @param transition 遷移アニメーション設定
   * @returns 戻れた場合true、履歴がない場合false
   */
  goBack(transition?: TransitionConfig): Promise<boolean>;

  // =====================================================
  // オーバーレイ管理
  // =====================================================

  /**
   * オーバーレイシーンを開く
   *
   * 現在のシーンを一時停止し、オーバーレイを表示する。
   * 複数のオーバーレイを重ねて表示できる。
   *
   * @param sceneKey オーバーレイシーンのキー
   * @param data シーンに渡すデータ
   * @param transition 遷移アニメーション設定
   * @returns 表示完了を待つPromise
   */
  openOverlay(
    sceneKey: SceneKey,
    data?: Record<string, unknown>,
    transition?: TransitionConfig
  ): Promise<void>;

  /**
   * オーバーレイシーンを閉じる
   *
   * 指定のオーバーレイを非表示にし、
   * 他にオーバーレイがなければ下のシーンを再開する。
   *
   * @param sceneKey オーバーレイシーンのキー
   * @param transition 遷移アニメーション設定
   * @returns 非表示完了を待つPromise
   */
  closeOverlay(sceneKey: SceneKey, transition?: TransitionConfig): Promise<void>;

  /**
   * すべてのオーバーレイを閉じる
   *
   * 開いているすべてのオーバーレイを閉じ、
   * ベースシーンを再開する。
   *
   * @returns 完了を待つPromise
   */
  closeAllOverlays(): Promise<void>;

  /**
   * オーバーレイが開いているかチェック
   *
   * @param sceneKey チェックするシーンのキー
   * @returns 開いている場合true
   */
  isOverlayOpen(sceneKey: SceneKey): boolean;

  /**
   * 開いているオーバーレイ一覧を取得
   *
   * @returns 開いているオーバーレイのキー配列（表示順）
   */
  getOpenOverlays(): SceneKey[];

  // =====================================================
  // 履歴管理
  // =====================================================

  /**
   * シーン遷移履歴を取得
   *
   * @returns 遷移履歴の配列（古い順）
   */
  getHistory(): SceneTransitionData[];

  /**
   * 履歴をクリア
   *
   * 遷移履歴をすべて削除する。
   * 新規ゲーム開始時などに使用。
   */
  clearHistory(): void;

  /**
   * 戻れるかどうかをチェック
   *
   * @returns 履歴があり戻れる場合true
   */
  canGoBack(): boolean;
}
