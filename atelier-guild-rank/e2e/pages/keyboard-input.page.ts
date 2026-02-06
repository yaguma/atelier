import type { Page } from '@playwright/test';
import type { GameWindow } from '../types/game-window.types';
import { BasePage } from './base.page';

/**
 * キーボード入力テスト専用Page Object
 *
 * @description
 * Phaser.jsゲームのキーボード入力テストを実行するためのヘルパーメソッドを提供する。
 * ゲーム内のキーマッピングに対応したアクション実行、キーボードナビゲーション、
 * ショートカットキーのテストをサポートする。
 */
export class KeyboardInputPage extends BasePage {
  /** キー入力後のデフォルト待機時間（ミリ秒） */
  private static readonly DEFAULT_KEY_DELAY = 100;

  /** キーリピート間隔（ミリ秒） */
  private static readonly KEY_REPEAT_INTERVAL = 50;

  constructor(page: Page) {
    super(page);
  }

  // =============================================================================
  // 基本キー操作
  // =============================================================================

  /**
   * 単一キーを押下
   *
   * @param key - キー名（'Enter', 'Escape', '1', 'ArrowUp' など）
   * @param delay - 押下後の待機時間（ミリ秒）
   */
  async pressKey(key: string, delay = KeyboardInputPage.DEFAULT_KEY_DELAY): Promise<void> {
    await this.page.keyboard.press(key);
    if (delay > 0) {
      await this.page.waitForTimeout(delay);
    }
  }

  /**
   * 複数のキーを順番に押下
   *
   * @param keys - キー名の配列
   * @param delay - 各キー押下後の待機時間（ミリ秒）
   */
  async pressKeys(keys: string[], delay = KeyboardInputPage.DEFAULT_KEY_DELAY): Promise<void> {
    for (const key of keys) {
      await this.pressKey(key, delay);
    }
  }

  /**
   * キーを押し続ける
   *
   * @param key - キー名
   * @param durationMs - 押し続ける時間（ミリ秒）
   */
  async holdKey(key: string, durationMs: number): Promise<void> {
    await this.page.keyboard.down(key);
    await this.page.waitForTimeout(durationMs);
    await this.page.keyboard.up(key);
  }

  /**
   * 修飾キー + キーの組み合わせを押下
   *
   * @param modifier - 修飾キー（'Control', 'Shift', 'Alt'）
   * @param key - キー名
   */
  async pressWithModifier(modifier: 'Control' | 'Shift' | 'Alt', key: string): Promise<void> {
    await this.page.keyboard.down(modifier);
    await this.page.keyboard.press(key);
    await this.page.keyboard.up(modifier);
    await this.page.waitForTimeout(KeyboardInputPage.DEFAULT_KEY_DELAY);
  }

  // =============================================================================
  // ゲーム操作キー
  // =============================================================================

  /**
   * 決定・次へ（Enter）
   */
  async confirm(): Promise<void> {
    await this.pressKey('Enter');
  }

  /**
   * キャンセル・戻る（Escape）
   */
  async cancel(): Promise<void> {
    await this.pressKey('Escape');
  }

  /**
   * 選択・実行（Space）
   */
  async select(): Promise<void> {
    await this.pressKey('Space');
  }

  /**
   * フォーカス移動（Tab）
   */
  async nextFocus(): Promise<void> {
    await this.pressKey('Tab');
  }

  /**
   * 逆方向フォーカス移動（Shift+Tab）
   */
  async previousFocus(): Promise<void> {
    await this.pressWithModifier('Shift', 'Tab');
  }

  // =============================================================================
  // 方向キー操作
  // =============================================================================

  /**
   * 上方向に移動
   *
   * @param times - 移動回数
   */
  async moveUp(times = 1): Promise<void> {
    for (let i = 0; i < times; i++) {
      await this.pressKey('ArrowUp');
    }
  }

  /**
   * 下方向に移動
   *
   * @param times - 移動回数
   */
  async moveDown(times = 1): Promise<void> {
    for (let i = 0; i < times; i++) {
      await this.pressKey('ArrowDown');
    }
  }

  /**
   * 左方向に移動
   *
   * @param times - 移動回数
   */
  async moveLeft(times = 1): Promise<void> {
    for (let i = 0; i < times; i++) {
      await this.pressKey('ArrowLeft');
    }
  }

