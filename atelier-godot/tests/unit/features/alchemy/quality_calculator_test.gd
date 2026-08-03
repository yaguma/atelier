extends GutTest
# TASK-0013: QualityCalculator（基礎品質算出）のユニットテスト
# 対象: features/alchemy/logic/quality_calculator.gd（未実装。Redフェーズ用）
# 参照: docs/implements/atelier-alchemy-core/TASK-0013/quality-calculator-testcases.md
#
# 【備考】: QualityCalculatorは純粋関数(static func)のみで構成されるためインスタンス生成は不要。
#          各テストはローカルにMaterialInstanceを組み立てて完結する。

const QualityCalculatorScript := preload("res://features/alchemy/logic/quality_calculator.gd")
const MaterialInstanceScript := preload("res://features/alchemy/data/material_instance.gd")
const TraitDefinitionScript := preload("res://features/alchemy/data/trait_definition.gd")


# 【ヘルパー】: 指定品質・無特性のMaterialInstanceを1個生成する
func _make_material(quality: int, traits: Array[StringName] = []) -> MaterialInstance:
	return MaterialInstanceScript.new("", quality, traits)


# 【ヘルパー】: TASK-0016用。指定カテゴリのTraitDefinitionを1件生成する
# 【備考】: apply_trait_penaltyはcategoryのみ参照するため、id・categoryのみ最小限セットする
func _make_trait(p_id: StringName, p_cat: int) -> TraitDefinition:
	var t := TraitDefinitionScript.new()
	t.id = p_id
	t.category = p_cat
	return t


# ============================================================
# 正常系
# ============================================================

func test_品質DCBAの4素材の平均が2_5になる() -> void:
	# 【テスト目的】: 異なる品質の4素材の算術平均が2.5になることを確認する（TC-101-01）
	# 【テスト内容】: D(1)/C(2)/B(3)/A(4)を各1個投入し平均を算出する
	# 【期待される動作】: (1+2+3+4)/4 = 2.5 をfloatで返す
	# 🔵 信頼性: acceptance-criteria.md TC-101-01

	# 【テストデータ準備】: 品質が全て異なり平均が非整数になる代表ケースを用意する
	# 【初期条件設定】: traitsは全て空。qualityのみが平均に寄与する
	var materials: Array[MaterialInstance] = [
		_make_material(MaterialInstanceScript.Quality.D),
		_make_material(MaterialInstanceScript.Quality.C),
		_make_material(MaterialInstanceScript.Quality.B),
		_make_material(MaterialInstanceScript.Quality.A),
	]

	# 【実際の処理実行】: calculate_base_qualityで基礎品質を算出する
	# 【処理内容】: 品質値の算術平均を計算する純粋関数を呼び出す
	var result: float = QualityCalculatorScript.calculate_base_quality(materials)

	# 【結果検証】: 戻り値が2.5であることを確認する
	# 【期待値確認】: int合計10 ÷ 4 = 2.5。整数除算で2に切り捨てられないこと
	assert_almost_eq(result, 2.5, 0.0001, "平均品質が2.5になるべき") # 【確認内容】: 非整数平均の保持 🔵


func test_品質S素材1個のみ投入時に5_0を返す() -> void:
	# 【テスト目的】: 要素数1の場合、平均がその素材の品質値そのものになることを確認する
	# 【テスト内容】: 品質S(5)の素材1個のみを投入する
	# 【期待される動作】: 5/1 = 5.0 を返す
	# 🟡 信頼性: REQ-105の平均計算からの妥当な推測

	# 【テストデータ準備】: 単一要素の平均は自身に一致するという算術的性質を確認するケース
	# 【初期条件設定】: 品質上限Sを代表値として1個のみ用意する
	var materials: Array[MaterialInstance] = [
		_make_material(MaterialInstanceScript.Quality.S),
	]

	# 【実際の処理実行】: 要素数1でcalculate_base_qualityを呼び出す
	# 【処理内容】: 縮退ケース（要素数1）での平均計算を検証する
	var result: float = QualityCalculatorScript.calculate_base_quality(materials)

	# 【結果検証】: 戻り値が5.0であることを確認する
	# 【期待値確認】: 要素が1個なので合計=その要素、除数=1、平均=5.0
	assert_almost_eq(result, 5.0, 0.0001, "単一素材Sの平均は5.0になるべき") # 【確認内容】: 縮退ケースでの正確性 🟡


