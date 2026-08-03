# TASK-0011: データモデル実装 TDD コンテキストノート

**生成日**: 2026-07-22
**タスク**: TASK-0011 - TraitDefinition, MaterialInstance データモデル実装
**テクノロジー**: Godot 4.x + GDScript
**テストフレームワーク**: GUT (Godot Unit Test) 9.6.1

---

## 1. 技術スタック

### Godot 版の開発環境
- **エンジン**: Godot 4.7
- **言語**: GDScript（動的型付けだが型ヒント・class_name必須）
- **テストフレームワーク**: GUT (addon/gut/)
  - テスト実行: Godot Editor のGUT GUI、または `godot --headless` + CLI実行
  - テストファイル配置: `atelier-godot/tests/unit/features/{feature}/`

### 既存テストパターン
- 参照元: `atelier-godot/tests/unit/features/prototype/prototype_alchemy_resolver_test.gd`
- パターン: `extends GutTest` 継承、`func test_xxx() -> void:` 形式
- 特徴: static func / RefCounted 対象のため beforeEach 不要、テスト間依存なし
- assertion: `assert_eq()`, `assert_true()`, `assert_false()` 等

### アーキテクチャパターン
- **Functional Core, Imperative Shell** の分離
- data models: `Resource` または `RefCounted` 継承（副作用なし）
- logic: static func または RefCounted（Autoload参照なし）
- 参照元: `docs/design/atelier-alchemy-core/architecture.md`

---

## 2. 開発ルール・制約

### GDScript コーディング規約
- `class_name` 必須（TypeScript の `export class` 相当）
- 戻り値の型ヒント必須（`-> Type`）
- `@export` でリソースのプロパティを指定（Godot Editor からの編集対応）
- enum は CapitalCase（`Quality`, `Category`）

### データモデル設計原則
- **TraitDefinition**: `Resource` 継承（マスターデータ）
  - `@export var` で全プロパティを公開（`.tres` ファイルで編集可）
  - `id: StringName` が一意識別子
  - `category: Category` は CONTRIBUTION/REWARD/SUPPORT の3値
  - `min_rank_to_reveal: StringName` は解禁ランクID（例: "E", "D"）
  - `bonus_multiplier: float = 1.0` が ボーナス倍率のデフォルト

- **MaterialInstance**: `RefCounted` 継承（実行時インスタンス）
  - Quality enum: D=1, C=2, B=3, A=4, S=5
  - traits 配列は 0〜2個の StringName（TraitDefinition.id 参照）
  - `_init()` でデフォルト引数付き初期化
  - seed_id は StringName（庭からの収穫元の種ID）

### テスト仕様（TASK-0011 対象）
- **6テストケース**: 正常系4、異常系1、境界値1
- **TC-1**: Category の3分類が正しく区別できる
- **TC-2**: bonus_multiplier のデフォルト値確認
- **TC-3**: Quality enum がスコア 1〜5 に対応
- **TC-4**: MaterialInstance._init() の初期化確認
- **TC-5**: デフォルト引数省略時の初期化
- **TC-6**: 特性タグが 0〜2個の範囲を保持可能
- 参照元: `docs/tasks/atelier-alchemy-core/TASK-0011.md`

---

## 3. 関連実装パターン

### 既存のダミーマスターデータ例
- ファイル: `atelier-godot/features/prototype/data/prototype_material_definitions.gd`
- Quality enum 定義: D=1, C=2, B=3, A=4, S=5
- TraitCategory: CONTRIBUTION, REWARD（SUPPORT は実装例にないが TASK-0011 では必須）
- TRAIT_CATEGORIES: Dict でタグID → 系統マッピング

### 既存テストの comment 形式
- ファイル: `atelier-godot/tests/unit/features/prototype/prototype_alchemy_resolver_test.gd`
- 構造: テスト目的 → テスト内容 → 期待動作 → テストデータ準備 → 実際の処理実行 → 結果検証
- 信頼性レベル記載（🔵青/🟡黄/🔴赤）と参照要件 ID

---

## 4. 設計文書・要件定義

### 主要な要件
- **REQ-103**: 素材に品質値 D〜S（スコア 1〜5）を持たせる
- **REQ-104**: 素材に特性タグを 0〜2個持たせられる
- **REQ-107**: 特性を貢献度系/報酬系に分類
- **REQ-108**: 補助系特性を分離
- **REQ-121〜124**: 段階的開示（ランク依存）・min_rank_to_reveal

### 設計文書
- **data-model.md**: `docs/design/atelier-alchemy-core/data-model.md`
  - TraitDefinition の完全型定義（🔵信頼性）
  - MaterialInstance の完全型定義（🔵信頼性）
  - min_rank_to_reveal と reveal_level の対応関係（🟡課題あり）
  
