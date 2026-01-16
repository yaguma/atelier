# TDD Greenフェーズ記録: セーブデータリポジトリ実装

**作成日**: 2026-01-16
**タスクID**: TASK-0007
**機能名**: save-data-repository
**フェーズ**: Green（最小実装）

---

## 1. 実装概要

### 1.1 実装したクラス 🔵

**クラス名**: `LocalStorageSaveRepository`
**ファイルパス**: `atelier-guild-rank/src/infrastructure/repositories/local-storage-save-repository.ts`
**インターフェース**: `ISaveDataRepository`

### 1.2 実装したメソッド 🔵

| メソッド | 説明 | テスト対応 |
|---------|------|-----------|
| `constructor()` | localStorage対応チェック | T-0007-09 |
| `save(data)` | セーブデータを保存 | T-0007-01, T-0007-08 |
| `load()` | セーブデータを読み込み | T-0007-01, T-0007-05, T-0007-10 |
| `exists()` | セーブデータの存在チェック | T-0007-02, T-0007-03, T-0007-04 |
| `delete()` | セーブデータを削除 | T-0007-04 |
| `getLastSavedTime()` | 最終保存日時を取得 | T-0007-06, T-0007-07 |
| `isValidVersion()` | バージョン検証（private） | T-0007-10 |

---

## 2. 実装コード

### 2.1 LocalStorageSaveRepository実装

```typescript
/**
 * local-storage-save-repository.ts - LocalStorageセーブデータリポジトリ実装
 *
 * TASK-0007: セーブデータリポジトリ実装
 * LocalStorageを使用したセーブデータの永続化機能
 */

import type { ISaveDataRepository } from '@domain/interfaces';
import type { ISaveData } from '@shared/types';
import { ApplicationError, ErrorCodes } from '@shared/types';

export class LocalStorageSaveRepository implements ISaveDataRepository {
  private readonly STORAGE_KEY = 'atelier-guild-rank-save';

  constructor() {
    if (typeof localStorage === 'undefined') {
      throw new ApplicationError(
        ErrorCodes.SAVE_FAILED,
        'お使いのブラウザはセーブ機能に対応していません',
      );
    }
  }

  async save(data: ISaveData): Promise<void> {
    try {
      const json = JSON.stringify(data);
      localStorage.setItem(this.STORAGE_KEY, json);
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        throw new ApplicationError(ErrorCodes.SAVE_FAILED, 'ストレージ容量が不足しています');
      }
      throw error;
    }
  }

  async load(): Promise<ISaveData | null> {
    const json = localStorage.getItem(this.STORAGE_KEY);
    if (!json) {
      return null;
    }

    try {
      const data = JSON.parse(json) as ISaveData;
      if (!this.isValidVersion(data.version)) {
        console.warn('Invalid save version:', data.version);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Failed to parse save data', error);
      return null;
    }
  }

  exists(): boolean {
    return localStorage.getItem(this.STORAGE_KEY) !== null;
  }

  async delete(): Promise<void> {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  getLastSavedTime(): Date | null {
    const json = localStorage.getItem(this.STORAGE_KEY);
    if (!json) {
      return null;
    }

    try {
      const data = JSON.parse(json) as ISaveData;
      return new Date(data.lastSaved);
    } catch (error) {
      return null;
    }
  }

  private isValidVersion(version: string): boolean {
    return version === '1.0.0';
  }
}
```

### 2.2 エクスポート更新

**ファイル**: `atelier-guild-rank/src/infrastructure/repositories/index.ts`

```typescript
export { LocalStorageSaveRepository } from './local-storage-save-repository';
export type { IMasterDataRepositoryConfig } from './master-data-repository';
export { MasterDataRepository } from './master-data-repository';
```

---

## 3. テスト実行結果

### 3.1 テスト結果サマリ 🔵

```
✓ tests/unit/infrastructure/repositories/local-storage-save-repository.test.ts (12 tests)

Test Files  1 passed (1)
Tests       12 passed (12)
Duration    4.47s
```

### 3.2 各テストケースの結果 🔵

