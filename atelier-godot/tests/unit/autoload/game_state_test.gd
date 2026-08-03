extends GutTest
# TASK-0019: GameState.craft()連携実装（Imperative Shell）のユニットテスト
# 対象: atelier-godot/autoload/game_state.gd（Redフェーズ用スタブのみ存在。craft()/_consume_materials()は未実装）
# 参照: docs/implements/atelier-alchemy-core/TASK-0019/game-state-craft-testcases.md
#
# 【備考】: GameStateはAutoload登録されているが、シングルトン状態の共有汚染を避けるため
#          本テストではpreload().new()でテスト専用インスタンスを生成し、add_child_autofree()で
#          ツリーに追加して検証する（testcases.md「Autoloadとしてのテスト上の注意」に従う）。
#          AlchemyResolver/CraftResult/MaterialInstance/RecipeDefinitionは実物をそのまま使用する。

const GameStateScript := preload("res://autoload/game_state.gd")
const AlchemyResolverScript := preload("res://features/alchemy/logic/alchemy_resolver.gd")
const MaterialInstanceScript := preload("res://features/alchemy/data/material_instance.gd")
const RecipeDefinitionScript := preload("res://features/alchemy/data/recipe_definition.gd")
const TraitDefinitionScript := preload("res://features/alchemy/data/trait_definition.gd")


## 【ダミーstub】: RankDefinition未実装のため、GameState.craft()が参照する
## 　　trait_reveal_levelの1フィールドのみを持つテスト専用ダミーを定義する。
class DummyRank extends RefCounted:
	var trait_reveal_level: int = 1

	func _init(p_level: int = 1) -> void:
		trait_reveal_level = p_level


## 【ダミーstub】: DailyRequest未実装のため、AlchemyResolverが参照する
## 　　required_recipe_id / bonus_multiplier の2フィールドのみを持つテスト専用ダミーを定義する。
## 　　（tests/unit/features/alchemy/alchemy_resolver_test.gd の DummyDailyRequest と同一方針）
class DummyDailyRequest extends RefCounted:
	var required_recipe_id: StringName = &""
	var bonus_multiplier: float = 1.5

	func _init(p_recipe_id: StringName = &"", p_bonus: float = 1.5) -> void:
		required_recipe_id = p_recipe_id
		bonus_multiplier = p_bonus


var game_state


# 【ヘルパー】: 指定品質・特性タグの素材個体を生成するファクトリ
func _make_material(p_id: String, quality: int, trait_ids: Array[StringName]) -> MaterialInstance:
	return MaterialInstanceScript.new(p_id, quality, trait_ids)


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


func before_each() -> void:
	# 【テスト前準備】: 各テストごとにGameStateの新規インスタンスを生成し、ツリーに追加する
	# 【環境初期化】: シングルトン（Autoload）状態の共有汚染を避けるため、テスト専用インスタンスを使う
	game_state = GameStateScript.new()
	add_child_autofree(game_state)


# ============================================================
# 正常系
# ============================================================

