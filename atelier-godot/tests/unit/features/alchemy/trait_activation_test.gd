extends GutTest
# TASK-0014: TraitActivation.resolve_activated_traits（特性発現判定ロジック）のユニットテスト
# 対象: features/alchemy/logic/trait_activation.gd（未実装。Redフェーズ用）
# 参照: docs/implements/atelier-alchemy-core/TASK-0014/trait-activation-testcases.md
#
# 【備考】: TraitActivationは純粋関数(static func)のみで構成されるためインスタンス生成は不要。
#          各テストはtrait_defs辞書とMaterialInstance配列を組み立てて完結する。

const TraitActivationScript := preload("res://features/alchemy/logic/trait_activation.gd")
const MaterialInstanceScript := preload("res://features/alchemy/data/material_instance.gd")
const TraitDefinitionScript := preload("res://features/alchemy/data/trait_definition.gd")

var trait_defs: Dictionary


func before_each() -> void:
	# 【テスト前準備】: 各テストで参照する特性マスターデータを毎回クリーンに構築する
	# 【環境初期化】: 前テストの状態を持ち越さないため before_each で再生成する
	trait_defs = {}
	trait_defs[&"holy"] = _make_trait(&"holy", "聖", TraitDefinitionScript.Category.CONTRIBUTION, &"E")
	trait_defs[&"cleanse"] = _make_trait(&"cleanse", "浄", TraitDefinitionScript.Category.CONTRIBUTION, &"E")
	trait_defs[&"heal"] = _make_trait(&"heal", "癒", TraitDefinitionScript.Category.CONTRIBUTION, &"E")
	trait_defs[&"gold"] = _make_trait(&"gold", "金", TraitDefinitionScript.Category.REWARD, &"E")
	# 【TASK-0015追加】: 補助系（SUPPORT）の排他対象外検証に使う特性を追加する
	trait_defs[&"catalyst"] = _make_trait(&"catalyst", "触媒", TraitDefinitionScript.Category.SUPPORT, &"E")


# 【ヘルパー】: TraitDefinition マスターデータを1件生成するファクトリ
func _make_trait(p_id: StringName, p_name: String, p_cat: int, p_rank: StringName) -> TraitDefinition:
	var t := TraitDefinitionScript.new()
	t.id = p_id
	t.display_name = p_name
	t.category = p_cat
	t.min_rank_to_reveal = p_rank
	return t


# 【ヘルパー】: 指定した特性タグを持つ素材個体を生成する（qualityは判定に無関係なのでA固定）
func _make_material(trait_ids: Array[StringName]) -> MaterialInstance:
	return MaterialInstanceScript.new("", MaterialInstanceScript.Quality.A, trait_ids)


# ============================================================
# 正常系
# ============================================================

func test_同一特性タグ2個の投入で特性が発現候補に含まれる() -> void:
	# 【テスト目的】: 同一特性タグ2個で発現候補に含まれることを確認する
	# 【テスト内容】: 「聖」2個＋無特性2個、reveal_level=1 で resolve_activated_traits を実行
	# 【期待される動作】: 「聖」の TraitDefinition が1件だけ返る
	# 🔵 信頼性: acceptance-criteria.md TC-101-02 / REQ-106

	# 【テストデータ準備】: 閾値ちょうど(2個)の「聖」と、発現に寄与しない無特性2個を用意
	# 【初期条件設定】: reveal_level=1（Eランク相当）で貢献度系が解禁されている状態
	var materials: Array[MaterialInstance] = [
		_make_material([&"holy"] as Array[StringName]),
		_make_material([&"holy"] as Array[StringName]),
		_make_material([] as Array[StringName]),
		_make_material([] as Array[StringName]),
	]

	# 【実際の処理実行】: 特性発現判定の純粋関数を呼び出す
	# 【処理内容】: traits集計 → 閾値(2)判定 → reveal_levelフィルタ → TraitDefinition解決
	var result: Array[TraitDefinition] = TraitActivationScript.resolve_activated_traits(materials, 1, trait_defs)

	# 【結果検証】: 発現件数と発現特性IDを検証する
	assert_eq(result.size(), 1, "同一特性2個で発現候補が1件になる") # 【確認内容】: 発現件数 🔵
	assert_eq(result[0].id, &"holy", "発現した特性IDが「聖」である") # 【確認内容】: 発現特性の同一性 🔵


func test_reveal_level1で貢献度系特性が発現する() -> void:
	# 【テスト目的】: reveal_level>=1 のとき貢献度系（CONTRIBUTION）特性が解禁され発現することを確認する
	# 【テスト内容】: 「聖」2個、reveal_level=1 で resolve_activated_traits を実行
	# 【期待される動作】: 段階的開示フィルタを通過し、閾値を満たした貢献度系特性が返る
	# 🔵 信頼性: acceptance-criteria.md TC-121-02 / REQ-122

	# 【テストデータ準備】: 貢献度系「聖」を閾値ちょうど満たす最小構成を用意
	var materials: Array[MaterialInstance] = [
		_make_material([&"holy"] as Array[StringName]),
		_make_material([&"holy"] as Array[StringName]),
	]

	# 【実際の処理実行】: reveal_level=1 で特性発現判定を実行
	var result: Array[TraitDefinition] = TraitActivationScript.resolve_activated_traits(materials, 1, trait_defs)

	# 【結果検証】: 「聖」が発現候補に含まれることを確認する
	assert_true(result.size() >= 1, "reveal_level=1で貢献度系特性が発現候補に含まれる") # 【確認内容】: 発現件数の下限 🔵
	var ids: Array = []
	for t in result:
		ids.append(t.id)
	assert_true(ids.has(&"holy"), "発現候補に「聖」が含まれる") # 【確認内容】: 貢献度系特性の含有 🔵


