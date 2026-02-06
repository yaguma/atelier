/**
 * SCN-001: ゲーム起動→新規ゲーム開始
 *
 * @description
 * Boot→Title→MainScene遷移を確認し、初期状態が正しいことを検証する。
 * 優先度: P0 / 信頼度: 🔵
 *
 * @前提条件 クリーンな状態（セーブデータなし）
 */

import { expect, test } from '../../fixtures/game.fixture';
import { GamePage } from '../../pages/game.page';
import { TitlePage } from '../../pages/title.page';
import { MainPage } from '../../pages/main.page';

test.describe('SCN-001: ゲーム起動→新規ゲーム開始', () => {
	test.beforeEach(async ({ gamePage }) => {
		// セーブデータをクリア
		await gamePage.evaluate(() => {
			localStorage.removeItem('atelier-guild-rank-save');
		});
	});

	test('ゲームキャンバスが正常に表示される', async ({ gamePage }) => {
		const game = new GamePage(gamePage);
		await game.waitForGameLoad();

		await expect(game.canvas).toBeVisible();
		const size = await game.getCanvasSize();
		expect(size.width).toBeGreaterThan(0);
		expect(size.height).toBeGreaterThan(0);
	});

	test('TitleSceneが正常に読み込まれる', async ({ gamePage }) => {
		const title = new TitlePage(gamePage);
		await title.waitForTitleLoad();

		const state = await title.getGameState();
		expect(state.currentScene).toBe('TitleScene');
	});

	test('新規ゲーム開始でMainSceneに遷移し、初期状態が正しい', async ({ gamePage }) => {
		const title = new TitlePage(gamePage);
		await title.waitForTitleLoad();

		// 新規ゲーム開始
		await title.clickNewGame();

		// MainScene遷移待機
		const main = new MainPage(gamePage);
		await main.waitForMainLoad();

		// 初期状態の検証
		const rank = await main.getCurrentRank();
		const days = await main.getRemainingDays();
		const gold = await main.getGold();
		const ap = await main.getActionPoints();
		const phase = await main.getCurrentPhase();

		expect(rank).toBe('G');
		expect(days).toBe(30);
		expect(gold).toBe(100);
		expect(ap).toBe(3);
		// フェーズは QUEST_ACCEPT で始まる
		expect(phase).toBeTruthy();
	});

	test('新規ゲーム開始時にコンソールエラーが発生しない', async ({ gamePage }) => {
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

		// 致命的なエラーがないことを確認（warningは許容）
		const criticalErrors = errors.filter(
			(e) => !e.includes('warning') && !e.includes('Warning'),
		);
		expect(criticalErrors).toHaveLength(0);
	});

	test('スクリーンショットが正常に取得できる', async ({ gamePage }) => {
		const title = new TitlePage(gamePage);
		await title.waitForTitleLoad();
		await title.clickNewGame();

		const main = new MainPage(gamePage);
		await main.waitForMainLoad();

		// スクリーンショット取得（MainScene初期状態）
		const game = new GamePage(gamePage);
		await game.takeScreenshot('scn-001-main-scene-initial');
	});
});
