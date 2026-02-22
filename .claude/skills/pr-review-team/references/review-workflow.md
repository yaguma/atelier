# Team Lead ワークフロー詳細

## 概要

Team Lead（review-lead）が実行する全手順。PR Review Teamの統括・議論・統合・投稿を担当する。

---

## Phase 1: 準備

### 1.1 PR情報取得

```bash
# PR番号が指定されている場合
gh pr view {PR_NUMBER} --json title,body,baseRefName,headRefName,number,url,files,additions,deletions

# カレントブランチの最新PR自動検出
gh pr view --json title,body,baseRefName,headRefName,number,url,files,additions,deletions

# PR差分取得
gh pr diff {PR_NUMBER}
```

### 1.2 チーム作成

```
TeamCreate: team_name="pr-review-{pr_number}"
```

### 1.3 タスク作成（5レビュアー分）

各レビュアーに対応するタスクを作成する。

| タスクID | 担当 | 内容 |
|---------|------|------|
| 1 | architect | コード品質・アーキテクチャレビュー |
| 2 | security | セキュリティレビュー |
| 3 | qa-leader | テスト品質レビュー |
| 4 | perf-specialist | パフォーマンスレビュー |
| 5 | game-design | ゲームデザインレビュー |

### 1.4 レビュアースポーン

5つのTask toolを**並列**で呼び出し、各レビュアーをスポーンする。

各レビュアーへの指示テンプレート:

```
あなたは「{role_name}」として、PR #{pr_number} のコードレビューを担当する。

## PR情報
- タイトル: {title}
- ブランチ: {head} → {base}
- 変更ファイル: {files}

## レビュー手順
1. 以下のチェックリストファイルを読み込む:
   .claude/skills/pr-review-team/references/checklists/{checklist_file}
2. 重要度定義を読み込む:
   .claude/skills/pr-review-team/references/severity-definitions.md
3. 出力フォーマットを読み込む:
   .claude/skills/pr-review-team/references/reviewer-output-format.md
4. PR差分で変更されたファイルをRead/Glob/Grepで分析する
5. チェックリストの各項目を順に確認する
6. reviewer-output-format.md のフォーマットに従い結果をまとめる
7. SendMessageでTeam Lead（review-lead）に結果を送信する

## 重要な注意
- ファイル編集は禁止（Read/Glob/Grepのみ使用）
- PR差分に含まれる変更のみをレビュー対象とする
- 指摘には必ず根拠（ルールファイル名 or 技術的理由）を示す
```

---

## Phase 2: 並列レビュー

5レビュアーが同時にレビューを実行し、結果をSendMessageで報告。

Team Leadは以下を行う:
- 各レビュアーからのメッセージを受信（自動配信）
- 全5レビュアーの報告が揃うまで待機

---

## Phase 3: 議論・統合

### 3.1 重複指摘の統合

複数レビュアーが同じ問題を異なる観点から指摘した場合:
- 最も適切な観点の指摘を主として採用
- 他の観点からの補強情報を付記

### 3.2 クロスカッティング問題の特定

以下のパターンを検出:
- **同じファイル**が複数観点から指摘されている → 根本的な設計問題の可能性
- **同じパターンの問題**が複数ファイルで検出 → 横断的な改善が必要
- **ある観点のWarning**が**別の観点のCritical**と関連 → 重要度の引き上げ検討

### 3.3 重要度の最終判定

- レビュアーの判定を尊重しつつ、全体的な整合性を確保
- 根拠が不十分なCriticalはWarningに格下げ
- クロスカッティング分析でCriticalに引き上げる場合は根拠を明記

### 3.4 最終レポート作成

`pr-comment-template.md` のフォーマットに従い統合レポートを作成。

---

## Phase 4: 投稿・クリーンアップ

### 4.1 PRコメント投稿

```bash
gh pr comment {PR_NUMBER} --body "$(cat <<'EOF'
{統合レポート内容}
EOF
)"
```

### 4.2 ローカル保存

```
docs/reviews/{YYYYMMDD}-pr-{PR_NUMBER}-review.md
```

に統合レポートを保存する。

### 4.3 チーム解散

1. 全レビュアーに `shutdown_request` を送信
2. 全レビュアーのシャットダウン確認後、`TeamDelete` を実行

---

## クイックモード（--quick）

`--quick` オプションが指定された場合、Phase 3を簡略化:

- 重複指摘の統合は行うが、クロスカッティング分析はスキップ
- 重要度の調整は最小限（明らかな誤判定のみ修正）
- Good Points は最大1つ
- Recommended Fix Order は省略

---

## エラーハンドリング

### レビュアーが応答しない場合
- 30秒以上応答がない場合、再度メッセージを送信
- それでも応答がない場合、そのレビュアーの結果なしでレポートを生成

### PR差分が空の場合
- 「変更なし」のレポートを投稿して終了

### gh コマンドが失敗する場合
- エラーメッセージをユーザーに通知
- 認証やリポジトリ設定の確認を促す
