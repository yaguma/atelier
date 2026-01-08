/**
 * SceneManager実装
 *
 * シーン遷移を管理するマネージャー。
 * シングルトンパターンで実装し、アプリケーション全体で一貫した遷移管理を行う。
 * 設計文書: docs/design/atelier-guild-rank-phaser/core-systems.md
 */

import Phaser from 'phaser';

/**
 * Phaser.Scenes.SceneManagerへの型エイリアス
 * このファイル内のSceneManagerクラスとの名前衝突を避けるため
 */
type PhaserSceneManager = Phaser.Scenes.SceneManager;
import type { ISceneManager } from './ISceneManager';
import type { SceneKey } from '../config/SceneKeys';
import {
  TransitionConfig,
  DefaultTransitions,
  SceneTransitionData,
  getDefaultTransition,
  getOverlayTransition,
} from './SceneTransition';
import { EventBus } from '../events/EventBus';

/**
 * 履歴の最大保持数
 */
const MAX_HISTORY_SIZE = 50;

/**
 * シーンマネージャー実装クラス
 *
 * シーン遷移を一元管理し、以下の機能を提供：
 * - シーン間の遷移（通常遷移）
 * - オーバーレイシーンの表示・非表示
 * - 遷移履歴の管理
 * - 遷移アニメーションの制御
 */
export class SceneManager implements ISceneManager {
  /**
   * シングルトンインスタンス
   */
  private static instance: SceneManager | null = null;

  /**
   * Phaserゲームインスタンス
   */
  private game: Phaser.Game | null = null;

  /**
   * 現在のシーンキー
   */
  private currentScene: SceneKey | null = null;

  /**
   * 遷移履歴
   */
  private history: SceneTransitionData[] = [];

  /**
   * 遷移中フラグ
   */
  private transitioning = false;

  /**
   * 開いているオーバーレイのセット
   */
  private openOverlaysSet: Set<SceneKey> = new Set();

  /**
   * EventBus参照
   */
  private eventBus: EventBus;

  /**
   * プライベートコンストラクタ（シングルトン）
   */
  private constructor() {
    this.eventBus = EventBus.getInstance();
  }

  /**
   * シングルトンインスタンスを取得
   */
  public static getInstance(): SceneManager {
    if (!SceneManager.instance) {
      SceneManager.instance = new SceneManager();
    }
    return SceneManager.instance;
  }

  /**
   * シングルトンインスタンスをリセット（テスト用）
   */
  public static resetInstance(): void {
    if (SceneManager.instance) {
      SceneManager.instance.history = [];
      SceneManager.instance.openOverlaysSet.clear();
      SceneManager.instance.currentScene = null;
      SceneManager.instance.transitioning = false;
      SceneManager.instance.game = null;
    }
    SceneManager.instance = null;
  }

  /**
   * Phaserゲームインスタンスを設定
   * @param game Phaserゲームインスタンス
   */
  public setGame(game: Phaser.Game): void {
    this.game = game;
  }

  /**
   * Phaserゲームインスタンスを取得
   */
  public getGame(): Phaser.Game | null {
    return this.game;
  }

  // =====================================================
  // ISceneManager実装 - 状態取得
  // =====================================================

  /**
   * 現在のシーンキーを取得
   */
  getCurrentScene(): SceneKey | null {
    return this.currentScene;
  }

  /**
   * 遷移中かどうかを取得
   */
  isTransitioning(): boolean {
    return this.transitioning;
  }

  // =====================================================
  // ISceneManager実装 - 通常遷移
  // =====================================================

  /**
   * シーンに遷移する
   */
  async goTo(
    sceneKey: SceneKey,
    data?: Record<string, unknown>,
    transition: TransitionConfig = getDefaultTransition()
  ): Promise<void> {
    if (this.transitioning) {
      // 遷移中は新しい遷移を無視
      return;
    }

    const from = this.currentScene;
    this.transitioning = true;

    try {
      // 遷移開始イベント発火
      this.eventBus.emit('scene:transition:start', { from, to: sceneKey });

      // 履歴に追加
      this.addToHistory(from, sceneKey, transition, data);

      // 遷移実行
      await this.performTransition(from, sceneKey, data, transition);

      this.currentScene = sceneKey;

      // 遷移完了イベント発火
      this.eventBus.emit('scene:transition:complete', { from, to: sceneKey });
    } finally {
      this.transitioning = false;
    }
  }

  /**
   * シーンを置き換える（履歴に残さない）
   */
  async replace(
    sceneKey: SceneKey,
    data?: Record<string, unknown>,
    transition: TransitionConfig = getDefaultTransition()
  ): Promise<void> {
    if (this.transitioning) {
      return;
    }

    const from = this.currentScene;
    this.transitioning = true;

    try {
      // 遷移開始イベント発火
      this.eventBus.emit('scene:transition:start', { from, to: sceneKey });

      // 履歴には追加しない（replace）

      // 遷移実行
      await this.performTransition(from, sceneKey, data, transition);

      this.currentScene = sceneKey;

      // 遷移完了イベント発火
      this.eventBus.emit('scene:transition:complete', { from, to: sceneKey });
    } finally {
      this.transitioning = false;
    }
  }

  /**
   * 前のシーンに戻る
   */
  async goBack(transition: TransitionConfig = getDefaultTransition()): Promise<boolean> {
    if (this.history.length === 0) {
      return false;
    }

    const lastTransition = this.history.pop()!;

    // 戻り先がnullの場合は戻れない
    if (!lastTransition.from) {
      return false;
    }

    await this.replace(lastTransition.from, lastTransition.data, transition);
    return true;
  }

  // =====================================================
  // ISceneManager実装 - オーバーレイ管理
  // =====================================================

