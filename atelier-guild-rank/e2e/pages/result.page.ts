import { BasePage } from './base.page';
import type { GameWindow } from '../types/game-window.types';

/**
 * リザルト画面のPage Objectクラス
 *
 * @description
 * ResultSceneのUI要素とインタラクションを提供する。
 * ゲームクリア/ゲームオーバーの判定やタイトルへの遷移を行う。
 *
 * @example
 * ```typescript
 * const result = new ResultPage(page);
 * await result.waitForResultScreen();
 * if (await result.isGameClear()) {
 *   console.log('Game Clear!');
 * }
 * await result.returnToTitle();
 * ```
 */
export class ResultPage extends BasePage {
	/**
	 * リザルト画面が表示されるまで待機
	 *
	 * @description
	 * キャンバスの可視化とResultSceneの表示を待機する。
	 */
	async waitForResultScreen(): Promise<void> {
		await this.waitForCanvasVisible();
		await this.waitForScene('ResultScene');
	}

	/**
	 * ゲームクリア状態かどうかを確認
	 *
	 * @returns ゲームクリアの場合true
	 */
	async isGameClear(): Promise<boolean> {
		return await this.page.evaluate(() => {
			const state = (window as unknown as GameWindow).gameState?.();
			return state?.isGameClear ?? false;
		});
	}

	/**
	 * ゲームオーバー状態かどうかを確認
	 *
	 * @returns ゲームオーバーの場合true
	 */
	async isGameOver(): Promise<boolean> {
		return await this.page.evaluate(() => {
			const state = (window as unknown as GameWindow).gameState?.();
			return state?.isGameOver ?? false;
		});
	}

	/**
	 * タイトル画面に戻る
	 *
	 * @description
	 * デバッグツール経由でタイトル画面に遷移する。
	 *
	 * @throws デバッグツールが利用不可の場合
	 */
	async returnToTitle(): Promise<void> {
		await this.page.evaluate(() => {
			const debug = (window as unknown as GameWindow).debug;
			if (debug?.returnToTitle) {
				debug.returnToTitle();
			} else {
				throw new Error('Debug tools not available or returnToTitle not implemented');
			}
		});
	}

	/**
	 * 指定したシーンになるまで待機
	 *
	 * @param sceneName - 待機するシーン名
	 * @param timeout - タイムアウト（ミリ秒）
	 */
	private async waitForScene(sceneName: string, timeout: number = BasePage.DEFAULT_TIMEOUT): Promise<void> {
		await this.page.waitForFunction(
			(name) => {
				const state = (window as unknown as GameWindow).gameState?.();
				return state?.currentScene === name;
			},
			sceneName,
			{ timeout },
		);
	}
}
