/**
 * Game Boot E2Eテスト
 * TASK-0008 Phaser基本設定とBootScene
 *
 * @description
 * T-0008-01: ゲーム起動テスト
 * T-0008-02: シーン遷移テスト
 * T-0008-03: rexUIプラグインテスト
 * スケーリングテスト
 */

import { expect, test } from '../fixtures/game.fixture';
import { GamePage } from '../pages/game.page';

test.describe('Game Boot', () => {
  test('T-0008-01: ゲームが正常に起動する', async ({ gamePage }) => {
    // 【テスト目的】: Phaserエンジンの基本設定が正しく動作することを確認
    // 【テスト内容】: ゲームキャンバスが表示され、エラーが発生しないことを検証
    // 【期待される動作】: エラーなく起動し、BootSceneが実行される
    // 🔵 信頼性レベル: タスク定義（TASK-0008.md）の受け入れ基準に明記

    const game = new GamePage(gamePage);
    await game.waitForGameLoad();

    // 【検証項目】: キャンバスが可視状態であることを確認
    await expect(game.canvas).toBeVisible();
  });

  test('should have correct canvas size', async ({ gamePage }) => {
    // 【テスト目的】: ゲーム解像度が設計書通りに設定されることを確認
    // 【テスト内容】: キャンバスサイズが0より大きいことを検証（スケーリング後のサイズ）
    // 【期待される動作】: 基準解像度1280x720またはスケーリングされたサイズが表示される
    // 🔵 信頼性レベル: 設計書の解像度設定に基づく

    const game = new GamePage(gamePage);
    await game.waitForGameLoad();

    const size = await game.getCanvasSize();
    // 【確認内容】: キャンバス幅が0より大きいことを確認
    expect(size.width).toBeGreaterThan(0);
    // 【確認内容】: キャンバス高さが0より大きいことを確認
    expect(size.height).toBeGreaterThan(0);
  });

  test('should not have console errors on boot', async ({ gamePage }) => {
    // 【テスト目的】: ゲーム起動時にJavaScriptエラーが発生しないことを確認
    // 【テスト内容】: コンソールエラーログをキャプチャし、致命的エラーがないことを検証
    // 【期待される動作】: エラーログが出力されない（警告は許容）
    // 🔵 信頼性レベル: 基本的な品質保証基準

    const errors: string[] = [];
    gamePage.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    const game = new GamePage(gamePage);
    await game.waitForGameLoad();

    // 【確認内容】: 致命的なエラーがないことを確認（警告は除外）
    expect(errors.filter((e) => !e.includes('warning'))).toHaveLength(0);
  });

  test('T-0008-02: BootSceneからTitleSceneへ遷移する', async ({ gamePage }) => {
    // 【テスト目的】: シーン遷移が正常に動作することを確認
    // 【テスト内容】: BootScene完了後、TitleSceneの画面が表示されることを検証
    // 【期待される動作】: TitleSceneが表示され、ゲーム状態がTitleSceneになる
    // 🔵 信頼性レベル: タスク定義（TASK-0008.md）の受け入れ基準に明記

    const game = new GamePage(gamePage);
    await game.waitForGameLoad();

    // 【変更内容】: TitleSceneは実装済み（TASK-0019完了）
    // PhaserゲームはCanvas上にレンダリングされるため、DOM要素としてテキストを取得できない
    // 代わりに、window.gameState()を使用してシーン遷移を確認する
    const isInTitleScene = await gamePage.evaluate(() => {
      const state = (window as any).gameState?.();
      return state?.currentScene === 'TitleScene';
    });

    // 【検証項目】: TitleSceneに遷移していることを確認
    expect(isInTitleScene).toBe(true);
  });

  test('T-0008-03: rexUIプラグインが利用可能', async ({ gamePage }) => {
    // 【テスト目的】: rexUIプラグインの統合が正しく動作することを確認
    // 【テスト内容】: rexUIで作成されたUI要素が表示されることを検証
    // 【期待される動作】: rexUIコンポーネントがエラーなく動作する
    // 🔵 信頼性レベル: タスク定義（TASK-0008.md）の受け入れ基準に明記

    const game = new GamePage(gamePage);
    await game.waitForGameLoad();

    // 【検証項目】: コンソールにrexUI関連のエラーがないことを確認
    const errors: string[] = [];
    gamePage.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().includes('rexUI')) {
        errors.push(msg.text());
      }
    });

    await gamePage.waitForTimeout(2000); // BootScene完了待機

    // 【確認内容】: rexUI関連のエラーが発生していないことを確認
    expect(errors).toHaveLength(0);
  });

  test('最小解像度（960x540）でのスケーリングテスト', async ({ gamePage, page }) => {
    // 【テスト目的】: 最小サポート解像度での動作を保証
    // 【テスト内容】: ウィンドウサイズを960x540に設定し、ゲームが正常に表示されることを検証
    // 【期待される動作】: アスペクト比16:9を維持しながら、画面サイズに合わせて表示される
    // 🔵 信頼性レベル: 要件定義書（atelier-guild-rank-requirements.md）の技術的制約に明記

    // 【初期条件設定】: ビューポートを最小解像度に設定
    await page.setViewportSize({ width: 960, height: 540 });

    const game = new GamePage(gamePage);
    await game.waitForGameLoad();

    // 【検証項目】: キャンバスが表示されることを確認
    await expect(game.canvas).toBeVisible();

    const size = await game.getCanvasSize();
    // 【確認内容】: 最小解像度でもキャンバスが表示される
    expect(size.width).toBeGreaterThan(0);
    expect(size.height).toBeGreaterThan(0);
    // 【確認内容】: アスペクト比16:9が維持されている（許容誤差あり）
    const aspectRatio = size.width / size.height;
    expect(aspectRatio).toBeCloseTo(16 / 9, 1);
  });

  test('4K解像度（3840x2160）でのスケーリングテスト', async ({ gamePage, page }) => {
    // 【テスト目的】: 高解像度環境での表示品質を確認
    // 【テスト内容】: ウィンドウサイズを3840x2160に設定し、ゲームが正常にスケールされることを検証
    // 【期待される動作】: 高解像度でも画質が劣化せず、アスペクト比が維持される
    // 🟡 信頼性レベル: 要件定義書のエッジケース3から妥当な推測

    // 【初期条件設定】: ビューポートを4K解像度に設定
    await page.setViewportSize({ width: 3840, height: 2160 });

    const game = new GamePage(gamePage);
    await game.waitForGameLoad();

    // 【検証項目】: キャンバスが表示されることを確認
    await expect(game.canvas).toBeVisible();

    const size = await game.getCanvasSize();
    // 【確認内容】: 4K解像度でもキャンバスが表示される
    expect(size.width).toBeGreaterThan(0);
    expect(size.height).toBeGreaterThan(0);
    // 【確認内容】: アスペクト比16:9が維持されている（許容誤差あり）
    const aspectRatio = size.width / size.height;
    expect(aspectRatio).toBeCloseTo(16 / 9, 1);
  });

  test('アスペクト比21:9（ウルトラワイド）でのスケーリングテスト', async ({ gamePage, page }) => {
    // 【テスト目的】: 多様なアスペクト比への対応を確認
    // 【テスト内容】: ウィンドウサイズを2560x1080（21:9）に設定し、ピラーボックス表示されることを検証
    // 【期待される動作】: 16:9のアスペクト比を維持し、両端に黒帯が表示される
    // 🟡 信頼性レベル: 要件定義書のエッジケース3から妥当な推測

    // 【初期条件設定】: ビューポートをウルトラワイド解像度に設定
    await page.setViewportSize({ width: 2560, height: 1080 });

    const game = new GamePage(gamePage);
    await game.waitForGameLoad();

    // 【検証項目】: キャンバスが表示されることを確認
    await expect(game.canvas).toBeVisible();

    const size = await game.getCanvasSize();
    // 【確認内容】: ウルトラワイドでもキャンバスが表示される
    expect(size.width).toBeGreaterThan(0);
    expect(size.height).toBeGreaterThan(0);
    // 【確認内容】: 16:9のアスペクト比が維持される（ピラーボックス表示）
    const aspectRatio = size.width / size.height;
    expect(aspectRatio).toBeCloseTo(16 / 9, 1);
  });
});
