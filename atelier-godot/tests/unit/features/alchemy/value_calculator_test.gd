extends GutTest
# TASK-0017: ValueCalculator（貢献度/報酬算出）のユニットテスト
# 対象: features/alchemy/logic/value_calculator.gd（未実装。Redフェーズ用スタブのみ存在）
# 参照: docs/implements/atelier-alchemy-core/TASK-0017/value-calculator-testcases.md
#
# 【備考】: ValueCalculatorは純粋関数(static func)のみで構成されるためインスタンス生成は不要。
#          各テストはRecipeDefinition/TraitDefinition/DummyDailyRequestをローカルで組み立てて完結する。
#          DailyRequestは申し送り1のとおり本タスク時点で未実装のため、本ファイル内に
#          Duck typing用のダミーstubクラス（DummyDailyRequest）を定義して代替する。

const RecipeDefinitionScript := preload("res://features/alchemy/data/recipe_definition.gd")
const TraitDefinitionScript := preload("res://features/alchemy/data/trait_definition.gd")
const MaterialInstanceScript := preload("res://features/alchemy/data/material_instance.gd")
const ValueCalculatorScript := preload("res://features/alchemy/logic/value_calculator.gd")


## 【ダミーstub】: DailyRequest未実装（申し送り1）のため、ValueCalculatorが参照する
## 　　required_recipe_id / bonus_multiplier の2フィールドのみを持つテスト専用ダミーを定義する。
## 　　data-model.md の DailyRequest 定義に準拠する。
class DummyDailyRequest extends RefCounted:
	var required_recipe_id: StringName = &""
	var bonus_multiplier: float = 1.5

	func _init(p_recipe_id: StringName = &"", p_bonus: float = 1.5) -> void:
		required_recipe_id = p_recipe_id
		bonus_multiplier = p_bonus


# 【ヘルパー】: RecipeDefinition マスターデータを1件生成するファクトリ
func _make_recipe(p_id: StringName, p_base_contribution: float, p_base_reward: float) -> RecipeDefinition:
	var r := RecipeDefinitionScript.new()
	r.id = p_id
	r.base_contribution = p_base_contribution
	r.base_reward = p_base_reward
	return r


# 【ヘルパー】: TraitDefinition マスターデータを1件生成するファクトリ
func _make_trait(p_id: StringName, p_cat: int, p_bonus: float) -> TraitDefinition:
	var t := TraitDefinitionScript.new()
	t.id = p_id
	t.category = p_cat
	t.bonus_multiplier = p_bonus
	return t


# ============================================================
# 正常系
# ============================================================

func test_発現特性なし指定合致なしで基礎貢献度と品質倍率のみ反映される() -> void:
	# 【テスト目的】: 全ボーナスが1.0で無効化される最小構成で乗算構造の骨格を検証する
	# 【テスト内容】: base_contribution=10.0, 品質C, 特性空, 指定不一致 で calculate_contribution
	# 【期待される動作】: 10.0 × 1.0(品質) × 1.0(特性) × 1.0(合致) = 10.0
	# 🟡 信頼性: TASK-0017.md 単体テスト要件テストケース1 / REQ-109

	# 【テストデータ準備】: 検証しやすいダミー基礎値10.0のレシピを用意する
	# 【初期条件設定】: 特性・指定合致という変動要因を全て無効化した土台構成
	var recipe := _make_recipe(&"test_recipe", 10.0, 20.0)
	var traits: Array[TraitDefinition] = []
	var daily := DummyDailyRequest.new(&"other", 1.5)  # recipe.idと不一致

	# 【実際の処理実行】: 貢献度算出の純粋関数を呼び出す
	# 【処理内容】: 基礎貢献度 × 品質倍率 × 貢献度系ボーナス × 指定合致ボーナス
	var result: float = ValueCalculatorScript.calculate_contribution(
		recipe, MaterialInstanceScript.Quality.C, traits, daily)

	# 【結果検証】: 乗算構造の骨格（基礎値×品質倍率）だけが反映されることを確認する
	# 【期待値確認】: 10.0であれば加算誤実装・係数取り違えがない
	assert_almost_eq(result, 10.0, 0.001, "全ボーナス無効化で基礎貢献度×品質倍率のみ") # 【確認内容】: 乗算構造の骨格 🟡


