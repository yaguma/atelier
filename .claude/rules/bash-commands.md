# Bashコマンドルール

## 基本原則

- 作業ディレクトリはBash呼び出し間で永続化される
- 冗長な`cd`を避け、絶対パスを活用する
- 独立したコマンドは並列実行し、依存するコマンドはチェーンする

---

## `cd` の使用ルール

### 原則: 毎回 `cd` しない

Bashツールの作業ディレクトリは呼び出し間で永続化されるため、毎回 `cd` する必要はない。

```bash
# NG: 毎回cdを繰り返す
cd /path/to/project && pnpm test
cd /path/to/project && pnpm lint
cd /path/to/project && pnpm build

# OK: 絶対パスを活用
pnpm test --prefix /path/to/project
pnpm --dir /path/to/project test

# OK: 最初の1回だけcd（以降は不要）
cd /path/to/project
# 次のBash呼び出しではcdなしで実行可能
pnpm test
```

---

## コマンドの分割・結合ルール

### 独立したコマンド → 並列実行

結果が次のコマンドに影響しない場合、**複数のBashツール呼び出しに分割**して並列実行する。

```bash
# NG: 独立したコマンドを1つにチェーン
gh issue create --title "Issue 1" --body "..." && gh issue create --title "Issue 2" --body "..." && gh issue create --title "Issue 3" --body "..."

# OK: 3つの並列Bash呼び出しに分割
# 呼び出し1: gh issue create --title "Issue 1" --body "..."
# 呼び出し2: gh issue create --title "Issue 2" --body "..."
# 呼び出し3: gh issue create --title "Issue 3" --body "..."
```

### 依存関係のあるコマンド → `&&` でチェーン

前のコマンドの成功が次のコマンドの前提条件となる場合、**1つのBash呼び出し内で `&&` チェーン**する。

```bash
# OK: 依存関係がある（addが成功してからcommit）
git add specific-file.ts && git commit -m "feat: 機能を追加"

# OK: ディレクトリ作成後にファイル操作
mkdir -p /path/to/dir && cp source.txt /path/to/dir/
```

### チェーンの長さ制限

1つのBash呼び出しに大量のコマンドをチェーンしない。失敗時の影響範囲が広がるため。

```bash
# NG: 長すぎるチェーン
cmd1 && cmd2 && cmd3 && cmd4 && cmd5 && cmd6 && cmd7 && cmd8 && cmd9 && cmd10

# OK: 論理的なまとまりで分割
# 呼び出し1: cmd1 && cmd2 && cmd3（ビルド関連）
# 呼び出し2: cmd4 && cmd5（テスト関連）
# 呼び出し3: cmd6 && cmd7（デプロイ関連）
```

---

## 禁止パターン

### 並列呼び出し全てに同じ `cd` を付ける

```bash
# NG: 全並列呼び出しで同じcdを繰り返す
# 呼び出し1: cd /path/to/project && pnpm test
# 呼び出し2: cd /path/to/project && pnpm lint
# 呼び出し3: cd /path/to/project && pnpm build

# OK: cdなしで直接実行（作業ディレクトリが既に正しい場合）
# 呼び出し1: pnpm test
# 呼び出し2: pnpm lint
# 呼び出し3: pnpm build
```

### 独立コマンドの過剰チェーン

```bash
# NG: 独立した10個以上のgh issue createを&&でチェーン
gh issue create ... && gh issue create ... && gh issue create ... && ...

# OK: 各issueを個別の並列Bash呼び出しで実行
```

---

## 推奨パターン

| シナリオ | 方法 |
|---------|------|
| 複数の独立したテスト実行 | 並列Bash呼び出し |
| git add → commit → push | `&&` チェーン（1つの呼び出し） |
| 複数のIssue作成 | 並列Bash呼び出し |
| ビルド → テスト | `&&` チェーン（依存関係あり） |
| 複数ファイルの情報取得 | 並列Bash呼び出し |

---

## pnpm ワークスペース実行ルール

本プロジェクトはルートに `pnpm-workspace.yaml` を持つモノレポ構成。ルートからコマンドを実行する。

### 原則: ルートから `pnpm` を実行

ルートの `package.json` にショートカットスクリプトが定義されているため、`--filter` なしで実行できる。

```bash
# OK: ルートから直接実行（推奨）
pnpm test
pnpm build
pnpm lint
pnpm typecheck

# OK: 引数を渡す場合
pnpm test -- --run
pnpm test -- tests/unit/features/quest/

# NG: --filter を毎回指定（冗長）
pnpm --filter atelier-guild-rank test

# NG: サブディレクトリに cd してから実行
cd atelier-guild-rank && pnpm test
```

### ルートで利用可能なスクリプト一覧

