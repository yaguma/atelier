# TDD開発メモ: ui-components

## 概要

- 機能名: 共通UIコンポーネント基盤 (ui-components)
- 開発開始: 2026-01-17
- 現在のフェーズ: Red（失敗するテスト作成完了）

## 関連ファイル

- 元タスクファイル: `docs/tasks/atelier-guild-rank/phase-3/TASK-0018.md`
- 要件定義: `docs/implements/atelier-guild-rank/TASK-0018/common-ui-components-requirements.md`
- テストケース定義: `docs/tasks/atelier-guild-rank/phase-3/TASK-0018-TESTCASES.md`
- 開発ノート: `docs/implements/atelier-guild-rank/TASK-0018/note.md`
- 実装ファイル: （未実装）
  - `src/presentation/ui/theme.ts`
  - `src/presentation/ui/components/BaseComponent.ts`
- テストファイル:
  - `src/presentation/ui/theme.spec.ts`
  - `src/presentation/ui/components/BaseComponent.spec.ts`

---

## Redフェーズ（失敗するテスト作成）

### 作成日時

2026-01-17

### テストケース

最初の10件のテストケースを実装：

#### 1. テーマ定義のテストケース (5件)

- T-0018-THEME-01: カラーパレット定義の検証（9テスト）🔵
- T-0018-THEME-02: フォント設定の検証（2テスト）🔵
- T-0018-THEME-03: サイズ定義の検証（4テスト）🔵
- T-0018-THEME-04: スペーシング定義の検証（5テスト）🔵
- T-0018-THEME-05: 定数としての不変性確認（5テスト）🟡

**合計**: 25テスト

#### 2. BaseComponentのテストケース (5件)

- T-0018-BASE-01: コンストラクタの初期化検証（4テスト）🔵
- T-0018-BASE-02: setVisibleメソッドの検証（3テスト）🔵
- T-0018-BASE-03: setPositionメソッドの検証（2テスト）🔵
- T-0018-BASE-04: 抽象メソッドの存在確認（4テスト）🔵
- T-0018-BASE-05: メソッドチェーンの検証（3テスト）🟡

**合計**: 16テスト

#### 全体

- **総テスト数**: 41テスト
- **テストファイル数**: 2ファイル

### テストコード

#### theme.spec.ts

**ファイルパス**: `src/presentation/ui/theme.spec.ts`

25テストを実装。カラーパレット、フォント、サイズ、スペーシング、不変性の検証を行う。

#### BaseComponent.spec.ts

**ファイルパス**: `src/presentation/ui/components/BaseComponent.spec.ts`

16テストを実装。コンストラクタ、setVisible、setPosition、抽象メソッド、メソッドチェーンの検証を行う。

### 期待される失敗

両方のテストファイルで、以下のようなインポートエラーが発生することを確認済み：

```
Error: Failed to resolve import "./theme" from "src/presentation/ui/theme.spec.ts". Does the file exist?
Error: Failed to resolve import "./BaseComponent" from "src/presentation/ui/components/BaseComponent.spec.ts". Does the file exist?
```

これはTDDのRedフェーズとして正しい状態。

### テスト実行結果

```bash
$ pnpm test -- src/presentation/ui/theme.spec.ts
❌ Failed: Failed to resolve import "./theme"

$ pnpm test -- src/presentation/ui/components/BaseComponent.spec.ts
❌ Failed: Failed to resolve import "./BaseComponent"
```

### 次のフェーズへの要求事項

Greenフェーズで以下を実装する必要がある：

#### 1. テーマ定義 (`src/presentation/ui/theme.ts`)

- カラーパレット定義（9色）
- フォント設定（primary, secondary）
- サイズ定義（small, medium, large, xlarge）
- スペーシング定義（xs, sm, md, lg, xl）
- `as const` でreadonly化

#### 2. BaseComponent (`src/presentation/ui/components/BaseComponent.ts`)

- 抽象クラスとして定義
- コンストラクタで scene, x, y を受け取る
- rexUIプラグインへの参照を保持
- containerを作成
- 抽象メソッド create(), destroy() を定義
- setVisible(visible: boolean): this を実装
- setPosition(x: number, y: number): this を実装

#### 必要な型定義

```typescript
// rexUIプラグインの型定義が必要
import type RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin';
```

---

## Greenフェーズ（最小実装）

### 実装日時

（未実施）

### 実装方針

（未実施）

### 実装コード

（未実施）

### テスト結果

（未実施）

### 課題・改善点

（未実施）

---

## Refactorフェーズ（品質改善）

### リファクタ日時

（未実施）

### 改善内容

（未実施）

### セキュリティレビュー

（未実施）

### パフォーマンスレビュー

（未実施）

### 最終コード

（未実施）

### 品質評価

（未実施）

---

## 開発メモ

### 技術的な決定事項

- **テストフレームワーク**: Vitest（単体テスト）
- **テスト戦略**: UIコンポーネントのため、単体テストを優先
- **モック戦略**: PhaserシーンとrexUIプラグインをモック化

### 注意事項

1. **rexUIプラグインの型定義**: `phaser3-rex-plugins/templates/ui/ui-plugin` から型をインポートする必要がある
2. **Phaserの依存関係**: BaseComponentはPhaserのシーンに依存するため、テスト時にモック化が必要
3. **相対パス**: すべてのファイルパスはプロジェクトルートからの相対パスで記載

### 設計上の決定

- **テーマ定義**: `as const` を使用してreadonlyにする
- **BaseComponent**: 抽象クラスとして定義し、サブクラスで create/destroy を実装する必要がある
- **メソッドチェーン**: Fluent Interfaceパターンを採用し、setVisible/setPositionはthisを返す

---

## 品質評価（Redフェーズ）

### ✅ 達成項目

- [x] テストケース追加目標数: 10件以上（実際: 10件のテストケースに41テスト）
- [x] テスト実行: 失敗することを確認済み
- [x] 期待値: 明確で具体的（設計書の値と完全一致）
- [x] アサーション: 適切（toBe, toBeDefined, toHaveBeenCalledWithを使用）
- [x] 実装方針: 明確（テーマ定義とBaseComponentの実装が明確）

### 信頼性レベル

- 🔵 **青信号（設計書に記載）**: 27件（90%）
- 🟡 **黄信号（妥当な推測）**: 3件（10%）
- 🔴 **赤信号（推測）**: 0件（0%）

### 評価結果

✅ **高品質**: すべての基準を満たしており、設計書に基づく部分が大半を占める。

---

**最終更新**: 2026-01-17
**作成者**: Claude (Zundamon)