func test_貢献度系と報酬系が混在しても貢献度計算には貢献度系ボーナスのみ寄与する() -> void:
	# 【テスト目的】: calculate_contributionの系統フィルタリングを検証する
	# 【テスト内容】: CONTRIBUTION(1.5)とREWARD(2.0)が混在した状態でcalculate_contributionを実行
	# 【期待される動作】: CONTRIBUTION(1.5)のみ乗算され、REWARD(2.0)は無視される
	# 🟡 信頼性: TASK-0017.md 単体テスト要件テストケース2 / REQ-109

	# 【テストデータ準備】: TASK-0015の系統排他を経ず両系統を人為的に混在させる
	# 【初期条件設定】: 貢献度系ボーナスのみが反映されるべき構成
	var recipe := _make_recipe(&"test_recipe", 10.0, 20.0)
	var traits: Array[TraitDefinition] = [
		_make_trait(&"holy", TraitDefinitionScript.Category.CONTRIBUTION, 1.5),
		_make_trait(&"gold", TraitDefinitionScript.Category.REWARD, 2.0),
	]
	var daily := DummyDailyRequest.new(&"other", 1.5)  # 不一致

	# 【実際の処理実行】: 貢献度算出の純粋関数を呼び出す
	# 【処理内容】: CONTRIBUTIONカテゴリのみをフィルタして乗算する
	var result: float = ValueCalculatorScript.calculate_contribution(
		recipe, MaterialInstanceScript.Quality.C, traits, daily)

	# 【結果検証】: REWARDの2.0が誤って乗算されると30.0になる。15.0であればREWARDが無視されている証拠
	assert_almost_eq(result, 15.0, 0.001, "貢献度計算にはCONTRIBUTIONのみ寄与する") # 【確認内容】: 系統独立性（REWARD非混入） 🟡


func test_貢献度系と報酬系が混在しても報酬計算には報酬系ボーナスのみ寄与する() -> void:
	# 【テスト目的】: calculate_rewardの系統フィルタリングを検証する（前テストの鏡像）
	# 【テスト内容】: CONTRIBUTION(1.5)とREWARD(2.0)が混在した状態でcalculate_rewardを実行
	# 【期待される動作】: REWARD(2.0)のみ乗算され、CONTRIBUTION(1.5)は無視される
	# 🟡 信頼性: TASK-0017.md 単体テスト要件テストケース3 / REQ-110

	# 【テストデータ準備】: 前テストと同一の特性構成を用いて系統フィルタの対称性を検証する
	# 【初期条件設定】: 報酬系ボーナスのみが反映されるべき構成
	var recipe := _make_recipe(&"test_recipe", 10.0, 20.0)
	var traits: Array[TraitDefinition] = [
		_make_trait(&"holy", TraitDefinitionScript.Category.CONTRIBUTION, 1.5),
		_make_trait(&"gold", TraitDefinitionScript.Category.REWARD, 2.0),
	]
	var daily := DummyDailyRequest.new(&"other", 1.5)  # 不一致

	# 【実際の処理実行】: 報酬算出の純粋関数を呼び出す
	# 【処理内容】: REWARDカテゴリのみをフィルタして乗算する
	var result: float = ValueCalculatorScript.calculate_reward(
		recipe, MaterialInstanceScript.Quality.C, traits, daily)

	# 【結果検証】: CONTRIBUTIONの1.5が誤って乗算されると30.0になる。40.0であればCONTRIBUTIONが無視されている証拠
	assert_almost_eq(result, 40.0, 0.001, "報酬計算にはREWARDのみ寄与する") # 【確認内容】: 系統独立性（CONTRIBUTION非混入） 🟡


