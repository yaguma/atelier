# TASK-0014 TDD開発コンテキストノート

**タスク**: TraitActivation.resolve_activated_traits実装（特性発現判定ロジック）  
**作成日**: 2026-07-31  
**前提**: TASK-0011（TraitDefinition）, TASK-0012（MaterialInstance等）, TASK-0013（品質計算）完了済み

---

## 1. 技術スタック

- **言語**: GDScript（Godot 4.7）
- **テストフレームワーク**: GUT (Godot Unit Test) 9.6.1
- **アーキテクチャ**: Functional Core（純粋関数のみ、GameState参照禁止）
- **参照元**: docs/tasks/atelier-alchemy-core/TASK-0014.md

### GUT設定
- **テストファイル配置**: `atelier-godot/tests/unit/features/alchemy/trait_activation_test.gd`
- **被テスト対象**: `atelier-godot/features/alchemy/logic/trait_activation.gd`

---

## 2. 開発ルール

### TDDサイクル（厳密順序）
1. **Red**: テストファイル作成 → テスト失敗確認
2. **Green**: 最小実装 → テスト成功確認
3. **Refactor**: リファクタリング → テスト維持確認
4. **Verify**: 全テストパス、型チェック、リント完了

### 純粋関数原則（Godotアーキテクトレビュー Critical#1対応）
- **副作用なし**: 外部状態参照禁止（GameState、Autoload不可）
- **入力のみに依存**: 引数以外の情報を使用しない
- **具体的な禁止事項**:
  - `Engine.get_main_loop()`経由でのAutoload参照
  - `GameState.current_rank`など全グローバル参照
  - シングルトンパターン経由の状態参照
- **段階的開示レベル（reveal_level）は明示的に引数で受け取る**
  - 呼び出し側（TASK-0019のGameState）が`current_rank.trait_reveal_level`を読み取って渡す
- **参照元**: docs/tasks/atelier-alchemy-core/TASK-0014.md「実装詳細」、docs/design/atelier-alchemy-core/architecture.md

---

## 3. 関連実装

### 既存クラス（TASK-0011, TASK-0012で実装済み）
- **MaterialInstance**: `features/alchemy/data/`
  - `traits: Array[StringName]` プロパティ（特性タグID）
  - `quality: int` プロパティ（D〜S）

- **TraitDefinition**: `features/alchemy/data/`
  - `id: StringName` — 特性ID（「聖」「浄」など）
  - `category: StringName` — 系統（CONTRIBUTION / REWARD）
  - `min_rank_to_reveal: String` — 解禁ランク（TASK-0011で設計）

### 実装ファイル
- **実装先**: `atelier-godot/features/alchemy/logic/trait_activation.gd`
- **クラス名**: `TraitActivation`（extends RefCounted）
- **関数シグネチャ**: 
  ```gdscript
  static func resolve_activated_traits(
      materials: Array[MaterialInstance],
      reveal_level: int,
      trait_definitions: Dictionary
  ) -> Array[TraitDefinition]
  ```

### 重要な設計判断
- **`trait_definitions: Dictionary` 引数について**:
  - architecture.mdのシグネチャ例には明記されていない追加パラメータ
  - `MaterialInstance.traits`はタグID（StringName）の配列であり、そのIDから`TraitDefinition.category`や解禁条件を判定するにはマスターデータの参照が不可欠
  - 本タスクの実装判断として追加
  - 参照元: docs/tasks/atelier-alchemy-core/TASK-0014.md の信頼性補足

### 後続タスク（特性発現判定の結果を使用）
- **TASK-0015**: resolve_category_conflict（系統排他制御）
- **TASK-0018**: AlchemyResolver.craft（オーケストレーター）
- **TASK-0019**: GameState（呼び出し側、reveal_levelの提供）

---

## 4. 設計文書

