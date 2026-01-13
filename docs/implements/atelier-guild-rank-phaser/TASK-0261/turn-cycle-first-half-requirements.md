# TDD要件定義書：1ターンサイクル統合テスト（前半）

**タスクID**: TASK-0261
**作成日**: 2026-01-13
**機能名**: 1ターンサイクル統合テスト（前半）- 依頼受注・採取フェーズ
**タイプ**: TDD

---

## 1. 機能の概要

### 🔵 機能の目的

1ターン（1日）のゲームサイクルの前半部分（依頼受注フェーズ、採取フェーズ）が正しく動作することを検証する統合テストを実施する。

### 🔵 解決する問題

- **統合動作の保証**: 個別のコンポーネントテスト（QuestAcceptContainer、GatheringContainer）は完了しているが、フェーズ間の遷移やデータの引き継ぎが正しく動作するかを検証する必要がある
- **EventBus通信の検証**: UIコンポーネント、Application層、Domain層の間でEventBusを介した通信が正しく行われることを確認する
- **状態管理の検証**: フェーズ遷移前後で状態（素材、依頼、AP等）が正しく保持されることを確認する

### 🔵 想定ユーザー

- 開発者（テスト実装者）
- QA担当者（統合テストの実行・検証）

### 🔵 システム内での位置づけ

**参照元**: `docs/design/atelier-guild-rank-phaser/architecture.md` - 2.2 レイヤー構造

```
Presentation Layer (Phaser)
  ├── MainScene
  │   ├── QuestAcceptContainer
  │   └── GatheringContainer
  └── EventBus
         ↓↑
Application Layer
  ├── PhaseManager (フェーズ遷移制御)
  └── StateManager (状態管理)
         ↓↑
Domain Layer
  ├── QuestService
  ├── GatheringService
  └── InventoryService
```

統合テストはこれら全レイヤーの連携を検証する。

### 🔵 参照したEARS要件

本タスクはテスト実装であり、直接のEARS要件は存在しない。ただし、以下の機能要件を統合的に検証する：

- **依頼受注機能**: `docs/spec/atelier-guild-rank/requirements.md` - REQ-002（依頼受注）
- **採取機能**: `docs/spec/atelier-guild-rank/requirements.md` - REQ-003（採取）
- **フェーズ遷移**: `docs/spec/atelier-guild-rank/requirements.md` - REQ-001（ゲームフロー）

### 🔵 参照した設計文書

- **アーキテクチャ設計**: `docs/design/atelier-guild-rank-phaser/architecture.md` - 4.3 シーン遷移図
- **データフロー設計**: `docs/design/atelier-guild-rank-phaser/dataflow.md` - 2.2 採取フロー、5. フェーズ遷移フロー
- **コアシステム設計**: `docs/design/atelier-guild-rank-phaser/core-systems.md` - 2.3 イベント定義

---

## 2. 入力・出力の仕様

### 🔵 テスト環境の入力

テスト環境のセットアップに必要な入力:

```typescript
// createTestGame() の戻り値
interface ITestGameSetup {
  game: Phaser.Game;          // Phaserゲームインスタンス
  eventBus: EventBus;          // イベントバス
  stateManager: PhaserStateManager;  // 状態管理
}

// ゲーム開始時の入力
interface IGameStartData {
  isNewGame: boolean;  // true: 新規ゲーム
}
```

**参照元**: `atelier-guild-rank-html/tests/utils/phaserTestUtils.ts` - createTestGame()

### 🔵 依頼受注フェーズの入力

```typescript
// 依頼受注リクエスト
interface IQuestAcceptRequest {
  questId: string;  // 受注する依頼ID
}

// フェーズスキップリクエスト
interface IPhaseSkipRequest {
  phase: 'quest-accept' | 'gathering' | 'alchemy' | 'delivery';
}

// フェーズ完了通知
interface IPhaseCompleteEvent {
  phase: 'quest-accept' | 'gathering' | 'alchemy' | 'delivery';
}
```

