# Atelier E2Eテスト計画書

## 概要

本ドキュメントは、Phaser.jsベースのゲーム「Atelier」に対するE2Eテストの包括的な計画を定義するものである。

### テスト戦略の3つの柱

| テスト種別 | 方針 | 主な手法 |
|-----------|------|---------|
| **表示テスト** | ビジュアルリグレッションテスト | `toHaveScreenshot()` でCanvas画面をキャプチャ |
| **ゲーム操作** | キーボードベース | `page.keyboard` API でゲーム内操作 |
| **UI操作** | マウス操作 | `page.mouse` / `page.click()` でホバー・切り替わり確認 |

### Phaser.js特有の課題と対策

| 課題 | 対策 |
|------|------|
| Canvas/WebGLでDOM要素なし | `window.gameState()` でゲーム状態を取得 |
| ゲームループで常時更新 | 状態ベースの `waitForFunction()` で安定待機 |
| 非同期処理（Tween、シーン遷移） | デバッグツール経由で状態を直接制御 |
| 入力がPhaser InputManager経由 | Playwright のキーボード/マウスAPIがCanvas上で動作 |

---

## 1. テスト対象

### ゲーム構造

```
BootScene
  ↓ (アセット読み込み・サービス初期化)
TitleScene
  ├─→ (新規ゲーム)  MainScene
  ├─→ (コンティニュー) MainScene
  └─→ (設定)       SettingsScene (未実装)

MainScene (4フェーズループ × 30日)
  │
  ├─ QUEST_ACCEPT   依頼受注フェーズ
  ├─ GATHERING      採取フェーズ
  ├─ ALCHEMY        調合フェーズ
  └─ DELIVERY       納品フェーズ
        │
        ├─ (Sランク達成) → GameClearScene
        └─ (残り日数0) → GameOverScene
```

### 対象コンポーネント

| カテゴリ | コンポーネント | テスト対象 |
|---------|--------------|-----------|
| **シーン** | BootScene | 起動、アセットロード |
| | TitleScene | メニュー、シーン遷移 |
| | MainScene | 4フェーズ、日次ループ |
| | ShopScene | カード購入 |
| | RankUpScene | 昇格試験 |
| | GameClearScene | クリア表示、統計 |
| | GameOverScene | ゲームオーバー表示、統計 |
| **フェーズUI** | QuestAcceptPhaseUI | 依頼カード表示、受注 |
| | GatheringPhaseUI | ドラフト、素材獲得 |
| | AlchemyPhaseUI | レシピ、調合、品質 |
| | DeliveryPhaseUI | 納品、報酬 |
| **共通UI** | Header | ランク、日数、所持金 |
| | Sidebar | ショップ、クエスト一覧 |
| | Footer | 次へボタン |
| | ModalDialog | モーダルウィンドウ |
| | Tooltip | ホバーツールチップ |

---

## 2. テスト環境・インフラ

### 既存インフラ

```
atelier-guild-rank/
├── e2e/
│   ├── specs/           # テストスペック
│   │   └── scenario/    # シナリオテスト
│   ├── pages/           # Page Objectクラス
│   ├── fixtures/        # テストデータ・フィクスチャ
│   └── types/           # E2E用型定義
├── playwright.config.ts # Playwright設定
└── src/
    └── shared/utils/debug.ts  # テストブリッジ（DebugTools）
```

### テストブリッジAPI

```typescript
// ゲーム状態取得
window.gameState(): GameState

// デバッグツール
window.debug.setRank(rank)         // ランク設定
window.debug.addGold(amount)       // ゴールド追加
window.debug.skipToDay(day)        // 日数スキップ
window.debug.skipPhase()           // フェーズスキップ
window.debug.clickNextButton()     // 次へボタン
window.debug.endDay()              // 日終了
window.debug.returnToTitle()       // タイトルに戻る
window.debug.clickNewGame()        // 新規ゲーム
window.debug.clickContinue()       // コンティニュー
window.debug.unlockAllCards()      // 全カード解放
window.debug.setActionPoints(ap)   // AP設定
window.debug.clearSaveData()       // セーブデータ削除
window.debug.logState()            // 状態ログ出力
```

