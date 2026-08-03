# TASK-0014: TraitActivation.resolve_activated_traits Greenフェーズ記録

**機能名**: 特性発現判定ロジック（trait-activation）
**タスクID**: TASK-0014
**要件名**: atelier-alchemy-core
**フェーズ**: Green（最小実装）
**作成日**: 2026-07-31

---

## 1. 実装したファイル

- `atelier-godot/features/alchemy/logic/trait_activation.gd`（新規作成）

## 2. 実装コード全文

```gdscript
## TASK-0014: 特性発現判定（TraitActivation）
##
## 【機能概要】: 投入された素材群から「どの特性タグが完成品に発現するか」を判定する
## 　　　　　　 閾値発現ロジック。同一の特性タグを持つ素材が2個以上ある場合にのみ、
## 　　　　　　 その特性を発現候補として返す純粋関数。
## 【実装方針】: Functional Core（logic/）に配置する副作用のない静的メソッドのみで構成する。
## 　　　　　　 GameState・Autoload等の外部状態は一切参照せず、段階的開示レベルは
## 　　　　　　 reveal_level引数として明示的に受け取る（Godotアーキテクトレビュー Critical#1対応）。
## 【テスト対応】: trait_activation_test.gd の全11ケース（正常系3/異常系5/境界値3）を通すための実装
## 🔵 信頼性レベル: REQ-106・REQ-112・REQ-121・REQ-122（要件定義書）に基づく
class_name TraitActivation
extends RefCounted


## 【定数定義】: 同一特性タグが発現とみなされる最小出現回数（REQ-106「2個以上で発現」）
## 🔵 信頼性レベル: REQ-106に明記
const ACTIVATION_THRESHOLD: int = 2


## 【機能概要】: 投入素材群のtraitsを集計し、閾値・段階的開示フィルタを通過した
## 　　　　　　 特性タグをTraitDefinitionへ解決して返す
## 【実装方針】: 1) reveal_level<=0なら即座に空配列（最優先フィルタ）、
## 　　　　　　 2) 各素材のtraitsを出現回数集計、3) 出現回数>=2のタグのみ候補化、
## 　　　　　　 4) trait_definitions辞書で解決可能なタグのみ結果に含める。
## 　　　　　　 系統排他（REQ-115）は行わない。同一系統内の複数特性も両方返す（REQ-112）。
## 【テスト対応】: TC-101-02/03/06/B01, TC-121-01/02/E01/B02, TC-123-B03,
## 　　　　　　 TC-101-EMPTY, TC-101-NOTRAIT すべてに対応
## 🔵 信頼性レベル: REQ-106・REQ-112・REQ-121・REQ-122・note.md「段階的開示フィルタ」に基づく
##
## @param materials - 調合に投入する素材インスタンスの配列（空配列可）
## @param reveal_level - 段階的開示レベル（0=Gランク相当・特性一切発現しない、1以上=Eランク以降で解禁）
## @param trait_definitions - StringName(特性ID) -> TraitDefinition のマスターデータ辞書
## @returns Array[TraitDefinition] - 発現候補となる特性定義の配列（該当なしは空配列）
static func resolve_activated_traits(
	materials: Array[MaterialInstance],
	reveal_level: int,
	trait_definitions: Dictionary,
) -> Array[TraitDefinition]:
	# 【最優先フィルタ】: reveal_level=0（Gランク相当）では閾値を満たす構成でも
	# 　一切発現させない。庭・ショップ側の入手制限が漏れても、ここで二重に防止する
	# 　（二重の安全策、TC-121-01/E01/B02） 🔵
	var result: Array[TraitDefinition] = []
	if reveal_level <= 0:
		return result

	# 【出現回数集計】: 各素材のtraits配列に含まれる特性タグIDの出現回数を数える
	# 　materialsが空、または全素材が無特性の場合はtag_countsが空のままとなり、
	# 　後続ループが実行されず自然に空配列を返す（TC-101-EMPTY/NOTRAIT） 🔵
	var tag_counts: Dictionary = {}
	for material in materials:
		for tag in material.traits:
			tag_counts[tag] = tag_counts.get(tag, 0) + 1

	# 【閾値判定・解決】: 出現回数がACTIVATION_THRESHOLD(2)以上のタグのみを候補とし、
	# 　trait_definitions辞書でTraitDefinitionへ解決できるものだけ結果に加える。
	# 　同一系統内でも閾値を満たす複数特性はすべて候補に残す＝系統排他は行わない
	# 　（TASK-0015の責務、TC-101-06） 🔵
	# 【暫定実装】: reveal_level>=2（Dランク、REQ-123）は追加特性が未確定(TBD)のため、
	# 　本タスクではreveal_level>=1と同じ扱いとする（TC-123-B03、申し送り事項） 🟡
	for tag in tag_counts.keys():
		if tag_counts[tag] >= ACTIVATION_THRESHOLD and trait_definitions.has(tag):
			result.append(trait_definitions[tag])

	return result
```

