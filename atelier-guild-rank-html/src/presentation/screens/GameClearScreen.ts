/**
 * ゲームクリア画面
 * @description ゲームクリア時のリザルト表示画面
 * @module presentation/screens
 */

import { UIComponent } from '../UIComponent';
import { Screen, ScreenId } from '../ScreenManager';

/**
 * プレイ統計データ
 */
export interface GameStatistics {
  /** 総プレイ日数 */
  totalDays: number;
  /** 総依頼完了数 */
  totalQuests: number;
  /** 総調合アイテム数 */
  totalItems: number;
  /** 総獲得ゴールド */
  totalGold: number;
  /** 最高品質 */
  highestQuality: number;
}

/**
 * 称号データ
 */
export interface Achievement {
  /** 称号ID */
  id: string;
  /** 称号名 */
  name: string;
  /** 説明 */
  description: string;
  /** アイコン */
  icon: string;
}

/**
 * ゲームクリア画面クラス
 */
export class GameClearScreen extends UIComponent implements Screen {
  /** 画面ID */
  readonly id: ScreenId = 'gameClear';

  /** 画面名 */
  readonly name: string = 'ゲームクリア';

  /** 最終ランク */
  private _finalRank: string = '';

  /** プレイ統計 */
  private _statistics: GameStatistics | null = null;

  /** 称号一覧 */
  private _achievements: Achievement[] = [];

  /** タイトルへ戻るコールバック */
  private _onToTitleCallback: (() => void) | null = null;

  /** ニューゲームコールバック */
  private _onNewGameCallback: (() => void) | null = null;

  constructor() {
    super();
  }

  /**
   * DOM要素を作成
   */
  protected createElement(): HTMLElement {
    const element = document.createElement('div');
    element.className = 'game-clear-screen';
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

    // 祝福エフェクト
    const celebrationEffect = document.createElement('div');
    celebrationEffect.className = 'celebration-effect playing';
    element.appendChild(celebrationEffect);

    // タイトル
    const title = document.createElement('h1');
    title.className = 'screen-title';
    title.textContent = 'ゲームクリア';
    element.appendChild(title);

    // CONGRATULATIONSメッセージ
    const congratsMessage = document.createElement('div');
    congratsMessage.className = 'congrats-message';
    congratsMessage.textContent = 'CONGRATULATIONS!';
    element.appendChild(congratsMessage);

    // 最終ランク表示
    const rankDisplay = document.createElement('div');
    rankDisplay.className = `final-rank rank-${this._finalRank.toLowerCase()}`;
    rankDisplay.innerHTML = `
      <span class="label">最終ランク</span>
      <span class="rank">${this._finalRank}</span>
    `;
    element.appendChild(rankDisplay);

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
          <span class="stat-label">総プレイ日数</span>
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
        <div class="stat-item">
          <span class="stat-label">最高品質</span>
          <span class="stat-value">${this._statistics.highestQuality}</span>
        </div>
      `;
      statsSection.appendChild(statsList);
      element.appendChild(statsSection);
    }

    // 称号一覧
    if (this._achievements.length > 0) {
      const achievementsSection = document.createElement('div');
      achievementsSection.className = 'achievements-section';

      const achievementsTitle = document.createElement('h3');
      achievementsTitle.textContent = '獲得称号';
      achievementsSection.appendChild(achievementsTitle);

      const achievementsList = document.createElement('div');
      achievementsList.className = 'achievements-list';

      this._achievements.forEach((achievement) => {
        const card = this.createAchievementCard(achievement);
        achievementsList.appendChild(card);
      });

      achievementsSection.appendChild(achievementsList);
      element.appendChild(achievementsSection);
    }

    // ボタンエリア
    const buttonArea = document.createElement('div');
    buttonArea.className = 'button-area';

    // タイトルへ戻るボタン
    const toTitleBtn = document.createElement('button');
    toTitleBtn.className = 'to-title-btn';
    toTitleBtn.textContent = 'タイトルへ戻る';
    toTitleBtn.addEventListener('click', () => this.handleToTitleClick());
    buttonArea.appendChild(toTitleBtn);

    // ニューゲームボタン
    const newGameBtn = document.createElement('button');
    newGameBtn.className = 'new-game-btn';
    newGameBtn.textContent = 'ニューゲーム';
    newGameBtn.addEventListener('click', () => this.handleNewGameClick());
    buttonArea.appendChild(newGameBtn);

    element.appendChild(buttonArea);
  }

  /**
   * 称号カードを作成
   */
  private createAchievementCard(achievement: Achievement): HTMLElement {
    const card = document.createElement('div');
    card.className = 'achievement-card';
    card.dataset.achievementId = achievement.id;

    // アイコン
    const iconEl = document.createElement('div');
    iconEl.className = 'achievement-icon';
    iconEl.textContent = achievement.icon;
    card.appendChild(iconEl);

    // 内容
    const contentEl = document.createElement('div');
    contentEl.className = 'achievement-content';

    const nameEl = document.createElement('div');
    nameEl.className = 'achievement-name';
    nameEl.textContent = achievement.name;
    contentEl.appendChild(nameEl);

    const descEl = document.createElement('div');
    descEl.className = 'achievement-description';
    descEl.textContent = achievement.description;
    contentEl.appendChild(descEl);

    card.appendChild(contentEl);

    return card;
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
   * ニューゲームボタンクリック処理
   */
  private handleNewGameClick(): void {
    if (this._onNewGameCallback) {
      this._onNewGameCallback();
    }
  }

  /**
   * 最終ランクを設定
   */
  setFinalRank(rank: string): void {
    this._finalRank = rank;
  }

  /**
   * プレイ統計を設定
   */
  setStatistics(statistics: GameStatistics): void {
    this._statistics = { ...statistics };
  }

  /**
   * 称号を設定
   */
  setAchievements(achievements: Achievement[]): void {
    this._achievements = [...achievements];
  }

  /**
   * タイトルへ戻るコールバックを設定
   */
  onToTitle(callback: () => void): void {
    this._onToTitleCallback = callback;
  }

  /**
   * ニューゲームコールバックを設定
   */
  onNewGame(callback: () => void): void {
    this._onNewGameCallback = callback;
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