### ビジュアルリグレッション設定

```typescript
// playwright.config.ts への追加推奨設定
{
  expect: {
    toHaveScreenshot: {
      // ピクセル単位の差分許容
      maxDiffPixelRatio: 0.02,
      // アニメーション安定化
      animations: 'disabled',
    },
  },
  // Docker CI用設定
  use: {
    // フォント一貫性のため固定ビューポート
    viewport: { width: 1280, height: 720 },
    // GPU差異を排除
    launchOptions: {
      args: ['--disable-gpu'],
    },
  },
}
```

---

## 3. テストケース一覧

### 3.1 起動・シーン遷移テスト

#### 正常系

| ID | テストケース名 | 信頼性 | 操作方法 | 検証方法 |
|----|--------------|--------|---------|---------|
| TC-E2E-BOOT-001 | ゲーム起動成功 | 🔵 | - | Canvas表示確認 |
| TC-E2E-BOOT-002 | BootScene→TitleScene遷移 | 🔵 | - | `gameState().currentScene` |
| TC-E2E-BOOT-003 | コンソールエラーなし | 🔵 | - | console監視 |
| TC-E2E-BOOT-004 | rexUIプラグイン読み込み | 🔵 | - | エラーログなし |

#### スケーリングテスト（ビジュアルリグレッション）

| ID | テストケース名 | 信頼性 | 操作方法 | 検証方法 |
|----|--------------|--------|---------|---------|
| TC-E2E-SCALE-001 | 最小解像度960x540 | 🔵 | viewport設定 | `toHaveScreenshot()` |
| TC-E2E-SCALE-002 | 標準解像度1280x720 | 🔵 | viewport設定 | `toHaveScreenshot()` |
| TC-E2E-SCALE-003 | FHD解像度1920x1080 | 🟡 | viewport設定 | `toHaveScreenshot()` |
| TC-E2E-SCALE-004 | 4K解像度3840x2160 | 🟡 | viewport設定 | アスペクト比確認 |
| TC-E2E-SCALE-005 | ウルトラワイド21:9 | 🟡 | viewport設定 | ピラーボックス表示 |

### 3.2 タイトル画面テスト

#### 正常系

| ID | テストケース名 | 信頼性 | 操作方法 | 検証方法 |
|----|--------------|--------|---------|---------|
| TC-E2E-TITLE-001 | タイトル画面表示 | 🔵 | - | `toHaveScreenshot()` |
| TC-E2E-TITLE-002 | 新規ゲームボタンクリック | 🔵 | キー（Enter）/ マウスクリック | MainScene遷移確認 |
| TC-E2E-TITLE-003 | コンティニューボタン状態 | 🔵 | - | セーブデータ有無で表示変化 |
| TC-E2E-TITLE-004 | コンティニューでゲーム再開 | 🔵 | キー / マウス | 保存状態復元確認 |

#### マウス操作（ホバー・視覚効果）

| ID | テストケース名 | 信頼性 | 操作方法 | 検証方法 |
|----|--------------|--------|---------|---------|
| TC-E2E-TITLE-H01 | ボタンホバーエフェクト | 🔵 | `mouse.move()` | `toHaveScreenshot()` |
| TC-E2E-TITLE-H02 | ボタンホバー拡大 | 🟡 | `mouse.move()` | スケール値確認 |
| TC-E2E-TITLE-H03 | フェードイン表示 | 🟡 | - | カメラアルファ確認 |
| TC-E2E-TITLE-H04 | フェードアウト遷移 | 🟡 | ボタンクリック | カメラアルファ確認 |

### 3.3 メインゲームテスト（フェーズ単位）

