# TASK-0263: 複数日進行統合テスト - コンテキストノート

**作成日**: 2026-01-13
**タスクタイプ**: TDD
**推定工数**: 4時間
**フェーズ**: Phase 5 - 統合テスト・最適化・仕上げ

---

## 1. 技術スタック

### 1.1 使用技術

| 技術 | バージョン | 用途 |
|------|-----------|------|
| TypeScript | 5.7.0 | メイン言語 |
| Phaser | 3.90.0 | ゲームフレームワーク |
| phaser3-rex-plugins | 1.80.17 | UIコンポーネント |
| Vitest | 2.1.0 | テストフレームワーク |
| jsdom | 25.0.0 | テスト環境（DOM） |

**参照元**:
- atelier-guild-rank-html/package.json
- CLAUDE.md

### 1.2 アーキテクチャ

- **Clean Architecture 4層**: Presentation / Application / Domain / Infrastructure
- **Scene-based Architecture**: Phaserのシーン管理を活用
- **イベント駆動設計**: EventBusによる疎結合な通信

**参照元**:
- docs/design/atelier-guild-rank-phaser/architecture.md
- docs/design/atelier-guild-rank-phaser/core-systems.md

---

## 2. 開発ルール

### 2.1 テスト規約

- テストファイル配置: `tests/integration/phaser/phase5/`
- ファイル名: `MultiDayProgression.test.ts`
- テストフレームワーク: Vitest
- テスト環境: jsdom
- TDD開発フロー: Red → Green → Refactor

**参照元**:
- CLAUDE.md
- atelier-guild-rank-html/vitest.config.ts

### 2.2 テストコマンド

```bash
cd atelier-guild-rank-html

# 単一テストファイル実行（`--`オプションは使用禁止）
npm run test tests/integration/phaser/phase5/MultiDayProgression.test.ts

# カバレッジ付きテスト
npm run test:coverage
```

**参照元**: CLAUDE.md

### 2.3 信頼性レベル表記

- 🔵 **青信号**: 設計書に詳細記載
- 🟡 **黄信号**: 設計書から妥当な推測
- 🔴 **赤信号**: 設計書にない推測

**参照元**: docs/design/atelier-guild-rank-phaser/architecture.md

---

## 3. 関連実装

### 3.1 既存の統合テスト実装

**Phase5 統合テストファイル**:
- `tests/integration/phaser/phase5/TurnCycleFirstHalf.test.ts` - 1ターン前半テスト
- `tests/integration/phaser/phase5/TurnCycleSecondHalf.test.ts` - 1ターン後半テスト
- `tests/integration/phaser/phase5/SceneTransitionIntegration.test.ts` - シーン遷移テスト

**参照元**: atelier-guild-rank-html/tests/integration/phaser/phase5/

### 3.2 テストユーティリティ

**共通テストユーティリティ**:
```typescript
// tests/utils/test-utils.ts
- createMockLocalStorage(): Storage
- deepCopy<T>(obj: T): T
- delay(ms: number): Promise<void>
- generateRandomId(prefix: string): string
```

**Phaserテストユーティリティ**:
```typescript
// tests/utils/phaserTestUtils.ts
- createMockEventBus(): EventBus
- createMockStateManager(): StateManager
- createTestGame(): Promise<{ game, eventBus, stateManager }>
```

**参照元**:
- atelier-guild-rank-html/tests/utils/test-utils.ts
- atelier-guild-rank-html/tests/integration/phaser/phase5/TurnCycleFirstHalf.test.ts

### 3.3 テストパターン

**vi.waitFor() を使った非同期待機**:
```typescript
await vi.waitFor(() => {
  const progress = stateManager.getProgressData();
  expect(progress.currentDay).toBe(expectedDay);
}, { timeout: 5000, interval: 50 });
```

**EventBusのモック**:
```typescript
const mockCallback = vi.fn();
eventBus.on('app:game:over', mockCallback);

await vi.waitFor(() => {
  expect(mockCallback).toHaveBeenCalled();
});
```

**参照元**: atelier-guild-rank-html/tests/integration/phaser/phase5/TurnCycleFirstHalf.test.ts

---

## 4. 設計文書

### 4.1 システムアーキテクチャ

**レイヤー構成**:
```
┌─────────────────────────────────────┐
│   Presentation Layer (Phaser)      │
│   - Scenes, UI Components          │
├─────────────────────────────────────┤
│   Application Layer                 │
│   - GameFlowManager, StateManager   │
├─────────────────────────────────────┤
│   Domain Layer                      │
│   - DeckService, QuestService etc.  │
├─────────────────────────────────────┤
│   Infrastructure Layer              │
│   - SaveDataRepository, Loaders     │
└─────────────────────────────────────┘
```

**参照元**: docs/design/atelier-guild-rank-phaser/architecture.md

### 4.2 EventBus設計

**主要イベント**:

| イベント名 | 発火元 | データ | 説明 |
|-----------|-------|--------|------|
| `game:start` | TitleScene | `{ isNewGame: boolean }` | ゲーム開始 |
| `game:over` | RankService | `{ reason: string }` | ゲームオーバー |
| `game:clear` | RankService | `{ stats: IGameStats }` | ゲームクリア |
| `phase:change` | PhaseManager | `{ phase: Phase }` | フェーズ変更 |
| `day:start` | PhaseManager | `{ day: number }` | 日開始 |
| `day:end` | PhaseManager | `{ day: number }` | 日終了 |
| `quest:delivered` | QuestService | `{ result: IDeliveryResult }` | 納品完了 |

**参照元**: docs/design/atelier-guild-rank-phaser/core-systems.md

### 4.3 データフロー

**1日のフェーズサイクル**:
```
依頼受注 → 採取 → 調合 → 納品 → 日終了 → (次の日へ)
```

**ターン終了処理**:
1. 日数進行（currentDay + 1）
2. AP回復（ap.current = ap.max）
3. 新規依頼生成
4. 手札補充（デッキからドロー）
5. 捨て札シャッフル

**参照元**: docs/design/atelier-guild-rank-phaser/dataflow.md

### 4.4 StateManager構造

```typescript
interface IGameState {
  currentDay: number;           // 現在の日
  remainingDays: number;        // 残り日数
  currentPhase: Phase;          // 現在のフェーズ
  currentRank: GuildRank;       // 現在のギルドランク
  promotionGauge: number;       // 昇格ゲージ（0-100%）
  gold: number;                 // 所持金
  actionPoints: number;         // 行動ポイント（1日3）
  comboCount: number;           // 連続納品数
}
```

**参照元**: docs/design/atelier-guild-rank-phaser/dataflow.md

---

## 5. 注意事項

### 5.1 テスト実装上の注意点

1. **Phaserモックの使用**: jsdom環境ではCanvas APIが動作しないため、Phaserモックを使用する
   ```typescript
   vi.mock('phaser', () => getPhaserMock());
   ```

2. **非同期待機**: 状態変更は非同期で発生するため、`vi.waitFor()` を使用して待機する

3. **EventBusのクリーンアップ**: 各テスト後に `eventBus.clear()` でリスナーをクリアする

4. **ゲームインスタンスの破棄**: 各テスト後に `game.destroy(true)` でメモリリークを防ぐ

**参照元**: atelier-guild-rank-html/tests/integration/phaser/phase5/TurnCycleFirstHalf.test.ts

### 5.2 境界条件のテスト

- **日数上限**: `maxDay` に到達した場合のゲームオーバー判定
- **ゴールド下限**: ゴールドがマイナスになる場合のエラーハンドリング
- **ランク到達**: Sランク到達時のゲームクリア判定
- **依頼期限**: 期限切れ依頼の失敗処理

**参照元**: docs/tasks/atelier-guild-rank-phaser/TASK-0263.md

### 5.3 状態の一貫性維持

- フェーズ遷移後も状態が保持されることを確認
- 複数日にわたってゴールド・経験値が累積することを確認
- 受注した依頼が日を跨いで保持されることを確認

**参照元**:
- docs/tasks/atelier-guild-rank-phaser/TASK-0263.md
- atelier-guild-rank-html/tests/integration/phaser/phase5/TurnCycleFirstHalf.test.ts

### 5.4 カバレッジ目標

| テスト対象 | 目標カバレッジ |
|-----------|---------------|
| 日数進行 | 100% |
| ランク進行 | 90% |
| ゴールド管理 | 90% |
| 依頼生成 | 85% |

**参照元**: docs/tasks/atelier-guild-rank-phaser/TASK-0263.md

---

## 6. タスク詳細

### 6.1 完了条件

- [ ] 複数日進行の統合テストがパスする
- [ ] ランク進行の統合テストがパスする
- [ ] 日数制限の統合テストがパスする
- [ ] 経験値・ゴールド累積の検証テストがパスする
- [ ] 新規依頼生成の検証テストがパスする

**参照元**: docs/tasks/atelier-guild-rank-phaser/TASK-0263.md

### 6.2 依存タスク

- **前提タスク**: TASK-0261（1ターン前半テスト）, TASK-0262（1ターン後半テスト）
- **後続タスク**: TASK-0266（ゲームクリアテスト）, TASK-0267（ゲームオーバーテスト）

**参照元**: docs/tasks/atelier-guild-rank-phaser/TASK-0263.md

### 6.3 実装手順

1. `/tdd-requirements TASK-0263` - 詳細要件定義
2. `/tdd-testcases` - テストケース作成
3. `/tdd-red` - テスト実装（失敗）
4. `/tdd-green` - 最小実装
5. `/tdd-refactor` - リファクタリング
6. `/tdd-verify-complete` - 品質確認

**参照元**: docs/tasks/atelier-guild-rank-phaser/TASK-0263.md

---

## 7. 主要テストケース

### 7.1 日数進行テスト

