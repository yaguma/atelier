/**
 * IDeckViewインターフェース
 *
 * デッキビューUIのインターフェース定義
 */

import Phaser from 'phaser';

/**
 * DeckViewオプション
 */
export interface DeckViewOptions {
  /** X座標 */
  x?: number;
  /** Y座標 */
  y?: number;
  /** クリック時コールバック */
  onClick?: () => void;
}

/**
 * IDeckViewインターフェース
 */
export interface IDeckView {
  // ========================================
  // コンテナ参照
  // ========================================
  readonly container: Phaser.GameObjects.Container;

  // ========================================
  // 枚数管理
  // ========================================
  /**
   * 枚数を設定
   * @param count 枚数
   */
  setCount(count: number): void;

  /**
   * 枚数を取得
   */
  getCount(): number;

  // ========================================
  // アニメーション
  // ========================================
  /**
   * ドローアニメーション
   * @returns ドローされたカードのコンテナ
   */
  animateDraw(): Promise<Phaser.GameObjects.Container>;

  /**
   * シャッフルアニメーション
   */
  animateShuffle(): Promise<void>;

  /**
   * カード追加アニメーション
   */
  animateAddCard(): Promise<void>;

  // ========================================
  // インタラクション
  // ========================================
  /**
   * インタラクティブ状態を設定
   * @param enabled 有効かどうか
   */
  setInteractive(enabled: boolean): void;

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
