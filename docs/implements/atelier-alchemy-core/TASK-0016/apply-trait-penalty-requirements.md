# TASK-0016 要件定義書: QualityCalculator.apply_trait_penalty

**機能名**: QualityCalculator.apply_trait_penalty（品質ペナルティ適用）
**タスクID**: TASK-0016
**要件名**: atelier-alchemy-core
**タスクタイプ**: TDD
**フェーズ**: Phase 3 - 調合コアロジック（★核心）
**作成日**: 2026-08-02

---

## 1. 機能の概要（EARS要件定義書・設計文書ベース）

- 🔵 **何をする機能か**: TASK-0013 の `calculate_base_quality`（基礎品質 float）と TASK-0015 の `resolve_category_conflict`（系統排他制御後の最終発現特性）の出力を受け取り、発現した特性の数に応じて品質を減算して**最終品質**（`MaterialInstance.Quality` enum、1〜5）を算出する純粋関数。
- 🔵 **どのような問題を解決するか**: コンセプト文書「食い合い」の意図（特性を宿すと品質を犠牲にする）を、投入枠の配分ではなく品質スコアへの**直接ペナルティ**として数式化する。旧版（枠数ベースの食い合い）が持っていた「1素材が複数特性を同時保有し品質・特性・貢献度・報酬を無条件に両取りできる」支配戦略の抜け穴を塞ぐ（2026-07-09 ゲームデザインレビューで確定）。
- 🔵 **想定されるユーザー**: 調合システムのオーケストレーター（TASK-0018 `AlchemyResolver.craft`）が、最終品質算出のために本関数を呼び出す。プレイヤーは調合結果として最終品質を体験する。
- 🔵 **システム内での位置づけ**: Functional Core（`features/alchemy/logic/`）に配置される副作用のない静的メソッド。処理フロー「基礎品質算出（TASK-0013）→ 特性発現判定（TASK-0014）→ 系統排他制御（TASK-0015）→ **品質ペナルティ適用（本タスク）** → 特性ボーナス適用（TASK-0017）」の一角を担い、float → Quality enum 変換ポイントを本関数に集約する。
- **参照したEARS要件**: REQ-105、REQ-108、REQ-111、REQ-112
- **参照した設計文書**: architecture.md（Functional Core 配置規定・float→int 変換ポイント）、data-model.md（Quality enum / Category enum）

---

## 2. 入力・出力の仕様（EARS機能要件・型定義ベース）

### 入力パラメータ 🔵

| 引数 | 型 | 範囲・制約 | 説明 |
|------|-----|-----------|------|
| `base_quality` | `float` | 0.0〜5.0 想定（TASK-0013 の平均品質） | ペナルティ適用前の基礎品質。REQ-105 の平均品質（非整数を許容） |
| `activated_traits` | `Array[TraitDefinition]` | 空配列可 | 系統排他制御適用後の最終発現特性。各要素は `category`（CONTRIBUTION / REWARD / SUPPORT）を持つ |

- 🔵 関数シグネチャ:
  ```gdscript
  static func apply_trait_penalty(
      base_quality: float,
      activated_traits: Array[TraitDefinition],
  ) -> MaterialInstance.Quality
  ```

### 出力値 🔵

- 🔵 **型**: `MaterialInstance.Quality`（int enum: D=1, C=2, B=3, A=4, S=5）
- 🟡 **形式**: 内部計算は float で行い、下限・上限クランプ後に `round()`（四捨五入）で最も近い整数へ丸め、`MaterialInstance.Quality` にキャストして返す
- 🔵 **例**: `apply_trait_penalty(4.0, [貢献度系1個])` → `Quality.B`（3）

### 入出力の関係性（アルゴリズム） 🔵

1. `activated_traits` のうち `category != SUPPORT` の件数 → `penalty_count`
2. `quality_after_penalty = base_quality - penalty_count`（REQ-111 / REQ-112 加算的）
3. `activated_traits` のうち `category == SUPPORT` の件数 → `support_bonus_count`
4. `quality_after_penalty += support_bonus_count`（REQ-108 触媒+1段 / REQ-111 減算後に加算）
5. 下限クランプ: `max(quality_after_penalty, 1.0)`（REQ-111 D 下限）
6. 上限クランプ: `min(quality_after_penalty, 5.0)` 🟡（Quality 値域 1〜5 のための防御的実装）
7. `round()` で丸め → `MaterialInstance.Quality` にキャストして返却

- **参照したEARS要件**: REQ-108、REQ-111、REQ-112
- **参照した設計文書**: data-model.md（`Quality { D=1..S=5 }`、`Category { CONTRIBUTION, REWARD, SUPPORT }`）、TASK-0016.md「実装詳細」

---

## 3. 制約条件（EARS非機能要件・アーキテクチャ設計ベース）

