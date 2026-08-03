# TASK-0014: TraitActivation.resolve_activated_traits 要件定義書

**機能名**: 特性発現判定ロジック（trait-activation）
**タスクID**: TASK-0014
**要件名**: atelier-alchemy-core
**タスクタイプ**: TDD
**フェーズ**: Phase 3 - 調合コアロジック（★核心）
**出力ファイル**: `docs/implements/atelier-alchemy-core/TASK-0014/trait-activation-requirements.md`

---

## 1. 機能の概要（EARS要件定義書・設計文書ベース）

- 🔵 **何をする機能か**: 投入された素材群から「どの特性タグが完成品に発現するか」を判定する閾値発現ロジック。同一の特性タグを持つ素材が2個以上ある場合にのみ、その特性を発現候補として返す純粋関数。
- 🔵 **どのような問題を解決するか**: 錬金術の調合において、素材の組み合わせによって完成品の特性（貢献度系/報酬系）が発現するかどうかを、決定論的に判定する。プレイヤーが素材構成を工夫する戦略性の土台を提供する。
- 🔵 **想定されるユーザー**: 調合オーケストレーター（TASK-0018 `AlchemyResolver.craft`）が本関数を呼び出す。最終的にはプレイヤーの調合行動の結果として発現特性が算出される。
- 🔵 **システム内での位置づけ**: Functional Core（`features/alchemy/logic/`）に配置される純粋関数。副作用を持たず、`GameState`・Autoloadを一切参照しない。Imperative Shell（TASK-0019 GameState）が段階的開示レベルを解決して引数として渡す。
- 🔵 **責務の境界**: 本関数は「閾値を満たしたか」の判定、系統内の複数同時発現、段階的開示フィルタまでを扱う。貢献度系/報酬系をまたぐ排他制御（REQ-115）は責務外で、後続のTASK-0015（`resolve_category_conflict`）が担う。

- **参照したEARS要件**: REQ-106, REQ-112, REQ-121, REQ-122, REQ-123, REQ-124
- **参照した設計文書**: architecture.md「Functional Core（logic/）」「Godotアーキテクトレビュー Critical#1対応」、dataflow.md「機能2 特性発現判定」ステップ2

---

## 2. 入力・出力の仕様（EARS機能要件・型定義ベース）

### 入力パラメータ 🔵

| 引数 | 型 | 説明 | 制約・信頼性 |
|------|-----|------|------|
| `materials` | `Array[MaterialInstance]` | 投入素材の配列。各要素は`traits: Array[StringName]`（特性タグID配列）を持つ | 🔵 空配列可。通常は投入枠数分（例: 4枠） |
| `reveal_level` | `int` | 段階的開示レベル。呼び出し側が`current_rank.trait_reveal_level`を解決して渡す | 🔵 `0`=Gランク相当, `>=1`=Eランク以降 |
| `trait_definitions` | `Dictionary` | `StringName`(trait id) → `TraitDefinition` のマスターデータ参照 | 🟡 architecture.mdの2引数シグネチャに対する追加パラメータ（本タスクの実装判断） |

### 出力値 🔵

| 型 | 説明 | 信頼性 |
|-----|------|------|
| `Array[TraitDefinition]` | 発現候補となる特性定義の配列。閾値を満たしフィルタを通過した特性のみを含む。該当なしの場合は空配列 | 🔵 REQ-106, REQ-112 |

### 入出力の関係性 🔵

- 各素材の`traits`配列に含まれる特性タグIDの**出現回数**（＝そのタグを持つ素材の個数）を集計する。
- 出現回数が**2以上**のタグIDのみを候補とする（REQ-106）。1個のみでは不発。
- 候補タグIDを`trait_definitions`で`TraitDefinition`に解決する。
- `reveal_level`によるフィルタを適用して最終結果を返す。

### データフロー 🔵

- **参照**: dataflow.md「機能2 特性発現判定」ステップ2。素材の`traits`集計 → 閾値判定 → 段階的開示フィルタ → `TraitDefinition`配列を返す。

- **参照したEARS要件**: REQ-106（2個以上で発現）, REQ-112（系統内複数同時発現）
- **参照した設計文書**: data-model.md（`MaterialInstance.traits: Array[StringName]`, `TraitDefinition.category: CONTRIBUTION/REWARD`）

---

## 3. 制約条件（EARS非機能要件・アーキテクチャ設計ベース）

- 🔵 **純粋関数制約（最重要）**: `GameState`・Autoloadを一切参照しない。`Engine.get_main_loop()`経由でのAutoload参照、シングルトン経由の状態参照も禁止（Godotアーキテクトレビュー Critical#1対応）。段階的開示レベルは`reveal_level`引数で明示的に受け取る。
- 🔵 **決定論性**: 同じ入力に対して常に同じ出力を返す。乱数・外部状態への依存なし。
- 🔵 **アーキテクチャ制約**: Functional Core（`features/alchemy/logic/`）に配置。`class_name TraitActivation` / `extends RefCounted`、`static func`のみで構成（Nodeを継承しない）。
- 🔵 **言語・フレームワーク**: GDScript（Godot 4.7）。テストはGUT 9.6.1。
- 🟡 **段階的開示の暫定実装**: `reveal_level >= 2`（Dランク、REQ-123の追加特性解禁）は具体的な追加特性がTBDのため、本タスクでは`reveal_level >= 1`と同じ扱い（追加フィルタなし）とする。REQ-123確定後に`min_rank_to_reveal`とint型`reveal_level`の変換ロジックの再設計が必要（申し送り事項）。