func test_指定合致調合物と一致する場合に指定合致ボーナスが乗算される() -> void:
	# 【テスト目的】: 指定合致ボーナスの適用条件（required_recipe_id == recipe.id）と乗算を検証する
	# 【テスト内容】: daily_request.required_recipe_idがrecipe.idと一致する状態でcalculate_contributionを実行
	# 【期待される動作】: 合致時にdaily_request.bonus_multiplier(1.5)が乗算される
	# 🟡 信頼性: TASK-0017.md 単体テスト要件テストケース4 / REQ-204, REQ-109

	# 【テストデータ準備】: 合致条件を成立させる最小構成。品質・特性を無効化し合致ボーナス単独の効果を露出する
	# 【初期条件設定】: recipe.idとdaily_request.required_recipe_idを一致させる
	var recipe := _make_recipe(&"test_recipe", 10.0, 20.0)
	var traits: Array[TraitDefinition] = []
	var daily := DummyDailyRequest.new(&"test_recipe", 1.5)  # 一致

	# 【実際の処理実行】: 貢献度算出の純粋関数を呼び出す
	# 【処理内容】: ID比較による指定合致ボーナスの適用判定
	var result: float = ValueCalculatorScript.calculate_contribution(
		recipe, MaterialInstanceScript.Quality.C, traits, daily)

	# 【結果検証】: 一致時のみ1.5が乗ることを確認する（不一致で1.0、一致で1.5に切り替わること）
	assert_almost_eq(result, 15.0, 0.001, "指定合致時にbonus_multiplierが乗算される") # 【確認内容】: 指定合致ボーナス適用 🟡


func test_品質特性指定合致の4係数が同時に働くと全て乗算される() -> void:
	# 【テスト目的】: 4係数が同時に非1.0のとき、それらが独立に乗算されて最終値になることを検証する（乗算構造の完全形）
	# 【テスト内容】: final_quality=B(3)、CONTRIBUTION(1.5)、指定合致(1.5)を同時に与えてcalculate_contributionを実行
	# 【期待される動作】: 基礎貢献度 × 品質倍率 × 特性ボーナス × 合致ボーナス の全乗算
	# 🟡 信頼性: requirements.md「例4」を拡張 / REQ-109

	# 【テストデータ準備】: 要件定義「例4」を特性ありに拡張した、全係数が有効な代表構成
	# 【初期条件設定】: 品質B(倍率1.5)・特性1.5・合致1.5をすべて有効化する
	var recipe := _make_recipe(&"test_recipe", 10.0, 20.0)
	var traits: Array[TraitDefinition] = [
		_make_trait(&"holy", TraitDefinitionScript.Category.CONTRIBUTION, 1.5),
	]
	var daily := DummyDailyRequest.new(&"test_recipe", 1.5)  # 一致

	# 【実際の処理実行】: 貢献度算出の純粋関数を呼び出す
	# 【処理内容】: 4係数（基礎値・品質倍率・特性ボーナス・合致ボーナス）の完全乗算
	var result: float = ValueCalculatorScript.calculate_contribution(
		recipe, MaterialInstanceScript.Quality.B, traits, daily)

	# 【結果検証】: 品質B=倍率1.5、特性1.5、合致1.5。いずれかが欠落・加算化すると値がずれる
	assert_almost_eq(result, 33.75, 0.001, "4係数全てが独立に乗算される（10.0×1.5×1.5×1.5）") # 【確認内容】: 乗算構造の完全形 🟡


func test_貢献度系特性が複数発現するとbonus_multiplierがすべて乗算される() -> void:
	# 【テスト目的】: 該当カテゴリに複数特性がある場合、全てのbonus_multiplierを乗算することを検証する（EDGE-E）
	# 【テスト内容】: CONTRIBUTION(1.5)とCONTRIBUTION(1.2)の2件を同時に発現させてcalculate_contributionを実行
	# 【期待される動作】: CONTRIBUTION(1.5) × CONTRIBUTION(1.2) = 1.8 が特性ボーナスになる
	# 🟡 信頼性: requirements.md EDGE-E / note.md 付録 例2

	# 【テストデータ準備】: 同系統複数発現（REQ-112）が価値計算で全乗算されることを検証する構成
	# 【初期条件設定】: 同一カテゴリ(CONTRIBUTION)の特性を2件用意する
	var recipe := _make_recipe(&"test_recipe", 10.0, 20.0)
	var traits: Array[TraitDefinition] = [
		_make_trait(&"holy", TraitDefinitionScript.Category.CONTRIBUTION, 1.5),
		_make_trait(&"cleanse", TraitDefinitionScript.Category.CONTRIBUTION, 1.2),
	]
	var daily := DummyDailyRequest.new(&"other", 1.5)  # 不一致

	# 【実際の処理実行】: 貢献度算出の純粋関数を呼び出す
	# 【処理内容】: 同一カテゴリの複数bonus_multiplierをすべて乗算して集計する
	var result: float = ValueCalculatorScript.calculate_contribution(
		recipe, MaterialInstanceScript.Quality.C, traits, daily)

	# 【結果検証】: 1.5×1.2=1.8。最初の1件のみ採用（15.0）や加算（10.0×(1.5+1.2)）の誤実装を排除
	assert_almost_eq(result, 18.0, 0.001, "同系統複数特性のbonus_multiplierが全乗算される") # 【確認内容】: 複数同系統特性の乗算集計 🟡


