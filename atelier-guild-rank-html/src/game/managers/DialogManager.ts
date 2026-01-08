/**
 * DialogManager
 *
 * ダイアログの表示・管理を一元化するマネージャークラス。
 * キュー管理、重複表示防止、シングルトンパターンを提供。
 * 設計文書: docs/design/atelier-guild-rank-phaser/core-systems.md
 */

import type Phaser from 'phaser';
import type Dialog from 'phaser3-rex-plugins/templates/ui/dialog/Dialog';
import type { UIFactory } from '../ui/UIFactory';
import type { DialogOptions } from '../ui/UITypes';

/**
 * キューに追加されたダイアログ情報
 */
interface QueuedDialog {
  /** ダイアログオプション */
  options: DialogOptions;
  /** 完了時のresolve */
  resolve: () => void;
}

/**
 * DialogManager
 *
 * ダイアログの表示・管理を一元化するシングルトンクラス。
 * 以下の機能を提供：
 * - ダイアログのキュー管理
 * - 同時に1つのダイアログのみ表示
 * - ダイアログが閉じたら次のダイアログを自動表示
 * - confirm/alert等の便利メソッド
 *
 * @example
 * ```typescript
 * // シングルトンを取得
 * const dialogManager = DialogManager.getInstance();
 *
 * // コンテキストを設定（BaseGameSceneのcreate()で呼び出す）
 * dialogManager.setContext(this, this.uiFactory);
 *
 * // 確認ダイアログを表示
 * const result = await dialogManager.confirm('確認', '保存しますか？');
 * if (result) {
 *   // 保存処理
 * }
 *
 * // アラートダイアログを表示
 * await dialogManager.alert('エラー', 'データの読み込みに失敗しました');
 * ```
 */
export class DialogManager {
  /** シングルトンインスタンス */
  private static instance: DialogManager | null = null;

  /** 現在表示中のダイアログ */
  private currentDialog: { dialog: Dialog; close: () => void } | null = null;

  /** ダイアログのキュー */
  private queue: QueuedDialog[] = [];

  /** UIFactory参照 */
  private uiFactory: UIFactory | null = null;

  /** シーン参照 */
  private scene: Phaser.Scene | null = null;

  /**
   * プライベートコンストラクタ（シングルトン）
   */
  private constructor() {}

  /**
   * シングルトンインスタンスを取得
   * @returns DialogManagerインスタンス
   */
  public static getInstance(): DialogManager {
    if (!DialogManager.instance) {
      DialogManager.instance = new DialogManager();
    }
    return DialogManager.instance;
  }

  /**
   * シングルトンインスタンスをリセット
   * テスト用途や、シーン遷移時のクリーンアップに使用
   */
  public static resetInstance(): void {
    if (DialogManager.instance) {
      DialogManager.instance.closeAll();
      DialogManager.instance = null;
    }
  }

  /**
   * コンテキストを設定
   * BaseGameSceneのcreate()で呼び出す
   * @param scene Phaserシーン
   * @param uiFactory UIFactory
   */
  public setContext(scene: Phaser.Scene, uiFactory: UIFactory): void {
    this.scene = scene;
    this.uiFactory = uiFactory;
  }

  /**
   * ダイアログを表示
   * 既にダイアログが表示中の場合はキューに追加
   * @param options ダイアログオプション
   * @returns Promise（ダイアログが閉じたらresolve）
   *
   * @example
   * ```typescript
   * await dialogManager.show({
   *   title: 'お知らせ',
   *   content: '新しいアイテムを獲得しました！',
   *   buttons: [
   *     { text: 'OK', onClick: () => {}, primary: true },
   *   ],
   * });
   * ```
   */
  public async show(options: DialogOptions): Promise<void> {
    return new Promise((resolve) => {
      if (this.currentDialog) {
        // キューに追加
        this.queue.push({ options, resolve });
      } else {
        // 即時表示
        this.displayDialog(options, resolve);
      }
    });
  }

