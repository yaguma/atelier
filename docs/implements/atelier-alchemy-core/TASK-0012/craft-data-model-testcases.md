# TASK-0012 データモデル（RecipeDefinition / CraftResult）テストケース定義書

**機能名**: 調合データモデル（RecipeDefinition / CraftResult）
**タスクID**: TASK-0012
**要件名**: atelier-alchemy-core
**作成日**: 2026-07-22
**出力ファイル**: `docs/implements/atelier-alchemy-core/TASK-0012/craft-data-model-testcases.md`

**【信頼性レベル凡例】**:
- 🔵 **青信号**: 要件定義書・設計文書（data-model.md / TASK-0012.md / requirements.md）を参考にほぼ推測していない
- 🟡 **黄信号**: 元資料から妥当な推測
- 🔴 **赤信号**: 元資料にない推測

**【対象範囲の明確化】**:
本タスクはデータモデル（プロパティの保持と取得）が対象。計算ロジック（REQ-109〜112の変換式、品質ペナルティ加算、下限D=1クランプ）と `rejected_category` の「不発なし」無効値表現は後続タスク（TASK-0014/0015/0017）の責務であり、本テストでは検証しない。

---

## テストファイル構成

| テストファイル | 対象クラス | 実装ファイル |
|---|---|---|
| `atelier-godot/tests/unit/features/alchemy/recipe_definition_test.gd` | `RecipeDefinition`（`Resource`） | `atelier-godot/features/alchemy/data/recipe_definition.gd` |
| `atelier-godot/tests/unit/features/alchemy/craft_result_test.gd` | `CraftResult`（`RefCounted`） | `atelier-godot/features/alchemy/data/craft_result.gd` |

**テスト方針**: `MaterialInstance`/`TraitDefinition`（TASK-0011）同様、副作用を持たないデータモデルのため `before_each` 相当の状態初期化は不要。各テストはローカル変数のみで完結する。`preload("res://...")` でスクリプトを取得し `new()` で生成する。

---

## 1. 正常系テストケース（基本的な動作）

### N-1: RecipeDefinition の slot_count デフォルト値が 4 である

- **テスト名**: RecipeDefinitionのslot_countデフォルト値がREQ-101に従い4である
  - **何をテストするか**: `slot_count` を明示設定せず生成したときのデフォルト値
  - **期待される動作**: `slot_count == 4` が取得できる
- **入力値**: `RecipeDefinition.new()`（引数・プロパティ設定なし）
  - **入力データの意味**: レシピ定義の投入枠初期値を検証する最小生成ケース。工房強化(+1)前の基本値を代表する
- **期待される結果**: `slot_count == 4`
  - **期待結果の理由**: REQ-101「投入枠を設け、初期値は4枠」に対応。工房強化による加算はGameState側の責務であり、レシピ基本値は4で固定される
- **テストの目的**: REQ-101のデフォルト値契約の確認
  - **確認ポイント**: 暗黙の0や未初期化ではなく、明示的に4で初期化されること
- 🔵 *TASK-0012.md 単体テスト要件テストケース1 / REQ-101 より*

### N-2: RecipeDefinition の base_contribution / base_reward が設定・取得できる

- **テスト名**: RecipeDefinitionのbase_contribution/base_rewardが設定値をそのまま取得できる
  - **何をテストするか**: 基礎貢献度・基礎報酬プロパティの set → get の同一性
  - **期待される動作**: 設定した値がそのまま読み出せる
- **入力値**: `base_contribution = 10.0`, `base_reward = 20.0`
  - **入力データの意味**: 具体値はTBDのため、値の妥当性ではなく「保持動作」を検証する代表値。float型を代表する非ゼロ値
- **期待される結果**: `base_contribution == 10.0` かつ `base_reward == 20.0`
  - **期待結果の理由**: データモデルは変換を行わず値をそのまま保持する（REQ-109/110の器としての正当性）
- **テストの目的**: 基礎値フィールドの保持動作の確認
  - **確認ポイント**: 数値の妥当性（バランス）は検証対象外。setした値がそのままgetできること
- 🟡 *TASK-0012.md 単体テスト要件テストケース2 / REQ-109, REQ-110 より（具体値はTBD）*

### N-3: RecipeDefinition の id / display_name が設定・取得できる