# ============================================================
# 異常系・エッジテストケース（無効化・退化入力のハンドリング）
# ============================================================

func test_発現特性が空配列のとき特性ボーナスは1_0で無効化される() -> void:
	# 【テスト目的】: 特性が1件も発現しなかった調合（退化入力）で特性ボーナスが1.0になることを確認する
	# 【エラーケースの概要】: activated_traits=[]の状態でcalculate_contributionを実行
	# 【エラー処理の重要性】: 空配列で特性ボーナスが0.0や未定義になると結果が0.0や例外になり、価値計算が破綻する
	# 🟡 信頼性: requirements.md EDGE-A / タスク完了条件「ボーナス倍率は1.0（無効化）」

	# 【テストデータ準備】: 無特性素材のみでの調合、閾値未達で特性が発現しなかった場合を再現する
	# 【初期条件設定】: activated_traitsを空のArray[TraitDefinition]にする
	var recipe := _make_recipe(&"test_recipe", 10.0, 20.0)
	var traits: Array[TraitDefinition] = []
	var daily := DummyDailyRequest.new(&"other", 1.5)  # 不一致

	# 【実際の処理実行】: 貢献度算出の純粋関数を呼び出す
	# 【処理内容】: 空配列に対する特性ボーナスの中立値(1.0)処理を検証する
	var result: float = ValueCalculatorScript.calculate_contribution(
		recipe, MaterialInstanceScript.Quality.C, traits, daily)

	# 【結果検証】: 乗算の初期値が1.0であること（0.0初期化バグの検出）を確認する
	assert_almost_eq(result, 10.0, 0.001, "空配列時は特性ボーナス1.0で無効化される") # 【確認内容】: 空配列に対する堅牢性 🟡


func test_SUPPORT特性のみのとき貢献度報酬ともに特性ボーナスは1_0になる() -> void:
	# 【テスト目的】: SUPPORT特性が貢献度・報酬いずれのボーナスにも寄与しないことを確認する（EDGE-F）
	# 【エラーケースの概要】: 触媒（SUPPORT）のみが発現した状態でcalculate_contribution/calculate_rewardを実行
	# 【エラー処理の重要性】: SUPPORTを誤ってCONTRIBUTION/REWARDに含めると価値が過大評価される
	# 🟡 信頼性: requirements.md EDGE-F / REQ-108（SUPPORT=補助系）

	# 【テストデータ準備】: 触媒を投入して品質を底上げした調合を再現する
	# 【初期条件設定】: activated_traitsにSUPPORTのみを含める
	var recipe := _make_recipe(&"test_recipe", 10.0, 20.0)
	var traits: Array[TraitDefinition] = [
		_make_trait(&"catalyst", TraitDefinitionScript.Category.SUPPORT, 2.0),
	]
	var daily := DummyDailyRequest.new(&"other", 1.5)  # 不一致

	# 【実際の処理実行】: 貢献度・報酬双方の算出関数を呼び出す
	# 【処理内容】: SUPPORTカテゴリがCONTRIBUTION/REWARDいずれのフィルタも通過しないことを検証する
	var contribution_result: float = ValueCalculatorScript.calculate_contribution(
		recipe, MaterialInstanceScript.Quality.C, traits, daily)
	var reward_result: float = ValueCalculatorScript.calculate_reward(
		recipe, MaterialInstanceScript.Quality.C, traits, daily)

	# 【結果検証】: SUPPORTのbonus_multiplier=2.0が両計算とも無視されることを確認する
	assert_almost_eq(contribution_result, 10.0, 0.001, "SUPPORT特性は貢献度ボーナスに寄与しない") # 【確認内容】: SUPPORT除外（貢献度） 🟡
	assert_almost_eq(reward_result, 20.0, 0.001, "SUPPORT特性は報酬ボーナスに寄与しない") # 【確認内容】: SUPPORT除外（報酬） 🟡


