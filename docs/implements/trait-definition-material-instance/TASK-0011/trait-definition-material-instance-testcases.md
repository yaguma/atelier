# TASK-0011 テストケース定義書: データモデル実装（TraitDefinition, MaterialInstance）

**機能名**: trait-definition-material-instance
**タスクID**: TASK-0011
**要件名**: atelier-alchemy-core
**フェーズ**: Phase 3 - 調合コアロジック（★核心）
**技術スタック**: Godot 4.7 + GDScript / GUT 9.6.1

**【信頼性レベル凡例】**:
- 🔵 **青信号**: EARS要件定義書・設計文書を参考にしてほぼ推測していない
- 🟡 **黄信号**: EARS要件定義書・設計文書から妥当な推測
- 🔴 **赤信号**: EARS要件定義書・設計文書にない推測

---

## 0. テスト対象と方針

- **対象クラス**:
  - `TraitDefinition`（`Resource`継承。特性タグの静的定義マスターデータ）
  - `MaterialInstance`（`RefCounted`継承。品質・特性を保持する実行時インスタンス）
- **実装ファイル**:
  - `atelier-godot/features/alchemy/data/trait_definition.gd`
  - `atelier-godot/features/alchemy/data/material_instance.gd`
- **テストファイル**:
  - `atelier-godot/tests/unit/features/alchemy/trait_definition_test.gd`（TD系）
  - `atelier-godot/tests/unit/features/alchemy/material_instance_test.gd`（MI系）
- **方針**: 本タスクはデータ保持のみを担う純粋データ層であり、計算・変換ロジックは含まない（TASK-0013以降）。よって「プロパティが指定値をそのまま保持するか」「デフォルト値が定義通りか」の検証が中心となる。副作用が無いため `before_each` によるグローバル状態初期化は不要で、各テストはローカル変数のみで完結し、テスト間の依存を持たない。

---

## 1. 正常系テストケース（基本的な動作）

### N-1: TraitDefinitionの3分類（Category）が正しく区別できる 🔵

- **テスト名**: TraitDefinitionのCategory 3分類（CONTRIBUTION/REWARD/SUPPORT）を相互に区別できる
  - **何をテストするか**: `category` プロパティに設定した3種の分類がそのまま保持され、互いに異なる値として識別できること
  - **期待される動作**: 貢献度系・報酬系・補助系の3系統がenumで一意に表現され、混同されない
- **入力値**: `Category.CONTRIBUTION`, `Category.REWARD`, `Category.SUPPORT` をそれぞれ設定した3つの `TraitDefinition` インスタンス
  - **入力データの意味**: REQ-107（貢献度系/報酬系の分類）とREQ-108（補助系の分離）が要求する3系統をすべて代表する最小構成
- **期待される結果**:
  - 各インスタンスの `category` が設定した値と一致する
  - 3つの `category` 値が互いに不一致（`CONTRIBUTION != REWARD != SUPPORT`）
  - **期待結果の理由**: `category` は後続の系統排他制御（REQ-115, TASK-0015）の判定基盤であり、3系統が確実に区別できることが必須
- **テストの目的**: 3分類を保持・識別できる型設計になっていることの確認
  - **確認ポイント**: enumが3値を持ち、それぞれが異なる整数値にマップされていること
- 🔵 **信頼性**: REQ-107・REQ-108、data-model.md「TraitDefinition」、TASK-0011.md テストケース1に明記

### N-2: TraitDefinitionのbonus_multiplierがデフォルト1.0である 🔵

- **テスト名**: bonus_multiplierを明示設定しない場合デフォルト値1.0を持つ
  - **何をテストするか**: `bonus_multiplier` の宣言時デフォルト値（`float = 1.0`）が正しく適用されること
  - **期待される動作**: `id`/`display_name`/`min_rank_to_reveal` のみ設定し `bonus_multiplier` を触らなければ `1.0` になる
