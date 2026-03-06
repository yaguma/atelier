import type { Page } from '@playwright/test';
import {
  ALCHEMY_COORDS,
  COMMON_UI_COORDS,
  type Coordinates,
  DELIVERY_COORDS,
  GATHERING_COORDS,
  getPhaseTabCoords,
  QUEST_ACCEPT_COORDS,
  RESULT_COORDS,
  TITLE_COORDS,
} from '../fixtures/mouse-coordinates';
import type { GameWindow } from '../types/game-window.types';
import { BasePage } from './base.page';

export type { Coordinates };

/**
 * バウンディングボックスの型定義
 */
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * マウス操作テスト専用Page Object
 *
 * @description
 * Phaser.jsゲームのマウス操作テストを実行するためのヘルパーメソッドを提供する。
 * ホバーエフェクト、クリック、ドラッグ&ドロップのテストをサポートする。
 * Canvas上の座標ベースの操作に特化している。
 */
export class MouseInteractionPage extends BasePage {
  /** ホバーエフェクト安定化の待機時間（ミリ秒） */
  private static readonly HOVER_SETTLE_TIME = 300;

  /** ドラッグ操作のステップ数 */
  private static readonly DRAG_STEPS = 10;

  /** クリック後のデフォルト待機時間（ミリ秒） */
  private static readonly CLICK_DELAY = 100;

  constructor(page: Page) {
    super(page);
  }

  // =============================================================================
  // 基本マウス操作
  // =============================================================================

  /**
   * 指定座標にマウスを移動
   *
   * @param x - X座標
   * @param y - Y座標
   */
  async moveTo(x: number, y: number): Promise<void> {
    await this.page.mouse.move(x, y);
  }

  /**
   * 座標オブジェクトでマウスを移動
   *
   * @param coords - 座標オブジェクト
   */
  async moveToCoords(coords: Coordinates): Promise<void> {
    await this.moveTo(coords.x, coords.y);
  }

  /**
   * 指定座標をクリック
   *
   * @param x - X座標
   * @param y - Y座標
   * @param delay - クリック後の待機時間（ミリ秒）
   */
  async click(x: number, y: number, delay = MouseInteractionPage.CLICK_DELAY): Promise<void> {
    await this.clickCanvas(x, y);
    if (delay > 0) {
      await this.page.waitForTimeout(delay);
    }
  }

  /**
   * 座標オブジェクトでクリック
   *
   * @param coords - 座標オブジェクト
   * @param delay - クリック後の待機時間
   */
  async clickCoords(coords: Coordinates, delay = MouseInteractionPage.CLICK_DELAY): Promise<void> {
    await this.click(coords.x, coords.y, delay);
  }

  /**
   * ダブルクリック
   *
   * @param x - X座標
   * @param y - Y座標
   */
  async doubleClick(x: number, y: number): Promise<void> {
    await this.canvas.dblclick({ position: { x, y } });
  }

  /**
   * 右クリック
   *
   * @param x - X座標
   * @param y - Y座標
   */
  async rightClick(x: number, y: number): Promise<void> {
    await this.canvas.click({ position: { x, y }, button: 'right' });
  }

  // =============================================================================
  // ホバー操作
  // =============================================================================

  /**
   * 指定座標にホバーし、エフェクト安定化を待機
   *
   * @param x - X座標
   * @param y - Y座標
   * @param settleTime - ホバー安定化待機時間（ミリ秒）
   */
  async hover(
    x: number,
    y: number,
    settleTime = MouseInteractionPage.HOVER_SETTLE_TIME,
  ): Promise<void> {
    await this.moveTo(x, y);
    await this.page.waitForTimeout(settleTime);
  }

  /**
   * 座標オブジェクトでホバー
   *
   * @param coords - 座標オブジェクト
   * @param settleTime - ホバー安定化待機時間
   */
  async hoverCoords(
    coords: Coordinates,
    settleTime = MouseInteractionPage.HOVER_SETTLE_TIME,
  ): Promise<void> {
    await this.hover(coords.x, coords.y, settleTime);
  }

