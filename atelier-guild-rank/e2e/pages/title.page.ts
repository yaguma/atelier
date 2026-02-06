import type { GameWindow } from '../types/game-window.types';
import { BasePage } from './base.page';

/**
 * タイトル画面のPage Objectクラス
 *
 * @description
 * タイトル画面（TitleScene）のUI要素とインタラクションを提供する。
 * 新規ゲーム開始やコンティニューなどの操作を行う。
 *
 * @example
 * ```typescript
 * const title = new TitlePage(page);
 * await title.waitForTitleLoad();
 * await title.clickNewGame();
 * ```
 */
export class TitlePage extends BasePage {
  /**
   * タイトル画面が読み込まれるまで待機
   *
   * @description
   * キャンバスの可視化とTitleSceneの表示を待機する。
   */
  async waitForTitleLoad(): Promise<void> {
    await this.waitForCanvasVisible();
    await this.waitForScene('TitleScene');
  }

  /**
   * 新規ゲームボタンをクリック
   *
   * @description
   * デバッグツール経由で新規ゲームを開始する。
   *
   * @throws デバッグツールが利用不可の場合
   */
  async clickNewGame(): Promise<void> {
    await this.page.evaluate(() => {
      const debug = (window as unknown as GameWindow).debug;
      if (debug?.clickNewGame) {
        debug.clickNewGame();
      } else {
        throw new Error('Debug tools not available or clickNewGame not implemented');
      }
    });
  }

  /**
   * コンティニューボタンをクリック
   *
   * @description
   * デバッグツール経由でコンティニューを実行する。
   *
   * @throws デバッグツールが利用不可の場合
   */
  async clickContinue(): Promise<void> {
    await this.page.evaluate(() => {
      const debug = (window as unknown as GameWindow).debug;
      if (debug?.clickContinue) {
        debug.clickContinue();
      } else {
        throw new Error('Debug tools not available or clickContinue not implemented');
      }
    });
  }

  /**
   * コンティニューボタンが有効かどうかを確認
   *
   * @returns コンティニューが有効な場合true
   */
  async isContinueEnabled(): Promise<boolean> {
    return await this.page.evaluate(() => {
      const state = (window as unknown as GameWindow).gameState?.();
      return state?.hasSaveData ?? false;
    });
  }
}