func test_調合成功時にinventoryから投入した素材のみが消費される() -> void:
	# 【テスト目的】: craft()成功時に、投入したmaterialsに一致する在庫個体だけがinventoryから
	# 　除去され、非投入分は残ることを確認する
	# 【テスト内容】: 4個の在庫から投入2個（同一インスタンス参照）を投入してcraftを実行する
	# 【期待される動作】: inventory.size()が2になり、残った2個は非投入素材と一致する
	# 🔵 信頼性レベル: 単体テスト要件テストケース2、data-model.md craft()定義より（TC-101-N01）

	# 【テストデータ準備】: 「一部を投入し一部を残す」という調合の典型操作を代表する構成
	# 【初期条件設定】: 投入素材はinventory内の同一オブジェクトを渡す（find()の同一参照契約を検証するため）
	var kept_a := _make_material("kept_a", MaterialInstanceScript.Quality.B, [] as Array[StringName])
	var kept_b := _make_material("kept_b", MaterialInstanceScript.Quality.B, [] as Array[StringName])
	var used_a := _make_material("used_a", MaterialInstanceScript.Quality.C, [] as Array[StringName])
	var used_b := _make_material("used_b", MaterialInstanceScript.Quality.C, [] as Array[StringName])

	game_state.inventory = [kept_a, kept_b, used_a, used_b] as Array[MaterialInstance]
	game_state.current_rank = DummyRank.new(1)
	game_state.today_request = DummyDailyRequest.new(&"other", 1.5)
	game_state.current_recipe = _make_recipe(&"test_recipe", 10.0, 20.0)
	game_state.trait_definitions = {}

	var materials: Array[MaterialInstance] = [used_a, used_b]

	# 【実際の処理実行】: GameState.craft()を投入素材2個で呼び出す
	# 【処理内容】: AlchemyResolver.craft()への委譲後、_consume_materials()でinventoryを更新する契約
	game_state.craft(materials)

	# 【結果検証】: 過剰消費（残0）・過少消費（残4）が起きないことを確認する
	# 【期待値確認】: 投入分だけが正確に消費され、残り2個は非投入素材と一致する
	assert_eq(game_state.inventory.size(), 2, "投入した2個のみが消費され残り2個が保持される") # 【確認内容】: 消費個数の正確性 🔵
	assert_true(game_state.inventory.has(kept_a), "非投入のkept_aが残っている") # 【確認内容】: 非投入分の保持 🔵
	assert_true(game_state.inventory.has(kept_b), "非投入のkept_bが残っている") # 【確認内容】: 非投入分の保持 🔵
	assert_false(game_state.inventory.has(used_a), "投入したused_aが消費されている") # 【確認内容】: 投入分の除去 🔵
	assert_false(game_state.inventory.has(used_b), "投入したused_bが消費されている") # 【確認内容】: 投入分の除去 🔵


func test_調合成功時にrank_hpが貢献度分減算されgoldが報酬分加算される() -> void:
	# 【テスト目的】: CraftResult.contribution/rewardがint(round())を経てrank_hp/goldに
	# 　反映されることを確認する
	# 【テスト内容】: 品質C・無特性の素材1個で調合し、rank_hp=100→90、gold=50→70となる構成を用いる
	# 【期待される動作】: quality_multiplier=1.0（final_quality=C）・特性ボーナスなし・
	# 　合致ボーナスなしとなるため、contribution=base_contribution(10.0)、reward=base_reward(20.0)と
	# 　厳密に一致し、rank_hp=100-10=90、gold=50+20=70になる
	# 🔵 信頼性レベル: 単体テスト要件テストケース3の明示的期待値（100-10=90, 50+20=70）（TC-101-N02）

	# 【テストデータ準備】: 要件記載の代表値（rank_hp=100,gold=50 → 90,70）を再現する構成
	# 【初期条件設定】: 品質C単体・無特性でfinal_quality=Cとなり品質倍率が1.0で中立化される
	var material := _make_material("m1", MaterialInstanceScript.Quality.C, [] as Array[StringName])
	game_state.inventory = [material] as Array[MaterialInstance]
	game_state.current_rank = DummyRank.new(1)
	game_state.today_request = DummyDailyRequest.new(&"other", 1.5)  # recipe.idと不一致で合致ボーナス無効化
	game_state.current_recipe = _make_recipe(&"test_recipe", 10.0, 20.0)
	game_state.trait_definitions = {}
	game_state.rank_hp = 100
	game_state.gold = 50

	# 【実際の処理実行】: GameState.craft()を素材1個で呼び出す
	# 【処理内容】: AlchemyResolver.craft()の戻り値でrank_hp減算・gold加算を行う契約
	game_state.craft([material] as Array[MaterialInstance])

	# 【結果検証】: 減算と加算の符号方向・round()の丸め契約を確認する
	# 【期待値確認】: 100-10=90、50+20=70という明示的な代表値と厳密一致する
	assert_eq(game_state.rank_hp, 90, "rank_hpが貢献度10分減算され90になる") # 【確認内容】: HP減算の演算方向 🔵
	assert_eq(game_state.gold, 70, "goldが報酬20分加算され70になる") # 【確認内容】: ゴールド加算の演算方向 🔵


