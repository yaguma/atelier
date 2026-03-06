/**
 * ゲームフロー E2Eテスト
 * TASK-0030 E2Eテスト・デバッグ
 *
 * @description
 * T-0030-01: 新規ゲーム開始テスト
 * T-0030-04: ゲームクリアテスト
 * T-0030-05: ゲームオーバーテスト
 *
 * 必須テストケース（Must Have）の実装
 */

import { expect, test } from '../fixtures/game.fixture';
import { INITIAL_DAY_LIMIT } from '../fixtures/test-data';
import { GamePage } from '../pages/game.page';
import { MainPage } from '../pages/main.page';
import { ResultPage } from '../pages/result.page';
import { TitlePage } from '../pages/title.page';

test.describe('ゲームフロー E2E', () => {
  test.describe('新規ゲーム開始', () => {
    test('TC-E2E-001: タイトル画面が正常に表示される', async ({ gamePage }) => {
      // 【テスト目的】: タイトル画面が正しく表示されることを確認
      // 【テスト内容】: タイトル画面の表示を待機し、必要な要素が存在することを検証
      // 【期待される動作】: タイトル画面が表示され、新規ゲームボタンが利用可能
      // 🔴 RED: TitleSceneが未実装のため失敗する

      const title = new TitlePage(gamePage);
      await title.waitForTitleLoad();

      // 【検証項目】: キャンバスが可視状態であることを確認
      await expect(title.canvas).toBeVisible();
    });

    test('TC-E2E-002: 新規ゲーム開始でMainSceneに遷移する', async ({ gamePage }) => {
      // 【テスト目的】: 新規ゲーム開始が正しく動作することを確認
      // 【テスト内容】: 新規ゲームボタンをクリックし、MainSceneに遷移することを検証
      // 【期待される動作】: MainSceneに遷移し、初期状態が設定される
      // 🔴 RED: clickNewGameが未実装のため失敗する

      const title = new TitlePage(gamePage);
      await title.waitForTitleLoad();
      await title.clickNewGame();

      const main = new MainPage(gamePage);
      await main.waitForMainLoad();

      // 【検証項目】: 初期状態が正しく設定されていることを確認
      const rank = await main.getCurrentRank();
      const days = await main.getRemainingDays();
      const gold = await main.getGold();

      // 【確認内容】: 初期ランクがGであることを確認
      expect(rank).toBe('G');
      // 【確認内容】: 初期日数がRANK_CONFIG.G.dayLimitであることを確認
      expect(days).toBe(INITIAL_DAY_LIMIT);
      // 【確認内容】: 初期所持金が100であることを確認
      expect(gold).toBe(100);
    });

    test('TC-E2E-004: セーブデータ存在時のコンティニュー表示', async ({ gamePage }) => {
      // 【テスト目的】: セーブデータ存在時にコンティニューが有効になることを確認
      // 【テスト内容】: セーブデータを作成後、コンティニューボタンの状態を検証
      // 【期待される動作】: コンティニューボタンが有効になる
      // 🔴 RED: セーブ機能との統合が未完了のため失敗する

      // 事前にセーブデータを作成
      await gamePage.evaluate(() => {
        localStorage.setItem(
          'atelier-guild-rank-save',
          JSON.stringify({
            version: 1,
            timestamp: Date.now(),
            state: { remainingDays: 25, gold: 200, currentRank: 'G' },
          }),
        );
      });

      // ページをリロード
      await gamePage.reload();
      await gamePage.waitForSelector('#game-container canvas', { timeout: 10000 });

      const title = new TitlePage(gamePage);
      await title.waitForTitleLoad();

      // 【検証項目】: コンティニューが有効であることを確認
      const continueEnabled = await title.isContinueEnabled();
      expect(continueEnabled).toBe(true);
    });
  });

  test.describe('ゲームクリア', () => {
    test('TC-E2E-040: Sランク到達でゲームクリア', async ({ gamePage }) => {
      // 【テスト目的】: Sランク到達でゲームクリアになることを確認
      // 【テスト内容】: デバッグツールでSランク状態をセットアップし、ゲームクリア画面への遷移を検証
      // 【期待される動作】: ゲームクリア画面が表示される
      // 🔴 RED: デバッグツールが未実装のため失敗する

      const title = new TitlePage(gamePage);
      await title.waitForTitleLoad();
      await title.clickNewGame();

      const main = new MainPage(gamePage);
      await main.waitForMainLoad();

      // デバッグツールでSランクに設定
      await main.setRank('S');

      // ランク昇格条件を満たすための処理
      // 注: 実際の実装では昇格判定が行われる
      await main.endDay();

      // リザルト画面への遷移を確認
      const result = new ResultPage(gamePage);
      await result.waitForResultScreen();

      // 【検証項目】: ゲームクリア状態であることを確認
      const isGameClear = await result.isGameClear();
      expect(isGameClear).toBe(true);
    });

    test('TC-E2E-041: ゲームクリア画面からタイトルへ戻る', async ({ gamePage }) => {
      // 【テスト目的】: ゲームクリア後にタイトルに戻れることを確認
      // 【テスト内容】: ゲームクリア状態でタイトルへ戻るボタンをクリックし、遷移を検証
      // 【期待される動作】: タイトル画面に遷移する
      // 🔴 RED: ResultSceneが未実装のため失敗する

      const title = new TitlePage(gamePage);
      await title.waitForTitleLoad();
      await title.clickNewGame();

      const main = new MainPage(gamePage);
      await main.waitForMainLoad();

      // デバッグツールでSランクに設定
      await main.setRank('S');
      await main.endDay();

      // リザルト画面への遷移を確認
      const result = new ResultPage(gamePage);
      await result.waitForResultScreen();

      // タイトルへ戻る
      await result.returnToTitle();

      // 【検証項目】: タイトル画面に戻ったことを確認
      await title.waitForTitleLoad();
      await expect(title.canvas).toBeVisible();
    });
  });

  test.describe('ゲームオーバー', () => {
    test('TC-E2E-050: 日数切れでゲームオーバー', async ({ gamePage }) => {
      // 【テスト目的】: 日数切れでゲームオーバーになることを確認
      // 【テスト内容】: デバッグツールで残り1日に設定し、日終了後のゲームオーバー画面への遷移を検証
      // 【期待される動作】: ゲームオーバー画面が表示される
      // 🔴 RED: デバッグツールが未実装のため失敗する

      const title = new TitlePage(gamePage);
      await title.waitForTitleLoad();
      await title.clickNewGame();

      const main = new MainPage(gamePage);
      await main.waitForMainLoad();

      // デバッグツールで残り1日に設定（Gランクのまま）
      await main.skipToDay(1);

      // 【検証項目】: 残り日数が1に設定されたことを確認
      const days = await main.getRemainingDays();
      expect(days).toBe(1);

      // 日終了処理を実行
      await main.endDay();

      // リザルト画面への遷移を確認
      const result = new ResultPage(gamePage);
      await result.waitForResultScreen();

      // 【検証項目】: ゲームオーバー状態であることを確認
      const isGameOver = await result.isGameOver();
      expect(isGameOver).toBe(true);
    });

    test('TC-E2E-051: ゲームオーバー画面からタイトルへ戻る', async ({ gamePage }) => {
      // 【テスト目的】: ゲームオーバー後にタイトルに戻れることを確認
      // 【テスト内容】: ゲームオーバー状態でタイトルへ戻るボタンをクリックし、遷移を検証
      // 【期待される動作】: タイトル画面に遷移する
      // 🔴 RED: ResultSceneが未実装のため失敗する

      const title = new TitlePage(gamePage);
      await title.waitForTitleLoad();
      await title.clickNewGame();

      const main = new MainPage(gamePage);
      await main.waitForMainLoad();

      // デバッグツールで残り1日に設定
      await main.skipToDay(1);
      await main.endDay();

      // リザルト画面への遷移を確認
      const result = new ResultPage(gamePage);
      await result.waitForResultScreen();

      // タイトルへ戻る
      await result.returnToTitle();

      // 【検証項目】: タイトル画面に戻ったことを確認
      await title.waitForTitleLoad();
      await expect(title.canvas).toBeVisible();
    });
  });

  test.describe('コンソールエラー監視', () => {
    test('TC-E2E-060: ゲーム起動時のエラー確認', async ({ gamePage }) => {
      // 【テスト目的】: ゲーム起動時にJavaScriptエラーが発生しないことを確認
      // 【テスト内容】: コンソールエラーログをキャプチャし、致命的エラーがないことを検証
      // 【期待される動作】: エラーログが出力されない
      // 🔵 信頼性レベル: 必須条件AC-006

      const errors: string[] = [];
      gamePage.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      const game = new GamePage(gamePage);
      await game.waitForGameLoad();

      // 【確認内容】: 致命的なエラーがないことを確認
      expect(errors.filter((e) => !e.includes('warning'))).toHaveLength(0);
    });
  });
});
