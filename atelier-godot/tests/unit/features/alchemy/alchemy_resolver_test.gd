extends GutTest
# TASK-0018: AlchemyResolver.craft（調合オーケストレーター）のユニットテスト
# 対象: features/alchemy/logic/alchemy_resolver.gd（未実装。Redフェーズ用スタブのみ存在）
# 参照: docs/implements/atelier-alchemy-core/TASK-0018/alchemy-resolver-craft-testcases.md
#
# 【備考】: AlchemyResolverは純粋関数(static func craft)のみで構成されるためインスタンス生成は不要。
#          TASK-0013〜0017（QualityCalculator/TraitActivation/ValueCalculator）を正しい順序で
#          合成していることを検証する。DailyRequestは未実装のため、本ファイル内にDuck typing用の
#          ダミーstubクラス（DummyDailyRequest）を定義して代替する（value_calculator_test.gdと同一方針）。

const AlchemyResolverScript := preload("res://features/alchemy/logic/alchemy_resolver.gd")
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
# 正常系
# ============================================================

func test_5ステップが正しい順序で合成され結果が整合する() -> void:
	# 【テスト目的】: craft()が5ステップ（基礎品質→発現判定→系統排他→品質ペナルティ→貢献度/報酬）を
	# 　正しい順序で合成し、各ステップの出力が矛盾なくCraftResultに反映されることを確認する
	# 【テスト内容】: 「聖」(holy, CONTRIBUTION)タグ素材2個+無特性素材2個（すべて品質A=4）、reveal_level=1 で craft を実行
	# 【期待される動作】: base_quality=A(4)、final_quality=B(3、聖1件で1段減)、activated_traitsに聖が1件含まれる
	# 🔵 信頼性レベル: dataflow.md「機能2」5ステップ順序・quality_calculator.gd/trait_activation.gd実物の挙動から確定（TC-U01）

	# 【テストデータ準備】: 発現閾値ちょうどの「聖」2個と、基礎品質を4.0に固定する無特性2個を用意
	# 【初期条件設定】: reveal_level=1で貢献度系が解禁、指定不一致で合致ボーナスを無効化
	var materials: Array[MaterialInstance] = [
		_make_material(MaterialInstanceScript.Quality.A, [&"holy"] as Array[StringName]),
		_make_material(MaterialInstanceScript.Quality.A, [&"holy"] as Array[StringName]),
		_make_material(MaterialInstanceScript.Quality.A, [] as Array[StringName]),
		_make_material(MaterialInstanceScript.Quality.A, [] as Array[StringName]),
	]
	var reveal_level := 1
	var daily_request := DummyDailyRequest.new(&"other", 1.5)  # recipe.idと不一致で合致ボーナス無効化
	var recipe := _make_recipe(&"test_recipe", 10.0, 20.0)
	var trait_definitions: Dictionary = {
		&"holy": _make_trait(&"holy", TraitDefinitionScript.Category.CONTRIBUTION, 1.5),
	}

	# 【実際の処理実行】: AlchemyResolver.craft() を1回だけ呼び出す（オーケストレーター集約）
	# 【処理内容】: 基礎品質→発現判定→系統排他→ペナルティ→貢献度/報酬の5ステップ合成
	var result = AlchemyResolverScript.craft(materials, reveal_level, daily_request, recipe, trait_definitions)

	# 【結果検証】: base_quality/final_quality/activated_traitsの整合を検証する
	# 【期待値確認】: base=A(4)、final=B(3)、聖1件。ペナルティが確実に効いている
	assert_not_null(result, "有効な投入でnullでないCraftResultを返す") # 【確認内容】: craft()が成立していること 🔵
	assert_eq(result.base_quality, MaterialInstanceScript.Quality.A, "基礎品質がAである") # 【確認内容】: ステップ1の結果反映 🔵
	assert_eq(result.final_quality, MaterialInstanceScript.Quality.B, "最終品質がBである") # 【確認内容】: ステップ4の結果反映 🔵
	assert_eq(result.activated_traits.size(), 1, "発現特性が1件である") # 【確認内容】: ステップ2-3の連結結果 🔵
	assert_eq(result.activated_traits[0].id, &"holy", "発現特性が聖である") # 【確認内容】: 発現特性の同一性 🔵
	assert_true(result.final_quality < result.base_quality, "品質ペナルティが適用されている") # 【確認内容】: base/finalが別物として保持されている 🔵


