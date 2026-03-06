/**
 * SCN-007: 複数日連続プレイ
 *
 * @description
 * 3日間連続で全フェーズを操作し、安定したゲームプレイが可能であることを確認する。
 * 優先度: P2 / 信頼度: 🟡
 *
 * @前提条件 なし
 */

import { expect, test } from '../../fixtures/game.fixture';
import { INITIAL_DAY_LIMIT } from '../../fixtures/test-data';
import { GamePage } from '../../pages/game.page';
import { MainPage } from '../../pages/main.page';
import { PhaseFlowPage } from '../../pages/phase-flow.page';
import { TitlePage } from '../../pages/title.page';

test.describe('SCN-007: 複数日連続プレイ', () => {
  // Issue #365: skipFullDay()×3回で12秒以上かかるためタイムアウトを延長
  test.describe.configure({ timeout: 60000 });

  test.beforeEach(async ({ gamePage }) => {
    // セーブデータをクリア
    await gamePage.evaluate(() => {
      localStorage.removeItem('atelier-guild-rank-save');
    });
  });

  test('3日間連続でデバッグスキップによるフェーズ進行が安定する', async ({ gamePage }) => {
    const title = new TitlePage(gamePage);
    await title.waitForTitleLoad();
    await title.clickNewGame();

    const main = new MainPage(gamePage);
    await main.waitForMainLoad();

    const flow = new PhaseFlowPage(gamePage);

    const initialDays = await main.getRemainingDays();
    expect(initialDays).toBe(INITIAL_DAY_LIMIT);

    // 3日間ループ
    for (let day = 1; day <= 3; day++) {
      const daysBefore = await main.getRemainingDays();

      // 全フェーズをスキップ
      await flow.skipFullDay();

      const state = await flow.getGameState();

      // MainSceneに留まっている場合のみ検証
      if (state.currentScene === 'MainScene') {
        const daysAfter = await main.getRemainingDays();
        // 残り日数が減少していることを確認
        expect(daysAfter).toBeLessThan(daysBefore);
      } else {
        // ゲーム終了シーンに遷移した場合はループを抜ける
        break;
      }
    }
  });

  test('複数日プレイでゴールドと行動ポイントが正常に管理される', async ({ gamePage }) => {
    const title = new TitlePage(gamePage);
    await title.waitForTitleLoad();
    await title.clickNewGame();

    const main = new MainPage(gamePage);
    await main.waitForMainLoad();

    const flow = new PhaseFlowPage(gamePage);

    // Day 1
    const goldDay1 = await main.getGold();
    expect(goldDay1).toBe(100);

    await flow.skipFullDay();

    let state = await flow.getGameState();
    if (state.currentScene !== 'MainScene') return;

    // Day 2 - ゴールドを追加してから進行
    await main.addGold(500);
    const goldAfterAdd = await main.getGold();
    expect(goldAfterAdd).toBe(600);

    await flow.skipFullDay();

    state = await flow.getGameState();
    if (state.currentScene !== 'MainScene') return;

    // Day 3 - 行動ポイントが回復していることを確認
    const ap = await main.getActionPoints();
    expect(ap).toBeGreaterThan(0);
  });

  test('3日間コンソールエラーが発生しない', async ({ gamePage }) => {
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

    const flow = new PhaseFlowPage(gamePage);

    for (let day = 1; day <= 3; day++) {
      await flow.skipFullDay();

      const state = await flow.getGameState();
      if (state.currentScene !== 'MainScene') break;
    }

    const criticalErrors = errors.filter((e) => !e.includes('warning') && !e.includes('Warning'));
    expect(criticalErrors).toHaveLength(0);
  });

  test('各日のスクリーンショットが取得できる', async ({ gamePage }) => {
    const title = new TitlePage(gamePage);
    await title.waitForTitleLoad();
    await title.clickNewGame();

    const main = new MainPage(gamePage);
    await main.waitForMainLoad();

    const flow = new PhaseFlowPage(gamePage);
    const game = new GamePage(gamePage);

    for (let day = 1; day <= 3; day++) {
      await game.takeScreenshot(`scn-007-day${day}-start`);

      await flow.skipFullDay();

      const state = await flow.getGameState();
      if (state.currentScene !== 'MainScene') {
        await game.takeScreenshot(`scn-007-day${day}-end-scene`);
        break;
      }
    }
  });
});
