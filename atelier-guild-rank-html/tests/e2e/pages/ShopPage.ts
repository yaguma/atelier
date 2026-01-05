import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * ショップ画面のPage Object
 * ショップ画面の要素と操作を定義
 */
export class ShopPage extends BasePage {
  // タブ要素
  readonly cardTab: Locator;
  readonly artifactTab: Locator;

  // 商品リスト要素
  readonly shopItems: Locator;
  readonly itemPrice: Locator;

  // 操作ボタン
  readonly purchaseButton: Locator;
  readonly confirmButton: Locator;
  readonly backButton: Locator;

  // 情報表示
  readonly currentGold: Locator;
  readonly actionPoints: Locator;

  constructor(page: Page) {
    super(page);

    // タブ要素
    this.cardTab = page.locator('.category-tab:has-text("カード"), [data-testid="card-tab"]');
    this.artifactTab = page.locator('.category-tab:has-text("アーティファクト"), [data-testid="artifact-tab"]');

    // 商品リスト要素
    this.shopItems = page.locator('.shop-item, [data-testid="shop-item"]');
    this.itemPrice = page.locator('.item-price, [data-testid="item-price"]');

    // 操作ボタン
    this.purchaseButton = page.locator('button:has-text("購入"), [data-testid="purchase-button"]');
    this.confirmButton = page.locator('button:has-text("確定"), [data-testid="confirm-button"]');
    this.backButton = page.locator('button:has-text("戻る"), [data-testid="back-button"]');

    // 情報表示
    this.currentGold = page.locator('.current-gold, [data-testid="current-gold"]');
    this.actionPoints = page.locator('.action-points, [data-testid="action-points"]');
  }

  /**
   * ショップ画面が表示されているか確認
   */
  async isVisible(): Promise<boolean> {
    const shopScreen = this.page.locator('.shop-screen, [data-testid="shop-screen"]');
    return await shopScreen.isVisible();
  }

  /**
   * ショップ画面が表示されるまで待機
   */
  async waitForShopScreen(): Promise<void> {
    const shopScreen = this.page.locator('.shop-screen, [data-testid="shop-screen"]');
    await this.waitForElement(shopScreen);
  }

  /**
   * カードタブを選択
   */
  async selectCardTab(): Promise<void> {
    await this.cardTab.click();
  }

  /**
   * アーティファクトタブを選択
   */
  async selectArtifactTab(): Promise<void> {
    await this.artifactTab.click();
  }

  /**
   * 商品を選択
   * @param index 商品のインデックス（0始まり）
   */
  async selectItem(index = 0): Promise<void> {
    await this.shopItems.nth(index).click();
  }

  /**
   * 購入ボタンをクリック
   */
  async clickPurchase(): Promise<void> {
    await this.purchaseButton.click();
  }

  /**
   * 確定ボタンをクリック
   */
  async clickConfirm(): Promise<void> {
    await this.confirmButton.click();
  }

  /**
   * 戻るボタンをクリック
   */
  async clickBack(): Promise<void> {
    await this.backButton.click();
  }

  /**
   * 購入ボタンが有効か確認
   */
  async isPurchaseEnabled(): Promise<boolean> {
    return await this.purchaseButton.isEnabled();
  }

  /**
   * 購入ボタンが無効か確認
   */
  async isPurchaseDisabled(): Promise<boolean> {
    return await this.purchaseButton.isDisabled();
  }

  /**
   * 商品を購入する（選択から確定まで）
   * @param index 商品のインデックス（0始まり）
   */
  async purchaseItem(index = 0): Promise<void> {
    await this.selectItem(index);
    await this.clickPurchase();
    await this.clickConfirm();
  }

  /**
   * 現在のゴールドを取得
   */
  async getCurrentGold(): Promise<number> {
    const text = await this.currentGold.textContent() ?? '0';
    const match = text.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * 現在の行動ポイントを取得
   */
  async getActionPoints(): Promise<number> {
    const text = await this.actionPoints.textContent() ?? '0';
    const match = text.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }
}
