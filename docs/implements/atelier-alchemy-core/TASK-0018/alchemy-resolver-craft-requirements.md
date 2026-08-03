# TASK-0018 要件定義書: AlchemyResolver.craft オーケストレーター実装

**機能名**: AlchemyResolver.craft（調合オーケストレーター）
**タスクID**: TASK-0018
**要件名**: atelier-alchemy-core
**タスクタイプ**: TDD
**フェーズ**: Phase 3 - 調合コアロジック（★核心）
**作成日**: 2026-08-02

---

## 0. 本タスクの位置づけ（最重要・信頼性: 🔵）

🔵 *architecture.md「Godotアーキテクトレビュー Warning#2対応」、TASK-0018.md タスク概要より*

本タスクは **Godotアーキテクトレビュー Warning#2 への直接対応**として新設された設計である。

- **否定する旧設計**: UI（`AlchemyBench`）が `QualityCalculator` → `TraitActivation` → `ValueCalculator` を**個別に直接呼び出す**想定。これは調合ワークフローというビジネスロジックがUIに漏洩し、「UIはビジネスロジックを持たない」原則に反する。
- **新設計**: `AlchemyResolver.craft()` という**単一の純粋関数**に一連処理を集約。UI（TASK-0020）は投入枠選択操作と結果表示のみを担当する。
- **統合の責務**: 本タスクはTASK-0013〜0017で申し送られた複数の未確定事項を**一貫した方針で統合する箇所**である（下記「6. 申し送り事項の統合」参照）。

---

## 1. 機能の概要（EARS要件定義書・設計文書ベース）

🔵 *dataflow.md「機能2: 調合」、TASK-0018.md、note.md より*

- **何をする機能か**: TASK-0013〜0017で実装した個別の純粋関数（品質計算・特性発現判定・系統排他制御・品質ペナルティ・貢献度/報酬算出）を、dataflow.mdの5ステップに従って正しい順序で合成する調合オーケストレーター関数。
- **解決する問題**: 調合の一連計算ロジックがUIや複数の呼び出し元に散逸するのを防ぎ、単一の入口に集約する（Warning#2対応）。
- **想定ユーザー（呼び出し元）**: TASK-0019（`GameState.craft`）が本関数を呼び出す。UI（TASK-0020）は`GameState`経由でのみ利用する。
- **システム内での位置づけ**: Functional Core（`features/alchemy/logic/`）に配置する純粋関数。GameState等のAutoloadを一切参照しない。
- **参照したEARS要件**: REQ-105, REQ-106, REQ-108, REQ-109, REQ-110, REQ-111, REQ-112, REQ-115, REQ-121
- **参照した設計文書**: architecture.md「Godotアーキテクトレビュー Warning#2」、dataflow.md「機能2: 調合」

---

## 2. 入力・出力の仕様（EARS機能要件・型定義ベース）

🔵 *TASK-0018.md 実装詳細、note.md「関連実装」より*

### 入力パラメータ

| 引数 | 型 | 説明 | 導入経緯 |
|------|-----|------|---------|
| `materials` | `Array[MaterialInstance]` | 投入素材（0〜5枠）。空の場合はEDGE-001ガード対象 | architecture.md概略シグネチャ 🔵 |
| `reveal_level` | `int` | 特性開示レベル（0=Gランク非開示、1以上=開示）REQ-121 | architecture.md概略シグネチャ 🔵 |
| `daily_request` | `DailyRequest` | 指定合致ボーナス判定に使用（REQ-109/110） | architecture.md概略シグネチャ 🔵 |
| `recipe` | `RecipeDefinition` | 貢献度/報酬の基礎値算出に使用 | 🟡 TASK-0017申し送りで追加（下記6章） |
| `trait_definitions` | `Dictionary` | 特性系統判定のためのマスターデータ | 🟡 TASK-0014申し送りで追加（下記6章） |

