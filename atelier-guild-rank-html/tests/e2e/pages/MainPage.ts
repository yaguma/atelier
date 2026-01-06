import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * メイン画面のPage Object
 * ゲームプレイ中のメイン画面の要素と操作を定義
 */
export class MainPage extends BasePage {
  // ヘッダー要素
  readonly rankDisplay: Locator;
  readonly dayDisplay: Locator;
  readonly goldDisplay: Locator;
  readonly phaseIndicator: Locator;

  // フェーズ関連要素
  readonly nextPhaseButton: Locator;
  readonly endDayButton: Locator;

  // 依頼関連要素
  readonly questCards: Locator;
  readonly acceptQuestButton: Locator;
  readonly activeQuests: Locator;

  // ドラフト採取関連要素
  readonly draftCards: Locator;
  readonly gatherButton: Locator;

  // 調合関連要素
  readonly recipeCards: Locator;
  readonly craftButton: Locator;

  // 納品関連要素
  readonly deliverButton: Locator;
  readonly rewardPopup: Locator;
  readonly okButton: Locator;

  // ナビゲーション
  readonly shopButton: Locator;

  constructor(page: Page) {
    super(page);

    // ヘッダー要素
    this.rankDisplay = page.locator('.rank-display, [data-testid="rank-display"]');
    this.dayDisplay = page.locator('.day-display, [data-testid="day-display"]');
    this.goldDisplay = page.locator('.gold-display, [data-testid="gold-display"]');
    this.phaseIndicator = page.locator('.phase-indicator, [data-testid="phase-indicator"]');

    // フェーズ関連（visibleなボタンを優先）
    this.nextPhaseButton = page.locator('button.next-phase-btn:visible').first();
    this.endDayButton = page.locator('button:has-text("1日を終える"), button.end-day-btn, [data-testid="end-day-button"]').first();

    // 依頼関連
    this.questCards = page.locator('.quest-card, [data-testid="quest-card"]');
    this.acceptQuestButton = page.locator('button:has-text("受注"), [data-testid="accept-quest-button"]');
    this.activeQuests = page.locator('.active-quest, [data-testid="active-quest"]');

    // ドラフト採取関連
    this.draftCards = page.locator('.draft-card, [data-testid="draft-card"]');
    this.gatherButton = page.locator('button:has-text("採取"), [data-testid="gather-button"]');

    // 調合関連
    this.recipeCards = page.locator('.recipe-card, [data-testid="recipe-card"]');
    this.craftButton = page.locator('button:has-text("調合"), [data-testid="craft-button"]');

    // 納品関連
    this.deliverButton = page.locator('button:has-text("納品"), [data-testid="deliver-button"]');
    this.rewardPopup = page.locator('.reward-popup, [data-testid="reward-popup"]');
    this.okButton = page.locator('button:has-text("OK"), [data-testid="ok-button"]');

    // ナビゲーション
    this.shopButton = page.locator('button:has-text("ショップ"), [data-testid="shop-button"]');
  }

  /**
   * メイン画面が表示されているか確認
   */
  async isVisible(): Promise<boolean> {
    const mainScreen = this.page.locator('.main-screen, [data-testid="main-screen"]');
    return await mainScreen.isVisible();
  }

  /**
   * メイン画面が表示されるまで待機
   */
  async waitForMainScreen(): Promise<void> {
    const mainScreen = this.page.locator('.main-screen, [data-testid="main-screen"]');
    await this.waitForElement(mainScreen);
  }

  /**
   * 現在のランクを取得
   */
  async getRank(): Promise<string> {
    return await this.rankDisplay.textContent() ?? '';
  }

  /**
   * 残り日数を取得（UIに表示されている値）
   */
  async getRemainingDays(): Promise<number> {
    const text = await this.dayDisplay.textContent() ?? '0';
    const match = text.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * 現在の日数を取得（totalDays - remainingDays + 1 で計算）
   * UIには残り日数が表示されているので、現在日数は残り日数から計算する
   * @param totalDays 総日数（デフォルト30）
   */
  async getDay(totalDays = 30): Promise<number> {
    const remaining = await this.getRemainingDays();
    return totalDays - remaining + 1;
  }

  /**
   * 現在のゴールドを取得
   */
  async getGold(): Promise<number> {
    const text = await this.goldDisplay.textContent() ?? '0';
    const match = text.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * 現在のフェーズを取得
   */
  async getCurrentPhase(): Promise<string> {
    return await this.phaseIndicator.textContent() ?? '';
  }

  /**
   * 次のフェーズへ進む
   */
  async goToNextPhase(): Promise<void> {
    await this.nextPhaseButton.click();
  }

  /**
   * 1日を終える
   */
  async endDay(): Promise<void> {
    await this.endDayButton.click();
  }

  /**
   * 依頼を受注
   * @param index 依頼カードのインデックス（0始まり）
   */
  async acceptQuest(index = 0): Promise<void> {
    await this.questCards.nth(index).click();
    await this.acceptQuestButton.click();
  }

  /**
   * ドラフト採取を実行
   * @param index ドラフトカードのインデックス（0始まり）
   */
  async gatherMaterial(index = 0): Promise<void> {
    await this.draftCards.nth(index).click();
    await this.gatherButton.click();
  }

  /**
   * 調合を実行
   * @param index レシピカードのインデックス（0始まり）
   */
  async craftItem(index = 0): Promise<void> {
    await this.recipeCards.nth(index).click();
    await this.craftButton.click();
  }

  /**
   * 依頼を納品
   * @param index 受注中依頼のインデックス（0始まり）
   */
  async deliverQuest(index = 0): Promise<void> {
    await this.activeQuests.nth(index).click();
    await this.deliverButton.click();
  }

  /**
   * 報酬ポップアップを閉じる
   */
  async closeRewardPopup(): Promise<void> {
    await this.okButton.click();
  }

  /**
   * ショップ画面へ移動
   */
  async goToShop(): Promise<void> {
    await this.shopButton.click();
  }
}
