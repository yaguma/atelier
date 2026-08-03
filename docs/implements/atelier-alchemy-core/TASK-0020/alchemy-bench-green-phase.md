# TASK-0020 AlchemyBench UI Greenフェーズ記録

**機能名**: AlchemyBench UI（調合台画面）
**タスクID**: TASK-0020
**要件名**: atelier-alchemy-core
**フェーズ**: Green（最小実装）
**作成日**: 2026-08-03

---

## 1. 実装方針

Redフェーズで作成した9件のテストケースを通すため、`alchemy_bench.gd` の各スタブメソッドと `material_slot.gd` の各スタブメソッドを最小実装した。要件定義書・テストケース定義書・Redフェーズ記録「5. Greenフェーズで実装すべき内容」に列挙された内容をそのまま実装している。

**最重要制約（Warning#2）**: `alchemy_bench.gd` は品質計算・特性発現判定・貢献度/報酬算出のロジックを一切持たない。`_on_craft_pressed()` は `_placed_materials` を無加工で `GameState.craft()` に渡すのみ、`_on_item_crafted()` は受信した `CraftResult` を再計算・補正せず `last_result` にそのまま保持するのみとした。

## 2. 実装コード

### atelier-godot/features/alchemy/ui/alchemy_bench.gd

```gdscript
func _ready() -> void:
	if _game_state == null:
		return  # 【注入前ガード】: set_game_state()前は何もしない 🟡

	# 【投入枠構築】: GameState.recipe_slot_countを唯一の情報源として枠を構築する 🔵
	_build_slots(_game_state.recipe_slot_count)
	# 【シグナル購読】: item_crafted受信時に結果をそのまま保持するハンドラを接続する 🔵
	_game_state.item_crafted.connect(_on_item_crafted)


func _build_slots(count: int) -> void:
	# 【枠リセット】: 再呼び出し時（枠数変更等）に古い枠状態を引き継がないようクリアする 🔵
	slots = []
	# 【枠生成】: count個の空枠を生成する。空枠はnullで表現する 🟡
	for i in range(count):
		slots.append(null)


func place_material(slot_index: int, material: MaterialInstance) -> bool:
	# 【範囲外ガード】: 不正な枠インデックスは配置失敗として扱う 🟡
	if slot_index < 0 or slot_index >= slots.size():
		return false

	# 【重複配置防止】: 同一参照の素材が既に他の枠へ配置済みなら拒否する（TC-4, TC-4b） 🟡
	if _placed_materials.has(material):
		return false

	# 【枠の入れ替え】: 指定枠が既に埋まっていた場合、旧素材を投入済み一覧から取り除く 🟡
	var previous: MaterialInstance = slots[slot_index]
	if previous != null:
		var previous_index := _placed_materials.find(previous)
		if previous_index != -1:
			_placed_materials.remove_at(previous_index)

	# 【配置確定】: 枠状態と投入済み一覧の両方へ反映する 🟡
	slots[slot_index] = material
	_placed_materials.append(material)
	return true


func _update_craft_button_state() -> bool:
	# 【空判定】: EDGE-001（空投入で調合不成立）に対応する唯一の判定条件 🟡
	return _placed_materials.is_empty()


func _on_craft_pressed() -> void:
	if _game_state == null:
		return  # 【未注入ガード】: GameState未注入時は何もしない 🟡

	# 【無加工委譲】: 投入済み配列をそのまま渡す。UI側での計算・加工は行わない（Warning#2境界） 🔵
	_game_state.craft(_placed_materials)


func _on_item_crafted(result) -> void:
	# 【無加工保持】: 受信したCraftResultの値をそのまま保持し、再計算・補正は行わない 🔵
	last_result = result
```

### atelier-godot/features/alchemy/ui/material_slot.gd

```gdscript
func is_empty() -> bool:
	return material == null


func place(p_material: MaterialInstance) -> void:
	material = p_material


func clear() -> void:
	material = null
```

## 3. 実装判断のポイント

- `_build_slots(count)` は呼び出しのたびに `slots` を空配列へリセットしてから再構築する。TC-3a（4枠）→TC-3b相当（5枠）のように枠数変更を伴う再呼び出しがあるため、追記ではなく置き換えとした。
- `place_material()` の重複配置防止は「拒否」方式を採用した（テストケース定義書は「拒否 or 移動」いずれも許容）。実装をシンプルに保ちつつ、指定枠が既に別素材で埋まっていた場合のみ「入れ替え」を行う（前の素材を `_placed_materials` から除去）。
- `_update_craft_button_state()` はUIノード（`craft_button`）を持たないため、disabled状態を戻り値として返す設計を維持した（Redフェーズのスタブ設計を踏襲）。
- `_on_craft_pressed()` / `_on_item_crafted()` はいずれも1行の委譲・保持のみで、計算ロジックを含めていない（Warning#2境界の遵守）。

## 4. テスト実行結果

```
"C:\Users\syagu\AppData\Local\Microsoft\WinGet\Packages\GodotEngine.GodotEngine_Microsoft.Winget.Source_8wekyb3d8bbwe\Godot_v4.7-stable_win64_console.exe" --headless -s addons/gut/gut_cmdln.gd -gdir=res://tests/unit -gexit
```

- Scripts: 13、Tests: 106、Passing: 106、Failing: 0
- 新規9件（TC-1, TC-2, TC-3a, TC-3b, TC-4, TC-4b, TC-5, TC-6, TC-1b/2b）すべてPASS
- 既存97件（TASK-0011〜0019分）も引き続きPASS（回帰なし）

## 5. 品質判定

```
✅ 高品質:
- テスト結果: 全106件PASS（新規9件・既存97件とも回帰なし）
- 実装品質: シンプル。各メソッドは単一責務、UIノード依存なし
- リファクタ箇所: place_material()の重複防止/入れ替えロジックの可読性向上、
  マジックナンバー・重複コードの有無確認（Refactorフェーズで対応）
- 機能的問題: なし
- コンパイルエラー: なし
- ファイルサイズ: alchemy_bench.gd 約120行、material_slot.gd 約38行（800行制限内）
- モック使用: 実装コードにモック・スタブは含まれていない（テストコード内のSpyGameStateのみ）
```

## 6. Refactorフェーズへの申し送り

- `place_material()` 内の枠入れ替えロジック（`previous`変数のfind/remove）を独立したprivateヘルパーへ切り出す余地がある
- `_ready()` のガード節（`if _game_state == null: return`）と `_on_craft_pressed()` の同様のガード節が重複しているため、共通化を検討する
- デバッグ用の`print`等は含めていないため削除作業は不要
