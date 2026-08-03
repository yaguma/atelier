## TASK-0019: GameState.craft()連携実装（Imperative Shell）
##
## 【機能概要】: GameState Autoload（Imperative Shell）に、Functional Coreである
## 　　　　　　 AlchemyResolver.craft()を呼び出すcraft()メソッドを実装する。
## 　　　　　　 自身が保持する状態（current_rank.trait_reveal_level・today_request・
## 　　　　　　 current_recipe・trait_definitions）を引数として純粋関数へ渡し、
## 　　　　　　 戻り値CraftResultを用いて在庫・ランクHP・ゴールドを更新し、
## 　　　　　　 item_craftedシグナルを発行する。
## 【Greenフェーズ注記】: craft()/_consume_materials()はGreenフェーズで実装済み。
## 　　　　　　 tests/unit/autoload/game_state_test.gd・
## 　　　　　　 tests/integration/autoload/game_state_craft_integration_test.gd の
## 　　　　　　 全ケースがPASSする状態が正しい。
## 【アーキテクチャ制約（最重要・Refactorフェーズで再明記）】:
## 　　　　　　 GameState.craft()はImperative Shellであり、
## 　　　　　　 「①状態読み取り（current_rank/today_request/current_recipe/trait_definitions）
## 　　　　　　 　→ ②純粋関数(AlchemyResolver.craft())へ引数として渡す
## 　　　　　　 　→ ③戻り値(CraftResult)を用いた状態更新
## 　　　　　　 　→ ④シグナル発行」の4ステップのみを行う。
## 　　　　　　 品質計算・特性発現判定・系統排他・貢献度/報酬算出などの計算ロジックは
## 　　　　　　 一切ここに書かず、必ずAlchemyResolver.craft()（Functional Core, static func）
## 　　　　　　 に委譲すること（architecture.md「Warning#2対応」）。
## 　　　　　　 この境界を破る変更（craft()内でのif分岐によるボーナス計算追加等）は
## 　　　　　　 TC-101-B01（AlchemyResolver直接呼び出し結果との完全一致検証）で検知される。
## 【テスト対応】: game-state-craft-testcases.md TC-101-N01〜N03・E01・B01〜B02（単体）、
## 　　　　　　 TC-101-I01（統合）
## 🔵 信頼性レベル: docs/implements/atelier-alchemy-core/TASK-0019/
## 　　　　　　 game-state-craft-requirements.md・game-state-craft-testcases.md に基づく
##
## 【申し送り: dataflow.mdとの責務分担の不整合（Phase 4着手前に要確定）】 🔴:
## 　　　　　　 docs/design/atelier-alchemy-core/dataflow.md の「機能2: 調合」シーケンス図
## 　　　　　　 （96-101行目）は craft() 内で consume_materials + item_crafted発行のみを行い、
## 　　　　　　 rank_hp/gold更新は別シーケンス「機能3: ギルド納品」
## 　　　　　　 （item_crafted購読 → DeliveryCalculator.check_daily_request_match() →
## 　　　　　　 　合致ボーナス適用 → rank_hp/gold更新）に分離する設計になっている。
## 　　　　　　 一方 docs/design/atelier-alchemy-core/data-model.md は craft() 単体で
## 　　　　　　 rank_hp/gold更新まで完結させる契約を記載しており、本実装は
## 　　　　　　 data-model.md 側を採用した（note.md「dataflow.mdとの責務分担の不整合」参照）。
## 　　　　　　 現状は AlchemyResolver.craft() 内に today_request を渡して合致ボーナスを
## 　　　　　　 織り込み済み（DeliveryCalculatorへの分離ステップは未実装）であるため、
## 　　　　　　 dataflow.mdの「機能3」を後から追加すると二重計算になるリスクがある。
## 　　　　　　 Phase 4（ギルド納品機能）着手前に、rank_hp/gold更新をcraft()単体で完結させるか
## 　　　　　　 別ステップ（DeliveryCalculator経由）に委ねるかを設計レベルで確定すること。
##
## 【設計判断: project.godotへのAutoload登録を見送った理由】 🔴:
## 　　　　　　 `class_name GameState` を持つ本スクリプトをそのまま同名で
## 　　　　　　 `project.godot` の `[autoload]` セクションに登録すると、グローバル識別子
## 　　　　　　 `GameState` がクラス（GDScript）ではなくAutoloadシングルトンの
## 　　　　　　 ノードインスタンスを指すようになる（Godotの既知の挙動）。その結果、
## 　　　　　　 テスト側の `preload("res://autoload/game_state.gd").new()` が
## 　　　　　　 「Invalid call. Nonexistent function 'new' in base 'GDScript'」で失敗し、
## 　　　　　　 テスト専用インスタンスを生成できなくなる。
## 　　　　　　 現行のテスト（game_state_test.gd等）は `preload().new()` +
## 　　　　　　 `add_child_autofree()` でテスト専用インスタンスを生成する方式を採っており、
## 　　　　　　 Autoload登録がなくても支障がないため、本タスクでは意図的に登録を見送った。
## 　　　　　　 UI層（TASK-0020以降）が `GameState` をAutoload経由（シングルトン参照）で
## 　　　　　　 利用する必要が生じた時点で、登録方法（別名でのAutoload登録、または
## 　　　　　　 DIコンテナ経由の参照渡し等）を改めて設計レベルで検討すること
## 　　　　　　 （詳細: docs/implements/atelier-alchemy-core/TASK-0019/
## 　　　　　　 game-state-craft-red-phase.md「4. 設計判断」）。
extends Node
class_name GameState

