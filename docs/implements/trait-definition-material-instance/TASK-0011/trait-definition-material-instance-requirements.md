# TASK-0011 要件定義書: データモデル実装（TraitDefinition, MaterialInstance）

**機能名**: trait-definition-material-instance（特性タグ定義・素材インスタンスのデータモデル）
**タスクID**: TASK-0011
**要件名**: atelier-alchemy-core
**タスクタイプ**: TDD
**フェーズ**: Phase 3 - 調合コアロジック（★核心）
**技術スタック**: Godot 4.7 + GDScript / GUT 9.6.1

**【信頼性レベル凡例】**:
- 🔵 **青信号**: EARS要件定義書・設計文書を参考にしてほぼ推測していない
- 🟡 **黄信号**: EARS要件定義書・設計文書から妥当な推測
- 🔴 **赤信号**: EARS要件定義書・設計文書にない推測

---

## 1. 機能の概要

- 🔵 **何をする機能か**: 調合コアロジック（Phase 3）全体の入力データとなる2つの基礎データモデルを実装する。
  - `TraitDefinition`（特性タグの静的定義。貢献度系/報酬系/補助系の3分類、段階的開示の解禁ランク情報を持つマスターデータ）
  - `MaterialInstance`（素材の実行時インスタンス。品質値D〜S・特性タグ0〜2個を保持する在庫個体）
- 🔵 **どのような問題を解決するか**: 以降の全ロジック関数（TASK-0013〜0018）が参照する共通入力型を過不足なく定義し、系統排他制御（REQ-115）や段階的開示（REQ-121〜124）の判定基盤を提供する。特に`TraitDefinition.category`の3分類が後続の系統排他制御の判定基盤となる。
- 🔵 **想定されるユーザー**: 本データモデルの直接の利用者は後続タスクの実装（調合リゾルバ・特性発現ロジック・庭/工房Feature）。エンドユーザーは錬金術デッキ構築RPGのプレイヤー。
- 🔵 **システム内での位置づけ**: Functional Core, Imperative Shell アーキテクチャにおける純粋データ層。`TraitDefinition`は`Resource`継承（`.tres`で編集可能なマスターデータ）、`MaterialInstance`は`RefCounted`継承（在庫ごとに個体差を持つ実行時データ、副作用なし）。
- **参照したEARS要件**: REQ-103, REQ-104, REQ-107, REQ-108, REQ-121〜124
- **参照した設計文書**: `docs/design/atelier-alchemy-core/data-model.md`（「特性タグ（TraitDefinition）」「素材インスタンス（MaterialInstance）」）、`docs/design/atelier-alchemy-core/architecture.md`（Functional Core / Imperative Shell 分離）

---

## 2. 入力・出力の仕様

### 2.1 TraitDefinition（Resource継承）🔵

| プロパティ | 型 | 制約・デフォルト | 信頼性 | 参照 |
|-----------|-----|----------------|-------|------|
| `id` | `StringName` | 一意識別子 | 🔵 | data-model.md |
| `display_name` | `String` | UI表示名 | 🔵 | data-model.md |
| `category` | `Category`(enum) | `CONTRIBUTION`/`REWARD`/`SUPPORT`の3値 | 🔵 | REQ-107, REQ-108 |
| `min_rank_to_reveal` | `StringName` | 解禁ランクID（例: `"E"`, `"D"`） | 🔵 | REQ-121〜124 |
| `bonus_multiplier` | `float` | デフォルト`1.0` | 🔵 | data-model.md |

- 🔵 全プロパティを`@export`で公開し、Godot Editorおよび`.tres`から編集可能とする。
- 🔵 `enum Category { CONTRIBUTION, REWARD, SUPPORT }`。貢献度系（聖・浄・癒）/報酬系（金・華・稀）/補助系（触媒＝品質+1段）に対応。

### 2.2 MaterialInstance（RefCounted継承）🔵

| プロパティ | 型 | 制約・デフォルト | 信頼性 | 参照 |
|-----------|-----|----------------|-------|------|
| `id` | `String` | 個体識別用（在庫管理） | 🔵 | data-model.md |
| `seed_id` | `StringName` | 由来する種のID | 🟡 | data-model.md |
| `quality` | `Quality`(enum) | `D=1`〜`S=5` | 🔵 | REQ-103 |
| `traits` | `Array[StringName]` | 0〜2個。`TraitDefinition.id`の配列。デフォルト`[]` | 🔵 | REQ-104 |

- 🔵 `enum Quality { D = 1, C = 2, B = 3, A = 4, S = 5 }`。整数評価でスコア1〜5に一致する。
- 🔵 `_init(p_id: String = "", p_quality: Quality = Quality.D, p_traits: Array[StringName] = []) -> void` によるデフォルト引数付き初期化。

### 2.3 入出力の関係性・データフロー
- 🔵 `MaterialInstance.traits`が保持する`StringName`は`TraitDefinition.id`を参照する（疎結合な参照。実体解決は後続タスクの責務）。
- 🔵 本タスクはデータ保持のみを担い、計算・変換ロジック（品質平均・特性発現・貢献度算出）は含まない（TASK-0013以降）。
- **参照したEARS要件**: REQ-103, REQ-104, REQ-107, REQ-108
- **参照した設計文書**: data-model.md の TraitDefinition / MaterialInstance 型定義

---

## 3. 制約条件

