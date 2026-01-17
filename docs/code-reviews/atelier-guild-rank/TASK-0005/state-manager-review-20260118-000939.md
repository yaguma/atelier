# コードレビューレポート

**レビュー日時**: 2026-01-18 00:09:39
**レビューモード**: コミットID (48c8fd5)
**対象ファイル数**: 5個
**対象機能**: StateManager
**タスクID**: TASK-0005

---

## 📊 サマリー

| 観点 | 評価 | Critical | Warning | Info |
|------|------|----------|---------|------|
| セキュリティ | ✅ | 0 | 0 | 0 |
| パフォーマンス | ✅ | 0 | 1 | 0 |
| コード品質 | ✅ | 0 | 0 | 1 |
| SOLID原則 | ✅ | 0 | 0 | 0 |
| テスト品質 | ⚠️ | 0 | 2 | 1 |
| 日本語コメント | ✅ | 0 | 0 | 1 |
| エラーハンドリング | ⚠️ | 0 | 2 | 0 |

**総合評価**: ⚠️ 要改善 (Warning 5件)

---

## 🔴 Critical Issues（即時修正必須）

なし

---

## 🟡 Warning Issues（早期修正推奨）

### W-001: 入力値検証の欠如（spendActionPoints）
- **カテゴリ**: エラーハンドリング
- **ファイル**: `atelier-guild-rank/src/application/services/state-manager.ts:145-156`
- **問題内容**: `spendActionPoints(amount)` で `amount` が負数や0の場合のバリデーションがない。負数を指定すると行動ポイントが増加してしまう可能性がある。
- **推奨修正**:
  ```typescript
  spendActionPoints(amount: number): boolean {
    if (amount <= 0) {
      throw new DomainError(ErrorCodes.INVALID_OPERATION, 'Amount must be positive');
    }
    // ...
  }
  ```
- **信頼性レベル**: 🔴 赤信号（一般的なベストプラクティス）

### W-002: 入力値検証の欠如（spendGold/addGold）
- **カテゴリ**: エラーハンドリング
- **ファイル**: `atelier-guild-rank/src/application/services/state-manager.ts:163-187`
- **問題内容**: `spendGold(amount)` と `addGold(amount)` でも同様に負数のバリデーションがない。
- **推奨修正**: 同様に `amount <= 0` のチェックを追加する。
- **信頼性レベル**: 🔴 赤信号（一般的なベストプラクティス）

### W-003: addContributionがTODO未実装
- **カテゴリ**: テスト品質
- **ファイル**: `atelier-guild-rank/src/application/services/state-manager.ts:198-200`
- **問題内容**: `addContribution` メソッドが未実装で、引数 `_amount` を使用していない。インターフェースに定義されているにも関わらず、実装が空のままになっている。
- **推奨修正**: TASK-0014で詳細実装予定と記載されているが、現時点では `throw new Error('Not implemented')` とするか、将来のタスクで対応する旨をインターフェースにも明記すべき。
- **信頼性レベル**: 🔵 青信号（コード内のTODOコメントに基づく）

### W-004: テストケースでaddContributionがスキップされている
- **カテゴリ**: テスト品質
- **ファイル**: `atelier-guild-rank/tests/unit/application/services/state-manager.test.ts:304-309`
- **問題内容**: `addContribution` のテストケースが実質コメントアウトされており、テストがスキップされている状態。
- **推奨修正**: `it.skip` を使用して明示的にスキップするか、TODOコメントを残して将来のタスクで対応する。
- **信頼性レベル**: 🔵 青信号（テストコードの状態に基づく）

### W-005: オブジェクト生成コストの改善余地
- **カテゴリ**: パフォーマンス
- **ファイル**: `atelier-guild-rank/src/application/services/state-manager.ts:50-57, 122-127, 150-153`
- **問題内容**: `getState()` を含む多くのメソッドで毎回スプレッド演算子を使用してオブジェクトをコピーしている。頻繁に呼び出されると、不要なオブジェクト生成が発生する可能性がある。
- **推奨修正**: 現時点では許容範囲だが、パフォーマンス問題が発生した場合は `Object.freeze()` の使用や、イミュータブルライブラリの導入を検討する。
- **信頼性レベル**: 🔴 赤信号（一般的なベストプラクティス）

---

## 🔵 Info Issues（改善推奨）

