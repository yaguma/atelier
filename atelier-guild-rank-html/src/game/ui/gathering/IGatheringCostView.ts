/**
 * GatheringCostView インターフェース
 *
 * TASK-0221: GatheringCostView実装
 * 採取フェーズでのAPコスト表示コンポーネントのインターフェースを定義する
 */

import Phaser from 'phaser';

/**
 * GatheringCostViewのオプション
 */
export interface GatheringCostViewOptions {
  /** Phaserシーン */
  scene: Phaser.Scene;
  /** X座標 */
  x?: number;
  /** Y座標 */
  y?: number;
  /** 現在のAP */
  currentAP?: number;
  /** 最大AP */
  maxAP?: number;
}

/**
 * GatheringCostViewインターフェース
 */
export interface IGatheringCostView {
  /** コンテナ */
  readonly container: Phaser.GameObjects.Container;

  // AP設定
  /** 現在のAPと最大APを設定する */
  setCurrentAP(current: number, max: number): void;
  /** 必要APを設定する */
  setRequiredAP(cost: number): void;

  // 状態チェック
  /** APが足りているか判定する */
  canAfford(): boolean;
  /** 必要APを取得する */
  getRequiredAP(): number;

  // 表示制御
  /** 表示/非表示を切り替える */
  setVisible(visible: boolean): void;

  // 破棄
  /** コンポーネントを破棄する */
  destroy(): void;
}