- **テスト名**: RecipeDefinitionのid(StringName)/display_name(String)が設定値を保持する
  - **何をテストするか**: 識別子・表示名プロパティの set → get の同一性
  - **期待される動作**: 設定した `StringName` / `String` がそのまま取得できる
- **入力値**: `id = &"recipe_healing_potion"`, `display_name = "回復薬"`
  - **入力データの意味**: レシピを一意識別するID（StringName）とUI表示名（String）の代表値。日本語表示名も含めて保持できることを確認
- **期待される結果**: `id == &"recipe_healing_potion"` かつ `display_name == "回復薬"`
  - **期待結果の理由**: data-model.mdの型定義（`id: StringName`, `display_name: String`）どおり値を保持する
- **テストの目的**: 識別・表示フィールドの保持動作の確認
  - **確認ポイント**: `StringName` と `String` の型差異が保持動作に影響しないこと
- 🔵 *data-model.md「レシピ定義」/ requirements.md 2.1 表（id, display_name） より*

### N-4: CraftResult が全フィールドを保持できる（activated_traits 複数保持を含む）

- **テスト名**: CraftResultが全フィールドを保持しactivated_traitsを複数(2件)保持できる
  - **何をテストするか**: `base_quality`/`final_quality`/`activated_traits`/`contribution`/`reward` の一括保持と、複数特性の同時保持
  - **期待される動作**: 各値がそのまま取得でき、`activated_traits.size() == 2`
- **入力値**: `base_quality = MaterialInstance.Quality.A`, `final_quality = MaterialInstance.Quality.B`, `activated_traits = [trait_a, trait_b]`（`TraitDefinition` 2件）, `contribution = 15.0`, `reward = 30.0`
  - **入力データの意味**: ペナルティ前後で品質が異なる（A→B）現実的なケース。`activated_traits` 2件はREQ-112「同一系統内の複数同時発現」を代表する
- **期待される結果**: `base_quality == Quality.A`, `final_quality == Quality.B`, `activated_traits.size() == 2`, `activated_traits[0] == trait_a`, `activated_traits[1] == trait_b`, `contribution == 15.0`, `reward == 30.0`
  - **期待結果の理由**: CraftResultは計算過程をブラックボックス化させないための「器」であり、各フィールドを欠落なく保持する。REQ-112の同時発現を複数要素で表現できることが核心
- **テストの目的**: 全フィールドの保持と複数特性同時保持（REQ-112）の確認
  - **確認ポイント**: `base_quality` と `final_quality` が別々に保持されること（分離設計の妥当性）、配列の要素順序が保たれること
- 🔵 *TASK-0012.md 単体テスト要件テストケース3 / data-model.md「調合結果」/ REQ-105, REQ-111, REQ-112 より*

### N-5: CraftResult の base_quality と final_quality を独立に保持できる

- **テスト名**: CraftResultのbase_qualityとfinal_qualityが独立した値として保持される
  - **何をテストするか**: ペナルティ適用前後の品質フィールドが混同されず別個に保持されること
  - **期待される動作**: 2つの品質フィールドに異なる値を設定でき、それぞれ独立に取得できる
- **入力値**: `base_quality = MaterialInstance.Quality.S`, `final_quality = MaterialInstance.Quality.D`
  - **入力データの意味**: ペナルティで最大幅（S→D）低下した極端ケース。分離設計が意味を持つ最も明快な例
- **期待される結果**: `base_quality == Quality.S` かつ `final_quality == Quality.D`（互いに上書きされない）
  - **期待結果の理由**: REQ-105（基礎品質）とREQ-111（最終品質）を明示的に分離保持することがCraftResult新設の目的（説明可能性の担保）
- **テストの目的**: 品質前後値の分離保持の確認
  - **確認ポイント**: 一方への代入が他方に影響しないこと
- 🔵 *data-model.md「調合結果」/ TASK-0012.md 注意事項（base/final分離の設計意図）/ REQ-105, REQ-111 より*

---

## 2. 異常系テストケース（エラーハンドリング）

> データモデルは拒否ロジックを内包せず、堅牢な保持を責務とする（MaterialInstance の E-1 と同方針）。個数制約・整合性検証は後段ロジック層（TASK-0015/0016）へ委譲するため、「不正入力でも例外を投げず保持する」ことを異常系として確認する。

### E-1: CraftResult の activated_traits に想定超過(3件)を設定しても例外を投げず保持する

