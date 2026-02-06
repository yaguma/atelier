import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import type { GameWindow } from '../types/game-window.types';
import { BasePage } from './base.page';

/**
 * ビジュアルリグレッションテスト専用Page Object
 *
 * @description
 * Phaser.jsゲームのビジュアルリグレッションテストを安定して実行するための
 * ヘルパーメソッドを提供する。アニメーション完了待機、スクリーンショット取得、
 * 差分許容設定などを統一的に管理する。
 */
export class VisualRegressionPage extends BasePage {
  /** スクリーンショットのデフォルト許容差分率 */
  private static readonly DEFAULT_MAX_DIFF_PIXEL_RATIO = 0.02;

  /** 動的要素（パーティクル等）の許容差分率 */
  private static readonly DYNAMIC_MAX_DIFF_PIXEL_RATIO = 0.05;

  /** アニメーション安定化のための待機時間（ミリ秒） */
  private static readonly ANIMATION_SETTLE_TIME = 500;

  constructor(page: Page) {
    super(page);
  }

  // =============================================================================
  // アニメーション安定化
  // =============================================================================

  /**
   * アニメーションが完了するまで待機する
   *
   * @param additionalWaitMs - 追加の待機時間（ミリ秒）
   */
  async waitForAnimationSettle(additionalWaitMs = 0): Promise<void> {
    await this.page.waitForTimeout(VisualRegressionPage.ANIMATION_SETTLE_TIME + additionalWaitMs);
  }

  /**
   * 指定シーンでアニメーションが完了するまで待機
   *
   * @param sceneName - 待機するシーン名
   */
  async waitForSceneStable(sceneName: string): Promise<void> {
    await this.waitForScene(sceneName);
    await this.waitForAnimationSettle();
  }

  /**
   * 指定フェーズでアニメーションが完了するまで待機
   *
   * @param phase - 待機するフェーズ名
   */
  async waitForPhaseStable(phase: string): Promise<void> {
    await this.waitForPhase(phase);
    await this.waitForAnimationSettle();
  }

  // =============================================================================
  // スクリーンショット取得
  // =============================================================================

  /**
   * ゲームキャンバスのスクリーンショットを取得し比較する
   *
   * @param name - スクリーンショット名（.pngは自動付加）
   * @param options - スクリーンショットオプション
   */
  async expectCanvasScreenshot(
    name: string,
    options?: {
      maxDiffPixelRatio?: number;
      mask?: Array<{ x: number; y: number; width: number; height: number }>;
    },
  ): Promise<void> {
    const filename = name.endsWith('.png') ? name : `${name}.png`;
    const maxDiff = options?.maxDiffPixelRatio ?? VisualRegressionPage.DEFAULT_MAX_DIFF_PIXEL_RATIO;

    await expect(this.canvas).toHaveScreenshot(filename, {
      maxDiffPixelRatio: maxDiff,
    });
  }

  /**
   * 全画面のスクリーンショットを取得し比較する
   *
   * @param name - スクリーンショット名
   * @param options - スクリーンショットオプション
   */
  async expectFullScreenshot(
    name: string,
    options?: {
      maxDiffPixelRatio?: number;
    },
  ): Promise<void> {
    const filename = name.endsWith('.png') ? name : `${name}.png`;
    const maxDiff = options?.maxDiffPixelRatio ?? VisualRegressionPage.DEFAULT_MAX_DIFF_PIXEL_RATIO;

    await expect(this.page).toHaveScreenshot(filename, {
      maxDiffPixelRatio: maxDiff,
      fullPage: true,
    });
  }

  /**
   * 動的要素を含むスクリーンショットを取得（許容差分大）
   *
   * @param name - スクリーンショット名
   * @description パーティクルやアニメーション中の要素を含む画面用
   */
  async expectDynamicScreenshot(name: string): Promise<void> {
    await this.expectCanvasScreenshot(name, {
      maxDiffPixelRatio: VisualRegressionPage.DYNAMIC_MAX_DIFF_PIXEL_RATIO,
    });
  }

  // =============================================================================
  // シーン別スクリーンショット
  // =============================================================================

  /**
   * タイトル画面のスクリーンショットを取得
   */
  async captureTitleScene(): Promise<void> {
    await this.waitForSceneStable('TitleScene');
    await this.expectCanvasScreenshot('title-scene');
  }

  /**
   * メイン画面（フェーズ指定）のスクリーンショットを取得
   *
   * @param phase - フェーズ名
   */
  async captureMainScenePhase(phase: string): Promise<void> {
    await this.waitForPhaseStable(phase);
    await this.expectCanvasScreenshot(`main-scene-${phase.toLowerCase()}`);
  }