  /**
   * ホバーを解除（画面外に移動）
   */
  async unhover(): Promise<void> {
    await this.moveTo(0, 0);
    await this.page.waitForTimeout(100);
  }

  /**
   * ホバー前後でスクリーンショットを取得
   *
   * @param coords - ホバー座標
   * @param beforeName - ホバー前のスクリーンショット名
   * @param afterName - ホバー後のスクリーンショット名
   */
  async captureHoverEffect(
    coords: Coordinates,
    beforeName: string,
    afterName: string,
  ): Promise<void> {
    // ホバー前（画面外にマウスを置く）
    await this.unhover();
    // ホバー後
    await this.hoverCoords(coords);
  }

  // =============================================================================
  // ドラッグ&ドロップ操作
  // =============================================================================

  /**
   * ドラッグ&ドロップを実行
   *
   * @param from - ドラッグ開始座標
   * @param to - ドロップ先座標
   * @param steps - ドラッグのステップ数（滑らかさ）
   */
  async dragAndDrop(
    from: Coordinates,
    to: Coordinates,
    steps = MouseInteractionPage.DRAG_STEPS,
  ): Promise<void> {
    await this.moveTo(from.x, from.y);
    await this.page.mouse.down();
    await this.page.mouse.move(to.x, to.y, { steps });
    await this.page.mouse.up();
    await this.page.waitForTimeout(200); // ドロップアニメーション待機
  }

  /**
   * ドラッグをキャンセル（元の位置に戻す）
   *
   * @param from - ドラッグ開始座標
   * @param partialTo - 途中まで移動する座標
   */
  async dragAndCancel(from: Coordinates, partialTo: Coordinates): Promise<void> {
    await this.moveTo(from.x, from.y);
    await this.page.mouse.down();
    await this.page.mouse.move(partialTo.x, partialTo.y, { steps: 5 });
    // ESCキーでキャンセル（ゲーム側の実装に依存）
    await this.page.keyboard.press('Escape');
    await this.page.mouse.up();
    await this.page.waitForTimeout(200);
  }

  /**
   * 無効なドロップゾーンへのドラッグ
   *
   * @param from - ドラッグ開始座標
   * @param invalidZone - 無効なドロップゾーン座標
   */
  async dragToInvalidZone(from: Coordinates, invalidZone: Coordinates): Promise<void> {
    await this.dragAndDrop(from, invalidZone);
  }

  // =============================================================================
  // UI要素座標取得（テストブリッジ経由）
  // =============================================================================

  /**
   * 名前でUI要素の座標を取得
   *
   * @param elementName - 要素名
   * @returns 座標オブジェクト（見つからない場合null）
   */
  async getElementCoords(elementName: string): Promise<Coordinates | null> {
    return await this.page.evaluate((name) => {
      const win = window as unknown as GameWindow;
      // biome-ignore lint/suspicious/noExplicitAny: Phaser内部アクセス
      const game = (win as any).__PHASER_GAME__;
      if (!game) return null;

      // 全シーンから要素を検索
      const scenes = game.scene.scenes;
      for (const scene of scenes) {
        if (!scene.sys.isActive()) continue;
        const found = scene.children?.list?.find(
          // biome-ignore lint/suspicious/noExplicitAny: Phaser内部アクセス
          (c: any) => c.name === name,
        );
        if (found) {
          return { x: found.x, y: found.y };
        }
      }
      return null;
    }, elementName);
  }

  /**
   * テストIDでUI要素の座標を取得
   *
   * @param testId - テストID
   * @returns 座標オブジェクト
   */
  async getElementCoordsByTestId(testId: string): Promise<Coordinates | null> {
    return await this.page.evaluate((id) => {
      const win = window as unknown as GameWindow;
      // biome-ignore lint/suspicious/noExplicitAny: Phaser内部アクセス
      const game = (win as any).__PHASER_GAME__;
      if (!game) return null;

      const scenes = game.scene.scenes;
      for (const scene of scenes) {
        if (!scene.sys.isActive()) continue;
        const found = scene.children?.list?.find(
          // biome-ignore lint/suspicious/noExplicitAny: Phaser内部アクセス
          (c: any) => c.getData?.('testId') === id,
        );
        if (found) {
          return { x: found.x, y: found.y };
        }
      }
      return null;
    }, testId);
  }

