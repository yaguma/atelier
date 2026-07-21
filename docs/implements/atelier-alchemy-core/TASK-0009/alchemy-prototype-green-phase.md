# TASK-0009 Greenフェーズ記録: 1画面調合プロトタイプ

**機能名**: 1画面調合プロトタイプ（alchemy-prototype）
**タスクID**: TASK-0009
**要件名**: atelier-alchemy-core
**フェーズ**: Green（最小実装）
**作成日**: 2026-07-21

---

## 1. 実装したファイル

### 1.1 Functional Core（TDD主対象）

- パス: `atelier-godot/features/prototype/logic/prototype_alchemy_resolver.gd`
- `class_name PrototypeAlchemyResolver extends RefCounted`
- `static func resolve(materials: Array) -> Dictionary` を実装
- Node/Scene非依存の純粋関数（副作用なし、同じ入力に対し常に同じ出力）

### 1.2 Imperative Shell（動作確認対象）

- `atelier-godot/features/prototype/ui/alchemy_prototype.gd`（`class_name AlchemyPrototype extends Control`）
- `atelier-godot/features/prototype/ui/alchemy_prototype.tscn`

---

## 2. 実装コード全文

### 2.1 prototype_alchemy_resolver.gd

```gdscript
# res://features/prototype/logic/prototype_alchemy_resolver.gd
# TASK-0009: 1画面プロトタイプ用の簡易調合計算ロジック(Functional Core)。
# Phase 3で実装される正式なAlchemyResolver（features/alchemy/）とは別物であり、
# 本実装をそちらへ移動・統合しない（note.md 6章）。
class_name PrototypeAlchemyResolver
extends RefCounted

## Quality.D相当の下限値。最終品質はこれを下回らない（REQ-111, EDGE-102）
const QUALITY_MIN: int = 1


## 投入素材から完成品の基礎品質・発現特性・最終品質を算出する純粋関数。
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

	return {"quality": final_quality, "traits": awakened_traits, "success": true}
```

### 2.2 alchemy_prototype.gd（要旨）

- `_on_gather_button_pressed()`: `PrototypeMaterialDefinitions.MATERIALS` を順番に巡回して1件インベントリへ追加（REQ-502, TC-501-01）
- `_on_add_to_slot_button_pressed()`: インベントリの選択項目を投入枠（`SLOT_COUNT = 4`）へ移動
- `_on_craft_button_pressed()`: 投入枠が空なら何もせず return（EDGE-001）。空でなければ `PrototypeAlchemyResolver.resolve()` を呼び出し、結果を `result_label` に表示、投入枠をクリア
- `_update_craft_button_state()`: `craft_button.disabled = _slots.is_empty()` で調合ボタンを二重に防御的に非活性化

全文は `atelier-godot/features/prototype/ui/alchemy_prototype.gd` を参照。

### 2.3 alchemy_prototype.tscn

`Control`（ルート、スクリプトアタッチ） > `VBoxContainer` > `GatherButton`（Button） / `InventoryList`（ItemList） / `AddToSlotButton`（Button） / `SlotList`（ItemList） / `CraftButton`（Button） / `ResultLabel`（Label）。装飾・アニメーションなし（single-screen-prototype方針準拠）。

---

## 3. 実装方針と判断理由

- **最小実装優先**: テストケース定義書（TC1〜TC11のうちTC7を除く10件）を通す最小限のロジックのみ実装。REQ-112/REQ-115は要件定義書・タスク定義の指示通りコード内コメントで明記しスコープ外とした。
- **UI層のグローバルクラス参照**: `alchemy_prototype.gd`は`PrototypeMaterialDefinitions`/`PrototypeAlchemyResolver`をclass_name経由のグローバル参照で使用。プロジェクトを一度ヘッドレスエディタモード（`--headless --editor --quit`）で開き`global_script_class_cache.cfg`を再構築することで解決した（新規`class_name`追加後は再スキャンが必要という既知のGodotの挙動）。
- **調合ボタンの空投入防御**: UI層で`craft_button.disabled`による非活性化と、`_on_craft_button_pressed()`内の早期returnの二重防御とした（EDGE-001の徹底、UXの作り込みは行わない）。

---

## 4. テスト実行結果

### 実行コマンド

```bash
Godot_v4.7-stable_win64_console.exe --headless --path . \
  -s res://addons/gut/gut_cmdln.gd \
  -gdir=res://tests/unit/features/prototype -gexit
```

### 結果

```
10/10 passed.
Totals
------
Scripts               1
Tests                10
Passing Tests        10
Asserts              22
Time              0.651s

---- All tests passed! ----
```

全10件（TC1〜TC6, TC8〜TC11）成功。TC7（UI即時反映）はテストケース定義書の方針通り本スイート対象外（TASK-0010/手動確認でカバー）。

### シーン構文確認

一時チェックスクリプト（`_scene_check.gd`、作業完了後に削除済み）で`load()`→`instantiate()`を実行し、`alchemy_prototype.tscn`がエラーなくインスタンス化できることを確認した。

```
OK: scene loaded and instantiated: AlchemyPrototype
```

---

## 5. 品質判定

```
✅ 高品質:
- テスト結果: GUT実行で10/10件成功
- 実装品質: シンプルかつ動作する（resolve()は約30行、UI層は約110行）
- リファクタ箇所: _format_material/_format_traitsの共通化余地、QUALITY_LABELS/SLOT_COUNTの定数化余地（既に一部実施）
- 機能的問題: なし
- コンパイルエラー: なし
- ファイルサイズ: 両ファイルとも800行を大幅に下回る
- モック使用: 実装コードにモック・スタブは含まれていない
```

---

## 6. 課題・改善点（Refactorフェーズで対応）

- `_format_material`/`_display_result`で品質ラベル変換・特性テキスト整形のロジックが一部重複している（共通ヘルパへの統合を検討）
- `QUALITY_LABELS`はプロトタイプ専用の簡易マッピングであり、正式実装（Phase 3）の表示ロジックとは共有しない前提を維持する
- `SLOT_COUNT`定数はプロトタイプ内で直接保持しており、`GameBalance.RECIPE_DEFAULT_SLOT_COUNT`との重複がある（プロトタイプはfeatures/alchemy/を汚染しない制約があるため意図的な重複。コメントで明記済み）

---

**次のフェーズ**: `/tsumiki:tdd-refactor` でリファクタリングを行う。