### 要件定義
- **参照元**: docs/spec/atelier-alchemy-core/requirements.md
- **REQ-106** 🔵: 「同一の特性タグを持つ素材が2個以上ある場合にのみ発現。1個のみでは不発」
- **REQ-112** 🔵: 「同一系統（CONTRIBUTION同士、REWARD同士）内で複数種類の特性がそれぞれ閾値を満たす場合、すべて発現候補として返す」
- **REQ-121** 🔵: 「Gランク（reveal_level=0）では特性が一切発現しない。品質のみで評価」
- **REQ-122** 🔵: 「Eランク以降（reveal_level>=1）では貢献度系・報酬系特性が解禁される」
- **REQ-123** 🟡: 「Dランク以降（reveal_level>=2）では追加の特性種類が解禁される」（TBD、本タスクでは暫定実装）
- **REQ-124** 🟡: 「詳細な段階的開示ルール」（REQ-123と同じくTBD）
- **REQ-115**: 「貢献度系/報酬系をまたぐ排他制御」（本関数の責務ではなく、TASK-0015が担当）

### 受け入れ基準
- **参照元**: docs/spec/atelier-alchemy-core/acceptance-criteria.md
- **TC-101-02** 🔵: 同一特性2個＋無特性2個の投入で特性が発現候補に含まれることを確認
- **TC-101-03** 🔵: 同一特性1個のみでは空配列（不発）を確認
- **TC-101-06** 🔵: 同一系統内で異なる2つの特性が同時発現候補に含まれることを確認
- **TC-101-B01** 🔵: 境界値テスト（特性がちょうど2個の場合、発現側に倒れることを確認）
- **TC-121-01** 🔵: Gランク（reveal_level=0）で常に空配列を返す
- **TC-121-02** 🔵: Eランク（reveal_level=1）で貢献度系特性が発現候補に含まれる
- **TC-121-E01** 🟡: 二重の安全策（庭・ショップでの入手制限が漏れても、ロジック側で防止することを確認）

### アーキテクチャ
- **参照元**: docs/design/atelier-alchemy-core/architecture.md
- **方針**: Functional Core（logic/）に配置。副作用を持たない純粋関数。GameStateは参照しない
- **Godotアーキテクトレビュー Critical#1**: 旧設計案では関数内で`GameState.current_rank`を参照する想定だったが、純粋関数の原則に違反するため、`reveal_level`を明示的な引数として受け取る設計に修正

### データフロー
- **参照元**: docs/design/atelier-alchemy-core/dataflow.md
- **機能2「特性発現判定」ステップ2**: 本関数の位置付けと入出力

### データモデル
- **参照元**: docs/design/atelier-alchemy-core/data-model.md
- **MaterialInstance.traits**: StringName型の配列（特性タグID）
- **TraitDefinition.category**: CONTRIBUTION / REWARD 2つのカテゴリ

---

## 5. テスト関連情報

### テストフレームワーク
- **GUT実行コマンド**: `cd atelier-godot && godot --headless -d -s addons/gut/gut_cmdline.gd -gtest="res://tests/unit/features/alchemy/trait_activation_test.gd"`
- **テストファイルパス**: `atelier-godot/tests/unit/features/alchemy/trait_activation_test.gd`

### テストケース（参照元: docs/tasks/atelier-alchemy-core/TASK-0014.md）

#### TC-101-02 🔵 「同一特性2個＋無特性2個で発現」
- **Given**: 特性「聖」（貢献度系）を持つ素材2個（品質A） + 無特性素材2個（品質A）、`reveal_level=1`
- **When**: `resolve_activated_traits(materials, 1, trait_definitions)` を呼び出す
- **Then**: 戻り値に「聖」の`TraitDefinition`が1件含まれる（`size() == 1`）
- **目的**: 同一タグが2個以上で発現することを確認

#### TC-101-03 🔵 「同一特性1個のみでは不発」
- **Given**: 特性「聖」を持つ素材1個 + 無特性素材3個、`reveal_level=1`
- **When**: `resolve_activated_traits(materials, 1, trait_definitions)` を呼び出す
- **Then**: 戻り値が空配列（`size() == 0`）
- **目的**: 1個のみでは候補に含まれないことを確認

