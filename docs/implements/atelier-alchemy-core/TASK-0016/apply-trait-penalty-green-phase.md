# TASK-0016 Greenフェーズ記録: QualityCalculator.apply_trait_penalty

**機能名**: QualityCalculator.apply_trait_penalty（品質ペナルティ適用）
**タスクID**: TASK-0016
**要件名**: atelier-alchemy-core
**フェーズ**: Green（最小実装）
**作成日**: 2026-08-02

---

## 1. 実装方針

要件定義書§2・テストケース定義書に定義されたアルゴリズム7ステップをそのまま実装した。仕様との差異はなかったため、AskUserQuestionによる確認は不要と判断した。

1. `activated_traits`のうち`category != SUPPORT`の件数 → `penalty_count`
2. `quality_after_penalty = base_quality - penalty_count`
3. `activated_traits`のうち`category == SUPPORT`の件数 → `support_bonus_count`
4. `quality_after_penalty += support_bonus_count`（減算の「後」に加算する順序を厳守）
5. 下限クランプ: `max(quality_after_penalty, 1.0)`
6. 上限クランプ: `min(quality_after_penalty, 5.0)`
7. `round()`で丸め → `MaterialInstance.Quality`にキャストして返却

---

## 2. 実装コード

`atelier-godot/features/alchemy/logic/quality_calculator.gd` の `apply_trait_penalty` を以下に置き換えた（スタブ`return MaterialInstance.Quality.D`のみを廃止）。

```gdscript
## TASK-0016: 品質ペナルティ適用
##
## 【機能概要】: 発現特性数に応じて基礎品質を減算し、最終品質(Quality enum)を算出する純粋関数。
## 　　　　　　 SUPPORT系（触媒）は減算対象外とし、減算後に別途+1段の加算効果を持つ。
## 【実装方針】: 要件定義書§2のアルゴリズム7ステップをそのまま実装する。
## 　　　　　　 「品質スコアへの直接ペナルティ」という2026-07-09確定仕様を数式レベルで維持し、
## 　　　　　　 旧版（枠数ベースの食い合い）に戻さない。
## 【テスト対応】: quality_calculator_test.gd の新規9ケース（TC-16-N01〜N04, E01, B01〜B04）を通す実装
## 🔵 信頼性レベル: REQ-108・REQ-111・REQ-112（要件定義書）およびテストケース定義書に基づく
## @param base_quality - ペナルティ適用前の基礎品質（TASK-0013の出力）
## @param activated_traits - 系統排他制御適用後の最終発現特性（TASK-0015の出力）
## @returns ペナルティ・ボーナス適用後にクランプ・丸めを経た最終品質（MaterialInstance.Quality）
static func apply_trait_penalty(
	base_quality: float,
	activated_traits: Array[TraitDefinition],
) -> MaterialInstance.Quality:
	# 【件数カウント初期化】: 減算対象（SUPPORT以外）と加算対象（SUPPORT）の件数を集計する 🔵
	var penalty_count := 0
	var support_bonus_count := 0
	for trait_def in activated_traits:
		# 【カテゴリ分岐】: SUPPORT（触媒）は減算対象外・加算対象として別枠でカウントする 🔵
		# 【REQ-108対応】: 触媒＝品質+1段は「減算対象からの除外」と「事後加算」の2点セットで実現する
		if trait_def.category == TraitDefinition.Category.SUPPORT:
			support_bonus_count += 1
		else:
			# 【REQ-111/REQ-112対応】: CONTRIBUTION・REWARDいずれも1個につき1段減算し、
			# 　複数発現時は加算的に積み重なる（枠配分ではなく品質スコア直接減算） 🔵
			penalty_count += 1

	# 【減算適用】: 発現特性数（SUPPORT以外）に応じて基礎品質を減算する 🔵
	var quality_after_penalty := base_quality - float(penalty_count)
	# 【加算適用】: 減算「後」にSUPPORT件数分を加算する（REQ-108・REQ-111の処理順序を厳守） 🔵
	quality_after_penalty += float(support_bonus_count)

	# 【下限クランプ】: 最終品質はD(1.0)を下回ってはならない（REQ-111 Critical / TC-101-B02） 🔵
	quality_after_penalty = max(quality_after_penalty, 1.0)
	# 【上限クランプ】: 最終品質はS(5.0)を上回ってはならない（Quality値域のための防御的実装） 🟡
	quality_after_penalty = min(quality_after_penalty, 5.0)

	# 【丸め方式】: round()（四捨五入）でfloat→Quality enumへ変換する。
	# 　architecture.md（int想定）とacceptance-criteria.md（非整数期待値）の不整合に対する
	# 　暫定確定方式であり、本関数（QualityCalculator）にfloat→enum変換ポイントを集約する 🟡
	var rounded := int(round(quality_after_penalty))
	return rounded as MaterialInstance.Quality
```

---

## 3. テスト実行結果

### 実行コマンド

```bash
cd atelier-godot
"C:\Users\syagu\AppData\Local\Microsoft\WinGet\Packages\GodotEngine.GodotEngine_Microsoft.Winget.Source_8wekyb3d8bbwe\Godot_v4.7-stable_win64_console.exe" --headless -s addons/gut/gut_cmdln.gd -gdir=res://tests/unit/features/alchemy -gexit
```

### 結果サマリ

- `quality_calculator_test.gd`: **17/17 Pass**
  - 既存`calculate_base_quality`テスト8件: 全件Pass（デグレなし）
  - 新規`apply_trait_penalty`テスト9件: 全件Pass
    - Redフェーズで偶然PassしていたTC-16-B01・TC-16-B04も、正式実装後に同じ期待値で正しくPassすることを確認した
- alchemy feature全体（6スクリプト）: **58/58 Pass**（craft_result / material_instance / quality_calculator / recipe_definition / trait_activation / trait_definition）

---

## 4. 品質判定結果

```
✅ 高品質:
- テスト結果: 全て成功（58/58）
- 実装品質: シンプルかつ動作する（アルゴリズム7ステップと1:1対応）
- リファクタ箇所: コメント量の整理余地はあるが、ロジック自体に明確な改善点はなし
- 機能的問題: なし
- コンパイルエラー: なし
- ファイルサイズ: quality_calculator.gd 全体で約110行（800行制限内、分割不要）
- モック使用: 実装コードにモック・スタブなし
```

---

## 5. 次のステップ

次のお勧めステップ: `/tsumiki:tdd-refactor atelier-alchemy-core TASK-0016` でRefactorフェーズ（品質改善）を開始する。
