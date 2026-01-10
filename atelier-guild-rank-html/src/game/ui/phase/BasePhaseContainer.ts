/**
 * BasePhaseContainer基底クラス
 *
 * 各ゲームフェーズ（依頼受注、採取、調合、納品）の基底コンテナクラス。
 * 共通のライフサイクルとイベント処理を提供する。
 * 設計文書: docs/tasks/atelier-guild-rank-phaser/TASK-0212.md
 */

import Phaser from 'phaser';
import { GamePhase } from '../../../domain/common/types';
import type { IPhaseContainer, PhaseContainerConfig } from './IPhaseContainer';
import type { EventBus } from '../../events/EventBus';
import { Colors } from '../../config/ColorPalette';

/**
 * BasePhaseContainer抽象クラス
 *
 * 各フェーズコンテナの基底クラスとして、以下の機能を提供：
 * - ライフサイクル管理（enter/exit/update）
 * - EventBusとの連携
 * - 表示制御
 * - アニメーション
 *
 * @example
 * ```typescript
 * class GatheringContainer extends BasePhaseContainer {
 *   readonly phase = GamePhase.GATHERING;
 *
 *   protected createContent(): void {
 *     // 採取フェーズ固有のUI構築
 *   }
 *
 *   protected onEnter(): Promise<void> {
 *     // 採取フェーズ開始時の処理
 *   }
 *
 *   canComplete(): boolean {
 *     return this.selectedMaterials.length > 0;
 *   }
 * }
 * ```
 */
export abstract class BasePhaseContainer implements IPhaseContainer {
  // =====================================================
  // 抽象プロパティ（サブクラスで定義）
  // =====================================================

  /** このコンテナが担当するゲームフェーズ */
  public abstract readonly phase: GamePhase;

  // =====================================================
  // 公開プロパティ
  // =====================================================

  /** Phaserコンテナオブジェクト */
  public readonly container: Phaser.GameObjects.Container;

  // =====================================================
  // 保護プロパティ（サブクラスからアクセス可能）
  // =====================================================

  /** シーン参照 */
  protected readonly scene: Phaser.Scene;

  /** EventBus参照 */
  protected readonly eventBus: EventBus;

  /** コンテナの幅 */
  protected readonly width: number;

  /** コンテナの高さ */
  protected readonly height: number;

  /** 有効状態 */
  protected enabled: boolean = true;

  /** アクティブ状態（enter〜exit間） */
  protected isActive: boolean = false;

  // =====================================================
  // プライベートプロパティ
  // =====================================================

  /** 初期Y座標（アニメーション用） */
  private readonly initialY: number;

  // =====================================================
  // コンストラクタ
  // =====================================================

  /**
   * コンストラクタ
   * @param config 設定オブジェクト
   */
  constructor(config: PhaseContainerConfig) {
    this.scene = config.scene;
    this.eventBus = config.eventBus;
    this.width = config.width ?? 800;
    this.height = config.height ?? 500;

    const x = config.x ?? 200;
    const y = config.y ?? 150;
    this.initialY = y;

    // コンテナ作成
    this.container = this.scene.add.container(x, y);
    this.container.setDepth(200);
    this.container.setVisible(false);

    // 基本構造を作成
    this.createBackground();
    this.createContent();
    this.setupEventListeners();
  }

  // =====================================================
  // ライフサイクルメソッド
  // =====================================================

  /**
   * フェーズに入る
   */
  async enter(): Promise<void> {
    this.isActive = true;
    this.container.setVisible(true);
    this.container.setAlpha(0);

    // フェードインアニメーション
    await this.animateIn();

    // サブクラスの初期化処理
    await this.onEnter();

    // フェーズ開始イベント発火
    this.emitAction('enter');
  }

  /**
   * フェーズから出る
   */
  async exit(): Promise<void> {
    // サブクラスの終了処理
    await this.onExit();

    // フェードアウトアニメーション
    await this.animateOut();

    this.container.setVisible(false);
    this.isActive = false;
  }

  /**
   * 毎フレーム更新
   */
  update(delta: number): void {
    if (!this.isActive || !this.enabled) return;
    this.onUpdate(delta);
  }

