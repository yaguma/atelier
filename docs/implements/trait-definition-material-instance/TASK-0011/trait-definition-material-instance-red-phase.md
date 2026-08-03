# TASK-0011 Redフェーズ記録: データモデル実装（TraitDefinition, MaterialInstance）

**機能名**: trait-definition-material-instance
**タスクID**: TASK-0011
**フェーズ**: Red（失敗するテスト作成）
**作成日**: 2026-07-22

---

## 1. 作成したテストファイル

| ファイル | 対象テストケース | 件数 |
|---------|-----------------|------|
| `atelier-godot/tests/unit/features/alchemy/trait_definition_test.gd` | N-1, N-2, N-3 | 3 |
| `atelier-godot/tests/unit/features/alchemy/material_instance_test.gd` | N-4, N-5, E-1, B-1, B-2, B-3, B-4 | 7 |

合計 **10件**（正常系5・異常系1・境界値4）。テストケース定義書（`trait-definition-material-instance-testcases.md`）の全10件を実装対象とした。

## 2. テストケース一覧

- N-1: `test_categoryの3分類が区別できる` — CONTRIBUTION/REWARD/SUPPORTの相互区別
- N-2: `test_bonus_multiplierのデフォルト値は1_0である` — デフォルト値検証
- N-3: `test_全プロパティが指定値を保持する` — id/display_name/category/min_rank_to_revealの保持
- N-4: `test_initが明示引数で正しく初期化する` — `_init(id, quality, traits)`の反映
- N-5: `test_seed_idを設定すると保持される` — `_init`非対象プロパティの後付け代入
- E-1: `test_traits3個投入時も例外を投げず保持する` — 過剰投入時も拒否しない（ロジック層委譲）
- B-1: `test_quality_enumが最小D1から最大S5の整数評価に一致する` — Quality enum ↔ 整数1〜5
- B-2: `test_デフォルト引数省略時に既定値で初期化される` — `MaterialInstance.new()`の全省略
- B-3: `test_traits0個下限でMaterialInstanceを生成できる` — 特性0個（下限）
- B-4: `test_traits2個上限でMaterialInstanceを生成できる` — 特性2個（上限）

## 3. 実装対象（未実装）

- `atelier-godot/features/alchemy/data/trait_definition.gd`（`class_name TraitDefinition`, `extends Resource`）
- `atelier-godot/features/alchemy/data/material_instance.gd`（`class_name MaterialInstance`, `extends RefCounted`）

## 4. テスト実行コマンド

```bash
cd atelier-godot
"/c/Users/syagu/AppData/Local/Microsoft/WinGet/Packages/GodotEngine.GodotEngine_Microsoft.Winget.Source_8wekyb3d8bbwe/Godot_v4.7-stable_win64_console.exe" \
  --headless -s addons/gut/gut_cmdln.gd -gdir=res://tests/unit/features/alchemy -gexit
```

## 5. 期待される失敗（実測）

両テストファイルとも、以下のパースエラーで失敗し「Nothing was run」となることを確認した。

```
SCRIPT ERROR: Parse Error: Preload file "res://features/alchemy/data/material_instance.gd" does not exist.
   at: GDScript::reload (res://tests/unit/features/alchemy/material_instance_test.gd:9)
SCRIPT ERROR: Parse Error: Preload file "res://features/alchemy/data/trait_definition.gd" does not exist.
   at: GDScript::reload (res://tests/unit/features/alchemy/trait_definition_test.gd:9)
[WARNING]: Ignoring script ... because it does not extend GutTest
[ERROR]: Nothing was run.
```

原因: `trait_definition.gd` / `material_instance.gd` が未実装のため `preload()` がロードに失敗し、GUTがテストスクリプトをGutTestとして認識できずスキップした。これはRedフェーズとして想定通りの失敗である。

## 6. Greenフェーズで実装すべき内容

1. `features/alchemy/data/trait_definition.gd`
   - `class_name TraitDefinition extends Resource`
   - `enum Category { CONTRIBUTION, REWARD, SUPPORT }`
   - `@export var id: StringName`
   - `@export var display_name: String`
   - `@export var category: Category`
   - `@export var min_rank_to_reveal: StringName`
   - `@export var bonus_multiplier: float = 1.0`
2. `features/alchemy/data/material_instance.gd`
   - `class_name MaterialInstance extends RefCounted`
   - `enum Quality { D = 1, C = 2, B = 3, A = 4, S = 5 }`
   - `var id: String`
   - `var seed_id: StringName`
   - `var quality: Quality`
   - `var traits: Array[StringName] = []`
   - `func _init(p_id: String = "", p_quality: Quality = Quality.D, p_traits: Array[StringName] = []) -> void`
3. 実装後、`res://tests/unit/features/alchemy` を再実行し10件全てGreenになることを確認する。
