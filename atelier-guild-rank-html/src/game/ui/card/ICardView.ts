/**
 * カードビューインターフェース定義
 *
 * カードの視覚的表現を担当するコンポーネントのインターフェースを定義する。
 * 設計文書: docs/design/atelier-guild-rank-phaser/ui-design/overview.md
 */

import Phaser from 'phaser';
import { Card } from '@domain/card/Card';
import { CardState } from './CardState';
import { CardSizeType } from './CardConstants';

/**
 * カードビュー作成オプション
 */
export interface CardViewOptions {
  /** X座標 */
  x: number;
  /** Y座標 */
  y: number;
  /** カードデータ */
  card: Card;
  /** カードサイズ（デフォルト: STANDARD） */
  size?: CardSizeType;
  /** 初期状態（デフォルト: normal） */
  state?: CardState;
  /** インタラクティブかどうか（デフォルト: true） */
  interactive?: boolean;
  /** クリック時コールバック */
  onClick?: (card: Card) => void;
  /** ホバー時コールバック */
  onHover?: (card: Card, isHovering: boolean) => void;
}

/**
 * カードビューインターフェース
 *
 * カードの描画と状態管理を担当する。
 * Phaserのコンテナをラップし、統一的なAPIを提供する。
 */
export interface ICardView {
  /** Phaserコンテナへの参照（読み取り専用） */
  readonly container: Phaser.GameObjects.Container;

  /** カードデータへの参照（読み取り専用） */
  readonly card: Card;

  // ========================================
  // 状態管理
  // ========================================

  /**
   * 現在の状態を取得する
   * @returns 現在のカード状態
   */
  getState(): CardState;

  /**
   * 状態を設定する
   * @param state 新しいカード状態
   */
  setState(state: CardState): void;

  // ========================================
  // 表示更新
  // ========================================

  /**
   * カードデータを更新し、表示を再描画する
   * @param card 新しいカードデータ
   */
  update(card: Card): void;

  /**
   * 位置を設定する
   * @param x X座標
   * @param y Y座標
   */
  setPosition(x: number, y: number): void;

  /**
   * スケールを設定する
   * @param scale スケール値（1が標準）
   */
  setScale(scale: number): void;

  /**
   * 透明度を設定する
   * @param alpha 透明度（0-1）
   */
  setAlpha(alpha: number): void;

  // ========================================
  // インタラクション
  // ========================================

  /**
   * インタラクティブ状態を設定する
   * @param enabled true: インタラクション有効、false: 無効
   */
  setInteractive(enabled: boolean): void;

  /**
   * 選択状態を設定する
   * @param selected true: 選択中、false: 非選択
   */
  setSelected(selected: boolean): void;

  // ========================================
  // ライフサイクル
  // ========================================

  /**
   * リソースを破棄する
   */
  destroy(): void;
}