func test_同一系統内で複数特性が同時発現候補になる() -> void:
	# 【テスト目的】: 系統排他ではなく、閾値を満たした複数特性がすべて同時に返ることを確認する
	# 【テスト内容】: 「聖」2個+「浄」2個（ともに貢献度系）、reveal_level=1 で実行
	# 【期待される動作】: 「聖」「浄」の両方のTraitDefinitionが返る（系統内は排他しない）
	# 🔵 信頼性: acceptance-criteria.md TC-101-06 / REQ-112

	# 【テストデータ準備】: 貢献度系の異なる2特性がそれぞれ2個ずつの投入枠4枠構成
	var materials: Array[MaterialInstance] = [
		_make_material([&"holy"] as Array[StringName]),
		_make_material([&"holy"] as Array[StringName]),
		_make_material([&"cleanse"] as Array[StringName]),
		_make_material([&"cleanse"] as Array[StringName]),
	]

	# 【実際の処理実行】: reveal_level=1 で特性発現判定を実行
	var result: Array[TraitDefinition] = TraitActivationScript.resolve_activated_traits(materials, 1, trait_defs)

	# 【結果検証】: 件数が2であること、順序に依存せず両IDが含まれることを確認する
	assert_eq(result.size(), 2, "同一系統内で複数特性が同時発現候補になる") # 【確認内容】: 発現件数 🔵
	var ids: Array = []
	for t in result:
		ids.append(t.id)
	assert_true(ids.has(&"holy"), "発現候補に「聖」が含まれる") # 【確認内容】: 「聖」の含有 🔵
	assert_true(ids.has(&"cleanse"), "発現候補に「浄」が含まれる") # 【確認内容】: 「浄」の含有 🔵


# ============================================================
# 異常系（不発・退化入力のハンドリング）
# ============================================================

func test_同一特性が1個のみのとき発現しない() -> void:
	# 【テスト目的】: 閾値(2)未満の出現回数では発現候補に含めてはならないことを確認する
	# 【テスト内容】: 「聖」1個＋無特性3個、reveal_level=1 で実行
	# 【期待される動作】: 戻り値が空配列（発現しない）
	# 【エラー処理の重要性】: 誤って1個で発現するとゲームの戦略性（2個揃える工夫）が崩れる
	# 🔵 信頼性: acceptance-criteria.md TC-101-03 / REQ-106

	# 【テストデータ準備】: 「聖」の出現回数=1で閾値未満の構成を用意
	var materials: Array[MaterialInstance] = [
		_make_material([&"holy"] as Array[StringName]),
		_make_material([] as Array[StringName]),
		_make_material([] as Array[StringName]),
		_make_material([] as Array[StringName]),
	]

	# 【実際の処理実行】: reveal_level=1 で特性発現判定を実行
	var result: Array[TraitDefinition] = TraitActivationScript.resolve_activated_traits(materials, 1, trait_defs)

	# 【結果検証】: 閾値未満は空配列で「発現なし」を表現することを確認する
	assert_eq(result.size(), 0, "同一特性1個のみでは不発（空配列）") # 【確認内容】: 閾値未満の除外 🔵


func test_reveal_level0では閾値を満たしても発現しない() -> void:
	# 【テスト目的】: reveal_level=0（Gランク相当）ではどんな構成でも特性を発現させてはならないことを確認する
	# 【テスト内容】: 「聖」2個（閾値を満たす構成）、reveal_level=0 で実行
	# 【期待される動作】: 戻り値が空配列（reveal_levelフィルタが最優先で効く）
	# 【エラー処理の重要性】: Gランクは「品質のみで評価」する設計。特性が漏れると初期難易度設計が崩れる
	# 🔵 信頼性: acceptance-criteria.md TC-121-01 / REQ-121

	# 【テストデータ準備】: 閾値を満たす「聖」2個を用意（reveal_levelのみが不発の要因になる構成）
	var materials: Array[MaterialInstance] = [
		_make_material([&"holy"] as Array[StringName]),
		_make_material([&"holy"] as Array[StringName]),
	]

	# 【実際の処理実行】: reveal_level=0 で特性発現判定を実行
	var result: Array[TraitDefinition] = TraitActivationScript.resolve_activated_traits(materials, 0, trait_defs)

	# 【結果検証】: reveal_levelフィルタが閾値判定より最優先で効くことを確認する
	assert_eq(result.size(), 0, "reveal_level=0では常に空配列") # 【確認内容】: 非開示フィルタの最優先性 🔵


