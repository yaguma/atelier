# TASK-0261: 1ターンサイクル統合テスト（前半）実装ノート

**作成日**: 2026-01-13
**タスクID**: TASK-0261
**タスクタイプ**: TDD
**推定工数**: 4時間
**フェーズ**: Phase 5 - 統合テスト・最適化・仕上げ

---

## 1. 技術スタック

### フレームワーク・ライブラリ
- **TypeScript**: 5.x（メイン言語）
- **Phaser**: 3.87+（ゲームフレームワーク）
- **rexUI Plugin**: 最新（UIコンポーネント）
- **Vite**: 5.x（ビルドツール）
- **Vitest**: テストフレームワーク

### アーキテクチャパターン
- **Clean Architecture**: 4層構造（Presentation/Application/Domain/Infrastructure）
- **Scene-based Architecture**: Phaserのシーン管理を活用
- **イベント駆動設計**: EventBusによる疎結合な通信
- **State Machine**: フェーズ管理に状態機械パターンを適用

**参照元**:
- `CLAUDE.md`
- `docs/design/atelier-guild-rank-phaser/architecture.md`

---

## 2. 開発ルール

### テスト規約
- テストファイルは `tests/integration/phaser/phase5/` 配下に配置
- ファイル名: `TurnCycleFirstHalf.test.ts`
- Vitestを使用
- TDD（Red → Green → Refactor）で開発
- カバレッジ目標: 依頼受注フェーズ 90%、採取フェーズ 90%、フェーズ遷移 100%

### コマンド
```bash
cd atelier-guild-rank-html

# テスト実行（`--`オプションは使用しない）
npm run test

# 単一テストファイル実行
npm run test tests/integration/phaser/phase5/TurnCycleFirstHalf.test.ts

# カバレッジ付きテスト
npm run test:coverage
```

### Phaser固有の注意点
- jsdom環境ではCanvas APIが動作しないため、Phaserモックを使用する
- シーン遷移はEventBus経由で実装する
- イベントリスナーは必ずクリーンアップする（メモリリーク防止）
- 非同期処理の完了待ちには `vi.waitFor()` を使用する

**参照元**:
- `CLAUDE.md`
- `docs/design/atelier-guild-rank-phaser/core-systems.md`

---

## 3. 関連実装

### 3.1 テストユーティリティ

#### phaserTestUtils.ts
モックEventBus、モックStateManagerなどのテストヘルパー関数を提供。

**場所**: `atelier-guild-rank-html/tests/utils/phaserTestUtils.ts`

**主要な関数**:
```typescript
// モックEventBusを作成
createMockEventBus(): EventBusモック

// モックStateManagerを作成
createMockStateManager(): StateManagerモック

// モックFlowManagerを作成
createMockFlowManager(): FlowManagerモック

// モックSceneを作成
createMockScene(): Sceneモック

// モックLocalStorageを作成
createMockStorage(): Storageモック
```

**参照元**: `atelier-guild-rank-html/tests/utils/phaserTestUtils.ts`

#### phaserMocks.ts
Phaserフレームワーク全体のモック実装。

**場所**: `atelier-guild-rank-html/tests/utils/phaserMocks.ts`

**参照元**: `atelier-guild-rank-html/tests/utils/phaserMocks.ts`

### 3.2 StateManager実装

#### PhaserStateManager
既存のStateManagerをラップし、状態変更時にEventBusへ自動通知する。

**場所**: `atelier-guild-rank-html/src/game/state/PhaserStateManager.ts`

**主要なメソッド**:
```typescript
// 状態取得
getGameState(): GameState
getPlayerState(): PlayerState
getDeckState(): Deck
getInventoryState(): Inventory
getQuestState(): QuestState

// 状態更新（EventBusへ自動通知）
updateGameState(state: GameState): void
updatePlayerState(state: PlayerState): void
updateDeckState(state: Deck): void
updateInventoryState(state: Inventory): void
updateQuestState(state: QuestState): void

// リスナー管理
subscribe(path: string, listener: StateChangeListener): () => void
```

**参照元**: `atelier-guild-rank-html/src/game/state/PhaserStateManager.ts`

