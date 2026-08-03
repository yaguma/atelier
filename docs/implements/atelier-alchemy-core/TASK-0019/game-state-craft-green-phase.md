# TASK-0019: GameState.craft()連携実装 - Greenフェーズ記録

- **機能名**: GameState.craft()連携実装（game-state-craft）
- **タスクID**: TASK-0019
- **要件名**: atelier-alchemy-core
- **フェーズ**: Green（最小実装でテストを通す）

---

## 1. 実装したファイル

| 種別 | パス |
|------|------|
| 実装（更新） | `atelier-godot/autoload/game_state.gd` |

Redフェーズで作成したスタブ（`pass`のみ）の `craft()` / `_consume_materials()` を、note.md「実装詳細」およびRedフェーズ記録「5. Greenフェーズで実装すべき内容」に記載された契約どおりに実装した。

---

## 2. 実装内容

```gdscript
func craft(materials: Array[MaterialInstance]) -> void:
	# 【純粋関数への委譲】: 状態（current_rank/today_request/current_recipe/trait_definitions）を
	# 　引数として渡し、計算そのものはAlchemyResolver側に完全委譲する 🔵
	var result: CraftResult = AlchemyResolver.craft(
		materials,
		current_rank.trait_reveal_level,
		today_request,
		current_recipe,
		trait_definitions,
	)

	# 【EDGE-001ガード】: 投入枠が空等でnullが返った場合は状態変更・シグナル発行を
	# 　一切行わずに即returnする（TC-101-E01: 無副作用の安全契約） 🔵
	if result == null:
		return

	# 【在庫消費】: 投入素材のみをinventoryから除去する（TC-101-N01） 🔵
	_consume_materials(materials)
	# 【ランクHP更新】: 貢献度分を減算する。丸めはint(round())で四捨五入（TC-101-N02） 🔵
	rank_hp -= int(round(result.contribution))
	# 【ゴールド更新】: 報酬分を加算する。丸めはint(round())で四捨五入（TC-101-N02） 🔵
	gold += int(round(result.reward))
	# 【シグナル発行】: 調合成功をCraftResultとともに1回だけ通知する（TC-101-N03） 🔵
	item_crafted.emit(result)


func _consume_materials(materials: Array[MaterialInstance]) -> void:
	# 【個別除去】: 投入素材ごとにinventory内の同一参照を検索し除去する 🔵
	for material in materials:
		var index := inventory.find(material)
		if index != -1:
			inventory.remove_at(index)
	# 【在庫変更通知】: 在庫が変化したことを購読者へ通知する 🟡
	inventory_updated.emit()
```

### 実装方針・判断理由

- **仕様との整合性確認**: 実装前に要件定義書・テストケース定義書・Redフェーズ記録の3点を照合。差異は見つからず、note.md／Redフェーズ記録に記載の実装契約をそのまま採用した（AskUserQuestionは不要と判断）。
- **Imperative Shellの原則遵守**: `craft()`は「状態読み取り→純粋関数(`AlchemyResolver.craft()`)へ委譲→状態更新→シグナル発行」のみを行い、計算ロジック（品質計算・特性発現判定・貢献度/報酬算出）は一切持たない（architecture.md「Warning#2対応」）。TC-101-B01（構造的確認）がこの原則の回帰防止テストとして機能する。
- **EDGE-001ガード**: `AlchemyResolver.craft()`が`null`を返した場合は即`return`し、`_consume_materials`・`rank_hp`/`gold`更新・`item_crafted`発行のいずれにも到達しない設計とした（TC-101-E01）。
- **丸め処理**: `int(round(result.contribution))` / `int(round(result.reward))` として、data-model.mdの契約どおり四捨五入してから加減算する。
- **在庫消費の同一性保証**: `inventory.find(material)` は値の`==`比較ではなく参照同一性で動作するため、同一`id`を持つ複数個体があっても投入した参照分のみを正しく消費できる（TC-101-N01の過剰消費・過少消費防止要件を満たす）。

### 実装に含めた日本語コメント

- 各関数冒頭に【機能概要】【実装方針】【テスト対応】と信頼性レベル（🔵🟡）を明記
- 処理ブロックごとに【純粋関数への委譲】【EDGE-001ガード】【在庫消費】【ランクHP更新】【ゴールド更新】【シグナル発行】【個別除去】【在庫変更通知】のコメントを付与し、各行が対応するテストケース（TC-101-N01/N02/N03/E01等）を明示

---

## 3. テスト実行結果

### 単体テスト（`tests/unit/autoload`）

```
"C:\...\Godot_v4.7-stable_win64_console.exe" --headless -s addons/gut/gut_cmdln.gd -gdir=res://tests/unit/autoload -gexit
```

結果: **6/6 passed**（Asserts: 38）

- test_調合成功時にinventoryから投入した素材のみが消費される（TC-101-N01）
- test_調合成功時にrank_hpが貢献度分減算されgoldが報酬分加算される（TC-101-N02）
- test_調合成功時にitem_craftedが1回だけ発行されペイロードがCraftResultである（TC-101-N03）
- test_投入枠が空のとき状態変更もシグナル発行も一切起きない（TC-101-E01）
- test_GameState経由の結果がAlchemyResolver直接呼び出しと完全一致する（TC-101-B01）
- test_素材1個で調合が成立し状態更新とシグナル発行が揃う（TC-101-B02）

### 統合テスト（`tests/integration/autoload`）

```
"C:\...\Godot_v4.7-stable_win64_console.exe" --headless -s addons/gut/gut_cmdln.gd -gdir=res://tests/integration/autoload -gexit
```

結果: **1/1 passed**（Asserts: 11）

- test_実在庫データを用いた調合フローが1回の呼び出しで一貫完了する（TC-101-I01）

### 既存全単体テストの回帰確認（`tests/unit`全体）

```
"C:\...\Godot_v4.7-stable_win64_console.exe" --headless -s addons/gut/gut_cmdln.gd -gdir=res://tests/unit -gexit
```

結果: **97/97 passed**（Scripts: 12, Asserts: 1226）

- 既存91件（TASK-0011〜0018分）+ 新規6件（TASK-0019単体分）が全件PASS
- デグレなし

---

## 4. 品質判定

```
✅ 高品質:
- テスト結果: 単体6/6・統合1/1・全体97/97 すべて成功
- 実装品質: シンプル（委譲＋状態更新＋シグナル発行のみ、条件分岐は1箇所）
- リファクタ箇所: 現時点で明確な問題なし（軽微な定数化・コメント整理の余地はRefactorフェーズで検討）
- 機能的問題: なし
- コンパイルエラー: なし
- ファイルサイズ: 101行（800行制限を大きく下回る）
- モック使用: 実装コードにモック・スタブなし（AlchemyResolver/CraftResultは実物を使用）
```

## 5. 課題・改善点（Refactorフェーズで対応検討）

- Redフェーズ記録・requirements.mdに記載の申し送り事項（rank_hp/gold更新責務の設計不整合、`current_recipe`/`trait_definitions`のロードタイミング、`DailyRequest`/`RankDefinition`型の未実装）は本タスクのスコープ外。Phase 4着手前に設計確定が必要（既存申し送り継続）。
- `project.godot`へのAutoload登録は引き続き見送り（UI層実装（TASK-0020以降）でAutoload参照が必要になった時点で再検討）。
