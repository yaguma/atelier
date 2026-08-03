## TASK-0017: 貢献度/報酬算出（ValueCalculator）
##
## 【機能概要】: 調合完成品の「貢献度」（ランクHPへのダメージ）と「報酬」（ゴールド）を、
## 　　　　　　 4つの係数（基礎値・品質倍率・特性ボーナス・指定合致ボーナス）の乗算で算出する
## 　　　　　　 純粋関数を提供する（REQ-109, REQ-110）。
## 【実装方針】: Functional Core（logic/）に配置する副作用のない静的メソッドのみで構成する。
## 　　　　　　 GameState・Autoload等の外部状態は一切参照しない。
## 【改善内容（Refactorフェーズ）】: Greenフェーズから機能・アルゴリズムの変更なし（テスト71/71 green維持）。
## 　　　　　　 下記「⚠️ 設計判断」3点（責務重複・品質倍率暫定式・DailyRequest未実装）を
## 　　　　　　 quality_calculator.gd と同形式で明文化し、Phase 4着手前に必ず解消すべき
## 　　　　　　 未決事項を後続実装者が見落とさないようにした。
##
## ⚠️ 設計判断1（最重要・Phase4着手前に要解消）: alchemy/guildの指定合致ボーナス責務重複疑義
## 　🚨 REQ-109/110の式は「指定合致ボーナス」を calculate_contribution/calculate_reward の
## 　算出に**直接含めて**おり、dataflow.md「機能2: 調合」ステップ5もこれを明記している。
## 　一方、dataflow.md「機能3: ギルド納品」では、guild機能の
## 　`DeliveryCalculator.check_daily_request_match()`（TASK-0017時点では未実装）が**別途**
## 　合致ボーナスを算出し、`rank_hp -= 貢献度 × 合致ボーナス` / `gold += 報酬 × 合致ボーナス`
## 　という形で**再度**乗算する設計になっている（architecture.mdのディレクトリ構成でも
## 　guild/logic/delivery_calculator.gdが「指定合致ボーナス判定」の責務を持つと明記）。
## 　このまま両方を実装すると指定合致ボーナスが二重適用されるリスクが高い。
## 　📝 対応: 本タスクはREQ-109/110どおりalchemy側（本ファイル）で指定合致ボーナスを適用する
## 　前提のまま実装している。**Phase 4（guild機能）着手前に、alchemy側とguild側のどちらか
## 　一方でのみ合致ボーナスを適用するよう architecture.md / dataflow.md の整合を取り、
## 　設計を確定させることが必須**。delivery_calculator.gd実装者は本コメントを必ず確認すること。
## 🔴 信頼性レベル: 設計文書間（architecture.md / dataflow.md）の不整合そのものであり、
## 　　　　　　 　 どちらが正かは元資料からは判断不能（要件定義書・タスクノートで申し送り済み）
##
## ⚠️ 設計判断2（品質倍率計算式は完全な推測・バランス調整で見直される可能性が高い）:
## 　`quality_multiplier = float(final_quality) / float(MaterialInstance.Quality.C)`
## 　（品質Cを基準値1.0とする線形倍率）は、要件定義書・データモデル・データフローの
## 　いずれにも変換式の記載がなく、TASK-0017時点での**完全な推測**である。
## 　🚨 バランス調整フェーズでこの式自体（線形か否か・基準品質・傾き）が見直される可能性が
## 　高いことを実装者・後続改修者は認識すること。TC-B02〜B04（品質D/S/Cの境界値テスト）は
## 　この暫定式を固定化したものであり、式を変更する場合は必ずテストの期待値も合わせて更新する。
## 　📝 スコープ外の明記: `shared/constants/game_balance.gd`（TASK-0005）には既に
## 　`QUALITY_MULTIPLIER_TABLE`（品質→倍率のDictionary、現状は全品質1.0のTBDプレースホルダ）が
## 　用意されており、本来はそちらへ計算式・定数を切り出すのが望ましい。しかし
## 　**この切り出し（GameBalance定数化）は本タスク（TASK-0017）のスコープ外**とし、
## 　バランス調整フェーズ（balance-tuning-cycle）で改めて対応する。
## 🔴 信頼性レベル: 元資料に変換式の記載なし。完全な推測（要件定義書「3. 制約条件」で申し送り済み）
##
## ⚠️ 設計判断3（DailyRequest型が未実装のためDuck typingで扱う）:
## 　`daily_request` の型定義（features/guild/data/daily_request.gd）はPhase 4（guild機能）で
## 　作成予定のため、TASK-0017（Phase 3）時点では未実装。型注釈を厳格に`DailyRequest`とすると
## 　未定義クラス参照でスクリプトのパースエラーになるため、本タスクでは引数`daily_request`の
## 　型注釈を意図的に省略し、`required_recipe_id`/`bonus_multiplier`の2フィールドのみを
## 　参照するDuck typingで扱っている（テストもローカルダミーstubで代替）。
## 　📝 対応: DailyRequest実装後（Phase 4）に型注釈を`DailyRequest`へ厳格化すること。
## 🔴 信頼性レベル: 元資料にDailyRequest実装未了である旨の明記あり（要件定義書 申し送り1）
##
## 【テスト対応】: value-calculator-testcases.md TC-N01〜N06, TC-E01〜E03, TC-B01〜B04（全13件）
## 🔵 信頼性レベル: REQ-109・REQ-110（要件定義書）に基づく
class_name ValueCalculator
extends RefCounted


