/**
 * 納品フェーズUI
 * @description 受注中依頼の納品を行うフェーズUI
 * @module presentation/phases
 */

import { UIComponent } from '../UIComponent';

/**
 * 受注中依頼データ
 */
export interface AcceptedQuestData {
  /** 依頼ID */
  id: string;
  /** 依頼名 */
  name: string;
  /** 必要アイテム名 */
  requiredItem: string;
  /** 必要数量 */
  requiredQuantity: number;
  /** 報酬 */
  reward: number;
}

/**
 * 所持アイテムデータ
 */
export interface InventoryItem {
  /** アイテム名 */
  name: string;
  /** 所持数量 */
  quantity: number;
  /** 品質 */
  quality: number;
}

/**
 * 納品結果データ
 */
export interface DeliveryResult {
  /** 依頼ID */
  questId: string;
  /** 報酬ゴールド */
  reward: number;
  /** ランクポイント */
  rankPoints: number;
  /** 成功フラグ */
  success: boolean;
}

/**
 * 納品フェーズUIクラス
 */
export class DeliveryPhaseUI extends UIComponent {
  /** 受注中依頼一覧 */
  private _acceptedQuests: AcceptedQuestData[] = [];

  /** 所持アイテム */
  private _inventory: InventoryItem[] = [];

  /** 選択中の依頼ID */
  private _selectedQuestId: string | null = null;

  /** 納品コールバック */
  private _onDeliverCallback: ((questId: string) => void) | null = null;

  /** 1日を終えるコールバック */
  private _onEndDayCallback: (() => void) | null = null;

  /** 次フェーズコールバック（BUG-0001修正） */
  private _onNextPhaseCallback: (() => void) | null = null;

  /** 納品結果表示中フラグ */
  private _showingResult: boolean = false;

  /** 納品結果 */
  private _deliveryResult: DeliveryResult | null = null;

  constructor() {
    super();
  }

  /**
   * DOM要素を作成
   */
  protected createElement(): HTMLElement {
    const element = document.createElement('div');
    element.className = 'delivery-phase';
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
    title.textContent = '納品';
    element.appendChild(title);

    // メインコンテナ
    const mainContainer = document.createElement('div');
    mainContainer.className = 'delivery-main-container';

    // 左側：依頼一覧
    const questSection = document.createElement('div');
    questSection.className = 'quest-section';

    const questTitle = document.createElement('h3');
    questTitle.textContent = '受注中の依頼';
    questSection.appendChild(questTitle);

    const questList = document.createElement('div');
    questList.className = 'quest-list';
    this._acceptedQuests.forEach((quest) => {
      const card = this.createQuestCard(quest);
      questList.appendChild(card);
    });
    questSection.appendChild(questList);

    mainContainer.appendChild(questSection);

    // 右側：所持アイテムと納品状態
    const rightSection = document.createElement('div');
    rightSection.className = 'delivery-right-section';

    // 所持アイテム
    const inventorySection = document.createElement('div');
    inventorySection.className = 'inventory-section';

    const inventoryTitle = document.createElement('h3');
    inventoryTitle.textContent = '所持アイテム';
    inventorySection.appendChild(inventoryTitle);

    const inventoryList = document.createElement('div');
    inventoryList.className = 'inventory-list';
    this._inventory.forEach((item) => {
      const itemEl = document.createElement('div');
      itemEl.className = 'inventory-item';
      itemEl.textContent = `${item.name}: ${item.quantity}個 (品質: ${item.quality})`;
      inventoryList.appendChild(itemEl);
    });
    inventorySection.appendChild(inventoryList);

    rightSection.appendChild(inventorySection);

    // 納品可否状態
    if (this._selectedQuestId) {
      const statusDisplay = this.createDeliveryStatus();
      rightSection.appendChild(statusDisplay);
    }

    mainContainer.appendChild(rightSection);
    element.appendChild(mainContainer);

    // 納品結果表示
    if (this._showingResult && this._deliveryResult) {
      const resultDisplay = this.createResultDisplay();
      element.appendChild(resultDisplay);
    }

    // ボタンエリア
    const buttonArea = document.createElement('div');
    buttonArea.className = 'button-area';

    // 納品ボタン
    const deliverBtn = document.createElement('button');
    deliverBtn.className = 'deliver-btn';
    deliverBtn.textContent = '納品する';
    deliverBtn.disabled = !this.canDeliver();
    deliverBtn.addEventListener('click', () => this.handleDeliverClick());
    buttonArea.appendChild(deliverBtn);

    // 1日を終えるボタン
    const endDayBtn = document.createElement('button');
    endDayBtn.className = 'end-day-btn';
    endDayBtn.textContent = '1日を終える';
    endDayBtn.addEventListener('click', () => this.handleEndDayClick());
    buttonArea.appendChild(endDayBtn);

    element.appendChild(buttonArea);
  }

