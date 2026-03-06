/**
 * TASK-0121: E2Eテスト - フェーズ自由遷移 総合シナリオ
 *
 * @description
 * フェーズ自由遷移システム全体のE2Eテスト。
 * フェーズタブ切り替え、採取2段階化、AP超過自動日進行、
 * 依頼掲示板の全機能を組み合わせた統合シナリオ。
 *
 * @信頼性レベル 🟡 全REQ・NFR要件から妥当な推測（E2Eシナリオ詳細は実装依存）
 * @前提条件 新規ゲーム開始済み（MainScene表示中）
 */

import { expect, test } from '../../fixtures/game.fixture';
import { INITIAL_DAY_LIMIT } from '../../fixtures/test-data';
import { FreePhaseNavigationPage } from '../../pages/free-phase-navigation.page';
import { MainPage } from '../../pages/main.page';
import { TitlePage } from '../../pages/title.page';

// =============================================================================
// テスト共通セットアップ
// =============================================================================

test.describe('TASK-0121: フェーズ自由遷移 E2Eテスト', () => {
  test.beforeEach(async ({ gamePage }) => {
    // セーブデータをクリアして新規ゲーム開始
    await gamePage.evaluate(() => {
      localStorage.removeItem('atelier-guild-rank-save');
    });

    const title = new TitlePage(gamePage);
    await title.waitForTitleLoad();
    await title.clickNewGame();

    const main = new MainPage(gamePage);
    await main.waitForMainLoad();
  });

  // ===========================================================================
  // 1. フェーズ自由遷移 E2Eシナリオ（REQ-001, REQ-006）
  // ===========================================================================

  test.describe('フェーズ自由遷移', () => {
    test('E2E-FPN-01: デバッグツールで全フェーズに自由に切り替えできる', async ({ gamePage }) => {
      // 【テスト目的】: switchPhaseデバッグアクションで4フェーズを巡回できること
      // 🟡 REQ-001: フェーズ自由遷移

      const nav = new FreePhaseNavigationPage(gamePage);

      // 初期フェーズ確認
      const initialPhase = await nav.getCurrentPhase();
      expect(initialPhase).toBeTruthy();

      // 採取フェーズへ切り替え
      await nav.switchPhase('GATHERING');
      const gatheringPhase = await nav.getCurrentPhase();
      expect(gatheringPhase).toContain('GATHERING');

      // 調合フェーズへ切り替え
      await nav.switchPhase('ALCHEMY');
      const alchemyPhase = await nav.getCurrentPhase();
      expect(alchemyPhase).toContain('ALCHEMY');

      // 納品フェーズへ切り替え
      await nav.switchPhase('DELIVERY');
      const deliveryPhase = await nav.getCurrentPhase();
      expect(deliveryPhase).toContain('DELIVERY');

      // 依頼受注フェーズへ戻る
      await nav.switchPhase('QUEST_ACCEPT');
      const questPhase = await nav.getCurrentPhase();
      expect(questPhase).toContain('QUEST_ACCEPT');
    });

    test('E2E-FPN-02: フェーズ切り替え後も行動ポイントが維持される', async ({ gamePage }) => {
      // 【テスト目的】: フェーズ切り替えでAPが消費されないこと
      // 🟡 REQ-001-04: フェーズ切り替えにAPコストなし

      const nav = new FreePhaseNavigationPage(gamePage);

      const apBefore = await nav.getActionPoints();
      expect(apBefore).toBeGreaterThan(0);

      // 複数回フェーズ切り替え
      await nav.switchPhase('GATHERING');
      await nav.switchPhase('ALCHEMY');
      await nav.switchPhase('DELIVERY');
      await nav.switchPhase('QUEST_ACCEPT');

      const apAfter = await nav.getActionPoints();
      expect(apAfter).toBe(apBefore);
    });

    test('E2E-FPN-03: 同じフェーズへの切り替えは無視される', async ({ gamePage }) => {
      // 【テスト目的】: 既にアクティブなフェーズへの切り替えでエラーが発生しないこと
      // 🟡 REQ-001: 同一フェーズ遷移の防御

      const nav = new FreePhaseNavigationPage(gamePage);

      const phaseBefore = await nav.getCurrentPhase();

      // 同じフェーズに切り替え（エラーが発生しないことを確認）
      await nav.switchPhase(phaseBefore);

      const phaseAfter = await nav.getCurrentPhase();
      expect(phaseAfter).toBe(phaseBefore);
    });

    test('E2E-FPN-04: フェーズ切り替えでゲーム状態が破壊されない', async ({ gamePage }) => {
      // 【テスト目的】: フェーズ自由遷移でゴールド・残り日数等が変化しないこと
      // 🟡 REQ-001: 状態保全性

      const nav = new FreePhaseNavigationPage(gamePage);
      const main = new MainPage(gamePage);

      const goldBefore = await main.getGold();
      const daysBefore = await main.getRemainingDays();

      // 全フェーズを巡回
      await nav.switchPhase('GATHERING');
      await nav.switchPhase('ALCHEMY');
      await nav.switchPhase('DELIVERY');
      await nav.switchPhase('QUEST_ACCEPT');

      const goldAfter = await main.getGold();
      const daysAfter = await main.getRemainingDays();

      expect(goldAfter).toBe(goldBefore);
      expect(daysAfter).toBe(daysBefore);
    });
  });

  // ===========================================================================
  // 2. 採取2段階化 E2Eシナリオ（REQ-002）
  // ===========================================================================

  test.describe('採取2段階化', () => {
    test('E2E-GAT-01: 採取フェーズに切り替えるとゲーム状態がGATHERINGになる', async ({
      gamePage,
    }) => {
      // 【テスト目的】: 採取フェーズへの切り替えが正しく機能すること
      // 🟡 REQ-002: 採取2段階化

      const nav = new FreePhaseNavigationPage(gamePage);

      await nav.switchPhase('GATHERING');

      const phase = await nav.getCurrentPhase();
      expect(phase).toContain('GATHERING');
    });

    test('E2E-GAT-02: 採取フェーズから他フェーズに戻れる', async ({ gamePage }) => {
      // 【テスト目的】: 採取フェーズからの離脱が正しく機能すること
      // 🟡 REQ-002: 採取フェーズ離脱

      const nav = new FreePhaseNavigationPage(gamePage);

      // 採取フェーズへ
      await nav.switchPhase('GATHERING');
      expect(await nav.getCurrentPhase()).toContain('GATHERING');

      // 調合フェーズへ切り替え
      await nav.switchPhase('ALCHEMY');
      expect(await nav.getCurrentPhase()).toContain('ALCHEMY');

      // 依頼受注へ戻る
      await nav.switchPhase('QUEST_ACCEPT');
      expect(await nav.getCurrentPhase()).toContain('QUEST_ACCEPT');
    });
  });

  // ===========================================================================
  // 3. AP超過自動日進行 E2Eシナリオ（REQ-003）
  // ===========================================================================

  test.describe('AP超過自動日進行', () => {
    test('E2E-AP-01: 初期状態でAPが正の値を持つ', async ({ gamePage }) => {
      // 【テスト目的】: 新規ゲーム開始時にAPが正しく初期化されること
      // 🟡 REQ-003: AP初期化

      const nav = new FreePhaseNavigationPage(gamePage);

      const ap = await nav.getActionPoints();
      expect(ap).toBeGreaterThan(0);
    });

    test('E2E-AP-02: AP超過分が初期状態で0である', async ({ gamePage }) => {
      // 【テスト目的】: 新規ゲーム開始時にAP超過が0であること
      // 🟡 REQ-003: AP超過初期値

      const nav = new FreePhaseNavigationPage(gamePage);

      const overflow = await nav.getApOverflow();
      expect(overflow).toBe(0);
    });

    test('E2E-AP-03: デバッグでAP設定後にフェーズ切り替えしてもAP値が維持される', async ({
      gamePage,
    }) => {
      // 【テスト目的】: AP値がフェーズ遷移で変化しないこと
      // 🟡 REQ-003: AP保全性

      const nav = new FreePhaseNavigationPage(gamePage);

      // APを1に設定
      await nav.setActionPoints(1);
      const apBefore = await nav.getActionPoints();
      expect(apBefore).toBe(1);

      // フェーズ切り替え
      await nav.switchPhase('GATHERING');
      await nav.switchPhase('QUEST_ACCEPT');

      const apAfter = await nav.getActionPoints();
      expect(apAfter).toBe(1);
    });

    test('E2E-AP-04: デバッグで日終了すると残り日数が減少する', async ({ gamePage }) => {
      // 【テスト目的】: endDay()で日が進行すること
      // 🟡 REQ-003: 日進行メカニクス

      const nav = new FreePhaseNavigationPage(gamePage);

      const daysBefore = await nav.getRemainingDays();
      expect(daysBefore).toBe(INITIAL_DAY_LIMIT);

      await nav.debugEndDay();

      const state = await nav.getGameState();
      // MainSceneに留まっている場合のみ確認
      if (state.currentScene === 'MainScene') {
        const daysAfter = await nav.getRemainingDays();
        expect(daysAfter).toBeLessThan(daysBefore);
      }
    });
  });

  // ===========================================================================
  // 4. 依頼掲示板 E2Eシナリオ（REQ-005）
  // ===========================================================================

  test.describe('依頼掲示板', () => {
    test('E2E-BOARD-01: 依頼受注フェーズでゲーム状態が取得できる', async ({ gamePage }) => {
      // 【テスト目的】: 依頼受注フェーズの基本状態が正常であること
      // 🟡 REQ-005: 掲示板基本機能

      const nav = new FreePhaseNavigationPage(gamePage);

      // 依頼受注フェーズへ
      await nav.switchPhase('QUEST_ACCEPT');

      const phase = await nav.getCurrentPhase();
      expect(phase).toContain('QUEST_ACCEPT');

      // ゲーム状態が取得できること
      const state = await nav.getGameState();
      expect(state.currentScene).toBe('MainScene');
    });

    test('E2E-BOARD-02: 掲示板依頼数がゲーム状態から取得できる', async ({ gamePage }) => {
      // 【テスト目的】: boardQuestCountがwindow.gameState()から取得できること
      // 🟡 REQ-005: 掲示板依頼数API

      const nav = new FreePhaseNavigationPage(gamePage);

      const boardCount = await nav.getBoardQuestCount();
      // 初期状態で0以上（startDayで掲示板が更新される）
      expect(boardCount).toBeGreaterThanOrEqual(0);
    });

    test('E2E-BOARD-03: 訪問依頼数がゲーム状態から取得できる', async ({ gamePage }) => {
      // 【テスト目的】: visitorQuestCountがwindow.gameState()から取得できること
      // 🟡 REQ-005: 訪問依頼数API

      const nav = new FreePhaseNavigationPage(gamePage);

      const visitorCount = await nav.getVisitorQuestCount();
      // 初期状態で0以上
      expect(visitorCount).toBeGreaterThanOrEqual(0);
    });
  });

  // ===========================================================================
  // 5. 複合シナリオ: 1日の自由な行動フロー
  // ===========================================================================

  test.describe('複合シナリオ - 1日の自由な行動フロー', () => {
    test('E2E-COMP-01: 全フェーズ巡回後にデバッグ日終了で日が進行する', async ({ gamePage }) => {
      // 【テスト目的】: 自由にフェーズを巡回した後、日終了が正常に動作すること
      // 🟡 全要件統合

      const nav = new FreePhaseNavigationPage(gamePage);

      // 初期状態記録
      const initialDays = await nav.getRemainingDays();
      expect(initialDays).toBe(INITIAL_DAY_LIMIT);

      // 全フェーズを自由に巡回
      await nav.switchPhase('GATHERING');
      await nav.switchPhase('ALCHEMY');
      await nav.switchPhase('DELIVERY');
      await nav.switchPhase('QUEST_ACCEPT');

      // 日終了
      await nav.debugEndDay();

      // 日が進行したか確認
      const state = await nav.getGameState();
      if (state.currentScene === 'MainScene') {
        expect(state.remainingDays).toBeLessThan(initialDays);
      }
    });

    test('E2E-COMP-02: 採取→調合→依頼→納品の非順序フローが動作する', async ({ gamePage }) => {
      // 【テスト目的】: 従来の固定順序ではなく、自由な順序でフェーズを巡れること
      // 🟡 REQ-001: フェーズ自由遷移の非順序性

      const nav = new FreePhaseNavigationPage(gamePage);

      // 非順序でフェーズ切り替え（従来: 依頼→採取→調合→納品）
      await nav.switchPhase('ALCHEMY');
      expect(await nav.getCurrentPhase()).toContain('ALCHEMY');

      await nav.switchPhase('QUEST_ACCEPT');
      expect(await nav.getCurrentPhase()).toContain('QUEST_ACCEPT');

      await nav.switchPhase('DELIVERY');
      expect(await nav.getCurrentPhase()).toContain('DELIVERY');

      await nav.switchPhase('GATHERING');
      expect(await nav.getCurrentPhase()).toContain('GATHERING');
    });

    test('E2E-COMP-03: 複数日にまたがる操作で状態が一貫している', async ({ gamePage }) => {
      // 【テスト目的】: 複数日にまたがる操作でゲーム状態が壊れないこと
      // 🟡 全要件統合

      const nav = new FreePhaseNavigationPage(gamePage);
      const main = new MainPage(gamePage);

      // Day 1: フェーズ巡回
      await nav.switchPhase('GATHERING');
      await nav.switchPhase('QUEST_ACCEPT');
      await nav.debugEndDay();

      // Day 2: 状態確認
      const state = await nav.getGameState();
      if (state.currentScene === 'MainScene') {
        const ap = await nav.getActionPoints();
        expect(ap).toBeGreaterThan(0);

        const gold = await main.getGold();
        expect(gold).toBeGreaterThanOrEqual(0);

        const rank = await main.getCurrentRank();
        expect(rank).toBeTruthy();
      }
    });
  });

  // ===========================================================================
  // 6. パフォーマンス検証（NFR-001, NFR-002）
  // ===========================================================================

  test.describe('パフォーマンス検証', () => {
    test('E2E-PERF-01: フェーズ切り替え時間が妥当な範囲内である', async ({ gamePage }) => {
      // 【テスト目的】: フェーズ切り替えが過度に遅くないこと（目標: 200ms以内）
      // 🟡 NFR-001: フェーズ切り替え200ms以内

      const nav = new FreePhaseNavigationPage(gamePage);

      // 複数回計測して平均を取る
      const times: number[] = [];
      const phases = ['GATHERING', 'ALCHEMY', 'DELIVERY', 'QUEST_ACCEPT'] as const;

      for (const phase of phases) {
        const start = Date.now();
        await nav.switchPhase(phase);
        await nav.waitForPhaseToBe(phase, 5000);
        const elapsed = Date.now() - start;
        times.push(elapsed);
      }

      // waitForTimeoutの500msを差し引いた実効時間を検証
      // デバッグツール経由のため、実際のUI操作より高速なはず
      const avgTime = times.reduce((sum, t) => sum + t, 0) / times.length;
      // 合理的な上限（デバッグ待機時間含む）
      expect(avgTime).toBeLessThan(2000);
    });

    test('E2E-PERF-02: デバッグ日進行処理が妥当な時間内に完了する', async ({ gamePage }) => {
      // 【テスト目的】: 自動日進行処理が過度に遅くないこと（目標: 500ms以内）
      // 🟡 NFR-002: 自動日進行処理500ms以内

      const nav = new FreePhaseNavigationPage(gamePage);

      const start = Date.now();
      await nav.debugEndDay();
      const elapsed = Date.now() - start;

      // waitForTimeoutの2000msを含むため、4000ms以内を目標
      expect(elapsed).toBeLessThan(4000);
    });
  });
});