- 🔵 **アーキテクチャ制約**: Functional Core（`logic/`）に配置。`static func` のみで構成し `Node` を継承しない。外部状態（GameState・Autoload）を一切参照しない純粋関数。
- 🔵 **純粋性制約**: 同一入力に対し常に同一出力を返す。副作用（状態変更・I/O・乱数）を持たない。引数以外の情報を使用しない。
- 🔵 **下限保証（Critical）**: 最終品質は D（スコア1）を下回ってはならない（REQ-111 / TC-101-B02）。
- 🟡 **上限保証**: 最終品質は S（スコア5）を上回ってはならない（要件明記なし、Quality 値域のための防御的実装）。
- 🟡 **丸め方式制約**: float→int 変換は `round()`（四捨五入）を採用し、コード内コメントで明示する。設計文書間の不整合（int 想定シグネチャ例 vs 非整数期待値）に対する暫定対応であり、バランス調整フェーズで再検証する。
- 🔵 **GDScriptコーディング規約**: 型注釈必須、定数は UPPER_SNAKE_CASE、関数名スネークケース、クラス名パスカルケース。
- 🔵 **実装ファイル制約**: `features/alchemy/logic/quality_calculator.gd`（TASK-0013 と同一ファイル、`class_name QualityCalculator` に追加）。
- 🟡 **パフォーマンス**: 調合投入枠は数個規模（REQ-101 想定4枠）。O(n) の件数カウントのみで最適化不要。
- **参照したEARS要件**: REQ-111（下限）、REQ-101（投入枠規模）
- **参照した設計文書**: architecture.md（Functional Core / 変換ポイント）、data-model.md（Quality 値域）

---

## 4. 想定される使用例（Edgeケース・データフローベース）

### 基本的な使用パターン 🔵

- 🔵 貢献度系1個発現・基礎品質A(4) → 1段減で B(3)
- 🟡 貢献度系2個発現・基礎品質A(4) → 加算的に2段減でスコア2（C）
- 🟡 貢献度系1個 + SUPPORT（触媒）1個・基礎品質A(4) → 1段減(4→3)後に+1段で A(4)

### エッジケース 🔵🟡

- 🔵 **下限クランプ（TC-101-B02）**: 基礎品質D(1)・特性1個以上発現 → D(1) を下限とし、それ以上下がらない
- 🟡 **特性0個**: 空配列 → 減算なし、基礎品質のまま（例: B(3) → B(3)）
- 🟡 **上限クランプ**: SUPPORT 多数投入で 5.0 超過が生じても S(5) にクランプ（防御的）
- 🔵 **EDGE-102 極端ケース**: 投入枠が全て同一特性素材で埋まると品質側素材が0となり、特性のみ強く品質が低い完成品になり得る（REQ-111「食い合い」の極端例）

### エラーケース 🟡

- 🟡 本関数は例外を投げず、不正・境界入力もクランプで吸収する設計（防御的実装）。空配列は正常系として扱う。

- **参照したEARS要件**: REQ-111、REQ-112、REQ-108、EDGE-102
- **参照した設計文書**: dataflow.md（調合品質算出フロー）、acceptance-criteria.md（TC-101-B02）

---

## 5. EARS要件・設計文書との対応関係

- **参照したユーザストーリー**: 錬金術師が素材の特性と品質のトレードオフ（食い合い）を体験する調合ループ
- **参照した機能要件**:
  - REQ-105（基礎品質＝投入素材の平均品質、ペナルティ適用前の値）
  - REQ-108（補助系特性 = 触媒＝品質+1段を別扱い）
  - REQ-111 🔵**確定（2026-07-09）**（発現特性1個につき1段減、D下限、補助系は減算後に加算）
  - REQ-112 🔵（同系統複数発現時にペナルティが加算的に積み重なる）
- **参照した非機能要件**: NFR（Functional Core / 純粋関数原則、architecture.md 由来）
- **参照したEdgeケース**: EDGE-102（品質側素材0の極端ケース）
- **参照した受け入れ基準**: TC-101-B02（下限保証・Critical）、TC-101-B01（発現境界・参考）
- **参照した設計文書**:
  - **アーキテクチャ**: architecture.md（Functional Core 配置・float→int 変換ポイント）
  - **データフロー**: dataflow.md（基礎品質→発現判定→系統排他→ペナルティ適用の順序）
  - **データモデル**: data-model.md（`MaterialInstance.Quality` enum、`TraitDefinition.Category` enum、`CraftResult.final_quality`）
  - **タスク定義**: docs/tasks/atelier-alchemy-core/TASK-0016.md

---

## 品質判定結果

```
⚠️ 要改善（要注意）:
- 要件の曖昧さ: 一部あり（触媒複数投入時の加算モデル、丸め方式が暫定確定）
- 入出力定義: 完全（型・範囲・アルゴリズム明確）
- 制約条件: 明確（純粋関数・下限保証・配置先すべて確定）
- 実装可能性: 確実（アルゴリズム7ステップが確定済み）
- 信頼性レベル分布: 🔵 多数（コアロジック・下限保証は確定）／🟡（丸め方式・上限クランプ・触媒加算モデル・通常ケース数値検証はREQ本文からの妥当な推測）／🔴 なし
```

**総評**: 下限保証（TC-101-B02）・アルゴリズム骨子・純粋関数制約は🔵で確実。丸め方式（`round()`）・上限クランプ・触媒の加算モデル・通常ケースの数値検証は acceptance-criteria.md に専用TC未整備のため🟡（REQ本文から妥当に導出）。実装自体は確定仕様で可能だが、触媒複数投入時の挙動はバランス調整フェーズでの再検証を推奨する。

---

## 次のステップ

次のお勧めステップ: `/tsumiki:tdd-testcases atelier-alchemy-core TASK-0016` でテストケースの洗い出しを行う。
