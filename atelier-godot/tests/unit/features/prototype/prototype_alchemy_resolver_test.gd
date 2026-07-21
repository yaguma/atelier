extends GutTest
# TASK-0009: プロトタイプ調合ロジック PrototypeAlchemyResolver.resolve() のユニットテスト。
# 対象: features/prototype/logic/prototype_alchemy_resolver.gd（未実装。Redフェーズ用）
# 参照: docs/implements/atelier-alchemy-core/TASK-0009/alchemy-prototype-testcases.md
#
# 【備考】: resolve は static func かつ副作用なしのため、beforeEach 相当の状態初期化は不要。
#          各テストはローカル変数のみで完結し、テスト間の依存を持たない。

const PrototypeAlchemyResolverScript := preload("res://features/prototype/logic/prototype_alchemy_resolver.gd")


# ============================================================
# 正常系
# ============================================================

func test_基礎品質の平均値計算() -> void:
	# 【テスト目的】: 特性が発現しない素材2個を投入したとき、基礎品質が各qualityの平均値として算出されることを確認する
	# 【テスト内容】: 品質B(3)とD(1)の素材（特性なし）をresolveに渡す
	# 【期待される動作】: (3+1)/2 = 2 が最終品質として返る（特性発現がないためペナルティなし）
	# 🟡 信頼性: REQ-105を簡略化したプロトタイプ専用ロジックのテスト（テストケース1準拠）

	# 【テストデータ準備】: 品質スコアの平均計算のみを純粋に検証するため、特性タグを持たない素材を選定
	# 【初期条件設定】: quality=3(B) と quality=1(D) の2素材、traitsは空配列
	var materials: Array = [
		{"quality": 3, "traits": []},
		{"quality": 1, "traits": []},
	]

	# 【実際の処理実行】: 純粋関数resolveを呼び出す
	# 【処理内容】: 基礎品質平均・特性発現判定・品質ペナルティを一括計算する
	var result: Dictionary = PrototypeAlchemyResolverScript.resolve(materials)

	# 【結果検証】: 平均値と特性なしの状態を確認する
	# 【期待値確認】: (3+1)/2 = 2。特性が1つも2個以上揃わないため発現なし
	assert_eq(result["quality"], 2, "BとDの平均品質はスコア2であるべき") # 【確認内容】: 平均品質計算の正当性
	assert_eq(result["traits"], [], "特性タグなしのため発現特性は空であるべき") # 【確認内容】: 特性なし入力でペナルティが発生しないこと
	assert_true(result["success"], "素材が投入されているため調合は成立するべき") # 【確認内容】: 通常投入時の成立フラグ


func test_特性の閾値発現_同一タグ2個で発現() -> void:
	# 【テスト目的】: 同一特性タグを持つ素材がちょうど2個投入されたとき、その特性が完成品に発現することを確認する
	# 【テスト内容】: contribution_holy を2個含む素材配列をresolveに渡す
	# 【期待される動作】: 完成品のtraitsにcontribution_holyが含まれる
	# 🔵 信頼性: REQ-106, EDGE-101に明記（テストケース2準拠）

	# 【テストデータ準備】: 閾値ちょうど（2個）を再現するため同一タグの素材を2個用意する
	# 【初期条件設定】: holy_herb(D)とholy_herb_two(C)相当。qualityは発現判定に影響しない
	var materials: Array = [
		{"quality": 1, "traits": [&"contribution_holy"]},
		{"quality": 2, "traits": [&"contribution_holy"]},
	]

	# 【実際の処理実行】: 純粋関数resolveを呼び出す
	# 【処理内容】: 特性タグの出現数を集計し、2個以上で発現と判定する
	var result: Dictionary = PrototypeAlchemyResolverScript.resolve(materials)

	# 【結果検証】: 発現特性にcontribution_holyが含まれるか検証する
	# 【期待値確認】: 同一タグ2個で発現するためhas()がtrue
	assert_true(result["traits"].has(&"contribution_holy"), "同一特性2個ちょうどで発現するべき（EDGE-101）") # 【確認内容】: 閾値下限（2個）での発現保証
	assert_true(result["success"], "素材が投入されているため調合は成立するべき") # 【確認内容】: 通常投入時の成立フラグ


