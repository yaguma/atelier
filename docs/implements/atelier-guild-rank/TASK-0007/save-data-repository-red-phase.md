# TDD Redフェーズ記録: セーブデータリポジトリ実装

**作成日**: 2026-01-16
**タスクID**: TASK-0007
**機能名**: save-data-repository
**フェーズ**: Red（失敗するテスト作成）

---

## 1. 作成したテストケース一覧

### 正常系テストケース（6件）

| テストID | テスト名 | 信頼性 |
|---------|---------|--------|
| T-0007-01 | セーブ→ロードで同一データ取得 | 🔵 |
| T-0007-02 | 存在チェック（存在時）でtrue返却 | 🔵 |
| T-0007-03 | 存在チェック（未存在時）でfalse返却 | 🔵 |
| T-0007-04 | 削除後にexists()がfalseを返す | 🔵 |
| T-0007-06 | 最終保存日時の取得 | 🔵 |
| T-0007-07 | セーブデータ未存在時のgetLastSavedTime() | 🔵 |

### 異常系テストケース（3件）

| テストID | テスト名 | 信頼性 |
|---------|---------|--------|
| T-0007-05 | 破損データのロードでnull返却 | 🔵 |
| T-0007-08 | localStorage容量超過時のエラー | 🔵 |
| T-0007-09 | localStorage非対応ブラウザでのエラー | 🟡 |

### 境界値テストケース（3件）

| テストID | テスト名 | 信頼性 |
|---------|---------|--------|
| T-0007-10 | バージョン不一致のセーブデータ | 🟡 |
| T-0007-11 | 空のセーブデータ | 🟡 |
| T-0007-12 | 大量データのセーブ | 🟡 |

**合計**: 12件のテストケース

---

## 2. テストコード

### ファイルパス
- テストファイル: `atelier-guild-rank/tests/unit/infrastructure/repositories/local-storage-save-repository.test.ts`
- インターフェース: `atelier-guild-rank/src/domain/interfaces/save-data-repository.interface.ts`

### テストの特徴

#### 使用技術
- **テストフレームワーク**: Vitest 4.x
- **言語**: TypeScript 5.x
- **モック**: `vi.fn()`, `vi.spyOn()`
- **アサーション**: Vitestの標準アサーション

#### テスト構造
- **Given-When-Then パターン**を採用
- 日本語コメント完備
- 各expectに検証内容のコメント付与
- 信頼性レベル（🔵🟡🔴）を明記

#### カバレッジ
- 全メソッドのテストを実装
  - `save()`: 正常系、容量超過エラー、大量データ
  - `load()`: 正常系、破損データ、バージョン不一致
  - `exists()`: 存在時/未存在時
  - `delete()`: 削除確認
  - `getLastSavedTime()`: 正常系/未存在時
- エッジケース対応
  - localStorage容量超過
  - localStorage非対応ブラウザ
  - 破損データ
  - バージョン不一致

---

## 3. 期待される失敗内容

### 実行結果
```
❯ pnpm test tests/unit/infrastructure/repositories/local-storage-save-repository.test.ts

 ❯ tests/unit/infrastructure/repositories/local-storage-save-repository.test.ts (12 tests | 12 failed)
       × セーブしたデータをロードすると完全に同一のデータが取得できる
       × セーブデータが存在する場合、exists()がtrueを返す
       × セーブデータが存在しない場合、exists()がfalseを返す
       × delete()実行後にセーブデータが完全に削除される
       × getLastSavedTime()が正しい日時を返す
       × セーブデータが存在しない場合、getLastSavedTime()がnullを返す
       × JSONパース不可能なデータが存在する場合、nullを返す
       × localStorage容量超過時に適切なエラーを投げる
       × localStorageが存在しないブラウザで適切なエラーを投げる
       × セーブデータのバージョンが異なる場合、nullを返す
       × 最小限のフィールドのみ持つセーブデータを正しく処理できる
       × 大量のアイテム・素材を持つセーブデータを正しく処理できる

TypeError: __vite_ssr_import_0__.LocalStorageSaveRepository is not a constructor
```

