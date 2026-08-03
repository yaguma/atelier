# TASK-0017: ValueCalculator（貢献度/報酬算出）TDD開発コンテキスト

**作成日**: 2026-08-02  
**タスク**: TASK-0017（ValueCalculator 貢献度/報酬算出実装）  
**フェーズ**: Phase 3 - 調合コアロジック（★核心）  
**推定工数**: 8時間  
**TDD フェーズ**: Red → Green → Refactor → Verify

---

## 1. 技術スタック

- **言語**: GDScript 4.x
- **エンジン**: Godot 4.7
- **テストフレームワーク**: GUT (Godot Unit Test) 9.6.1
- **アーキテクチャパターン**: Functional Core, Imperative Shell
- **ディレクトリ構造**: Feature-Based Architecture

### 参考元
- docs/design/atelier-alchemy-core/architecture.md
- docs/design/atelier-alchemy-core/data-model.md

---

## 2. 開発ルール

### 2.1 Godot固有の実装規約

#### Functional Core（logic/）の実装方針
- `class_name` 付きクラスとし、`static func` のみで構成
- Nodeを継承しない（副作用なし）
- 外部状態（Autoload・GameState）を参照しない
- すべての必要なデータは**明示的に引数で受け取る**
- 同じ入力に対して常に同じ出力を返す

#### GDScriptコーディング規約
- インデント: タブ（Godot標準）
- 型注釈: 明示的に指定（型安全性確保）
- 変数宣言: `var name: Type = value` の形式
- 定数: `const NAME = value` の形式（大文字・スネークケース）
- コメント: `##` で複数行ドキュメント、`#` で単行コメント（日本語対応）

#### テスト関数の命名
- `test_{機能}_{正常系|異常系|境界値}_{番号}()` の形式
- 正常系: `test_calculate_contribution_normal_01()`
- 異常系: `test_calculate_contribution_error_01()`
- 境界値: `test_calculate_contribution_boundary_01()`

### 2.2 信頼性レベルの明示

ファイルヘッダ・関数内に信頼性レベルを記載：
- 🔵 **青信号**: 要件定義・設計文書から確実な実装
- 🟡 **黄信号**: 推測が含まれる部分（TBD値等）
- 🔴 **赤信号**: 設計文書に根拠がない部分

### 2.3 テスト駆動開発（TDD）の厳密な実行

1. **Red フェーズ**: テスト作成・失敗確認
2. **Green フェーズ**: 最小実装・テスト成功確認
3. **Refactor フェーズ**: 重複排除・可読性改善（テスト継続成功）
4. **Verify フェーズ**: 全テスト・型チェック・品質確認

### 参考元
- docs/rules/tdd/ 配下の全ガイドライン
- docs/rules/testing.md

---

## 3. 関連実装

### 3.1 前提タスク（実装済み）

| タスク | ファイル | 機能 |
|--------|---------|------|
| TASK-0011 | features/alchemy/data/trait_definition.gd | 特性タグの定義（bonus_multiplier含む） |
| TASK-0012 | features/alchemy/data/recipe_definition.gd | レシピ定義（base_contribution/base_reward含む） |
| TASK-0013 | features/alchemy/logic/quality_calculator.gd | 基礎品質算出（平均値計算） |
| TASK-0014 | features/alchemy/logic/trait_activation.gd | 特性発現判定（閾値判定・系統排他制御） |
| TASK-0015 | features/alchemy/logic/quality_calculator.gd | 品質ペナルティ適用（最終品質算出） |

### 3.2 実装例の参照

#### QualityCalculator（TASK-0013/0016）
- **ファイル**: features/alchemy/logic/quality_calculator.gd
- **参照ポイント**: 
  - static func のみで構成の例
  - 詳細なコメント・設計判断の明文化
  - 複数ケースのテスト対応方法

