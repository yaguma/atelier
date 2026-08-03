extends GutTest
# TASK-0020: AlchemyBench UI実装（調合台画面）のユニットテスト
# 対象: atelier-godot/features/alchemy/ui/alchemy_bench.gd（Redフェーズ用スタブのみ存在。
#      _build_slots()/_update_craft_button_state()/place_material()/_on_craft_pressed()/
#      _on_item_crafted()はいずれも未実装でpassのみ）
# 参照: docs/implements/atelier-alchemy-core/TASK-0020/alchemy-bench-testcases.md
#
# 【設計方針】: GameStateはAutoload未登録のため、AlchemyBenchはset_game_state(gs)の
#             セッターDIでGameStateインスタンスを受け取る（testcases.md「0. 前提」参照）。
#             UIノード（Button/ItemList等）への直接依存を避け、_update_craft_button_state()の
#             戻り値やslots/_placed_materials等の内部状態を直接検証することで
#             テスト容易性を担保する（タスク指示「UIノードへの依存を避ける」に対応）。

const AlchemyBenchScript := preload("res://features/alchemy/ui/alchemy_bench.gd")
const GameStateScript := preload("res://autoload/game_state.gd")
const MaterialInstanceScript := preload("res://features/alchemy/data/material_instance.gd")
const CraftResultScript := preload("res://features/alchemy/data/craft_result.gd")
const TraitDefinitionScript := preload("res://features/alchemy/data/trait_definition.gd")


## 【テスト専用ダブル】: TC-5でGameState.craft()への委譲引数を記録するためのサブクラス。
## 　　GUTのpartial_doubleではなく、DI設計を活かしたサブクラス差し替え方式を採用する
## 　　（testcases.md TC-5「検証手段の補足」(B)方式：テスト専用サブクラスでcraft()を
## 　　オーバーライドして引数を記録するダブルを注入する）。
class SpyGameState extends GameStateScript:
	var craft_call_count: int = 0
	var craft_call_args: Array = []

	func craft(materials: Array[MaterialInstance]) -> void:
		# 【スパイ実装】: 実際のAlchemyResolver委譲は行わず、呼び出し回数と引数のみを記録する
		craft_call_count += 1
		craft_call_args.append(materials)


var game_state
var bench


## 【ヘルパー】: 指定品質・特性タグの素材個体を生成するファクトリ（game_state_test.gdと同一方針）
func _make_material(p_id: String, quality: int, trait_ids: Array[StringName] = [] as Array[StringName]) -> MaterialInstance:
	return MaterialInstanceScript.new(p_id, quality, trait_ids)


func before_each() -> void:
	# 【テスト前準備】: GameStateとAlchemyBenchを都度新規生成しDI注入する
	# 【環境初期化】: Autoloadシングルトン汚染を避け、テスト専用インスタンスを用いる
	game_state = GameStateScript.new()
	add_child_autofree(game_state)

	# 【初期条件設定】: AlchemyBenchをインスタンス化し、GameStateを注入する
	bench = AlchemyBenchScript.new()
	bench.set_game_state(game_state)   # ← DI注入。Autoloadグローバル参照に依存しない
	add_child_autofree(bench)          # _ready()相当の初期化はここで走る想定


# ============================================================
# 正常系
# ============================================================

func test_投入枠に素材1個以上配置でcraft_buttonが活性化される() -> void:
	# 【テスト目的】: 投入枠に素材が1個以上配置された状態で調合実行ボタンが活性化されることを確認する
	# 【テスト内容】: _placed_materialsに素材1件をセットした状態で_update_craft_button_state()を呼ぶ
	# 【期待される動作】: 戻り値（disabled状態）がfalseになる
	# 🟡 信頼性レベル: TASK-0020.md単体テスト要件テストケース2、完了条件より

	# 【テストデータ準備】: 「1個配置」は調合が成立する最小構成（EDGE-001の直上の境界の内側）を代表する
	# 【初期条件設定】: 品質B・無特性の素材1個を投入済み状態としてセットする
	var material_a := _make_material("mat_a", MaterialInstanceScript.Quality.B)
	bench._placed_materials = [material_a] as Array[MaterialInstance]

	# 【実際の処理実行】: ボタン活性状態を算出するロジックを直接呼び出す
	# 【処理内容】: UIノード(craft_button)に依存せず、戻り値としてdisabled状態を取得する
	var disabled = bench._update_craft_button_state()

	# 【結果検証】: 素材が1件でも入れば活性化される（0件との切替が正しい）ことを確認する
	# 【期待値確認】: 完了条件「投入枠に1つ以上素材が配置されると調合実行ボタンが活性化される」より
	assert_false(disabled, "投入枠に1個以上配置でdisabledがfalseになる") # 【確認内容】: ボタン活性化ロジックの正常動作 🟡


