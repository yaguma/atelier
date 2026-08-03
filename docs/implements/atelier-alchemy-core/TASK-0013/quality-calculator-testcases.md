# TASK-0013 TDDテストケース定義書: QualityCalculator.calculate_base_quality

**機能名**: 基礎品質算出（QualityCalculator.calculate_base_quality）
**タスクID**: TASK-0013
**要件名**: atelier-alchemy-core
**作成日**: 2026-07-31
**フェーズ**: Phase 3 - 調合コアロジック（★核心）
**対象実装**: `atelier-godot/features/alchemy/logic/quality_calculator.gd`
**テストファイル**: `atelier-godot/tests/unit/features/alchemy/quality_calculator_test.gd`

---

## 0. テスト対象の前提

- 🔵 被テスト関数: `static func calculate_base_quality(materials: Array[MaterialInstance]) -> float`
- 🔵 `MaterialInstance`（TASK-0012実装済み）を素材個体として利用する。
  - コンストラクタ: `MaterialInstance.new(p_id: String = "", p_quality: Quality = Quality.D, p_traits: Array[StringName] = [])`
  - `Quality` enum: `D=1, C=2, B=3, A=4, S=5`（整数評価でスコア1〜5に一致）
  - 本関数が使用するのは `quality`（int）のみ。`traits` は未使用。
- 🔵 期待値の算術: `戻り値 = (Σ int(materials[i].quality)) / materials.size()`。ただし `size()==0` の場合は `0.0`。
- 🟡 浮動小数点比較には GUT の `assert_almost_eq(got, expected, error_interval)` を用いる（非終端小数の精度対策）。整数割り切れケースでも精度誤差を許容するため一貫して使用する。

---

## 1. 正常系テストケース（基本的な動作）

### 1-1. 品質のみが異なる無特性素材4個の基礎品質算出（TC-101-01）

- **テスト名**: 品質D/C/B/Aの無特性素材4個の平均が2.5になる
  - **何をテストするか**: 異なる品質値を持つ複数素材の算術平均が正しく算出されること
  - **期待される動作**: `(1+2+3+4)/4 = 2.5` を `float` で返す
- **入力値**: `[MaterialInstance(quality=D(1)), C(2), B(3), A(4)]`（traitsは全て空配列）
  - **入力データの意味**: 受け入れ基準TC-101-01の代表ケース。品質が全て異なり、平均が非整数（2.5）になる基本形
- **期待される結果**: `2.5`
  - **期待結果の理由**: REQ-105「基礎品質＝投入素材の平均品質」に基づく算術平均。int合計10 ÷ 4 = 2.5
- **テストの目的**: 平均値計算の正確性、特に非整数結果を保持できること（float採用の妥当性）を確認する
  - **確認ポイント**: 整数除算で切り捨てられず 2.5 を保持すること（`10/4` が `2` にならないこと）
- 🔵 信頼性: acceptance-criteria.md TC-101-01、TASK-0013.md「単体テスト要件」に直接根拠あり

### 1-2. 単一素材投入時は素材自体の品質と一致する

- **テスト名**: 品質S素材1個のみ投入時に5.0を返す
  - **何をテストするか**: 要素数1の場合、平均がその素材の品質値そのものになること
  - **期待される動作**: `5/1 = 5.0` を返す
- **入力値**: `[MaterialInstance(quality=S(5))]`
  - **入力データの意味**: 単一要素の平均は自身に一致するという算術的性質の確認。品質上限Sを代表値に採用
- **期待される結果**: `5.0`
  - **期待結果の理由**: 要素が1個なので合計＝その要素、除数＝1、平均＝5.0
- **テストの目的**: 素材1個の縮退ケースで正しく動作すること
  - **確認ポイント**: 1要素でもゼロ除算・丸め誤りが起きないこと
- 🟡 信頼性: REQ-105の平均計算からの妥当な推測（TASK-0013.md 単体テスト要件2）

