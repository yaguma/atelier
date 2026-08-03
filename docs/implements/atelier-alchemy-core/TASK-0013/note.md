# TASK-0013 TDD開発コンテキストノート

**タスク**: QualityCalculator.calculate_base_quality実装（品質値平均算出）  
**作成日**: 2026-07-25  
**前提**: TASK-0011（TraitDefinition）, TASK-0012（MaterialInstance等）完了済み

---

## 1. 技術スタック

- **言語**: GDScript（Godot 4.7）
- **テストフレームワーク**: GUT (Godot Unit Test) 9.6.1
- **アーキテクチャ**: Functional Core（純粋関数のみ）
- **参照元**: docs/tasks/atelier-alchemy-core/TASK-0013.md

### GUT設定
- **テストファイル配置**: `atelier-godot/tests/unit/features/alchemy/quality_calculator_test.gd`
- **被テスト対象**: `atelier-godot/features/alchemy/logic/quality_calculator.gd`

---

## 2. 開発ルール

### TDDサイクル（厳密順序）
1. **Red**: テストファイル作成 → テスト失敗確認
2. **Green**: 最小実装 → テスト成功確認
3. **Refactor**: リファクタリング → テスト維持確認
4. **Verify**: 全テストパス、型チェック、リント完了

### 純粋関数原則
- **副作用なし**: 外部状態参照禁止（GameState、Autoload不可）
- **入力のみに依存**: 引数以外の情報を使用しない
- **静的メソッドのみ**: `static func calculate_base_quality(...) -> float`
- **参照元**: docs/tasks/atelier-alchemy-core/TASK-0013.md「実装詳細」

---

## 3. 関連実装

### 既存クラス（TASK-0011, TASK-0012で実装済み）
- **MaterialInstance**: `features/alchemy/data/` 配下
  - `quality: int` プロパティ（D=1〜S=5）
  - `traits: Array[String]` プロパティ（特性タグ）

### 実装ファイル
- **実装先**: `atelier-godot/features/alchemy/logic/quality_calculator.gd`
- **クラス名**: `QualityCalculator`（extends RefCounted）
- **関数シグネチャ**: 
  ```gdscript
  static func calculate_base_quality(materials: Array[MaterialInstance]) -> float
  ```

### 後続タスク（品質値を使用）
- **TASK-0016**: QualityPenalty（特性発現時の品質ペナルティ）
- **TASK-0018**: AlchemyResolver.craft（オーケストレーター）

---

## 4. 設計文書

### 要件定義
- **参照元**: docs/spec/atelier-alchemy-core/requirements.md
- **REQ-105**: 「システムは完成品の基礎品質を投入素材の平均品質として算出しなければならない」
- **REQ-111**: 品質ペナルティはこの基礎品質に対して適用（本タスクの外）

### 受け入れ基準
- **参照元**: docs/spec/atelier-alchemy-core/acceptance-criteria.md
- **TC-101-01**: 品質D(1)/C(2)/B(3)/A(4)投入時、平均 = (1+2+3+4)/4 = **2.5** を返す
  - 非整数値が期待結果 → **戻り値型は float を採用**

### アーキテクチャ
- **参照元**: docs/design/atelier-alchemy-core/architecture.md
- **方針**: Functional Core（logic/）に配置。副作用を持たない純粋関数

### データモデル
- **参照元**: docs/design/atelier-alchemy-core/data-model.md
- **品質スコア**: D=1, C=2, B=3, A=4, S=5（enum Material Quality）

---

## 5. テスト関連情報

### テストフレームワーク
- **GUT実行コマンド**: `cd atelier-godot && godot --headless -d -s addons/gut/gut_cmdline.gd -gtest="res://tests/unit/features/alchemy/quality_calculator_test.gd"`
- **テストファイルパス**: `atelier-godot/tests/unit/features/alchemy/quality_calculator_test.gd`

### テストケース（参照元: docs/tasks/atelier-alchemy-core/TASK-0013.md）

#### TC-101-01 🔵 （信頼性高・必須）
- **入力**: 品質D(1), C(2), B(3), A(4)の無特性素材各1個
- **期待値**: `2.5`（浮動小数点）
- **目的**: 平均値計算の正確性確認

#### TC単一素材 🟡
- **入力**: 品質S(5)の素材1個
- **期待値**: `5.0`
- **目的**: 単一要素の平均（自身）確認

#### TC同一品質 🟡
- **入力**: 品質B(3)の素材4個
- **期待値**: `3.0`
- **目的**: 一般ケース（非整数でない）確認

#### TC空配列 🟡
- **入力**: 空配列 `[]`
- **期待値**: `0.0`（ゼロ除算回避）
- **目的**: エッジケース（EDGE-001関連）

### GUT テストコード基本構造
```gdscript
extends GutTest

func test_calculate_base_quality_average():
    var materials = [
        create_material(1),  # D品質
        create_material(2),  # C品質
        create_material(3),  # B品質
        create_material(4),  # A品質
    ]
    var result = QualityCalculator.calculate_base_quality(materials)
    assert_equal(result, 2.5, "平均品質が2.5になること")

func test_empty_array_returns_zero():
    var result = QualityCalculator.calculate_base_quality([])
    assert_equal(result, 0.0, "空配列時は0.0を返す")
```

---

## 6. 注意事項

### ⚠️ 設計文書間の不整合（TASK-0013.md注記より）

**矛盾点**:
- `architecture.md` の関数シグネチャ例: `-> int`
- `acceptance-criteria.md` TC-101-01 の期待値: `2.5`（非整数）

**対応方針**:
- **本タスクでは戻り値型を `float` として実装**
- 整数への丸めと Quality enum（D〜S）への変換は呼び出し側（TASK-0016等）の責務
- 実装コード内にコメントで変換ポイントを明示する

### 🛡️ 防御的実装

**空配列時の処理**:
- EDGE-001「投入枠に素材が1つもない状態では調合を成立させない」への対応
- 本関数はゼロ除算を防ぐため空配列時は `0.0` を返す
- 実際のガード（UI/オーケストレーター側での空配列チェック）はTASK-0018の責務

### 📋 実装時チェックリスト

- [ ] `static func` のみで構成（Nodeを継承しない）
- [ ] 外部状態参照なし（GameState, Autoload等 参照禁止）
- [ ] GUT テストファイルは `tests/unit/features/alchemy/` に配置
- [ ] 4つのテストケース（TC-101-01、単一素材、同一品質、空配列）すべてパス
- [ ] 浮動小数点演算の精度確認（2.5 が正確に計算されること）

---

## 参考ファイル一覧

- `docs/tasks/atelier-alchemy-core/TASK-0013.md` — タスク定義
- `docs/spec/atelier-alchemy-core/requirements.md` — 要件定義（REQ-105）
- `docs/spec/atelier-alchemy-core/acceptance-criteria.md` — 受け入れ基準（TC-101-01等）
- `docs/design/atelier-alchemy-core/architecture.md` — アーキテクチャ設計
- `docs/design/atelier-alchemy-core/data-model.md` — データモデル
- `docs/tasks/atelier-alchemy-core/TASK-0011.md` — TraitDefinition（前提タスク）
- `docs/tasks/atelier-alchemy-core/TASK-0012.md` — MaterialInstance等（前提タスク）
