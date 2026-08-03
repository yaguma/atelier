# TASK-0018 TDD開発コンテキストノート

**タスク**: AlchemyResolver.craft オーケストレーター実装  
**作成日**: 2026-08-02  
**前提**: TASK-0013〜0017（個別純粋関数）完了済み

---

## 1. 技術スタック

- **言語**: GDScript（Godot 4.7）
- **テストフレームワーク**: GUT (Godot Unit Test) 9.6.1
- **アーキテクチャ**: Functional Core（純粋関数による合成）
- **参照元**: docs/tasks/atelier-alchemy-core/TASK-0018.md

### GUT設定
- **テストファイル配置**: `atelier-godot/tests/unit/features/alchemy/alchemy_resolver_test.gd`
- **統合テストファイル**: `atelier-godot/tests/integration/features/alchemy/alchemy_resolver_integration_test.gd`
- **被テスト対象**: `atelier-godot/features/alchemy/logic/alchemy_resolver.gd`

---

## 2. 開発ルール

### TDDサイクル（厳密順序）
1. **Red**: テストファイル作成 → テスト失敗確認
2. **Green**: 最小実装（5ステップの合成） → テスト成功確認
3. **Refactor**: リファクタリング → テスト維持確認
4. **Verify**: 全テストパス、型チェック、リント完了

### 純粋関数原則（★重要）
- **副作用なし**: GameState、Autoload等の外部状態参照禁止
- **入力のみに依存**: 全引数を受け取る（reveal_level, daily_request, recipe, trait_definitions）
- **静的メソッドのみ**: `static func craft(...) -> CraftResult`
- **参照元**: docs/design/atelier-alchemy-core/architecture.md「Godotアーキテクトレビューの解説」

### Godotアーキテクトレビューへの対応 ★CRITICAL
本タスクはアーキテクトレビュー **Warning#2** の直接対応。
- **問題**: 旧設計ではUIが`QualityCalculator`→`TraitActivation`→`ValueCalculator`を個別に直接呼び出す（UIにビジネスロジックが漏洩）
- **解決**: `AlchemyResolver.craft()`という単一のオーケストレーター関数に一連処理を集約
- **結果**: UI（TASK-0020）は投入枠選択操作と結果表示のみを担当

---

## 3. 関連実装

### TASK-0013〜0017の実装済み関数（本タスクで合成対象）
- **QualityCalculator.calculate_base_quality()**: 投入素材の平均品質算出
- **QualityCalculator.apply_trait_penalty()**: 特性発現による品質ペナルティ適用
- **TraitActivation.resolve_activated_traits()**: 特性発現判定（reveal_level で制御）
- **TraitActivation.resolve_category_conflict()**: 系統排他制御（同数不発ルール）
- **ValueCalculator.calculate_contribution()**: 貢献度計算（指定合致ボーナス含む）
- **ValueCalculator.calculate_reward()**: 報酬計算

### AlchemyResolver実装ファイル
- **実装先**: `atelier-godot/features/alchemy/logic/alchemy_resolver.gd`
- **クラス名**: `AlchemyResolver`（extends RefCounted）
- **関数シグネチャ**:
  ```gdscript
  static func craft(
      materials: Array[MaterialInstance],
      reveal_level: int,
      daily_request: DailyRequest,
      recipe: RecipeDefinition,
      trait_definitions: Dictionary,
  ) -> CraftResult:
  ```

### 依存型定義
- **CraftResult**: `features/alchemy/data/` 配下
  - `base_quality: float`
  - `final_quality: float`
  - `activated_traits: Array[TraitDefinition]`
  - `rejected_category: String`（系統排他で却下された系統、無い場合は空文字列）
  - `contribution: int`
  - `reward: int`

### 後続タスク（本タスクの出力を使用）
- **TASK-0019**: GameState.craft（AlchemyResolver.craft()呼び出し）
- **TASK-0020**: AlchemyBench UI（craft()結果を表示）

---

## 4. 設計文書

### 要件定義
- **参照元**: docs/spec/atelier-alchemy-core/requirements.md
- **REQ-105**: 基礎品質の算出（TASK-0013で実装済み）
- **REQ-106, REQ-112**: 特性発現判定（TASK-0014で実装済み）
- **REQ-115**: 系統排他制御（TASK-0015で実装済み）
- **REQ-111**: 品質ペナルティ（TASK-0016で実装済み）
- **REQ-109, REQ-110**: 貢献度/報酬算出（TASK-0017で実装済み）

