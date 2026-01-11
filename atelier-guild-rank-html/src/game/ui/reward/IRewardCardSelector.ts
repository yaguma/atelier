/**
 * RewardCardSelectorインターフェース定義
 *
 * TASK-0231: RewardCardSelector設計・実装
 * 依頼納品成功時の報酬カード選択UIのインターフェースを定義する。
 *
 * 設計文書: docs/tasks/atelier-guild-rank-phaser/TASK-0231.md
 */

import Phaser from 'phaser';
import type { Card } from '@domain/card/Card';

/**
 * RewardCardSelectorオプション
 */
export interface RewardCardSelectorOptions {
  /** シーン参照 */
  scene: Phaser.Scene;
  /** X座標 */
  x?: number;
  /** Y座標 */
  y?: number;
  /** 選択候補のカード */
  cards: Card[];
  /** ダイアログタイトル */
  title?: string;
  /** カード選択時のコールバック */
  onSelect?: (card: Card) => void;
  /** キャンセル時のコールバック */
  onCancel?: () => void;
}

/**
 * IRewardCardSelectorインターフェース
 *
 * 報酬カード選択ダイアログの操作を定義する。
 */
export interface IRewardCardSelector {
  /** Phaserコンテナ */
  readonly container: Phaser.GameObjects.Container;

  // =====================================================
  // カード設定
  // =====================================================

  /**
   * カードを設定する
   * @param cards 選択候補のカード配列
   */
  setCards(cards: Card[]): void;

  /**
   * 設定されているカードを取得する
   * @returns カード配列
   */
  getCards(): Card[];

  // =====================================================
  // 選択操作
  // =====================================================

  /**
   * 選択中のカードを取得する
   * @returns 選択中のカード（未選択時はnull）
   */
  getSelectedCard(): Card | null;

  /**
   * カードを選択する
   * @param card 選択するカード
   */
  selectCard(card: Card): void;

  // =====================================================
  // 操作
  // =====================================================

  /**
   * 選択を確定する
   */
  confirm(): void;

  /**
   * 選択をキャンセルする
   */
  cancel(): void;

  // =====================================================
  // 表示制御
  // =====================================================

  /**
   * ダイアログを表示する
   */
  show(): void;

  /**
   * ダイアログを非表示にする
   */
  hide(): void;

  /**
   * リソースを破棄する
   */
  destroy(): void;
}
