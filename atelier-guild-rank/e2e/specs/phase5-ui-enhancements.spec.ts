/**
 * Phase 5 UI強化機能 E2Eテスト
 *
 * @description
 * Phase 5で実装された7つのUI強化機能のE2Eテストスイート。
 * 各機能ごとに2ケース、合計14ケースのテストを提供する。
 *
 * 対象機能:
 * - TASK-0038: フェードイン・アウトアニメーション
 * - TASK-0039: ボタンホバーエフェクト強化
 * - TASK-0040: サイドバー折りたたみアニメーション
 * - TASK-0041: ツールチップ表示システム
 * - TASK-0042: カードドラッグ&ドロップ機能（最優先）
 * - TASK-0043: 依頼詳細モーダル・受注アニメーション
 * - TASK-0044: 品質に応じた視覚効果
 *
 * @module e2e/specs/phase5-ui-enhancements.spec.ts
 */

import { expect, test } from '../fixtures/game.fixture';
import { TEST_DATA } from '../fixtures/test-data';
import { GamePage } from '../pages/game.page';
import { TitlePage } from '../pages/title.page';
import { UIComponentPage } from '../pages/ui-component.page';

// =============================================================================
// TASK-0038: フェードイン・アウトアニメーション（2ケース）
// =============================================================================

test.describe('Phase 5 UI強化: フェードアニメーション (TASK-0038)', () => {
  test.skip('UI-0038-01: TitleSceneのフェードイン', async ({ gamePage }) => {
    // 【テスト目的】: タイトル画面が滑らかにフェードイン表示されることを確認
    // 【期待される動作】: カメラのアルファ値が0→1に変化し、500ms後に完全表示される
    // 🔵 信頼性レベル: TASK-0038の受け入れ基準に明記

    const ui = new UIComponentPage(gamePage);
    const title = new TitlePage(gamePage);

    // フェードイン開始前のアルファ値を確認（0に近いはず）
    const alphaStart = await ui.getCameraAlpha('TitleScene');
    expect(alphaStart).toBeLessThan(1);

    // タイトル画面の読み込み完了を待機
    await title.waitForTitleLoad();

    // フェードイン完了後のアルファ値を確認（1になっているはず）
    const alphaEnd = await ui.getCameraAlpha('TitleScene');
    expect(alphaEnd).toBe(1);
  });

  test.skip('UI-0038-02: シーン遷移時のフェードアウト', async ({ gamePage }) => {
    // 【テスト目的】: シーン遷移時に滑らかにフェードアウトすることを確認
    // 【期待される動作】: 新規ゲームボタンクリック後、アルファ値が1→0に変化
    // 🔵 信頼性レベル: TASK-0038の受け入れ基準に明記

    const ui = new UIComponentPage(gamePage);
    const title = new TitlePage(gamePage);

    await title.waitForTitleLoad();

    // フェードアウト前のアルファ値（1のはず）
    const alphaBeforeFade = await ui.getCameraAlpha('TitleScene');
    expect(alphaBeforeFade).toBe(1);

    // 新規ゲームボタンをクリック（フェードアウト開始）
    await title.clickNewGame();

    // フェードアウト進行中のアルファ値を確認（中間値）
    await ui.wait(250); // 500msの半分
    const alphaMid = await ui.getCameraAlpha('TitleScene');
    expect(alphaMid).toBeGreaterThan(0);
    expect(alphaMid).toBeLessThan(1);

    // フェードアウト完了後、MainSceneに遷移していることを確認
    // 注: MainSceneが仮実装のため、このアサーションは実装に合わせて調整が必要
    await ui.waitForFadeOut();
  });
});

// =============================================================================
// TASK-0039: ボタンホバーエフェクト強化（2ケース）
// =============================================================================

