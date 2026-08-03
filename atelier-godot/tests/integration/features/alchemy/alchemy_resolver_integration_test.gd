extends GutTest
# TASK-0018: AlchemyResolver.craft（調合オーケストレーター）の統合テスト
# 対象: features/alchemy/logic/alchemy_resolver.gd（未実装。Redフェーズ用スタブのみ存在）
# 参照: docs/implements/atelier-alchemy-core/TASK-0018/alchemy-resolver-craft-testcases.md
#
# 【備考】: 統合テストはcraft()を経由してTASK-0013〜0017のロジックが正しく合成されることを検証する
#          回帰テスト。個別関数のロジックそのものは各単体テスト（quality_calculator_test.gd等）で
#          検証済みのため、ここでは「オーケストレーター経由でも同じ結果になること」に焦点を当てる。
#          DailyRequestは未実装のため、本ファイル内にDuck typing用のダミーstubクラス
#          （DummyDailyRequest）を定義して代替する（value_calculator_test.gdと同一方針）。

const AlchemyResolverScript := preload("res://features/alchemy/logic/alchemy_resolver.gd")
const ValueCalculatorScript := preload("res://features/alchemy/logic/value_calculator.gd")
const MaterialInstanceScript := preload("res://features/alchemy/data/material_instance.gd")
const TraitDefinitionScript := preload("res://features/alchemy/data/trait_definition.gd")
const RecipeDefinitionScript := preload("res://features/alchemy/data/recipe_definition.gd")


## 【ダミーstub】: DailyRequest未実装のため、AlchemyResolverが参照する
## 　　required_recipe_id / bonus_multiplier の2フィールドのみを持つテスト専用ダミーを定義する。
class DummyDailyRequest extends RefCounted:
	var required_recipe_id: StringName = &""
	var bonus_multiplier: float = 1.5

	func _init(p_recipe_id: StringName = &"", p_bonus: float = 1.5) -> void:
		required_recipe_id = p_recipe_id
		bonus_multiplier = p_bonus


# 【ヘルパー】: 指定品質・特性タグの素材個体を生成するファクトリ
func _make_material(quality: int, trait_ids: Array[StringName]) -> MaterialInstance:
	return MaterialInstanceScript.new("", quality, trait_ids)


# 【ヘルパー】: TraitDefinition マスターデータを1件生成するファクトリ
func _make_trait(p_id: StringName, p_cat: int, p_bonus: float = 1.0) -> TraitDefinition:
	var t := TraitDefinitionScript.new()
	t.id = p_id
	t.category = p_cat
	t.bonus_multiplier = p_bonus
	return t


# 【ヘルパー】: RecipeDefinition マスターデータを1件生成するファクトリ
func _make_recipe(p_id: StringName, p_base_contribution: float, p_base_reward: float) -> RecipeDefinition:
	var r := RecipeDefinitionScript.new()
	r.id = p_id
	r.base_contribution = p_base_contribution
	r.base_reward = p_base_reward
	return r


# ============================================================
# 異常系（支配戦略防止）
# ============================================================

func test_聖金両タグ素材2個と高品質無特性2個でactivated_traitsが空配列になる() -> void:
	# 【テスト目的】: TASK-0015の系統排他ロジック（同数不発）がcraft()のステップ2→3の連結を
	# 　通じて正しく機能することを統合検証する（★Critical: 支配戦略防止の回帰テスト）
	# 【テスト内容】: 「聖」(CONTRIBUTION)「金」(REWARD)両タグを持つ素材2個+高品質(S=5)無特性素材2個、
	# 　reveal_level=1 で craft を実行
	# 【期待される動作】: holy出現2回・gold出現2回で両系統が2対2の同数となり、REQ-115の同数不発ルールで
	# 　両方却下される（activated_traitsが空配列）。高品質2個は残るため調合自体は成立する
	# 🔵 信頼性レベル: acceptance-criteria.md TC-101-07（Critical）・TASK-0018.md統合テスト要件1・
	# 　trait_activation_test実物の同挙動から確定（TC-I01）

	# 【テストデータ準備】: 1素材が2タグ同時保持でも「タグの出現回数合計」で同数不発になる構成を用意
	# 【初期条件設定】: reveal_level=1で両系統とも解禁、両タグ素材2個で貢献度系2・報酬系2の同数を作る
	var materials: Array[MaterialInstance] = [
		_make_material(MaterialInstanceScript.Quality.S, [&"holy", &"gold"] as Array[StringName]),
		_make_material(MaterialInstanceScript.Quality.S, [&"holy", &"gold"] as Array[StringName]),
		_make_material(MaterialInstanceScript.Quality.S, [] as Array[StringName]),
		_make_material(MaterialInstanceScript.Quality.S, [] as Array[StringName]),
	]
	var reveal_level := 1
	var daily_request := DummyDailyRequest.new(&"other", 1.5)  # 指定不一致
	var recipe := _make_recipe(&"test_recipe", 10.0, 20.0)
	var trait_definitions: Dictionary = {
		&"holy": _make_trait(&"holy", TraitDefinitionScript.Category.CONTRIBUTION, 1.5),
		&"gold": _make_trait(&"gold", TraitDefinitionScript.Category.REWARD, 2.0),
	}

	# 【実際の処理実行】: AlchemyResolver.craft() を1回だけ呼び出す（オーケストレーター集約）
	# 【処理内容】: 基礎品質→発現判定(holy2回/gold2回候補化)→系統排他(2対2同数不発)→ペナルティ→貢献度/報酬
	var result = AlchemyResolverScript.craft(materials, reveal_level, daily_request, recipe, trait_definitions)

	# 【結果検証】: 調合自体は成立するが特性は一切発現しないことを確認する
	# 【期待値確認】: 「高品質＋両系統特性の両取り」という支配戦略が数式レベルで無効化されている
	assert_not_null(result, "高品質素材2個が残るため調合自体は成立する") # 【確認内容】: 系統排他は調合不成立を意味しない 🔵
	assert_true(result.activated_traits.is_empty(), "両系統とも同数不発でactivated_traitsが空配列になる") # 【確認内容】: 支配戦略防止の核心分岐 🔵


