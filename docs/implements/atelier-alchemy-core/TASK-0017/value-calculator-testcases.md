# TASK-0017: ValueCalculator（貢献度/報酬算出）テストケース定義書

**機能名**: ValueCalculator（貢献度/報酬算出）
**タスクID**: TASK-0017
**要件名**: atelier-alchemy-core
**フェーズ**: Phase 3 - 調合コアロジック（★核心）
**作成日**: 2026-08-02
**テストファイル**: `tests/unit/features/alchemy/value_calculator_test.gd`
**対象実装**: `features/alchemy/logic/value_calculator.gd`（Redフェーズ時点では未実装）

---

## 0. テスト設計の前提・方針

### 0.1 テスト対象関数

```gdscript
class_name ValueCalculator
extends RefCounted

static func calculate_contribution(
    recipe: RecipeDefinition,
    final_quality: MaterialInstance.Quality,
    activated_traits: Array[TraitDefinition],
    daily_request: DailyRequest,
) -> float

static func calculate_reward(
    recipe: RecipeDefinition,
    final_quality: MaterialInstance.Quality,
    activated_traits: Array[TraitDefinition],
    daily_request: DailyRequest,
) -> float
```

### 0.2 検証の主眼（TBD係数への対応方針）🟡

- 各係数（`base_contribution` / `base_reward` / `trait.bonus_multiplier` / `daily_request.bonus_multiplier`）は全てTBD（requirements.md「未確定数値一覧」）。
- したがってテストは **係数の絶対値ではなく、乗算構造・系統ごとの独立性・境界での挙動** を検証する。
- テスト内では検証しやすいダミー値（`base_contribution=10.0`, `base_reward=20.0`, `bonus_multiplier=1.5/1.2/2.0` 等）を用いる。
- 浮動小数点比較は GUT の `assert_almost_eq(value, expected, tolerance)`（tolerance=0.001）を用いる。

### 0.3 DailyRequest 未実装への対応（申し送り1）🔴

- `DailyRequest` 型（`features/guild/data/daily_request.gd`）は本タスク着手時点で**未実装**（Phase 4 で作成予定）。
- ValueCalculator が参照するのは `required_recipe_id`（StringName）と `bonus_multiplier`（float）の **2フィールドのみ**。
- **テスト方針**: テストファイル内にローカルの **ダミー stub クラス**（`RefCounted` 継承、上記2フィールドを保持）を定義し、Duck typing で注入する。data-model.md の定義に準拠する。

```gdscript
# テストファイル内ローカル定義（DailyRequest本体が未実装のためのダミー）
class DummyDailyRequest extends RefCounted:
    var required_recipe_id: StringName = &""
    var bonus_multiplier: float = 1.5
    func _init(p_recipe_id: StringName = &"", p_bonus: float = 1.5) -> void:
        required_recipe_id = p_recipe_id
        bonus_multiplier = p_bonus
```

> **注意**: 対象関数の引数型注釈が `DailyRequest`（未定義クラス）だと Red フェーズでスクリプトがパースエラーになる可能性がある。Green フェーズ実装では引数型を一時的に `Variant`（型注釈省略）または Duck typing 前提とし、DailyRequest 実装後（Phase 4）に型を厳格化する方針を実装側 note に申し送る。テストダミーは上記2フィールドを持つため、型を緩めても計算は成立する。

### 0.4 テストヘルパー（既存 trait_activation_test.gd のファクトリパターンに準拠）

```gdscript
const RecipeDefinitionScript := preload("res://features/alchemy/data/recipe_definition.gd")
const TraitDefinitionScript := preload("res://features/alchemy/data/trait_definition.gd")
const MaterialInstanceScript := preload("res://features/alchemy/data/material_instance.gd")
const ValueCalculatorScript := preload("res://features/alchemy/logic/value_calculator.gd")

func _make_recipe(p_id: StringName, p_base_contribution: float, p_base_reward: float) -> RecipeDefinition:
    var r := RecipeDefinitionScript.new()
    r.id = p_id
    r.base_contribution = p_base_contribution
    r.base_reward = p_base_reward
    return r

func _make_trait(p_id: StringName, p_cat: int, p_bonus: float) -> TraitDefinition:
    var t := TraitDefinitionScript.new()
    t.id = p_id
    t.category = p_cat
    t.bonus_multiplier = p_bonus
    return t
```

