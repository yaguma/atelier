/**
 * 入力システム
 * @description キーボード・マウス入力を統一的に管理するシステム
 * @module presentation
 */

/**
 * 入力アクションの種類
 */
export type InputAction =
  | 'confirm'
  | 'cancel'
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'click'
  | 'hover'
  | 'focusNext'
  | 'focusPrev'
  | 'shortcut1'
  | 'shortcut2'
  | 'shortcut3'
  | 'shortcut4'
  | 'shortcut5'
  | 'shortcut6'
  | 'shortcut7'
  | 'shortcut8'
  | 'shortcut9';

/**
 * 入力ソースの種類
 */
export type InputSource = 'keyboard' | 'mouse' | 'touch';

/**
 * 入力イベント
 */
export interface InputEvent {
  /** 入力アクション */
  action: InputAction;
  /** 入力ソース */
  source: InputSource;
  /** 元のDOMイベント */
  originalEvent?: Event;
  /** タイムスタンプ */
  timestamp: number;
}

/**
 * 入力イベントハンドラー
 */
export type InputHandler = (event: InputEvent) => void;

/**
 * 入力管理クラス
 * @description キーボード・マウス入力を統一的に管理し、イベントを配信する
 */
export class InputManager {
  /** 入力有効フラグ */
  private _enabled: boolean = true;

  /** 無効化されたアクション */
  private _disabledActions: Set<InputAction> = new Set();

  /** アクション別ハンドラー */
  private _handlers: Map<InputAction, Set<InputHandler>> = new Map();

  /** キーバインド設定（キー → アクション） */
  private _keyBindings: Map<string, InputAction> = new Map();

  /** イベントリスナー（破棄時のクリーンアップ用） */
  private _keydownHandler: (e: KeyboardEvent) => void;
  private _clickHandler: (e: MouseEvent) => void;
  private _mouseoverHandler: (e: MouseEvent) => void;

  constructor() {
    // デフォルトキーバインドを設定
    this.setupDefaultKeyBindings();

    // イベントハンドラーをバインド
    this._keydownHandler = this.handleKeydown.bind(this);
    this._clickHandler = this.handleClick.bind(this);
    this._mouseoverHandler = this.handleMouseover.bind(this);

    // イベントリスナーを登録
    document.addEventListener('keydown', this._keydownHandler);
    document.addEventListener('click', this._clickHandler);
    document.addEventListener('mouseover', this._mouseoverHandler);
  }

  /**
   * デフォルトのキーバインドを設定
   */
  private setupDefaultKeyBindings(): void {
    // 確定キー
    this._keyBindings.set('Enter', 'confirm');
    this._keyBindings.set(' ', 'confirm');

    // キャンセルキー
    this._keyBindings.set('Escape', 'cancel');

    // 方向キー
    this._keyBindings.set('ArrowUp', 'up');
    this._keyBindings.set('ArrowDown', 'down');
    this._keyBindings.set('ArrowLeft', 'left');
    this._keyBindings.set('ArrowRight', 'right');

    // 数字キー（ショートカット）
    for (let i = 1; i <= 9; i++) {
      this._keyBindings.set(String(i), `shortcut${i}` as InputAction);
    }

    // Tabキー（フォーカス移動）- Shift+Tabは別途ハンドリング
    this._keyBindings.set('Tab', 'focusNext');
  }

  /**
   * キーダウンイベントハンドラー
   */
  private handleKeydown(e: KeyboardEvent): void {
    if (!this._enabled) {
      return;
    }

    // Shift+Tab の特別処理
    if (e.key === 'Tab' && e.shiftKey) {
      this.emit('focusPrev', 'keyboard', e);
      return;
    }

    const action = this._keyBindings.get(e.key);
    if (action) {
      this.emit(action, 'keyboard', e);
    }
  }

  /**
   * クリックイベントハンドラー
   */
  private handleClick(e: MouseEvent): void {
    if (!this._enabled) {
      return;
    }

    this.emit('click', 'mouse', e);
  }

  /**
   * マウスオーバーイベントハンドラー
   */
  private handleMouseover(e: MouseEvent): void {
    if (!this._enabled) {
      return;
    }

    this.emit('hover', 'mouse', e);
  }

  /**
   * イベントを発行
   */
  private emit(action: InputAction, source: InputSource, originalEvent?: Event): void {
    // アクションが無効化されている場合はスキップ
    if (this._disabledActions.has(action)) {
      return;
    }

    const handlers = this._handlers.get(action);
    if (!handlers || handlers.size === 0) {
      return;
    }

    const inputEvent: InputEvent = {
      action,
      source,
      originalEvent,
      timestamp: Date.now(),
    };

    for (const handler of handlers) {
      handler(inputEvent);
    }
  }

  /**
   * イベントを購読
   * @param action 購読するアクション
   * @param handler イベントハンドラー
   * @returns 購読解除関数
   */
  subscribe(action: InputAction, handler: InputHandler): () => void {
    if (!this._handlers.has(action)) {
      this._handlers.set(action, new Set());
    }

    this._handlers.get(action)!.add(handler);

    // 購読解除関数を返す
    return () => {
      const handlers = this._handlers.get(action);
      if (handlers) {
        handlers.delete(handler);
      }
    };
  }

  /**
   * 入力を無効化
   */
  disable(): void {
    this._enabled = false;
  }

  /**
   * 入力を有効化
   */
  enable(): void {
    this._enabled = true;
  }

  /**
   * 特定のアクションを無効化
   * @param action 無効化するアクション
   */
  disableAction(action: InputAction): void {
    this._disabledActions.add(action);
  }

  /**
   * 特定のアクションを有効化
   * @param action 有効化するアクション
   */
  enableAction(action: InputAction): void {
    this._disabledActions.delete(action);
  }

  /**
   * キーバインドを設定
   * @param key キー名
   * @param action 紐付けるアクション
   */
  setKeyBinding(key: string, action: InputAction): void {
    this._keyBindings.set(key, action);
  }

  /**
   * キーバインドを削除
   * @param key キー名
   */
  removeKeyBinding(key: string): void {
    this._keyBindings.delete(key);
  }

  /**
   * 入力システムを破棄
   */
  destroy(): void {
    // イベントリスナーを解除
    document.removeEventListener('keydown', this._keydownHandler);
    document.removeEventListener('click', this._clickHandler);
    document.removeEventListener('mouseover', this._mouseoverHandler);

    // ハンドラーをクリア
    this._handlers.clear();
    this._disabledActions.clear();
  }
}
