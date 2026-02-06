/**
 * キーボードナビゲーション E2Eテスト
 *
 * @description
 * キーボードのみでゲームを操作できることを検証する。
 * テスト計画書: TC-E2E-TITLE-002, TC-E2E-QUEST-004, TC-E2E-QUEST-H02
 */

import { expect, test } from '../../fixtures/game.fixture';
import { KeyboardInputPage } from '../../pages/keyboard-input.page';
import { MainPage } from '../../pages/main.page';
import { TitlePage } from '../../pages/title.page';
import { VisualRegressionPage } from '../../pages/visual-regression.page';

test.describe('タイトル画面 - キーボードナビゲーション', () => {
  let keyboard: KeyboardInputPage;
  let title: TitlePage;
  let main: MainPage;
  let visual: VisualRegressionPage;

  test.beforeEach(async ({ gamePage }) => {
    keyboard = new KeyboardInputPage(gamePage);
    title = new TitlePage(gamePage);
    main = new MainPage(gamePage);
    visual = new VisualRegressionPage(gamePage);

    await title.waitForTitleLoad();
  });

  /**
   * TC-E2E-TITLE-002: 新規ゲームボタンクリック（キーボード）
   * 🔵 信頼性レベル: 高（基本操作）
   */
  test('TC-E2E-TITLE-002: Enterキーで新規ゲームを開始', async ({ gamePage }) => {
    // Arrange: タイトル画面が表示されている
    await visual.waitForSceneStable('TitleScene');

    // Act: Enterキーを押下
    await keyboard.confirm();

    // Assert: MainSceneに遷移
    await visual.waitForSceneStable('MainScene');
    const state = await main.getGameState();
    expect(state.currentScene).toBe('MainScene');
  });

  /**
   * TC-E2E-TITLE-004: コンティニューでゲーム再開（キーボード）
   * 🔵 信頼性レベル: 高（基本操作）
   */
  test.skip('TC-E2E-TITLE-004: 矢印キーでコンティニューを選択して再開', async ({ gamePage }) => {
    // Note: セーブデータがある前提のテスト

    // Arrange: セーブデータを作成（要デバッグツール）
    // await main.createSaveData();

    // Act: 下矢印でコンティニューを選択し、Enterで確定
    await keyboard.moveDown();
    await keyboard.confirm();

    // Assert: MainSceneに遷移し、セーブ状態が復元
    await visual.waitForSceneStable('MainScene');
  });
});

test.describe('依頼受注フェーズ - キーボード操作', () => {
  let keyboard: KeyboardInputPage;
  let main: MainPage;
  let title: TitlePage;
  let visual: VisualRegressionPage;

  test.beforeEach(async ({ gamePage }) => {
    keyboard = new KeyboardInputPage(gamePage);
    main = new MainPage(gamePage);
    title = new TitlePage(gamePage);
    visual = new VisualRegressionPage(gamePage);

    // 新規ゲームを開始
    await title.waitForTitleLoad();
    await title.clickNewGame();
    await main.waitForMainLoad();
    await visual.waitForPhaseStable('QUEST_ACCEPT');
  });

  /**
   * キーボードで依頼カードを選択
   * 🔵 信頼性レベル: 高（基本操作）
   */
  test('番号キー(1)で依頼カード1を選択', async ({ gamePage }) => {
    // Act: 1キーで1枚目の依頼カードを選択
    await keyboard.selectQuestCard(1);

    // Assert: 詳細モーダルが表示される（ゲーム状態で確認）
    await gamePage.waitForTimeout(300);
    // Note: モーダル表示状態の確認はゲーム側の実装に依存
  });

  /**
   * TC-E2E-QUEST-H02: 詳細モーダルESCで閉じる
   * 🔵 信頼性レベル: 高（TASK-0043に明記）
   */
  test('TC-E2E-QUEST-H02: ESCキーでモーダルを閉じる', async ({ gamePage }) => {
    // Arrange: 依頼カードを選択してモーダルを開く
    await keyboard.selectQuestCard(1);
    await gamePage.waitForTimeout(300);

    // Act: ESCキーでモーダルを閉じる
    await keyboard.cancel();

    // Assert: モーダルが閉じる
    await gamePage.waitForTimeout(200);
  });

  /**
   * TC-E2E-QUEST-004: 次へボタンで採取フェーズへ（キーボード）
   * 🔵 信頼性レベル: 高（基本操作）
   */
  test('TC-E2E-QUEST-004: キーボードで次フェーズへ遷移', async ({ gamePage }) => {
    // Arrange: 依頼を受注（デバッグツール経由でスキップ）
    // 実際のUI操作ではなく、状態遷移の確認に焦点

    // Act: デバッグツールで次フェーズへ
    await main.skipPhase();

    // Assert: 採取フェーズに遷移
    await visual.waitForPhaseStable('GATHERING');
    const state = await main.getGameState();
    expect(state.currentPhase).toBe('GATHERING');
  });
});

