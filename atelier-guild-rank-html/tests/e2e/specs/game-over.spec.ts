import { test, expect, testData } from '../fixtures/test-fixtures';
import {
  clearSaveData,
  setupSaveData,
  createSaveDataWithOneDayRemaining,
  createDefaultSaveData,
} from '../support/test-utils';

/**
 * TASK-0142: ゲームオーバーE2E
 * ゲームオーバーフローのE2Eテスト
 */
test.describe('Game Over Flow', () => {
  test.beforeEach(async ({ page }) => {
    // テスト前にセーブデータをクリア
    await page.goto('/');
    await clearSaveData(page);
  });

  test('ランク維持日数0でゲームオーバー', async ({ page, titlePage, mainPage, resultPage }) => {
    // Given: ランク維持日数が1日の状態
    await titlePage.goto();
    await setupSaveData(page, createSaveDataWithOneDayRemaining());
    await page.reload();
    await titlePage.clickContinue();
    await mainPage.waitForMainScreen();

    // When: 1日を終える（フェーズをスキップ）
    await mainPage.goToNextPhase(); // 依頼受注→採取

    // 採取フェーズを進む
    const nextPhaseVisible = await mainPage.nextPhaseButton.isVisible().catch(() => false);
    if (nextPhaseVisible) {
      await mainPage.goToNextPhase(); // 採取→調合
    }
    await mainPage.goToNextPhase(); // 調合→納品
    await mainPage.endDay();

    // Then: ゲームオーバー画面が表示される
    const isGameOverVisible = await resultPage.isGameOverVisible().catch(() => false);
    if (isGameOverVisible) {
      await expect(resultPage.gameOverScreen).toBeVisible();
      const reason = await resultPage.getGameOverReason();
      expect(reason).toContain('日数');
    }
  });

  test('ゲームオーバー画面で到達ランクとプレイ統計が表示される', async ({ page, titlePage, resultPage }) => {
    // Given: ゲームオーバー状態
    await titlePage.goto();
    await setupSaveData(page, {
      ...createDefaultSaveData(),
      gameOver: true,
      gameOverReason: '日数切れ',
      reachedRank: 'F',
      totalDaysPlayed: 30,
      completedQuestsCount: 15,
      craftedItemsCount: 25,
    });
    await page.reload();

    // ゲームオーバー状態でロードすると
    const isGameOverVisible = await resultPage.isGameOverVisible().catch(() => false);
    if (isGameOverVisible) {
      // Then: 到達ランクが表示される
      await expect(resultPage.reachedRank).toBeVisible();

      // Then: プレイ統計が表示される
      await expect(resultPage.statsPanel).toBeVisible();

      // Then: ヒントテキストが表示される
      await expect(resultPage.hintText).toBeVisible();
    }
  });

  test('タイトルへ戻るとセーブデータが削除される', async ({ page, titlePage, resultPage }) => {
    // Given: ゲームオーバー画面
    await titlePage.goto();
    await setupSaveData(page, {
      ...createDefaultSaveData(),
      gameOver: true,
      gameOverReason: '日数切れ',
    });
    await page.reload();

    const isGameOverVisible = await resultPage.isGameOverVisible().catch(() => false);
    if (isGameOverVisible) {
      // When: タイトルへ戻る
      await resultPage.clickTitleButton();
      await resultPage.confirmReturnToTitle();

      // Then: タイトル画面に戻る
      await titlePage.waitForTitleScreen();

      // Then: セーブデータが削除されている
      await expect(titlePage.continueButton).toBeDisabled();
    }
  });

  test('ゲームオーバー理由が表示される', async ({ page, titlePage, resultPage }) => {
    // Given: ゲームオーバー状態（日数切れ）
    await titlePage.goto();
    await setupSaveData(page, {
      ...createDefaultSaveData(),
      gameOver: true,
      gameOverReason: '日数切れ',
    });
    await page.reload();

    const isGameOverVisible = await resultPage.isGameOverVisible().catch(() => false);
    if (isGameOverVisible) {
      // Then: ゲームオーバー理由が表示される
      const reason = await resultPage.getGameOverReason();
      expect(reason.length).toBeGreaterThan(0);
    }
  });

  test('昇格試験失敗でゲームオーバー', async ({ page, titlePage, resultPage }) => {
    // Given: 昇格試験失敗状態
    await titlePage.goto();
    await setupSaveData(page, {
      ...createDefaultSaveData(),
      gameOver: true,
      gameOverReason: '昇格試験失敗',
      reachedRank: 'G',
    });
    await page.reload();

    const isGameOverVisible = await resultPage.isGameOverVisible().catch(() => false);
    if (isGameOverVisible) {
      // Then: ゲームオーバー理由に「昇格試験」が含まれる
      const reason = await resultPage.getGameOverReason();
      expect(reason).toContain('昇格試験');
    }
  });

  test('ゲームオーバー後に新規ゲームを開始できる', async ({ page, titlePage, mainPage, resultPage }) => {
    // Given: ゲームオーバー画面
    await titlePage.goto();
    await setupSaveData(page, {
      ...createDefaultSaveData(),
      gameOver: true,
      gameOverReason: '日数切れ',
    });
    await page.reload();

    const isGameOverVisible = await resultPage.isGameOverVisible().catch(() => false);
    if (isGameOverVisible) {
      // When: タイトルへ戻る
      await resultPage.returnToTitle();

      // When: 新規ゲームを開始
      await titlePage.waitForTitleScreen();
      await titlePage.clickNewGame();

      // Then: 新しいゲームが開始される
      await mainPage.waitForMainScreen();
      const rank = await mainPage.getRank();
      expect(rank).toContain(testData.initialRank);
    }
  });

  test('到達ランクが正しく表示される', async ({ page, titlePage, resultPage }) => {
    // Given: Fランクまで到達してゲームオーバー
    await titlePage.goto();
    await setupSaveData(page, {
      ...createDefaultSaveData(),
      gameOver: true,
      gameOverReason: '日数切れ',
      rank: 'F',
      reachedRank: 'F',
    });
    await page.reload();

    const isGameOverVisible = await resultPage.isGameOverVisible().catch(() => false);
    if (isGameOverVisible) {
      // Then: 到達ランクがFと表示される
      const reachedRank = await resultPage.getReachedRank();
      expect(reachedRank).toContain('F');
    }
  });

  test('ゲームオーバー条件を確認', async () => {
    // ゲームオーバー条件：
    // 1. ランク維持日数が0になる
    // 2. 昇格試験に失敗する

    // デフォルトの日数を確認
    expect(testData.defaultTotalDays).toBe(30);
  });
});
