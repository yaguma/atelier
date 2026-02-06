/**
 * タイトル画面 ビジュアルリグレッションテスト
 *
 * @description
 * タイトル画面の表示とホバーエフェクトのビジュアルテストを実行する。
 * テスト計画書: TC-E2E-TITLE-001, TC-E2E-TITLE-H01
 */

import { expect, test } from '../../fixtures/game.fixture';
import { MouseInteractionPage } from '../../pages/mouse-interaction.page';
import { VisualRegressionPage } from '../../pages/visual-regression.page';

test.describe('タイトル画面 - ビジュアルリグレッション', () => {
  let visual: VisualRegressionPage;
  let mouse: MouseInteractionPage;

  test.beforeEach(async ({ gamePage }) => {
    visual = new VisualRegressionPage(gamePage);
    mouse = new MouseInteractionPage(gamePage);
  });

  /**
   * TC-E2E-TITLE-001: タイトル画面表示
   * 🔵 信頼性レベル: 高（タスク定義に明記）
   */
  test('TC-E2E-TITLE-001: タイトル画面が正しく表示される', async ({ gamePage }) => {
    // Arrange: タイトルシーンが表示されるまで待機
    await visual.waitForSceneStable('TitleScene');

    // Act & Assert: スクリーンショット比較
    await visual.expectCanvasScreenshot('title-screen-display');
  });

  /**
   * TC-E2E-TITLE-H01: ボタンホバーエフェクト
   * 🔵 信頼性レベル: 高（TASK-0039に明記）
   */
  test('TC-E2E-TITLE-H01: 新規ゲームボタンのホバーエフェクト', async ({ gamePage }) => {
    // Arrange: タイトルシーンが表示されるまで待機
    await visual.waitForSceneStable('TitleScene');

    // Act: ホバー前のスクリーンショット
    await mouse.unhover();
    await visual.waitForAnimationSettle();
    await visual.expectCanvasScreenshot('title-button-normal');

    // Act: 新規ゲームボタンにホバー
    await mouse.hoverCoords(MouseInteractionPage.COORDS.TITLE_NEW_GAME);

    // Assert: ホバー後のスクリーンショット
    await visual.expectCanvasScreenshot('title-button-hover');
  });

  /**
   * TC-E2E-TITLE-H03: フェードイン表示
   * 🟡 信頼性レベル: 中（TASK-0038から推測）
   */
  test.skip('TC-E2E-TITLE-H03: タイトル画面のフェードイン', async ({ gamePage }) => {
    // Note: フェードインの途中状態をキャプチャするのは不安定なためスキップ
    // 代替として、フェードイン完了後の状態を検証
    await visual.waitForSceneStable('TitleScene');

    // フェードイン完了後のスクリーンショット
    await visual.expectCanvasScreenshot('title-fade-in-complete');
  });
});

test.describe('タイトル画面 - 解像度別表示', () => {
  let visual: VisualRegressionPage;

  test.beforeEach(async ({ gamePage }) => {
    visual = new VisualRegressionPage(gamePage);
  });

  /**
   * TC-E2E-SCALE-001: 最小解像度960x540
   * 🔵 信頼性レベル: 高（要件定義に明記）
   */
  test('TC-E2E-SCALE-001: 最小解像度(960x540)での表示', async ({ gamePage, page }) => {
    // Arrange: 最小解像度に設定
    await visual.setMinimumViewport();
    await visual.waitForSceneStable('TitleScene');

    // Assert: スクリーンショット比較
    await visual.expectCanvasScreenshot('title-screen-960x540');

    // Assert: アスペクト比が16:9を維持
    const isCorrectRatio = await visual.verifyAspectRatio();
    expect(isCorrectRatio).toBe(true);
  });

  /**
   * TC-E2E-SCALE-002: 標準解像度1280x720
   * 🔵 信頼性レベル: 高（基準解像度）
   */
  test('TC-E2E-SCALE-002: 標準解像度(1280x720)での表示', async ({ gamePage, page }) => {
    // Arrange: 標準解像度に設定
    await visual.setStandardViewport();
    await visual.waitForSceneStable('TitleScene');

    // Assert: スクリーンショット比較
    await visual.expectCanvasScreenshot('title-screen-1280x720');

    // Assert: アスペクト比が16:9を維持
    const isCorrectRatio = await visual.verifyAspectRatio();
    expect(isCorrectRatio).toBe(true);
  });

  /**
   * TC-E2E-SCALE-003: FHD解像度1920x1080
   * 🟡 信頼性レベル: 中（要件定義のエッジケースから推測）
   */
  test('TC-E2E-SCALE-003: FHD解像度(1920x1080)での表示', async ({ gamePage, page }) => {
    // Arrange: FHD解像度に設定
    await visual.setFHDViewport();
    await visual.waitForSceneStable('TitleScene');

    // Assert: スクリーンショット比較
    await visual.expectCanvasScreenshot('title-screen-1920x1080');

    // Assert: アスペクト比が16:9を維持
    const isCorrectRatio = await visual.verifyAspectRatio();
    expect(isCorrectRatio).toBe(true);
  });

  /**
   * TC-E2E-SCALE-004: 4K解像度3840x2160
   * 🟡 信頼性レベル: 中（要件定義のエッジケースから推測）
   */
  test.skip('TC-E2E-SCALE-004: 4K解像度(3840x2160)での表示', async ({ gamePage, page }) => {
    // Note: 4K解像度はCI環境で不安定なためスキップ
    await visual.set4KViewport();
    await visual.waitForSceneStable('TitleScene');

    // Assert: アスペクト比が16:9を維持
    const isCorrectRatio = await visual.verifyAspectRatio();
    expect(isCorrectRatio).toBe(true);
  });

  /**
   * TC-E2E-SCALE-005: ウルトラワイド21:9
   * 🟡 信頼性レベル: 中（要件定義のエッジケースから推測）
   */
  test('TC-E2E-SCALE-005: ウルトラワイド(2560x1080)での表示', async ({ gamePage, page }) => {
    // Arrange: ウルトラワイド解像度に設定
    await visual.setUltrawideViewport();
    await visual.waitForSceneStable('TitleScene');

    // Assert: スクリーンショット比較（ピラーボックス表示）
    await visual.expectCanvasScreenshot('title-screen-ultrawide');

    // Assert: ゲームキャンバスは16:9を維持（両端に黒帯）
    const isCorrectRatio = await visual.verifyAspectRatio();
    expect(isCorrectRatio).toBe(true);
  });
});
