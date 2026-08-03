# TASK-0019: GameState.craft()連携実装 - TDD開発コンテキストノート

## 技術スタック

- **言語**: GDScript 4.x
- **フレームワーク**: Godot Engine 4.7
- **テストツール**: GUT (Godot Unit Test) v9.6.1
- **アーキテクチャ**: Functional Core / Imperative Shell パターン
- **参照元**: 
  - docs/design/atelier-alchemy-core/architecture.md
  - docs/spec/atelier-alchemy-core/requirements.md
  - docs/design/atelier-alchemy-core/data-model.md

## 開発ルール

### TDDサイクル
1. **Red フェーズ**: テストケース作成（失敗を確認）
2. **Green フェーズ**: 最小実装で成功させる
3. **Refactor フェーズ**: リファクタリング・定数化

### GDScript コーディング規約
- **型指定必須**: 変数・引数・戻り値に型注釈を記載
- **シグナル定義**: `signal item_crafted(result: CraftResult)`
- **メソッド命名**: snake_case
- **プライベートメソッド**: アンダースコア_prefix（例: `_consume_materials`）
- **参照元**: docs/rules/atelier-alchemy-core/ 配下のルール

### Functional Core / Imperative Shell 分離
- **Functional Core** (純粋関数): AlchemyResolver.craft() - 計算ロジック一切なし
- **Imperative Shell** (副作用層): GameState.craft() - 状態読み取り・更新・シグナル発行のみ
- **参照元**: docs/design/atelier-alchemy-core/architecture.md

## 関連実装

### TASK-0018 に依存
- **AlchemyResolver.craft()**: 品質計算・特性発現判定・貢献度/報酬算出を実行
- **戻り値**: CraftResult（null の場合は EDGE-001: 投入枠が空）
- **参照元**: atelier-godot/core/alchemy_resolver.gd

### GameState Autoload 既存フィールド
- `current_rank: RankDefinition` - 現在のランク定義
- `rank_hp: int` - ランクHP
- `gold: int` - ゴールド（初期値0）
- `inventory: Array[MaterialInstance]` - 素材在庫
- `today_request: DailyRequest` - 本日の依頼リクエスト
- **参照元**: docs/design/atelier-alchemy-core/data-model.md「GameState Autoloadの状態構造」

### マスターデータ（TASK-0018拡張）
- `current_recipe: RecipeDefinition` - 現在の有効なレシピ定義
- `trait_definitions: Dictionary` - 特性マスターデータ（ID → TraitDefinition）

## 設計文書

### 核となる設計文書
- **データモデル**: docs/design/atelier-alchemy-core/data-model.md
  - GameState.craft() のシグネチャ・状態更新仕様
  - CraftResult の構造
  
- **アーキテクチャ**: docs/design/atelier-alchemy-core/architecture.md
  - Functional Core / Imperative Shell 設計方針
  - 警告 Warning#2: "GameStateに計算ロジックを混在させない"
  
- **データフロー**: docs/design/atelier-alchemy-core/dataflow.md
  - 機能2「調合」のシーケンス図
  - 機能3「ギルド納品」との責務分担

### 要件・受け入れ基準
- **統合要件**: docs/spec/atelier-alchemy-core/requirements.md
  - REQ-105〜REQ-112, REQ-115, REQ-121〜124
  
- **受け入れ基準**: docs/spec/atelier-alchemy-core/acceptance-criteria.md
  - TC-101-E01 (EDGE-001 時のシグナル発行なし)
  - 在庫消費・rank_hp/gold更新・シグナル発行の一貫性検証

## テスト関連情報

### テストフレームワーク
- **GUT (Godot Unit Test)**: v9.6.1
- **CLI実行**: `godot --headless -s res://addons/gut/gut_cmdline.gd`
- **ユニットテスト配置**: atelier-godot/tests/unit/autoload/
- **統合テスト配置**: atelier-godot/tests/integration/autoload/

### テストファイル命名
- ユニットテスト: `game_state_test.gd`
- 統合テスト: `game_state_craft_integration_test.gd`

