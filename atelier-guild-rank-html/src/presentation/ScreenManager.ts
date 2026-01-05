/**
 * 画面遷移システム
 * @description 画面の登録・切替・履歴管理を行うシステム
 * @module presentation
 */

import { UIComponent } from './UIComponent';

/**
 * 画面ID
 */
export type ScreenId = 'title' | 'main' | 'shop' | 'rankUp' | 'result';

/**
 * 画面遷移アニメーションの種類
 */
export type ScreenTransition = 'none' | 'fade' | 'slide';

/**
 * 画面インターフェース
 */
export interface Screen extends UIComponent {
  /** 画面ID */
  readonly id: ScreenId;
  /** 画面名 */
  readonly name: string;
  /** 画面表示時のコールバック */
  onEnter(): void;
  /** 画面非表示時のコールバック */
  onExit(): void;
}

/**
 * 画面管理クラス
 * @description 画面の登録・切替・履歴管理を行う
 */
export class ScreenManager {
  /** 画面コンテナ */
  private _container: HTMLElement;

  /** 登録された画面 */
  private _screens: Map<ScreenId, Screen> = new Map();

  /** 現在の画面 */
  private _currentScreen: Screen | null = null;

  /** 画面履歴 */
  private _history: ScreenId[] = [];

  /** 遷移中フラグ */
  private _isTransitioning: boolean = false;

  /** アニメーション時間（ミリ秒） */
  private _transitionDuration: number = 300;

  constructor(container: HTMLElement) {
    this._container = container;
  }

  /**
   * 画面を登録
   * @param screen 登録する画面
   */
  registerScreen(screen: Screen): void {
    // 同じIDの画面が既にあれば破棄
    const existing = this._screens.get(screen.id);
    if (existing) {
      existing.destroy();
    }

    this._screens.set(screen.id, screen);
  }

  /**
   * 画面が登録されているか確認
   * @param id 画面ID
   * @returns 登録されている場合true
   */
  hasScreen(id: ScreenId): boolean {
    return this._screens.has(id);
  }

  /**
   * 画面に遷移
   * @param id 遷移先の画面ID
   * @param transition アニメーションの種類
   * @returns 遷移完了を示すPromise
   */
  async goTo(id: ScreenId, transition: ScreenTransition = 'none'): Promise<void> {
    const screen = this._screens.get(id);
    if (!screen) {
      throw new Error(`Screen not found: ${id}`);
    }

    // 同じ画面への遷移はスキップ
    if (this._currentScreen?.id === id) {
      return;
    }

    // 即時遷移
    if (transition === 'none') {
      this.performTransition(screen);
      return;
    }

    // アニメーション付き遷移
    this._isTransitioning = true;
    this._container.classList.add('transitioning');

    try {
      if (transition === 'fade') {
        await this.performFadeTransition(screen);
      } else if (transition === 'slide') {
        await this.performSlideTransition(screen);
      }
    } finally {
      this._isTransitioning = false;
      this._container.classList.remove('transitioning');
    }
  }

  /**
   * 即時遷移を実行
   */
  private performTransition(screen: Screen): void {
    // 現在の画面を退場
    if (this._currentScreen) {
      this._currentScreen.onExit();
      this._currentScreen.unmount();
    }

    // 新しい画面を登場
    this._currentScreen = screen;
    screen.mount(this._container);
    screen.onEnter();

    // 履歴に追加
    this._history.push(screen.id);
  }

  /**
   * フェードアニメーション付き遷移
   */
  private async performFadeTransition(screen: Screen): Promise<void> {
    const duration = this._transitionDuration;

    // 現在の画面をフェードアウト
    if (this._currentScreen) {
      const currentElement = this._currentScreen.getElement();
      currentElement.style.transition = `opacity ${duration}ms ease-out`;
      currentElement.style.opacity = '0';

      await this.wait(duration);

      this._currentScreen.onExit();
      this._currentScreen.unmount();
    }

    // 新しい画面をフェードイン
    this._currentScreen = screen;
    const newElement = screen.getElement();
    newElement.style.opacity = '0';
    screen.mount(this._container);

    // 強制リフロー
    void newElement.offsetHeight;

    newElement.style.transition = `opacity ${duration}ms ease-in`;
    newElement.style.opacity = '1';
    screen.onEnter();

    await this.wait(duration);

    // スタイルをクリア
    newElement.style.transition = '';
    newElement.style.opacity = '';

    // 履歴に追加
    this._history.push(screen.id);
  }

  /**
   * スライドアニメーション付き遷移
   */
  private async performSlideTransition(screen: Screen): Promise<void> {
    const duration = this._transitionDuration;

    // 現在の画面をスライドアウト
    if (this._currentScreen) {
      const currentElement = this._currentScreen.getElement();
      currentElement.style.transition = `transform ${duration}ms ease-out`;
      currentElement.style.transform = 'translateX(-100%)';

      await this.wait(duration);

      this._currentScreen.onExit();
      this._currentScreen.unmount();
    }

    // 新しい画面をスライドイン
    this._currentScreen = screen;
    const newElement = screen.getElement();
    newElement.style.transform = 'translateX(100%)';
    screen.mount(this._container);

    // 強制リフロー
    void newElement.offsetHeight;

    newElement.style.transition = `transform ${duration}ms ease-in`;
    newElement.style.transform = 'translateX(0)';
    screen.onEnter();

    await this.wait(duration);

    // スタイルをクリア
    newElement.style.transition = '';
    newElement.style.transform = '';

    // 履歴に追加
    this._history.push(screen.id);
  }

  /**
   * 指定ミリ秒待機
   */
  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 前の画面に戻る
   * @param transition アニメーションの種類
   * @returns 遷移完了を示すPromise
   */
  async goBack(transition: ScreenTransition = 'none'): Promise<void> {
    // 履歴が1つ以下なら戻れない
    if (this._history.length <= 1) {
      return;
    }

    // 現在の画面を履歴から削除
    this._history.pop();

    // 前の画面に遷移
    const previousId = this._history[this._history.length - 1];
    // 履歴に追加されないよう一時的に履歴から削除
    this._history.pop();

    await this.goTo(previousId, transition);
  }

  /**
   * 履歴をクリア（現在の画面のみ残す）
   */
  clearHistory(): void {
    if (this._currentScreen) {
      this._history = [this._currentScreen.id];
    } else {
      this._history = [];
    }
  }

  /**
   * 画面履歴を取得
   * @returns 画面IDの配列
   */
  getHistory(): ScreenId[] {
    return [...this._history];
  }

  /**
   * 現在の画面IDを取得
   * @returns 現在の画面ID（なければnull）
   */
  getCurrentScreenId(): ScreenId | null {
    return this._currentScreen?.id ?? null;
  }

  /**
   * 現在の画面インスタンスを取得
   * @returns 現在の画面（なければnull）
   */
  getCurrentScreen(): Screen | null {
    return this._currentScreen;
  }

  /**
   * 遷移中かどうか
   */
  isTransitioning(): boolean {
    return this._isTransitioning;
  }

  /**
   * アニメーション時間を設定
   * @param duration ミリ秒
   */
  setTransitionDuration(duration: number): void {
    this._transitionDuration = duration;
  }

  /**
   * 画面管理システムを破棄
   */
  destroy(): void {
    // 現在の画面を退場
    if (this._currentScreen) {
      this._currentScreen.onExit();
      this._currentScreen.unmount();
    }

    // 全画面を破棄
    for (const screen of this._screens.values()) {
      screen.destroy();
    }

    this._screens.clear();
    this._history = [];
    this._currentScreen = null;
  }
}