func test_recipe_slot_countが4のとき投入枠が4個生成される() -> void:
	# 【テスト目的】: GameState.recipe_slot_count（初期値4）を唯一の情報源として投入枠が構築されることを確認する
	# 【テスト内容】: game_state.recipe_slot_count == 4の状態でbench._build_slots(game_state.recipe_slot_count)を呼ぶ
	# 【期待される動作】: bench.slots.size()が4になる
	# 🔵 信頼性レベル: TASK-0020.md単体テスト要件テストケース3、data-model.md GameState.recipe_slot_count（初期値4）より

	# 【テストデータ準備】: REQ-101「投入枠は初期4枠」を代表する初期状態
	# 【初期条件設定】: GameStateはデフォルトのrecipe_slot_count=4を利用する
	assert_eq(game_state.recipe_slot_count, 4, "GameStateのrecipe_slot_countが初期値4である") # 【確認内容】: 前提条件（枠数の情報源）の確認 🔵

	# 【実際の処理実行】: recipe_slot_countを引数として枠構築ロジックを呼び出す
	# 【処理内容】: 枠数がハードコードされずGameState由来の値で構築されることを検証する
	bench._build_slots(game_state.recipe_slot_count)

	# 【結果検証】: 枠数がrecipe_slot_countと一致することを確認する
	# 【期待値確認】: REQ-101・data-model.md `GameState.recipe_slot_count`（初期値4）より
	assert_eq(bench.slots.size(), 4, "recipe_slot_count=4のとき投入枠が4個生成される") # 【確認内容】: 枠数がGameStateを正しく参照している 🔵


func test_craft実行時に投入素材が改変されずGameStateへ渡る() -> void:
	# 【テスト目的】: UIが投入素材配列を加工せずGameState.craft()へそのまま渡すことを確認する（Warning#2境界）
	# 【テスト内容】: _placed_materialsに複数素材をセットした状態で_on_craft_pressed()を呼び、
	#               GameState.craft()に渡された引数の要素数・順序・同一参照を検証する
	# 【期待される動作】: craftがちょうど1回呼ばれ、渡された配列が_placed_materialsと完全に一致する
	# 🟡 信頼性レベル: TASK-0020.md単体テスト要件テストケース5、architecture.md「Warning#2対応」より妥当な推測

	# 【テストデータ準備】: 品質差・特性有無を含む複数素材で「UIが余計な加工をしていないか」を検出しやすくする
	# 【初期条件設定】: SpyGameStateを注入しなおし、craft()呼び出しを記録できるようにする
	var spy_game_state = SpyGameState.new()
	add_child_autofree(spy_game_state)
	bench.set_game_state(spy_game_state)

	var mat_a := _make_material("mat_a", MaterialInstanceScript.Quality.A)
	var mat_b := _make_material("mat_b", MaterialInstanceScript.Quality.C, [&"holy"] as Array[StringName])
	bench._placed_materials = [mat_a, mat_b] as Array[MaterialInstance]

	# 【実際の処理実行】: 調合実行ボタン押下相当のハンドラを呼び出す
	# 【処理内容】: UI側で加工せずGameState.craft()へ委譲する契約を検証する
	bench._on_craft_pressed()

	# 【結果検証】: craft()がちょうど1回、無加工の配列で呼ばれたことを確認する
	# 【期待値確認】: 完了条件「GameState.craft(投入素材)が投入枠のMaterialInstance配列をそのまま
	#               引数として呼び出される（UI側での加工・計算を行わない）」、Warning#2境界より
	assert_eq(spy_game_state.craft_call_count, 1, "GameState.craftがちょうど1回呼ばれる") # 【確認内容】: 呼び出し回数の正確性 🟡
	assert_eq(spy_game_state.craft_call_args.size(), 1, "craftの呼び出し記録が1件のみである") # 【確認内容】: 呼び出し記録の正確性 🟡
	if spy_game_state.craft_call_args.size() == 1:
		var captured: Array = spy_game_state.craft_call_args[0]
		assert_eq(captured.size(), 2, "渡された配列の要素数が_placed_materialsと一致する") # 【確認内容】: 個数の一致 🟡
		assert_eq(captured[0], mat_a, "1番目の要素が同一参照で一致する（改変なし）") # 【確認内容】: 順序・同一参照の一致 🟡
		assert_eq(captured[1], mat_b, "2番目の要素が同一参照で一致する（改変なし）") # 【確認内容】: 順序・同一参照の一致 🟡


