/**
 * SCN-005: ゲームオーバーフロー
 *
 * @description
 * デバッグツールで残り1日に設定し、日終了でGameOverSceneに遷移することを確認する。
 * 優先度: P1 / 信頼度: 🔵
 *
 * @前提条件 なし
 */

import { expect, test } from '../../fixtures/game.fixture';
import { GamePage } from '../../pages/game.page';
import { MainPage } from '../../pages/main.page';
import { ResultPage } from '../../pages/result.page';
import { TitlePage } from '../../pages/title.page';

test.describe('SCN-005: ゲームオーバーフロー', () => {
  test.beforeEach(async ({ gamePage }) => {
    // セーブデータをクリア
    await gamePage.evaluate(() => {
      localStorage.removeItem('atelier-guild-rank-save');
    });
  });

  test('日数切れ＋Sランク未到達でGameOverSceneに遷移する', async ({ gamePage }) => {
    // Step 1: 新規ゲーム開始
    const title = new TitlePage(gamePage);
    await title.waitForTitleLoad();
    await title.clickNewGame();

    const main = new MainPage(gamePage);
    await main.waitForMainLoad();

    // Step 2: デバッグで残り1日に設定
    await main.skipToDay(1);

    // Step 3: 残り日数確認
    const days = await main.getRemainingDays();
    expect(days).toBe(1);

    // Step 4: ランクがGのまま（Sランク未到達）であることを確認
    const rank = await main.getCurrentRank();
    expect(rank).toBe('G');

    // Step 5: 日終了を実行
    await main.endDay();

    // Step 6: GameOverScene遷移待機
    const result = new ResultPage(gamePage);
    await result.waitForResultScreen();

    // Step 7: ゲームオーバー状態を検証
    const isGameOver = await result.isGameOver();
    expect(isGameOver).toBe(true);

    const state = await result.getGameState();
    expect(state.currentScene).toBe('GameOverScene');
  });

  test('ゲームオーバー画面のスクリーンショットが取得できる', async ({ gamePage }) => {
    const title = new TitlePage(gamePage);
    await title.waitForTitleLoad();
    await title.clickNewGame();

    const main = new MainPage(gamePage);
    await main.waitForMainLoad();

    await main.skipToDay(1);
    await main.endDay();

    const result = new ResultPage(gamePage);
    await result.waitForResultScreen();

    const game = new GamePage(gamePage);
    await game.takeScreenshot('scn-005-game-over');
  });

  test('ゲームオーバーまでコンソールエラーが発生しない', async ({ gamePage }) => {
    const errors: string[] = [];
    gamePage.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    const title = new TitlePage(gamePage);
    await title.waitForTitleLoad();
    await title.clickNewGame();

    const main = new MainPage(gamePage);
    await main.waitForMainLoad();

    await main.skipToDay(1);
    await main.endDay();

    const result = new ResultPage(gamePage);
    await result.waitForResultScreen();

    const criticalErrors = errors.filter((e) => !e.includes('warning') && !e.includes('Warning'));
    expect(criticalErrors).toHaveLength(0);
  });
});
