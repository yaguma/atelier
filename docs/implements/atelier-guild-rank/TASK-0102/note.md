# TASK-0102: ゲームフローマネージャー - タスクノート

**作成日**: 2026-01-05
**タスクID**: TASK-0102
**種別**: TDD
**要件名**: atelier-guild-rank

---

## 1. 技術スタック

### フレームワーク・ライブラリ

| 技術 | バージョン | 用途 |
|------|-----------|------|
| TypeScript | 5.x | メイン言語 |
| Vite | 6.x | ビルドツール |
| Vitest | 2.1.x | テストフレームワーク |

### アーキテクチャパターン

- **Clean Architecture**: 4層構造（Presentation / Application / Domain / Infrastructure）
- **イベント駆動設計**: EventBusによる疎結合な通信
- **State Machine**: フェーズ管理に状態機械パターンを適用

### 参照元

- `docs/design/atelier-guild-rank/architecture.md`
- `atelier-guild-rank-html/package.json`
- `atelier-guild-rank-html/tsconfig.json`

---

## 2. 開発ルール

### コーディング規約

- **言語**: TypeScript（strict mode有効）
- **パスエイリアス**:
  - `@domain/*` → `src/domain/*`
  - `@application/*` → `src/application/*`
  - `@infrastructure/*` → `src/infrastructure/*`
  - `@presentation/*` → `src/presentation/*`
- **イミュータブル設計**: 状態は不変オブジェクトとして管理
- **関数型アプローチ**: エンティティはファクトリ関数とヘルパー関数で操作

### テスト規約

- **テストファイル配置**: `tests/unit/domain/` 配下
- **ファイル名**: `{EntityName}.test.ts`
- **フレームワーク**: Vitest (globals: true)
- **TDDサイクル**: Red → Green → Refactor
- **カバレッジ基準**: 80%以上（lines, functions, branches, statements）
- **テストパターン**: describe/it構造、vi.fn()でモック

### テストコマンド

```bash
# テスト実行（`--`オプションは使用禁止）
npm run test

# 単一テストファイル実行
npm run test tests/unit/domain/services/GameFlowManager.test.ts

# カバレッジ付きテスト
npm run test:coverage
```

### 参照元

- `atelier-guild-rank-html/vitest.config.ts`
- `tests/unit/domain/events/GameEvents.test.ts`

---

## 3. 関連実装

### 依存タスク

| タスクID | 内容 | ファイルパス |
|---------|------|-------------|
| TASK-0099 | ゲーム状態エンティティ | `atelier-guild-rank-html/src/domain/game/GameState.ts` |
| TASK-0100 | プレイヤー状態エンティティ | `atelier-guild-rank-html/src/domain/player/PlayerState.ts` |
| TASK-0101 | ゲームイベント定義 | `atelier-guild-rank-html/src/domain/events/GameEvents.ts` |

### GameState エンティティ（TASK-0099）

```typescript
// 主要インターフェース
interface GameState {
  readonly currentPhase: GamePhase;
  readonly currentDay: number;
  readonly isInPromotionTest: boolean;
  readonly promotionTestDaysRemaining: number | null;
  readonly gameProgress: GameProgress;
}

// 主要関数
createGameState(options?: GameStateOptions): GameState
updateGameState(state: GameState, updates: Partial<GameStateOptions>): GameState
advancePhase(state: GameState): GameState
advanceDay(state: GameState): GameState
startPromotionTest(state: GameState, dayLimit: number): GameState
decrementPromotionTestDays(state: GameState): GameState
setGameProgress(state: GameState, progress: GameProgress): GameState
endPromotionTest(state: GameState): GameState
```

### PlayerState エンティティ（TASK-0100）

```typescript
// 主要インターフェース
interface PlayerState {
  readonly rank: GuildRank;
  readonly gold: number;
  readonly promotionGauge: number;
  readonly promotionGaugeMax: number;
  readonly rankDaysRemaining: number;
  readonly artifacts: readonly string[];
  readonly actionPoints: number;
  readonly actionPointsMax: number;
}

// 主要関数
createPlayerState(options?: PlayerStateOptions): PlayerState
updatePlayerState(state: PlayerState, updates: Partial<PlayerStateOptions>): PlayerState
addGold(state: PlayerState, amount: number): PlayerState
subtractGold(state: PlayerState, amount: number): PlayerState
addPromotionGauge(state: PlayerState, amount: number): PlayerState
addArtifact(state: PlayerState, artifactId: string): PlayerState
useActionPoint(state: PlayerState, amount: number): PlayerState
resetActionPoints(state: PlayerState): PlayerState
setRank(state: PlayerState, rank: GuildRank): PlayerState
decrementRankDaysRemaining(state: PlayerState): PlayerState
```

### イベントバス（TASK-0101）

```typescript
// イベントタイプ
enum GameEventType {
  PHASE_CHANGED, DAY_ADVANCED, QUEST_ACCEPTED, QUEST_COMPLETED,
  ITEM_CRAFTED, RANK_UP_TEST_STARTED, RANK_UP, GAME_CLEAR, GAME_OVER
}

// イベントバスインターフェース
interface EventBus {
  subscribe<T extends GameEvent>(eventType: T['type'], handler: EventHandler<T>): Unsubscribe;
  publish<T extends GameEvent>(event: T): void;
  unsubscribeAll(eventType?: GameEventType): void;
}

createEventBus(): EventBus
```

