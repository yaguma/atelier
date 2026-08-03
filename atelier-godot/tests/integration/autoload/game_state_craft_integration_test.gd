extends GutTest
# TASK-0019: GameState.craft()連携実装 - 統合テスト
# 対象: atelier-godot/autoload/game_state.gd（Redフェーズ用スタブのみ存在。craft()/_consume_materials()は未実装）
# 参照: docs/implements/atelier-alchemy-core/TASK-0019/game-state-craft-testcases.md TC-101-I01
#
# 【備考】: TASK-0018（AlchemyResolver.craft()の内部5ステップ）とTASK-0019（GameStateのShell副作用）
#          の結合をend-to-endで検証する。GameStateはpreload().new()でテスト専用インスタンスを生成する。

const GameStateScript := preload("res://autoload/game_state.gd")
const MaterialInstanceScript := preload("res://features/alchemy/data/material_instance.gd")
const RecipeDefinitionScript := preload("res://features/alchemy/data/recipe_definition.gd")
const TraitDefinitionScript := preload("res://features/alchemy/data/trait_definition.gd")


## 【ダミーstub】: RankDefinition未実装のため、trait_reveal_levelのみを持つテスト専用ダミー
class DummyRank extends RefCounted:
	var trait_reveal_level: int = 1

	func _init(p_level: int = 1) -> void:
		trait_reveal_level = p_level


## 【ダミーstub】: DailyRequest未実装のため、required_recipe_id / bonus_multiplierのみを持つ
## 　　テスト専用ダミー（tests/unit/features/alchemy/alchemy_resolver_test.gd と同一方針）
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
# 統合テスト
# ============================================================

func test_実在庫データを用いた調合フローが1回の呼び出しで一貫完了する() -> void:
	# 【テスト目的】: inventoryに品質・特性の異なる素材が複数ある実データ状態でGameState.craft()を
	# 　呼び、AlchemyResolver.craft()の内部5ステップ（TASK-0018）を経由したCraftResultが返り、
	# 　在庫更新・rank_hp/gold更新・item_crafted発行までが1呼び出しで一貫完了することを確認する
	# 【テスト内容】: 同一特性タグ2個で発現する構成＋無特性数個の実データ状態でcraftを実行する
	# 【期待される動作】: 5ステップ合成→Shell側3副作用（在庫消費・HP/ゴールド更新・シグナル）が
	# 　矛盾なく連結する
	# 🔵 信頼性レベル: 統合テスト要件、dataflow.md「機能2: 調合」より（TC-101-I01）

	# 【テストデータ準備】: 実運用に近い複合データで、TASK-0018の5ステップとTASK-0019の
	# 　Shell副作用の結合を検証する
	# 【初期条件設定】: 「聖」タグ素材2個（発現条件を満たす投入対象）＋無特性素材2個（在庫に残す非投入分）
	var holy_a := _make_material("holy_a", MaterialInstanceScript.Quality.A, [&"holy"] as Array[StringName])
	var holy_b := _make_material("holy_b", MaterialInstanceScript.Quality.A, [&"holy"] as Array[StringName])
	var plain_a := _make_material("plain_a", MaterialInstanceScript.Quality.B, [] as Array[StringName])
	var plain_b := _make_material("plain_b", MaterialInstanceScript.Quality.B, [] as Array[StringName])

	game_state.inventory = [holy_a, holy_b, plain_a, plain_b] as Array[MaterialInstance]
	game_state.current_rank = DummyRank.new(1)
	game_state.today_request = DummyDailyRequest.new(&"other", 1.5)
	game_state.current_recipe = _make_recipe(&"test_recipe", 10.0, 20.0)
	game_state.trait_definitions = {
		&"holy": _make_trait(&"holy", TraitDefinitionScript.Category.CONTRIBUTION, 1.5),
	}
	game_state.rank_hp = 100
	game_state.gold = 50

	watch_signals(game_state)

	# 【実際の処理実行】: GameState.craft()を「聖」タグ素材2個（在庫の一部）で呼び出す
	# 【処理内容】: AlchemyResolver.craft()の5ステップ（基礎品質→発現判定→系統排他→
	# 　ペナルティ→貢献度/報酬）を経由し、Shell側の3副作用が連結される契約
	var materials: Array[MaterialInstance] = [holy_a, holy_b]
	game_state.craft(materials)

	# 【結果検証】: 5ステップの結果（特に品質ペナルティと発現特性）がShell側の副作用に
	# 　正しく波及していることを確認する
	# 【期待値確認】: dataflow.md「機能2: 調合」シーケンス図全体の帰結
	assert_signal_emit_count(game_state, "item_crafted", 1, "item_craftedが1回発行される") # 【確認内容】: シグナル発行の一貫性 🔵
	var params = get_signal_parameters(game_state, "item_crafted")
	var result = params[0] if params != null else null
	assert_not_null(result, "CraftResultペイロードが取得できる") # 【確認内容】: ペイロードの実在性 🔵

	assert_eq(game_state.inventory.size(), 2, "投入した2個が消費され在庫に2個残る") # 【確認内容】: 在庫更新の一貫完了 🔵
	assert_true(game_state.inventory.has(plain_a), "非投入のplain_aが在庫に残っている") # 【確認内容】: 非投入分の保持 🔵
	assert_true(game_state.inventory.has(plain_b), "非投入のplain_bが在庫に残っている") # 【確認内容】: 非投入分の保持 🔵

	if result == null:
		return  # 【Redフェーズ注記】: craft()未実装のためresultがnullになる。既にassert_not_nullで失敗を記録済みのため以降の比較はスキップする

	assert_eq(result.activated_traits.size(), 1, "発現特性（聖）が1件含まれる") # 【確認内容】: 発現判定の波及 🔵
	assert_true(result.final_quality < result.base_quality, "品質ペナルティがfinal_qualityに反映されている") # 【確認内容】: 品質ペナルティの波及 🔵
	assert_true(result.contribution > 0.0, "contributionが正の値で算出されている") # 【確認内容】: 貢献度算出の波及 🔵
	assert_true(result.reward > 0.0, "rewardが正の値で算出されている") # 【確認内容】: 報酬算出の波及 🔵
	assert_eq(game_state.rank_hp, 100 - int(round(result.contribution)), "rank_hpがcontribution分減算されている") # 【確認内容】: HP更新の一貫完了 🔵
	assert_eq(game_state.gold, 50 + int(round(result.reward)), "goldがreward分加算されている") # 【確認内容】: ゴールド更新の一貫完了 🔵