  /**
   * 確認ダイアログを表示
   * @param title タイトル
   * @param message メッセージ
   * @param confirmText 確認ボタンテキスト（デフォルト: '確認'）
   * @param cancelText キャンセルボタンテキスト（デフォルト: 'キャンセル'）
   * @returns true=確認, false=キャンセル
   *
   * @example
   * ```typescript
   * const result = await dialogManager.confirm(
   *   'セーブデータ削除',
   *   '本当に削除しますか？この操作は取り消せません。',
   *   '削除',
   *   'キャンセル'
   * );
   * ```
   */
  public async confirm(
    title: string,
    message: string,
    confirmText: string = '確認',
    cancelText: string = 'キャンセル'
  ): Promise<boolean> {
    return new Promise((resolve) => {
      this.show({
        title,
        content: message,
        modal: true,
        buttons: [
          {
            text: cancelText,
            onClick: () => resolve(false),
          },
          {
            text: confirmText,
            onClick: () => resolve(true),
            primary: true,
          },
        ],
      });
    });
  }

  /**
   * アラートダイアログを表示
   * @param title タイトル
   * @param message メッセージ
   * @param buttonText ボタンテキスト（デフォルト: 'OK'）
   * @returns Promise（ダイアログが閉じたらresolve）
   *
   * @example
   * ```typescript
   * await dialogManager.alert('レベルアップ！', 'レベル10になりました！');
   * ```
   */
  public async alert(
    title: string,
    message: string,
    buttonText: string = 'OK'
  ): Promise<void> {
    return this.show({
      title,
      content: message,
      modal: true,
      buttons: [
        {
          text: buttonText,
          onClick: () => {},
          primary: true,
        },
      ],
    });
  }

  /**
   * 現在のダイアログを閉じる
   * キューに次のダイアログがあれば表示
   */
  public close(): void {
    if (this.currentDialog) {
      this.currentDialog.close();
      this.currentDialog = null;
      this.processQueue();
    }
  }

  /**
   * すべてのダイアログを閉じる
   * キューもクリア
   */
  public closeAll(): void {
    if (this.currentDialog) {
      this.currentDialog.close();
      this.currentDialog = null;
    }
    // キュー内のPromiseをすべてresolve
    this.queue.forEach(q => q.resolve());
    this.queue = [];
  }

  /**
   * ダイアログが表示中かどうか
   * @returns true=表示中
   */
  public isShowing(): boolean {
    return this.currentDialog !== null;
  }

  /**
   * キューにダイアログがあるか
   * @returns true=キューあり
   */
  public hasQueued(): boolean {
    return this.queue.length > 0;
  }

  /**
   * キュー内のダイアログ数を取得
   * @returns キュー内のダイアログ数
   */
  public getQueueLength(): number {
    return this.queue.length;
  }

  /**
   * ダイアログを実際に表示
   * @param options ダイアログオプション
   * @param resolve 完了時のresolve
   */
  private displayDialog(options: DialogOptions, resolve: () => void): void {
    if (!this.uiFactory) {
      console.error('DialogManager: UIFactory not set. Call setContext() first.');
      resolve();
      return;
    }

    // ボタンにダイアログクローズ処理を追加
    const wrappedOptions: DialogOptions = {
      ...options,
      buttons: options.buttons?.map(btn => ({
        ...btn,
        onClick: () => {
          btn.onClick();
          this.currentDialog = null;
          resolve();
          this.processQueue();
        },
      })),
    };

    // ダイアログを作成
    const { dialog, close } = this.uiFactory.createDialog(wrappedOptions);
    this.currentDialog = { dialog, close };
  }

  /**
   * キューから次のダイアログを表示
   */
  private processQueue(): void {
    if (this.queue.length > 0) {
      const next = this.queue.shift()!;
      this.displayDialog(next.options, next.resolve);
    }
  }
}
