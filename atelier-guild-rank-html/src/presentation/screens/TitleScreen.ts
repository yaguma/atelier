/**
 * タイトル画面
 * @description ゲーム起動時に表示されるタイトル画面
 * @module presentation/screens
 */

import { UIComponent } from '../UIComponent';
import { Screen, ScreenId } from '../ScreenManager';

/**
 * タイトル画面クラス
 * @description 新規ゲーム開始・続きからの選択を行う画面
 */
export class TitleScreen extends UIComponent implements Screen {
  /** 画面ID */
  readonly id: ScreenId = 'title';

  /** 画面名 */
  readonly name: string = 'タイトル画面';

  /** セーブデータが存在するか */
  private _saveDataExists: boolean = false;

  /** 現在選択中のインデックス */
  private _selectedIndex: number = 0;

  /** メニュー項目数 */
  private readonly _menuItemCount: number = 2;

  /** 新規ゲーム開始コールバック */
  private _onNewGameCallback: (() => void) | null = null;

  /** 続きからコールバック */
  private _onContinueCallback: (() => void) | null = null;

  constructor() {
    super();
  }

  /**
   * DOM要素を作成
   */
  protected createElement(): HTMLElement {
    const element = document.createElement('div');
    element.className = 'title-screen';
    return element;
  }

  /**
   * マウント時の処理
   */
  mount(container: HTMLElement): void {
    // 要素の内容を構築してからマウント
    this.buildContent();
    super.mount(container);
  }

  /**
   * コンテンツを構築
   */
  private buildContent(): void {
    const element = this.getElement();

    // タイトルロゴ
    const logo = document.createElement('h1');
    logo.className = 'title-logo';
    logo.textContent = 'アトリエ錬金術';
    element.appendChild(logo);

    // サブタイトル
    const subtitle = document.createElement('p');
    subtitle.className = 'title-subtitle';
    subtitle.textContent = 'ギルドランク制';
    element.appendChild(subtitle);

    // メニューコンテナ
    const menuContainer = document.createElement('div');
    menuContainer.className = 'title-menu';

    // 「はじめから」ボタン
    const newGameBtn = document.createElement('button');
    newGameBtn.className = 'title-menu-item selected';
    newGameBtn.dataset.action = 'new-game';
    newGameBtn.textContent = 'はじめから';
    newGameBtn.addEventListener('click', () => this.handleNewGameClick());
    menuContainer.appendChild(newGameBtn);

    // 「つづきから」ボタン
    const continueBtn = document.createElement('button');
    continueBtn.className = 'title-menu-item';
    continueBtn.dataset.action = 'continue';
    continueBtn.textContent = 'つづきから';
    continueBtn.addEventListener('click', () => this.handleContinueClick());
    this.updateContinueButtonState(continueBtn);
    menuContainer.appendChild(continueBtn);

    element.appendChild(menuContainer);
  }

  /**
   * つづきからボタンの状態を更新
   */
  private updateContinueButtonState(button?: HTMLButtonElement): void {
    const continueBtn =
      button ||
      (this.getElement().querySelector('[data-action="continue"]') as HTMLButtonElement);
    if (continueBtn) {
      continueBtn.disabled = !this._saveDataExists;
      if (this._saveDataExists) {
        continueBtn.classList.remove('disabled');
      } else {
        continueBtn.classList.add('disabled');
      }
    }
  }

  /**
   * セーブデータの存在を設定
   * @param exists セーブデータが存在するか
   */
  setSaveDataExists(exists: boolean): void {
    this._saveDataExists = exists;
    this.updateContinueButtonState();
  }

  /**
   * 新規ゲーム開始のコールバックを設定
   * @param callback コールバック関数
   */
  onNewGame(callback: () => void): void {
    this._onNewGameCallback = callback;
  }

  /**
   * 続きからのコールバックを設定
   * @param callback コールバック関数
   */
  onContinue(callback: () => void): void {
    this._onContinueCallback = callback;
  }

  /**
   * 「はじめから」クリック処理
   */
  private handleNewGameClick(): void {
    if (this._onNewGameCallback) {
      this._onNewGameCallback();
    }
  }

  /**
   * 「つづきから」クリック処理
   */
  private handleContinueClick(): void {
    if (!this._saveDataExists) {
      return;
    }
    if (this._onContinueCallback) {
      this._onContinueCallback();
    }
  }

  /**
   * 次のメニュー項目を選択
   */
  selectNext(): void {
    this.setSelectedIndex((this._selectedIndex + 1) % this._menuItemCount);
  }

  /**
   * 前のメニュー項目を選択
   */
  selectPrev(): void {
    this.setSelectedIndex((this._selectedIndex - 1 + this._menuItemCount) % this._menuItemCount);
  }

  /**
   * 選択インデックスを設定
   */
  private setSelectedIndex(index: number): void {
    this._selectedIndex = index;
    this.updateSelectionUI();
  }

  /**
   * 選択UIを更新
   */
  private updateSelectionUI(): void {
    const menuItems = this.getElement().querySelectorAll('.title-menu-item');
    menuItems.forEach((item, i) => {
      if (i === this._selectedIndex) {
        item.classList.add('selected');
      } else {
        item.classList.remove('selected');
      }
    });
  }

  /**
   * 現在の選択を確定
   */
  confirmSelection(): void {
    if (this._selectedIndex === 0) {
      this.handleNewGameClick();
    } else if (this._selectedIndex === 1) {
      this.handleContinueClick();
    }
  }

  /**
   * 画面表示時のコールバック
   */
  onEnter(): void {
    // 画面表示時の処理（必要に応じて実装）
  }

  /**
   * 画面非表示時のコールバック
   */
  onExit(): void {
    // 画面非表示時の処理（必要に応じて実装）
  }
}
