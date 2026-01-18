# TASK-0029: セーブ/ロード機能統合 - TDD要件定義書

**作成日**: 2026-01-18
**タスクID**: TASK-0029
**要件名**: atelier-guild-rank
**フェーズ**: 4 - 統合・テスト

---

## 1. 概要

本ドキュメントは、SaveLoadServiceのTDD開発に必要な要件を定義する。
セーブ/ロード機能は、ゲームの進行状態を永続化し、プレイヤーが中断したゲームを再開できるようにするための核心機能である。

### 1.1 目的

- ゲーム状態の永続化（セーブ）
- 保存されたゲーム状態の復元（ロード）
- セーブデータの存在確認・削除
- バージョン互換性の管理
- オートセーブ機能の提供

### 1.2 スコープ

- SaveLoadServiceの実装
- DIコンテナへの登録
- 統合テストの作成

---

## 2. 機能要件（EARS記法）

### 2.1 セーブ機能

#### FR-001: 手動セーブ実行
**While** プレイヤーがメインシーンでゲームをプレイ中であり、
**When** プレイヤーがセーブ操作を実行したとき、
**The** SaveLoadServiceは、各サービスから現在の状態を収集し、セーブデータを構築して、SaveDataRepositoryを通じてlocalStorageに保存する。

**受け入れ基準**:
- [ ] StateManagerから現在のゲーム状態（currentRank, promotionGauge, remainingDays, currentDay, currentPhase, gold, comboCount, actionPoints, isPromotionTest, promotionTestRemainingDays）を取得できる
- [ ] DeckServiceから現在のデッキ状態（deck, hand, discard, ownedCards）を取得できる
- [ ] InventoryServiceから現在のインベントリ状態（materials, craftedItems, storageLimit）を取得できる
- [ ] QuestServiceから現在のクエスト状態（activeQuests, todayClients, todayQuests, questLimit）を取得できる
- [ ] セーブデータにバージョン情報（version: "1.0.0"）が含まれる
- [ ] セーブデータに最終保存日時（lastSaved）がISO8601形式で含まれる
- [ ] セーブデータに所持アーティファクト（artifacts）が含まれる
- [ ] SaveDataRepository.save()が正常に呼び出される
- [ ] 保存成功後、`game:saved`イベントが発火される

#### FR-002: オートセーブ（日終了時）
**When** 1日が終了したとき（`day:end`イベント発火時）、
**The** SaveLoadServiceは、自動的にセーブを実行する。

**受け入れ基準**:
- [ ] `day:end`イベントを購読している
- [ ] イベント発火時にsave()メソッドが呼び出される
- [ ] セーブ完了後、`game:saved`イベントが発火される

#### FR-003: オートセーブ（フェーズ終了時）
**When** フェーズが完了したとき（`phase:complete`イベント発火時）、
**The** SaveLoadServiceは、自動的にセーブを実行する。

**受け入れ基準**:
- [ ] `phase:complete`イベントを購読している
- [ ] イベント発火時にsave()メソッドが呼び出される
- [ ] セーブ完了後、`game:saved`イベントが発火される

---

### 2.2 ロード機能

#### FR-004: セーブデータ読み込み
**When** プレイヤーがタイトル画面でコンティニューを選択したとき、
**The** SaveLoadServiceは、SaveDataRepositoryからセーブデータを読み込み、各サービスに状態を復元する。

**受け入れ基準**:
- [ ] SaveDataRepository.load()からセーブデータを取得できる
- [ ] StateManagerにgameStateを復元できる
- [ ] DeckServiceにdeckStateを復元できる
- [ ] InventoryServiceにinventoryStateを復元できる
- [ ] QuestServiceにquestStateを復元できる
- [ ] ArtifactServiceにartifactsを復元できる（該当する場合）
- [ ] ロード成功時、`game:loaded`イベントが発火される
- [ ] ロード成功時、戻り値として`true`を返す

#### FR-005: セーブデータ不存在時の動作
**If** セーブデータが存在しない場合、
**When** ロードを実行したとき、
**The** SaveLoadServiceは、`false`を返し、各サービスの状態を変更しない。

**受け入れ基準**:
- [ ] SaveDataRepository.load()が`null`を返す場合、`false`を返す
- [ ] 各サービスのloadFromSaveData()メソッドは呼び出されない
- [ ] `game:loaded`イベントは発火されない

---

### 2.3 バージョン互換性

#### FR-006: バージョン互換性チェック
**When** セーブデータをロードするとき、
**The** SaveLoadServiceは、セーブデータのバージョンが現在のバージョンと互換性があるかチェックする。

**受け入れ基準**:
- [ ] セーブデータのバージョン文字列（例: "1.0.0"）のメジャーバージョンを抽出できる
- [ ] 現在のバージョン（CURRENT_VERSION）のメジャーバージョンと比較できる
- [ ] メジャーバージョンが一致すれば互換性あり（`true`）
- [ ] メジャーバージョンが異なれば互換性なし（`false`）