### 1-3. 同一品質の素材のみを投入した場合

- **テスト名**: 品質B素材4個投入時に3.0を返す
  - **何をテストするか**: 全素材が同一品質の場合、平均がその品質値に一致すること
  - **期待される動作**: `(3+3+3+3)/4 = 3.0` を返す
- **入力値**: `[MaterialInstance(quality=B(3)) × 4]`
  - **入力データの意味**: 非整数にならない一般的な複数素材ケースの網羅。中間品質Bを採用
- **期待される結果**: `3.0`
  - **期待結果の理由**: 合計12 ÷ 4 = 3.0
- **テストの目的**: 割り切れる複数素材ケースで正確に動作すること
  - **確認ポイント**: 割り切れる場合に 3.0 として返る（3 や 3.something にならない）
- 🟡 信頼性: REQ-105からの妥当な推測（TASK-0013.md 単体テスト要件3）

### 1-4. 特性を持つ素材でも品質値のみで平均が算出される

- **テスト名**: traits付き素材でも平均計算にtraitsが影響しない
  - **何をテストするか**: 本関数が `quality` のみを参照し、`traits` を計算に含めないこと
  - **期待される動作**: traitsの有無・個数にかかわらず、品質値のみで平均を返す
- **入力値**: `[MaterialInstance(quality=C(2), traits=[&"sei",&"kin"]), MaterialInstance(quality=A(4), traits=[&"holy"])]`
  - **入力データの意味**: 特性ペナルティ（TASK-0016の責務）と基礎品質算出の責務分離を明示的に検証する
- **期待される結果**: `3.0`（`(2+4)/2`）
  - **期待結果の理由**: 特性は本関数の対象外。品質2と4の平均3.0のみが返る
- **テストの目的**: 責務分離（本関数はtraitsを一切使わない）を保証する
  - **確認ポイント**: traitsが結果を変えないこと（特性数で除算や補正が入っていないこと）
- 🟡 信頼性: requirements.md「本関数が使用するプロパティ: qualityのみ。traitsは未使用」からの妥当な推測

---

## 2. 異常系テストケース（エラーハンドリング）

### 2-1. 空配列を投入した場合にクラッシュせず0.0を返す

- **テスト名**: 空配列投入時に例外を出さず0.0を返す
  - **エラーケースの概要**: 投入素材が0個（`[]`）の状態で呼び出される異常入力
  - **エラー処理の重要性**: 素朴な実装では `size()==0` によるゼロ除算でクラッシュしうる。防御的に0.0を返す必要がある
- **入力値**: `[]`（空の `Array[MaterialInstance]`）
  - **不正な理由**: EDGE-001「投入枠に素材が1つもない状態」に相当。平均の定義（合計÷個数）が成立しない
  - **実際の発生シナリオ**: オーケストレーター（TASK-0018）やUI（TASK-0020）のガードをすり抜けて空配列が渡るケース、または本関数を単体で誤用したケース
- **期待される結果**: 例外・クラッシュが発生せず `0.0` が返る
  - **エラーメッセージの内容**: 本関数は例外を投げず、防御的に既定値0.0を返す（呼び出し側が空チェックを行う前提）
  - **システムの安全性**: ゼロ除算を回避し、後続処理へ安全な数値を引き継ぐ
- **テストの目的**: 空配列に対する防御的実装（0.0返却・非クラッシュ）を確認する
  - **品質保証の観点**: Functional Coreがどんな入力でも破綻しない堅牢性を担保する
- 🟡 信頼性: EDGE-001、requirements.md「空配列時の戻り値: 0.0」からの妥当な推測（TASK-0013.md 単体テスト要件4）

---

## 3. 境界値テストケース（最小値、最大値、精度）

### 3-1. 全素材が品質下限D(1)のみの場合

- **テスト名**: 品質D素材のみの平均が下限1.0になる
  - **境界値の意味**: 品質スコアの下限D=1。取りうる最小の基礎品質を確認する
  - **境界値での動作保証**: 下限が丸め落ちせず正しく1.0になること
