/**
 * 依頼受注フェーズUI
 * @description 依頼一覧表示・選択・受注を行うフェーズUI
 * @module presentation/phases
 */

import { UIComponent } from '../UIComponent';

/**
 * 依頼データ
 */
export interface QuestData {
  /** 依頼ID */
  id: string;
  /** 依頼名 */
  name: string;
  /** 説明 */
  description: string;
  /** 報酬 */
  reward: number;
  /** 必要アイテム名 */
  requiredItem: string;
  /** 必要数量 */
  requiredQuantity: number;
  /** 難易度 (1-5) */
  difficulty: number;
}

/**
 * 依頼受注フェーズUIクラス
 */
export class QuestAcceptPhaseUI extends UIComponent {
  /** 利用可能な依頼一覧 */
  private _availableQuests: QuestData[] = [];

  /** 受注済み依頼一覧 */
  private _acceptedQuests: QuestData[] = [];

  /** 選択中の依頼ID */
  private _selectedQuestId: string | null = null;

  /** 同時受注上限 */
  private _maxAcceptableQuests: number = 3;

  /** 依頼受注コールバック */
  private _onQuestAcceptCallback: ((questId: string) => void) | null = null;

  /** 次フェーズコールバック */
  private _onNextPhaseCallback: (() => void) | null = null;

  constructor() {
    super();
  }

  /**
   * DOM要素を作成
   */
  protected createElement(): HTMLElement {
    const element = document.createElement('div');
    element.className = 'quest-accept-phase';
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

    // フェーズタイトル
    const title = document.createElement('h2');
    title.className = 'phase-title';
    title.textContent = '依頼受注';
    element.appendChild(title);

    // 依頼一覧コンテナ
    const questListSection = document.createElement('div');
    questListSection.className = 'quest-list-section';

    const questListTitle = document.createElement('h3');
    questListTitle.textContent = '利用可能な依頼';
    questListSection.appendChild(questListTitle);

    const questList = document.createElement('div');
    questList.className = 'quest-list';
    this._availableQuests.forEach((quest) => {
      const card = this.createQuestCard(quest);
      questList.appendChild(card);
    });
    questListSection.appendChild(questList);

    element.appendChild(questListSection);

    // 受注ボタン
    const acceptBtn = document.createElement('button');
    acceptBtn.className = 'accept-quest-btn';
    acceptBtn.textContent = '依頼を受注';
    acceptBtn.disabled = this._selectedQuestId === null || this.isAcceptDisabled();
    acceptBtn.addEventListener('click', () => this.handleAcceptClick());
    element.appendChild(acceptBtn);

    // 受注済み依頼一覧
    const acceptedSection = document.createElement('div');
    acceptedSection.className = 'accepted-quests-section';

    const acceptedTitle = document.createElement('h3');
    acceptedTitle.textContent = `受注済み依頼 (${this._acceptedQuests.length}/${this._maxAcceptableQuests})`;
    acceptedSection.appendChild(acceptedTitle);

    const acceptedList = document.createElement('div');
    acceptedList.className = 'accepted-quests';
    this._acceptedQuests.forEach((quest) => {
      const item = document.createElement('div');
      item.className = 'accepted-quest-item';
      item.textContent = quest.name;
      acceptedList.appendChild(item);
    });
    acceptedSection.appendChild(acceptedList);

    element.appendChild(acceptedSection);

    // 次フェーズボタン
    const nextPhaseBtn = document.createElement('button');
    nextPhaseBtn.className = 'next-phase-btn';
    nextPhaseBtn.textContent = '次のフェーズへ';
    nextPhaseBtn.disabled = this._acceptedQuests.length === 0;
    nextPhaseBtn.addEventListener('click', () => this.handleNextPhaseClick());
    element.appendChild(nextPhaseBtn);
  }

