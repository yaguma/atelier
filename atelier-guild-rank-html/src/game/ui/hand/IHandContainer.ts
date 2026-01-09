/**
 * 手札コンテナインターフェース
 *
 * 手札表示コンテナのインターフェースを定義する。
 * 設計文書: docs/tasks/atelier-guild-rank-phaser/TASK-0195.md
 */

import Phaser from 'phaser';
import { Card } from '@domain/card/Card';
import { HandLayoutType } from './HandConstants';

/**
 * 手札コンテナ作成オプション
 */
export interface HandContainerOptions {
  /** X座標 */
  x?: number;
  /** Y座標 */
  y?: number;
  /** レイアウトタイプ */
  layoutType?: HandLayoutType;
  /** 最大表示カード数 */
  maxVisibleCards?: number;
  /** カード選択時コールバック */
  onCardSelect?: (card: Card, index: number) => void;
  /** カード選択解除時コールバック */
  onCardDeselect?: (card: Card, index: number) => void;
}

/**
 * 手札コンテナインターフェース
 *
 * 手札の表示と管理を担当するコンポーネント。
 * カードの追加・削除、選択状態の管理、レイアウトの切り替えなどを行う。
 */
export interface IHandContainer {
  // ========================================
  // コンテナ参照
  // ========================================

  /** Phaserコンテナへの参照（読み取り専用） */
  readonly container: Phaser.GameObjects.Container;

  // ========================================
  // 手札管理
  // ========================================

  /**
   * 手札を設定する（既存の手札は置き換えられる）
   * @param cards 設定するカードの配列
   */
  setCards(cards: Card[]): void;

  /**
   * カードを手札に追加する
   * @param card 追加するカード
   * @param animate アニメーションを実行するか（デフォルト: true）
   */
  addCard(card: Card, animate?: boolean): void;

  /**
   * カードを手札から削除する
   * @param cardOrIndex 削除するカードまたはインデックス
   * @param animate アニメーションを実行するか（デフォルト: true）
   */
  removeCard(cardOrIndex: Card | number, animate?: boolean): void;

  /**
   * 現在の手札を取得する
   * @returns カードの配列
   */
  getCards(): Card[];

  /**
   * 手札のカード数を取得する
   * @returns カードの枚数
   */
  getCardCount(): number;

  // ========================================
  // 選択管理
  // ========================================

  /**
   * 選択中のカードを取得する
   * @returns 選択中のカード、または選択なしの場合はnull
   */
  getSelectedCard(): Card | null;

  /**
   * 選択中のカードのインデックスを取得する
   * @returns 選択中のインデックス、または選択なしの場合は-1
   */
  getSelectedIndex(): number;

  /**
   * カードを選択する
   * @param cardOrIndex 選択するカードまたはインデックス
   */
  selectCard(cardOrIndex: Card | number): void;

  /**
   * 選択を解除する
   */
  deselectCard(): void;

  /**
   * 選択可能状態を設定する
   * @param selectable true: 選択可能、false: 選択不可
   */
  setSelectable(selectable: boolean): void;

  // ========================================
  // レイアウト
  // ========================================

  /**
   * レイアウトタイプを設定する
   * @param type レイアウトタイプ
   */
  setLayoutType(type: HandLayoutType): void;

  /**
   * 現在のレイアウトタイプを取得する
   * @returns 現在のレイアウトタイプ
   */
  getLayoutType(): HandLayoutType;

  /**
   * レイアウトを更新する
   */
  refresh(): void;

  // ========================================
  // 表示
  // ========================================

  /**
   * 表示・非表示を設定する
   * @param visible true: 表示、false: 非表示
   */
  setVisible(visible: boolean): void;

  /**
   * 位置を設定する
   * @param x X座標
   * @param y Y座標
   */
  setPosition(x: number, y: number): void;

  // ========================================
  // ライフサイクル
  // ========================================

  /**
   * リソースを破棄する
   */
  destroy(): void;
}
