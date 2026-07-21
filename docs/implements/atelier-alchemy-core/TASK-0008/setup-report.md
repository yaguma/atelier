# TASK-0008 設定作業実行

## 作業概要

- **タスクID**: TASK-0008
- **作業内容**: 1画面プロトタイプ（TASK-0009）用のダミー素材マスターデータ作成
- **実行日時**: 2026-07-21
- **実行者**: Claude Code（task0008-setupエージェント）

## 設計文書参照

- **参照文書**:
  - `docs/tasks/atelier-alchemy-core/TASK-0008.md`
  - `docs/design/atelier-alchemy-core/data-model.md`（MaterialInstance.Quality, TraitDefinition.Categoryの定義を踏襲）
  - `atelier-godot/shared/constants/game_balance.gd`（既存定数管理パターンの確認、本タスクでは独立データのため直接参照はしない）
- **関連要件**: REQ-502, REQ-503, REQ-104, REQ-106, REQ-107, REQ-115

## 事前調査結果

- `docs/rule/` ディレクトリは存在しないため追加ルールなし
- `atelier-godot/features/alchemy/data/` は `.gitkeep` のみで、TASK-0005で想定されている `material_definition.gd` / `trait_definition.gd` （正式なMaterialDefinition/TraitDefinition Resource）は本タスク時点で未実装と確認
- → タスク指示「TASK-0005が未着手の場合はプロトタイプ専用の簡易データ構造で代替してよい」に従い、GDScriptの `const` 配列で実装する方針を採用

## 実行した作業

### 1. ディレクトリ作成

```bash
mkdir -p atelier-godot/features/prototype/data
```

### 2. ダミー素材マスターデータファイルの作成

**作成ファイル**: `atelier-godot/features/prototype/data/prototype_material_definitions.gd`

`data-model.md` の `MaterialInstance.Quality`（D=1〜S=5）、`TraitDefinition.Category`（CONTRIBUTION / REWARD）を踏襲した簡易 `const` データとして、8種の素材を定義した。

| id | 品質 | 特性タグ | 系統 |
|---|---|---|---|
| pure_crystal | S | なし | - |
| plain_water | C | なし | - |
| holy_herb | D | contribution_holy | 貢献度系 |
| holy_herb_two | C | contribution_holy | 貢献度系（同一特性2個目） |
| moon_dew | S | contribution_purify | 貢献度系 |
| golden_ore | D | reward_gold | 報酬系 |
| golden_dust | B | reward_gold | 報酬系（同一特性2個目） |
| rare_gem | A | reward_rare | 報酬系 |

`TRAIT_CATEGORIES` 辞書で特性タグIDから系統（CONTRIBUTION/REWARD）を引けるようにし、`find_by_id()` で個別素材を取得できるstaticメソッドを追加した。

## 作業結果（完了条件チェック）

- [x] 品質D〜Sの5段階を横断する素材データが用意されている（D: holy_herb, golden_ore / C: plain_water, holy_herb_two / B: golden_dust / A: rare_gem / S: pure_crystal, moon_dew）
- [x] 特性タグ（貢献度系・報酬系それぞれ最低1種類ずつ）を持つ素材が含まれている（貢献度系: contribution_holy, contribution_purify / 報酬系: reward_gold, reward_rare）
- [x] 特性タグを持たない素材（品質のみで比較できる素材）が最低1種類含まれている（pure_crystal, plain_waterの2種）
- [x] 同一特性タグを2個以上投入できる組み合わせが作れる（contribution_holy: holy_herb + holy_herb_two、reward_gold: golden_ore + golden_dustの各2種）
- [x] GDScriptのコード内定数として `features/prototype/data/` 配下に配置されている

### 「選ぶ理由が対立する」データセットの意図

- 品質は高いが特性タグを持たない: `pure_crystal`（S・特性なし）
- 品質は低いが特性タグを持つ: `holy_herb` / `golden_ore`（いずれもD・特性あり）
- 両方を兼ね備える誘惑的な選択肢: `moon_dew`（S・貢献度系特性あり）

## 遭遇した問題と解決方法

なし。事前調査でTASK-0005の正式Resourceが未実装であることを確認し、タスク文書に明記された代替方針（簡易const構造）に沿って迷いなく実装できた。

## README.mdへの記録

`atelier-godot/` にREADME.mdが存在せず、本タスクは環境構築・依存関係・起動手順を伴わないデータ定義のみのため、README.md追記は不要と判断した。

## 次のステップ

- `/tsumiki:direct-verify` を実行して、Godotエディタでのパースエラー有無・完了条件の再確認を実施する