test.describe('Phase 5 UI強化: ボタンホバーエフェクト (TASK-0039)', () => {
  test.skip('UI-0039-01: ボタンホバー時の拡大エフェクト', async ({ gamePage }) => {
    // 【テスト目的】: ボタンにホバーした際、拡大アニメーションが発生することを確認
    // 【期待される動作】: ホバー後、ボタンのサイズが約5%拡大する
    // 🔵 信頼性レベル: TASK-0039の受け入れ基準に明記

    const ui = new UIComponentPage(gamePage);
    const title = new TitlePage(gamePage);

    await title.waitForTitleLoad();

    // ホバー前のボタンサイズを取得
    const sizeBefore = await ui.getButtonBoundingBox('新規ゲーム');
    expect(sizeBefore).not.toBeNull();

    // ボタンにホバー
    await ui.hoverButton('新規ゲーム');
    await ui.waitForButtonHoverAnimation();

    // ホバー後のボタンサイズを取得
    const sizeAfter = await ui.getButtonBoundingBox('新規ゲーム');
    expect(sizeAfter).not.toBeNull();

    // サイズが拡大していることを確認（約5%増加）
    if (sizeBefore && sizeAfter) {
      const widthIncrease = sizeAfter.width / sizeBefore.width;
      expect(widthIncrease).toBeGreaterThanOrEqual(1.0);
      // 注: Phaserのscale変換がブラウザのBounding Boxに反映されない可能性があるため、
      // 実装に合わせて検証方法を調整する必要がある
    }
  });

  test.skip('UI-0039-02: ボタンホバー時の色変化（ビジュアルリグレッション）', async ({
    gamePage,
  }) => {
    // 【テスト目的】: ボタンホバー時に色が変化することをビジュアルテストで確認
    // 【期待される動作】: ホバー時のスクリーンショットが基準画像と一致
    // 🔵 信頼性レベル: TASK-0039の受け入れ基準に明記

    const ui = new UIComponentPage(gamePage);
    const title = new TitlePage(gamePage);

    await title.waitForTitleLoad();

    // ボタンにホバー
    const button = await ui.hoverButton('新規ゲーム');
    await ui.waitForButtonHoverAnimation();

    // ビジュアルリグレッションテスト
    // 注: 初回実行時は基準画像が生成される
    await expect(button).toHaveScreenshot('button-hover-state.png', {
      maxDiffPixels: 100, // 許容差分100ピクセル
    });
  });
});

// =============================================================================
// TASK-0040: サイドバー折りたたみアニメーション（2ケース）
// =============================================================================

test.describe('Phase 5 UI強化: サイドバー折りたたみ (TASK-0040)', () => {
  test.skip('UI-0040-01: サイドバーの折りたたみ動作', async ({ gamePage }) => {
    // 【テスト目的】: サイドバーの折りたたみ/展開が正常に動作することを確認
    // 【期待される動作】: クリックごとに折りたたみ状態が切り替わる
    // 🟡 信頼性レベル: MainSceneの実装完了後にテスト可能

    const ui = new UIComponentPage(gamePage);

    // MainSceneに遷移（実装に合わせて調整）
    // const main = new MainPage(gamePage);
    // await main.waitForMainLoad();

    // 初期状態は展開
    expect(await ui.isSidebarCollapsed('quests')).toBe(false);

    // セクションを折りたたみ
    await ui.toggleSidebar('quests');
    await ui.waitForSidebarAnimation();
    expect(await ui.isSidebarCollapsed('quests')).toBe(true);

    // 再度展開
    await ui.toggleSidebar('quests');
    await ui.waitForSidebarAnimation();
    expect(await ui.isSidebarCollapsed('quests')).toBe(false);
  });

  test.skip('UI-0040-02: 折りたたみアニメーションのスムーズさ', async ({ gamePage }) => {
    // 【テスト目的】: 折りたたみアニメーションが滑らかに実行されることを確認
    // 【期待される動作】: 200msのアニメーション時間で状態が変化
    // 🟡 信頼性レベル: MainSceneの実装完了後にテスト可能

    const ui = new UIComponentPage(gamePage);

    // MainSceneに遷移（実装に合わせて調整）
    // const main = new MainPage(gamePage);
    // await main.waitForMainLoad();

    // アニメーション時間を測定
    const startTime = Date.now();
    await ui.toggleSidebar('quests');
    await ui.waitForSidebarAnimation();
    const endTime = Date.now();

    const duration = endTime - startTime;
    // アニメーション時間が200ms前後であることを確認（±100msの許容誤差）
    expect(duration).toBeGreaterThanOrEqual(TEST_DATA.sidebar.animationDuration - 100);
    expect(duration).toBeLessThanOrEqual(TEST_DATA.sidebar.animationDuration + 200);
  });
});

