# 複数日進行統合テスト - TDD要件定義書

**タスクID**: TASK-0263
**機能名**: 複数日進行統合テスト
**要件名**: atelier-guild-rank-phaser
**作成日**: 2026-01-13
**フェーズ**: Phase 5 - 統合テスト・最適化・仕上げ

---

## 1. 機能の概要

### 🔵 機能説明

複数日（複数ターン）にわたるゲーム進行が正しく動作することを検証する統合テストを実装する。この統合テストは、1ターンサイクルテスト（TASK-0261, TASK-0262）の成功を前提に、より長期的なゲームプレイの動作を保証する。

### 🔵 解決する問題

- **長期プレイの安定性保証**: 複数日にわたるゲーム進行で状態が正しく保持されることを検証
- **リソース累積の正確性**: 経験値・ゴールドが複数日にわたって正しく累積されることを確認
- **ゲーム終了条件の検証**: ゲームクリア・ゲームオーバー条件が正しく判定されることを保証
- **依頼ライフサイクルの検証**: 依頼の生成・継続・期限切れ処理が正しく動作することを確認

### 🔵 想定されるユーザー

- **開発者**: Phaserゲーム実装の品質を保証する統合テストを実施
- **QAエンジニア**: 長期プレイのシナリオテストを自動化
- **プロジェクトマネージャー**: リリース前の品質確認指標として利用

### 🔵 システム内での位置づけ

```
┌─────────────────────────────────────┐
│   Presentation Layer (Phaser)      │ ← テスト対象
│   - MainGameScene, PhaseManager    │
├─────────────────────────────────────┤
│   Application Layer                 │ ← テスト対象
│   - GameFlowManager, StateManager   │
├─────────────────────────────────────┤
│   Domain Layer                      │ ← 間接的にテスト
│   - DeckService, QuestService etc.  │
├─────────────────────────────────────┤
│   Infrastructure Layer              │
│   - SaveDataRepository, Loaders     │
└─────────────────────────────────────┘

統合テスト層（tests/integration/phaser/phase5/）
- TurnCycleFirstHalf.test.ts      （TASK-0261）
- TurnCycleSecondHalf.test.ts     （TASK-0262）
- MultiDayProgression.test.ts     （本タスク）
- SceneTransitionIntegration.test.ts
```

### 🔵 参照したドキュメント

- **タスクファイル**: `docs/tasks/atelier-guild-rank-phaser/TASK-0263.md`
- **設計文書**:
  - `docs/design/atelier-guild-rank-phaser/architecture.md` - システムアーキテクチャ
  - `docs/design/atelier-guild-rank-phaser/core-systems.md` - ゲームフロー・EventBus設計
  - `docs/design/atelier-guild-rank-phaser/dataflow.md` - データフロー・StateManager構造
- **タスクノート**: `docs/implements/atelier-guild-rank-phaser/TASK-0263/note.md`

---

## 2. 入力・出力の仕様

### 🔵 テスト対象の入力

#### EventBus イベント（UI層からの入力）

| イベント名 | データ型 | 説明 | 信頼性 |
|-----------|---------|------|--------|
| `ui:game:start:requested` | `{ isNewGame: boolean }` | ゲーム開始リクエスト | 🔵 |
| `ui:phase:complete` | `{ phase: Phase }` | フェーズ完了通知 | 🔵 |
| `ui:quest:accept:requested` | `{ questId: string }` | 依頼受注リクエスト | 🔵 |
| `ui:quest:delivery:requested` | `{ questId: string, itemIds: string[] }` | 依頼納品リクエスト | 🔵 |
| `ui:rankup:challenge:requested` | `{ targetRank: GuildRank }` | ランクアップ挑戦リクエスト | 🔵 |
| `ui:shop:purchase:requested` | `{ category: string, itemId: string, quantity: number }` | ショップ購入リクエスト | 🔵 |

#### StateManager 状態操作

| メソッド | 引数型 | 説明 | 信頼性 |
|---------|-------|------|--------|
| `updateProgress()` | `Partial<IProgressData>` | 進行状況更新 | 🔵 |
| `updatePlayer()` | `Partial<IPlayerData>` | プレイヤーデータ更新 | 🔵 |
| `updateQuests()` | `Partial<IQuestsData>` | 依頼データ更新 | 🔵 |
| `updateInventory()` | `Partial<IInventoryData>` | インベントリ更新 | 🔵 |
| `updateDeck()` | `Partial<IDeckData>` | デッキ更新 | 🔵 |

### 🔵 テスト対象の出力

#### EventBus イベント（Application層からの出力）