#### 依頼受注フェーズ (QUEST_ACCEPT)

| ID | テストケース名 | 信頼性 | 操作方法 | 検証方法 |
|----|--------------|--------|---------|---------|
| TC-E2E-QUEST-001 | 依頼カード5枚表示 | 🔵 | - | `toHaveScreenshot()` |
| TC-E2E-QUEST-002 | 依頼カードクリック→詳細表示 | 🔵 | マウスクリック | モーダル表示 |
| TC-E2E-QUEST-003 | 依頼受注 | 🔵 | マウスクリック | `acceptedQuestCount++` |
| TC-E2E-QUEST-004 | 次へボタンで採取フェーズへ | 🔵 | キー / マウス | `currentPhase` 確認 |

| ID | テストケース名 | 信頼性 | 操作方法 | 検証方法 |
|----|--------------|--------|---------|---------|
| TC-E2E-QUEST-H01 | 依頼カードホバー詳細 | 🔵 | `mouse.move()` | ツールチップ表示 |
| TC-E2E-QUEST-H02 | 詳細モーダルESCで閉じる | 🔵 | `keyboard.press('Escape')` | モーダル非表示 |
| TC-E2E-QUEST-H03 | 受注アニメーション | 🟡 | マウスクリック | `toHaveScreenshot()` |

#### 採取フェーズ (GATHERING)

| ID | テストケース名 | 信頼性 | 操作方法 | 検証方法 |
|----|--------------|--------|---------|---------|
| TC-E2E-GATHER-001 | ドラフトカード3枚表示 | 🔵 | - | `toHaveScreenshot()` |
| TC-E2E-GATHER-002 | カード選択→素材獲得 | 🔵 | マウスクリック | `materialCount++` |
| TC-E2E-GATHER-003 | 次へボタンで調合フェーズへ | 🔵 | キー / マウス | `currentPhase` 確認 |

| ID | テストケース名 | 信頼性 | 操作方法 | 検証方法 |
|----|--------------|--------|---------|---------|
| TC-E2E-GATHER-H01 | カードホバー詳細表示 | 🔵 | `mouse.move()` | ツールチップ表示 |
| TC-E2E-GATHER-H02 | 採取アニメーション | 🟡 | - | `toHaveScreenshot()` |

#### 調合フェーズ (ALCHEMY)

| ID | テストケース名 | 信頼性 | 操作方法 | 検証方法 |
|----|--------------|--------|---------|---------|
| TC-E2E-ALCHEMY-001 | レシピリスト表示 | 🔵 | - | `toHaveScreenshot()` |
| TC-E2E-ALCHEMY-002 | レシピ選択→素材選択 | 🔵 | マウスクリック | 選択状態確認 |
| TC-E2E-ALCHEMY-003 | 調合実行→アイテム生成 | 🔵 | マウスクリック | `artifactCount++` |
| TC-E2E-ALCHEMY-004 | 品質D表示 | 🔵 | - | `toHaveScreenshot()` |
| TC-E2E-ALCHEMY-005 | 品質C表示 | 🔵 | - | `toHaveScreenshot()` |
| TC-E2E-ALCHEMY-006 | 品質B表示 | 🔵 | - | `toHaveScreenshot()` |
| TC-E2E-ALCHEMY-007 | 品質A表示 | 🔵 | - | `toHaveScreenshot()` |
| TC-E2E-ALCHEMY-008 | 品質S表示（パーティクル） | 🔵 | - | `toHaveScreenshot()` |
| TC-E2E-ALCHEMY-009 | 次へボタンで納品フェーズへ | 🔵 | キー / マウス | `currentPhase` 確認 |

| ID | テストケース名 | 信頼性 | 操作方法 | 検証方法 |
|----|--------------|--------|---------|---------|
| TC-E2E-ALCHEMY-H01 | レシピホバー詳細 | 🔵 | `mouse.move()` | ツールチップ表示 |
| TC-E2E-ALCHEMY-H02 | 調合結果モーダル | 🔵 | - | モーダル表示確認 |
| TC-E2E-ALCHEMY-H03 | 調合アニメーション | 🟡 | - | `toHaveScreenshot()` |

