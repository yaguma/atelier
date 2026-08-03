# TASK-0012 データモデル実装（RecipeDefinition / CraftResult）要件定義書

**機能名**: 調合データモデル（RecipeDefinition / CraftResult）
**タスクID**: TASK-0012
**要件名**: atelier-alchemy-core
**作成日**: 2026-07-22
**出力ファイル**: `docs/implements/atelier-alchemy-core/TASK-0012/craft-data-model-requirements.md`

**【信頼性レベル凡例】**:
- 🔵 **青信号**: EARS要件定義書・設計文書を参考にしてほぼ推測していない
- 🟡 **黄信号**: EARS要件定義書・設計文書から妥当な推測
- 🔴 **赤信号**: EARS要件定義書・設計文書にない推測

---

## 1. 機能の概要（EARS要件定義書・設計文書ベース）

- 🔵 **何をする機能か**: 調合レシピの静的定義 `RecipeDefinition`（`Resource`継承）と、調合処理 `AlchemyResolver.craft()`（TASK-0018）の戻り値型 `CraftResult`（`RefCounted`継承）を、GDScriptのデータモデルクラスとして定義する。
- 🔵 **どのような問題を解決するか**: `CraftResult` は品質ペナルティ適用前後の値（`base_quality`/`final_quality`）と系統排他制御（REQ-115）の不発側（`rejected_category`）を明示的に保持することで、調合結果の計算過程がブラックボックス化するのを防ぐ。これにより UI（TASK-0020）が「なぜこの結果になったか」を提示可能となる。旧設計にあった「支配戦略の温床・説明可能性の低さ」（REQ-111改訂の経緯）への対応である。
- 🔵 **想定されるユーザー**: 直接のエンドユーザーではなく、後続の純粋関数（TASK-0013〜0017）・Imperative Shell（TASK-0018/0019）・UI（TASK-0020）が利用するデータ構造。
- 🔵 **システム内での位置づけ**: Feature-Based Architecture の `features/alchemy/data/` 配下に置くデータレイヤー。`RecipeDefinition` は静的定義（エディタ保存対象）のため `Resource`、`CraftResult` は実行時ごとに生成される値オブジェクトのため `RefCounted` を継承する。
- **参照したEARS要件**: REQ-101, REQ-102, REQ-105, REQ-109, REQ-110, REQ-111, REQ-112, REQ-115
- **参照した設計文書**: `data-model.md`「レシピ定義（RecipeDefinition）」「調合結果（CraftResult）」

---

## 2. 入力・出力の仕様（EARS機能要件・GDScript型定義ベース）

> 本タスクはデータモデル（プロパティの保持と取得）が対象であり、計算ロジック（入力→変換→出力）は後続タスクの責務。ここでの「入力・出力」はプロパティの設定（set）と参照（get）を指す。

### 2.1 RecipeDefinition（`Resource`継承） 🔵

**実装ファイル**: `features/alchemy/data/recipe_definition.gd`

| プロパティ | 型 | デフォルト | 説明 | 要件 |
|---|---|---|---|---|
| `id` | `StringName` | （なし） | 一意識別子 | 🔵 |
| `display_name` | `String` | （なし） | UI表示名 | 🔵 |
| `slot_count` | `int` | `4` | 投入枠数の基本値。工房強化(+1)の加算はGameState側の責務 | 🔵 REQ-101 / 🟡 REQ-102 |
| `base_contribution` | `float` | `0.0` | 基礎貢献度。具体値はTBD | 🟡 REQ-109 |
| `base_reward` | `float` | `0.0` | 基礎報酬。具体値はTBD | 🟡 REQ-110 |

- 全プロパティは `@export` 付きで宣言する（エディタ／リソース保存対応）。🔵

### 2.2 CraftResult（`RefCounted`継承） 🔵

**実装ファイル**: `features/alchemy/data/craft_result.gd`

