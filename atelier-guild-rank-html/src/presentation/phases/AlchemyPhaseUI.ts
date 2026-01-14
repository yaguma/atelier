/**
 * 調合フェーズUI
 * @description レシピ選択・素材確認・調合実行を行うフェーズUI
 * @module presentation/phases
 */

import { UIComponent } from '../UIComponent';

/**
 * 必要素材データ
 */
export interface RequiredMaterial {
  /** 素材名 */
  name: string;
  /** 必要数量 */
  quantity: number;
}

/**
 * レシピカードデータ
 */
export interface RecipeCardData {
  /** レシピID */
  id: string;
  /** アイテム名 */
  name: string;
  /** 必要素材リスト */
  requiredMaterials: RequiredMaterial[];
  /** 基本品質 */
  baseQuality: number;
}

/**
 * 所持素材データ
 */
export interface MaterialStock {
  /** 素材名 */
  name: string;
  /** 所持数量 */
  quantity: number;
}

/**
 * 強化カードデータ
 */
export interface EnhancementCardData {
  /** カードID */
  id: string;
  /** カード名 */
  name: string;
  /** 品質ボーナス */
  qualityBonus: number;
  /** 説明 */
  description: string;
}

/**
 * 調合結果データ
 */
export interface AlchemyResult {
  /** 完成アイテム名 */
  itemName: string;
  /** 品質 */
  quality: number;
  /** 成功フラグ */
  success: boolean;
}

/**
 * 調合フェーズUIクラス
 */
export class AlchemyPhaseUI extends UIComponent {
  /** レシピ一覧 */
  private _recipes: RecipeCardData[] = [];

  /** 所持素材 */
  private _materialStock: MaterialStock[] = [];

  /** 強化カード一覧 */
  private _enhancementCards: EnhancementCardData[] = [];

  /** 選択中のレシピID */
  private _selectedRecipeId: string | null = null;

  /** 選択中の強化カードID */
  private _selectedEnhancementId: string | null = null;

  /** 調合コールバック */
  private _onSynthesizeCallback:
    | ((recipeId: string, enhancementId: string | null) => void)
    | null = null;

  /** 次フェーズコールバック */
  private _onNextPhaseCallback: (() => void) | null = null;

  /** 調合結果表示中フラグ */
  private _showingResult: boolean = false;

  /** 調合結果 */
  private _alchemyResult: AlchemyResult | null = null;

  constructor() {
    super();
  }

  /**
   * DOM要素を作成
   */
  protected createElement(): HTMLElement {
    const element = document.createElement('div');
    element.className = 'alchemy-phase';
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
    title.textContent = '調合';
    element.appendChild(title);

    // メインコンテナ（左：レシピ、右：素材・強化）
    const mainContainer = document.createElement('div');
    mainContainer.className = 'alchemy-main-container';

    // 左側：レシピ一覧
    const recipeSection = document.createElement('div');
    recipeSection.className = 'recipe-section';

    const recipeTitle = document.createElement('h3');
    recipeTitle.textContent = 'レシピ';
    recipeSection.appendChild(recipeTitle);

    const recipeList = document.createElement('div');
    recipeList.className = 'recipe-list';
    this._recipes.forEach((recipe) => {
      const card = this.createRecipeCard(recipe);
      recipeList.appendChild(card);
    });
    recipeSection.appendChild(recipeList);

    mainContainer.appendChild(recipeSection);

    // 右側：素材・強化
    const rightSection = document.createElement('div');
    rightSection.className = 'alchemy-right-section';

    // 所持素材
    const materialSection = document.createElement('div');
    materialSection.className = 'material-stock-section';

    const materialTitle = document.createElement('h3');
    materialTitle.textContent = '所持素材';
    materialSection.appendChild(materialTitle);

    const materialList = document.createElement('div');
    materialList.className = 'material-stock';
    this._materialStock.forEach((mat) => {
      const matEl = document.createElement('div');
      matEl.className = 'material-stock-item';
      matEl.textContent = `${mat.name}: ${mat.quantity}`;
      materialList.appendChild(matEl);
    });
    materialSection.appendChild(materialList);

    rightSection.appendChild(materialSection);

    // 必要素材の過不足表示
    if (this._selectedRecipeId) {
      const requirementDisplay = this.createMaterialRequirements();
      rightSection.appendChild(requirementDisplay);
    }

    // 強化カード
    if (this._enhancementCards.length > 0) {
      const enhanceSection = document.createElement('div');
      enhanceSection.className = 'enhancement-section';

      const enhanceTitle = document.createElement('h3');
      enhanceTitle.textContent = '強化カード';
      enhanceSection.appendChild(enhanceTitle);

      const enhanceList = document.createElement('div');
      enhanceList.className = 'enhancement-list';
      this._enhancementCards.forEach((card) => {
        const cardEl = this.createEnhancementCard(card);
        enhanceList.appendChild(cardEl);
      });
      enhanceSection.appendChild(enhanceList);

      rightSection.appendChild(enhanceSection);
    }

    mainContainer.appendChild(rightSection);
    element.appendChild(mainContainer);

    // 調合結果表示
    if (this._showingResult && this._alchemyResult) {
      const resultDisplay = this.createResultDisplay();
      element.appendChild(resultDisplay);
    }

    // ボタンエリア
    const buttonArea = document.createElement('div');
    buttonArea.className = 'button-area';

    // 調合ボタン
    const synthesizeBtn = document.createElement('button');
    synthesizeBtn.className = 'synthesize-btn';
    synthesizeBtn.textContent = '調合する';
    synthesizeBtn.disabled = !this.canSynthesize();
    synthesizeBtn.addEventListener('click', () => this.handleSynthesizeClick());
    buttonArea.appendChild(synthesizeBtn);

    // 次フェーズボタン
    const nextPhaseBtn = document.createElement('button');
    nextPhaseBtn.className = 'next-phase-btn';
    nextPhaseBtn.textContent = '次のフェーズへ';
    nextPhaseBtn.addEventListener('click', () => this.handleNextPhaseClick());
    buttonArea.appendChild(nextPhaseBtn);

    element.appendChild(buttonArea);
  }