### エラー理由
- 実装ファイル `LocalStorageSaveRepository` が存在しない
- エクスポートが未定義

### 期待される動作
- **全12件のテストが失敗すること** ✅
- エラーメッセージが明確であること ✅
- テストコードが実行可能であること ✅

---

## 4. Greenフェーズで実装すべき内容

### 4.1 実装ファイル

#### ファイル: `atelier-guild-rank/src/infrastructure/repositories/local-storage-save-repository.ts`

**実装すべきクラス**: `LocalStorageSaveRepository`

**実装すべきメソッド**:

1. **constructor()**
   - localStorageの存在チェック
   - 非対応ブラウザでエラー（T-0007-09対応）

2. **save(data: ISaveData): Promise<void>**
   - JSON.stringify()でシリアライズ
   - localStorage.setItem()で保存
   - QuotaExceededErrorのハンドリング（T-0007-08対応）

3. **load(): Promise<ISaveData | null>**
   - localStorage.getItem()で取得
   - JSON.parse()でデシリアライズ
   - 破損データはnull返却（T-0007-05対応）
   - バージョンチェック（T-0007-10対応、推奨）

4. **exists(): boolean**
   - localStorage.getItem() !== null で判定

5. **delete(): Promise<void>**
   - localStorage.removeItem()で削除

6. **getLastSavedTime(): Date | null**
   - セーブデータから lastSaved フィールドを取得
   - ISO8601文字列をDate型に変換

### 4.2 エラーハンドリング

- **ApplicationError**を使用
- エラーコード:
  - `ErrorCodes.SAVE_FAILED`: 保存失敗
  - `ErrorCodes.LOAD_FAILED`: 読み込み失敗（重大エラーのみ）
  - `ErrorCodes.INVALID_SAVE_DATA`: データ破損（非推奨、nullで対応）

### 4.3 ストレージキー

- キー名: `'atelier-guild-rank-save'`
- 固定値として定義

### 4.4 バージョン管理（推奨）

- `isValidVersion(version: string): boolean` ヘルパー関数
- Phase 1では `version === '1.0.0'` の簡易チェック
- Phase 2以降でマイグレーション機能実装予定

### 4.5 エクスポート

- `src/infrastructure/repositories/index.ts` に追加:
  ```typescript
  export { LocalStorageSaveRepository } from './local-storage-save-repository';
  ```

---

## 5. 品質判定結果

### 5.1 テスト実行結果

| 項目 | 結果 |
|------|------|
| テスト実行 | ✅ 実行可能で失敗することを確認済み |
| 期待値 | ✅ 明確で具体的 |
| アサーション | ✅ 適切（expect文にコメント付与） |
| 実装方針 | ✅ 明確（Greenフェーズで実装すべき内容を文書化） |
| 信頼性レベル | ✅ 🔵（青信号）75%、🟡（黄信号）25%、🔴（赤信号）0% |

### 5.2 信頼性レベル分布

- **🔵 青信号**: 9件（75%）
  - タスク定義書・要件定義書に明記されたテストケース
  - T-0007-01〜08
- **🟡 黄信号**: 3件（25%）
  - 妥当な推測または推奨条件
  - T-0007-09（エラーコード未定義）
  - T-0007-10（バージョン管理は推奨）
  - T-0007-11〜12（カバレッジ向上のための追加）
- **🔴 赤信号**: 0件（0%）
  - 根拠のない推測なし

### 5.3 総合評価

**✅ 高品質**: Redフェーズ完了、Greenフェーズへ進行可能

**理由**:
- タスク定義書の必須テストケース（T-0007-01〜05）をすべてカバー
- 要件定義書のEdgeケース（破損データ、容量超過）を網羅
- 既存のテストパターン（master-data-repository.test.ts）に準拠
- 日本語コメント完備で意図が明確
- 信頼性レベルの75%が青信号（根拠あり）

---

## 6. 次のステップ

次のお勧めステップ: `/tsumiki:tdd-green atelier-guild-rank TASK-0007` でGreenフェーズ（最小実装）を開始するのだ。

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
|------|----------|---------|
| 2026-01-16 | 1.0.0 | Redフェーズ完了（失敗テスト作成） |