  /**
   * オーバーレイシーンを開く
   */
  async openOverlay(
    sceneKey: SceneKey,
    data?: Record<string, unknown>,
    transition: TransitionConfig = getOverlayTransition()
  ): Promise<void> {
    if (!this.game || this.openOverlaysSet.has(sceneKey)) {
      return;
    }

    const scenePlugin = this.game.scene as PhaserSceneManager;

    // 現在のシーンを一時停止
    if (this.currentScene && this.openOverlaysSet.size === 0) {
      scenePlugin.pause(this.currentScene);
    }

    // オーバーレイを開始（runはSceneManagerで利用可能）
    scenePlugin.run(sceneKey, data);
    this.openOverlaysSet.add(sceneKey);

    // フェードイン（Phaserシーンがアクティブになった後）
    if (transition.type === 'fade' && transition.duration > 0) {
      const overlayScene = scenePlugin.getScene(sceneKey);
      if (overlayScene) {
        await this.fadeIn(overlayScene, transition.duration);
      }
    }

    // オーバーレイ開始イベント発火
    this.eventBus.emit('scene:overlay:opened', { sceneKey });
  }

  /**
   * オーバーレイシーンを閉じる
   */
  async closeOverlay(
    sceneKey: SceneKey,
    transition: TransitionConfig = getOverlayTransition()
  ): Promise<void> {
    if (!this.game || !this.openOverlaysSet.has(sceneKey)) {
      return;
    }

    const scenePlugin = this.game.scene as PhaserSceneManager;

    // フェードアウト
    if (transition.type === 'fade' && transition.duration > 0) {
      const overlayScene = scenePlugin.getScene(sceneKey);
      if (overlayScene) {
        await this.fadeOut(overlayScene, transition.duration);
      }
    }

    // オーバーレイを停止
    scenePlugin.stop(sceneKey);
    this.openOverlaysSet.delete(sceneKey);

    // 他にオーバーレイがなければ現在のシーンを再開
    if (this.currentScene && this.openOverlaysSet.size === 0) {
      scenePlugin.resume(this.currentScene);
    }

    // オーバーレイ終了イベント発火
    this.eventBus.emit('scene:overlay:closed', { sceneKey });
  }

  /**
   * すべてのオーバーレイを閉じる
   */
  async closeAllOverlays(): Promise<void> {
    const overlays = [...this.openOverlaysSet];
    for (const sceneKey of overlays) {
      await this.closeOverlay(sceneKey);
    }
  }

  /**
   * オーバーレイが開いているかチェック
   */
  isOverlayOpen(sceneKey: SceneKey): boolean {
    return this.openOverlaysSet.has(sceneKey);
  }

  /**
   * 開いているオーバーレイ一覧を取得
   */
  getOpenOverlays(): SceneKey[] {
    return [...this.openOverlaysSet];
  }

  // =====================================================
  // ISceneManager実装 - 履歴管理
  // =====================================================

  /**
   * シーン遷移履歴を取得
   */
  getHistory(): SceneTransitionData[] {
    return [...this.history];
  }

  /**
   * 履歴をクリア
   */
  clearHistory(): void {
    this.history = [];
  }

  /**
   * 戻れるかどうかをチェック
   */
  canGoBack(): boolean {
    return this.history.length > 0 && this.history[this.history.length - 1].from !== null;
  }

  // =====================================================
  // プライベートメソッド
  // =====================================================

  /**
   * 履歴に追加
   */
  private addToHistory(
    from: SceneKey | null,
    to: SceneKey,
    transition: TransitionConfig,
    data?: Record<string, unknown>
  ): void {
    this.history.push({
      from,
      to,
      transition,
      data,
      timestamp: Date.now(),
    });

    // 履歴サイズ制限
    if (this.history.length > MAX_HISTORY_SIZE) {
      this.history.shift();
    }
  }

  /**
   * 遷移を実行
   */
  private async performTransition(
    from: SceneKey | null,
    to: SceneKey,
    data?: Record<string, unknown>,
    transition?: TransitionConfig
  ): Promise<void> {
    if (!this.game) {
      // ゲームインスタンスがない場合は状態のみ更新
      return;
    }

    const scenePlugin = this.game.scene as PhaserSceneManager;

    if (transition?.type === 'fade' && transition.duration > 0) {
      // フェードアウト
      if (from) {
        const currentScene = scenePlugin.getScene(from);
        if (currentScene) {
          await this.fadeOut(currentScene, transition.duration / 2);
        }
      }

      // シーン切り替え
      if (from) {
        scenePlugin.stop(from);
      }
      scenePlugin.start(to, data);

      // フェードイン
      const newScene = scenePlugin.getScene(to);
      if (newScene) {
        await this.fadeIn(newScene, transition.duration / 2);
      }
    } else {
      // 即時遷移
      if (from) {
        scenePlugin.stop(from);
      }
      scenePlugin.start(to, data);
    }
  }

  /**
   * フェードアウト
   */
  private fadeOut(scene: Phaser.Scene, duration: number): Promise<void> {
    return new Promise(resolve => {
      if (!scene.cameras || !scene.cameras.main) {
        resolve();
        return;
      }
      scene.cameras.main.fadeOut(duration, 0, 0, 0);
      scene.cameras.main.once('camerafadeoutcomplete', () => resolve());
    });
  }

  /**
   * フェードイン
   */
  private fadeIn(scene: Phaser.Scene, duration: number): Promise<void> {
    return new Promise(resolve => {
      if (!scene.cameras || !scene.cameras.main) {
        resolve();
        return;
      }
      scene.cameras.main.fadeIn(duration, 0, 0, 0);
      scene.cameras.main.once('camerafadeincomplete', () => resolve());
    });
  }
}
