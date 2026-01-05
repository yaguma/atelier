# Phase 5: 統合・E2Eテスト

**フェーズ期間**: 約8日（64時間）
**タスク数**: 8タスク（TASK-0136 〜 TASK-0143）
**目標**: 全レイヤー統合とエンドツーエンドテストによる品質保証
**成果物**: E2Eテスト環境、全ユーザーフローのテストスペック、CI/CD統合

---

## フェーズ概要

全レイヤーを統合し、エンドツーエンド（E2E）テストを実施する。
ユーザーの実際の操作フローに基づいたテストを作成し、
ゲーム全体の動作を検証する。

---

## 週次計画

### Week 1（TASK-0136〜0139）
- **目標**: E2E基盤構築と基本フローのテスト
- **成果物**:
  - E2Eテスト環境（Playwright）
  - Page Object Model
  - タイトル→ゲーム開始E2E
  - 1ターンサイクルE2E
  - ショップ購入E2E

### Week 2（TASK-0140〜0143）
- **目標**: ゲーム終了条件とデータ永続化のテスト
- **成果物**:
  - 昇格試験E2E
  - ゲームクリアE2E
  - ゲームオーバーE2E
  - セーブ・ロードE2E

---

## タスク詳細

### TASK-0136: E2Eテスト環境構築 🔵

- [x] タスク完了

**要件名**: アトリエギルドランク HTML版
**GitHub Issue**: #TBD
**種別**: DIRECT
**推定時間**: 8時間
**依存**: TASK-0135
**設計参照**: なし（技術的タスク）

#### 実装内容

- Playwright または Cypress のセットアップ
- テストユーティリティ作成
- CI/CD パイプラインへの統合
- テストデータのセットアップ/クリーンアップ

#### ディレクトリ構成

```
tests/
├── e2e/
│   ├── fixtures/           # テストデータ
│   ├── pages/              # Page Object Model
│   │   ├── TitlePage.ts
│   │   ├── MainPage.ts
│   │   ├── ShopPage.ts
│   │   ├── RankUpPage.ts
│   │   └── ResultPage.ts
│   ├── specs/              # テストスペック
│   │   ├── new-game.spec.ts
│   │   ├── game-cycle.spec.ts
│   │   ├── shop.spec.ts
│   │   ├── rank-up.spec.ts
│   │   ├── game-clear.spec.ts
│   │   ├── game-over.spec.ts
│   │   └── save-load.spec.ts
│   └── support/            # ヘルパー関数
└── playwright.config.ts    # または cypress.config.ts
```

#### 受け入れ基準

- [x] E2Eテストフレームワークがセットアップされている
- [x] Page Object Modelが実装されている
- [x] サンプルテストが通過する
- [x] CIでテストが実行できる

#### 完了条件

- Playwrightがセットアップされ、サンプルテストが実行できる
- Page Object Modelが実装されている
- テストユーティリティが作成されている
- CI/CDパイプラインでテストが実行できる

---

### TASK-0137: タイトル→ゲーム開始E2E 🔵

- [x] タスク完了

**要件名**: アトリエギルドランク HTML版
**GitHub Issue**: #TBD
**種別**: TDD
**推定時間**: 8時間
**依存**: TASK-0136, TASK-0122
**設計参照**: [ui-design/screens/title.md](../design/atelier-guild-rank/ui-design/screens/title.md)

#### テストシナリオ

