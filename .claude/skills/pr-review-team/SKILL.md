---
name: pr-review-team
description: |
  5人の専門レビュアー + Team Leadによる多角的PRコードレビュー。
  アーキテクチャ・セキュリティ・テスト品質・パフォーマンス・ゲームデザインの5観点で並列レビューし、
  クロスカッティング分析で根本的な問題を特定する。
  使用タイミング:
  (1) 「PRレビューして」「チームでレビュー」と言われた時
  (2) 「/pr-review-team」コマンドが実行された時
  (3) PR番号やURLが指定された時
  引数: <PR番号> or <PR URL>（省略時: カレントブランチの最新PRを自動検出）
  オプション: --quick（議論フェーズをスキップ、小規模PR向け）
---

# PR Review Team

5人の専門レビュアーによる多角的PRコードレビューを実行する。

## チーム構成

| 役割 | エージェント名 | 専門領域 |
|------|--------------|----------|
| Team Lead | review-lead | 統括・議論・統合・PRコメント投稿 |
| Senior Architect | architect | コード品質・アーキテクチャ・SOLID原則 |
| Senior Security Engineer | security | セキュリティ脆弱性・入力検証 |
| QA Leader | qa-leader | テストカバレッジ・テスト品質 |
| Performance Specialist | perf-specialist | Phaserライフサイクル・メモリリーク |
| Game Design Reviewer | game-design | ゲームロジック整合性・状態管理 |

## 引数の解析

ユーザー入力から以下を抽出:
- **PR番号**: 数字のみ → `gh pr view {number}`
- **PR URL**: `https://github.com/.../pull/{number}` → PR番号を抽出
- **省略時**: `gh pr view` でカレントブランチのPRを自動検出
- **--quick**: 引数に含まれていればクイックモードを有効化

## ワークフロー

詳細は [references/review-workflow.md](references/review-workflow.md) を参照。

### Phase 1: 準備（Team Lead自身が実行）

1. PR情報を取得する

```bash
# PR番号が判明している場合
gh pr view {PR_NUMBER} --json title,body,baseRefName,headRefName,number,url,additions,deletions

# 差分を取得
gh pr diff {PR_NUMBER}
```

2. 変更ファイル一覧を取得する

```bash
gh pr diff {PR_NUMBER} --name-only
```

3. TeamCreateでチームを作成する

```
TeamCreate: team_name = "pr-review-{PR_NUMBER}"
```

4. TaskCreateで5つのレビュータスクを作成する

5. Task toolで5つのレビュアーを**並列で**スポーンする

各レビュアーには以下を渡す:
- PR番号、タイトル、変更ファイル一覧
- 担当チェックリストのパス
- reviewer-output-format.md のパス
- severity-definitions.md のパス
- 「ファイル編集禁止、Read/Glob/Grepのみ使用」の指示
- 「レビュー完了後、SendMessageでreview-leadに結果を送信」の指示

#### レビュアースポーン時の指示テンプレート

```
あなたは PR #{pr_number} 「{title}」の {role_name} レビュアーである。
チーム名: pr-review-{pr_number}
あなたの名前: {agent_name}

## レビュー手順
1. まず以下のファイルを読み込む:
   - .claude/skills/pr-review-team/references/severity-definitions.md
   - .claude/skills/pr-review-team/references/reviewer-output-format.md
   - .claude/skills/pr-review-team/references/checklists/{checklist_file}
2. PR差分で変更されたファイルをRead toolで読む（変更ファイル一覧: {file_list}）
3. チェックリストの各項目を確認する
4. reviewer-output-format.md に従い結果をまとめる
5. SendMessage で review-lead に結果を送信する

## 厳守事項
- ファイル編集は禁止（Read, Glob, Grep のみ使用可能）
- PR差分に含まれる変更のみをレビュー対象とする
- 指摘には必ず根拠を示す
- レビュー完了後、TaskUpdateでタスクをcompletedにする
```

#### エージェントと対応チェックリスト

| agent_name | role_name | checklist_file | subagent_type |
|------------|-----------|----------------|---------------|
| architect | Senior Architect | architect-checklist.md | general-purpose |
| security | Senior Security Engineer | security-checklist.md | general-purpose |
| qa-leader | QA Leader | qa-checklist.md | general-purpose |
| perf-specialist | Performance Specialist | perf-checklist.md | general-purpose |
| game-design | Game Design Reviewer | game-design-checklist.md | general-purpose |

### Phase 2: 並列レビュー（自動実行）

5レビュアーが同時にレビューを実行。Team Leadは全レビュアーの報告を受信するまで待機する。

### Phase 3: 議論・統合（Team Leadが実行）

全レビュアーの報告を受信後:

1. **重複指摘の統合**: 同じ問題を複数レビュアーが指摘した場合、最も適切な観点の指摘を主として採用
2. **クロスカッティング分析**: 複数観点から同じ根本原因を指摘したケースを特定（`--quick`時はスキップ）
3. **重要度の最終判定**: レビュアーの判定を尊重しつつ全体整合性を確保
4. **最終レポート作成**: [references/pr-comment-template.md](references/pr-comment-template.md) のテンプレートに従い統合

### Phase 4: 投稿・クリーンアップ（Team Leadが実行）

1. `gh pr comment {PR_NUMBER}` でPRにコメント投稿
2. `docs/reviews/{YYYYMMDD}-pr-{PR_NUMBER}-review.md` にローカル保存
3. 全レビュアーに `shutdown_request` を送信
4. `TeamDelete` でチーム解散

## 出力

### PRコメント
[references/pr-comment-template.md](references/pr-comment-template.md) 参照。

### ローカルファイル
`docs/reviews/{YYYYMMDD}-pr-{PR_NUMBER}-review.md` に統合レポートを保存。

## クイックモード（--quick）

引数に `--quick` が含まれる場合:
- Phase 3のクロスカッティング分析をスキップ
- Good Points を最大1つに制限
- Recommended Fix Order を省略
- 小規模PR（変更ファイル5個以下）に推奨