## 【シグナル】: 調合成功時にCraftResultを通知する（data-model.md シグナル定義） 🔵
signal item_crafted(result: CraftResult)

## 【シグナル】: 在庫変更時に通知する（_consume_materials内で発行。note.md実装例より） 🟡
signal inventory_updated()

## 【現在ランク】: trait_reveal_levelの供給元。RankDefinition未実装のためDuck typing想定 🟡
var current_rank

## 【ランクHP】: 貢献度分を減算される対象（craft()内で- = round(contribution)） 🔵
var rank_hp: int = 0

## 【ゴールド】: 報酬分を加算される対象（craft()内で += round(reward)）。初期値0 🔵
var gold: int = 0

## 【素材在庫】: 投入素材の消費対象。_consume_materialsが操作する 🔵
var inventory: Array[MaterialInstance] = []

## TASK-0020: AlchemyBench UI実装向けに追加
## 【投入枠数】: 調合台の投入枠数。初期値4（REQ-101）。工房強化（TASK-0034相当）で+1され
## 　　　　　　 5枠になる。data-model.md `GameState.recipe_slot_count` に対応し、
## 　　　　　　 `RecipeDefinition.slot_count`（レシピ側の初期値4）とは別管理とする
## 　　　　　　 （実装時にTASK-0034/0019との整合を要確認。alchemy-bench-requirements.md 0.節）
## 🔵 信頼性レベル: data-model.md GameState.recipe_slot_count（初期値4、恒久投資で+1）に基づく
var recipe_slot_count: int = 4

## 【本日の依頼】: 指定合致ボーナス判定用。DailyRequest未実装のためDuck typing想定 🟡
var today_request

## 【現在レシピ】: 貢献度/報酬の基礎値算出に使用（TASK-0018拡張引数） 🟡
## 【申し送り: 読み込みタイミング未確定】 🔴: data-model.mdにはcurrent_recipeの
## 　　　　　　 読み込みタイミング（いつ・どこで.tresファイルから読み込むか）の記載がない。
## 　　　　　　 本実装（craft()）は「起動時に一括読み込み済みでこのフィールドに
## 　　　　　　 セット済み」であることを前提として、ここから値を読み取るのみを行う。
## 　　　　　　 実際のロード処理（MasterDataRepository等からの.tres読み込み）は
## 　　　　　　 本タスクのスコープ外であり、別タスクでの依存関係再確認が必要。
var current_recipe: RecipeDefinition

