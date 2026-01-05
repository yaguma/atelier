/**
 * カードコンポーネント
 * @description 採取地・レシピ・強化カードの共通表示コンポーネント
 * @module presentation/components
 */

import { UIComponent } from '../UIComponent';

/**
 * カードタイプ
 */
export type CardType = 'gathering' | 'recipe' | 'enhancement';

/**
 * カードデータ
 */
export interface CardData {
  /** カードID */
  id: string;
  /** カードタイプ */
  type: CardType;
  /** カード名 */
  name: string;
  /** コスト */
  cost: number;
  /** 説明 */
  description: string;
  /** 素材リスト（採取地カード用） */
  materials?: string[];
  /** 必要素材リスト（レシピカード用） */
  requiredMaterials?: string[];
  /** 品質（レシピカード用） */
  quality?: number;
  /** 効果（強化カード用） */
  effect?: string;
}

/**
 * カードコンポーネントクラス
 */
export class CardComponent extends UIComponent {
  /** カードデータ */
  private _cardData: CardData;

  /** 選択状態 */
  private _isSelected: boolean = false;

  /** 無効状態 */
  private _isDisabled: boolean = false;

  /** クリックコールバック */
  private _onClickCallback: ((cardId: string) => void) | null = null;

  /** 初期化済みフラグ */
  private _initialized: boolean = false;

  constructor(cardData: CardData) {
    super();
    this._cardData = cardData;
    this.initializeElement();
  }

  /**
   * 要素を初期化（コンストラクタ後に呼び出し）
   */
  private initializeElement(): void {
    const element = this.getElement();
    element.className = `card card-${this._cardData.type}`;
    element.dataset.cardId = this._cardData.id;
    this._initialized = true;
  }

  /**
   * DOM要素を作成
   */
  protected createElement(): HTMLElement {
    const element = document.createElement('div');
    element.className = 'card';
    return element;
  }

  /**
   * マウント時の処理
   */
  mount(container: HTMLElement): void {
    this.buildContent();
    this.setupEventListeners();
    super.mount(container);
  }

  /**
   * コンテンツを構築
   */
  private buildContent(): void {
    const element = this.getElement();
    element.innerHTML = '';

    // コスト表示
    const costDisplay = document.createElement('div');
    costDisplay.className = 'card-cost';
    costDisplay.textContent = String(this._cardData.cost);
    element.appendChild(costDisplay);

    // カード名
    const nameDisplay = document.createElement('div');
    nameDisplay.className = 'card-name';
    nameDisplay.textContent = this._cardData.name;
    element.appendChild(nameDisplay);

    // 説明
    const descDisplay = document.createElement('div');
    descDisplay.className = 'card-description';
    descDisplay.textContent = this._cardData.description;
    element.appendChild(descDisplay);

    // タイプ別コンテンツ
    switch (this._cardData.type) {
      case 'gathering':
        this.buildGatheringContent(element);
        break;
      case 'recipe':
        this.buildRecipeContent(element);
        break;
      case 'enhancement':
        this.buildEnhancementContent(element);
        break;
    }
  }

  /**
   * 採取地カードのコンテンツを構築
   */
  private buildGatheringContent(element: HTMLElement): void {
    if (this._cardData.materials && this._cardData.materials.length > 0) {
      const materialsDisplay = document.createElement('div');
      materialsDisplay.className = 'card-materials';

      this._cardData.materials.forEach((material) => {
        const materialItem = document.createElement('span');
        materialItem.className = 'material-item';
        materialItem.textContent = material;
        materialsDisplay.appendChild(materialItem);
      });

      element.appendChild(materialsDisplay);
    }
  }

  /**
   * レシピカードのコンテンツを構築
   */
  private buildRecipeContent(element: HTMLElement): void {
    // 必要素材
    if (
      this._cardData.requiredMaterials &&
      this._cardData.requiredMaterials.length > 0
    ) {
      const requirementsDisplay = document.createElement('div');
      requirementsDisplay.className = 'card-requirements';

      this._cardData.requiredMaterials.forEach((material) => {
        const materialItem = document.createElement('span');
        materialItem.className = 'requirement-item';
        materialItem.textContent = material;
        requirementsDisplay.appendChild(materialItem);
      });

      element.appendChild(requirementsDisplay);
    }

    // 品質
    if (this._cardData.quality !== undefined) {
      const qualityDisplay = document.createElement('div');
      qualityDisplay.className = 'card-quality';
      qualityDisplay.textContent = `品質: ${this._cardData.quality}`;
      element.appendChild(qualityDisplay);
    }
  }

  /**
   * 強化カードのコンテンツを構築
   */
  private buildEnhancementContent(element: HTMLElement): void {
    if (this._cardData.effect) {
      const effectDisplay = document.createElement('div');
      effectDisplay.className = 'card-effect';
      effectDisplay.textContent = this._cardData.effect;
      element.appendChild(effectDisplay);
    }
  }

  /**
   * イベントリスナーを設定
   */
  private setupEventListeners(): void {
    const element = this.getElement();

    // クリックイベント
    element.addEventListener('click', () => this.handleClick());

    // ホバーイベント
    element.addEventListener('mouseenter', () => this.handleMouseEnter());
    element.addEventListener('mouseleave', () => this.handleMouseLeave());
  }

  /**
   * クリックハンドラ
   */
  private handleClick(): void {
    if (this._isDisabled) {
      return;
    }

    if (this._onClickCallback) {
      this._onClickCallback(this._cardData.id);
    }
  }

  /**
   * マウスエンターハンドラ
   */
  private handleMouseEnter(): void {
    const element = this.getElement();
    element.classList.add('hovered');
  }

  /**
   * マウスリーブハンドラ
   */
  private handleMouseLeave(): void {
    const element = this.getElement();
    element.classList.remove('hovered');
  }

  /**
   * 選択状態を設定
   */
  setSelected(selected: boolean): void {
    this._isSelected = selected;
    const element = this.getElement();

    if (selected) {
      element.classList.add('selected');
    } else {
      element.classList.remove('selected');
    }
  }

  /**
   * 無効状態を設定
   */
  setDisabled(disabled: boolean): void {
    this._isDisabled = disabled;
    const element = this.getElement();

    if (disabled) {
      element.classList.add('disabled');
    } else {
      element.classList.remove('disabled');
    }
  }

  /**
   * クリックコールバックを設定
   */
  onClick(callback: (cardId: string) => void): void {
    this._onClickCallback = callback;
  }

  /**
   * カードデータを取得
   */
  getCardData(): CardData {
    return { ...this._cardData };
  }

  /**
   * 選択状態を取得
   */
  isSelected(): boolean {
    return this._isSelected;
  }

  /**
   * 無効状態を取得
   */
  isDisabled(): boolean {
    return this._isDisabled;
  }
}