- **入力値**: `id`, `display_name`, `min_rank_to_reveal` を設定し、`bonus_multiplier` は未設定の `TraitDefinition`
  - **入力データの意味**: 「倍率を上書きしない通常の特性」を代表するケース
- **期待される結果**: `bonus_multiplier == 1.0`
  - **期待結果の理由**: data-model.mdで `@export var bonus_multiplier: float = 1.0` と定義済み。ボーナス無しの中立値が1.0
- **テストの目的**: エクスポートプロパティのデフォルト値が意図通りに機能することの確認
  - **確認ポイント**: 浮動小数点の等値比較（`assert_almost_eq` または `1.0` の完全一致）
- 🔵 **信頼性**: data-model.mdの型定義、TASK-0011.md テストケース2に明記

### N-3: TraitDefinitionの全プロパティが指定値を保持する 🟡

- **テスト名**: id/display_name/category/min_rank_to_reveal を設定し値が保持される
  - **何をテストするか**: `@export` された各プロパティが代入した値をそのまま保持すること
  - **期待される動作**: 各プロパティが設定値と一致し、型（`StringName`/`String`/`Category`）が崩れない
- **入力値**: `id=&"seiketsu"`, `display_name="聖潔"`, `category=Category.CONTRIBUTION`, `min_rank_to_reveal=&"E"`
  - **入力データの意味**: `.tres` マスターデータとして定義される特性1件を代表する現実的な値
- **期待される結果**: 全プロパティが設定値と一致
  - **期待結果の理由**: マスターデータは Editor / `.tres` からの編集値を欠落なく保持する必要がある
- **テストの目的**: プロパティ定義の網羅性・型整合の確認
  - **確認ポイント**: `id` が `String` ではなく `StringName` として比較しても一致すること
- 🟡 **信頼性**: data-model.mdの型定義に基づく妥当な補完（TASK-0011.mdの6例には無いが完了条件の全プロパティ確認を担保）

### N-4: MaterialInstance._init()が明示引数で正しく初期化する 🔵

- **テスト名**: MaterialInstance.new(id, quality, traits) が各引数を反映する
  - **何をテストするか**: `_init` に渡した `id`/`quality`/`traits` がインスタンスへ正しく格納されること
  - **期待される動作**: `MaterialInstance.new("mat_001", Quality.A, [&"seiketsu"])` で各値が対応プロパティに設定される
- **入力値**: `id="mat_001"`, `quality=MaterialInstance.Quality.A`, `traits=[&"seiketsu"]`
  - **入力データの意味**: 品質A・特性1個という在庫個体の典型例
- **期待される結果**: `id=="mat_001"`, `quality==Quality.A`, `traits==[&"seiketsu"]`
  - **期待結果の理由**: data-model.mdの `_init` シグネチャどおりの代入が期待される
- **テストの目的**: コンストラクタによる初期化契約の確認
  - **確認ポイント**: `traits` が `Array[StringName]` として要素・順序を保持していること
- 🔵 **信頼性**: data-model.mdの `_init` シグネチャ、TASK-0011.md テストケース4に明記

### N-5: MaterialInstanceのseed_idが設定・保持できる 🟡

- **テスト名**: seed_id を設定すると保持される（由来する種の参照）
  - **何をテストするか**: `_init` の引数に含まれない `seed_id` を生成後に代入し、値が保持されること
  - **期待される動作**: `seed_id` が指定した `StringName` を保持する
- **入力値**: 生成後に `instance.seed_id = &"seed_holy_herb"` を代入
  - **入力データの意味**: 庭からの収穫元（種ID）を紐付ける在庫管理シナリオを代表
- **期待される結果**: `seed_id == &"seed_holy_herb"`
  - **期待結果の理由**: data-model.mdに `seed_id: StringName` が定義されており、在庫が由来種を辿れる必要がある
