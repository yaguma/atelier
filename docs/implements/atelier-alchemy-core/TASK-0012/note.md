# TASK-0012 TDD開発コンテキストノート
**生成日**: 2026-07-22
**タスク**: データモデル実装: RecipeDefinition, CraftResult
**言語**: GDScript (Godot 4.7)

---

## 技術スタック

- **エンジン**: Godot 4.7
- **言語**: GDScript
- **テストフレームワーク**: GUT (Godot Unit Test) 9.6.1
- **アーキテクチャ**: Feature-Based Architecture
- **データモデル文書**: `docs/design/atelier-alchemy-core/data-model.md`

---

## 開発ルール

### GDScript型安全性
- `class_name` を必須とし、1スクリプト1クラス原則を遵守
- 型ヒント（`:型名`）を全変数・関数で明示
- `Resource`と`RefCounted`の使い分け：
  - **Resource**: 静的定義（JsonLoadable, エディタ保存対象）→ RecipeDefinition
  - **RefCounted**: 実行時データ（GCの対象）→ CraftResult, MaterialInstance

### ファイル配置
- **実装ファイル**: 
  - `atelier-godot/features/alchemy/data/recipe_definition.gd`
  - `atelier-godot/features/alchemy/data/craft_result.gd`
- **テストファイル**: 
  - `atelier-godot/tests/unit/features/alchemy/recipe_definition_test.gd`
  - `atelier-godot/tests/unit/features/alchemy/craft_result_test.gd`

参照元: `docs/design/atelier-alchemy-core/data-model.md`, `docs/tasks/atelier-alchemy-core/TASK-0011.md`

---

## 関連実装

### 先行実装（TASK-0011・完了済み）
- `atelier-godot/features/alchemy/data/trait_definition.gd`
  - `enum Category { CONTRIBUTION, REWARD, SUPPORT }`
  - `@export var bonus_multiplier: float = 1.0`
- `atelier-godot/features/alchemy/data/material_instance.gd`
  - `enum Quality { D = 1, C = 2, B = 3, A = 4, S = 5 }`
  - `RefCounted`継承、`_init()`でデフォルト引数対応

### クラス関係図
```
RecipeDefinition (Resource)
  ↓ 持つ
  └─ slot_count (初期値: 4) ← REQ-101

CraftResult (RefCounted)
  ↓ 持つ
  ├─ base_quality: MaterialInstance.Quality
  ├─ final_quality: MaterialInstance.Quality
  ├─ activated_traits: Array[TraitDefinition]
  ├─ rejected_category: TraitDefinition.Category
  ├─ contribution: float
  └─ reward: float
```

参照元: `docs/design/atelier-alchemy-core/data-model.md`, `docs/tasks/atelier-alchemy-core/TASK-0011.md`

---

## 設計文書

### 要件マッピング
| 要件ID | 対象フィールド | 説明 |
|--------|---|---|
| REQ-101 | RecipeDefinition.slot_count | 投入枠初期値4（工房強化による加算はGameState側） |
| REQ-102 | RecipeDefinition.slot_count | 工房強化で+1、最大5枠（GameState側の責務） |
| REQ-105 | CraftResult.base_quality | ペナルティ適用前の品質 |
| REQ-109 | RecipeDefinition.base_contribution, CraftResult.contribution | 基礎貢献度・最終貢献度 |
| REQ-110 | RecipeDefinition.base_reward, CraftResult.reward | 基礎報酬・最終報酬 |
| REQ-111 | CraftResult.final_quality | 品質ペナルティ・触媒補正適用後（下限D=1） |
| REQ-112 | CraftResult.activated_traits | 同一系統内の複数同時発現に対応 |
| REQ-115 | CraftResult.rejected_category | 系統排他制御の結果（不発側の記録） |

### 信頼性レベル
- **🔵青（確実）**: RecipeDefinition全体、CraftResultの型定義・基本フィールド
- **🟡黄（推測）**: `base_contribution`, `base_reward`の具体値（TBD）、`rejected_category`の無効値表現

