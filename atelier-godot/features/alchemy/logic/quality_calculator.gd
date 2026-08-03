## TASK-0013: 基礎品質算出（QualityCalculator）
##
## 【機能概要】: 調合に投入された素材群（Array[MaterialInstance]）のquality値（D=1〜S=5）
## 　　　　　　 の算術平均を「基礎品質」として算出する純粋関数。
## 【実装方針】: Functional Core（logic/）に配置する副作用のない静的メソッドのみで構成する。
## 　　　　　　 GameState・Autoload等の外部状態は一切参照しない。
## 【テスト対応】: quality_calculator_test.gd の全8ケース（正常系4/異常系1/境界値3）を通すための実装
## 🔵 信頼性レベル: REQ-105・TC-101-01（要件定義書・受け入れ基準）に基づく
class_name QualityCalculator
extends RefCounted


## 【機能概要】: 投入素材群のquality値の算術平均（基礎品質）を算出する
## 【改善内容】: Greenフェーズから機能変更なし（テスト28/28green維持）。
## 　　　　　　 設計判断コメントを「戻り値型の根拠」と「Quality enumへの非変換方針」の
## 　　　　　　 2点に分離・明確化し、後続タスク実装者が誤って本関数を拡張しないよう
## 　　　　　　 責務境界を強調した
## 【設計方針】: 空配列はゼロ除算を避けるため0.0を返す（防御的実装）。
## 　　　　　　 整数除算バグ（int/int切り捨て）を避けるためfloatに変換してから除算する。
## 【パフォーマンス】: O(n)の単純な合計・除算のみ。調合投入枠は数個規模（REQ-101想定4枠）
## 　　　　　　 のため計算量上の懸念はなく、追加の最適化は不要。
## 【保守性】: quality参照のみに責務を限定し、traits等の他プロパティには一切触れない
## 　　　　　　 ことで、後続の品質ペナルティ計算（TASK-0016）との責務境界を明確に保つ。
## 【テスト対応】: TC-101-01（D/C/B/A平均2.5）、単一素材・同一品質・traits無視・
## 　　　　　　 空配列・上下限境界・非終端小数精度の全ケースに対応
##
## ⚠️ 設計判断1（戻り値型はfloatを採用しintは採用しない）:
## 　architecture.mdの関数シグネチャ例は `-> int` だが、acceptance-criteria.md TC-101-01の
## 　期待値は `2.5`（非整数）であり int 型では表現不可能。設計文書間に不整合が存在するため、
## 　より厳密な受け入れ基準（TC-101-01）を正とし、本関数は `-> float` を採用する。
## 　（note.md「6. 注意事項」・requirements.md「⚠️ 型に関する設計判断」で申し送り済み）
## 🟡 信頼性レベル: 設計文書間の不整合を解消するための妥当な推測（元資料に矛盾があるため）
##
## ⚠️ 設計判断2（Quality enumへの変換は本関数の責務にしない）:
## 　本関数はfloatの算術平均をそのまま返し、D〜S（Quality enum）への丸め・変換は行わない。
## 　その変換は「基礎品質算出 → ペナルティ適用 → enum変換」という処理順序を守るため、
## 　ペナルティ適用後に丸めるTASK-0016（QualityPenalty）側の責務とする。
## 🔵 信頼性レベル: REQ-105「基礎品質＝投入素材の平均品質」・REQ-111（ペナルティは基礎品質に適用）に基づく
##
## @param materials - 調合に投入する素材インスタンスの配列
## @returns 素材quality値の算術平均（float）。空配列時は0.0
static func calculate_base_quality(materials: Array[MaterialInstance]) -> float:
	# 【入力値検証】: 空配列はゼロ除算を引き起こすため、先に防御的に0.0を返す 🔵
	if materials.is_empty():
		return 0.0

	# 【合計算出】: 各素材のquality（int評価されるenum）を合算する 🔵
	# 【traits非参照】: 本関数はqualityのみを参照し、traitsは一切使用しない（責務分離）
	var total: int = 0
	for material in materials:
		# 【enumのint評価】: MaterialInstance.Quality（D=1〜S=5）はGDScriptではint評価されるが、
		# 　可読性のため明示的にint()でキャストしてから合算する 🔵
		total += int(material.quality)

	# 【平均算出】: float変換してから除算し、整数除算（int/int切り捨て）による
	# 　精度損失を回避する 🔵
	# 【期待値確認】: 例) 合計10÷4=2.5、合計7÷3=2.333...のように非終端小数も精度を保つ
	return float(total) / float(materials.size())