- **参照したEARS要件**: REQ-121（Gランク非発現）, REQ-122（Eランク解禁）, REQ-123/124（段階的開示・TBD）
- **参照した設計文書**: architecture.md「Godotアーキテクトレビュー Critical#1対応」「非機能要件の実現方法／ユーザビリティ（二重の安全策）」

---

## 4. 想定される使用例（Edgeケース・データフローベース）

### 基本的な使用パターン 🔵

- **同一特性2個で発現**（TC-101-02）: 「聖」2個＋無特性2個、`reveal_level=1` → 「聖」1件を返す。
- **同一系統内で複数同時発現**（TC-101-06）: 「聖」2個＋「浄」2個、`reveal_level=1` → 「聖」「浄」の2件を返す（系統排他ではなく同時発現）。

### 境界値 🔵

- **ちょうど2個で発現側**（TC-101-B01）: 「癒」2個＋無特性2個 → 発現（`size() >= 1`）。1個との対比で境界が発現側に倒れることを確認。

### エッジケース・不発ケース 🔵

- **1個のみでは不発**（TC-101-03）: 「聖」1個＋無特性3個 → 空配列。
- **Gランクで一切発現しない**（TC-121-01）: 閾値を満たす構成でも`reveal_level=0` → 空配列（reveal_levelフィルタが最優先）。
- **二重の安全策**（TC-121-E01, TC-121-E01相当）: 🟡 本来入手不可の特性素材が万一投入枠に紛れ込んでも、`reveal_level=0`なら空配列。庭・ショップ側の入手制限漏れをロジック側で二重防止。

### データフロー 🔵

- **参照**: dataflow.md「機能2」。`AlchemyResolver.craft`（TASK-0018）が本関数を呼び、結果を系統排他制御（TASK-0015）に渡す。

- **参照したEARS要件**: REQ-106, REQ-112, REQ-121, REQ-122
- **参照した設計文書**: dataflow.md「機能2 特性発現判定」, acceptance-criteria.md（TC-101-02/03/06/B01, TC-121-01/02, TC-121-E01）

---

## 5. EARS要件・設計文書との対応関係

- **参照した機能要件**:
  - REQ-106 🔵 — 同一特性タグ2個以上で発現、1個では不発
  - REQ-112 🔵 — 同一系統内で複数特性が閾値を満たす場合すべて発現
  - REQ-121 🔵 — Gランク（reveal_level=0）では特性が一切発現しない（品質のみ評価）
  - REQ-122 🔵 — Eランク以降（reveal_level>=1）で貢献度系・報酬系が解禁
  - REQ-123 🟡 — Dランク以降（reveal_level>=2）で追加特性が解禁（TBD、暫定実装）
  - REQ-124 🟡 — 詳細な段階的開示ルール（TBD）
- **参照した非機能要件**: 純粋関数制約（Godotアーキテクトレビュー Critical#1）、二重の安全策（UI表示制御だけに依存しない）
- **参照した受け入れ基準**: TC-101-02, TC-101-03, TC-101-06, TC-101-B01, TC-121-01, TC-121-02（＋安全網としてTC-121-E01相当）
- **参照した設計文書**:
  - **アーキテクチャ**: architecture.md「Functional Core（logic/）」「Godotアーキテクトレビュー Critical#1対応」
  - **データフロー**: dataflow.md「機能2 特性発現判定」ステップ2
  - **データモデル**: data-model.md（`MaterialInstance.traits`, `TraitDefinition.category`）
- **実装ファイル**: `features/alchemy/logic/trait_activation.gd`
- **テストファイル**: `tests/unit/features/alchemy/trait_activation_test.gd`

---

## 6. 品質判定

### 信頼性レベル分布

| 信号 | 項目数 | 割合 |
|------|--------|------|
| 🔵 青 | 主要機能・入出力・テスト6ケース・純粋関数制約 | 約73% |
| 🟡 黄 | `trait_definitions`追加引数、REQ-123暫定実装、二重の安全策 | 約27% |
| 🔴 赤 | なし | 0% |

### 品質判定結果: ✅ 高品質

- **要件の曖昧さ**: なし（REQ-106/112/121/122で判定基準が明確）
- **入出力定義**: 完全（3引数の型・制約、戻り値の型を明記）
- **制約条件**: 明確（純粋関数制約が最重要制約として確定）
- **実装可能性**: 確実（アルゴリズムが4ステップで具体化済み）
- **残課題**: REQ-123の追加特性解禁は暫定実装（TBD）。REQ-123確定後の再設計を申し送り。

---

## 次のステップ

次のお勧めステップ: `/tsumiki:tdd-testcases atelier-alchemy-core TASK-0014` でテストケースの洗い出しを行います。
