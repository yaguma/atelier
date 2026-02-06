import type { Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * DeliveryPage - 納品フェーズのPage Object
 *
 * @description
 * 納品フェーズ（Delivery Phase）の操作を提供する。
 * 依頼選択、アイテム納品、報酬受け取りなどの操作が可能。
 *
 * @example
 * ```typescript
 * const delivery = new DeliveryPage(page);
 * await delivery.waitForDeliveryLoad();
 * await delivery.selectQuestForDelivery('quest-001');
 * await delivery.selectItemForDelivery('item-001');
 * await delivery.deliverItem();
 * const reward = await delivery.getReward();
 * ```
 */
export class DeliveryPage extends BasePage {
  // =============================================================================
  // ページ読み込み・初期化
  // =============================================================================

  /**
   * 納品フェーズの読み込み完了を待機
   *
   * @param timeout - タイムアウト時間（ミリ秒）
   */
  async waitForDeliveryLoad(timeout: number = 5000): Promise<void> {
    // フェーズがDeliveryになるまで待機
    await this.page.waitForFunction(
      () => {
        const state = (window as any).gameState?.();
        return state?.currentPhase === 'Delivery';
      },
      { timeout },
    );

    // 依頼パネルが表示されるまで待機
    await this.page.waitForSelector('.delivery-quest-panel', {
      state: 'visible',
      timeout,
    });
  }

  // =============================================================================
  // 依頼選択
  // =============================================================================

  /**
   * 納品可能な依頼のリストを取得
   *
   * @returns 依頼IDの配列
   */
  async getDeliverableQuests(): Promise<string[]> {
    const quests = await this.page.locator('.delivery-quest-item').all();
    const questIds: string[] = [];

    for (const quest of quests) {
      const id = await quest.getAttribute('data-quest-id');
      if (id) {
        questIds.push(id);
      }
    }

    return questIds;
  }

  /**
   * 納品する依頼を選択する
   *
   * @param questId - 依頼ID
   */
  async selectQuestForDelivery(questId: string): Promise<void> {
    const quest = this.getDeliveryQuest(questId);
    await quest.click();
    await this.page.waitForTimeout(200);
  }

  /**
   * 選択中の依頼IDを取得
   *
   * @returns 現在選択中の依頼ID
   */
  async getSelectedQuestId(): Promise<string> {
    const selected = this.page.locator('.delivery-quest-item.selected');
    return (await selected.getAttribute('data-quest-id')) ?? '';
  }

  /**
   * 依頼が納品可能かを確認
   *
   * @param questId - 依頼ID
   * @returns 納品可能な場合true
   */
  async isQuestCompletable(questId: string): Promise<boolean> {
    const quest = this.getDeliveryQuest(questId);
    const completable = await quest.getAttribute('data-completable');
    return completable === 'true';
  }

  /**
   * 依頼の要求アイテムを取得
   *
   * @param questId - 依頼ID
   * @returns 要求アイテムの情報
   */
  async getQuestRequirement(questId: string): Promise<{ itemType: string; minQuality: string }> {
    const quest = this.getDeliveryQuest(questId);
    const itemType = (await quest.getAttribute('data-required-item')) ?? '';
    const minQuality = (await quest.getAttribute('data-min-quality')) ?? 'D';

    return { itemType, minQuality };
  }

  // =============================================================================
  // アイテム選択・納品
  // =============================================================================

  /**
   * 納品するアイテムを選択する
   *
   * @param itemId - アイテムID
   */
  async selectItemForDelivery(itemId: string): Promise<void> {
    const item = this.getDeliveryItem(itemId);
    await item.click();
    await this.page.waitForTimeout(200);
  }

  /**
   * 選択中のアイテムIDを取得
   *
   * @returns 現在選択中のアイテムID
   */
  async getSelectedItemId(): Promise<string> {
    const selected = this.page.locator('.delivery-item.selected');
    return (await selected.getAttribute('data-item-id')) ?? '';
  }

  /**
   * アイテムを納品する
   *
   * @description
   * 「納品する」ボタンをクリックしてアイテムを納品する。
   * 納品完了のアニメーションまで待機する。
   */
  async deliverItem(): Promise<void> {
    const deliverButton = this.page.locator('.deliver-button');
    await deliverButton.click();

    // 納品アニメーション完了待機
    await this.page.waitForTimeout(1000);

    // 報酬表示まで待機
    await this.page.waitForSelector('.reward-display', { state: 'visible' });
  }

  /**
   * 納品ボタンが有効かどうかを確認
   *
   * @returns 有効な場合true
   */
  async isDeliverButtonEnabled(): Promise<boolean> {
    const button = this.page.locator('.deliver-button');
    const disabled = await button.getAttribute('disabled');
    return disabled === null;
  }

  /**
   * 一括納品を実行する
   *
   * @description
   * 全ての納品可能な依頼を自動的に納品する。
   */
  async deliverAll(): Promise<void> {
    const deliverAllButton = this.page.locator('.deliver-all-button');
    await deliverAllButton.click();
    await this.page.waitForTimeout(2000); // 一括納品アニメーション完了
  }

  // =============================================================================
  // 報酬確認
  // =============================================================================

  /**
   * 報酬を取得する
   *
   * @returns 報酬情報（ゴールド、貢献度）
   */
  async getReward(): Promise<{ gold: number; contribution: number }> {
    const rewardDisplay = this.page.locator('.reward-display');

    const goldText = (await rewardDisplay.locator('.reward-gold').textContent()) ?? '0';
    const gold = Number.parseInt(goldText.replace(/[^\d]/g, ''), 10);

    const contributionText =
      (await rewardDisplay.locator('.reward-contribution').textContent()) ?? '0';
    const contribution = Number.parseInt(contributionText.replace(/[^\d]/g, ''), 10);

    return { gold, contribution };
  }

  /**
   * ボーナス報酬があるかを確認
   *
   * @returns ボーナス報酬がある場合true
   */
  async hasBonusReward(): Promise<boolean> {
    const bonus = this.page.locator('.bonus-reward');
    return await bonus.isVisible();
  }

  /**
   * ボーナス報酬の内容を取得
   *
   * @returns ボーナス報酬の説明テキスト
   */
  async getBonusRewardText(): Promise<string> {
    const bonus = this.page.locator('.bonus-reward');
    return (await bonus.textContent()) ?? '';
  }

  /**
   * 報酬表示を閉じる
   */
  async closeRewardDisplay(): Promise<void> {
    const closeButton = this.page.locator('.reward-close-button');
    await closeButton.click();
    await this.page.waitForTimeout(300);
  }

  // =============================================================================
  // アイテムインベントリ
  // =============================================================================

  /**
   * 納品可能なアイテムの数を取得
   *
   * @returns 納品可能なアイテム数
   */
  async getDeliverableItemCount(): Promise<number> {
    return await this.page.locator('.delivery-item').count();
  }

  /**
   * 指定した品質のアイテム数を取得
   *
   * @param quality - 品質（'D' | 'C' | 'B' | 'A' | 'S'）
   * @returns 指定品質のアイテム数
   */
  async getItemCountByQuality(quality: string): Promise<number> {
    const items = this.page.locator(`.delivery-item[data-quality="${quality}"]`);
    return await items.count();
  }

  /**
   * アイテムの品質を取得
   *
   * @param itemId - アイテムID
   * @returns アイテムの品質
   */
  async getItemQuality(itemId: string): Promise<string> {
    const item = this.getDeliveryItem(itemId);
    const quality = await item.getAttribute('data-quality');
    return quality ?? 'D';
  }

  /**
   * アイテムが選択可能かを確認
   *
   * @param itemId - アイテムID
   * @returns 選択可能な場合true
   */
  async isItemSelectable(itemId: string): Promise<boolean> {
    const item = this.getDeliveryItem(itemId);
    const disabled = await item.getAttribute('data-disabled');
    return disabled !== 'true';
  }

  // =============================================================================
  // 統計情報
  // =============================================================================

  /**
   * 本日の納品数を取得
   *
   * @returns 本日納品したアイテム数
   */
  async getTodayDeliveryCount(): Promise<number> {
    const counter = this.page.locator('.today-delivery-count');
    const text = (await counter.textContent()) ?? '0';
    return Number.parseInt(text.replace(/[^\d]/g, ''), 10);
  }

  /**
   * 累計貢献度を取得
   *
   * @returns 累計貢献度
   */
  async getTotalContribution(): Promise<number> {
    const state = await this.page.evaluate(() => {
      return (window as any).gameState?.();
    });

    return state?.contribution ?? 0;
  }

  /**
   * 次のランクまでの必要貢献度を取得
   *
   * @returns 次のランクまでの必要貢献度
   */
  async getRequiredContributionForNextRank(): Promise<number> {
    const display = this.page.locator('.rank-progress');
    const text = (await display.textContent()) ?? '0/0';
    const match = text.match(/(\d+)\/(\d+)/);
    if (match) {
      const current = Number.parseInt(match[1], 10);
      const required = Number.parseInt(match[2], 10);
      return required - current;
    }
    return 0;
  }

  // =============================================================================
  // フェーズ操作
  // =============================================================================

  /**
   * 納品フェーズを終了して翌日に進む
   *
   * @description
   * 「一日を終える」ボタンをクリックして翌日に進む。
   */
  async endDay(): Promise<void> {
    const endDayButton = this.page.locator('.end-day-button');
    await endDayButton.click();

    // 日終了処理待機
    await this.page.waitForTimeout(1000);

    // フェーズ遷移待機（翌日の依頼受注フェーズへ）
    await this.page.waitForFunction(
      () => {
        const state = (window as any).gameState?.();
        return state?.currentPhase === 'QuestAccept' || state?.currentScene !== 'MainScene';
      },
      { timeout: 5000 },
    );
  }

  /**
   * 納品フェーズを強制的にスキップする
   *
   * @description
   * デバッグツールを使用して納品フェーズをスキップする。
   * テスト用途のみに使用する。
   */
  async skipDeliveryPhase(): Promise<void> {
    await this.executeDebugAction('skipPhase');
    await this.page.waitForTimeout(500);
  }

  // =============================================================================
  // ヘルパーメソッド
  // =============================================================================

  /**
   * 納品依頼のLocatorを取得
   *
   * @param questId - 依頼ID
   * @returns 納品依頼のLocator
   */
  private getDeliveryQuest(questId: string): Locator {
    return this.page.locator(`.delivery-quest-item[data-quest-id="${questId}"]`);
  }

  /**
   * 納品アイテムのLocatorを取得
   *
   * @param itemId - アイテムID
   * @returns 納品アイテムのLocator
   */
  private getDeliveryItem(itemId: string): Locator {
    return this.page.locator(`.delivery-item[data-item-id="${itemId}"]`);
  }

  /**
   * 納品パネルのスクリーンショットを撮る
   *
   * @param fileName - ファイル名
   */
  async takeDeliveryPanelScreenshot(fileName: string): Promise<void> {
    const panel = this.page.locator('.delivery-quest-panel');
    await panel.screenshot({ path: `test-results/${fileName}` });
  }

  /**
   * 報酬表示のスクリーンショットを撮る
   *
   * @param fileName - ファイル名
   */
  async takeRewardScreenshot(fileName: string): Promise<void> {
    const reward = this.page.locator('.reward-display');
    await reward.screenshot({ path: `test-results/${fileName}` });
  }

  /**
   * 納品エリア全体のスクリーンショットを撮る
   *
   * @param fileName - ファイル名
   */
  async takeDeliveryAreaScreenshot(fileName: string): Promise<void> {
    const area = this.page.locator('.delivery-area');
    await area.screenshot({ path: `test-results/${fileName}` });
  }
}
