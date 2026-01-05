/**
 * 昇格試験画面
 * @description 昇格試験の課題表示・アーティファクト選択を行う画面
 * @module presentation/screens
 */

import { UIComponent } from '../UIComponent';
import { Screen, ScreenId } from '../ScreenManager';

/**
 * 試験課題データ
 */
export interface ExamChallenge {
  /** 目標ランク */
  targetRank: string;
  /** 課題説明 */
  description: string;
  /** 目標アイテム */
  targetItem: string;
  /** 必要数量 */
  requiredQuantity: number;
  /** 必要品質 */
  requiredQuality: number;
  /** 制限日数 */
  timeLimitDays: number;
}

/**
 * アーティファクト選択肢
 */
export interface ArtifactChoice {
  /** アーティファクトID */
  id: string;
  /** アーティファクト名 */
  name: string;
  /** 説明 */
  description: string;
  /** 効果 */
  effect: string;
}

/**
 * 試験結果
 */
export interface ExamResult {
  /** 成功フラグ */
  success: boolean;
  /** 新ランク */
  newRank: string;
  /** ランクポイント */
  rankPoints: number;
}

/**
 * 昇格試験画面クラス
 */
export class RankUpScreen extends UIComponent implements Screen {
  /** 画面ID */
  readonly id: ScreenId = 'rankUp';

  /** 画面名 */
  readonly name: string = '昇格試験';

  /** 試験課題 */
  private _challenge: ExamChallenge | null = null;

  /** 残り日数 */
  private _remainingDays: number = 0;

  /** アーティファクト選択肢 */
  private _artifacts: ArtifactChoice[] = [];

  /** 選択中のアーティファクトID */
  private _selectedArtifactId: string | null = null;

  /** 試験結果 */
  private _examResult: ExamResult | null = null;

  /** 試験開始コールバック */
  private _onStartExamCallback: (() => void) | null = null;

  /** アーティファクト選択コールバック */
  private _onSelectArtifactCallback: ((artifactId: string) => void) | null = null;

  /** 試験失敗コールバック */
  private _onExamFailedCallback: (() => void) | null = null;

  /** 戻るコールバック */
  private _onBackCallback: (() => void) | null = null;

  constructor() {
    super();
  }

  /**
   * DOM要素を作成
   */
  protected createElement(): HTMLElement {
    const element = document.createElement('div');
    element.className = 'rank-up-screen';
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

    // ヘッダー
    const header = document.createElement('div');
    header.className = 'rank-up-header';

    // 戻るボタン
    const backBtn = document.createElement('button');
    backBtn.className = 'back-btn';
    backBtn.textContent = '← 戻る';
    backBtn.addEventListener('click', () => this.handleBackClick());
    header.appendChild(backBtn);

    // タイトル
    const title = document.createElement('h2');
    title.className = 'screen-title';
    title.textContent = '昇格試験';
    header.appendChild(title);

    element.appendChild(header);

    // 試験結果表示（成功時）
    if (this._examResult && this._examResult.success) {
      this.buildRewardDisplay(element);
      return;
    }

    // 試験結果表示（失敗時）
    if (this._examResult && !this._examResult.success) {
      this.buildFailedDisplay(element);
      return;
    }

    // 通常表示（試験前）
    if (this._challenge) {
      this.buildChallengeDisplay(element);
    }
  }

  /**
   * 試験課題表示を構築
   */
  private buildChallengeDisplay(element: HTMLElement): void {
    if (!this._challenge) return;

    // 目標ランク
    const rankDisplay = document.createElement('div');
    rankDisplay.className = 'target-rank';
    rankDisplay.innerHTML = `<span class="label">目標ランク:</span> <span class="rank">${this._challenge.targetRank}</span>`;
    element.appendChild(rankDisplay);

    // 課題表示
    const challengeDisplay = document.createElement('div');
    challengeDisplay.className = 'exam-challenge';
    challengeDisplay.textContent = this._challenge.description;
    element.appendChild(challengeDisplay);

    // 詳細条件
    const requirements = document.createElement('div');
    requirements.className = 'exam-requirements';
    requirements.innerHTML = `
      <div class="requirement-item">
        <span class="label">対象アイテム:</span> ${this._challenge.targetItem}
      </div>
      <div class="requirement-item">
        <span class="label">必要数量:</span> ${this._challenge.requiredQuantity}個
      </div>
      <div class="requirement-item">
        <span class="label">必要品質:</span> ${this._challenge.requiredQuality}以上
      </div>
    `;
    element.appendChild(requirements);

    // 制限日数
    const timeLimitDisplay = document.createElement('div');
    timeLimitDisplay.className = 'time-limit';
    timeLimitDisplay.innerHTML = `<span class="label">制限日数:</span> ${this._challenge.timeLimitDays}日`;
    element.appendChild(timeLimitDisplay);

    // 残り日数（設定されている場合）
    if (this._remainingDays > 0) {
      const remainingDisplay = document.createElement('div');
      remainingDisplay.className = 'remaining-days';
      remainingDisplay.innerHTML = `<span class="label">残り日数:</span> ${this._remainingDays}日`;
      element.appendChild(remainingDisplay);
    }

    // 試験開始ボタン
    const startBtn = document.createElement('button');
    startBtn.className = 'start-exam-btn';
    startBtn.textContent = '試験を開始する';
    startBtn.addEventListener('click', () => this.handleStartExamClick());
    element.appendChild(startBtn);
  }