#### FR-007: 非互換バージョン時のエラー
**If** セーブデータのバージョンが非互換の場合、
**When** ロードを実行したとき、
**The** SaveLoadServiceは、`ApplicationError`をスローし、ロードを中断する。

**受け入れ基準**:
- [ ] バージョン "2.0.0" のセーブデータをロードしようとした場合、エラーがスローされる
- [ ] エラーメッセージは「Incompatible save data version」を含む
- [ ] エラーコードは`INVALID_SAVE_DATA`である
- [ ] 各サービスの状態は変更されない

---

### 2.4 セーブデータ存在確認

#### FR-008: セーブデータ存在チェック
**When** セーブデータの存在を確認するとき、
**The** SaveLoadServiceは、SaveDataRepositoryのexists()を呼び出し、結果を返す。

**受け入れ基準**:
- [ ] SaveDataRepository.exists()が`true`を返す場合、`true`を返す
- [ ] SaveDataRepository.exists()が`false`を返す場合、`false`を返す

---

### 2.5 セーブデータ削除

#### FR-009: セーブデータ削除
**When** セーブデータの削除を要求されたとき、
**The** SaveLoadServiceは、SaveDataRepositoryのdelete()を呼び出し、セーブデータを削除する。

**受け入れ基準**:
- [ ] SaveDataRepository.delete()が正常に呼び出される
- [ ] 削除後、hasSaveData()は`false`を返す

---

## 3. 非機能要件

### 3.1 パフォーマンス

| 要件ID | 要件 | 基準 |
|--------|------|------|
| NFR-001 | セーブ処理時間 | 500ms以内 |
| NFR-002 | ロード処理時間 | 1000ms以内 |
| NFR-003 | セーブデータサイズ | 1MB以下 |

### 3.2 信頼性

| 要件ID | 要件 | 詳細 |
|--------|------|------|
| NFR-004 | データ整合性 | セーブデータは常にJSON形式で有効であること |
| NFR-005 | エラー回復 | ロード失敗時は安全にフォールバックすること |
| NFR-006 | 冪等性 | 同じ状態で複数回セーブしても結果が同じであること |

### 3.3 保守性

| 要件ID | 要件 | 詳細 |
|--------|------|------|
| NFR-007 | テスタビリティ | 各サービスをモックして単体テスト可能であること |
| NFR-008 | 拡張性 | 新しいサービスの状態を追加しやすい設計であること |
| NFR-009 | バージョン管理 | 将来のマイグレーション対応が可能であること |

### 3.4 互換性

| 要件ID | 要件 | 詳細 |
|--------|------|------|
| NFR-010 | ストレージ対応 | localStorage（5-10MB制限）に対応すること |
| NFR-011 | ブラウザ対応 | モダンブラウザ（Chrome, Firefox, Safari, Edge）で動作すること |

---

## 4. 受け入れ基準（統合テスト）

### 4.1 必須テストケース

| テストID | テスト内容 | 期待結果 | 優先度 |
|---------|----------|----------|--------|
| T-0029-01 | セーブ実行 | データ保存成功、`game:saved`イベント発火 | 高 |
| T-0029-02 | ロード実行 | 状態復元成功、`game:loaded`イベント発火、戻り値`true` | 高 |
| T-0029-03 | 存在チェック（あり） | `true`を返す | 高 |
| T-0029-04 | 存在チェック（なし） | `false`を返す | 高 |
| T-0029-05 | 削除実行 | データ削除成功、存在チェックが`false` | 高 |
| T-0029-06 | 非互換バージョン | `ApplicationError`がスローされる | 高 |
| T-0029-07 | セーブデータなしでロード | `false`を返す、状態変更なし | 中 |
| T-0029-08 | バージョン互換性（同一メジャー） | ロード成功 | 中 |
| T-0029-09 | オートセーブ（日終了時） | `day:end`イベントでセーブ実行 | 中 |
| T-0029-10 | オートセーブ（フェーズ完了時） | `phase:complete`イベントでセーブ実行 | 中 |

### 4.2 エッジケース

| テストID | テスト内容 | 期待結果 |
|---------|----------|----------|
| T-0029-E01 | 空のインベントリでセーブ | 正常にセーブできる |
| T-0029-E02 | 空のデッキでセーブ | 正常にセーブできる |
| T-0029-E03 | 破損したJSONデータのロード | エラーハンドリングされる |
| T-0029-E04 | バージョンフィールドがないセーブデータ | エラーハンドリングされる |

---

## 5. 制約条件

### 5.1 技術的制約

