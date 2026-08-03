# TASK-0014: TraitActivation.resolve_activated_traits Refactorフェーズ記録

**機能名**: 特性発現判定ロジック（trait-activation）
**タスクID**: TASK-0014
**要件名**: atelier-alchemy-core
**フェーズ**: Refactor（品質改善）
**作成日**: 2026-07-31

---

## 1. リファクタリング方針

Greenフェーズの実装（[trait-activation-green-phase.md](./trait-activation-green-phase.md)）は
アルゴリズム自体がシンプル（30行程度、分岐3段）であり、構造上の改善対象（重複コード・責務分割・
定数化不足等）は見当たらなかった。そのため本フェーズでは**機能的な変更は一切行わず**、
以下3点に絞って日本語コメントの明示性を強化した。

1. **Godotアーキテクトレビュー Critical#1対応**（GameState/Autoload非参照の純粋関数原則）を
   ファイル冒頭のドキュメントコメントとして明示
2. **`reveal_level`による「二重の安全策」**の設計意図（なぜ閾値判定より前にガードするか）を
   関数内コメントとして明示
3. **REQ-123（reveal_level>=2の追加特性）が暫定実装であることの申し送り**を
   `TODO(REQ-123確定後の再設計)` 形式で明示

いずれもロジック（`ACTIVATION_THRESHOLD`, `if reveal_level <= 0`, 集計・閾値判定ループ）は
Greenフェーズから一切変更していない。

---

## 2. 改善後コード全文

`atelier-godot/features/alchemy/logic/trait_activation.gd`（91行）

```gdscript
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
```

---

## 3. 改善ポイントの説明

### 3.1 ファイル冒頭コメントの拡充（Critical#1対応の明示）

- **改善内容**: クラス冒頭のドキュメントコメントに「旧設計案の何が問題だったか」
  「Critical#1指摘を受けて何を修正したか」「具体的に何を参照しないか（3項目の禁止リスト）」を
  明示的に追記した。
- **設計方針**: 単に「GameState参照禁止」と書くだけでなく、*なぜ*禁止なのか（純粋関数の
  決定論性の担保）まで記述することで、将来この関数を変更する開発者が誤って
  `GameState`参照を追加してしまうリスクを低減する。
- 🔵 信頼性レベル: note.md「純粋関数原則（Godotアーキテクトレビュー Critical#1対応）」および
  architecture.md「Godotアーキテクトレビュー Critical#1対応」に明記された内容をそのまま反映。

### 3.2 `reveal_level <= 0` ガードのコメント拡充（二重の安全策）

- **改善内容**: 「なぜこのガードを最初に置くのか」という設計意図（UI側の入手制限だけに
  依存しない二重防御であること、判定順序自体が「非開示最優先」という仕様を表現していること）を
  明示した。
- **設計方針**: Greenフェーズのコメントは「二重の安全策」という単語のみで簡潔だったが、
  Refactorフェーズでは「UI側の制限が漏れるシナリオ」「なぜ集計より先に判定するか」まで
  掘り下げることで、レビュアーやテスト設計者がこのガードの意図を読み取りやすくした。
- 🔵 信頼性レベル: 要件定義書「制約条件」・note.md「注意事項」記載の
  「非機能要件の実現方法／ユーザビリティ（二重の安全策）」に基づく。

### 3.3 REQ-123暫定実装の申し送りコメント強化

- **改善内容**: `TODO(REQ-123確定後の再設計)` という明示的なTODOマーカーを追加し、
  「何が確定したら」「何を再設計すべきか（`min_rank_to_reveal`とreveal_levelの変換ロジック、
  本関数のフィルタ条件）」「関連する回帰テスト（TC-123-B03）」をセットで記述した。
- **設計方針**: `.claude/rules/coding-style.md`の「TODO/FIXME（担当者とチケット番号付き）」
  方針に準拠し、単なる「暫定実装」という記述に留めず、後続の開発者が要件確定時に
  迷わず着手できるよう再設計対象を具体的に列挙した。
- 🟡 信頼性レベル: REQ-123自体がTBD（要件未確定）であるため、再設計の具体的な実装方法は
  推測を含む。ただし「再設計が必要になること」自体はnote.md・要件定義書に明記済み。

---

## 4. セキュリティレビュー結果

