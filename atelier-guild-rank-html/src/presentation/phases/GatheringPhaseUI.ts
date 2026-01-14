/**
 * ドラフト採取フェーズUI
 * @description ドラフト形式でカードを選択し素材を獲得するフェーズUI
 * @module presentation/phases
 */

import { UIComponent } from '../UIComponent';

/**
 * 素材データ
 */
export interface MaterialData {
  /** 素材名 */
  name: string;
  /** 数量 */
  quantity: number;
}

/**
 * ドラフトカードデータ
 */
export interface DraftCardData {
  /** カードID */
  id: string;
  /** 採取地名 */
  name: string;
  /** 獲得できる素材リスト */
  materials: MaterialData[];
}

/**
 * 獲得素材データ
 */
export interface GatheredMaterial {
  /** 素材名 */
  name: string;
  /** 数量 */
  quantity: number;
}

/**
 * ドラフト採取フェーズUIクラス
 */
export class GatheringPhaseUI extends UIComponent {
  /** ドラフトカード一覧 */
  private _draftCards: DraftCardData[] = [];

  /** 選択中のカードID */
  private _selectedCardId: string | null = null;

  /** 現在のラウンド */
  private _currentRound: number = 1;

  /** 最大ラウンド */
  private _maxRound: number = 3;

  /** 全ラウンド完了フラグ */
  private _allRoundsCompleted: boolean = false;

  /** 採取コールバック */
  private _onGatherCallback: ((cardId: string) => void) | null = null;

  /** 次ラウンドコールバック */
  private _onNextRoundCallback: (() => void) | null = null;

  /** 次フェーズコールバック */
  private _onNextPhaseCallback: (() => void) | null = null;

  /** 獲得素材表示中フラグ */
  private _showingGatheredMaterials: boolean = false;

  /** 獲得素材リスト */
  private _gatheredMaterials: GatheredMaterial[] = [];

  constructor() {
    super();
  }

  /**
   * DOM要素を作成
   */
  protected createElement(): HTMLElement {
    const element = document.createElement('div');
    element.className = 'gathering-phase';
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
    title.textContent = 'ドラフト採取';
    element.appendChild(title);

    // ラウンド表示
    const roundDisplay = document.createElement('div');
    roundDisplay.className = 'round-display';
    roundDisplay.textContent = `ラウンド ${this._currentRound}/${this._maxRound}`;
    element.appendChild(roundDisplay);

    // ドラフトカードコンテナ
    const cardContainer = document.createElement('div');
    cardContainer.className = 'draft-card-container';

    this._draftCards.forEach((card) => {
      const cardEl = this.createDraftCard(card);
      cardContainer.appendChild(cardEl);
    });

    element.appendChild(cardContainer);

    // 獲得素材表示エリア
    const gatheredDisplay = document.createElement('div');
    gatheredDisplay.className = 'gathered-materials';
    if (this._showingGatheredMaterials) {
      gatheredDisplay.classList.add('animating');
      this._gatheredMaterials.forEach((mat) => {
        const matEl = document.createElement('div');
        matEl.className = 'gathered-material-item';
        matEl.textContent = `${mat.name} ×${mat.quantity}`;
        gatheredDisplay.appendChild(matEl);
      });
    }
    element.appendChild(gatheredDisplay);

    // ボタンエリア
    const buttonArea = document.createElement('div');
    buttonArea.className = 'button-area';

    if (this._allRoundsCompleted) {
      // 全ラウンド終了時：次フェーズボタン
      const nextPhaseBtn = document.createElement('button');
      nextPhaseBtn.className = 'next-phase-btn';
      nextPhaseBtn.textContent = '次のフェーズへ';
      nextPhaseBtn.addEventListener('click', () => this.handleNextPhaseClick());
      buttonArea.appendChild(nextPhaseBtn);
    } else {
      // 採取ボタン
      const gatherBtn = document.createElement('button');
      gatherBtn.className = 'gather-btn';
      gatherBtn.textContent = '選択して採取';
      gatherBtn.disabled = this._selectedCardId === null;
      gatherBtn.addEventListener('click', () => this.handleGatherClick());
      buttonArea.appendChild(gatherBtn);

      // 次ラウンドボタン
      const nextRoundBtn = document.createElement('button');
      nextRoundBtn.className = 'next-round-btn';
      nextRoundBtn.textContent = '次のラウンドへ';
      nextRoundBtn.addEventListener('click', () => this.handleNextRoundClick());
      buttonArea.appendChild(nextRoundBtn);
    }

    element.appendChild(buttonArea);
  }

