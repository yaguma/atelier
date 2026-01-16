import { test as base, type Page } from '@playwright/test';

export interface GameFixtures {
	gamePage: Page;
}

export const test = base.extend<GameFixtures>({
	gamePage: async ({ page }, use) => {
		// ゲームページに移動
		await page.goto('/');
		// Phaserキャンバスが読み込まれるまで待機
		await page.waitForSelector('#game-container canvas', { timeout: 10000 });
		await use(page);
	},
});

export { expect } from '@playwright/test';