#### 納品フェーズ (DELIVERY)

| ID | テストケース名 | 信頼性 | 操作方法 | 検証方法 |
|----|--------------|--------|---------|---------|
| TC-E2E-DELIVER-001 | 納品対象依頼表示 | 🔵 | - | `toHaveScreenshot()` |
| TC-E2E-DELIVER-002 | アイテム選択→納品 | 🔵 | マウスクリック | 報酬獲得確認 |
| TC-E2E-DELIVER-003 | 報酬表示モーダル | 🔵 | - | モーダル表示確認 |
| TC-E2E-DELIVER-004 | 日終了で次の日へ | 🔵 | キー / マウス | `remainingDays--` |

| ID | テストケース名 | 信頼性 | 操作方法 | 検証方法 |
|----|--------------|--------|---------|---------|
| TC-E2E-DELIVER-H01 | 依頼ホバー詳細 | 🔵 | `mouse.move()` | ツールチップ表示 |
| TC-E2E-DELIVER-H02 | アイテムドラッグ&ドロップ | 🔵 | `mouse.drag()` | 納品状態確認 |
| TC-E2E-DELIVER-H03 | 無効ドロップで元位置に戻る | 🔵 | `mouse.drag()` | 位置確認 |

### 3.4 ゲームクリア・ゲームオーバーテスト

#### ゲームクリア

| ID | テストケース名 | 信頼性 | 操作方法 | 検証方法 |
|----|--------------|--------|---------|---------|
| TC-E2E-CLEAR-001 | GameClearScene表示 | 🔵 | デバッグツールでSランク設定 | `toHaveScreenshot()` |
| TC-E2E-CLEAR-002 | クリア統計表示 | 🔵 | - | 統計値確認 |
| TC-E2E-CLEAR-003 | タイトルへ戻るボタン | 🔵 | キー / マウス | TitleScene遷移 |
| TC-E2E-CLEAR-004 | NEW GAME+ボタン | 🟡 | キー / マウス | MainScene遷移 |

#### ゲームオーバー

| ID | テストケース名 | 信頼性 | 操作方法 | 検証方法 |
|----|--------------|--------|---------|---------|
| TC-E2E-OVER-001 | GameOverScene表示 | 🔵 | デバッグツールで残り日数0 | `toHaveScreenshot()` |
| TC-E2E-OVER-002 | ゲームオーバー統計表示 | 🔵 | - | 統計値確認 |
| TC-E2E-OVER-003 | タイトルへ戻るボタン | 🔵 | キー / マウス | TitleScene遷移 |
| TC-E2E-OVER-004 | リトライボタン | 🔵 | キー / マウス | MainScene遷移 |

### 3.5 シナリオテスト（E2Eフロー）

| ID | テストケース名 | 信頼性 | 操作方法 | 検証方法 |
|----|--------------|--------|---------|---------|
| TC-E2E-SCENARIO-001 | 新規ゲーム開始フロー | 🔵 | キー + マウス | 初期状態確認 |
| TC-E2E-SCENARIO-002 | 1日の完全フロー | 🔵 | キー + マウス | 日数減少確認 |
| TC-E2E-SCENARIO-003 | 複数日プレイ | 🔵 | キー + マウス | 進行状態確認 |
| TC-E2E-SCENARIO-004 | セーブ&ロード | 🔵 | キー + マウス | 状態復元確認 |
| TC-E2E-SCENARIO-005 | ゲームクリア達成 | 🔵 | デバッグツール | GameClearScene到達 |
| TC-E2E-SCENARIO-006 | ゲームオーバー | 🔵 | デバッグツール | GameOverScene到達 |
| TC-E2E-SCENARIO-007 | リザルト→タイトル遷移 | 🔵 | キー / マウス | TitleScene遷移 |

