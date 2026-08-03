# TASK-0013 TDD Greenフェーズ記録: QualityCalculator.calculate_base_quality

**機能名**: 基礎品質算出（QualityCalculator.calculate_base_quality）
**タスクID**: TASK-0013
**要件名**: atelier-alchemy-core
**フェーズ**: Green（最小実装）
**作成日**: 2026-07-31

---

## 1. 実装したファイル

- `atelier-godot/features/alchemy/logic/quality_calculator.gd`（新規作成）

## 2. 実装コード全文

```gdscript
## TASK-0013: 基礎品質算出（QualityCalculator）
##
## 【機能概要】: 調合に投入された素材群（Array[MaterialInstance]）のquality値（D=1〜S=5）
## 　　　　　　 の算術平均を「基礎品質」として算出する純粋関数。
## 【実装方針】: Functional Core（logic/）に配置する副作用のない静的メソッドのみで構成する。
## 　　　　　　 GameState・Autoload等の外部状態は一切参照しない。
## 【テスト対応】: quality_calculator_test.gd の全8ケース（正常系4/異常系1/境界値3）を通すための実装
## 🔵 信頼性レベル: REQ-105・TC-101-01（要件定義書・受け入れ基準）に基づく
class_name QualityCalculator
extends RefCounted


## 【機能概要】: 投入素材群のquality値の算術平均（基礎品質）を算出する
## 【実装方針】: 空配列はゼロ除算を避けるため0.0を返す（防御的実装）。
## 　　　　　　 整数除算バグ（int/int切り捨て）を避けるためfloatに変換してから除算する。
## 【テスト対応】: TC-101-01（D/C/B/A平均2.5）、単一素材・同一品質・traits無視・
## 　　　　　　 空配列・上下限境界・非終端小数精度の全ケースに対応
## 🔵 信頼性レベル: REQ-105「基礎品質＝投入素材の平均品質」に基づく
## ⚠️ 型に関する設計判断: architecture.mdのシグネチャ例は `-> int` だが、
## 　TC-101-01の期待値2.5（非整数）を満たすため本関数は `-> float` を採用する
## 　（note.md「6. 注意事項」で申し送り済み）。float→Quality enumへの丸め・変換は
## 　呼び出し側（TASK-0016等）の責務とする。
## @param materials - 調合に投入する素材インスタンスの配列
## @returns 素材quality値の算術平均（float）。空配列時は0.0
static func calculate_base_quality(materials: Array[MaterialInstance]) -> float:
	# 【入力値検証】: 空配列はゼロ除算を引き起こすため、先に防御的に0.0を返す 🔵
	if materials.is_empty():
		return 0.0

	# 【合計算出】: 各素材のquality（int評価されるenum）を合算する 🔵
	# 【traits非参照】: 本関数はqualityのみを参照し、traitsは一切使用しない（責務分離）
	var total: int = 0
	for material in materials:
		total += int(material.quality)

	# 【平均算出】: float変換してから除算し、整数除算による切り捨てを回避する 🔵
	# 【期待値確認】: 例) 合計10÷4=2.5、合計7÷3=2.333...のように非終端小数も精度を保つ
	return float(total) / float(materials.size())
```

## 3. 実装方針と判断理由

- Redフェーズ記録（`quality-calculator-red-phase.md`）の「Greenフェーズで実装すべき内容」の最小実装案をベースに、日本語コメント要件（機能概要・実装方針・テスト対応・信頼性レベル）を付与して実装した。
- `static func` のみで構成し `RefCounted` を継承（`Node` は継承しない）。GameState・Autoload等の外部状態参照は行わず、純粋関数制約を遵守した。
- 空配列時は `materials.is_empty()` で早期リターンし `0.0` を返すことで、ゼロ除算・クラッシュを防止（EDGE-001対応）。
- 合計計算は `int` 型の `total` に累積し、最後に `float(total) / float(materials.size())` とすることで、整数除算（`int/int`）による切り捨てバグ（例: `7/3 == 2` になる罠）を回避した。
- `material.quality` は `MaterialInstance.Quality` enum（D=1〜S=5）だが、GDScriptではenumがintとして評価されるため `int(material.quality)` で明示的に整数化して合算した。
- `traits` プロパティは一切参照せず、責務分離（品質ペナルティ計算はTASK-0016の責務）を実装レベルでも明確化した。

## 4. テスト実行結果

実行コマンド:

```bash
cd atelier-godot
"C:\Users\syagu\AppData\Local\Microsoft\WinGet\Packages\GodotEngine.GodotEngine_Microsoft.Winget.Source_8wekyb3d8bbwe\Godot_v4.7-stable_win64_console.exe" --headless -s addons/gut/gut_cmdln.gd -gdir=res://tests/unit/features/alchemy -gexit
```

結果:

```
res://tests/unit/features/alchemy/craft_result_test.gd       6/6 passed.
res://tests/unit/features/alchemy/material_instance_test.gd  7/7 passed.
res://tests/unit/features/alchemy/quality_calculator_test.gd 8/8 passed.
res://tests/unit/features/alchemy/recipe_definition_test.gd  4/4 passed.
res://tests/unit/features/alchemy/trait_definition_test.gd   3/3 passed.

Totals
------
Scripts               5
Tests                28
Passing Tests        28
Asserts              57
Time              1.153s

---- All tests passed! ----
```

- `quality_calculator_test.gd` の全8ケース（正常系4・異常系1・境界値3）が成功。
- 既存の4テストスクリプト（TASK-0008〜0012分、計20テスト）も引き続き全てパスしており、デグレは発生していない。

## 5. 課題・改善点（Refactorフェーズで対応）

- 現状の実装はシンプルで大きな問題はないが、以下は改善候補として検討する。
  - ループ内の `int(material.quality)` キャストがやや冗長に見えるため、コメントで意図（enumのint評価であることの明示）を残しているが、より簡潔な書き方がないか検討の余地あり。
  - ファイルサイズは約40行であり800行制限に対して十分小さく、分割の必要はない。
  - モック・スタブは実装コードに含まれていない（純粋関数のみ）。

## 6. 品質判定

✅ 高品質:
- テスト結果: 全28テスト成功（quality_calculator_test.gdの8/8含む）
- 実装品質: シンプルかつ動作する（早期リターン＋ループ集計＋float除算のみ）
- リファクタ箇所: 明確に特定可能（コメント表現の微調整程度、機能的な問題なし）
- 機能的問題: なし
- コンパイルエラー: なし（GUT実行で正常にロード・実行確認済み）
- ファイルサイズ: 約40行（800行制限に対して余裕あり）
- モック使用: 実装コードにモック・スタブは含まれていない
