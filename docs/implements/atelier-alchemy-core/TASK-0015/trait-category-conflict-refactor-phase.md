# TASK-0015 Refactorフェーズ記録: TraitActivation.resolve_category_conflict

**機能名**: 特性系統間排他制御（TraitActivation.resolve_category_conflict）
**タスクID**: TASK-0015
**要件名**: atelier-alchemy-core
**作成日**: 2026-08-01

---

## 1. リファクタリング方針

Greenフェーズの実装（`docs/implements/atelier-alchemy-core/TASK-0015/trait-category-conflict-green-phase.md`）は、
アルゴリズム自体が既にテスト全10ケース（TC-101-04/05/07含む）を満たしシンプルな構造だったため、
**ロジック・分岐構造は一切変更せず、日本語コメントの強化のみ**を行った。

理由:
- 分岐は5パターン（両方空／片方空×2／不均衡×2／同数=デフォルト）で既に十分シンプルであり、
  無理な抽象化・関数分割はかえって可読性を落とすリスクがある（過度な抽象化を避ける方針）。
- `_count_materials_for_traits` の線形探索（O(n)）はGreenフェーズ時点で許容範囲と判断済みで、
  特性種類・投入枠数が少数という前提が変わらない限り最適化は不要（YAGNI）。
- 本タスクで最優先すべきはロジックの正しさ（特にTC-101-04/07）を絶対に壊さないことであり、
  コメントによる意図の明文化がリファクタリングの主目的として適切と判断した。

---

## 2. 改善後のコード全文

`atelier-godot/features/alchemy/logic/trait_activation.gd` の `resolve_category_conflict` と
`_count_materials_for_traits` 部分（該当行のみ抜粋。ロジックはGreenフェーズと同一）:

```gdscript
## TASK-0015: 特性系統間排他制御（REQ-115・支配戦略防止の最重要ロジック）
## 【機能概要】: 貢献度系（CONTRIBUTION）・報酬系（REWARD）の系統間で「条件を満たしている
## 　　　　　　 枚数（同一タグの重複投入数の合計）」を比較し、多い系統のみを発現させる。
## 　　　　　　 同数の場合は両系統とも不発とし、補助系（SUPPORT）は比較・排他の対象外として
## 　　　　　　 常に発現候補に残す。
## 【実装方針】: 1) activated_traitsをcategoryでCONTRIBUTION/REWARD/SUPPORTに分類、
## 　　　　　　 2) CONTRIBUTION群・REWARD群それぞれについて該当タグを持つmaterialsの
## 　　　　　　 出現回数合計を集計、3) 片方が空なら比較せずそのまま残す、4) 両方存在する
## 　　　　　　 場合のみ枚数比較を行い、多い方のみ残す／同数は両方除外、5) SUPPORT群は
## 　　　　　　 常に最終結果へ追加する。
##
## 【ゲームデザインレビュー対応】🔵: 2026-07-09のゲームデザインレビューで指摘された
## 　　Critical事項「貢献度系・報酬系の無条件両取り（支配戦略）」への直接対応。
## 　　旧設計では投入素材の組み合わせ次第で1品から貢献度系・報酬系の両方の特性を
## 　　無条件に発現させられ、プレイヤーが常に両取りを選ぶ支配戦略が成立していた。
## 　　REQ-115はこれを「両系統がともに条件を満たす場合は必ずどちらかを不発（同数なら
## 　　両方不発）にする」という排他ルールで数式レベルに防止するために新設された。
## 　　参照元: docs/spec/atelier-alchemy-core/requirements.md REQ-115、
## 　　　　　 docs/design/atelier-alchemy-core/design-interview.md（レビュー記録）
##
## 【最重要ケースに関する注意（改変時は必ず確認）】🔴: 以下のテストケースは
## 　　支配戦略防止の生命線であり、リファクタリング・機能追加によって
## 　　誤って壊してはならない。
## 　　- TC-101-04（同数2vs2で両方不発）: `contribution_count == reward_count` かつ
## 　　　両方>0のとき、`final_traits` にCONTRIBUTION/REWARDのいずれも追加されない
## 　　　（下記「比較・排他判定」のどの分岐にも一致せず自然に空のまま、という実装で
## 　　　この性質を保証している）。この分岐に「同数でもどちらかを残す」ような
## 　　　例外や優先ルールを追加してはならない。
## 　　- TC-101-07（1素材が2タグ同時保持でも同数不発）: 枚数集計を「素材の個数」に
## 　　　変更すると、2タグ持ち素材が実質1個としてしかカウントされず不均衡側に
## 　　　誤判定されうる。`_count_materials_for_traits` が「タグの出現回数合計」で
## 　　　数えている設計を変更してはならない。
## 　　この2ケースを壊す変更は、たとえ他の8ケースが通っていても本タスクの
## 　　目的（真のジレンマの成立）を破壊するリグレッションとして扱うこと。
##
## 【テスト対応】: trait_activation_test.gd のTASK-0015セクション全10ケース
## 　　　　　　 （うちTC-101-04・TC-101-07は支配戦略防止の最終防線として必ずパスする必要がある）
## 🔵 信頼性レベル: docs/implements/atelier-alchemy-core/TASK-0015/trait-category-conflict-testcases.md
## 　　　　　　　 および note.md「実装チェックリスト／アルゴリズム」に基づく
##
## @param materials - 投入素材インスタンスの配列（枚数集計の母数）
## @param activated_traits - TASK-0014が確定した発現候補特性リスト（系統内排他は済み）
## @returns Dictionary - { "activated_traits": Array[TraitDefinition], "rejected_category": TraitDefinition.Category, "has_rejected_category": bool }
##   - "rejected_category": 不発とされた系統。同数不発時など「不発系統が一意に定まらない」
##     場合に意味を持たない値が入りうるため、必ず "has_rejected_category" で有効性を
##     確認してから参照すること（設計判断の詳細は下記「無効値表現」コメントを参照）。
static func resolve_category_conflict(
	materials: Array[MaterialInstance],
	activated_traits: Array[TraitDefinition],
) -> Dictionary:
	# 【系統別グループ化】: 発現候補特性をCONTRIBUTION/REWARD/SUPPORTの3群に分類する
	# 　SUPPORTは比較・排他の対象外（REQ-108・REQ-115最終文）のため別枠で保持する 🔵
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

	# 【枚数集計】: 各系統について、該当タグを持つ素材の出現回数（タグ単位の重複投入数合計）を集計する。
	# 　1素材が2タグを同時保持する場合（REQ-104×REQ-115）でも、タグごとに独立してカウントされるため
	# 　「素材数」ではなく「系統ごとのタグ出現回数合計」で正しく比較される（TC-101-07の支配戦略防止） 🔵
	var contribution_count := _count_materials_for_traits(materials, contribution_traits)
	var reward_count := _count_materials_for_traits(materials, reward_traits)

	# 【比較・排他判定】: 両系統がともに候補を持つ場合のみ比較を行い、多い方だけを残す。
	# 　同数の場合は単一enumで「どちらが不発か」を表現できないため、両方除外しhas_rejected_categoryをfalseにする
	# 　（TC-101-04・TC-101-07：支配戦略＝無条件両取りを数式レベルで防止する核心分岐） 🔵
	var final_traits: Array[TraitDefinition] = []

	# 【無効値表現の設計判断】🟡: CraftResult.rejected_categoryの型は`TraitDefinition.Category`
	# 　（enum）で固定されているが、GDScriptのenumには「値なし」を表せるnull相当が存在しない。
	# 　TASK-0012（craft-data-model）では、同数不発のように「不発系統が一意に定まらない」場合の
	# 　表現方法を本タスク（TASK-0015）に委譲しており、以下の2案が候補として挙げられていた。
	# 　　案A: Category に NONE のような番兵値を追加する
	# 　　案B: rejected_category はそのままにし、has_rejected_category: bool を併設する
	# 　本実装は案Bを採用した。理由は、Category enumの意味論（CONTRIBUTION/REWARD/SUPPORTは
	# 　いずれも実在する系統区分）にNONEのような「区分ではない値」を混入させないためであり、
	# 　既存の呼び出し側（TASK-0018 craft(), TASK-0020 UI層）がCategoryを列挙的に扱う場合の
	# 　安全性を優先した。したがってデフォルト値のCONTRIBUTIONは「意味を持たない仮の値」に
	# 　過ぎず、呼び出し側は必ず has_rejected_category を先に確認してから
	# 　rejected_category を参照すること（has_rejected_category==falseのときの
	# 　rejected_categoryの値に依存した分岐を書いてはならない）。
	# 　参照元: docs/implements/atelier-alchemy-core/TASK-0012/craft-data-model-requirements.md
	# 　　　　　「rejected_category の無効値表現は本タスクで確定しない」
	var rejected_category: TraitDefinition.Category = TraitDefinition.Category.CONTRIBUTION
	var has_rejected_category := false

	if contribution_traits.is_empty() and reward_traits.is_empty():
		# 【両系統とも候補なし】: 比較対象がないため何もしない（SUPPORTのみ後段で追加される） 🟡
		pass
	elif contribution_traits.is_empty():
		# 【片系統のみ（報酬系のみ）】: 比較対象が片方しかないため排他せずそのまま残す 🟡
		final_traits.append_array(reward_traits)
	elif reward_traits.is_empty():
		# 【片系統のみ（貢献度系のみ）】: 比較対象が片方しかないため排他せずそのまま残す 🟡
		final_traits.append_array(contribution_traits)
	elif contribution_count > reward_count:
		# 【貢献度系が多数】: 貢献度系の全特性を系統単位で存置し、報酬系を系統単位で除去する 🔵
		final_traits.append_array(contribution_traits)
		rejected_category = TraitDefinition.Category.REWARD
		has_rejected_category = true
	elif reward_count > contribution_count:
		# 【報酬系が多数】: 比較の対称性を保証するため、CONTRIBUTION優先のハードコードはしない 🔵
		final_traits.append_array(reward_traits)
		rejected_category = TraitDefinition.Category.CONTRIBUTION
		has_rejected_category = true
	# 【同数の場合（TC-101-04・TC-101-07 / Critical）】🔴: contribution_count == reward_count
	# 　（かつ両方>0）のとき、上記いずれの分岐にも該当せず、final_traitsは空のまま・
	# 　has_rejected_categoryもfalseのまま確定する。これが支配戦略防止の核心分岐であり、
	# 　「同数のときどちらか一方だけでも残す」処理を足すと支配戦略が復活してしまう。
	# 　この分岐に手を加える場合は、必ずTC-101-04（同数2vs2）とTC-101-07（1素材2タグ
	# 　同時保持）の両テストを実行し、activated_traitsが空のまま・has_rejected_categoryが
	# 　falseのままであることを確認すること。

	# 【補助系の常時保持】: SUPPORTは比較・排他の対象外のため、判定結果に関わらず常に追加する 🔵
	final_traits.append_array(support_traits)

	return {
		"activated_traits": final_traits,
		"rejected_category": rejected_category,
		"has_rejected_category": has_rejected_category,
	}


## 【機能概要】: 指定した特性群のいずれかのタグを持つ素材の出現回数（タグ単位）を合計する
## 【実装方針】: 素材ごとにtraits配列を走査し、対象タグ集合に含まれるタグ1件ごとに1カウントする。
## 　　　　　　 1素材が対象タグを2つ持つ場合は2としてカウントされる（系統内での重複寄与を許容）。
## 【テスト対応】: TC-101-07（1素材2タグ同時保持）で、素材数ではなくタグ出現回数で
## 　　　　　　 集計されることを保証するための補助関数
## 🔵 信頼性レベル: note.md「枚数集計：各特性タグを持つmaterialsの個数を合計」に基づく
##
## @param materials - 投入素材インスタンスの配列
## @param traits - 集計対象となる系統内の特性定義リスト
## @returns int - 対象タグの出現回数合計
static func _count_materials_for_traits(materials: Array[MaterialInstance], traits: Array[TraitDefinition]) -> int:
	# 【対象タグID抽出】: 比較を高速化するため、TraitDefinitionからidのみのリストへ変換する
	var tag_ids: Array[StringName] = []
	for trait_def in traits:
		tag_ids.append(trait_def.id)

	# 【出現回数集計】: 各素材のtraits配列を走査し、対象タグ集合に含まれるタグの数をカウントする
	var count := 0
	for material in materials:
		for tag in material.traits:
			if tag in tag_ids:
				count += 1
	return count
```

