# TASK-0016 TDD開発コンテキストノート

**タスクID**: TASK-0016  
**機能名**: QualityCalculator.apply_trait_penalty実装  
**実装言語**: GDScript（Godot 4.x）  
**テストフレームワーク**: GUT（Godot Unit Test）  
**作成日**: 2026-08-02

---

## 1. 技術スタック

- **エンジン**: Godot 4.7
- **言語**: GDScript
- **テストツール**: GUT (Godot Unit Test Framework) 9.6.1
- **アーキテクチャパターン**: Functional Core（純粋関数のみ）
  - `apply_trait_penalty` は副作用のない static func
  - 外部状態（GameState、Autoload）参照禁止
- **参照元**: docs/design/atelier-alchemy-core/architecture.md

### GUT設定
- **テストファイル配置**: `atelier-godot/tests/unit/features/alchemy/quality_calculator_test.gd`
- **被テスト対象**: `atelier-godot/features/alchemy/logic/quality_calculator.gd`
- **実行コマンド**: `cd atelier-godot && godot --headless -d -s addons/gut/gut_cmdline.gd -gtest="res://tests/unit/features/alchemy/quality_calculator_test.gd"`

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
- **静的メソッドのみ**: `static func apply_trait_penalty(...) -> MaterialInstance.Quality`
- 参照元: docs/tasks/atelier-alchemy-core/TASK-0016.md「実装詳細」

### GDScriptコーディング規約
- 型注釈は必須（`func func_name(arg: Type) -> ReturnType:`）
- 定数は大文字アンダースコア（`const MAX_VALUE = 10`）
- 関数名はスネークケース（`apply_trait_penalty`）
- クラス名はパスカルケース（`QualityCalculator`）

---

## 3. 関連実装

### 前提実装（TASK-0013, TASK-0015 完了済み）
- **QualityCalculator.calculate_base_quality()**: 基礎品質算出（float）
  - 実装ファイル: `atelier-godot/features/alchemy/logic/quality_calculator.gd`
  - 機能: 投入素材の品質平均値を算出
- **TraitActivation.resolve_category_conflict()**: 系統排他制御（TASK-0015）
  - 実装ファイル: `atelier-godot/features/alchemy/logic/trait_activation.gd`
  - 機能: 貢献度系・報酬系の排他制御を適用

### 実装対象ファイル
- **実装先**: `atelier-godot/features/alchemy/logic/quality_calculator.gd`
- **クラス名**: `QualityCalculator`（既存の同一ファイル内に追加）
- **関数シグネチャ**:
  ```gdscript
  static func apply_trait_penalty(
      base_quality: float,
      activated_traits: Array[TraitDefinition],
  ) -> MaterialInstance.Quality
  ```

### 既存実装パターン
- `calculate_base_quality()` の実装スタイル（静的メソッド、詳細コメント）を踏襲
- テストファイル: `atelier-godot/tests/unit/features/alchemy/quality_calculator_test.gd`

### 後続実装（参考）
- **TASK-0017**: 特性ボーナス適用
- **TASK-0018**: AlchemyResolver.craft（オーケストレーター）が最終品質を使用

---

## 4. 設計文書・要件定義

### コアドキュメント
- **タスク定義**: `docs/tasks/atelier-alchemy-core/TASK-0016.md`
  - 品質ペナルティロジックの仕様・テストケース一覧
  - 信頼性レベル表記（🔵/🟡/🔴）

- **要件定義**: `docs/spec/atelier-alchemy-core/requirements.md`
  - **REQ-111** 🔵: 発現特性1個につき品質を1段階減算（下限D=1）
  - **REQ-112** 🔵: ペナルティが加算的に積み重なる
  - **REQ-108** 🔵: SUPPORT系特性は減算対象外、減算後に+1段加算

- **設計文書**: `docs/design/atelier-alchemy-core/architecture.md`
  - Functional Core（logic/）に配置することを規定
  - 品質計算の処理フロー（「float→int変換ポイント」に関するアーキテクトレビュー指摘に対応）