  // =====================================================
  // 表示制御
  // =====================================================

  /**
   * 表示/非表示を設定
   */
  setVisible(visible: boolean): void {
    this.container.setVisible(visible);
  }

  /**
   * 有効/無効を設定
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.container.setAlpha(enabled ? 1 : 0.5);
    this.onEnabledChange(enabled);
  }

  // =====================================================
  // アクション
  // =====================================================

  /**
   * フェーズを完了できるかどうか（サブクラスで実装）
   */
  abstract canComplete(): boolean;

  /**
   * フェーズを完了する
   */
  complete(): void {
    if (!this.canComplete()) return;

    const result = this.getCompletionResult();
    this.eventBus.emit('phase:complete' as any, {
      phase: this.phase,
      result,
    });
  }

  /**
   * フェーズをキャンセルする
   */
  cancel(): void {
    this.eventBus.emit('phase:cancel' as any, {
      phase: this.phase,
    });
  }

  // =====================================================
  // 破棄
  // =====================================================

  /**
   * コンテナを破棄する
   */
  destroy(): void {
    this.removeEventListeners();
    this.container.destroy();
  }

  // =====================================================
  // 抽象メソッド（サブクラスで必ず実装）
  // =====================================================

  /**
   * コンテンツを作成する
   * サブクラスでフェーズ固有のUIを構築する
   */
  protected abstract createContent(): void;

  /**
   * フェーズ開始時の処理
   */
  protected abstract onEnter(): Promise<void>;

  /**
   * フェーズ終了時の処理
   */
  protected abstract onExit(): Promise<void>;

  /**
   * 毎フレーム更新処理
   * @param delta 前フレームからの経過時間（ミリ秒）
   */
  protected abstract onUpdate(delta: number): void;

  /**
   * 完了時の結果データを取得する
   * @returns フェーズ固有の結果データ
   */
  protected abstract getCompletionResult(): unknown;

  // =====================================================
  // オプショナルオーバーライド
  // =====================================================

  /**
   * 有効状態変更時の処理
   * @param _enabled 新しい有効状態
   */
  protected onEnabledChange(_enabled: boolean): void {
    // デフォルトは何もしない
  }

  /**
   * イベントリスナーを設定する
   */
  protected setupEventListeners(): void {
    // デフォルトは何もしない
  }

  /**
   * イベントリスナーを解除する
   */
  protected removeEventListeners(): void {
    // デフォルトは何もしない
  }

  // =====================================================
  // ヘルパーメソッド
  // =====================================================

  /**
   * 背景を作成する
   */
  private createBackground(): void {
    const bg = this.scene.add.graphics();
    bg.fillStyle(Colors.panelBackground, 0.95);
    bg.fillRoundedRect(0, 0, this.width, this.height, 12);
    bg.lineStyle(2, Colors.panelBorder);
    bg.strokeRoundedRect(0, 0, this.width, this.height, 12);
    this.container.add(bg);
  }

  /**
   * フェードインアニメーション
   */
  private async animateIn(): Promise<void> {
    return new Promise((resolve) => {
      // アニメーション開始位置
      this.container.setY(this.initialY + 20);

      this.scene.tweens.add({
        targets: this.container,
        alpha: 1,
        y: this.initialY,
        duration: 300,
        ease: 'Power2',
        onComplete: () => resolve(),
      });
    });
  }

  /**
   * フェードアウトアニメーション
   */
  private async animateOut(): Promise<void> {
    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: this.container,
        alpha: 0,
        y: this.initialY + 20,
        duration: 200,
        ease: 'Power2',
        onComplete: () => resolve(),
      });
    });
  }

  // =====================================================
  // EventBusヘルパー
  // =====================================================

  /**
   * アクションイベントを発火する
   * @param action アクション名
   * @param data アクションデータ
   */
  protected emitAction(action: string, data?: unknown): void {
    this.eventBus.emit('phase:action' as any, {
      phase: this.phase,
      action,
      data,
    });
  }

  /**
   * エラーイベントを発火する
   * @param error エラー情報
   */
  protected emitError(error: Error): void {
    this.eventBus.emit('phase:error' as any, {
      phase: this.phase,
      error,
    });
  }
}
