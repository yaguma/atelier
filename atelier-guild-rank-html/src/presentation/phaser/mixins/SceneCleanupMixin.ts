import Phaser from 'phaser';
import { DisposableManager, IDisposable } from '../utils/DisposableManager';
import { EventListenerManager } from '../utils/EventListenerManager';

/**
 * シーンクリーンアップ機能を持つシーンのインターフェース
 */
export interface SceneCleanupCapable {
  disposables: DisposableManager;
  eventListeners: EventListenerManager;
  registerDisposable(disposable: IDisposable): void;
  cleanupScene(): void;
}

/**
 * シーンクリーンアップミックスインを適用
 *
 * @param scene - 対象のPhaserシーン
 * @returns クリーンアップ機能が追加されたシーン
 *
 * @example
 * ```typescript
 * class MyScene extends Phaser.Scene {
 *   constructor() {
 *     super('MyScene');
 *   }
 *
 *   create() {
 *     applySceneCleanupMixin(this);
 *     // this.disposables と this.eventListeners が使用可能に
 *   }
 * }
 * ```
 */
export function applySceneCleanupMixin<T extends Phaser.Scene>(
  scene: T
): T & SceneCleanupCapable {
  const enhanced = scene as T & SceneCleanupCapable;

  enhanced.disposables = new DisposableManager();
  enhanced.eventListeners = new EventListenerManager();

  // DisposableManagerにEventListenerManagerを登録
  enhanced.disposables.register(enhanced.eventListeners);

  enhanced.registerDisposable = function (disposable: IDisposable): void {
    this.disposables.register(disposable);
  };

  enhanced.cleanupScene = function (): void {
    const sceneKey = (this as Phaser.Scene).scene?.key ?? 'Unknown';
    console.log(`[SceneCleanup] ${sceneKey} - Cleaning up scene...`);

    // 全Tweenを停止
    (this as Phaser.Scene).tweens?.killAll();

    // 全Timerを停止
    (this as Phaser.Scene).time?.removeAllEvents();

    // 入力を無効化
    (this as Phaser.Scene).input?.removeAllListeners();

    // DisposableManagerで登録したリソースを破棄
    this.disposables.dispose();

    console.log(`[SceneCleanup] ${sceneKey} - Cleanup complete`);
  };

  // シーンシャットダウン時に自動クリーンアップ
  scene.events.once('shutdown', () => {
    enhanced.cleanupScene();
  });

  scene.events.once('destroy', () => {
    enhanced.cleanupScene();
  });

  return enhanced;
}

/**
 * クリーンアップ機能付きベースシーン
 *
 * 継承して使用することで自動的にクリーンアップ機能が追加される
 */
export abstract class CleanableScene extends Phaser.Scene implements SceneCleanupCapable {
  public disposables: DisposableManager;
  public eventListeners: EventListenerManager;

  constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
    super(config);
    this.disposables = new DisposableManager();
    this.eventListeners = new EventListenerManager();

    // DisposableManagerにEventListenerManagerを登録
    this.disposables.register(this.eventListeners);
  }

  /**
   * シーン初期化時にイベントハンドラを設定
   */
  init(): void {
    // シーンシャットダウン時に自動クリーンアップ
    this.events.once('shutdown', () => {
      this.cleanupScene();
    });

    this.events.once('destroy', () => {
      this.cleanupScene();
    });
  }

  /**
   * 破棄可能オブジェクトを登録
   */
  registerDisposable(disposable: IDisposable): void {
    this.disposables.register(disposable);
  }

  /**
   * シーンクリーンアップ
   */
  cleanupScene(): void {
    const sceneKey = this.scene?.key ?? 'Unknown';
    console.log(`[CleanableScene] ${sceneKey} - Cleaning up scene...`);

    // 全Tweenを停止
    this.tweens?.killAll();

    // 全Timerを停止
    this.time?.removeAllEvents();

    // 入力を無効化
    this.input?.removeAllListeners();

    // DisposableManagerで登録したリソースを破棄
    this.disposables.dispose();

    console.log(`[CleanableScene] ${sceneKey} - Cleanup complete`);
  }
}