- **データモデル**: `docs/design/atelier-alchemy-core/data-model.md`
  - MaterialInstance.Quality enum: D=1, C=2, B=3, A=4, S=5
  - TraitDefinition.Category: CONTRIBUTION / REWARD / SUPPORT

### 受け入れ基準（重要）
- `docs/spec/atelier-alchemy-core/acceptance-criteria.md`
  - **TC-101-B02** 🔵 **（必須・Critical）**: 下限保証（基礎品質D投入でペナルティ後もD以上）
  - テストケース4と5（補助系加算、発現0個時の非変化）は設計文書に直接導出

---

## 5. テスト関連情報

### テストファイル
- **ファイルパス**: `atelier-godot/tests/unit/features/alchemy/quality_calculator_test.gd`
- **テストケース数**: 5個（TASK-0016.md タスク概要「単体テスト要件」より）

#### TC-101-B02 🔵 （下限保証・必須）
- **信頼性**: 🔵 REQ-111 より
- **Given**: 基礎品質D(1)相当、特性1個以上発現
- **When**: `apply_trait_penalty(1.0, activated_traits)` 呼び出し
- **Then**: 戻り値が `MaterialInstance.Quality.D`（1）のまま、それ以上下がらない

#### TC-2（通常ケース1段減） 🟡
- **信頼性**: 🟡 REQ-111 基本ルール
- **Given**: 基礎品質A(4)、特性1個（SUPPORT以外）
- **When**: `apply_trait_penalty(4.0, activated_traits)`
- **Then**: 戻り値が `MaterialInstance.Quality.B`（3）

#### TC-3（加算的積重） 🟡
- **信頼性**: 🟡 REQ-112 「加算的」
- **Given**: 基礎品質A(4)、特性2個（SUPPORT以外）
- **When**: `apply_trait_penalty(4.0, activated_traits)`
- **Then**: 戻り値が `MaterialInstance.Quality`スコア 2

#### TC-4（SUPPORT加算） 🟡
- **信頼性**: 🟡 REQ-108「触媒＝品質+1段」、REQ-111「減算後に加算」
- **Given**: 基礎品質A(4)、貢献度系1個 + SUPPORT 1個
- **When**: `apply_trait_penalty(4.0, activated_traits)`
- **Then**: 1段減（4→3）後に +1 加算、戻り値が `MaterialInstance.Quality.A`（4）

#### TC-5（特性0個） 🟡
- **信頼性**: 🟡 REQ-111「1個につき」より 0個は減算なし
- **Given**: 基礎品質B(3)、特性0個（空配列）
- **When**: `apply_trait_penalty(3.0, [])`
- **Then**: 戻り値が `MaterialInstance.Quality.B`（3）のまま

### GUT テストコード基本構造
```gdscript
extends GutTest

func test_apply_trait_penalty_lower_bound():
    var result = QualityCalculator.apply_trait_penalty(1.0, [create_trait("trait1", TraitDefinition.Category.CONTRIBUTION)])
    assert_equal(result, MaterialInstance.Quality.D, "下限D保証")

func test_apply_trait_penalty_single_penalty():
    var result = QualityCalculator.apply_trait_penalty(4.0, [create_trait("trait1", TraitDefinition.Category.CONTRIBUTION)])
    assert_equal(result, MaterialInstance.Quality.B, "1段減算")
```

### モック・テストデータ
- MaterialInstance型: `atelier-godot/features/alchemy/data/material_instance.gd`
- TraitDefinition型: `atelier-godot/features/alchemy/data/trait_definition.gd`
- テスト用ヘルパ関数を `quality_calculator_test.gd` 内に実装

---

## 6. 実装アルゴリズム

### ペナルティ算出ステップ（TASK-0016.md「実装詳細」より）

