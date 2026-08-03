## TASK-0018: 調合オーケストレーター（AlchemyResolver.craft）
##
## 【機能概要】: 投入素材群から基礎品質・特性発現・系統排他・品質ペナルティ・貢献度/報酬を
## 　　　　　　 dataflow.md「機能2: 調合」の5ステップに従って合成し、CraftResultとして返す
## 　　　　　　 単一のオーケストレーター純粋関数。
## 【改善内容（Refactorフェーズ）】: Greenフェーズから機能・アルゴリズムの変更なし
## 　　　　　　 （単体75/75・統合2/2・全体回帰91/91 green維持）。以下の2ブロックを新設し、
## 　　　　　　 本ファイルがGodotアーキテクトレビュー2件（Critical#1・Warning#2）双方の
## 　　　　　　 対応の核心であることと、TASK-0013〜0017からの申し送り事項の集約地点で
## 　　　　　　 あることを、quality_calculator.gd/value_calculator.gdと同形式で明文化した。
##
## 【Godotアーキテクトレビュー Critical#1 対応】🔵（本関数の核心・最重要）:
## 　本関数は `static func` のみで構成し、`extends RefCounted` の副作用のない純粋関数である。
## 　`GameState` 等のAutoloadやシングルトンを一切参照しない。呼び出しに必要な依存
## 　（`reveal_level` / `daily_request` / `recipe` / `trait_definitions`）はすべて引数として
## 　明示的に受け取り、同じ引数に対して常に同じ`CraftResult`（またはnull）を返す決定論性を
## 　保証する。ゲーム状態（GameState）への依存解決は呼び出し元（TASK-0019 GameState.craft）の
## 　責務であり、本関数はそれを一切知らない。
## 　参照元: docs/design/atelier-alchemy-core/architecture.md「Godotアーキテクトレビュー Critical#1対応」、
## 　trait_activation.gd冒頭「Critical#1対応」コメント（同一方針の踏襲）
##
## 【Godotアーキテクトレビュー Warning#2 対応】🔵（本ファイルが新設された直接の理由）:
## 　旧設計案では、UI（AlchemyBench）が `QualityCalculator` → `TraitActivation` →
## 　`ValueCalculator` を個別に直接呼び出し、5ステップの合成順序・引数の受け渡しをUI側で
## 　組み立てる想定だった。これは「調合ワークフロー」というビジネスロジックがUI層に漏洩する
## 　設計上の欠陥であり、Warning#2として指摘された。本ファイル（`AlchemyResolver.craft`）は
## 　その欠陥を解消するために新設された、5ステップ合成の**唯一の入口**である。
## 　🚨 将来の実装者への注意: UI（TASK-0020 AlchemyBench）や他機能から
## 　`QualityCalculator`/`TraitActivation`/`ValueCalculator`の各関数を**個別に直接呼び出す
## 　コードを新たに書かないこと**。調合ロジックが必要な箇所は必ず本関数
## 　`AlchemyResolver.craft()` を呼び出すこと。個別呼び出しを追加すると、本Warning#2対応が
## 　無効化され、旧設計の欠陥（ロジックの散逸・合成順序の重複実装）が再発する。
## 　参照元: docs/design/atelier-alchemy-core/architecture.md「Godotアーキテクトレビュー Warning#2」、
## 　note.md「Godotアーキテクトレビューへの対応 ★CRITICAL」
##
## 【TASK-0013〜0017からの申し送り事項の統合地点】🟡（本ファイルが集約する4論点）:
## 　本タスクはTASK-0013〜0017で個別に申し送られた複数の未確定事項を、一貫した方針で
## 　統合する箇所である（各論点の詳細な設計判断は該当ファイル冒頭の⚠️ブロックを参照）。
## 　1. **float→int（enum）変換ポイント**: `calculate_base_quality`の戻り値（float）を
## 　　 `CraftResult.base_quality`（Quality enum）へ変換する境界を本関数に置き、
## 　　 `apply_trait_penalty`が採用する`round()`丸め方式（quality_calculator.gd「設計判断3」）
## 　　 と統一した（下記CraftResult構築部のコメント参照）。
## 　2. **`trait_definitions`/`recipe`引数の追加**: architecture.mdの概略シグネチャ
## 　　 （3引数）に対し、TASK-0014（特性系統判定）・TASK-0017（基礎値算出）がそれぞれ
## 　　 必要とした`trait_definitions`・`recipe`を実装上5引数へ拡張した（note.md「注意事項」）。
## 　3. **`rejected_category`の無効値表現**: `resolve_category_conflict`の戻り値契約
## 　　 （`has_rejected_category`を先に確認してから`rejected_category`を参照する）に従い、
## 　　 却下なしの場合は`CraftResult`のデフォルト値のまま上書きしない方針で確定した
## 　　 （下記CraftResult構築部のコメント参照。requirements.mdのString想定との差異は
## 　　 別途申し送り済み）。
## 　4. **指定合致ボーナスの二重適用疑義**: value_calculator.gd冒頭「設計判断1（最重要）」で
## 　　 指摘されている、alchemy側（本関数が呼ぶcalculate_contribution/calculate_reward）と
## 　　 guild側（未実装のdelivery_calculator.gd）が指定合致ボーナスを二重に乗算するリスクは、
## 　　 本関数内では発生しない（ステップ5で各関数を1回ずつしか呼ばないため）ことを確認済み。
## 　　 ただしguild機能側との責務重複そのものは未解消であり、Phase 4着手前の設計確定が
## 　　 引き続き必要（本関数のスコープ外・value_calculator.gd参照）。
## 【テスト対応】: alchemy-resolver-craft-testcases.md TC-U01〜U04（単体）・TC-I01〜I02（統合）
## 🔵 信頼性レベル: dataflow.md「機能2」5ステップ順序・note.md「Greenフェーズで実装すべき内容」に基づく
class_name AlchemyResolver
extends RefCounted


