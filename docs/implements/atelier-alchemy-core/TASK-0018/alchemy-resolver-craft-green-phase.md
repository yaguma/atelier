# TASK-0018 Greenフェーズ記録: AlchemyResolver.craft オーケストレーター実装

**機能名**: AlchemyResolver.craft（調合オーケストレーター）
**タスクID**: TASK-0018
**要件名**: atelier-alchemy-core
**フェーズ**: Green（最小実装でテストを通す）
**作成日**: 2026-08-03

---

## 1. 実装コード

`atelier-godot/features/alchemy/logic/alchemy_resolver.gd` の `craft()` を、Redフェーズのスタブ（常に`null`を返す）から、dataflow.mdの5ステップ合成へ置き換えた。

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
	# 【EDGE-001ガード】: 投入枠が空の場合は調合を成立させず、他ステップに到達する前に
	# 　最優先で短絡する。UI側のボタン非活性化に対する二重の安全策（note.md「EDGE-001ガード実装方針」） 🟡
	if materials.is_empty():
		return null

	# 【ステップ1】: calculate_base_quality(投入素材) — REQ-105
	var base_quality := QualityCalculator.calculate_base_quality(materials)

	# 【ステップ2】: resolve_activated_traits(投入素材, reveal_level) — REQ-106, REQ-112
	var candidate_traits := TraitActivation.resolve_activated_traits(materials, reveal_level, trait_definitions)

	# 【ステップ3】: resolve_category_conflict(発現特性) — REQ-115
	var conflict_result := TraitActivation.resolve_category_conflict(materials, candidate_traits)
	var final_traits: Array[TraitDefinition] = conflict_result["activated_traits"]

	# 【ステップ4】: apply_trait_penalty(基礎品質, 最終発現特性) — REQ-111
	var final_quality := QualityCalculator.apply_trait_penalty(base_quality, final_traits)

	# 【ステップ5】: calculate_contribution / calculate_reward — REQ-109, REQ-110
	var contribution := ValueCalculator.calculate_contribution(recipe, final_quality, final_traits, daily_request)
	var reward := ValueCalculator.calculate_reward(recipe, final_quality, final_traits, daily_request)

	# 【CraftResult構築】: base_qualityはfloat→enum変換をround()で行う（apply_trait_penaltyと丸め方式を統一）
	var result := CraftResult.new()
	result.base_quality = int(round(base_quality)) as MaterialInstance.Quality
	result.final_quality = final_quality
	result.activated_traits = final_traits
	if conflict_result.get("has_rejected_category", false):
		result.rejected_category = conflict_result["rejected_category"]
	result.contribution = contribution
	result.reward = reward
	return result
```

---

## 2. 実装方針と判断理由

- **5ステップの合成順序**: テストケース定義書「★実装シグネチャと合成仕様」・Redフェーズドキュメント「4. Greenフェーズで実装すべき内容」の記載どおり、`calculate_base_quality → resolve_activated_traits → resolve_category_conflict → apply_trait_penalty → calculate_contribution/calculate_reward` の順で呼び出した。
- **EDGE-001ガードの最優先配置**: `materials.is_empty()` を関数冒頭で判定し、他のステップに到達する前に `null` を返す。これによりTC-U03（空投入枠でnull）が短絡的に成立する。
- **`base_quality` のfloat→enum変換**: `QualityCalculator.calculate_base_quality()` はfloatを返すが、`CraftResult.base_quality` は `MaterialInstance.Quality`（enum）型。既存の `QualityCalculator.apply_trait_penalty()` が採用している `round()`（四捨五入）方式に統一し、`int(round(base_quality)) as MaterialInstance.Quality` で変換した。これはnote.md「6. 注意事項／float→int変換ポイント」の申し送りを、`apply_trait_penalty` と矛盾しない形で統合する実装判断である。
- **`rejected_category` の設定**: `resolve_category_conflict()` の戻り値契約（`has_rejected_category` を先に確認してから `rejected_category` を参照する）に従い、`has_rejected_category == true` の場合のみ `CraftResult.rejected_category` を明示的に上書きする。`false` の場合は `CraftResult` のデフォルト値（`Category.CONTRIBUTION`、意味を持たない仮値）のままとし、呼び出し側の契約を壊さない。
- **`final_traits` の型注釈**: `conflict_result["activated_traits"]` はDictionary経由で取得するため、`Array[TraitDefinition]` の型付き変数へ明示的に代入することで、後続の `apply_trait_penalty`/`calculate_contribution`/`calculate_reward` への型付き引数渡しを保証した。

---

## 3. テスト実行結果

### 単体テスト（`res://tests/unit/features/alchemy`）

