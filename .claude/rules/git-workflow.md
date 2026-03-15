# Git運用ルール

## ブランチ命名規則

- **形式**: `<type>/<TASK-ID or issue-no>-<description>`
- **タイプ一覧**:
  - `feat/` - 新機能追加
  - `fix/` - バグ修正
  - `refactor/` - リファクタリング
  - `docs/` - ドキュメント更新
  - `test/` - テスト追加・修正
  - `chore/` - 設定・ビルド関連
- **例**: `feat/#18-add-deck-import`, `fix/task-0018-login-error`

---

## コミットメッセージ規則

### 形式

```
<type>: <subject>

[optional body]

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

### タイプ一覧

| タイプ | 用途 |
|--------|------|
| `feat:` | 新機能追加 |
| `fix:` | バグ修正 |
| `docs:` | ドキュメント更新 |
| `test:` | テスト追加・修正 |
| `refactor:` | リファクタリング（機能変更なし） |
| `style:` | フォーマット変更（コード動作に影響なし） |
| `chore:` | ビルド・設定・依存関係の変更 |
| `perf:` | パフォーマンス改善 |

### サブジェクト

- 日本語で簡潔に記述（50文字以内推奨）
- 動詞で始める（「追加」「修正」「変更」等）

```
feat: デッキ編集機能を追加
fix: 依頼完了時のゴールド計算エラーを修正
refactor: StateManagerのイミュータブル更新を改善
```

---

## 禁止事項

### git rebaseの禁止

- `git rebase` は使用しない
- 履歴の書き換えによる混乱を防ぐため、常に `git merge` を使用
- コンフリクト解消時も `git merge` で対応

### -Cオプションの禁止

- `git -C` は使用しない
- gitの操作は必ずプロジェクトルートのディレクトリに移動した後行うこと。またディレクトリの移動は別々でコマンドを時実施すること。

### その他の破壊的コマンドの禁止

| コマンド | 禁止理由 |
|---------|----------|
| `git push --force` / `-f` | 履歴破壊防止 |
| `git reset --hard` | ローカル変更の消失防止（慎重に使用） |
| `git clean -f` | ファイル消失防止（慎重に使用） |
| `git checkout .` / `git restore .` | 変更消失防止（慎重に使用） |
| `git branch -D` | ブランチ強制削除（慎重に使用） |

---

## マージ戦略

- mainブランチへのマージは**プルリクエスト経由**で行う
- マージコミットを作成（`--no-ff`相当の動作）
- Squash mergeは任意（PRの規模による判断）

---

## コミット作成時の注意

- `--amend` は直前のコミットにのみ、かつプッシュ前にのみ使用可
- `--no-verify` は原則禁止（pre-commitフックをスキップしない）
- センシティブな情報（.env、credentials等）をコミットしない
- 1コミット = 1つの論理的変更（原子的コミット）

---

## プルリクエスト

### タイトル

- 短く明確に（70文字以内）
- コミットメッセージと同じタイプを使用可

### 説明

```markdown
## Summary
- 変更内容を1-3行で箇条書き

## Test plan
- [ ] テスト項目1
- [ ] テスト項目2

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

---

## ワークフロー

### 新機能開発

```bash
# 1. mainから作業ブランチを作成
git checkout main
git pull origin main
git checkout -b feat/20260203-add-feature

# 2. 開発・コミット
git add <files>
git commit -m "feat: 機能を追加"

# 3. プッシュ・PR作成
git push -u origin feat/20260203-add-feature
gh pr create --title "feat: 機能を追加" --body "..."
```

### バグ修正

```bash
# 1. 修正ブランチを作成
git checkout -b fix/20260203-bug-description

# 2. 修正・テスト・コミット
git add <files>
git commit -m "fix: バグの説明"

# 3. PR作成
git push -u origin fix/20260203-bug-description
gh pr create
```

---

## コンフリクト解消手順

mainブランチとの間でコンフリクトが発生した場合、以下の標準手順に従う。

### 標準フロー

```bash
# 1. リモートの最新情報を取得
git fetch origin

# 2. mainブランチをマージ（rebaseは禁止）
git merge origin/main

# 3. コンフリクトが表示される
# CONFLICT (content): Merge conflict in src/features/quest/services/quest-generator.ts

# 4. コンフリクトを手動で解消
#    - 各ファイルの <<<<<<< / ======= / >>>>>>> マーカーを確認
#    - 両方の変更を適切に統合
#    - マーカーを全て削除

# 5. 解消したファイルをステージング
git add <解消したファイル>

# 6. 検証チェックリスト実行
pnpm test -- --run
pnpm typecheck
pnpm lint

# 7. 全てパスしたらマージコミットを作成
git commit

# 8. プッシュ
git push
```

### コンフリクト解消のベストプラクティス

- **両方の変更を理解**してから解消する（片方を安易に捨てない）
- **小さい単位で解消**する（複数ファイルのコンフリクトは1ファイルずつ）
- **解消後は必ずテスト**を実行する（型チェック・リント含む）
- **不明な変更がある場合**は、`git log`で変更の意図を確認する

### 解消後の検証チェックリスト

- [ ] 全てのコンフリクトマーカー（`<<<<<<<`, `=======`, `>>>>>>>`）が除去されていること
- [ ] `pnpm test -- --run` がパスすること
- [ ] `pnpm typecheck` がパスすること
- [ ] `pnpm lint` がパスすること
- [ ] アプリケーションが正常に起動すること（`pnpm dev`で確認）

### 禁止事項

- `git rebase` でコンフリクトを解消する（rebase禁止ルールに従う）
- テスト実行せずにマージコミットをプッシュする
- コンフリクトマーカーを残したままコミットする