- **テストの目的**: `_init` 非対象プロパティも欠落なく定義されていることの確認
  - **確認ポイント**: 初期状態（未設定時）は空 `StringName`（`&""`）であること
- 🟡 **信頼性**: data-model.mdに `seed_id` の定義あり（🟡）。`_init` に含まれない点はrequirements.md 2.2の補完

---

## 2. 異常系テストケース（エラー・仕様境界の確認）

### E-1: 特性タグ3個以上を渡してもデータモデルは機械的に拒否せず保持する 🟡

- **テスト名**: traits 3個投入時も例外を投げず配列をそのまま保持する（拒否責務はロジック層）
  - **エラーケースの概要**: REQ-104は「0〜2個」を規定するが、データモデル層で3個以上を機械的に拒否する制約は設計文書に明記されていない。過剰投入時にクラッシュ・例外を起こさないことを確認する
  - **エラー処理の重要性**: 支配戦略防止（1素材が複数特性を無条件両取り）はロジック層 REQ-111/REQ-115（TASK-0015, 0016）の責務であり、データモデルはあくまで「入れ物」として堅牢に振る舞う必要がある。ここで例外を投げると後続ロジックの設計自由度を奪う
- **入力値**: `traits=[&"a", &"b", &"c"]`（3個）
  - **不正な理由**: REQ-104の想定範囲（0〜2個）を超える過剰保持であり、通常のマスターデータ生成では発生しない
  - **実際の発生シナリオ**: 将来のバグや不正データ、あるいはロジック層の中間状態で3個以上が一時的に渡るケース
- **期待される結果**: 例外・エラーを発生させず生成でき、`traits.size() == 3` として保持される
  - **エラーメッセージの内容**: 本タスクではメッセージ提示を行わない（拒否責務はロジック層）
  - **システムの安全性**: データモデルが破綻せず、過剰保持を後段が検出・是正できる状態を保つ
- **テストの目的**: データモデルが「0〜2個の保証範囲」外でも安全に動作し、拒否ロジックを内包しないことの確認
  - **品質保証の観点**: 責務分離（データ層 vs ロジック層）の境界を明示し、後続タスクの前提を固定する
- 🟡 **信頼性**: requirements.md 4.2注記・4.3、TASK-0011.md 注意事項（REQ-111/REQ-115はロジック層）に基づく妥当な推測

---

## 3. 境界値テストケース（最小値・最大値・省略時）

### B-1: MaterialInstanceの品質Enumが最小D=1・最大S=5の整数評価に一致する 🔵

- **テスト名**: Quality enum が D=1, C=2, B=3, A=4, S=5 に対応する
  - **境界値の意味**: 品質スコアの下限（D=1）と上限（S=5）が整数として正しくマップされることが、後続の平均品質計算（TASK-0013）の前提になる
  - **境界値での動作保証**: 中間値（C/B/A）を含め連続する1〜5に一致すること
- **入力値**: `Quality.D`, `Quality.C`, `Quality.B`, `Quality.A`, `Quality.S` を整数評価
  - **境界値選択の根拠**: REQ-103が「D〜S、スコア1〜5相当」と規定。最小・最大を含む全5値を検証
  - **実際の使用場面**: 品質平均・品質ペナルティ計算で enum を整数として演算するため、値のズレは全計算に波及する
- **期待される結果**: それぞれ `1, 2, 3, 4, 5` に一致
  - **境界での正確性**: `int(Quality.D) == 1` かつ `int(Quality.S) == 5`
  - **一貫した動作**: enum宣言順と整数値が連続的に一致する
- **テストの目的**: 品質スコアの数値マッピングが要件どおりであることの確認
  - **堅牢性の確認**: enum の暗黙のゼロ始まりではなく明示的な `D = 1` 始まりであること
- 🔵 **信頼性**: REQ-103、data-model.mdのQuality定義、TASK-0011.md テストケース3に明記

### B-2: MaterialInstanceのデフォルト引数省略時に既定値で初期化される 🔵

