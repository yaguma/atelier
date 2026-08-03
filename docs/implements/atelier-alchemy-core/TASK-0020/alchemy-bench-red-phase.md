# TASK-0020 AlchemyBench UI Redフェーズ記録

**機能名**: AlchemyBench UI（調合台画面）
**タスクID**: TASK-0020
**要件名**: atelier-alchemy-core
**フェーズ**: Red（失敗するテスト作成）
**作成日**: 2026-08-03

---

## 1. 作成したテストケース一覧（9件）

| TC # | 分類 | テスト関数名 | 対象メソッド |
|------|------|--------------|--------------|
| TC-2 | 正常系 | `test_投入枠に素材1個以上配置でcraft_buttonが活性化される` | `_update_craft_button_state()` |
| TC-3a | 正常系 | `test_recipe_slot_countが4のとき投入枠が4個生成される` | `_build_slots()` |
| TC-5 | 正常系 | `test_craft実行時に投入素材が改変されずGameStateへ渡る` | `_on_craft_pressed()` |
| TC-6 | 正常系 | `test_item_crafted受信で結果がCraftResultの値そのまま反映される` | `_on_item_crafted()` |
| TC-1 | 異常系 | `test_投入枠が空のときcraft_buttonが非活性化される` | `_update_craft_button_state()` |
| TC-4 | 異常系 | `test_同一素材を別枠へ重複配置してもplaced_materialsに重複が生じない` | `place_material()` |
| TC-3b | 境界値 | `test_recipe_slot_countが5のとき投入枠が5個生成される` | `_build_slots()` |
| TC-4b | 境界値 | `test_重複配置操作後も同一idの出現回数が高々1件である` | `place_material()` |
| TC-1b/2b | 境界値 | `test_配置数が0から1に増える境界でdisabledがtrueからfalseへ切り替わる` | `_update_craft_button_state()` |

信頼性分布: 🔵2（TC-3a, TC-3b）、🟡7（他全件）、🔴0

## 2. 実装した関連ファイル（テスト実行を成立させるための最小限の追加）

- `atelier-godot/tests/unit/features/alchemy/alchemy_bench_test.gd`（新規、9ケース）
- `atelier-godot/features/alchemy/ui/alchemy_bench.gd`（新規スタブ。全メソッド`pass`のみ）
- `atelier-godot/features/alchemy/ui/material_slot.gd`（新規スタブ。全メソッド`pass`のみ）
- `atelier-godot/autoload/game_state.gd`（追記。`recipe_slot_count: int = 4`フィールドと
  `get_inventory() -> Array[MaterialInstance]`アクセサを追加。要件定義書「0. 前提確認結果」で
  本タスクでの追加が必須と明記されていたため、計算ロジックを持たない薄い追加としてRedフェーズで実施）

## 3. 設計判断（テスト容易性のためUIノード依存を回避）

タスク指示に基づき、以下の設計判断を行った。

- `_update_craft_button_state()` は `craft_button.disabled` を直接操作せず、**disabled状態(bool)を戻り値として返す**設計とした。これによりテストは実際のButtonノードを用意せずロジックのみを検証できる。
- `place_material(slot_index, material)` は testcases.md に明記のない補助メソッドとして新規追加した（TC-4/TC-4bの重複配置防止ロジックをテストするために必要）。
- TC-5（Warning#2境界）は GUT の `partial_double` ではなく、`GameStateScript` を継承し `craft()` をオーバーライドする `SpyGameState` テスト専用サブクラスで検証した（testcases.md TC-5「検証手段の補足」(B)方式）。

## 4. 実行結果（失敗確認）

```
"C:\Users\syagu\AppData\Local\Microsoft\WinGet\Packages\GodotEngine.GodotEngine_Microsoft.Winget.Source_8wekyb3d8bbwe\Godot_v4.7-stable_win64_console.exe" --headless -s addons/gut/gut_cmdln.gd -gdir=res://tests/unit -gexit
```

- Scripts: 13、Tests: 106、Passing: 97、Failing: 9
- 新規9件はすべて期待通り失敗（`Cannot convert <null> to boolean` / `[0] expected to equal [4]` 等、スタブが`pass`のみのため）
- 既存97件（TASK-0011〜0019分）はすべて引き続きPASS（回帰なし）

## 5. Greenフェーズで実装すべき内容

- `AlchemyBench._ready()`: `_game_state`が非nullなら`_build_slots(_game_state.recipe_slot_count)`実行、`_game_state.item_crafted.connect(_on_item_crafted)`接続、初期ボタン状態更新
- `AlchemyBench._build_slots(count)`: count個の枠情報を`slots`に構築（ハードコード禁止）
- `AlchemyBench._update_craft_button_state()`: `_placed_materials.is_empty()`を基にdisabled状態(bool)を返す
- `AlchemyBench.place_material(slot_index, material)`: 重複配置防止（同一id/同一参照は拒否 or 移動）を伴う配置ロジック
- `AlchemyBench._on_craft_pressed()`: `_game_state.craft(_placed_materials)`を無加工でちょうど1回呼び出す（Warning#2境界）
- `AlchemyBench._on_item_crafted(result)`: `result`をそのまま`last_result`へ保持（再計算・補正禁止）
- `MaterialSlot.is_empty()/place()/clear()`: 素朴な状態管理の実装
