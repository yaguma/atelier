import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * 昇格試験画面のPage Object
 * 昇格試験画面の要素と操作を定義
 */
export class RankUpPage extends BasePage {
  // 試験情報要素
  readonly testTask: Locator;
  readonly timeLimit: Locator;
  readonly currentRank: Locator;
  readonly targetRank: Locator;

  // 操作ボタン
  readonly startTestButton: Locator;

  // 成功画面要素
  readonly rankUpSuccess: Locator;
  readonly newRank: Locator;
  readonly artifactChoices: Locator;
  readonly selectArtifactButton: Locator;

  constructor(page: Page) {
    super(page);

    // 試験情報要素
    this.testTask = page.locator('.test-task, [data-testid="test-task"]');
    this.timeLimit = page.locator('.time-limit, [data-testid="time-limit"]');
    this.currentRank = page.locator('.current-rank, [data-testid="current-rank"]');
    this.targetRank = page.locator('.target-rank, [data-testid="target-rank"]');

    // 操作ボタン
    this.startTestButton = page.locator('button:has-text("試験を開始する"), [data-testid="start-test-button"]');

    // 成功画面要素
    this.rankUpSuccess = page.locator('.rank-up-success, [data-testid="rank-up-success"]');
    this.newRank = page.locator('.new-rank, [data-testid="new-rank"]');
    this.artifactChoices = page.locator('.artifact-choice, [data-testid="artifact-choice"]');
    this.selectArtifactButton = page.locator('button:has-text("選択"), [data-testid="select-artifact-button"]');
  }

  /**
   * 昇格試験画面が表示されているか確認
   */
  async isVisible(): Promise<boolean> {
    const rankUpScreen = this.page.locator('.rank-up-screen, [data-testid="rank-up-screen"]');
    return await rankUpScreen.isVisible();
  }

  /**
   * 昇格試験画面が表示されるまで待機
   */
  async waitForRankUpScreen(): Promise<void> {
    const rankUpScreen = this.page.locator('.rank-up-screen, [data-testid="rank-up-screen"]');
    await this.waitForElement(rankUpScreen);
  }

  /**
   * 昇格成功画面が表示されているか確認
   */
  async isRankUpSuccessVisible(): Promise<boolean> {
    return await this.rankUpSuccess.isVisible();
  }

  /**
   * 試験課題のテキストを取得
   */
  async getTestTaskText(): Promise<string> {
    return await this.testTask.textContent() ?? '';
  }

  /**
   * 新しいランクを取得
   */
  async getNewRank(): Promise<string> {
    return await this.newRank.textContent() ?? '';
  }

  /**
   * 試験を開始する
   */
  async startTest(): Promise<void> {
    await this.startTestButton.click();
  }

  /**
   * アーティファクトを選択する
   * @param index アーティファクトのインデックス（0始まり）
   */
  async selectArtifact(index = 0): Promise<void> {
    await this.artifactChoices.nth(index).click();
    await this.selectArtifactButton.click();
  }
}
