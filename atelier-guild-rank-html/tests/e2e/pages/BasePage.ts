import { Page, Locator } from '@playwright/test';

/**
 * 全Page Objectの基底クラス
 * 共通機能とヘルパーメソッドを提供
 */
export abstract class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * ページが読み込まれるまで待機
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * 要素が表示されるまで待機
   */
  async waitForElement(locator: Locator, timeout = 5000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * 要素が非表示になるまで待機
   */
  async waitForElementHidden(locator: Locator, timeout = 5000): Promise<void> {
    await locator.waitFor({ state: 'hidden', timeout });
  }

  /**
   * スクリーンが表示されているか確認
   */
  abstract isVisible(): Promise<boolean>;
}