### 3.6 UI/UXテスト

#### サイドバー

| ID | テストケース名 | 信頼性 | 操作方法 | 検証方法 |
|----|--------------|--------|---------|---------|
| TC-E2E-SIDEBAR-001 | サイドバー表示 | 🔵 | - | `toHaveScreenshot()` |
| TC-E2E-SIDEBAR-002 | 折りたたみ動作 | 🟡 | マウスクリック | 状態変化確認 |
| TC-E2E-SIDEBAR-003 | 展開動作 | 🟡 | マウスクリック | 状態変化確認 |
| TC-E2E-SIDEBAR-004 | ショップボタンクリック | 🔵 | マウスクリック | ShopScene遷移 |

#### ヘッダー

| ID | テストケース名 | 信頼性 | 操作方法 | 検証方法 |
|----|--------------|--------|---------|---------|
| TC-E2E-HEADER-001 | ランク表示 | 🔵 | - | `toHaveScreenshot()` |
| TC-E2E-HEADER-002 | 残り日数表示 | 🔵 | - | 値確認 |
| TC-E2E-HEADER-003 | 所持金表示 | 🔵 | - | 値確認 |
| TC-E2E-HEADER-004 | 行動ポイント表示 | 🔵 | - | 値確認 |

---

## 4. 必要なPage Object

### 既存Page Object（維持）

| PageObject | 概要 |
|------------|------|
| `BasePage` | 全ページ共通機能（Canvas操作、状態取得、デバッグツール実行） |
| `GamePage` | ゲーム全般（起動待機、Canvas取得） |
| `TitlePage` | タイトル画面操作 |
| `MainPage` | メイン画面操作・デバッグツール |
| `PhaseFlowPage` | フェーズ操作（座標クリック・ハイブリッド） |
| `QuestPage` | 依頼フェーズ操作 |
| `GatheringPage` | 採取フェーズ操作 |
| `AlchemyPage` | 調合フェーズ操作 |
| `DeliveryPage` | 納品フェーズ操作 |
| `ResultPage` | リザルト画面操作 |
| `UIComponentPage` | UI共通コンポーネント（ホバー、ツールチップ、モーダル） |

### 新規Page Object（追加予定）

| PageObject | 概要 | 優先度 |
|------------|------|--------|
| `VisualRegressionPage` | ビジュアルリグレッション専用ヘルパー | 高 |
| `KeyboardInputPage` | キーボード入力専用ヘルパー | 高 |
| `MouseInteractionPage` | マウス操作専用ヘルパー（ホバー、ドラッグ） | 高 |
| `ShopPage` | ショップ画面操作 | 中 |
| `RankUpPage` | 昇格試験画面操作 | 中 |

---

## 5. 必要なフィクスチャ

### 既存フィクスチャ（維持）

| フィクスチャ | 概要 |
|-------------|------|
| `game.fixture.ts` | Playwright拡張フィクスチャ（`gamePage`） |
| `test-data.ts` | テストデータ・シナリオ定義 |

### 新規フィクスチャ（追加予定）

| フィクスチャ | 概要 | 優先度 |
|-------------|------|--------|
| `visual-baseline/` | ビジュアルリグレッション基準画像 | 高 |
| `keyboard-shortcuts.ts` | キーボードショートカット定義 | 中 |
| `mouse-coordinates.ts` | マウス座標定義（UI要素位置） | 中 |

---

## 6. ビジュアルリグレッションテスト設計

### 基準画像管理

```
e2e/
├── specs/
│   └── visual/
│       ├── title-screen.spec.ts
│       ├── main-scene.spec.ts
│       ├── quality-effects.spec.ts
│       └── __screenshots__/        # 自動生成される基準画像
│           ├── title-screen.spec.ts/
│           │   ├── title-display.png
│           │   └── button-hover.png
│           ├── main-scene.spec.ts/
│           │   ├── quest-phase.png
│           │   ├── gathering-phase.png
│           │   ├── alchemy-phase.png
│           │   └── delivery-phase.png
│           └── quality-effects.spec.ts/
│               ├── quality-d.png
│               ├── quality-c.png
│               ├── quality-b.png
│               ├── quality-a.png
│               └── quality-s.png
```