### 0.5 品質倍率の暫定式（申し送り・🔴推測）

```
quality_multiplier = float(final_quality) / float(MaterialInstance.Quality.C)   # C(2)を基準1.0
```
| 品質 | enum値 | 倍率（暫定） |
|------|--------|-------------|
| D | 1 | 0.5 |
| C | 2 | 1.0（基準） |
| B | 3 | 1.5 |
| A | 4 | 2.0 |
| S | 5 | 2.5 |

- この式は設計文書に根拠がなく暫定。バランス調整で差し替え前提。テストは「この暫定式で期待値が出ること」を固定化し、変更時の差分検出点とする。

---

## 1. 正常系テストケース（基本的な動作）

### TC-N01: 発現特性なし・指定合致なしの基本ケース（貢献度）🟡

- **テスト名**: 発現特性なし・指定合致なしのとき貢献度は基礎貢献度×品質倍率のみになる
  - **何をテストするか**: 全ボーナス係数が無効化（1.0）される最小構成で、4係数乗算構造の骨格（基礎値×品質倍率）が正しいこと。
  - **期待される動作**: 貢献度系特性ボーナス=1.0、指定合致ボーナス=1.0となり、`基礎貢献度 × 品質倍率` のみが反映される。
- **入力値**: `recipe.base_contribution=10.0`、`final_quality=C(2)`、`activated_traits=[]`、`daily_request(required_recipe_id=&"other", bonus=1.5)`（recipe.id=&"test_recipe"と不一致）
  - **入力データの意味**: 特性・指定合致という「変動要因」を全て無効化し、乗算構造の土台だけを露出させる代表構成。
- **期待される結果**: `10.0`（= 10.0 × 1.0 × 1.0 × 1.0）
  - **期待結果の理由**: 品質C=基準倍率1.0、空配列→特性ボーナス1.0、不一致→合致ボーナス1.0。REQ-109の式より。
- **テストの目的**: 乗算構造の骨格検証（タスク単体テスト要件テストケース1に対応）
  - **確認ポイント**: 加算誤実装（10.0+α等）・係数取り違えがないこと。品質倍率が確実に乗算されること。
- 🟡 信頼性: TASK-0017.md 単体テスト要件テストケース1 / REQ-109

### TC-N02: 貢献度系特性ボーナスが貢献度計算にのみ反映される（系統独立性）🟡

- **テスト名**: 貢献度系と報酬系が混在しても貢献度計算には貢献度系ボーナスのみ寄与する
  - **何をテストするか**: `calculate_contribution` の系統フィルタリング。CONTRIBUTION特性のみを乗算し、REWARD特性を無視すること。
  - **期待される動作**: CONTRIBUTION(1.5)のみ乗算、REWARD(2.0)は無視。
- **入力値**: `recipe.base_contribution=10.0`、`final_quality=C(2)`、`activated_traits=[CONTRIBUTION(bonus=1.5), REWARD(bonus=2.0)]`、指定不一致
  - **入力データの意味**: TASK-0015の系統排他を経ず両系統を人為的に混在させ、本関数単体の系統フィルタを直接検証する。
- **期待される結果**: `15.0`（= 10.0 × 1.0 × 1.5 × 1.0）
  - **期待結果の理由**: REWARDの2.0が誤って乗算されると30.0になる。15.0であればREWARDが無視されている証拠。
- **テストの目的**: 系統独立性の検証（タスク単体テスト要件テストケース2に対応）
  - **確認ポイント**: REWARD特性が貢献度に混入しないこと（30.0でないこと）。
- 🟡 信頼性: TASK-0017.md 単体テスト要件テストケース2 / REQ-109

### TC-N03: 報酬系特性ボーナスが報酬計算にのみ反映される（TC-N02と対称）🟡

- **テスト名**: 貢献度系と報酬系が混在しても報酬計算には報酬系ボーナスのみ寄与する
  - **何をテストするか**: `calculate_reward` の系統フィルタリング。REWARD特性のみを乗算し、CONTRIBUTION特性を無視すること。
  - **期待される動作**: REWARD(2.0)のみ乗算、CONTRIBUTION(1.5)は無視。