| プロパティ | 型 | デフォルト | 説明 | 要件 |
|---|---|---|---|---|
| `base_quality` | `MaterialInstance.Quality` | （なし） | ペナルティ適用前の基礎品質 | 🔵 REQ-105 |
| `final_quality` | `MaterialInstance.Quality` | （なし） | 品質ペナルティ・触媒補正適用後（下限D=1） | 🔵 REQ-111 |
| `activated_traits` | `Array[TraitDefinition]` | `[]` | 最終的に発現した特性一覧（同一系統内の複数同時発現を含む） | 🔵 REQ-106, REQ-112 |
| `rejected_category` | `TraitDefinition.Category` | （型定義のみ固定） | 系統排他制御で不発とされた側（不発なしは無効値） | 🔵 REQ-115 |
| `contribution` | `float` | `0.0` | 最終貢献度 | 🔵 REQ-109 |
| `reward` | `float` | `0.0` | 最終報酬 | 🔵 REQ-110 |

- **入出力の関係性**: 設定した値がそのまま取得できること（データ保持の正当性）を検証対象とする。計算式（REQ-109〜112の変換）は本タスク対象外。🔵
- **データフロー**: `GameState.craft()` → `AlchemyResolver.craft()`（純粋関数）が `CraftResult` を生成して返却、`GameState` が結果を用いて inventory/rank_hp/gold を更新し `item_crafted` を emit する（TASK-0018/0019）。本タスクは型の器のみ用意する。🔵
- **参照したEARS要件**: REQ-101, REQ-105, REQ-109, REQ-110, REQ-111, REQ-112, REQ-115
- **参照した設計文書**: `data-model.md`「レシピ定義」「調合結果」、`material_instance.gd`（`Quality` enum）、`trait_definition.gd`（`Category` enum）

---

## 3. 制約条件（EARS非機能要件・アーキテクチャ設計ベース）

- 🔵 **アーキテクチャ制約**: 1スクリプト1 `class_name` 原則。`RecipeDefinition`/`CraftResult` を別ファイルに分離する。Feature-Based Architecture の `features/alchemy/data/` に配置。
- 🔵 **型安全性**: 全変数・関数に型ヒントを明示。`Array[TraitDefinition]` の typed Array を用いる。`any` 相当（無型）を用いない。
- 🔵 **Resource/RefCounted の使い分け**: 静的定義（保存対象）は `Resource`、実行時生成の値オブジェクトは `RefCounted`。`RecipeDefinition`→`Resource`、`CraftResult`→`RefCounted`。
- 🔵 **依存**: `CraftResult` は `MaterialInstance.Quality` および `TraitDefinition.Category`（TASK-0011で実装済み）に依存する。
- 🟡 **`rejected_category` の無効値表現は本タスクで確定しない**: GDScriptのenumには `null` 相当がないため「不発なし」を表す無効値の具体表現（案A: `Category.NONE` 追加 / 案B: `has_rejected_category: bool` 併設）はTASK-0015で確定・実装する。本タスクは型定義（`TraitDefinition.Category` 型のフィールド）のみを固定し、無効値に依存するテストは書かない。
- 🟡 **数値TBD**: `base_contribution`/`base_reward` の具体値のバランス妥当性は本タスクで検証しない（`balance-tuning-cycle` で確定）。
- 🔵 **パフォーマンス/セキュリティ**: 特筆すべき要件なし（純粋なデータ構造定義のため）。
- **参照したEARS要件**: REQ-101, REQ-102, REQ-109, REQ-110, REQ-115
- **参照した設計文書**: `data-model.md`、`note.md`（開発ルール／注意事項）、`TASK-0011`（先行実装 TraitDefinition/MaterialInstance）

---

## 4. 想定される使用例（Edgeケース・データフローベース）

