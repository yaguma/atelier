# TASK-0001 設定作業実行

## 作業概要

- **タスクID**: TASK-0001
- **作業内容**: Godotプロジェクト新規作成（`atelier-godot/` のスキャフォールディング）
- **実行日時**: 2026-07-14
- **実行者**: Claude Code（direct-setup）

## 設計文書参照

- **参照文書**:
  - `docs/tasks/atelier-alchemy-core/TASK-0001.md`
  - `docs/design/atelier-alchemy-core/architecture.md`（ディレクトリ構造案、技術的制約）
- **関連要件**: NFR-301（Godot 4.x + GDScriptへの技術スタック移行確定事項）

## 実行した作業

### 1. プロジェクトディレクトリの作成

```bash
mkdir -p atelier-godot
```

`atelier-guild-rank/`（Phaser3+TS、凍結）・`Assets/`（Unity、非アクティブ）とは完全に独立した新規ディレクトリとして、プロジェクトルート直下に作成した。依存パッケージ・参照は一切設定していない。

### 2. `project.godot` の作成（テキストベース直接作成）

Godotエディタの対話GUIが使用できない環境のため、Godot 4.7系の標準フォーマット（`config_version=5`）に準拠したINI形式で直接作成した。

**作成ファイル**: `atelier-godot/project.godot`

```ini
config_version=5

[application]

config/name="Atelier Alchemy Core"
config/description="アトリエ錬金術ゲーム v7.0（調合主軸モデル）のコアシステム。..."
config/version="0.1.0"
config/features=PackedStringArray("4.7", "Forward Plus")
```

- `config/name`: 「Atelier Alchemy Core」とし、TASK-0001完了条件「アトリエ錬金術ゲームプロジェクトとして識別可能」を満たす
- `config/features`: インストール済みGodotバージョン（4.7.stable）に合わせて `"4.7"` を採用
- `run/main_scene` は未設定（TASK-0002以降で `scenes/main.tscn` 作成後に設定する方針。タスク定義書の注意事項に準拠）

### 3. `.gitignore` の作成

**作成ファイル**: `atelier-godot/.gitignore`

```gitignore
# Godot 4+ specific ignores
.godot/
*.translation

# Export files (may contain machine-specific paths / secrets)
export.cfg
export_presets.cfg
```

`.godot/`（インポートキャッシュ）と、機密情報・環境固有パスを含みうる `export_presets.cfg` 等を除外した。

### 4. Godotによる読み込み検証

Godot実行ファイル（`Godot_v4.7-stable_win64_console.exe`）を用いて、以下2パターンで検証した。

```bash
# パターン1: 通常起動（メインシーン未設定のため、想定通りのエラーで停止することを確認）
Godot_v4.7-stable_win64_console.exe --headless --path atelier-godot --quit
# => "Error: Can't run project: no main scene defined in the project."
#    project.godot自体のパースは成功しており、メインシーン未設定に起因する想定内のエラー

# パターン2: エディタのheadless起動（project.godotの読み込み・プロジェクト初期化を検証）
Godot_v4.7-stable_win64_console.exe --headless --editor --path atelier-godot --quit
# => "first_scan_filesystem" "loading_editor_layout" が DONE となり、
#    エラーダイアログなしにプロジェクト初期化が完了することを確認
#    この過程で .godot/ インポートキャッシュが生成された
```

### 5. Git差分の確認

```bash
git add --dry-run atelier-godot/
# => add 'atelier-godot/.gitignore'
# => add 'atelier-godot/project.godot'
```

`.godot/` キャッシュディレクトリが `.gitignore` により除外され、`project.godot` と `.gitignore` のみが追跡対象候補になることを確認した。

## 作業結果

- [x] プロジェクトルート直下に `atelier-godot/` を作成
- [x] `project.godot` をGodot 4.7系フォーマットで作成
- [x] プロジェクト名「Atelier Alchemy Core」を設定
- [x] `.gitignore`（`.godot/`, `*.translation`, `export.cfg`, `export_presets.cfg` を除外）を作成
- [x] Godot headlessエディタでのプロジェクト読み込みを検証（エラーなし）
- [x] `git add --dry-run` で意図した2ファイルのみが差分対象であることを確認

## 遭遇した問題と解決方法

### 問題1: `--headless --path ... --quit` が Exit code 1 で終了する

- **発生状況**: `run/main_scene` を設定していない状態で通常起動検証を実行
- **エラーメッセージ**: `Error: Can't run project: no main scene defined in the project.`
- **解決方法**: TASK-0001の注意事項「`scenes/main.tscn` 等のシーン作成は行わない（TASK-0002以降のスコープ）」に沿った想定内のエラーであり、修正不要と判断。代わりに `--editor --headless` モードでプロジェクト初期化（ファイルスキャン・レイアウト読み込み）が正常完了することを確認し、`project.godot` 自体の妥当性を検証した。

## 次のステップ

- `/tsumiki:direct-verify` を実行して設定を確認
- TASK-0002（Feature-Basedディレクトリ構造構築）以降で `features/`, `autoload/`, `shared/`, `scenes/`, `tests/` 等のディレクトリを追加していく
