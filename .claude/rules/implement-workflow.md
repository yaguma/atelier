# 実装ワークフロールール

## 概要

タスク実装の標準ワークフローとモード判定基準を定義する。
アーキテクチャ詳細は `architecture.md`、テスト詳細は `testing.md`、コーディングスタイルは `coding-style.md` を参照。

---

## ワークフロー全体

```
/start-task
  → /dev-cycle
      [context-gather → test-design → implement → simplify(標準コマンド) → verify]
  → /commit-push-pr
  → /pr-review-team
```

### 各フェーズの概要

| フェーズ | 内容 | 使用スキル/エージェント |
|---------|------|----------------------|
| start-task | mainからブランチ作成 | /start-task |
| context-gather | 関連コード・定数・テストパターン収集 | /context-gather, context-researcher |
| test-design | テストケース設計 | /test-design |
| implement | TDDまたはDirect実装 | tdd-implementer |
| simplify | 不要な複雑性の除去 | /simplify（Claude Code標準コマンド） |
| verify | 品質チェック | quality-checker |
| commit-push-pr | コミット・プッシュ・PR作成 | /commit-push-pr |
| pr-review-team | チームレビュー | /pr-review-team |

---

## モード判定基準

タスクの対象に応じて実装モード（TDD / Direct）を判定する。

### TDDモード

テスト駆動開発（Red→Green→Refactor）で実装する対象:

| 対象 | 理由 |
|------|------|
| `services/` 配下の純粋関数 | Functional Coreの品質保証 |
| ビジネスロジック・計算処理 | 正確性の担保 |
| バリデーション関数 | 境界値テストが重要 |
| データ変換関数 | 入出力の明確な定義 |
| `components/` 配下のUI | イベント連携テスト中心 |

### Directモード

テストを先行せず直接実装する対象:

| 対象 | 理由 |
|------|------|
| 設定ファイル変更 | 宣言的な変更のため |
| ディレクトリ作成・環境構築 | インフラ作業のため |
| 依存パッケージ追加 | 設定作業のため |
| 型定義のみの変更 | 実行時の振る舞いがないため |
| ドキュメント更新 | コードではないため |

---

## 実装チェックリスト

実装完了時に以下を確認する。

### アーキテクチャ

- [ ] Feature-Based Architectureのディレクトリ規約に従っている
- [ ] `index.ts` で公開APIが更新されている
- [ ] Functional Core（`services/`）に副作用がない
- [ ] 機能モジュール間のインポートは `index.ts` 経由

### コード品質

- [ ] マジックナンバーがGAME_CONFIGまたはTHEMEに定数化されている
- [ ] `any` 型を使用していない
- [ ] 命名規則に従っている（`coding-style.md` 参照）

### テスト

- [ ] テストファイルが `tests/unit/` または `tests/integration/` に配置されている
- [ ] テストファイルで `@features/`, `@shared/` エイリアスを使用している
- [ ] 正常系・異常系・境界値のテストがある

### リソース管理

- [ ] EventBus購読にはunsubscribe処理がある
- [ ] `destroy()` でリソースが解放されている
- [ ] タイマー・Tweenが適切に停止される

---

## コミット前の必須確認

以下の3つが全てPassしていることを確認してからコミットする。

```bash
# 1. 全テスト
pnpm test -- --run

# 2. 型チェック
pnpm typecheck

# 3. リント
pnpm lint
```

いずれかが失敗している場合はコミットしない。
`lefthook` のpre-commitフックでも自動チェックされるが、事前に確認することを推奨する。

---

## エラー対応フロー

### テスト失敗時

1. 失敗テストのエラーメッセージを確認
2. 期待値と実際の値の差異を分析
3. 実装コードを修正（テストコードの修正は慎重に）
4. 再実行して確認

### 型エラー時

1. エラー箇所と型定義を確認
2. 型の不整合を修正
3. 関連する型のインポートを確認
4. 再実行して確認

### リント違反時

1. `pnpm lint:fix` で自動修正を試行
2. 手動修正が必要な項目を対応
3. 再実行して確認
