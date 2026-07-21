# TASK-0009 TDD開発コンテキストノート

**作成日**: 2026-07-21  
**タスク**: TASK-0009（1画面プロトタイプUI実装）  
**TDD段階**: Red（テスト作成）→ Green（最小実装）→ Refactor（リファクタリング）

---

## 1. 技術スタック

### エンジン・言語
- **Godot**: 4.7
- **言語**: GDScript
- **テストフレームワーク**: GUT (Godot Unit Test) v9.6.1

### アーキテクチャパターン
- **Functional Core, Imperative Shell分離**: 純粋関数による計算ロジックとUI層の分離
- **Feature-Based Architecture**: `features/prototype/`配下に隔離

### 参照元
- `docs/design/atelier-alchemy-core/architecture.md`
- `docs/spec/atelier-alchemy-core/requirements.md` (REQ-501, 502, 503, 105, 106, 111)

---

## 2. 開発ルール

### TDDサイクル規約
- **Red**: テストファイルを先に作成（失敗状態で開始）
- **Green**: テスト通過の最小実装のみ（過度な実装は避ける）
- **Refactor**: テスト継続パス状態でリファクタリング

### テストファイル配置規則
- ディレクトリ: `atelier-godot/tests/unit/features/`
- ファイル命名: `{対象}.test.gd` または `{対象}_test.gd`
- テスト関数命名: `test_` プレフィックス + 日本語（例: `test_基礎品質の平均値計算`)

### コード品質ルール
- プロトタイプ専用の簡易ロジック（Phase 3の正式な`AlchemyResolver`とは別物）
- Node/Scene依存性なしの`static func`で実装
- REQ-112（同一系統内の複数特性同時発現）、REQ-115（排他制御）はスコープ外
  - 省略箇所をコード内コメント（`# 簡略化: ...スコープ外`）で明記

### アーキテクチャ分離
- **Functional Core** (純粋関数):
  - `atelier-godot/features/prototype/logic/prototype_alchemy_resolver.gd`
  - 副作用なし、入力のみに依存、同じ入力で常に同じ出力
  
- **Imperative Shell** (UI層):
  - `atelier-godot/features/prototype/ui/alchemy_prototype.gd`
  - `atelier-godot/features/prototype/ui/alchemy_prototype.tscn`
  - UIイベント処理、状態管理、Nodeの初期化

### 参照元
- `.claude/rules/tdd-implementation.md` (TDD実装規則)
- `.claude/rules/phaser-best-practices.md` (コンポーネント設計。本プロジェクトではGodotに適応)

---

## 3. 関連実装

### TASK-0008 完了済み：ダミーマスターデータ
- **ファイル**: `atelier-godot/features/prototype/data/prototype_material_definitions.gd`
- **内容**:
  - `Quality` enum: D=1, C=2, B=3, A=4, S=5
  - `TraitCategory` enum: CONTRIBUTION, REWARD
  - `TRAIT_CATEGORIES` Dictionary: 特性タグID → 系統マッピング
  - `MATERIALS` Array[Dictionary]: 8種類のダミー素材データセット
    - 特性なし: `pure_crystal` (S), `plain_water` (C)
    - 特性あり（貢献度系）: `holy_herb`, `holy_herb_two`, `moon_dew`
    - 特性あり（報酬系）: `golden_ore`, `golden_dust`, `rare_gem`

### 既存テストパターン参考
- **ファイル**: `atelier-godot/tests/unit/features/rng_service_test.gd`
- **記法**:
  ```gdscript
  extends GutTest
  
  func test_テスト名() -> void:
    # Arrange: 初期設定
    var obj = SomeClass.new()
    
    # Act: 実行
    var result = obj.some_method()
    
    # Assert: 検証
    assert_eq(result, expected_value, "エラーメッセージ")
  ```
- **アサーション関数**:
  - `assert_eq(actual, expected, "message")`: 等値判定
  - `assert_ne(actual, expected, "message")`: 非等値判定
  - `assert_true(condition, "message")`: true判定
  - `assert_between(value, min, max, "message")`: 範囲判定
  - `assert_push_error("expected_error", "message")`: エラー検出

### ゲームバランス定数
- **ファイル**: `atelier-godot/shared/constants/game_balance.gd`
- **参考定義**:
  - `RECIPE_DEFAULT_SLOT_COUNT = 4` (投入枠数, REQ-101)
  - `RECIPE_MAX_SLOT_COUNT = 5` (最大投入枠数, REQ-102)
  - 他のバランス値はTBD（balance-tuning-cycleで確定予定）

---

## 4. 設計文書

### 要件・仕様関連
- `docs/spec/atelier-alchemy-core/requirements.md`
  - REQ-501: 「迷う感覚」検証がプロトタイプの目的
  - REQ-502: 庭・時間経過・演出はダミー実装（素材はボタン操作で即時入手）
  - REQ-503: 品質・特性の異なる複数種の素材を提示
  - REQ-101: 投入枠4枠（初期値）
  - REQ-105: 基礎品質は投入素材の品質スコアの平均値
  - REQ-106: 同一特性2個以上で特性発現
  - REQ-111: 発現特性1個につき品質スコア1段階減算（D未満にはならない）

- `docs/spec/atelier-alchemy-core/acceptance-criteria.md`
  - TC-501-01: ボタン操作で素材を即時入手できる
  - TC-501-02: 投入枠の内容から完成品の品質・発現特性が1画面内に表示される
  - EDGE-001: 投入枠が空の状態では調合を実行できない
  - EDGE-101: 特性発現の閾値ちょうど（同一特性2個）で発現させなければならない