#### TraitActivation（TASK-0014）
- **ファイル**: features/alchemy/logic/trait_activation.gd
- **参照ポイント**: 
  - 複数特性のフィルタリング処理
  - 系統別のボーナス集計パターン

#### RecipeDefinition・TraitDefinition（TASK-0011/0012）
- **ファイル**: features/alchemy/data/
- **参照ポイント**: 
  - Resource継承データモデルの型定義
  - @export アノテーションの使用方法

---

## 4. 設計文書

### 4.1 要件定義

**参照ファイル**: docs/spec/atelier-alchemy-core/requirements.md

#### REQ-109: 貢献度計算式（🟡）
```
貢献度 = 基礎貢献度 × 品質倍率 × 貢献度系特性ボーナス × 指定合致ボーナス
```
- 基礎貢献度: `recipe.base_contribution`
- 品質倍率: `float(final_quality) / float(MaterialInstance.Quality.C)` （暫定・TBD）
- 貢献度系特性ボーナス: 発現特性のうち CONTRIBUTION カテゴリのみをフィルタ・乗算
- 指定合致ボーナス: `daily_request.required_recipe_id == recipe.id` なら `daily_request.bonus_multiplier`、さもなくば 1.0

#### REQ-110: 報酬計算式（🟡）
```
報酬 = 基礎報酬 × 品質倍率 × 報酬系特性ボーナス × 指定合致ボーナス
```
- 同じく品質倍率・指定合致ボーナスは REQ-109 と同じ
- 報酬系特性ボーナス: 発現特性のうち REWARD カテゴリのみをフィルタ・乗算

#### REQ-111: 最終品質（品質ペナルティ）（🔵）
- 発現特性 1 個につき品質スコア 1 段減算
- SUPPORT（触媒）は減算対象外＋事後加算
- 下限: D(1)、上限: S(5)

#### REQ-112: 複数特性同時発現（🔵）
- 同一系統内で複数特性が条件を満たす場合、すべてを発現
- ペナルティは加算的に積み重なる

#### REQ-115: 系統排他制御（🔵）
- 貢献度系・報酬系が同時に条件を満たす場合、枚数の多い系統のみ発現

### 4.2 受け入れ基準

**参照ファイル**: docs/spec/atelier-alchemy-core/acceptance-criteria.md

#### テストケース設計の核

| ケース | 名称 | 検証内容 |
|--------|------|---------|
| TC-109-N01 | 基本ケース（ボーナスなし） | 貢献度計算式の基本構造（係数 1.0 確認） |
| TC-109-N02 | 貢献度系特性ボーナス | CONTRIBUTION カテゴリのみが乗算されることを検証 |
| TC-109-N03 | 報酬系特性ボーナス | REWARD カテゴリのみが乗算されることを検証 |
| TC-109-N04 | 指定合致ボーナス | `daily_request.required_recipe_id` 合致時のボーナス適用 |

### 4.3 データモデル

**参照ファイル**: docs/design/atelier-alchemy-core/data-model.md

#### RecipeDefinition
```gdscript
@export var base_contribution: float    # REQ-109 の基礎貢献度
@export var base_reward: float          # REQ-110 の基礎報酬
```

#### TraitDefinition
```gdscript
enum Category { CONTRIBUTION, REWARD, SUPPORT }
@export var category: Category          # REQ-107 の分類
@export var bonus_multiplier: float     # ボーナス倍率
```

#### MaterialInstance
```gdscript
enum Quality { D = 1, C = 2, B = 3, A = 4, S = 5 }
var quality: Quality                    # REQ-103 の品質値
var traits: Array[StringName]           # REQ-104 の特性タグ
```

#### DailyRequest
```gdscript
var required_recipe_id: StringName      # REQ-203 の指定レシピ
var bonus_multiplier: float             # REQ-204 のボーナス倍率
```

### 4.4 アーキテクチャ

**参照ファイル**: docs/design/atelier-alchemy-core/architecture.md

