/**
 * ToastManager
 *
 * トースト通知（一時的なメッセージ表示）の管理を一元化するマネージャークラス。
 * 複数トーストのスタック表示、自動消去、種別ごとの色分けを提供。
 * 設計文書: docs/design/atelier-guild-rank-phaser/core-systems.md
 */

import Phaser from 'phaser';
import { Colors } from '../config/ColorPalette';
import { TextStyles } from '../config/TextStyles';

/**
 * トースト種別
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * トースト表示オプション
 */
export interface ToastOptions {
  /** 表示メッセージ */
  message: string;
  /** トースト種別（デフォルト: 'info'） */
  type?: ToastType;
  /** 表示時間（ミリ秒、デフォルト: 3000） */
  duration?: number;
}

/**
 * アクティブなトースト情報
 */
interface ActiveToast {
  /** トーストのコンテナ */
  container: Phaser.GameObjects.Container;
  /** 自動消去タイマー */
  timer: Phaser.Time.TimerEvent;
}

/**
 * ToastManager
 *
 * トースト通知の表示・管理を一元化するシングルトンクラス。
 * 以下の機能を提供：
 * - トーストの複数スタック表示
 * - 一定時間後の自動消去
 * - 成功/エラー/警告/情報の種別ごとの色分け
 * - 最大表示数の制限
 * - 閉じるボタンによる手動消去
 *
 * @example
 * ```typescript
 * // シングルトンを取得
 * const toastManager = ToastManager.getInstance();
 *
 * // シーンを設定（BaseGameSceneのcreate()で呼び出す）
 * toastManager.setScene(this);
 *
 * // 成功トーストを表示
 * toastManager.success('保存しました');
 *
 * // エラートーストを表示
 * toastManager.error('データの読み込みに失敗しました');
 *
 * // カスタムオプションでトーストを表示
 * toastManager.show({
 *   message: 'お知らせです',
 *   type: 'info',
 *   duration: 5000,
 * });
 * ```
 */
export class ToastManager {
  /** シングルトンインスタンス */
  private static instance: ToastManager | null = null;

  /** Phaserシーン参照 */
  private scene: Phaser.Scene | null = null;

  /** アクティブなトースト一覧 */
  private activeToasts: ActiveToast[] = [];

  /** 最大同時表示数 */
  private readonly maxToasts = 5;

  /** トーストの高さ */
  private readonly toastHeight = 50;

  /** トースト間のスペース */
  private readonly toastSpacing = 10;

  /** デフォルトの表示時間（ミリ秒） */
  private readonly defaultDuration = 3000;

  /**
   * プライベートコンストラクタ（シングルトン）
   */
  private constructor() {}

