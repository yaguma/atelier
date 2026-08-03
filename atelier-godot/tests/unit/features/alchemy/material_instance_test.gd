extends GutTest
# TASK-0011: MaterialInstance（素材インスタンス）のユニットテスト
# 対象: features/alchemy/data/material_instance.gd（未実装。Redフェーズ用）
# 参照: docs/implements/trait-definition-material-instance/TASK-0011/trait-definition-material-instance-testcases.md
#
# 【備考】: MaterialInstanceはRefCounted継承かつ副作用を持たないデータモデルのため、
#          before_each相当の状態初期化は不要。各テストはローカル変数のみで完結する。

const MaterialInstanceScript := preload("res://features/alchemy/data/material_instance.gd")


# ============================================================
# 正常系
# ============================================================

func test_initが明示引数で正しく初期化する() -> void:
	# 【テスト目的】: _initに渡したid/quality/traitsがインスタンスへ正しく格納されることを確認する
	# 【テスト内容】: MaterialInstance.new("mat_001", Quality.A, [&"seiketsu"])で生成する
	# 【期待される動作】: 各プロパティが対応する引数値と一致する
	# 🔵 信頼性: data-model.mdの_initシグネチャ、テストケース定義書 N-4 より

	# 【テストデータ準備】: 品質A・特性1個という在庫個体の典型例を用意する
	# 【初期条件設定】: id="mat_001", quality=Quality.A, traits=[&"seiketsu"]
	var traits: Array[StringName] = [&"seiketsu"]
	var instance := MaterialInstanceScript.new("mat_001", MaterialInstanceScript.Quality.A, traits)

	# 【実際の処理実行】: _init経由で生成されたインスタンスの各プロパティを読み取る
	# 【処理内容】: コンストラクタによる代入結果を確認する

	# 【結果検証】: id/quality/traitsがそれぞれ指定値と一致することを確認する
	# 【期待値確認】: data-model.mdの_initシグネチャどおりの代入が期待される
	assert_eq(instance.id, "mat_001", "idが指定値と一致するべき") # 【確認内容】: idの代入
	assert_eq(instance.quality, MaterialInstanceScript.Quality.A, "qualityが指定値と一致するべき") # 【確認内容】: qualityの代入
	assert_eq(instance.traits, [&"seiketsu"], "traitsが指定値と一致するべき") # 【確認内容】: traits配列の要素・順序保持


func test_seed_idを設定すると保持される() -> void:
	# 【テスト目的】: _initの引数に含まれないseed_idを生成後に代入した場合、値が保持されることを確認する
	# 【テスト内容】: 生成後にinstance.seed_id = &"seed_holy_herb"を代入する
	# 【期待される動作】: seed_idが指定したStringNameを保持する
	# 🟡 信頼性: data-model.mdにseed_idの定義あり。_initに含まれない点はrequirements.md 2.2の補完、テストケース定義書 N-5 より

	# 【テストデータ準備】: 庭からの収穫元（種ID）を紐付ける在庫管理シナリオを代表させる
	# 【初期条件設定】: デフォルト引数でインスタンスを生成する
	var instance := MaterialInstanceScript.new()

	# 【実際の処理実行】: 生成後にseed_idを代入する
	# 【処理内容】: _init非対象プロパティへの後付け代入を実行する
	instance.seed_id = &"seed_holy_herb"

	# 【結果検証】: seed_idが代入値と一致することを確認する
	# 【期待値確認】: data-model.mdにseed_id: StringNameが定義されており、在庫が由来種を辿れる必要がある
	assert_eq(instance.seed_id, &"seed_holy_herb", "seed_idが代入値を保持するべき") # 【確認内容】: seed_idの代入・保持


# ============================================================
# 異常系
# ============================================================

func test_traits3個投入時も例外を投げず保持する() -> void:
	# 【テスト目的】: REQ-104の想定範囲(0〜2個)を超える過剰投入時も、データモデルが例外を投げず保持することを確認する
	# 【テスト内容】: traits=[&"a", &"b", &"c"]（3個）でMaterialInstanceを生成する
	# 【期待される動作】: 例外・エラーを発生させず生成でき、traits.size()==3として保持される
	# 🟡 信頼性: requirements.md 4.2注記・4.3、TASK-0011.md注意事項（REQ-111/REQ-115はロジック層）より、テストケース定義書 E-1 より

	# 【テストデータ準備】: 通常のマスターデータ生成では発生しない過剰保持ケースを再現する
	# 【初期条件設定】: 3個のStringNameを持つtraits配列を用意する
	var traits: Array[StringName] = [&"a", &"b", &"c"]

	# 【実際の処理実行】: 過剰なtraitsを渡してMaterialInstanceを生成する
	# 【処理内容】: データモデルは拒否ロジックを内包しないため、そのまま代入されることを期待する
	var instance := MaterialInstanceScript.new("mat_over", MaterialInstanceScript.Quality.D, traits)

	# 【結果検証】: traitsが3要素のまま保持されていることを確認する
	# 【期待値確認】: データモデルが破綻せず、過剰保持を後段（ロジック層）が検出・是正できる状態を保つ
	assert_eq(instance.traits.size(), 3, "traits3個投入時も例外を投げずsize()==3で保持されるべき") # 【確認内容】: 拒否責務をロジック層に委譲した堅牢な保持


# ============================================================
# 境界値
# ============================================================