- **入力値**: `recipe.base_reward=20.0`、`final_quality=C(2)`、`activated_traits=[CONTRIBUTION(bonus=1.5), REWARD(bonus=2.0)]`（TC-N02と同一構成）、指定不一致
  - **入力データの意味**: TC-N02の鏡像。系統フィルタが「CONTRIBUTION固定」等の誤実装でなく、両方向で正しく機能することを担保。
- **期待される結果**: `40.0`（= 20.0 × 1.0 × 2.0 × 1.0）
  - **期待結果の理由**: CONTRIBUTIONの1.5が誤って乗算されると30.0になる。40.0であればCONTRIBUTIONが無視されている証拠。
- **テストの目的**: 系統独立性の対称検証（タスク単体テスト要件テストケース3に対応）
  - **確認ポイント**: CONTRIBUTION特性が報酬に混入しないこと。貢献度側と報酬側の基礎値が独立参照されること。
- 🟡 信頼性: TASK-0017.md 単体テスト要件テストケース3 / REQ-110

### TC-N04: 指定合致調合物と一致する場合にボーナスが適用される（貢献度）🟡

- **テスト名**: daily_request.required_recipe_idがrecipe.idと一致すると指定合致ボーナスが乗算される
  - **何をテストするか**: 指定合致ボーナスの適用条件（`daily_request.required_recipe_id == recipe.id`）と乗算。
  - **期待される動作**: 合致時に `daily_request.bonus_multiplier` が乗算される。
- **入力値**: `recipe.id=&"test_recipe"`, `base_contribution=10.0`、`final_quality=C(2)`、`activated_traits=[]`、`daily_request(required_recipe_id=&"test_recipe", bonus=1.5)`（一致）
  - **入力データの意味**: 合致条件を成立させる最小構成。品質・特性を無効化し合致ボーナス単独の効果を露出。
- **期待される結果**: `15.0`（= 10.0 × 1.0 × 1.0 × 1.5）
  - **期待結果の理由**: 一致時のみ1.5が乗る。REQ-204 / REQ-109「指定合致ボーナス」より。
- **テストの目的**: 指定合致ボーナス適用の検証（タスク単体テスト要件テストケース4に対応）
  - **確認ポイント**: ID比較が正しいこと（不一致で1.0、一致で1.5に切り替わること）。
- 🟡 信頼性: TASK-0017.md 単体テスト要件テストケース4 / REQ-204, REQ-109

### TC-N05: 4係数すべてが同時に乗算される（複合ケース）🟡

- **テスト名**: 品質倍率・特性ボーナス・指定合致ボーナスが同時に働くと全て乗算される
  - **何をテストするか**: 4係数が同時に非1.0のとき、それらが独立に乗算されて最終値になること（乗算構造の完全形）。
  - **期待される動作**: 基礎貢献度 × 品質倍率 × 特性ボーナス × 合致ボーナス の全乗算。
- **入力値**: `recipe.id=&"test_recipe"`, `base_contribution=10.0`、`final_quality=B(3)`、`activated_traits=[CONTRIBUTION(bonus=1.5)]`、`daily_request(required_recipe_id=&"test_recipe", bonus=1.5)`（一致）
  - **入力データの意味**: 要件定義「例4」を特性ありに拡張した、全係数が有効な代表構成。
- **期待される結果**: `33.75`（= 10.0 × 1.5 × 1.5 × 1.5）
  - **期待結果の理由**: 品質B=倍率1.5、特性1.5、合致1.5。いずれかが欠落・加算化すると値がずれる。
- **テストの目的**: 乗算構造の完全形検証（4係数の独立乗算）
  - **確認ポイント**: どの係数も欠落せず、加算でなく乗算で結合されていること。
- 🟡 信頼性: requirements.md「例4」を拡張 / REQ-109

### TC-N06: 同一系統の複数特性ボーナスがすべて乗算される 🟡

- **テスト名**: 貢献度系特性が複数発現するとbonus_multiplierがすべて乗算される
  - **何をテストするか**: 該当カテゴリに複数特性がある場合、全ての `bonus_multiplier` を乗算すること（EDGE-E）。
  - **期待される動作**: CONTRIBUTION(1.5) × CONTRIBUTION(1.2) = 1.8 が特性ボーナスになる。
- **入力値**: `base_contribution=10.0`、`final_quality=C(2)`、`activated_traits=[CONTRIBUTION(bonus=1.5), CONTRIBUTION(bonus=1.2)]`、指定不一致
  - **入力データの意味**: 同系統複数発現（REQ-112）が価値計算で全乗算されることを検証する構成。