```typescript
describe('New Game Flow', () => {
  it('タイトル画面から新規ゲームを開始できる', async () => {
    // Given: タイトル画面が表示されている
    await page.goto('/');
    await expect(page.locator('.title-logo')).toBeVisible();

    // When: 「はじめから」ボタンをクリック
    await page.click('button:has-text("はじめから")');

    // Then: メイン画面に遷移し、初期状態が設定されている
    await expect(page.locator('.main-screen')).toBeVisible();
    await expect(page.locator('.rank-display')).toHaveText('G');
    await expect(page.locator('.gold-display')).toHaveText('100G');
  });

  it('セーブデータがある場合「つづきから」が有効', async () => {
    // Given: セーブデータが存在する
    await setupSaveData();
    await page.goto('/');

    // When & Then: 「つづきから」ボタンが有効
    await expect(page.locator('button:has-text("つづきから")')).toBeEnabled();
  });

  it('セーブデータがない場合「つづきから」が無効', async () => {
    // Given: セーブデータが存在しない
    await clearSaveData();
    await page.goto('/');

    // When & Then: 「つづきから」ボタンが無効
    await expect(page.locator('button:has-text("つづきから")')).toBeDisabled();
  });
});
```

#### 受け入れ基準

- [x] 全テストシナリオが通過する
- [x] 新規ゲーム開始フローが正しく動作する

#### 完了条件

- タイトル画面→新規ゲーム開始のE2Eテストが実装されている
- セーブデータ有無による「つづきから」ボタンの状態テストが通過する
- 全テストシナリオが通過する

---

### TASK-0138: 1ターンサイクルE2E 🔵

- [x] タスク完了

**要件名**: アトリエギルドランク HTML版
**GitHub Issue**: #TBD
**種別**: TDD
**推定時間**: 8時間
**依存**: TASK-0136, TASK-0128
**設計参照**: [game-mechanics.md](../design/atelier-guild-rank/game-mechanics.md)

#### テストシナリオ

```typescript
describe('One Turn Cycle', () => {
  beforeEach(async () => {
    await startNewGame();
  });

  it('依頼受注→採取→調合→納品の1ターンを完了できる', async () => {
    // Phase 1: 依頼受注
    await expect(page.locator('.phase-indicator')).toHaveText('依頼受注');
    await page.click('.quest-card:first-child');
    await page.click('button:has-text("受注")');
    await page.click('button:has-text("次のフェーズへ")');

    // Phase 2: ドラフト採取
    await expect(page.locator('.phase-indicator')).toHaveText('採取');
    for (let round = 0; round < 3; round++) {
      await page.click('.draft-card:first-child');
      await page.click('button:has-text("採取")');
    }

    // Phase 3: 調合
    await expect(page.locator('.phase-indicator')).toHaveText('調合');
    await page.click('.recipe-card:first-child');
    await page.click('button:has-text("調合")');
    await page.click('button:has-text("次のフェーズへ")');

    // Phase 4: 納品
    await expect(page.locator('.phase-indicator')).toHaveText('納品');
    await page.click('.active-quest:first-child');
    await page.click('button:has-text("納品")');

    // 報酬獲得を確認
    await expect(page.locator('.reward-popup')).toBeVisible();
    await page.click('button:has-text("OK")');

    // 日数経過
    await page.click('button:has-text("1日を終える")');

    // 次の日に進んでいることを確認
    await expect(page.locator('.phase-indicator')).toHaveText('依頼受注');
  });

  it('フェーズをスキップできる', async () => {
    // 依頼を受注せずに次へ
    await page.click('button:has-text("次のフェーズへ")');
    await expect(page.locator('.phase-indicator')).toHaveText('採取');
  });
});
```

#### 受け入れ基準

- [x] 全テストシナリオが通過する
- [x] 1ターンのゲームサイクルが正しく動作する

#### 完了条件

- 依頼受注→採取→調合→納品の1ターンサイクルE2Eテストが実装されている
- フェーズスキップのE2Eテストが通過する
- 全テストシナリオが通過する

---

### TASK-0139: ショップ購入E2E 🔵

- [x] タスク完了

**要件名**: アトリエギルドランク HTML版
**GitHub Issue**: #TBD
**種別**: TDD
**推定時間**: 8時間
**依存**: TASK-0136, TASK-0129
**設計参照**: [ui-design/screens/shop.md](../design/atelier-guild-rank/ui-design/screens/shop.md)

#### テストシナリオ