## TASK-0016: 品質ペナルティ適用
##
## 【機能概要】: 発現特性数に応じて基礎品質を減算し、最終品質(Quality enum)を算出する純粋関数。
## 　　　　　　 SUPPORT系（触媒）は減算対象外とし、減算後に別途+1段の加算効果を持つ。
## 【改善内容】: Greenフェーズから機能・アルゴリズムの変更なし（テスト58/58 green維持）。
## 　　　　　　 下記「⚠️ 設計判断」3点を calculate_base_quality と同形式で明文化し、
## 　　　　　　 後続実装者が仕様経緯を知らずに旧設計へ回帰させることを防止した。
## 【実装方針】: 要件定義書§2のアルゴリズム7ステップをそのまま実装する。
## 【テスト対応】: quality_calculator_test.gd の新規9ケース（TC-16-N01〜N04, E01, B01〜B04）を通す実装
## 🔵 信頼性レベル: REQ-108・REQ-111・REQ-112（要件定義書）およびテストケース定義書に基づく
##
## ⚠️ 設計判断1（品質スコアへの直接減算方式・仕様確定の経緯 / 回帰禁止）:
## 　本ロジックは2026-07-09のゲームデザインレビューで確定した仕様であり、
## 　旧版（枠数ベースの食い合い＝1素材が複数特性を同時保有すると品質・特性・貢献度・報酬を
## 　無条件に両取りできてしまう）が抱えていた**支配戦略の抜け穴を塞ぐ**ために導入された。
## 　新版では「発現特性1個につき品質スコアを1段減算し、SUPPORTのみ減算除外＋事後加算」という
## 　**数式レベルの直接ペナルティ**に置き換えている。
## 　🚨 リファクタ・改修時の注意: 「枠数を消費して特性を選択させる」旧設計（食い合いを投入枠の
## 　奪い合いとして表現する方式）に戻すと、本タスクが塞いだ支配戦略の抜け穴が再発する。
## 　変更する場合は必ず要件定義書§1（REQ-111/REQ-112）およびTASK-0016.md注記を再確認すること。
## 🔵 信頼性レベル: apply-trait-penalty-requirements.md §1・REQ-111/REQ-112に基づく
##
## ⚠️ 設計判断2（SUPPORT複数投入時の加算モデルは暫定実装）:
## 　REQ-108本文は「触媒＝品質+1段」を定めるのみで、SUPPORTを複数投入した場合の挙動は
## 　明記されていない。本実装は「SUPPORT件数分だけ単純加算する」モデルを暫定的に採用している
## 　（下のTC-16-B02は触媒2個投入で+2加算され、上限クランプでS(5)に丸め込まれることを確認）。
## 　📝 申し送り: 触媒を複数投入した場合の加算量（線形加算のままでよいか、逓減させるべきか等）は
## 　バランス調整フェーズで再検討が必要な可能性がある。仕様が正式決定次第、本コメントと
## 　実装ロジックを合わせて更新すること。
## 🟡 信頼性レベル: 元資料に複数投入時の挙動明記なし。単純加算モデルは妥当な推測にとどまる
##
## ⚠️ 設計判断3（float→Quality enum変換のround()丸め方式は暫定対応）:
## 　architecture.mdの関数シグネチャ例（`-> int`想定）とacceptance-criteria.mdの期待値
## 　（非整数の基礎品質を扱う前提）との間に設計文書間の不整合があり、TASK-0013時点では
## 　この変換ポイント・丸め方式が未確定だった（quality_calculator.gd冒頭「設計判断2」参照）。
## 　本タスク（TASK-0016）にてfloat→enum変換の責務と丸め方式（round()＝四捨五入）を
## 　本関数に集約する形で暫定的に確定させた。
## 　📝 申し送り: 四捨五入以外の丸め方式（切り捨て等）が正式仕様として決定された場合は、
## 　本関数とTC-16-B03（round(2.5)=3.0を検証するテスト）を合わせて見直すこと。
## 🟡 信頼性レベル: TASK-0013/TASK-0016.md「実装詳細」の🟡信頼性補足に基づく暫定対応
##
## @param base_quality - ペナルティ適用前の基礎品質（TASK-0013の出力）
## @param activated_traits - 系統排他制御適用後の最終発現特性（TASK-0015の出力）
## @returns ペナルティ・ボーナス適用後にクランプ・丸めを経た最終品質（MaterialInstance.Quality）
static func apply_trait_penalty(
	base_quality: float,
	activated_traits: Array[TraitDefinition],
) -> MaterialInstance.Quality:
	# 【件数カウント初期化】: 減算対象（SUPPORT以外）と加算対象（SUPPORT）の件数を集計する 🔵
	var penalty_count := 0
	var support_bonus_count := 0
	for trait_def in activated_traits:
		# 【カテゴリ分岐】: SUPPORT（触媒）は減算対象外・加算対象として別枠でカウントする 🔵
		# 【REQ-108対応】: 触媒＝品質+1段は「減算対象からの除外」と「事後加算」の2点セットで実現する
		if trait_def.category == TraitDefinition.Category.SUPPORT:
			# 【暫定実装】: SUPPORT複数投入時は件数分を単純加算する（上記「設計判断2」参照）。
			# 　線形加算の妥当性はバランス調整フェーズで再検証が必要 🟡
			support_bonus_count += 1
		else:
			# 【REQ-111/REQ-112対応】: CONTRIBUTION・REWARDいずれも1個につき1段減算し、
			# 　複数発現時は加算的に積み重なる（枠配分ではなく品質スコア直接減算） 🔵
			# 【回帰防止】: この直接減算こそが支配戦略の抜け穴対策の本体（上記「設計判断1」参照）。
			# 　枠数ベースの排他選択に置き換えないこと。
			penalty_count += 1

	# 【減算適用】: 発現特性数（SUPPORT以外）に応じて基礎品質を減算する 🔵
	var quality_after_penalty := base_quality - float(penalty_count)
	# 【加算適用】: 減算「後」にSUPPORT件数分を加算する（REQ-108・REQ-111の処理順序を厳守） 🔵
	quality_after_penalty += float(support_bonus_count)

	# 【下限クランプ】: 最終品質はD(1.0)を下回ってはならない（REQ-111 Critical / TC-101-B02） 🔵
	quality_after_penalty = max(quality_after_penalty, 1.0)
	# 【上限クランプ】: 最終品質はS(5.0)を上回ってはならない（Quality値域のための防御的実装） 🟡
	quality_after_penalty = min(quality_after_penalty, 5.0)

	# 【丸め方式・暫定対応】: round()（四捨五入）でfloat→Quality enumへ変換する（上記「設計判断3」参照）。
	# 　TASK-0013由来の設計文書間の不整合（int想定 vs 非整数期待値）を解消するための
	# 　暫定確定方式であり、本関数（QualityCalculator）にfloat→enum変換ポイントを集約する 🟡
	var rounded := int(round(quality_after_penalty))
	return rounded as MaterialInstance.Quality