func test_item_crafted受信で結果がCraftResultの値そのまま反映される() -> void:
	# 【テスト目的】: item_craftedシグナル受信時に結果表示状態がCraftResultの値をそのまま保持することを確認する（Warning#2回帰防止）
	# 【テスト内容】: 既知値のCraftResultでgame_state.item_craftedを発行し、benchが保持する結果を検証する
	# 【期待される動作】: bench.last_resultの各フィールドが発行したCraftResultと完全一致する（再計算・補正なし）
	# 🟡 信頼性レベル: TASK-0020.md単体テスト要件テストケース6、data-model.md CraftResult定義より妥当な推測

	# 【テストデータ準備】: UI側が誤って再計算した場合にズレが出る、境界的でない代表値を選定する
	# 【初期条件設定】: 既知のfinal_quality/activated_traits/contribution/rewardを持つCraftResultを生成する
	var trait_holy := TraitDefinitionScript.new()
	trait_holy.id = &"holy"
	trait_holy.category = TraitDefinitionScript.Category.CONTRIBUTION

	var result := CraftResultScript.new()
	result.base_quality = MaterialInstanceScript.Quality.B
	result.final_quality = MaterialInstanceScript.Quality.A
	result.activated_traits = [trait_holy] as Array[TraitDefinition]
	result.rejected_category = TraitDefinitionScript.Category.REWARD
	result.contribution = 12.0
	result.reward = 34.0

	# 【実際の処理実行】: GameStateのitem_craftedシグナルを既知値で発行する
	# 【処理内容】: benchが購読しているシグナルハンドラ経由で結果を受信させる
	game_state.item_crafted.emit(result)

	# 【結果検証】: benchが保持する結果の各フィールドが発行値と完全一致することを確認する
	# 【期待値確認】: 完了条件「resultの最終品質・発現特性・貢献度・報酬をそのまま結果表示に反映する
	#               （UI側で値を再計算しない）」より
	assert_not_null(bench.last_result, "item_crafted受信後にlast_resultが設定されている") # 【確認内容】: シグナル受信の実在性 🟡
	if bench.last_result != null:
		assert_eq(bench.last_result.final_quality, MaterialInstanceScript.Quality.A, "final_qualityがそのまま反映される") # 【確認内容】: 値の同一性（再計算されていない） 🟡
		assert_eq(bench.last_result.activated_traits.size(), 1, "activated_traitsがそのまま反映される") # 【確認内容】: 値の同一性（再計算されていない） 🟡
		assert_eq(bench.last_result.contribution, 12.0, "contributionがそのまま反映される") # 【確認内容】: 値の同一性（再計算されていない） 🟡
		assert_eq(bench.last_result.reward, 34.0, "rewardがそのまま反映される") # 【確認内容】: 値の同一性（再計算されていない） 🟡


# ============================================================
# 異常系
# ============================================================

