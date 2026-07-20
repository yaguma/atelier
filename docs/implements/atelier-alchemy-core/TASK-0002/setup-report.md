# TASK-0002 設定作業実行

## 作業概要

- **タスクID**: TASK-0002
- **作業内容**: Feature-Based Architectureに基づくディレクトリ構造を `atelier-godot/` 配下に構築
- **実行日時**: 2026-07-14
- **実行者**: Claude Code（direct-setup スキル）

## 設計文書参照

- **参照文書**:
  - `docs/tasks/atelier-alchemy-core/TASK-0002.md`
  - `docs/design/atelier-alchemy-core/architecture.md`（「ディレクトリ構造（案）」セクション、L57-117）
- **関連要件**: NFR-301, NFR-302

## 前提確認

- `docs/rule`, `docs/rule/direct`, `docs/rule/direct/setup` ディレクトリは存在しないため追加ルールなし
- `docs/tech-stack.md` は存在しないため `CLAUDE.md` の技術スタック定義（Godot 4.x + GDScript、Feature-Based Architecture）を参照
- TASK-0001完了済み: `atelier-godot/project.godot`, `atelier-godot/.gitignore` が存在することを確認済み

## 実行した作業

### 1. ディレクトリツリーの作成

architecture.md「ディレクトリ構造（案）」記載のパスをそのまま作成した。

```bash
cd atelier-godot

mkdir -p autoload
mkdir -p features/garden/logic features/garden/ui features/garden/data
mkdir -p features/alchemy/logic features/alchemy/ui features/alchemy/data
mkdir -p features/guild/logic features/guild/ui features/guild/data
mkdir -p features/workshop/logic features/workshop/ui features/workshop/data
mkdir -p features/prototype/ui
mkdir -p shared/constants shared/theme
mkdir -p scenes
mkdir -p tests/unit/features/garden tests/unit/features/alchemy tests/unit/features/guild tests/unit/features/workshop
```

**作成内容**:

- `autoload/`: Autoloadシングルトン配置先（TASK-0004で `rng_service.gd` 等を配置予定）
- `features/{garden,alchemy,guild,workshop}/{logic,ui,data}/`: 各Featureの純粋関数（Functional Core）・シーン（Imperative Shell）・マスターデータ（Resource）配置先
- `features/prototype/ui/`: 1画面プロトタイプ（REQ-501〜503）専用。architecture.mdの記載通り `logic/` `data/` は作成しない
- `shared/{constants,theme}/`: GAME_CONFIG相当・THEME相当の定数配置先（TASK-0005, 0006で実ファイルを配置予定）
- `scenes/`: `main.tscn`（工房メイン画面）配置先
- `tests/unit/features/{garden,alchemy,guild,workshop}/`: GUTによるFunctional Coreユニットテスト配置先（`prototype` はロジックを持たないため対象外）

### 2. 空ディレクトリのGit管理対応（`.gitkeep`配置）

Gitは空ディレクトリを追跡できないため、後続タスクで即座にファイルが配置されない末端ディレクトリに `.gitkeep` を配置した。

```bash
for d in \
  features/garden/logic features/garden/ui features/garden/data \
  features/alchemy/logic features/alchemy/ui features/alchemy/data \
  features/guild/logic features/guild/ui features/guild/data \
  features/workshop/logic features/workshop/ui features/workshop/data \
  features/prototype/ui \
  scenes \
  tests/unit/features/garden tests/unit/features/alchemy tests/unit/features/guild tests/unit/features/workshop \
; do
  touch "$d/.gitkeep"
done
```

**`.gitkeep` 配置数**: 17ファイル

**`.gitkeep` を省略したディレクトリ**（タスク指示通り、後続タスクで即座にファイルが置かれるため）:

- `autoload/`（TASK-0004で `rng_service.gd` 等を配置）
- `shared/constants/`（TASK-0005で `game_balance.gd` を配置）
- `shared/theme/`（TASK-0006で `theme.gd` を配置）

## 作業結果

- [x] architecture.md記載のディレクトリツリーと一致する構造を `atelier-godot/` 配下に作成
- [x] 空ディレクトリのGit管理対応（`.gitkeep`配置、17ファイル）
- [x] `features/` 配下の各Feature（garden/alchemy/guild/workshop）が同一のサブ構造（logic/ui/data）を持つことを確認
- [x] `features/prototype/` は `ui/` のみの簡略構造であることを確認
- [x] `git status` で `atelier-godot/` 配下のディレクトリ追加が検出されることを確認
- [ ] Godotエディタでの目視確認（direct-verifyで実施予定）

## 遭遇した問題と解決方法

問題は発生しなかった。architecture.mdの記載が明確であったため、ディレクトリツリーをそのまま適用した。

## 作成したディレクトリツリー（最終形）

```
atelier-godot/
├── autoload/
├── features/
│   ├── garden/{logic,ui,data}/
│   ├── alchemy/{logic,ui,data}/
│   ├── guild/{logic,ui,data}/
│   ├── workshop/{logic,ui,data}/
│   └── prototype/ui/
├── shared/
│   ├── constants/
│   └── theme/
├── scenes/
└── tests/
    └── unit/
        └── features/
            ├── garden/
            ├── alchemy/
            ├── guild/
            └── workshop/
```

## 次のステップ

- `/tsumiki:direct-verify` を実行して、Godotエディタでの認識確認・完了条件の最終検証を行う
- 後続タスク（TASK-0003〜0006）はこのディレクトリ構造を配置先として実装を進める
