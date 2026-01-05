import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * リザルト画面（ゲームクリア/ゲームオーバー）のPage Object
 * リザルト画面の要素と操作を定義
 */
export class ResultPage extends BasePage {
  // ゲームクリア画面要素
  readonly gameClearScreen: Locator;
  readonly congratulations: Locator;
  readonly finalRank: Locator;

  // ゲームオーバー画面要素
  readonly gameOverScreen: Locator;
  readonly gameOverReason: Locator;
  readonly reachedRank: Locator;

  // 共通要素
  readonly statsPanel: Locator;
  readonly totalDays: Locator;
  readonly completedQuests: Locator;
  readonly craftedItems: Locator;
  readonly hintText: Locator;

  // 操作ボタン
  readonly titleButton: Locator;
  readonly confirmYesButton: Locator;
  readonly confirmNoButton: Locator;

  constructor(page: Page) {
    super(page);

    // ゲームクリア画面要素
    this.gameClearScreen = page.locator('.game-clear-screen, [data-testid="game-clear-screen"]');
    this.congratulations = page.locator('.congratulations, [data-testid="congratulations"]');
    this.finalRank = page.locator('.final-rank, [data-testid="final-rank"]');

    // ゲームオーバー画面要素
    this.gameOverScreen = page.locator('.game-over-screen, [data-testid="game-over-screen"]');
    this.gameOverReason = page.locator('.game-over-reason, [data-testid="game-over-reason"]');
    this.reachedRank = page.locator('.reached-rank, [data-testid="reached-rank"]');

    // 共通要素
    this.statsPanel = page.locator('.stats-panel, [data-testid="stats-panel"]');
    this.totalDays = page.locator('.total-days, [data-testid="total-days"]');
    this.completedQuests = page.locator('.completed-quests, [data-testid="completed-quests"]');
    this.craftedItems = page.locator('.crafted-items, [data-testid="crafted-items"]');
    this.hintText = page.locator('.hint-text, [data-testid="hint-text"]');

    // 操作ボタン
    this.titleButton = page.locator('button:has-text("タイトルへ"), [data-testid="title-button"]');
    this.confirmYesButton = page.locator('button:has-text("はい"), [data-testid="confirm-yes"]');
    this.confirmNoButton = page.locator('button:has-text("いいえ"), [data-testid="confirm-no"]');
  }

  /**
   * ゲームクリア画面が表示されているか確認
   */
  async isGameClearVisible(): Promise<boolean> {
    return await this.gameClearScreen.isVisible();
  }

  /**
   * ゲームオーバー画面が表示されているか確認
   */
  async isGameOverVisible(): Promise<boolean> {
    return await this.gameOverScreen.isVisible();
  }

  /**
   * リザルト画面（どちらか）が表示されているか確認
   */
  async isVisible(): Promise<boolean> {
    return await this.isGameClearVisible() || await this.isGameOverVisible();
  }

  /**
   * ゲームクリア画面が表示されるまで待機
   */
  async waitForGameClearScreen(): Promise<void> {
    await this.waitForElement(this.gameClearScreen);
  }

  /**
   * ゲームオーバー画面が表示されるまで待機
   */
  async waitForGameOverScreen(): Promise<void> {
    await this.waitForElement(this.gameOverScreen);
  }

  /**
   * 最終ランクを取得（クリア時）
   */
  async getFinalRank(): Promise<string> {
    return await this.finalRank.textContent() ?? '';
  }

  /**
   * 到達ランクを取得（ゲームオーバー時）
   */
  async getReachedRank(): Promise<string> {
    return await this.reachedRank.textContent() ?? '';
  }

  /**
   * ゲームオーバー理由を取得
   */
  async getGameOverReason(): Promise<string> {
    return await this.gameOverReason.textContent() ?? '';
  }

  /**
   * タイトルへ戻るボタンをクリック
   */
  async clickTitleButton(): Promise<void> {
    await this.titleButton.click();
  }

  /**
   * 確認ダイアログで「はい」をクリック
   */
  async confirmReturnToTitle(): Promise<void> {
    await this.confirmYesButton.click();
  }

  /**
   * 確認ダイアログで「いいえ」をクリック
   */
  async cancelReturnToTitle(): Promise<void> {
    await this.confirmNoButton.click();
  }

  /**
   * タイトル画面へ戻る（確認込み）
   */
  async returnToTitle(): Promise<void> {
    await this.clickTitleButton();
    await this.confirmReturnToTitle();
  }
}