func test_調合成功時にitem_craftedが1回だけ発行されペイロードがCraftResultである() -> void:
	# 【テスト目的】: craft()成功後にitem_craftedがちょうど1回発行され、そのペイロードが
	# 　AlchemyResolver.craft()の戻り値CraftResultと同一であることを確認する
	# 【テスト内容】: 有効な調合構成（素材2個、有効レシピ・特性マスタ）でcraftを実行する
	# 【期待される動作】: シグナル発行回数=1、ペイロードが非nullのCraftResultインスタンス
	# 🔵 信頼性レベル: 単体テスト要件テストケース4、data-model.mdシグナル定義より（TC-101-N03）

	# 【テストデータ準備】: シグナル発行の副作用が「成功時に1回」という契約を代表する構成
	# 【初期条件設定】: watch_signals()でGameStateのシグナルを購読してから実行する
	var m1 := _make_material("m1", MaterialInstanceScript.Quality.A, [] as Array[StringName])
	var m2 := _make_material("m2", MaterialInstanceScript.Quality.A, [] as Array[StringName])
	game_state.inventory = [m1, m2] as Array[MaterialInstance]
	game_state.current_rank = DummyRank.new(1)
	game_state.today_request = DummyDailyRequest.new(&"other", 1.5)
	game_state.current_recipe = _make_recipe(&"test_recipe", 10.0, 20.0)
	game_state.trait_definitions = {}

	watch_signals(game_state)

	# 【実際の処理実行】: GameState.craft()を有効な素材構成で呼び出す
	# 【処理内容】: AlchemyResolver.craft()成功後にitem_craftedシグナルを発行する契約
	game_state.craft([m1, m2] as Array[MaterialInstance])

	# 【結果検証】: 二重発行が起きないこと、ペイロードがnullでないことを確認する
	# 【期待値確認】: data-model.mdシグナル定義item_crafted(result: CraftResult)に従う
	assert_signal_emit_count(game_state, "item_crafted", 1, "item_craftedがちょうど1回発行される") # 【確認内容】: シグナル発行回数 🔵
	var params = get_signal_parameters(game_state, "item_crafted")
	assert_not_null(params, "シグナルパラメータが取得できる") # 【確認内容】: シグナル発行の実在性 🔵
	var payload = params[0] if params != null else null
	assert_not_null(payload, "ペイロードがnullでないCraftResultである") # 【確認内容】: ペイロードの非null性 🔵
	assert_true(payload != null and payload.contribution > 0.0, "ペイロードがcontributionフィールドを持つCraftResultである") # 【確認内容】: ペイロード型の妥当性 🔵


# ============================================================
# 異常系
# ============================================================

func test_投入枠が空のとき状態変更もシグナル発行も一切起きない() -> void:
	# 【テスト目的】: EDGE-001ガード（null早期return）が全副作用を抑止することを確認する
	# 【テスト内容】: materials=[]でcraft([])を呼び出す
	# 【期待される動作】: inventory・rank_hp・goldはいずれも不変、item_crafted/inventory_updated
	# 　いずれのシグナルも発行されない
	# 🔵 信頼性レベル: 単体テスト要件テストケース1、TC-101-E01、完了条件より（TC-101-E01・最重要）

	# 【テストデータ準備】: 投入枠ゼロという退化入力（調合が成立しない）を用意する
	# 【初期条件設定】: 事前状態としてinventory2個・rank_hp=100・gold=50を設定する
	var kept_a := _make_material("kept_a", MaterialInstanceScript.Quality.B, [] as Array[StringName])
	var kept_b := _make_material("kept_b", MaterialInstanceScript.Quality.B, [] as Array[StringName])
	game_state.inventory = [kept_a, kept_b] as Array[MaterialInstance]
	game_state.current_rank = DummyRank.new(1)
	game_state.today_request = DummyDailyRequest.new(&"other", 1.5)
	game_state.current_recipe = _make_recipe(&"test_recipe", 10.0, 20.0)
	game_state.trait_definitions = {}
	game_state.rank_hp = 100
	game_state.gold = 50

	watch_signals(game_state)

	# 【実際の処理実行】: GameState.craft()を空配列で呼び出す
	# 【処理内容】: AlchemyResolver.craft()がnullを返し、GameState.craft()が即returnする契約
	game_state.craft([] as Array[MaterialInstance])

	# 【結果検証】: いかなる状態も破壊されず、次の操作に安全に進めることを確認する
	# 【期待値確認】: 「調合不成立時は完全に無副作用」というImperative Shellの安全契約
	assert_eq(game_state.inventory.size(), 2, "inventoryが不変である") # 【確認内容】: 在庫の非破壊 🔵
	assert_eq(game_state.rank_hp, 100, "rank_hpが不変である") # 【確認内容】: HPの非破壊 🔵
	assert_eq(game_state.gold, 50, "goldが不変である") # 【確認内容】: ゴールドの非破壊 🔵
	assert_signal_not_emitted(game_state, "item_crafted", "item_craftedが発行されない") # 【確認内容】: シグナル非発行（成立側） 🔵
	assert_signal_not_emitted(game_state, "inventory_updated", "inventory_updatedが発行されない") # 【確認内容】: シグナル非発行（_consume_materials未到達） 🔵