  // =============================================================================
  // フェーズ固有の座標定義
  // =============================================================================

  /**
   * UI要素の座標（1280x720基準）
   * Issue #367: レイアウト定数ベースの計算式に統一
   *
   * 各座標は e2e/fixtures/mouse-coordinates.ts のレイアウト定数から算出。
   * 座標変更時は mouse-coordinates.ts の定数を更新すること。
   */
  static readonly COORDS = {
    // フッター（PhaseTabUI: TASK-0112で「次へ」ボタンを廃止、フェーズタブに変更）
    PHASE_TAB_GATHERING: COMMON_UI_COORDS.FOOTER.PHASE_TAB_GATHERING,
    PHASE_TAB_ALCHEMY: COMMON_UI_COORDS.FOOTER.PHASE_TAB_ALCHEMY,
    PHASE_TAB_DELIVERY: COMMON_UI_COORDS.FOOTER.PHASE_TAB_DELIVERY,
    END_DAY_BUTTON: COMMON_UI_COORDS.FOOTER.END_DAY_BUTTON,

    // サイドバー
    SIDEBAR_SHOP_BUTTON: COMMON_UI_COORDS.SIDEBAR.SHOP_BUTTON,

    // タイトル画面
    TITLE_NEW_GAME: TITLE_COORDS.NEW_GAME,
    TITLE_CONTINUE: TITLE_COORDS.CONTINUE,
    TITLE_SETTINGS: TITLE_COORDS.SETTINGS,

    // 依頼受注フェーズ（レイアウト定数ベース: SIDEBAR_WIDTH + GRID_START_X/Y）
    QUEST_CARD_1: QUEST_ACCEPT_COORDS.CARDS[0],
    QUEST_CARD_2: QUEST_ACCEPT_COORDS.CARDS[1],
    QUEST_CARD_3: QUEST_ACCEPT_COORDS.CARDS[2],
    QUEST_CARD_4: QUEST_ACCEPT_COORDS.CARDS[3],
    QUEST_CARD_5: QUEST_ACCEPT_COORDS.CARDS[4],

    // 採取フェーズ
    DRAFT_CARD_1: GATHERING_COORDS.DRAFT_CARDS[0],
    DRAFT_CARD_2: GATHERING_COORDS.DRAFT_CARDS[1],
    DRAFT_CARD_3: GATHERING_COORDS.DRAFT_CARDS[2],
    GATHERING_END_BUTTON: GATHERING_COORDS.END_BUTTON,

    // 調合フェーズ（レイアウト定数ベース: SIDEBAR_WIDTH + RECIPE_LIST_OFFSET_X/Y）
    RECIPE_1: ALCHEMY_COORDS.RECIPES[0],
    RECIPE_2: ALCHEMY_COORDS.RECIPES[1],
    ALCHEMY_SYNTHESIZE_BUTTON: ALCHEMY_COORDS.SYNTHESIZE_BUTTON,
    ALCHEMY_RESULT_CLOSE: ALCHEMY_COORDS.RESULT_MODAL.CLOSE_BUTTON,

    // 納品フェーズ
    DELIVERY_QUEST_1: DELIVERY_COORDS.QUESTS[0],
    DELIVERY_ITEM_1: DELIVERY_COORDS.ITEMS[0],
    DELIVERY_BUTTON: DELIVERY_COORDS.DELIVER_BUTTON,
    DELIVERY_REWARD_CLOSE: DELIVERY_COORDS.REWARD_MODAL.CLOSE_BUTTON,

    // リザルト画面
    RESULT_TO_TITLE: RESULT_COORDS.GAME_OVER.TITLE_BUTTON,
    RESULT_RETRY: RESULT_COORDS.GAME_OVER.RETRY_BUTTON,
  } as const;

  // =============================================================================
  // フェーズ固有の操作
  // =============================================================================