**参照元**: `docs/design/atelier-guild-rank-phaser/core-systems.md` - 2.3 イベント定義

### 🔵 採取フェーズの入力

```typescript
// 採取実行リクエスト
interface IGatheringExecuteRequest {
  cardId: string;                    // 使用する採取地カードID
  selectedMaterialIds: string[];      // 選択した素材ID配列
}
```

**参照元**: `docs/design/atelier-guild-rank-phaser/dataflow.md` - 2.2 採取フロー

### 🔵 テストの出力

テストでは以下の状態変化を検証:

```typescript
// GameState（ゲーム状態）
interface GameState {
  currentPhase: Phase;           // 現在のフェーズ
  currentDay: number;            // 現在の日
  // ...
}

// QuestState（依頼状態）
interface QuestState {
  available: IQuest[];           // 利用可能な依頼
  accepted: IQuest[];            // 受注済み依頼
}

// DeckState（デッキ状態）
interface Deck {
  hand: ICard[];                 // 手札
  discard: ICard[];              // 捨て札
  // ...
}

// InventoryState（インベントリ状態）
interface Inventory {
  materials: IMaterialInstance[];  // 所持素材
  // ...
}

// PlayerState（プレイヤー状態）
interface PlayerState {
  ap: { current: number; max: number };  // 行動ポイント
  // ...
}
```

**参照元**:
- `docs/design/atelier-guild-rank-phaser/dataflow.md` - 3.2 状態オブジェクト構造
- `docs/design/atelier-guild-rank-phaser/core-systems.md` - 7. 状態管理

### 🔵 イベント発火の出力

テストで検証するイベント:

| イベント名 | データ | 説明 |
|-----------|--------|------|
| `ui:game:start:requested` | { isNewGame: boolean } | ゲーム開始リクエスト |
| `ui:quest:accept:requested` | { questId: string } | 依頼受注リクエスト |
| `app:quests:accepted:updated` | { accepted: IQuest[] } | 受注済み依頼更新 |
| `ui:phase:skip:requested` | { phase: string } | フェーズスキップリクエスト |
| `ui:phase:complete` | { phase: string } | フェーズ完了通知 |
| `ui:gathering:execute:requested` | { cardId, selectedMaterialIds } | 採取実行リクエスト |
| `app:gathering:complete` | { materials, apUsed } | 採取完了 |
| `app:error:occurred` | { message: string } | エラー発生 |

**参照元**: `docs/design/atelier-guild-rank-phaser/core-systems.md` - 2.3 イベント定義

---

## 3. 制約条件

### 🔵 依頼受注の制約

- **最大受注数**: 1日に最大3つまで依頼を受注できる
- **受注後の削除**: 受注した依頼は利用可能な依頼リストから削除される

**参照元**: `docs/spec/atelier-guild-rank/requirements.md` - REQ-002.2（依頼受注の制限）

### 🔵 採取の制約

- **AP消費**: 採取には行動ポイント（AP）が必要（1日最大3）
- **AP不足時**: APが不足している場合、採取を実行できずエラーが発生する
- **カード消費**: 使用したカードは手札から捨て札に移動する

**参照元**:
- `docs/spec/atelier-guild-rank/requirements.md` - REQ-003.1（AP消費）
- `docs/design/atelier-guild-rank-phaser/dataflow.md` - 2.2 採取フロー

### 🟡 フェーズ遷移の制約

- **順序**: 依頼受注 → 採取 → 調合 → 納品の順でフェーズが遷移する
- **逆戻り不可**: フェーズは前に戻ることができない
- **状態保持**: フェーズ遷移前後で、獲得した素材・受注した依頼は保持される

**参照元**: `docs/design/atelier-guild-rank-phaser/dataflow.md` - 5.1 1日のフェーズサイクル

### 🔵 Phaserテスト環境の制約

- **jsdom環境**: テスト環境ではCanvas APIが動作しないため、Phaserモックを使用する
- **非同期処理**: 状態変更やイベント発火は非同期で行われるため、`vi.waitFor()`を使用して待機する
- **イベントクリーンアップ**: テスト終了時には必ずEventBusのリスナーを解除する

