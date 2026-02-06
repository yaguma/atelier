import type { Page } from '@playwright/test';
import type { GameWindow } from '../types/game-window.types';
import { BasePage } from './base.page';

/**
 * 座標情報の型定義
 */
export interface Coordinates {
  x: number;
  y: number;
}

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

  /** UI要素の固定座標（1280x720基準） */
  static readonly COORDS = {
    // フッター
    NEXT_BUTTON: { x: 1144, y: 660 },
    END_DAY_BUTTON: { x: 400, y: 630 },

    // サイドバー
    SIDEBAR_SHOP_BUTTON: { x: 100, y: 504 },

    // タイトル画面
    TITLE_NEW_GAME: { x: 640, y: 400 },
    TITLE_CONTINUE: { x: 640, y: 470 },
    TITLE_SETTINGS: { x: 640, y: 540 },

    // 依頼受注フェーズ
    QUEST_CARD_1: { x: 400, y: 290 },
    QUEST_CARD_2: { x: 700, y: 290 },
    QUEST_CARD_3: { x: 1000, y: 290 },
    QUEST_CARD_4: { x: 400, y: 490 },
    QUEST_CARD_5: { x: 700, y: 490 },

    // 採取フェーズ
    DRAFT_CARD_1: { x: 450, y: 300 },
    DRAFT_CARD_2: { x: 700, y: 300 },
    DRAFT_CARD_3: { x: 950, y: 300 },
    GATHERING_END_BUTTON: { x: 650, y: 550 },

    // 調合フェーズ
    RECIPE_1: { x: 500, y: 200 },
    RECIPE_2: { x: 500, y: 260 },
    ALCHEMY_SYNTHESIZE_BUTTON: { x: 700, y: 480 },
    ALCHEMY_RESULT_CLOSE: { x: 700, y: 500 },

    // 納品フェーズ
    DELIVERY_QUEST_1: { x: 400, y: 200 },
    DELIVERY_ITEM_1: { x: 700, y: 350 },
    DELIVERY_BUTTON: { x: 400, y: 480 },
    DELIVERY_REWARD_CLOSE: { x: 700, y: 500 },

    // リザルト画面
    RESULT_TO_TITLE: { x: 500, y: 550 },
    RESULT_RETRY: { x: 780, y: 550 },
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
   * 次へボタンをクリック
   */
  async clickNextButton(): Promise<void> {
    await this.clickCoords(MouseInteractionPage.COORDS.NEXT_BUTTON);
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
