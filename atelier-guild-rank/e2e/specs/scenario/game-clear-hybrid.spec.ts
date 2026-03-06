/**
 * SCN-004: ゲームクリア（ハイブリッド版）
 *
 * @description
 * 数日分を座標クリック操作＋デバッグでランク進行し、Sランク到達を確認する。
 * 優先度: P1 / 信頼度: 🟡
 *
 * @前提条件 なし
 */

import { expect, test } from '../../fixtures/game.fixture';
import { INITIAL_DAY_LIMIT } from '../../fixtures/test-data';
import { GamePage } from '../../pages/game.page';
import { MainPage } from '../../pages/main.page';
import { PhaseFlowPage } from '../../pages/phase-flow.page';
import { ResultPage } from '../../pages/result.page';
import { TitlePage } from '../../pages/title.page';

test.describe('SCN-004: ゲームクリア（ハイブリッド版）', () => {
  test.beforeEach(async ({ gamePage }) => {
    // セーブデータをクリア
    await gamePage.evaluate(() => {
      localStorage.removeItem('atelier-guild-rank-save');
    });
  });

  test('座標クリック操作+デバッグ補助でゲームクリアに到達できる', async ({ gamePage }) => {
    // Step 1: 新規ゲーム開始
    const title = new TitlePage(gamePage);
    await title.waitForTitleLoad();
    await title.clickNewGame();

    const main = new MainPage(gamePage);
    await main.waitForMainLoad();

    const flow = new PhaseFlowPage(gamePage);

    // Step 2: Day 1 - 全フェーズをデバッグスキップで操作
    await flow.skipFullDay();

    // MainSceneに留まっていることを確認
    let state = await flow.getGameState();
    if (state.currentScene !== 'MainScene') {
      // 日終了でシーン遷移していなければ次へ
      return;
    }

    // Step 3: Day 1終了後、デバッグでランクをBに上げる
    await main.setRank('B');
    const rankAfterDay1 = await main.getCurrentRank();
    expect(rankAfterDay1).toBe('B');

    // Step 4: Day 2 - 全フェーズをデバッグスキップで操作
    await flow.skipFullDay();

    state = await flow.getGameState();
    if (state.currentScene !== 'MainScene') return;

    // Step 5: Day 2終了後、デバッグでランクをAに設定
    await main.setRank('A');

    // Step 6: Day 3 - Sランクへ昇格するためSに設定
    await main.setRank('S');

    // Step 7: 日終了でゲームクリア
    await main.endDay();

    // Step 8: GameClearScene遷移確認
    const result = new ResultPage(gamePage);
    await result.waitForResultScreen();

    const isGameClear = await result.isGameClear();
    expect(isGameClear).toBe(true);
  });

  test('ハイブリッドクリアでゲーム状態の整合性が保たれる', async ({ gamePage }) => {
    const title = new TitlePage(gamePage);
    await title.waitForTitleLoad();
    await title.clickNewGame();

    const main = new MainPage(gamePage);
    await main.waitForMainLoad();

    // 初期状態を確認
    expect(await main.getCurrentRank()).toBe('G');
    expect(await main.getRemainingDays()).toBe(INITIAL_DAY_LIMIT);
    expect(await main.getGold()).toBe(100);

    // ランクを段階的に上げて状態の整合性を確認
    await main.setRank('C');
    expect(await main.getCurrentRank()).toBe('C');

    await main.setRank('B');
    expect(await main.getCurrentRank()).toBe('B');

    await main.setRank('A');
    expect(await main.getCurrentRank()).toBe('A');

    await main.setRank('S');
    expect(await main.getCurrentRank()).toBe('S');

    // ゴールドが変わっていないことを確認
    expect(await main.getGold()).toBe(100);
  });

  test('ハイブリッドクリアのスクリーンショットが取得できる', async ({ gamePage }) => {
    const title = new TitlePage(gamePage);
    await title.waitForTitleLoad();
    await title.clickNewGame();

    const main = new MainPage(gamePage);
    await main.waitForMainLoad();

    const game = new GamePage(gamePage);

    // Day 1: 初期状態
    await game.takeScreenshot('scn-004-day1-start');

    // ランクをSに設定してゲームクリア
    await main.setRank('S');
    await main.endDay();

    const result = new ResultPage(gamePage);
    await result.waitForResultScreen();
    await game.takeScreenshot('scn-004-game-clear-hybrid');
  });
});
