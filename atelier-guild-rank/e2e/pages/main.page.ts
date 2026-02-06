import { BasePage } from './base.page';

/**
 * メイン画面のPage Objectクラス
 *
 * @description
 * MainSceneのUI要素とインタラクションを提供する。
 * ゲーム状態の取得やデバッグ操作を行う。
 *
 * @example
 * ```typescript
 * const main = new MainPage(page);
 * await main.waitForMainLoad();
 * const gold = await main.getGold();
 * await main.addGold(1000);
 * ```
 */
export class MainPage extends BasePage {
	/**
	 * メイン画面が読み込まれるまで待機
	 *
	 * @description
	 * キャンバスの可視化とゲームフェーズの開始を待機する。
	 */
	async waitForMainLoad(): Promise<void> {
		await this.waitForCanvasVisible();
		await this.waitForPhaseAvailable();
	}

	// =============================================================================
	// 状態取得メソッド
	// =============================================================================

	/**
	 * 現在のフェーズを取得
	 *
	 * @returns フェーズ名（QuestAccept, Gathering等）
	 */
	async getCurrentPhase(): Promise<string> {
		return await this.getStateProperty('currentPhase', '');
	}

	/**
	 * 残り日数を取得
	 *
	 * @returns 残り日数（1-30）
	 */
	async getRemainingDays(): Promise<number> {
		return await this.getStateProperty('remainingDays', 0);
	}

	/**
	 * 所持金を取得
	 *
	 * @returns 所持金
	 */
	async getGold(): Promise<number> {
		return await this.getStateProperty('gold', 0);
	}

	/**
	 * 現在のランクを取得
	 *
	 * @returns ギルドランク（G-S）
	 */
	async getCurrentRank(): Promise<string> {
		return await this.getStateProperty('currentRank', '');
	}

	/**
	 * 行動ポイントを取得
	 *
	 * @returns 行動ポイント
	 */
	async getActionPoints(): Promise<number> {
		return await this.getStateProperty('actionPoints', 0);
	}

	// =============================================================================
	// ゲーム操作メソッド
	// =============================================================================

	/**
	 * 「次へ」ボタンをクリック
	 *
	 * @description
	 * MainSceneのフッターにある「次へ」ボタンのクリックをシミュレートする。
	 * GameFlowManager.endPhase()が呼ばれ、次のフェーズに遷移する。
	 *
	 * @throws デバッグツールが利用不可の場合
	 */
	async clickNextButton(): Promise<void> {
		await this.executeDebugAction('clickNextButton');
	}

	/**
	 * フェーズをスキップ
	 *
	 * @throws デバッグツールが利用不可の場合
	 */
	async skipPhase(): Promise<void> {
		await this.executeDebugAction('skipPhase');
	}

	/**
	 * 日を終了する
	 *
	 * @throws デバッグツールが利用不可の場合
	 */
	async endDay(): Promise<void> {
		await this.executeDebugAction('endDay');
	}

	// =============================================================================
	// デバッグメソッド（値を受け取るもの）
	// =============================================================================

	/**
	 * ゴールドを追加（デバッグ用）
	 *
	 * @param amount - 追加量（負の値で減少）
	 * @throws デバッグツールが利用不可の場合
	 */
	async addGold(amount: number): Promise<void> {
		await this.executeDebugActionWithArg('addGold', amount);
	}

	/**
	 * ランクを設定（デバッグ用）
	 *
	 * @param rank - 設定するランク（G-S）
	 * @throws デバッグツールが利用不可の場合
	 */
	async setRank(rank: string): Promise<void> {
		await this.executeDebugActionWithArg('setRank', rank);
	}

	/**
	 * 指定日にスキップ（デバッグ用）
	 *
	 * @param day - 設定する残り日数（1以上）
	 * @throws デバッグツールが利用不可の場合
	 */
	async skipToDay(day: number): Promise<void> {
		await this.executeDebugActionWithArg('skipToDay', day);
	}

	/**
	 * 行動ポイントを設定（デバッグ用）
	 *
	 * @param ap - 設定する行動ポイント
	 * @throws デバッグツールが利用不可の場合
	 */
	async setActionPoints(ap: number): Promise<void> {
		await this.executeDebugActionWithArg('setActionPoints', ap);
	}

	// =============================================================================
	// デバッグメソッド（引数なし）
	// =============================================================================

	/**
	 * 全カードを解放（デバッグ用）
	 *
	 * @throws デバッグツールが利用不可の場合
	 */
	async unlockAllCards(): Promise<void> {
		await this.executeDebugAction('unlockAllCards');
	}

	/**
	 * 状態をログ出力（デバッグ用）
	 *
	 * @throws デバッグツールが利用不可の場合
	 */
	async logState(): Promise<void> {
		await this.executeDebugAction('logState');
	}

	/**
	 * セーブデータを削除（デバッグ用）
	 *
	 * @throws デバッグツールが利用不可の場合
	 */
	async clearSaveData(): Promise<void> {
		await this.executeDebugAction('clearSaveData');
	}

	// =============================================================================
	// プライベートヘルパーメソッド
	// =============================================================================

	/**
	 * フェーズが利用可能になるまで待機
	 */
	private async waitForPhaseAvailable(): Promise<void> {
		await this.page.waitForFunction(
			() => {
				// biome-ignore lint/suspicious/noExplicitAny: window拡張型のため
				const state = (window as any).gameState?.();
				return state?.currentPhase !== undefined;
			},
			{ timeout: BasePage.DEFAULT_TIMEOUT },
		);
	}
}