- **入力検証**: `materials`/`trait_definitions`は型付き引数（`Array[MaterialInstance]`,
  `Dictionary`）であり、GDScriptの型システムにより呼び出し時点で型不整合は検出される。
  実行時の追加バリデーションは不要と判断（要件にも明記なし）。
- **不正データ耐性**: `trait_definitions.has(tag)`ガードにより、マスターデータに存在しない
  タグIDが素材に混入していても例外を投げず安全に無視する（Greenフェーズからの既存実装、
  今回変更なし）。
- **外部入力・機密情報**: 本関数はゲーム内マスターデータ・素材インスタンスのみを扱い、
  ユーザー入力の直接処理やAPI通信、ログ出力を行わない。XSS/SQLインジェクション等の
  Webセキュリティ観点のリスクは該当しない。
- **副作用・状態改変**: `GameState`・Autoload・シングルトンへの参照/書き込みは一切なし
  （Critical#1対応、本フェーズでコメントとして明示化）。
- **結論**: 重大な脆弱性は発見されなかった。✅

## 5. パフォーマンスレビュー結果

- **計算量**: 素材数を`n`、素材あたりの平均特性タグ数を`k`とすると、出現回数集計ループは
  `O(n * k)`、閾値判定・解決ループは集計後のユニークタグ数`u`（`u <= n * k`）に対して
  `O(u)`。実運用では投入枠が4〜数枠程度・特性タグも少数のため、事実上定数時間で完了する。
  ボトルネックとなる要素はない。
- **メモリ使用量**: `tag_counts`（Dictionary）と`result`（Array）のみを生成し、いずれも
  入力サイズに比例した小さいメモリ使用量。不要なコピーや中間配列の生成はない。
- **最適化の要否**: 現状の入力規模（投入枠数枠、特性種類数個）に対してアルゴリズムは
  十分高速であり、追加の最適化（キャッシュ等）は不要と判断。
- **結論**: 重大な性能課題は発見されなかった。✅

---

## 6. テスト実行結果

### 実行コマンド

```bash
cd atelier-godot
"C:\Users\syagu\AppData\Local\Microsoft\WinGet\Packages\GodotEngine.GodotEngine_Microsoft.Winget.Source_8wekyb3d8bbwe\Godot_v4.7-stable_win64_console.exe" --headless -s addons/gut/gut_cmdln.gd -gdir=res://tests/unit/features/alchemy -gexit
```

### リファクタ前（ベースライン確認）

```
Totals: Scripts 6 / Tests 39 / Passing 39 / Asserts 76 / Time 1.247s
---- All tests passed! ----
```

### リファクタ後

```
Totals: Scripts 6 / Tests 39 / Passing 39 / Asserts 76 / Time 1.243s
---- All tests passed! ----
```

- `trait_activation_test.gd`: **11/11 passed**（対象ケース、リファクタ前後で変化なし）
- 既存テスト（デグレなし）: `craft_result_test.gd` 6/6、`material_instance_test.gd` 7/7、
  `quality_calculator_test.gd` 8/8、`recipe_definition_test.gd` 4/4、`trait_definition_test.gd` 3/3
- **合計: 39/39 passed**（コメントのみの変更のため実行時間・アサート数に変化なし）
- 2秒以上かかる遅いテストは検出されなかった。

---

## 7. 開発時生成ファイルのクリーンアップ確認

`find`によるdebug-*/test-*/temp-*/`.tmp`/`.bak`等のパターン検索を実施したが、
TASK-0014に関連する不要な一時ファイルは見つからなかった（既存のプロジェクト内テストヘルパー
ファイル`test-data.factory.ts`等はTypeScript版atelier-guild-rankの正規のテスト資産であり、
本タスクのスコープ外）。削除対象なし。

---

## 8. 品質判定

```
✅ 高品質:
- テスト結果: Taskツール相当の実行確認で39/39全て継続成功
- セキュリティ: 重大な脆弱性なし
- パフォーマンス: 重大な性能課題なし
- リファクタ品質: 目標達成（Critical#1対応・二重の安全策・REQ-123申し送りの3点を明示化）
- コード品質: 適切なレベル（91行、500行制限に対し十分小さい。機能変更なし）
- ドキュメント: 完成（本ファイル、memoファイル更新済み）
```

---

## 次のステップ

次のお勧めステップ: `/tsumiki:tdd-verify-complete` で完全性検証を実行します。