#### TC-101-06 🔵 「同一系統内で複数特性同時発現」
- **Given**: 投入枠4枠に貢献度系の異なる特性「聖」2個 + 「浄」2個、`reveal_level=1`
- **When**: `resolve_activated_traits(materials, 1, trait_definitions)` を呼び出す
- **Then**: 戻り値に「聖」「浄」の両方のTraitDefinitionが含まれる（`size() == 2`、系統排他ではなく同時発現）
- **目的**: 系統内では複数特性が同時に候補に入ることを確認

#### TC-101-B01 🔵 「境界値テスト」
- **Given**: 特性「癒」を持つ素材2個 + 無特性素材2個、`reveal_level=1`
- **When**: `resolve_activated_traits(materials, 1, trait_definitions)` を呼び出す
- **Then**: 「癒」が発現候補に含まれる（`size() >= 1`）
- **目的**: 境界値がちょうど2個で発現側に倒れることを確認（TC-101-03との対比で1個の場合との差を検証）

#### TC-121-01 🔵 「Gランク（reveal_level=0）で一切発現しない」
- **Given**: 特性「聖」を2個以上含む素材構成、`reveal_level=0`
- **When**: `resolve_activated_traits(materials, 0, trait_definitions)` を呼び出す
- **Then**: 戻り値が空配列（`size() == 0`）（閾値を満たしていても発現しない）
- **目的**: reveal_levelによるフィルタが最優先されることを確認

#### TC-121-02 🔵 「Eランク（reveal_level=1）で貢献度系特性が発現」
- **Given**: 特性「聖」（貢献度系）を2個以上含む素材構成、`reveal_level=1`
- **When**: `resolve_activated_traits(materials, 1, trait_definitions)` を呼び出す
- **Then**: 「聖」が発現候補に含まれる（`size() >= 1`）
- **目的**: reveal_level>=1で貢献度系が解禁されることを確認

#### TC-121-E01 🟡 「二重の安全策（UI側入手制限漏れ対策）」
- **Given**: `reveal_level=0`（Gランク）の状態で、本来入手できないはずの特性付き素材が投入枠に存在するケース
- **When**: `resolve_activated_traits(materials, 0, trait_definitions)` を呼び出す
- **Then**: どのような特性であっても戻り値が空配列（reveal_levelフィルタが最優先）
- **目的**: 庭・ショップ側の入手制限が漏れても、ロジック側で二重に防止できることを保証

### GUT テストコード基本構造
```gdscript
extends GutTest

# ヘルパー関数（共通）
func create_material(trait_ids: Array[StringName]) -> MaterialInstance:
    var m = MaterialInstance.new()
    m.traits = trait_ids
    return m

func test_resolve_activated_traits_threshold_two_items():
    # TC-101-02
    var materials = [
        create_material(["holy"]),   # 「聖」
        create_material(["holy"]),   # 「聖」
        create_material([]),         # 無特性
        create_material([]),         # 無特性
    ]
    var result = TraitActivation.resolve_activated_traits(materials, 1, trait_defs)
    assert_equal(result.size(), 1, "同一特性2個で発現候補に含まれる")

func test_resolve_activated_traits_threshold_one_item_not_activated():
    # TC-101-03
    var materials = [
        create_material(["holy"]),   # 「聖」1個のみ
        create_material([]),
        create_material([]),
        create_material([]),
    ]
    var result = TraitActivation.resolve_activated_traits(materials, 1, trait_defs)
    assert_equal(result.size(), 0, "同一特性1個では不発")

func test_resolve_activated_traits_multiple_same_category():
    # TC-101-06
    var materials = [
        create_material(["holy"]),    # 貢献度系「聖」
        create_material(["holy"]),    # 貢献度系「聖」
        create_material(["cleanse"]), # 貢献度系「浄」
        create_material(["cleanse"]), # 貢献度系「浄」
    ]
    var result = TraitActivation.resolve_activated_traits(materials, 1, trait_defs)
    assert_equal(result.size(), 2, "同一系統内で複数特性同時発現")

func test_resolve_activated_traits_reveal_level_zero():
    # TC-121-01
    var materials = [
        create_material(["holy"]),
        create_material(["holy"]),
    ]
    var result = TraitActivation.resolve_activated_traits(materials, 0, trait_defs)
    assert_equal(result.size(), 0, "reveal_level=0では常に空配列")

func test_resolve_activated_traits_reveal_level_one():
    # TC-121-02
    var materials = [
        create_material(["holy"]),
        create_material(["holy"]),
    ]
    var result = TraitActivation.resolve_activated_traits(materials, 1, trait_defs)
    assert_equal(result.size(), 1, "reveal_level=1で貢献度系が発現")
```