### 既存ドメインサービス

| サービス名 | ファイルパス | 説明 |
|-----------|-------------|------|
| DeckService | `atelier-guild-rank-html/src/domain/services/DeckService.ts` | デッキ操作 |
| InventoryService | `atelier-guild-rank-html/src/domain/services/InventoryService.ts` | インベントリ管理 |
| DraftGatheringService | `atelier-guild-rank-html/src/domain/services/DraftGatheringService.ts` | 採取処理 |
| AlchemyService | `atelier-guild-rank-html/src/domain/services/AlchemyService.ts` | 調合処理 |
| QuestJudgmentService | `atelier-guild-rank-html/src/domain/services/QuestJudgmentService.ts` | 依頼判定 |
| RankManagementService | `atelier-guild-rank-html/src/domain/services/RankManagementService.ts` | ランク管理 |
| PromotionTestService | `atelier-guild-rank-html/src/domain/services/PromotionTestService.ts` | 昇格試験 |
| ShopService | `atelier-guild-rank-html/src/domain/services/ShopService.ts` | ショップ |

### 参照元

- `atelier-guild-rank-html/src/domain/game/GameState.ts`
- `atelier-guild-rank-html/src/domain/player/PlayerState.ts`
- `atelier-guild-rank-html/src/domain/events/GameEvents.ts`
- `atelier-guild-rank-html/src/domain/common/types.ts`

---

## 4. 設計文書

### GameFlowManager 設計（architecture.md より）

```typescript
class GameFlowManager {
  // ゲーム開始
  startNewGame(): void;
  // コンティニュー
  continueGame(): void;
  // ゲーム終了判定
  checkGameEnd(): GameEndResult | null;
  // 日終了処理
  endDay(): void;
  // ランクアップ処理
  rankUp(): void;
}
```

### フェーズ遷移図

```
QUEST_ACCEPT → GATHERING → ALCHEMY → DELIVERY → (日終了)
```

### 日終了フロー

1. 残り日数を減らす
2. 依頼期限を更新
3. 期限切れ依頼を削除
4. 手札を補充（refillHand）
5. 行動ポイントをリセット（actionPoints = max）
6. ゲーム終了判定（日数切れ / HP0 / 継続）
7. セーブデータ保存
8. DAY_ENDEDイベント発行

### システム間依存関係

```
GameFlowManager
  ├── PhaseManager
  ├── StateManager (GameState, PlayerState)
  ├── EventBus
  ├── DeckService
  ├── QuestService
  └── RankService
```

### 参照元

- `docs/design/atelier-guild-rank/architecture.md`
- `docs/design/atelier-guild-rank/core-systems.md`

---

## 5. 注意事項

### 技術的制約

- **イミュータブル設計**: GameState、PlayerStateは不変オブジェクト。更新は新しいインスタンスを返す
- **イベント駆動**: 状態変更時はEventBusを通じてイベントを発行
- **レイヤー依存**: Application層はDomain層に依存可能。Domain層はInfrastructure層のインターフェース経由でのみ依存
- **フェーズ順序固定**: QUEST_ACCEPT → GATHERING → ALCHEMY → DELIVERY の順序は厳守

### 実装ポイント

1. **Application層に配置**: `atelier-guild-rank-html/src/application/managers/GameFlowManager.ts`
2. **状態管理**: GameStateとPlayerStateの両方を管理
3. **イベント発行**: フェーズ変更、日数進行、ゲームクリア/オーバー時にイベント発行
4. **エラーハンドリング**: 無効なフェーズ遷移を防止

### ゲームフロー

```
新規ゲーム開始
  ↓
日ループ開始
  ↓
フェーズループ（QUEST_ACCEPT → GATHERING → ALCHEMY → DELIVERY）
  ↓
日終了処理
  ↓
[昇格ゲージMAX] → 昇格試験開始
[日数切れ] → ゲームオーバー
[Sランク到達] → ゲームクリア
[継続] → 次の日へ
```

### 参照元

- `docs/design/atelier-guild-rank/architecture.md`
- `docs/tasks/atelier-guild-rank-phase2.md`

---

## 6. 期待されるテストケース

設計文書（Phase 2タスク定義）には明示的なテストケースが記載されていないため、architecture.mdの設計に基づいて以下を推奨:

```typescript
describe('GameFlowManager', () => {
  describe('ゲーム開始', () => {
    it('新規ゲームを開始できる');
    it('初期状態が正しく設定される');
    it('ゲーム開始時にイベントが発行される');
  });

  describe('フェーズ遷移', () => {
    it('次のフェーズに進める');
    it('フェーズ遷移時にイベントが発行される');
    it('DELIVERYフェーズ後に日終了処理が実行される');
    it('無効なフェーズ遷移は拒否される');
  });

  describe('日終了処理', () => {
    it('日数が進む');
    it('行動ポイントがリセットされる');
    it('日終了時にイベントが発行される');
  });

  describe('ゲーム終了判定', () => {
    it('昇格ゲージMAXで昇格試験開始');
    it('ランク維持日数切れでゲームオーバー');
    it('Sランク到達でゲームクリア');
  });
});
```

---

## 変更履歴

| 日付 | 変更内容 |
|------|---------|
| 2026-01-05 | 初版作成 |
