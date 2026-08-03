# TASK-0012 データモデル（RecipeDefinition / CraftResult）Redフェーズ記録

**機能名**: 調合データモデル（RecipeDefinition / CraftResult）
**タスクID**: TASK-0012
**要件名**: atelier-alchemy-core
**フェーズ**: Red（失敗するテスト作成）
**作成日**: 2026-07-22

---

## 作成したテストファイル

| テストファイル | 対象クラス | 実装ファイル（未実装） |
|---|---|---|
| `atelier-godot/tests/unit/features/alchemy/recipe_definition_test.gd` | `RecipeDefinition`（`Resource`） | `atelier-godot/features/alchemy/data/recipe_definition.gd` |
| `atelier-godot/tests/unit/features/alchemy/craft_result_test.gd` | `CraftResult`（`RefCounted`） | `atelier-godot/features/alchemy/data/craft_result.gd` |

## 実装したテストケース一覧（テストケース定義書10件すべて）

### recipe_definition_test.gd（4件）

| 関数名 | 対応ID | 信頼性 |
|---|---|---|
| `test_slot_countのデフォルト値がREQ_101に従い4である` | N-1 | 🔵 |
| `test_base_contributionとbase_rewardが設定値をそのまま取得できる` | N-2 | 🟡 |
| `test_idとdisplay_nameが設定値を保持する` | N-3 | 🔵 |
| `test_base_contributionとbase_rewardのデフォルトが0_0である` | B-3 | 🔵 |

### craft_result_test.gd（6件）

| 関数名 | 対応ID | 信頼性 |
|---|---|---|
| `test_全フィールドを保持しactivated_traitsを複数2件保持できる` | N-4 | 🔵 |
| `test_base_qualityとfinal_qualityが独立した値として保持される` | N-5 | 🔵 |
| `test_activated_traitsに想定超過3件を設定しても例外を投げず保持する` | E-1 | 🟡 |
| `test_activated_traitsのデフォルトが空配列である` | B-1 | 🔵 |
| `test_contributionとrewardのデフォルトが0_0である` | B-2 | 🔵 |
| `test_activated_traitsに1件同時発現の下限を保持できる` | B-4 | 🟡 |

**合計10ケース**（テストケース定義書の全件を実装）。

---

## テスト実行コマンド

```bash
cd atelier-godot
"C:\Users\syagu\AppData\Local\Microsoft\WinGet\Packages\GodotEngine.GodotEngine_Microsoft.Winget.Source_8wekyb3d8bbwe\Godot_v4.7-stable_win64_console.exe" --headless -s addons/gut/gut_cmdln.gd -gdir=res://tests/unit/features/alchemy -gexit
```

## 失敗の確認結果

実行対象クラス（`RecipeDefinition`, `CraftResult`）が未実装のため、以下の `Preload file ... does not exist` パースエラーが発生し、期待どおり失敗した。

```
SCRIPT ERROR: Parse Error: Preload file "res://features/alchemy/data/recipe_definition.gd" does not exist.
   at: GDScript::reload (res://tests/unit/features/alchemy/recipe_definition_test.gd:9)
ERROR: Failed to load script "res://tests/unit/features/alchemy/recipe_definition_test.gd" with error "Parse error".
[WARNING]:  Ignoring script res://tests/unit/features/alchemy/recipe_definition_test.gd because it does not extend GutTest

SCRIPT ERROR: Parse Error: Preload file "res://features/alchemy/data/craft_result.gd" does not exist.
   at: GDScript::reload (res://tests/unit/features/alchemy/craft_result_test.gd:11)
ERROR: Failed to load script "res://tests/unit/features/alchemy/craft_result_test.gd" with error "Parse error".
[WARNING]:  Ignoring script res://tests/unit/features/alchemy/craft_result_test.gd because it does not extend GutTest
```

両テストスクリプトがロード不能となり、GUTのスクリプト収集対象から除外された（＝実装クラス未存在による確実な失敗）。既存のTASK-0011テスト（`material_instance_test.gd` 7件, `trait_definition_test.gd` 3件）は影響を受けず引き続き10/10 passing。

**期待される失敗内容**: `RecipeDefinition`, `CraftResult` の実装ファイルが存在しないため `preload()` が解決できず、テストスクリプト自体のパースが失敗する。これはGreenフェーズで両クラスを実装すれば解消される想定内の失敗である。

---

## Greenフェーズで実装すべき内容

### `atelier-godot/features/alchemy/data/recipe_definition.gd`
- `class_name RecipeDefinition`, `extends Resource`
- `@export var id: StringName`
- `@export var display_name: String`
- `@export var slot_count: int = 4`
- `@export var base_contribution: float = 0.0`
- `@export var base_reward: float = 0.0`

### `atelier-godot/features/alchemy/data/craft_result.gd`
- `class_name CraftResult`, `extends RefCounted`
- `var base_quality: MaterialInstance.Quality`
- `var final_quality: MaterialInstance.Quality`
- `var activated_traits: Array[TraitDefinition] = []`
- `var rejected_category: TraitDefinition.Category`（型定義のみ。無効値表現はTASK-0015で確定）
- `var contribution: float = 0.0`
- `var reward: float = 0.0`

data-model.md記載の型定義をそのまま実装すればテストは通る見込み。