### テスト安定化のためのルール

1. **アニメーション完了待機**: スクリーンショット前に必ず状態安定を待つ
   ```typescript
   await page.waitForFunction(() => {
     return window.gameState?.().currentPhase === 'QUEST_ACCEPT';
   });
   await page.waitForTimeout(500); // アニメーション完了
   await expect(page).toHaveScreenshot('quest-phase.png');
   ```

2. **乱数シード固定**: テスト環境では乱数シードを固定
   ```typescript
   await page.evaluate(() => {
     window.debug?.setRandomSeed?.(12345);
   });
   ```

3. **タイムスタンプ非表示**: 動的な日時表示をテスト時に非表示
   ```typescript
   await page.evaluate(() => {
     window.debug?.hideTimestamp?.();
   });
   ```

---

## 7. キーボード入力テスト設計

### 定義するキーマッピング

| キー | 操作 | 対象シーン |
|------|------|-----------|
| `Enter` | 決定・次へ | 全シーン |
| `Escape` | キャンセル・戻る | 全シーン |
| `ArrowUp/Down/Left/Right` | カーソル移動 | MainScene |
| `Space` | 選択・実行 | MainScene |
| `1-5` | 依頼カード選択 | QuestAccept |
| `1-3` | ドラフトカード選択 | Gathering |
| `Tab` | フォーカス移動 | 全シーン |

### テストパターン

```typescript
// キーボードナビゲーションテスト例
test('キーボードで依頼カードを選択', async ({ page }) => {
  // MainSceneの依頼受注フェーズへ遷移
  await page.waitForFunction(() =>
    window.gameState?.().currentPhase === 'QUEST_ACCEPT'
  );

  // 1キーで1枚目の依頼カードを選択
  await page.keyboard.press('1');

  // 詳細モーダルが表示されることを確認
  const isModalVisible = await page.evaluate(() => {
    return window.gameState?.().isQuestDetailModalVisible;
  });
  expect(isModalVisible).toBe(true);

  // Enterで受注
  await page.keyboard.press('Enter');

  // 受注数が増加したことを確認
  const questCount = await page.evaluate(() =>
    window.gameState?.().acceptedQuestCount
  );
  expect(questCount).toBe(1);
});
```

---

## 8. マウス操作テスト設計

### ホバーエフェクトテスト

```typescript
// ボタンホバーエフェクトテスト例
test('新規ゲームボタンのホバーエフェクト', async ({ page }) => {
  await page.waitForFunction(() =>
    window.gameState?.().currentScene === 'TitleScene'
  );

  // ボタン座標を取得
  const buttonPos = await page.evaluate(() => {
    const scene = window.__PHASER_GAME__?.scene.getScene('TitleScene');
    const btn = scene?.children.list.find(c => c.name === 'newGameButton');
    return btn ? { x: btn.x, y: btn.y } : null;
  });

  // ホバー前のスクリーンショット
  await expect(page).toHaveScreenshot('button-normal.png');

  // ボタンにホバー
  await page.mouse.move(buttonPos.x, buttonPos.y);
  await page.waitForTimeout(300); // ホバーエフェクト完了待機

  // ホバー後のスクリーンショット
  await expect(page).toHaveScreenshot('button-hover.png');
});
```

### ドラッグ&ドロップテスト