### I-001: 信頼性レベル（🔵🟡🔴）がコメントに付与されていない
- **カテゴリ**: 日本語コメント
- **ファイル**: 全ファイル
- **問題内容**: コメントに信頼性レベルの付与がされていない。プロジェクトのコメント規約によっては、信頼性レベルの付与が求められる。
- **推奨改善**: 今後の実装でコメントに信頼性レベルを付与することを検討する。
- **信頼性レベル**: 🔴 赤信号（プロジェクト固有の規約）

### I-002: updateStateのイベント発火不足
- **カテゴリ**: コード品質
- **ファイル**: `atelier-guild-rank/src/application/services/state-manager.ts:64-69`
- **問題内容**: `updateState` メソッドは状態を更新するが、汎用的な `STATE_CHANGED` イベントを発火していない。`setPhase` や `advanceDay` は個別のイベントを発火しているが、`updateState` には対応するイベントがない。
- **推奨改善**: 必要に応じて `STATE_CHANGED` イベントの追加を検討する。
- **信頼性レベル**: 🔴 赤信号（一般的なベストプラクティス）

### I-003: テストケースのイベント検証が不完全
- **カテゴリ**: テスト品質
- **ファイル**: `atelier-guild-rank/tests/unit/application/services/state-manager.test.ts:81-87`
- **問題内容**: `updateState` のテストケースでイベント発火の検証がコメントのみで実装されていない。
- **推奨改善**: イベント発火の仕様が確定したら、テストを追加する。
- **信頼性レベル**: 🔵 青信号（テストコードのコメントに基づく）

---

## ✅ 良い点

レビュー対象コードの優れている点を記載します：

1. **明確なインターフェース定義**: `IStateManager` インターフェースが詳細なJSDocコメントとともに定義されており、各メソッドの責務が明確に分かる。

2. **イミュータブルな状態管理**: `getState()` がコピーを返すことで、外部からの状態の直接変更を防いでいる。テストケースでもこれを検証している。

3. **フェーズ遷移の厳格な管理**: `VALID_PHASE_TRANSITIONS` マップを使用して有効なフェーズ遷移のみを許可し、不正な遷移を例外で拒否している。

4. **適切なエラー型の使用**: `DomainError` クラスを使用し、エラーコード（`ErrorCodes.INVALID_PHASE_TRANSITION`）とメッセージを分離している。

5. **イベント駆動アーキテクチャ**: `IEventBus` を依存性注入して、状態変更時にイベントを発行する設計になっている。これにより、疎結合な設計が実現されている。

6. **セクション分けによる構造化**: コード内でセクションコメント（`// ===...===`）を使用して、機能ごとにコードを整理している。

7. **包括的なテストケース**: 22個のテストケースがあり、主要なパス（正常系・異常系）をカバーしている。

8. **定数の分離**: `INITIAL_GAME_STATE`、`MAX_ACTION_POINTS`、`VALID_PHASE_TRANSITIONS` を別ファイルに分離し、再利用性を高めている。

---

## 📝 推奨アクション

優先度順に修正すべき項目をリストアップします：

### 最優先（Critical対応）
なし

### 高優先（Warning対応）
1. `spendActionPoints`、`spendGold`、`addGold` に入力値検証を追加する（W-001, W-002）
2. `addContribution` のTODO状態を明確化し、テストケースを `it.skip` に変更する（W-003, W-004）

### 中優先（Info対応）
1. 必要に応じて `updateState` にイベント発火を追加する（I-002）
2. テストケースのイベント検証を完全にする（I-003）

---

## 次のステップ

⚠️ Warning問題が検出されました。早期修正を推奨します。

次のお勧めステップ:
1. `/tdd-code-review-fix` でレビュー結果に基づいて修正を実行
2. または `/tdd-verify-complete` で完全性検証に進む（修正は後で対応）

---

## レビュー対象ファイル一覧

| ファイル | 追加行数 | 概要 |
|---------|---------|------|
| `state-manager.interface.ts` | 136行 | IStateManagerインターフェース定義 |
| `initial-state.ts` | 52行 | 初期状態とフェーズ遷移ルール定義 |
| `state-manager.ts` | 268行 | StateManagerクラス実装 |
| `index.ts` | 9行（変更） | エクスポート追加 |
| `state-manager.test.ts` | 311行 | テストケース（22件） |