- **入力値**: `[MaterialInstance(quality=D(1)) × 3]`
  - **境界値選択の根拠**: data-model.mdの品質下限D=1。基礎品質が取りうる最小値を代表する
  - **実際の使用場面**: 低品質素材ばかりを投入した調合。ペナルティ適用前の最低ラインを表す
- **期待される結果**: `1.0`
  - **境界での正確性**: 合計3 ÷ 3 = 1.0
  - **一貫した動作**: 下限値でも通常の平均計算式が成立する
- **テストの目的**: 品質下限での正確性・堅牢性を確認する
  - **堅牢性の確認**: 最小スコアでも0や負値に落ちないこと
- 🟡 信頼性: data-model.md（Quality下限D=1）、REQ-105からの妥当な推測

### 3-2. 全素材が品質上限S(5)のみの場合

- **テスト名**: 品質S素材のみの平均が上限5.0になる
  - **境界値の意味**: 品質スコアの上限S=5。取りうる最大の基礎品質を確認する
  - **境界値での動作保証**: 上限が正しく5.0になること
- **入力値**: `[MaterialInstance(quality=S(5)) × 3]`
  - **境界値選択の根拠**: data-model.mdの品質上限S=5。基礎品質が取りうる最大値を代表する
  - **実際の使用場面**: 最高品質素材のみでの調合。ペナルティ適用前の最高ラインを表す
- **期待される結果**: `5.0`
  - **境界での正確性**: 合計15 ÷ 3 = 5.0
  - **一貫した動作**: 上限値でも通常の平均計算式が成立する
- **テストの目的**: 品質上限での正確性を確認する
  - **堅牢性の確認**: 最大スコアでも上限を超えたり丸め誤差が出たりしないこと
- 🟡 信頼性: data-model.md（Quality上限S=5）、REQ-105からの妥当な推測

### 3-3. 非終端小数となる平均の浮動小数点精度

- **テスト名**: 割り切れない平均でも精度を保ったfloatを返す
  - **境界値の意味**: 整数合計が要素数で割り切れず、循環小数（1/3系）になる境界
  - **境界値での動作保証**: 整数除算による切り捨てが起きず、float精度で近似値を返すこと
- **入力値**: `[MaterialInstance(quality=D(1)), D(1), S(5)]`（合計7、要素3）
  - **境界値選択の根拠**: `7/3 = 2.333...` という非終端小数を意図的に発生させ、int除算の罠（`7/3==2`）を検出する
  - **実際の使用場面**: 品質のばらついた3個素材の調合。実運用で頻出する割り切れないケース
- **期待される結果**: `2.3333...`（`assert_almost_eq(result, 7.0/3.0, 0.0001)` で検証）
  - **境界での正確性**: 整数除算で `2` に切り捨てられないこと
  - **一貫した動作**: floatとして期待値 7/3 の許容誤差内に収まること
- **テストの目的**: float採用の実効性（整数除算バグの検出）と精度を確認する
  - **堅牢性の確認**: 実装が `float(sum)/size` 相当で計算していること（`int/int` のまま返していないこと）
- 🔴 信頼性: 元資料に明示されない追加ケース。ただしfloat採用の妥当性検証として有用な合理的補完

---

## 4. 開発言語・フレームワーク

- **プログラミング言語**: GDScript（Godot 4.7）
  - **言語選択の理由**: プロジェクトのメイン開発言語（CLAUDE.md・note.mdでGodot 4.x + GDScriptに移行確定済み）
  - **テストに適した機能**: `static func` による純粋関数、`Array[MaterialInstance]` の型付き配列、enumの整数評価が平均計算に直結する