func test_貢献度計算で報酬系特性のみが存在すると特性ボーナスは1_0になる() -> void:
	# 【テスト目的】: 該当カテゴリ0件時の1.0無効化を検証する（EDGE-B、TC-N02とは別に該当0件の縮退を単独検証）
	# 【エラーケースの概要】: calculate_contributionにREWARD特性のみが渡された（該当系統0件）状態
	# 【エラー処理の重要性】: 該当系統0件を1.0で無効化できないと、反対系統の値が誤って混入する
	# 🟡 信頼性: requirements.md EDGE-B

	# 【テストデータ準備】: 報酬系に偏った調合物を貢献度目的で納品するケースを再現する
	# 【初期条件設定】: activated_traitsにREWARDのみを含める（CONTRIBUTIONは0件）
	var recipe := _make_recipe(&"test_recipe", 10.0, 20.0)
	var traits: Array[TraitDefinition] = [
		_make_trait(&"gold", TraitDefinitionScript.Category.REWARD, 2.0),
	]
	var daily := DummyDailyRequest.new(&"other", 1.5)  # 不一致

	# 【実際の処理実行】: 貢献度算出の純粋関数を呼び出す
	# 【処理内容】: 該当カテゴリ(CONTRIBUTION)0件時のフィルタ結果が中立値1.0になることを検証する
	var result: float = ValueCalculatorScript.calculate_contribution(
		recipe, MaterialInstanceScript.Quality.C, traits, daily)

	# 【結果検証】: 該当CONTRIBUTION 0件でも1.0中立値で安全に処理されることを確認する
	assert_almost_eq(result, 10.0, 0.001, "該当カテゴリ0件のとき特性ボーナスは1.0になる") # 【確認内容】: 該当0件時の1.0無効化 🟡


# ============================================================
# 境界値テストケース（最小値・最大値・ゼロ値）
# ============================================================

func test_基礎貢献度が0_0のとき結果は0_0になる() -> void:
	# 【テスト目的】: base_contributionが0.0なら他の係数に関わらず貢献度は0.0になることを検証する（EDGE-C）
	# 【境界値の意味】: 乗算構造では基礎値0が結果0を支配する（吸収要素）。RecipeDefinitionのbase_contribution初期値は0.0
	# 【境界値での動作保証】: 未設定レシピ（デフォルト0.0）でも例外なく0.0を返す
	# 🟡 信頼性: requirements.md EDGE-C / RecipeDefinition.base_contribution 既定値0.0

	# 【テストデータ準備】: 他係数を全て非1.0にしても、基礎値0が全体を0にすることを確認する構成
	# 【初期条件設定】: base_contribution=0.0、final_quality=S(5)、特性・指定合致ともに有効化
	var recipe := _make_recipe(&"test_recipe", 0.0, 20.0)
	var traits: Array[TraitDefinition] = [
		_make_trait(&"holy", TraitDefinitionScript.Category.CONTRIBUTION, 1.5),
	]
	var daily := DummyDailyRequest.new(&"test_recipe", 1.5)  # 一致

	# 【実際の処理実行】: 貢献度算出の純粋関数を呼び出す
	# 【処理内容】: 乗算の吸収要素（0.0基礎値）が正しく機能するかを検証する
	var result: float = ValueCalculatorScript.calculate_contribution(
		recipe, MaterialInstanceScript.Quality.S, traits, daily)

	# 【結果検証】: 0除算等の派生バグがないことを確認する
	assert_almost_eq(result, 0.0, 0.001, "基礎貢献度0.0は乗算の吸収要素として結果を0.0にする") # 【確認内容】: ゼロ値の乗算吸収 🟡