func test_特性1個のみでは不発() -> void:
	# 【テスト目的】: ある特性タグを持つ素材が1個だけの場合、その特性が発現しないことを確認する
	# 【テスト内容】: contribution_holyを1個のみ含む素材配列をresolveに渡す
	# 【期待される動作】: 完成品のtraitsにcontribution_holyが含まれない
	# 🔵 信頼性: REQ-106に明記（テストケース3準拠）

	# 【テストデータ準備】: 同一タグが1個しかない状態を再現する
	# 【初期条件設定】: holy_herb(D, contribution_holy)相当1個 + pure_crystal(S, 特性なし)相当1個
	var materials: Array = [
		{"quality": 1, "traits": [&"contribution_holy"]},
		{"quality": 5, "traits": []},
	]

	# 【実際の処理実行】: 純粋関数resolveを呼び出す
	# 【処理内容】: 特性タグの出現数を集計し、1個のみのタグは発現対象から除外する
	var result: Dictionary = PrototypeAlchemyResolverScript.resolve(materials)

	# 【結果検証】: 発現特性が空であることを検証する
	# 【期待値確認】: 閾値未満（1個）のため発現しない
	assert_false(result["traits"].has(&"contribution_holy"), "特性1個のみでは発現しないべき") # 【確認内容】: 閾値の下側（1個）で発現しないこと
	assert_eq(result["traits"], [], "発現特性は空配列であるべき") # 【確認内容】: 発現特性リストが空であること


func test_特性発現による品質ペナルティ() -> void:
	# 【テスト目的】: 基礎品質B(3)で特性が1個発現する組み合わせにおいて、最終品質が1段階減算されC(2)になることを確認する
	# 【テスト内容】: reward_goldを2個含む品質B素材2個をresolveに渡す
	# 【期待される動作】: 基礎品質(3+3)/2=3、reward_goldが発現 → 3-1=2
	# 🟡 信頼性: REQ-111を簡略化した適用（テストケース4準拠）

	# 【テストデータ準備】: 基礎品質3かつ特性1個発現を同時に成立させる構成
	# 【初期条件設定】: 品質B(3)・同一特性reward_goldを2個投入
	var materials: Array = [
		{"quality": 3, "traits": [&"reward_gold"]},
		{"quality": 3, "traits": [&"reward_gold"]},
	]

	# 【実際の処理実行】: 純粋関数resolveを呼び出す
	# 【処理内容】: 基礎品質計算後、発現特性数に応じて品質を減算する
	var result: Dictionary = PrototypeAlchemyResolverScript.resolve(materials)

	# 【結果検証】: 最終品質と発現特性を検証する
	# 【期待値確認】: 3 - 1(発現数) = 2（C相当）
	assert_eq(result["quality"], 2, "特性発現1個により品質はB(3)からC(2)へ減算されるべき") # 【確認内容】: 発現数と減算量の一致
	assert_true(result["traits"].has(&"reward_gold"), "reward_goldが発現しているべき") # 【確認内容】: ペナルティの原因となる特性が発現していること


func test_異なる系統の特性が各2個で同時発現() -> void:
	# 【テスト目的】: 貢献度系・報酬系それぞれ2個ずつ投入したとき、両特性が独立して発現し、発現数に応じて品質が減算されることを確認する
	# 【テスト内容】: contribution_holy×2とreward_gold×2をresolveに渡す
	# 【期待される動作】: 両方発現（発現数2）。基礎品質からの減算量は2
	# 🟡 信頼性: REQ-106のタグ単位独立判定からの妥当な推測。REQ-115スコープ外の明示的確認を兼ねる（テストケース11準拠）

	# 【テストデータ準備】: 4枠を使い、2種類の特性タグが各々閾値（2個）に達する構成
	# 【初期条件設定】: 全素材quality=4（A相当）、基礎品質は平均4
	var materials: Array = [
		{"quality": 4, "traits": [&"contribution_holy"]},
		{"quality": 4, "traits": [&"contribution_holy"]},
		{"quality": 4, "traits": [&"reward_gold"]},
		{"quality": 4, "traits": [&"reward_gold"]},
	]

	# 【実際の処理実行】: 純粋関数resolveを呼び出す
	# 【処理内容】: 特性タグごとに独立して出現数を集計し、複数タグの同時発現を許容する（REQ-115排他制御はスコープ外）
	var result: Dictionary = PrototypeAlchemyResolverScript.resolve(materials)

	# 【結果検証】: 両特性の発現と品質減算量を検証する
	# 【期待値確認】: 4(基礎品質) - 2(発現数) = 2
	assert_true(result["traits"].has(&"contribution_holy"), "contribution_holyが発現しているべき") # 【確認内容】: 貢献度系タグの独立発現
	assert_true(result["traits"].has(&"reward_gold"), "reward_goldが発現しているべき") # 【確認内容】: 報酬系タグの独立発現（REQ-115排他制御が混入していないこと）
	assert_eq(result["traits"].size(), 2, "発現特性は2種類であるべき") # 【確認内容】: タグ単位の独立集計が正しいこと
	assert_eq(result["quality"], 2, "基礎品質4から発現数2を減算しスコア2になるべき") # 【確認内容】: 複数特性発現時の減算量の正当性


