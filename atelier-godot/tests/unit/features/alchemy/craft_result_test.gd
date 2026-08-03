extends GutTest
# TASK-0012: CraftResult（調合結果）のユニットテスト
# 対象: features/alchemy/data/craft_result.gd（未実装。Redフェーズ用）
# 参照: docs/implements/atelier-alchemy-core/TASK-0012/craft-data-model-testcases.md
#
# 【備考】: CraftResultはRefCounted継承かつ副作用を持たないデータモデルのため、
#          before_each相当の状態初期化は不要。各テストはローカル変数のみで完結する。
# 【対象範囲の明確化】: rejected_categoryの「不発なし」無効値表現はTASK-0015で確定するため、
#          本テストでは値依存の検証を行わない（型定義の存在のみ後続タスクで扱う）。

const CraftResultScript := preload("res://features/alchemy/data/craft_result.gd")
const MaterialInstanceScript := preload("res://features/alchemy/data/material_instance.gd")
const TraitDefinitionScript := preload("res://features/alchemy/data/trait_definition.gd")


# ============================================================
# 正常系
# ============================================================

func test_全フィールドを保持しactivated_traitsを複数2件保持できる() -> void:
	# 【テスト目的】: base_quality/final_quality/activated_traits/contribution/rewardの一括保持と、
	#              複数特性の同時保持（REQ-112）を確認する
	# 【テスト内容】: 各フィールドに値を設定したCraftResultを生成し、各プロパティを参照する
	# 【期待される動作】: 各値がそのまま取得でき、activated_traits.size() == 2
	# 🔵 信頼性: TASK-0012.md 単体テスト要件テストケース3 / data-model.md「調合結果」/ REQ-105, REQ-111, REQ-112 より

	# 【テストデータ準備】: ペナルティ前後で品質が異なる（A→B）現実的なケースを用意する
	# 【初期条件設定】: TraitDefinitionを2件生成し、CraftResultを生成する
	var trait_a := TraitDefinitionScript.new()
	trait_a.id = &"trait_a"
	var trait_b := TraitDefinitionScript.new()
	trait_b.id = &"trait_b"
	var traits: Array[TraitDefinition] = [trait_a, trait_b]
	var result := CraftResultScript.new()

	# 【実際の処理実行】: 各プロパティへ値を代入する
	# 【処理内容】: base_quality/final_quality/activated_traits/contribution/rewardへの代入を実行する
	result.base_quality = MaterialInstanceScript.Quality.A
	result.final_quality = MaterialInstanceScript.Quality.B
	result.activated_traits = traits
	result.contribution = 15.0
	result.reward = 30.0

	# 【結果検証】: 各プロパティが設定値のまま取得できることを確認する
	# 【期待値確認】: CraftResultは計算過程をブラックボックス化させないための「器」であり、各フィールドを欠落なく保持する
	assert_eq(result.base_quality, MaterialInstanceScript.Quality.A, "base_qualityが指定値と一致するべき") # 【確認内容】: 基礎品質の保持
	assert_eq(result.final_quality, MaterialInstanceScript.Quality.B, "final_qualityが指定値と一致するべき") # 【確認内容】: 最終品質の保持
	assert_eq(result.activated_traits.size(), 2, "activated_traitsが2件保持されるべき") # 【確認内容】: REQ-112の同時発現の複数保持
	assert_eq(result.activated_traits[0], trait_a, "activated_traits[0]がtrait_aと一致するべき") # 【確認内容】: 配列要素の順序保持
	assert_eq(result.activated_traits[1], trait_b, "activated_traits[1]がtrait_bと一致するべき") # 【確認内容】: 配列要素の順序保持
	assert_eq(result.contribution, 15.0, "contributionが指定値と一致するべき") # 【確認内容】: 最終貢献度の保持
	assert_eq(result.reward, 30.0, "rewardが指定値と一致するべき") # 【確認内容】: 最終報酬の保持


