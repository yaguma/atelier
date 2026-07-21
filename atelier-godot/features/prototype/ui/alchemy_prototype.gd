# res://features/prototype/ui/alchemy_prototype.gd
# TASK-0009: 1画面プロトタイプのUI制御(Imperative Shell)。
# 素材入手→投入枠配置→調合実行→完成品表示までを1画面で完結させる（REQ-501〜503）。
# 庭・時間経過・演出は一切扱わない（REQ-502）。alchemy_prototype.tscnにアタッチする。
class_name AlchemyPrototype
extends Control

@onready var gather_button: Button = $VBoxContainer/GatherButton
@onready var inventory_list: ItemList = $VBoxContainer/InventoryList
@onready var add_to_slot_button: Button = $VBoxContainer/AddToSlotButton
@onready var slot_list: ItemList = $VBoxContainer/SlotList
@onready var craft_button: Button = $VBoxContainer/CraftButton
@onready var result_label: Label = $VBoxContainer/ResultLabel

## REQ-101 投入枠初期値4枠（GameBalance.RECIPE_DEFAULT_SLOT_COUNTと同値。プロトタイプでは直接定数を持つ）
const SLOT_COUNT: int = 4

const QUALITY_LABELS: Dictionary = {
	PrototypeMaterialDefinitions.Quality.D: "D",
	PrototypeMaterialDefinitions.Quality.C: "C",
	PrototypeMaterialDefinitions.Quality.B: "B",
	PrototypeMaterialDefinitions.Quality.A: "A",
	PrototypeMaterialDefinitions.Quality.S: "S",
}

## 【状態管理】: インベントリ・投入枠は素材Dictionary（PrototypeMaterialDefinitions.MATERIALSの要素）の配列で保持する
var _inventory: Array[Dictionary] = []
var _slots: Array[Dictionary] = []


func _ready() -> void:
	gather_button.pressed.connect(_on_gather_button_pressed)
	add_to_slot_button.pressed.connect(_on_add_to_slot_button_pressed)
	craft_button.pressed.connect(_on_craft_button_pressed)
	_update_craft_button_state()


## 【素材入手】: ダミー素材データセットから順番に1種類をインベントリへ即時追加する
## 【実装方針】: 庭・時間経過は扱わずボタン押下と同期的に反映する（REQ-502, TC-501-01）
func _on_gather_button_pressed() -> void:
	var materials: Array[Dictionary] = PrototypeMaterialDefinitions.MATERIALS
	if materials.is_empty():
		return
	# 【素材選択】: 入手順を可視化しやすいよう、8種を順番に巡回して1件追加する
	var next_material: Dictionary = materials[_inventory.size() % materials.size()]
	_inventory.append(next_material)
	_refresh_inventory_list()


## 【投入枠への配置】: インベントリで選択中の素材を投入枠（最大SLOT_COUNT）へ移動する
func _on_add_to_slot_button_pressed() -> void:
	if _slots.size() >= SLOT_COUNT:
		return
	var selected: PackedInt32Array = inventory_list.get_selected_items()
	if selected.is_empty():
		return
	var index: int = selected[0]
	var material: Dictionary = _inventory[index]
	_inventory.remove_at(index)
	_slots.append(material)
	_refresh_inventory_list()
	_refresh_slot_list()
	_update_craft_button_state()


## 【調合実行】: 投入枠の内容からPrototypeAlchemyResolver.resolve()を呼び出し完成品を表示する（REQ-503, TC-501-02）
## 【空投入拒否】: 投入枠が空の場合は押下を無視し、計算を行わない（EDGE-001）
func _on_craft_button_pressed() -> void:
	if _slots.is_empty():
		return
	var materials: Array = []
	for material in _slots:
		materials.append({"quality": material["quality"], "traits": material["traits"]})
	var result: Dictionary = PrototypeAlchemyResolver.resolve(materials)
	_display_result(result)
	# 【投入枠クリア】: 調合成立後は投入枠を空に戻し、次の調合に備える
	_slots.clear()
	_refresh_slot_list()
	_update_craft_button_state()


## 【ヘルパー関数】: インベントリ・投入枠のItemList表示を素材配列から再構築する共通処理
## 【再利用性】: _refresh_inventory_list/_refresh_slot_listが個別に持っていたclear+ループを統合し、DRY原則に従う
func _refresh_list(list: ItemList, materials: Array[Dictionary]) -> void:
	list.clear()
	for material in materials:
		list.add_item(_format_material(material))


func _refresh_inventory_list() -> void:
	_refresh_list(inventory_list, _inventory)


func _refresh_slot_list() -> void:
	_refresh_list(slot_list, _slots)


## 【調合ボタン活性制御】: 投入枠が空の場合は非活性化する（EDGE-001準拠の二重防御）
func _update_craft_button_state() -> void:
	craft_button.disabled = _slots.is_empty()


## 【ヘルパー関数】: 品質スコアを表示用ラベル（D〜S）に変換する
## 【単一責任】: QUALITY_LABELS参照箇所を1箇所に集約し、未定義スコア時の"?"表示も一元化する
func _quality_label(quality: int) -> String:
	return QUALITY_LABELS.get(quality, "?")


func _format_material(material: Dictionary) -> String:
	var quality_label: String = _quality_label(material["quality"])
	var traits_text: String = _format_traits(material["traits"])
	return "%s [%s] (%s)" % [material["display_name"], quality_label, traits_text]


func _format_traits(traits: Array) -> String:
	if traits.is_empty():
		return "特性なし"
	var trait_names: Array[String] = []
	for trait_id in traits:
		trait_names.append(String(trait_id))
	return ", ".join(trait_names)


func _display_result(result: Dictionary) -> void:
	if not result["success"]:
		result_label.text = "調合失敗（投入枠が空です）"
		return
	var quality_label: String = _quality_label(result["quality"])
	var traits_text: String = _format_traits(result["traits"])
	result_label.text = "完成品 品質: %s / 発現特性: %s" % [quality_label, traits_text]