---

## 3. 改善ポイントの説明

| # | 改善内容 | 信頼性 |
|---|---------|--------|
| 1 | 関数ヘッダに「ゲームデザインレビュー対応」節を追加し、2026-07-09のゲームデザインレビューCritical指摘（貢献度系・報酬系の無条件両取り＝支配戦略）への対応であることを明示 | 🔵 |
| 2 | 「最重要ケースに関する注意」節を追加し、TC-101-04・TC-101-07が支配戦略防止の生命線であること、改変時に必ずこの2ケースを確認するよう警告するコメントを追加 | 🔴（実装コード自体は既存のまま。コメントによる注意喚起） |
| 3 | 「同数の場合」分岐の直前コメントを拡充し、この分岐を触る際の確認手順を明記 | 🔴 |
| 4 | `rejected_category`宣言部に無効値表現の設計判断（TASK-0012からの申し送り、案A/案Bの比較、案B採用理由）を追加 | 🟡 |
| 5 | 関数Doc commentの`@returns`に`has_rejected_category`確認契約を追記 | 🔵 |

いずれもロジック・分岐条件・戻り値構造の変更を伴わない、コメントのみの追加である。

---

## 4. セキュリティレビュー結果

- 純粋関数（`static func`、外部状態参照なし）。DBアクセス・ファイルI/O・ネットワーク通信なし。
- 入力は型付き配列（`Array[MaterialInstance]`, `Array[TraitDefinition]`）のみで、シリアライズされた
  外部入力の直接パースは行っていない。