func test_投入枠が空のときcraft_buttonが非活性化される() -> void:
	# 【テスト目的】: 投入枠が1つも埋まっていない状態で調合実行ボタンが非活性化されることを確認する（EDGE-001）
	# 【テスト内容】: _placed_materialsが空の状態で_update_craft_button_state()を呼び出す
	# 【期待される動作】: 戻り値（disabled状態）がtrueになり、空投入での調合実行を防止する
	# 🟡 信頼性レベル: TASK-0020.md単体テスト要件テストケース1、acceptance-criteria.md TC-101-E01、EDGE-001より

	# 【テストデータ準備】: 画面初期表示直後、または全素材を枠から取り除いた直後を代表する構成
	# 【初期条件設定】: before_eachでbenchは生成済み。_placed_materialsを明示的に空へ設定する
	bench._placed_materials = [] as Array[MaterialInstance]

	# 【実際の処理実行】: ボタン活性状態を算出するロジックを直接呼び出す
	# 【処理内容】: UIノード(craft_button)に依存せず、戻り値としてdisabled状態を取得する
	var disabled = bench._update_craft_button_state()

	# 【結果検証】: 空投入時に非活性（disabled=true）であることを確認する
	# 【期待値確認】: EDGE-001のUI側防御（ボタン非活性化）が機能し、craft([])が呼ばれない安全な状態を保つ
	assert_true(disabled, "投入枠が空のときdisabledがtrueになる") # 【確認内容】: EDGE-001のUI側防御（空投入時の非活性化） 🟡


func test_同一素材を別枠へ重複配置してもplaced_materialsに重複が生じない() -> void:
	# 【テスト目的】: 個体管理された同一在庫アイテムが複数の投入枠に重複配置されないことを確認する
	# 【テスト内容】: 素材A（同一インスタンス）を枠0に配置後、同じ素材Aを枠1に配置しようとする
	# 【期待される動作】: _placed_materials内に素材Aが高々1件しか含まれない（拒否/移動いずれでもよい）
	# 🟡 信頼性レベル: TASK-0020.md単体テスト要件テストケース4、在庫の個体管理（MaterialInstance.idで一意）より妥当な推測

	# 【テストデータ準備】: 二重投入という誤操作（プレイヤーが誤って同じ在庫アイテムを連続タップ）を代表する構成
	# 【初期条件設定】: 投入枠4個を用意し、同一インスタンスの素材Aを用意する
	bench._build_slots(game_state.recipe_slot_count)
	var material_a := _make_material("mat_a", MaterialInstanceScript.Quality.B)

	# 【実際の処理実行】: 素材Aを枠0、続けて枠1へ配置操作する
	# 【処理内容】: 同一idの重複防止ロジックを2回の配置呼び出しで検証する
	bench.place_material(0, material_a)
	bench.place_material(1, material_a)

	# 【結果検証】: _placed_materials内に同一idの要素が高々1件であることを確認する
	# 【期待値確認】: 在庫1個に対し投入2個という物理的にありえない状態が生じないこと
	var count := 0
	for m in bench._placed_materials:
		if m.id == "mat_a":
			count += 1
	assert_eq(count, 1, "同一素材の重複配置操作後も_placed_materials内の出現回数が1件である") # 【確認内容】: 重複配置防止ロジックの正確性 🟡


# ============================================================
# 境界値
# ============================================================

func test_recipe_slot_countが5のとき投入枠が5個生成される() -> void:
	# 【テスト目的】: 工房強化（REQ-102, TASK-0034相当）で枠数が4→5に増える境界での枠生成の正確性を確認する
	# 【テスト内容】: game_state.recipe_slot_count = 5に設定し、bench._build_slots(5)を呼ぶ
	# 【期待される動作】: bench.slots.size()が5になる。TC-3a（4枠）と合わせ、recipe_slot_countの実値に追従する
	# 🔵 信頼性レベル: TASK-0020.md単体テスト要件テストケース3（4個・5個両方確認）、REQ-102・data-model.md（恒久投資で+1）より

	# 【テストデータ準備】: REQ-102「工房強化後は5枠」の上限側の値を代表する構成
	# 【初期条件設定】: recipe_slot_countを5へ上書きする（恒久投資で拡張したプレイヤーの状態を再現）
	game_state.recipe_slot_count = 5

	# 【実際の処理実行】: recipe_slot_countを引数として枠構築ロジックを呼び出す
	# 【処理内容】: _build_slots()がハードコード4ではなくrecipe_slot_countの実値に追従することを検証する
	bench._build_slots(game_state.recipe_slot_count)

	# 【結果検証】: 枠数が拡張後の5と一致することを確認する
	# 【期待値確認】: 初期値4・拡張値5のどちらでも同じロジックで正しい枠数になる（一貫した動作）
	assert_eq(bench.slots.size(), 5, "recipe_slot_count=5のとき投入枠が5個生成される") # 【確認内容】: 枠数拡張境界（REQ-102）での枠生成の正確性 🔵