- **テスト名**: activated_traitsに3件設定しても例外を投げずsize()==3で保持する
  - **エラーケースの概要**: 系統排他制御（REQ-115）適用前や後段の想定を超える件数がデータモデルに渡る状況
  - **エラー処理の重要性**: データモデル層が件数を機械的に拒否すると、後段ロジックが「過剰発現」を検出・是正できなくなる。堅牢な保持で拒否責務をロジック層へ委譲する
- **入力値**: `activated_traits = [trait_a, trait_b, trait_c]`（`TraitDefinition` 3件）
  - **不正な理由**: 通常の系統排他制御後は複数系統が同時に残りにくく、3件はデータモデル単体では想定外の件数
  - **実際の発生シナリオ**: TASK-0015実装前の中間状態、または将来の仕様変更で発現数が増えたケース
- **期待される結果**: 例外・エラーを発生させず生成でき、`activated_traits.size() == 3`
  - **エラーメッセージの内容**: エラーを出さないことが正しい（データモデルの契約）
  - **システムの安全性**: 破綻せず保持し、後段が検出・是正できる状態を保つ
- **テストの目的**: データモデルの堅牢な保持（拒否責務の非内包）の確認
  - **品質保証の観点**: Functional Core / Imperative Shell分離のうち、データレイヤーが判定を持たないことを保証する
- 🟡 *MaterialInstance テストケース定義書 E-1 の方針踏襲 / requirements.md 3章（型定義のみ固定・拒否責務の委譲）より*

---

## 3. 境界値テストケース（デフォルト値・最小値）

### B-1: CraftResult の activated_traits デフォルトが空配列である

- **テスト名**: CraftResultのactivated_traitsデフォルトが空配列(size()==0)である
  - **境界値の意味**: 特性が1つも発現しなかった調合結果の下限ケース。null化しないことの保証
  - **境界値での動作保証**: 未設定でも配列として成立し、要素アクセス前でも `size()` が安全に呼べる
- **入力値**: `CraftResult.new()`（`activated_traits` 未設定）
  - **境界値選択の根拠**: data-model.mdの `activated_traits: Array[TraitDefinition] = []` のデフォルト定義に対応
  - **実際の使用場面**: 発現特性ゼロの調合（素材が特性を持たない等）で常時発生しうる正当なケース
- **期待される結果**: `activated_traits.size() == 0`（`null` ではなく空の typed Array）
  - **境界での正確性**: 空配列であり、`.append()` や `.size()` が例外なく機能する
  - **一貫した動作**: 明示設定時（N-4の複数保持）と型が一貫する
- **テストの目的**: デフォルト空配列（REQ-112の下限）の確認
  - **堅牢性の確認**: 未初期化 null による後段クラッシュを防ぐ
- 🔵 *TASK-0012.md 単体テスト要件テストケース4 / data-model.md `activated_traits = []` より*

### B-2: CraftResult の contribution / reward デフォルトが 0.0 である

- **テスト名**: CraftResultのcontribution/rewardデフォルトが0.0である
  - **境界値の意味**: 貢献度・報酬が未計算（最小値）の初期状態
  - **境界値での動作保証**: 未設定時に0.0で初期化され、未初期化のゴミ値にならない
- **入力値**: `CraftResult.new()`（`contribution` / `reward` 未設定）
  - **境界値選択の根拠**: data-model.mdの `contribution: float = 0.0`, `reward: float = 0.0` のデフォルト定義に対応
  - **実際の使用場面**: AlchemyResolver.craft()（TASK-0018）が値を埋める前の生成直後の状態
- **期待される結果**: `contribution == 0.0` かつ `reward == 0.0`
  - **境界での正確性**: float の 0.0 で初期化される
  - **一貫した動作**: 後段で加算していく起点として妥当
- **テストの目的**: 数値フィールドのデフォルト0.0の確認
  - **堅牢性の確認**: 未初期化値による計算破綻を防ぐ
- 🔵 *data-model.md「調合結果」`contribution/reward = 0.0` / REQ-109, REQ-110 より*

### B-3: RecipeDefinition の base_contribution / base_reward デフォルトが 0.0 である

- **テスト名**: RecipeDefinitionのbase_contribution/base_rewardデフォルトが0.0である
  - **境界値の意味**: レシピ基礎値の未設定時の下限
  - **境界値での動作保証**: 未設定でも0.0で初期化される