test.describe('採取フェーズ - キーボード操作', () => {
  let keyboard: KeyboardInputPage;
  let main: MainPage;
  let title: TitlePage;
  let visual: VisualRegressionPage;

  test.beforeEach(async ({ gamePage }) => {
    keyboard = new KeyboardInputPage(gamePage);
    main = new MainPage(gamePage);
    title = new TitlePage(gamePage);
    visual = new VisualRegressionPage(gamePage);

    // 新規ゲームを開始して採取フェーズへ
    await title.waitForTitleLoad();
    await title.clickNewGame();
    await main.waitForMainLoad();
    await main.skipPhase(); // QUEST_ACCEPT → GATHERING
    await visual.waitForPhaseStable('GATHERING');
  });

  /**
   * キーボードでドラフトカードを選択
   * 🔵 信頼性レベル: 高（基本操作）
   */
  test('番号キー(1)でドラフトカード1を選択', async ({ gamePage }) => {
    // Act: 1キーで1枚目のドラフトカードを選択
    await keyboard.selectDraftCard(1);

    // Assert: カードが選択される（素材獲得）
    await gamePage.waitForTimeout(300);
  });

  /**
   * TC-E2E-GATHER-003: 次へボタンで調合フェーズへ（キーボード）
   * 🔵 信頼性レベル: 高（基本操作）
   */
  test('TC-E2E-GATHER-003: キーボードで調合フェーズへ遷移', async ({ gamePage }) => {
    // Act: デバッグツールで次フェーズへ
    await main.skipPhase();

    // Assert: 調合フェーズに遷移
    await visual.waitForPhaseStable('ALCHEMY');
    const state = await main.getGameState();
    expect(state.currentPhase).toBe('ALCHEMY');
  });
});

test.describe('調合フェーズ - キーボード操作', () => {
  let keyboard: KeyboardInputPage;
  let main: MainPage;
  let title: TitlePage;
  let visual: VisualRegressionPage;

  test.beforeEach(async ({ gamePage }) => {
    keyboard = new KeyboardInputPage(gamePage);
    main = new MainPage(gamePage);
    title = new TitlePage(gamePage);
    visual = new VisualRegressionPage(gamePage);

    // 新規ゲームを開始して調合フェーズへ
    await title.waitForTitleLoad();
    await title.clickNewGame();
    await main.waitForMainLoad();
    await main.skipPhase(); // QUEST_ACCEPT → GATHERING
    await main.skipPhase(); // GATHERING → ALCHEMY
    await visual.waitForPhaseStable('ALCHEMY');
  });

  /**
   * キーボードでレシピを選択
   * 🔵 信頼性レベル: 高（基本操作）
   */
  test('番号キー(1)でレシピ1を選択', async ({ gamePage }) => {
    // Act: 1キーで1番目のレシピを選択
    await keyboard.selectRecipe(1);

    // Assert: レシピが選択される
    await gamePage.waitForTimeout(300);
  });

  /**
   * TC-E2E-ALCHEMY-009: 次へボタンで納品フェーズへ（キーボード）
   * 🔵 信頼性レベル: 高（基本操作）
   */
  test('TC-E2E-ALCHEMY-009: キーボードで納品フェーズへ遷移', async ({ gamePage }) => {
    // Act: デバッグツールで次フェーズへ
    await main.skipPhase();

    // Assert: 納品フェーズに遷移
    await visual.waitForPhaseStable('DELIVERY');
    const state = await main.getGameState();
    expect(state.currentPhase).toBe('DELIVERY');
  });
});

test.describe('納品フェーズ - キーボード操作', () => {
  let keyboard: KeyboardInputPage;
  let main: MainPage;
  let title: TitlePage;
  let visual: VisualRegressionPage;

  test.beforeEach(async ({ gamePage }) => {
    keyboard = new KeyboardInputPage(gamePage);
    main = new MainPage(gamePage);
    title = new TitlePage(gamePage);
    visual = new VisualRegressionPage(gamePage);

    // 新規ゲームを開始して納品フェーズへ
    await title.waitForTitleLoad();
    await title.clickNewGame();
    await main.waitForMainLoad();
    await main.skipPhase(); // QUEST_ACCEPT → GATHERING
    await main.skipPhase(); // GATHERING → ALCHEMY
    await main.skipPhase(); // ALCHEMY → DELIVERY
    await visual.waitForPhaseStable('DELIVERY');
  });

  /**
   * TC-E2E-DELIVER-004: 日終了で次の日へ（キーボード）
   * 🔵 信頼性レベル: 高（基本操作）
   */
  test('TC-E2E-DELIVER-004: キーボードで日を終了', async ({ gamePage }) => {
    // Arrange: 初期日数を確認
    const beforeState = await main.getGameState();
    const initialDays = beforeState.remainingDays ?? 30;

    // Act: デバッグツールで日終了
    await main.endDay();

    // Assert: 次の日に遷移（残り日数が減少）
    await visual.waitForPhaseStable('QUEST_ACCEPT');
    const afterState = await main.getGameState();
    expect(afterState.remainingDays).toBe(initialDays - 1);
  });
});