func test_reveal_level0なら未解禁特性が混入しても発現しない() -> void:
	# 【テスト目的】: 庭・ショップ側の入手制限が漏れても、ロジック側で二重に発現を防止できることを確認する
	# 【テスト内容】: reveal_level=0の状態で、本来入手できないはずの特性付き素材が投入枠に存在するケース
	# 【期待される動作】: どの特性であっても戻り値が空配列（reveal_levelフィルタが最優先）
	# 【エラー処理の重要性】: UI表示制御だけに依存しない「二重の安全策」をロジック層で担保する
	# 🟡 信頼性: architecture.md「非機能要件の実現方法／ユーザビリティ（二重の安全策）」より

	# 【テストデータ準備】: 閾値を満たす特性付き素材（想定外の混入シナリオ）を用意
	var materials: Array[MaterialInstance] = [
		_make_material([&"holy"] as Array[StringName]),
		_make_material([&"holy"] as Array[StringName]),
		_make_material([&"cleanse"] as Array[StringName]),
		_make_material([&"cleanse"] as Array[StringName]),
	]

	# 【実際の処理実行】: reveal_level=0 で特性発現判定を実行
	var result: Array[TraitDefinition] = TraitActivationScript.resolve_activated_traits(materials, 0, trait_defs)

	# 【結果検証】: 入手制限漏れがあってもロジック側で二重に防止できることを確認する
	assert_eq(result.size(), 0, "reveal_level=0では入手制限漏れの特性素材があっても空配列") # 【確認内容】: 二重の安全策 🟡


func test_空の素材配列で空配列を返す() -> void:
	# 【テスト目的】: 投入素材が1個もない退化入力でも例外を投げず安全に空配列を返すことを確認する
	# 【テスト内容】: materials=[]、reveal_level=1 で実行
	# 【期待される動作】: 戻り値が空配列、クラッシュしない
	# 【実際の発生シナリオ】: 調合前の初期状態や、素材未選択での誤呼び出し
	# 🔵 信頼性: 要件定義書「入力パラメータ: materials … 空配列可」に明記

	# 【テストデータ準備】: 空のArray[MaterialInstance]を用意する
	var materials: Array[MaterialInstance] = []

	# 【実際の処理実行】: 空配列で特性発現判定を実行
	var result: Array[TraitDefinition] = TraitActivationScript.resolve_activated_traits(materials, 1, trait_defs)

	# 【結果検証】: 空入力でも決定論的に空配列を返すことを確認する
	assert_eq(result.size(), 0, "空配列投入時は空配列を返す（クラッシュしない）") # 【確認内容】: 退化入力への堅牢性 🔵


func test_全て無特性素材のとき空配列を返す() -> void:
	# 【テスト目的】: どの素材も特性を持たない構成で集計結果が空でも例外なく空配列を返すことを確認する
	# 【テスト内容】: 無特性素材4個、reveal_level=1 で実行
	# 【期待される動作】: 戻り値が空配列
	# 【実際の発生シナリオ】: 特性を持たない基礎素材だけで調合するプレイ
	# 🟡 信頼性: 要件定義の入出力関係（出現回数集計）からの妥当な派生ケース

	# 【テストデータ準備】: 特性タグが1つも存在しない構成を用意する
	var materials: Array[MaterialInstance] = [
		_make_material([] as Array[StringName]),
		_make_material([] as Array[StringName]),
		_make_material([] as Array[StringName]),
		_make_material([] as Array[StringName]),
	]

	# 【実際の処理実行】: 無特性構成で特性発現判定を実行
	var result: Array[TraitDefinition] = TraitActivationScript.resolve_activated_traits(materials, 1, trait_defs)

	# 【結果検証】: 特性ゼロ構成での不発を確認する
	assert_eq(result.size(), 0, "全て無特性なら空配列") # 【確認内容】: 集計ロジックの空集合処理 🟡


# ============================================================
# 境界値（閾値・開示レベルの境界）
# ============================================================

func test_同一特性がちょうど2個の境界値で発現する() -> void:
	# 【テスト目的】: 出現回数がちょうど閾値(2)のとき発現側に倒れることを確認する（オフバイワン排除）
	# 【テスト内容】: 「癒」2個＋無特性2個、reveal_level=1 で実行
	# 【期待される動作】: 「癒」が発現候補に含まれる（count>=2で発現。count>2の誤実装を排除）
	# 【境界値選択の根拠】: 出現回数=2はREQ-106の発現下限。1個(不発)との対比で境界を確定する
	# 🔵 信頼性: acceptance-criteria.md TC-101-B01 / EDGE-101

	# 【テストデータ準備】: 閾値ちょうど(2個)の「癒」と無特性2個を用意する
	var materials: Array[MaterialInstance] = [
		_make_material([&"heal"] as Array[StringName]),
		_make_material([&"heal"] as Array[StringName]),
		_make_material([] as Array[StringName]),
		_make_material([] as Array[StringName]),
	]

	# 【実際の処理実行】: reveal_level=1 で特性発現判定を実行
	var result: Array[TraitDefinition] = TraitActivationScript.resolve_activated_traits(materials, 1, trait_defs)

	# 【結果検証】: 境界値ちょうど2個で発現側に倒れることを確認する
	assert_true(result.size() >= 1, "境界値ちょうど2個で発現側に倒れる") # 【確認内容】: 閾値比較のオフバイワン排除 🔵
	var ids: Array = []
	for t in result:
		ids.append(t.id)
	assert_true(ids.has(&"heal"), "発現候補に「癒」が含まれる") # 【確認内容】: 境界値での発現特性の同一性 🔵


