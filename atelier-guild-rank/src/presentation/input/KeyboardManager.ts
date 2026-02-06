/**
 * KeyboardManager - 統一的なキーボード入力管理クラス
 * Issue #135: ゲーム全体のキーボード操作を実装
 *
 * @description
 * Phaserシーン内でのキーボード入力を一元管理するクラス。
 * キーバインド定数を使用して、アクションベースの入力処理を提供する。
 */

import type Phaser from 'phaser';
import {
  getSelectionIndexFromKey,
  isKeyForAction,
  type KeybindingAction,
} from '../../shared/constants/keybindings';

/**
 * キーボードイベントハンドラの型定義
 */
export type KeyboardEventHandler = (event: KeyboardEvent) => void;

/**
 * アクションハンドラの型定義
 */
export type ActionHandler = () => void;

/**
 * 選択ハンドラの型定義（数字キー用）
 */
export type SelectionHandler = (index: number) => void;

/**
 * フォーカス可能なUI要素の情報
 */
export interface FocusableElement {
  /** 要素ID */
  id: string;
  /** 行位置（グリッドレイアウト用） */
  row: number;
  /** 列位置（グリッドレイアウト用） */
  col: number;
  /** フォーカス時のコールバック */
  onFocus?: () => void;
  /** 選択時のコールバック */
  onSelect?: () => void;
}

/**
 * KeyboardManager - キーボード入力管理クラス
 *
 * 【責務】:
 * - キーボードイベントのリスニング
 * - アクションベースの入力処理
 * - フォーカス管理（グリッドナビゲーション）
 * - 数字キーによる選択処理
 */
export class KeyboardManager {
  /** Phaserシーン参照 */
  private scene: Phaser.Scene;

  /** キーボードイベントハンドラ */
  private keydownHandler: KeyboardEventHandler | null = null;

  /** アクションハンドラマップ */
  private actionHandlers: Map<KeybindingAction, ActionHandler> = new Map();

  /** 選択ハンドラ（数字キー用） */
  private selectionHandler: SelectionHandler | null = null;

  /** フォーカス可能な要素リスト */
  private focusableElements: FocusableElement[] = [];

  /** 現在のフォーカスインデックス */
  private currentFocusIndex = 0;

  /** 有効状態 */
  private enabled = true;

  /**
   * コンストラクタ
   *
   * @param scene - Phaserシーン
   */
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * キーボードリスナーを開始
   */
  start(): void {
    if (this.keydownHandler) {
      return;
    }

    this.keydownHandler = (event: KeyboardEvent) => {
      this.handleKeydown(event);
    };

    this.scene.input?.keyboard?.on('keydown', this.keydownHandler);
  }

  /**
   * キーボードリスナーを停止
   */
  stop(): void {
    if (this.keydownHandler) {
      this.scene.input?.keyboard?.off('keydown', this.keydownHandler);
      this.keydownHandler = null;
    }
  }

  /**
   * マネージャーを破棄
   */
  destroy(): void {
    this.stop();
    this.actionHandlers.clear();
    this.selectionHandler = null;
    this.focusableElements = [];
    this.currentFocusIndex = 0;
  }

  /**
   * 有効/無効を設定
   *
   * @param enabled - 有効状態
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * 有効状態を取得
   *
   * @returns 有効な場合true
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * アクションハンドラを登録
   *
   * @param action - アクション名
   * @param handler - ハンドラ関数
   */
  on(action: KeybindingAction, handler: ActionHandler): void {
    this.actionHandlers.set(action, handler);
  }

  /**
   * アクションハンドラを解除
   *
   * @param action - アクション名
   */
  off(action: KeybindingAction): void {
    this.actionHandlers.delete(action);
  }

  /**
   * 選択ハンドラを登録
   *
   * @param handler - 選択ハンドラ（インデックス1-9を受け取る）
   */
  onSelection(handler: SelectionHandler): void {
    this.selectionHandler = handler;
  }

  /**
   * 選択ハンドラを解除
   */
  offSelection(): void {
    this.selectionHandler = null;
  }

  /**
   * フォーカス可能な要素を設定
   *
   * @param elements - フォーカス可能な要素のリスト
   */
  setFocusableElements(elements: FocusableElement[]): void {
    this.focusableElements = elements;
    if (this.currentFocusIndex >= elements.length) {
      this.currentFocusIndex = 0;
    }
    if (elements.length > 0) {
      this.triggerFocusCallback();
    }
  }

  /**
   * フォーカス可能な要素をクリア
   */
  clearFocusableElements(): void {
    this.focusableElements = [];
    this.currentFocusIndex = 0;
  }

  /**
   * 現在のフォーカスインデックスを取得
   *
   * @returns フォーカスインデックス
   */
  getCurrentFocusIndex(): number {
    return this.currentFocusIndex;
  }

