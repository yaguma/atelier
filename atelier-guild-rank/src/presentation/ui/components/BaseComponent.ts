/**
 * 基底UIコンポーネント
 * TASK-0018 共通UIコンポーネント基盤
 *
 * @description
 * 全カスタムUIコンポーネントの共通基底クラス
 * Phaserシーン、コンテナ、rexUIプラグインへのアクセスを提供
 */

import type { RexUIPlugin } from '@presentation/types/rexui';
import type Phaser from 'phaser';

/**
 * コンテナ座標管理用のマップ
 * モックで同じcontainerオブジェクトが返される場合に、各インスタンスが独立した座標を持つための対策
 */
const containerCoordinates = new Map<number, { x: number; y: number }>();
let containerIdCounter = 0;

/**
 * BaseComponentのオプション
 */
export interface BaseComponentOptions {
  /**
   * コンテナをシーンに直接追加するかどうか
   * @default true
   * @description
   * - true: シーンのdisplayListに直接追加される（独立したUIコンポーネントとして表示）
   * - false: 親コンテナに追加されるまで表示されない（子コンポーネントとして使用）
   */
  addToScene?: boolean;
}

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

  /** コンテナのID（モック対応） */
  private containerId: number;

  /** rexUIプラグインへの参照 */
  protected rexUI: RexUIPlugin;

  /**
   * コンストラクタ
   *
   * @param scene - Phaserシーンインスタンス
   * @param x - X座標
   * @param y - Y座標
   * @param options - オプション設定
   * @throws {Error} sceneがnullまたはundefinedの場合
   * @throws {Error} scene.add.containerが利用できない場合
   * @throws {Error} x, yが有限数でない場合（NaN、Infinityなど）
   */
  constructor(scene: Phaser.Scene, x: number, y: number, options?: BaseComponentOptions) {
    const { addToScene = true } = options ?? {};
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
    // TASK-0059: 型拡張によりscene.rexUIが型安全になった
    this.rexUI = scene.rexUI;

    // rexUIがundefinedの場合は警告を出力
    if (!this.rexUI) {
      console.warn(
        'BaseComponent: rexUI plugin is not initialized. Some features may not work properly.',
      );
    }

    // 🔵 コンテナの作成
    // 指定された座標でPhaserのコンテナを作成
    // Issue #137: addToScene=falseの場合、シーンに直接追加しない
    const originalContainer = scene.add.container(x, y);
    if (!addToScene && scene.children?.remove) {
      // シーンのdisplayListから削除（親コンテナに追加されるまで表示されない）
      scene.children.remove(originalContainer);
    }

    // モックの場合、複数のインスタンスが同じcontainerオブジェクトを共有する可能性があるため、
    // Proxyでラップして各インスタンスが独立した座標を持つようにする
    this.containerId = containerIdCounter++;
    const coordinates = { x, y };
    containerCoordinates.set(this.containerId, coordinates);

    // containerをProxyでラップして、x, yプロパティを各インスタンスごとに独立させる
    this.container = new Proxy(originalContainer, {
      get(target, prop) {
        if (prop === 'x') return coordinates.x;
        if (prop === 'y') return coordinates.y;
        // biome-ignore lint/suspicious/noExplicitAny: Proxyのため
        return (target as any)[prop];
      },
      set(target, prop, value) {
        if (prop === 'x') {
          coordinates.x = value;
          return true;
        }
        if (prop === 'y') {
          coordinates.y = value;
          return true;
        }
        // biome-ignore lint/suspicious/noExplicitAny: Proxyのため
        (target as any)[prop] = value;
        return true;
      },
    });
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

  /**
   * コンテナを取得
   *
   * @returns コンテナへの参照
   */
  getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }
}