  /**
   * 報酬表示を構築
   */
  private buildRewardDisplay(element: HTMLElement): void {
    if (!this._examResult) return;

    // クリア表示
    const rewardDisplay = document.createElement('div');
    rewardDisplay.className = 'exam-reward';

    const successTitle = document.createElement('h3');
    successTitle.className = 'reward-title';
    successTitle.textContent = '試験クリア！';
    rewardDisplay.appendChild(successTitle);

    const newRank = document.createElement('div');
    newRank.className = 'new-rank';
    newRank.innerHTML = `<span class="label">新ランク:</span> <span class="rank">${this._examResult.newRank}</span>`;
    rewardDisplay.appendChild(newRank);

    const rankPoints = document.createElement('div');
    rankPoints.className = 'reward-rank-points';
    rankPoints.innerHTML = `<span class="label">ランクポイント:</span> +${this._examResult.rankPoints}`;
    rewardDisplay.appendChild(rankPoints);

    element.appendChild(rewardDisplay);

    // アーティファクト選択
    if (this._artifacts.length > 0) {
      const artifactSection = document.createElement('div');
      artifactSection.className = 'artifact-selection';

      const sectionTitle = document.createElement('h3');
      sectionTitle.textContent = 'アーティファクトを選択';
      artifactSection.appendChild(sectionTitle);

      const artifactContainer = document.createElement('div');
      artifactContainer.className = 'artifact-container';

      this._artifacts.forEach((artifact) => {
        const card = this.createArtifactCard(artifact);
        artifactContainer.appendChild(card);
      });

      artifactSection.appendChild(artifactContainer);
      element.appendChild(artifactSection);
    }
  }

  /**
   * 失敗表示を構築
   */
  private buildFailedDisplay(element: HTMLElement): void {
    const failedDisplay = document.createElement('div');
    failedDisplay.className = 'exam-failed';

    const failedTitle = document.createElement('h3');
    failedTitle.className = 'failed-title';
    failedTitle.textContent = '試験失敗...';
    failedDisplay.appendChild(failedTitle);

    const failedMessage = document.createElement('p');
    failedMessage.textContent = '制限日数内に課題を達成できませんでした。';
    failedDisplay.appendChild(failedMessage);

    element.appendChild(failedDisplay);
  }

  /**
   * アーティファクトカードを作成
   */
  private createArtifactCard(artifact: ArtifactChoice): HTMLElement {
    const card = document.createElement('div');
    card.className = 'artifact-card';
    card.dataset.artifactId = artifact.id;

    if (this._selectedArtifactId === artifact.id) {
      card.classList.add('selected');
    }

    // アーティファクト名
    const nameEl = document.createElement('div');
    nameEl.className = 'artifact-name';
    nameEl.textContent = artifact.name;
    card.appendChild(nameEl);

    // 説明
    const descEl = document.createElement('div');
    descEl.className = 'artifact-description';
    descEl.textContent = artifact.description;
    card.appendChild(descEl);

    // 効果
    const effectEl = document.createElement('div');
    effectEl.className = 'artifact-effect';
    effectEl.textContent = artifact.effect;
    card.appendChild(effectEl);

    // クリックイベント
    card.addEventListener('click', () => {
      this.selectArtifact(artifact.id);
    });

    return card;
  }

  /**
   * アーティファクトを選択
   */
  private selectArtifact(artifactId: string): void {
    this._selectedArtifactId = artifactId;
    this.updateArtifactSelection();

    if (this._onSelectArtifactCallback) {
      this._onSelectArtifactCallback(artifactId);
    }
  }

  /**
   * アーティファクト選択状態を更新
   */
  private updateArtifactSelection(): void {
    const element = this.getElement();
    const cards = element.querySelectorAll('.artifact-card');
    cards.forEach((card) => {
      const artifactId = (card as HTMLElement).dataset.artifactId;
      if (artifactId === this._selectedArtifactId) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
    });
  }

  /**
   * 試験開始ボタンクリック処理
   */
  private handleStartExamClick(): void {
    if (this._onStartExamCallback) {
      this._onStartExamCallback();
    }
  }

  /**
   * 戻るボタンクリック処理
   */
  private handleBackClick(): void {
    if (this._onBackCallback) {
      this._onBackCallback();
    }
  }

  /**
   * コンテンツを再構築
   */
  private rebuildContent(): void {
    const element = this.getElement();
    if (!element.parentElement) return;
    this.buildContent();
  }

  /**
   * 試験課題を設定
   */
  setExamChallenge(challenge: ExamChallenge): void {
    this._challenge = challenge;
    this._remainingDays = challenge.timeLimitDays;
  }

  /**
   * 残り日数を設定
   */
  setRemainingDays(days: number): void {
    this._remainingDays = days;
  }

  /**
   * アーティファクト選択肢を設定
   */
  setArtifactChoices(artifacts: ArtifactChoice[]): void {
    this._artifacts = [...artifacts];
  }

  /**
   * 試験結果を表示
   */
  showExamResult(result: ExamResult): void {
    this._examResult = result;
    this.rebuildContent();

    // 失敗時はコールバックを呼ぶ
    if (!result.success && this._onExamFailedCallback) {
      this._onExamFailedCallback();
    }
  }

  /**
   * 試験開始コールバックを設定
   */
  onStartExam(callback: () => void): void {
    this._onStartExamCallback = callback;
  }

  /**
   * アーティファクト選択コールバックを設定
   */
  onSelectArtifact(callback: (artifactId: string) => void): void {
    this._onSelectArtifactCallback = callback;
  }

  /**
   * 試験失敗コールバックを設定
   */
  onExamFailed(callback: () => void): void {
    this._onExamFailedCallback = callback;
  }

  /**
   * 戻るコールバックを設定
   */
  onBack(callback: () => void): void {
    this._onBackCallback = callback;
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