func test_reveal_levelが0から1へ切り替わると発現有無が変わる() -> void:
	# 【テスト目的】: reveal_levelが0（非開示）と1（開示）を分ける境界で結果が切り替わることを確認する
	# 【テスト内容】: 同一構成「聖」2個に対し、reveal_level=0とreveal_level=1の2通りで実行
	# 【期待される動作】: level=0→空配列、level=1→「聖」を含む1件
	# 【実際の使用場面】: G→Eランク昇格時に特性が解禁される遷移
	# 🔵 信頼性: REQ-121 / REQ-122 の境界。TC-121-01・02を対比した境界化

	# 【テストデータ準備】: 閾値を満たす同一構成「聖」2個を用意する
	var materials: Array[MaterialInstance] = [
		_make_material([&"holy"] as Array[StringName]),
		_make_material([&"holy"] as Array[StringName]),
	]

	# 【実際の処理実行】: reveal_level=0とreveal_level=1のそれぞれで特性発現判定を実行
	var result_level0: Array[TraitDefinition] = TraitActivationScript.resolve_activated_traits(materials, 0, trait_defs)
	var result_level1: Array[TraitDefinition] = TraitActivationScript.resolve_activated_traits(materials, 1, trait_defs)

	# 【結果検証】: 境界の内外で結果が一貫して切り替わることを確認する
	assert_eq(result_level0.size(), 0, "reveal_level=0では空配列") # 【確認内容】: 非開示側の境界 🔵
	assert_eq(result_level1.size(), 1, "reveal_level=1では1件発現") # 【確認内容】: 開示側の境界 🔵
	assert_eq(result_level1[0].id, &"holy", "発現した特性IDが「聖」である") # 【確認内容】: 開示側の発現特性同一性 🔵


func test_reveal_level2はlevel1と同じ結果になる暫定実装() -> void:
	# 【テスト目的】: REQ-123（Dランク追加特性解禁）が未確定(TBD)なため、reveal_level>=2をlevel>=1と同扱いにする暫定実装を固定化する
	# 【テスト内容】: 「聖」2個、reveal_level=2 で実行
	# 【期待される動作】: level=1と同一結果（「聖」を含む1件）が返る
	# 【実際の使用場面】: Dランク到達時。REQ-123確定までの暫定挙動
	# 🟡 信頼性: TASK-0014「段階的開示フィルタリング」の暫定実装（REQ-123はTBD）より

	# 【テストデータ準備】: 閾値を満たす「聖」2個を用意する
	var materials: Array[MaterialInstance] = [
		_make_material([&"holy"] as Array[StringName]),
		_make_material([&"holy"] as Array[StringName]),
	]

	# 【実際の処理実行】: reveal_level=2 で特性発現判定を実行
	var result: Array[TraitDefinition] = TraitActivationScript.resolve_activated_traits(materials, 2, trait_defs)

	# 【結果検証】: level=1と同一結果になることを確認する（将来REQ-123確定時の変更点の目印）
	assert_eq(result.size(), 1, "reveal_level=2でも1件発現する（level1と同一結果、暫定実装）") # 【確認内容】: 暫定実装の挙動固定 🟡
	assert_eq(result[0].id, &"holy", "発現した特性IDが「聖」である") # 【確認内容】: 暫定実装での発現特性同一性 🟡


# ============================================================
# TASK-0015: TraitActivation.resolve_category_conflict（特性系統間排他制御）
# 対象: features/alchemy/logic/trait_activation.gd（Redフェーズ用スタブのみ実装済み。ロジック未実装）
# 参照: docs/implements/atelier-alchemy-core/TASK-0015/trait-category-conflict-testcases.md
# ============================================================

# ------------------------------------------------------------
# 正常系
# ------------------------------------------------------------

