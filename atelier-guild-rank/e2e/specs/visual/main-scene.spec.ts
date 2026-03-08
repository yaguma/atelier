/**
 * メイン画面（4フェーズ）ビジュアルリグレッションテスト
 *
 * @description
 * メイン画面の各フェーズの表示をビジュアルテストで検証する。
 * テスト計画書: TC-E2E-QUEST-001, TC-E2E-GATHER-001, TC-E2E-ALCHEMY-001, TC-E2E-DELIVER-001
 */

import { expect, test } from '../../fixtures/game.fixture';
import { MainPage } from '../../pages/main.page';
import { MouseInteractionPage } from '../../pages/mouse-interaction.page';
import { TitlePage } from '../../pages/title.page';
import { VisualRegressionPage } from '../../pages/visual-regression.page';

test.describe('メイン画面 - フェーズ別ビジュアルテスト', () => {
  // ビジュアルテストはフェーズスキップ＋スクリーンショット比較に時間がかかるため60秒に設定
  test.describe.configure({ timeout: 60000 });

  let visual: VisualRegressionPage;
  let main: MainPage;
  let title: TitlePage;

  test.beforeEach(async ({ gamePage }) => {
    visual = new VisualRegressionPage(gamePage);
    main = new MainPage(gamePage);
    title = new TitlePage(gamePage);

    // 乱数シードを固定（カード配置を決定的にする）
    await visual.setRandomSeed(42);

    // 新規ゲームを開始してMainSceneへ遷移
    await title.waitForTitleLoad();
    await title.clickNewGame();
    await main.waitForMainLoad();
  });

  /**
   * TC-E2E-QUEST-001: 依頼カード5枚表示
   * 🔵 信頼性レベル: 高（タスク定義に明記）
   */
  test('TC-E2E-QUEST-001: 依頼受注フェーズの表示', async ({ gamePage }) => {
    // Arrange: 依頼受注フェーズになるまで待機
    await visual.waitForPhaseStable('QUEST_ACCEPT');

    // Assert: スクリーンショット比較
    await visual.expectCanvasScreenshot('main-scene-quest-accept');
  });

  /**
   * TC-E2E-GATHER-001: ドラフトカード3枚表示
   * 🔵 信頼性レベル: 高（タスク定義に明記）
   */
  test('TC-E2E-GATHER-001: 採取フェーズの表示', async ({ gamePage }) => {
    // Arrange: 採取フェーズにスキップ
    await main.skipPhase();
    await visual.waitForPhaseStable('GATHERING');

    // Assert: スクリーンショット比較
    await visual.expectCanvasScreenshot('main-scene-gathering');
  });

  /**
   * TC-E2E-ALCHEMY-001: レシピリスト表示
   * 🔵 信頼性レベル: 高（タスク定義に明記）
   */
  test('TC-E2E-ALCHEMY-001: 調合フェーズの表示', async ({ gamePage }) => {
    // Arrange: 調合フェーズにスキップ
    await main.skipPhase(); // QUEST_ACCEPT → GATHERING
    await main.skipPhase(); // GATHERING → ALCHEMY
    await visual.waitForPhaseStable('ALCHEMY');

    // Assert: スクリーンショット比較
    await visual.expectCanvasScreenshot('main-scene-alchemy');
  });

  /**
   * TC-E2E-DELIVER-001: 納品対象依頼表示
   * 🔵 信頼性レベル: 高（タスク定義に明記）
   */
  test('TC-E2E-DELIVER-001: 納品フェーズの表示', async ({ gamePage }) => {
    // Arrange: 納品フェーズにスキップ
    await main.skipPhase(); // QUEST_ACCEPT → GATHERING
    await main.skipPhase(); // GATHERING → ALCHEMY
    await main.skipPhase(); // ALCHEMY → DELIVERY
    await visual.waitForPhaseStable('DELIVERY');

    // Assert: スクリーンショット比較
    await visual.expectCanvasScreenshot('main-scene-delivery');
  });
});

