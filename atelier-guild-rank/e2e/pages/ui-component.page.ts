import type { Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * UIコンポーネントのPage Objectクラス
 *
 * @description
 * Phase 5で実装されたUI強化機能のテスト用Page Object。
 * ドラッグ&ドロップ、ツールチップ、サイドバー折りたたみ、
 * アニメーション検証などの操作を提供する。
 *
 * @example
 * ```typescript
 * const ui = new UIComponentPage(page);
 * await ui.dragCardToSlot(0, 0);
 * await ui.isTooltipVisible();
 * ```
 */
export class UIComponentPage extends BasePage {
	// =============================================================================
	// ドラッグ&ドロップ操作（TASK-0042）
	// =============================================================================

	/**
	 * カードをスロットにドラッグ&ドロップする
	 *
	 * @param cardIndex - ドラッグするカードのインデックス
	 * @param slotIndex - ドロップ先のスロットのインデックス
	 *
	 * @example
	 * ```typescript
	 * // 1枚目のカードを1つ目のスロットにドロップ
	 * await ui.dragCardToSlot(0, 0);
	 * ```
	 */
	async dragCardToSlot(cardIndex: number, slotIndex: number): Promise<void> {
		const card = this.page.locator('.draggable-card').nth(cardIndex);
		const slot = this.page.locator('.drop-zone').nth(slotIndex);

		await card.dragTo(slot);
	}

	/**
	 * ドラッグ機能が有効かどうかを確認
	 *
	 * @returns ドラッグが有効な場合true
	 */
	async isDragEnabled(): Promise<boolean> {
		const card = this.page.locator('.draggable-card').first();
		return await card.isVisible();
	}

	/**
	 * ドラッグ中のカードの視覚効果を確認
	 *
	 * @param cardIndex - 確認するカードのインデックス
	 * @returns カードがドラッグ中の状態の場合true
	 */
	async isCardDragging(cardIndex: number): Promise<boolean> {
		const card = this.page.locator('.draggable-card').nth(cardIndex);
		const classList = await card.getAttribute('class');
		return classList?.includes('dragging') ?? false;
	}

	// =============================================================================
	// ツールチップ操作（TASK-0041）
	// =============================================================================

	/**
	 * 指定した要素にホバーする
	 *
	 * @param selector - ホバー対象の要素セレクター
	 */
	async hoverElement(selector: string): Promise<void> {
		const element = this.page.locator(selector);
		await element.hover();
	}

	/**
	 * ツールチップが表示されているかを確認
	 *
	 * @returns ツールチップが表示されている場合true
	 */
	async isTooltipVisible(): Promise<boolean> {
		const tooltip = this.page.locator('.tooltip-container');
		return await tooltip.isVisible();
	}

	/**
	 * ツールチップのテキストを取得
	 *
	 * @returns ツールチップのテキスト内容
	 */
	async getTooltipText(): Promise<string> {
		const tooltip = this.page.locator('.tooltip-container');
		return await tooltip.textContent() ?? '';
	}

	/**
	 * ツールチップが指定した遅延後に表示されることを確認
	 *
	 * @param selector - ホバー対象の要素セレクター
	 * @param delay - 表示遅延時間（ミリ秒、デフォルト: 500）
	 */
	async waitForTooltipAfterHover(selector: string, delay: number = 500): Promise<void> {
		await this.hoverElement(selector);
		await this.page.waitForTimeout(delay);
		await this.page.waitForSelector('.tooltip-container', { state: 'visible' });
	}

	// =============================================================================
	// サイドバー折りたたみ操作（TASK-0040）
	// =============================================================================

	/**
	 * サイドバーの折りたたみ状態を切り替える
	 *
	 * @param sectionName - セクション名（'quests', 'materials', 'items'）
	 */
	async toggleSidebar(sectionName?: string): Promise<void> {
		const selector = sectionName
			? `.sidebar-section[data-section="${sectionName}"] .section-header`
			: '.sidebar-toggle';

		await this.page.locator(selector).click();
	}

	/**
	 * サイドバーが折りたたまれているかを確認
	 *
	 * @param sectionName - セクション名（省略した場合はサイドバー全体）
	 * @returns 折りたたまれている場合true
	 */
	async isSidebarCollapsed(sectionName?: string): Promise<boolean> {
		const selector = sectionName
			? `.sidebar-section[data-section="${sectionName}"]`
			: '.sidebar';

		const element = this.page.locator(selector);
		const classList = await element.getAttribute('class');
		return classList?.includes('collapsed') ?? false;
	}

	/**
	 * サイドバーのアニメーションが完了するまで待機
	 *
	 * @param duration - アニメーション時間（ミリ秒、デフォルト: 200）
	 */
	async waitForSidebarAnimation(duration: number = 200): Promise<void> {
		await this.page.waitForTimeout(duration);
	}

	// =============================================================================
	// アニメーション検証（TASK-0038）
	// =============================================================================

	/**
	 * フェードインアニメーションを待機
	 *
	 * @param duration - フェードイン時間（ミリ秒、デフォルト: 500）
	 */
	async waitForFadeIn(duration: number = 500): Promise<void> {
		await this.page.waitForTimeout(duration);
		// カメラのアルファ値が1になることを確認
		await this.page.waitForFunction(() => {
			const scene = (window as any).game?.scene?.getScene('TitleScene');
			return scene?.cameras?.main?.alpha === 1;
		}, { timeout: duration * 2 });
	}

	/**
	 * フェードアウトアニメーションを待機
	 *
	 * @param duration - フェードアウト時間（ミリ秒、デフォルト: 500）
	 */
	async waitForFadeOut(duration: number = 500): Promise<void> {
		await this.page.waitForTimeout(duration);
		// カメラのアルファ値が0に近づくことを確認
		await this.page.waitForFunction(() => {
			const scene = (window as any).game?.scene?.getScene('TitleScene');
			return scene?.cameras?.main?.alpha < 0.5;
		}, { timeout: duration * 2 });
	}

	/**
	 * カメラのアルファ値を取得
	 *
	 * @param sceneName - シーン名（デフォルト: 'TitleScene'）
	 * @returns カメラのアルファ値（0-1）
	 */
	async getCameraAlpha(sceneName: string = 'TitleScene'): Promise<number> {
		return await this.page.evaluate((name) => {
			const scene = (window as any).game?.scene?.getScene(name);
			return scene?.cameras?.main?.alpha ?? 1;
		}, sceneName);
	}

	// =============================================================================
	// ボタンホバーエフェクト（TASK-0039）
	// =============================================================================

	/**
	 * ボタンにホバーしてエフェクトを確認
	 *
	 * @param buttonText - ボタンのテキスト
	 * @returns ホバー後のLocator
	 */
	async hoverButton(buttonText: string): Locator {
		const button = this.page.locator(`button:has-text("${buttonText}")`);
		await button.hover();
		return button;
	}

	/**
	 * ボタンのホバーエフェクトアニメーションを待機
	 *
	 * @param duration - アニメーション時間（ミリ秒、デフォルト: 100）
	 */
	async waitForButtonHoverAnimation(duration: number = 100): Promise<void> {
		await this.page.waitForTimeout(duration);
	}

	/**
	 * ボタンのバウンディングボックスを取得
	 *
	 * @param buttonText - ボタンのテキスト
	 * @returns バウンディングボックス情報
	 */
	async getButtonBoundingBox(buttonText: string): Promise<{ width: number; height: number } | null> {
		const button = this.page.locator(`button:has-text("${buttonText}")`);
		const box = await button.boundingBox();
		return box ? { width: box.width, height: box.height } : null;
	}

	// =============================================================================
	// モーダル操作（TASK-0043）
	// =============================================================================

	/**
	 * モーダルが表示されているかを確認
	 *
	 * @param modalClass - モーダルのクラス名（デフォルト: '.modal'）
	 * @returns モーダルが表示されている場合true
	 */
	async isModalVisible(modalClass: string = '.modal'): Promise<boolean> {
		const modal = this.page.locator(modalClass);
		return await modal.isVisible();
	}

	/**
	 * モーダルを閉じる
	 *
	 * @param method - 閉じる方法（'button' | 'overlay' | 'esc'）
	 */
	async closeModal(method: 'button' | 'overlay' | 'esc' = 'button'): Promise<void> {
		switch (method) {
			case 'button':
				await this.page.locator('.modal-close-button').click();
				break;
			case 'overlay':
				await this.page.locator('.modal-overlay').click();
				break;
			case 'esc':
				await this.page.keyboard.press('Escape');
				break;
		}
	}

	/**
	 * モーダルのアニメーションを待機
	 *
	 * @param duration - アニメーション時間（ミリ秒、デフォルト: 300）
	 */
	async waitForModalAnimation(duration: number = 300): Promise<void> {
		await this.page.waitForTimeout(duration);
	}

	// =============================================================================
	// 品質視覚効果（TASK-0044）
	// =============================================================================

	/**
	 * 指定した品質のアイテムの枠色を確認
	 *
	 * @param quality - 品質（'D' | 'C' | 'B' | 'A' | 'S'）
	 * @returns 品質に応じた要素のLocator
	 */
	getQualityElement(quality: string): Locator {
		return this.page.locator(`[data-quality="${quality}"]`);
	}

	/**
	 * S品質のパーティクルエフェクトが表示されているかを確認
	 *
	 * @returns パーティクルが表示されている場合true
	 */
	async hasParticleEffect(): Promise<boolean> {
		return await this.page.evaluate(() => {
			const scene = (window as any).game?.scene?.getScene('MainScene');
			// Phaserのパーティクルエミッターが存在するかチェック
			return scene?.children?.list?.some((child: any) =>
				child.type === 'ParticleEmitterManager'
			) ?? false;
		});
	}

	/**
	 * 品質バッジのテキストを取得
	 *
	 * @param itemIndex - アイテムのインデックス
	 * @returns 品質バッジのテキスト（'D', 'C', 'B', 'A', 'S'）
	 */
	async getQualityBadgeText(itemIndex: number): Promise<string> {
		const badge = this.page.locator('.quality-badge').nth(itemIndex);
		return await badge.textContent() ?? '';
	}

	// =============================================================================
	// ヘルパーメソッド
	// =============================================================================

	/**
	 * 指定した要素のスクリーンショットを撮る
	 *
	 * @param selector - 要素セレクター
	 * @param fileName - ファイル名
	 */
	async takeElementScreenshot(selector: string, fileName: string): Promise<void> {
		const element = this.page.locator(selector);
		await element.screenshot({ path: `test-results/${fileName}` });
	}

	/**
	 * 指定した時間待機する
	 *
	 * @param ms - 待機時間（ミリ秒）
	 */
	async wait(ms: number): Promise<void> {
		await this.page.waitForTimeout(ms);
	}
}