- モック・スタブ・インメモリDB代替のコードは実装内に存在しない。
- 重大な脆弱性は検出されなかった。

## 5. パフォーマンスレビュー結果

- 計算量: `_count_materials_for_traits`はO(materials数 × traits数)。ゲーム仕様上、投入枠・特性種類は
  少数（数枠〜十数種）であり、現状の規模では性能上の問題はない。
- 本リファクタリングはコメント追加のみで、ループ回数・メモリ確保量に変化はない。
- Greenフェーズで指摘された「Dictionary化での高速化余地」は、現時点ではYAGNI（過度な最適化回避）
  の観点から見送り、将来素材種類が大幅に増加した場合の改善候補として記録するに留める。

## 6. テスト実行結果

`atelier-godot/`から以下のコマンドで実行（Taskツール経由での確認済み）。

```
Godot_v4.7-stable_win64_console.exe --headless -s addons/gut/gut_cmdln.gd -gdir=res://tests/unit/features/alchemy -gexit
```

- リファクタ前: 6スクリプト・49テスト中 Passing 49 / Failing 0
- リファクタ後: 6スクリプト・49テスト中 Passing 49 / Failing 0（デグレなし）
- 個別確認: `test_同数2対2で両系統とも不発になり空配列を返す`（TC-101-04）Pass、
  `test_1素材が2タグ同時保持でも同数不発で両取りできない`（TC-101-07）Pass
- 実行時間: 約1.5秒（2秒未満、遅いテストなし）

## 7. コメント改善内容

- 既存コメントの構造（【機能概要】【実装方針】【テスト対応】🔵🟡🔴）を踏襲しつつ、
  「なぜこの実装・この設計判断にしたか」という背景（ゲームデザインレビューの経緯、
  TASK-0012からの申し送り内容）を新たに明文化した。
- 改変を特に禁じたい箇所（同数不発分岐、枚数集計方法）には🔴信号と明示的な警告文を付与し、
  将来の実装者が意図を理解せずに壊してしまうリスクを低減した。

---

## 品質判定

- ✅ テスト結果: Taskツール経由の実行で49/49成功を継続確認（TC-101-04・07個別確認済み）
- ✅ セキュリティ: 重大な脆弱性なし
- ✅ パフォーマンス: 重大な性能課題なし（計算量に変化なし）
- ✅ リファクタ品質: コメントによる可読性・保守性向上を達成。機能的変更なし
- ✅ ファイルサイズ: `trait_activation.gd` 約240行（500行制限内）
- ✅ 日本語コメント品質: 設計判断の背景・改変時の注意点を明文化

**総合評価**: ✅ 高品質

---

## 次のお勧めステップ

`/tsumiki:tdd-verify-complete atelier-alchemy-core TASK-0015` で完全性検証を実行する。
