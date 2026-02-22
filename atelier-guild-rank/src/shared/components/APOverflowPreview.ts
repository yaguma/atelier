/**
 * APOverflowPreview - AP超過プレビューダイアログ
 *
 * TASK-0115: APOverflowPreview実装
 *
 * @description
 * AP超過が発生する場合にユーザーに確認ダイアログを表示する。
 * 超過AP、消費日数、翌日APなどの情報を表示し、
 * 続行/キャンセルの選択を提供する。
 *
 * @信頼性レベル 🟡 NFR-102・design-interview.md D7から妥当な推測
 */

import type { IAPOverflowResult } from '@features/gathering';

// =============================================================================
// Types
// =============================================================================

/**
 * AP超過プレビュー表示データ
 *
 * @description
 * AP超過プレビューダイアログに表示するデータ。
 * IAPOverflowResultの情報にアクション名・現在AP・消費APを付加したもの。
 */
export interface IAPOverflowPreviewData {
  /** アクション名（例: '採取'） */
  readonly actionName: string;
  /** 現在のAP */
  readonly currentAP: number;
  /** 消費AP */
  readonly consumeAP: number;
  /** 超過AP */
  readonly overflowAP: number;
  /** 消費日数 */
  readonly daysConsumed: number;
  /** 翌日開始時AP */
  readonly nextDayAP: number;
}

// =============================================================================
// APOverflowPreview
// =============================================================================

/**
 * 【機能概要】: AP超過プレビューダイアログ
 * 【実装方針】: Phaserのコンテナとテキストで構成し、show/confirm/cancelのAPIを提供
 * 【テスト対応】: T-0115-01〜T-0115-03
 * 🟡 信頼性レベル: NFR-102・design-interview.md D7から妥当な推測
 */
export class APOverflowPreview {
  private readonly scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container | null = null;
  private _visible = false;
  private _previewData: IAPOverflowPreviewData | null = null;
  private _onConfirm: (() => void) | null = null;
  private _onCancel: (() => void) | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  // ===========================================================================
  // ライフサイクル
  // ===========================================================================

  /**
   * 【機能概要】: UIの初期化
   * 【実装方針】: コンテナを作成し非表示で待機
   */
  create(): void {
    this.container = this.scene.add.container(0, 0);
    this.container.setVisible(false);
  }

  /**
   * 【機能概要】: リソース解放
   * 【実装方針】: 表示状態をリセットしコンテナを破棄
   */
  destroy(): void {
    this.hide();
    if (this.container) {
      this.container.destroy(true);
      this.container = null;
    }
  }

  // ===========================================================================
  // 表示制御
  // ===========================================================================

  /**
   * 【機能概要】: プレビューダイアログの表示
   * 【実装方針】: データを保持しコールバックを登録、コンテナを表示
   */
  show(data: IAPOverflowPreviewData, onConfirm: () => void, onCancel: () => void): void {
    this._previewData = data;
    this._onConfirm = onConfirm;
    this._onCancel = onCancel;
    this._visible = true;

    if (this.container) {
      this.container.setVisible(true);
    }
  }

  /**
   * 【機能概要】: 続行ボタンの処理
   * 【実装方針】: onConfirmコールバックを呼び出しダイアログを非表示
   */
  confirm(): void {
    if (!this._visible) return;

    const callback = this._onConfirm;
    this.hide();
    callback?.();
  }

  /**
   * 【機能概要】: キャンセルボタンの処理
   * 【実装方針】: onCancelコールバックを呼び出しダイアログを非表示
   */
  cancel(): void {
    if (!this._visible) return;

    const callback = this._onCancel;
    this.hide();
    callback?.();
  }

  // ===========================================================================
  // 状態取得
  // ===========================================================================

  /**
   * 表示状態を返す
   */
  isVisible(): boolean {
    return this._visible;
  }

  /**
   * 現在のプレビューデータを返す（非表示時はnull）
   */
  getPreviewData(): IAPOverflowPreviewData | null {
    return this._previewData;
  }

  // ===========================================================================
  // 静的ファクトリメソッド
  // ===========================================================================

  /**
   * 【機能概要】: IAPOverflowResultからIAPOverflowPreviewDataを生成
   * 【実装方針】: 超過計算結果にアクション名・AP情報を付加してプレビューデータを構築
   */
  static createPreviewData(
    result: IAPOverflowResult,
    actionName: string,
    currentAP: number,
    consumeAP: number,
  ): IAPOverflowPreviewData {
    return {
      actionName,
      currentAP,
      consumeAP,
      overflowAP: result.overflowAP,
      daysConsumed: result.daysConsumed,
      nextDayAP: result.nextDayAP,
    };
  }

  // ===========================================================================
  // Private
  // ===========================================================================

  /**
   * ダイアログを非表示にし内部状態をリセットする
   */
  private hide(): void {
    this._visible = false;
    this._previewData = null;
    this._onConfirm = null;
    this._onCancel = null;

    if (this.container) {
      this.container.setVisible(false);
    }
  }
}
