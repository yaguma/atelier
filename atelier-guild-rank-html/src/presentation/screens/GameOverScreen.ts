/**
 * ゲームオーバー画面
 * @description ゲームオーバー時のリザルト表示画面
 * @module presentation/screens
 */

import { UIComponent } from '../UIComponent';
import { Screen, ScreenId } from '../ScreenManager';

/**
 * ゲームオーバー理由データ
 */
export interface GameOverReason {
  /** 理由タイプ */
  type: string;
  /** メッセージ */
  message: string;
}

/**
 * ゲームオーバー時の統計データ
 */
export interface GameOverStatistics {
  /** 総プレイ日数 */
  totalDays: number;
  /** 総依頼完了数 */
  totalQuests: number;
  /** 総調合アイテム数 */
  totalItems: number;
  /** 総獲得ゴールド */
  totalGold: number;
  /** 到達ランク */
  reachedRank: string;
}

/**
 * ゲームオーバー画面クラス
 */
export class GameOverScreen extends UIComponent implements Screen {
  /** 画面ID */
  readonly id: ScreenId = 'gameOver';

  /** 画面名 */
  readonly name: string = 'ゲームオーバー';

  /** 到達ランク */
  private _reachedRank: string = '';

  /** ゲームオーバー理由 */
  private _reasons: GameOverReason[] = [];

  /** プレイ統計 */
  private _statistics: GameOverStatistics | null = null;

  /** ヒント一覧 */
  private _hints: string[] = [];

  /** タイトルへ戻るコールバック */
  private _onToTitleCallback: (() => void) | null = null;

  /** リトライコールバック */
  private _onRetryCallback: (() => void) | null = null;

  constructor() {
    super();
  }

  /**
   * DOM要素を作成
   */
  protected createElement(): HTMLElement {
    const element = document.createElement('div');
    element.className = 'game-over-screen';
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

    // タイトル
    const title = document.createElement('h1');
    title.className = 'screen-title';
    title.textContent = 'ゲームオーバー';
    element.appendChild(title);

    // GAME OVERメッセージ
    const gameOverMessage = document.createElement('div');
    gameOverMessage.className = 'game-over-message';
    gameOverMessage.textContent = 'GAME OVER';
    element.appendChild(gameOverMessage);

    // 到達ランク表示
    const rankDisplay = document.createElement('div');
    rankDisplay.className = `reached-rank rank-${this._reachedRank.toLowerCase()}`;
    rankDisplay.innerHTML = `
      <span class="label">到達ランク</span>
      <span class="rank">${this._reachedRank}</span>
    `;
    element.appendChild(rankDisplay);

    // ゲームオーバー理由
    if (this._reasons.length > 0) {
      const reasonsSection = document.createElement('div');
      reasonsSection.className = 'game-over-reasons';

      const reasonsTitle = document.createElement('h3');
      reasonsTitle.textContent = 'ゲームオーバー理由';
      reasonsSection.appendChild(reasonsTitle);

      const reasonsList = document.createElement('div');
      reasonsList.className = 'reasons-list';

      this._reasons.forEach((reason) => {
        const reasonItem = document.createElement('div');
        reasonItem.className = 'reason-item';
        reasonItem.textContent = reason.message;
        reasonsList.appendChild(reasonItem);
      });

      reasonsSection.appendChild(reasonsList);
      element.appendChild(reasonsSection);
    }

    // プレイ統計
    if (this._statistics) {
      const statsSection = document.createElement('div');
      statsSection.className = 'play-statistics';

      const statsTitle = document.createElement('h3');
      statsTitle.textContent = 'プレイ統計';
      statsSection.appendChild(statsTitle);

      const statsList = document.createElement('div');
      statsList.className = 'stats-list';
      statsList.innerHTML = `
        <div class="stat-item">
          <span class="stat-label">プレイ日数</span>
          <span class="stat-value">${this._statistics.totalDays}日</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">依頼完了数</span>
          <span class="stat-value">${this._statistics.totalQuests}件</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">調合アイテム数</span>
          <span class="stat-value">${this._statistics.totalItems}個</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">獲得ゴールド</span>
          <span class="stat-value">${this._statistics.totalGold}G</span>
        </div>
      `;
      statsSection.appendChild(statsList);
      element.appendChild(statsSection);
    }

    // 次回へのヒント
    if (this._hints.length > 0) {
      const hintsSection = document.createElement('div');
      hintsSection.className = 'hints-section';

      const hintsTitle = document.createElement('h3');
      hintsTitle.textContent = '次回へのヒント';
      hintsSection.appendChild(hintsTitle);

      const hintsList = document.createElement('div');
      hintsList.className = 'hints-list';

      this._hints.forEach((hint) => {
        const hintItem = document.createElement('div');
        hintItem.className = 'hint-item';
        hintItem.textContent = `💡 ${hint}`;
        hintsList.appendChild(hintItem);
      });

      hintsSection.appendChild(hintsList);
      element.appendChild(hintsSection);
    }

    // ボタンエリア
    const buttonArea = document.createElement('div');
    buttonArea.className = 'button-area';

    // リトライボタン
    const retryBtn = document.createElement('button');
    retryBtn.className = 'retry-btn';
    retryBtn.textContent = 'リトライ';
    retryBtn.addEventListener('click', () => this.handleRetryClick());
    buttonArea.appendChild(retryBtn);

    // タイトルへ戻るボタン
    const toTitleBtn = document.createElement('button');
    toTitleBtn.className = 'to-title-btn';
    toTitleBtn.textContent = 'タイトルへ戻る';
    toTitleBtn.addEventListener('click', () => this.handleToTitleClick());
    buttonArea.appendChild(toTitleBtn);

    element.appendChild(buttonArea);
  }

  /**
   * タイトルへ戻るボタンクリック処理
   */
  private handleToTitleClick(): void {
    if (this._onToTitleCallback) {
      this._onToTitleCallback();
    }
  }

  /**
   * リトライボタンクリック処理
   */
  private handleRetryClick(): void {
    if (this._onRetryCallback) {
      this._onRetryCallback();
    }
  }

  /**
   * 到達ランクを設定
   */
  setReachedRank(rank: string): void {
    this._reachedRank = rank;
  }

  /**
   * ゲームオーバー理由を設定
   */
  setGameOverReasons(reasons: GameOverReason[]): void {
    this._reasons = [...reasons];
  }

  /**
   * プレイ統計を設定
   */
  setStatistics(statistics: GameOverStatistics): void {
    this._statistics = { ...statistics };
  }

  /**
   * ヒントを設定
   */
  setHints(hints: string[]): void {
    this._hints = [...hints];
  }

  /**
   * タイトルへ戻るコールバックを設定
   */
  onToTitle(callback: () => void): void {
    this._onToTitleCallback = callback;
  }

  /**
   * リトライコールバックを設定
   */
  onRetry(callback: () => void): void {
    this._onRetryCallback = callback;
  }

  /**
   * 画面表示時のコールバック
   */
  onEnter(): void {
    // 画面表示時の処理
  }

  /**
   * 画面非表示時のコールバック
   */
  onExit(): void {
    // 画面非表示時の処理
  }
}
