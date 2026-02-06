import type { Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * GatheringPage - 採取フェーズのPage Object
 *
 * @description
 * 採取フェーズ（Gathering Phase）の操作を提供する。
 * ドラフトピック、素材選択、品質確認などの操作が可能。
 *
 * @example
 * ```typescript
 * const gathering = new GatheringPage(page);
 * await gathering.waitForGatheringLoad();
 * await gathering.selectDraftCard(0);
 * const quality = await gathering.getDraftCardQuality(0);
 * ```
 */
export class GatheringPage extends BasePage {
  // =============================================================================
  // ページ読み込み・初期化
  // =============================================================================

  /**
   * 採取フェーズの読み込み完了を待機
   *
   * @param timeout - タイムアウト時間（ミリ秒）
   */
  async waitForGatheringLoad(timeout: number = 5000): Promise<void> {
    // フェーズがGatheringになるまで待機
    await this.page.waitForFunction(
      () => {
        const state = (window as any).gameState?.();
        return state?.currentPhase === 'Gathering';
      },
      { timeout },
    );

    // ドラフトカードが表示されるまで待機
    await this.page.waitForSelector('.draft-card', { state: 'visible', timeout });
  }

  // =============================================================================
  // ドラフトピック操作
  // =============================================================================

  /**
   * ドラフトカードを選択する
   *
   * @param index - カードのインデックス（0始まり）
   */
  async selectDraftCard(index: number): Promise<void> {
    const card = this.getDraftCard(index);
    await card.click();

    // カード選択アニメーション完了待機
    await this.page.waitForTimeout(200);
  }

  /**
   * ドラフトピックをスキップする
   *
   * @description
   * 「スキップ」ボタンをクリックしてドラフトピックをスキップする。
   */
  async skipDraftPick(): Promise<void> {
    const skipButton = this.page.locator('.draft-skip-button');
    await skipButton.click();
    await this.page.waitForTimeout(200);
  }

  /**
   * 残りのピック回数を取得
   *
   * @returns 残りのピック回数
   */
  async getRemainingPicks(): Promise<number> {
    const counter = this.page.locator('.draft-pick-counter');
    const text = (await counter.textContent()) ?? '0/0';
    const match = text.match(/(\d+)\/(\d+)/);
    if (match) {
      const current = Number.parseInt(match[1], 10);
      const total = Number.parseInt(match[2], 10);
      return total - current;
    }
    return 0;
  }

  /**
   * ドラフトピックが完了しているかを確認
   *
   * @returns 完了している場合true
   */
  async isDraftComplete(): Promise<boolean> {
    const remaining = await this.getRemainingPicks();
    return remaining === 0;
  }

  // =============================================================================
  // カード情報取得
  // =============================================================================

  /**
   * ドラフトカードの数を取得
   *
   * @returns 表示されているドラフトカードの数
   */
  async getDraftCardCount(): Promise<number> {
    return await this.page.locator('.draft-card').count();
  }

  /**
   * ドラフトカードの品質を取得
   *
   * @param index - カードのインデックス
   * @returns 品質（'D' | 'C' | 'B' | 'A' | 'S'）
   */
  async getDraftCardQuality(index: number): Promise<string> {
    const card = this.getDraftCard(index);
    const quality = await card.getAttribute('data-quality');
    return quality ?? 'D';
  }

  /**
   * ドラフトカードの名前を取得
   *
   * @param index - カードのインデックス
   * @returns カードの名前
   */
  async getDraftCardName(index: number): Promise<string> {
    const card = this.getDraftCard(index);
    const name = card.locator('.card-name');
    return (await name.textContent()) ?? '';
  }

  /**
   * ドラフトカードのタイプを取得
   *
   * @param index - カードのインデックス
   * @returns カードのタイプ（'material' | 'tool' | 'special'）
   */
  async getDraftCardType(index: number): Promise<string> {
    const card = this.getDraftCard(index);
    const type = await card.getAttribute('data-card-type');
    return type ?? 'material';
  }

  /**
   * ドラフトカードが選択可能かを確認
   *
   * @param index - カードのインデックス
   * @returns 選択可能な場合true
   */
  async isDraftCardSelectable(index: number): Promise<boolean> {
    const card = this.getDraftCard(index);
    const disabled = await card.getAttribute('data-disabled');
    return disabled !== 'true';
  }

  // =============================================================================
  // 素材インベントリ操作
  // =============================================================================

  /**
   * 現在の素材数を取得
   *
   * @returns 獲得した素材の数
   */
  async getMaterialCount(): Promise<number> {
    const inventory = this.page.locator('.material-inventory');
    const items = inventory.locator('.material-item');
    return await items.count();
  }

  /**
   * 指定した品質の素材数を取得
   *
   * @param quality - 品質（'D' | 'C' | 'B' | 'A' | 'S'）
   * @returns 指定品質の素材数
   */
  async getMaterialCountByQuality(quality: string): Promise<number> {
    const items = this.page.locator(`.material-item[data-quality="${quality}"]`);
    return await items.count();
  }

  /**
   * 素材インベントリが満杯かを確認
   *
   * @returns 満杯の場合true
   */
  async isMaterialInventoryFull(): Promise<boolean> {
    const state = await this.page.evaluate(() => {
      return (window as any).gameState?.();
    });

    // 実装に合わせて調整が必要
    // 仮に最大30個とする
    const maxMaterials = 30;
    const currentCount = await this.getMaterialCount();
    return currentCount >= maxMaterials;
  }

  // =============================================================================
  // フェーズ操作
  // =============================================================================

  /**
   * 採取フェーズを終了する
   *
   * @description
   * 「次のフェーズへ」ボタンをクリックして調合フェーズに遷移する。
   */
  async endGatheringPhase(): Promise<void> {
    const nextButton = this.page.locator('.phase-next-button');
    await nextButton.click();

    // フェーズ遷移待機
    await this.page.waitForFunction(
      () => {
        const state = (window as any).gameState?.();
        return state?.currentPhase !== 'Gathering';
      },
      { timeout: 5000 },
    );
  }

  /**
   * 採取フェーズを強制的にスキップする
   *
   * @description
   * デバッグツールを使用して採取フェーズをスキップする。
   * テスト用途のみに使用する。
   */
  async skipGatheringPhase(): Promise<void> {
    await this.executeDebugAction('skipPhase');
    await this.page.waitForTimeout(500);
  }

  // =============================================================================
  // ビジュアル確認
  // =============================================================================

  /**
   * ドラフトカードにホバーしてツールチップを表示
   *
   * @param index - カードのインデックス
   */
  async hoverDraftCard(index: number): Promise<void> {
    const card = this.getDraftCard(index);
    await card.hover();
    await this.page.waitForTimeout(500); // ツールチップ表示待機
  }

  /**
   * ドラフトカードの光彩エフェクトが表示されているかを確認
   *
   * @param index - カードのインデックス
   * @returns 光彩エフェクトが表示されている場合true
   */
  async hasCardGlowEffect(index: number): Promise<boolean> {
    const card = this.getDraftCard(index);
    const quality = await this.getDraftCardQuality(index);

    // B, A, S品質のみ光彩エフェクトがある
    if (!['B', 'A', 'S'].includes(quality)) {
      return false;
    }

    // 光彩エフェクトのクラスを確認
    const classList = await card.getAttribute('class');
    return classList?.includes('glow-effect') ?? false;
  }

  /**
   * ドラフトピック進行状況バーを確認
   *
   * @returns 進行状況（0.0-1.0）
   */
  async getDraftProgress(): Promise<number> {
    const progressBar = this.page.locator('.draft-progress-bar');
    const width = await progressBar.evaluate((el) => {
      return window.getComputedStyle(el).width;
    });

    const container = this.page.locator('.draft-progress-container');
    const containerWidth = await container.evaluate((el) => {
      return window.getComputedStyle(el).width;
    });

    const progress = Number.parseFloat(width) / Number.parseFloat(containerWidth);
    return Math.min(Math.max(progress, 0), 1);
  }

  // =============================================================================
  // ヘルパーメソッド
  // =============================================================================

  /**
   * ドラフトカードのLocatorを取得
   *
   * @param index - カードのインデックス
   * @returns ドラフトカードのLocator
   */
  private getDraftCard(index: number): Locator {
    return this.page.locator('.draft-card').nth(index);
  }

  /**
   * ドラフトカードのスクリーンショットを撮る
   *
   * @param index - カードのインデックス
   * @param fileName - ファイル名
   */
  async takeDraftCardScreenshot(index: number, fileName: string): Promise<void> {
    const card = this.getDraftCard(index);
    await card.screenshot({ path: `test-results/${fileName}` });
  }

  /**
   * ドラフトエリア全体のスクリーンショットを撮る
   *
   * @param fileName - ファイル名
   */
  async takeDraftAreaScreenshot(fileName: string): Promise<void> {
    const area = this.page.locator('.draft-area');
    await area.screenshot({ path: `test-results/${fileName}` });
  }
}