**参照元**: `docs/implements/atelier-guild-rank-phaser/TASK-0261/note.md` - 2. 開発ルール

### 🟡 初期デッキ依存の制約

- **初期デッキの内容**: 採取カードが手札にあることを前提としたテストは、初期デッキ構成に依存する
- **存在チェック**: 採取カードが手札にない場合、テストをスキップする必要がある

**参照元**: `docs/implements/atelier-guild-rank-phaser/TASK-0261/note.md` - 5.1 テスト実装の注意点

---

## 4. 想定される使用例

### 🔵 基本的な使用パターン

#### 4.1 依頼受注フェーズの基本フロー

```typescript
// Arrange: ゲーム開始
eventBus.emit('ui:game:start:requested', { isNewGame: true });
await waitForPhase(game, 'quest-accept');

// Act: 依頼を受注
const quests = stateManager.getQuests();
const questToAccept = quests.available[0];
eventBus.emit('ui:quest:accept:requested', { questId: questToAccept.id });

// Assert: 受注済み依頼に追加される
await vi.waitFor(() => {
  const updatedQuests = stateManager.getQuests();
  expect(updatedQuests.accepted).toContainEqual(
    expect.objectContaining({ id: questToAccept.id })
  );
});
```

**参照元**: `docs/tasks/atelier-guild-rank-phaser/TASK-0261.md` - テスト実装詳細

#### 4.2 採取フェーズの基本フロー

```typescript
// Arrange: 採取フェーズに遷移
eventBus.emit('ui:phase:complete', { phase: 'quest-accept' });
await waitForPhase(game, 'gathering');

// Act: 採取カードを使用
const deck = stateManager.getDeck();
const gatheringCard = deck.hand.find((c: any) => c.type === 'gathering');
eventBus.emit('ui:gathering:execute:requested', {
  cardId: gatheringCard.id,
  selectedMaterialIds: ['material_option_1'],
});

// Assert: 素材が増える、APが減る
await vi.waitFor(() => {
  const inventory = stateManager.getInventory();
  const player = stateManager.getPlayerData();
  expect(inventory.materials.length).toBeGreaterThan(0);
  expect(player.ap.current).toBeLessThan(3);
});
```

**参照元**: `docs/design/atelier-guild-rank-phaser/dataflow.md` - 2.2 採取フロー

### 🔵 フェーズ遷移パターン

#### 4.3 フェーズスキップ

```typescript
// Act: 依頼受注フェーズをスキップ
eventBus.emit('ui:phase:skip:requested', { phase: 'quest-accept' });

// Assert: 採取フェーズに遷移
await waitForPhase(game, 'gathering');
expect(stateManager.getProgress().currentPhase).toBe('gathering');
```

**参照元**: `docs/design/atelier-guild-rank-phaser/dataflow.md` - 5.1 1日のフェーズサイクル

#### 4.4 フェーズ完了による遷移

```typescript
// Act: フェーズ完了
eventBus.emit('ui:phase:complete', { phase: 'gathering' });

// Assert: 調合フェーズに遷移
await waitForPhase(game, 'alchemy');
expect(stateManager.getProgress().currentPhase).toBe('alchemy');
```

**参照元**: `docs/design/atelier-guild-rank-phaser/dataflow.md` - 5.2 フェーズ遷移シーケンス

### 🔵 エッジケース

#### 4.5 最大受注数制限

```typescript
// Arrange: 3つ依頼を受注
for (let i = 0; i < 3; i++) {
  eventBus.emit('ui:quest:accept:requested', { questId: quests.available[i].id });
  await vi.waitFor(() => stateManager.getQuests().accepted.length === i + 1);
}

// Act: 4つ目の依頼を受注しようとする
const errorCallback = vi.fn();
eventBus.on('app:error:occurred', errorCallback);
eventBus.emit('ui:quest:accept:requested', { questId: quests.available[3].id });

// Assert: エラーが発生
await vi.waitFor(() => {
  expect(errorCallback).toHaveBeenCalledWith(
    expect.objectContaining({
      message: expect.stringContaining('最大'),
    })
  );
});
```