func test_不均衡3対2で多い系統のみ発現し少ない系統を不発にする() -> void:
	# 【テスト目的】: CONTRIBUTION合計3 > REWARD合計2のとき、多い系統のみ残ることを確認する
	# 【テスト内容】: 「聖」3個(CONTRIBUTION)+「金」2個(REWARD)で resolve_category_conflict を実行
	# 【期待される動作】: 「聖」のみが activated_traits に残り、rejected_category は REWARD になる
	# 🔵 信頼性: acceptance-criteria.md TC-101-05 / REQ-115に明記

	# 【テストデータ準備】: 系統枚数が3対2で不均衡になる代表構成を用意する
	# 【初期条件設定】: TASK-0014が確定済みの発現候補 [聖, 金] を模したリスト
	var materials: Array[MaterialInstance] = [
		_make_material([&"holy"] as Array[StringName]),
		_make_material([&"holy"] as Array[StringName]),
		_make_material([&"holy"] as Array[StringName]),
		_make_material([&"gold"] as Array[StringName]),
		_make_material([&"gold"] as Array[StringName]),
	]
	var activated: Array[TraitDefinition] = [trait_defs[&"holy"], trait_defs[&"gold"]]

	# 【実際の処理実行】: 系統間排他制御の純粋関数を呼び出す
	# 【処理内容】: 系統別枚数集計（貢献3・報酬2）→ 不均衡判定 → 多い方のみ残す
	var result: Dictionary = TraitActivationScript.resolve_category_conflict(materials, activated)

	# 【結果検証】: 残る特性ID・件数・rejected_category・has_rejected_categoryを検証する
	assert_eq(result["activated_traits"].size(), 1, "不均衡時は多い系統のみ1件残る") # 【確認内容】: 発現件数 🔵
	assert_eq(result["activated_traits"][0].id, &"holy", "残る特性IDが「聖」である") # 【確認内容】: 残存特性の同一性 🔵
	assert_eq(result["rejected_category"], TraitDefinitionScript.Category.REWARD, "不発系統がREWARDである") # 【確認内容】: 不発系統の記録 🔵
	assert_true(result["has_rejected_category"], "不均衡時はhas_rejected_categoryがtrue") # 【確認内容】: 有効フラグ 🔵


func test_不均衡で報酬系が多い場合は報酬系のみ発現し貢献度系を不発にする() -> void:
	# 【テスト目的】: REWARD合計3 > CONTRIBUTION合計2でもREWARDのみ残る対称性を確認する
	# 【テスト内容】: 「金」3個(REWARD)+「聖」2個(CONTRIBUTION)で resolve_category_conflict を実行
	# 【期待される動作】: 「金」のみが残り、rejected_category は CONTRIBUTION になる（実装がCONTRIBUTION固定でないことの担保）
	# 🟡 信頼性: REQ-115から導出した妥当な鏡像ケース（対応TC-IDはacceptance-criteria.mdに未整備）

	# 【テストデータ準備】: 1-1の系統を入れ替えた鏡像構成を用意する
	# 【初期条件設定】: 比較演算子が両方向で正しく機能するかを検証する構成
	var materials: Array[MaterialInstance] = [
		_make_material([&"gold"] as Array[StringName]),
		_make_material([&"gold"] as Array[StringName]),
		_make_material([&"gold"] as Array[StringName]),
		_make_material([&"holy"] as Array[StringName]),
		_make_material([&"holy"] as Array[StringName]),
	]
	var activated: Array[TraitDefinition] = [trait_defs[&"gold"], trait_defs[&"holy"]]

	# 【実際の処理実行】: 系統間排他制御の純粋関数を呼び出す
	# 【処理内容】: 系統別枚数集計（報酬3・貢献2）→ 不均衡判定 → 多い方のみ残す
	var result: Dictionary = TraitActivationScript.resolve_category_conflict(materials, activated)

	# 【結果検証】: 対称性が保たれ「金」側が残ることを検証する
	assert_eq(result["activated_traits"].size(), 1, "不均衡時は多い系統のみ1件残る") # 【確認内容】: 発現件数 🟡
	assert_eq(result["activated_traits"][0].id, &"gold", "残る特性IDが「金」である") # 【確認内容】: 残存特性の同一性 🟡
	assert_eq(result["rejected_category"], TraitDefinitionScript.Category.CONTRIBUTION, "不発系統がCONTRIBUTIONである") # 【確認内容】: 比較の対称性 🟡
	assert_true(result["has_rejected_category"], "不均衡時はhas_rejected_categoryがtrue") # 【確認内容】: 有効フラグ 🟡


func test_片系統のみのとき排他せずそのまま残す() -> void:
	# 【テスト目的】: REWARD候補が0件のとき排他を発生させずCONTRIBUTIONをそのまま残すことを確認する
	# 【テスト内容】: 「聖」2個(CONTRIBUTION)のみで resolve_category_conflict を実行
	# 【期待される動作】: 比較対象が片系統しかないため除外は起きず全候補が保持される
	# 🟡 信頼性: TASK-0015 note.md 単体テスト要件5 / REQ-115からの妥当な推測

	# 【テストデータ準備】: 貢献度系のみが候補として存在する構成を用意する
	# 【初期条件設定】: 「両系統がともに候補を持つときのみ排他」という仕様の境界（片方0）を代表する
	var materials: Array[MaterialInstance] = [
		_make_material([&"holy"] as Array[StringName]),
		_make_material([&"holy"] as Array[StringName]),
	]
	var activated: Array[TraitDefinition] = [trait_defs[&"holy"]]

	# 【実際の処理実行】: 系統間排他制御の純粋関数を呼び出す
	# 【処理内容】: 系統別枚数集計（貢献2・報酬0）→ 片系統のみのため排他なし
	var result: Dictionary = TraitActivationScript.resolve_category_conflict(materials, activated)

	# 【結果検証】: 誤って除外されず候補が保持されることを検証する
	assert_eq(result["activated_traits"].size(), 1, "片系統のみのときは候補が保持される") # 【確認内容】: 発現件数 🟡
	assert_eq(result["activated_traits"][0].id, &"holy", "残る特性IDが「聖」である") # 【確認内容】: 残存特性の同一性 🟡
	assert_false(result["has_rejected_category"], "片系統のみのときhas_rejected_categoryはfalse") # 【確認内容】: 排他なしの記録 🟡