- 🔵 **アーキテクチャ制約**: Functional Core, Imperative Shell の分離を厳守。データモデルは`Resource`/`RefCounted`継承で副作用なし、Autoload参照を持たない（architecture.md）。
- 🔵 **GDScriptコーディング規約**: `class_name`必須、戻り値の型ヒント必須（`-> Type`）、enumはCapitalCase。1スクリプト1`class_name`（note.md / architecture.md）。
- 🔵 **型付けArrayの徹底**: `traits`は`Array[StringName]`と型付けする（無型Arrayは型安全性の抜け穴のため禁止）。
- 🔵 **配置制約（Feature-Based）**: 実装は`atelier-godot/features/alchemy/data/`、テストは`atelier-godot/tests/unit/features/alchemy/`に配置する。
- 🔵 **スコープ外**: セーブ/ロードは非対応（requirements.md NFR-301確定）。庭・ショップの選択肢フィルタリング（REQ-124の実運用）は別Feature（garden/workshop）で実装。`min_rank_to_reveal`(文字列)と`reveal_level`(int)の変換ロジックはTASK-0014のスコープ。
- 🟡 **既知の申し送り課題**: `TraitDefinition.min_rank_to_reveal`（ランクID文字列）と`RankDefinition.trait_reveal_level`（int: 0/1/2）の対応関係が設計文書に未明記。本タスクは型定義のみを扱い、変換方法の決定はTASK-0014へ申し送る。
- **参照したEARS要件**: REQ-124, NFR-301
- **参照した設計文書**: architecture.md（Functional Core / Imperative Shell）、data-model.md（実装詳細3）

---

## 4. 想定される使用例

### 4.1 基本的な使用パターン 🔵
- `TraitDefinition`を`.tres`リソースとして定義し、`category`で3系統を区別する。
- `MaterialInstance.new("mat_001", MaterialInstance.Quality.A, [&"seiketsu"])` で在庫個体を生成する。
- 引数省略時 `MaterialInstance.new()` は `id=""`, `quality=Quality.D`, `traits=[]` で初期化される。

### 4.2 境界値・特殊ケース 🔵
- **特性タグ0個**: `traits=[]`（空配列）で正常生成できる（REQ-104下限）。
- **特性タグ2個**: `traits=[&"sei", &"kin"]`で正常生成でき、`traits.size()==2`（REQ-104上限）。
- **品質境界**: `Quality.D`=1（最小）、`Quality.S`=5（最大）が整数評価に一致する。
- 🟡 **注記**: 特性3個以上の投入自体をデータモデルで機械的に拒否する制約は設計文書に明記がないため、本タスクでは「0〜2個を保持できる」ことを保証範囲とする（過剰保持の防止・支配戦略防止はロジック層 REQ-111/REQ-115 の責務）。

### 4.3 エラー・注意ケース 🔵
- 支配戦略の抜け穴（1素材が複数特性を無条件両取り）は本データモデルでは許容し、ペナルティ・排他制御はREQ-111/REQ-115（TASK-0015, 0016）で対応する。
- **参照したEARS要件**: REQ-103, REQ-104, REQ-111, REQ-115
- **参照した設計文書**: data-model.md の `_init` シグネチャ、TASK-0011.md 注意事項

---

## 5. EARS要件・設計文書との対応関係

- **参照した機能要件**:
  - REQ-103（素材に品質値D〜S、スコア1〜5相当）→ `MaterialInstance.Quality`
  - REQ-104（素材に特性タグを0〜2個）→ `MaterialInstance.traits`
  - REQ-107（特性を貢献度系/報酬系に分類）→ `TraitDefinition.Category.CONTRIBUTION/REWARD`
  - REQ-108（補助系特性の分離）→ `TraitDefinition.Category.SUPPORT`
  - REQ-121〜124（段階的開示・解禁ランク）→ `TraitDefinition.min_rank_to_reveal`
- **参照した非機能要件**: NFR-301（技術スタックGodot 4.x + GDScript確定、セーブ非対応）
- **参照した受け入れ基準**: TASK-0011.md 完了条件（3分類の区別、Quality=1〜5、_init初期化、デフォルト引数、0〜2個保持）、TC-121-E01（未解禁特性素材の入手制限、部分検証はTASK-0014）
- **参照した設計文書**:
  - **アーキテクチャ**: architecture.md（Functional Core / Imperative Shell、pure関数化のためのreveal_level明示引数）
  - **データモデル**: data-model.md（TraitDefinition🔵 / MaterialInstance🔵 の完全型定義）
  - **既存実装例**: `atelier-godot/features/prototype/data/prototype_material_definitions.gd`（Quality/TraitCategory enum）、`atelier-godot/tests/unit/features/prototype/prototype_alchemy_resolver_test.gd`（GUTテストパターン）

---

## 6. 実装・テストファイルパス

### 実装対象
- `atelier-godot/features/alchemy/data/trait_definition.gd`
- `atelier-godot/features/alchemy/data/material_instance.gd`

### テスト
- `atelier-godot/tests/unit/features/alchemy/trait_definition_test.gd`（TC-1, TC-2, TC-3相当）
- `atelier-godot/tests/unit/features/alchemy/material_instance_test.gd`（TC-4, TC-5, TC-6相当）

---

## 7. 品質判定

✅ **高品質**:
- 要件の曖昧さ: なし（型定義がdata-model.mdに確定済み）
- 入出力定義: 完全（全プロパティの型・制約・デフォルト値を明示）
- 制約条件: 明確（アーキテクチャ・配置・スコープ境界を明示）
- 実装可能性: 確実（data-model.mdの型定義をそのまま実装）
- 信頼性レベル分布: 🔵 大多数 / 🟡 少数（seed_id・min_rank_to_reveal変換課題）/ 🔴 なし

**残課題（🟡）**: `min_rank_to_reveal`(文字列) ↔ `reveal_level`(int) の対応関係はTASK-0014へ申し送り。

---

**次のお勧めステップ**: `/tsumiki:tdd-testcases atelier-alchemy-core TASK-0011` でテストケースの洗い出しを行います。