- **入力値**: `RecipeDefinition.new()`（基礎値未設定）
  - **境界値選択の根拠**: data-model.mdの `base_contribution: float = 0.0`, `base_reward: float = 0.0` に対応
  - **実際の使用場面**: 基礎値未指定のレシピ雛形生成時
- **期待される結果**: `base_contribution == 0.0` かつ `base_reward == 0.0`
  - **境界での正確性**: float の 0.0 で初期化される
  - **一貫した動作**: N-2の明示設定と初期化契約が矛盾しない
- **テストの目的**: レシピ基礎値のデフォルト0.0の確認
  - **堅牢性の確認**: 未初期化値の混入防止
- 🔵 *data-model.md「レシピ定義」`base_contribution/base_reward = 0.0` / requirements.md 2.1 表 より*

### B-4: CraftResult の activated_traits に 1 件（同時発現の下限）を保持できる

- **テスト名**: CraftResultのactivated_traitsが1件保持でsize()==1になる
  - **境界値の意味**: 「複数保持」と「空」の中間、発現特性1件という最も一般的な下限ケース
  - **境界値での動作保証**: 1件でも欠落せず保持され、要素が取り出せる
- **入力値**: `activated_traits = [trait_a]`（`TraitDefinition` 1件）
  - **境界値選択の根拠**: 空(0件, B-1)と複数(2件, N-4)の間の境界。単一発現の代表
  - **実際の使用場面**: 特性が1つだけ発現する最も頻出する調合結果
- **期待される結果**: `activated_traits.size() == 1` かつ `activated_traits[0] == trait_a`
  - **境界での正確性**: 1件が正しく格納され参照できる
  - **一貫した動作**: 0件・2件と同じ typed Array 型で一貫する
- **テストの目的**: 単一発現保持の確認（0件/複数件との境界）
  - **堅牢性の確認**: 要素数1でのインデックスアクセスが安全であること
- 🟡 *N-4（複数保持）・B-1（空配列）の境界補完 / REQ-112 より妥当な推測*

---

## 4. 開発言語・フレームワーク

- **プログラミング言語**: GDScript（Godot 4.7）
  - **言語選択の理由**: 本プロジェクトはGodot 4.x + GDScriptへ移行済み（CLAUDE.md・note.md）。`Resource`/`RefCounted` 継承と `@export`、typed Array（`Array[TraitDefinition]`）を用いるためGDScriptが必須
  - **テストに適した機能**: enum・typed Array・デフォルト引数付き `_init` を標準サポートし、データモデルの保持動作を簡潔に検証できる
- **テストフレームワーク**: GUT（Godot Unit Test）9.6.1
  - **フレームワーク選択の理由**: プロジェクト標準のGUTを採用（note.md）。TASK-0011の既存テスト（material_instance_test.gd 等）と同一構成
  - **テスト実行環境**: `atelier-godot/` ディレクトリから GUT CLI（`gut -gd` 等）でヘッドレス実行。テストは `GutTest` を `extends` し、`preload("res://...")` でスクリプトを取得、`assert_eq` 等で検証する
- 🔵 *note.md「技術スタック」「テスト関連情報」/ 既存 material_instance_test.gd の構成 より*

---

## 5. テストケース実装時の日本語コメント指針

各テストケースの実装時（tdd-red フェーズ）には、TASK-0011の既存テスト（material_instance_test.gd）に倣い以下の日本語コメントを含める。

### テストケース開始時のコメント
```gdscript
# 【テスト目的】: [このテストで何を確認するかを日本語で明記]
# 【テスト内容】: [具体的にどのような処理をテストするかを説明]
# 【期待される動作】: [正常に動作した場合の結果を説明]
# 🔵🟡🔴 信頼性: [参照元] より
```

### Given（準備フェーズ）のコメント
```gdscript
# 【テストデータ準備】: [なぜこのデータを用意するかの理由]
# 【初期条件設定】: [テスト実行前の状態を説明]
```

### When（実行フェーズ）のコメント
```gdscript
# 【実際の処理実行】: [どの機能/プロパティを操作するかを説明]
# 【処理内容】: [実行される処理の内容を日本語で説明]
```

### Then（検証フェーズ）のコメント
```gdscript
# 【結果検証】: [何を検証するかを具体的に説明]
# 【期待値確認】: [期待される結果とその理由を説明]
assert_eq(result.slot_count, 4, "slot_countはデフォルト4であるべき") # 【確認内容】: REQ-101のデフォルト値契約
```