func test_補助系は同数不発の状況でも排他対象外で残る() -> void:
	# 【テスト目的】: 貢献2vs報酬2（同数不発）の状況でもSUPPORT特性は除外されず残ることを確認する
	# 【テスト内容】: 「聖」2個+「金」2個+「触媒」2個(SUPPORT)で resolve_category_conflict を実行
	# 【期待される動作】: 「聖」「金」は同数不発で除外、「触媒」のみ残る
	# 🟡 信頼性: TASK-0015 note.md 単体テスト要件4 / REQ-115最終文・REQ-108からの導出

	# 【テストデータ準備】: 排他が最も強く働く同数不発ケースにSUPPORTを重ねる
	# 【初期条件設定】: SUPPORT除外漏れの実装ミスを検出するための構成
	var materials: Array[MaterialInstance] = [
		_make_material([&"holy"] as Array[StringName]),
		_make_material([&"holy"] as Array[StringName]),
		_make_material([&"gold"] as Array[StringName]),
		_make_material([&"gold"] as Array[StringName]),
		_make_material([&"catalyst"] as Array[StringName]),
		_make_material([&"catalyst"] as Array[StringName]),
	]
	var activated: Array[TraitDefinition] = [trait_defs[&"holy"], trait_defs[&"gold"], trait_defs[&"catalyst"]]

	# 【実際の処理実行】: 系統間排他制御の純粋関数を呼び出す
	# 【処理内容】: 貢献2・報酬2で同数不発 → 両方除外、SUPPORTは比較対象外で残す
	var result: Dictionary = TraitActivationScript.resolve_category_conflict(materials, activated)

	# 【結果検証】: SUPPORTのみが残り、has_rejected_categoryは同数不発に従いfalseであることを検証する
	assert_eq(result["activated_traits"].size(), 1, "SUPPORTのみが残り1件になる") # 【確認内容】: 発現件数 🟡
	assert_eq(result["activated_traits"][0].id, &"catalyst", "残る特性IDが「触媒」である") # 【確認内容】: SUPPORT除外漏れがないことの確認 🟡
	assert_false(result["has_rejected_category"], "同数不発は単一系統で表現不可のためfalse") # 【確認内容】: 無効値フラグ 🟡


# ------------------------------------------------------------
# 異常系（支配戦略防止・退化入力のハンドリング）
# ------------------------------------------------------------

func test_同数2対2で両系統とも不発になり空配列を返す() -> void:
	# 【テスト目的】: 貢献度系・報酬系が同数のとき両方不発になることを確認する（支配戦略防止）
	# 【テスト内容】: 「聖」2個+「金」2個の同数構成で resolve_category_conflict を実行
	# 【期待される動作】: activated_traits が空配列、has_rejected_category が false
	# 🔵 信頼性: acceptance-criteria.md TC-101-04（Critical）/ TASK-0015 note.md 単体テスト要件1に明記

	# 【テストデータ準備】: 貢献度系「聖」と報酬系「金」を各2個、系統合計が2対2で同数になる構成
	# 【初期条件設定】: activated_traits は TASK-0014 が確定した [聖, 金] を模したリスト
	var materials: Array[MaterialInstance] = [
		_make_material([&"holy"] as Array[StringName]),
		_make_material([&"holy"] as Array[StringName]),
		_make_material([&"gold"] as Array[StringName]),
		_make_material([&"gold"] as Array[StringName]),
	]
	var activated: Array[TraitDefinition] = [trait_defs[&"holy"], trait_defs[&"gold"]]

	# 【実際の処理実行】: 系統間排他制御の純粋関数を呼び出す
	# 【処理内容】: 系統別枚数集計 → 同数判定 → 両系統除外
	var result: Dictionary = TraitActivationScript.resolve_category_conflict(materials, activated)

	# 【結果検証】: 空配列かつ排他フラグ偽であることを確認する
	# 【品質保証】: 支配戦略（無条件両取り）が数式レベルで成立しないことを保証する
	assert_true(result["activated_traits"].is_empty(), "同数時は両系統とも不発（空配列）") # 【検証項目】: 同数不発 🔵
	assert_false(result["has_rejected_category"], "同数不発時は単一系統で表現不可のためfalse") # 【検証項目】: 無効値フラグ 🔵