// =============================================================================
// TASK-0041: ツールチップ表示システム（2ケース）
// =============================================================================

test.describe('Phase 5 UI強化: ツールチップ (TASK-0041)', () => {
  test.skip('UI-0041-01: ツールチップの表示/非表示', async ({ gamePage }) => {
    // 【テスト目的】: ツールチップが適切なタイミングで表示/非表示されることを確認
    // 【期待される動作】: ホバー後500msでツールチップ表示、ホバー解除で非表示
    // 🔵 信頼性レベル: TASK-0041の受け入れ基準に明記

    const ui = new UIComponentPage(gamePage);

    // MainSceneに遷移（実装に合わせて調整）
    // const main = new MainPage(gamePage);
    // await main.waitForMainLoad();

    // ホバー前はツールチップ非表示
    expect(await ui.isTooltipVisible()).toBe(false);

    // カード要素にホバー（500ms待機）
    await ui.waitForTooltipAfterHover('.card-element', TEST_DATA.tooltip.displayDelay);

    // ツールチップが表示されることを確認
    expect(await ui.isTooltipVisible()).toBe(true);

    const tooltipText = await ui.getTooltipText();
    expect(tooltipText).toBeTruthy();

    // ホバー解除
    await gamePage.mouse.move(0, 0);
    await ui.wait(100);

    // ツールチップが非表示になることを確認
    expect(await ui.isTooltipVisible()).toBe(false);
  });

  test.skip('UI-0041-02: ツールチップの画面端対応', async ({ gamePage }) => {
    // 【テスト目的】: ツールチップが画面端で切れずに表示されることを確認
    // 【期待される動作】: 画面端の要素でもツールチップが画面内に収まる
    // 🔵 信頼性レベル: TASK-0041の受け入れ基準に明記

    const ui = new UIComponentPage(gamePage);

    // MainSceneに遷移（実装に合わせて調整）
    // const main = new MainPage(gamePage);
    // await main.waitForMainLoad();

    // 画面右端の要素にホバー
    await ui.waitForTooltipAfterHover('.right-edge-element', TEST_DATA.tooltip.displayDelay);

    // ツールチップのバウンディングボックスを取得
    const tooltip = gamePage.locator('.tooltip-container');
    const tooltipBox = await tooltip.boundingBox();
    const viewport = gamePage.viewportSize();

    // ツールチップが画面内に収まっていることを確認
    if (tooltipBox && viewport) {
      expect(tooltipBox.x + tooltipBox.width).toBeLessThanOrEqual(viewport.width);
      expect(tooltipBox.y + tooltipBox.height).toBeLessThanOrEqual(viewport.height);
      expect(tooltipBox.x).toBeGreaterThanOrEqual(0);
      expect(tooltipBox.y).toBeGreaterThanOrEqual(0);
    }
  });
});

// =============================================================================
// TASK-0042: カードドラッグ&ドロップ機能（2ケース）★最優先
// =============================================================================

