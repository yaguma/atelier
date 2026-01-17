/**
 * 基底UIコンポーネント
 * TASK-0018 共通UIコンポーネント基盤
 *
 * @description
 * 全カスタムUIコンポーネントの共通基底クラス
 * Phaserシーン、コンテナ、rexUIプラグインへのアクセスを提供
 */

import type Phaser from 'phaser';

/**
 * 基底UIコンポーネント抽象クラス
 *
 * すべてのカスタムUIコンポーネントはこのクラスを継承し、
 * create()とdestroy()メソッドを実装する必要がある
 */
export abstract class BaseComponent {
  /** Phaserシーンへの参照 */
  protected scene: Phaser.Scene;

  /** UIを格納するコンテナ */
  protected container: Phaser.GameObjects.Container;

  /** rexUIプラグインへの参照 */
  protected rexUI: any;

  /**
   * コンストラクタ
   *
   * @param scene - Phaserシーンインスタンス
   * @param x - X座標
   * @param y - Y座標
   */
  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    // @ts-expect-error - rexUIはプラグインなので型定義がないため、anyで扱う
    this.rexUI = scene.rexUI;
    this.container = scene.add.container(x, y);
  }

  /**
   * コンポーネントの初期化処理
   * サブクラスで実装必須
   */
  abstract create(): void;

  /**
   * コンポーネントの破棄処理
   * サブクラスで実装必須
   */
  abstract destroy(): void;

  /**
   * 可視性を設定
   *
   * @param visible - true: 表示, false: 非表示
   * @returns this - メソッドチェーン用
   */
  setVisible(visible: boolean): this {
    this.container.setVisible(visible);
    return this;
  }

  /**
   * 位置を設定
   *
   * @param x - X座標
   * @param y - Y座標
   * @returns this - メソッドチェーン用
   */
  setPosition(x: number, y: number): this {
    this.container.setPosition(x, y);
    return this;
  }
}
