/**
 * SCN-006: リザルト→タイトル復帰
 *
 * @description
 * ゲームクリア/ゲームオーバー画面からタイトルへ正常に遷移できることを確認する。
 * 優先度: P1 / 信頼度: 🔵
 *
 * @前提条件 なし
 */

import { expect, test } from '../../fixtures/game.fixture';
import { TitlePage } from '../../pages/title.page';
import { MainPage } from '../../pages/main.page';
import { ResultPage } from '../../pages/result.page';

test.describe('SCN-006: リザルト→タイトル復帰', () => {
	test.beforeEach(async ({ gamePage }) => {
		// セーブデータをクリア
		await gamePage.evaluate(() => {
			localStorage.removeItem('atelier-guild-rank-save');
		});
	});

	test('ゲームクリア画面からタイトルへ戻れる', async ({ gamePage }) => {
		// ゲームクリア状態を作成
		const title = new TitlePage(gamePage);
		await title.waitForTitleLoad();
		await title.clickNewGame();

		const main = new MainPage(gamePage);
		await main.waitForMainLoad();

		await main.setRank('S');
		await main.endDay();

		// リザルト画面を確認
		const result = new ResultPage(gamePage);
		await result.waitForResultScreen();

		const isGameClear = await result.isGameClear();
		expect(isGameClear).toBe(true);

		// タイトルへ戻る
		await result.returnToTitle();

		// TitleSceneに遷移したことを確認
		await title.waitForTitleLoad();
		const state = await title.getGameState();
		expect(state.currentScene).toBe('TitleScene');
	});

	test('ゲームオーバー画面からタイトルへ戻れる', async ({ gamePage }) => {
		// ゲームオーバー状態を作成
		const title = new TitlePage(gamePage);
		await title.waitForTitleLoad();
		await title.clickNewGame();

		const main = new MainPage(gamePage);
		await main.waitForMainLoad();

		await main.skipToDay(1);
		await main.endDay();

		// リザルト画面を確認
		const result = new ResultPage(gamePage);
		await result.waitForResultScreen();

		const isGameOver = await result.isGameOver();
		expect(isGameOver).toBe(true);

		// タイトルへ戻る
		await result.returnToTitle();

		// TitleSceneに遷移したことを確認
		await title.waitForTitleLoad();
		const state = await title.getGameState();
		expect(state.currentScene).toBe('TitleScene');
	});

	test('リザルトからタイトル復帰後に再度ゲームを開始できる', async ({ gamePage }) => {
		// ゲームクリア→タイトル→再開始
		const title = new TitlePage(gamePage);
		await title.waitForTitleLoad();
		await title.clickNewGame();

		const main = new MainPage(gamePage);
		await main.waitForMainLoad();

		await main.setRank('S');
		await main.endDay();

		const result = new ResultPage(gamePage);
		await result.waitForResultScreen();

		// タイトルへ戻る
		await result.returnToTitle();
		await title.waitForTitleLoad();

		// 再度新規ゲーム開始
		await title.clickNewGame();

		const main2 = new MainPage(gamePage);
		await main2.waitForMainLoad();

		// 初期状態にリセットされていることを確認
		const rank = await main2.getCurrentRank();
		const days = await main2.getRemainingDays();
		expect(rank).toBe('G');
		expect(days).toBe(30);
	});
});
