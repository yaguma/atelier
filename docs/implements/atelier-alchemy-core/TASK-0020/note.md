# TASK-0020 TDD開発コンテキストノート

**タスク**: AlchemyBench UI実装（調合台画面）  
**作成日**: 2026-08-03  
**ステータス**: Red フェーズ準備完了

---

## 1. 技術スタック

### Godot/GDScript

- **エンジン**: Godot 4.7
- **言語**: GDScript
- **テストフレームワーク**: GUT (Godot Unit Test) 9.6.1
- **参照元**: `docs/design/atelier-alchemy-core/architecture.md`

### ゲームアーキテクチャ

- **パターン**: Imperative Shell / Functional Core
- **責務分離**: UIは投入操作とシグナル購読のみ。品質計算・特性発現・貢献度/報酬算出はGameState側で実施
- **重要制約**: Warning#2対応 - `alchemy_bench.gd`は操作UIと結果表示のみ。計算ロジック一切持たない
- **参照元**: `docs/design/atelier-alchemy-core/architecture.md`, `docs/tasks/atelier-alchemy-core/TASK-0020.md`

---

## 2. 開発ルール

### TDD/GUT規約

- **テストファイル配置**: `tests/unit/features/alchemy/alchemy_bench_test.gd`
- **スクリプト配置**: `atelier-godot/features/alchemy/ui/`
- **テスト実行コマンド**: GUT CLI (詳細は `docs/rule/tdd/` 参照)
- **参照元**: `docs/rule/tdd/` 配下のルールファイル一式

### ゲーム固有ルール