```typescript
// カードドラッグ&ドロップテスト例
test('素材カードを調合スロットにドラッグ', async ({ page }) => {
  await page.waitForFunction(() =>
    window.gameState?.().currentPhase === 'ALCHEMY'
  );

  // ドラッグ元・ドロップ先座標
  const sourcePos = { x: 300, y: 400 }; // 素材カード
  const targetPos = { x: 700, y: 400 }; // 調合スロット

  // ドラッグ&ドロップ実行
  await page.mouse.move(sourcePos.x, sourcePos.y);
  await page.mouse.down();
  await page.mouse.move(targetPos.x, targetPos.y, { steps: 10 });
  await page.mouse.up();

  // ドロップ成功を確認
  const slotFilled = await page.evaluate(() => {
    return window.gameState?.().alchemySlotFilled;
  });
  expect(slotFilled).toBe(true);
});
```

---

## 9. CI/CD統合

### GitHub Actions設定例

```yaml
name: E2E Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    container:
      image: mcr.microsoft.com/playwright:v1.40.0-jammy
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - run: pnpm install

      - name: Run E2E tests
        run: pnpm test:e2e
        env:
          CI: true

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

### Docker設定（ビジュアルリグレッション安定化）

```dockerfile
FROM mcr.microsoft.com/playwright:v1.40.0-jammy

# フォント一貫性のためNoto Sansをインストール
RUN apt-get update && apt-get install -y \
    fonts-noto-cjk \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

COPY . .
CMD ["pnpm", "test:e2e"]
```

---

## 10. 前提条件

1. **開発サーバー起動**: `pnpm dev` で `http://localhost:3000` が起動していること
2. **テストブリッジ有効**: `window.gameState()` と `window.debug` が公開されていること
3. **解像度固定**: テストは1280x720の基準解像度で実行
4. **アニメーション制御**: ビジュアルテスト前にアニメーション完了を待機

---

## 11. 注意事項

1. **座標ベースのクリックは脆弱**: UI変更時に座標更新が必要
2. **ビジュアルリグレッションの差分閾値**: パーティクル等の動的要素は許容差分を大きく設定
3. **CI環境の差異**: Dockerコンテナでフォント・GPU差異を排除
4. **テスト実行時間**: フルテストスイートは長時間になるため、パラレル実行を活用
5. **デバッグツール依存**: テストブリッジが未実装の機能はテスト不可

---

## 12. テストケース総数

| カテゴリ | テスト数 | 信頼性高(🔵) | 信頼性中(🟡) |
|---------|---------|--------------|--------------|
| 起動・シーン遷移 | 9 | 7 | 2 |
| タイトル画面 | 8 | 6 | 2 |
| 依頼受注フェーズ | 7 | 6 | 1 |
| 採取フェーズ | 5 | 4 | 1 |
| 調合フェーズ | 12 | 11 | 1 |
| 納品フェーズ | 7 | 7 | 0 |
| ゲームクリア | 4 | 3 | 1 |
| ゲームオーバー | 4 | 4 | 0 |
| シナリオテスト | 7 | 7 | 0 |
| UI/UX | 8 | 6 | 2 |
| **合計** | **71** | **61** | **10** |

---

## 13. 実装優先度

### Phase 1: 基盤整備（最優先）
- [ ] ビジュアルリグレッション設定追加
- [ ] Page Object追加（VisualRegressionPage, KeyboardInputPage, MouseInteractionPage）
- [ ] 基準画像の初期生成

### Phase 2: 正常系フロー
- [ ] 起動・シーン遷移テスト
- [ ] タイトル画面テスト
- [ ] シナリオテスト（1日フロー、ゲームクリア、ゲームオーバー）

### Phase 3: フェーズ単位テスト
- [ ] 依頼受注フェーズテスト
- [ ] 採取フェーズテスト
- [ ] 調合フェーズテスト
- [ ] 納品フェーズテスト

### Phase 4: UI/UX詳細テスト
- [ ] ホバーエフェクトテスト
- [ ] ドラッグ&ドロップテスト
- [ ] サイドバー・ヘッダーテスト

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
|------|-----------|---------|
| 2026-02-06 | 1.0 | 初版作成 |