| イベント名 | データ型 | 説明 | 信頼性 |
|-----------|---------|------|--------|
| `app:day:start` | `{ day: number }` | 日開始イベント | 🔵 |
| `app:day:end` | `{ day: number }` | 日終了イベント | 🔵 |
| `app:day:warning` | `{ remainingDays: number }` | 残り日数警告 | 🔵 |
| `app:phase:change` | `{ phase: Phase }` | フェーズ変更イベント | 🔵 |
| `app:rankup:available` | `{ currentRank: GuildRank }` | ランクアップ可能通知 | 🔵 |
| `app:quest:delivered` | `{ result: IDeliveryResult }` | 納品完了通知 | 🔵 |
| `app:quest:failed` | `{ questId: string, reason: string }` | 依頼失敗通知 | 🔵 |
| `app:game:over` | `{ reason: string }` | ゲームオーバー | 🔵 |
| `app:game:clear` | `{ stats: IGameStats }` | ゲームクリア | 🔵 |
| `app:error:occurred` | `{ message: string, code: string }` | エラー発生 | 🔵 |

#### StateManager 状態変化

| 取得メソッド | 戻り値型 | 説明 | 信頼性 |
|-------------|---------|------|--------|
| `getProgress()` | `IProgressData` | 進行状況（currentDay, maxDay, currentPhase） | 🔵 |
| `getPlayerData()` | `IPlayerData` | プレイヤーデータ（rank, exp, gold, ap） | 🔵 |
| `getQuests()` | `IQuestsData` | 依頼データ（available, accepted, completed） | 🔵 |
| `getInventory()` | `IInventoryData` | インベントリ（materials, craftedItems, artifacts） | 🔵 |
| `getDeck()` | `IDeckData` | デッキ（hand, cards, discard） | 🔵 |

### 🔵 データフロー

```
[テスト開始]
    ↓
[createTestGame()] → Phaserゲームインスタンス生成
    ↓
[eventBus.emit('ui:game:start:requested')] → ゲーム初期化
    ↓
[advanceDay()] → 日を進める
    ↓
    ├─ フェーズ遷移（quest-accept → gathering → alchemy → delivery）
    ├─ currentDay + 1
    ├─ AP回復（ap.current = ap.max）
    ├─ 新規依頼生成
    ├─ 手札補充（デッキからドロー）
    └─ 捨て札シャッフル
    ↓
[stateManager.getProgress()] → 状態確認
    ↓
[expect(...).toBe(...)] → アサーション
    ↓
[game.destroy()] → テスト終了・クリーンアップ
```

### 🔵 参照した設計文書

- **データフロー**: `docs/design/atelier-guild-rank-phaser/dataflow.md` - 1日のフェーズサイクル
- **EventBus設計**: `docs/design/atelier-guild-rank-phaser/core-systems.md` - 主要イベント一覧
- **StateManager構造**: `docs/design/atelier-guild-rank-phaser/dataflow.md` - IGameState インターフェース

---

## 3. 制約条件

### 🔵 テスト環境制約

| 制約項目 | 内容 | 理由 | 信頼性 |
|---------|------|------|--------|
| **テスト環境** | jsdom | Canvas APIが動作しないため、Phaserモックを使用 | 🔵 |
| **テストフレームワーク** | Vitest 2.1.0 | プロジェクト標準 | 🔵 |
| **非同期待機** | `vi.waitFor()` 必須 | EventBus経由の状態変更は非同期 | 🔵 |
| **タイムアウト** | 5000ms（5秒） | 長期シミュレーションのため余裕を持たせる | 🔵 |
| **クリーンアップ** | `game.destroy(true)` 必須 | メモリリーク防止 | 🔵 |

### 🔵 アーキテクチャ制約

| 制約項目 | 内容 | 理由 | 信頼性 |
|---------|------|------|--------|
| **Clean Architecture** | Presentation → Application → Domain の依存方向を守る | レイヤー分離の原則 | 🔵 |
| **イベント駆動設計** | コンポーネント間通信はEventBusのみ | 疎結合維持 | 🔵 |
| **状態管理の一元化** | StateManagerが唯一の状態保持者 | 状態の一貫性保証 | 🔵 |

### 🔵 パフォーマンス要件

| 要件項目 | 目標値 | 理由 | 信頼性 |
|---------|-------|------|--------|
| **テスト実行時間** | 全テストケース 30秒以内 | CI/CD効率化 | 🔵 |
| **1日進行時間** | 1秒以内 | 複数日シミュレーションの実用性 | 🔵 |
| **メモリ使用量** | テスト終了後に解放 | 連続実行時のメモリリーク防止 | 🔵 |