# ============================================================
# 境界値（reveal_level境界）
# ============================================================

func test_Gランクreveal_level0では貢献度報酬に特性ボーナスが一切かからない() -> void:
	# 【テスト目的】: reveal_level引数がcraft()のステップ2（resolve_activated_traits）を通じて、
	# 　最終的なステップ5（貢献度/報酬）の値にまで影響が伝播することを統合検証する
	# 【テスト内容】: 「聖」タグ素材2個以上（発現閾値を満たす構成）、reveal_level=0 で craft を実行
	# 【期待される動作】: reveal_level=0で特性フィルタが最優先に働きactivated_traitsが空配列になり、
	# 　contribution/rewardは「特性ボーナスなし」で計算した値と一致する（品質のみに基づく値）
	# 🟡 信頼性レベル: REQ-121・acceptance-criteria.md TC-121-01・TASK-0018.md統合テスト要件2より
	# 　妥当な推測（craft()全体を通した貢献度/報酬への影響確認は本統合テストで新規に検証）（TC-I02）

	# 【テストデータ準備】: reveal_level=1なら確実に発現する「聖」2個構成（品質統一でA=4）を用意
	# 【初期条件設定】: reveal_level=0のみを変数とし、発現有無が切り替わる境界を検証する
	var materials: Array[MaterialInstance] = [
		_make_material(MaterialInstanceScript.Quality.A, [&"holy"] as Array[StringName]),
		_make_material(MaterialInstanceScript.Quality.A, [&"holy"] as Array[StringName]),
	]
	var reveal_level := 0
	var daily_request := DummyDailyRequest.new(&"other", 1.5)  # 指定不一致
	var recipe := _make_recipe(&"test_recipe", 10.0, 20.0)
	var trait_definitions: Dictionary = {
		&"holy": _make_trait(&"holy", TraitDefinitionScript.Category.CONTRIBUTION, 1.5),
	}

	# 【実際の処理実行】: AlchemyResolver.craft() を reveal_level=0 で呼び出す
	# 【処理内容】: 発現判定の最優先フィルタ(reveal_level<=0)によりactivated_traitsが空のまま5ステップが完走する
	var result = AlchemyResolverScript.craft(materials, reveal_level, daily_request, recipe, trait_definitions)

	# 【結果検証】: 特性が一切発現せず、貢献度・報酬が品質のみに基づく値になることを確認する
	# 【期待値確認】: 「特性ボーナスなし」で個別に算出した値（ValueCalculator直接呼び出し）と照合する
	assert_not_null(result, "reveal_level=0でも調合自体は成立する") # 【確認内容】: 特性非開示は調合不成立を意味しない 🟡
	assert_true(result.activated_traits.is_empty(), "reveal_level=0で特性フィルタが最優先に働き全不発になる") # 【確認内容】: ステップ2最優先フィルタの伝播 🟡

	var empty_traits: Array[TraitDefinition] = []
	var expected_contribution: float = ValueCalculatorScript.calculate_contribution(
		recipe, result.final_quality, empty_traits, daily_request)
	var expected_reward: float = ValueCalculatorScript.calculate_reward(
		recipe, result.final_quality, empty_traits, daily_request)
	assert_almost_eq(result.contribution, expected_contribution, 0.001, "contributionが特性ボーナスなしの値と一致する") # 【確認内容】: ステップ2→5への伝播（貢献度） 🟡
	assert_almost_eq(result.reward, expected_reward, 0.001, "rewardが特性ボーナスなしの値と一致する") # 【確認内容】: ステップ2→5への伝播（報酬） 🟡
	assert_true(result.contribution > 0.0, "品質のみでもcontributionは正の値になる") # 【確認内容】: 品質倍率のみでも計算が破綻しない 🟡
	assert_true(result.reward > 0.0, "品質のみでもrewardは正の値になる") # 【確認内容】: 品質倍率のみでも計算が破綻しない 🟡
