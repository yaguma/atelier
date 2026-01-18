# TASK-0029: セーブ/ロード機能統合 - テストケース一覧

**作成日**: 2026-01-18
**タスクID**: TASK-0029
**要件名**: atelier-guild-rank
**フェーズ**: 4 - 統合・テスト

---

## 1. テストケース概要

本ドキュメントは、SaveLoadServiceのTDD開発に必要なテストケースを網羅的に洗い出したものである。

### 1.1 テスト対象

- `SaveLoadService`クラス
  - `save()`: セーブ実行
  - `load()`: ロード実行
  - `hasSaveData()`: セーブデータ存在確認
  - `deleteSaveData()`: セーブデータ削除
  - `isCompatibleVersion()`: バージョン互換性チェック（private）
- オートセーブ機能（EventBus連携）

### 1.2 テストフレームワーク

- **Vitest**: ユニット/統合テスト
- **モック**: `vi.fn()`, `vi.spyOn()`を使用

---

## 2. 正常系テストケース

### 2.1 save()メソッド

| テストID | テストケース名 | 前提条件 | 実行内容 | 期待結果 |
|----------|---------------|----------|----------|----------|
| TC-SAVE-001 | セーブ実行 - 基本動作 | 各サービスが正常に動作する状態 | `save()`を呼び出す | `SaveDataRepository.save()`が呼び出される |
| TC-SAVE-002 | セーブデータにバージョン情報が含まれる | - | `save()`を呼び出す | セーブデータの`version`が"1.0.0"である |
| TC-SAVE-003 | セーブデータにlastSavedが含まれる | - | `save()`を呼び出す | セーブデータの`lastSaved`がISO8601形式の日時文字列である |
| TC-SAVE-004 | StateManagerから状態を取得する | StateManagerに状態がある | `save()`を呼び出す | `stateManager.getState()`が呼び出され、gameStateがセーブデータに含まれる |
| TC-SAVE-005 | DeckServiceから状態を取得する | DeckServiceにデッキ状態がある | `save()`を呼び出す | `deckService.getDeck()`, `getHand()`, `getDiscard()`, `getOwnedCards()`が呼び出される |
| TC-SAVE-006 | InventoryServiceから状態を取得する | InventoryServiceにインベントリ状態がある | `save()`を呼び出す | `inventoryService.getMaterials()`, `getItems()`, `getArtifacts()`が呼び出される |
| TC-SAVE-007 | QuestServiceから状態を取得する | QuestServiceにクエスト状態がある | `save()`を呼び出す | `questService.getAcceptedQuests()`, `getAvailableQuests()`, `getTodayClients()`が呼び出される |
| TC-SAVE-008 | セーブ完了後にイベント発火 | EventBusが接続されている | `save()`を呼び出す | `eventBus.emit('game:saved')`が呼び出される |
| TC-SAVE-009 | デッキカードIDが正しく保存される | DeckServiceにCard配列がある | `save()`を呼び出す | deckState.deck, hand, discardにはカードIDの配列が含まれる |

### 2.2 load()メソッド

| テストID | テストケース名 | 前提条件 | 実行内容 | 期待結果 |
|----------|---------------|----------|----------|----------|
| TC-LOAD-001 | ロード実行 - 基本動作 | セーブデータが存在する | `load()`を呼び出す | 戻り値が`true`である |
| TC-LOAD-002 | StateManagerに状態を復元する | セーブデータが存在する | `load()`を呼び出す | `stateManager.loadFromSaveData()`が呼び出される |
| TC-LOAD-003 | DeckServiceに状態を復元する | セーブデータが存在する | `load()`を呼び出す | `deckService.loadFromSaveData()`が呼び出される |
| TC-LOAD-004 | InventoryServiceに状態を復元する | セーブデータが存在する | `load()`を呼び出す | `inventoryService.loadFromSaveData()`が呼び出される |
| TC-LOAD-005 | QuestServiceに状態を復元する | セーブデータが存在する | `load()`を呼び出す | `questService.loadFromSaveData()`が呼び出される |
| TC-LOAD-006 | ロード完了後にイベント発火 | セーブデータが存在する | `load()`を呼び出す | `eventBus.emit('game:loaded')`が呼び出される |
| TC-LOAD-007 | バージョン互換チェック通過 | 互換バージョン"1.0.0"のセーブデータ | `load()`を呼び出す | 正常にロードが完了する |
| TC-LOAD-008 | バージョン互換チェック通過 - マイナーバージョン違い | バージョン"1.1.0"のセーブデータ | `load()`を呼び出す | 正常にロードが完了する（メジャー一致で互換） |
| TC-LOAD-009 | バージョン互換チェック通過 - パッチバージョン違い | バージョン"1.0.5"のセーブデータ | `load()`を呼び出す | 正常にロードが完了する（メジャー一致で互換） |

