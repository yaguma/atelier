/**
 * ヘッダーUI
 * @description ランク・日数・ゴールド・行動ポイントを表示するヘッダーコンポーネント
 * @module presentation/components
 */

import { UIComponent } from '../UIComponent';

/**
 * ヘッダーの状態
 */
export interface HeaderState {
  /** ランク名 */
  rankName: string;
  /** 昇格ポイント */
  rankProgress: number;
  /** 昇格に必要なポイント */
  rankProgressMax: number;
  /** ランク維持残り日数 */
  remainingDays: number;
  /** 所持ゴールド */
  gold: number;
  /** 現在の行動ポイント */
  actionPoints: number;
  /** 最大行動ポイント */
  maxActionPoints: number;
}

/**
 * 警告表示の閾値
 */
const WARNING_DAYS_THRESHOLD = 5;

/**
 * ヘッダーUIクラス
 * @description ゲーム状態を表示するヘッダーコンポーネント
 */
export class HeaderUI extends UIComponent {
  /** 現在の状態 */
  private _state: HeaderState = {
    rankName: 'G',
    rankProgress: 0,
    rankProgressMax: 100,
    remainingDays: 30,
    gold: 0,
    actionPoints: 3,
    maxActionPoints: 3,
  };

  constructor() {
    super();
  }

  /**
   * DOM要素を作成
   */
  protected createElement(): HTMLElement {
    const element = document.createElement('div');
    element.className = 'header-ui';
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
    element.innerHTML = '';

    // 上段: ランク情報と残り日数・ゴールド
    const topRow = document.createElement('div');
    topRow.className = 'header-top-row';

    // ランク表示
    const rankSection = this.createRankSection();
    topRow.appendChild(rankSection);

    // 日数とゴールド
    const statsSection = this.createStatsSection();
    topRow.appendChild(statsSection);

    element.appendChild(topRow);

    // 下段: 行動ポイント
    const bottomRow = document.createElement('div');
    bottomRow.className = 'header-bottom-row';

    const apSection = this.createActionPointsSection();
    bottomRow.appendChild(apSection);

    element.appendChild(bottomRow);
  }

  /**
   * ランクセクションを作成
   */
  private createRankSection(): HTMLElement {
    const section = document.createElement('div');
    section.className = 'header-rank-section';

    // ランク名
    const rankLabel = document.createElement('span');
    rankLabel.className = 'header-rank rank-display';
    rankLabel.setAttribute('data-testid', 'rank-display');
    rankLabel.textContent = `ランク: ${this._state.rankName}`;
    section.appendChild(rankLabel);

    // プログレスバー
    const progressContainer = document.createElement('div');
    progressContainer.className = 'rank-progress-bar';

    const progressFill = document.createElement('div');
    progressFill.className = 'rank-progress-fill';
    const percentage = (this._state.rankProgress / this._state.rankProgressMax) * 100;
    progressFill.style.width = `${percentage.toFixed(2)}%`;
    progressContainer.appendChild(progressFill);
    section.appendChild(progressContainer);

    // プログレス数値
    const progressText = document.createElement('span');
    progressText.className = 'rank-progress-text';
    progressText.textContent = `${this._state.rankProgress}/${this._state.rankProgressMax}`;
    section.appendChild(progressText);

    return section;
  }

  /**
   * 統計セクションを作成
   */
  private createStatsSection(): HTMLElement {
    const section = document.createElement('div');
    section.className = 'header-stats-section';

    // 残り日数
    const daysElement = document.createElement('span');
    daysElement.className = 'header-days day-display';
    daysElement.setAttribute('data-testid', 'day-display');
    if (this._state.remainingDays <= WARNING_DAYS_THRESHOLD) {
      daysElement.classList.add('warning');
    }
    daysElement.textContent = `残り日数: ${this._state.remainingDays}日`;
    section.appendChild(daysElement);

    // ゴールド
    const goldElement = document.createElement('span');
    goldElement.className = 'header-gold gold-display';
    goldElement.setAttribute('data-testid', 'gold-display');
    goldElement.textContent = `💰 ${this._state.gold}G`;
    section.appendChild(goldElement);

    return section;
  }

  /**
   * 行動ポイントセクションを作成
   */
  private createActionPointsSection(): HTMLElement {
    const section = document.createElement('div');
    section.className = 'header-action-points';

    if (this._state.actionPoints === 0) {
      section.classList.add('depleted');
    }

    const label = document.createElement('span');
    label.className = 'action-points-label';
    label.textContent = '行動ポイント: ';
    section.appendChild(label);

    const iconsContainer = document.createElement('span');
    iconsContainer.className = 'action-points-icons';

    for (let i = 0; i < this._state.maxActionPoints; i++) {
      const icon = document.createElement('span');
      icon.className = 'action-point-icon';
      if (i < this._state.actionPoints) {
        icon.classList.add('active');
      }
      icon.textContent = '⚡';
      iconsContainer.appendChild(icon);
    }

    section.appendChild(iconsContainer);

    return section;
  }

  /**
   * 状態を設定
   * @param state 新しい状態
   */
  setState(state: HeaderState): void {
    this._state = { ...state };
    this.updateUI();
  }

  /**
   * UIを更新
   */
  private updateUI(): void {
    const element = this.getElement();
    if (!element.parentElement) return;

    // 再構築
    this.buildContent();
  }

  /**
   * ランクを設定
   * @param rankName ランク名
   */
  setRank(rankName: string): void {
    this._state.rankName = rankName;
    this.updateUI();
  }

  /**
   * 昇格ポイントを設定
   * @param progress 現在のポイント
   * @param max 必要ポイント
   */
  setRankProgress(progress: number, max: number): void {
    this._state.rankProgress = progress;
    this._state.rankProgressMax = max;
    this.updateUI();
  }

  /**
   * 残り日数を設定
   * @param days 残り日数
   */
  setRemainingDays(days: number): void {
    this._state.remainingDays = days;
    this.updateUI();
  }

  /**
   * ゴールドを設定
   * @param gold ゴールド額
   */
  setGold(gold: number): void {
    this._state.gold = gold;
    this.updateUI();
  }

  /**
   * 行動ポイントを設定
   * @param current 現在のポイント
   * @param max 最大ポイント
   */
  setActionPoints(current: number, max: number): void {
    this._state.actionPoints = current;
    this._state.maxActionPoints = max;
    this.updateUI();
  }
}