func test_base_qualityとfinal_qualityが独立した値として保持される() -> void:
	# 【テスト目的】: ペナルティ適用前後の品質フィールドが混同されず別個に保持されることを確認する
	# 【テスト内容】: base_quality=S, final_quality=Dという極端な差を設定し、双方を参照する
	# 【期待される動作】: 2つの品質フィールドに異なる値を設定でき、それぞれ独立に取得できる
	# 🔵 信頼性: data-model.md「調合結果」/ TASK-0012.md 注意事項（base/final分離の設計意図）/ REQ-105, REQ-111 より

	# 【テストデータ準備】: ペナルティで最大幅（S→D）低下した極端ケースを用意する
	# 【初期条件設定】: CraftResultを生成する
	var result := CraftResultScript.new()

	# 【実際の処理実行】: base_quality/final_qualityへそれぞれ異なる値を代入する
	# 【処理内容】: 分離設計の妥当性を検証するための代入を実行する
	result.base_quality = MaterialInstanceScript.Quality.S
	result.final_quality = MaterialInstanceScript.Quality.D

	# 【結果検証】: 双方が互いに上書きされず独立して取得できることを確認する
	# 【期待値確認】: REQ-105（基礎品質）とREQ-111（最終品質）を明示的に分離保持することがCraftResult新設の目的
	assert_eq(result.base_quality, MaterialInstanceScript.Quality.S, "base_qualityはfinal_qualityの影響を受けないべき") # 【確認内容】: 基礎品質の独立性
	assert_eq(result.final_quality, MaterialInstanceScript.Quality.D, "final_qualityはbase_qualityの影響を受けないべき") # 【確認内容】: 最終品質の独立性


# ============================================================
# 異常系
# ============================================================

func test_activated_traitsに想定超過3件を設定しても例外を投げず保持する() -> void:
	# 【テスト目的】: 系統排他制御（REQ-115）適用前や後段の想定を超える件数が渡っても、
	#              データモデルが例外を投げず堅牢に保持することを確認する
	# 【テスト内容】: activated_traits=[trait_a, trait_b, trait_c]（3件）を設定する
	# 【期待される動作】: 例外・エラーを発生させず生成でき、activated_traits.size() == 3
	# 🟡 信頼性: MaterialInstanceテストケース定義書 E-1の方針踏襲 / requirements.md 3章（拒否責務の委譲） より

	# 【テストデータ準備】: 通常の系統排他制御後は想定しにくい過剰保持ケースを再現する
	# 【初期条件設定】: TraitDefinitionを3件生成する
	var trait_a := TraitDefinitionScript.new()
	trait_a.id = &"trait_a"
	var trait_b := TraitDefinitionScript.new()
	trait_b.id = &"trait_b"
	var trait_c := TraitDefinitionScript.new()
	trait_c.id = &"trait_c"
	var traits: Array[TraitDefinition] = [trait_a, trait_b, trait_c]
	var result := CraftResultScript.new()

	# 【実際の処理実行】: 過剰なactivated_traitsを代入する
	# 【処理内容】: データモデルは拒否ロジックを内包しないため、そのまま代入されることを期待する
	result.activated_traits = traits

	# 【結果検証】: activated_traitsが3要素のまま保持されていることを確認する
	# 【期待値確認】: データモデルが破綻せず、過剰保持を後段（ロジック層）が検出・是正できる状態を保つ
	assert_eq(result.activated_traits.size(), 3, "activated_traits3件設定時も例外を投げずsize()==3で保持されるべき") # 【確認内容】: 拒否責務をロジック層に委譲した堅牢な保持


# ============================================================
# 境界値
# ============================================================