```typescript
describe('Shop Purchase Flow', () => {
  beforeEach(async () => {
    await startNewGameWithGold(200);
  });

  it('カードを購入してデッキに追加できる', async () => {
    // Given: 初期デッキ枚数を記録
    const initialDeckCount = await getDeckCount();

    // When: ショップでカードを購入
    await page.click('button:has-text("ショップ")');
    await page.click('.category-tab:has-text("カード")');
    await page.click('.shop-item:first-child');
    await page.click('button:has-text("購入")');
    await page.click('button:has-text("確定")');
    await page.click('button:has-text("戻る")');

    // Then: デッキに追加されている
    const newDeckCount = await getDeckCount();
    expect(newDeckCount).toBe(initialDeckCount + 1);
  });

  it('ゴールド不足で購入できない', async () => {
    await startNewGameWithGold(10); // 少ないゴールド

    await page.click('button:has-text("ショップ")');
    await page.click('.shop-item:first-child');

    // 購入ボタンが無効
    await expect(page.locator('button:has-text("購入")')).toBeDisabled();
  });

  it('購入で行動ポイントが消費される', async () => {
    const initialAP = await getActionPoints();

    await page.click('button:has-text("ショップ")');
    await page.click('.shop-item:first-child');
    await page.click('button:has-text("購入")');
    await page.click('button:has-text("確定")');
    await page.click('button:has-text("戻る")');

    const newAP = await getActionPoints();
    expect(newAP).toBe(initialAP - 1);
  });
});
```

#### 受け入れ基準

- [x] 全テストシナリオが通過する
- [x] ショップ購入フローが正しく動作する

#### 完了条件

- ショップでのカード購入E2Eテストが実装されている
- ゴールド不足時の購入不可E2Eテストが通過する
- 行動ポイント消費のE2Eテストが通過する
- 全テストシナリオが通過する

---

### TASK-0140: 昇格試験E2E 🔵

- [ ] タスク完了

**要件名**: アトリエギルドランク HTML版
**GitHub Issue**: #TBD
**種別**: TDD
**推定時間**: 8時間
**依存**: TASK-0136, TASK-0130
**設計参照**: [ui-design/screens/rank-up.md](../design/atelier-guild-rank/ui-design/screens/rank-up.md)

#### テストシナリオ

```typescript
describe('Promotion Test Flow', () => {
  beforeEach(async () => {
    await setupGameStateNearPromotion(); // 昇格ゲージが満タン近く
  });

  it('昇格試験を開始し、クリアしてランクアップできる', async () => {
    // Given: 昇格ゲージを満タンにする
    await fillPromotionGauge();

    // When: 昇格試験が開始される
    await expect(page.locator('.rank-up-screen')).toBeVisible();
    await expect(page.locator('.test-task')).toContainText('回復薬 ×2');

    // 試験を開始
    await page.click('button:has-text("試験を開始する")');

    // 課題をクリア（回復薬を2つ調合して納品）
    await completePromotionTestTasks();

    // Then: ランクアップ画面が表示される
    await expect(page.locator('.rank-up-success')).toBeVisible();
    await expect(page.locator('.new-rank')).toHaveText('F');

    // アーティファクトを選択
    await page.click('.artifact-choice:first-child');
    await page.click('button:has-text("選択")');

    // メイン画面に戻る
    await expect(page.locator('.main-screen')).toBeVisible();
    await expect(page.locator('.rank-display')).toHaveText('F');
  });

  it('昇格試験に失敗するとゲームオーバー', async () => {
    await fillPromotionGauge();
    await page.click('button:has-text("試験を開始する")');

    // 日数を消費して制限日数を超過
    await advanceDaysWithoutCompletingTest(6);

    // ゲームオーバー画面が表示される
    await expect(page.locator('.game-over-screen')).toBeVisible();
    await expect(page.locator('.game-over-reason')).toContainText('昇格試験失敗');
  });
});
```