```
Totals
------
Scripts               8
Tests                75
Passing Tests        75
Asserts             148
Time              0.571s

---- All tests passed! ----
```

新規4件（TC-U01〜U04）を含め全75件成功（既存71件を含む）。

### 統合テスト（`res://tests/integration/features/alchemy`）

```
Totals
------
Scripts               1
Tests                 2
Passing Tests         2
Asserts               8
Time              0.516s

---- All tests passed! ----
```

- `test_聖金両タグ素材2個と高品質無特性2個でactivated_traitsが空配列になる`（TC-I01・支配戦略防止/Critical）: PASS
- `test_Gランクreveal_level0では貢献度報酬に特性ボーナスが一切かからない`（TC-I02）: PASS

### 全体回帰確認（`res://tests/unit`）

```
Totals
------
Scripts              11
Tests                91
Passing Tests        91
Asserts            1188
Time              2.304s

---- All tests passed! ----
```

alchemy以外の機能（garden/guild/prototype/workshop等）を含め、新規実装によるデグレなし。

### トラブルシューティング記録（作業ログ）

Green実装直後、`godot --headless -s addons/gut/gut_cmdln.gd -gdir=... -gexit` で以下のパースエラーが発生した。

```
SCRIPT ERROR: Parse Error: Identifier "QualityCalculator" not declared in the current scope.
SCRIPT ERROR: Parse Error: Identifier "TraitActivation" not declared in the current scope.
```

原因は `.godot/global_script_class_cache.cfg` に `QualityCalculator`/`TraitActivation`/`ValueCalculator`/`AlchemyResolver` の `class_name` グローバル登録が反映されていなかったこと（Red фェーズ以降に追加された`class_name`宣言がキャッシュに未反映）。
`"C:\...\Godot_v4.7-stable_win64_console.exe" --headless --editor --quit` を1回実行してプロジェクトの全体スキャン（グローバルクラス名の再登録）を行うことでキャッシュが更新され、以後のGUT実行で解消した。実装コード自体の問題ではないため、`alchemy_resolver.gd` の修正は不要だった。

---

## 4. 品質判定結果

```
✅ 高品質
- テスト結果: 単体75/75・統合2/2・全体回帰91/91 すべてTaskツール（Bash経由でのGUT実行）で成功確認
- 実装品質: シンプル。5ステップをそのまま直線的に呼び出すのみで分岐は EDGE-001ガードと
  rejected_category設定の2箇所のみ
- リファクタ箇所: 現時点で明確な改善候補は少ない（コメント量の調整、rejected_category設定行の
  可読性向上程度）。Refactorフェーズで日本語コメントの整理・信頼性レベル注記の精査を行う
- 機能的問題: なし（TC-I01支配戦略防止・TC-I02 reveal_level境界とも正しく合成されることを確認済み）
- コンパイルエラー: なし（グローバルクラスキャッシュ更新後）
- ファイルサイズ: 約80行（800行制限に対し余裕あり）
- モック使用: 実装コードにモック・スタブは含まれていない（TASK-0013〜0017の実物実装を呼び出すのみ）
```

## 5. 課題・改善点（Refactorフェーズで対応）

- コメントの信頼性レベル注記（🔵🟡）の粒度をTASK-0013〜0017の既存ファイルと完全に揃えるか検討。
- `rejected_category` 設定部分（`if conflict_result.get(...)`）のコメントをより明確にし、`has_rejected_category` 契約の重要性を強調できるか検討。
- requirements.mdとの差異（`rejected_category`のString想定 vs 実物Category enum、`contribution`/`reward`のint想定 vs 実物float）はテストケース定義書で申し送り済みだが、要件定義書本文への反映は別タスクとして扱う。