func test_有効な投入構成でCraftResultの全6フィールドが埋まっている() -> void:
	# 【テスト目的】: craft()がnullでないCraftResultを返す場合、6フィールドすべてが
	# 　craft()によって設定されていることを確認する（「代入し忘れ」の検出）
	# 【テスト内容】: 「聖」タグ素材2個+無特性素材2個（品質A）、指定合致ありでcraftを実行
	# 【期待される動作】: base_quality/final_quality/activated_traits/rejected_category/contribution/rewardが
	# 　すべて有効値を持つ（contribution/rewardは基礎値が乗算され0.0のまま放置されない）
	# 🟡 信頼性レベル: data-model.md CraftResult型定義・craft_result.gd実物の初期値から妥当に推測（TC-U02）

	# 【テストデータ準備】: 指定合致ボーナスも有効化し、ステップ5が実行されていることを確実に検出できる構成
	# 【初期条件設定】: daily_request.required_recipe_id を recipe.id と一致させる
	var materials: Array[MaterialInstance] = [
		_make_material(MaterialInstanceScript.Quality.A, [&"holy"] as Array[StringName]),
		_make_material(MaterialInstanceScript.Quality.A, [&"holy"] as Array[StringName]),
		_make_material(MaterialInstanceScript.Quality.A, [] as Array[StringName]),
		_make_material(MaterialInstanceScript.Quality.A, [] as Array[StringName]),
	]
	var reveal_level := 1
	var recipe := _make_recipe(&"test_recipe", 10.0, 20.0)
	var daily_request := DummyDailyRequest.new(recipe.id, 1.5)  # 指定合致あり
	var trait_definitions: Dictionary = {
		&"holy": _make_trait(&"holy", TraitDefinitionScript.Category.CONTRIBUTION, 1.5),
	}

	# 【実際の処理実行】: AlchemyResolver.craft() を1回だけ呼び出す
	# 【処理内容】: 5ステップすべてを経由してCraftResultの全フィールドを埋める
	var result = AlchemyResolverScript.craft(materials, reveal_level, daily_request, recipe, trait_definitions)

	# 【結果検証】: 全6フィールドが未初期化のまま放置されていないことを確認する
	# 【期待値確認】: contribution/rewardは初期値0.0のままだと「ステップ5未実行」のバグを示す
	assert_not_null(result, "有効な投入でnullでないCraftResultを返す") # 【確認内容】: 戻り値の存在 🟡
	assert_true(
		result.base_quality >= MaterialInstanceScript.Quality.D and result.base_quality <= MaterialInstanceScript.Quality.S,
		"base_qualityが有効なQuality範囲内である"
	) # 【確認内容】: フィールド1 base_quality 🟡
	assert_true(
		result.final_quality >= MaterialInstanceScript.Quality.D and result.final_quality <= MaterialInstanceScript.Quality.S,
		"final_qualityが有効なQuality範囲内である"
	) # 【確認内容】: フィールド2 final_quality 🟡
	assert_not_null(result.activated_traits, "activated_traitsが配列として初期化されている") # 【確認内容】: フィールド3 activated_traits 🟡
	assert_true(result.contribution > 0.0, "contributionが基礎値から算出され0.0でない") # 【確認内容】: フィールド5 contribution（ステップ5実行の証跡） 🟡
	assert_true(result.reward > 0.0, "rewardが基礎値から算出され0.0でない") # 【確認内容】: フィールド6 reward（ステップ5実行の証跡） 🟡
	var valid_categories: Array = [
		TraitDefinitionScript.Category.CONTRIBUTION,
		TraitDefinitionScript.Category.REWARD,
		TraitDefinitionScript.Category.SUPPORT,
	]
	assert_true(valid_categories.has(result.rejected_category), "rejected_categoryがCategory enumの有効値である") # 【確認内容】: フィールド4 rejected_category 🟡