参照元: `docs/tasks/atelier-alchemy-core/TASK-0012.md`, `docs/design/atelier-alchemy-core/data-model.md`

---

## テスト関連情報

### テストフレームワーク設定
- **テストランナー**: GUT (Godot Unit Test)
- **テストスクリプトキー**: 命名規則 `*_test.gd`
- **実行コマンド**: (atelier-godot/ディレクトリから) `gut -gd`

### テストディレクトリ構成
```
atelier-godot/tests/unit/features/alchemy/
  ├─ recipe_definition_test.gd
  └─ craft_result_test.gd
```

### テストケース一覧（TASK-0012要件）

#### テストケース1: RecipeDefinition.slot_countデフォルト値
- **Given**: `slot_count`を設定しないRecipeDefinition
- **When**: `slot_count`プロパティを参照
- **Then**: デフォルト値が`4`（REQ-101）

#### テストケース2: RecipeDefinition の基本フィールド設定・取得
- **Given**: `base_contribution=10.0`, `base_reward=20.0`を設定
- **When**: 各プロパティを参照
- **Then**: 設定値がそのまま取得できる

#### テストケース3: CraftResult全フィールド保持
- **Given**: 全フィールド値を設定したCraftResult
- **When**: 各プロパティを参照
- **Then**: 設定値が取得でき、`activated_traits.size() == 2`（複数同時発現対応確認）

#### テストケース4: CraftResult.activated_traitsデフォルト値
- **Given**: `activated_traits`を設定しないCraftResult
- **When**: `activated_traits`プロパティを参照
- **Then**: 空配列（`size() == 0`）

参照元: `docs/tasks/atelier-alchemy-core/TASK-0012.md`

---

## 注意事項

### 🟡 rejected_category の無効値表現（TASK-0015へ委譲）
`rejected_category`は「不発なし」を表す無効値が必要だが、GDScriptのenumには`null`がないため、以下のいずれかで対応予定：
- **案A**: `TraitDefinition.Category`に`Category.NONE`を追加（TraitDefinitionの変更が必要）
- **案B**: `CraftResult`に`has_rejected_category: bool`を別途持たせ、無効値を区別

本タスク（TASK-0012）では型定義のみを実装し、無効値の具体的表現はTASK-0015で確定・実装。

### 📌 base_contribution/base_reward は TBD
TASK-0012では具体値の妥当性（バランス）は検証しない。数値確定は`balance-tuning-cycle`で実施。

### 🔗 後続タスク依存
- **TASK-0014**: MaterialInstanceに触媒補正適用
- **TASK-0015**: `rejected_category`の無効値処理・系統排他制御実装
- **TASK-0017**: CraftResult の最終値（contribution/reward）計算
- **TASK-0018**: AlchemyResolver.craft() でCraftResultを戻り値として返却
- **TASK-0020**: UI側で CraftResult を表示（「なぜこの結果か」説明可能）

参照元: `docs/tasks/atelier-alchemy-core/TASK-0012.md`

---

## 実装チェックリスト（TDD進行順序）

### ステップ1-2: 要件・テストケース設計
- [ ] `/tsumiki:tdd-requirements` でREQ-101など要件を整理
- [ ] `/tsumiki:tdd-testcases` で4テストケースを展開

### ステップ3: Red フェーズ
- [ ] `/tsumiki:tdd-red` でテストスクリプト作成・全テスト失敗確認

### ステップ4: Green フェーズ
- [ ] `/tsumiki:tdd-green` で最小実装（trait_definition参照、RefCounted/Resource仕様）

### ステップ5: Refactor フェーズ
- [ ] `/tsumiki:tdd-refactor` で型安全性・命名改善

### ステップ6: Verify 完了チェック
- [ ] `/tsumiki:tdd-verify-complete` で全テスト通過・要件充足確認

---

**参照元ファイル一覧（全て相対パス）**
- docs/tasks/atelier-alchemy-core/TASK-0012.md
- docs/tasks/atelier-alchemy-core/TASK-0011.md
- docs/design/atelier-alchemy-core/data-model.md
- docs/spec/atelier-alchemy-core/requirements.md