  /**
   * 依頼カードをクリック
   *
   * @param cardIndex - カードインデックス（0-4）
   */
  async clickQuestCard(cardIndex: 0 | 1 | 2 | 3 | 4): Promise<void> {
    const coordsMap = [
      MouseInteractionPage.COORDS.QUEST_CARD_1,
      MouseInteractionPage.COORDS.QUEST_CARD_2,
      MouseInteractionPage.COORDS.QUEST_CARD_3,
      MouseInteractionPage.COORDS.QUEST_CARD_4,
      MouseInteractionPage.COORDS.QUEST_CARD_5,
    ];
    await this.clickCoords(coordsMap[cardIndex]);
  }

  /**
   * ドラフトカードをクリック
   *
   * @param cardIndex - カードインデックス（0-2）
   */
  async clickDraftCard(cardIndex: 0 | 1 | 2): Promise<void> {
    const coordsMap = [
      MouseInteractionPage.COORDS.DRAFT_CARD_1,
      MouseInteractionPage.COORDS.DRAFT_CARD_2,
      MouseInteractionPage.COORDS.DRAFT_CARD_3,
    ];
    await this.clickCoords(coordsMap[cardIndex]);
  }

  /**
   * レシピをクリック
   *
   * @param recipeIndex - レシピインデックス（0-1）
   */
  async clickRecipe(recipeIndex: 0 | 1): Promise<void> {
    const coordsMap = [MouseInteractionPage.COORDS.RECIPE_1, MouseInteractionPage.COORDS.RECIPE_2];
    await this.clickCoords(coordsMap[recipeIndex]);
  }

  /**
   * フェーズタブをクリックしてフェーズを遷移
   * Issue #367: TASK-0112で「次へ」ボタンがPhaseTabUIに変更されたため追加
   *
   * @param phase - 遷移先フェーズ名（GATHERING, ALCHEMY, DELIVERY）
   */
  async clickPhaseTab(phase: string): Promise<void> {
    const coords = getPhaseTabCoords(phase);
    if (!coords) {
      throw new Error(`Unknown phase for tab click: ${phase}`);
    }
    await this.clickCoords(coords);
  }

  /**
   * 日終了ボタンをクリック
   */
  async clickEndDayButton(): Promise<void> {
    await this.clickCoords(MouseInteractionPage.COORDS.END_DAY_BUTTON);
  }

  /**
   * タイトル画面で新規ゲームをクリック
   */
  async clickNewGame(): Promise<void> {
    await this.clickCoords(MouseInteractionPage.COORDS.TITLE_NEW_GAME);
  }

  /**
   * タイトル画面でコンティニューをクリック
   */
  async clickContinue(): Promise<void> {
    await this.clickCoords(MouseInteractionPage.COORDS.TITLE_CONTINUE);
  }

  // =============================================================================
  // ツールチップ操作
  // =============================================================================

  /**
   * ホバーでツールチップを表示
   *
   * @param coords - ホバー座標
   * @param tooltipDelay - ツールチップ表示までの待機時間（ミリ秒）
   */
  async showTooltip(coords: Coordinates, tooltipDelay = 500): Promise<void> {
    await this.hoverCoords(coords, tooltipDelay + 100);
  }

  /**
   * ツールチップが表示されているか確認
   *
   * @returns ツールチップが表示されている場合true
   */
  async isTooltipVisible(): Promise<boolean> {
    return await this.page.evaluate(() => {
      const win = window as unknown as GameWindow;
      // biome-ignore lint/suspicious/noExplicitAny: 動的プロパティアクセス
      const state = win.gameState?.() as any;
      return state?.isTooltipVisible ?? false;
    });
  }

  // =============================================================================
  // スクロール操作
  // =============================================================================

  /**
   * マウスホイールでスクロール
   *
   * @param deltaY - スクロール量（正: 下方向、負: 上方向）
   * @param x - スクロール位置のX座標
   * @param y - スクロール位置のY座標
   */
  async scroll(deltaY: number, x?: number, y?: number): Promise<void> {
    if (x !== undefined && y !== undefined) {
      await this.moveTo(x, y);
    }
    await this.page.mouse.wheel(0, deltaY);
    await this.page.waitForTimeout(100);
  }
}