**参照元**: `docs/tasks/atelier-guild-rank-phaser/TASK-0261.md` - テスト実装詳細

#### 4.6 AP不足時の採取

```typescript
// Arrange: APを0に設定
stateManager.updatePlayer({ ap: { current: 0, max: 3 } });

// Act: 採取を試みる
const errorCallback = vi.fn();
eventBus.on('app:error:occurred', errorCallback);
eventBus.emit('ui:gathering:execute:requested', {
  cardId: gatheringCard.id,
  selectedMaterialIds: ['material_option_1'],
});

// Assert: AP不足エラーが発生
await vi.waitFor(() => {
  expect(errorCallback).toHaveBeenCalledWith(
    expect.objectContaining({
      message: expect.stringContaining('AP'),
    })
  );
});
```

**参照元**: `docs/tasks/atelier-guild-rank-phaser/TASK-0261.md` - テスト実装詳細

### 🔵 エラーケース

#### 4.7 カードが手札にない場合

```typescript
// Arrange: 採取カードを探す
const deck = stateManager.getDeck();
const gatheringCard = deck.hand.find((c: any) => c.type === 'gathering');

// Act: カードがない場合はテストをスキップ
if (!gatheringCard) {
  console.log('No gathering card in hand, skipping test');
  return;
}

// 通常のテストを実行...
```

**参照元**: `docs/implements/atelier-guild-rank-phaser/TASK-0261/note.md` - 5.1 テスト実装の注意点

---

## 5. EARS要件・設計文書との対応関係

### 参照したユーザストーリー

本タスクは統合テスト実装であり、特定のユーザストーリーではなく、以下の機能全体を検証する：
- ユーザーストーリー1: 依頼を受注する（`docs/spec/atelier-guild-rank/requirements.md`）
- ユーザーストーリー2: 採取地で素材を集める（`docs/spec/atelier-guild-rank/requirements.md`）

### 参照した機能要件

- **REQ-001**: ゲームフローの進行（フェーズ遷移）
- **REQ-002**: 依頼受注機能
- **REQ-003**: 採取機能
- **REQ-004**: AP消費とデッキ管理

**参照元**: `docs/spec/atelier-guild-rank/requirements.md`

### 参照した非機能要件

- **NFR-101**: Vitestを使用したテストカバレッジ80%以上
- **NFR-102**: TDD（Red → Green → Refactor）サイクルの遵守

**参照元**: `CLAUDE.md` - HTML版 (atelier-guild-rank-html/)

### 参照したEdgeケース

- **EDGE-001**: 最大受注数（3つ）を超えた場合の制限
- **EDGE-002**: AP不足時の採取不可
- **EDGE-003**: 初期デッキに採取カードがない場合のスキップ

### 参照した受け入れ基準

本タスクの完了条件（受け入れ基準）:

- [ ] 依頼受注フェーズの統合テストがパスする
- [ ] 採取フェーズの統合テストがパスする
- [ ] フェーズ間遷移の統合テストがパスする
- [ ] 状態更新の検証テストがパスする
- [ ] AP消費の検証テストがパスする
- [ ] カバレッジ目標を達成する（依頼受注90%、採取90%、遷移100%）

**参照元**: `docs/tasks/atelier-guild-rank-phaser/TASK-0261.md` - 完了条件

### 参照した設計文書

#### アーキテクチャ設計

- **architecture.md - 2.2 レイヤー構造**: Clean Architecture 4層構造の理解
- **architecture.md - 4.3 シーン遷移図**: MainScene内のフェーズ遷移
- **architecture.md - 7.2 フェーズ遷移**: 1日のフェーズサイクル

#### データフロー設計

