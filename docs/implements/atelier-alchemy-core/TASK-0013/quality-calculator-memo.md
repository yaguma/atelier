# TDD開発メモ: 基礎品質算出（QualityCalculator.calculate_base_quality）

## 概要

- 機能名: QualityCalculator.calculate_base_quality（基礎品質算出）
- 開発開始: 2026-07-31
- 現在のフェーズ: 完了（Refactor完了、verify-complete待ち）

## 関連ファイル

- 元タスクファイル: `docs/tasks/atelier-alchemy-core/TASK-0013.md`
- 要件定義: `docs/implements/atelier-alchemy-core/TASK-0013/quality-calculator-requirements.md`
- テストケース定義: `docs/implements/atelier-alchemy-core/TASK-0013/quality-calculator-testcases.md`
- Redフェーズ記録: `docs/implements/atelier-alchemy-core/TASK-0013/quality-calculator-red-phase.md`
- Greenフェーズ記録: `docs/implements/atelier-alchemy-core/TASK-0013/quality-calculator-green-phase.md`
- 実装ファイル: `atelier-godot/features/alchemy/logic/quality_calculator.gd`
- テストファイル: `atelier-godot/tests/unit/features/alchemy/quality_calculator_test.gd`

## Redフェーズ（失敗するテスト作成）

### 作成日時

2026-07-31

### テストケース

テストケース定義書の8ケース全てを実装（正常系4件・異常系1件・境界値3件）。
- TC-101-01: D/C/B/A各1個 → 2.5
- 単一素材S → 5.0
- 同一品質B×4 → 3.0
- traits付き素材でも品質のみで平均 → 3.0
- 空配列 → 0.0（非クラッシュ）
- 品質下限D×3 → 1.0
- 品質上限S×3 → 5.0
- 非終端小数（D,D,S） → 7/3≈2.333

### テストコード

`atelier-godot/tests/unit/features/alchemy/quality_calculator_test.gd` を参照。

### 期待される失敗

`features/alchemy/logic/quality_calculator.gd` が未実装（`.gitkeep`のみ）のため、
`preload()` 対象が存在せず `QualityCalculatorScript` の型推論に失敗する静的解析エラーが発生。
GUTはテストスクリプトをGutTest派生と認識できず読み込みに失敗する。

```
SCRIPT ERROR: Parse Error: Cannot infer the type of "QualityCalculatorScript" constant because the value doesn't have a set type.
[WARNING]:  Ignoring script res://tests/unit/features/alchemy/quality_calculator_test.gd because it does not extend GutTest
```

既存の他3テストスクリプト（craft_result_test.gd等）は影響を受けず20/20 Passしており、
新規テストのみがQualityCalculator未実装により失敗することを確認済み。

### 次のフェーズへの要求事項

Greenフェーズで `atelier-godot/features/alchemy/logic/quality_calculator.gd` に以下を実装する:

```gdscript
class_name QualityCalculator
extends RefCounted

static func calculate_base_quality(materials: Array[MaterialInstance]) -> float:
    if materials.is_empty():
        return 0.0
    var total := 0
    for m in materials:
        total += int(m.quality)
    return float(total) / float(materials.size())
```

- `static func`のみで構成（Nodeを継承しない）
- 外部状態参照なし（GameState, Autoload等参照禁止）
- 空配列時は`0.0`を返す防御的実装
- `float(total) / float(size)`で整数除算バグを回避

## Greenフェーズ（最小実装）

### 実装日時

2026-07-31

### 実装方針

- Redフェーズ記録の最小実装案をベースに、日本語コメント要件（機能概要・実装方針・テスト対応・信頼性レベル）を付与して実装。
- `static func` のみで構成し `RefCounted` を継承（純粋関数制約を遵守、GameState/Autoload未参照）。
- 空配列は早期リターンで `0.0` を返しゼロ除算を防止（EDGE-001対応）。
- `int` で合計後 `float(total) / float(size)` として除算し、整数除算の切り捨てバグを回避。
- `traits` は一切参照せず、品質ペナルティ（TASK-0016）との責務分離を実装レベルで明確化。

### 実装コード

`atelier-godot/features/alchemy/logic/quality_calculator.gd` を参照（詳細は `quality-calculator-green-phase.md`）。

### テスト結果

```
Totals
------
Scripts               5
Tests                28
Passing Tests        28
Asserts              57
Time              1.153s

---- All tests passed! ----
```

`quality_calculator_test.gd` 8/8 pass。既存4スクリプト（20テスト）も引き続き全てパスしデグレなし。

### 課題・改善点

- ループ内の `int(material.quality)` キャストの表現をRefactorフェーズで見直す余地あり（機能的な問題はない）。
- ファイルサイズ・モック使用については問題なし（約40行、モック不使用）。

## Refactorフェーズ（品質改善）

### 実施日時

2026-07-31

### 方針

Greenフェーズの実装は機能的に問題がなかったため、**ロジックは一切変更せず**設計判断コメントの分離・明確化のみを実施した。

- 「⚠️ 設計判断1」: 戻り値型float採用の根拠（architecture.mdの`-> int`例とTC-101-01の`2.5`期待値の不整合、TC-101-01を正とする判断）を独立記述し信頼性レベル🟡を付与
- 「⚠️ 設計判断2」: Quality enumへの変換を本関数の責務としない方針（TASK-0016側の責務）を独立記述し信頼性レベル🔵を付与
- comment_templateに沿い【改善内容】【設計方針】【パフォーマンス】【保守性】を追加
- ループ内`int(material.quality)`キャストの意図（enumのint評価）を明示するコメントを追加

### セキュリティ・パフォーマンスレビュー

- セキュリティ: 外部入力を受け付けない純粋関数のため重大な脆弱性なし
- パフォーマンス: O(n)の単純な合計・除算のみ。投入枠は数個規模（REQ-101既定4）で懸念なし

### テスト結果

```
Totals
------
Scripts               5
Tests                28
Passing Tests        28
Asserts              57
Time              0.458s

---- All tests passed! ----
```

全28テスト継続成功、デグレなし。詳細は `quality-calculator-refactor-phase.md` を参照。

### 品質判定

✅ 高品質: テスト全継続成功・セキュリティ/パフォーマンス問題なし・設計判断根拠を明示するリファクタ目標達成・ファイルサイズ約58行。
