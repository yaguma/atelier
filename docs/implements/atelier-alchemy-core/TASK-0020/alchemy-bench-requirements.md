# TASK-0020 AlchemyBench UI 要件定義書

**機能名**: AlchemyBench UI（調合台画面）
**タスクID**: TASK-0020
**要件名**: atelier-alchemy-core
**タスクタイプ**: TDD
**フェーズ**: Phase 3 - 調合コアロジック（★核心）
**作成日**: 2026-08-03
**出力ファイル**: `docs/implements/atelier-alchemy-core/TASK-0020/alchemy-bench-requirements.md`

---

## 0. 前提確認結果（GameState 実装状況の突き合わせ）

本タスク着手時点で `atelier-godot/autoload/game_state.gd`（TASK-0019実装済み）を精査した結果、以下の差分を確認した。**本タスクで GameState への追加実装が必要である。**

| 参照名 | data-model.md/dataflow.md での記載 | game_state.gd（TASK-0019時点）の実際 | 本タスクでの扱い |
|--------|--------------------|------------------------|------------------|
| `inventory: Array[MaterialInstance]` | フィールド定義あり | ✅ **実装済み**（79行目 `var inventory: Array[MaterialInstance] = []`） | 既存を利用 |
| `get_inventory() -> Array[MaterialInstance]` | dataflow.mdシーケンス図に呼び出しあり | ❌ **未実装**（メソッドが存在しない） | 🟡 **本タスクで薄いアクセサを追加**（`inventory`を返すのみ） |
| `recipe_slot_count: int`（初期4） | data-model.md にフィールド定義あり | ❌ **未実装**（フィールドが存在しない） | 🔵 **本タスクで追加**（初期値4、`RecipeDefinition.slot_count`との集約はTASK-0034/0019と要突合） |
| `craft(materials) -> void` | シグナル発行まで完結 | ✅ **実装済み**（110行目〜） | 既存を利用 |
| `item_crafted(result: CraftResult)` signal | シグナル定義あり | ✅ **実装済み**（64行目） | 既存を購読 |
| `inventory_updated()` signal | note.md実装例 | ✅ **実装済み**（67行目） | 既存を購読 |

**⚠️ 重要な申し送り**: `recipe_slot_count` と `get_inventory()` は TASK-0019 時点で未実装であるため、本タスク（TASK-0020）で `atelier-godot/autoload/game_state.gd` に追加実装する。追加は「初期値4のフィールド1つ」「`inventory`を返す薄いアクセサ1つ」であり、いずれも計算ロジックを含まないため Imperative Shell/Functional Core の境界を侵さない。🔵 *data-model.md `GameState.recipe_slot_count`（初期値4、恒久投資で+1）・dataflow.md `UI->>GS: get_inventory()` より*

---

## 1. 機能の概要（EARS要件定義書・設計文書ベース）

- 🔵 **何をする機能か**: 調合台画面（`AlchemyBench: Control`）を提供し、プレイヤーが在庫の素材を限られた投入枠（初期4枠）に配置・解除し、調合実行ボタンで `GameState.craft()` を呼び出し、`item_crafted` シグナルで受け取った結果（`CraftResult`）を表示する UI。*TASK-0020.md タスク概要・dataflow.md「機能2: 調合」シーケンス図より*
- 🔵 **どのような問題を解決するか**: ユーザストーリー2.1「限られた投入枠に、在庫の素材から品質重視か特性重視かを選んで入れる」・2.2「貢献度向き/報酬向きを使い分ける」という調合の意思決定体験を、画面操作として成立させる。*user-stories.md 2.1, 2.2 より*
- 🔵 **想定されるユーザー**: 錬金術ギルドで調合を行うプレイヤー。*user-stories.md より*
- 🔵 **システム内での位置づけ**: Imperative Shell（UI層）に属し、Functional Core（`AlchemyResolver.craft()`）を直接呼ばず、Imperative Shell の `GameState.craft()` を単一エントリポイントとして経由する。**UI はビジネスロジックを一切持たない（Warning#2対応）**。*architecture.md「Godotアーキテクトレビュー Warning#2対応」より*
- **参照したEARS要件**: REQ-101, REQ-102, REQ-103, REQ-104, EDGE-001
- **参照した設計文書**: architecture.md「Warning#2対応」、dataflow.md「機能2: 調合」

