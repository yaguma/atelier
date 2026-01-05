import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * タイトル画面のPage Object
 * タイトル画面の要素と操作を定義
 */
export class TitlePage extends BasePage {
  // ロケーター定義
  readonly titleLogo: Locator;
  readonly newGameButton: Locator;
  readonly continueButton: Locator;
  readonly settingsButton: Locator;

  constructor(page: Page) {
    super(page);
    this.titleLogo = page.locator('.title-logo, [data-testid="title-logo"]');
    this.newGameButton = page.locator('button:has-text("はじめから"), [data-testid="new-game-button"]');
    this.continueButton = page.locator('button:has-text("つづきから"), [data-testid="continue-button"]');
    this.settingsButton = page.locator('button:has-text("設定"), [data-testid="settings-button"]');
  }

  /**
   * タイトル画面に移動
   */
  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.waitForPageLoad();
  }

  /**
   * タイトル画面が表示されているか確認
   */
  async isVisible(): Promise<boolean> {
    return await this.titleLogo.isVisible();
  }

  /**
   * タイトル画面が表示されるまで待機
   */
  async waitForTitleScreen(): Promise<void> {
    await this.waitForElement(this.titleLogo);
  }

  /**
   * 「はじめから」ボタンをクリック
   */
  async clickNewGame(): Promise<void> {
    await this.newGameButton.click();
  }

  /**
   * 「つづきから」ボタンをクリック
   */
  async clickContinue(): Promise<void> {
    await this.continueButton.click();
  }

  /**
   * 「つづきから」ボタンが有効か確認
   */
  async isContinueEnabled(): Promise<boolean> {
    return await this.continueButton.isEnabled();
  }

  /**
   * 「つづきから」ボタンが無効か確認
   */
  async isContinueDisabled(): Promise<boolean> {
    return await this.continueButton.isDisabled();
  }

  /**
   * 新規ゲーム確認ダイアログで「はい」をクリック
   */
  async confirmNewGame(): Promise<void> {
    const confirmButton = this.page.locator('button:has-text("はい"), [data-testid="confirm-yes"]');
    await confirmButton.click();
  }
}
