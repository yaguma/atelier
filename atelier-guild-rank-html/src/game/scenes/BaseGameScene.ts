/**
 * BaseGameScene基底クラス
 *
 * すべてのゲームシーンの基底クラス。
 * 共通機能（EventBus連携、ライフサイクル管理、クリーンアップ）を提供する。
 * 設計文書: docs/design/atelier-guild-rank-phaser/core-systems.md
 */

import Phaser from 'phaser';
import type UIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin';
import { EventBus } from '../events/EventBus';
import type { SceneKey } from '../config/SceneKeys';

/**
 * シーン初期化データの型
 */
export interface SceneInitData {
  [key: string]: unknown;
}

/**
 * BaseGameScene基底クラス
 *
 * Phaserシーンを拡張し、以下の機能を提供：
 * - EventBusへの参照
 * - rexUIプラグインへの参照
 * - イベント購読の自動クリーンアップ
 * - ライフサイクルフック
 * - シーン遷移ユーティリティ
 *
 * @example
 * ```typescript
 * class TitleScene extends BaseGameScene {
 *   constructor() {
 *     super('TitleScene');
 *   }
 *
 *   protected onInit(): void {
 *     // 初期化処理
 *   }
 *
 *   protected onPreload(): void {
 *     // アセット読み込み
 *   }
 *
 *   protected onCreate(): void {
 *     // UI構築
 *   }
 *
 *   protected setupEventListeners(): void {
 *     this.subscribe(
 *       this.eventBus.onVoid('ui:newGame:clicked', () => {
 *         this.goToScene('MainScene');
 *       })
 *     );
 *   }
 * }
 * ```
 */
export abstract class BaseGameScene extends Phaser.Scene {
  /**
   * rexUIプラグイン参照
   */
  protected rexUI!: UIPlugin;

  /**
   * EventBus参照
   */
  protected eventBus: EventBus;

  /**
   * 購読解除関数リスト（自動クリーンアップ用）
   */
  private unsubscribers: (() => void)[] = [];

  /**
   * シーンが初期化済みかどうか
   */
  private _isInitialized = false;

  /**
   * コンストラクタ
   * @param key シーンキー
   */
  constructor(key: SceneKey | string) {
    super({ key });
    this.eventBus = EventBus.getInstance();
  }

  /**
   * シーンが初期化済みかどうか
   */
  get isInitialized(): boolean {
    return this._isInitialized;
  }

  // =====================================================
  // Phaserライフサイクルメソッド
  // =====================================================

  /**
   * Phaserライフサイクル: 初期化
   * シーン開始時に最初に呼ばれる
   */
  init(data?: SceneInitData): void {
    this._isInitialized = false;
    this.onInit(data);
  }

  /**
   * Phaserライフサイクル: プリロード
   * アセットの読み込みを行う
   */
  preload(): void {
    this.onPreload();
  }

  /**
   * Phaserライフサイクル: 作成
   * シーンのUI構築を行う
   */
  create(data?: SceneInitData): void {
    // rexUIプラグイン取得
    this.rexUI = this.plugins.get('rexUI') as UIPlugin;

    // イベント購読セットアップ
    this.setupEventListeners();

    // サブクラスのcreate処理
    this.onCreate(data);

    // 初期化完了
    this._isInitialized = true;

    // シーン準備完了イベント発火
    this.eventBus.emitVoid('scene:ready');
  }

  /**
   * Phaserライフサイクル: 更新
   * 毎フレーム呼ばれる
   */
  update(time: number, delta: number): void {
    this.onUpdate(time, delta);
  }

  /**
   * シーン終了時のクリーンアップ
   * イベント購読解除などを行う
   */
  shutdown(): void {
    // シーン終了イベント発火
    this.eventBus.emitVoid('scene:shutdown');

    // 購読解除
    this.cleanup();

    // サブクラスのクリーンアップ処理
    this.onShutdown();

    this._isInitialized = false;
  }

  // =====================================================
  // 抽象メソッド（サブクラスで必ず実装）
  // =====================================================

  /**
   * 初期化処理
   * @param data シーン初期化データ
   */
  protected abstract onInit(data?: SceneInitData): void;

  /**
   * アセット読み込み処理
   */
  protected abstract onPreload(): void;

  /**
   * UI構築処理
   * @param data シーン初期化データ
   */
  protected abstract onCreate(data?: SceneInitData): void;

  /**
   * イベントリスナー設定
   * subscribe()を使ってイベント購読を登録する
   */
  protected abstract setupEventListeners(): void;

  // =====================================================
  // オプショナルフック（サブクラスで必要に応じてオーバーライド）
  // =====================================================

  /**
   * 毎フレーム更新処理
   * @param _time ゲーム開始からの経過時間（ミリ秒）
   * @param _delta 前フレームからの経過時間（ミリ秒）
   */
  protected onUpdate(_time: number, _delta: number): void {
    // デフォルトは何もしない
  }

  /**
   * シーン終了時のクリーンアップ処理
   */
  protected onShutdown(): void {
    // デフォルトは何もしない
  }

  // =====================================================
  // ユーティリティメソッド
  // =====================================================

  /**
   * イベント購読を登録し、自動クリーンアップ対象に追加
   * @param unsubscriber 購読解除関数
   */
  protected subscribe(unsubscriber: () => void): void {
    this.unsubscribers.push(unsubscriber);
  }

  /**
   * すべての購読を解除
   */
  protected cleanup(): void {
    for (const unsubscribe of this.unsubscribers) {
      unsubscribe();
    }
    this.unsubscribers = [];
  }

  /**
   * 登録されている購読数を取得（テスト用）
   */
  protected getSubscriptionCount(): number {
    return this.unsubscribers.length;
  }

  /**
   * シーン遷移
   * @param key 遷移先シーンキー
   * @param data シーン初期化データ
   */
  protected goToScene(key: SceneKey | string, data?: SceneInitData): void {
    this.scene.start(key, data);
  }

  /**
   * オーバーレイシーンを開く
   * 現在のシーンを一時停止し、オーバーレイを表示
   * @param key オーバーレイシーンキー
   * @param data シーン初期化データ
   */
  protected openOverlay(key: SceneKey | string, data?: SceneInitData): void {
    this.scene.launch(key, data);
    this.scene.pause();
  }

  /**
   * オーバーレイシーンを閉じる
   * オーバーレイを停止し、現在のシーンを再開
   * @param key オーバーレイシーンキー
   */
  protected closeOverlay(key: SceneKey | string): void {
    this.scene.stop(key);
    this.scene.resume();
  }

  /**
   * シーン間でデータを受け渡す
   * registry（グローバルデータストア）を使用
   * @param key データキー
   * @param value データ値
   */
  protected setRegistryData<T>(key: string, value: T): void {
    this.registry.set(key, value);
  }

  /**
   * レジストリからデータを取得
   * @param key データキー
   * @returns データ値
   */
  protected getRegistryData<T>(key: string): T | undefined {
    return this.registry.get(key) as T | undefined;
  }
}
