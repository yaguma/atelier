# TASK-0019: GameState.craft()連携実装 - TDD要件定義書

- **機能名**: GameState.craft()連携実装（game-state-craft）
- **タスクID**: TASK-0019
- **要件名**: atelier-alchemy-core
- **タスクタイプ**: TDD
- **フェーズ**: Phase 3 - 調合コアロジック（★核心）

---

## ⚠️ 現状確認（実装着手前の重要事実）

本要件整理にあたり、対象コードベースの現状を実地調査した結果を先頭に明記する。

- 🔵 **`autoload/game_state.gd` は未作成である**。`autoload/` 配下には `rng_service.gd` のみ存在し、`GameState` の Autoload スクリプトファイル自体が存在しない。したがって `GameState.craft()` は **未実装**であり、本タスクは `GameState` Autoload の新規作成と `craft()` メソッドの新規実装を含む。
- 🔵 **`project.godot` の `[autoload]` セクションに `GameState` は未登録**である（現在は `RngService` のみ登録）。本タスクで `GameState="*res://autoload/game_state.gd"` の登録が必要になる。
- 🔵 **依存する `AlchemyResolver.craft()` は実装済み**であり、配置は `features/alchemy/logic/alchemy_resolver.gd`（`class_name AlchemyResolver`, `extends RefCounted`, `static func craft(...)`）。
- 🔵 **`CraftResult` は実装済み**であり、配置は `features/alchemy/data/craft_result.gd`（`contribution: float`, `reward: float` フィールドを保持）。
- 🟡 **タスク定義書・note.md の配置記述との差異**: TASK-0019.md / note.md では `AlchemyResolver` を `core/alchemy_resolver.gd`、実装先を `autoload/game_state.gd` と記載しているが、実際のプロジェクトは Feature-Based Architecture を採用し `AlchemyResolver` は `features/alchemy/logic/` 配下にある。`GameState` の配置先は引き続き `autoload/game_state.gd` が妥当（Autoload であるため）。要件・実装時はこの実配置を正とする。

---

## 1. 機能の概要（EARS要件定義書・設計文書ベース）

- 🔵 **何をする機能か**: `GameState` Autoload（Imperative Shell）に、Functional Core である `AlchemyResolver.craft()` を呼び出す `craft(materials: Array[MaterialInstance]) -> void` メソッドを実装する。`GameState` は自身が保持する状態（`current_rank.trait_reveal_level`・`today_request`・`current_recipe`・`trait_definitions`）を引数として純粋関数へ渡し、戻り値 `CraftResult` を用いて在庫・ランクHP・ゴールドを更新し、`item_crafted` シグナルを発行する。
- 🔵 **どのような問題を解決するか**: 純粋関数（Functional Core）と副作用を持つ層（Imperative Shell）の境界を初めて実接続する。Autoload 参照を純粋関数側へ一切漏らさないことで、調合ロジックのテスタビリティと責務分離を担保する。
- 🔵 **想定されるユーザー**: 調合フェーズでプレイヤーが「調合実行」操作を行った際に呼び出される、内部システム（UI層→GameState→AlchemyResolver のデータフローの中核）。
- 🔵 **システム内での位置づけ**: 調合コアロジック（Phase 3）における Functional Core / Imperative Shell 境界の接続点。`GameState.craft()` は「状態読み取り→引数渡し→状態更新→シグナル発行」のみを担い、計算ロジックを一切持たない。
- **参照したEARS要件**: REQ-105〜REQ-112, REQ-115, REQ-121〜124
- **参照した設計文書**: architecture.md「Functional Core / Imperative Shell」「Warning#2対応」、data-model.md「GameState Autoloadの状態構造」

---

## 2. 入力・出力の仕様（EARS機能要件・型定義ベース）

### 入力

- 🔵 `materials: Array[MaterialInstance]` — 投入素材（0〜5枠）。空配列の場合は EDGE-001 ガード対象。
- 🔵 **GameState 内部状態から取得し `AlchemyResolver.craft()` に渡す引数**:
  - `current_rank.trait_reveal_level: int` — 特性開示レベル（0=Gランク非開示、1以上=開示）
  - `today_request` — 指定合致ボーナス判定用。🟡 `AlchemyResolver.craft()` の実シグネチャでは `daily_request` 引数が**型注釈なし（Duck typing）**であり、`DailyRequest` 型は未実装。TASK-0019.md の `today_request: DailyRequest` という型付き記述は現状のコードと差異がある。
  - `current_recipe: RecipeDefinition` — 貢献度/報酬の基礎値算出に使用（🟡 data-model.md 未記載、TASK-0018 のシグネチャ拡張に対応するため本タスクで GameState フィールドとして追加が必要）
  - `trait_definitions: Dictionary` — 特性系統判定用マスターデータ（ID→TraitDefinition）（🟡 同上）

