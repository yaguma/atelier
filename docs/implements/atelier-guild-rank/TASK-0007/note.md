# TASK-0007: セーブデータリポジトリ実装 - 開発ノート

**作成日**: 2026-01-16
**タスクID**: TASK-0007
**要件名**: atelier-guild-rank

---

## 1. 技術スタック

### 使用技術・フレームワーク
- **言語**: TypeScript 5.x
- **ゲームFW**: Phaser 3.87+
- **UIプラグイン**: rexUI（最新）
- **ビルド**: Vite 6.x
- **パッケージ管理**: pnpm 9.x
- **Lint/Format**: Biome 2.x
- **テスト**: Vitest 4.x（ユニットテスト）
- **E2Eテスト**: Playwright（最新）
- **データ永続化**: localStorage

### アーキテクチャパターン
- **Clean Architecture**: 4層構造（Presentation/Application/Domain/Infrastructure）
- **Repository Pattern**: データアクセスの抽象化
- **イベント駆動設計**: EventBusによる疎結合な通信

### 参照元
- `docs/design/atelier-guild-rank/architecture-overview.md`
- `atelier-guild-rank/package.json`

---

## 2. 開発ルール

### プロジェクト固有ルール
- **応答は日本語で行う**
- **ずんだもん口調で喋る**（語尾は「なのだ。」）
- **Clean Architectureの原則に従う**
  - Domain層はInfrastructure層のインターフェースにのみ依存
  - ビジネスロジックはフレームワークに依存しない
- **Biomeによる一貫したコードスタイル**
- **Lefthookによるコミット前の品質チェック自動化**

### コーディング規約
- **エクスポート形式**: 名前付きエクスポートを使用
- **エラーハンドリング**: ApplicationErrorを使用し、ErrorCodesで定義されたコードを使う
- **型安全性**: 厳密な型定義、unknown型の使用
- **不変性**: 状態更新時は新しいオブジェクトを作成
- **インターフェース名**: `I`プレフィックスを使用（例: `ISaveDataRepository`）
- **型定義の場所**: `src/shared/types/` に集約

### 参照元
- `CLAUDE.md`
- `docs/design/atelier-guild-rank/architecture-overview.md`

---

## 3. 関連実装

### 類似機能の実装例

#### マスターデータリポジトリ（参考パターン）
- **ファイル**: `atelier-guild-rank/src/infrastructure/repositories/master-data-repository.ts`
- **実装パターン**:
  - インターフェースを`src/domain/interfaces/`に定義
  - 実装を`src/infrastructure/repositories/`に配置
  - コンストラクタで設定とローダーを受け取る
  - 読み込み済みフラグ（`loaded`）で二重読み込み防止
  - `ensureLoaded()`で未読み込み時にエラー
  - `Map`を使ったインデックスでO(1)アクセス
  - `Promise.all`で並列読み込み

#### 既存の型定義
- **セーブデータ型**: `atelier-guild-rank/src/shared/types/save-data.ts`
  - `ISaveData`インターフェースが既に定義済み
  - version, lastSaved, gameState, deckState, inventoryState, questState, artifacts
- **ゲーム状態型**: `atelier-guild-rank/src/shared/types/game-state.ts`
  - `IGameState`, `IDeckState`, `IInventoryState`, `IQuestState`が定義済み
- **エラー型**: `atelier-guild-rank/src/shared/types/errors.ts`
  - `ApplicationError`クラス
  - `ErrorCodes.SAVE_FAILED`, `ErrorCodes.LOAD_FAILED`, `ErrorCodes.INVALID_SAVE_DATA`

### 参照元
- `atelier-guild-rank/src/infrastructure/repositories/master-data-repository.ts`
- `atelier-guild-rank/src/domain/interfaces/master-data-repository.interface.ts`
- `atelier-guild-rank/src/shared/types/save-data.ts`
- `atelier-guild-rank/src/shared/types/game-state.ts`
- `atelier-guild-rank/src/shared/types/errors.ts`