## 【機能概要】: 調合完成品の貢献度（ランクHPへのダメージ量）を算出する
## 【計算式（REQ-109）】: 貢献度 = 基礎貢献度 × 品質倍率 × 貢献度系特性ボーナス × 指定合致ボーナス
## 【実装方針】: 4係数を単純に乗算する副作用のない純粋関数として実装する
## 【設計方針】: 品質倍率・指定合致ボーナスの算出ロジックはcalculate_rewardと共通のため、
## 　　　　　　 private staticヘルパー（_calculate_category_bonus / _calculate_match_bonus）に
## 　　　　　　 切り出し、DRY原則に従っている（重複するのはカテゴリ引数のみ）
## 【パフォーマンス】: O(n)（nは発現特性数）。調合投入枠は数個規模（REQ-101想定4枠）のため
## 　　　　　　 計算量上の懸念はなく、追加の最適化は不要。
## 【テスト対応】: value-calculator-testcases.md TC-N01〜N06, TC-E01〜E03, TC-B01〜B04
##
## @param recipe - レシピ定義。base_contributionを参照
## @param final_quality - REQ-111適用後の最終品質
## @param activated_traits - 発現特性の配列（CONTRIBUTIONカテゴリのみ寄与）
## @param daily_request - 日替わり指定調合物（required_recipe_id / bonus_multiplierを参照。
## 　　　　　　 型未実装のためDuck typing。ファイル冒頭「設計判断3」参照）
## @returns 貢献度（float）
static func calculate_contribution(
	recipe: RecipeDefinition,
	final_quality: MaterialInstance.Quality,
	activated_traits: Array[TraitDefinition],
	daily_request,
) -> float:
	# 【品質倍率算出】: 品質Cを基準1.0とする暫定式（TC-B02〜B04で固定化）。
	# 　この式の根拠・スコープ外事項はファイル冒頭「設計判断2」を参照 🔴
	var quality_multiplier := float(final_quality) / float(MaterialInstance.Quality.C)
	# 【特性ボーナス算出】: CONTRIBUTIONカテゴリのbonus_multiplierのみを全乗算する（TC-N02, TC-N06, TC-E01〜E03） 🟡
	var trait_bonus := _calculate_category_bonus(activated_traits, TraitDefinition.Category.CONTRIBUTION)
	# 【指定合致ボーナス算出】: recipe.idとdaily_request.required_recipe_idが一致する場合のみ適用（TC-N04）。
	# 　guild側との責務重複疑義はファイル冒頭「設計判断1（最重要）」を参照 🟡🔴
	var match_bonus := _calculate_match_bonus(recipe, daily_request)
	# 【4係数乗算】: 基礎貢献度×品質倍率×特性ボーナス×指定合致ボーナスの乗算構造（REQ-109） 🔵
	return recipe.base_contribution * quality_multiplier * trait_bonus * match_bonus


## 【機能概要】: 調合完成品の報酬（ゴールド）を算出する
## 【計算式（REQ-110）】: 報酬 = 基礎報酬 × 品質倍率 × 報酬系特性ボーナス × 指定合致ボーナス
## 【実装方針】: calculate_contributionと対称の構造。REWARDカテゴリのみをフィルタする点のみ異なる
## 【テスト対応】: value-calculator-testcases.md TC-N03, TC-E02, TC-B03
##
## @param recipe - レシピ定義。base_rewardを参照
## @param final_quality - REQ-111適用後の最終品質
## @param activated_traits - 発現特性の配列（REWARDカテゴリのみ寄与）
## @param daily_request - 日替わり指定調合物（required_recipe_id / bonus_multiplierを参照。
## 　　　　　　 型未実装のためDuck typing。ファイル冒頭「設計判断3」参照）
## @returns 報酬（float）
static func calculate_reward(
	recipe: RecipeDefinition,
	final_quality: MaterialInstance.Quality,
	activated_traits: Array[TraitDefinition],
	daily_request,
) -> float:
	# 【品質倍率算出】: calculate_contributionと共通の暫定式（TC-B03）。
	# 　この式の根拠・スコープ外事項はファイル冒頭「設計判断2」を参照 🔴
	var quality_multiplier := float(final_quality) / float(MaterialInstance.Quality.C)
	# 【特性ボーナス算出】: REWARDカテゴリのbonus_multiplierのみを全乗算する（TC-N03, TC-E02） 🟡
	var trait_bonus := _calculate_category_bonus(activated_traits, TraitDefinition.Category.REWARD)
	# 【指定合致ボーナス算出】: calculate_contributionと共通のID一致判定。
	# 　guild側との責務重複疑義はファイル冒頭「設計判断1（最重要）」を参照 🟡🔴
	var match_bonus := _calculate_match_bonus(recipe, daily_request)
	# 【4係数乗算】: 基礎報酬×品質倍率×特性ボーナス×指定合致ボーナスの乗算構造（REQ-110） 🔵
	return recipe.base_reward * quality_multiplier * trait_bonus * match_bonus