---

## 2. 入力・出力の仕様（EARS機能要件・型定義ベース）

### 入力

- 🔵 **在庫素材**: `GameState.get_inventory() -> Array[MaterialInstance]`。各素材は品質値（D〜S、スコア1〜5相当・REQ-103）と特性タグ0〜2個（REQ-104）を持つ。*REQ-103, REQ-104, dataflow.md*
- 🔵 **投入枠数**: `GameState.recipe_slot_count: int`（初期4・REQ-101、工房強化後5・REQ-102）。`_build_slots(GameState.recipe_slot_count)` で枠数分の `MaterialSlot` を生成。*REQ-101, REQ-102, data-model.md*
- 🟡 **投入操作**: プレイヤーが在庫アイテムを投入枠（`MaterialSlot`）へ配置/解除するトグル操作。内部状態 `_placed_materials: Array[MaterialInstance]` に反映。*TASK-0020.md 実装詳細2（操作方式は妥当な推測）*

### 出力

- 🔵 **調合実行**: `GameState.craft(_placed_materials)` を呼び出す。**投入枠の `MaterialInstance` 配列を順序・個数を含め改変せずそのまま渡す**（UI側で加工・計算しない）。*TASK-0020.md 完了条件・Warning#2*
- 🔵 **結果表示**: `item_crafted(result: CraftResult)` シグナルを購読し、`result` の `final_quality` / `activated_traits` / `rejected_category` / `contribution` / `reward` を**そのまま結果表示に反映**（UI側で再計算・補正しない）。*data-model.md CraftResult定義・dataflow.md*
- 🟡 **ボタン活性状態**: 投入枠が1つも埋まっていなければ `craft_button.disabled = true`、1つ以上で `false`。*TC-101-E01「実行不可の状態」より妥当な推測*

### CraftResult 型（TASK-0019実装済み）

| フィールド | 型 | 意味 |
|-----------|-----|------|
| `base_quality` | int | 基本品質 |
| `final_quality` | int | 最終品質 |
| `activated_traits` | Array[String] | 発現特性 |
| `rejected_category` | String | 不発カテゴリ |
| `contribution` | int | 貢献度 |
| `reward` | int | 報酬額 |

- **参照したEARS要件**: REQ-101, REQ-102, REQ-103, REQ-104
- **参照した設計文書**: data-model.md（CraftResult/GameState）、dataflow.md「機能2: 調合」

---

## 3. 制約条件（EARS非機能要件・アーキテクチャ設計ベース）