### 出力

- 🔵 **戻り値**: `void`（`GameState.craft()` 自体は値を返さない）
- 🔵 **副作用による出力**:
  - `inventory` から投入素材を消費（`_consume_materials` 経由）
  - `rank_hp -= int(round(result.contribution))`
  - `gold += int(round(result.reward))`
  - `item_crafted(result)` シグナルを発行（ペイロードは `AlchemyResolver.craft()` の戻り値 `CraftResult`）
  - 🟡 `_consume_materials` 内で `inventory_updated` シグナルを発行（note.md 実装例より）

### 入出力の関係性・データフロー

- 🔵 `AlchemyResolver.craft()` の戻り値が `null`（EDGE-001）の場合、**状態変更・シグナル発行を一切行わず即 return** する。
- 🔵 戻り値が有効な `CraftResult` の場合のみ、素材消費→HP更新→ゴールド更新→シグナル発行を実行する。
- 🔵 `GameState.craft()` は品質計算・特性発現判定・系統排他制御・貢献度/報酬算出のロジックを一切持たず、すべて `AlchemyResolver.craft()` に委譲する。
- **参照したEARS要件**: REQ-105〜REQ-110（計算ロジック本体は TASK-0018 側）
- **参照した設計文書**: data-model.md「GameState.craft() 定義」、dataflow.md「機能2: 調合」、`features/alchemy/logic/alchemy_resolver.gd` の実シグネチャ

---

## 3. 制約条件（EARS非機能要件・アーキテクチャ設計ベース）

- 🔵 **アーキテクチャ制約（最重要）**: `GameState.craft()`（Imperative Shell）は計算ロジックを一切持たない。品質計算・特性発現判定・系統排他・貢献度/報酬算出はすべて `AlchemyResolver.craft()`（Functional Core, `static func`）に委譲する。Autoload 参照を純粋関数側へ漏らさず、状態は引数として渡す（architecture.md「Warning#2対応」）。
- 🔵 **型安全性**: GDScript の型注釈を変数・引数・戻り値に付与する（note.md 開発ルール）。
- 🟡 **パフォーマンス制約**: マスターデータ（`trait_definitions`）は起動時に一括読み込み済みとし、実行中の動的ファイルI/Oを避ける（architecture.md「非機能要件の実現方法／パフォーマンス」）。`current_recipe`・`trait_definitions` の実ロード処理は別タスク（マスターデータ管理、Phase 1/2）に依存する可能性がある。
- 🔵 **テスト制約**: GUT（Godot Unit Test v9.6.1）でテスト。ユニットは `tests/unit/autoload/game_state_test.gd`、統合は `tests/integration/autoload/game_state_craft_integration_test.gd` に配置。
- 🔵 **配置制約**: `GameState` は Autoload であるため `autoload/game_state.gd` に配置し、`project.godot` の `[autoload]` に登録する。
- **参照したEARS要件**: NFR（パフォーマンス: マスターデータ一括読み込み）
- **参照した設計文書**: architecture.md「Functional Core / Imperative Shell」「Warning#2対応」「パフォーマンス」

---

## 4. 想定される使用例（Edgeケース・データフローベース）

### 基本的な使用パターン

- 🔵 **通常調合**: `inventory` に素材がある状態で、そのうち一部を `materials` として `GameState.craft(materials)` を呼び出す。`CraftResult` が返り、投入素材が `inventory` から消費され、`rank_hp`/`gold` が更新され、`item_crafted` が発行される。

### エッジケース

- 🔵 **EDGE-001（投入枠が空）**: `materials = []` で `GameState.craft([])` を呼ぶと `AlchemyResolver.craft()` が `null` を返す。このとき `inventory`・`rank_hp`・`gold` はいずれも変化せず、`item_crafted` シグナルも発行されない（TC-101-E01）。

### エラーケース

- 🟡 `current_recipe` や `trait_definitions` が未ロード（`null`/空）の状態で `craft()` を呼んだ場合の挙動は、本タスクのスコープでは「起動時に一括読み込み済み」を前提とするため詳細規定外。実ロード処理の依存関係は別タスクで再確認が必要（申し送り事項）。

### データフロー上の申し送り（重要）