### 出力値: `CraftResult`（`features/alchemy/data/`）

🔵🟡 *data-model.md「CraftResult型」、note.md より*

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `base_quality` | `float` | 投入素材の平均品質（ペナルティ適用前）REQ-105 |
| `final_quality` | `float` | 特性ペナルティ適用後の最終品質 REQ-111 |
| `activated_traits` | `Array[TraitDefinition]` | 系統排他後の最終発現特性 |
| `rejected_category` | `String` | 系統排他で却下された系統（無い場合は空文字列）🟡 無効値表現は下記6章 |
| `contribution` | `int` | 貢献度 REQ-109 |
| `reward` | `int` | 報酬 REQ-110 |

- **EDGE-001時の出力**: `materials.is_empty()` の場合は `null` を返す（調合不成立、状態変更なし）🟡
- **入出力の関係性**: 有効な入力（1個以上）では`null`でない`CraftResult`が返り、全6フィールドが埋まる。

---

## 3. 制約条件（非機能要件・アーキテクチャ設計ベース）

🔵 *architecture.md「Godotアーキテクトレビュー」、note.md「注意事項」より*

- **純粋関数制約（Critical#1）** 🔵: `static func` のみで構成、`extends RefCounted`。GameState・Autoload等の外部状態を一切参照しない。全依存（`reveal_level`/`daily_request`/`recipe`/`trait_definitions`）を引数で受け取る。
- **オーケストレーション集約制約（Warning#2）** 🔵: 調合の一連計算は必ず本関数を経由。UI等が`QualityCalculator`/`TraitActivation`/`ValueCalculator`を個別に直接呼び出すコードを書かない。
- **配置制約** 🔵: 実装先は `features/alchemy/logic/alchemy_resolver.gd`（Functional Core）。
- **技術制約** 🔵: GDScript（Godot 4.7）、テストはGUT 9.6.1。
- **参照したEARS要件**: REQ-121（reveal_level制御）、REQ-124（未解禁特性の非提供は呼び出し元責務）
- **参照した設計文書**: architecture.md「非機能要件の実現方法」

---

## 4. 想定される使用例（Edgeケース・データフローベース）

### 基本フロー（5ステップ順序） 🔵

🔵 *dataflow.md「機能2: 調合」シーケンス図、TASK-0018.md より*

1. `QualityCalculator.calculate_base_quality(materials)` → 基礎品質（REQ-105）
2. `TraitActivation.resolve_activated_traits(materials, reveal_level, trait_definitions)` → 候補特性（REQ-106, REQ-112。同一特性2個以上で発現候補化）
3. `TraitActivation.resolve_category_conflict(materials, candidate_traits)` → 系統排他（REQ-115。貢献度系/報酬系が同時条件充足時、枚数の多い系統のみ採用、同数はどちらも不発）。戻り値から `activated_traits` と `rejected_category` を取得
4. `QualityCalculator.apply_trait_penalty(base_quality, final_traits)` → 最終品質（REQ-111。発現特性1個につき-1段、補助系は事後+1段、D=1未満にならない）
5. `ValueCalculator.calculate_contribution(recipe, final_quality, final_traits, daily_request)` / `calculate_reward(...)` → 貢献度・報酬（REQ-109, REQ-110）

### エッジ・エラーケース

- **EDGE-001（投入枠が空）** 🟡: `materials = []` → `null` を返し調合不成立。UI側の予防制御（ボタン非活性化）に対する二重の防御的実装。
- **系統排他による支配戦略防止（TC-101-07）** 🔵: 「聖」「金」両タグ2個+高品質無特性2個 → 両系統同数不発 → `activated_traits`空配列（高品質+両特性の両取りを許さない）。
- **Gランク非開示（TC-121-01）** 🟡: `reveal_level=0` → 特性一切不発、貢献度/報酬は品質のみに基づく値。
- **参照したEdgeケース**: EDGE-001, EDGE-101, EDGE-102
- **参照した設計文書**: dataflow.md「機能2」「エラーハンドリングフロー」