- **TC-01**: 1日が正常に進行する
- **TC-02**: 複数日を連続して進行できる
- **TC-03**: 各日の開始時にAPが最大値に回復する
- **TC-04**: 各日の開始時に新しい依頼が生成される

### 7.2 経験値・ランク進行テスト

- **TC-05**: 依頼完了で経験値が蓄積される
- **TC-06**: 経験値が上限に達するとランクアップ可能になる
- **TC-07**: 複数日にわたってゴールドが累積する

### 7.3 日数制限テスト

- **TC-08**: 最大日数に近づくと警告が表示される
- **TC-09**: 最大日数を超えるとゲームオーバーになる
- **TC-10**: 最大日数前にSランクに到達するとゲームクリア

### 7.4 依頼生成テスト

- **TC-11**: 日が進むと新しい依頼が追加される
- **TC-12**: ランクに応じた依頼が生成される
- **TC-13**: 未完了の受注依頼は翌日も継続する
- **TC-14**: 期限切れの依頼は失敗扱いになる

**参照元**: docs/tasks/atelier-guild-rank-phaser/TASK-0263.md

---

## 8. 参考実装コード

### 8.1 advanceDay() ヘルパー関数（実装例）

```typescript
/**
 * 日を進める統合ヘルパー関数
 *
 * @param game - Phaserゲームインスタンス
 * @param eventBus - EventBusインスタンス
 */
async function advanceDay(game: any, eventBus: any): Promise<void> {
  const stateManager = game.registry.get('stateManager');

  // 現在のフェーズから納品フェーズまで進める
  const currentPhase = stateManager.getProgress().currentPhase;

  // フェーズ遷移マップ
  const phasesToAdvance: Record<string, string[]> = {
    'quest-accept': ['quest-accept', 'gathering', 'alchemy', 'delivery'],
    'gathering': ['gathering', 'alchemy', 'delivery'],
    'alchemy': ['alchemy', 'delivery'],
    'delivery': ['delivery'],
  };

  const phases = phasesToAdvance[currentPhase] || [];

  for (const phase of phases) {
    eventBus.emit('ui:phase:complete', { phase });
    await vi.waitFor(() => {
      const progress = stateManager.getProgress();
      return progress.currentPhase !== phase;
    }, { timeout: 5000, interval: 50 });
  }
}
```

### 8.2 simulateFullDay() ヘルパー関数（実装例）

```typescript
/**
 * 1日分のゲームプレイをシミュレート
 *
 * @param game - Phaserゲームインスタンス
 * @param eventBus - EventBusインスタンス
 * @param actions - 実行するアクション
 */
async function simulateFullDay(
  game: any,
  eventBus: any,
  actions?: {
    acceptQuests?: string[];
    gatherMaterials?: boolean;
    craftItems?: string[];
    deliverQuests?: string[];
  }
): Promise<void> {
  const stateManager = game.registry.get('stateManager');

  // 依頼受注フェーズ
  if (actions?.acceptQuests) {
    for (const questId of actions.acceptQuests) {
      eventBus.emit('ui:quest:accept:requested', { questId });
      await vi.waitFor(() => {
        const quests = stateManager.getQuests();
        return quests.accepted.some((q: any) => q.id === questId);
      });
    }
  }
  eventBus.emit('ui:phase:complete', { phase: 'quest-accept' });
  await waitForPhase(game, 'gathering');

  // 採取フェーズ
  if (actions?.gatherMaterials) {
    // 採取処理
  }
  eventBus.emit('ui:phase:complete', { phase: 'gathering' });
  await waitForPhase(game, 'alchemy');

  // 調合フェーズ
  if (actions?.craftItems) {
    // 調合処理
  }
  eventBus.emit('ui:phase:complete', { phase: 'alchemy' });
  await waitForPhase(game, 'delivery');

  // 納品フェーズ
  if (actions?.deliverQuests) {
    // 納品処理
  }
  eventBus.emit('ui:phase:complete', { phase: 'delivery' });
  await waitForPhase(game, 'quest-accept');
}
```

**参照元**: docs/tasks/atelier-guild-rank-phaser/TASK-0263.md

---

## 9. まとめ

このタスクは、複数日（複数ターン）にわたるゲーム進行が正しく動作することを検証する統合テストの実装です。

**重要ポイント**:
1. 既存の Phase5 統合テストを参考にする
2. EventBus を通じた非同期処理を適切に待機する
3. 境界条件（日数上限、ゴールド下限）を重点的にテストする
4. 状態の一貫性（フェーズ遷移後も保持）を検証する
5. ヘルパー関数（advanceDay, simulateFullDay）を活用して可読性を向上させる

**参照元**:
- docs/tasks/atelier-guild-rank-phaser/TASK-0263.md
- atelier-guild-rank-html/tests/integration/phaser/phase5/TurnCycleFirstHalf.test.ts
- atelier-guild-rank-html/tests/integration/phaser/phase5/TurnCycleSecondHalf.test.ts

---

**使用コンテキスト**: 90,492トークン
**コンテキスト残量**: 109,508トークン