- **architecture.md**: `docs/design/atelier-alchemy-core/architecture.md`
  - Functional Core は static func / RefCounted（Autoload参照なし）
  - Imperative Shell は UI/Autoload
  - 修正履歴（2026-07-09）: pure関数化のため引数で reveal_level を明示的に渡す

- **requirements.md**: `docs/spec/atelier-alchemy-core/requirements.md`
  - 技術スタック確定: Godot 4.x + GDScript（Phaser3+TS から変更）
  - セーブ/ロード・タイトル画面はスコープ外

---

## 5. テスト関連情報

### GUT フレームワーク
- 配置: `atelier-godot/addons/gut/`
- GUI実行: Godot Editor の Gut ドック（Bottom Panel）
- CLI実行: `godot --headless -s res://addons/gut/gut_cmdln.gd -d` など
- テスト検出: `tests/unit/` 以下の `*_test.gd` ファイル

### テストファイルディレクトリ構成
```
atelier-godot/tests/unit/features/alchemy/
├── trait_definition_test.gd         # TC-1, TC-2, TC-3
└── material_instance_test.gd        # TC-4, TC-5, TC-6
```

### テスト実装パターン
- 各テストは`extends GutTest` + `func test_xxx() -> void:`
- static func のため beforeEach なし、テスト間の状態共有なし
- assertion: `assert_eq(actual, expected, message)`

---

## 6. 注意事項・既知課題

### min_rank_to_reveal と reveal_level の対応（🟡）
- **課題**: TraitDefinition.min_rank_to_reveal は ランクID 文字列（"E", "D"）
- RankDefinition.trait_reveal_level は int（0/1/2）
- architecture.md: TraitActivation.resolve_activated_traits() は int reveal_level を引数で受け取る
- **対応**: 本タスク（TASK-0011）はデータモデル型定義のみ。変換ロジックは TASK-0014（TraitActivation）で実装
- 参照元: `docs/tasks/atelier-alchemy-core/TASK-0011.md` 実装詳細3

### 特性複数保持とREQ-111・REQ-115
- TASK-0011 は特性タグの複数保持（0〜2個）を許容する
- 品質ペナルティ（REQ-111）・系統排他制御（REQ-115）は後続タスク（TASK-0015, TASK-0016）で実装
- データモデルは支配戦略防止ロジック（ペナルティ・排他制御）に影響されない

### セーブ・ロード非対応
- 本タスクのスコープ外（requirements.md NFR-301確定）
- GameState.craft() のCraftResult は一時的な計算結果
- 将来セーブ機能追加時は Resource ベースの設計が必要

---

## 7. 実装ファイルパス一覧

### 実装対象ファイル
- `atelier-godot/features/alchemy/data/trait_definition.gd` — TraitDefinition 実装
- `atelier-godot/features/alchemy/data/material_instance.gd` — MaterialInstance 実装

### テストファイル
- `atelier-godot/tests/unit/features/alchemy/trait_definition_test.gd` — TraitDefinition テスト
- `atelier-godot/tests/unit/features/alchemy/material_instance_test.gd` — MaterialInstance テスト

### 参照設計文書
- `docs/design/atelier-alchemy-core/data-model.md`
- `docs/design/atelier-alchemy-core/architecture.md`
- `docs/spec/atelier-alchemy-core/requirements.md`
- `docs/tasks/atelier-alchemy-core/TASK-0011.md` — 詳細仕様

### 既存実装例
- `atelier-godot/features/prototype/data/prototype_material_definitions.gd` — Quality/TraitCategory enum、ダミーマスターデータ
- `atelier-godot/tests/unit/features/prototype/prototype_alchemy_resolver_test.gd` — GUT テストパターン
- `atelier-godot/tests/unit/features/rng_service_test.gd` — RefCounted テスト例

---

## 8. 実装進行順序

1. `/tsumiki:tdd-requirements TASK-0011` — 要件・仕様の詳細確認
2. `/tsumiki:tdd-testcases` — テストケース設計（6項目の確認）
3. `/tsumiki:tdd-red` — テストファイル作成・失敗確認
4. `/tsumiki:tdd-green` — 実装（最小実装）
5. `/tsumiki:tdd-refactor` — リファクタリング・定数化
6. `/tsumiki:tdd-verify-complete` — 全テスト確認・品質チェック

---

**📝 生成者**: tsumiki:tdd-tasknote  
**📋 参照ノート**: docs/tasks/atelier-alchemy-core/TASK-0011.md