> **注**: CraftResult/RecipeDefinition は副作用を持たないデータモデルのため、`before_each`/`after_each` による状態初期化・クリーンアップは不要（各テストはローカル変数で完結）。この点はコメントで明記する。

---

## 6. 要件定義との対応関係

- **参照した機能概要**: requirements.md 1章（RecipeDefinition＝静的定義/Resource、CraftResult＝実行時値オブジェクト/RefCounted）
- **参照した入力・出力仕様**: requirements.md 2.1（RecipeDefinition プロパティ表）、2.2（CraftResult プロパティ表）
- **参照した制約条件**: requirements.md 3章（1スクリプト1class_name、型安全性、Resource/RefCounted使い分け、`rejected_category` 無効値表現と数値TBDの本タスク委譲）
- **参照した使用例**: requirements.md 4章（基本パターン1〜4、エッジケースは本タスク対象外）
- **参照したEARS要件**: REQ-101, REQ-102, REQ-105, REQ-109, REQ-110, REQ-111, REQ-112, REQ-115
- **参照した設計文書**: data-model.md「レシピ定義（RecipeDefinition）」「調合結果（CraftResult）」、TASK-0012.md「単体テスト要件」テストケース1〜4、TASK-0011実装（trait_definition.gd の `Category` enum、material_instance.gd の `Quality` enum）

### 要件 → テストケース トレーサビリティ

| 要件ID | 対応テストケース |
|---|---|
| REQ-101（投入枠初期値4） | N-1 |
| REQ-109（基礎/最終貢献度） | N-2, B-2, B-3 |
| REQ-110（基礎/最終報酬） | N-2, B-2, B-3 |
| REQ-105（基礎品質） | N-4, N-5 |
| REQ-111（最終品質・下限D=1は対象外） | N-4, N-5 |
| REQ-112（同時発現の複数保持） | N-4, E-1, B-1, B-4 |
| id / display_name 保持 | N-3 |
| REQ-115（rejected_category） | **本タスク対象外**（型定義のみ、無効値依存テストは書かない） |

---

## テストケース一覧サマリー

| ID | 分類 | 対象クラス | テスト内容 | 信頼性 |
|---|---|---|---|---|
| N-1 | 正常系 | RecipeDefinition | slot_count デフォルト4（REQ-101） | 🔵 |
| N-2 | 正常系 | RecipeDefinition | base_contribution/base_reward 設定・取得 | 🟡 |
| N-3 | 正常系 | RecipeDefinition | id/display_name 設定・取得 | 🔵 |
| N-4 | 正常系 | CraftResult | 全フィールド保持＋activated_traits 2件（REQ-112） | 🔵 |
| N-5 | 正常系 | CraftResult | base_quality/final_quality 独立保持 | 🔵 |
| E-1 | 異常系 | CraftResult | activated_traits 3件でも例外を投げず保持 | 🟡 |
| B-1 | 境界値 | CraftResult | activated_traits デフォルト空配列 | 🔵 |
| B-2 | 境界値 | CraftResult | contribution/reward デフォルト0.0 | 🔵 |
| B-3 | 境界値 | RecipeDefinition | base_contribution/base_reward デフォルト0.0 | 🔵 |
| B-4 | 境界値 | CraftResult | activated_traits 1件保持（下限境界） | 🟡 |

**合計10ケース**（正常系5・異常系1・境界値4）
**信頼性分布**: 🔵 7ケース（70%）／🟡 3ケース（30%）／🔴 0ケース

---

## 品質判定

✅ **高品質**
- **テストケース分類**: 正常系・異常系・境界値をすべて網羅（RecipeDefinition 4件 / CraftResult 6件）
- **期待値定義**: 各テストケースの期待値が具体的（`== 4`, `size() == 2`, `== 0.0` 等）で明確
- **技術選択**: GDScript（Godot 4.7）+ GUT 9.6.1 に確定。既存 TASK-0011 テストと同一構成
- **実装可能性**: data-model.md記載の型定義をそのまま器として実装するため確実。計算ロジック・無効値表現は明示的に対象外とし範囲が明確
- **信頼性レベル**: 🔵 が7割、🔴 なし

---

## 次のステップ

次のお勧めステップ: `/tsumiki:tdd-red atelier-alchemy-core TASK-0012` でRedフェーズ（失敗テスト作成）を開始します。
