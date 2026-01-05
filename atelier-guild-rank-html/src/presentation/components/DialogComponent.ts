/**
 * ダイアログコンポーネント
 * @description 確認・情報・選択ダイアログの共通コンポーネント
 * @module presentation/components
 */

import { UIComponent } from '../UIComponent';

/**
 * ダイアログタイプ
 */
export type DialogType = 'confirm' | 'info' | 'choice';

/**
 * 選択肢データ
 */
export interface DialogChoice {
  /** 選択肢ID */
  id: string;
  /** ラベル */
  label: string;
}

/**
 * ダイアログ設定
 */
export interface DialogConfig {
  /** ダイアログタイプ */
  type: DialogType;
  /** タイトル */
  title: string;
  /** メッセージ */
  message: string;
  /** 選択肢（choiceタイプ用） */
  choices?: DialogChoice[];
  /** OKボタンテキスト */
  okText?: string;
  /** キャンセルボタンテキスト */
  cancelText?: string;
  /** オーバーレイクリックで閉じるか */
  closeOnOverlayClick?: boolean;
  /** ESCキーで閉じるか */
  closeOnEsc?: boolean;
}

/**
 * ダイアログ結果
 */
export interface DialogResult {
  /** 確認されたか */
  confirmed: boolean;
  /** 選択された選択肢ID（choiceタイプ用） */
  selectedChoiceId?: string;
}

/**
 * ダイアログコンポーネントクラス
 */
export class DialogComponent extends UIComponent {
  /** ダイアログ設定 */
  private _config: DialogConfig;

  /** 結果コールバック */
  private _onResultCallback: ((result: DialogResult) => void) | null = null;

  /** キーダウンハンドラ参照 */
  private _keydownHandler: ((e: KeyboardEvent) => void) | null = null;

  /** 表示状態 */
  private _isVisible: boolean = true;

  constructor(config: DialogConfig) {
    super();
    this._config = {
      okText: 'OK',
      cancelText: 'キャンセル',
      closeOnOverlayClick: false,
      closeOnEsc: true,
      ...config,
    };
    this.initializeElement();
  }

  /**
   * 要素を初期化
   */
  private initializeElement(): void {
    const element = this.getElement();
    element.className = 'dialog-overlay';
  }

  /**
   * DOM要素を作成
   */
  protected createElement(): HTMLElement {
    const element = document.createElement('div');
    element.className = 'dialog-overlay';
    return element;
  }

  /**
   * マウント時の処理
   */
  mount(container: HTMLElement): void {
    this.buildContent();
    this.setupEventListeners();
    super.mount(container);
  }

  /**
   * コンテンツを構築
   */
  private buildContent(): void {
    const element = this.getElement();
    element.innerHTML = '';

    // ダイアログ本体
    const dialog = document.createElement('div');
    dialog.className = `dialog dialog-${this._config.type}`;

    // タイトル
    const title = document.createElement('div');
    title.className = 'dialog-title';
    title.textContent = this._config.title;
    dialog.appendChild(title);

    // メッセージ
    const message = document.createElement('div');
    message.className = 'dialog-message';
    message.textContent = this._config.message;
    dialog.appendChild(message);

    // 選択肢（choiceタイプの場合）
    if (this._config.type === 'choice' && this._config.choices) {
      const choicesContainer = document.createElement('div');
      choicesContainer.className = 'dialog-choices';

      this._config.choices.forEach((choice) => {
        const choiceItem = document.createElement('button');
        choiceItem.className = 'dialog-choice-item';
        choiceItem.textContent = choice.label;
        choiceItem.dataset.choiceId = choice.id;
        choiceItem.addEventListener('click', () =>
          this.handleChoiceClick(choice.id)
        );
        choicesContainer.appendChild(choiceItem);
      });

      dialog.appendChild(choicesContainer);
    }

    // ボタンエリア
    const buttonArea = document.createElement('div');
    buttonArea.className = 'dialog-button-area';

    // キャンセルボタン（confirmタイプのみ）
    if (this._config.type === 'confirm') {
      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'dialog-cancel-btn';
      cancelBtn.textContent = this._config.cancelText || 'キャンセル';
      cancelBtn.addEventListener('click', () => this.handleCancel());
      buttonArea.appendChild(cancelBtn);
    }

    // OKボタン（choice以外）
    if (this._config.type !== 'choice') {
      const okBtn = document.createElement('button');
      okBtn.className = 'dialog-ok-btn';
      okBtn.textContent = this._config.okText || 'OK';
      okBtn.addEventListener('click', () => this.handleOk());
      buttonArea.appendChild(okBtn);
    }

    dialog.appendChild(buttonArea);
    element.appendChild(dialog);
  }

  /**
   * イベントリスナーを設定
   */
  private setupEventListeners(): void {
    const element = this.getElement();

    // オーバーレイクリック
    element.addEventListener('click', (e) => {
      if (e.target === element && this._config.closeOnOverlayClick) {
        this.handleCancel();
      }
    });

    // ESCキー
    this._keydownHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && this._config.closeOnEsc && this._isVisible) {
        this.handleCancel();
      }
    };
    document.addEventListener('keydown', this._keydownHandler);
  }

  /**
   * 選択肢クリックハンドラ
   */
  private handleChoiceClick(choiceId: string): void {
    if (this._onResultCallback) {
      this._onResultCallback({
        confirmed: true,
        selectedChoiceId: choiceId,
      });
    }
    this.close();
  }

  /**
   * OKハンドラ
   */
  private handleOk(): void {
    if (this._onResultCallback) {
      this._onResultCallback({ confirmed: true });
    }
    this.close();
  }

  /**
   * キャンセルハンドラ
   */
  private handleCancel(): void {
    if (this._onResultCallback) {
      this._onResultCallback({ confirmed: false });
    }
    this.close();
  }

  /**
   * 結果コールバックを設定
   */
  onResult(callback: (result: DialogResult) => void): void {
    this._onResultCallback = callback;
  }

  /**
   * ダイアログを表示
   */
  show(): void {
    const element = this.getElement();
    element.classList.remove('hidden');
    this._isVisible = true;
  }

  /**
   * ダイアログを閉じる
   */
  close(): void {
    const element = this.getElement();
    element.classList.add('hidden');
    this._isVisible = false;
  }

  /**
   * 破棄時の処理
   */
  destroy(): void {
    // キーダウンハンドラを削除
    if (this._keydownHandler) {
      document.removeEventListener('keydown', this._keydownHandler);
      this._keydownHandler = null;
    }
    super.destroy();
  }
}
