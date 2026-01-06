/**
 * メイン画面
 * @description ゲームプレイ中のメイン画面レイアウト
 * @module presentation/screens
 */

import { UIComponent } from '../UIComponent';
import { Screen, ScreenId } from '../ScreenManager';

/**
 * ゲームフェーズ
 */
export type GamePhase = 'quest' | 'gathering' | 'synthesis' | 'delivery';

/**
 * フェーズ変更コールバック
 */
export type PhaseChangeCallback = (newPhase: GamePhase, oldPhase: GamePhase) => void;

/**
 * メイン画面クラス
 * @description ヘッダー・フェーズインジケーター・メインコンテンツ・フッターの4領域を持つ画面
 */
export class MainScreen extends UIComponent implements Screen {
  /** 画面ID */
  readonly id: ScreenId = 'main';

  /** 画面名 */
  readonly name: string = 'メイン画面';

  /** 現在のフェーズ */
  private _currentPhase: GamePhase = 'quest';

  /** フェーズ別コンテンツ */
  private _phaseContents: Map<GamePhase, HTMLElement> = new Map();

  /** フェーズ変更コールバック */
  private _onPhaseChangeCallback: PhaseChangeCallback | null = null;

  /** ヘッダー要素 */
  private _headerElement: HTMLElement | null = null;

  /** フッター要素 */
  private _footerElement: HTMLElement | null = null;

  /** メインコンテンツ要素 */
  private _contentElement: HTMLElement | null = null;

  /** フェーズインジケーター要素 */
  private _phaseIndicatorElement: HTMLElement | null = null;

  constructor() {
    super();
  }

  /**
   * DOM要素を作成
   */
  protected createElement(): HTMLElement {
    const element = document.createElement('div');
    element.className = 'main-screen';
    element.setAttribute('data-testid', 'main-screen');
    return element;
  }

  /**
   * マウント時の処理
   */
  mount(container: HTMLElement): void {
    this.buildContent();
    super.mount(container);
  }

  /**
   * コンテンツを構築
   */
  private buildContent(): void {
    const element = this.getElement();

    // ヘッダー
    this._headerElement = document.createElement('header');
    this._headerElement.className = 'main-header';
    element.appendChild(this._headerElement);

    // フェーズインジケーター
    this._phaseIndicatorElement = this.createPhaseIndicator();
    element.appendChild(this._phaseIndicatorElement);

    // メインコンテンツ
    this._contentElement = document.createElement('main');
    this._contentElement.className = 'main-content';
    this._contentElement.setAttribute('data-phase', this._currentPhase);
    element.appendChild(this._contentElement);

    // 登録済みフェーズコンテンツをマウント
    this.mountPhaseContents();

    // フッター
    this._footerElement = document.createElement('footer');
    this._footerElement.className = 'main-footer';
    element.appendChild(this._footerElement);
  }

  /**
   * フェーズインジケーターを作成
   */
  private createPhaseIndicator(): HTMLElement {
    const indicator = document.createElement('nav');
    indicator.className = 'phase-indicator';
    indicator.setAttribute('data-testid', 'phase-indicator');

    const phases: { id: GamePhase; label: string }[] = [
      { id: 'quest', label: '依頼' },
      { id: 'gathering', label: '採取' },
      { id: 'synthesis', label: '調合' },
      { id: 'delivery', label: '納品' },
    ];

    phases.forEach((phase) => {
      const item = document.createElement('div');
      item.className = 'phase-item';
      item.setAttribute('data-phase', phase.id);
      item.setAttribute('data-testid', `phase-${phase.id}`);
      item.textContent = phase.label;

      if (phase.id === this._currentPhase) {
        item.classList.add('active');
      }

      indicator.appendChild(item);
    });

    return indicator;
  }

  /**
   * フェーズコンテンツをマウント
   */
  private mountPhaseContents(): void {
    if (!this._contentElement) return;

    this._phaseContents.forEach((content, phase) => {
      content.style.display = phase === this._currentPhase ? '' : 'none';
      if (!this._contentElement!.contains(content)) {
        this._contentElement!.appendChild(content);
      }
    });
  }

  /**
   * 現在のフェーズを取得
   */
  getCurrentPhase(): GamePhase {
    return this._currentPhase;
  }

  /**
   * フェーズを設定
   * @param phase 新しいフェーズ
   */
  setPhase(phase: GamePhase): void {
    if (this._currentPhase === phase) return;

    const oldPhase = this._currentPhase;
    this._currentPhase = phase;

    // コンテンツ領域のdata-phase属性を更新
    if (this._contentElement) {
      this._contentElement.setAttribute('data-phase', phase);
    }

    // フェーズインジケーターを更新
    this.updatePhaseIndicator();

    // フェーズコンテンツの表示を更新
    this.updatePhaseContentVisibility();

    // コールバックを呼び出し
    if (this._onPhaseChangeCallback) {
      this._onPhaseChangeCallback(phase, oldPhase);
    }
  }

  /**
   * フェーズインジケーターを更新
   */
  private updatePhaseIndicator(): void {
    if (!this._phaseIndicatorElement) return;

    const items = this._phaseIndicatorElement.querySelectorAll('.phase-item');
    items.forEach((item) => {
      const phaseId = item.getAttribute('data-phase');
      if (phaseId === this._currentPhase) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  /**
   * フェーズコンテンツの表示を更新
   */
  private updatePhaseContentVisibility(): void {
    this._phaseContents.forEach((content, phase) => {
      content.style.display = phase === this._currentPhase ? '' : 'none';
    });
  }

  /**
   * ヘッダーにコンテンツを設定
   * @param content ヘッダーコンテンツ
   */
  setHeaderContent(content: HTMLElement): void {
    if (this._headerElement) {
      this._headerElement.innerHTML = '';
      this._headerElement.appendChild(content);
    }
  }

  /**
   * フッターにコンテンツを設定
   * @param content フッターコンテンツ
   */
  setFooterContent(content: HTMLElement): void {
    if (this._footerElement) {
      this._footerElement.innerHTML = '';
      this._footerElement.appendChild(content);
    }
  }

  /**
   * フェーズ別コンテンツを登録
   * @param phase フェーズ
   * @param content コンテンツ要素
   */
  registerPhaseContent(phase: GamePhase, content: HTMLElement): void {
    this._phaseContents.set(phase, content);

    // 既にマウント済みならコンテンツも追加
    if (this._contentElement) {
      content.style.display = phase === this._currentPhase ? '' : 'none';
      this._contentElement.appendChild(content);
    }
  }

  /**
   * フェーズ変更コールバックを設定
   * @param callback コールバック関数
   */
  onPhaseChange(callback: PhaseChangeCallback): void {
    this._onPhaseChangeCallback = callback;
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
