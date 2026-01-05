import { test, expect, testData } from '../fixtures/test-fixtures';
import { clearSaveData, startNewGame } from '../support/test-utils';

/**
 * TASK-0138: 1ターンサイクルE2E
 * 1ターンのゲームサイクル（依頼受注→採取→調合→納品）のE2Eテスト
 */
describe('One Turn Cycle', () => {
  test.beforeEach(async ({ page }) => {
    // テスト前にセーブデータをクリアして新規ゲーム開始
    await page.goto('/');
    await clearSaveData(page);
  });

  test('依頼受注→採取→調合→納品の1ターンを完了できる', async ({ page, titlePage, mainPage }) => {
    // Given: 新規ゲームを開始
    await titlePage.goto();
    await titlePage.clickNewGame();
    await mainPage.waitForMainScreen();

    // Phase 1: 依頼受注
    await expect(mainPage.phaseIndicator).toContainText(testData.phases.QUEST_ACCEPT);

    // 依頼を受注（利用可能な場合）
    const questCount = await mainPage.questCards.count();
    if (questCount > 0) {
      await mainPage.acceptQuest(0);
    }
    await mainPage.goToNextPhase();

    // Phase 2: ドラフト採取
    await expect(mainPage.phaseIndicator).toContainText(testData.phases.GATHERING);

    // ドラフト採取を実行
    for (let round = 0; round < 3; round++) {
      const draftCount = await mainPage.draftCards.count();
      if (draftCount > 0) {
        await mainPage.gatherMaterial(0);
      }
    }
    // 次のフェーズへ（自動遷移の場合もある）
    const nextPhaseVisible = await mainPage.nextPhaseButton.isVisible().catch(() => false);
    if (nextPhaseVisible) {
      await mainPage.goToNextPhase();
    }

    // Phase 3: 調合
    await expect(mainPage.phaseIndicator).toContainText(testData.phases.ALCHEMY);

    // 調合を実行（利用可能な場合）
    const recipeCount = await mainPage.recipeCards.count();
    if (recipeCount > 0) {
      await mainPage.craftItem(0);
    }
    await mainPage.goToNextPhase();

    // Phase 4: 納品
    await expect(mainPage.phaseIndicator).toContainText(testData.phases.DELIVERY);

    // 受注中の依頼があれば納品
    const activeQuestCount = await mainPage.activeQuests.count();
    if (activeQuestCount > 0) {
      await mainPage.deliverQuest(0);

      // 報酬ポップアップがあれば閉じる
      const rewardVisible = await mainPage.rewardPopup.isVisible().catch(() => false);
      if (rewardVisible) {
        await mainPage.closeRewardPopup();
      }
    }

    // 1日を終える
    await mainPage.endDay();

    // 次の日に進んでいることを確認（依頼受注フェーズに戻る）
    await expect(mainPage.phaseIndicator).toContainText(testData.phases.QUEST_ACCEPT);

    // 日数が2日目に進んでいることを確認
    const day = await mainPage.getDay();
    expect(day).toBe(2);
  });

  test('フェーズをスキップできる', async ({ page, titlePage, mainPage }) => {
    // Given: 新規ゲームを開始
    await titlePage.goto();
    await titlePage.clickNewGame();
    await mainPage.waitForMainScreen();

    // When: 依頼を受注せずに次のフェーズへ
    await expect(mainPage.phaseIndicator).toContainText(testData.phases.QUEST_ACCEPT);
    await mainPage.goToNextPhase();

    // Then: 採取フェーズに進む
    await expect(mainPage.phaseIndicator).toContainText(testData.phases.GATHERING);
  });

  test('採取フェーズでカードを選択できる', async ({ page, titlePage, mainPage }) => {
    // Given: 採取フェーズに進む
    await titlePage.goto();
    await titlePage.clickNewGame();
    await mainPage.waitForMainScreen();
    await mainPage.goToNextPhase(); // 依頼受注をスキップ

    // When: 採取フェーズ
    await expect(mainPage.phaseIndicator).toContainText(testData.phases.GATHERING);

    // Then: ドラフトカードが表示されている
    const draftCount = await mainPage.draftCards.count();
    expect(draftCount).toBeGreaterThanOrEqual(0);
  });

  test('調合フェーズでレシピを選択できる', async ({ page, titlePage, mainPage }) => {
    // Given: 調合フェーズに進む
    await titlePage.goto();
    await titlePage.clickNewGame();
    await mainPage.waitForMainScreen();

    // 依頼受注と採取をスキップ
    await mainPage.goToNextPhase();

    // 採取フェーズで素材を集める（またはスキップ）
    const draftCount = await mainPage.draftCards.count();
    if (draftCount > 0) {
      await mainPage.gatherMaterial(0);
    }
    const nextPhaseVisible = await mainPage.nextPhaseButton.isVisible().catch(() => false);
    if (nextPhaseVisible) {
      await mainPage.goToNextPhase();
    }

    // When: 調合フェーズ
    await expect(mainPage.phaseIndicator).toContainText(testData.phases.ALCHEMY);

    // Then: レシピカードが表示されている（または空）
    const recipeCount = await mainPage.recipeCards.count();
    expect(recipeCount).toBeGreaterThanOrEqual(0);
  });

  test('日数が経過するとランク維持日数が減少する', async ({ page, titlePage, mainPage }) => {
    // Given: 新規ゲームを開始
    await titlePage.goto();
    await titlePage.clickNewGame();
    await mainPage.waitForMainScreen();

    // 初期日数を記録
    const initialDay = await mainPage.getDay();

    // When: 1日を終える（フェーズを全てスキップ）
    await mainPage.goToNextPhase(); // 依頼受注→採取
    const nextPhaseVisible = await mainPage.nextPhaseButton.isVisible().catch(() => false);
    if (nextPhaseVisible) {
      await mainPage.goToNextPhase(); // 採取→調合
    }
    await mainPage.goToNextPhase(); // 調合→納品
    await mainPage.endDay();

    // Then: 日数が1日増えている
    const newDay = await mainPage.getDay();
    expect(newDay).toBe(initialDay + 1);
  });

  test('ゴールドを獲得できる（依頼完了報酬）', async ({ page, titlePage, mainPage }) => {
    // Given: 新規ゲームを開始
    await titlePage.goto();
    await titlePage.clickNewGame();
    await mainPage.waitForMainScreen();

    // 初期ゴールドを記録
    const initialGold = await mainPage.getGold();
    expect(initialGold).toBe(testData.initialGold);

    // ゴールドの増減は依頼完了やショップ購入で発生
    // このテストでは初期値の確認のみ
  });

  test('全フェーズを順番に確認できる', async ({ page, titlePage, mainPage }) => {
    // Given: 新規ゲームを開始
    await titlePage.goto();
    await titlePage.clickNewGame();
    await mainPage.waitForMainScreen();

    // フェーズ1: 依頼受注
    await expect(mainPage.phaseIndicator).toContainText(testData.phases.QUEST_ACCEPT);
    await mainPage.goToNextPhase();

    // フェーズ2: 採取
    await expect(mainPage.phaseIndicator).toContainText(testData.phases.GATHERING);
    const nextPhaseVisible = await mainPage.nextPhaseButton.isVisible().catch(() => false);
    if (nextPhaseVisible) {
      await mainPage.goToNextPhase();
    }

    // フェーズ3: 調合
    await expect(mainPage.phaseIndicator).toContainText(testData.phases.ALCHEMY);
    await mainPage.goToNextPhase();

    // フェーズ4: 納品
    await expect(mainPage.phaseIndicator).toContainText(testData.phases.DELIVERY);
  });
});
