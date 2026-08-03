# TASK-0015 Greenフェーズ記録: TraitActivation.resolve_category_conflict

**機能名**: 特性系統間排他制御（TraitActivation.resolve_category_conflict）
**タスクID**: TASK-0015
**要件名**: atelier-alchemy-core
**作成日**: 2026-08-01

---

## 1. 実装内容

`atelier-godot/features/alchemy/logic/trait_activation.gd` の `resolve_category_conflict` スタブ（`return {}`）を本実装に置き換えた。あわせて枚数集計用の補助静的関数 `_count_materials_for_traits` を追加した。

### 実装コード

```gdscript
static func resolve_category_conflict(
	materials: Array[MaterialInstance],
	activated_traits: Array[TraitDefinition],
) -> Dictionary:
	# 【系統別グループ化】: 発現候補特性をCONTRIBUTION/REWARD/SUPPORTの3群に分類する
	var contribution_traits: Array[TraitDefinition] = []
	var reward_traits: Array[TraitDefinition] = []
	var support_traits: Array[TraitDefinition] = []
	for trait_def in activated_traits:
		match trait_def.category:
			TraitDefinition.Category.CONTRIBUTION:
				contribution_traits.append(trait_def)
			TraitDefinition.Category.REWARD:
				reward_traits.append(trait_def)
			TraitDefinition.Category.SUPPORT:
				support_traits.append(trait_def)

	# 【枚数集計】: 各系統について、該当タグを持つ素材の出現回数（タグ単位の重複投入数合計）を集計する
	var contribution_count := _count_materials_for_traits(materials, contribution_traits)
	var reward_count := _count_materials_for_traits(materials, reward_traits)

	# 【比較・排他判定】
	var final_traits: Array[TraitDefinition] = []
	var rejected_category: TraitDefinition.Category = TraitDefinition.Category.CONTRIBUTION
	var has_rejected_category := false

	if contribution_traits.is_empty() and reward_traits.is_empty():
		pass
	elif contribution_traits.is_empty():
		final_traits.append_array(reward_traits)
	elif reward_traits.is_empty():
		final_traits.append_array(contribution_traits)
	elif contribution_count > reward_count:
		final_traits.append_array(contribution_traits)
		rejected_category = TraitDefinition.Category.REWARD
		has_rejected_category = true
	elif reward_count > contribution_count:
		final_traits.append_array(reward_traits)
		rejected_category = TraitDefinition.Category.CONTRIBUTION
		has_rejected_category = true
	# 同数の場合: final_traitsは空のまま、has_rejected_categoryもfalseのまま（支配戦略防止）

	# 【補助系の常時保持】: SUPPORTは比較・排他の対象外
	final_traits.append_array(support_traits)

	return {
		"activated_traits": final_traits,
		"rejected_category": rejected_category,
		"has_rejected_category": has_rejected_category,
	}


static func _count_materials_for_traits(materials: Array[MaterialInstance], traits: Array[TraitDefinition]) -> int:
	var tag_ids: Array[StringName] = []
	for trait_def in traits:
		tag_ids.append(trait_def.id)

	var count := 0
	for material in materials:
		for tag in material.traits:
			if tag in tag_ids:
				count += 1
	return count
```

### 実装方針

- ユーザ提示のアルゴリズム（note.md「実装チェックリスト／アルゴリズム」と一致）をそのまま採用。10テストケース全てで期待値と合致することを事前に手計算で検証済み。
- `_count_materials_for_traits` は「素材数」ではなく「タグ出現回数の合計」でカウントする。これにより1素材が2タグ（holy・gold）を同時保持するTC-101-07でも、各タグ独立に2件ずつカウントされ、意図通り同数不発になる（支配戦略防止の要）。
- 同数分岐（`contribution_count == reward_count` かつ両方>0）は明示的な `elif` を設けず、いずれの比較にも該当しないことで自然に「両方除外」を実現している（バグ余地を減らすためのシンプルな実装）。
- SUPPORT群は比較ロジックに一切関与させず、最後に無条件で `final_traits` へ追加する。

## 2. テスト実行結果

実行コマンド（`atelier-godot/` から実行）:

```bash
"C:\Users\syagu\AppData\Local\Microsoft\WinGet\Packages\GodotEngine.GodotEngine_Microsoft.Winget.Source_8wekyb3d8bbwe\Godot_v4.7-stable_win64_console.exe" --headless -s addons/gut/gut_cmdln.gd -gdir=res://tests/unit/features/alchemy -gexit
```

結果:

- `trait_activation_test.gd`: **21/21 パス**（TASK-0014既存11件 + TASK-0015新規10件、すべてGreen）
- `recipe_definition_test.gd`: 4/4 パス（影響なし）
- `trait_definition_test.gd`: 3/3 パス（影響なし）
- 全体（6スクリプト・49テスト）: **Passing 49 / Failing 0**（デグレなし）

特に以下のCriticalケースを個別確認した:

- `test_同数2対2で両系統とも不発になり空配列を返す`（TC-101-04）: Pass
- `test_1素材が2タグ同時保持でも同数不発で両取りできない`（TC-101-07）: Pass

## 3. 品質判定

- ✅ テスト結果: 全49件成功（GUT実行で確認）
- ✅ 実装のシンプルさ: 分岐は5パターン（両方空／片方空×2／不均衡×2／同数=デフォルト）でシンプル
- ✅ 機能的問題: なし。支配戦略防止の核心ケース（TC-101-04, 07）を含め全て仕様通り
- ✅ ファイルサイズ: `trait_activation.gd` は約195行（800行制限内）
- ✅ モック使用: 実装コードにモック・スタブなし（純粋関数のみ）

**総合評価**: ✅ 高品質

## 4. 課題・改善点（Refactorフェーズ候補）

- `_count_materials_for_traits` 内の `tag in tag_ids` は `Array` の線形探索（O(n)）。特性種類・素材数が少数のため現状は問題ないが、将来的にDictionary化での高速化余地はある。
- `rejected_category` のデフォルト値が `CONTRIBUTION` になっている点は、`has_rejected_category` を必ず確認してから参照する契約になっているため問題ないが、Refactorフェーズでコメントの拡充を検討。