func test_品質B素材4個投入時に3_0を返す() -> void:
	# 【テスト目的】: 全素材が同一品質の場合、平均がその品質値に一致することを確認する
	# 【テスト内容】: 品質B(3)の素材4個を投入する
	# 【期待される動作】: (3+3+3+3)/4 = 3.0 を返す
	# 🟡 信頼性: REQ-105からの妥当な推測

	# 【テストデータ準備】: 非整数にならない一般的な複数素材ケースを網羅する
	# 【初期条件設定】: 中間品質Bを4個用意する
	var materials: Array[MaterialInstance] = [
		_make_material(MaterialInstanceScript.Quality.B),
		_make_material(MaterialInstanceScript.Quality.B),
		_make_material(MaterialInstanceScript.Quality.B),
		_make_material(MaterialInstanceScript.Quality.B),
	]

	# 【実際の処理実行】: 同一品質4個でcalculate_base_qualityを呼び出す
	# 【処理内容】: 割り切れる複数素材ケースでの平均計算を検証する
	var result: float = QualityCalculatorScript.calculate_base_quality(materials)

	# 【結果検証】: 戻り値が3.0であることを確認する
	# 【期待値確認】: 合計12 ÷ 4 = 3.0。3や3.somethingにならないこと
	assert_almost_eq(result, 3.0, 0.0001, "同一品質B×4の平均は3.0になるべき") # 【確認内容】: 割り切れる場合の正確性 🟡


func test_traits付き素材でも平均計算にtraitsが影響しない() -> void:
	# 【テスト目的】: 本関数がqualityのみを参照し、traitsを計算に含めないことを確認する
	# 【テスト内容】: traits付きの素材2個（C+2traits, A+1trait）を投入する
	# 【期待される動作】: traitsの有無・個数にかかわらず品質値のみで平均を返す
	# 🟡 信頼性: requirements.md「本関数が使用するプロパティ: qualityのみ。traitsは未使用」からの妥当な推測

	# 【テストデータ準備】: 特性ペナルティ(TASK-0016の責務)と基礎品質算出の責務分離を明示的に検証する
	# 【初期条件設定】: traits個数が異なる2個の素材を用意する
	var materials: Array[MaterialInstance] = [
		_make_material(MaterialInstanceScript.Quality.C, [&"sei", &"kin"] as Array[StringName]),
		_make_material(MaterialInstanceScript.Quality.A, [&"holy"] as Array[StringName]),
	]

	# 【実際の処理実行】: traits付き素材でcalculate_base_qualityを呼び出す
	# 【処理内容】: qualityのみを参照した平均計算を検証する
	var result: float = QualityCalculatorScript.calculate_base_quality(materials)

	# 【結果検証】: 戻り値が3.0（(2+4)/2）であることを確認する
	# 【期待値確認】: 特性は本関数の対象外。品質2と4の平均3.0のみが返る
	assert_almost_eq(result, 3.0, 0.0001, "traitsの有無にかかわらず品質のみで平均が算出されるべき") # 【確認内容】: 責務分離の保証 🟡


# ============================================================
# 異常系
# ============================================================

func test_空配列投入時に0_0を返しクラッシュしない() -> void:
	# 【テスト目的】: 空配列でゼロ除算・クラッシュせず0.0を返す防御的実装を確認する
	# 【テスト内容】: []を渡してcalculate_base_qualityを呼び出す
	# 【期待される動作】: 例外なく0.0が返る
	# 🟡 信頼性: EDGE-001、requirements.md「空配列時の戻り値: 0.0」

	# 【テストデータ準備】: 投入素材が0個という異常入力（EDGE-001）を再現する
	# 【初期条件設定】: 空のArray[MaterialInstance]を用意する
	var empty: Array[MaterialInstance] = []

	# 【実際の処理実行】: 空配列でcalculate_base_qualityを呼び出す
	# 【処理内容】: size()==0のガード処理を検証する
	var result: float = QualityCalculatorScript.calculate_base_quality(empty)

	# 【結果検証】: 戻り値が0.0であることを確認する
	# 【期待値確認】: ゼロ除算を回避し、後続処理へ安全な数値を引き継ぐ
	assert_almost_eq(result, 0.0, 0.0001, "空配列時は0.0を返すべき") # 【確認内容】: 防御的実装の確認 🟡


