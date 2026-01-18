import { BasePage } from './base.page';

/**
 * ゲームページのPage Objectクラス
 *
 * @description
 * Phaserゲームのキャンバスとの基本的なインタラクションを提供する。
 * 特定のシーンに依存しない汎用的な操作を行う。
 *
 * @example
 * ```typescript
 * const game = new GamePage(page);
 * await game.waitForGameLoad();
 * const { width, height } = await game.getCanvasSize();
 * ```
 */
export class GamePage extends BasePage {
	/**
	 * ゲームのキャンバスが読み込まれるまで待機
	 */
	async waitForGameLoad(): Promise<void> {
		await this.waitForCanvasVisible();
	}

	/**
	 * キャンバスのサイズを取得
	 *
	 * @returns キャンバスの幅と高さ
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
	 *
	 * @param x - クリックするX座標
	 * @param y - クリックするY座標
	 */
	async clickCanvas(x: number, y: number): Promise<void> {
		await this.canvas.click({ position: { x, y } });
	}

	/**
	 * スクリーンショットを撮影
	 *
	 * @param name - 保存するファイル名（拡張子なし）
	 */
	async takeScreenshot(name: string): Promise<void> {
		await this.page.screenshot({ path: `e2e/screenshots/${name}.png` });
	}
}