  /**
   * レシピカードを作成
   */
  private createRecipeCard(recipe: RecipeCardData): HTMLElement {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.dataset.recipeId = recipe.id;

    if (this._selectedRecipeId === recipe.id) {
      card.classList.add('selected');
    }

    // レシピ名
    const nameEl = document.createElement('div');
    nameEl.className = 'recipe-name';
    nameEl.textContent = recipe.name;
    card.appendChild(nameEl);

    // 必要素材
    const materialsEl = document.createElement('div');
    materialsEl.className = 'recipe-materials';
    recipe.requiredMaterials.forEach((mat) => {
      const matEl = document.createElement('div');
      matEl.className = 'recipe-material';
      matEl.textContent = `${mat.name} ×${mat.quantity}`;
      materialsEl.appendChild(matEl);
    });
    card.appendChild(materialsEl);

    // 基本品質
    const qualityEl = document.createElement('div');
    qualityEl.className = 'recipe-base-quality';
    qualityEl.textContent = `基本品質: ${recipe.baseQuality}`;
    card.appendChild(qualityEl);

    // クリックイベント
    card.addEventListener('click', () => {
      this.selectRecipe(recipe.id);
    });

    return card;
  }

  /**
   * 強化カードを作成
   */
  private createEnhancementCard(card: EnhancementCardData): HTMLElement {
    const cardEl = document.createElement('div');
    cardEl.className = 'enhancement-card';
    cardEl.dataset.enhancementId = card.id;

    if (this._selectedEnhancementId === card.id) {
      cardEl.classList.add('selected');
    }

    // カード名
    const nameEl = document.createElement('div');
    nameEl.className = 'enhancement-name';
    nameEl.textContent = card.name;
    cardEl.appendChild(nameEl);

    // 効果説明
    const descEl = document.createElement('div');
    descEl.className = 'enhancement-description';
    descEl.textContent = card.description;
    cardEl.appendChild(descEl);

    // クリックイベント
    cardEl.addEventListener('click', () => {
      this.selectEnhancement(card.id);
    });

    return cardEl;
  }

  /**
   * 必要素材表示を作成
   */
  private createMaterialRequirements(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'material-requirements';

    const title = document.createElement('h4');
    title.textContent = '必要素材';
    container.appendChild(title);

    const selectedRecipe = this._recipes.find((r) => r.id === this._selectedRecipeId);
    if (selectedRecipe) {
      selectedRecipe.requiredMaterials.forEach((req) => {
        const stock = this._materialStock.find((m) => m.name === req.name);
        const stockQty = stock?.quantity ?? 0;
        const isSufficient = stockQty >= req.quantity;

        const reqEl = document.createElement('div');
        reqEl.className = `material-requirement ${isSufficient ? 'sufficient' : 'insufficient'}`;
        reqEl.textContent = `${req.name}: ${stockQty}/${req.quantity}`;
        container.appendChild(reqEl);
      });
    }

    return container;
  }