# ============================================================
# 境界値
# ============================================================

func test_品質D素材のみの平均が下限1_0になる() -> void:
	# 【テスト目的】: 品質スコアの下限D=1での平均計算の正確性・堅牢性を確認する
	# 【テスト内容】: 品質D(1)の素材3個を投入する
	# 【期待される動作】: 合計3 ÷ 3 = 1.0
	# 🟡 信頼性: data-model.md（Quality下限D=1）、REQ-105からの妥当な推測

	# 【テストデータ準備】: 低品質素材ばかりを投入した調合を再現する
	# 【初期条件設定】: 品質下限Dを3個用意する
	var materials: Array[MaterialInstance] = [
		_make_material(MaterialInstanceScript.Quality.D),
		_make_material(MaterialInstanceScript.Quality.D),
		_make_material(MaterialInstanceScript.Quality.D),
	]

	# 【実際の処理実行】: 品質下限素材のみでcalculate_base_qualityを呼び出す
	# 【処理内容】: 境界値（下限）での平均計算を検証する
	var result: float = QualityCalculatorScript.calculate_base_quality(materials)

	# 【結果検証】: 戻り値が1.0であることを確認する
	# 【期待値確認】: 最小スコアでも0や負値に落ちないこと
	assert_almost_eq(result, 1.0, 0.0001, "品質D×3の平均は下限1.0になるべき") # 【確認内容】: 下限境界での正確性 🟡


func test_品質S素材のみの平均が上限5_0になる() -> void:
	# 【テスト目的】: 品質スコアの上限S=5での平均計算の正確性を確認する
	# 【テスト内容】: 品質S(5)の素材3個を投入する
	# 【期待される動作】: 合計15 ÷ 3 = 5.0
	# 🟡 信頼性: data-model.md（Quality上限S=5）、REQ-105からの妥当な推測

	# 【テストデータ準備】: 最高品質素材のみでの調合を再現する
	# 【初期条件設定】: 品質上限Sを3個用意する
	var materials: Array[MaterialInstance] = [
		_make_material(MaterialInstanceScript.Quality.S),
		_make_material(MaterialInstanceScript.Quality.S),
		_make_material(MaterialInstanceScript.Quality.S),
	]

	# 【実際の処理実行】: 品質上限素材のみでcalculate_base_qualityを呼び出す
	# 【処理内容】: 境界値（上限）での平均計算を検証する
	var result: float = QualityCalculatorScript.calculate_base_quality(materials)

	# 【結果検証】: 戻り値が5.0であることを確認する
	# 【期待値確認】: 最大スコアでも上限を超えたり丸め誤差が出たりしないこと
	assert_almost_eq(result, 5.0, 0.0001, "品質S×3の平均は上限5.0になるべき") # 【確認内容】: 上限境界での正確性 🟡


func test_割り切れない平均でも精度を保ったfloatを返す() -> void:
	# 【テスト目的】: float採用の実効性（整数除算バグの検出）と精度を確認する
	# 【テスト内容】: 品質D(1), D(1), S(5)（合計7、要素3）で非終端小数を発生させる
	# 【期待される動作】: 7/3 = 2.333... を精度を保って返す（整数除算で2に切り捨てられない）
	# 🔴 信頼性: 元資料に明示されない追加ケース。float採用の妥当性検証としての合理的補完

	# 【テストデータ準備】: 整数合計が要素数で割り切れない境界を意図的に発生させる
	# 【初期条件設定】: D, D, Sの3個（合計7）を用意する
	var materials: Array[MaterialInstance] = [
		_make_material(MaterialInstanceScript.Quality.D),
		_make_material(MaterialInstanceScript.Quality.D),
		_make_material(MaterialInstanceScript.Quality.S),
	]

	# 【実際の処理実行】: 非終端小数になる組み合わせでcalculate_base_qualityを呼び出す
	# 【処理内容】: int除算の罠(7/3==2)を検出する
	var result: float = QualityCalculatorScript.calculate_base_quality(materials)

	# 【結果検証】: 戻り値が7.0/3.0の許容誤差内であることを確認する
	# 【期待値確認】: 整数除算で2に切り捨てられないこと。float(sum)/size相当の計算であること
	assert_almost_eq(result, 7.0 / 3.0, 0.0001, "非終端小数の平均は精度を保ったfloatで返るべき") # 【確認内容】: 整数除算バグの非混入確認 🔴