func test_重複配置操作後も同一idの出現回数が高々1件である() -> void:
	# 【テスト目的】: 同一素材を複数回・複数枠へ配置操作しても投入配列内の同一id出現回数が1件を超えないことを確認する
	# 【テスト内容】: 素材A（同一インスタンス）を枠0・枠1・枠2へと3回連続で配置操作する
	# 【期待される動作】: _placed_materials内でid="mat_a"の要素数が正確に1になる（0でも2でもない）
	# 🟡 信頼性レベル: TC-4の境界強化。個体管理の一意性（MaterialInstance.id）より妥当な推測

	# 【テストデータ準備】: 重複の下限（0件＝未配置）と上限（1件＝配置済み）の境目を、
	#                     複数回操作で越えようとする最も厳しいケース（誤操作の連打を代表）
	# 【初期条件設定】: 投入枠4個を用意し、同一インスタンスの素材Aを用意する
	bench._build_slots(game_state.recipe_slot_count)
	var material_a := _make_material("mat_a", MaterialInstanceScript.Quality.B)

	# 【実際の処理実行】: 同一素材を枠0→枠1→枠2へと3回連続で配置操作する
	# 【処理内容】: 何度配置操作を繰り返しても投入は1件に収束することをTC-4の境界強化として検証する
	bench.place_material(0, material_a)
	bench.place_material(1, material_a)
	bench.place_material(2, material_a)

	# 【結果検証】: 3回操作しても投入配列内の同一id出現回数が1件に収束することを確認する
	# 【期待値確認】: 個体一意性の不変条件（同一idは投入配列内に高々1件）が連続操作でも破られないこと
	var count := 0
	for m in bench._placed_materials:
		if m.id == "mat_a":
			count += 1
	assert_eq(count, 1, "3回連続配置操作後も同一id出現回数が1件である") # 【確認内容】: 重複防止の上限（1件）が連続操作でも破られない 🟡


func test_配置数が0から1に増える境界でdisabledがtrueからfalseへ切り替わる() -> void:
	# 【テスト目的】: 投入素材数0↔1の境界でボタン活性状態が可逆に切り替わることを確認する
	# 【テスト内容】: (1)空状態 → (2)素材1個配置 → (3)配置した素材を解除、の3段階で_update_craft_button_state()を呼ぶ
	# 【期待される動作】: (1)disabled=true (2)disabled=false (3)disabled=true と可逆に切り替わる
	# 🟡 信頼性レベル: TC-1（EDGE-001）・TC-2（活性化）の境界統合。TASK-0020.md単体テスト要件より妥当な推測

	# 【テストデータ準備】: EDGE-001の成立/不成立を分ける唯一の境界（素材0個 vs 1個）を段階的に検証する
	# 【初期条件設定】: (1)空状態から開始する
	bench._placed_materials = [] as Array[MaterialInstance]
	var disabled_empty = bench._update_craft_button_state()

	# 【実際の処理実行】: (2)素材1個を配置した状態で再度呼び出す
	# 【処理内容】: 配置操作直後にボタン状態が追従することを検証する
	var material_a := _make_material("mat_a", MaterialInstanceScript.Quality.B)
	bench._placed_materials = [material_a] as Array[MaterialInstance]
	var disabled_one = bench._update_craft_button_state()

	# 【実際の処理実行】: (3)配置した素材を解除した状態で再度呼び出す
	# 【処理内容】: 解除操作直後にボタン状態が再び非活性へ戻ることを検証する
	bench._placed_materials = [] as Array[MaterialInstance]
	var disabled_removed = bench._update_craft_button_state()

	# 【結果検証】: 0件→1件→0件の各段階で正しい真偽値になることを確認する
	# 【期待値確認】: 配置・解除の双方向で境界（0/1）が正しく機能する一貫した動作
	assert_true(disabled_empty, "(1)0件のときdisabledがtrueである") # 【確認内容】: 境界の下限側（不可）の正確性 🟡
	assert_false(disabled_one, "(2)1件のときdisabledがfalseである") # 【確認内容】: 境界の上限側（可）の正確性 🟡
	assert_true(disabled_removed, "(3)解除後に再びdisabledがtrueへ戻る") # 【確認内容】: 可逆性（双方向追従）の確認 🟡