  /**
   * ゲームクリア画面のスクリーンショットを取得
   */
  async captureGameClearScene(): Promise<void> {
    await this.waitForSceneStable('GameClearScene');
    await this.expectCanvasScreenshot('game-clear-scene');
  }

  /**
   * ゲームオーバー画面のスクリーンショットを取得
   */
  async captureGameOverScene(): Promise<void> {
    await this.waitForSceneStable('GameOverScene');
    await this.expectCanvasScreenshot('game-over-scene');
  }

  // =============================================================================
  // 品質別スクリーンショット
  // =============================================================================

  /**
   * 品質D〜Aのアイテム表示をキャプチャ
   *
   * @param quality - 品質（D, C, B, A）
   */
  async captureQualityDisplay(quality: 'D' | 'C' | 'B' | 'A'): Promise<void> {
    await this.waitForAnimationSettle();
    await this.expectCanvasScreenshot(`quality-${quality.toLowerCase()}`);
  }

  /**
   * 品質Sのアイテム表示をキャプチャ（パーティクル含む）
   */
  async captureQualitySDisplay(): Promise<void> {
    await this.waitForAnimationSettle(300); // パーティクル安定化
    await this.expectDynamicScreenshot('quality-s');
  }

  // =============================================================================
  // ビューポート管理
  // =============================================================================

  /**
   * ビューポートサイズを設定
   *
   * @param width - 幅
   * @param height - 高さ
   */
  async setViewport(width: number, height: number): Promise<void> {
    await this.page.setViewportSize({ width, height });
    await this.waitForAnimationSettle();
  }

  /**
   * 標準解像度（1280x720）に設定
   */
  async setStandardViewport(): Promise<void> {
    await this.setViewport(1280, 720);
  }

  /**
   * 最小解像度（960x540）に設定
   */
  async setMinimumViewport(): Promise<void> {
    await this.setViewport(960, 540);
  }

  /**
   * FHD解像度（1920x1080）に設定
   */
  async setFHDViewport(): Promise<void> {
    await this.setViewport(1920, 1080);
  }

  /**
   * 4K解像度（3840x2160）に設定
   */
  async set4KViewport(): Promise<void> {
    await this.setViewport(3840, 2160);
  }

  /**
   * ウルトラワイド（2560x1080）に設定
   */
  async setUltrawideViewport(): Promise<void> {
    await this.setViewport(2560, 1080);
  }

  // =============================================================================
  // 解像度別スクリーンショット
  // =============================================================================

  /**
   * 各解像度でのスクリーンショットを取得
   *
   * @param baseName - ベースファイル名
   */
  async captureMultipleResolutions(baseName: string): Promise<void> {
    const resolutions = [
      { name: 'min', width: 960, height: 540 },
      { name: 'standard', width: 1280, height: 720 },
      { name: 'fhd', width: 1920, height: 1080 },
    ];

    for (const res of resolutions) {
      await this.setViewport(res.width, res.height);
      await this.expectCanvasScreenshot(`${baseName}-${res.name}`);
    }
  }

  // =============================================================================
  // アスペクト比検証
  // =============================================================================

  /**
   * キャンバスのアスペクト比を検証
   *
   * @param expectedRatio - 期待するアスペクト比（width/height）
   * @param tolerance - 許容誤差
   */
  async verifyAspectRatio(expectedRatio = 16 / 9, tolerance = 0.1): Promise<boolean> {
    const boundingBox = await this.canvas.boundingBox();
    if (!boundingBox) return false;

    const actualRatio = boundingBox.width / boundingBox.height;
    return Math.abs(actualRatio - expectedRatio) <= tolerance;
  }

  // =============================================================================
  // デバッグ補助
  // =============================================================================

  /**
   * 乱数シードを固定（実装されている場合）
   *
   * @param seed - 乱数シード
   */
  async setRandomSeed(seed: number): Promise<void> {
    await this.page.evaluate((s) => {
      const win = window as unknown as GameWindow;
      // biome-ignore lint/suspicious/noExplicitAny: 動的プロパティアクセス
      const debug = win.debug as any;
      if (debug?.setRandomSeed) {
        debug.setRandomSeed(s);
      }
    }, seed);
  }

  /**
   * タイムスタンプ表示を非表示にする（実装されている場合）
   */
  async hideTimestamp(): Promise<void> {
    await this.page.evaluate(() => {
      const win = window as unknown as GameWindow;
      // biome-ignore lint/suspicious/noExplicitAny: 動的プロパティアクセス
      const debug = win.debug as any;
      if (debug?.hideTimestamp) {
        debug.hideTimestamp();
      }
    });
  }
}