- **テスト名**: MaterialInstance.new() を引数なしで呼ぶと id=""/quality=D/traits=[] になる
  - **境界値の意味**: `_init` の全引数を省略した最小呼び出しが、定義済みデフォルトどおりに初期化される境界ケース
  - **境界値での動作保証**: 省略時と明示時の双方で一貫した初期状態を得られること
- **入力値**: 引数なしの `MaterialInstance.new()`
  - **境界値選択の根拠**: data-model.mdの `_init(p_id="", p_quality=Quality.D, p_traits=[])` の全デフォルトを検証する最小入力
  - **実際の使用場面**: プレースホルダー生成やテスト用ダミー個体の生成で引数省略が使われる
- **期待される結果**: `id == ""`, `quality == Quality.D`, `traits == []`（空配列）
  - **境界での正確性**: `traits` が `null` ではなく空の `Array[StringName]` であること
  - **一貫した動作**: 明示引数版（N-4）と初期化契約が矛盾しない
- **テストの目的**: デフォルト引数の定義が正しく機能することの確認
  - **堅牢性の確認**: 省略時に未初期化やnull参照を生まないこと
- 🔵 **信頼性**: data-model.mdの `_init` デフォルト引数、TASK-0011.md テストケース5に明記

### B-3: 特性タグ0個（下限）でMaterialInstanceを生成できる 🔵

- **テスト名**: traits=[]（0個）で正常生成でき size()==0 になる
  - **境界値の意味**: REQ-104が定める特性タグ個数レンジ「0〜2個」の**下限**
  - **境界値での動作保証**: 特性を持たない素材（水・鉱石など）も正当な在庫個体として成立すること
- **入力値**: `traits=[]`
  - **境界値選択の根拠**: 特性0個はREQ-104の下限であり、空配列集計の安全性の前提
  - **実際の使用場面**: 特性なし素材は現実の在庫の多数を占める
- **期待される結果**: 生成が成功し `traits.size() == 0`
  - **境界での正確性**: 空配列を保持し、要素アクセス無しでも破綻しない
  - **一貫した動作**: B-4（上限）と同一APIで生成できる
- **テストの目的**: 特性個数レンジ下限での生成保証
  - **堅牢性の確認**: 空配列が `null` に化けないこと
- 🔵 **信頼性**: REQ-104、requirements.md 4.2、TASK-0011.md テストケース6（下限）に明記

### B-4: 特性タグ2個（上限）でMaterialInstanceを生成できる 🔵

- **テスト名**: traits=[&"sei", &"kin"]（2個）で正常生成でき size()==2 になる
  - **境界値の意味**: REQ-104が定める特性タグ個数レンジ「0〜2個」の**上限**
  - **境界値での動作保証**: 貢献度系＋報酬系など2系統を持つ複合素材が成立すること
- **入力値**: `traits=[&"sei", &"kin"]`（1個の中間ケースも合わせ `[&"sei"]` を任意で追加検証可）
  - **境界値選択の根拠**: 特性2個はREQ-104の上限であり、複数特性の同時保持を代表する
  - **実際の使用場面**: 上位素材は複数特性を持ち、系統排他制御（REQ-115）の入力になる
- **期待される結果**: 生成が成功し `traits.size() == 2`、要素順序が入力と一致
  - **境界での正確性**: 2要素が欠落・重複なく保持される
  - **一貫した動作**: B-3（下限）と同一APIで生成できる
- **テストの目的**: 特性個数レンジ上限での生成保証
  - **堅牢性の確認**: 2要素の順序・内容が保持されること
- 🔵 **信頼性**: REQ-104、requirements.md 4.2、TASK-0011.md テストケース6（上限）に明記

---

## 4. 開発言語・フレームワーク