- **Autoload**: `GameState` (res://autoload/game_state.gd)
- **シグナル**: `GameState.item_crafted(result: CraftResult)` で結果受信
- **在庫管理**: `GameState.get_inventory()` で素材一覧取得
- **投入枠数**: `GameState.recipe_slot_count` で初期4枠・拡張時5枠
- **参照元**: `docs/design/atelier-alchemy-core/data-model.md`

---

## 3. 関連実装

### 前提タスク

- **TASK-0019**: `GameState.craft()` と `CraftResult` の実装
  - `craft(materials: Array[MaterialInstance]) -> void` の実装済み
  - `item_crafted(result: CraftResult)` シグナルの定義済み
  - 参照元: `docs/tasks/atelier-alchemy-core/TASK-0019.md`

### GameState関連メソッド

- `get_inventory() -> Array[MaterialInstance]` - 在庫一覧取得（薄いアクセサ）
- `recipe_slot_count: int` - 投入枠数（初期4、拡張時5）
- `craft(materials: Array[MaterialInstance]) -> void` - 調合実行
- 参照元: `docs/design/atelier-alchemy-core/data-model.md`

### CraftResult型

```gdscript
class_name CraftResult:
  var base_quality: int      # 基本品質
  var final_quality: int     # 最終品質
  var activated_traits: Array[String]  # 発現特性
  var rejected_category: String  # 不発カテゴリ
  var contribution: int      # 貢献度
  var reward: int            # 報酬額
```

参照元: `docs/design/atelier-alchemy-core/data-model.md`

---

## 4. 設計文書

### アーキテクチャ

- **概要**: `docs/design/atelier-alchemy-core/architecture.md`
  - Godotアーキテクトレビュー Warning#2対応
  - UIはビジネスロジックを持たない設計
  
### データフロー

- **シーケンス図**: `docs/design/atelier-alchemy-core/dataflow.md` - 機能2: 調合
  - UI → GameState.craft() → item_crafted シグナル → 結果表示
  
### データモデル

- **GameState構造**: `docs/design/atelier-alchemy-core/data-model.md`
  - inventory: Array[MaterialInstance]
  - recipe_slot_count: int
  - シグナル定義: item_crafted(result: CraftResult)

### 要件定義

- **テスト基準**: `docs/spec/atelier-alchemy-core/acceptance-criteria.md` TC-101-E01
  - 投入枠が空→ボタン非活性化
- **ユーザストーリー**: `docs/spec/atelier-alchemy-core/user-stories.md` 2.1, 2.2
  - 限られた投入枠4枠への品質重視/特性重視での配置

---

## 5. テスト関連情報

### GUTフレームワーク

- **バージョン**: 9.6.1
- **テストスクリプト基本形式**:
  ```gdscript
  extends GutTest
  
  func before_each():
      pass
  
  func test_something():
      assert_true(true)
  ```
- **参照元**: `tests/` ディレクトリ構成と既存テストファイル

### テストケース一覧（6件）

| TC # | テストケース | 信頼度 | テスト対象 |
|------|---------|--------|----------|
| TC-1 | 投入枠が空→ボタン非活性化（EDGE-001） | 🟡 | `_update_craft_button_state()` |
| TC-2 | 素材1個以上配置→ボタン活性化 | 🟡 | `_update_craft_button_state()` |
| TC-3 | 投入枠数が`GameState.recipe_slot_count`を参照 | 🔵 | `_build_slots()` |
| TC-4 | 同一素材の重複配置防止 | 🟡 | `place()` ロジック |
| TC-5 | 調合実行時、素材が加工されず`GameState.craft()`へ | 🟡 | `_on_craft_pressed()` |
| TC-6 | `item_crafted` 受信時、結果がそのまま表示 | 🟡 | `_on_item_crafted()` |

### テストファイル配置

```
tests/unit/features/alchemy/alchemy_bench_test.gd
```

参照元: `docs/tasks/atelier-alchemy-core/TASK-0020.md` - 単体テスト要件

---

## 6. 実装ファイル

### 新規作成ファイル

1. **alchemy_bench.gd** (Control継承)
   - 位置: `atelier-godot/features/alchemy/ui/alchemy_bench.gd`
   - 責務: 投入枠管理、在庫表示、craft呼び出し、結果表示
   - シグナル購読: `GameState.item_crafted`, `GameState.inventory_updated`

2. **alchemy_bench.tscn** (シーン)
   - 位置: `atelier-godot/features/alchemy/ui/alchemy_bench.tscn`
   - 構成: SlotContainer (HBoxContainer), InventoryList, CraftButton, ResultPanel

3. **material_slot.gd** (Control継承)
   - 位置: `atelier-godot/features/alchemy/ui/material_slot.gd`
   - 責務: 投入枠1つの表示・状態管理
   - シグナル: material_placed, material_removed

4. **material_slot.tscn** (シーン)
   - 位置: `atelier-godot/features/alchemy/ui/material_slot.tscn`
   - 構成: 品質表示、特性タグ表示エリア

### 既存ファイル追記

- `res://autoload/game_state.gd`: `get_inventory()` メソッド追加（未実装の場合）

参照元: `docs/tasks/atelier-alchemy-core/TASK-0020.md` - 実装詳細セクション

---

## 7. 注意事項・制約

### Warning#2制約（最重要）

- ✅ `alchemy_bench.gd` は操作UIと結果表示のみ
- ✅ 品質計算・特性発現判定・貢献度/報酬算出はGameState側
- ✅ UI側で`CraftResult`を再計算・補正しない
- ✅ テストケース5・6がこの回帰を検知

参照元: `docs/design/atelier-alchemy-core/architecture.md` - Godotアーキテクトレビュー Warning#2

### 段階的開示との責務分離

- 本タスク: 特性情報を表示するUIの土台のみ
- TASK-0037: Gランク非表示・Eランク以降解禁の実装
- 特性表示部分は独立した関数・ノードとして分離（TASK-0037で追記可能にする）

参照元: `docs/tasks/atelier-alchemy-core/TASK-0020.md` - 注意事項

### GameState.recipe_slot_count の扱い

- 本タスクでは `GameState.recipe_slot_count` を正とする
- TASK-0034（工房強化）とTASK-0019との整合を実装時に確認
- `RecipeDefinition.slot_count` との分離も確認

参照元: `docs/tasks/atelier-alchemy-core/TASK-0020.md` - 注意事項

---

## 8. TDD進行予定

1. **Red**: テストケース6件の作成（各TC ごとに細分化）
2. **Green**: 最小実装（ボタン制御・投入枠構築・シグナル購読）
3. **Refactor**: コード整理・デバッグ出力削除・定数化
4. **Verify**: 全テストパス確認・アーキテクチャ制約の確認

---

## 参考資料へのリンク

| 資料 | パス |
|------|------|
| タスク定義 | `docs/tasks/atelier-alchemy-core/TASK-0020.md` |
| アーキテクチャ | `docs/design/atelier-alchemy-core/architecture.md` |
| データフロー | `docs/design/atelier-alchemy-core/dataflow.md` |
| データモデル | `docs/design/atelier-alchemy-core/data-model.md` |
| 前提タスク (TASK-0019) | `docs/tasks/atelier-alchemy-core/TASK-0019.md` |
| 受け入れ基準 | `docs/spec/atelier-alchemy-core/acceptance-criteria.md` |
| ユーザストーリー | `docs/spec/atelier-alchemy-core/user-stories.md` |