### 2.3 hasSaveData()メソッド

| テストID | テストケース名 | 前提条件 | 実行内容 | 期待結果 |
|----------|---------------|----------|----------|----------|
| TC-EXISTS-001 | 存在チェック - セーブデータあり | セーブデータが存在する | `hasSaveData()`を呼び出す | 戻り値が`true`である |
| TC-EXISTS-002 | 存在チェック - セーブデータなし | セーブデータが存在しない | `hasSaveData()`を呼び出す | 戻り値が`false`である |
| TC-EXISTS-003 | リポジトリのexists()を呼び出す | - | `hasSaveData()`を呼び出す | `saveRepo.exists()`が呼び出される |

### 2.4 deleteSaveData()メソッド

| テストID | テストケース名 | 前提条件 | 実行内容 | 期待結果 |
|----------|---------------|----------|----------|----------|
| TC-DELETE-001 | 削除実行 - 基本動作 | セーブデータが存在する | `deleteSaveData()`を呼び出す | `saveRepo.delete()`が呼び出される |
| TC-DELETE-002 | 削除後の存在チェック | セーブデータが存在する | `deleteSaveData()`後に`hasSaveData()`を呼び出す | 戻り値が`false`である |

---

## 3. 異常系テストケース

### 3.1 save()メソッド - エラーケース

| テストID | テストケース名 | 前提条件 | 実行内容 | 期待結果 |
|----------|---------------|----------|----------|----------|
| TC-SAVE-E001 | セーブ失敗 - リポジトリエラー | `saveRepo.save()`がエラーをスロー | `save()`を呼び出す | `ApplicationError`（SAVE_FAILED）がスローされる |
| TC-SAVE-E002 | セーブ失敗 - localStorage容量超過 | localStorageが容量制限に達している | `save()`を呼び出す | エラーがハンドリングされる |
| TC-SAVE-E003 | セーブ失敗 - StateManager取得エラー | `stateManager.getState()`がエラーをスロー | `save()`を呼び出す | 適切なエラーが伝播される |

### 3.2 load()メソッド - エラーケース

| テストID | テストケース名 | 前提条件 | 実行内容 | 期待結果 |
|----------|---------------|----------|----------|----------|
| TC-LOAD-E001 | ロード失敗 - セーブデータなし | セーブデータが存在しない | `load()`を呼び出す | 戻り値が`false`である |
| TC-LOAD-E002 | ロード失敗 - 非互換バージョン | バージョン"2.0.0"のセーブデータ | `load()`を呼び出す | `ApplicationError`（INVALID_SAVE_DATA）がスローされる |
| TC-LOAD-E003 | ロード失敗 - 非互換バージョン（メジャー3） | バージョン"3.5.0"のセーブデータ | `load()`を呼び出す | `ApplicationError`がスローされる |
| TC-LOAD-E004 | ロード失敗 - リポジトリエラー | `saveRepo.load()`がエラーをスロー | `load()`を呼び出す | `ApplicationError`（LOAD_FAILED）がスローされる |
| TC-LOAD-E005 | ロード失敗 - 状態復元エラー | `stateManager.loadFromSaveData()`がエラーをスロー | `load()`を呼び出す | エラーが伝播され、他サービスの復元は行われない |
| TC-LOAD-E006 | ロード失敗時 - イベント発火なし | セーブデータが存在しない | `load()`を呼び出す | `eventBus.emit('game:loaded')`は呼び出されない |
| TC-LOAD-E007 | ロード失敗時 - サービス状態変更なし | セーブデータが存在しない | `load()`を呼び出す | 各サービスの`loadFromSaveData()`は呼び出されない |

### 3.3 deleteSaveData()メソッド - エラーケース

| テストID | テストケース名 | 前提条件 | 実行内容 | 期待結果 |
|----------|---------------|----------|----------|----------|
| TC-DELETE-E001 | 削除失敗 - リポジトリエラー | `saveRepo.delete()`がエラーをスロー | `deleteSaveData()`を呼び出す | エラーが伝播される |

---

## 4. 境界値テストケース

### 4.1 バージョン互換性

