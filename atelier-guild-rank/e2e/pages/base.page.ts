import type { Locator, Page } from '@playwright/test';
import type { GameState, GameWindow } from '../types/game-window.types';

/**
 * ページオブジェクトの基底クラス
 *
 * @description
 * 全てのページオブジェクトで共通するプロパティとメソッドを提供する。
 * Phaserゲームのキャンバスを含むコンテナ要素へのアクセスを統一的に行う。
 *
 * @example
 * ```typescript
 * class MyPage extends BasePage {
 *   async waitForPageLoad(): Promise<void> {
 *     await this.waitForCanvasVisible();
 *     // ページ固有の待機処理
 *   }
 * }
 * ```
 */
export abstract class BasePage {
  /** Playwrightのページインスタンス */
  readonly page: Page;

  /** ゲームコンテナのロケーター */
  readonly gameContainer: Locator;

  /** ゲームキャンバスのロケーター */
  readonly canvas: Locator;

  /** キャンバス待機のデフォルトタイムアウト（ミリ秒） */
  protected static readonly DEFAULT_TIMEOUT = 10000;

  /**
   * コンストラクタ
   *
   * @param page - Playwrightのページインスタンス
   */
  constructor(page: Page) {
    this.page = page;
    this.gameContainer = page.locator('#game-container');
    this.canvas = page.locator('#game-container canvas');
  }

  /**
   * キャンバスが可視状態になるまで待機する
   *
   * @param timeout - 待機タイムアウト（ミリ秒、デフォルト: 10000）
   */
  protected async waitForCanvasVisible(timeout: number = BasePage.DEFAULT_TIMEOUT): Promise<void> {
    await this.canvas.waitFor({ state: 'visible', timeout });
  }

  // =============================================================================
  // キャンバス操作ヘルパー
  // =============================================================================

  /**
   * キャンバス上の指定座標をクリック
   *
   * @param x - クリックするX座標
   * @param y - クリックするY座標
   */
  async clickCanvas(x: number, y: number): Promise<void> {
    await this.canvas.click({ position: { x, y } });
  }

  // =============================================================================
  // ゲーム状態取得ヘルパー
  // =============================================================================

  /**
   * 現在のゲーム状態を取得する
   *
   * @returns GameStateオブジェクト
   */
  async getGameState(): Promise<GameState> {
    return await this.page.evaluate(() => {
      const state = (window as unknown as GameWindow).gameState?.();
      return state ?? {};
    });
  }

  /**
   * ゲーム状態から指定プロパティを取得
   *
   * @param property - 取得するプロパティ名
   * @param defaultValue - デフォルト値
   * @returns プロパティ値またはデフォルト値
   */
  protected async getStateProperty<T>(property: string, defaultValue: T): Promise<T> {
    return await this.page.evaluate(
      ({ prop, def }) => {
        const state = (window as unknown as GameWindow).gameState?.();
        // biome-ignore lint/suspicious/noExplicitAny: 動的プロパティアクセスのため
        return (state?.[prop as keyof typeof state] as T) ?? (def as T);
      },
      { prop: property, def: defaultValue },
    );
  }

  // =============================================================================
  // シーン・フェーズ待機ヘルパー
  // =============================================================================

  /**
   * 指定したシーンになるまで待機
   *
   * @param sceneName - 待機するシーン名
   * @param timeout - タイムアウト（ミリ秒）
   */
  async waitForScene(sceneName: string, timeout: number = BasePage.DEFAULT_TIMEOUT): Promise<void> {
    await this.page.waitForFunction(
      (name) => {
        const state = (window as unknown as GameWindow).gameState?.();
        return state?.currentScene === name;
      },
      sceneName,
      { timeout },
    );
  }

  /**
   * 指定したフェーズになるまで待機
   *
   * @param phase - 待機するフェーズ名
   * @param timeout - タイムアウト（ミリ秒）
   */
  async waitForPhase(phase: string, timeout: number = BasePage.DEFAULT_TIMEOUT): Promise<void> {
    await this.page.waitForFunction(
      (p) => {
        const state = (window as unknown as GameWindow).gameState?.();
        return state?.currentPhase === p;
      },
      phase,
      { timeout },
    );
  }

  // =============================================================================
  // デバッグアクションヘルパー
  // =============================================================================

  /**
   * デバッグアクションを実行（引数なし）
   *
   * @param actionName - 実行するアクション名
   * @throws デバッグツールが利用不可の場合
   */
  protected async executeDebugAction(actionName: string): Promise<void> {
    await this.page.evaluate((name) => {
      const debug = (window as unknown as GameWindow).debug;
      // biome-ignore lint/suspicious/noExplicitAny: 動的メソッド呼び出しのため
      const action = debug?.[name as keyof typeof debug] as (() => void) | undefined;
      if (action) {
        action();
      } else {
        throw new Error(`Debug tools not available or ${name} not implemented`);
      }
    }, actionName);
  }

  /**
   * デバッグアクションを実行（引数あり）
   *
   * @param actionName - 実行するアクション名
   * @param arg - アクションに渡す引数
   * @throws デバッグツールが利用不可の場合
   */
  protected async executeDebugActionWithArg<T>(actionName: string, arg: T): Promise<void> {
    await this.page.evaluate(
      ({ name, value }) => {
        const debug = (window as unknown as GameWindow).debug;
        // biome-ignore lint/suspicious/noExplicitAny: 動的メソッド呼び出しのため
        const action = debug?.[name as keyof typeof debug] as ((v: T) => void) | undefined;
        if (action) {
          action(value as T);
        } else {
          throw new Error(`Debug tools not available or ${name} not implemented`);
        }
      },
      { name: actionName, value: arg },
    );
  }
}