- **テストフレームワーク**: GUT（Godot Unit Test）9.6.1
  - **フレームワーク選択の理由**: プロジェクト標準のGodot向けユニットテストフレームワーク（Phase 1で導入済み）。既存 `material_instance_test.gd` 等と同一パターンで記述できる
  - **テスト実行環境**: ヘッドレスCLI実行
    `cd atelier-godot && godot --headless -d -s addons/gut/gut_cmdline.gd -gtest="res://tests/unit/features/alchemy/quality_calculator_test.gd"`
  - **主なアサーション**: `assert_eq`（一致検証）、`assert_almost_eq(got, expected, error_interval)`（浮動小数点比較）
- 🔵 信頼性: note.md「1. 技術スタック」「5. テスト関連情報」、既存 `material_instance_test.gd` の実装パターンに基づく

---

## 5. テストケース実装時の日本語コメント指針

各テストは既存 `material_instance_test.gd` に倣い、以下の日本語コメントブロックを含める。

### テストファイル冒頭

```gdscript
extends GutTest
# TASK-0013: QualityCalculator（基礎品質算出）のユニットテスト
# 対象: features/alchemy/logic/quality_calculator.gd
# 参照: docs/implements/atelier-alchemy-core/TASK-0013/quality-calculator-testcases.md
#
# 【備考】: QualityCalculatorは純粋関数(static func)のみで構成されるためインスタンス生成は不要。
#          各テストはローカルにMaterialInstanceを組み立てて完結する。

const QualityCalculatorScript := preload("res://features/alchemy/logic/quality_calculator.gd")
const MaterialInstanceScript := preload("res://features/alchemy/data/material_instance.gd")


# 【ヘルパー】: 指定品質・無特性のMaterialInstanceを1個生成する
func _make_material(quality: int) -> MaterialInstance:
	return MaterialInstanceScript.new("", quality, [] as Array[StringName])
```

### テストケース本体（例: TC-101-01）

```gdscript
func test_品質DCBAの4素材の平均が2_5になる() -> void:
	# 【テスト目的】: 異なる品質の4素材の算術平均が2.5になることを確認する（TC-101-01）
	# 【テスト内容】: D(1)/C(2)/B(3)/A(4)を各1個投入し平均を算出する
	# 【期待される動作】: (1+2+3+4)/4 = 2.5 をfloatで返す
	# 🔵 信頼性: acceptance-criteria.md TC-101-01

	# 【テストデータ準備】: 品質が全て異なり平均が非整数になる代表ケースを用意する
	# 【初期条件設定】: traitsは全て空。qualityのみが平均に寄与する
	var materials: Array[MaterialInstance] = [
		_make_material(MaterialInstanceScript.Quality.D),
		_make_material(MaterialInstanceScript.Quality.C),
		_make_material(MaterialInstanceScript.Quality.B),
		_make_material(MaterialInstanceScript.Quality.A),
	]

	# 【実際の処理実行】: calculate_base_qualityで基礎品質を算出する
	# 【処理内容】: 品質値の算術平均を計算する純粋関数を呼び出す
	var result := QualityCalculatorScript.calculate_base_quality(materials)

	# 【結果検証】: 戻り値が2.5であることを確認する
	# 【期待値確認】: int合計10 ÷ 4 = 2.5。整数除算で2に切り捨てられないこと
	# 【品質保証】: 後続のペナルティ適用(TASK-0016)へ正確な基礎品質を引き継ぐ土台を保証する
	assert_almost_eq(result, 2.5, 0.0001, "平均品質が2.5になるべき") # 【検証項目】: 非整数平均の保持
	# 🔵 信頼性: TC-101-01
```

### 空配列ケース