| テストID | テストケース名 | 入力値 | 期待結果 |
|----------|---------------|--------|----------|
| TC-VER-001 | 現行バージョン | "1.0.0" | 互換あり（`true`） |
| TC-VER-002 | マイナーバージョンアップ | "1.1.0" | 互換あり（`true`） |
| TC-VER-003 | パッチバージョンアップ | "1.0.99" | 互換あり（`true`） |
| TC-VER-004 | メジャーバージョンダウン | "0.9.0" | 互換なし（`false`） |
| TC-VER-005 | メジャーバージョンアップ | "2.0.0" | 互換なし（`false`） |
| TC-VER-006 | 空文字 | "" | エラーハンドリング |
| TC-VER-007 | 不正形式 | "invalid" | エラーハンドリング |
| TC-VER-008 | null/undefined | null | エラーハンドリング |

### 4.2 セーブデータ構造

| テストID | テストケース名 | 前提条件 | 期待結果 |
|----------|---------------|----------|----------|
| TC-DATA-001 | 空のデッキでセーブ | deck, hand, discardが空配列 | 正常にセーブできる |
| TC-DATA-002 | 空のインベントリでセーブ | materials, itemsが空配列 | 正常にセーブできる |
| TC-DATA-003 | 空のクエストでセーブ | activeQuests, todayQuestsが空配列 | 正常にセーブできる |
| TC-DATA-004 | 空のアーティファクトでセーブ | artifactsが空配列 | 正常にセーブできる |
| TC-DATA-005 | 最大サイズのデッキ | 想定最大枚数のカード | 正常にセーブできる |
| TC-DATA-006 | 最大サイズのインベントリ | storageLimit上限の素材/アイテム | 正常にセーブできる |

### 4.3 日時境界値

| テストID | テストケース名 | 入力値 | 期待結果 |
|----------|---------------|--------|----------|
| TC-TIME-001 | 現在日時 | `new Date()` | ISO8601形式で保存される |
| TC-TIME-002 | 過去の日時ロード | "2020-01-01T00:00:00.000Z" | 正常にロードできる |
| TC-TIME-003 | lastSavedがない古いデータ | lastSavedフィールドなし | エラーハンドリング |

---

## 5. 統合テストケース

### 5.1 セーブ→ロードサイクル

| テストID | テストケース名 | 実行内容 | 期待結果 |
|----------|---------------|----------|----------|
| TC-INT-001 | 基本的なセーブ→ロードサイクル | `save()` → `load()` | 同一の状態が復元される |
| TC-INT-002 | 複数回セーブ→最新をロード | `save()` × 3 → `load()` | 最新のセーブデータが復元される |
| TC-INT-003 | セーブ→削除→ロード | `save()` → `deleteSaveData()` → `load()` | `load()`が`false`を返す |
| TC-INT-004 | 全サービス連携テスト | 全サービスの状態を設定 → `save()` → `load()` | 全サービスの状態が正しく復元される |

### 5.2 オートセーブ機能

| テストID | テストケース名 | 前提条件 | 実行内容 | 期待結果 |
|----------|---------------|----------|----------|----------|
| TC-AUTO-001 | 日終了時オートセーブ | EventBusで`day:end`を購読している | `eventBus.emit('day:end')` | `save()`が呼び出される |
| TC-AUTO-002 | フェーズ完了時オートセーブ | EventBusで`phase:complete`を購読している | `eventBus.emit('phase:complete')` | `save()`が呼び出される |
| TC-AUTO-003 | オートセーブ完了イベント | オートセーブが完了した | `day:end`イベント発火 | `game:saved`イベントが発火される |
| TC-AUTO-004 | オートセーブ失敗時の処理 | セーブ中にエラーが発生 | `day:end`イベント発火 | エラーがハンドリングされ、ゲーム継続可能 |

### 5.3 エラーリカバリー

| テストID | テストケース名 | 前提条件 | 実行内容 | 期待結果 |
|----------|---------------|----------|----------|----------|
| TC-REC-001 | 破損データからのリカバリ | 破損したセーブデータ | `load()` | `ApplicationError`がスローされるか`null`返却 |
| TC-REC-002 | 部分的に破損したデータ | gameStateのみ破損 | `load()` | 適切なエラーハンドリング |
| TC-REC-003 | ロード失敗後のゲーム継続 | ロードが`false`を返す | ロード失敗後も新規ゲーム開始可能 | 各サービスの状態は初期状態のまま |

---

## 6. データ完全性テストケース

### 6.1 GameState検証