- **期待される結果**: `18.0`（= 10.0 × 1.0 × 1.8 × 1.0）
  - **期待結果の理由**: 1.5×1.2=1.8。最初の1件のみ採用（15.0）や加算（10.0×(1.5+1.2)）の誤実装を排除。
- **テストの目的**: 複数同系統特性の乗算集計検証
  - **確認ポイント**: 全特性が乗算されること（先頭のみ・加算でないこと）。
- 🟡 信頼性: requirements.md EDGE-E / note.md 付録 例2

---

## 2. 異常系・エッジテストケース（無効化・退化入力のハンドリング）

### TC-E01: 発現特性が空配列のとき特性ボーナスは1.0で無効化される 🟡

- **テスト名**: activated_traitsが空配列のとき特性ボーナスは1.0になる
  - **エラーケースの概要**: 特性が1件も発現しなかった調合（退化入力）。
  - **エラー処理の重要性**: 空配列で特性ボーナスが0.0や未定義になると結果が0.0や例外になり、価値計算が破綻する。
- **入力値**: `base_contribution=10.0`、`final_quality=C(2)`、`activated_traits=[]`、指定不一致
  - **不正な理由**: 不正ではないが「該当特性0件」の代表退化ケース。
  - **実際の発生シナリオ**: 無特性素材のみでの調合、閾値未達で特性が発現しなかった場合。
- **期待される結果**: `10.0`（特性ボーナス=1.0で無効化）
  - **エラーメッセージの内容**: 例外を投げず決定論的に値を返す。
  - **システムの安全性**: 空配列でクラッシュせず、乗算の中立値1.0で処理される。
- **テストの目的**: 空配列に対する堅牢性（1.0無効化）の確認
  - **品質保証の観点**: 乗算の初期値が1.0であること（0.0初期化バグの検出）。
- 🟡 信頼性: requirements.md EDGE-A / タスク完了条件「ボーナス倍率は1.0（無効化）」

### TC-E02: SUPPORT特性は貢献度・報酬いずれのボーナスにも寄与しない 🟡

- **テスト名**: SUPPORT特性のみのとき貢献度・報酬ともに特性ボーナスは1.0になる
  - **エラーケースの概要**: 触媒（SUPPORT）のみが発現した状態。SUPPORTはボーナス系統に属さない。
  - **エラー処理の重要性**: SUPPORTを誤ってCONTRIBUTION/REWARDに含めると価値が過大評価される。
- **入力値**: `base_contribution=10.0`, `base_reward=20.0`、`final_quality=C(2)`、`activated_traits=[SUPPORT(bonus=2.0)]`、指定不一致
  - **不正な理由**: SUPPORTはREQ-108で品質補正専用。価値ボーナスには寄与しない。
  - **実際の発生シナリオ**: 触媒を投入して品質を底上げした調合。
- **期待される結果**: `calculate_contribution=10.0`、`calculate_reward=20.0`（いずれも特性ボーナス1.0）
  - **システムの安全性**: SUPPORTのbonus_multiplier=2.0が両計算とも無視される。
- **テストの目的**: SUPPORTカテゴリのフィルタ除外検証（EDGE-F）
  - **品質保証の観点**: フィルタが「CONTRIBUTION/REWARDのみ通過」で実装され、SUPPORTが漏れないこと。
- 🟡 信頼性: requirements.md EDGE-F / REQ-108（SUPPORT=補助系）

### TC-E03: 反対系統のみのとき当該計算の特性ボーナスは1.0になる 🟡

- **テスト名**: 貢献度計算で報酬系特性のみが存在すると特性ボーナスは1.0になる
  - **エラーケースの概要**: `calculate_contribution` に REWARD 特性のみが渡された（該当系統0件）。
  - **エラー処理の重要性**: 該当系統0件を1.0で無効化できないと、反対系統の値が誤って混入する。
- **入力値**: `base_contribution=10.0`、`final_quality=C(2)`、`activated_traits=[REWARD(bonus=2.0)]`、指定不一致
  - **不正な理由**: 貢献度計算にとってREWARDは該当外カテゴリ。
  - **実際の発生シナリオ**: 報酬系に偏った調合物を貢献度目的で納品するケース。