# ============================================================
# TASK-0016: QualityCalculator.apply_trait_penalty（品質ペナルティ適用）
# 対象: features/alchemy/logic/quality_calculator.gd apply_trait_penalty（Redフェーズ用スタブのみ実装）
# 参照: docs/implements/atelier-alchemy-core/TASK-0016/apply-trait-penalty-testcases.md
# ============================================================

# ------------------------------------------------------------
# 正常系
# ------------------------------------------------------------

func test_貢献度系1個発現時に基礎品質A4がB3へ1段減算される() -> void:
	# 【テスト目的】: SUPPORT以外の発現特性1個で品質が正確に1段階減算されることを確認する
	# 【テスト内容】: base_quality=4.0、貢献度系(CONTRIBUTION)1件を渡す
	# 【期待される動作】: penalty_count=1 → 4.0-1=3.0 → クランプ・丸め後 Quality.B
	# 🟡 信頼性: TASK-0016.md テストケース2 / REQ-111の基本ルールからの妥当な推測（TC-16-N01）

	# 【テストデータ準備】: 下限・上限にかからない中間品質A(4)と貢献度系1件を用意する
	# 【初期条件設定】: activated_traitsはArray[TraitDefinition]型で1件のみ
	var traits: Array[TraitDefinition] = [
		_make_trait(&"holy", TraitDefinitionScript.Category.CONTRIBUTION),
	]

	# 【実際の処理実行】: apply_trait_penaltyを呼び出す
	# 【処理内容】: penalty_count算出→減算→クランプ→丸めの一連を検証する
	var result = QualityCalculatorScript.apply_trait_penalty(4.0, traits)

	# 【結果検証】: 戻り値がQuality.B(3)であることを確認する
	# 【期待値確認】: 4-1=3がB(3)に一致する（REQ-111）
	assert_eq(result, MaterialInstanceScript.Quality.B, "発現特性1個で1段減算されるべき") # 【確認内容】: 1個=1段減 🟡


func test_貢献度系2個発現時に基礎品質A4からスコア2C相当へ加算的に減算される() -> void:
	# 【テスト目的】: 発現特性が複数の場合、ペナルティが加算的に積み重なることを確認する（REQ-112）
	# 【テスト内容】: base_quality=4.0、貢献度系(CONTRIBUTION)2件（聖・浄）を渡す
	# 【期待される動作】: penalty_count=2 → 4.0-2=2.0 → Quality.C(2)
	# 🟡 信頼性: TASK-0016.md テストケース3 / REQ-112「加算的に積み重なる」からの妥当な推測（TC-16-N02）

	# 【テストデータ準備】: REQ-112「加算的」を検証するため、SUPPORT以外の特性2件を用意する
	# 【初期条件設定】: trait_activation_test.gdの系統内共存ケース（聖・浄）を流用する
	var traits: Array[TraitDefinition] = [
		_make_trait(&"holy", TraitDefinitionScript.Category.CONTRIBUTION),
		_make_trait(&"cleanse", TraitDefinitionScript.Category.CONTRIBUTION),
	]

	# 【実際の処理実行】: apply_trait_penaltyを呼び出す
	# 【処理内容】: 2件分の減算が独立にではなく合算されることを検証する
	var result = QualityCalculatorScript.apply_trait_penalty(4.0, traits)

	# 【結果検証】: 戻り値がQuality.C(2)であることを確認する
	# 【期待値確認】: 2件分の減算4-2=2（REQ-112）
	assert_eq(result, MaterialInstanceScript.Quality.C, "発現特性2個で加算的に2段減算されるべき") # 【確認内容】: 加算モデルの確認 🟡