### テストスタイル（GUT）
```gdscript
class_name GameStateTest
extends GutTest

# 準備フェーズ
func before_each():
    # 各テスト前の初期化

# テストメソッド
func test_edge_001_no_state_change_when_craft_returns_null():
    # Given-When-Then形式で記述
    pass
```

### テストケース（TASK-0019）
1. **TC-1**: EDGE-001時に状態変更・シグナル発行なし
2. **TC-2**: 調合成功時に投入素材がinventoryから消費
3. **TC-3**: rank_hp・goldがCraftResultの値に応じて更新
4. **TC-4**: item_craftedシグナルがCraftResultとともに発行
5. **TC-5**: GameState.craft()がロジック0（単純な委譲のみ）であることの構造的確認
6. **統合**: TASK-0018〜0019を通した調合フロー全体の一貫性

## 実装詳細

### GameState.craft() のシグネチャ
```gdscript
func craft(materials: Array[MaterialInstance]) -> void:
    # AlchemyResolver.craft() 呼び出し
    var result: CraftResult = AlchemyResolver.craft(
        materials,
        current_rank.trait_reveal_level,
        today_request,
        current_recipe,
        trait_definitions,
    )
    
    # EDGE-001: null 時は何もしない
    if result == null:
        return
    
    # 状態更新
    _consume_materials(materials)
    rank_hp -= int(round(result.contribution))
    gold += int(round(result.reward))
    
    # シグナル発行
    item_crafted.emit(result)
```

### _consume_materials() ヘルパー
```gdscript
func _consume_materials(materials: Array[MaterialInstance]) -> void:
    for material in materials:
        var index := inventory.find(material)
        if index != -1:
            inventory.remove_at(index)
    inventory_updated.emit()
```

## 注意事項・設計上の課題

### 最重要: Functional Core / Imperative Shell 分離
- **GameState.craft()は計算ロジックを絶対に持たないこと**
- 品質計算・特性発現判定・系統排他制御はすべて AlchemyResolver.craft() に委譲
- アーキテクチャ回帰テスト (TC-5) がこの原則を検知

### dataflow.md との責務分担の不整合
- **dataflow.md**: rank_hp/gold更新は機能3（ギルド納品）で実施
- **data-model.md**: craft() 単体で rank_hp/gold更新を記載
- **採用設計**: data-model.md に従い本タスクで実装
- **申し送り**: Phase 4 着手前に責務分担を設計レベルで確定が必要

### マスターデータ読み込み
- **current_recipe・trait_definitions**: 起動時に一括読み込み済みが前提
- 実際のロード処理（.tres ファイル読み込み）は別タスク依存
- ロード処理の依存関係再確認が必要

## 実装手順（推奨オーダー）

1. `/tsumiki:tdd-requirements TASK-0019` - 要件の明確化
2. `/tsumiki:tdd-testcases` - テストケース設計
3. `/tsumiki:tdd-red` - テスト作成（Red フェーズ）
4. `/tsumiki:tdd-green` - 最小実装（Green フェーズ）
5. `/tsumiki:tdd-refactor` - リファクタリング（Refactor フェーズ）
6. `/tsumiki:tdd-verify-complete` - 品質検証・完了判定

## 参考資料・関連タスク

- **TASK-0018**: AlchemyResolver.craft() 実装（Functional Core 完成）
- **TASK-0020**: 後続タスク（調合結果の利用）
- **TASK-0011〜0017**: 既完了タスク（基盤構築）

## Redフェーズでの申し送り事項（追記）

- 🔴 **`project.godot`への`GameState` Autoload登録は見送った**。`class_name GameState`を持つスクリプトを同名でAutoload登録すると、グローバル識別子`GameState`がクラスではなくAutoloadシングルトンのノードインスタンスを指すようになり、テストコード側の`preload("res://autoload/game_state.gd").new()`が`Invalid call. Nonexistent function 'new' in base 'GDScript'`で失敗する（Godotの既知の挙動）。テストは`game-state-craft-testcases.md`の推奨方式どおり`preload().new()` + `add_child_autofree()`で専用インスタンスを生成しており、Autoload登録なしでも支障はない。UI層（TASK-0020以降）から`GameState`をAutoload経由参照する必要が生じた際に改めて検討すること（詳細: `game-state-craft-red-phase.md`「4. 設計判断」）。