| テストID | テスト名 | 結果 | 実行時間 |
|---------|---------|------|---------|
| T-0007-01 | セーブ→ロードで同一データ取得 | ✅ PASS | 3ms |
| T-0007-02 | 存在チェック（存在時）でtrue返却 | ✅ PASS | 1ms |
| T-0007-03 | 存在チェック（未存在時）でfalse返却 | ✅ PASS | 0ms |
| T-0007-04 | 削除後にexists()がfalseを返す | ✅ PASS | 1ms |
| T-0007-05 | 破損データのロードでnull返却 | ✅ PASS | 5ms |
| T-0007-06 | 最終保存日時の取得 | ✅ PASS | 1ms |
| T-0007-07 | セーブデータ未存在時のgetLastSavedTime() | ✅ PASS | 0ms |
| T-0007-08 | localStorage容量超過時のエラー | ✅ PASS | 4ms |
| T-0007-09 | localStorage非対応ブラウザでのエラー | ✅ PASS | 1ms |
| T-0007-10 | バージョン不一致のセーブデータ | ✅ PASS | 0ms |
| T-0007-11 | 空のセーブデータ | ✅ PASS | 0ms |
| T-0007-12 | 大量データのセーブ | ✅ PASS | 1ms |

**合計**: 12件のテストケース全てが成功 ✅

---

## 4. 実装方針と判断理由

### 4.1 設計判断 🔵

#### 判断1: async/awaitの使用
- **理由**: 将来的なIndexedDB対応のため、非同期APIを採用
- **実装**: `save()`, `load()`, `delete()`をPromiseで実装
- **影響**: 同期的なlocalStorageを非同期APIでラップ

#### 判断2: バージョン管理の簡易実装
- **理由**: Phase 1では最小実装、Phase 2以降でマイグレーション機能を実装予定
- **実装**: `isValidVersion()`で`version === '1.0.0'`の簡易チェック
- **影響**: 旧バージョンのセーブデータは自動的に破棄（新規ゲーム扱い）

#### 判断3: エラーハンドリング戦略
- **破損データ**: nullを返却（例外を飲み込む）→ ゲーム起動可能
- **容量超過**: ApplicationErrorをthrow → ユーザーに通知
- **localStorage非対応**: ApplicationErrorをthrow → 起動時エラー

#### 判断4: ストレージキーの固定値
- **理由**: 複数のセーブスロットは将来的な拡張機能
- **実装**: `STORAGE_KEY = 'atelier-guild-rank-save'`
- **影響**: 現在は1つのセーブデータのみサポート

### 4.2 実装上の工夫 🔵

#### 工夫1: エラーメッセージの日本語化
- **実装**: ApplicationErrorのメッセージをユーザーフレンドリーな日本語に
- **例**: 「ストレージ容量が不足しています」
- **効果**: エンドユーザーが対処方法を理解しやすい

#### 工夫2: コンソールログの活用
- **実装**: `console.warn()`, `console.error()`でデバッグ情報を出力
- **例**: 「Invalid save version: 0.9.0」
- **効果**: 開発者がエラー原因を特定しやすい

#### 工夫3: 早期リターンパターン
- **実装**: `load()`メソッドで`if (!json) return null;`
- **効果**: ネストを減らし、可読性を向上

---

## 5. 課題・改善点（Refactorフェーズで対応）

### 5.1 リファクタリング候補 🟡

#### 課題1: バージョン管理の拡張
- **現状**: `version === '1.0.0'`のハードコーディング
- **改善案**: セマンティックバージョニングの比較関数を実装
- **優先度**: 中（Phase 2以降で対応）

#### 課題2: 複数セーブスロット対応
- **現状**: 1つのセーブデータのみサポート
- **改善案**: `save(slotId, data)`, `load(slotId)`のようなAPI拡張
- **優先度**: 低（将来的な機能拡張）

#### 課題3: データ圧縮オプション
- **現状**: JSON文字列をそのまま保存
- **改善案**: LZ-Stringなどの圧縮ライブラリを導入
- **優先度**: 低（容量制限が問題になった場合に対応）

### 5.2 コード品質改善 🟡

#### 改善1: エラーコードの追加
- **現状**: `ErrorCodes.SAVE_FAILED`を複数の用途で使用
- **改善案**: `ErrorCodes.STORAGE_NOT_SUPPORTED`を追加
- **優先度**: 低（現在の実装でも問題なし）