- 🔵 **アーキテクチャ制約（最重要・Warning#2）**: `alchemy_bench.gd` は品質計算・特性発現判定・系統排他・貢献度/報酬算出のロジックを**一切持たない**。UI は「在庫参照 → 投入枠選択操作 → `GameState.craft()` 呼び出し → `item_crafted` 購読 → 結果表示」のみ。旧設計（UIが `QualityCalculator`→`TraitActivation`→`ValueCalculator` を個別呼び出し）はWarning#2で否定済み。*architecture.md「Warning#2対応」*
- 🔵 **EDGE-001**: 投入枠に素材が1つも入っていない状態で調合を成立させてはならない。UI側はボタン非活性化で防ぎ、`GameState.craft([])` を呼ばせない。`GameState.craft()`側の防御（`AlchemyResolver.craft()`がnull返却時に無副作用）と合わせた二重の安全策。*EDGE-001, TC-101-E01*
- 🔵 **同期処理（NFR-101）**: ローカル環境で完結し外部通信なし。`craft()`呼び出しから`item_crafted`受信までは同一フレーム内で完結。非同期ローディング表示は不要。*NFR-101, TASK-0020.md UI/UX要件*
- 🟡 **アクセシビリティ**: 品質（D〜S）はアイコン+テキスト併記で色のみに依存しない。*design-guide.md「明瞭さ」*
- 🟡 **段階的開示との責務分離**: Gランク非表示（REQ-121, NFR-201）・Eランク以降解禁（REQ-122）は本タスクのスコープ外（TASK-0037）。本タスクは特性情報表示の**土台（データバインディングの受け皿）**のみ用意し、表示部分を独立関数/ノードとして分離する（TASK-0037が追記しやすいように）。*TASK-0020.md 注意事項*
- 🟡 **Godot継承**: `AlchemyBench`・`MaterialSlot` はともに `Control` 継承。BaseComponent相当の共通基盤はGodot版に未存在のため、素直なシーンスクリプトとして実装。*TASK-0020.md 実装詳細1*
- 🔴 **Autoload参照方法の未確定**: TASK-0019 note.md で `GameState` を `project.godot` の `[autoload]` に登録していない（`class_name GameState` との識別子衝突回避のため）。UI層が `GameState` をシングルトン参照する必要が生じた本タスク時点で、登録方法（別名Autoload登録 or DIコンテナ経由の参照渡し）を設計判断する必要がある。テストは `preload().new()` + `add_child_autofree()` 方式との整合を取ること。*TASK-0019 game_state.gd 44-59行目の設計判断より*

- **参照したEARS要件**: EDGE-001, NFR-101, NFR-201, REQ-121, REQ-122
- **参照した設計文書**: architecture.md「Warning#2対応」、data-model.md、design-guide.md

---

## 4. 想定される使用例（EARS Edgeケース・データフローベース）

- 🔵 **基本フロー（正常系）**: 画面表示 → `get_inventory()`で在庫一覧表示 → `recipe_slot_count`分の投入枠生成 → プレイヤーが素材を枠に配置 → ボタン活性化 → 調合実行 → `craft(_placed_materials)` → `item_crafted`受信 → 結果表示。*dataflow.md「機能2: 調合」*
- 🟡 **枠数拡張（REQ-102）**: `recipe_slot_count`が5に拡張された状態で`_build_slots()`を呼ぶと5個の`MaterialSlot`が生成される。*REQ-102, TC-3*
- 🟡 **重複配置防止**: 同一在庫アイテム（`MaterialInstance.id`で一意）を複数枠へ重複配置できない。`_placed_materials`内に同一`id`が重複しないことを保証（拒否 or 元枠から移動、どちらでもよい）。*個体管理から導かれる妥当なUI制約*
- 🔵 **EDGE-001（空投入）**: 投入枠が全て空 → ボタン非活性 → 調合実行不可。モーダルエラーは表示しない。*EDGE-001, TC-101-E01*
- 🟡 **特性不発表示**: `CraftResult.activated_traits`・`rejected_category`をそのまま反映するのみ。「なぜ不発か」の追加説明ロジックは持たない（Warning#2の境界を結果表示にも一貫）。*TASK-0020.md UI/UX要件*

- **参照したEARS要件**: EDGE-001, REQ-101, REQ-102
- **参照した設計文書**: dataflow.md「機能2: 調合」シーケンス図

---

## 5. EARS要件・設計文書との対応関係

