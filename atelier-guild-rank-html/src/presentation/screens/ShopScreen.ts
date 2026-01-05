/**
 * ショップ画面
 * @description カテゴリ別商品の閲覧・購入を行う画面
 * @module presentation/screens
 */

import { UIComponent } from '../UIComponent';
import { Screen, ScreenId } from '../ScreenManager';

/**
 * ショップカテゴリ
 */
export interface ShopCategory {
  /** カテゴリID */
  id: string;
  /** カテゴリ名 */
  name: string;
}

/**
 * ショップ商品データ
 */
export interface ShopItem {
  /** 商品ID */
  id: string;
  /** 商品名 */
  name: string;
  /** 説明 */
  description: string;
  /** 価格 */
  price: number;
  /** カテゴリID */
  category: string;
}

/**
 * ショップ画面クラス
 */
export class ShopScreen extends UIComponent implements Screen {
  /** 画面ID */
  readonly id: ScreenId = 'shop';

  /** 画面名 */
  readonly name: string = 'ショップ';

  /** カテゴリ一覧 */
  private _categories: ShopCategory[] = [];

  /** 商品一覧 */
  private _items: ShopItem[] = [];

  /** 選択中のカテゴリID */
  private _selectedCategory: string | null = null;

  /** 選択中の商品ID */
  private _selectedItemId: string | null = null;

  /** プレイヤーの所持ゴールド */
  private _playerGold: number = 0;

  /** 購入コールバック */
  private _onPurchaseCallback: ((itemId: string) => void) | null = null;

  /** 戻るコールバック */
  private _onBackCallback: (() => void) | null = null;

  /** ゴールドアニメーション中フラグ */
  private _goldAnimating: boolean = false;

  constructor() {
    super();
  }

  /**
   * DOM要素を作成
   */
  protected createElement(): HTMLElement {
    const element = document.createElement('div');
    element.className = 'shop-screen';
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
    header.className = 'shop-header';

    // 戻るボタン
    const backBtn = document.createElement('button');
    backBtn.className = 'back-btn';
    backBtn.textContent = '← 戻る';
    backBtn.addEventListener('click', () => this.handleBackClick());
    header.appendChild(backBtn);

    // タイトル
    const title = document.createElement('h2');
    title.className = 'screen-title';
    title.textContent = 'ショップ';
    header.appendChild(title);

    // 所持ゴールド
    const goldDisplay = document.createElement('div');
    goldDisplay.className = 'gold-display';
    if (this._goldAnimating) {
      goldDisplay.classList.add('animating');
    }
    goldDisplay.textContent = `💰 ${this._playerGold}G`;
    header.appendChild(goldDisplay);

    element.appendChild(header);

    // カテゴリタブ
    const tabContainer = document.createElement('div');
    tabContainer.className = 'category-tabs';

    this._categories.forEach((category) => {
      const tab = document.createElement('button');
      tab.className = 'category-tab';
      tab.dataset.category = category.id;
      tab.textContent = category.name;

      if (this._selectedCategory === category.id) {
        tab.classList.add('active');
      }

      tab.addEventListener('click', () => {
        this.selectCategory(category.id);
      });

      tabContainer.appendChild(tab);
    });

    element.appendChild(tabContainer);

    // メインコンテナ（商品一覧 + 詳細パネル）
    const mainContainer = document.createElement('div');
    mainContainer.className = 'shop-main-container';

    // 商品一覧
    const itemList = document.createElement('div');
    itemList.className = 'item-list';

    const filteredItems = this._items.filter(
      (item) => !this._selectedCategory || item.category === this._selectedCategory
    );

    this._items.forEach((item) => {
      const itemEl = this.createItemElement(item);
      if (this._selectedCategory && item.category !== this._selectedCategory) {
        itemEl.classList.add('hidden');
      }
      itemList.appendChild(itemEl);
    });

    mainContainer.appendChild(itemList);

    // 詳細パネル
    if (this._selectedItemId) {
      const detailPanel = this.createDetailPanel();
      mainContainer.appendChild(detailPanel);
    }

    element.appendChild(mainContainer);
  }