## 【機能概要】: 投入素材群から基礎品質・特性発現・系統排他・品質ペナルティ・貢献度/報酬を
## 　　　　　　 5ステップで合成し、CraftResultとして返す
## 【呼び出し契約】: 調合ロジックが必要な箇所は必ずこの関数を経由すること。
## 　　　　　　 QualityCalculator/TraitActivation/ValueCalculatorの個別呼び出しは禁止
## 　　　　　　 （ファイル冒頭「Warning#2対応」参照）
## @param materials - 投入素材（0〜5枠）。空の場合はEDGE-001ガード対象
## @param reveal_level - 特性開示レベル（0=Gランク非開示、1以上=開示）
## @param daily_request - 指定合致ボーナス判定に使用（型未実装のためDuck typing）
## @param recipe - 貢献度/報酬の基礎値算出に使用
## @param trait_definitions - 特性系統判定のためのマスターデータ
## @returns CraftResult - 有効な入力では全6フィールドを埋めたCraftResult、EDGE-001時はnull
static func craft(
	materials: Array[MaterialInstance],
	reveal_level: int,
	daily_request,
	recipe: RecipeDefinition,
	trait_definitions: Dictionary,
) -> CraftResult:
	# 【EDGE-001ガード】: 投入枠が空の場合は調合を成立させず、他ステップに到達する前に
	# 　最優先で短絡する。UI側のボタン非活性化に対する二重の安全策（note.md「EDGE-001ガード実装方針」） 🟡
	if materials.is_empty():
		return null

	# 【ステップ1】: calculate_base_quality(投入素材) — REQ-105
	# 　投入素材のquality値の算術平均（float）を算出する 🔵
	var base_quality := QualityCalculator.calculate_base_quality(materials)

	# 【ステップ2】: resolve_activated_traits(投入素材, reveal_level) — REQ-106, REQ-112
	# 　同一特性タグが2個以上出現し、reveal_levelで開示済みの特性のみを候補化する 🔵
	var candidate_traits := TraitActivation.resolve_activated_traits(materials, reveal_level, trait_definitions)

	# 【ステップ3】: resolve_category_conflict(発現特性) — REQ-115
	# 　貢献度系/報酬系の系統間排他制御を適用する（支配戦略防止の核心・TC-101-07） 🔵
	var conflict_result := TraitActivation.resolve_category_conflict(materials, candidate_traits)
	var final_traits: Array[TraitDefinition] = conflict_result["activated_traits"]

	# 【ステップ4】: apply_trait_penalty(基礎品質, 最終発現特性) — REQ-111
	# 　系統排他後の最終発現特性数に応じて基礎品質を減算し、Quality enumへ変換する 🔵
	var final_quality := QualityCalculator.apply_trait_penalty(base_quality, final_traits)

	# 【ステップ5】: calculate_contribution / calculate_reward — REQ-109, REQ-110
	# 　最終品質・最終発現特性・指定合致判定から貢献度・報酬を算出する 🔵
	# 　【申し送り事項4の確認】: 各関数はここで1回ずつしか呼び出しておらず、本関数内で
	# 　　指定合致ボーナスが二重適用されることはない（ファイル冒頭「申し送り事項の統合地点」参照）。
	# 　　guild機能側（未実装）との責務重複疑義は本関数のスコープ外 🟡
	var contribution := ValueCalculator.calculate_contribution(recipe, final_quality, final_traits, daily_request)
	var reward := ValueCalculator.calculate_reward(recipe, final_quality, final_traits, daily_request)

	# 【CraftResult構築】: 全6フィールドを設定する。base_qualityはfloatの算術平均を
	# 　round()でQuality enumへ変換する（quality_calculator.gdのapply_trait_penaltyと
	# 　同じ丸め方式に統一。TASK-0013申し送り「float→int変換ポイント」の統合） 🟡
	var result := CraftResult.new()
	result.base_quality = int(round(base_quality)) as MaterialInstance.Quality
	result.final_quality = final_quality
	result.activated_traits = final_traits
	# 【rejected_category】: has_rejected_categoryに関わらずenum値を設定してよい契約
	# 　（呼び出し側は必ずhas_rejected_categoryを先に確認する。resolve_category_conflict実物コメント参照） 🟡
	if conflict_result.get("has_rejected_category", false):
		result.rejected_category = conflict_result["rejected_category"]
	result.contribution = contribution
	result.reward = reward
	return result
