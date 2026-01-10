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
import { TextStyles } from '../../config/TextStyles';

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

  /** 内部状態 */
  protected state: Record<string, unknown> = {};

  // =====================================================
  // プライベートプロパティ
  // =====================================================

  /** 初期Y座標（アニメーション用） */
  private readonly initialY: number;

  /** ローディングオーバーレイ */
  private loadingOverlay?: Phaser.GameObjects.Container;

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

  // =====================================================
  // UIヘルパーメソッド
  // =====================================================

  /**
   * フェーズタイトルを作成する
   * @param title タイトルテキスト
   * @returns 作成したテキストオブジェクト
   */
  protected createTitle(title: string): Phaser.GameObjects.Text {
    const titleText = this.scene.add.text(this.width / 2, 20, title, {
      ...TextStyles.titleSmall,
      fontSize: '24px',
    });
    titleText.setOrigin(0.5, 0);
    this.container.add(titleText);
    return titleText;
  }

  /**
   * 説明テキストを作成する
   * @param description 説明テキスト
   * @param y Y座標
   * @returns 作成したテキストオブジェクト
   */
  protected createDescription(description: string, y: number): Phaser.GameObjects.Text {
    const descText = this.scene.add.text(this.width / 2, y, description, {
      ...TextStyles.body,
      fontSize: '14px',
      wordWrap: { width: this.width - 40 },
      align: 'center',
    });
    descText.setOrigin(0.5, 0);
    this.container.add(descText);
    return descText;
  }

  /**
   * アクションボタンエリアを作成する
   * @param buttons ボタン設定配列
   * @returns ボタンコンテナ
   */
  protected createActionButtons(
    buttons: Array<{
      label: string;
      primary?: boolean;
      onClick: () => void;
      enabled?: boolean;
    }>
  ): Phaser.GameObjects.Container {
    const buttonContainer = this.scene.add.container(0, this.height - 60);
    const buttonWidth = 120;
    const buttonSpacing = 20;
    const totalWidth =
      buttons.length * buttonWidth + (buttons.length - 1) * buttonSpacing;
    const startX = (this.width - totalWidth) / 2;

    buttons.forEach((btn, index) => {
      const x = startX + index * (buttonWidth + buttonSpacing) + buttonWidth / 2;
      const button = this.createButton(
        x,
        0,
        btn.label,
        btn.onClick,
        btn.primary ?? false,
        btn.enabled ?? true
      );
      buttonContainer.add(button);
    });

    this.container.add(buttonContainer);
    return buttonContainer;
  }

  /**
   * ボタンを作成する
   * @param x X座標
   * @param y Y座標
   * @param label ラベル
   * @param onClick クリックハンドラ
   * @param primary プライマリボタンかどうか
   * @param enabled 有効かどうか
   * @returns ボタンコンテナ
   */
  protected createButton(
    x: number,
    y: number,
    label: string,
    onClick: () => void,
    primary: boolean = false,
    enabled: boolean = true
  ): Phaser.GameObjects.Container {
    const buttonContainer = this.scene.add.container(x, y);
    const width = 120;
    const height = 40;

    const bg = this.scene.add.graphics();
    const bgColor = primary ? Colors.primary : Colors.backgroundDark;
    bg.fillStyle(bgColor, enabled ? 1 : 0.5);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 6);
    bg.lineStyle(2, primary ? Colors.primaryHover : Colors.panelBorder);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 6);
    buttonContainer.add(bg);

    const text = this.scene.add.text(0, 0, label, {
      ...TextStyles.button,
      fontSize: '14px',
    });
    text.setOrigin(0.5);
    text.setAlpha(enabled ? 1 : 0.5);
    buttonContainer.add(text);

    if (enabled) {
      buttonContainer.setInteractive(
        new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
        Phaser.Geom.Rectangle.Contains
      );

      buttonContainer.on('pointerover', () => {
        bg.clear();
        bg.fillStyle(primary ? Colors.primaryHover : 0x4a4a6a, 1);
        bg.fillRoundedRect(-width / 2, -height / 2, width, height, 6);
        bg.lineStyle(2, primary ? Colors.primaryHover : Colors.panelBorder);
        bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 6);
      });

      buttonContainer.on('pointerout', () => {
        bg.clear();
        bg.fillStyle(bgColor, 1);
        bg.fillRoundedRect(-width / 2, -height / 2, width, height, 6);
        bg.lineStyle(2, primary ? Colors.primaryHover : Colors.panelBorder);
        bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 6);
      });

      buttonContainer.on('pointerdown', onClick);
    }

    buttonContainer.setData('bg', bg);
    buttonContainer.setData('text', text);
    buttonContainer.setData('enabled', enabled);
    buttonContainer.setData('primary', primary);
    buttonContainer.setData('bgColor', bgColor);

    return buttonContainer;
  }

  /**
   * ボタンの有効/無効を切り替える
   * @param button ボタンコンテナ
   * @param enabled 有効かどうか
   */
  protected setButtonEnabled(
    button: Phaser.GameObjects.Container,
    enabled: boolean
  ): void {
    const bg = button.getData('bg') as Phaser.GameObjects.Graphics;
    const text = button.getData('text') as Phaser.GameObjects.Text;
    const primary = button.getData('primary') as boolean;
    const bgColor = button.getData('bgColor') as number;
    button.setData('enabled', enabled);

    text.setAlpha(enabled ? 1 : 0.5);

    const width = 120;
    const height = 40;

    bg.clear();
    bg.fillStyle(bgColor, enabled ? 1 : 0.5);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 6);
    bg.lineStyle(2, primary ? Colors.primaryHover : Colors.panelBorder);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 6);

    if (enabled) {
      button.setInteractive(
        new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
        Phaser.Geom.Rectangle.Contains
      );
    } else {
      button.disableInteractive();
    }
  }

  // =====================================================
  // 状態管理ヘルパー
  // =====================================================

  /**
   * 状態を取得する
   * @param key 状態キー
   * @returns 状態値
   */
  protected getState<T>(key: string): T | undefined {
    return this.state[key] as T | undefined;
  }

  /**
   * 状態を設定する
   * @param key 状態キー
   * @param value 状態値
   */
  protected setState<T>(key: string, value: T): void {
    const oldValue = this.state[key];
    this.state[key] = value;
    this.onStateChange(key, oldValue, value);
  }

  /**
   * 状態をクリアする
   */
  protected clearState(): void {
    this.state = {};
  }

  /**
   * 状態変更時のコールバック（オプショナル）
   * @param _key 状態キー
   * @param _oldValue 古い値
   * @param _newValue 新しい値
   */
  protected onStateChange(_key: string, _oldValue: unknown, _newValue: unknown): void {
    // デフォルトは何もしない
  }

  // =====================================================
  // ローディング表示
  // =====================================================

  /**
   * ローディング表示を開始する
   * @param message 表示メッセージ
   */
  protected showLoading(message: string = '処理中...'): void {
    if (this.loadingOverlay) return;

    this.loadingOverlay = this.scene.add.container(0, 0);

    // オーバーレイ背景
    const overlay = this.scene.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, this.width, this.height);
    this.loadingOverlay.add(overlay);

    // スピナー（回転アニメーション）
    const spinner = this.scene.add.text(
      this.width / 2,
      this.height / 2 - 20,
      '⟳',
      { fontSize: '48px', color: '#ffffff' }
    );
    spinner.setOrigin(0.5);
    this.loadingOverlay.add(spinner);

    this.scene.tweens.add({
      targets: spinner,
      rotation: Math.PI * 2,
      duration: 1000,
      repeat: -1,
      ease: 'Linear',
    });

    // メッセージ
    const loadingText = this.scene.add.text(
      this.width / 2,
      this.height / 2 + 30,
      message,
      { ...TextStyles.body, fontSize: '14px' }
    );
    loadingText.setOrigin(0.5);
    this.loadingOverlay.add(loadingText);

    this.container.add(this.loadingOverlay);
  }

  /**
   * ローディング表示を終了する
   */
  protected hideLoading(): void {
    if (this.loadingOverlay) {
      this.loadingOverlay.destroy();
      this.loadingOverlay = undefined;
    }
  }

  /**
   * ローディング中かどうか
   */
  protected isLoading(): boolean {
    return this.loadingOverlay !== undefined;
  }

  // =====================================================
  // エラー表示
  // =====================================================

  /**
   * エラー表示を行う
   * @param message エラーメッセージ
   * @param onDismiss 閉じた時のコールバック
   */
  protected showError(message: string, onDismiss?: () => void): void {
    const errorContainer = this.scene.add.container(0, 0);

    // 背景
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x000000, 0.8);
    bg.fillRect(0, 0, this.width, this.height);
    errorContainer.add(bg);

    // エラーパネル
    const panelWidth = 300;
    const panelHeight = 150;
    const panelX = (this.width - panelWidth) / 2;
    const panelY = (this.height - panelHeight) / 2;

    const panel = this.scene.add.graphics();
    panel.fillStyle(0x4a2a2a, 1);
    panel.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 8);
    panel.lineStyle(2, 0xff4444);
    panel.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 8);
    errorContainer.add(panel);

    // エラーアイコン
    const icon = this.scene.add.text(this.width / 2, panelY + 30, '⚠️', {
      fontSize: '32px',
    });
    icon.setOrigin(0.5);
    errorContainer.add(icon);

    // エラーメッセージ
    const text = this.scene.add.text(this.width / 2, panelY + 70, message, {
      ...TextStyles.body,
      fontSize: '14px',
      wordWrap: { width: panelWidth - 20 },
      align: 'center',
    });
    text.setOrigin(0.5);
    errorContainer.add(text);

    // 閉じるボタン
    const closeBtn = this.createButton(
      this.width / 2,
      panelY + panelHeight - 30,
      'OK',
      () => {
        errorContainer.destroy();
        if (onDismiss) onDismiss();
      },
      true
    );
    errorContainer.add(closeBtn);

    this.container.add(errorContainer);
  }
}