---

## 4. 設計文書

### データスキーマ設計

#### SaveData構造（設計書より）
```json
{
  "version": "1.0.0",
  "lastSaved": "2026-01-01T12:00:00.000Z",
  "gameState": { ... },
  "deckState": { ... },
  "inventoryState": { ... },
  "questState": { ... },
  "artifacts": ["artifact_id_1", "artifact_id_2"]
}
```

#### 主要フィールド
| フィールド | 型 | 説明 | 必須 |
|-----------|-----|------|------|
| version | string | セーブデータバージョン | ○ |
| lastSaved | string (ISO8601) | 最終保存日時 | ○ |
| gameState | IGameState | ゲーム進行状態 | ○ |
| deckState | IDeckState | デッキ状態 | ○ |
| inventoryState | IInventoryState | インベントリ状態 | ○ |
| questState | IQuestState | 依頼状態 | ○ |
| artifacts | ArtifactId[] | 所持アーティファクトID | ○ |

### リポジトリインターフェース設計

#### ISaveDataRepositoryの責務
- セーブデータの保存・読み込み・削除
- 存在チェック
- 最終保存時刻の取得
- 破損データのハンドリング

#### メソッド定義
```typescript
export interface ISaveDataRepository {
  save(data: ISaveData): Promise<void>;
  load(): Promise<ISaveData | null>;
  exists(): boolean;
  delete(): Promise<void>;
  getLastSavedTime(): Date | null;
}
```

### 参照元
- `docs/design/atelier-guild-rank/data-schema-save.md`
- `docs/tasks/atelier-guild-rank/phase-1/TASK-0007.md`

---

## 5. 注意事項

### 技術的制約
- **localStorage容量制限**: 5-10MB（ブラウザによる）
  - 大量データの場合は圧縮を検討（推奨条件）
- **JSONシリアライズ制限**: 循環参照不可、関数は保存不可
- **非同期API**: `save()`, `load()`, `delete()`は`Promise`を返す
- **セキュリティ**: クライアントサイドのみのためチート対策は限定的

### エラーハンドリング
- **致命的エラー**: セーブデータ読込失敗 → `ApplicationError`をthrow
- **回復可能エラー**: 破損データ → `null`を返却
- **エラーコード**:
  - `ErrorCodes.SAVE_FAILED`: 保存失敗
  - `ErrorCodes.LOAD_FAILED`: 読み込み失敗
  - `ErrorCodes.INVALID_SAVE_DATA`: データ破損

### 実装上の注意
- **ストレージキー**: `atelier-guild-rank-save`を使用
- **バージョン管理**: 将来的なマイグレーション対応のため`version`フィールドを必ずチェック
- **テストカバレッジ**: 80%以上を目標
- **テストパターン**: vitestを使用、`vi.fn()`でモック作成

### テスト要件（タスク定義より）
| テストID | テスト内容 | 期待結果 |
|---------|----------|----------|
| T-0007-01 | セーブ→ロード | 同一データ取得 |
| T-0007-02 | 存在チェック（存在時） | true |
| T-0007-03 | 存在チェック（未存在時） | false |
| T-0007-04 | 削除 | exists()がfalse |
| T-0007-05 | 破損データのロード | null返却 |

### 参照元
- `docs/design/atelier-guild-rank/architecture-overview.md` (セキュリティ考慮事項)
- `docs/tasks/atelier-guild-rank/phase-1/TASK-0007.md` (受け入れ基準、テストケース)
- `atelier-guild-rank/tests/unit/application/events/event-bus.test.ts` (テストパターン参考)

---

## 6. 実装ファイル一覧

### 作成するファイル

#### 型定義（既存を使用）
- `atelier-guild-rank/src/shared/types/save-data.ts` - **既存**

#### インターフェース
- `atelier-guild-rank/src/domain/interfaces/save-data-repository.interface.ts` - **新規**