| テストID | フィールド | テスト内容 | 期待結果 |
|----------|----------|----------|----------|
| TC-GS-001 | currentRank | ランク値が正しく保存/復元される | "G"〜"SS"の値が保持される |
| TC-GS-002 | promotionGauge | 昇格ゲージが正しく保存/復元される | 数値が正確に復元される |
| TC-GS-003 | remainingDays | 残り日数が正しく保存/復元される | 数値が正確に復元される |
| TC-GS-004 | currentDay | 現在日数が正しく保存/復元される | 数値が正確に復元される |
| TC-GS-005 | currentPhase | フェーズが正しく保存/復元される | フェーズ値が正確に復元される |
| TC-GS-006 | gold | 所持金が正しく保存/復元される | 数値が正確に復元される |
| TC-GS-007 | comboCount | コンボカウントが正しく保存/復元される | 数値が正確に復元される |
| TC-GS-008 | actionPoints | 行動ポイントが正しく保存/復元される | 数値が正確に復元される |
| TC-GS-009 | isPromotionTest | 昇格試験フラグが正しく保存/復元される | boolean値が正確に復元される |
| TC-GS-010 | promotionTestRemainingDays | 昇格試験残り日数が正しく保存/復元される | number|null値が正確に復元される |

### 6.2 DeckState検証

| テストID | フィールド | テスト内容 | 期待結果 |
|----------|----------|----------|----------|
| TC-DS-001 | deck | 山札が正しく保存/復元される | カードID配列が正確に復元される |
| TC-DS-002 | hand | 手札が正しく保存/復元される | カードID配列が正確に復元される |
| TC-DS-003 | discard | 捨て札が正しく保存/復元される | カードID配列が正確に復元される |
| TC-DS-004 | ownedCards | 所持カードが正しく保存/復元される | カードID配列が正確に復元される |

### 6.3 InventoryState検証

| テストID | フィールド | テスト内容 | 期待結果 |
|----------|----------|----------|----------|
| TC-IS-001 | materials | 素材が正しく保存/復元される | MaterialInstance配列が正確に復元される |
| TC-IS-002 | craftedItems | 調合アイテムが正しく保存/復元される | CraftedItem配列が正確に復元される |
| TC-IS-003 | storageLimit | 格納上限が正しく保存/復元される | 数値が正確に復元される |
| TC-IS-004 | artifacts | アーティファクトが正しく保存/復元される | string配列が正確に復元される |

### 6.4 QuestState検証

| テストID | フィールド | テスト内容 | 期待結果 |
|----------|----------|----------|----------|
| TC-QS-001 | activeQuests | 受注中クエストが正しく保存/復元される | ActiveQuest配列が正確に復元される |
| TC-QS-002 | todayClients | 今日の依頼人が正しく保存/復元される | string配列が正確に復元される |
| TC-QS-003 | todayQuests | 今日のクエストが正しく保存/復元される | Quest配列が正確に復元される |
| TC-QS-004 | questLimit | クエスト上限が正しく保存/復元される | 数値が正確に復元される |

---

## 7. 非機能要件テストケース

### 7.1 パフォーマンステスト

| テストID | テストケース名 | 計測内容 | 合格基準 |
|----------|---------------|----------|----------|
| TC-PERF-001 | セーブ処理時間 | `save()`の実行時間 | 500ms以内 |
| TC-PERF-002 | ロード処理時間 | `load()`の実行時間 | 1000ms以内 |
| TC-PERF-003 | セーブデータサイズ | JSONシリアライズ後のサイズ | 1MB以下 |

### 7.2 冪等性テスト

| テストID | テストケース名 | 実行内容 | 期待結果 |
|----------|---------------|----------|----------|
| TC-IDEM-001 | 複数回セーブの一貫性 | 同一状態で`save()`を3回実行 | 毎回同一のセーブデータ構造（lastSaved以外） |
| TC-IDEM-002 | 複数回ロードの一貫性 | 同一データで`load()`を3回実行 | 毎回同一の状態が復元される |

---

## 8. モック設定

### 8.1 ISaveDataRepositoryモック

```typescript
const mockSaveRepo: ISaveDataRepository = {
  save: vi.fn().mockResolvedValue(undefined),
  load: vi.fn().mockResolvedValue(null),
  exists: vi.fn().mockReturnValue(false),
  delete: vi.fn().mockResolvedValue(undefined),
  getLastSavedTime: vi.fn().mockReturnValue(null),
};
```

### 8.2 IStateManagerモック

```typescript
const mockStateManager: IStateManager = {
  getState: vi.fn().mockReturnValue({
    currentRank: 'G',
    promotionGauge: 35,
    requiredContribution: 100,
    remainingDays: 28,
    currentDay: 3,
    currentPhase: 'GATHERING',
    gold: 150,
    comboCount: 2,
    actionPoints: 2,
    isPromotionTest: false,
    promotionTestRemainingDays: null,
  }),
  loadFromSaveData: vi.fn(),
};
```

