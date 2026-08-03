## TASK-0014: 特性発現判定（TraitActivation）
##
## 【機能概要】: 投入された素材群から「どの特性タグが完成品に発現するか」を判定する
## 　　　　　　 閾値発現ロジック。同一の特性タグを持つ素材が2個以上ある場合にのみ、
## 　　　　　　 その特性を発現候補として返す純粋関数。
## 【実装方針】: Functional Core（logic/）に配置する副作用のない静的メソッドのみで構成する。
##
## 【Godotアーキテクトレビュー Critical#1 対応】🔵:
## 　　旧設計案では本関数内で `GameState.current_rank` を直接参照し、そこから
## 　　段階的開示レベルを読み取る想定だった。しかしこれは「純粋関数は入力のみに依存し、
## 　　外部状態を参照しない」というFunctional Coreの原則に反するため、Critical#1指摘を
## 　　受けて設計を修正した。本関数は以下を一切行わない：
## 　　　- `GameState`（Autoload）への参照
## 　　　- `Engine.get_main_loop()` 経由でのAutoload取得
## 　　　- シングルトンパターン経由の状態参照
## 　　代わりに段階的開示レベルを `reveal_level: int` として呼び出し側
## 　　（TASK-0019 GameStateが `current_rank.trait_reveal_level` を解決）から明示的な
## 　　引数で受け取ることで、同じ入力に対して常に同じ出力を返す決定論性を保証する。
## 　　参照元: docs/design/atelier-alchemy-core/architecture.md「Godotアーキテクトレビュー Critical#1対応」
##
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
	# 【最優先フィルタ：二重の安全策の設計意図】🔵:
	# 　reveal_level<=0（Gランク相当）では、閾値(2個以上)を満たす特性構成であっても
	# 　一切発現させない。本来Gランクでは特性付き素材は庭・ショップ側の入手制限
	# 　（UI表示制御）によってそもそも入手できないはずだが、「UI側の制御だけに
	# 　依存しない」という設計方針（architecture.md「非機能要件の実現方法／
	# 　ユーザビリティ（二重の安全策）」）に基づき、万一その制限が漏れて特性付き
	# 　素材が投入枠に紛れ込んだ場合でも、本関数側のこのガードで発現を二重に
	# 　防止する（TC-121-01・TC-121-E01・TC-121-B02で検証）。
	# 　この判定を出現回数集計より前に行うことで、「非開示は他のどの条件よりも
	# 　優先される」という仕様を関数の制御フローそのもので表現している。
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
	# 【暫定実装・申し送り】🟡: reveal_level>=2（Dランク相当、REQ-123で解禁予定の
	# 　追加特性）は、対象となる具体的な特性の種類がまだ確定していない(TBD)ため、
	# 　本タスクではreveal_level>=1（Eランク以降）と同一の扱いとし、追加のフィルタ
	# 　条件を設けていない（level<=0のガード以外に分岐なし）。
	# 　TODO(REQ-123確定後の再設計): 追加特性のリストが確定した時点で、
	# 　`min_rank_to_reveal` とint型`reveal_level`の変換ロジック、および本関数内の
	# 　フィルタ条件を再設計すること。TC-123-B03はこの暫定挙動（level=1と同じ結果に
	# 　なること）を固定化する回帰テストであり、仕様変更時にはこのテストの見直しも
	# 　必要になる。参照元: docs/tasks/atelier-alchemy-core/TASK-0014.md「注意事項」
	for tag in tag_counts.keys():
		if tag_counts[tag] >= ACTIVATION_THRESHOLD and trait_definitions.has(tag):
			result.append(trait_definitions[tag])

	return result


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