### 3.3 既存の統合テスト例

#### SceneTransitionIntegration.test.ts
全シーン遷移の統合テストの実装例。テストの書き方、モックの使い方、イベント発火の確認方法などを参考にできる。

**場所**: `atelier-guild-rank-html/tests/integration/phaser/phase5/SceneTransitionIntegration.test.ts`

**参考ポイント**:
- テスト環境のセットアップ方法（`createTestGame()`）
- EventBusを使ったイベント発火とリスナー登録
- `waitForScene()`を使った非同期待機
- `vi.waitFor()`を使った状態変更の待機
- beforeEach/afterEachでのクリーンアップ

**参照元**: `atelier-guild-rank-html/tests/integration/phaser/phase5/SceneTransitionIntegration.test.ts`

---

## 4. 設計文書

### 4.1 アーキテクチャ設計書

Phaser版のシステムアーキテクチャを定義。レイヤー構造、シーン構成、Phaser-Application層連携を記載。

**主要な内容**:
- 4層アーキテクチャ（Presentation/Application/Domain/Infrastructure）
- Phaserシーン構成（Boot/Title/Main/Shop/RankUp/GameOver/GameClear）
- シーンライフサイクルとイベント連携
- MainSceneのフェーズUI構造（依頼受注/採取/調合/納品）

**参照元**: `docs/design/atelier-guild-rank-phaser/architecture.md`

### 4.2 データフロー設計書

Phaserを使用したゲームのデータフローを定義。レイヤー間のデータの流れ、イベント駆動のパターン、状態管理を中心に記載。

**主要な内容**:
- ユーザーアクションフロー（カード使用、採取、調合、納品）
- 状態管理フロー（StateManager、状態変更パターン）
- フェーズ遷移フロー（1日のフェーズサイクル）
- EventBus通知パターン

**参照元**: `docs/design/atelier-guild-rank-phaser/dataflow.md`

### 4.3 コアシステム設計書

Phaserを使用したゲームの核となるシステムの詳細設計。ドメインレイヤーのサービスは既存HTML版と共通で、Phaser固有のGame層とイベント連携を中心に記載。

**主要な内容**:
- EventBus（イベント駆動の中核、32種類のイベント定義）
- SceneManager（シーン遷移とオーバーレイ管理）
- UIFactory（rexUIコンポーネント生成）
- PhaseContainerシステム（フェーズ別UI切り替え）
- StateManager（状態管理とEventBus通知）

**参照元**: `docs/design/atelier-guild-rank-phaser/core-systems.md`

---

## 5. 注意事項

### 5.1 テスト実装の注意点

#### 初期デッキの内容に依存するテスト
- 採取カードが手札にあることを前提としたテストは、初期デッキ構成に依存する
- カードが手札にない場合はテストをスキップする（`if (!gatheringCard) return;`）

#### 非同期処理の完了待ち
- `vi.waitFor()` を使用して状態変更を待機する
- `waitForPhase()` を使用してフェーズ遷移を待機する
- タイムアウト設定に注意（デフォルト: 1000ms）

#### 状態の一貫性検証
- フェーズ遷移前後で状態が正しく保持されているか確認する
- 特に、素材獲得後の遷移、依頼受注後の遷移を検証する

### 5.2 EventBusの使用

#### イベント名の一貫性
以下のイベントを使用する（core-systems.md - 2.3 イベント定義に基づく）:

**ゲームフロー**:
- `ui:game:start:requested` - ゲーム開始リクエスト
- `ui:phase:complete` - フェーズ完了
- `ui:phase:skip:requested` - フェーズスキップ

**依頼関連**:
- `ui:quest:accept:requested` - 依頼受注リクエスト
- `app:quests:accepted:updated` - 受注済み依頼更新

**採取関連**:
- `ui:gathering:execute:requested` - 採取実行リクエスト
- `app:gathering:complete` - 採取完了

**エラー関連**:
- `app:error:occurred` - エラー発生

#### イベントのクリーンアップ
- afterEach() で `eventBus.clear()` を呼び出し、すべてのリスナーを解除する
- メモリリークを防ぐため、必ずクリーンアップする

### 5.3 StateManagerの使用