#### 実装
- `atelier-guild-rank/src/infrastructure/repositories/local-storage-save-repository.ts` - **新規**

#### テスト
- `atelier-guild-rank/tests/unit/infrastructure/repositories/local-storage-save-repository.test.ts` - **新規**

### 参照元
- `docs/tasks/atelier-guild-rank/phase-1/TASK-0007.md` (成果物)

---

## 7. 依存関係

### タスク依存
- **依存元**: TASK-0003（共通型定義） - 完了済み

### インポート依存
```typescript
// 既存の型定義を使用
import type { ISaveData } from '@shared/types';
import { ApplicationError, ErrorCodes } from '@shared/types';
```

### 参照元
- `docs/tasks/atelier-guild-rank/phase-1/TASK-0007.md` (依存タスク)

---

## 8. 実装チェックリスト

### 必須実装
- [ ] `ISaveDataRepository`インターフェース定義
- [ ] `LocalStorageSaveRepository`実装
  - [ ] `save()`メソッド
  - [ ] `load()`メソッド
  - [ ] `exists()`メソッド
  - [ ] `delete()`メソッド
  - [ ] `getLastSavedTime()`メソッド
- [ ] エラーハンドリング
  - [ ] JSON parse失敗時の処理
  - [ ] localStorage例外のキャッチ
- [ ] ユニットテスト
  - [ ] T-0007-01: セーブ→ロード
  - [ ] T-0007-02: 存在チェック（存在時）
  - [ ] T-0007-03: 存在チェック（未存在時）
  - [ ] T-0007-04: 削除
  - [ ] T-0007-05: 破損データのロード

### 推奨実装
- [ ] データ圧縮オプション（容量削減）
- [ ] バージョンマイグレーション処理
- [ ] テストカバレッジ80%以上

---

## 9. 実装の流れ

1. **インターフェース定義**
   - `src/domain/interfaces/save-data-repository.interface.ts`を作成
   - メソッドシグネチャを定義

2. **実装**
   - `src/infrastructure/repositories/local-storage-save-repository.ts`を作成
   - localStorageを使った実装
   - エラーハンドリング追加

3. **テスト**
   - `tests/unit/infrastructure/repositories/local-storage-save-repository.test.ts`を作成
   - 全テストケース実装
   - カバレッジ確認

4. **インデックスファイル更新**
   - `src/domain/interfaces/index.ts`にエクスポート追加
   - `src/infrastructure/repositories/index.ts`にエクスポート追加

---

## 10. 参考リンク

### 設計文書
- データスキーマ設計: `docs/design/atelier-guild-rank/data-schema-save.md`
- アーキテクチャ設計: `docs/design/atelier-guild-rank/architecture-overview.md`
- インフラシステム設計: `docs/design/atelier-guild-rank/core-systems-infrastructure.md`

### タスク定義
- TASK-0007定義: `docs/tasks/atelier-guild-rank/phase-1/TASK-0007.md`

### 要件定義
- 要件定義書: `docs/spec/atelier-guild-rank-requirements.md`

### 既存実装
- マスターデータリポジトリ: `atelier-guild-rank/src/infrastructure/repositories/master-data-repository.ts`
- セーブデータ型定義: `atelier-guild-rank/src/shared/types/save-data.ts`
- ゲーム状態型定義: `atelier-guild-rank/src/shared/types/game-state.ts`

---

## 補足情報

### localStorageの基本操作
```typescript
// 保存
localStorage.setItem(key, JSON.stringify(data));

// 読み込み
const json = localStorage.getItem(key);
const data = json ? JSON.parse(json) : null;

// 存在チェック
const exists = localStorage.getItem(key) !== null;

// 削除
localStorage.removeItem(key);
```

### エラーハンドリングパターン
```typescript
try {
  return JSON.parse(json) as ISaveData;
} catch (error) {
  console.error('Failed to parse save data', error);
  return null; // 破損データの場合はnullを返す
}
```

---

**最終更新**: 2026-01-16