### 受け入れ基準
- **参照元**: docs/spec/atelier-alchemy-core/acceptance-criteria.md
- **TC-101-E01**: 投入枠が空の場合、調合が成立しない（本タスクのEDGE-001ガード）
- **TC-101-01〜07**: 代表的なシナリオの統合確認（本タスクで再実行）

### アーキテクチャ
- **参照元**: docs/design/atelier-alchemy-core/architecture.md
- **方針**: Functional Core（logic/）に配置。dataflow.mdの5ステップを合成
- **Godotアーキテクトレビュー対応**: Warning#2への具体的な対応実装

### データフロー
- **参照元**: docs/design/atelier-alchemy-core/dataflow.md
- **5ステップシーケンス**:
  1. `calculate_base_quality(materials)` → 基礎品質
  2. `resolve_activated_traits(materials, reveal_level, trait_definitions)` → 候補特性
  3. `resolve_category_conflict(materials, candidate_traits)` → 系統排他結果
  4. `apply_trait_penalty(base_quality, final_traits)` → 最終品質
  5. `calculate_contribution() / calculate_reward()` → 貢献度・報酬

### データモデル
- **参照元**: docs/design/atelier-alchemy-core/data-model.md
- **CraftResult型**: craft()の戻り値型
- **品質スコア**: D=1, C=2, B=3, A=4, S=5（float で保持）
- **特性系統**: 貢献度系/報酬系/触媒系（系統排他制御の対象）

---

## 5. テスト関連情報

### テストフレームワーク
- **GUT実行コマンド** (単体テスト):
  ```bash
  cd atelier-godot && godot --headless -d -s addons/gut/gut_cmdline.gd -gtest="res://tests/unit/features/alchemy/alchemy_resolver_test.gd"
  ```
- **GUT実行コマンド** (統合テスト):
  ```bash
  cd atelier-godot && godot --headless -d -s addons/gut/gut_cmdline.gd -gtest="res://tests/integration/features/alchemy/alchemy_resolver_integration_test.gd"
  ```

### 単体テストケース（参照元: docs/tasks/atelier-alchemy-core/TASK-0018.md）

#### TC-101-E01 🟡 投入枠が空の場合
- **入力**: `materials = []`（空配列）
- **期待値**: `null`（調合が成立しない）
- **目的**: EDGE-001ガードの動作確認

#### TC 5ステップ統合 🔵 （★必須）
- **入力**: 特性「聖」2個 + 無特性2個（品質A）、`reveal_level=1`
- **期待値**: 
  - `base_quality`: 投入素材の平均品質
  - `final_quality`: ペナルティ適用後
  - `activated_traits`: 「聖」が含まれる
  - すべてのフィールドが埋まっている
- **目的**: 5ステップの順序と整合性確認

#### TC CraftResult全フィールド埋め込み 🟡
- **入力**: 有効な投入構成（1個以上）
- **期待値**: 戻り値が`null`でなく、全6フィールドが初期化済み
- **目的**: 戻り値の完全性確認

### 統合テストケース（参照元: docs/tasks/atelier-alchemy-core/TASK-0018.md）

#### 統合TC-101-07 🔵 系統排他の支配戦略検証
- **入力**: 「聖」「金」両タグ2個 + 高品質無特性2個、`reveal_level=1`
- **期待値**: `activated_traits`が空配列（系統排他で両方却下）
- **目的**: TASK-0015の系統排他ロジックがオーケストレーター経由でも正しく合成されることを確認

#### 統合TC Gランク特性ボーナス検証 🟡
- **入力**: 特性「聖」2個以上含む構成、`reveal_level=0`（Gランク）
- **期待値**: 
  - `activated_traits`: 空配列（reveal_level=0では特性発現しない）
  - `contribution` / `reward`: 品質のみに基づく値（特性ボーナスなし）
- **目的**: reveal_level による制御がcraft()全体を通して影響することを確認