#### 改善2: テストモックの改善
- **現状**: テストファイル内でlocalStorageモックを再実装
- **改善案**: `tests/setup.ts`のlocalStorageモックを削除し、jsdomのデフォルトを使用
- **優先度**: 中（他のテストへの影響を確認後に対応）

### 5.3 パフォーマンス改善 🟡

#### 改善1: JSON.parse/stringifyの最適化
- **現状**: 毎回全データをシリアライズ/デシリアライズ
- **改善案**: 頻繁に更新されるフィールドのみを部分的に保存
- **優先度**: 低（現在のパフォーマンスで十分）

---

## 6. 品質判定結果

### 6.1 評価結果 ✅

| 評価項目 | 判定 | 理由 |
|---------|------|------|
| **テスト結果** | ✅ 成功 | 全12件のテストが成功 |
| **実装品質** | ✅ シンプル | 各メソッドが単一責任を持つ |
| **リファクタ箇所** | ✅ 明確 | バージョン管理、エラーコードが改善候補 |
| **機能的問題** | ✅ なし | 全ての要件を満たす |
| **コンパイルエラー** | ✅ なし | TypeScriptの型チェックが通る |
| **ファイルサイズ** | ✅ 適切 | 193行（800行制限を大きく下回る） |
| **モック使用** | ✅ 適切 | 実装コードにモック・スタブが含まれていない |

### 6.2 信頼性レベル分布 🔵

- 🔵 **青信号**: 95% （タスク定義書・要件定義書に基づく実装）
- 🟡 **黄信号**: 5% （バージョン管理の簡易実装）
- 🔴 **赤信号**: 0% （推測なし）

### 6.3 総合評価 ✅

**✅ 高品質**: Greenフェーズ完了、Refactorフェーズへ進行可能

**理由**:
- 全12件のテストが成功
- 実装がシンプルで理解しやすい
- リファクタリング箇所が明確に特定されている
- 機能的な問題がない
- ファイルサイズが適切（193行）
- 実装コードにモック・スタブが含まれていない

---

## 7. テスト修正履歴

### 7.1 修正1: GamePhaseの値修正 🔵

**問題**: テストデータで`GamePhase.QUEST_PHASE`を使用していたが、定義に存在しない
**修正**: `GamePhase.QUEST_ACCEPT`に変更
**影響**: T-0007-01, T-0007-11のテストデータ

### 7.2 修正2: localStorageモックの実装 🔵

**問題**: `tests/setup.ts`でlocalStorageがvi.fn()のモックに置き換えられており、実際には何も保存されない
**修正**: テストファイルのbeforeEachで実際に動作するlocalStorageを実装
**影響**: 全テストケース

**実装内容**:
```typescript
const storageMap = new Map<string, string>();
storage = {
  getItem: vi.fn((key: string) => storageMap.get(key) ?? null),
  setItem: vi.fn((key: string, value: string) => {
    storageMap.set(key, value);
  }),
  removeItem: vi.fn((key: string) => {
    storageMap.delete(key);
  }),
  clear: vi.fn(() => {
    storageMap.clear();
  }),
  length: 0,
  key: vi.fn(() => null),
};
```

### 7.3 修正3: 容量超過エラーモックの修正 🔵

**問題**: `vi.spyOn(Storage.prototype, 'setItem')`がbeforeEachで作成したlocalStorageオブジェクトに適用されない
**修正**: `storage.setItem`を直接上書き
**影響**: T-0007-08のテストケース

---

## 8. 次のステップ

### 8.1 自動遷移判定 ✅

以下の条件を満たすため、自動でRefactorフェーズに進むことを推奨:

- ✅ 全てのテストが成功していることを確認済み
- ✅ 実装がシンプルで理解しやすい
- ✅ 明らかなリファクタリング箇所がある（バージョン管理、エラーコード）
- ✅ 機能的な問題がない

次のお勧めステップ: `/tsumiki:tdd-refactor atelier-guild-rank TASK-0007` でRefactorフェーズ（品質改善）を開始するのだ。

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
|------|----------|---------|
| 2026-01-16 | 1.0.0 | Greenフェーズ完了（最小実装） |