func test_品質下限D1のとき品質倍率は0_5になる() -> void:
	# 【テスト目的】: final_qualityがD(1)のとき品質倍率0.5が適用されることを検証する
	# 【境界値の意味】: 品質enumの下限（D=1）。暫定式で最小倍率となる境界
	# 【境界値での動作保証】: 最低品質でも計算が破綻せず、暫定式どおり0.5倍になる
	# 🔴 信頼性: 品質倍率式が設計文書に根拠なく暫定（申し送り・requirements.md EDGE-D）

	# 【テストデータ準備】: 特性過多で品質ペナルティを受け最終品質がDに落ちた調合物を再現する
	# 【初期条件設定】: final_quality=D(1)、特性・指定合致は無効化した状態
	var recipe := _make_recipe(&"test_recipe", 10.0, 20.0)
	var traits: Array[TraitDefinition] = []
	var daily := DummyDailyRequest.new(&"other", 1.5)  # 不一致

	# 【実際の処理実行】: 貢献度算出の純粋関数を呼び出す
	# 【処理内容】: 品質倍率の暫定式 float(final_quality)/float(Quality.C) の下限挙動を検証する
	var result: float = ValueCalculatorScript.calculate_contribution(
		recipe, MaterialInstanceScript.Quality.D, traits, daily)

	# 【結果検証】: 整数除算でなく浮動小数点除算になっていること（1/2=0でない）を確認する
	assert_almost_eq(result, 5.0, 0.001, "品質下限D(1)で品質倍率0.5が適用される") # 【確認内容】: 品質倍率下限の検証 🔴


func test_品質上限S5のとき品質倍率は2_5になる報酬側() -> void:
	# 【テスト目的】: final_qualityがS(5)のとき品質倍率2.5が適用されることを報酬側で検証する
	# 【境界値の意味】: 品質enumの上限（S=5）。暫定式で最大倍率となる境界
	# 【境界値での動作保証】: 最高品質でも暫定式どおり2.5倍になり、報酬計算でも品質倍率が共有される
	# 🔴 信頼性: 品質倍率式が暫定（申し送り・requirements.md EDGE-D）

	# 【テストデータ準備】: 高品質素材＋触媒でSまで到達した高価値調合物を再現する
	# 【初期条件設定】: final_quality=S(5)、特性・指定合致は無効化した状態でcalculate_rewardを検証
	var recipe := _make_recipe(&"test_recipe", 10.0, 20.0)
	var traits: Array[TraitDefinition] = []
	var daily := DummyDailyRequest.new(&"other", 1.5)  # 不一致

	# 【実際の処理実行】: 報酬算出の純粋関数を呼び出す
	# 【処理内容】: 品質倍率の暫定式の上限挙動を報酬計算側で検証する
	var result: float = ValueCalculatorScript.calculate_reward(
		recipe, MaterialInstanceScript.Quality.S, traits, daily)

	# 【結果検証】: 倍率の上限クリップ等の誤実装がないことを確認する
	assert_almost_eq(result, 50.0, 0.001, "品質上限S(5)で品質倍率2.5が適用される（報酬側）") # 【確認内容】: 品質倍率上限＋報酬側の適用 🔴


func test_品質基準C2のとき品質倍率は1_0になる基準点() -> void:
	# 【テスト目的】: final_qualityがC(2)のとき品質倍率は基準値1.0になることを検証する
	# 【境界値の意味】: 暫定式の基準点（分母＝Quality.C）。倍率がちょうど1.0になる中心境界
	# 【境界値での動作保証】: 基準品質で他係数が素通し（品質倍率が結果を変えない）
	# 🔵 信頼性: 「品質Cを基準1.0とする」定義自体は明示 / requirements.md

	# 【テストデータ準備】: 標準品質の調合物を再現する
	# 【初期条件設定】: final_quality=C(2)、特性・指定合致は無効化した状態
	var recipe := _make_recipe(&"test_recipe", 10.0, 20.0)
	var traits: Array[TraitDefinition] = []
	var daily := DummyDailyRequest.new(&"other", 1.5)  # 不一致

	# 【実際の処理実行】: 貢献度算出の純粋関数を呼び出す
	# 【処理内容】: 品質倍率の基準点(C=2 → 1.0)を検証する
	var result: float = ValueCalculatorScript.calculate_contribution(
		recipe, MaterialInstanceScript.Quality.C, traits, daily)

	# 【結果検証】: 基準点で倍率が1.0に正規化されることを確認する（TC-B02/B03と連続性を持つ中心境界）
	assert_almost_eq(result, 10.0, 0.001, "品質基準C(2)で品質倍率は1.0になる") # 【確認内容】: 品質倍率の基準点検証 🔵