#### 配置位置
- **ファイルパス**: features/alchemy/logic/value_calculator.gd
- **クラス名**: `class_name ValueCalculator`
- **継承**: RefCounted（またはスタティックのみ）
- **責務**: 純粋関数として貢献度・報酬を算出

#### 呼び出し関係
```
UI / GameState
  ↓
ValueCalculator.calculate_contribution()
ValueCalculator.calculate_reward()
  ↓
CraftResult へ結果格納
```

---

## 5. テスト関連情報

### 5.1 テストフレームワーク設定

**GUT 設定ファイル**: tests/unit/features/alchemy/.gutconfig.json（または機構全体設定）

#### GUT の実行方法

```bash
# GUT CLI で単一テストファイルを実行
cd atelier-godot
./addons/gut/gut.gd tests/unit/features/alchemy/value_calculator_test.gd

# または Godot editor で実行
godot --script addons/gut/gut.gd --test_type tests/unit/features/alchemy/value_calculator_test.gd
```

### 5.2 既存テストファイルのディレクトリ構成

```
tests/unit/features/alchemy/
├── craft_result_test.gd
├── material_instance_test.gd
├── quality_calculator_test.gd
├── recipe_definition_test.gd
├── trait_activation_test.gd
├── trait_definition_test.gd
└── value_calculator_test.gd              ← 新規作成対象
```

### 5.3 テストファイルの構造例（quality_calculator_test.gd より参照）

#### GUT テストの基本形式
```gdscript
extends GutTest

func test_calculate_base_quality_normal_01():
    # Arrange
    var materials = [
        MaterialInstance.new("m1", MaterialInstance.Quality.D, []),
        MaterialInstance.new("m2", MaterialInstance.Quality.C, []),
    ]
    
    # Act
    var result = QualityCalculator.calculate_base_quality(materials)
    
    # Assert
    assert_float(result).is_equal(1.5, 0.01)  # GUT の浮動小数点比較
```

#### アサーション（GUT）
- `assert_float(value).is_equal(expected, tolerance)` - 浮動小数点比較
- `assert_eq(value, expected)` - 等値比較
- `assert_true(value)` / `assert_false(value)` - 真偽値比較
- `assert_true(func.has_method("method_name"))` - メソッド存在確認

### 5.4 テストユーティリティ・モック

#### テスト用マスターデータの作成パターン

```gdscript
# RecipeDefinition のダミー作成
func create_test_recipe() -> RecipeDefinition:
    var recipe = RecipeDefinition.new()
    recipe.id = "test_recipe"
    recipe.base_contribution = 10.0
    recipe.base_reward = 20.0
    return recipe

# TraitDefinition のダミー作成
func create_test_trait_contribution() -> TraitDefinition:
    var trait = TraitDefinition.new()
    trait.id = "holy"
    trait.category = TraitDefinition.Category.CONTRIBUTION
    trait.bonus_multiplier = 1.5
    return trait
```

#### DailyRequest のダミー作成

```gdscript
func create_test_daily_request(recipe_id: StringName, bonus: float) -> DailyRequest:
    var req = DailyRequest.new(recipe_id)
    req.bonus_multiplier = bonus
    return req
```

### 5.5 テスト実行・品質チェック

#### ローカル確認
```bash
# テストスイート実行
cd atelier-godot
./addons/gut/gut.gd tests/unit/features/alchemy/value_calculator_test.gd

# GDScript 型チェック
godot --script addons/gdscript-type-checker/check.gd features/alchemy/logic/value_calculator.gd
```

#### CI での実行
- GitHub Actions / GitLab CI で GUT テストを自動実行
- タイプチェック・リント等の統合実行

---

## 6. 注意事項

### 6.1 設計文書間の不整合（最重要）

**TASK-0017.md より引用**:

> 設計文書間の重大な不整合（要解消・最重要の申し送り事項）: REQ-109/110の式は「指定合致ボーナス」を貢献度・報酬の算出に直接含めており、dataflow.md「機能2: 調合」ステップ5も`calculate_contribution`/`calculate_reward`の入力に「指定合致ボーナス」を明記している。一方、dataflow.md「機能3: ギルド納品」の流れでは、`item_crafted`シグナル発火後にguild機能の`DeliveryCalculator.check_daily_request_match()`が**別途**合致ボーナスを算出し、`rank_hp -= 貢献度 × 合致ボーナス` / `gold += 報酬 × 合致ボーナス`という形で**再度**乗算している。

**対応**:
- 本タスクでは REQ-109/110 をそのまま実装する
- Phase 4 着手前に **architecture.md / dataflow.md の整合を取ることが必須**
- 指定合致ボーナスをalchemy側で適用するか guild側で適用するか、どちらか一方に統一する必要あり

### 6.2 品質倍率の計算式（🔴）

**信頼性**: 🔴 **完全な推測**

TASK-0017.md より:
> 品質倍率：🔴 最終品質（`MaterialInstance.Quality`, 1〜5）から倍率への変換式は要件定義書・データモデル・データフローのいずれにも明記がなく、完全な推測となる。本タスクでは暫定的に`quality_multiplier = float(final_quality) / float(MaterialInstance.Quality.C)`（品質Cを基準値1.0とする線形倍率）を採用する。この計算式自体がバランス調整フェーズで見直される可能性が高いことを実装者は認識すること

**実装方針**:
- 品質倍率計算を `game_balance.gd` 定数に切り出すことを推奨
- バランス調整時に差し替えやすい設計にしておく
- `QualityCalculator.get_quality_multiplier(quality: MaterialInstance.Quality) -> float` など関数化を検討

### 6.3 基礎貢献度・基礎報酬・ボーナス係数は TBD

**参考**: requirements.md 「未確定数値一覧」

- `recipe.base_contribution`: バランス調整で確定
- `recipe.base_reward`: バランス調整で確定
- `trait.bonus_multiplier`: バランス調整で確定
- `daily_request.bonus_multiplier`: バランス調整で確定

**テスト方針**:
- 係数の絶対値ではなく、式の乗算構造・系統ごとの独立性を検証
- テスト内でダミー値（例: 10.0, 20.0, 1.5）を使用

### 6.4 SUPPORT 系（触媒）の複数投入時の挙動

TASK-0016 コメントより:
> REQ-108本文は「触媒＝品質+1段」を定めるのみで、SUPPORTを複数投入した場合の挙動は明記されていない。本実装は「SUPPORT件数分だけ単純加算する」モデルを暫定的に採用している

**ValueCalculator への影響**:
- `activated_traits` に SUPPORT が複数含まれる場合、単純加算か確認
- バランス調整フェーズで逓減モデル等に変更される可能性がある

### 6.5 入力検証・エッジケース

#### None / 空配列への対応
```gdscript
# 発現特性が空配列の場合
activated_traits = []
# → 貢献度系ボーナス = 1.0（無効化）
# → 報酬系ボーナス = 1.0（無効化）
# → 指定合致ボーナス = 1.0 or daily_request.bonus_multiplier
```

#### ゼロ値への対応
- `base_contribution = 0.0` の場合、結果も 0.0
- `bonus_multiplier = 1.0` の場合（無効化）は明示的に処理

---

## 7. 実装チェックリスト

### Redフェーズ
- [ ] `tests/unit/features/alchemy/value_calculator_test.gd` を作成
- [ ] テストケース 4 件を実装
  - [ ] TC-N01: 基本ケース（ボーナスなし）
  - [ ] TC-N02: 貢献度系特性ボーナス
  - [ ] TC-N03: 報酬系特性ボーナス
  - [ ] TC-N04: 指定合致ボーナス
- [ ] GUT で全テスト失敗を確認