```gdscript
func test_空配列投入時に0_0を返しクラッシュしない() -> void:
	# 【テスト目的】: 空配列でゼロ除算・クラッシュせず0.0を返す防御的実装を確認する
	# 【テスト内容】: []を渡してcalculate_base_qualityを呼び出す
	# 【期待される動作】: 例外なく0.0が返る
	# 🟡 信頼性: EDGE-001、requirements.md「空配列時の戻り値: 0.0」

	# 【テストデータ準備】: 投入素材が0個という異常入力を再現する
	var empty: Array[MaterialInstance] = []

	# 【実際の処理実行】: 空配列で基礎品質算出を呼び出す
	var result := QualityCalculatorScript.calculate_base_quality(empty)

	# 【結果検証】: 0.0が返ることを確認する
	# 【期待値確認】: size()==0のガードにより0.0を返す
	# 【品質保証】: Functional Coreがどんな入力でも破綻しない堅牢性を担保する
	assert_almost_eq(result, 0.0, 0.0001, "空配列時は0.0を返すべき") # 【検証項目】: 防御的実装
	# 🟡 信頼性: EDGE-001
```

---

## 6. 要件定義との対応関係

- **参照した機能概要**: quality-calculator-requirements.md「1. 機能の概要」（基礎品質＝投入素材の平均品質、Functional Core配置）
- **参照した入力・出力仕様**: 同「2. 入力・出力の仕様」（入力 `Array[MaterialInstance]`、出力 `float`、空配列→0.0、型判断でfloat採用）
- **参照した制約条件**: 同「3. 制約条件」（純粋関数・副作用禁止・防御的実装・配置制約・カバレッジ90%+）
- **参照した使用例**: 同「4. 想定される使用例」（基本パターン/単一素材/同一品質/空配列）
- **参照したEARS要件**: REQ-105（基礎品質＝平均品質）、EDGE-001（素材0個時は調合不成立）
- **参照した受け入れ基準**: TC-101-01（平均=2.5）
- **参照した設計文書**: architecture.md（Functional Core / シグネチャ）、data-model.md（Quality: D=1〜S=5）、dataflow.md「機能2: 調合」ステップ1
- **参照した既存実装**: `features/alchemy/data/material_instance.gd`（コンストラクタ・Quality enum）、`tests/unit/features/alchemy/material_instance_test.gd`（GUTテストパターン）

---

## 7. テストケース一覧（サマリー）

| # | 分類 | テスト名 | 入力 | 期待値 | 信頼性 |
|---|------|---------|------|--------|--------|
| 1-1 | 正常系 | D/C/B/A各1個の平均 | D,C,B,A | 2.5 | 🔵 |
| 1-2 | 正常系 | 単一素材S | S ×1 | 5.0 | 🟡 |
| 1-3 | 正常系 | 同一品質B×4 | B ×4 | 3.0 | 🟡 |
| 1-4 | 正常系 | traits無視の確認 | C(traits2),A(traits1) | 3.0 | 🟡 |
| 2-1 | 異常系 | 空配列 | [] | 0.0（非クラッシュ） | 🟡 |
| 3-1 | 境界値 | 品質下限D×3 | D ×3 | 1.0 | 🟡 |
| 3-2 | 境界値 | 品質上限S×3 | S ×3 | 5.0 | 🟡 |
| 3-3 | 境界値 | 非終端小数の精度 | D,D,S | 2.333...（7/3） | 🔴 |

**合計8ケース**（正常系4 / 異常系1 / 境界値3）

### 信頼性レベル分布
- 🔵 青信号: 1ケース（TC-101-01）
- 🟡 黄信号: 6ケース（REQ-105/EDGE-001/data-modelからの妥当な推測）
- 🔴 赤信号: 1ケース（float精度検証の合理的補完。float採用方針の実効性を担保する有用な追加）

### 品質判定
- **✅ 高品質**: 正常系・異常系・境界値を網羅。各ケースの期待値が算術的に明確。言語（GDScript）・テストフレームワーク（GUT 9.6.1）確定済み。既存 `material_instance_test.gd` パターンで実装可能。
- 設計文書間の型不整合（int vs float）はnote.md/TASK-0013.mdで「float採用」と申し送り済みのため、テスト設計上の障害はない。

---

## 次のステップ

次のお勧めステップ: `/tsumiki:tdd-red atelier-alchemy-core TASK-0013` でRedフェーズ（失敗テスト作成）を開始します。