### 🔵 カバレッジ目標

| テスト対象 | 目標カバレッジ | 理由 | 信頼性 |
|-----------|---------------|------|--------|
| **日数進行** | 100% | コアロジックのため完全カバレッジ | 🔵 |
| **ランク進行** | 90% | 主要パスを網羅 | 🔵 |
| **ゴールド管理** | 90% | エッジケース含む | 🔵 |
| **依頼生成** | 85% | ランダム要素を考慮 | 🔵 |

### 🔵 参照した設計文書

- **アーキテクチャ制約**: `docs/design/atelier-guild-rank-phaser/architecture.md` - Clean Architecture 4層
- **テスト規約**: `CLAUDE.md` - テスト配置・命名規則
- **カバレッジ目標**: `docs/tasks/atelier-guild-rank-phaser/TASK-0263.md` - カバレッジ目標

---

## 4. 想定される使用例

### 🔵 基本的な使用パターン

#### TC-01: 1日の正常な進行

```typescript
it('1日が正常に進行する', async () => {
  // Arrange
  const initialDay = stateManager.getProgress().currentDay;

  // Act
  await advanceDay(game, eventBus);

  // Assert
  expect(stateManager.getProgress().currentDay).toBe(initialDay + 1);
});
```

**データフロー**:
```
初期状態（Day 1） → advanceDay() → 状態確認（Day 2）
```

#### TC-02: 複数日の連続進行

```typescript
it('複数日を連続して進行できる', async () => {
  // Arrange
  const initialDay = stateManager.getProgress().currentDay;
  const daysToAdvance = 5;

  // Act
  for (let i = 0; i < daysToAdvance; i++) {
    await advanceDay(game, eventBus);
  }

  // Assert
  expect(stateManager.getProgress().currentDay).toBe(initialDay + daysToAdvance);
});
```

**データフロー**:
```
Day 1 → Day 2 → Day 3 → Day 4 → Day 5 → Day 6
```

### 🔵 エッジケース

#### EDGE-01: 最大日数到達時のゲームオーバー

```typescript
it('最大日数を超えるとゲームオーバーになる', async () => {
  // Arrange
  stateManager.updateProgress({ currentDay: 30, maxDay: 30 });
  stateManager.updatePlayer({ rank: 'C' }); // Sランク未達

  const gameOverCallback = vi.fn();
  eventBus.on('app:game:over', gameOverCallback);

  // Act
  await advanceDay(game, eventBus);

  // Assert
  await vi.waitFor(() => {
    expect(gameOverCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        reason: expect.stringContaining('期限'),
      })
    );
  });
});
```

**境界条件**: `currentDay === maxDay` かつ `rank !== 'S'`

#### EDGE-02: ゴールドマイナスエラー

```typescript
it('ゴールドがマイナスになるとゲームオーバー', async () => {
  // Arrange
  stateManager.updatePlayer({ gold: 10 });

  // 高額アイテムを購入
  eventBus.emit('ui:shop:purchase:requested', {
    category: 'card',
    itemId: 'expensive_card', // 価格 > 10
    quantity: 1,
  });

  // Assert
  const errorCallback = vi.fn();
  eventBus.on('app:error:occurred', errorCallback);

  await vi.waitFor(() => {
    expect(errorCallback).toHaveBeenCalled();
  });
});
```

**境界条件**: `gold - price < 0`

#### EDGE-03: 依頼期限切れ

```typescript
it('期限切れの依頼は失敗扱いになる', async () => {
  // Arrange
  const expiringQuest = {
    id: 'expiring_quest',
    name: '期限切れ依頼',
    requirements: [{ itemId: 'item', quantity: 1 }],
    deadline: 1, // 1日で期限切れ
  };
  stateManager.updateQuests({
    accepted: [expiringQuest],
    available: [],
    completed: [],
  });

  const questFailedCallback = vi.fn();
  eventBus.on('app:quest:failed', questFailedCallback);

  // Act
  await advanceDay(game, eventBus);

  // Assert
  await vi.waitFor(() => {
    expect(questFailedCallback).toHaveBeenCalledWith(
      expect.objectContaining({ questId: 'expiring_quest' })
    );
  });
});
```

**境界条件**: `acceptedQuest.deadline <= 0`

### 🔵 エラーケース

#### ERROR-01: Phaserゲームインスタンス生成失敗

```typescript
// エラーハンドリング
try {
  const testSetup = await createTestGame();
} catch (error) {
  console.error('Phaserゲーム生成失敗:', error);
  throw error;
}
```

#### ERROR-02: 非同期待機タイムアウト