  /**
   * 調合結果表示を作成
   */
  private createResultDisplay(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'alchemy-result animating';

    const itemName = document.createElement('div');
    itemName.className = 'alchemy-result-name';
    itemName.textContent = this._alchemyResult!.itemName;
    container.appendChild(itemName);

    const quality = document.createElement('div');
    quality.className = 'alchemy-quality';
    quality.textContent = `品質: ${this._alchemyResult!.quality}`;
    container.appendChild(quality);

    return container;
  }

  /**
   * レシピを選択
   */
  private selectRecipe(recipeId: string): void {
    this._selectedRecipeId = recipeId;
    this.rebuildContent();
  }

  /**
   * 強化カードを選択
   */
  private selectEnhancement(enhancementId: string): void {
    if (this._selectedEnhancementId === enhancementId) {
      this._selectedEnhancementId = null;
    } else {
      this._selectedEnhancementId = enhancementId;
    }
    this.updateUI();
  }

  /**
   * 調合可能かどうか
   */
  private canSynthesize(): boolean {
    if (!this._selectedRecipeId) return false;

    const selectedRecipe = this._recipes.find((r) => r.id === this._selectedRecipeId);
    if (!selectedRecipe) return false;

    // 素材が足りているかチェック
    for (const req of selectedRecipe.requiredMaterials) {
      const stock = this._materialStock.find((m) => m.name === req.name);
      if (!stock || stock.quantity < req.quantity) {
        return false;
      }
    }

    return true;
  }

  /**
   * 調合ボタンクリック処理
   */
  private handleSynthesizeClick(): void {
    if (this._selectedRecipeId && this._onSynthesizeCallback) {
      this._onSynthesizeCallback(this._selectedRecipeId, this._selectedEnhancementId);
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
   * コンテンツを再構築
   */
  private rebuildContent(): void {
    const element = this.getElement();
    if (!element.parentElement) return;
    this.buildContent();
  }

  /**
   * UIを更新
   */
  private updateUI(): void {
    const element = this.getElement();
    if (!element.parentElement) return;

    // 強化カードの選択状態を更新
    const enhanceCards = element.querySelectorAll('.enhancement-card');
    enhanceCards.forEach((card) => {
      const cardId = (card as HTMLElement).dataset.enhancementId;
      if (cardId === this._selectedEnhancementId) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
    });
  }

  /**
   * レシピを設定
   */
  setRecipes(recipes: RecipeCardData[]): void {
    this._recipes = [...recipes];
    this._selectedRecipeId = null;
  }

  /**
   * 所持素材を設定
   */
  setMaterialStock(materials: MaterialStock[]): void {
    this._materialStock = [...materials];
    this.updateUI();
  }

  /**
   * 強化カードを設定
   */
  setEnhancementCards(cards: EnhancementCardData[]): void {
    this._enhancementCards = [...cards];
    this._selectedEnhancementId = null;
  }

  /**
   * 選択中のレシピIDを取得
   */
  getSelectedRecipeId(): string | null {
    return this._selectedRecipeId;
  }

  /**
   * 選択中の強化カードIDを取得
   */
  getSelectedEnhancementId(): string | null {
    return this._selectedEnhancementId;
  }

  /**
   * 調合結果を表示
   */
  showAlchemyResult(result: AlchemyResult): void {
    this._showingResult = true;
    this._alchemyResult = result;
    this.rebuildContent();
  }

  /**
   * 調合結果表示をクリア
   */
  clearAlchemyResult(): void {
    this._showingResult = false;
    this._alchemyResult = null;
    this.rebuildContent();
  }

  /**
   * 調合コールバックを設定
   */
  onSynthesize(callback: (recipeId: string, enhancementId: string | null) => void): void {
    this._onSynthesizeCallback = callback;
  }

  /**
   * 次フェーズコールバックを設定
   */
  onNextPhase(callback: () => void): void {
    this._onNextPhaseCallback = callback;
  }
}