test.describe('メイン画面 - ヘッダー・サイドバー', () => {
  test.describe.configure({ timeout: 60000 });

  let visual: VisualRegressionPage;
  let main: MainPage;
  let title: TitlePage;

  test.beforeEach(async ({ gamePage }) => {
    visual = new VisualRegressionPage(gamePage);
    main = new MainPage(gamePage);
    title = new TitlePage(gamePage);

    // 乱数シードを固定（カード配置を決定的にする）
    await visual.setRandomSeed(42);

    // 新規ゲームを開始
    await title.waitForTitleLoad();
    await title.clickNewGame();
    await main.waitForMainLoad();
  });

  /**
   * TC-E2E-HEADER-001: ランク表示
   * 🔵 信頼性レベル: 高（UI仕様に明記）
   */
  test('TC-E2E-HEADER-001: ヘッダーのランク表示', async ({ gamePage }) => {
    // Arrange: MainSceneが安定するまで待機
    await visual.waitForAnimationSettle();

    // Assert: 初期ランク（G）が表示されている
    const state = await main.getGameState();
    expect(state.currentRank).toBe('G');

    // ヘッダー部分のスクリーンショット
    await visual.expectCanvasScreenshot('main-scene-header');
  });

  /**
   * TC-E2E-SIDEBAR-001: サイドバー表示
   * 🔵 信頼性レベル: 高（UI仕様に明記）
   */
  test('TC-E2E-SIDEBAR-001: サイドバーの表示', async ({ gamePage }) => {
    // Arrange: MainSceneが安定するまで待機
    await visual.waitForAnimationSettle();

    // Assert: サイドバーのスクリーンショット
    await visual.expectCanvasScreenshot('main-scene-sidebar');
  });
});

test.describe('メイン画面 - ホバーエフェクト', () => {
  test.describe.configure({ timeout: 60000 });

  let visual: VisualRegressionPage;
  let mouse: MouseInteractionPage;
  let main: MainPage;
  let title: TitlePage;

  test.beforeEach(async ({ gamePage }) => {
    visual = new VisualRegressionPage(gamePage);
    mouse = new MouseInteractionPage(gamePage);
    main = new MainPage(gamePage);
    title = new TitlePage(gamePage);

    // 乱数シードを固定（カード配置を決定的にする）
    await visual.setRandomSeed(42);

    // 新規ゲームを開始
    await title.waitForTitleLoad();
    await title.clickNewGame();
    await main.waitForMainLoad();
  });

  /**
   * TC-E2E-QUEST-H01: 依頼カードホバー詳細
   * 🔵 信頼性レベル: 高（TASK-0041に明記）
   */
  test('TC-E2E-QUEST-H01: 依頼カードのホバーでツールチップ表示', async ({ gamePage }) => {
    // Arrange: 依頼受注フェーズで待機
    await visual.waitForPhaseStable('QUEST_ACCEPT');

    // Act: 依頼カード1にホバー
    await mouse.showTooltip(MouseInteractionPage.COORDS.QUEST_CARD_1);

    // Assert: ツールチップが表示されている状態のスクリーンショット
    await visual.expectCanvasScreenshot('quest-card-hover-tooltip');
  });

  /**
   * TC-E2E-GATHER-H01: カードホバー詳細表示
   * 🔵 信頼性レベル: 高（TASK-0041に明記）
   */
  test('TC-E2E-GATHER-H01: ドラフトカードのホバーで詳細表示', async ({ gamePage }) => {
    // Arrange: 採取フェーズにスキップ
    await main.skipPhase();
    await visual.waitForPhaseStable('GATHERING');

    // Act: ドラフトカード1にホバー
    await mouse.showTooltip(MouseInteractionPage.COORDS.DRAFT_CARD_1);

    // Assert: ホバー状態のスクリーンショット
    await visual.expectCanvasScreenshot('draft-card-hover-tooltip');
  });

  /**
   * TC-E2E-ALCHEMY-H01: レシピホバー詳細
   * 🔵 信頼性レベル: 高（TASK-0041に明記）
   */
  test('TC-E2E-ALCHEMY-H01: レシピのホバーで詳細表示', async ({ gamePage }) => {
    // Arrange: 調合フェーズにスキップ
    await main.skipPhase();
    await main.skipPhase();
    await visual.waitForPhaseStable('ALCHEMY');

    // Act: レシピ1にホバー
    await mouse.showTooltip(MouseInteractionPage.COORDS.RECIPE_1);

    // Assert: ホバー状態のスクリーンショット
    await visual.expectCanvasScreenshot('recipe-hover-tooltip');
  });
});