  /**
   * フォーカスを指定インデックスに設定
   *
   * @param index - フォーカスインデックス
   */
  setFocusIndex(index: number): void {
    if (index >= 0 && index < this.focusableElements.length) {
      this.currentFocusIndex = index;
      this.triggerFocusCallback();
    }
  }

  /**
   * 現在のフォーカス要素を取得
   *
   * @returns フォーカス要素、存在しない場合はnull
   */
  getCurrentFocusElement(): FocusableElement | null {
    if (this.focusableElements.length === 0) {
      return null;
    }
    return this.focusableElements[this.currentFocusIndex] ?? null;
  }

  /**
   * キーダウンイベントを処理
   *
   * @param event - キーボードイベント
   */
  private handleKeydown(event: KeyboardEvent): void {
    if (!this.enabled) {
      return;
    }

    const key = event.key;

    // 数字キーの選択処理
    const selectionIndex = getSelectionIndexFromKey(key);
    if (selectionIndex !== null && this.selectionHandler) {
      event.preventDefault();
      this.selectionHandler(selectionIndex);
      return;
    }

    // ナビゲーション処理
    if (this.handleNavigation(key)) {
      event.preventDefault();
      return;
    }

    // アクションハンドラの処理
    for (const [action, handler] of this.actionHandlers) {
      if (isKeyForAction(key, action)) {
        event.preventDefault();
        handler();
        return;
      }
    }
  }

  /**
   * ナビゲーションキーを処理
   *
   * @param key - キー
   * @returns 処理した場合true
   */
  private handleNavigation(key: string): boolean {
    if (this.focusableElements.length === 0) {
      return false;
    }

    const currentElement = this.focusableElements[this.currentFocusIndex];
    if (!currentElement) {
      return false;
    }

    let newIndex = this.currentFocusIndex;

    if (isKeyForAction(key, 'UP')) {
      newIndex = this.findNextFocusIndex(currentElement.row - 1, currentElement.col, 'up');
    } else if (isKeyForAction(key, 'DOWN')) {
      newIndex = this.findNextFocusIndex(currentElement.row + 1, currentElement.col, 'down');
    } else if (isKeyForAction(key, 'LEFT')) {
      newIndex = this.findNextFocusIndex(currentElement.row, currentElement.col - 1, 'left');
    } else if (isKeyForAction(key, 'RIGHT')) {
      newIndex = this.findNextFocusIndex(currentElement.row, currentElement.col + 1, 'right');
    } else {
      return false;
    }

    if (newIndex !== this.currentFocusIndex) {
      this.currentFocusIndex = newIndex;
      this.triggerFocusCallback();
    }

    return true;
  }

  /**
   * 次のフォーカスインデックスを検索
   *
   * @param targetRow - 目標行
   * @param targetCol - 目標列
   * @param direction - 移動方向
   * @returns 次のフォーカスインデックス
   */
  private findNextFocusIndex(
    targetRow: number,
    targetCol: number,
    direction: 'up' | 'down' | 'left' | 'right',
  ): number {
    // 完全一致を探す
    const exactMatch = this.focusableElements.findIndex(
      (el) => el.row === targetRow && el.col === targetCol,
    );
    if (exactMatch !== -1) {
      return exactMatch;
    }

    // 同じ方向で最も近い要素を探す
    const currentElement = this.focusableElements[this.currentFocusIndex];
    if (!currentElement) {
      return this.currentFocusIndex;
    }

    let bestIndex = this.currentFocusIndex;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (let i = 0; i < this.focusableElements.length; i++) {
      const element = this.focusableElements[i];

      // 移動方向に合った要素のみを考慮
      let isValidDirection = false;
      switch (direction) {
        case 'up':
          isValidDirection = element.row < currentElement.row;
          break;
        case 'down':
          isValidDirection = element.row > currentElement.row;
          break;
        case 'left':
          isValidDirection = element.col < currentElement.col;
          break;
        case 'right':
          isValidDirection = element.col > currentElement.col;
          break;
      }

      if (!isValidDirection) {
        continue;
      }

      // マンハッタン距離で最も近いものを選択
      const distance =
        Math.abs(element.row - targetRow) + Math.abs(element.col - currentElement.col);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = i;
      }
    }

    return bestIndex;
  }

  /**
   * フォーカスコールバックを発火
   */
  private triggerFocusCallback(): void {
    const element = this.focusableElements[this.currentFocusIndex];
    if (element?.onFocus) {
      element.onFocus();
    }
  }

  /**
   * 現在フォーカス中の要素を選択
   */
  selectCurrentFocus(): void {
    const element = this.focusableElements[this.currentFocusIndex];
    if (element?.onSelect) {
      element.onSelect();
    }
  }
}