---

## 5. EARS要件・設計文書との対応関係

- **参照した機能要件**: REQ-105, REQ-106, REQ-107, REQ-108, REQ-109, REQ-110, REQ-111, REQ-112, REQ-115
- **参照した条件付き要件（段階的開示）**: REQ-121, REQ-122, REQ-124
- **参照したEdgeケース**: EDGE-001, EDGE-101, EDGE-102
- **参照した受け入れ基準**: TC-101-E01（EDGE-001ガード）、TC-101-07（系統排他の支配戦略防止）、TC-121-01（Gランク非開示）
- **参照した設計文書**:
  - **アーキテクチャ**: architecture.md「Godotアーキテクトレビュー Critical#1 / Warning#2」
  - **データフロー**: dataflow.md「機能2: 調合」5ステップシーケンス、「エラーハンドリングフロー」
  - **型定義**: data-model.md「CraftResult型」、features/alchemy/data 配下の型
  - **タスク**: TASK-0013〜0017（合成対象の個別純粋関数）

---

## 6. 申し送り事項の統合（TASK-0013〜0017からの持ち越し）★重要

🟡 *TASK-0018.md「注意事項」、各前提タスク申し送りより。本タスクが一貫方針で統合する*

1. **float→int変換ポイント** 🟡: `base_quality`/`final_quality`はfloatで保持。品質スコア（D=1〜S=5）とenum/int変換の境界を本統合で明確化する（TASK-0013/0016申し送り）。
2. **`trait_definitions`引数の追加** 🟡: TASK-0014が特性系統判定に必要としたため、オーケストレーター全体で受け渡す。
3. **`recipe`引数の追加** 🟡: TASK-0017（ValueCalculator）が基礎値算出に必要としたため追加。architecture.md概略シグネチャ（3引数）を実装上5引数へ拡張する判断。
4. **`rejected_category`の無効値表現** 🟡: 系統排他で却下なしの場合は空文字列 `""` とする（data-model.md明記なしのため暫定確定）。
5. **指定合致ボーナスの二重適用疑義** 🟡: 貢献度と報酬の両計算で指定合致ボーナスが重複適用されないことを、`calculate_contribution`/`calculate_reward`の呼び出し境界で確認する。

---

## 7. 品質判定

```
✅ 高品質
- 要件の曖昧さ: なし（5ステップ順序はdataflow.mdに明記）
- 入出力定義: 完全（引数5種・CraftResult 6フィールドを型付きで定義）
- 制約条件: 明確（純粋関数・オーケストレーション集約・配置）
- 実装可能性: 確実（前提TASK-0013〜0017が実装済み、合成のみ）
- 信頼性レベル分布: 🔵 主要構造（44%相当）／🟡 申し送り統合・EDGE-001表現（56%相当）／🔴 なし
```

**残る🟡は全て実装判断の統合に起因**（EDGE-001のnull表現、引数拡張、float→int境界、rejected_category無効値、ボーナス二重適用疑義）であり、6章で方針を確定済み。

---

## 参照ファイル

- `docs/tasks/atelier-alchemy-core/TASK-0018.md` — タスク定義
- `docs/spec/atelier-alchemy-core/requirements.md` — REQ-105〜112, REQ-115, REQ-121〜124
- `docs/spec/atelier-alchemy-core/acceptance-criteria.md` — TC-101-E01, TC-101-07, TC-121-01
- `docs/design/atelier-alchemy-core/dataflow.md` — 機能2: 調合（5ステップ）
- `docs/design/atelier-alchemy-core/architecture.md` — Godotアーキテクトレビュー対応
- `docs/design/atelier-alchemy-core/data-model.md` — CraftResult型
- `docs/implements/atelier-alchemy-core/TASK-0018/note.md` — TDD開発コンテキストノート