#### エイリアスメソッド
StateManagerには複数のエイリアスメソッドが存在する（テスト互換性のため）:

```typescript
// ゲーム状態取得
getGameState() / getProgressData() / getProgress()

// プレイヤー状態取得
getPlayerState() / getPlayerData()

// クエスト状態取得
getQuestState() / getQuests()

// デッキ状態取得
getDeckState() / getDeck()

// インベントリ状態取得
getInventoryState() / getInventory()
```

テストコードでは統一性を保つため、設計文書に記載されているメソッド名を使用することを推奨。

**参照元**: `atelier-guild-rank-html/src/game/state/PhaserStateManager.ts`

### 5.4 Phaserモックの使用

テスト環境ではCanvas APIが動作しないため、必ずPhaserモックを使用する:

```typescript
import { getPhaserMock } from '../../../utils/phaserMocks';

vi.mock('phaser', () => getPhaserMock());
```

**参照元**: `atelier-guild-rank-html/tests/utils/phaserMocks.ts`

---

## 6. 実装の進め方

### 6.1 テストケースの構成

TASK-0261.mdに記載されたテストケースを以下の順序で実装する:

1. **Quest Accept Phase（依頼受注フェーズ）**
   - 依頼一覧表示の確認
   - 依頼受注機能の確認
   - 最大受注数制限の確認
   - フェーズスキップ機能の確認
   - フェーズ完了による遷移の確認

2. **Gathering Phase（採取フェーズ）**
   - 採取地カード表示の確認
   - 採取実行による素材獲得の確認
   - AP消費の確認
   - カード移動（手札→捨て札）の確認
   - フェーズスキップ機能の確認
   - フェーズ完了による遷移の確認

3. **Phase Transition State Preservation（フェーズ遷移時の状態保持）**
   - 獲得した素材の保持確認
   - 受注した依頼の保持確認

4. **EventBus Communication（EventBus通信）**
   - 依頼受注時のイベント発火確認
   - 採取実行時のイベント発火確認

### 6.2 TDDサイクル

1. **Red**: テストを実装し、失敗することを確認する
2. **Green**: テストをパスする最小限の実装を行う
3. **Refactor**: コードを整理し、品質を向上させる
4. **Verify**: カバレッジを確認し、目標（90%以上）を達成する

### 6.3 完了条件

- [ ] 依頼受注フェーズの統合テストがパスする
- [ ] 採取フェーズの統合テストがパスする
- [ ] フェーズ間遷移の統合テストがパスする
- [ ] 状態更新の検証テストがパスする
- [ ] AP消費の検証テストがパスする
- [ ] カバレッジ目標を達成する（依頼受注90%、採取90%、遷移100%）

---

## 7. 関連タスク

### 前提タスク
- **TASK-0219**: QuestAcceptContainerテスト
- **TASK-0225**: GatheringContainerテスト

### 後続タスク
- **TASK-0262**: 1ターンサイクル統合テスト（後半）

---

## 8. 参考リソース

### ドキュメント
- プロジェクト概要: `CLAUDE.md`
- タスク詳細: `docs/tasks/atelier-guild-rank-phaser/TASK-0261.md`
- タスク概要: `docs/tasks/atelier-guild-rank-phaser/overview.md`
- アーキテクチャ設計: `docs/design/atelier-guild-rank-phaser/architecture.md`
- データフロー設計: `docs/design/atelier-guild-rank-phaser/dataflow.md`
- コアシステム設計: `docs/design/atelier-guild-rank-phaser/core-systems.md`

### 実装ファイル
- テストユーティリティ: `atelier-guild-rank-html/tests/utils/phaserTestUtils.ts`
- Phaserモック: `atelier-guild-rank-html/tests/utils/phaserMocks.ts`
- PhaserStateManager: `atelier-guild-rank-html/src/game/state/PhaserStateManager.ts`
- 統合テスト例: `atelier-guild-rank-html/tests/integration/phaser/phase5/SceneTransitionIntegration.test.ts`

---

## 9. 変更履歴

| 日付 | 変更内容 |
|------|---------|
| 2026-01-13 | 初版作成（TASK-0261実装のためのコンテキスト収集） |
