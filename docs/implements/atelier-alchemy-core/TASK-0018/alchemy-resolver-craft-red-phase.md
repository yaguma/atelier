# TASK-0018 Redフェーズ記録: AlchemyResolver.craft オーケストレーター実装

**機能名**: AlchemyResolver.craft（調合オーケストレーター）
**タスクID**: TASK-0018
**要件名**: atelier-alchemy-core
**フェーズ**: Red（失敗するテスト作成）
**作成日**: 2026-08-02

---

## 1. 作成したテストケース一覧

### 単体テスト（`atelier-godot/tests/unit/features/alchemy/alchemy_resolver_test.gd`）

| No | テスト関数名 | 分類 | 信頼性 | 対応TC-ID |
|----|-------------|------|--------|-----------|
| 1 | `test_5ステップが正しい順序で合成され結果が整合する` | 正常系 | 🔵 | TC-U01 |
| 2 | `test_有効な投入構成でCraftResultの全6フィールドが埋まっている` | 正常系 | 🟡 | TC-U02 |
| 3 | `test_投入素材が空配列のとき調合が成立せずnullを返す` | 異常系 | 🟡 | TC-U03 |
| 4 | `test_素材1個の最小有効構成でnullを返さず調合が成立する` | 境界値 | 🟡 | TC-U04 |

### 統合テスト（`atelier-godot/tests/integration/features/alchemy/alchemy_resolver_integration_test.gd`）

| No | テスト関数名 | 分類 | 信頼性 | 対応TC-ID |
|----|-------------|------|--------|-----------|
| 5 | `test_聖金両タグ素材2個と高品質無特性2個でactivated_traitsが空配列になる` | 異常系（★Critical） | 🔵 | TC-I01 |
| 6 | `test_Gランクreveal_level0では貢献度報酬に特性ボーナスが一切かからない` | 境界値 | 🟡 | TC-I02 |

合計6ケース（単体4 + 統合2）。テストケース定義書（`alchemy-resolver-craft-testcases.md`）の全ケースを実装した。

---

## 2. 被テスト対象のスタブ実装

`atelier-godot/features/alchemy/logic/alchemy_resolver.gd` を新規作成し、テストが実行可能な状態（パースエラーなし）にした上で、常に `null` を返すスタブとした。

```gdscript
class_name AlchemyResolver
extends RefCounted

static func craft(
	materials: Array[MaterialInstance],
	reveal_level: int,
	daily_request,
	recipe: RecipeDefinition,
	trait_definitions: Dictionary,
) -> CraftResult:
	# 【Redフェーズスタブ】: 未実装のため常にnullを返す。Greenフェーズで5ステップ合成に置き換える 🔴
	return null
```

---

## 3. 期待される失敗内容と実際の実行結果

### 単体テスト実行結果（`res://tests/unit/features/alchemy`）

```
Totals
------
Scripts               8
Tests                75
Passing Tests        72
Failing Tests         3
Asserts           132/138
```

- **失敗（想定通り）**: TC-U01, TC-U02, TC-U04 の3件は `Expected [<null>] to be anything but NULL` および `Invalid access to property or key 'base_quality'/'activated_traits' on a base object of type 'Nil'` で失敗。スタブが常に `null` を返すため、`assert_not_null` に続くフィールドアクセスがクラッシュする。
- **成功（想定通り・偽陽性ではない）**: TC-U03（`test_投入素材が空配列のとき調合が成立せずnullを返す`）はスタブの `null` 返却が偶然EDGE-001ガードの正しい期待値と一致するため成功する。これはRedフェーズの欠陥ではなく、EDGE-001が「未実装状態でも境界動作として説明可能」なテストケースであるための自然な結果である。Greenフェーズで正式な5ステップ実装に置き換えた後も、このテストは同じ理由（明示的なガード）で成功し続ける想定。
- **既存回帰なし**: 既存71件（TASK-0011〜0017分: quality_calculator 17件・trait_activation 21件・value_calculator 13件・recipe_definition 4件・trait_definition 3件・material_instance/craft_result分含む）はすべてパス。

### 統合テスト実行結果（`res://tests/integration/features/alchemy`）

```
Totals
------
Scripts               1
Tests                 2
Passing Tests      none
Failing Tests         2
Asserts             0/4
```

- TC-I01, TC-I02 とも `Expected [<null>] to be anything but NULL` で失敗。想定通り。

### 全単体テストスイート実行結果（`res://tests/unit`、回帰確認）

```
Totals
------
Scripts              11
Tests                91
Passing Tests        88
Failing Tests         3
Asserts           1172/1178
```

alchemy以外の機能（garden/guild/prototype/workshop）を含めても新規3件以外の失敗はなし。

---

## 4. Greenフェーズで実装すべき内容

`atelier-godot/features/alchemy/logic/alchemy_resolver.gd` の `craft()` に、テストケース定義書「★実装シグネチャと合成仕様」に従い5ステップ合成を実装する。

1. `materials.is_empty()` の場合は即座に `null` を返す（EDGE-001ガード、最優先）
2. `QualityCalculator.calculate_base_quality(materials)` → `base_quality_float`
3. `TraitActivation.resolve_activated_traits(materials, reveal_level, trait_definitions)` → 候補特性
4. `TraitActivation.resolve_category_conflict(materials, candidate_traits)` → `{"activated_traits", "rejected_category", "has_rejected_category"}`
5. `QualityCalculator.apply_trait_penalty(base_quality_float, final_traits)` → `final_quality`（enum）
6. `base_quality_float` を `round()` でenumへ変換して `CraftResult.base_quality` に格納（quality_calculator.gdの丸め方式と整合させる）
7. `ValueCalculator.calculate_contribution(recipe, final_quality, final_traits, daily_request)` / `calculate_reward(...)` → `contribution` / `reward`
8. `CraftResult` の全6フィールド（`base_quality`, `final_quality`, `activated_traits`, `rejected_category`, `contribution`, `reward`）を設定して返す（`rejected_category` は `has_rejected_category` に関わらずenum値を設定してよいが、呼び出し側は必ず `has_rejected_category` を先に確認する契約）

### 参考: GUT実行コマンド

```bash
# 単体
"C:\Users\syagu\AppData\Local\Microsoft\WinGet\Packages\GodotEngine.GodotEngine_Microsoft.Winget.Source_8wekyb3d8bbwe\Godot_v4.7-stable_win64_console.exe" --headless -s addons/gut/gut_cmdln.gd -gdir=res://tests/unit/features/alchemy -gexit

# 統合
"C:\Users\syagu\AppData\Local\Microsoft\WinGet\Packages\GodotEngine.GodotEngine_Microsoft.Winget.Source_8wekyb3d8bbwe\Godot_v4.7-stable_win64_console.exe" --headless -s addons/gut/gut_cmdln.gd -gdir=res://tests/integration/features/alchemy -gexit
```

---

## 5. その他の変更

- `atelier-godot/.gutconfig.json` の `dirs` に `res://tests/integration/` を追加した（従来は `res://tests/unit/` のみで、統合テストディレクトリが全体テスト実行の対象外だったため）。