# ============================================================
# 境界値・構造テストケース
# ============================================================

func test_GameState経由の結果がAlchemyResolver直接呼び出しと完全一致する() -> void:
	# 【テスト目的】: GameState.craft()が計算ロジックを一切持たず単純委譲であることを
	# 　構造的に確認する（Functional Core / Imperative Shell境界の回帰防止テスト）
	# 【テスト内容】: 発現あり構成・発現なし構成・指定合致あり構成の3シナリオで、
	# 　AlchemyResolver.craft()直接呼び出しとGameState.craft()経由の結果を比較する
	# 【期待される動作】: 各シナリオでCraftResultの全比較対象フィールドが一致する
	# 🟡 信頼性レベル: 単体テスト要件テストケース5、architecture.md「Warning#2対応」より妥当な推測（TC-101-B01）

	# 【テストデータ準備】: 計算経路が分岐する複数シナリオで委譲の純粋性を担保する
	# 【初期条件設定】: 各シナリオで同一のmaterials・reveal_level・today_request・current_recipe・
	# 　trait_definitionsを両経路に渡す
	var trait_definitions: Dictionary = {
		&"holy": _make_trait(&"holy", TraitDefinitionScript.Category.CONTRIBUTION, 1.5),
	}
	var recipe := _make_recipe(&"test_recipe", 10.0, 20.0)

	var scenarios: Array = [
		{
			"name": "発現あり構成",
			"materials": [
				_make_material("s1a", MaterialInstanceScript.Quality.A, [&"holy"] as Array[StringName]),
				_make_material("s1b", MaterialInstanceScript.Quality.A, [&"holy"] as Array[StringName]),
			] as Array[MaterialInstance],
			"daily_request": DummyDailyRequest.new(&"other", 1.5),
		},
		{
			"name": "発現なし構成",
			"materials": [
				_make_material("s2a", MaterialInstanceScript.Quality.A, [] as Array[StringName]),
			] as Array[MaterialInstance],
			"daily_request": DummyDailyRequest.new(&"other", 1.5),
		},
		{
			"name": "指定合致あり構成",
			"materials": [
				_make_material("s3a", MaterialInstanceScript.Quality.B, [] as Array[StringName]),
			] as Array[MaterialInstance],
			"daily_request": DummyDailyRequest.new(&"test_recipe", 1.5),
		},
	]

	for scenario in scenarios:
		var materials: Array[MaterialInstance] = scenario["materials"]
		var daily_request = scenario["daily_request"]

		# 【実際の処理実行】: AlchemyResolver.craft()を直接呼び出し、期待される「唯一の正解」を得る
		# 【処理内容】: GameState.craft()と全く同じ引数を渡して直接呼び出す
		var direct_result = AlchemyResolverScript.craft(materials, 1, daily_request, recipe, trait_definitions)

		# 【実際の処理実行】: GameState.craft()経由でも同一引数構成で調合を実行する
		# 【処理内容】: GameState内部でAlchemyResolver.craft()へ委譲された結果をシグナル経由で取得する
		game_state.inventory = materials.duplicate() as Array[MaterialInstance]
		game_state.current_rank = DummyRank.new(1)
		game_state.today_request = daily_request
		game_state.current_recipe = recipe
		game_state.trait_definitions = trait_definitions

		watch_signals(game_state)
		game_state.craft(materials)
		var params = get_signal_parameters(game_state, "item_crafted")
		var shell_result = params[0] if params != null else null

		# 【結果検証】: 直接呼び出しとGameState経由で全比較対象フィールドが一致することを確認する
		# 【期待値確認】: 委譲のみであれば両者は必ず同値（アーキテクチャ境界の継続的保証）
		assert_not_null(shell_result, "%s: GameState経由でCraftResultが取得できる" % scenario["name"]) # 【確認内容】: シグナル発行の実在性 🟡
		if shell_result == null:
			continue  # 【Redフェーズ注記】: craft()未実装のためshell_resultがnullになる。既にassert_not_nullで失敗を記録済みのためこのシナリオの以降の比較はスキップする
		assert_eq(shell_result.base_quality, direct_result.base_quality, "%s: base_qualityが一致する" % scenario["name"]) # 【確認内容】: 計算結果の同一性 🟡
		assert_eq(shell_result.final_quality, direct_result.final_quality, "%s: final_qualityが一致する" % scenario["name"]) # 【確認内容】: 計算結果の同一性 🟡
		assert_eq(shell_result.activated_traits.size(), direct_result.activated_traits.size(), "%s: activated_traits件数が一致する" % scenario["name"]) # 【確認内容】: 計算結果の同一性 🟡
		assert_eq(shell_result.contribution, direct_result.contribution, "%s: contributionが一致する" % scenario["name"]) # 【確認内容】: 計算結果の同一性 🟡
		assert_eq(shell_result.reward, direct_result.reward, "%s: rewardが一致する" % scenario["name"]) # 【確認内容】: 計算結果の同一性 🟡