```typescript
// タイムアウトエラー
await vi.waitFor(() => {
  expect(stateManager.getProgress().currentDay).toBe(expectedDay);
}, { timeout: 5000 }); // 5秒でタイムアウト
```

### 🔵 参照した設計文書

- **データフロー**: `docs/design/atelier-guild-rank-phaser/dataflow.md` - 1日のフェーズサイクル
- **エッジケース**: `docs/tasks/atelier-guild-rank-phaser/TASK-0263.md` - 境界条件テスト
- **テストパターン**: `atelier-guild-rank-html/tests/integration/phaser/phase5/TurnCycleFirstHalf.test.ts`

---

## 5. 設計文書との対応関係

### 🔵 参照したタスクファイル

- **タスクファイル**: `docs/tasks/atelier-guild-rank-phaser/TASK-0263.md`
  - タスク概要
  - テスト実装詳細（全テストケース）
  - 完了条件
  - カバレッジ目標
  - 注意事項

### 🔵 参照した設計文書

#### アーキテクチャ設計

- **ファイル**: `docs/design/atelier-guild-rank-phaser/architecture.md`
- **参照セクション**:
  - Clean Architecture 4層構成
  - レイヤー間の依存関係
  - Presentation層（Phaser Scenes）
  - Application層（StateManager, GameFlowManager）

#### コアシステム設計

- **ファイル**: `docs/design/atelier-guild-rank-phaser/core-systems.md`
- **参照セクション**:
  - ゲームフロー設計
  - EventBus設計（主要イベント一覧）
  - フェーズ管理
  - ランクシステム

#### データフロー設計

- **ファイル**: `docs/design/atelier-guild-rank-phaser/dataflow.md`
- **参照セクション**:
  - 1日のフェーズサイクル
  - ターン終了処理
  - StateManager構造（IGameState インターフェース）
  - 状態遷移図

### 🔵 参照した既存実装

#### 統合テストユーティリティ

- **ファイル**: `atelier-guild-rank-html/tests/utils/phaserTestUtils.ts`
- **使用関数**:
  - `createTestGame()` - Phaserゲームインスタンス生成
  - `createMockEventBus()` - EventBusモック生成
  - `createMockStateManager()` - StateManagerモック生成

#### 既存の統合テスト

- **ファイル**: `atelier-guild-rank-html/tests/integration/phaser/phase5/TurnCycleFirstHalf.test.ts`
- **参考パターン**:
  - `vi.waitFor()` による非同期待機
  - EventBusのモックコールバック
  - `beforeEach` / `afterEach` のセットアップ・クリーンアップ

- **ファイル**: `atelier-guild-rank-html/tests/integration/phaser/phase5/TurnCycleSecondHalf.test.ts`
- **参考パターン**:
  - 依頼納品フロー
  - 経験値・ゴールド更新確認
  - ランクアップ判定

### 🔵 参照したタスクノート

- **ファイル**: `docs/implements/atelier-guild-rank-phaser/TASK-0263/note.md`
- **参照セクション**:
  - 技術スタック（TypeScript, Phaser, Vitest）
  - 開発ルール（テスト規約、テストコマンド）
  - 関連実装（既存テスト、テストユーティリティ）
  - 注意事項（Phaserモック、非同期待機、境界条件）

---

## 6. テストケース一覧

### 🔵 Day Progression（日数進行）

| ID | テストケース | 信頼性 |
|----|------------|--------|
| TC-01 | 1日が正常に進行する | 🔵 |
| TC-02 | 複数日を連続して進行できる | 🔵 |
| TC-03 | 各日の開始時にAPが最大値に回復する | 🔵 |
| TC-04 | 各日の開始時に新しい依頼が生成される | 🔵 |

### 🔵 Experience and Rank Progression（経験値・ランク進行）

| ID | テストケース | 信頼性 |
|----|------------|--------|
| TC-05 | 依頼完了で経験値が蓄積される | 🔵 |
| TC-06 | 経験値が上限に達するとランクアップ可能になる | 🔵 |
| TC-07 | 複数日にわたってゴールドが累積する | 🔵 |

### 🔵 Day Limit（日数制限）

| ID | テストケース | 信頼性 |
|----|------------|--------|
| TC-08 | 最大日数に近づくと警告が表示される | 🔵 |
| TC-09 | 最大日数を超えるとゲームオーバーになる | 🔵 |
| TC-10 | 最大日数前にSランクに到達するとゲームクリア | 🔵 |

### 🔵 Gold Management（ゴールド管理）