- 🔵 **基本パターン1（RecipeDefinition デフォルト）**: `slot_count` 未設定で生成 → `4` が取得できる（REQ-101）。
- 🟡 **基本パターン2（RecipeDefinition 設定・取得）**: `base_contribution=10.0`, `base_reward=20.0` を設定 → そのまま取得できる（値の妥当性ではなく保持動作を検証。REQ-109/110）。
- 🔵 **基本パターン3（CraftResult 全フィールド保持）**: `base_quality=A`, `final_quality=B`, `activated_traits=[trait_a, trait_b]`, `contribution=15.0`, `reward=30.0` を設定 → 各値が取得でき `activated_traits.size() == 2`（REQ-112の同時発現に対応した複数保持）。
- 🔵 **基本パターン4（CraftResult デフォルト）**: `activated_traits` 未設定で生成 → 空配列（`size() == 0`）。
- 🟡 **エッジケース（本タスク対象外）**: `rejected_category` の「不発なし」表現、`final_quality` の下限D=1クランプ、品質ペナルティ加算（REQ-111/112）はいずれも計算ロジック側（TASK-0015/0017）で扱うため、本タスクのテストでは検証しない。
- **参照したEARS要件**: REQ-101, REQ-109, REQ-110, REQ-112
- **参照した設計文書**: `data-model.md`、`TASK-0012.md`「単体テスト要件」

---

## 5. EARS要件・設計文書との対応関係

- **参照したユーザストーリー**: （調合主軸モデルの中核データ構造。特定の単一ストーリーではなく調合フロー全体に対応）
- **参照した機能要件**:
  - REQ-101（投入枠初期値4）→ `RecipeDefinition.slot_count = 4`
  - REQ-102（工房強化で+1、最大5枠）→ `slot_count` は基本値、加算はGameState側の責務
  - REQ-105（基礎品質＝素材平均）→ `CraftResult.base_quality`
  - REQ-109（貢献度算出）→ `RecipeDefinition.base_contribution`, `CraftResult.contribution`
  - REQ-110（報酬算出）→ `RecipeDefinition.base_reward`, `CraftResult.reward`
  - REQ-111（最終品質＝ペナルティ後、下限D=1）→ `CraftResult.final_quality`
  - REQ-112（同一系統内の複数同時発現）→ `CraftResult.activated_traits: Array[TraitDefinition]`
  - REQ-115（系統排他制御の不発側記録）→ `CraftResult.rejected_category`
- **参照した非機能要件**: （データモデル定義に直接紐づくNFRなし。アーキテクチャ制約はarchitecture.md／noteの開発ルールに準拠）
- **参照したEdgeケース**: EDGE-102（全枠同一特性で品質が低下）は `final_quality`/`base_quality` 分離設計の妥当性根拠。本タスクでは検証対象外。
- **参照した受け入れ基準**: TASK-0012「完了条件」および「単体テスト要件」テストケース1〜4。
- **参照した設計文書**:
  - **データモデル**: `data-model.md`「レシピ定義（RecipeDefinition）」「調合結果（CraftResult）」
  - **アーキテクチャ**: `architecture.md`（Feature-Based / Functional Core・Imperative Shell分離、`GameState.craft()`→`AlchemyResolver.craft()`）
  - **先行実装**: `features/alchemy/data/trait_definition.gd`（`Category` enum）、`features/alchemy/data/material_instance.gd`（`Quality` enum）

---

## 品質判定

✅ **高品質**
- 要件の曖昧さ: なし（`rejected_category` の無効値表現は意図的にTASK-0015へ委譲、本タスクは型定義のみと明確化）
- 入出力定義: 完全（全プロパティの型・デフォルト・要件対応を表形式で明示）
- 制約条件: 明確（Resource/RefCounted使い分け、型安全性、依存関係、委譲範囲）
- 実装可能性: 確実（data-model.md記載の型定義をそのまま実装）
- 信頼性レベル分布: 🔵 青信号 多数（コア型定義）、🟡 黄信号は「TBD数値」「無効値表現の委譲」のみ、🔴 なし

---

## 次のステップ

次のお勧めステップ: `/tsumiki:tdd-testcases atelier-alchemy-core TASK-0012` でテストケースの洗い出しを行います。