- **期待される結果**: `10.0`（該当CONTRIBUTION 0件 → 特性ボーナス1.0）
  - **システムの安全性**: 該当0件でも1.0中立値で安全に処理。
- **テストの目的**: 該当カテゴリ0件時の1.0無効化検証（EDGE-B）
  - **品質保証の観点**: TC-N02とは別に「該当0件」の縮退を単独検証（フィルタ結果空→1.0）。
- 🟡 信頼性: requirements.md EDGE-B

---

## 3. 境界値テストケース（最小値・最大値・ゼロ値）

### TC-B01: 基礎貢献度が0.0のとき結果は0.0になる（ゼロ値）🟡

- **テスト名**: base_contributionが0.0なら他の係数に関わらず貢献度は0.0になる
  - **境界値の意味**: 乗算構造では基礎値0が結果0を支配する（吸収要素）。RecipeDefinitionのbase_contribution初期値は0.0。
  - **境界値での動作保証**: 未設定レシピ（デフォルト0.0）でも例外なく0.0を返す。
- **入力値**: `base_contribution=0.0`、`final_quality=S(5)`、`activated_traits=[CONTRIBUTION(bonus=1.5)]`、`daily_request`一致(bonus=1.5)
  - **境界値選択の根拠**: 他係数を全て非1.0にしても、基礎値0が全体を0にすることを確認。
  - **実際の使用場面**: base値未設定のマスターデータ、初期化直後のRecipeDefinition。
- **期待される結果**: `0.0`（= 0.0 × 2.5 × 1.5 × 1.5）
  - **境界での正確性**: 乗算の吸収要素が正しく機能する。
- **テストの目的**: ゼロ値の乗算吸収検証（EDGE-C）
  - **堅牢性の確認**: 0除算等の派生バグがないこと。
- 🟡 信頼性: requirements.md EDGE-C / RecipeDefinition.base_contribution 既定値0.0

### TC-B02: 品質下限D(1)のとき品質倍率は0.5になる 🔴

- **テスト名**: final_qualityがD(1)のとき品質倍率0.5が適用される
  - **境界値の意味**: 品質enumの下限（D=1）。暫定式で最小倍率となる境界。
  - **境界値での動作保証**: 最低品質でも計算が破綻せず、暫定式どおり0.5倍になる。
- **入力値**: `base_contribution=10.0`、`final_quality=D(1)`、`activated_traits=[]`、指定不一致
  - **境界値選択の根拠**: `float(1)/float(2)=0.5`。品質倍率の下限を固定化。
  - **実際の使用場面**: 特性過多で品質ペナルティを受け最終品質がDに落ちた調合物。
- **期待される結果**: `5.0`（= 10.0 × 0.5 × 1.0 × 1.0）
  - **境界での正確性**: 暫定式 `float(final_quality)/float(Quality.C)` が下限で正しく機能。
- **テストの目的**: 品質倍率下限の検証（EDGE-D、暫定式の差分検出点）
  - **堅牢性の確認**: 整数除算でなく浮動小数点除算になっていること（1/2=0でない）。
- 🔴 信頼性: 品質倍率式が設計文書に根拠なく暫定（申し送り・requirements.md EDGE-D）

### TC-B03: 品質上限S(5)のとき品質倍率は2.5になる 🔴

- **テスト名**: final_qualityがS(5)のとき品質倍率2.5が適用される
  - **境界値の意味**: 品質enumの上限（S=5）。暫定式で最大倍率となる境界。
  - **境界値での動作保証**: 最高品質でも暫定式どおり2.5倍になる。
- **入力値**: `base_reward=20.0`、`final_quality=S(5)`、`activated_traits=[]`、指定不一致（`calculate_reward`で検証）
  - **境界値選択の根拠**: `float(5)/float(2)=2.5`。品質倍率の上限を固定化。報酬側でも品質倍率が同一適用されることを併せて検証。
  - **実際の使用場面**: 高品質素材＋触媒でSまで到達した高価値調合物。
- **期待される結果**: `50.0`（= 20.0 × 2.5 × 1.0 × 1.0）
  - **境界での正確性**: 暫定式が上限で正しく機能し、報酬計算でも品質倍率が共有される。
- **テストの目的**: 品質倍率上限の検証＋報酬側の品質倍率適用（EDGE-D）
  - **堅牢性の確認**: 倍率の上限クリップ等の誤実装がないこと。