func test_1素材が2タグ同時保持でも同数不発で両取りできない() -> void:
	# 【テスト目的】: 1素材が貢献度系・報酬系の両タグを持つ場合でも無条件両取りできないことを確認する（支配戦略防止の最終防線）
	# 【テスト内容】: 「聖」「金」両タグを持つ素材2個+高品質無特性素材2個で resolve_category_conflict を実行
	# 【期待される動作】: CONTRIBUTION合計2・REWARD合計2で同数となり、TC-101-04と同じ同数不発ルールが適用される
	# 🔵 信頼性: acceptance-criteria.md TC-101-07（Critical）/ TASK-0015 note.md 単体テスト要件3に明記

	# 【テストデータ準備】: 2タグ同時保持の希少素材2個と、比較に寄与しない無特性の高品質素材2個を用意する
	# 【初期条件設定】: 枚数集計が「素材数」ではなく「系統ごとのタグ重複投入数合計」で行われることを検証する構成
	var materials: Array[MaterialInstance] = [
		_make_material([&"holy", &"gold"] as Array[StringName]),
		_make_material([&"holy", &"gold"] as Array[StringName]),
		MaterialInstanceScript.new("", MaterialInstanceScript.Quality.S, [] as Array[StringName]),
		MaterialInstanceScript.new("", MaterialInstanceScript.Quality.S, [] as Array[StringName]),
	]
	var activated: Array[TraitDefinition] = [trait_defs[&"holy"], trait_defs[&"gold"]]

	# 【実際の処理実行】: 系統間排他制御の純粋関数を呼び出す
	# 【処理内容】: 2タグ保持素材からholy・gold双方の出現回数を2ずつ集計 → 同数判定 → 両系統除外
	var result: Dictionary = TraitActivationScript.resolve_category_conflict(materials, activated)

	# 【結果検証】: 2タグ同時保持でも無条件両取りが成立しないことを確認する
	# 【品質保証】: 支配戦略防止の最終防線。素材データ構造レベルの抜け道が排他制御で塞がれることを保証する
	assert_true(result["activated_traits"].is_empty(), "1素材2タグ同時保持でも同数不発（空配列）") # 【検証項目】: 支配戦略防止の最終防線 🔵
	assert_false(result["has_rejected_category"], "同数不発時は単一系統で表現不可のためfalse") # 【検証項目】: 無効値フラグ 🔵


func test_発現候補が空のとき空配列を返し排他フラグは偽() -> void:
	# 【テスト目的】: activated_traitsが空（TASK-0014が候補を1件も返さなかった）状態での呼び出しに対する堅牢性を確認する
	# 【テスト内容】: 無特性素材4個、activated_traits=[]で resolve_category_conflict を実行
	# 【期待される動作】: 例外を投げず、activated_traitsが空配列、has_rejected_categoryがfalseで返る
	# 🟡 信頼性: 要件定義書「4. 想定される使用例：エッジ（候補空）」からの導出

	# 【テストデータ準備】: 集計対象ゼロの退化ケースを用意する
	# 【初期条件設定】: 特性を持たない基礎素材のみ、または閾値未達で候補ゼロの調合を想定
	var materials: Array[MaterialInstance] = [
		_make_material([] as Array[StringName]),
		_make_material([] as Array[StringName]),
		_make_material([] as Array[StringName]),
		_make_material([] as Array[StringName]),
	]
	var activated: Array[TraitDefinition] = []

	# 【実際の処理実行】: 系統間排他制御の純粋関数を呼び出す
	# 【処理内容】: 空の発現候補に対する決定論的な空返却
	var result: Dictionary = TraitActivationScript.resolve_category_conflict(materials, activated)

	# 【結果検証】: 退化入力でもクラッシュせず一貫した戻り値構造を返すことを確認する
	assert_true(result["activated_traits"].is_empty(), "候補が空なら空配列を返す") # 【確認内容】: 退化入力への堅牢性 🟡
	assert_false(result["has_rejected_category"], "候補が空ならhas_rejected_categoryはfalse") # 【確認内容】: 無効値フラグ 🟡


# ------------------------------------------------------------
# 境界値（枚数比較・系統単位排他の境界）
# ------------------------------------------------------------

func test_差分1の最小不均衡で多い系統のみ残す() -> void:
	# 【テスト目的】: 「同数（不発）」と「不均衡（多い方発現）」を分ける境界（枚数差=1）で確実に不均衡側に倒れることを確認する
	# 【テスト内容】: 「聖」2個(CONTRIBUTION)+「金」1個(REWARD)で resolve_category_conflict を実行
	# 【期待される動作】: 差1でも同数不発に誤分類されず、多い系統（貢献度系）のみが残る
	# 🟡 信頼性: REQ-115「より多い系統」からの境界導出（TC-101-05を境界視点で補強）

	# 【テストデータ準備】: 貢献度系合計2・報酬系合計1で差分1の最小不均衡構成を用意する
	# 【初期条件設定】: オフバイワン誤り（`>`と`>=`の取り違え）を検出する境界値
	var materials: Array[MaterialInstance] = [
		_make_material([&"holy"] as Array[StringName]),
		_make_material([&"holy"] as Array[StringName]),
		_make_material([&"gold"] as Array[StringName]),
	]
	var activated: Array[TraitDefinition] = [trait_defs[&"holy"], trait_defs[&"gold"]]

	# 【実際の処理実行】: 系統間排他制御の純粋関数を呼び出す
	# 【処理内容】: 系統別枚数集計（貢献2・報酬1）→ 差分1の不均衡判定 → 多い方のみ残す
	var result: Dictionary = TraitActivationScript.resolve_category_conflict(materials, activated)

	# 【結果検証】: 差1で同数不発に誤分類されず多い系統のみ残ることを確認する
	assert_eq(result["activated_traits"].size(), 1, "差分1でも不均衡側に倒れ1件残る") # 【確認内容】: 境界での正確性 🟡
	assert_eq(result["activated_traits"][0].id, &"holy", "残る特性IDが「聖」である") # 【確認内容】: 残存特性の同一性 🟡
	assert_true(result["has_rejected_category"], "差分1の不均衡ではhas_rejected_categoryがtrue") # 【確認内容】: 有効フラグ 🟡
	assert_eq(result["rejected_category"], TraitDefinitionScript.Category.REWARD, "不発系統がREWARDである") # 【確認内容】: 不発系統の記録 🟡


