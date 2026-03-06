/**
 * クリティカルパス E2Eテスト
 *
 * @description
 * ゲーム全体の最も重要なユーザージャーニーをテストする。
 * 新規ゲーム開始からゲームクリア/オーバーまでの完全なフローを検証。
 *
 * テストケース:
 * - CRITICAL-001: 新規ゲーム → Sランク到達 → ゲームクリア
 * - CRITICAL-002: ゲームオーバーフロー
 * - CRITICAL-003: セーブ/ロード機能
 *
 * @module e2e/specs/critical-path.spec.ts
 */

import { expect, test } from '../fixtures/game.fixture';
import { INITIAL_DAY_LIMIT } from '../fixtures/test-data';
import { AlchemyPage } from '../pages/alchemy.page';
import { DeliveryPage } from '../pages/delivery.page';
import { GamePage } from '../pages/game.page';
import { GatheringPage } from '../pages/gathering.page';
import { MainPage } from '../pages/main.page';
import { QuestPage } from '../pages/quest.page';
import { ResultPage } from '../pages/result.page';
import { TitlePage } from '../pages/title.page';

// =============================================================================
// CRITICAL-001: 新規ゲーム → Sランク到達 → ゲームクリア
// =============================================================================

test.describe('クリティカルパス: 完全なゲームプレイ', () => {
  test.skip('CRITICAL-001: 新規ゲーム → Sランク到達 → ゲームクリア', async ({ gamePage }) => {
    // 【テスト目的】: ゲーム開始からクリアまでの完全なフローを確認
    // 【期待される動作】: 全フェーズが正常に動作し、Sランク到達でクリア
    // 🔵 信頼性レベル: ゲーム設計文書の中核フロー

    // ========== 1. ゲーム起動 ==========
    const game = new GamePage(gamePage);
    await game.waitForGameLoad();

    // ========== 2. タイトル画面 ==========
    const title = new TitlePage(gamePage);
    await title.waitForTitleLoad();
    await expect(title.canvas).toBeVisible();

    // ========== 3. 新規ゲーム開始 ==========
    await title.clickNewGame();

    const main = new MainPage(gamePage);
    await main.waitForMainLoad();

    // 初期状態確認
    expect(await main.getCurrentRank()).toBe('G');
    expect(await main.getRemainingDays()).toBe(INITIAL_DAY_LIMIT);
    expect(await main.getGold()).toBe(100);

    // ========== 4. ゲームループ（デバッグツールで高速化）==========
    // Sランク到達まで状態を進める
    await main.setRank('A');
    await main.addGold(10000);

    // ========== 5. 依頼受注フェーズ ==========
    const quest = new QuestPage(gamePage);
    await quest.waitForQuestLoad();

    const quests = await quest.getAvailableQuests();
    expect(quests.length).toBeGreaterThan(0);

    // 1つ目の依頼を受注
    await quest.openQuestDetail(quests[0]);
    await quest.acceptQuest();

    // ========== 6. 採取フェーズ ==========
    const gathering = new GatheringPage(gamePage);
    await gathering.waitForGatheringLoad();

    // ドラフトピック（3回）
    const pickCount = 3;
    for (let i = 0; i < pickCount; i++) {
      const cardCount = await gathering.getDraftCardCount();
      if (cardCount > 0) {
        await gathering.selectDraftCard(0); // 常に最初のカードを選択
        await gamePage.waitForTimeout(200); // アニメーション待機
      }
    }

    await gathering.endGatheringPhase();

    // ========== 7. 調合フェーズ ==========
    const alchemy = new AlchemyPage(gamePage);
    await alchemy.waitForAlchemyLoad();

    // レシピを選択
    const recipes = await alchemy.getRecipeList();
    if (recipes.length > 0) {
      await alchemy.selectRecipe(recipes[0]);
    }

    // 素材をスロットに配置（実装に合わせて調整）
    // await alchemy.selectMaterial(0, 'material-001');
    // await alchemy.selectMaterial(1, 'material-002');

    // 調合実行
    await alchemy.synthesize();

    const quality = await alchemy.getResultQuality();
    expect(['C', 'B', 'A', 'S']).toContain(quality);

    await alchemy.closeResult();
    await alchemy.endAlchemyPhase();

    // ========== 8. 納品フェーズ ==========
    const delivery = new DeliveryPage(gamePage);
    await delivery.waitForDeliveryLoad();

    const deliverableQuests = await delivery.getDeliverableQuests();
    if (deliverableQuests.length > 0) {
      await delivery.selectQuestForDelivery(deliverableQuests[0]);

      // 納品可能なアイテムを選択（実装に合わせて調整）
      // await delivery.selectItemForDelivery('item-001');

      await delivery.deliverItem();

      const reward = await delivery.getReward();
      expect(reward.gold).toBeGreaterThan(0);
      expect(reward.contribution).toBeGreaterThan(0);

      await delivery.closeRewardDisplay();
    }

    // ========== 9. Sランク昇格 ==========
    await main.setRank('S');

    // ========== 10. ゲームクリア確認 ==========
    // 一日を終える
    await delivery.endDay();

    const result = new ResultPage(gamePage);
    await result.waitForResultScreen();

    const isGameClear = await result.isGameClear();
    expect(isGameClear).toBe(true);

    // ========== 11. タイトルへ戻る ==========
    await result.returnToTitle();
    await title.waitForTitleLoad();
  });
});