- 🔴 信頼性: 品質倍率式が暫定（申し送り・requirements.md EDGE-D）

### TC-B04: 品質基準C(2)のとき品質倍率は1.0になる（基準点）🔵

- **テスト名**: final_qualityがC(2)のとき品質倍率は基準値1.0になる
  - **境界値の意味**: 暫定式の基準点（分母＝Quality.C）。倍率がちょうど1.0になる中心境界。
  - **境界値での動作保証**: 基準品質で他係数が素通し（品質倍率が結果を変えない）。
- **入力値**: `base_contribution=10.0`、`final_quality=C(2)`、`activated_traits=[]`、指定不一致
  - **境界値選択の根拠**: `float(2)/float(2)=1.0`。基準点を明示的に固定（TC-N01と同値だが品質倍率=1.0の意図を独立検証）。
  - **実際の使用場面**: 標準品質の調合物。
- **期待される結果**: `10.0`（= 10.0 × 1.0 × 1.0 × 1.0）
  - **一貫した動作**: 基準点でD(0.5)・B(1.5)の中間かつちょうど1.0であること。
- **テストの目的**: 品質倍率の基準点検証（TC-B02/B03と連続性を持つ中心境界）
  - **堅牢性の確認**: 基準点で倍率が1.0に正規化されること。
- 🔵 信頼性: 「品質Cを基準1.0とする」定義自体は明示 / requirements.md

---

## 4. 開発言語・フレームワーク

- **プログラミング言語**: GDScript 4.x
  - **言語選択の理由**: プロジェクトがGodot 4.7 + GDScriptへ全面移行済み（CLAUDE.md）。実装対象がGDScriptの純粋関数のため。
  - **テストに適した機能**: `static func` による純粋関数、`preload` によるスクリプト参照、明示的型注釈。
- **テストフレームワーク**: GUT (Godot Unit Test) 9.6.1
  - **フレームワーク選択の理由**: プロジェクト標準のGDScript向けユニットテストフレームワーク（既存 alchemy テスト群が全てGUT）。
  - **テスト実行環境**: `cd atelier-godot && ./addons/gut/gut.gd tests/unit/features/alchemy/value_calculator_test.gd`（またはGUTパネル）。
- **主要アサーション**:
  - `assert_almost_eq(value, expected, 0.001)` — 浮動小数点の乗算結果比較（本テストの主軸）
  - `assert_eq(value, expected)` — 完全一致（0.0等）
- 🔵 信頼性: note.md「5.1〜5.3 テストフレームワーク設定・構造例」/ 既存 trait_activation_test.gd

---

## 5. テスト実装時の日本語コメント指針

各テスト関数の冒頭・Given/When/Then・各assertに以下の日本語コメントを必ず付与する（既存 trait_activation_test.gd に準拠）。

```gdscript
func test_発現特性なし指定合致なしで基礎貢献度と品質倍率のみ反映される() -> void:
    # 【テスト目的】: 全ボーナスが1.0で無効化される最小構成で乗算構造の骨格を検証する
    # 【テスト内容】: base_contribution=10.0, 品質C, 特性空, 指定不一致 で calculate_contribution
    # 【期待される動作】: 10.0 × 1.0(品質) × 1.0(特性) × 1.0(合致) = 10.0
    # 🟡 信頼性: TASK-0017.md 単体テスト要件テストケース1 / REQ-109

    # 【テストデータ準備】: 検証しやすいダミー基礎値10.0のレシピを用意する
    # 【初期条件設定】: 特性・指定合致という変動要因を全て無効化した土台構成
    var recipe := _make_recipe(&"test_recipe", 10.0, 20.0)
    var traits: Array[TraitDefinition] = []
    var daily := DummyDailyRequest.new(&"other", 1.5)  # recipe.idと不一致

    # 【実際の処理実行】: 貢献度算出の純粋関数を呼び出す
    # 【処理内容】: 基礎貢献度 × 品質倍率 × 貢献度系ボーナス × 指定合致ボーナス
    var result: float = ValueCalculatorScript.calculate_contribution(
        recipe, MaterialInstanceScript.Quality.C, traits, daily)

    # 【結果検証】: 乗算構造の骨格（基礎値×品質倍率）だけが反映されることを確認する
    # 【期待値確認】: 10.0 であれば加算誤実装・係数取り違えがない
    assert_almost_eq(result, 10.0, 0.001, "全ボーナス無効化で基礎貢献度×品質倍率のみ")  # 🟡
```