### GUT テストコード基本構造
```gdscript
extends GutTest

func test_craft_empty_materials_returns_null():
    var result = AlchemyResolver.craft([], 1, mock_request, mock_recipe, mock_traits)
    assert_null(result, "空投入枠で null を返す")

func test_craft_5step_integration():
    var materials = [
        create_material_with_trait(4, ["聖"]),
        create_material_with_trait(4, ["聖"]),
        create_material_no_trait(4),
        create_material_no_trait(4),
    ]
    var result = AlchemyResolver.craft(materials, 1, mock_request, mock_recipe, mock_traits)
    
    assert_not_null(result, "有効な投入で null でない CraftResult を返す")
    assert_equal(result.base_quality, 4.0, "基礎品質が正しい")
    assert_true(result.final_quality < 4.0, "品質ペナルティが適用されている")
    assert_true("聖" in result.activated_traits, "聖特性が発現している")
```

---

## 6. 注意事項

### ⚠️ 引数シグネチャ拡張の背景（TASK-0013〜0017の申し送り）

**architecture.mdの概略シグネチャ**: `craft(materials, reveal_level, daily_request) -> CraftResult`

**本実装でのシグネチャ**: `craft(materials, reveal_level, daily_request, recipe, trait_definitions)`追加
- `recipe`: TASK-0017（ValueCalculator）で必要な引数
- `trait_definitions`: TASK-0014（TraitActivation）で必要な引数
- **対応**: data-model.mdの呼び出し例も概略図であり、実装時にはこれらを追加で渡す必要があると判断

### 🛡️ EDGE-001ガード実装方針 🟡

- **データフロー原則**: EDGE-001は「投入枠が空 → 調合ボタンを非活性化（UI側の予防制御）」
- **防御的実装**: 本関数も自身で`materials.is_empty()`をガードし`null`を返す
- **理由**: UI側の制御漏れに対する二重の安全策（architecture.mdの非機能要件）
- **呼び出し側（TASK-0019）**: `null`チェックを実施して調合成立を判別する

### 📋 実装時チェックリスト

- [ ] `static func` のみで構成（Nodeを継承しない）
- [ ] GameState、Autoload等の外部状態参照なし
- [ ] 5ステップが正しい順序で実行される
- [ ] 各ステップの関数呼び出しが、TASK-0013〜0017の実装内容と一致している
- [ ] CraftResultの全フィールド（6項目）が埋められている
- [ ] EDGE-001の`null`ガードが実装されている
- [ ] GUT テストファイルは `tests/unit/features/alchemy/` と `tests/integration/features/alchemy/` に配置
- [ ] 単体テスト3ケース + 統合テスト2ケースすべてパス
- [ ] GUT 実行でNo failures確認

### 🔴 Godotアーキテクトレビュー対応（★最重要）

**Critical#1対応**: GameState等Autoload参照禁止
- 本関数は`reveal_level`・`daily_request`・`recipe`・`trait_definitions`をすべて**引数として受け取る**
- 内部でゲーム状態に依存しない（呼び出し元が依存管理）

**Warning#2対応**: UIがビジネスロジックを個別に直接呼び出さない設計
- UI（TASK-0020 AlchemyBench）は`AlchemyResolver.craft()`を**一度だけ呼び出す**
- `QualityCalculator`・`TraitActivation`・`ValueCalculator`を直接呼び出すコード**禁止**
- 本タスク完了後、将来のコードレビューでこのルールの遵守を確認する

---

## 参考ファイル一覧

- `docs/tasks/atelier-alchemy-core/TASK-0018.md` — タスク定義
- `docs/tasks/atelier-alchemy-core/TASK-0013.md` — QualityCalculator（前提タスク）
- `docs/tasks/atelier-alchemy-core/TASK-0014.md` — TraitActivation（前提タスク）
- `docs/tasks/atelier-alchemy-core/TASK-0015.md` — 系統排他（前提タスク）
- `docs/tasks/atelier-alchemy-core/TASK-0016.md` — 品質ペナルティ（前提タスク）
- `docs/tasks/atelier-alchemy-core/TASK-0017.md` — ValueCalculator（前提タスク）
- `docs/spec/atelier-alchemy-core/requirements.md` — 要件定義（REQ-105〜111, REQ-115, REQ-121〜124）
- `docs/spec/atelier-alchemy-core/acceptance-criteria.md` — 受け入れ基準（TC-101系列）
- `docs/design/atelier-alchemy-core/architecture.md` — アーキテクチャ設計（Godotアーキテクトレビュー対応）
- `docs/design/atelier-alchemy-core/dataflow.md` — データフロー（5ステップシーケンス）
- `docs/design/atelier-alchemy-core/data-model.md` — データモデル（CraftResult型）