---

## 6. 注意事項

### ⚠️ 設計上の重要ポイント

**1. 系統排他はこの関数の責務ではない**
- TASK-0014: 「閾値を満たしたか」の判定のみ
- TASK-0015: 「系統が競合する場合どちらを優先するか」の判定
- TC-101-04, 05, 07（系統排他テスト）は TASK-0015 で実装

**2. reveal_level による段階的開示フィルタ**
- `reveal_level == 0` (Gランク): 候補が何であっても常に空配列
- `reveal_level >= 1` (Eランク): 貢献度系・報酬系が解禁
- `reveal_level >= 2` (Dランク): REQ-123の追加特性が解禁（暫定実装、TBD）
  - 具体的な追加特性がまだ定義されていないため、本タスクでは`reveal_level >= 2`を`reveal_level >= 1`と同じ扱い
  - REQ-123確定後に再設計が必要

**3. 暫定実装事項（バランス調整フェーズ以降の追加タスク）**
- REQ-123の具体的な特性リストが確定したら、`min_rank_to_reveal`とint型`reveal_level`の変換ロジックを実装
- 参照元: docs/tasks/atelier-alchemy-core/TASK-0014.md「注意事項」の最後

### 🛡️ Godotアーキテクトレビュー Critical#1 対応チェックリスト

- [ ] `resolve_activated_traits` が純粋関数である（副作用なし）
- [ ] `GameState` への参照がない
- [ ] `Engine.get_main_loop()` 経由のAutoload参照がない
- [ ] `reveal_level` を明示的な引数で受け取っている
- [ ] 戻り値は `Array[TraitDefinition]` 型

### 📋 実装時チェックリスト

- [ ] `static func` のみで構成（Nodeを継承しない）
- [ ] 外部状態参照なし（GameState, Autoload等 参照禁止）
- [ ] `trait_definitions` 辞書を活用して TraitDefinition を解決
- [ ] テストファイルは `atelier-godot/tests/unit/features/alchemy/trait_activation_test.gd` に配置
- [ ] 6つのテストケース（TC-101-02, 03, 06, B01, TC-121-01, 02）すべてパス
- [ ] TC-121-E01（二重の安全策）も実装・検証

---

## 参考ファイル一覧

- `docs/tasks/atelier-alchemy-core/TASK-0014.md` — タスク定義
- `docs/spec/atelier-alchemy-core/requirements.md` — 要件定義（REQ-106, REQ-112, REQ-121〜124）
- `docs/spec/atelier-alchemy-core/acceptance-criteria.md` — 受け入れ基準（TC-101-02, 03, 06, B01, TC-121-01, 02）
- `docs/design/atelier-alchemy-core/architecture.md` — アーキテクチャ設計、Godotアーキテクトレビュー Critical#1
- `docs/design/atelier-alchemy-core/dataflow.md` — データフロー（機能2）
- `docs/design/atelier-alchemy-core/data-model.md` — データモデル
- `docs/tasks/atelier-alchemy-core/TASK-0011.md` — TraitDefinition（前提タスク）
- `docs/tasks/atelier-alchemy-core/TASK-0012.md` — MaterialInstance等（前提タスク）
- `docs/tasks/atelier-alchemy-core/TASK-0013.md` — QualityCalculator（前提タスク）
- `docs/tasks/atelier-alchemy-core/TASK-0015.md` — resolve_category_conflict（後続タスク）