| ID | テストケース | 信頼性 |
|----|------------|--------|
| TC-11 | ゴールドがマイナスになるとゲームオーバー | 🔵 |
| TC-12 | ショップでの購入でゴールドが減少する | 🔵 |

### 🔵 Quest Generation（依頼生成）

| ID | テストケース | 信頼性 |
|----|------------|--------|
| TC-13 | 日が進むと新しい依頼が追加される | 🔵 |
| TC-14 | ランクに応じた依頼が生成される | 🔵 |
| TC-15 | 未完了の受注依頼は翌日も継続する | 🔵 |
| TC-16 | 期限切れの依頼は失敗扱いになる | 🔵 |

### 🔵 Deck Management（デッキ管理）

| ID | テストケース | 信頼性 |
|----|------------|--------|
| TC-17 | 日が進むと手札が補充される | 🔵 |
| TC-18 | 捨て札はデッキに戻る | 🔵 |

**合計**: 18テストケース（すべて🔵青信号）

---

## 7. 完了条件

### 🔵 テスト実装の完了条件

- [ ] 複数日進行の統合テストがパスする（TC-01 〜 TC-04）
- [ ] ランク進行の統合テストがパスする（TC-05 〜 TC-07）
- [ ] 日数制限の統合テストがパスする（TC-08 〜 TC-10）
- [ ] 経験値・ゴールド累積の検証テストがパスする（TC-05, TC-07）
- [ ] 新規依頼生成の検証テストがパスする（TC-13 〜 TC-16）

### 🔵 品質基準

- [ ] すべてのテストケースがグリーン（パス）
- [ ] カバレッジ目標を達成（日数進行100%, ランク進行90%, ゴールド管理90%, 依頼生成85%）
- [ ] テスト実行時間が30秒以内
- [ ] メモリリークが発生しない（`game.destroy()` による適切なクリーンアップ）
- [ ] CI/CD環境で安定して動作する

---

## 8. 注意事項

### 🔵 テスト実装上の注意点

1. **Phaserモックの使用**: jsdom環境ではCanvas APIが動作しないため、Phaserモックを使用する
   ```typescript
   vi.mock('phaser', () => getPhaserMock());
   ```

2. **非同期待機**: 状態変更は非同期で発生するため、`vi.waitFor()` を使用して待機する
   ```typescript
   await vi.waitFor(() => {
     expect(stateManager.getProgress().currentDay).toBe(expectedDay);
   }, { timeout: 5000, interval: 50 });
   ```

3. **EventBusのクリーンアップ**: 各テスト後に `eventBus.clear()` でリスナーをクリアする

4. **ゲームインスタンスの破棄**: 各テスト後に `game.destroy(true)` でメモリリークを防ぐ

### 🔵 境界条件のテスト重点項目

- **日数上限**: `maxDay` に到達した場合のゲームオーバー判定
- **ゴールド下限**: ゴールドがマイナスになる場合のエラーハンドリング
- **ランク到達**: Sランク到達時のゲームクリア判定
- **依頼期限**: 期限切れ依頼の失敗処理

### 🔵 状態の一貫性維持の確認ポイント

- フェーズ遷移後も状態が保持されることを確認
- 複数日にわたってゴールド・経験値が累積することを確認
- 受注した依頼が日を跨いで保持されることを確認

---

## 9. 信頼性レベルサマリー

### 信頼性レベル集計

- 🔵 **青信号**: 18項目（100%）
- 🟡 **黄信号**: 0項目（0%）
- 🔴 **赤信号**: 0項目（0%）

### 品質評価

**✅ 高品質**

- **要件の曖昧さ**: なし（タスクファイルに詳細なテストコード記載）
- **入出力定義**: 完全（EventBus・StateManagerのインターフェース明確）
- **制約条件**: 明確（テスト環境・アーキテクチャ・パフォーマンス要件すべて定義済み）
- **実装可能性**: 確実（既存の統合テストパターンを踏襲）
- **信頼性レベル**: 🔵（青信号）100%

**根拠**:
- タスクファイルに18個のテストケースが具体的なコードとして記載されている
- 設計文書（architecture.md, core-systems.md, dataflow.md）が充実している
- 既存の統合テスト実装（TASK-0261, TASK-0262）を参考にできる
- タスクノートに技術スタック・開発ルール・注意事項が網羅されている

---

## 10. 次のステップ

次のお勧めステップ: `/tsumiki:tdd-testcases atelier-guild-rank-phaser TASK-0263` でテストケースの洗い出しを行います。

---

**作成者**: Claude Code (ずんだもん)
**レビュー状態**: 未レビュー
**最終更新**: 2026-01-13