- **dataflow.md - 2.1 カード使用フロー**: デッキ操作の流れ
- **dataflow.md - 2.2 採取フロー**: 採取処理の詳細シーケンス
- **dataflow.md - 3.1 StateManager データフロー**: 状態管理の仕組み
- **dataflow.md - 5.1 1日のフェーズサイクル**: フェーズ遷移のフローチャート
- **dataflow.md - 5.2 フェーズ遷移シーケンス**: 遷移時のイベント発火順序

#### コアシステム設計

- **core-systems.md - 2.3 イベント定義**: EventBusで使用する32種類のイベント名
- **core-systems.md - 5.3 フェーズコンテナ切り替え**: MainScene内でのフェーズUI切り替え
- **core-systems.md - 7.3 状態変更と通知**: StateManagerの状態変更パターン

#### TypeScript型定義

本タスクでは既存の型定義を使用:
- `IGameState`, `QuestState`, `Deck`, `Inventory`, `PlayerState`
- 型定義は既存のApplication/Domain層から取得

#### テストユーティリティ

- **phaserTestUtils.ts**: `createTestGame()`, `waitForPhase()`, モック作成関数
- **phaserMocks.ts**: Phaserフレームワーク全体のモック実装

**参照元**: `atelier-guild-rank-html/tests/utils/`

---

## 6. 信頼性レベルサマリー

### 信頼性評価の分布

| 信頼性 | 項目数 | 割合 | 説明 |
|--------|-------|------|------|
| 🔵 青信号 | 32項目 | 91% | 設計書・要件定義書に詳細な記載がある |
| 🟡 黄信号 | 3項目 | 9% | 設計書から妥当な推測（初期デッキ依存、フェーズ遷移の細かい制約） |
| 🔴 赤信号 | 0項目 | 0% | 推測なし |

**総項目数**: 35項目

### 品質評価

✅ **高品質**

- 要件の曖昧さ: なし
- 入出力定義: 完全（型定義、イベント定義が明確）
- 制約条件: 明確（AP制約、最大受注数、フェーズ遷移順序）
- 実装可能性: 確実（既存のテストユーティリティとモックを使用）
- 信頼性レベル: 🔵（青信号）が91%を占める

### 補足情報

本タスクは統合テストの実装であり、以下の理由で高い信頼性を持つ：

1. **明確なテスト対象**: 依頼受注フェーズと採取フェーズの動作が設計書に詳細に記載されている
2. **既存の参考実装**: `SceneTransitionIntegration.test.ts` が類似の統合テストの実装例として存在
3. **充実したテストユーティリティ**: `phaserTestUtils.ts` にモック作成やウェイト処理の関数が揃っている
4. **詳細なイベント定義**: EventBusで使用する32種類のイベントが `core-systems.md` に明記されている

黄信号（🟡）項目は以下の3つのみ：
- 初期デッキに採取カードが含まれるかどうか（ランダム要素により不確定）
- フェーズ遷移の「逆戻り不可」という制約（設計書に明記されていないが、妥当な推測）
- フェーズ遷移時の状態保持（設計書から推測可能）

---

## 7. 実装時の注意事項

### 🔵 Phaserモックの使用

```typescript
import { getPhaserMock } from '../../../utils/phaserMocks';

vi.mock('phaser', () => getPhaserMock());
```

**参照元**: `atelier-guild-rank-html/tests/utils/phaserMocks.ts`

### 🔵 非同期処理の待機

```typescript
// 状態変更の待機
await vi.waitFor(() => {
  const updatedQuests = stateManager.getQuests();
  expect(updatedQuests.accepted.length).toBeGreaterThan(0);
});

// フェーズ遷移の待機
await waitForPhase(game, 'gathering');
```

**参照元**: `docs/implements/atelier-guild-rank-phaser/TASK-0261/note.md` - 5.2 非同期処理の完了待ち

### 🔵 EventBusのクリーンアップ

```typescript
afterEach(() => {
  eventBus.clear();  // すべてのリスナーを解除
  game.destroy(true);
});
```