#### 受け入れ基準

- [ ] 全テストシナリオが通過する
- [ ] 昇格試験フローが正しく動作する

#### 完了条件

- 昇格試験開始→クリア→ランクアップのE2Eテストが実装されている
- 昇格試験失敗→ゲームオーバーのE2Eテストが通過する
- アーティファクト選択のE2Eテストが通過する
- 全テストシナリオが通過する

---

### TASK-0141: ゲームクリアE2E 🔵

- [ ] タスク完了

**要件名**: アトリエギルドランク HTML版
**GitHub Issue**: #TBD
**種別**: TDD
**推定時間**: 8時間
**依存**: TASK-0136, TASK-0131
**設計参照**: [ui-design/screens/result.md](../design/atelier-guild-rank/ui-design/screens/result.md)

#### テストシナリオ

```typescript
describe('Game Clear Flow', () => {
  it('Sランク到達でゲームクリア画面が表示される', async () => {
    // Given: Aランクで昇格ゲージ満タン
    await setupGameStateAtRankA();
    await fillPromotionGauge();

    // When: A→S昇格試験をクリア
    await page.click('button:has-text("試験を開始する")');
    await completePromotionTestTasks();
    await page.click('.artifact-choice:first-child');
    await page.click('button:has-text("選択")');

    // Then: ゲームクリア画面が表示される
    await expect(page.locator('.game-clear-screen')).toBeVisible();
    await expect(page.locator('.congratulations')).toBeVisible();
    await expect(page.locator('.final-rank')).toHaveText('S');
  });

  it('プレイ統計が正しく表示される', async () => {
    await setupCompletedGameState();

    await expect(page.locator('.stats-panel')).toBeVisible();
    await expect(page.locator('.total-days')).toBeVisible();
    await expect(page.locator('.completed-quests')).toBeVisible();
    await expect(page.locator('.crafted-items')).toBeVisible();
  });

  it('タイトルへ戻るとセーブデータが削除される', async () => {
    await setupCompletedGameState();

    await page.click('button:has-text("タイトルへ")');
    await page.click('button:has-text("はい")'); // 確認ダイアログ

    await expect(page.locator('.title-screen')).toBeVisible();

    // セーブデータが削除されている
    await expect(page.locator('button:has-text("つづきから")')).toBeDisabled();
  });
});
```

#### 受け入れ基準

- [ ] 全テストシナリオが通過する
- [ ] ゲームクリアフローが正しく動作する

#### 完了条件

- Sランク到達→ゲームクリア画面表示のE2Eテストが実装されている
- プレイ統計表示のE2Eテストが通過する
- タイトルへ戻る→セーブデータ削除のE2Eテストが通過する
- 全テストシナリオが通過する

---

### TASK-0142: ゲームオーバーE2E 🔵

- [ ] タスク完了

**要件名**: アトリエギルドランク HTML版
**GitHub Issue**: #TBD
**種別**: TDD
**推定時間**: 8時間
**依存**: TASK-0136, TASK-0132
**設計参照**: [ui-design/screens/result.md](../design/atelier-guild-rank/ui-design/screens/result.md)

#### テストシナリオ

```typescript
describe('Game Over Flow', () => {
  it('ランク維持日数0でゲームオーバー', async () => {
    // Given: ランク維持日数が1日の状態
    await setupGameStateWithOneDayRemaining();

    // When: 1日を終える
    await page.click('button:has-text("1日を終える")');

    // Then: ゲームオーバー画面が表示される
    await expect(page.locator('.game-over-screen')).toBeVisible();
    await expect(page.locator('.game-over-reason')).toContainText('日数切れ');
  });

  it('到達ランクとプレイ統計が表示される', async () => {
    await setupGameOverState();

    await expect(page.locator('.reached-rank')).toBeVisible();
    await expect(page.locator('.stats-panel')).toBeVisible();
    await expect(page.locator('.hint-text')).toBeVisible();
  });

  it('タイトルへ戻るとセーブデータが削除される', async () => {
    await setupGameOverState();

    await page.click('button:has-text("タイトルへ")');
    await page.click('button:has-text("はい")');

    await expect(page.locator('.title-screen')).toBeVisible();
    await expect(page.locator('button:has-text("つづきから")')).toBeDisabled();
  });
});
```