## 3. 実装方針・判断理由

- Redフェーズドキュメントに記載された実装方針（reveal_levelフィルタ最優先 → 出現回数集計 →
  閾値判定 → reveal_level>=2の暫定扱い → TraitDefinition解決）をそのまま採用した。
- `reveal_level <= 0`を早期returnにすることで、閾値判定ロジックとの結合を排除し
  「非開示フィルタが最優先」という要件（REQ-121・二重の安全策）を関数冒頭で明確に表現した。
- `ACTIVATION_THRESHOLD`定数（値2）を導入し、REQ-106のマジックナンバーを命名で説明。
  `.claude/rules/coding-style.md`の「マジックナンバー禁止」方針に準拠。
- `reveal_level >= 2`個別分岐は設けず、`reveal_level <= 0`のガードのみで
  「0以外はすべて（1も2も）同じ経路を通る」構造にした。これによりTC-123-B03（暫定実装）が
  自然に満たされ、かつ将来REQ-123確定時の再設計対象が本関数全体であることが分かりやすい。
- `trait_definitions.has(tag)`のガードにより、マスターデータに存在しないタグが
  誤って混入した場合も例外を投げず安全に無視する（要件に明記はないが、素材データと
  マスターデータの不整合に対する防御的実装として妥当と判断）。

## 4. テスト実行結果

### 実行コマンド

```bash
cd atelier-godot
"C:\Users\syagu\AppData\Local\Microsoft\WinGet\Packages\GodotEngine.GodotEngine_Microsoft.Winget.Source_8wekyb3d8bbwe\Godot_v4.7-stable_win64_console.exe" --headless -s addons/gut/gut_cmdln.gd -gdir=res://tests/unit/features/alchemy -gexit
```

### 結果

```
res://tests/unit/features/alchemy/trait_activation_test.gd
11/11 passed.
```

- `trait_activation_test.gd`: **11/11 passed**（新規実装分、全ケース）
- 既存テスト（デグレなし）:
  - `craft_result_test.gd`: 6/6 passed
  - `material_instance_test.gd`: 7/7 passed
  - `quality_calculator_test.gd`: 8/8 passed
  - `recipe_definition_test.gd`: 4/4 passed
  - `trait_definition_test.gd`: 3/3 passed
- **合計: 39/39 passed**（Asserts 76、Time 1.365s）

## 5. 課題・改善点（Refactorフェーズで対応検討）

- 現状の実装はシンプルで、明確なリファクタリング対象の複雑性は見当たらない。
- Refactorフェーズで確認する観点:
  - コメントの重複・冗長性がないか（実装方針コメントとテスト対応コメントの整理）
  - `tag_counts`のキー型（StringNameのはず）に対する型注釈をより厳密にできないか検討
  - 800行制限（現状30行程度で余裕あり）
  - モック使用なし（実装コードは実処理のみ、要件通り）
- REQ-123確定後の再設計は本タスクの範囲外として申し送り済み（note.md記載）。
