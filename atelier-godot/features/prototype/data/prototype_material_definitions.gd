# res://features/prototype/data/prototype_material_definitions.gd
# TASK-0008: 1画面プロトタイプ（TASK-0009）用のダミー素材マスターデータ。
# TASK-0005のMaterialDefinition/TraitDefinition Resource（features/alchemy/data/）は
# 本タスク時点で未実装のため、data-model.mdのQuality/Category定義を踏襲した簡易constで代替する。
# 正式なゲームバランスとは独立しており、Phase 3以降の本実装マスターデータと値を一致させる必要はない。
class_name PrototypeMaterialDefinitions
extends RefCounted

## data-model.md MaterialInstance.Quality (D=1..S=5) を踏襲
enum Quality { D = 1, C = 2, B = 3, A = 4, S = 5 }

## data-model.md TraitDefinition.Category を踏襲（プロトタイプではSUPPORTは扱わない）
enum TraitCategory { CONTRIBUTION, REWARD }

## 特性タグID -> 系統。REQ-115の排他制御（貢献度系/報酬系）をTASK-0009から判定できるようにする
const TRAIT_CATEGORIES: Dictionary = {
	&"contribution_holy": TraitCategory.CONTRIBUTION,
	&"contribution_purify": TraitCategory.CONTRIBUTION,
	&"reward_gold": TraitCategory.REWARD,
	&"reward_rare": TraitCategory.REWARD,
}

## ダミー素材データセット（8種）。
## 各Dictionaryのkey: id, display_name, quality(Quality), traits(Array[StringName])
##
## 観点チェック:
## - 品質D〜Sの5段階を全て網羅
## - 特性なし(品質のみで比較): pure_crystal(S), plain_water(C)
## - 品質は高いが特性なし: pure_crystal(S) / 品質は低いが特性あり: holy_herb(D), golden_ore(D)
## - 貢献度系: contribution_holy(2種で閾値2個を再現), contribution_purify(1種)
## - 報酬系: reward_gold(2種で閾値2個を再現), reward_rare(1種)
const MATERIALS: Array[Dictionary] = [
	{
		"id": &"pure_crystal",
		"display_name": "純水晶",
		"quality": Quality.S,
		"traits": [] as Array[StringName],
	},
	{
		"id": &"plain_water",
		"display_name": "ただの水",
		"quality": Quality.C,
		"traits": [] as Array[StringName],
	},
	{
		"id": &"holy_herb",
		"display_name": "聖なる薬草",
		"quality": Quality.D,
		"traits": [&"contribution_holy"] as Array[StringName],
	},
	{
		"id": &"holy_herb_two",
		"display_name": "清めの実",
		"quality": Quality.C,
		"traits": [&"contribution_holy"] as Array[StringName],
	},
	{
		"id": &"moon_dew",
		"display_name": "月の雫",
		"quality": Quality.S,
		"traits": [&"contribution_purify"] as Array[StringName],
	},
	{
		"id": &"golden_ore",
		"display_name": "黄金鉱石",
		"quality": Quality.D,
		"traits": [&"reward_gold"] as Array[StringName],
	},
	{
		"id": &"golden_dust",
		"display_name": "金粉",
		"quality": Quality.B,
		"traits": [&"reward_gold"] as Array[StringName],
	},
	{
		"id": &"rare_gem",
		"display_name": "稀石",
		"quality": Quality.A,
		"traits": [&"reward_rare"] as Array[StringName],
	},
]


## idから素材定義を取得する（見つからない場合はnullを返す）
static func find_by_id(id: StringName) -> Dictionary:
	for material in MATERIALS:
		if material["id"] == id:
			return material
	return {}