- **プログラミング言語**: GDScript（Godot 4.7）
  - **言語選択の理由**: NFR-301によりatelier-alchemy-coreの技術スタックがGodot 4.x + GDScriptに確定済み。`Resource`/`RefCounted` 継承、`@export`、enum、型付きArray（`Array[StringName]`）といった本タスク必須の言語機能を標準提供する
  - **テストに適した機能**: `class_name` と静的型ヒントにより、データモデルの型契約をコンパイル時に近い形で検証できる
- **テストフレームワーク**: GUT（Godot Unit Test）9.6.1
  - **フレームワーク選択の理由**: プロジェクト標準（`atelier-godot/addons/gut/`）。既存の `prototype_alchemy_resolver_test.gd` と同じ `extends GutTest` パターンで一貫性を保てる
  - **テスト実行環境**: Godot Editor の GUT ドック、または `godot --headless -s res://addons/gut/gut_cmdln.gd` によるCLI実行。検出対象は `tests/unit/` 以下の `*_test.gd`
- 🔵 **信頼性**: note.md「技術スタック」「テスト関連情報」、既存 `prototype_alchemy_resolver_test.gd` に明記

---

## 5. テストケース実装時の日本語コメント指針

既存 `prototype_alchemy_resolver_test.gd` の形式に準拠する。各 `test_xxx()` 関数の冒頭・Given/When/Then・各 `assert_*` に日本語コメントと信頼性レベルを付与する。

### テスト関数冒頭のコメント（例）

```gdscript
func test_categoryの3分類が区別できる() -> void:
    # 【テスト目的】: TraitDefinition.category が CONTRIBUTION/REWARD/SUPPORT の3系統を区別保持できることを確認する
    # 【テスト内容】: 3種の category を設定した TraitDefinition を生成し、各値と相互不一致を検証する
    # 【期待される動作】: 設定値がそのまま保持され、3値が互いに異なる
    # 🔵 信頼性: REQ-107/REQ-108、data-model.md より
```

### Given（準備フェーズ）のコメント

```gdscript
    # 【テストデータ準備】: 3系統を代表させるため各 Category を1つずつ設定する
    # 【初期条件設定】: Resource継承の TraitDefinition を new() で生成し category のみ差し替える
    # 【前提条件確認】: 副作用なしのためグローバル状態の初期化は不要
```

### When（実行フェーズ）のコメント

```gdscript
    # 【実際の処理実行】: category プロパティへアクセスする（データ保持の検証のみ、ロジック呼び出しなし）
    # 【処理内容】: 設定済みの category 値を読み取る
    # 【実行タイミング】: プロパティ設定直後に読み取り、保持性を確認する
```

### Then（検証フェーズ）のコメント

```gdscript
    # 【結果検証】: 各 category が設定値と一致し、かつ3値が相互に不一致であることを確認する
    # 【期待値確認】: CONTRIBUTION/REWARD/SUPPORT が別々の enum 値であること
    # 【品質保証】: 系統排他制御(REQ-115)の判定基盤が破綻しないことを保証する
    assert_eq(contribution.category, TraitDefinition.Category.CONTRIBUTION, "貢献度系が保持されるべき") # 【検証項目】: 🔵 CONTRIBUTIONの保持
    assert_ne(TraitDefinition.Category.CONTRIBUTION, TraitDefinition.Category.REWARD, "貢献度系と報酬系は別値であるべき") # 【検証項目】: 🔵 系統の相互区別
```

### セットアップ・クリーンアップ

```gdscript
# 本タスクのデータモデルは副作用を持たないため before_each / after_each による
# 状態初期化・復元は不要（各テストはローカル変数のみで完結し、テスト間依存なし）
```

---

## 6. 要件定義との対応関係