  /**
   * 依頼カードを作成
   */
  private createQuestCard(quest: QuestData): HTMLElement {
    const card = document.createElement('div');
    card.className = 'quest-card';
    card.dataset.questId = quest.id;

    // 受注済みチェック
    const isAccepted = this._acceptedQuests.some((q) => q.id === quest.id);
    if (isAccepted) {
      card.classList.add('accepted');
    }

    // 選択状態チェック
    if (this._selectedQuestId === quest.id) {
      card.classList.add('selected');
    }

    // 依頼名
    const nameEl = document.createElement('div');
    nameEl.className = 'quest-name';
    nameEl.textContent = quest.name;
    card.appendChild(nameEl);

    // 説明
    const descEl = document.createElement('div');
    descEl.className = 'quest-description';
    descEl.textContent = quest.description;
    card.appendChild(descEl);

    // 必要アイテム
    const requireEl = document.createElement('div');
    requireEl.className = 'quest-requirement';
    requireEl.textContent = `必要: ${quest.requiredItem} × ${quest.requiredQuantity}`;
    card.appendChild(requireEl);

    // 報酬
    const rewardEl = document.createElement('div');
    rewardEl.className = 'quest-reward';
    rewardEl.textContent = `報酬: ${quest.reward}G`;
    card.appendChild(rewardEl);

    // 難易度
    const difficultyEl = document.createElement('div');
    difficultyEl.className = 'quest-difficulty';
    difficultyEl.textContent = '★'.repeat(quest.difficulty) + '☆'.repeat(5 - quest.difficulty);
    card.appendChild(difficultyEl);

    // クリックイベント
    card.addEventListener('click', () => {
      if (!isAccepted) {
        this.selectQuest(quest.id);
      }
    });

    return card;
  }

  /**
   * 依頼を選択
   */
  private selectQuest(questId: string): void {
    this._selectedQuestId = questId;
    this.updateUI();
  }

  /**
   * 受注が無効かどうか
   */
  private isAcceptDisabled(): boolean {
    // 選択中の依頼が既に受注済み
    if (this._acceptedQuests.some((q) => q.id === this._selectedQuestId)) {
      return true;
    }
    // 上限に達している
    if (this._acceptedQuests.length >= this._maxAcceptableQuests) {
      return true;
    }
    return false;
  }

  /**
   * 受注ボタンクリック処理
   */
  private handleAcceptClick(): void {
    if (this._selectedQuestId && this._onQuestAcceptCallback) {
      this._onQuestAcceptCallback(this._selectedQuestId);
    }
  }

  /**
   * 次フェーズボタンクリック処理
   */
  private handleNextPhaseClick(): void {
    if (this._onNextPhaseCallback) {
      this._onNextPhaseCallback();
    }
  }

  /**
   * UIを更新
   */
  private updateUI(): void {
    const element = this.getElement();
    if (!element.parentElement) return;

    // 選択状態を更新
    const cards = element.querySelectorAll('.quest-card');
    cards.forEach((card) => {
      const questId = (card as HTMLElement).dataset.questId;
      if (questId === this._selectedQuestId) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
    });

    // 受注ボタンの状態を更新
    const acceptBtn = element.querySelector('.accept-quest-btn') as HTMLButtonElement;
    if (acceptBtn) {
      acceptBtn.disabled = this._selectedQuestId === null || this.isAcceptDisabled();
    }
  }

  /**
   * 利用可能な依頼を設定
   */
  setAvailableQuests(quests: QuestData[]): void {
    this._availableQuests = [...quests];
  }

  /**
   * 受注済み依頼を設定
   */
  setAcceptedQuests(quests: QuestData[]): void {
    this._acceptedQuests = [...quests];
  }

  /**
   * 同時受注上限を設定
   */
  setMaxAcceptableQuests(max: number): void {
    this._maxAcceptableQuests = max;
  }

  /**
   * 選択中の依頼IDを取得
   */
  getSelectedQuestId(): string | null {
    return this._selectedQuestId;
  }

  /**
   * 依頼受注コールバックを設定
   */
  onQuestAccept(callback: (questId: string) => void): void {
    this._onQuestAcceptCallback = callback;
  }

  /**
   * 次フェーズコールバックを設定
   */
  onNextPhase(callback: () => void): void {
    this._onNextPhaseCallback = callback;
  }
}
