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
  // biome-ignore lint/suspicious/noExplicitAny: rexUIプラグインは型定義が複雑なため、anyで扱う
  protected rexUI: any;

  /**
   * コンストラクタ
   *
   * @param scene - Phaserシーンインスタンス
   * @param x - X座標
   * @param y - Y座標
   * @throws {Error} sceneがnullまたはundefinedの場合
   * @throws {Error} scene.add.containerが利用できない場合
   * @throws {Error} x, yが有限数でない場合（NaN、Infinityなど）
   */
  constructor(scene: Phaser.Scene, x: number, y: number) {
    // 🟡 入力値検証: sceneの存在確認
    // TDDのGreenフェーズでは最小実装が目標だが、コードレビューで推奨されたため追加
    if (!scene) {
      throw new Error('BaseComponent: scene is required');
    }

    // 🟡 入力値検証: scene.add.containerの利用可能性確認
    // Phaserシーンが正しく初期化されていることを確認
    if (!scene.add || !scene.add.container) {
      throw new Error(
        'BaseComponent: scene.add.container is not available. Ensure the scene is properly initialized.',
      );
    }

    // 🟡 座標の検証: 有限数であることを確認
    // NaN、Infinityなどの不正な値を検出
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      throw new Error(
        `BaseComponent: Invalid position: x=${x}, y=${y}. Position must be finite numbers.`,
      );
    }

    this.scene = scene;

    // 🟡 rexUIプラグインへの参照を設定
    // rexUIはオプショナルなので、undefinedでも警告のみ
    // @ts-expect-error - rexUIはプラグインなので型定義がないため、anyで扱う
    this.rexUI = scene.rexUI;

    // rexUIがundefinedの場合は警告を出力
    if (!this.rexUI) {
      console.warn(
        'BaseComponent: rexUI plugin is not initialized. Some features may not work properly.',
      );
    }

    // 🔵 コンテナの作成
    // 指定された座標でPhaserのコンテナを作成
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
