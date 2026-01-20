import type { Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * QuestPage - 依頼受注フェーズのPage Object
 *
 * @description
 * 依頼受注フェーズ（Quest Accept Phase）の操作を提供する。
 * 依頼カードの選択、詳細表示、受注、キャンセルなどの操作が可能。
 *
 * @example
 * ```typescript
 * const quest = new QuestPage(page);
 * await quest.waitForQuestLoad();
 * const quests = await quest.getAvailableQuests();
 * await quest.selectQuest(quests[0]);
 * await quest.acceptQuest();
 * ```
 */
export class QuestPage extends BasePage {
	// =============================================================================
	// ページ読み込み・初期化
	// =============================================================================

	/**
	 * 依頼受注フェーズの読み込み完了を待機
	 *
	 * @param timeout - タイムアウト時間（ミリ秒）
	 */
	async waitForQuestLoad(timeout: number = 5000): Promise<void> {
		// フェーズがQuestAcceptになるまで待機
		await this.page.waitForFunction(
			() => {
				const state = (window as any).gameState?.();
				return state?.currentPhase === 'QuestAccept';
			},
			{ timeout }
		);

		// 依頼カードが表示されるまで待機
		await this.page.waitForSelector('.quest-card', { state: 'visible', timeout });
	}

	// =============================================================================
	// 依頼一覧操作
	// =============================================================================

	/**
	 * 利用可能な依頼のIDリストを取得
	 *
	 * @returns 依頼IDの配列
	 */
	async getAvailableQuests(): Promise<string[]> {
		const cards = await this.page.locator('.quest-card').all();
		const questIds: string[] = [];

		for (const card of cards) {
			const id = await card.getAttribute('data-quest-id');
			if (id) {
				questIds.push(id);
			}
		}

		return questIds;
	}

	/**
	 * 依頼カードの数を取得
	 *
	 * @returns 表示されている依頼カードの数
	 */
	async getQuestCount(): Promise<number> {
		return await this.page.locator('.quest-card').count();
	}

	/**
	 * 指定した依頼が表示されているかを確認
	 *
	 * @param questId - 依頼ID
	 * @returns 表示されている場合true
	 */
	async isQuestVisible(questId: string): Promise<boolean> {
		const card = this.getQuestCard(questId);
		return await card.isVisible();
	}

	// =============================================================================
	// 依頼選択・詳細表示
	// =============================================================================

	/**
	 * 依頼を選択する
	 *
	 * @param questId - 依頼ID
	 */
	async selectQuest(questId: string): Promise<void> {
		const card = this.getQuestCard(questId);
		await card.click();
	}

	/**
	 * 依頼詳細モーダルを開く
	 *
	 * @param questId - 依頼ID
	 */
	async openQuestDetail(questId: string): Promise<void> {
		await this.selectQuest(questId);
		// モーダルのアニメーション完了待機
		await this.page.waitForSelector('.quest-detail-modal', { state: 'visible' });
		await this.page.waitForTimeout(300); // アニメーション完了
	}

	/**
	 * 依頼詳細モーダルを閉じる
	 */
	async closeQuestDetail(): Promise<void> {
		const closeButton = this.page.locator('.modal-close-button');
		await closeButton.click();
		await this.page.waitForTimeout(300); // アニメーション完了
	}

	/**
	 * 依頼詳細モーダルが表示されているかを確認
	 *
	 * @returns 表示されている場合true
	 */
	async isQuestDetailVisible(): Promise<boolean> {
		const modal = this.page.locator('.quest-detail-modal');
		return await modal.isVisible();
	}

	// =============================================================================
	// 依頼情報取得
	// =============================================================================

	/**
	 * 依頼のタイトルを取得
	 *
	 * @param questId - 依頼ID
	 * @returns 依頼のタイトル
	 */
	async getQuestTitle(questId: string): Promise<string> {
		const card = this.getQuestCard(questId);
		const title = card.locator('.quest-title');
		return (await title.textContent()) ?? '';
	}

	/**
	 * 依頼の報酬を取得
	 *
	 * @param questId - 依頼ID
	 * @returns 報酬のゴールド額
	 */
	async getQuestReward(questId: string): Promise<number> {
		const card = this.getQuestCard(questId);
		const reward = card.locator('.quest-reward');
		const text = (await reward.textContent()) ?? '0';
		return Number.parseInt(text.replace(/[^\d]/g, ''), 10);
	}

	/**
	 * 依頼の難易度を取得
	 *
	 * @param questId - 依頼ID
	 * @returns 難易度（1-10）
	 */
	async getQuestDifficulty(questId: string): Promise<number> {
		const card = this.getQuestCard(questId);
		const difficulty = await card.getAttribute('data-difficulty');
		return Number.parseInt(difficulty ?? '1', 10);
	}

	/**
	 * 依頼の期限を取得
	 *
	 * @param questId - 依頼ID
	 * @returns 期限の日数
	 */
	async getQuestDeadline(questId: string): Promise<number> {
		const card = this.getQuestCard(questId);
		const deadline = card.locator('.quest-deadline');
		const text = (await deadline.textContent()) ?? '0';
		return Number.parseInt(text.replace(/[^\d]/g, ''), 10);
	}

	// =============================================================================
	// 依頼受注・キャンセル
	// =============================================================================

	/**
	 * 依頼を受注する
	 *
	 * @description
	 * 依頼詳細モーダルが開いている状態で受注ボタンをクリックする。
	 * 受注後のアニメーション完了まで待機する。
	 */
	async acceptQuest(): Promise<void> {
		const acceptButton = this.page.locator('.quest-accept-button');
		await acceptButton.click();

		// 受注アニメーション完了待機
		await this.page.waitForTimeout(500);

		// モーダルが閉じるまで待機
		await this.page.waitForSelector('.quest-detail-modal', { state: 'hidden' });
	}

	/**
	 * 依頼受注をキャンセルする
	 */
	async cancelQuestAccept(): Promise<void> {
		const cancelButton = this.page.locator('.quest-cancel-button');
		await cancelButton.click();
		await this.page.waitForTimeout(300);
	}

	/**
	 * 依頼が受注済みかを確認
	 *
	 * @param questId - 依頼ID
	 * @returns 受注済みの場合true
	 */
	async isQuestAccepted(questId: string): Promise<boolean> {
		const card = this.getQuestCard(questId);
		const classList = await card.getAttribute('class');
		return classList?.includes('accepted') ?? false;
	}

	/**
	 * 受注可能な依頼数を取得
	 *
	 * @returns 受注可能な依頼数
	 */
	async getAcceptableQuestCount(): Promise<number> {
		const state = await this.page.evaluate(() => {
			return (window as any).gameState?.();
		});

		// actionPointsが受注可能数を示す
		return state?.actionPoints ?? 0;
	}

	// =============================================================================
	// フェーズ操作
	// =============================================================================

	/**
	 * 依頼受注フェーズを終了する
	 *
	 * @description
	 * 「次のフェーズへ」ボタンをクリックして採取フェーズに遷移する。
	 */
	async endQuestPhase(): Promise<void> {
		const nextButton = this.page.locator('.phase-next-button');
		await nextButton.click();

		// フェーズ遷移待機
		await this.page.waitForFunction(
			() => {
				const state = (window as any).gameState?.();
				return state?.currentPhase !== 'QuestAccept';
			},
			{ timeout: 5000 }
		);
	}

	// =============================================================================
	// ヘルパーメソッド
	// =============================================================================

	/**
	 * 依頼カードのLocatorを取得
	 *
	 * @param questId - 依頼ID
	 * @returns 依頼カードのLocator
	 */
	private getQuestCard(questId: string): Locator {
		return this.page.locator(`.quest-card[data-quest-id="${questId}"]`);
	}

	/**
	 * 依頼カードのスクリーンショットを撮る
	 *
	 * @param questId - 依頼ID
	 * @param fileName - ファイル名
	 */
	async takeQuestCardScreenshot(questId: string, fileName: string): Promise<void> {
		const card = this.getQuestCard(questId);
		await card.screenshot({ path: `test-results/${fileName}` });
	}

	/**
	 * 依頼一覧のスクリーンショットを撮る
	 *
	 * @param fileName - ファイル名
	 */
	async takeQuestListScreenshot(fileName: string): Promise<void> {
		const container = this.page.locator('.quest-list-container');
		await container.screenshot({ path: `test-results/${fileName}` });
	}
}