func test_quality_enumが最小D1から最大S5の整数評価に一致する() -> void:
	# 【テスト目的】: Quality enumがD=1,C=2,B=3,A=4,S=5に対応することを確認する
	# 【テスト内容】: 各Quality値を整数として評価する
	# 【期待される動作】: それぞれ1,2,3,4,5に一致する
	# 🔵 信頼性: REQ-103、data-model.mdのQuality定義、テストケース定義書 B-1 より

	# 【テストデータ準備】: 品質スコアの下限(D=1)と上限(S=5)を含む全5値を検証する
	# 【初期条件設定】: enum値の直接参照のみでインスタンス生成は不要

	# 【実際の処理実行】: 各Quality enum値を整数評価する
	# 【処理内容】: int()キャストによる整数マッピングを確認する

	# 【結果検証】: enum宣言順と整数値が連続的に一致することを確認する
	# 【期待値確認】: 明示的なD=1始まりであり、暗黙のゼロ始まりではないこと
	assert_eq(int(MaterialInstanceScript.Quality.D), 1, "Quality.Dは1であるべき") # 【確認内容】: 品質下限のマッピング
	assert_eq(int(MaterialInstanceScript.Quality.C), 2, "Quality.Cは2であるべき") # 【確認内容】: 中間値のマッピング
	assert_eq(int(MaterialInstanceScript.Quality.B), 3, "Quality.Bは3であるべき") # 【確認内容】: 中間値のマッピング
	assert_eq(int(MaterialInstanceScript.Quality.A), 4, "Quality.Aは4であるべき") # 【確認内容】: 中間値のマッピング
	assert_eq(int(MaterialInstanceScript.Quality.S), 5, "Quality.Sは5であるべき") # 【確認内容】: 品質上限のマッピング


func test_デフォルト引数省略時に既定値で初期化される() -> void:
	# 【テスト目的】: _initの全引数を省略した最小呼び出しが、定義済みデフォルトどおりに初期化されることを確認する
	# 【テスト内容】: MaterialInstance.new()を引数なしで呼び出す
	# 【期待される動作】: id=""、quality=Quality.D、traits=[]になる
	# 🔵 信頼性: data-model.mdの_initデフォルト引数、テストケース定義書 B-2 より

	# 【テストデータ準備】: プレースホルダー生成やテスト用ダミー個体の生成で引数省略が使われる場面を再現する
	# 【初期条件設定】: 引数なしで生成する

	# 【実際の処理実行】: 引数なしでMaterialInstanceを生成する
	# 【処理内容】: data-model.mdの_init(p_id="", p_quality=Quality.D, p_traits=[])の全デフォルトを検証する
	var instance := MaterialInstanceScript.new()

	# 【結果検証】: 省略時のプロパティが定義済みデフォルトと一致することを確認する
	# 【期待値確認】: 明示引数版(N-4)と初期化契約が矛盾しないこと
	assert_eq(instance.id, "", "id省略時は空文字列であるべき") # 【確認内容】: idのデフォルト値
	assert_eq(instance.quality, MaterialInstanceScript.Quality.D, "quality省略時はQuality.Dであるべき") # 【確認内容】: qualityのデフォルト値
	assert_eq(instance.traits, [], "traits省略時は空配列であるべき") # 【確認内容】: traitsのデフォルト値（null化しないこと）


func test_traits0個下限でMaterialInstanceを生成できる() -> void:
	# 【テスト目的】: REQ-104が定める特性タグ個数レンジ「0〜2個」の下限で正常生成できることを確認する
	# 【テスト内容】: traits=[]（0個）でMaterialInstanceを生成する
	# 【期待される動作】: 生成が成功しtraits.size()==0になる
	# 🔵 信頼性: REQ-104、requirements.md 4.2、テストケース定義書 B-3 より

	# 【テストデータ準備】: 特性を持たない素材（水・鉱石など）も正当な在庫個体として成立することを確認する
	# 【初期条件設定】: 空配列のtraitsを用意する
	var traits: Array[StringName] = []

	# 【実際の処理実行】: 空のtraitsを渡してMaterialInstanceを生成する
	# 【処理内容】: 特性タグ個数レンジ下限での生成を検証する
	var instance := MaterialInstanceScript.new("mat_none", MaterialInstanceScript.Quality.C, traits)

	# 【結果検証】: traitsが空配列のまま保持されていることを確認する
	# 【期待値確認】: 空配列を保持し、要素アクセス無しでも破綻しないこと
	assert_eq(instance.traits.size(), 0, "traits0個(下限)でsize()==0で生成できるべき") # 【確認内容】: 特性なし在庫の成立


func test_traits2個上限でMaterialInstanceを生成できる() -> void:
	# 【テスト目的】: REQ-104が定める特性タグ個数レンジ「0〜2個」の上限で正常生成できることを確認する
	# 【テスト内容】: traits=[&"sei", &"kin"]（2個）でMaterialInstanceを生成する
	# 【期待される動作】: 生成が成功しtraits.size()==2、要素順序が入力と一致する
	# 🔵 信頼性: REQ-104、requirements.md 4.2、テストケース定義書 B-4 より

	# 【テストデータ準備】: 貢献度系＋報酬系など2系統を持つ複合素材が成立することを確認する
	# 【初期条件設定】: 2個のStringNameを持つtraits配列を用意する
	var traits: Array[StringName] = [&"sei", &"kin"]

	# 【実際の処理実行】: 2個のtraitsを渡してMaterialInstanceを生成する
	# 【処理内容】: 特性タグ個数レンジ上限での生成を検証する
	var instance := MaterialInstanceScript.new("mat_double", MaterialInstanceScript.Quality.A, traits)

	# 【結果検証】: traitsが2要素のまま順序を保って保持されていることを確認する
	# 【期待値確認】: 2要素が欠落・重複なく保持されること
	assert_eq(instance.traits.size(), 2, "traits2個(上限)でsize()==2で生成できるべき") # 【確認内容】: 複合特性素材の成立
	assert_eq(instance.traits, [&"sei", &"kin"], "traitsの要素順序が入力と一致するべき") # 【確認内容】: 要素順序の保持
