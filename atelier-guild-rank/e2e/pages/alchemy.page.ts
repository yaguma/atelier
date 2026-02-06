import type { Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * AlchemyPage - 調合フェーズのPage Object
 *
 * @description
 * 調合フェーズ（Alchemy Phase）の操作を提供する。
 * 素材選択、レシピ選択、調合実行、品質確認などの操作が可能。
 *
 * @example
 * ```typescript
 * const alchemy = new AlchemyPage(page);
 * await alchemy.waitForAlchemyLoad();
 * await alchemy.selectMaterial(0, 'material-001');
 * await alchemy.synthesize();
 * const quality = await alchemy.getResultQuality();
 * ```
 */
export class AlchemyPage extends BasePage {
  // =============================================================================
  // ページ読み込み・初期化
  // =============================================================================

  /**
   * 調合フェーズの読み込み完了を待機
   *
   * @param timeout - タイムアウト時間（ミリ秒）
   */
  async waitForAlchemyLoad(timeout: number = 5000): Promise<void> {
    // フェーズがAlchemyになるまで待機
    await this.page.waitForFunction(
      () => {
        const state = (window as any).gameState?.();
        return state?.currentPhase === 'Alchemy';
      },
      { timeout },
    );

    // 素材スロットが表示されるまで待機
    await this.page.waitForSelector('.material-slot', { state: 'visible', timeout });
  }

  // =============================================================================
  // レシピ選択
  // =============================================================================

  /**
   * 利用可能なレシピのリストを取得
   *
   * @returns レシピIDの配列
   */
  async getRecipeList(): Promise<string[]> {
    const recipes = await this.page.locator('.recipe-item').all();
    const recipeIds: string[] = [];

    for (const recipe of recipes) {
      const id = await recipe.getAttribute('data-recipe-id');
      if (id) {
        recipeIds.push(id);
      }
    }

    return recipeIds;
  }

  /**
   * レシピを選択する
   *
   * @param recipeId - レシピID
   */
  async selectRecipe(recipeId: string): Promise<void> {
    const recipe = this.getRecipeItem(recipeId);
    await recipe.click();
    await this.page.waitForTimeout(200);
  }

  /**
   * 選択中のレシピIDを取得
   *
   * @returns 現在選択中のレシピID
   */
  async getSelectedRecipeId(): Promise<string> {
    const selected = this.page.locator('.recipe-item.selected');
    return (await selected.getAttribute('data-recipe-id')) ?? '';
  }

  /**
   * レシピの名前を取得
   *
   * @param recipeId - レシピID
   * @returns レシピの名前
   */
  async getRecipeName(recipeId: string): Promise<string> {
    const recipe = this.getRecipeItem(recipeId);
    const name = recipe.locator('.recipe-name');
    return (await name.textContent()) ?? '';
  }

  // =============================================================================
  // 素材スロット操作
  // =============================================================================

  /**
   * 素材スロットに素材を配置する
   *
   * @param slotIndex - スロットのインデックス
   * @param materialId - 素材ID
   */
  async selectMaterial(slotIndex: number, materialId: string): Promise<void> {
    const slot = this.getMaterialSlot(slotIndex);

    // スロットをクリックして素材選択ダイアログを開く
    await slot.click();
    await this.page.waitForTimeout(300);

    // 素材を選択
    const material = this.page.locator(`.material-option[data-material-id="${materialId}"]`);
    await material.click();
    await this.page.waitForTimeout(200);
  }

  /**
   * 素材スロットから素材を削除する
   *
   * @param slotIndex - スロットのインデックス
   */
  async removeMaterial(slotIndex: number): Promise<void> {
    const slot = this.getMaterialSlot(slotIndex);
    const removeButton = slot.locator('.remove-material-button');
    await removeButton.click();
    await this.page.waitForTimeout(200);
  }

  /**
   * 素材スロットが空かどうかを確認
   *
   * @param slotIndex - スロットのインデックス
   * @returns 空の場合true
   */
  async isSlotEmpty(slotIndex: number): Promise<boolean> {
    const slot = this.getMaterialSlot(slotIndex);
    const isEmpty = await slot.getAttribute('data-empty');
    return isEmpty === 'true';
  }

  /**
   * 素材スロットの素材品質を取得
   *
   * @param slotIndex - スロットのインデックス
   * @returns 品質（'D' | 'C' | 'B' | 'A' | 'S'）
   */
  async getMaterialQuality(slotIndex: number): Promise<string> {
    const slot = this.getMaterialSlot(slotIndex);
    const quality = await slot.getAttribute('data-quality');
    return quality ?? 'D';
  }

  /**
   * 全ての素材スロットが埋まっているかを確認
   *
   * @returns 全て埋まっている場合true
   */
  async areAllSlotsFilled(): Promise<boolean> {
    const slots = await this.page.locator('.material-slot').all();

    for (const slot of slots) {
      const isEmpty = await slot.getAttribute('data-empty');
      if (isEmpty === 'true') {
        return false;
      }
    }

    return true;
  }

  // =============================================================================
  // 調合実行
  // =============================================================================

  /**
   * 調合を実行する
   *
   * @description
   * 「調合する」ボタンをクリックして調合を実行する。
   * 調合完了のアニメーションまで待機する。
   */
  async synthesize(): Promise<void> {
    const synthesizeButton = this.page.locator('.synthesize-button');
    await synthesizeButton.click();

    // 調合アニメーション完了待機
    await this.page.waitForTimeout(1000);

    // 結果表示まで待機
    await this.page.waitForSelector('.synthesis-result', { state: 'visible' });
  }

  /**
   * 調合ボタンが有効かどうかを確認
   *
   * @returns 有効な場合true
   */
  async isSynthesizeButtonEnabled(): Promise<boolean> {
    const button = this.page.locator('.synthesize-button');
    const disabled = await button.getAttribute('disabled');
    return disabled === null;
  }

  /**
   * 調合可能な回数を取得
   *
   * @returns 残りの調合可能回数
   */
  async getRemainingSynthesisCount(): Promise<number> {
    const counter = this.page.locator('.synthesis-count');
    const text = (await counter.textContent()) ?? '0/0';
    const match = text.match(/(\d+)\/(\d+)/);
    if (match) {
      const current = Number.parseInt(match[1], 10);
      const total = Number.parseInt(match[2], 10);
      return total - current;
    }
    return 0;
  }

  // =============================================================================
  // 調合結果確認
  // =============================================================================

  /**
   * 調合結果の品質を取得
   *
   * @returns 調合結果の品質（'D' | 'C' | 'B' | 'A' | 'S'）
   */
  async getResultQuality(): Promise<string> {
    const result = this.page.locator('.synthesis-result');
    const quality = await result.getAttribute('data-quality');
    return quality ?? 'D';
  }

  /**
   * 調合結果のアイテム名を取得
   *
   * @returns アイテムの名前
   */
  async getResultItemName(): Promise<string> {
    const result = this.page.locator('.synthesis-result .item-name');
    return (await result.textContent()) ?? '';
  }

  /**
   * 調合が成功したかどうかを確認
   *
   * @returns 成功した場合true
   */
  async isSynthesisSuccess(): Promise<boolean> {
    const result = this.page.locator('.synthesis-result');
    const success = await result.getAttribute('data-success');
    return success === 'true';
  }

  /**
   * 調合結果を確認して閉じる
   */
  async closeResult(): Promise<void> {
    const closeButton = this.page.locator('.result-close-button');
    await closeButton.click();
    await this.page.waitForTimeout(300);
  }

  // =============================================================================
  // 品質予測
  // =============================================================================

  /**
   * 予測される調合結果の品質を取得
   *
   * @returns 予測品質（'D' | 'C' | 'B' | 'A' | 'S'）
   */
  async getPredictedQuality(): Promise<string> {
    const prediction = this.page.locator('.quality-prediction');
    const quality = await prediction.getAttribute('data-predicted-quality');
    return quality ?? 'D';
  }

  /**
   * 品質予測が表示されているかを確認
   *
   * @returns 表示されている場合true
   */
  async isPredictionVisible(): Promise<boolean> {
    const prediction = this.page.locator('.quality-prediction');
    return await prediction.isVisible();
  }

  // =============================================================================
  // フェーズ操作
  // =============================================================================

  /**
   * 調合フェーズを終了する
   *
   * @description
   * 「次のフェーズへ」ボタンをクリックして納品フェーズに遷移する。
   */
  async endAlchemyPhase(): Promise<void> {
    const nextButton = this.page.locator('.phase-next-button');
    await nextButton.click();

    // フェーズ遷移待機
    await this.page.waitForFunction(
      () => {
        const state = (window as any).gameState?.();
        return state?.currentPhase !== 'Alchemy';
      },
      { timeout: 5000 },
    );
  }

  /**
   * 調合フェーズを強制的にスキップする
   *
   * @description
   * デバッグツールを使用して調合フェーズをスキップする。
   * テスト用途のみに使用する。
   */
  async skipAlchemyPhase(): Promise<void> {
    await this.executeDebugAction('skipPhase');
    await this.page.waitForTimeout(500);
  }

  // =============================================================================
  // ヘルパーメソッド
  // =============================================================================

  /**
   * 素材スロットのLocatorを取得
   *
   * @param index - スロットのインデックス
   * @returns 素材スロットのLocator
   */
  private getMaterialSlot(index: number): Locator {
    return this.page.locator('.material-slot').nth(index);
  }

  /**
   * レシピアイテムのLocatorを取得
   *
   * @param recipeId - レシピID
   * @returns レシピアイテムのLocator
   */
  private getRecipeItem(recipeId: string): Locator {
    return this.page.locator(`.recipe-item[data-recipe-id="${recipeId}"]`);
  }

  /**
   * 素材スロットのスクリーンショットを撮る
   *
   * @param index - スロットのインデックス
   * @param fileName - ファイル名
   */
  async takeMaterialSlotScreenshot(index: number, fileName: string): Promise<void> {
    const slot = this.getMaterialSlot(index);
    await slot.screenshot({ path: `test-results/${fileName}` });
  }

  /**
   * 調合結果のスクリーンショットを撮る
   *
   * @param fileName - ファイル名
   */
  async takeResultScreenshot(fileName: string): Promise<void> {
    const result = this.page.locator('.synthesis-result');
    await result.screenshot({ path: `test-results/${fileName}` });
  }

  /**
   * 調合エリア全体のスクリーンショットを撮る
   *
   * @param fileName - ファイル名
   */
  async takeAlchemyAreaScreenshot(fileName: string): Promise<void> {
    const area = this.page.locator('.alchemy-area');
    await area.screenshot({ path: `test-results/${fileName}` });
  }
}