- 🟡 **dataflow.md と data-model.md の不整合**: dataflow.md「機能2: 調合」では `GameState` は `consume_materials(投入素材) + add_completed_item(完成品)` のみを行い、`rank_hp`/`gold` 更新は別の「機能3: ギルド納品」シーケンス（`item_crafted` シグナル起点に `DeliveryCalculator.check_daily_request_match()` 経由）で行う設計。一方 data-model.md の `craft()` 定義は `craft()` 単体で `rank_hp`/`gold` まで更新すると明記。本タスクはタスク定義（data-model.md の記述）に従い後者を実装するが、両者は矛盾する。**Phase 4（guild機能）着手前に、rank_hp/gold 更新の責務を craft() 単体で完結させるか guild 機能の別ステップに委ねるかを設計レベルで確定させる必要がある**（TASK-0017 の「指定合致ボーナス二重適用疑義」とも関連）。

- **参照したEARS要件**: EDGE-001（TC-101-E01）
- **参照した設計文書**: dataflow.md「機能2: 調合」「機能3: ギルド納品」、data-model.md「GameState.craft() 定義」

---

## 5. EARS要件・設計文書との対応関係

- **参照したユーザストーリー**: 調合フェーズにおける「素材を調合して完成品を得る」体験
- **参照した機能要件**: REQ-105〜REQ-112, REQ-115, REQ-121〜124
- **参照した非機能要件**: NFR（マスターデータ一括読み込み方針）
- **参照したEdgeケース**: EDGE-001（投入枠が空 → null）
- **参照した受け入れ基準**: TC-101-E01（EDGE-001時のシグナル発行なし）、在庫消費・rank_hp/gold更新・シグナル発行の一貫性
- **参照した設計文書**:
  - **アーキテクチャ**: architecture.md「Functional Core / Imperative Shell」「Warning#2対応」「パフォーマンス」
  - **データフロー**: dataflow.md「機能2: 調合」「機能3: ギルド納品」
  - **データモデル**: data-model.md「GameState Autoloadの状態構造」「craft() 定義」
  - **実コード**: `features/alchemy/logic/alchemy_resolver.gd`（craft シグネチャ）、`features/alchemy/data/craft_result.gd`（CraftResult 構造）

---

## 6. テストケース要求（要件段階の整理）

| # | テストケース | 種別 | 信頼性 |
|---|------------|------|--------|
| TC-1 | EDGE-001時に状態変更・シグナル発行が一切発生しない | 単体 | 🔵 |
| TC-2 | 調合成功時に投入素材が inventory から消費される | 単体 | 🔵 |
| TC-3 | rank_hp・gold が CraftResult.contribution/reward に応じ更新される | 単体 | 🔵 |
| TC-4 | item_crafted シグナルが CraftResult とともに1回発行される | 単体 | 🔵 |
| TC-5 | GameState.craft() が計算ロジックを持たない（委譲のみ）ことの構造的確認 | 単体 | 🟡 |
| 統合 | TASK-0018〜0019 を通した調合フロー全体の一貫性 | 統合 | 🔵 |

---

## 7. 申し送り事項（Phase 4 着手前に確定が必要な既知課題）

1. 🟡 **rank_hp/gold 更新責務の不整合（最重要）**: dataflow.md（機能3で更新）と data-model.md（craft() 単体で更新）が矛盾。本タスクは data-model.md 準拠で実装するが、Phase 4 着手前に設計確定が必要。
2. 🟡 **`current_recipe`・`trait_definitions` の読み込みタイミング**: data-model.md 未記載のフィールド。本タスクは「起動時に一括読み込み済み」を前提とするが、実ロード処理（`.tres` 読み込み）は別タスク依存。GameState フィールドとしての保持方法・初期化タイミングの確定が必要。
3. 🟡 **`today_request`/`daily_request` の型**: `AlchemyResolver.craft()` は現状 `daily_request` を型注釈なし（Duck typing）で受ける。`DailyRequest` 型は未実装。タスク定義の `today_request: DailyRequest` という型付き記述と実コードに差異があるため、`DailyRequest` 型実装時に整合を取る必要がある。
4. 🟡 **配置記述の差異**: タスク定義書・note.md は `AlchemyResolver` を `core/` 配置と記載するが、実配置は `features/alchemy/logic/`。要件・実装は実配置を正とする。

---

## 品質判定

- **要件の曖昧さ**: 基本契約（引数渡し・戻り値活用・状態更新・シグナル発行）は data-model.md に明記され曖昧さなし。
- **入出力定義**: 完全（実コードのシグネチャで検証済み）。
- **制約条件**: 明確（Functional Core / Imperative Shell 境界）。
- **実装可能性**: 確実（依存する AlchemyResolver・CraftResult は実装済み）。ただし GameState 自体は新規作成が必要。
- **信頼性レベル分布**: 🔵 多数（基本契約）、🟡 数件（フィールド追加・責務分担・型・配置差異の申し送り）、🔴 なし。

**総合判定**: ✅ 高品質（申し送り事項3点＋配置差異1点を明示的に記録済み。実装は data-model.md 準拠で進行可能）。