- **参照したユーザストーリー**: 2.1（投入枠への品質重視/特性重視の配置）、2.2（貢献度向き/報酬向きの使い分け）
- **参照した機能要件**: REQ-101（投入枠初期4）、REQ-102（工房強化で+1=5枠）、REQ-103（品質値D〜S）、REQ-104（特性タグ0〜2個）
- **参照した非機能要件**: NFR-101（ローカル完結・同期）、NFR-201（段階的開示・スコープ外）
- **参照したEdgeケース**: EDGE-001（空投入で調合不成立）
- **参照した受け入れ基準**: TC-101-E01（投入枠空→実行不可）
- **参照した設計文書**:
  - **アーキテクチャ**: architecture.md「Godotアーキテクトレビュー Warning#2対応」（UIはビジネスロジックを持たない）
  - **データフロー**: dataflow.md「機能2: 調合」シーケンス図（`get_inventory()` / `craft()` / `item_crafted`）
  - **データモデル**: data-model.md（`GameState.recipe_slot_count`初期4、`inventory`、`CraftResult`、`item_crafted`シグナル）
  - **前提実装**: `atelier-godot/autoload/game_state.gd`（TASK-0019: `craft()`/`item_crafted`/`inventory_updated`実装済み。`recipe_slot_count`/`get_inventory()`は本タスクで追加）

---

## 6. 実装対象ファイル

| ファイル | 種別 | 責務 |
|---------|------|------|
| `atelier-godot/features/alchemy/ui/alchemy_bench.gd` | 新規（Control） | 投入枠管理・在庫表示・craft呼び出し・結果表示・シグナル購読 |
| `atelier-godot/features/alchemy/ui/alchemy_bench.tscn` | 新規（シーン） | SlotContainer / InventoryList / CraftButton / ResultPanel |
| `atelier-godot/features/alchemy/ui/material_slot.gd` | 新規（Control） | 投入枠1つの状態管理（place/clear/is_empty） |
| `atelier-godot/features/alchemy/ui/material_slot.tscn` | 新規（シーン） | 品質表示・特性タグ表示エリア |
| `atelier-godot/autoload/game_state.gd` | **追記** | `recipe_slot_count: int = 4` フィールド、`get_inventory()` アクセサ追加 |
| `tests/unit/features/alchemy/alchemy_bench_test.gd` | 新規（テスト） | TC-1〜TC-6 |

---

## 7. テストケース概要（詳細は tdd-testcases フェーズで洗い出し）

| TC # | テストケース | 信頼度 | 対象 |
|------|---------|--------|------|
| TC-1 | 投入枠が空→ボタン非活性化（EDGE-001） | 🟡 | `_update_craft_button_state()` |
| TC-2 | 素材1個以上配置→ボタン活性化 | 🟡 | `_update_craft_button_state()` |
| TC-3 | 投入枠数が`GameState.recipe_slot_count`を参照 | 🔵 | `_build_slots()` |
| TC-4 | 同一素材の重複配置防止 | 🟡 | `place()` ロジック |
| TC-5 | 調合実行時、素材が加工されず`GameState.craft()`へ（Warning#2境界） | 🟡 | `_on_craft_pressed()` |
| TC-6 | `item_crafted`受信時、結果がそのまま表示（Warning#2回帰防止） | 🟡 | `_on_item_crafted()` |

---

## 8. 品質判定結果

```
⚠️ 要改善だが妥当:
- 要件の曖昧さ: UI操作方式（トグル配置・重複防止方針）に一部推測あり（🟡）
- 入出力定義: CraftResult型・craft()シグネチャ・シグナル契約は完全（🔵）
- 制約条件: Warning#2境界・EDGE-001は明確（🔵）。Autoload参照方法が未確定（🔴×1）
- 実装可能性: 確実（前提のGameState.craft()実装済み。追加はフィールド1+アクセサ1のみ）
- 信頼性レベル: 🔵多数（機能概要・入出力・核心制約）、🟡（UI細部）、🔴×1（Autoload参照方法）
```

**総評**: Warning#2境界・`item_crafted`契約・REQ-101/102の枠数はdataflow.md/data-model.mdに明記され🔵。UI実装細部（操作方式・重複防止）は設計文書に明記がなく🟡。**GameStateへの`recipe_slot_count`/`get_inventory()`追加が本タスクで必須**である点と、**Autoload参照方法（🔴）が未確定**である点を実装フェーズ着手前に確定すること。