## 【ヘルパー関数】: 発現特性配列から指定カテゴリのbonus_multiplierのみを全乗算した値を算出する
## 【再利用性】: calculate_contribution（CONTRIBUTION指定）とcalculate_reward（REWARD指定）の
## 　　　　　　 両方から呼ばれる共通ロジック（DRY原則）
## 【単一責任】: 「カテゴリでフィルタして全乗算する」ことのみに責務を限定し、
## 　　　　　　 品質倍率や指定合致ボーナスの計算には一切関与しない
## 【実装方針】: 該当カテゴリが1件もない場合は中立値1.0を返す（乗算の初期値バグを防止）
## 【テスト対応】: TC-N02・TC-N06（複数同系統の全乗算）・TC-E01〜E03（空配列/該当0件の1.0無効化）
##
## @param activated_traits - 発現特性の配列
## @param category - フィルタ対象のカテゴリ（CONTRIBUTIONまたはREWARD）
## @returns 該当カテゴリのbonus_multiplierの全乗算値、該当なしなら1.0
static func _calculate_category_bonus(activated_traits: Array[TraitDefinition], category: TraitDefinition.Category) -> float:
	# 【初期値】: 乗算の中立値1.0から開始する（0.0初期化だと全て0になるバグを防ぐ） 🟡
	var bonus := 1.0
	# 【該当有無フラグ】: 該当カテゴリが1件も見つからない場合との区別に使用 🟡
	var found := false
	# 【フィルタと全乗算】: 指定カテゴリの特性のみを走査し、bonus_multiplierを乗算していく 🟡
	for trait_def in activated_traits:
		if trait_def.category == category:
			bonus *= trait_def.bonus_multiplier
			found = true
	# 【該当0件時の無効化】: 該当カテゴリが1件もなければ中立値1.0を返す（EDGE-A, EDGE-B, EDGE-F） 🟡
	return bonus if found else 1.0


## 【ヘルパー関数】: 日替わり指定調合物との合致判定により指定合致ボーナスを算出する
## 【再利用性】: calculate_contribution / calculate_reward の両方から呼ばれる共通ロジック（DRY原則）
## 【単一責任】: recipeとdaily_requestのID一致判定と、それに応じたボーナス倍率の選択のみを担う
## 【実装方針】: daily_requestがnullの場合や不一致の場合は中立値1.0を返す
## 【重要な申し送り】: 本ヘルパーが返す「指定合致ボーナス」は、guild側delivery_calculator.gd
## 　　　　　　 （TASK-0017時点では未実装）と責務が重複している疑いがある。詳細はファイル冒頭
## 　　　　　　 「⚠️ 設計判断1（最重要）」を参照。Phase4着手前に設計確定が必須。
## 【テスト対応】: TC-N04（合致時1.5）・その他大半のテスト（不一致時1.0）
##
## @param recipe - レシピ定義。idを参照
## @param daily_request - 日替わり指定調合物（Duck typing。null許容。ファイル冒頭「設計判断3」参照）
## @returns 一致時はdaily_request.bonus_multiplier、不一致・null時は1.0
static func _calculate_match_bonus(recipe: RecipeDefinition, daily_request) -> float:
	# 【null安全性】: daily_requestが未指定（null）の場合は合致なしとして1.0を返す 🟡
	if daily_request == null:
		return 1.0
	# 【ID一致判定】: recipe.idとdaily_request.required_recipe_idが一致する場合のみボーナス適用（REQ-204） 🟡
	if daily_request.required_recipe_id == recipe.id:
		return daily_request.bonus_multiplier
	# 【不一致時】: 中立値1.0で無効化する 🟡
	return 1.0
