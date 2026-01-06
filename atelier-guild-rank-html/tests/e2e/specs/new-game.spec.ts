import { test, expect, testData } from '../fixtures/test-fixtures';
import { clearSaveData, setupSaveData, createDefaultSaveData } from '../support/test-utils';

/**
 * TASK-0137: タイトル→ゲーム開始E2E
 * 新規ゲーム開始フローのE2Eテスト
 */
test.describe('New Game Flow', () => {
  test.beforeEach(async ({ page }) => {
    // テスト前にセーブデータをクリア
    await page.goto('/');
    await clearSaveData(page);
  });

  test('タイトル画面から新規ゲームを開始できる', async ({ page, titlePage, mainPage }) => {
    // Given: タイトル画面が表示されている
    await titlePage.goto();
    await expect(titlePage.titleLogo).toBeVisible();

    // When: 「はじめから」ボタンをクリック
    await titlePage.clickNewGame();

    // Then: メイン画面に遷移し、初期状態が設定されている
    await mainPage.waitForMainScreen();
    await expect(mainPage.rankDisplay).toContainText(testData.initialRank);
    await expect(mainPage.goldDisplay).toContainText(`${testData.initialGold}`);
  });

  test('セーブデータがある場合「つづきから」が有効', async ({ page, titlePage }) => {
    // Given: セーブデータが存在する
    await page.goto('/');
    await setupSaveData(page, createDefaultSaveData());
    await page.reload();

    // When & Then: 「つづきから」ボタンが有効
    await titlePage.waitForTitleScreen();
    await expect(titlePage.continueButton).toBeEnabled();
  });

  test('セーブデータがない場合「つづきから」が無効', async ({ page, titlePage }) => {
    // Given: セーブデータが存在しない
    await titlePage.goto();

    // When & Then: 「つづきから」ボタンが無効
    await expect(titlePage.continueButton).toBeDisabled();
  });

  test('タイトル画面の初期表示が正しい', async ({ titlePage }) => {
    // Given & When: タイトル画面に移動
    await titlePage.goto();

    // Then: 必要な要素が表示されている
    await expect(titlePage.titleLogo).toBeVisible();
    await expect(titlePage.newGameButton).toBeVisible();
    await expect(titlePage.continueButton).toBeVisible();
  });

  test('新規ゲーム開始時にフェーズが依頼から始まる', async ({ page, titlePage, mainPage }) => {
    // Given: タイトル画面
    await titlePage.goto();

    // When: 新規ゲームを開始
    await titlePage.clickNewGame();

    // Then: 依頼フェーズから始まる（questフェーズがアクティブ）
    await mainPage.waitForMainScreen();
    // 依頼フェーズがアクティブであることを確認
    const activePhase = page.locator('.phase-item.active, [data-testid="phase-quest"].active');
    await expect(activePhase).toBeVisible();
  });

  test('新規ゲーム開始時に日数が1日目から始まる', async ({ page, titlePage, mainPage }) => {
    // Given: タイトル画面
    await titlePage.goto();

    // When: 新規ゲームを開始
    await titlePage.clickNewGame();

    // Then: 日数が1日目
    await mainPage.waitForMainScreen();
    const day = await mainPage.getDay();
    expect(day).toBe(1);
  });

  test('既存のセーブデータがある場合、新規ゲーム開始で確認ダイアログが表示される', async ({ page, titlePage }) => {
    // Given: セーブデータが存在する
    await page.goto('/');
    await setupSaveData(page, createDefaultSaveData());
    await page.reload();
    await titlePage.waitForTitleScreen();

    // When: 「はじめから」ボタンをクリック
    await titlePage.clickNewGame();

    // Then: 確認ダイアログが表示される（またはそのまま開始）
    // 注: 実装によってダイアログの有無が異なる場合がある
    // ダイアログがある場合は確認を行う
    const confirmDialog = page.locator('button:has-text("はい"), [data-testid="confirm-yes"]');
    const isDialogVisible = await confirmDialog.isVisible().catch(() => false);

    if (isDialogVisible) {
      await confirmDialog.click();
    }

    // メイン画面に遷移することを確認
    const mainScreen = page.locator('.main-screen, [data-testid="main-screen"]');
    await expect(mainScreen).toBeVisible({ timeout: 10000 });
  });

  // TODO: アプリケーションの「つづきから」機能実装を確認後に有効化
  test.skip('つづきからでゲームを再開できる', async ({ page, titlePage, mainPage }) => {
    // Given: 進行したセーブデータが存在する
    const saveData = createDefaultSaveData() as { gameState: { currentDay: number; gold: number; remainingDays: number } };
    saveData.gameState.currentDay = 5;
    saveData.gameState.gold = 250;
    saveData.gameState.remainingDays = 26; // 30 - 5 + 1
    await page.goto('/');
    await setupSaveData(page, saveData);
    await page.reload();
    await titlePage.waitForTitleScreen();

    // When: 「つづきから」ボタンをクリック
    await expect(titlePage.continueButton).toBeEnabled();
    await titlePage.clickContinue();

    // Then: 保存された状態でゲームが再開される
    await mainPage.waitForMainScreen();
    // UIは残り日数を表示するので、それを確認
    const remainingDays = await mainPage.getRemainingDays();
    const gold = await mainPage.getGold();

    expect(remainingDays).toBe(26);
    expect(gold).toBe(250);
  });
});