# ============================================================
# 異常系
# ============================================================

func test_投入枠が空の場合の調合拒否() -> void:
	# 【テスト目的】: 投入枠に素材が1つも配置されていない状態で調合を実行しようとするケースを確認する
	# 【テスト内容】: 空配列をresolveに渡す
	# 【期待される動作】: successがfalseとなり、0除算やクラッシュを起こさない
	# 🟡 信頼性: EDGE-001からの適用。success:false表現は要件定義書2.1の妥当な推測（テストケース6準拠）

	# 【テストデータ準備】: 投入素材が0個では基礎品質の平均計算（分母0）が定義できない状態を再現する
	# 【初期条件設定】: 空配列（投入枠が空の状態）
	var materials: Array = []

	# 【実際の処理実行】: 純粋関数resolveを呼び出す
	# 【処理内容】: 空投入を検出し、計算を行わずに不成立を返す
	var result: Dictionary = PrototypeAlchemyResolverScript.resolve(materials)

	# 【結果検証】: 調合が不成立であることを検証する
	# 【期待値確認】: 空投入時はsuccessがfalseとなり、呼び出し側が安全に分岐できること
	assert_false(result["success"], "投入枠が空の場合、調合は成立しないべき") # 【確認内容】: EDGE-001の防御的処理


# ============================================================
# 境界値
# ============================================================

func test_最終品質はDを下回らない() -> void:
	# 【テスト目的】: 品質スコアの下限D=1を、ペナルティ減算が突き抜けないことを確認する
	# 【テスト内容】: 基礎品質D(1)で特性が発現する組み合わせをresolveに渡す
	# 【期待される動作】: 減算結果が0になるはずのところ、D=1でクランプされる
	# 🔵 信頼性: REQ-111, EDGE-102に明記（テストケース5準拠）

	# 【テストデータ準備】: 基礎品質が既に最低（D=1）で、さらに特性ペナルティが乗る極端条件を再現する
	# 【初期条件設定】: quality=1(D)のreward_gold素材を2個（基礎品質1、発現数1）
	var materials: Array = [
		{"quality": 1, "traits": [&"reward_gold"]},
		{"quality": 1, "traits": [&"reward_gold"]},
	]

	# 【実際の処理実行】: 純粋関数resolveを呼び出す
	# 【処理内容】: 基礎品質1から発現数1を減算すると0になるが、下限1へ正規化する
	var result: Dictionary = PrototypeAlchemyResolverScript.resolve(materials)

	# 【結果検証】: 最終品質が下限でクランプされていることを検証する
	# 【期待値確認】: 1 - 1 = 0 となるがD=1未満は許されないため1になる
	assert_eq(result["quality"], 1, "最終品質は0や負値にならずD=1でクランプされるべき") # 【確認内容】: 品質下限のクランプ処理


