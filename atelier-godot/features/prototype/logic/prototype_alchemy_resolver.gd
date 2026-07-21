# res://features/prototype/logic/prototype_alchemy_resolver.gd
# TASK-0009: 1画面プロトタイプ用の簡易調合計算ロジック(Functional Core)。
# Phase 3で実装される正式なAlchemyResolver（features/alchemy/）とは別物であり、
# 本実装をそちらへ移動・統合しない（note.md 6章）。
class_name PrototypeAlchemyResolver
extends RefCounted

## Quality.D相当の下限値。最終品質はこれを下回らない（REQ-111, EDGE-102）
const QUALITY_MIN: int = 1


## 投入素材から完成品の基礎品質・発現特性・最終品質を算出する純粋関数。
## 【機能概要】: 投入枠に配置された素材配列から、品質平均・特性発現判定・品質ペナルティを一括計算する
## 【実装方針】: REQ-105/106/111を簡略化したプロトタイプ専用ロジック。Node/Scene非依存のstatic funcとし、
##              副作用を持たず同じ入力に対し常に同じ出力を返す（Functional Core原則）
## 【テスト対応】: prototype_alchemy_resolver_test.gd の TC1〜TC6, TC8〜TC11 を通すための実装
## 🔵🟡 信頼性レベル: 特性発現閾値(REQ-106)・品質下限(REQ-111)は🔵、平均の切り捨て・減算式は🟡（簡略化の妥当な推測）
## @param materials 各要素が {"quality": int, "traits": Array} のDictionaryの配列（投入枠の内容、0〜4件）
## @returns {"quality": int, "traits": Array, "success": bool}
static func resolve(materials: Array) -> Dictionary:
	# 【空投入判定】: EDGE-001 投入枠が空の場合、平均計算（分母0）を避け計算を行わず不成立を返す 🟡
	if materials.is_empty():
		return {"quality": 0, "traits": [], "success": false}

	# 【基礎品質】: 投入素材のqualityスコア合計をint除算し平均を算出する（端数は切り捨て、REQ-105簡略版） 🟡
	var quality_sum: int = 0
	for material in materials:
		quality_sum += material["quality"]
	var base_quality: int = quality_sum / materials.size()

	# 【特性集計】: 全素材のtraitsを走査し、タグごとの出現回数をカウントする（REQ-106） 🔵
	var trait_counts: Dictionary = {}
	for material in materials:
		for trait_id in material["traits"]:
			trait_counts[trait_id] = trait_counts.get(trait_id, 0) + 1

	# 【発現判定】: 出現回数2以上のタグのみ発現特性とする（1個のみは不発、EDGE-101） 🔵
	# 簡略化: REQ-112（同一系統内の複数特性同時発現の加算ペナルティ）、
	#          REQ-115（貢献度系/報酬系の排他制御）は本タスクではスコープ外
	var awakened_traits: Array = []
	for trait_id in trait_counts:
		if trait_counts[trait_id] >= 2:
			awakened_traits.append(trait_id)

	# 【最終品質】: 発現特性1個につき基礎品質を1段階減算し、下限QUALITY_MINでクランプする（REQ-111簡略版） 🔵
	var final_quality: int = base_quality - awakened_traits.size()
	final_quality = max(final_quality, QUALITY_MIN)

	# 【結果返却】: 通常投入時は成立フラグtrueで完成品情報を返す
	return {"quality": final_quality, "traits": awakened_traits, "success": true}