### 8.3 IDeckServiceモック

```typescript
const mockDeckService: IDeckService = {
  getDeck: vi.fn().mockReturnValue([{ id: 'card_001' }, { id: 'card_002' }]),
  getHand: vi.fn().mockReturnValue([{ id: 'card_003' }]),
  getDiscard: vi.fn().mockReturnValue([]),
  getOwnedCards: vi.fn().mockReturnValue(['card_001', 'card_002', 'card_003']),
  loadFromSaveData: vi.fn(),
};
```

### 8.4 IInventoryServiceモック

```typescript
const mockInventoryService: IInventoryService = {
  getMaterials: vi.fn().mockReturnValue([
    { materialId: 'herb', quality: 'C', quantity: 5 },
  ]),
  getItems: vi.fn().mockReturnValue([]),
  getArtifacts: vi.fn().mockReturnValue([]),
  loadFromSaveData: vi.fn(),
};
```

### 8.5 IQuestServiceモック

```typescript
const mockQuestService: IQuestService = {
  getAcceptedQuests: vi.fn().mockReturnValue([]),
  getAvailableQuests: vi.fn().mockReturnValue([]),
  getTodayClients: vi.fn().mockReturnValue(['villager']),
  getQuestLimit: vi.fn().mockReturnValue(3),
  loadFromSaveData: vi.fn(),
};
```

### 8.6 IEventBusモック

```typescript
const mockEventBus: IEventBus = {
  emit: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
};
```

---

## 9. テスト実行計画

### 9.1 優先度別実行順序

#### 優先度: 高（必須）
1. TC-SAVE-001〜TC-SAVE-009（セーブ基本動作）
2. TC-LOAD-001〜TC-LOAD-009（ロード基本動作）
3. TC-EXISTS-001〜TC-EXISTS-003（存在チェック）
4. TC-DELETE-001〜TC-DELETE-002（削除）
5. TC-LOAD-E001〜TC-LOAD-E002（セーブデータなし、非互換バージョン）

#### 優先度: 中（推奨）
1. TC-VER-001〜TC-VER-008（バージョン互換性）
2. TC-INT-001〜TC-INT-004（統合テスト）
3. TC-AUTO-001〜TC-AUTO-004（オートセーブ）
4. TC-SAVE-E001〜TC-SAVE-E003（セーブエラー）
5. TC-LOAD-E003〜TC-LOAD-E007（ロードエラー）

#### 優先度: 低（オプション）
1. TC-DATA-001〜TC-DATA-006（境界値）
2. TC-GS-001〜TC-QS-004（データ完全性）
3. TC-PERF-001〜TC-PERF-003（パフォーマンス）
4. TC-IDEM-001〜TC-IDEM-002（冪等性）
5. TC-REC-001〜TC-REC-003（リカバリ）

### 9.2 カバレッジ目標

| 項目 | 目標 |
|------|------|
| 行カバレッジ | 80%以上 |
| 分岐カバレッジ | 75%以上 |
| 関数カバレッジ | 100% |

---

## 10. テストファイル構成

### 10.1 ファイルパス

```
tests/
├── unit/
│   └── application/
│       └── services/
│           └── save-load-service.test.ts
└── integration/
    └── save-load.test.ts
```

### 10.2 テストスイート構成

```typescript
// save-load-service.test.ts
describe('SaveLoadService', () => {
  describe('save()', () => {
    describe('正常系', () => { ... });
    describe('異常系', () => { ... });
  });

  describe('load()', () => {
    describe('正常系', () => { ... });
    describe('異常系', () => { ... });
    describe('バージョン互換性', () => { ... });
  });

  describe('hasSaveData()', () => { ... });

  describe('deleteSaveData()', () => { ... });

  describe('オートセーブ機能', () => { ... });
});

describe('SaveLoadService統合テスト', () => {
  describe('セーブ→ロードサイクル', () => { ... });
  describe('データ完全性検証', () => { ... });
});
```

---

## 11. 変更履歴

| 日付 | バージョン | 変更内容 |
|------|----------|---------|
| 2026-01-18 | 1.0.0 | 初版作成 |

---

## 12. 参考文書

- 要件定義書: `docs/implements/atelier-guild-rank/TASK-0029/requirements.md`
- タスクノート: `docs/implements/atelier-guild-rank/TASK-0029/note.md`
- タスク定義: `docs/tasks/atelier-guild-rank/phase-4/TASK-0029.md`
- セーブデータスキーマ: `docs/design/atelier-guild-rank/data-schema-save.md`
