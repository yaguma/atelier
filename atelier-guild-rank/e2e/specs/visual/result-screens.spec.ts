/**
 * リザルト画面 ビジュアルリグレッションテスト
 *
 * @description
 * ゲームクリア画面とゲームオーバー画面の表示をビジュアルテストで検証する。
 * テスト計画書: TC-E2E-CLEAR-001, TC-E2E-OVER-001
 */

import { expect, test } from '../../fixtures/game.fixture';
import { TEST_SCENARIOS } from '../../fixtures/test-data';
import { MainPage } from '../../pages/main.page';
import { TitlePage } from '../../pages/title.page';
import { VisualRegressionPage } from '../../pages/visual-regression.page';

test.describe('ゲームクリア画面 - ビジュアルリグレッション', () => {
  let visual: VisualRegressionPage;
  let main: MainPage;
  let title: TitlePage;

  test.beforeEach(async ({ gamePage }) => {
    visual = new VisualRegressionPage(gamePage);
    main = new MainPage(gamePage);
    title = new TitlePage(gamePage);

    // 新規ゲームを開始
    await title.waitForTitleLoad();
    await title.clickNewGame();
    await main.waitForMainLoad();
  });

  /**
   * TC-E2E-CLEAR-001: GameClearScene表示
   * 🔵 信頼性レベル: 高（シーン仕様に明記）
   */
  test('TC-E2E-CLEAR-001: ゲームクリア画面の表示', async ({ gamePage }) => {
    // Arrange: デバッグツールでSランクに設定してクリア状態にする
    await main.setRank('S');

    // 納品フェーズまでスキップして日終了
    await main.skipPhase(); // QUEST_ACCEPT → GATHERING
    await main.skipPhase(); // GATHERING → ALCHEMY
    await main.skipPhase(); // ALCHEMY → DELIVERY
    await main.endDay(); // クリア判定

    // Assert: GameClearSceneが表示されるまで待機
    await visual.waitForSceneStable('GameClearScene');

    // スクリーンショット比較
    await visual.expectCanvasScreenshot('game-clear-scene');
  });

  /**
   * TC-E2E-CLEAR-002: クリア統計表示
   * 🔵 信頼性レベル: 高（UI仕様に明記）
   */
  test('TC-E2E-CLEAR-002: ゲームクリア画面の統計表示', async ({ gamePage }) => {
    // Arrange: Sランクでクリア
    await main.setRank('S');
    await main.skipPhase();
    await main.skipPhase();
    await main.skipPhase();
    await main.endDay();

    await visual.waitForSceneStable('GameClearScene');

    // Assert: 統計情報が含まれたスクリーンショット
    await visual.expectCanvasScreenshot('game-clear-statistics');

    // 統計値の検証（ゲーム状態から取得可能な場合）
    const state = await main.getGameState();
    expect(state.isGameClear).toBe(true);
  });
});

test.describe('ゲームオーバー画面 - ビジュアルリグレッション', () => {
  let visual: VisualRegressionPage;
  let main: MainPage;
  let title: TitlePage;

  test.beforeEach(async ({ gamePage }) => {
    visual = new VisualRegressionPage(gamePage);
    main = new MainPage(gamePage);
    title = new TitlePage(gamePage);

    // 新規ゲームを開始
    await title.waitForTitleLoad();
    await title.clickNewGame();
    await main.waitForMainLoad();
  });

  /**
   * TC-E2E-OVER-001: GameOverScene表示
   * 🔵 信頼性レベル: 高（シーン仕様に明記）
   */
  test('TC-E2E-OVER-001: ゲームオーバー画面の表示', async ({ gamePage }) => {
    // Arrange: デバッグツールで残り1日に設定
    await main.skipToDay(1);

    // 納品フェーズまでスキップして日終了（ゲームオーバー判定）
    await main.skipPhase(); // QUEST_ACCEPT → GATHERING
    await main.skipPhase(); // GATHERING → ALCHEMY
    await main.skipPhase(); // ALCHEMY → DELIVERY
    await main.endDay(); // ゲームオーバー判定

    // Assert: GameOverSceneが表示されるまで待機
    await visual.waitForSceneStable('GameOverScene');

    // スクリーンショット比較
    await visual.expectCanvasScreenshot('game-over-scene');
  });

  /**
   * TC-E2E-OVER-002: ゲームオーバー統計表示
   * 🔵 信頼性レベル: 高（UI仕様に明記）
   */
  test('TC-E2E-OVER-002: ゲームオーバー画面の統計表示', async ({ gamePage }) => {
    // Arrange: 残り1日でゲームオーバー
    await main.skipToDay(1);
    await main.skipPhase();
    await main.skipPhase();
    await main.skipPhase();
    await main.endDay();

    await visual.waitForSceneStable('GameOverScene');

    // Assert: 統計情報が含まれたスクリーンショット
    await visual.expectCanvasScreenshot('game-over-statistics');

    // 統計値の検証
    const state = await main.getGameState();
    expect(state.isGameOver).toBe(true);
  });
});

test.describe('リザルト画面 - ボタン操作', () => {
  let visual: VisualRegressionPage;
  let main: MainPage;
  let title: TitlePage;

  test.beforeEach(async ({ gamePage }) => {
    visual = new VisualRegressionPage(gamePage);
    main = new MainPage(gamePage);
    title = new TitlePage(gamePage);
  });

  /**
   * TC-E2E-CLEAR-003: タイトルへ戻るボタン
   * 🔵 信頼性レベル: 高（UI仕様に明記）
   */
  test('TC-E2E-CLEAR-003: ゲームクリアからタイトルへ戻る', async ({ gamePage }) => {
    // Arrange: ゲームクリア状態にする
    await title.waitForTitleLoad();
    await title.clickNewGame();
    await main.waitForMainLoad();
    await main.setRank('S');
    await main.skipPhase();
    await main.skipPhase();
    await main.skipPhase();
    await main.endDay();
    await visual.waitForSceneStable('GameClearScene');

    // Act: タイトルへ戻るボタンをクリック（デバッグツール経由）
    await main.returnToTitle();

    // Assert: TitleSceneに遷移
    await visual.waitForSceneStable('TitleScene');
    const state = await main.getGameState();
    expect(state.currentScene).toBe('TitleScene');
  });

  /**
   * TC-E2E-OVER-003: タイトルへ戻るボタン
   * 🔵 信頼性レベル: 高（UI仕様に明記）
   */
  test('TC-E2E-OVER-003: ゲームオーバーからタイトルへ戻る', async ({ gamePage }) => {
    // Arrange: ゲームオーバー状態にする
    await title.waitForTitleLoad();
    await title.clickNewGame();
    await main.waitForMainLoad();
    await main.skipToDay(1);
    await main.skipPhase();
    await main.skipPhase();
    await main.skipPhase();
    await main.endDay();
    await visual.waitForSceneStable('GameOverScene');

    // Act: タイトルへ戻るボタンをクリック（デバッグツール経由）
    await main.returnToTitle();

    // Assert: TitleSceneに遷移
    await visual.waitForSceneStable('TitleScene');
    const state = await main.getGameState();
    expect(state.currentScene).toBe('TitleScene');
  });

  /**
   * TC-E2E-OVER-004: リトライボタン
   * 🔵 信頼性レベル: 高（UI仕様に明記）
   */
  test.skip('TC-E2E-OVER-004: ゲームオーバーからリトライ', async ({ gamePage }) => {
    // Note: リトライ機能のデバッグツール実装が必要
    // Arrange: ゲームオーバー状態にする
    // Act: リトライボタンをクリック
    // Assert: MainSceneに遷移し、初期状態にリセット
  });
});