- **参照した機能概要**: requirements.md「1. 機能の概要」（TraitDefinition / MaterialInstance の役割）
- **参照した入力・出力仕様**: requirements.md「2.1 TraitDefinition」「2.2 MaterialInstance」（各プロパティの型・制約・デフォルト）
- **参照した制約条件**: requirements.md「3. 制約条件」（Functional Core分離、型付きArray、配置制約、スコープ外）
- **参照した使用例**: requirements.md「4.1 基本的な使用パターン」「4.2 境界値・特殊ケース」「4.3 エラー・注意ケース」
- **参照したEARS要件**: REQ-103（品質1〜5）、REQ-104（特性0〜2個）、REQ-107（貢献度系/報酬系）、REQ-108（補助系）、REQ-121〜124（段階的開示）、NFR-301（技術スタック確定）
- **参照した設計文書**: data-model.md（TraitDefinition/MaterialInstanceの完全型定義）、architecture.md（Functional Core/Imperative Shell分離）
- **参照した既存実装**: `atelier-godot/features/prototype/data/prototype_material_definitions.gd`（Quality/TraitCategory enum）、`atelier-godot/tests/unit/features/prototype/prototype_alchemy_resolver_test.gd`（GUTテストパターン）

---

## 7. テストケース一覧・分類サマリー

| ID | 対象 | テスト名 | 分類 | 信頼性 | 配置ファイル |
|----|------|---------|------|-------|------------|
| N-1 | TraitDefinition | Category 3分類の区別 | 正常系 | 🔵 | trait_definition_test.gd |
| N-2 | TraitDefinition | bonus_multiplier デフォルト1.0 | 正常系 | 🔵 | trait_definition_test.gd |
| N-3 | TraitDefinition | 全プロパティの保持 | 正常系 | 🟡 | trait_definition_test.gd |
| N-4 | MaterialInstance | _init() 明示引数初期化 | 正常系 | 🔵 | material_instance_test.gd |
| N-5 | MaterialInstance | seed_id の保持 | 正常系 | 🟡 | material_instance_test.gd |
| E-1 | MaterialInstance | traits 3個も拒否せず保持 | 異常系 | 🟡 | material_instance_test.gd |
| B-1 | MaterialInstance | Quality enum 1〜5対応（最小/最大） | 境界値 | 🔵 | material_instance_test.gd |
| B-2 | MaterialInstance | デフォルト引数省略時初期化 | 境界値 | 🔵 | material_instance_test.gd |
| B-3 | MaterialInstance | traits 0個（下限）生成 | 境界値 | 🔵 | material_instance_test.gd |
| B-4 | MaterialInstance | traits 2個（上限）生成 | 境界値 | 🔵 | material_instance_test.gd |

### 分類別内訳

- **正常系**: 5件（N-1〜N-5）
- **異常系**: 1件（E-1）
- **境界値**: 4件（B-1〜B-4）
- **合計**: 10件

### 信頼性レベル分布

- 🔵 **青信号**: 7件（70%）
- 🟡 **黄信号**: 3件（30%）— N-3（全プロパティ補完）、N-5（seed_id補完）、E-1（拒否責務のロジック層委譲）
- 🔴 **赤信号**: 0件（0%）

> **補足**: TASK-0011.mdの6テストケース例は本定義書に完全包含している（TC-1→N-1, TC-2→N-2, TC-3→B-1, TC-4→N-4, TC-5→B-2, TC-6→B-3/B-4に分割）。加えて全プロパティ保持（N-3）・seed_id保持（N-5）・過剰保持の非拒否（E-1）を網羅性向上のために追加した。

---

## 8. 品質判定

✅ **高品質**:
- **テストケース分類**: 正常系5・異常系1・境界値4で網羅済み
- **期待値定義**: 各テストケースで具体値（`1.0`, `Quality.D=1`, `size()==2` 等）を明示
- **技術選択**: GDScript + GUT 9.6.1 に確定
- **実装可能性**: data-model.mdの型定義をそのまま検証対象とするため確実
- **信頼性レベル**: 🔵が70%、🔴なし

---

**次のお勧めステップ**: `/tsumiki:tdd-red atelier-alchemy-core TASK-0011` でRedフェーズ（失敗テスト作成）を開始します。