| コマンド | 内容 |
|---------|------|
| `pnpm dev` | 開発サーバー起動 |
| `pnpm build` | プロダクションビルド |
| `pnpm test` | ユニット/統合テスト（Vitest） |
| `pnpm test:watch` | テストウォッチモード |
| `pnpm test:coverage` | カバレッジ付きテスト |
| `pnpm test:e2e` | E2Eテスト（Playwright） |
| `pnpm test:e2e:headed` | E2E（ブラウザ表示） |
| `pnpm typecheck` | TypeScript型チェック（tsc --noEmit） |
| `pnpm lint` | Biome チェック |
| `pnpm lint:fix` | Biome 自動修正 |
| `pnpm format` | コードフォーマット |

### サブディレクトリでの直接実行が許される場合

- `lefthook` のフック内（`root: atelier-guild-rank/` で設定済み）
- デバッグ目的で一時的にサブディレクトリで実行する場合

---

## 長時間実行プロセス

### `run_in_background` の活用

devサーバーなど終了しないプロセスは `run_in_background: true` で起動する。

```bash
# OK: バックグラウンドで起動
pnpm dev  # run_in_background: true を設定

# NG: フォアグラウンドで起動（タイムアウトする）
pnpm dev
```

### タイムアウト設定

長いテストやビルドにはタイムアウトを明示する。

| コマンド | 推奨タイムアウト |
|---------|---------------|
| `pnpm test -- --run` | 120000ms（2分） |
| `pnpm build` | 120000ms（2分） |
| `pnpm test:e2e` | 300000ms（5分） |
| `pnpm test:coverage` | 180000ms（3分） |

---

## Windows/MSYS 環境の注意

本プロジェクトは MSYS2 (Git Bash) 上で動作する。Unix シェル構文を使用するが、一部注意が必要。

### パス区切り

```bash
# OK: フォワードスラッシュ
ls /c/Users/syagu/Desktop/work/UnityProjects/atelier.worktrees/wt1

# NG: バックスラッシュ
ls C:\Users\syagu\Desktop\work
```

### リダイレクト

```bash
# OK: Unix形式
command > /dev/null 2>&1

# NG: Windows形式
command > NUL 2>&1
```

### パスにスペースが含まれる場合

```bash
# OK: ダブルクォートで囲む
cd "/c/Users/syagu/My Documents"

# NG: クォートなし
cd /c/Users/syagu/My Documents
```

---

## テスト出力の管理

### 絞り込み実行

テストは対象を絞って実行し、出力を読みやすく保つ。

```bash
# 特定ファイル
pnpm --filter atelier-guild-rank test -- --run tests/unit/features/quest/

# パターンマッチ
pnpm --filter atelier-guild-rank test -- --run -t "calculateQuality"

# 全テスト実行（CIまたは最終確認）
pnpm --filter atelier-guild-rank test -- --run
```

### `--run` フラグ

Vitest はデフォルトでウォッチモードで起動する。CI やワンショット実行では `--run` を付ける。

```bash
# OK: ワンショット実行
pnpm --filter atelier-guild-rank test -- --run

# NG: ウォッチモードのまま起動（終了しない）
pnpm test
```

### 出力が長い場合

`tail` でBash出力の末尾を取得し、結果サマリーのみ確認する。

```bash
# 末尾30行のみ表示
pnpm --filter atelier-guild-rank test -- --run 2>&1 | tail -30
```

---

## エラー発生時の対応

### リトライ前に原因を確認

コマンドが失敗した場合、同じコマンドを繰り返さず原因を調査する。

```bash
# NG: 同じコマンドを何度もリトライ
pnpm build  # 失敗
pnpm build  # また失敗
pnpm build  # さらに失敗

# OK: エラーメッセージを確認し対処
pnpm build 2>&1 | tail -50  # エラー詳細を確認
# → 原因に応じた修正を行う
```

### pre-commit フック失敗時の手順

pre-commit フックが失敗した場合、コミットは作成されていない。

```bash
# 1. エラー内容を確認（lint エラー、型エラー等）
# 2. コードを修正
# 3. 修正をステージング
git add <修正ファイル>
# 4. 新しいコミットを作成（--amend は使わない）
git commit -m "fix: エラーを修正"
```

### よくあるエラーと対処

| エラー | 原因 | 対処 |
|--------|------|------|
| `ELIFECYCLE` | スクリプト実行失敗 | 詳細ログを確認 |
| `ERR_MODULE_NOT_FOUND` | インポートパスの誤り | エイリアス設定を確認 |
| `TypeScript errors` | 型エラー | `pnpm --filter atelier-guild-rank tsc --noEmit` で詳細確認 |
| `LOCK_FILE_OUTDATED` | lockファイルの不整合 | `pnpm install` で再生成 |