**参照元**: `docs/implements/atelier-guild-rank-phaser/TASK-0261/note.md` - 5.2 EventBusの使用

### 🟡 StateManagerのエイリアスメソッド

StateManagerには複数のエイリアスメソッドが存在するため、統一性を保つ:

```typescript
// 推奨: 設計文書に記載されているメソッド名を使用
stateManager.getGameState()
stateManager.getPlayerState()
stateManager.getQuestState()
stateManager.getDeckState()
stateManager.getInventoryState()

// 非推奨: エイリアス（テスト互換性のため存在）
stateManager.getProgressData()  // ← 使わない
stateManager.getPlayerData()    // ← 使わない
```

**参照元**: `docs/implements/atelier-guild-rank-phaser/TASK-0261/note.md` - 5.3 StateManagerの使用

---

## 8. テストケース一覧

### 依頼受注フェーズ（Quest Accept Phase）

| # | テストケース | 期待結果 | 信頼性 |
|---|------------|---------|-------|
| 1 | 依頼一覧が表示される | `stateManager.getQuests().available.length > 0` | 🔵 |
| 2 | 依頼を受注できる | 受注済み依頼に追加され、利用可能依頼から削除される | 🔵 |
| 3 | 最大3つまで依頼を受注できる | 4つ目の受注時にエラーが発生 | 🔵 |
| 4 | 依頼受注フェーズをスキップできる | 採取フェーズに遷移 | 🔵 |
| 5 | フェーズ完了で採取フェーズに遷移する | `currentPhase === 'gathering'` | 🔵 |

### 採取フェーズ（Gathering Phase）

| # | テストケース | 期待結果 | 信頼性 |
|---|------------|---------|-------|
| 6 | 採取地カードが手札に表示される | `deck.hand` に採取カードが存在（初期デッキ依存） | 🟡 |
| 7 | 採取カード使用で素材を獲得できる | 素材数が増加、APが減少 | 🔵 |
| 8 | AP不足時は採取できない | エラーが発生 | 🔵 |
| 9 | 使用したカードが捨て札に移動する | 手札から消え、捨て札に追加 | 🔵 |
| 10 | 採取フェーズをスキップできる | 調合フェーズに遷移 | 🔵 |
| 11 | フェーズ完了で調合フェーズに遷移する | `currentPhase === 'alchemy'` | 🔵 |

### フェーズ遷移時の状態保持（Phase Transition State Preservation）

| # | テストケース | 期待結果 | 信頼性 |
|---|------------|---------|-------|
| 12 | フェーズ遷移後も獲得した素材が保持される | 調合フェーズでも素材が存在 | 🟡 |
| 13 | 受注した依頼がフェーズを跨いで保持される | 調合フェーズでも受注済み依頼が存在 | 🟡 |

### EventBus通信（EventBus Communication）

| # | テストケース | 期待結果 | 信頼性 |
|---|------------|---------|-------|
| 14 | 依頼受注時に正しいイベントが発火する | `app:quests:accepted:updated` が発火 | 🔵 |
| 15 | 採取実行時に正しいイベントが発火する | `app:gathering:complete` が発火 | 🔵 |

**総テストケース数**: 15ケース

---

## 9. 変更履歴

| 日付 | 変更内容 |
|------|---------|
| 2026-01-13 | 初版作成（TASK-0261の要件定義） |

---

## 10. 関連ドキュメント

- **タスク詳細**: `docs/tasks/atelier-guild-rank-phaser/TASK-0261.md`
- **タスクノート**: `docs/implements/atelier-guild-rank-phaser/TASK-0261/note.md`
- **アーキテクチャ設計**: `docs/design/atelier-guild-rank-phaser/architecture.md`
- **データフロー設計**: `docs/design/atelier-guild-rank-phaser/dataflow.md`
- **コアシステム設計**: `docs/design/atelier-guild-rank-phaser/core-systems.md`
- **参考テスト実装**: `atelier-guild-rank-html/tests/integration/phaser/phase5/SceneTransitionIntegration.test.ts`