func test_貢献度系1個と補助系1個で1段減算後に1段加算されA4へ戻る() -> void:
	# 【テスト目的】: SUPPORTカテゴリが減算対象外であり、かつ減算後に別途+1段加算されることを確認する
	# 【テスト内容】: base_quality=4.0、貢献度系(CONTRIBUTION)1件＋触媒(SUPPORT)1件を渡す
	# 【期待される動作】: penalty_count=1（触媒は除外）→4.0-1=3.0、support_bonus_count=1→3.0+1=4.0→Quality.A
	# 🟡 信頼性: TASK-0016.md テストケース4 / REQ-108「触媒＝品質+1段」・REQ-111「減算後に加算」より（TC-16-N03）

	# 【テストデータ準備】: 「食い合い（減算）」と「触媒補正（加算）」の両立を検証する
	# 【初期条件設定】: 貢献度系1件とSUPPORT1件を混在させる
	var traits: Array[TraitDefinition] = [
		_make_trait(&"holy", TraitDefinitionScript.Category.CONTRIBUTION),
		_make_trait(&"catalyst", TraitDefinitionScript.Category.SUPPORT),
	]

	# 【実際の処理実行】: apply_trait_penaltyを呼び出す
	# 【処理内容】: 触媒がpenalty_countに含まれず、減算後にsupport_bonus_countが加算されることを検証する
	var result = QualityCalculatorScript.apply_trait_penalty(4.0, traits)

	# 【結果検証】: 戻り値がQuality.A(4)であることを確認する
	# 【期待値確認】: (4-1)+1=4（REQ-108, REQ-111）
	assert_eq(result, MaterialInstanceScript.Quality.A, "触媒により減算分が相殺されA(4)へ戻るべき") # 【確認内容】: SUPPORTの二重の特別扱い 🟡


func test_報酬系1個発現時も貢献度系と同様にA4がB3へ1段減算される() -> void:
	# 【テスト目的】: 減算判定がcategory!=SUPPORTであり、REWARDも減算対象になることを確認する
	# 【テスト内容】: base_quality=4.0、報酬系(REWARD)1件を渡す
	# 【期待される動作】: penalty_count=1（REWARDはSUPPORTでないため計上）→4.0-1=3.0→Quality.B
	# 🟡 信頼性: 要件定義§2 step1「category!=SUPPORTの件数」からの妥当な推測（TC-16-N04）

	# 【テストデータ準備】: 「SUPPORTのみが特別扱い、REWARDは通常の減算対象」を明示的に検証する
	# 【初期条件設定】: 報酬系(REWARD)1件のみを用意する
	var traits: Array[TraitDefinition] = [
		_make_trait(&"gold", TraitDefinitionScript.Category.REWARD),
	]

	# 【実際の処理実行】: apply_trait_penaltyを呼び出す
	# 【処理内容】: REWARD取りこぼし（CONTRIBUTIONのみ減算対象にする実装ミス）を検出する
	var result = QualityCalculatorScript.apply_trait_penalty(4.0, traits)

	# 【結果検証】: 戻り値がQuality.B(3)であることを確認する
	# 【期待値確認】: REWARDはcategory!=SUPPORTを満たすためpenalty_countに含まれる（4-1=3）
	assert_eq(result, MaterialInstanceScript.Quality.B, "REWARDも減算対象に含まれ1段減算されるべき") # 【確認内容】: カテゴリ分岐条件の確認 🟡


# ------------------------------------------------------------
# 異常系
# ------------------------------------------------------------

