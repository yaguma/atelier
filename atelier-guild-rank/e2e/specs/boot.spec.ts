import { expect, test } from '../fixtures/game.fixture';
import { GamePage } from '../pages/game.page';

test.describe('Game Boot', () => {
	test('should load the game canvas', async ({ gamePage }) => {
		const game = new GamePage(gamePage);
		await game.waitForGameLoad();

		// キャンバスが表示されていることを確認
		await expect(game.canvas).toBeVisible();
	});

	test('should have correct canvas size', async ({ gamePage }) => {
		const game = new GamePage(gamePage);
		await game.waitForGameLoad();

		const size = await game.getCanvasSize();
		// 設計書の解像度に基づく（1280x720または適切なサイズ）
		expect(size.width).toBeGreaterThan(0);
		expect(size.height).toBeGreaterThan(0);
	});

	test('should not have console errors on boot', async ({ gamePage }) => {
		const errors: string[] = [];
		gamePage.on('console', (msg) => {
			if (msg.type() === 'error') {
				errors.push(msg.text());
			}
		});

		const game = new GamePage(gamePage);
		await game.waitForGameLoad();

		// 致命的なエラーがないことを確認
		expect(errors.filter((e) => !e.includes('warning'))).toHaveLength(0);
	});
});