  /**
   * 商品要素を作成
   */
  private createItemElement(item: ShopItem): HTMLElement {
    const itemEl = document.createElement('div');
    itemEl.className = 'shop-item';
    itemEl.dataset.itemId = item.id;

    if (this._selectedItemId === item.id) {
      itemEl.classList.add('selected');
    }

    // 商品名
    const nameEl = document.createElement('div');
    nameEl.className = 'item-name';
    nameEl.textContent = item.name;
    itemEl.appendChild(nameEl);

    // 価格
    const priceEl = document.createElement('div');
    priceEl.className = 'item-price';
    priceEl.textContent = `${item.price}G`;

    // ゴールド不足の場合は警告スタイル
    if (item.price > this._playerGold) {
      priceEl.classList.add('insufficient');
    }
    itemEl.appendChild(priceEl);

    // クリックイベント
    itemEl.addEventListener('click', () => {
      this.selectItem(item.id);
    });

    return itemEl;
  }

  /**
   * 詳細パネルを作成
   */
  private createDetailPanel(): HTMLElement {
    const panel = document.createElement('div');
    panel.className = 'item-detail';

    const selectedItem = this._items.find((i) => i.id === this._selectedItemId);
    if (selectedItem) {
      // 商品名
      const nameEl = document.createElement('h3');
      nameEl.className = 'detail-name';
      nameEl.textContent = selectedItem.name;
      panel.appendChild(nameEl);

      // 説明
      const descEl = document.createElement('p');
      descEl.className = 'detail-description';
      descEl.textContent = selectedItem.description;
      panel.appendChild(descEl);

      // 価格
      const priceEl = document.createElement('div');
      priceEl.className = 'detail-price';
      priceEl.textContent = `価格: ${selectedItem.price}G`;
      panel.appendChild(priceEl);

      // 購入ボタン
      const purchaseBtn = document.createElement('button');
      purchaseBtn.className = 'purchase-btn';
      purchaseBtn.textContent = '購入する';
      purchaseBtn.disabled = selectedItem.price > this._playerGold;
      purchaseBtn.addEventListener('click', () => this.handlePurchaseClick());
      panel.appendChild(purchaseBtn);
    }

    return panel;
  }

  /**
   * カテゴリを選択
   */
  private selectCategory(categoryId: string): void {
    this._selectedCategory = categoryId;
    this._selectedItemId = null;
    this.rebuildContent();
  }

  /**
   * 商品を選択
   */
  private selectItem(itemId: string): void {
    this._selectedItemId = itemId;
    this.updateUI();
  }

  /**
   * 購入ボタンクリック処理
   */
  private handlePurchaseClick(): void {
    if (this._selectedItemId && this._onPurchaseCallback) {
      this._onPurchaseCallback(this._selectedItemId);
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
   * UIを更新
   */
  private updateUI(): void {
    const element = this.getElement();
    if (!element.parentElement) return;

    // 選択状態を更新
    const items = element.querySelectorAll('.shop-item');
    items.forEach((item) => {
      const itemId = (item as HTMLElement).dataset.itemId;
      if (itemId === this._selectedItemId) {
        item.classList.add('selected');
      } else {
        item.classList.remove('selected');
      }
    });

    // 詳細パネルを更新
    const oldDetail = element.querySelector('.item-detail');
    if (oldDetail) {
      oldDetail.remove();
    }
    if (this._selectedItemId) {
      const mainContainer = element.querySelector('.shop-main-container');
      if (mainContainer) {
        const detailPanel = this.createDetailPanel();
        mainContainer.appendChild(detailPanel);
      }
    }
  }

  /**
   * カテゴリを設定
   */
  setCategories(categories: ShopCategory[]): void {
    this._categories = [...categories];
    if (categories.length > 0 && !this._selectedCategory) {
      this._selectedCategory = categories[0].id;
    }
  }

  /**
   * 商品を設定
   */
  setItems(items: ShopItem[]): void {
    this._items = [...items];
  }

  /**
   * 選択カテゴリを設定
   */
  setSelectedCategory(categoryId: string): void {
    this._selectedCategory = categoryId;
  }

  /**
   * 選択中のカテゴリを取得
   */
  getSelectedCategory(): string | null {
    return this._selectedCategory;
  }

  /**
   * 所持ゴールドを設定
   */
  setPlayerGold(gold: number): void {
    this._playerGold = gold;
  }

  /**
   * 購入結果を表示
   */
  showPurchaseResult(newGold: number, success: boolean): void {
    if (success) {
      this._goldAnimating = true;
      this._playerGold = newGold;
      this.rebuildContent();

      // アニメーション終了後にフラグをリセット
      setTimeout(() => {
        this._goldAnimating = false;
      }, 500);
    }
  }

  /**
   * 購入コールバックを設定
   */
  onPurchase(callback: (itemId: string) => void): void {
    this._onPurchaseCallback = callback;
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