func test_発現特性0個の空配列でもペナルティが発生せず基礎品質を維持する() -> void:
	# 【テスト目的】: 発現特性が1つもない調合でクラッシュせず、減算・加算いずれも発生しないことを確認する
	# 【テスト内容】: base_quality=3.0、activated_traits=[]（空配列）を渡す
	# 【期待される動作】: penalty_count=0, support_bonus_count=0で3.0を維持し、丸め後もQuality.B
	# 🟡 信頼性: TASK-0016.md テストケース5 / REQ-111より0個は減算なしという妥当な推測（TC-16-E01）

	# 【テストデータ準備】: 「特性を全く狙わない安全な調合」という正常な縮退ケースを再現する
	# 【初期条件設定】: activated_traitsを空のArray[TraitDefinition]にする
	var traits: Array[TraitDefinition] = []

	# 【実際の処理実行】: apply_trait_penaltyを呼び出す
	# 【処理内容】: for/件数カウントが0件でも安全に0を返すことを検証する
	var result = QualityCalculatorScript.apply_trait_penalty(3.0, traits)

	# 【結果検証】: 戻り値がQuality.B(3)のまま変化しないことを確認する
	# 【期待値確認】: 減算・加算とも発生せず基礎品質がそのまま維持される
	assert_eq(result, MaterialInstanceScript.Quality.B, "発現特性0個ではペナルティが発生せず基礎品質を維持すべき") # 【確認内容】: 0個境界での非変化 🟡


# ------------------------------------------------------------
# 境界値
# ------------------------------------------------------------

func test_基礎品質D1で特性1個以上発現してもD1を下回らない() -> void:
	# 【テスト目的】: 下限クランプ（Critical）が正しく機能することを確認する
	# 【テスト内容】: base_quality=1.0、貢献度系(CONTRIBUTION)1件を渡す
	# 【期待される動作】: 1.0-1=0.0がmax(0.0,1.0)=1.0に補正され、丸め後もQuality.D
	# 🔵 信頼性: acceptance-criteria.md TC-101-B02（必須・Critical）より、ほぼ推測なし（TC-16-B01）

	# 【テストデータ準備】: 低品質素材ばかりで特性を発現させた「食い合い」の極端ケース（EDGE-102）を再現する
	# 【初期条件設定】: base_qualityを下限D(1.0)、貢献度系1件を用意する
	var traits: Array[TraitDefinition] = [
		_make_trait(&"holy", TraitDefinitionScript.Category.CONTRIBUTION),
	]

	# 【実際の処理実行】: apply_trait_penaltyを呼び出す
	# 【処理内容】: 品質スコアが0や負値になり後続のenumキャストが不正値になる事故を防ぐことを検証する
	var result = QualityCalculatorScript.apply_trait_penalty(1.0, traits)

	# 【結果検証】: 戻り値がQuality.D(1)であることを確認する
	# 【期待値確認】: クランプ前0.0がmax(0.0,1.0)=1.0に補正され、丸め後もD(1)
	assert_eq(result, MaterialInstanceScript.Quality.D, "下限D保証によりD未満には落ちないべき") # 【確認内容】: 下限クランプ(Critical)の確認 🔵


func test_補助系2個投入で上限S5を超えないようクランプされる() -> void:
	# 【テスト目的】: 上限クランプ（防御的実装）が正しく機能することを確認する
	# 【テスト内容】: base_quality=4.0、触媒(SUPPORT)2件を渡す
	# 【期待される動作】: penalty_count=0, support_bonus_count=2→4.0+2=6.0がmin(6.0,5.0)=5.0に補正されQuality.S
	# 🟡 信頼性: 要件定義§3「上限保証（防御的実装）」より。REQ本文に明記なくQuality値域からの妥当な推測（TC-16-B02）

	# 【テストデータ準備】: 触媒を複数投入した場合にenum値域外へ出ないことを検証する
	# 【初期条件設定】: SUPPORT2件のみ（減算対象なし）を用意する
	var traits: Array[TraitDefinition] = [
		_make_trait(&"catalyst_1", TraitDefinitionScript.Category.SUPPORT),
		_make_trait(&"catalyst_2", TraitDefinitionScript.Category.SUPPORT),
	]

	# 【実際の処理実行】: apply_trait_penaltyを呼び出す
	# 【処理内容】: SUPPORT加算モデルがenum値域を破らないことを検証する
	var result = QualityCalculatorScript.apply_trait_penalty(4.0, traits)

	# 【結果検証】: 戻り値がQuality.S(5)であることを確認する
	# 【期待値確認】: 6.0がmin(6.0,5.0)=5.0に補正され、丸め後S(5)
	assert_eq(result, MaterialInstanceScript.Quality.S, "上限クランプによりS(5)を超えないべき") # 【確認内容】: 上限クランプ(防御的実装)の確認 🟡


