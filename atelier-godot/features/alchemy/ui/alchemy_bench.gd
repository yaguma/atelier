## TASK-0020: AlchemyBench UI実装（調合台画面）
##
## 【機能概要】: 調合台画面。在庫の素材を限られた投入枠（GameState.recipe_slot_count）へ
## 　　　　　　 配置・解除し、調合実行ボタンでGameState.craft()を呼び出し、
## 　　　　　　 item_craftedシグナルで受け取ったCraftResultをそのまま結果表示に反映する。
## 【実装方針（Redフェーズ）】: 各メソッドは未実装スタブ（pass）。Greenフェーズで実装する。
## 【アーキテクチャ制約（最重要・Warning#2）】: 本スクリプトは「投入枠の選択操作」と
## 　　　　　　 「GameStateが発行するsignalの購読・そのままの結果表示」のみを担う、
## 　　　　　　 Imperative Shell（操作UI）側の薄い実装である。
## 　　　　　　 品質計算・特性発現判定・貢献度/報酬算出のロジックは一切持たない。
## 　　　　　　 投入素材はGameState.craft()へ無加工で渡し、CraftResultは再計算・補正せず
## 　　　　　　 そのまま保持する（architecture.md「Godotアーキテクトレビュー Warning#2対応」）。
## 　　　　　　 ⚠️ 将来の注意: 「ここで簡単な合計や補正を出せば手っ取り早い」という誘惑に
## 　　　　　　 負けてUI内に計算ロジックを書き足さないこと。品質・特性・報酬計算はすべて
## 　　　　　　 Functional Core（AlchemyResolver / GameState.craft()）の責務であり、
## 　　　　　　 UI側に計算を持たせるとロジックの二重管理・Warning#2回帰（TC-5, TC-6）を招く。
## 【DI設計】: GameStateはAutoload未登録のため、set_game_state()セッターでインスタンスを
## 　　　　　　 注入する。未登録の理由は game_state.gd 側の設計判断（class_name GameStateを
## 　　　　　　 同名でAutoload登録すると、グローバル識別子`GameState`がクラスではなく
## 　　　　　　 シングルトンノードを指すようになり、GUTテストの`preload().new()`パターンが
## 　　　　　　 `Invalid call. Nonexistent function 'new' in base 'GDScript'`で失敗するため）
## 　　　　　　 に由来する（TASK-0019 game-state-craft-refactor-phase.md 2-4節を参照）。
## 　　　　　　 本UI側もこれに合わせ、Autoloadへの直接参照ではなくセッターDIを採用することで、
## 　　　　　　 GUTテストごとに独立したGameStateインスタンス（本番用/テスト専用ダミー）を
## 　　　　　　 注入可能にし、UIノード（Button/ItemList等）への直接依存を避けている。
## 　　　　　　 これにより_update_craft_button_state()の戻り値やslots/_placed_materials等の
## 　　　　　　 内部状態を直接検証できる設計とし、単体テスト容易性を担保する。
## 【テスト対応】: alchemy-bench-testcases.md TC-1, TC-2, TC-3a, TC-3b, TC-4, TC-4b, TC-5, TC-6, TC-1b/2b
## 【段階的開示との責務分離（申し送り）】: Gランクでの特性非表示（REQ-121, NFR-201）や
## 　　　　　　 Eランク以降の解禁表示（REQ-122）は本タスクのスコープ外。TASK-0037が
## 　　　　　　 reveal_levelに応じた表示制御（例: _update_trait_visibility()）を本ファイルに
## 　　　　　　 追記する前提のため、特性表示関連のロジックを追加する際は独立した関数として
## 　　　　　　 切り出し、TASK-0037が円滑に拡張できる構造を保つこと。
## 🔵 信頼性レベル: alchemy-bench-requirements.md・alchemy-bench-testcases.mdに基づく
class_name AlchemyBench
extends Control

## 【投入枠一覧】: _build_slots()が構築する投入枠の状態を保持する配列。
## 　　各要素は空枠を表すnull、または配置済みのMaterialInstanceを想定する 🟡
var slots: Array = []

## 【投入済み素材】: 投入枠に配置された素材を順序通りに保持する。
## 　　GameState.craft()へ無加工で渡す対象であり、UI側で並び替え・複製・加工しない（Warning#2） 🔵
var _placed_materials: Array[MaterialInstance] = []

## 【DI注入されるGameStateインスタンス】: Autoload未登録のためset_game_state()で受け取る。
## 　　Autoload未登録である理由はファイル冒頭コメント【DI設計】節を参照 🔴
var _game_state = null

## 【直近の調合結果】: item_crafted受信時にCraftResultをそのまま保持する。
## 　　UI側で再計算・補正は行わない（Warning#2の結果表示側の境界） 🟡
## 【段階的開示(reveal_level)との関係】: CraftResult.activated_traitsはGameState.craft()内部の
## 　　TraitActivation.resolve_activated_traits()がreveal_level（Gランク非表示・Eランク以降解禁）で
## 　　既にフィルタ済みの値である（features/alchemy/logic/trait_activation.gd参照）。そのため
## 　　last_resultをそのまま表示に使う限り、本スクリプト側でreveal_levelによる追加フィルタは
## 　　不要であり、行わない方針とする 🟡
var last_result: CraftResult = null


## 【機能概要】: GameStateインスタンスをDI注入する
## 【実装方針】: Autoloadグローバル参照に依存せず、テスト専用インスタンスも注入可能にする。
## 　　GameStateがAutoload未登録である理由（class_nameとAutoload名の衝突によるGUTテスト
## 　　失敗の回避）はファイル冒頭コメント【DI設計】節を参照
## 🔵 信頼性レベル: alchemy-bench-testcases.md「0. 前提」DI注入方針に基づく
## @param gs - 注入するGameStateインスタンス（本番はAutoloadインスタンス、テストは専用インスタンス）
func set_game_state(gs) -> void:
	_game_state = gs