// =============================================================================
// CRITICAL-002: ゲームオーバーフロー
// =============================================================================

test.describe('クリティカルパス: ゲームオーバー', () => {
  test.skip('CRITICAL-002: ゲームオーバーフロー', async ({ gamePage }) => {
    // 【テスト目的】: 残り日数0でゲームオーバーになることを確認
    // 【期待される動作】: Gランクのまま日数が尽きるとゲームオーバー
    // 🔵 信頼性レベル: ゲーム設計文書の終了条件

    const title = new TitlePage(gamePage);
    await title.waitForTitleLoad();
    await title.clickNewGame();

    const main = new MainPage(gamePage);
    await main.waitForMainLoad();

    // デバッグツールで最終日に設定
    await main.skipToDay(1);
    expect(await main.getRemainingDays()).toBe(1);

    // 現在のランクを確認（Gランク）
    const rank = await main.getCurrentRank();
    expect(rank).toBe('G');

    // 依頼受注フェーズをスキップ
    const quest = new QuestPage(gamePage);
    await quest.waitForQuestLoad();
    await quest.endQuestPhase();

    // 採取フェーズをスキップ
    const gathering = new GatheringPage(gamePage);
    await gathering.waitForGatheringLoad();
    await gathering.skipGatheringPhase();

    // 調合フェーズをスキップ
    const alchemy = new AlchemyPage(gamePage);
    await alchemy.waitForAlchemyLoad();
    await alchemy.skipAlchemyPhase();

    // 納品フェーズで日を終える
    const delivery = new DeliveryPage(gamePage);
    await delivery.waitForDeliveryLoad();
    await delivery.endDay();

    // ========== ゲームオーバー確認 ==========
    const result = new ResultPage(gamePage);
    await result.waitForResultScreen();

    const isGameOver = await result.isGameOver();
    expect(isGameOver).toBe(true);

    // スコア表示確認
    const hasScore = await result.hasScoreDisplay();
    expect(hasScore).toBe(true);

    // タイトルへ戻る
    await result.returnToTitle();
    await title.waitForTitleLoad();
  });
});

// =============================================================================
// CRITICAL-003: セーブ/ロード機能
// =============================================================================

test.describe('クリティカルパス: セーブ/ロード', () => {
  test.skip('CRITICAL-003: セーブ/ロード機能', async ({ gamePage }) => {
    // 【テスト目的】: セーブデータの保存と復元が正常に動作することを確認
    // 【期待される動作】: ゲーム状態が正確に保存・復元される
    // 🔵 信頼性レベル: 設計文書のセーブデータ仕様

    // ========== 新規ゲーム開始 ==========
    const title = new TitlePage(gamePage);
    await title.waitForTitleLoad();
    await title.clickNewGame();

    const main = new MainPage(gamePage);
    await main.waitForMainLoad();

    // ========== ゲーム進行 ==========
    // ゴールドを追加
    await main.addGold(500);
    const goldBefore = await main.getGold();
    const rankBefore = await main.getCurrentRank();
    const daysBefore = await main.getRemainingDays();

    expect(goldBefore).toBeGreaterThan(100); // 初期値100より多い

    // ========== ページリロード（自動セーブされているはず）==========
    await gamePage.reload();
    await gamePage.waitForSelector('#game-container canvas', { timeout: 10000 });

    // ========== コンティニュー ==========
    const titleAfter = new TitlePage(gamePage);
    await titleAfter.waitForTitleLoad();

    // コンティニューが有効であることを確認
    expect(await titleAfter.isContinueEnabled()).toBe(true);

    await titleAfter.clickContinue();

    // ========== データが復元されていることを確認 ==========
    const mainAfter = new MainPage(gamePage);
    await mainAfter.waitForMainLoad();

    const goldAfter = await mainAfter.getGold();
    const rankAfter = await mainAfter.getCurrentRank();
    const daysAfter = await mainAfter.getRemainingDays();

    // 全ての値が復元されていることを確認
    expect(goldAfter).toBe(goldBefore);
    expect(rankAfter).toBe(rankBefore);
    expect(daysAfter).toBe(daysBefore);
  });
});

// =============================================================================
// テストスイートの統計情報
// =============================================================================

// 合計: 3ケース（全てMainScene実装後に有効化）
// - CRITICAL-001: 完全なゲームプレイフロー（最優先）
// - CRITICAL-002: ゲームオーバー条件
// - CRITICAL-003: セーブ/ロード機能
//
// これらのテストは、ゲームの中核機能を検証する最も重要なテストケース。
// 全てのテストがGREENになることで、ゲームの基本的な動作が保証される。