func test_activated_traitsのデフォルトが空配列である() -> void:
	# 【テスト目的】: 特性が1つも発現しなかった調合結果の下限ケース（null化しないこと）を確認する
	# 【テスト内容】: CraftResult.new()（activated_traits未設定）を生成する
	# 【期待される動作】: activated_traits.size() == 0（nullではなく空のtyped Array）
	# 🔵 信頼性: TASK-0012.md 単体テスト要件テストケース4 / data-model.md `activated_traits = []` より

	# 【テストデータ準備】: 発現特性ゼロの調合（素材が特性を持たない等）で常時発生しうる正当なケースを再現する
	# 【初期条件設定】: activated_traitsを設定せずCraftResultを生成する
	var result := CraftResultScript.new()

	# 【実際の処理実行】: 生成直後のactivated_traitsを読み取る
	# 【処理内容】: 未設定時のデフォルト値を確認する

	# 【結果検証】: 空配列であり要素アクセス前でもsize()が安全に呼べることを確認する
	# 【期待値確認】: 未初期化nullによる後段クラッシュを防ぐ
	assert_eq(result.activated_traits.size(), 0, "activated_traitsはデフォルトで空配列(size()==0)であるべき") # 【確認内容】: REQ-112の下限（発現特性ゼロ）


func test_contributionとrewardのデフォルトが0_0である() -> void:
	# 【テスト目的】: 貢献度・報酬が未計算（最小値）の初期状態を確認する
	# 【テスト内容】: CraftResult.new()（contribution/reward未設定）を生成する
	# 【期待される動作】: contribution == 0.0 かつ reward == 0.0
	# 🔵 信頼性: data-model.md「調合結果」`contribution/reward = 0.0` / REQ-109, REQ-110 より

	# 【テストデータ準備】: AlchemyResolver.craft()（TASK-0018）が値を埋める前の生成直後の状態を再現する
	# 【初期条件設定】: contribution/rewardを設定せずCraftResultを生成する
	var result := CraftResultScript.new()

	# 【実際の処理実行】: 生成直後のcontribution/rewardを読み取る
	# 【処理内容】: 未初期化状態でのデフォルト値を確認する

	# 【結果検証】: 両プロパティがfloatの0.0で初期化されていることを確認する
	# 【期待値確認】: 後段で加算していく起点として妥当な値であること
	assert_eq(result.contribution, 0.0, "contributionはデフォルト0.0であるべき") # 【確認内容】: 最終貢献度のデフォルト値
	assert_eq(result.reward, 0.0, "rewardはデフォルト0.0であるべき") # 【確認内容】: 最終報酬のデフォルト値


func test_activated_traitsに1件同時発現の下限を保持できる() -> void:
	# 【テスト目的】: 「複数保持」と「空」の中間、発現特性1件という最も一般的な下限ケースを確認する
	# 【テスト内容】: activated_traits=[trait_a]（1件）を設定する
	# 【期待される動作】: activated_traits.size() == 1 かつ activated_traits[0] == trait_a
	# 🟡 信頼性: N-4（複数保持）・B-1（空配列）の境界補完 / REQ-112 より妥当な推測

	# 【テストデータ準備】: 特性が1つだけ発現する最も頻出する調合結果を再現する
	# 【初期条件設定】: TraitDefinitionを1件生成する
	var trait_a := TraitDefinitionScript.new()
	trait_a.id = &"trait_a"
	var traits: Array[TraitDefinition] = [trait_a]
	var result := CraftResultScript.new()

	# 【実際の処理実行】: activated_traitsへ1件のtraitsを代入する
	# 【処理内容】: 単一発現保持の境界ケースを検証する
	result.activated_traits = traits

	# 【結果検証】: 1件が正しく格納され参照できることを確認する
	# 【期待値確認】: 0件・2件と同じtyped Array型で一貫すること
	assert_eq(result.activated_traits.size(), 1, "activated_traitsが1件保持でsize()==1になるべき") # 【確認内容】: 単一発現保持の境界確認
	assert_eq(result.activated_traits[0], trait_a, "activated_traits[0]がtrait_aと一致するべき") # 【確認内容】: 要素の正当な参照