## 【機能概要】: ノードがシーンツリーに追加された際の初期化処理
## 【実装方針（Greenフェーズ）】: _game_stateが注入済み（非null）の場合のみ、
## 　　投入枠構築とitem_craftedシグナル購読を行う。注入前にGameStateへアクセスして
## 　　クラッシュしないようガードする
## 🟡 信頼性レベル: alchemy-bench-testcases.md「初期化順序」の記述より妥当な推測
func _ready() -> void:
	if _game_state == null:
		return  # 【注入前ガード】: set_game_state()前は何もしない 🟡

	# 【投入枠構築】: GameState.recipe_slot_countを唯一の情報源として枠を構築する 🔵
	_build_slots(_game_state.recipe_slot_count)
	# 【シグナル購読】: item_crafted受信時に結果をそのまま保持するハンドラを接続する 🔵
	_game_state.item_crafted.connect(_on_item_crafted)


## 【機能概要】: 投入枠数を構築する
## 【実装方針（Greenフェーズ）】: countの値のみを情報源としてslotsをリセットし、
## 　　count個の空枠（null）で再構築する。ハードコードされた枠数は用いない（TC-3a, TC-3b）
## 🔵 信頼性レベル: alchemy-bench-testcases.md TC-3a/TC-3bに基づく
## @param count - 構築する投入枠数（GameState.recipe_slot_countの値）
func _build_slots(count: int) -> void:
	# 【枠リセット】: 再呼び出し時（枠数変更等）に古い枠状態を引き継がないようクリアする 🔵
	slots = []
	# 【枠生成】: count個の空枠を生成する。空枠はnullで表現する 🟡
	for i in range(count):
		slots.append(null)


## 【機能概要】: 投入枠の指定インデックスへ素材を配置する
## 【実装方針（Greenフェーズ）】: 同一MaterialInstance（同一参照）が既に_placed_materialsへ
## 　　配置済みの場合は重複配置を拒否する（TC-4, TC-4b）。指定枠が既に別素材で埋まっていた
## 　　場合は、その素材を_placed_materialsから取り除いてから新しい素材を配置する（枠の入れ替え）
## 🟡 信頼性レベル: alchemy-bench-testcases.md TC-4/TC-4bより妥当な推測（設計文書に明記なし）
## @param slot_index - 配置先の枠インデックス
## @param material - 配置する素材個体
## @return 配置に成功したか
func place_material(slot_index: int, material: MaterialInstance) -> bool:
	# 【範囲外ガード】: 不正な枠インデックスは配置失敗として扱う 🟡
	if slot_index < 0 or slot_index >= slots.size():
		return false

	# 【重複配置防止】: 同一参照の素材が既に他の枠へ配置済みなら拒否する（TC-4, TC-4b） 🟡
	if _placed_materials.has(material):
		return false

	# 【枠の入れ替え】: 指定枠が既に埋まっていた場合、旧素材を投入済み一覧から取り除く 🟡
	var previous: MaterialInstance = slots[slot_index]
	if previous != null:
		var previous_index := _placed_materials.find(previous)
		if previous_index != -1:
			_placed_materials.remove_at(previous_index)

	# 【配置確定】: 枠状態と投入済み一覧の両方へ反映する 🟡
	slots[slot_index] = material
	_placed_materials.append(material)
	return true


## 【機能概要】: 調合実行ボタンの活性/非活性状態を算出する
## 【実装方針（Greenフェーズ）】: _placed_materialsが空か否かのみでdisabled状態を算出する。
## 　　UIノード（craft_button）への直接依存を避けるため、戻り値として返す設計とする
## 🟡 信頼性レベル: alchemy-bench-testcases.md TC-1/TC-2/TC-1b・2bより妥当な推測（TC-101-E01の裏返し）
## @return 空投入ならtrue（非活性）、1件以上ならfalse（活性）
func _update_craft_button_state() -> bool:
	# 【空判定】: EDGE-001（空投入で調合不成立）に対応する唯一の判定条件 🟡
	return _placed_materials.is_empty()


## 【機能概要】: 調合実行ボタン押下時のハンドラ
## 【実装方針（Greenフェーズ）】: _game_state.craft(_placed_materials)を順序・個数・
## 　　同一参照を改変せずそのまま呼び出す（Warning#2境界。TC-5で回帰防止）。
## 　　UI側での加工・計算（ソート・フィルタ・複製・要素追加削除）は一切行わない
## 🟡 信頼性レベル: alchemy-bench-testcases.md TC-5、architecture.md Warning#2対応より妥当な推測
func _on_craft_pressed() -> void:
	if _game_state == null:
		return  # 【未注入ガード】: GameState未注入時は何もしない 🟡

	# 【無加工委譲】: 投入済み配列をそのまま渡す。UI側での計算・加工は行わない（Warning#2境界） 🔵
	_game_state.craft(_placed_materials)


## 【機能概要】: GameState.item_craftedシグナル受信時のハンドラ
## 【実装方針（Greenフェーズ）】: resultをそのままlast_resultへ保持する（再計算・補正禁止。
## 　　Warning#2の結果表示側の境界。TC-6で回帰防止）
## 🟡 信頼性レベル: alchemy-bench-testcases.md TC-6より妥当な推測
## @param result - GameState.craft()が発行したCraftResult
func _on_item_crafted(result) -> void:
	# 【無加工保持】: 受信したCraftResultの値をそのまま保持し、再計算・補正は行わない 🔵
	last_result = result