  /**
   * 右方向に移動
   *
   * @param times - 移動回数
   */
  async moveRight(times = 1): Promise<void> {
    for (let i = 0; i < times; i++) {
      await this.pressKey('ArrowRight');
    }
  }

  /**
   * 方向キーでナビゲーション
   *
   * @param direction - 方向（'up', 'down', 'left', 'right'）
   * @param times - 移動回数
   */
  async navigate(direction: 'up' | 'down' | 'left' | 'right', times = 1): Promise<void> {
    const keyMap = {
      up: 'ArrowUp',
      down: 'ArrowDown',
      left: 'ArrowLeft',
      right: 'ArrowRight',
    };
    for (let i = 0; i < times; i++) {
      await this.pressKey(keyMap[direction]);
    }
  }

  // =============================================================================
  // フェーズ固有のキー操作
  // =============================================================================

  /**
   * 依頼カードを番号キーで選択（1-5）
   *
   * @param cardNumber - カード番号（1-5）
   */
  async selectQuestCard(cardNumber: 1 | 2 | 3 | 4 | 5): Promise<void> {
    await this.pressKey(cardNumber.toString());
  }

  /**
   * ドラフトカードを番号キーで選択（1-3）
   *
   * @param cardNumber - カード番号（1-3）
   */
  async selectDraftCard(cardNumber: 1 | 2 | 3): Promise<void> {
    await this.pressKey(cardNumber.toString());
  }

  /**
   * レシピを番号キーで選択
   *
   * @param recipeNumber - レシピ番号
   */
  async selectRecipe(recipeNumber: number): Promise<void> {
    await this.pressKey(recipeNumber.toString());
  }

  // =============================================================================
  // キーボードナビゲーションフロー
  // =============================================================================

  /**
   * タイトル画面で新規ゲームを開始
   */
  async startNewGameFromTitle(): Promise<void> {
    await this.waitForScene('TitleScene');
    await this.confirm(); // 新規ゲームボタンがデフォルトフォーカス想定
  }

  /**
   * タイトル画面でコンティニューを選択
   */
  async continueFromTitle(): Promise<void> {
    await this.waitForScene('TitleScene');
    await this.moveDown(); // コンティニューボタンへ移動
    await this.confirm();
  }

  /**
   * モーダルをキーボードで閉じる
   */
  async closeModal(): Promise<void> {
    await this.cancel();
  }

  /**
   * 次へボタンをキーボードで押す
   */
  async pressNextButton(): Promise<void> {
    // TabでフォーカスをNextボタンに移動してEnter
    await this.nextFocus();
    await this.confirm();
  }

  // =============================================================================
  // 状態検証ヘルパー
  // =============================================================================

  /**
   * キーボード入力が有効かどうかを確認
   *
   * @returns キーボード入力が有効な場合true
   */
  async isKeyboardInputEnabled(): Promise<boolean> {
    return await this.page.evaluate(() => {
      const win = window as unknown as GameWindow;
      const state = win.gameState?.();
      // モーダルが開いていない、かつシーンがアクティブな状態
      return !state?.isModalOpen;
    });
  }

  /**
   * 現在のフォーカス要素を取得（テストブリッジ経由）
   *
   * @returns フォーカス要素の情報
   */
  async getCurrentFocus(): Promise<string | null> {
    return await this.page.evaluate(() => {
      const win = window as unknown as GameWindow;
      // biome-ignore lint/suspicious/noExplicitAny: 動的プロパティアクセス
      const state = win.gameState?.() as any;
      return state?.focusedElement ?? null;
    });
  }

  // =============================================================================
  // シーケンス操作
  // =============================================================================

  /**
   * キーシーケンスを実行（ゲームコマンド入力用）
   *
   * @param sequence - キーシーケンス（例: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown']）
   * @param intervalMs - キー間の待機時間（ミリ秒）
   */
  async executeKeySequence(sequence: string[], intervalMs = 100): Promise<void> {
    for (const key of sequence) {
      await this.page.keyboard.press(key);
      await this.page.waitForTimeout(intervalMs);
    }
  }

  /**
   * テキストを入力（入力フィールドがある場合）
   *
   * @param text - 入力テキスト
   */
  async typeText(text: string): Promise<void> {
    await this.page.keyboard.type(text, { delay: 50 });
  }
}