  /**
   * シングルトンインスタンスを取得
   * @returns ToastManagerインスタンス
   */
  public static getInstance(): ToastManager {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager();
    }
    return ToastManager.instance;
  }

  /**
   * シングルトンインスタンスをリセット
   * テスト用途や、シーン遷移時のクリーンアップに使用
   */
  public static resetInstance(): void {
    if (ToastManager.instance) {
      ToastManager.instance.clearAll();
      ToastManager.instance = null;
    }
  }

  /**
   * シーンを設定
   * BaseGameSceneのcreate()で呼び出す
   * @param scene Phaserシーン
   */
  public setScene(scene: Phaser.Scene): void {
    this.scene = scene;
  }

  /**
   * トーストを表示
   * @param options トースト表示オプション
   *
   * @example
   * ```typescript
   * toastManager.show({
   *   message: '処理が完了しました',
   *   type: 'success',
   *   duration: 3000,
   * });
   * ```
   */
  public show(options: ToastOptions): void {
    if (!this.scene) {
      console.error('ToastManager: Scene not set');
      return;
    }

    const { message, type = 'info', duration = this.defaultDuration } = options;

    // 最大数を超えたら古いものを削除
    while (this.activeToasts.length >= this.maxToasts) {
      this.removeToast(this.activeToasts[0]);
    }

    // トースト作成
    const toast = this.createToast(message, type);

    // タイマー設定
    const timer = this.scene.time.delayedCall(duration, () => {
      this.removeToast({ container: toast, timer });
    });

    this.activeToasts.push({ container: toast, timer });

    // 位置を更新
    this.updatePositions();

    // 出現アニメーション
    toast.setAlpha(0);
    toast.setY(toast.y - 20);
    this.scene.tweens.add({
      targets: toast,
      alpha: 1,
      y: toast.y + 20,
      duration: 200,
      ease: 'Power2',
    });
  }

  /**
   * 成功トーストを表示
   * @param message メッセージ
   * @param duration 表示時間（ミリ秒）
   *
   * @example
   * ```typescript
   * toastManager.success('保存が完了しました');
   * ```
   */
  public success(message: string, duration?: number): void {
    this.show({ message, type: 'success', duration });
  }

  /**
   * エラートーストを表示
   * @param message メッセージ
   * @param duration 表示時間（ミリ秒）
   *
   * @example
   * ```typescript
   * toastManager.error('エラーが発生しました');
   * ```
   */
  public error(message: string, duration?: number): void {
    this.show({ message, type: 'error', duration });
  }

  /**
   * 警告トーストを表示
   * @param message メッセージ
   * @param duration 表示時間（ミリ秒）
   *
   * @example
   * ```typescript
   * toastManager.warning('注意: データが古い可能性があります');
   * ```
   */
  public warning(message: string, duration?: number): void {
    this.show({ message, type: 'warning', duration });
  }

  /**
   * 情報トーストを表示
   * @param message メッセージ
   * @param duration 表示時間（ミリ秒）
   *
   * @example
   * ```typescript
   * toastManager.info('ヒント: Escキーでメニューを開けます');
   * ```
   */
  public info(message: string, duration?: number): void {
    this.show({ message, type: 'info', duration });
  }

  /**
   * すべてのトーストをクリア
   */
  public clearAll(): void {
    this.activeToasts.forEach((toast) => {
      toast.timer.destroy();
      toast.container.destroy();
    });
    this.activeToasts = [];
  }

  /**
   * アクティブなトースト数を取得
   * @returns アクティブなトースト数
   */
  public getActiveCount(): number {
    return this.activeToasts.length;
  }

  /**
   * トーストを作成
   * @param message メッセージ
   * @param type トースト種別
   * @returns トーストコンテナ
   */
  private createToast(
    message: string,
    type: ToastType
  ): Phaser.GameObjects.Container {
    if (!this.scene) throw new Error('Scene not set');

    const width = 300;
    const height = this.toastHeight;
    const x = this.scene.cameras.main.centerX;
    const y = 60; // 初期Y位置（後で更新）

    const container = this.scene.add.container(x, y);

    // 背景色
    const bgColor = this.getTypeColor(type);
    const background = this.scene.add.graphics();
    background.fillStyle(bgColor);
    background.fillRoundedRect(-width / 2, -height / 2, width, height, 8);
    container.add(background);

    // アイコン
    const icon = this.scene.add
      .text(-width / 2 + 15, 0, this.getTypeIcon(type), { fontSize: '20px' })
      .setOrigin(0, 0.5);
    container.add(icon);

    // メッセージ
    const text = this.scene.add
      .text(-width / 2 + 45, 0, message, { ...TextStyles.body, color: '#ffffff' })
      .setOrigin(0, 0.5);
    container.add(text);

    // 閉じるボタン
    const closeBtn = this.scene.add
      .text(width / 2 - 15, 0, '×', { fontSize: '20px', color: '#ffffff' })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => {
      const toastData = this.activeToasts.find((t) => t.container === container);
      if (toastData) {
        this.removeToast(toastData);
      }
    });
    container.add(closeBtn);

    // 深度を設定（最前面）
    container.setDepth(2000);

    return container;
  }

  /**
   * トーストを削除
   * @param toast 削除するトースト
   */
  private removeToast(toast: ActiveToast): void {
    if (!this.scene) return;

    const index = this.activeToasts.indexOf(toast);
    if (index === -1) return;

    this.activeToasts.splice(index, 1);
    toast.timer.destroy();

    // フェードアウトアニメーション
    this.scene.tweens.add({
      targets: toast.container,
      alpha: 0,
      y: toast.container.y - 20,
      duration: 200,
      onComplete: () => {
        toast.container.destroy();
        this.updatePositions();
      },
    });
  }

  /**
   * すべてのトーストの位置を更新
   */
  private updatePositions(): void {
    this.activeToasts.forEach((toast, index) => {
      const targetY = 60 + index * (this.toastHeight + this.toastSpacing);
      if (this.scene) {
        this.scene.tweens.add({
          targets: toast.container,
          y: targetY,
          duration: 150,
        });
      }
    });
  }

  /**
   * トースト種別に対応する色を取得
   * @param type トースト種別
   * @returns 色（数値）
   */
  private getTypeColor(type: ToastType): number {
    switch (type) {
      case 'success':
        return Colors.success;
      case 'error':
        return Colors.danger;
      case 'warning':
        return Colors.warning;
      case 'info':
        return Colors.info;
    }
  }

  /**
   * トースト種別に対応するアイコンを取得
   * @param type トースト種別
   * @returns アイコン文字
   */
  private getTypeIcon(type: ToastType): string {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
    }
  }
}