func test_補助系のみのとき排他制御なしで全て残す() -> void:
	# 【テスト目的】: CONTRIBUTION/REWARDが両方0件でSUPPORTのみという極端構成で比較が発生せず除外も起きないことを確認する
	# 【テスト内容】: 「触媒」2個(SUPPORT)のみで resolve_category_conflict を実行
	# 【期待される動作】: SUPPORTは常に保持されるという仕様が単独構成でも守られる
	# 🟡 信頼性: REQ-115最終文・REQ-108からの境界導出

	# 【テストデータ準備】: CONTRIBUTION=0かつREWARD=0の下限構成を用意する
	# 【初期条件設定】: SUPPORT単独時に空配列へ誤って倒れないことを検証する構成
	var materials: Array[MaterialInstance] = [
		_make_material([&"catalyst"] as Array[StringName]),
		_make_material([&"catalyst"] as Array[StringName]),
	]
	var activated: Array[TraitDefinition] = [trait_defs[&"catalyst"]]

	# 【実際の処理実行】: 系統間排他制御の純粋関数を呼び出す
	# 【処理内容】: 比較対象（CONTRIBUTION/REWARD）が存在しないためSUPPORTをそのまま残す
	var result: Dictionary = TraitActivationScript.resolve_category_conflict(materials, activated)

	# 【結果検証】: SUPPORT単独時に誤って空配列にならないことを確認する
	assert_eq(result["activated_traits"].size(), 1, "SUPPORT単独時は1件のまま残る") # 【確認内容】: 堅牢性の確認 🟡
	assert_eq(result["activated_traits"][0].id, &"catalyst", "残る特性IDが「触媒」である") # 【確認内容】: SUPPORT保持の一貫性 🟡
	assert_false(result["has_rejected_category"], "比較対象がないためhas_rejected_categoryはfalse") # 【確認内容】: 排他なしの記録 🟡


func test_多い系統内の複数特性は全て残り少ない系統は全除去される() -> void:
	# 【テスト目的】: 排他が「特性単位」ではなく「系統単位」で行われることを確認する
	# 【テスト内容】: 「聖」2個+「浄」2個(ともにCONTRIBUTION、合計4)+「金」2個(REWARD、合計2)で resolve_category_conflict を実行
	# 【期待される動作】: 多い系統（貢献度系）の複数特性が全て残り、少ない系統（報酬系）は全除去される
	# 🟡 信頼性: REQ-112×REQ-115の組合せ・TASK-0015 note.md「系統内の個別特性を再評価しない」注意事項からの導出

	# 【テストデータ準備】: CONTRIBUTION合計4 > REWARD合計2で、多い系統が複数特性を持つ最小構成を用意する
	# 【初期条件設定】: TASK-0014の系統内複数発現結果を壊さず系統間排他のみ適用されることを検証する構成
	var materials: Array[MaterialInstance] = [
		_make_material([&"holy"] as Array[StringName]),
		_make_material([&"holy"] as Array[StringName]),
		_make_material([&"cleanse"] as Array[StringName]),
		_make_material([&"cleanse"] as Array[StringName]),
		_make_material([&"gold"] as Array[StringName]),
		_make_material([&"gold"] as Array[StringName]),
	]
	var activated: Array[TraitDefinition] = [trait_defs[&"holy"], trait_defs[&"cleanse"], trait_defs[&"gold"]]

	# 【実際の処理実行】: 系統間排他制御の純粋関数を呼び出す
	# 【処理内容】: 系統別枚数集計（貢献4・報酬2）→ 不均衡判定 → 貢献度系の2特性を一括で残し報酬系を一括除去
	var result: Dictionary = TraitActivationScript.resolve_category_conflict(materials, activated)

	# 【結果検証】: 系統単位の一括存置/除去であることを確認する（順序非依存）
	assert_eq(result["activated_traits"].size(), 2, "多い系統の複数特性が2件とも残る") # 【確認内容】: 系統単位の一括存置 🟡
	var ids: Array = []
	for t in result["activated_traits"]:
		ids.append(t.id)
	assert_true(ids.has(&"holy"), "残存特性に「聖」が含まれる") # 【確認内容】: 系統内特性1件目の存置 🟡
	assert_true(ids.has(&"cleanse"), "残存特性に「浄」が含まれる") # 【確認内容】: 系統内特性2件目の存置 🟡
	assert_eq(result["rejected_category"], TraitDefinitionScript.Category.REWARD, "不発系統がREWARDである") # 【確認内容】: 少ない系統の一括除去記録 🟡
	assert_true(result["has_rejected_category"], "不均衡時はhas_rejected_categoryがtrue") # 【確認内容】: 有効フラグ 🟡