---

## 6. 要件定義との対応関係

| テストケース | 対応要件/受け入れ基準 | 検証観点 | 信頼性 |
|-------------|---------------------|---------|--------|
| TC-N01 | REQ-109 / TC-109-N01 / タスクTC1 | 乗算構造の骨格（係数1.0固定） | 🟡 |
| TC-N02 | REQ-109 / TC-109-N02 / タスクTC2 | 貢献度系フィルタ（系統独立性） | 🟡 |
| TC-N03 | REQ-110 / TC-109-N03 / タスクTC3 | 報酬系フィルタ（TC-N02対称） | 🟡 |
| TC-N04 | REQ-204, REQ-109 / TC-109-N04 / タスクTC4 | 指定合致ボーナス適用 | 🟡 |
| TC-N05 | REQ-109 / requirements 例4 | 4係数同時乗算（完全形） | 🟡 |
| TC-N06 | REQ-112 / EDGE-E / note 例2 | 同系統複数特性の全乗算 | 🟡 |
| TC-E01 | EDGE-A / 完了条件 | 空配列→特性ボーナス1.0 | 🟡 |
| TC-E02 | REQ-108 / EDGE-F | SUPPORTは両系統に非寄与 | 🟡 |
| TC-E03 | EDGE-B | 該当系統0件→1.0無効化 | 🟡 |
| TC-B01 | EDGE-C | ゼロ基礎値の乗算吸収 | 🟡 |
| TC-B02 | EDGE-D | 品質下限D→倍率0.5 | 🔴 |
| TC-B03 | EDGE-D | 品質上限S→倍率2.5（報酬側） | 🔴 |
| TC-B04 | REQ-109（品質倍率基準） | 品質基準C→倍率1.0 | 🔵 |

- **参照した機能概要**: requirements.md「1. 機能の概要」（4係数乗算の純粋関数）
- **参照した入力・出力仕様**: requirements.md「2. 入力・出力の仕様」（計算式・型・フィルタ条件）
- **参照した制約条件**: requirements.md「3. 制約条件」（純粋関数・系統独立性・TBD係数）
- **参照した使用例**: requirements.md「4. 想定される使用例」（例1〜4、EDGE-A〜F）

---

## 7. テストケース数サマリー

| 分類 | 件数 | テストID |
|------|------|---------|
| 正常系 | 6 | TC-N01〜TC-N06 |
| 異常系・エッジ | 3 | TC-E01〜TC-E03 |
| 境界値 | 4 | TC-B01〜TC-B04 |
| **合計** | **13** | |

### 信頼性レベル分布

| レベル | 件数 | 内訳 |
|--------|------|------|
| 🔵 青 | 1 | TC-B04（品質基準1.0定義） |
| 🟡 黄 | 9 | TC-N01〜N06, TC-E01〜E03, TC-B01 |
| 🔴 赤 | 3 | TC-B02, TC-B03（品質倍率暫定式）※TC-B01は🟡 |

> 注: 🟡が多いのは、各係数値がTBDのため。式の乗算構造・系統独立性はREQ-109/110に明記され検証可能。🔴の2件は品質倍率変換式が設計文書に根拠のない暫定式であることに起因（バランス調整時の差分検出点として固定化）。

---

## 8. 未解決事項の申し送り（実装フェーズへ）

1. **DailyRequest未実装（🔴）**: テストはローカルダミー stub で代替。実装側の引数型注釈は Phase 4 で `DailyRequest` に厳格化する前提。Green フェーズでは型を緩めるか Duck typing 対応にする。
2. **品質倍率式が暫定（🔴）**: `float(final_quality)/float(Quality.C)` は根拠なし。`game_balance.gd` への定数/関数切り出しを推奨（TC-B02〜B04が差し替え時の回帰検出点）。
3. **指定合致ボーナスの二重適用疑義（🔴）**: alchemy側（本タスク）とguild側（delivery_calculator.gd）で合致ボーナスが重複適用される可能性。Phase 4着手前に責務を一方へ統一する設計確定が必須（本テストはREQ-109/110どおりalchemy側で適用する前提で作成）。