  /**
   * 依頼カードを作成
   */
  private createQuestCard(quest: AcceptedQuestData): HTMLElement {
    const card = document.createElement('div');
    card.className = 'quest-card';
    card.dataset.questId = quest.id;

    if (this._selectedQuestId === quest.id) {
      card.classList.add('selected');
    }

    // 依頼名
    const nameEl = document.createElement('div');
    nameEl.className = 'quest-name';
    nameEl.textContent = quest.name;
    card.appendChild(nameEl);

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

    // クリックイベント
    card.addEventListener('click', () => {
      this.selectQuest(quest.id);
    });

    return card;
  }

  /**
   * 納品可否状態を作成
   */
  private createDeliveryStatus(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'delivery-status';

    const selectedQuest = this._acceptedQuests.find((q) => q.id === this._selectedQuestId);
    if (selectedQuest) {
      const inventoryItem = this._inventory.find((i) => i.name === selectedQuest.requiredItem);
      const currentQty = inventoryItem?.quantity ?? 0;
      const canDeliver = currentQty >= selectedQuest.requiredQuantity;

      if (canDeliver) {
        container.classList.add('can-deliver');
      } else {
        container.classList.add('cannot-deliver');
      }

      const statusText = document.createElement('div');
      statusText.className = 'status-text';
      statusText.textContent = canDeliver
        ? '✓ 納品可能'
        : `✗ ${selectedQuest.requiredItem}が${selectedQuest.requiredQuantity - currentQty}個不足`;
      container.appendChild(statusText);

      const quantityInfo = document.createElement('div');
      quantityInfo.className = 'quantity-info';
      quantityInfo.textContent = `所持: ${currentQty}個 / 必要: ${selectedQuest.requiredQuantity}個`;
      container.appendChild(quantityInfo);
    }

    return container;
  }

  /**
   * 納品結果表示を作成
   */
  private createResultDisplay(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'delivery-result animating';

    const rewardText = document.createElement('div');
    rewardText.className = 'reward-gained';
    rewardText.textContent = `報酬: ${this._deliveryResult!.reward}G 獲得！`;
    container.appendChild(rewardText);

    const rankPointsText = document.createElement('div');
    rankPointsText.className = 'rank-points-gained';
    rankPointsText.textContent = `ランクポイント: +${this._deliveryResult!.rankPoints}`;
    container.appendChild(rankPointsText);

    return container;
  }

  /**
   * 依頼を選択
   */
  private selectQuest(questId: string): void {
    this._selectedQuestId = questId;
    this.updateUI();
  }

  /**
   * 納品可能かどうか
   */
  private canDeliver(): boolean {
    if (!this._selectedQuestId) return false;

    const selectedQuest = this._acceptedQuests.find((q) => q.id === this._selectedQuestId);
    if (!selectedQuest) return false;

    const inventoryItem = this._inventory.find((i) => i.name === selectedQuest.requiredItem);
    const currentQty = inventoryItem?.quantity ?? 0;

    return currentQty >= selectedQuest.requiredQuantity;
  }

  /**
   * 納品ボタンクリック処理
   */
  private handleDeliverClick(): void {
    if (this._selectedQuestId && this._onDeliverCallback) {
      this._onDeliverCallback(this._selectedQuestId);
    }
  }

  /**
   * 1日を終えるボタンクリック処理
   */
  private handleEndDayClick(): void {
    if (this._onEndDayCallback) {
      this._onEndDayCallback();
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

    // 納品可否状態を更新
    const oldStatus = element.querySelector('.delivery-status');
    if (oldStatus) {
      oldStatus.remove();
    }
    if (this._selectedQuestId) {
      const rightSection = element.querySelector('.delivery-right-section');
      if (rightSection) {
        const statusDisplay = this.createDeliveryStatus();
        rightSection.appendChild(statusDisplay);
      }
    }

    // 納品ボタンの状態を更新
    const deliverBtn = element.querySelector('.deliver-btn') as HTMLButtonElement;
    if (deliverBtn) {
      deliverBtn.disabled = !this.canDeliver();
    }
  }

  /**
   * 受注中依頼を設定
   */
  setAcceptedQuests(quests: AcceptedQuestData[]): void {
    this._acceptedQuests = [...quests];
    this._selectedQuestId = null;
  }

  /**
   * 所持アイテムを設定
   */
  setInventory(inventory: InventoryItem[]): void {
    this._inventory = [...inventory];
  }

  /**
   * 選択中の依頼IDを取得
   */
  getSelectedQuestId(): string | null {
    return this._selectedQuestId;
  }

  /**
   * 納品結果を表示
   */
  showDeliveryResult(result: DeliveryResult): void {
    this._showingResult = true;
    this._deliveryResult = result;
    this.rebuildContent();
  }

  /**
   * 納品結果表示をクリア
   */
  clearDeliveryResult(): void {
    this._showingResult = false;
    this._deliveryResult = null;
    this.rebuildContent();
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
   * 納品コールバックを設定
   */
  onDeliver(callback: (questId: string) => void): void {
    this._onDeliverCallback = callback;
  }

  /**
   * 1日を終えるコールバックを設定
   */
  onEndDay(callback: () => void): void {
    this._onEndDayCallback = callback;
  }

  /**
   * 次フェーズコールバックを設定（BUG-0001修正）
   * 納品フェーズでは日終了と同義
   */
  onNextPhase(callback: () => void): void {
    this._onNextPhaseCallback = callback;
  }
}
