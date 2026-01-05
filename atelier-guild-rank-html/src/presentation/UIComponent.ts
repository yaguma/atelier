/**
 * UIコンポーネント基底クラス
 * @description プレゼンテーション層の全UIコンポーネントの基底クラス
 * @module presentation
 */

/**
 * イベントハンドラーの型定義
 */
export type EventHandler = (event: Event) => void;

/**
 * UIコンポーネントのインターフェース
 */
export interface IUIComponent {
  /** HTML要素を取得 */
  getElement(): HTMLElement;

  /** コンテナにマウント */
  mount(container: HTMLElement): void;

  /** アンマウント */
  unmount(): void;

  /** 表示 */
  show(): void;

  /** 非表示 */
  hide(): void;

  /** 子コンポーネントを追加 */
  addChild(child: IUIComponent): void;

  /** 子コンポーネントを削除 */
  removeChild(child: IUIComponent): void;

  /** イベントリスナーを追加 */
  addEventListener(event: string, handler: EventHandler): void;

  /** イベントリスナーを削除 */
  removeEventListener(event: string, handler: EventHandler): void;

  /** コンポーネントを破棄 */
  destroy(): void;
}

/**
 * UIコンポーネント基底クラス
 * @description 全UIコンポーネントが継承する抽象クラス
 */
export abstract class UIComponent implements IUIComponent {
  /** ルート要素 */
  private _element: HTMLElement;

  /** マウント状態 */
  private _mounted: boolean = false;

  /** 表示状態 */
  private _visible: boolean = true;

  /** 子コンポーネント */
  private _children: UIComponent[] = [];

  /** 親コンポーネント */
  private _parent: UIComponent | null = null;

  /** 登録済みイベントリスナー */
  private _eventListeners: Map<string, Set<EventHandler>> = new Map();

  /** マウント先のコンテナ（親コンポーネントではなく直接マウントした場合） */
  private _mountContainer: HTMLElement | null = null;

  constructor() {
    this._element = this.createElement();
  }

  /**
   * HTML要素を生成（サブクラスで実装）
   */
  protected abstract createElement(): HTMLElement;

  /**
   * HTML要素を取得
   */
  getElement(): HTMLElement {
    return this._element;
  }

  /**
   * マウント状態を取得
   */
  isMounted(): boolean {
    return this._mounted;
  }

  /**
   * 表示状態を取得
   */
  isVisible(): boolean {
    return this._visible;
  }

  /**
   * 子コンポーネント一覧を取得
   */
  getChildren(): UIComponent[] {
    return [...this._children];
  }

  /**
   * コンテナにマウント
   */
  mount(container: HTMLElement): void {
    if (this._mounted) {
      return;
    }

    container.appendChild(this._element);
    this._mounted = true;
    this._mountContainer = container;

    // 子コンポーネントもマウント
    for (const child of this._children) {
      if (!child.isMounted()) {
        this._element.appendChild(child.getElement());
        child._mounted = true;
      }
    }

    this.onMount();
  }

  /**
   * アンマウント
   */
  unmount(): void {
    if (!this._mounted) {
      return;
    }

    // 子コンポーネントを先にアンマウント
    for (const child of this._children) {
      child.unmount();
    }

    this._element.parentNode?.removeChild(this._element);
    this._mounted = false;
    this._mountContainer = null;

    this.onUnmount();
  }

  /**
   * 表示
   */
  show(): void {
    this._element.style.display = '';
    this._visible = true;
    this.onShow();
  }

  /**
   * 非表示
   */
  hide(): void {
    this._element.style.display = 'none';
    this._visible = false;
    this.onHide();
  }

  /**
   * 子コンポーネントを追加
   */
  addChild(child: UIComponent): void {
    if (this._children.includes(child)) {
      return;
    }

    child._parent = this;
    this._children.push(child);

    // 親がマウント済みなら子もマウント
    if (this._mounted) {
      this._element.appendChild(child.getElement());
      child._mounted = true;
      child.onMount();
    }
  }

  /**
   * 子コンポーネントを削除
   */
  removeChild(child: UIComponent): void {
    const index = this._children.indexOf(child);
    if (index === -1) {
      return;
    }

    if (child.isMounted()) {
      child.unmount();
    }

    child._parent = null;
    this._children.splice(index, 1);
  }

  /**
   * イベントリスナーを追加
   */
  addEventListener(event: string, handler: EventHandler): void {
    if (!this._eventListeners.has(event)) {
      this._eventListeners.set(event, new Set());
    }

    const handlers = this._eventListeners.get(event)!;
    if (!handlers.has(handler)) {
      handlers.add(handler);
      this._element.addEventListener(event, handler);
    }
  }

  /**
   * イベントリスナーを削除
   */
  removeEventListener(event: string, handler: EventHandler): void {
    const handlers = this._eventListeners.get(event);
    if (handlers?.has(handler)) {
      handlers.delete(handler);
      this._element.removeEventListener(event, handler);
    }
  }

  /**
   * コンポーネントを破棄
   */
  destroy(): void {
    // 子コンポーネントを先に破棄
    for (const child of [...this._children]) {
      child.destroy();
    }
    this._children = [];

    // イベントリスナーを全て解除
    for (const [event, handlers] of this._eventListeners) {
      for (const handler of handlers) {
        this._element.removeEventListener(event, handler);
      }
    }
    this._eventListeners.clear();

    // アンマウント
    this.unmount();

    this.onDestroy();
  }

  /**
   * CSSクラスを追加
   */
  addClass(className: string): void {
    this._element.classList.add(className);
  }

  /**
   * CSSクラスを削除
   */
  removeClass(className: string): void {
    this._element.classList.remove(className);
  }

  /**
   * CSSクラスの有無をトグル
   */
  toggleClass(className: string, force?: boolean): void {
    this._element.classList.toggle(className, force);
  }

  /**
   * CSSクラスが存在するか確認
   */
  hasClass(className: string): boolean {
    return this._element.classList.contains(className);
  }

  /**
   * 属性を設定
   */
  setAttribute(name: string, value: string): void {
    this._element.setAttribute(name, value);
  }

  /**
   * 属性を取得
   */
  getAttribute(name: string): string | null {
    return this._element.getAttribute(name);
  }

  /**
   * 属性を削除
   */
  removeAttribute(name: string): void {
    this._element.removeAttribute(name);
  }

  /**
   * テキストコンテンツを設定
   */
  setTextContent(text: string): void {
    this._element.textContent = text;
  }

  /**
   * HTMLコンテンツを設定
   */
  setInnerHTML(html: string): void {
    this._element.innerHTML = html;
  }

  /**
   * マウント時のコールバック（サブクラスでオーバーライド可能）
   */
  protected onMount(): void {
    // サブクラスで実装
  }

  /**
   * アンマウント時のコールバック（サブクラスでオーバーライド可能）
   */
  protected onUnmount(): void {
    // サブクラスで実装
  }

  /**
   * 表示時のコールバック（サブクラスでオーバーライド可能）
   */
  protected onShow(): void {
    // サブクラスで実装
  }

  /**
   * 非表示時のコールバック（サブクラスでオーバーライド可能）
   */
  protected onHide(): void {
    // サブクラスで実装
  }

  /**
   * 破棄時のコールバック（サブクラスでオーバーライド可能）
   */
  protected onDestroy(): void {
    // サブクラスで実装
  }
}
