import type { Locator, Page } from '@playwright/test';

/**
 * ゲームページのPage Objectクラス
 * Phaserゲームのキャンバスとインタラクションを行う
 */
export class GamePage {
	readonly page: Page;
	readonly canvas: Locator;
	readonly gameContainer: Locator;

	constructor(page: Page) {
		this.page = page;
		this.gameContainer = page.locator('#game-container');
		this.canvas = page.locator('#game-container canvas');
	}

	/**
	 * ゲームのキャンバスが読み込まれるまで待機
	 */
	async waitForGameLoad(): Promise<void> {
		await this.canvas.waitFor({ state: 'visible', timeout: 10000 });
	}

	/**
	 * キャンバスのサイズを取得
	 */
	async getCanvasSize(): Promise<{ width: number; height: number }> {
		const boundingBox = await this.canvas.boundingBox();
		return {
			width: boundingBox?.width ?? 0,
			height: boundingBox?.height ?? 0,
		};
	}

	/**
	 * キャンバス上の指定座標をクリック
	 */
	async clickCanvas(x: number, y: number): Promise<void> {
		await this.canvas.click({ position: { x, y } });
	}

	/**
	 * スクリーンショットを撮影
	 */
	async takeScreenshot(name: string): Promise<void> {
		await this.page.screenshot({ path: `e2e/screenshots/${name}.png` });
	}
}