func test_発現特性0個で基礎品質2_5がroundで一貫して丸められる() -> void:
	# 【テスト目的】: float→Quality enum変換ポイントでround()（四捨五入）が採用されていることを確認する
	# 【テスト内容】: base_quality=2.5、activated_traits=[]（減算・加算なしで丸めのみを純粋検証）
	# 【期待される動作】: round(2.5)=3.0（Godotは0から離れる方向へ丸める）→Quality.B(3)
	# 🟡 信頼性: 要件定義§3「丸め方式制約（round採用・暫定）」より。丸め境界値の期待値は妥当な推測（TC-16-B03）

	# 【テストデータ準備】: TASK-0013が返す非整数平均（例2.5）が丸めのみで観測できるケースを用意する
	# 【初期条件設定】: activated_traitsを空にし減算0で丸め挙動を単独で観測する
	var traits: Array[TraitDefinition] = []

	# 【実際の処理実行】: apply_trait_penaltyを呼び出す
	# 【処理内容】: 切り捨て（int()）実装ならC(2)になるため、round()採用の実効を検証する
	var result = QualityCalculatorScript.apply_trait_penalty(2.5, traits)

	# 【結果検証】: 戻り値がQuality.B(3)であることを確認する
	# 【期待値確認】: round(2.5)=3.0を前提とし、切り捨てのC(2)にならないこと
	assert_eq(result, MaterialInstanceScript.Quality.B, "2.5はroundで3(B)へ丸められるべき") # 【確認内容】: 丸め方式(round採用)の確認 🟡


func test_基礎品質A4で貢献度系4個と触媒1個により下限D1にクランプされる() -> void:
	# 【テスト目的】: penalty_countとsupport_bonus_countが同時に非0の複合演算＋下限クランプの総合動作を確認する
	# 【テスト内容】: base_quality=4.0、貢献度系(CONTRIBUTION)4件＋触媒(SUPPORT)1件を渡す
	# 【期待される動作】: penalty_count=4, support_bonus_count=1→4.0-4+1=1.0→下限max(1.0,1.0)=1.0→Quality.D
	# 🟡 信頼性: REQ-108・REQ-111・REQ-112の複合適用からの妥当な推測（複合境界の専用TCは未整備、REQ本文から導出）（TC-16-B04）

	# 【テストデータ準備】: 特性を多数狙いつつ触媒で品質を補おうとする「欲張り調合」を再現する
	# 【初期条件設定】: 貢献度系4件と触媒1件を混在させる
	var traits: Array[TraitDefinition] = [
		_make_trait(&"holy", TraitDefinitionScript.Category.CONTRIBUTION),
		_make_trait(&"cleanse", TraitDefinitionScript.Category.CONTRIBUTION),
		_make_trait(&"heal", TraitDefinitionScript.Category.CONTRIBUTION),
		_make_trait(&"gold", TraitDefinitionScript.Category.CONTRIBUTION),
		_make_trait(&"catalyst", TraitDefinitionScript.Category.SUPPORT),
	]

	# 【実際の処理実行】: apply_trait_penaltyを呼び出す
	# 【処理内容】: 演算順序（減算→加算→クランプ）が要件定義§2のstep順に一致することを検証する
	var result = QualityCalculatorScript.apply_trait_penalty(4.0, traits)

	# 【結果検証】: 戻り値がQuality.D(1)であることを確認する
	# 【期待値確認】: (4-4+1)=1.0が下限max(1.0,1.0)=1.0に一致し、触媒1個では大量の食い合いを相殺しきれない
	assert_eq(result, MaterialInstanceScript.Quality.D, "複合境界でも下限D保証が優先されるべき") # 【確認内容】: 複合演算+下限クランプの確認 🟡