# ============================================================
# 異常系
# ============================================================

func test_投入素材が空配列のとき調合が成立せずnullを返す() -> void:
	# 【テスト目的】: EDGE-001ガードがcraft()の入口で最優先に働くことを確認する
	# 【テスト内容】: materials=[]（投入枠が空）でcraftを呼び出す
	# 【期待される動作】: 例外を投げず、nullを返して「調合不成立」を表現する
	# 🟡 信頼性レベル: acceptance-criteria.md TC-101-E01・dataflow.md「エラーハンドリングフロー」より妥当な推測（TC-U03）

	# 【テストデータ準備】: 投入素材ゼロという退化入力を用意する
	# 【初期条件設定】: reveal_level・daily_request・recipe・trait_definitionsは任意のダミーで構わない
	var materials: Array[MaterialInstance] = []
	var reveal_level := 1
	var daily_request := DummyDailyRequest.new(&"other", 1.5)
	var recipe := _make_recipe(&"test_recipe", 10.0, 20.0)
	var trait_definitions: Dictionary = {}

	# 【実際の処理実行】: AlchemyResolver.craft() を空配列で呼び出す
	# 【処理内容】: EDGE-001ガードが他ステップに到達する前に短絡することを期待する
	var result = AlchemyResolverScript.craft(materials, reveal_level, daily_request, recipe, trait_definitions)

	# 【結果検証】: nullが返されることを確認する
	# 【期待値確認】: 呼び出し元（TASK-0019）がnullチェックで調合不成立を判別できる契約
	assert_null(result, "投入枠が空の場合nullを返す") # 【確認内容】: EDGE-001ガードの動作 🟡


# ============================================================
# 境界値
# ============================================================

func test_素材1個の最小有効構成でnullを返さず調合が成立する() -> void:
	# 【テスト目的】: EDGE-001ガードの境界条件（is_empty()判定）が過剰に働かないことを確認する
	# 【テスト内容】: 無特性素材1個（品質A）でcraftを実行する
	# 【期待される動作】: nullを返さず、有効なCraftResultが返る（0個→null、1個→成立、という境界の一貫性）
	# 🟡 信頼性レベル: requirements.md「入出力の関係性（1個以上で成立）」・EDGE-001境界からの妥当な推測（TC-U04）

	# 【テストデータ準備】: EDGE-001（0個=不成立）の直上となる最小成立ケースを用意する
	# 【初期条件設定】: 無特性1個のため発現閾値(2個)を満たさず、activated_traitsは空となるはず
	var materials: Array[MaterialInstance] = [
		_make_material(MaterialInstanceScript.Quality.A, [] as Array[StringName]),
	]
	var reveal_level := 1
	var daily_request := DummyDailyRequest.new(&"other", 1.5)
	var recipe := _make_recipe(&"test_recipe", 10.0, 20.0)
	var trait_definitions: Dictionary = {}

	# 【実際の処理実行】: AlchemyResolver.craft() を素材1個で呼び出す
	# 【処理内容】: ガードで弾かれず5ステップが完走することを期待する
	var result = AlchemyResolverScript.craft(materials, reveal_level, daily_request, recipe, trait_definitions)

	# 【結果検証】: nullでないこと、無特性1個では発現しないこと、基礎品質が正しいことを確認する
	# 【期待値確認】: 境界の内外（0個/1個）で挙動が一貫していることを保証する
	assert_not_null(result, "素材1個ではnullを返さず調合が成立する") # 【確認内容】: EDGE-001境界の直上 🟡
	assert_true(result.activated_traits.is_empty(), "無特性1個では特性が発現しない") # 【確認内容】: 発現閾値2未満 🟡
	assert_eq(result.base_quality, MaterialInstanceScript.Quality.A, "基礎品質が素材1個の品質と一致する") # 【確認内容】: 平均=単一素材の品質 🟡