## 【特性マスタ】: 特性系統判定のためのマスターデータ（ID→TraitDefinition） 🟡
## 【申し送り: 読み込みタイミング未確定】 🔴: current_recipeと同様、data-model.mdに
## 　　　　　　 trait_definitionsの読み込みタイミングの記載がなく、起動時一括読み込み済みを
## 　　　　　　 前提としている（note.md「マスターデータ読み込み」参照）。ロード処理自体の
## 　　　　　　 実装・依存関係の確定は別タスクで対応すること。
var trait_definitions: Dictionary = {}


## TASK-0020: AlchemyBench UI実装向けに追加
## 【機能概要】: 在庫一覧を取得する薄いアクセサ。AlchemyBench UIが在庫参照に用いる
## 【実装方針】: inventoryフィールドをそのまま返すのみで、計算・加工・フィルタリングは
## 　　　　　　 一切行わない（Imperative Shell/Functional Coreの境界を侵さない）
## 🔵 信頼性レベル: dataflow.md「UI->>GS: get_inventory()」呼び出しに基づく
func get_inventory() -> Array[MaterialInstance]:
	return inventory


## 【機能概要】: 投入素材からAlchemyResolver.craft()を呼び出し、結果を状態へ反映する
## 【実装方針】: Imperative Shellとして「状態読み取り→純粋関数へ委譲→状態更新→シグナル発行」
## 　　　　　　 のみを行う。品質計算・特性発現判定・貢献度/報酬算出はすべて
## 　　　　　　 AlchemyResolver.craft()（Functional Core）に委譲し、本メソッドは
## 　　　　　　 計算ロジックを一切持たない（architecture.md「Warning#2対応」）。
## 【テスト対応】: TC-101-N01/N02/N03（正常系）、TC-101-E01（EDGE-001）、
## 　　　　　　 TC-101-B01/B02（構造・境界）、TC-101-I01（統合）
## 🔵 信頼性レベル: game-state-craft-requirements.md・testcases.md・note.md「実装詳細」に基づく
## @param materials - 投入素材（0〜5枠）。空の場合はEDGE-001ガード対象
func craft(materials: Array[MaterialInstance]) -> void:
	# 【純粋関数への委譲】: 状態（current_rank/today_request/current_recipe/trait_definitions）を
	# 　引数として渡し、計算そのものはAlchemyResolver側に完全委譲する 🔵
	var result: CraftResult = AlchemyResolver.craft(
		materials,
		current_rank.trait_reveal_level,
		today_request,
		current_recipe,
		trait_definitions,
	)

	# 【EDGE-001ガード】: 投入枠が空等でnullが返った場合は状態変更・シグナル発行を
	# 　一切行わずに即returnする（TC-101-E01: 無副作用の安全契約） 🔵
	if result == null:
		return

	# 【在庫消費】: 投入素材のみをinventoryから除去する（TC-101-N01） 🔵
	_consume_materials(materials)
	# 【ランクHP更新】: 貢献度分を減算する。丸めはint(round())で四捨五入（TC-101-N02） 🔵
	rank_hp -= int(round(result.contribution))
	# 【ゴールド更新】: 報酬分を加算する。丸めはint(round())で四捨五入（TC-101-N02） 🔵
	gold += int(round(result.reward))
	# 【シグナル発行】: 調合成功をCraftResultとともに1回だけ通知する（TC-101-N03） 🔵
	item_crafted.emit(result)


## 【機能概要】: 投入素材と一致する在庫個体をinventoryから除去する
## 【実装方針】: 同一インスタンス参照でinventory内を検索し、見つかった要素のみ除去する。
## 　　　　　　 同一idの別個体を誤って消費しないよう、参照一致（find）を用いる。
## 【テスト対応】: TC-101-N01（過剰消費・過少消費が起きないことの確認）
## 🔵 信頼性レベル: note.md「_consume_materials()ヘルパー」実装例に基づく
## @param materials - 消費対象の素材（inventory内の同一インスタンス参照）
func _consume_materials(materials: Array[MaterialInstance]) -> void:
	# 【個別除去】: 投入素材ごとにinventory内の同一参照を検索し除去する 🔵
	for material in materials:
		var index := inventory.find(material)
		if index != -1:
			inventory.remove_at(index)
	# 【在庫変更通知】: 在庫が変化したことを購読者へ通知する 🟡
	inventory_updated.emit()