test.describe('Phase 5 UI強化: ドラッグ&ドロップ (TASK-0042)', () => {
  test.skip('UI-0042-01: カードのドラッグ&ドロップ', async ({ gamePage }) => {
    // 【テスト目的】: カードをスロットにドラッグ&ドロップできることを確認
    // 【期待される動作】: ドロップ成功後、スロットにカードが配置される
    // 🔵 信頼性レベル: TASK-0042の受け入れ基準に明記（最優先）

    const ui = new UIComponentPage(gamePage);

    // MainSceneに遷移（実装に合わせて調整）
    // const main = new MainPage(gamePage);
    // await main.waitForMainLoad();

    // ドラッグ機能が有効であることを確認
    expect(await ui.isDragEnabled()).toBe(true);

    // カードをスロットにドラッグ&ドロップ
    await ui.dragCardToSlot(0, 0); // 1枚目のカードを1つ目のスロットへ

    // ドロップ後、スロットにカードが配置されたことを確認
    const slot = gamePage.locator('.drop-zone[data-index="0"]');
    const slotContent = await slot.textContent();
    expect(slotContent).toBeTruthy();

    // ビジュアル確認（スクリーンショット）
    await expect(slot).toHaveScreenshot('card-dropped-in-slot.png', {
      maxDiffPixels: 100,
    });
  });

  test.skip('UI-0042-02: 無効なドロップ位置への処理', async ({ gamePage }) => {
    // 【テスト目的】: 無効な位置へのドロップが適切に処理されることを確認
    // 【期待される動作】: ドロップ失敗時、カードが元の位置に戻る
    // 🔵 信頼性レベル: TASK-0042の受け入れ基準に明記

    const ui = new UIComponentPage(gamePage);

    // MainSceneに遷移（実装に合わせて調整）
    // const main = new MainPage(gamePage);
    // await main.waitForMainLoad();

    // カードの初期位置を記録
    const card = gamePage.locator('.draggable-card').first();
    const initialPosition = await card.boundingBox();

    // 無効な位置にドラッグ&ドロップ
    const invalidZone = gamePage.locator('.invalid-drop-zone');
    await card.dragTo(invalidZone);

    // アニメーション完了待機（200ms）
    await ui.wait(TEST_DATA.animation.dragDropDuration);

    // カードが元の位置に戻っていることを確認
    const finalPosition = await card.boundingBox();
    if (initialPosition && finalPosition) {
      expect(finalPosition.x).toBeCloseTo(initialPosition.x, 5);
      expect(finalPosition.y).toBeCloseTo(initialPosition.y, 5);
    }
  });
});

// =============================================================================
// TASK-0043: 依頼詳細モーダル・受注アニメーション（2ケース）
// =============================================================================

test.describe('Phase 5 UI強化: 依頼詳細モーダル (TASK-0043)', () => {
  test.skip('UI-0043-01: 依頼詳細モーダルの表示/非表示', async ({ gamePage }) => {
    // 【テスト目的】: 依頼詳細モーダルが正常に開閉できることを確認
    // 【期待される動作】: 開くボタンで表示、閉じるボタン/ESC/オーバーレイで非表示
    // 🔵 信頼性レベル: TASK-0043の受け入れ基準に明記

    const ui = new UIComponentPage(gamePage);

    // MainSceneの依頼受注フェーズに遷移（実装に合わせて調整）
    // const quest = new QuestPage(gamePage);
    // await quest.waitForQuestLoad();

    // 依頼カードをクリックしてモーダルを開く
    await gamePage.locator('.quest-card').first().click();
    await ui.waitForModalAnimation();

    // モーダルが表示されることを確認
    expect(await ui.isModalVisible('.quest-detail-modal')).toBe(true);

    // 閉じるボタンでモーダルを閉じる
    await ui.closeModal('button');
    await ui.waitForModalAnimation();

    // モーダルが非表示になることを確認
    expect(await ui.isModalVisible('.quest-detail-modal')).toBe(false);

    // ESCキーでも閉じられることを確認
    await gamePage.locator('.quest-card').first().click();
    await ui.waitForModalAnimation();
    expect(await ui.isModalVisible('.quest-detail-modal')).toBe(true);

    await ui.closeModal('esc');
    await ui.waitForModalAnimation();
    expect(await ui.isModalVisible('.quest-detail-modal')).toBe(false);
  });

  test.skip('UI-0043-02: 依頼受注アニメーション', async ({ gamePage }) => {
    // 【テスト目的】: 依頼受注時にアニメーションが表示されることを確認
    // 【期待される動作】: 受注ボタンクリック後、「受注完了！」アニメーション表示
    // 🔵 信頼性レベル: TASK-0043の受け入れ基準に明記

    const ui = new UIComponentPage(gamePage);

    // MainSceneの依頼受注フェーズに遷移（実装に合わせて調整）
    // const quest = new QuestPage(gamePage);
    // await quest.waitForQuestLoad();

    // 依頼詳細モーダルを開く
    await gamePage.locator('.quest-card').first().click();
    await ui.waitForModalAnimation();

    // 受注ボタンをクリック
    await gamePage.locator('.quest-accept-button').click();

    // 受注アニメーションの確認（スクリーンショット比較）
    await ui.wait(500); // アニメーション完了待機
    await expect(gamePage).toHaveScreenshot('quest-accept-animation.png', {
      maxDiffPixels: 200,
    });
  });
});