### アーキテクチャ・設計
- `docs/design/atelier-alchemy-core/architecture.md`
  - Functional Core設計方針
  - Feature-Based Architecture
  - `features/prototype/ui/alchemy_prototype.tscn` UI実装箇所

### タスク定義
- `docs/tasks/atelier-alchemy-core/TASK-0008.md` (前提タスク)
- `docs/tasks/atelier-alchemy-core/TASK-0009.md` (本タスク)
- `docs/tasks/atelier-alchemy-core/TASK-0010.md` (後続タスク)

---

## 5. テスト関連情報

### テストフレームワーク設定
- **フレームワーク**: GUT (Godot Unit Test)
- **バージョン**: 9.6.1 (atelier-godot/addons/gut/ に組み込み)
- **テスト実行コマンド**: `godot --addons --script=res://addons/gut/run.gd` (プロジェクト設定に従う)

### テストディレクトリ構成
```
atelier-godot/
  tests/
    unit/
      features/
        sample_gut_setup_test.gd        # GUTセットアップ検証用
        rng_service_test.gd             # RngService テスト例
        [新規] prototype_alchemy_resolver_test.gd  # TASK-0009追加
```

### テストテンプレート（TASK-0009用）
```gdscript
extends GutTest
# TASK-0009: プロトタイプ調合ロジックのユニットテスト

const PrototypeAlchemyResolverScript := preload("res://features/prototype/logic/prototype_alchemy_resolver.gd")

func test_基礎品質の平均値計算() -> void:
    # Arrange
    var materials: Array = [
        {"quality": 3},  # Quality.B
        {"quality": 1},  # Quality.D
    ]
    
    # Act
    var result = PrototypeAlchemyResolverScript.resolve(materials)
    
    # Assert
    assert_eq(result["quality"], 2, "BとDの平均品質はスコア2であるべき")
```

### テスト命名規則
- プレフィックス: `test_` （固定）
- 内容: テスト対象の動作を日本語で説明
  - 例: `test_基礎品質の平均値計算`
  - 例: `test_特性の閾値発現`
  - 例: `test_投入枠が空の場合の調合拒否`

### テストカバレッジ対象
TASK-0009 テストケース一覧（7項目）:
1. **TC1**: 基礎品質の平均値計算 (REQ-105簡略版)
2. **TC2**: 特性の閾値発現（同一特性2個で発現） (REQ-106, EDGE-101)
3. **TC3**: 特性1個のみでは不発 (REQ-106)
4. **TC4**: 特性発現による品質ペナルティ (REQ-111簡略版)
5. **TC5**: 最終品質がD未満にならない（境界値） (REQ-111)
6. **TC6**: 投入枠が空の場合の調合拒否 (EDGE-001)
7. **TC7**: 素材入手ボタンの即時反映（UIテスト） (TC-501-01)

### E2E/統合テスト（後続タスク）
- TASK-0010で実施予定
- 1画面プロトタイプの実際の操作検証
- ユーザーが迷うかの観察記録

---

## 6. 注意事項

### スコープ内・外の明確化
- ✅ **スコープ内**:
  - 素材の平均品質計算（簡略化版）
  - 特性の同一タグ2個以上で発現判定
  - 発現特性によるペナルティ減算（D未満にはしない）
  - ボタン操作による素材入手UI
  - 投入枠への配置・調合実行UI
  
- ❌ **スコープ外（コード内コメントで明記）**:
  - REQ-112: 同一系統内の複数特性同時発現とペナルティ加算
  - REQ-115: 貢献度系/報酬系の排他制御（両系統同数なら不発）
  - 庭・時間経過・成熟度メカニクス
  - アニメーション・装飾的な演出

### 実装ファイル隔離ルール
```
features/prototype/                    # プロトタイプ専用（Phase 3以降と分離）
  data/
    prototype_material_definitions.gd  # TASK-0008: ダミーマスターデータ
  logic/
    prototype_alchemy_resolver.gd      # TASK-0009: 簡易計算ロジック（NEW）
  ui/
    alchemy_prototype.gd               # TASK-0009: UI制御（NEW）
    alchemy_prototype.tscn             # TASK-0009: UIシーン（NEW）

# 本実装（Phase 3以降）
features/alchemy/                      # 正式実装（プロトタイプと分離）
  logic/
    alchemy_resolver.gd                # Phase 3以降: 正式計算ロジック
```

**重要**: プロトタイプの`alchemy_resolver.gd`を本実装の`features/alchemy/`に移動・統合しない。プロトタイプは検証用の一時成果物であり、本実装はゼロから設計される。

### エッジケース・境界値処理
- 投入枠が空 → 調合実行できない（ボタン非活性化 or 無視）
- 品質スコアが小数になる → 切り捨て（数学的な四捨五入は不要）
- 最終品質が1未満 → 1（Quality.D）に正規化
- 特性タグが3個以上発現 → スコープ外（簡略化）

### 参考ドキュメント
- `.claude/rules/tdd-implementation.md`
- `.claude/rules/coding-style.md` (GDScript版は適応が必要)
- `docs/design/atelier-alchemy-core/architecture.md` (Functional Core方針)

---

## 7. 実装チェックリスト（準備完了後）

- [ ] `prototype_alchemy_resolver.gd` 作成（static func）
- [ ] `prototype_alchemy_resolver_test.gd` 作成（GUT テストケース 7項目）
- [ ] `alchemy_prototype.gd` 作成（UI制御）
- [ ] `alchemy_prototype.tscn` 作成（UI構成）
- [ ] 全テストが PASS 状態で完了
- [ ] コード内にスコープ外の項目を明記（コメント）

---

**次ステップ**: `/tsumiki:tdd-requirements TASK-0009` を実行し、テスト設計フェーズに進む
