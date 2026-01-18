import type { Locator, Page } from '@playwright/test';

/**
 * ページオブジェクトの基底クラス
 *
 * @description
 * 全てのページオブジェクトで共通するプロパティとメソッドを提供する。
 * Phaserゲームのキャンバスを含むコンテナ要素へのアクセスを統一的に行う。
 *
 * @example
 * ```typescript
 * class MyPage extends BasePage {
 *   async waitForPageLoad(): Promise<void> {
 *     await this.waitForCanvasVisible();
 *     // ページ固有の待機処理
 *   }
 * }
 * ```
 */
export abstract class BasePage {
	/** Playwrightのページインスタンス */
	readonly page: Page;

	/** ゲームコンテナのロケーター */
	readonly gameContainer: Locator;

	/** ゲームキャンバスのロケーター */
	readonly canvas: Locator;

	/** キャンバス待機のデフォルトタイムアウト（ミリ秒） */
	protected static readonly DEFAULT_TIMEOUT = 10000;

	/**
	 * コンストラクタ
	 *
	 * @param page - Playwrightのページインスタンス
	 */
	constructor(page: Page) {
		this.page = page;
		this.gameContainer = page.locator('#game-container');
		this.canvas = page.locator('#game-container canvas');
	}

	/**
	 * キャンバスが可視状態になるまで待機する
	 *
	 * @param timeout - 待機タイムアウト（ミリ秒、デフォルト: 10000）
	 */
	protected async waitForCanvasVisible(timeout: number = BasePage.DEFAULT_TIMEOUT): Promise<void> {
		await this.canvas.waitFor({ state: 'visible', timeout });
	}
}
