# TASK-0017: ValueCalculator（貢献度/報酬算出）Greenフェーズ記録

**作成日**: 2026-08-02
**フェーズ**: Green（最小実装でテストを通す）
**テストファイル**: `tests/unit/features/alchemy/value_calculator_test.gd`
**対象実装**: `features/alchemy/logic/value_calculator.gd`

---

## 1. 実装方針

Redフェーズで確定した4係数乗算式（REQ-109, REQ-110）をそのまま実装した。

```
貢献度 = recipe.base_contribution × 品質倍率 × 貢献度系特性ボーナス × 指定合致ボーナス
報酬   = recipe.base_reward       × 品質倍率 × 報酬系特性ボーナス   × 指定合致ボーナス

品質倍率     = float(final_quality) / float(MaterialInstance.Quality.C)
特性ボーナス = 該当カテゴリ(CONTRIBUTION or REWARD)のtrait.bonus_multiplierを全乗算（該当0件は1.0）
合致ボーナス = daily_request.required_recipe_id == recipe.id ? daily_request.bonus_multiplier : 1.0
```

`calculate_contribution` / `calculate_reward` の共通処理（特性ボーナスのカテゴリフィルタ、指定合致ボーナス判定）は
private static ヘルパー `_calculate_category_bonus()` / `_calculate_match_bonus()` に切り出し、DRY原則に従った。

- `_calculate_category_bonus()`: 乗算の初期値を `1.0`（中立値）とし、該当カテゴリの特性が1件もない場合はフラグ `found` で判定して `1.0` を返す。これによりEDGE-A（空配列）・EDGE-B（該当0件）・EDGE-F（SUPPORT非該当）を1つのロジックで処理する。
- `_calculate_match_bonus()`: `daily_request == null` を先にガードし、null安全性を確保。DailyRequest型が未実装のため引数型注釈はDuck typingのまま。

## 2. 実装コード

```gdscript
class_name ValueCalculator
extends RefCounted

static func calculate_contribution(
	recipe: RecipeDefinition,
	final_quality: MaterialInstance.Quality,
	activated_traits: Array[TraitDefinition],
	daily_request,
) -> float:
	var quality_multiplier := float(final_quality) / float(MaterialInstance.Quality.C)
	var trait_bonus := _calculate_category_bonus(activated_traits, TraitDefinition.Category.CONTRIBUTION)
	var match_bonus := _calculate_match_bonus(recipe, daily_request)
	return recipe.base_contribution * quality_multiplier * trait_bonus * match_bonus

static func calculate_reward(
	recipe: RecipeDefinition,
	final_quality: MaterialInstance.Quality,
	activated_traits: Array[TraitDefinition],
	daily_request,
) -> float:
	var quality_multiplier := float(final_quality) / float(MaterialInstance.Quality.C)
	var trait_bonus := _calculate_category_bonus(activated_traits, TraitDefinition.Category.REWARD)
	var match_bonus := _calculate_match_bonus(recipe, daily_request)
	return recipe.base_reward * quality_multiplier * trait_bonus * match_bonus

static func _calculate_category_bonus(activated_traits: Array[TraitDefinition], category: TraitDefinition.Category) -> float:
	var bonus := 1.0
	var found := false
	for trait_def in activated_traits:
		if trait_def.category == category:
			bonus *= trait_def.bonus_multiplier
			found = true
	return bonus if found else 1.0

static func _calculate_match_bonus(recipe: RecipeDefinition, daily_request) -> float:
	if daily_request == null:
		return 1.0
	if daily_request.required_recipe_id == recipe.id:
		return daily_request.bonus_multiplier
	return 1.0
```

（実ファイルには各関数・処理ブロックに日本語コメントと信頼性レベル（🔵🟡🔴）を付与済み。全文は `atelier-godot/features/alchemy/logic/value_calculator.gd` を参照）

## 3. テスト実行結果

実行コマンド:

```bash
cd atelier-godot
"C:\Users\syagu\AppData\Local\Microsoft\WinGet\Packages\GodotEngine.GodotEngine_Microsoft.Winget.Source_8wekyb3d8bbwe\Godot_v4.7-stable_win64_console.exe" --headless -s addons/gut/gut_cmdln.gd -gdir=res://tests/unit/features/alchemy -gexit
```

結果サマリ:

```
res://tests/unit/features/alchemy/value_calculator_test.gd
13/13 passed.

Totals
------
Scripts               7
Tests                71   (既存58 + 新規13)
Passing Tests        71   (全件成功)
Asserts             131/131
```

- `value_calculator_test.gd` の13件（正常系6・異常系/エッジ3・境界値4）が全てパス。
- 既存58件（TASK-0011〜0016分: craft_result, material_instance, quality_calculator, recipe_definition, trait_activation, trait_definition）も全てパスし、デグレなしを確認。

## 4. 品質判定

| 判定項目 | 結果 |
|---------|------|
| テスト成功状況 | ✅ 全71件成功（新規13件 + 既存58件） |
| 実装のシンプルさ | ✅ 4係数の単純乗算＋2つのヘルパー関数のみ。分岐は最小限 |
| リファクタリング箇所 | 品質倍率式の関数化（`game_balance.gd`への切り出し）は将来のバランス調整用にRefactorフェーズで検討 |
| 機能的問題 | なし |
| ファイルサイズ | 実装ファイル約90行（800行制限に対し余裕あり） |
| モック使用 | 実装コードにモック・スタブなし（純粋関数のみ） |

**総合判定**: ✅ 高品質。テスト全件成功、実装はシンプルで副作用なし、既存テストへの影響なし。

## 5. 既知の申し送り事項（変更なし、Refactor/Phase4へ継続）

1. **品質倍率式が暫定（🔴）**: `float(final_quality) / float(MaterialInstance.Quality.C)` は設計文書に根拠のない暫定式。Refactorフェーズで `game_balance.gd` 等への定数/関数切り出しを検討する。
2. **DailyRequest型未実装（🔴）**: `daily_request` 引数は型注釈なし（Duck typing）のまま。Phase 4でDailyRequest実装後に型を厳格化する。
3. **指定合致ボーナスの二重適用疑義（🔴）**: alchemy側（本実装）とguild側（`delivery_calculator.gd`予定）で合致ボーナスが重複適用される可能性。Phase 4着手前に責務の一方統一が必須（本実装はREQ-109/110どおりalchemy側で適用する前提のまま）。