| 制約ID | 制約内容 | 理由 |
|--------|---------|------|
| C-001 | localStorage使用 | クライアントサイドのみの実装のため |
| C-002 | JSON形式 | 構造化データの保存・復元のため |
| C-003 | 循環参照禁止 | JSON.stringify()の制限 |
| C-004 | 関数・クラスインスタンス保存不可 | JSON形式の制限 |

### 5.2 設計上の制約

| 制約ID | 制約内容 | 理由 |
|--------|---------|------|
| C-005 | Clean Architectureに従う | プロジェクトアーキテクチャ方針 |
| C-006 | Application層に配置 | ビジネスロジックの調整役として |
| C-007 | インターフェース経由の依存 | テスタビリティ確保のため |

---

## 6. 前提条件

### 6.1 依存タスク

| タスクID | タスク名 | 状態 | 提供機能 |
|---------|---------|------|---------|
| TASK-0007 | セーブデータリポジトリ実装 | 完了 | ISaveDataRepository, LocalStorageSaveRepository |
| TASK-0028 | サービス統合・DI設定 | 完了 | DIコンテナ、ServiceKeys、各サービス登録 |

### 6.2 必要なインターフェース

以下のインターフェースが各サービスに実装されている必要がある:

#### StateManager
```typescript
interface IStateManager {
  getState(): IGameState;
  loadFromSaveData(saveData: ISaveData): void;
}
```

#### DeckService
```typescript
interface IDeckService {
  getDeck(): ICard[];
  getHand(): ICard[];
  getDiscard(): ICard[];
  getOwnedCards(): string[];
  loadFromSaveData(deckState: IDeckState): void;
}
```

#### InventoryService
```typescript
interface IInventoryService {
  getMaterials(): IMaterialInstance[];
  getItems(): ICraftedItem[];
  getArtifacts(): string[];
  loadFromSaveData(inventoryState: IInventoryState): void;
}
```

#### QuestService
```typescript
interface IQuestService {
  getAcceptedQuests(): IActiveQuest[];
  getAvailableQuests(): IQuest[];
  getTodayClients(): string[];
  getQuestLimit(): number;
  loadFromSaveData(questState: IQuestState): void;
}
```

### 6.3 データ構造

セーブデータ構造は`docs/design/atelier-guild-rank/data-schema-save.md`に準拠する。

---

## 7. インターフェース設計

### 7.1 ISaveLoadService

```typescript
export interface ISaveLoadService {
  /**
   * 現在のゲーム状態をセーブする
   * @throws ApplicationError セーブに失敗した場合
   */
  save(): Promise<void>;

  /**
   * セーブデータからゲーム状態を復元する
   * @returns ロード成功時true、セーブデータなしの場合false
   * @throws ApplicationError バージョン非互換またはロード失敗時
   */
  load(): Promise<boolean>;

  /**
   * セーブデータの存在を確認する
   * @returns セーブデータが存在すればtrue
   */
  hasSaveData(): boolean;

  /**
   * セーブデータを削除する
   * @throws ApplicationError 削除に失敗した場合
   */
  deleteSaveData(): Promise<void>;
}
```

### 7.2 SaveLoadServiceコンストラクタ

```typescript
export class SaveLoadService implements ISaveLoadService {
  constructor(
    private readonly saveRepo: ISaveDataRepository,
    private readonly stateManager: IStateManager,
    private readonly deckService: IDeckService,
    private readonly inventoryService: IInventoryService,
    private readonly questService: IQuestService,
    private readonly eventBus: IEventBus
  ) {}
}
```

---

## 8. エラーハンドリング

### 8.1 エラーコード

| エラーコード | 発生条件 | 対処 |
|-------------|---------|------|
| SAVE_FAILED | localStorage書き込み失敗 | ユーザーに通知、リトライ案内 |
| LOAD_FAILED | localStorage読み込み失敗 | ユーザーに通知、新規ゲーム案内 |
| INVALID_SAVE_DATA | バージョン非互換またはデータ破損 | ユーザーに通知、新規ゲーム案内 |

### 8.2 エラー伝播

```
Infrastructure (SaveDataRepository)
    ↓ catch & wrap
Application (SaveLoadService)
    ↓ ApplicationError throw
Presentation (Scene)
    ↓ EventBus
UI (Dialog/Toast)
```

---

## 9. 変更履歴

| 日付 | バージョン | 変更内容 |
|------|----------|---------|
| 2026-01-18 | 1.0.0 | 初版作成 |

---

## 10. 参考文書

- タスク定義: `docs/tasks/atelier-guild-rank/phase-4/TASK-0029.md`
- タスクノート: `docs/implements/atelier-guild-rank/TASK-0029/note.md`
- セーブデータスキーマ: `docs/design/atelier-guild-rank/data-schema-save.md`
- データフロー設計: `docs/design/atelier-guild-rank/dataflow.md`
- アーキテクチャ設計: `docs/design/atelier-guild-rank/architecture-overview.md`