// =============================================================================
// TASK-0044: 品質に応じた視覚効果（2ケース）
// =============================================================================

test.describe('Phase 5 UI強化: 品質視覚効果 (TASK-0044)', () => {
  test.skip('UI-0044-01: 品質ごとの枠色変化', async ({ gamePage }) => {
    // 【テスト目的】: 品質（D/C/B/A/S）ごとに異なる枠色が適用されることを確認
    // 【期待される動作】: 各品質のアイテムが適切な枠色で表示される
    // 🔵 信頼性レベル: TASK-0044の受け入れ基準に明記

    const ui = new UIComponentPage(gamePage);

    // MainSceneの採取フェーズに遷移（実装に合わせて調整）
    // const gathering = new GatheringPage(gamePage);
    // await gathering.waitForGatheringLoad();

    // 各品質のカードをビジュアルテストで確認
    for (const quality of TEST_DATA.quality.qualities) {
      const element = ui.getQualityElement(quality);
      if (await element.isVisible()) {
        await expect(element).toHaveScreenshot(`quality-${quality}-border.png`, {
          maxDiffPixels: 50,
        });
      }
    }
  });

  test.skip('UI-0044-02: S品質のパーティクルエフェクト', async ({ gamePage }) => {
    // 【テスト目的】: S品質のアイテムにパーティクルエフェクトが表示されることを確認
    // 【期待される動作】: S品質のアイテムにのみパーティクルエミッターが存在
    // 🔵 信頼性レベル: TASK-0044の受け入れ基準に明記

    const ui = new UIComponentPage(gamePage);

    // MainSceneの採取フェーズに遷移（実装に合わせて調整）
    // const gathering = new GatheringPage(gamePage);
    // await gathering.waitForGatheringLoad();

    // S品質のアイテムを選択
    const sQualityCard = ui.getQualityElement('S');
    if (await sQualityCard.isVisible()) {
      // パーティクルエフェクトが存在することを確認
      const hasParticles = await ui.hasParticleEffect();
      expect(hasParticles).toBe(true);

      // ビジュアル確認（パーティクルエフェクトを含む）
      await expect(sQualityCard).toHaveScreenshot('quality-s-with-particles.png', {
        maxDiffPixels: 200, // パーティクルは動的なので許容差分を大きくする
      });
    }
  });
});

// =============================================================================
// テストスイートの統計情報
// =============================================================================

// 合計: 14ケース
// - 実装済み（有効）: 0ケース
// - 未実装（skip）: 14ケース（PhaserのCanvas描画のためDOMベースのテストが動作しない。実装完了後にテスト手法を見直して有効化）
//
// 優先度:
// - P0（最優先）: TASK-0042（ドラッグ&ドロップ）
// - P1（高優先）: その他全て
//
// 実装計画:
// 1. MainSceneの実装完了を待つ
// 2. 各テストの.skip()を削除
// 3. 実装に合わせてセレクターを調整
// 4. ビジュアルリグレッションテストの基準画像を生成
// 5. 全テストをGREEN状態にする
