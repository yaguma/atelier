/**
 * DropZoneインターフェース
 * TASK-0042 カードドラッグ＆ドロップ機能
 *
 * @description
 * ドロップゾーンの定義。カードをドロップできる領域を表す。
 * 受け入れ判定ロジックとドロップ時の処理を定義する。
 */

import type Phaser from 'phaser';
import type { Card } from '../../../domain/entities/Card';

/**
 * ドロップゾーンの設定
 */
export interface DropZone {
  /** ゾーンの一意な識別子 */
  id: string;

  /** ドロップゾーンの矩形領域 */
  bounds: Phaser.Geom.Rectangle;

  /**
   * カードを受け入れるかの判定ロジック
   * @param card - 判定対象のカード
   * @returns 受け入れる場合はtrue
   */
  accepts: (card: Card) => boolean;

  /**
   * ドロップ成功時に実行する処理
   * @param card - ドロップされたカード
   */
  onDrop: (card: Card) => void;

  /**
   * ゾーンのハイライト用Graphics（オプション）
   * ドラッグ中に視覚的フィードバックを表示するために使用
   */
  highlight?: Phaser.GameObjects.Graphics;
}