```
1. activated_traits のうち category != SUPPORT の件数を数える → penalty_count
2. quality_after_penalty = base_quality - penalty_count
3. activated_traits のうち category == SUPPORT の件数を数える → support_bonus_count
4. quality_after_penalty += support_bonus_count
5. 下限クランプ: quality_after_penalty = max(quality_after_penalty, 1.0)
6. 上限クランプ: quality_after_penalty = min(quality_after_penalty, 5.0)
7. round() で最も近い整数に丸め、MaterialInstance.Quality にキャストして返す
```

### 実装上の注意
- **丸め方式**: `round()`（四捨五入）を採用、コメントで明示
  - 参照: TASK-0016.md「実装詳細」🟡 信頼性補足
- **float → Quality enum 変換**: 本関数で実施（QualityCalculator内で処理集約）
- **上限保護**: 設計文書に明記なしが、MaterialInstance.Quality の値域（1〜5）のための防御的実装 🟡

---

## 7. 注意事項・重要ポイント

### 🔴 最重要：REQ-111改訂の経緯（TASK-0016.md注記より）

本ロジックは支配戦略の抜け穴を塞ぐために2026-07-09に確定した仕様である。
- **旧版（TASK-0016タスク概要より）**: 枠数ベースの食い合い（1素材が複数特性を同時保有で品質・特性・報酬を無条件に両取り）
- **新版（本タスク）**: 品質スコアへの直接ペナルティ
  
**実装時に旧版ロジックに戻さないこと。** 品質スコアへの直接減算という数式レベルでの実装を維持すること。

### 補助系（SUPPORT/触媒）の複数投入時の扱い

REQ-108 本文に明記がないが、本タスクでは「SUPPORT系の件数分だけ加算する」という単純な加算モデルを採用（🟡）。
触媒の複数投入がバランス上どう扱われるべきかは、バランス調整フェーズで再検討が必要な可能性がある。

### float → int 変換の丸め方式

`round()`（四捨五入）を採用した理由：
- architecture.md の関数シグネチャ例（`-> int`）vs acceptance-criteria.md の期待値（非整数）の不整合を受け、
  float → Quality enum への変換ポイント・丸め方式は TASK-0016 で確定する方針に統一
- 参照: TASK-0016.md「実装詳細」🟡 信頼性補足

### 実装時チェックリスト

- [ ] `static func` のみで構成（Nodeを継承しない）
- [ ] 外部状態参照なし（GameState, Autoload等 参照禁止）
- [ ] GUT テストファイルは `atelier-godot/tests/unit/features/alchemy/quality_calculator_test.gd` に配置
- [ ] 5つのテストケース（TC-101-B02含む）すべてPass
- [ ] 品質の下限・上限クランプが正確に機能すること
- [ ] SUPPORT系の加算処理が正確に機能すること
- [ ] GUT実行で全テストPass、カバレッジ90%+達成
- [ ] コード内に「丸め方式」「Quality enum変換ポイント」を明示するコメント記述

---

## 参考ファイル一覧

- `docs/tasks/atelier-alchemy-core/TASK-0016.md` — タスク定義
- `docs/spec/atelier-alchemy-core/requirements.md` — 要件定義（REQ-111, REQ-112, REQ-108）
- `docs/spec/atelier-alchemy-core/acceptance-criteria.md` — 受け入れ基準（TC-101-B02等）
- `docs/design/atelier-alchemy-core/architecture.md` — アーキテクチャ設計
- `docs/design/atelier-alchemy-core/data-model.md` — データモデル
- `atelier-godot/features/alchemy/logic/quality_calculator.gd` — 既存実装（TASK-0013）
- `atelier-godot/features/alchemy/logic/trait_activation.gd` — 既存実装（TASK-0015）
- `atelier-godot/tests/unit/features/alchemy/quality_calculator_test.gd` — テストファイル
- `docs/tasks/atelier-alchemy-core/TASK-0013.md` — 前提タスク（基礎品質算出）
- `docs/tasks/atelier-alchemy-core/TASK-0015.md` — 前提タスク（系統排他制御）