  /**
   * ドラフトカードを作成
   */
  private createDraftCard(card: DraftCardData): HTMLElement {
    const cardEl = document.createElement('div');
    cardEl.className = 'draft-card';
    cardEl.dataset.cardId = card.id;

    // 選択状態チェック
    if (this._selectedCardId === card.id) {
      cardEl.classList.add('selected');
    }

    // 採取地名
    const nameEl = document.createElement('div');
    nameEl.className = 'draft-card-name';
    nameEl.textContent = card.name;
    cardEl.appendChild(nameEl);

    // 素材リスト
    const materialsEl = document.createElement('div');
    materialsEl.className = 'draft-card-materials';
    card.materials.forEach((mat) => {
      const matEl = document.createElement('div');
      matEl.className = 'draft-card-material';
      matEl.textContent = `${mat.name} ×${mat.quantity}`;
      materialsEl.appendChild(matEl);
    });
    cardEl.appendChild(materialsEl);

    // クリックイベント
    cardEl.addEventListener('click', () => {
      this.selectCard(card.id);
    });

    return cardEl;
  }

  /**
   * カードを選択
   */
  private selectCard(cardId: string): void {
    this._selectedCardId = cardId;
    this.updateUI();
  }

  /**
   * 採取ボタンクリック処理
   */
  private handleGatherClick(): void {
    if (this._selectedCardId && this._onGatherCallback) {
      this._onGatherCallback(this._selectedCardId);
    }
  }

  /**
   * 次ラウンドボタンクリック処理
   */
  private handleNextRoundClick(): void {
    if (this._onNextRoundCallback) {
      this._onNextRoundCallback();
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
    const cards = element.querySelectorAll('.draft-card');
    cards.forEach((card) => {
      const cardId = (card as HTMLElement).dataset.cardId;
      if (cardId === this._selectedCardId) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
    });

    // 採取ボタンの状態を更新
    const gatherBtn = element.querySelector('.gather-btn') as HTMLButtonElement;
    if (gatherBtn) {
      gatherBtn.disabled = this._selectedCardId === null;
    }

    // ラウンド表示を更新
    const roundDisplay = element.querySelector('.round-display');
    if (roundDisplay) {
      roundDisplay.textContent = `ラウンド ${this._currentRound}/${this._maxRound}`;
    }
  }

  /**
   * ドラフトカードを設定
   */
  setDraftCards(cards: DraftCardData[]): void {
    this._draftCards = [...cards];
    this._selectedCardId = null;
    // マウントされている場合は再描画
    const element = this.getElement();
    if (element.parentElement) {
      this.buildContent();
    }
  }

  /**
   * ラウンドを設定
   */
  setRound(current: number, max: number): void {
    this._currentRound = current;
    this._maxRound = max;
    this.updateUI();
  }

  /**
   * 全ラウンド完了を設定
   */
  setAllRoundsCompleted(completed: boolean): void {
    this._allRoundsCompleted = completed;
  }

  /**
   * 選択中のカードIDを取得
   */
  getSelectedCardId(): string | null {
    return this._selectedCardId;
  }

  /**
   * 獲得素材を表示
   */
  showGatheredMaterials(materials: GatheredMaterial[]): void {
    this._showingGatheredMaterials = true;
    this._gatheredMaterials = [...materials];

    const element = this.getElement();
    const gatheredDisplay = element.querySelector('.gathered-materials');
    if (gatheredDisplay) {
      gatheredDisplay.innerHTML = '';
      gatheredDisplay.classList.add('animating');

      materials.forEach((mat) => {
        const matEl = document.createElement('div');
        matEl.className = 'gathered-material-item';
        matEl.textContent = `${mat.name} ×${mat.quantity}`;
        gatheredDisplay.appendChild(matEl);
      });
    }
  }

  /**
   * 獲得素材表示をクリア
   */
  clearGatheredMaterials(): void {
    this._showingGatheredMaterials = false;
    this._gatheredMaterials = [];

    const element = this.getElement();
    const gatheredDisplay = element.querySelector('.gathered-materials');
    if (gatheredDisplay) {
      gatheredDisplay.innerHTML = '';
      gatheredDisplay.classList.remove('animating');
    }
  }

  /**
   * 採取コールバックを設定
   */
  onGather(callback: (cardId: string) => void): void {
    this._onGatherCallback = callback;
  }

  /**
   * 次ラウンドコールバックを設定
   */
  onNextRound(callback: () => void): void {
    this._onNextRoundCallback = callback;
  }

  /**
   * 次フェーズコールバックを設定
   */
  onNextPhase(callback: () => void): void {
    this._onNextPhaseCallback = callback;
  }
}