func test_基礎品質平均の端数切り捨て() -> void:
	# 【テスト目的】: 平均が割り切れない（小数を含む）ケースで、切り捨て仕様が正しく動作することを確認する
	# 【テスト内容】: 4素材（特性なし）で平均が3.75になる組み合わせをresolveに渡す
	# 【期待される動作】: 3.75が切り捨てられ3になる（四捨五入なら4になるため差が明確）
	# 🟡 信頼性: note.md/要件定義書2.2の端数切り捨て仕様に基づく妥当な推測（テストケース8準拠）

	# 【テストデータ準備】: (5+5+2+3)/4=15/4=3.75となる構成を選定し、四捨五入との差を明確化する
	# 【初期条件設定】: 特性は発現させずペナルティの影響を排除する
	var materials: Array = [
		{"quality": 5, "traits": []},
		{"quality": 5, "traits": []},
		{"quality": 2, "traits": []},
		{"quality": 3, "traits": []},
	]

	# 【実際の処理実行】: 純粋関数resolveを呼び出す
	# 【処理内容】: 品質平均をint除算（切り捨て）で算出する
	var result: Dictionary = PrototypeAlchemyResolverScript.resolve(materials)

	# 【結果検証】: 端数が切り捨てられていることを検証する
	# 【期待値確認】: 3.75の切り捨てで3（四捨五入なら4になるが仕様は切り捨て）
	assert_eq(result["quality"], 3, "3.75は四捨五入ではなく切り捨てで3になるべき") # 【確認内容】: 端数処理が切り捨て仕様であること


func test_traitsが空の素材のみでは発現なし() -> void:
	# 【テスト目的】: 特性タグが1つも存在しない場合に、特性集計が安全に動作し発現0件を返すことを確認する
	# 【テスト内容】: traitsが全て空配列の素材のみをresolveに渡す
	# 【期待される動作】: 発現特性は空配列、品質は平均通りに算出される
	# 🟡 信頼性: REQ-106の発現条件からの裏面確認（妥当な推測）（テストケース9準拠）

	# 【テストデータ準備】: pure_crystal(S)+plain_water(C)相当。特性タグ総数0の状態を再現する
	# 【初期条件設定】: 2素材ともtraitsは空配列
	var materials: Array = [
		{"quality": 5, "traits": []},
		{"quality": 2, "traits": []},
	]

	# 【実際の処理実行】: 純粋関数resolveを呼び出す
	# 【処理内容】: 特性集計ロジックが空traitsを安全に処理し発現0件とする
	var result: Dictionary = PrototypeAlchemyResolverScript.resolve(materials)

	# 【結果検証】: 発現特性が空であり、品質計算に影響がないことを検証する
	# 【期待値確認】: (5+2)/2=3。特性なしのためペナルティ0
	assert_eq(result["traits"], [], "特性タグが存在しないため発現特性は空配列であるべき") # 【確認内容】: 空traits集計の安全性
	assert_eq(result["quality"], 3, "特性なしのためペナルティなく平均品質3がそのまま最終品質になるべき") # 【確認内容】: 特性なしケースでの品質計算の一貫性
	assert_true(result["success"], "素材が投入されているため調合は成立するべき") # 【確認内容】: 通常投入時の成立フラグ


func test_投入枠フル4枠での調合成立() -> void:
	# 【テスト目的】: 投入枠の初期上限4枠（REQ-101）をフルに使った最大構成でも平均・特性集計が正しく動作することを確認する
	# 【テスト内容】: 4素材（特性なし）をresolveに渡す
	# 【期待される動作】: 4要素の平均が正しく算出され、切り捨ても適用される
	# 🟡 信頼性: REQ-101（投入枠4枠）に基づく妥当な推測（テストケース10準拠）

	# 【テストデータ準備】: RECIPE_DEFAULT_SLOT_COUNT=4（REQ-101）の上限を使い切る構成
	# 【初期条件設定】: (5+4+3+2)/4=14/4=3.5となる4素材、特性なし
	var materials: Array = [
		{"quality": 5, "traits": []},
		{"quality": 4, "traits": []},
		{"quality": 3, "traits": []},
		{"quality": 2, "traits": []},
	]

	# 【実際の処理実行】: 純粋関数resolveを呼び出す
	# 【処理内容】: 4要素の品質平均を算出し、切り捨てを適用する
	var result: Dictionary = PrototypeAlchemyResolverScript.resolve(materials)

	# 【結果検証】: 4枠フル投入時の品質・特性・成立フラグを検証する
	# 【期待値確認】: 3.5の切り捨てで3
	assert_eq(result["quality"], 3, "3.5は切り捨てで3になるべき") # 【確認内容】: 4要素での平均・切り捨ての正当性
	assert_true(result["success"], "4枠フル投入時も調合は成立するべき") # 【確認内容】: 最大枠数でのクラッシュ・計算ずれがないこと
	assert_eq(result["traits"], [], "特性タグがないため発現特性は空配列であるべき") # 【確認内容】: 2要素ケース（TC1）との計算式の一貫性
