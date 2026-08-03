# TASK-0014: TraitActivation.resolve_activated_traits Redフェーズ記録

**機能名**: 特性発現判定ロジック（trait-activation）
**タスクID**: TASK-0014
**要件名**: atelier-alchemy-core
**フェーズ**: Red（失敗するテスト作成）
**作成日**: 2026-07-31

---

## 1. 作成したテストファイル

- `atelier-godot/tests/unit/features/alchemy/trait_activation_test.gd`

## 2. 作成したテストケース一覧（全11件）

| # | テスト関数名 | 対応テストケースID | 分類 | 信頼性 |
|---|---|---|---|---|
| 1 | test_同一特性タグ2個の投入で特性が発現候補に含まれる | TC-101-02 | 正常系 | 🔵 |
| 2 | test_reveal_level1で貢献度系特性が発現する | TC-121-02 | 正常系 | 🔵 |
| 3 | test_同一系統内で複数特性が同時発現候補になる | TC-101-06 | 正常系 | 🔵 |
| 4 | test_同一特性が1個のみのとき発現しない | TC-101-03 | 異常系（不発） | 🔵 |
| 5 | test_reveal_level0では閾値を満たしても発現しない | TC-121-01 | 異常系（非開示） | 🔵 |
| 6 | test_reveal_level0なら未解禁特性が混入しても発現しない | TC-121-E01 | 異常系（安全策） | 🟡 |
| 7 | test_空の素材配列で空配列を返す | TC-101-EMPTY | 異常系（退化入力） | 🔵 |
| 8 | test_全て無特性素材のとき空配列を返す | TC-101-NOTRAIT | 異常系（退化入力） | 🟡 |
| 9 | test_同一特性がちょうど2個の境界値で発現する | TC-101-B01 | 境界値（閾値） | 🔵 |
| 10 | test_reveal_levelが0から1へ切り替わると発現有無が変わる | TC-121-B02 | 境界値（開示） | 🔵 |
| 11 | test_reveal_level2はlevel1と同じ結果になる暫定実装 | TC-123-B03 | 境界値（暫定実装） | 🟡 |

テストケース追加目標数（10以上）を満たし、`trait-activation-testcases.md` の全11ケースを実装した。

## 3. テストコード全文

`atelier-godot/tests/unit/features/alchemy/trait_activation_test.gd` を参照。

### 主な構成

- `preload("res://features/alchemy/logic/trait_activation.gd")` で被テスト対象（未実装）を参照
- `preload("res://features/alchemy/data/material_instance.gd")` / `trait_definition.gd` で既存実装済みクラスを参照（TASK-0011/0012）
- `before_each()` で `trait_defs`（holy/cleanse/heal/gold の4件）を毎回再構築
- `_make_trait()` / `_make_material()` ヘルパーでテストデータを生成
- 全アサーションに日本語コメント（【確認内容】等）と信頼性レベル（🔵🟡）を付与

## 4. テスト実行結果（失敗確認）

### 実行コマンド

```bash
cd atelier-godot
"C:\Users\syagu\AppData\Local\Microsoft\WinGet\Packages\GodotEngine.GodotEngine_Microsoft.Winget.Source_8wekyb3d8bbwe\Godot_v4.7-stable_win64_console.exe" --headless -s addons/gut/gut_cmdln.gd -gdir=res://tests/unit/features/alchemy -gtest=trait_activation_test.gd -gexit
```

### 実行結果概要

```
[WARNING]:  Ignoring script res://tests/unit/features/alchemy/trait_activation_test.gd because it does not extend GutTest
[ERROR]:  Could not find script:  trait_activation_test.gd
```

- `features/alchemy/logic/trait_activation.gd` が存在しないため、テストファイル冒頭の
  `const TraitActivationScript := preload("res://features/alchemy/logic/trait_activation.gd")`
  でスクリプトのロード自体が失敗する
- その結果、GUTはこのテストスクリプトを「GutTestを継承していない」と誤認識し実行対象から除外、
  `Errors: 1` として報告する
- **これは意図した失敗**：`TraitActivation`クラスが未実装であることに起因するエラーであり、
  Redフェーズとして正しい状態
- 同時実行した既存テスト（trait_definition_test.gd, material_instance_test.gd,
  quality_calculator_test.gd, recipe_definition_test.gd, craft_result_test.gd）は
  28/28 Passing のまま影響を受けていないことを確認済み

## 5. Greenフェーズで実装すべき内容

`atelier-godot/features/alchemy/logic/trait_activation.gd` を新規作成する。

```gdscript
class_name TraitActivation
extends RefCounted

static func resolve_activated_traits(
    materials: Array[MaterialInstance],
    reveal_level: int,
    trait_definitions: Dictionary,
) -> Array[TraitDefinition]:
    # 実装方針:
    # 1. reveal_level == 0 の場合は即座に空配列を返す（最優先フィルタ、TC-121-01/E01/B02）
    # 2. materials が空、または全素材が無特性の場合は空配列を返す（TC-101-EMPTY/NOTRAIT）
    # 3. materials内のtraits（StringName）の出現回数を集計する
    # 4. 出現回数 >= 2 の特性タグのみを候補として残す（閾値判定、TC-101-02/03/B01）
    # 5. reveal_level >= 2 は暫定的に reveal_level >= 1 と同じ扱いとする（TC-123-B03、REQ-123 TBD）
    # 6. 候補タグをtrait_definitions辞書からTraitDefinitionへ解決し、Array[TraitDefinition]として返す
    #    （系統排他は行わない。同一系統内の複数特性も両方返す、TC-101-06）
    pass
```

- 純粋関数（`static func`のみ、GameState/Autoload参照禁止）であることを維持する
- 戻り値の順序はテストでは`has()`による包含チェックのみ行っているため、実装側で自由に決定してよい
