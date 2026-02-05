/**
 * SCN-003: ゲームクリア（デバッグ高速版）
 *
 * @description
 * デバッグツールでSランクに設定し、日終了でGameClearSceneに遷移することを確認する。
 * 優先度: P0 / 信頼度: 🔵
 *
 * @前提条件 なし
 */

import { expect, test } from '../../fixtures/game.fixture';
import { GamePage } from '../../pages/game.page';
import { TitlePage } from '../../pages/title.page';
import { MainPage } from '../../pages/main.page';
import { ResultPage } from '../../pages/result.page';

test.describe('SCN-003: ゲームクリア（デバッグ高速版）', () => {
	test.beforeEach(async ({ gamePage }) => {
		// セーブデータをクリア
		await gamePage.evaluate(() => {
			localStorage.removeItem('atelier-guild-rank-save');
		});
	});

	test('Sランク設定後の日終了でGameClearSceneに遷移する', async ({ gamePage }) => {
		// Step 1: 新規ゲーム開始
		const title = new TitlePage(gamePage);
		await title.waitForTitleLoad();
		await title.clickNewGame();

		const main = new MainPage(gamePage);
		await main.waitForMainLoad();

		// Step 2: デバッグでSランクに設定
		await main.setRank('S');

		// ランク設定を確認
		const rank = await main.getCurrentRank();
		expect(rank).toBe('S');

		// Step 3: 日終了を実行
		await main.endDay();

		// Step 4: GameClearScene遷移待機
		const result = new ResultPage(gamePage);
		await result.waitForResultScreen();

		// Step 5: ゲームクリア状態を検証
		const isGameClear = await result.isGameClear();
		expect(isGameClear).toBe(true);

		const state = await result.getGameState();
		expect(state.currentScene).toBe('GameClearScene');
	});

	test('ゲームクリア画面のスクリーンショットが取得できる', async ({ gamePage }) => {
		const title = new TitlePage(gamePage);
		await title.waitForTitleLoad();
		await title.clickNewGame();

		const main = new MainPage(gamePage);
		await main.waitForMainLoad();

		await main.setRank('S');
		await main.endDay();

		const result = new ResultPage(gamePage);
		await result.waitForResultScreen();

		const game = new GamePage(gamePage);
		await game.takeScreenshot('scn-003-game-clear');
	});

	test('ゲームクリアまでコンソールエラーが発生しない', async ({ gamePage }) => {
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

		await main.setRank('S');
		await main.endDay();

		const result = new ResultPage(gamePage);
		await result.waitForResultScreen();

		const criticalErrors = errors.filter(
			(e) => !e.includes('warning') && !e.includes('Warning'),
		);
		expect(criticalErrors).toHaveLength(0);
	});
});