func test_素材1個で調合が成立し状態更新とシグナル発行が揃う() -> void:
	# 【テスト目的】: 0個（不成立・EDGE-001）と1個（成立）の境界が一貫していることを
	# 　Imperative Shell側からも確認する
	# 【テスト内容】: 無特性素材1個のみをinventoryに持つ状態でcraftを実行する
	# 【期待される動作】: 1個投入時にinventoryから1個消費、rank_hp/gold更新、item_crafted 1回発行が揃う
	# 🟡 信頼性レベル: EDGE-001境界・alchemy_resolver_test TC-U04からの妥当な推測（TC-101-B02）

	# 【テストデータ準備】: EDGE-001（0個=不成立）の直上となる最小成立ケースを用意する
	# 【初期条件設定】: 素材1個のみをinventoryに持たせ、それをそのまま投入する
	var material := _make_material("only", MaterialInstanceScript.Quality.B, [] as Array[StringName])
	game_state.inventory = [material] as Array[MaterialInstance]
	game_state.current_rank = DummyRank.new(1)
	game_state.today_request = DummyDailyRequest.new(&"other", 1.5)
	game_state.current_recipe = _make_recipe(&"test_recipe", 10.0, 20.0)
	game_state.trait_definitions = {}
	game_state.rank_hp = 100
	game_state.gold = 50

	watch_signals(game_state)

	# 【実際の処理実行】: GameState.craft()を素材1個で呼び出す
	# 【処理内容】: ガードで弾かれず、消費・状態更新・シグナル発行のすべてが完走することを期待する
	game_state.craft([material] as Array[MaterialInstance])

	# 【結果検証】: 0個と1個で挙動が破綻しないことを確認する
	# 【期待値確認】: 境界の内側（成立側）でShellの全副作用が正しく揃うこと
	assert_true(game_state.inventory.is_empty(), "投入した1個が消費されinventoryが空になる") # 【確認内容】: 最小成立時の消費 🟡
	assert_ne(game_state.rank_hp, 100, "rank_hpが更新されている") # 【確認内容】: 最小成立時のHP更新 🟡
	assert_ne(game_state.gold, 50, "goldが更新されている") # 【確認内容】: 最小成立時のゴールド更新 🟡
	assert_signal_emit_count(game_state, "item_crafted", 1, "item_craftedが1回発行される") # 【確認内容】: 最小成立時のシグナル発行 🟡