#### 受け入れ基準

- [ ] 全テストシナリオが通過する
- [ ] ゲームオーバーフローが正しく動作する

#### 完了条件

- ランク維持日数0でゲームオーバーのE2Eテストが実装されている
- 到達ランク・プレイ統計表示のE2Eテストが通過する
- タイトルへ戻る→セーブデータ削除のE2Eテストが通過する
- 全テストシナリオが通過する

---

### TASK-0143: セーブ・ロードE2E 🔵

- [ ] タスク完了

**要件名**: アトリエギルドランク HTML版
**GitHub Issue**: #TBD
**種別**: TDD
**推定時間**: 8時間
**依存**: TASK-0136, TASK-0117
**設計参照**: [data-schema.md](../design/atelier-guild-rank/data-schema.md)

#### テストシナリオ

```typescript
describe('Save and Load Flow', () => {
  it('オートセーブが機能する', async () => {
    await startNewGame();

    // ゲームを進める
    await page.click('button:has-text("次のフェーズへ")');

    // ページをリロード
    await page.reload();
    await page.goto('/');

    // つづきからが有効
    await expect(page.locator('button:has-text("つづきから")')).toBeEnabled();
  });

  it('ゲームを再開すると状態が復元される', async () => {
    await startNewGame();

    // ゲームを進めて状態を変更
    await earnGold(50);
    await advanceToDay(3);

    const goldBefore = await getGold();
    const dayBefore = await getCurrentDay();

    // ページをリロードして再開
    await page.reload();
    await page.goto('/');
    await page.click('button:has-text("つづきから")');

    // 状態が復元されている
    const goldAfter = await getGold();
    const dayAfter = await getCurrentDay();

    expect(goldAfter).toBe(goldBefore);
    expect(dayAfter).toBe(dayBefore);
  });

  it('新規ゲーム開始で既存セーブデータが上書きされる', async () => {
    // 既存のセーブデータを作成
    await startNewGame();
    await earnGold(100);
    await page.reload();

    // 新規ゲームを開始
    await page.goto('/');
    await page.click('button:has-text("はじめから")');
    await page.click('button:has-text("はい")'); // 確認ダイアログ

    // 初期状態になっている
    await expect(page.locator('.gold-display')).toHaveText('100G'); // 初期値
  });
});
```

#### 受け入れ基準

- [ ] 全テストシナリオが通過する
- [ ] セーブ・ロードが正しく動作する
- [ ] データ整合性が保たれる

#### 完了条件

- オートセーブ機能のE2Eテストが実装されている
- ゲーム再開時の状態復元E2Eテストが通過する
- 新規ゲーム開始時のセーブデータ上書きE2Eテストが通過する
- 全テストシナリオが通過する

---

## フェーズ完了基準

- [ ] 全8タスクが完了している
- [ ] 全E2Eテストが通過する
- [ ] 主要なユーザーフローが検証されている
- [ ] CIでE2Eテストが自動実行される
- [ ] パフォーマンス問題がない
- [ ] ドキュメントが更新されている

---

## プロジェクト完了基準

Phase 5完了をもって、プロジェクト全体の完了となる：

- [ ] 全5フェーズ（72タスク）が完了
- [ ] 全ユニットテストが通過（カバレッジ80%以上）
- [ ] 全E2Eテストが通過
- [ ] 設計書に記載された全機能が実装されている
- [ ] バグ・不具合がない（クリティカル/メジャーは0件）
- [ ] ドキュメントが最新化されている

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
|------|-----------|---------|
| 2026-01-02 | 1.0.0 | 初版作成 |