### Greenフェーズ
- [ ] `features/alchemy/logic/value_calculator.gd` を作成
- [ ] `calculate_contribution()` 実装
- [ ] `calculate_reward()` 実装
- [ ] GUT で全テスト成功を確認
- [ ] 型チェック・リント合格

### Refactorフェーズ
- [ ] コメント・ドキュメント充実（信頼性レベル明示）
- [ ] 品質倍率計算の最適化検討
- [ ] 重複コード削除検討
- [ ] テスト継続成功を確認

### Verifyフェーズ
- [ ] GUT テスト全パス
- [ ] 型チェック合格
- [ ] code review 実施
- [ ] 受け入れ基準チェックリスト確認

---

## 8. 参照ファイル一覧

### 要件・設計文書
- docs/spec/atelier-alchemy-core/requirements.md
- docs/spec/atelier-alchemy-core/acceptance-criteria.md
- docs/design/atelier-alchemy-core/architecture.md
- docs/design/atelier-alchemy-core/data-model.md
- docs/design/atelier-alchemy-core/dataflow.md

### タスク定義
- docs/tasks/atelier-alchemy-core/TASK-0017.md
- docs/tasks/atelier-alchemy-core/TASK-0011.md
- docs/tasks/atelier-alchemy-core/TASK-0012.md
- docs/tasks/atelier-alchemy-core/TASK-0013.md
- docs/tasks/atelier-alchemy-core/TASK-0014.md
- docs/tasks/atelier-alchemy-core/TASK-0015.md

### 実装ファイル
- features/alchemy/data/trait_definition.gd
- features/alchemy/data/recipe_definition.gd
- features/alchemy/data/material_instance.gd
- features/alchemy/data/craft_result.gd
- features/alchemy/logic/quality_calculator.gd
- features/alchemy/logic/trait_activation.gd
- features/guild/data/daily_request.gd

### テストファイル
- tests/unit/features/alchemy/quality_calculator_test.gd
- tests/unit/features/alchemy/trait_activation_test.gd
- tests/unit/features/alchemy/trait_definition_test.gd
- tests/unit/features/alchemy/recipe_definition_test.gd

### ガイドライン・ルール
- .claude/rules/testing.md
- docs/rules/tdd/

---

## 付録: 計算式の詳細確認例

### 例1: 基本ケース（ボーナスなし）
```
Given:
  recipe.base_contribution = 10.0
  final_quality = Quality.C (2)
  activated_traits = []
  daily_request.required_recipe_id != recipe.id

Calculation:
  品質倍率 = 2 / 2 = 1.0
  貢献度系ボーナス = 1.0（空配列のため）
  指定合致ボーナス = 1.0（不一致のため）
  貢献度 = 10.0 × 1.0 × 1.0 × 1.0 = 10.0
```

### 例2: 貢献度系特性のみ
```
Given:
  recipe.base_contribution = 10.0
  final_quality = Quality.C (2)
  activated_traits = [trait_holy (CONTRIBUTION, 1.5), trait_healing (CONTRIBUTION, 1.2)]
  daily_request.bonus_multiplier = 1.0

Calculation:
  品質倍率 = 2 / 2 = 1.0
  貢献度系ボーナス = 1.5 × 1.2 = 1.8
  指定合致ボーナス = 1.0
  貢献度 = 10.0 × 1.0 × 1.8 × 1.0 = 18.0
```

### 例3: 指定合致ボーナス適用
```
Given:
  recipe.base_contribution = 10.0
  final_quality = Quality.B (3)
  activated_traits = []
  daily_request.required_recipe_id == recipe.id
  daily_request.bonus_multiplier = 1.5

Calculation:
  品質倍率 = 3 / 2 = 1.5
  貢献度系ボーナス = 1.0
  指定合致ボーナス = 1.5
  貢献度 = 10.0 × 1.5 × 1.0 × 1.5 = 22.5
```

---

**作成者**: ずんだもん  
**最終更新**: 2026-08-02
