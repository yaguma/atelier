# TASK-0016 テストケース定義書: QualityCalculator.apply_trait_penalty

**機能名**: QualityCalculator.apply_trait_penalty（品質ペナルティ適用）
**タスクID**: TASK-0016
**要件名**: atelier-alchemy-core
**タスクタイプ**: TDD
**フェーズ**: Phase 3 - 調合コアロジック（★核心）
**作成日**: 2026-08-02

---

## 対象関数

```gdscript
static func apply_trait_penalty(
    base_quality: float,
    activated_traits: Array[TraitDefinition],
) -> MaterialInstance.Quality
```

**実装ファイル**: `features/alchemy/logic/quality_calculator.gd`（TASK-0013 と同一ファイル）
**テストファイル**: `tests/unit/features/alchemy/quality_calculator_test.gd`（TASK-0013 と同一ファイル）

### アルゴリズム（要件定義 §2 より）

1. `activated_traits` のうち `category != SUPPORT` の件数 → `penalty_count`
2. `quality_after_penalty = base_quality - penalty_count`（REQ-111 / REQ-112 加算的）
3. `activated_traits` のうち `category == SUPPORT` の件数 → `support_bonus_count`
4. `quality_after_penalty += support_bonus_count`（REQ-108 触媒+1段 / REQ-111 減算後に加算）
5. 下限クランプ: `max(quality_after_penalty, 1.0)`（REQ-111 D 下限）
6. 上限クランプ: `min(quality_after_penalty, 5.0)`（Quality 値域 1〜5 のための防御的実装）
7. `round()` で丸め → `MaterialInstance.Quality` にキャストして返却

---

## テストヘルパー方針

- **MaterialInstance**: 本関数の引数ではないためテスト内では不要（`activated_traits` のみを組み立てる）。
- **TraitDefinition**: `trait_activation_test.gd` の `_make_trait` パターンを踏襲し、`TraitDefinitionScript.new()` 後にプロパティを代入するファクトリを用意する。本関数は `category` のみを参照するため、`id`・`category` を最小限セットすれば足りる。

```gdscript
const TraitDefinitionScript := preload("res://features/alchemy/data/trait_definition.gd")

# 【ヘルパー】: 指定カテゴリの TraitDefinition を1件生成する（本関数はcategoryのみ参照）
func _make_trait(p_id: StringName, p_cat: int) -> TraitDefinition:
    var t := TraitDefinitionScript.new()
    t.id = p_id
    t.category = p_cat
    return t
```

- `Array[TraitDefinition]` 型で明示的に宣言する（GDScript の型付き配列一致のため）。

---

## 1. 正常系テストケース（基本的な動作）

### TC-16-N01: 発現特性1個につき品質が1段階減算される

- **テスト名**: 貢献度系1個発現時に基礎品質A(4)がB(3)へ1段減算される
  - **何をテストするか**: SUPPORT 以外の発現特性1個に対して品質が正確に1段階減算されること（アルゴリズム step1〜2）
  - **期待される動作**: `penalty_count = 1` → `4.0 - 1 = 3.0` → クランプ・丸め後 `Quality.B`
- **入力値**: `base_quality = 4.0`, `activated_traits = [貢献度系1件（Category.CONTRIBUTION）]`
  - **入力データの意味**: REQ-111 の基本ルール（1個につき1段減）を最短で検証する代表ケース。下限・上限にかからない中間値 A(4) を採用
- **期待される結果**: `MaterialInstance.Quality.B`（`3`）
  - **期待結果の理由**: 発現特性1件分の減算 `4 - 1 = 3` が B(3) に一致する（REQ-111）
- **テストの目的**: ペナルティ算出の中核（1個=1段減）が正しく機能することを確認する
  - **確認ポイント**: 減算が「枠配分」ではなく「品質スコア直接減算」で行われていること（REQ-111 改訂経緯の遵守）
- 🟡 信頼性: TASK-0016.md テストケース2 / REQ-111 の基本ルールからの妥当な推測（acceptance-criteria.md に通常ケース専用TC未整備のため補完）

### TC-16-N02: 発現特性2個分のペナルティが加算的に積み重なる

- **テスト名**: 貢献度系2個発現時に基礎品質A(4)からスコア2（C相当）へ加算的に減算される
  - **何をテストするか**: 発現特性が複数の場合、ペナルティが加算的に積み重なること（REQ-112）
  - **期待される動作**: `penalty_count = 2` → `4.0 - 2 = 2.0` → `Quality.C`（`2`）
- **入力値**: `base_quality = 4.0`, `activated_traits = [「聖」CONTRIBUTION, 「浄」CONTRIBUTION]`（いずれも SUPPORT 以外）
  - **入力データの意味**: REQ-112「加算的に積み重なる」を検証する。`trait_activation_test.gd` で使われる系統内共存ケース（聖・浄）を流用し実データ整合を取る
- **期待される結果**: `MaterialInstance.Quality`（スコア `2` = `Quality.C`）
  - **期待結果の理由**: 2件分の減算 `4 - 2 = 2`。1件ずつの減算が独立に効くのではなく合算されることを保証する（REQ-112）
- **テストの目的**: ペナルティが加算モデルであること（乗算・固定値でない）を確認する
  - **確認ポイント**: 減算件数が発現特性数に線形比例すること
- 🟡 信頼性: TASK-0016.md テストケース3 / REQ-112「加算的に積み重なる」からの妥当な推測

### TC-16-N03: 補助系（触媒）は減算後に+1段の効果を持つ

- **テスト名**: 貢献度系1個＋補助系（触媒）1個で1段減算後に+1段が加算されA(4)へ戻る
  - **何をテストするか**: SUPPORT カテゴリが減算対象外であり、かつ減算後に別途 +1 段加算されること（REQ-108 / REQ-111 step3〜4）
  - **期待される動作**: `penalty_count = 1`（触媒は除外）→ `4.0 - 1 = 3.0`、`support_bonus_count = 1` → `3.0 + 1 = 4.0` → `Quality.A`
- **入力値**: `base_quality = 4.0`, `activated_traits = [貢献度系1件 CONTRIBUTION, 触媒1件 SUPPORT]`
  - **入力データの意味**: 「食い合い（減算）」と「触媒補正（加算）」が同一計算内で両立することを検証する。減算と加算が相殺してA(4)に戻る分かりやすい代表値を採用
- **期待される結果**: `MaterialInstance.Quality.A`（`4`）
  - **期待結果の理由**: 触媒は penalty_count に含めず（step1）、減算後に support_bonus_count 分を加算する（step4）。`(4 - 1) + 1 = 4`（REQ-108, REQ-111）
- **テストの目的**: SUPPORT の二重の特別扱い（減算対象外＋事後加算）が正しく機能することを確認する
  - **確認ポイント**: 触媒が減算件数にカウントされていないこと、加算が減算の「後」に行われること
- 🟡 信頼性: TASK-0016.md テストケース4 / REQ-108「触媒＝品質+1段」・REQ-111「減算後に加算」より（専用TC未整備だが REQ 本文から直接導出できる重要ケース）

### TC-16-N04: 報酬系（REWARD）も減算対象に含まれる

- **テスト名**: 報酬系1個発現時も貢献度系と同様にA(4)がB(3)へ1段減算される
  - **何をテストするか**: 減算判定が `category != SUPPORT` であり、CONTRIBUTION だけでなく REWARD も減算対象になること（アルゴリズム step1）
  - **期待される動作**: `penalty_count = 1`（REWARD は SUPPORT でないため計上）→ `4.0 - 1 = 3.0` → `Quality.B`
- **入力値**: `base_quality = 4.0`, `activated_traits = [「金」REWARD 1件]`
  - **入力データの意味**: 「SUPPORT のみが特別扱い、REWARD は通常の減算対象」というカテゴリ分岐条件を明示的に検証する。TC-16-N01（CONTRIBUTION）との対比ケース
- **期待される結果**: `MaterialInstance.Quality.B`（`3`）
  - **期待結果の理由**: REWARD は `category != SUPPORT` を満たすため penalty_count に含まれる（`4 - 1 = 3`）
- **テストの目的**: 減算対象の分岐条件が「SUPPORT 以外すべて」であることを確認する
  - **確認ポイント**: `category == CONTRIBUTION` だけを減算対象とする実装ミス（REWARD 取りこぼし）を検出する
- 🟡 信頼性: 要件定義 §2 step1「category != SUPPORT の件数」からの妥当な推測（REWARD 単独の数値検証は専用TC未整備のため補完）

---

## 2. 異常系テストケース（エラーハンドリング）

### TC-16-E01: 空配列（発現特性0個）でも例外を投げず基礎品質を維持する

- **テスト名**: 発現特性0個（空配列）の場合はペナルティが発生せず基礎品質のまま返る
  - **エラーケースの概要**: 発現特性が1つもない調合（`activated_traits = []`）でクラッシュせず、減算・加算いずれも発生しないこと
  - **エラー処理の重要性**: 「特性を全く狙わない安全な調合」も正常な遊び方であり、例外や 0 減算漏れがあると調合フロー全体が破綻する
- **入力値**: `base_quality = 3.0`, `activated_traits = []`（空配列）
  - **不正な理由**: 厳密には不正入力ではなく縮退ケース。要件定義 §4「空配列は正常系として扱う」に基づき防御的動作を確認する
  - **実際の発生シナリオ**: プレイヤーが品質重視で特性発現閾値に届く素材を投入しなかった場合に発生する
- **期待される結果**: `MaterialInstance.Quality.B`（`3`、基礎品質のまま変化なし）
  - **エラーメッセージの内容**: 例外は投げず、値をそのまま返す（メッセージなし）
  - **システムの安全性**: `penalty_count = 0`, `support_bonus_count = 0` で `3.0` を維持しクランプ・丸め後も B(3)
- **テストの目的**: 発現特性0個時の非変化（ペナルティ非発生）とクラッシュ耐性を確認する
  - **品質保証の観点**: for ループ・件数カウントが 0 件でも安全に 0 を返すことを保証する（REQ-111「1個につき」の 0 個境界）
- 🟡 信頼性: TASK-0016.md テストケース5 / REQ-111 より 0 個は減算なしという妥当な推測

---

## 3. 境界値テストケース（下限・上限・丸め）

### TC-16-B01: 品質ペナルティにより最終品質がDを下回らない（TC-101-B02・Critical）

- **テスト名**: 基礎品質D(1)で特性1個以上発現してもD(1)を下回らない（下限保証）
  - **境界値の意味**: 品質スコアの下限 D(1)。ペナルティによりスコアが 0 以下へ落ちる可能性がある最重要境界（REQ-111 の Critical 制約）
  - **境界値での動作保証**: 減算結果が 1.0 未満になっても `max(x, 1.0)` で D(1) にクランプされること
- **入力値**: `base_quality = 1.0`, `activated_traits = [貢献度系1件 CONTRIBUTION]`
  - **境界値選択の根拠**: `1.0 - 1 = 0.0` となり下限を割り込む最小構成。acceptance-criteria.md TC-101-B02 の Given に一致
  - **実際の使用場面**: 低品質素材ばかりで特性を発現させた「食い合い」の極端ケース（EDGE-102）
- **期待される結果**: `MaterialInstance.Quality.D`（`1`）
  - **境界での正確性**: クランプ前の `0.0` が `max(0.0, 1.0) = 1.0` に補正され、丸め後も D(1)
  - **一貫した動作**: これ以上いくら特性を発現させても D 未満には落ちないこと
- **テストの目的**: 下限クランプ（Critical）が正しく機能することを確認する
  - **堅牢性の確認**: 品質スコアが 0 や負値になり後続処理（enum キャスト）が不正値になる事故を防ぐ
- 🔵 信頼性: acceptance-criteria.md TC-101-B02（必須・Critical）より、ほぼ推測なし

### TC-16-B02: 補助系多数投入で上限S(5)を超えないようクランプされる

- **テスト名**: 基礎品質A(4)＋補助系（触媒）2個以上でスコア5超過が生じてもS(5)にクランプされる
  - **境界値の意味**: 品質スコアの上限 S(5)。SUPPORT 加算により値域上限を突破し得る境界
  - **境界値での動作保証**: `min(x, 5.0)` により 5.0 を超えた値が S(5) に補正されること
- **入力値**: `base_quality = 4.0`, `activated_traits = [触媒 SUPPORT, 触媒 SUPPORT]`（SUPPORT ×2、減算対象なし）
  - **境界値選択の根拠**: `penalty_count = 0`, `support_bonus_count = 2` → `4.0 + 2 = 6.0` となり上限 5.0 を突破する最小構成
  - **実際の使用場面**: 触媒を複数投入した場合。加算モデル（件数分加算）採用時に enum 値域外へ出る防御が必要
- **期待される結果**: `MaterialInstance.Quality.S`（`5`）
  - **境界での正確性**: `6.0` が `min(6.0, 5.0) = 5.0` に補正され、丸め後 S(5)
  - **一貫した動作**: 値域 1〜5 の enum に必ず収まること（不正 enum 値の防止）
- **テストの目的**: 上限クランプ（防御的実装）が正しく機能することを確認する
  - **堅牢性の確認**: SUPPORT 加算モデルが enum 値域を破らないこと。触媒複数投入時の挙動はバランス調整フェーズで再検証（🟡）
- 🟡 信頼性: 要件定義 §3「上限保証（防御的実装）」より。REQ 本文に明記なく Quality 値域からの妥当な推測

### TC-16-B03: 非整数の基礎品質は round()（四捨五入）で最も近い整数に丸められる

- **テスト名**: 発現特性0個・基礎品質2.5がround()でC(2)/B(3)いずれかに一貫して丸められる
  - **境界値の意味**: float→int 変換の丸め境界（.5）。TASK-0013 が返す非整数平均（例 2.5）が enum へ変換されるポイント
  - **境界値での動作保証**: `round()` の丸め規則（Godot は 0 から離れる方向へ丸め、`round(2.5) = 3.0`）に従い一貫して丸められること
- **入力値**: `base_quality = 2.5`, `activated_traits = []`（減算・加算なしで丸めのみを純粋検証）
  - **境界値選択の根拠**: TASK-0013 のテスト（D/C/B/A 平均 = 2.5）が生む代表的な非整数値。減算 0 にして丸め挙動を単独で観測する
  - **実際の使用場面**: 品質の異なる素材を混ぜた通常調合で基礎品質は非整数になるのが常態
- **期待される結果**: `MaterialInstance.Quality.B`（`3`、`round(2.5) = 3.0` を前提）
  - **境界での正確性**: 切り捨て（`int()`）実装なら 2（C）になるため、`round()` 採用の実効を検証できる
  - **一貫した動作**: 同一入力に対し常に同じ丸め結果を返す（純粋関数性）
- **テストの目的**: float→Quality enum 変換ポイントで `round()`（四捨五入）が採用されていることを確認する
  - **堅牢性の確認**: 設計文書間の丸め方式不整合（int 切り捨て vs 四捨五入）に対する暫定確定（`round()`）が実装に反映されていること
  - **注意**: 丸め方式はバランス調整フェーズで再検証対象（🟡）。`round(2.5)` の期待値が実装丸め規則と一致するか Green フェーズで要確認
- 🟡 信頼性: 要件定義 §3「丸め方式制約（round採用・暫定）」より。丸め境界値の期待値は妥当な推測

### TC-16-B04: 減算と触媒加算が同時に下限へ達する複合境界

- **テスト名**: 基礎品質A(4)＋貢献度系3個＋触媒1個で下限D(1)にクランプされる
  - **境界値の意味**: 大量減算と触媒加算が同居し、加算後も下限に達する複合ケース。step2〜5 の演算順序を総合検証する
  - **境界値での動作保証**: `(4 - 3) + 1 = 2` … ではなく、`penalty_count=3`, `support=1` → `4 - 3 + 1 = 2.0` → C(2)。※下限には達しないため、より強いケースで下限を突く
  - **補足**: 下限到達を確実にするため貢献度系を4個にすると `4 - 4 + 1 = 1.0` → D(1)。本ケースは貢献度系4個＋触媒1個を採用する
- **入力値**: `base_quality = 4.0`, `activated_traits = [CONTRIBUTION ×4, SUPPORT（触媒）×1]`
  - **境界値選択の根拠**: `penalty_count = 4`, `support_bonus_count = 1` → `4.0 - 4 + 1 = 1.0`。減算・加算の順序と下限クランプが同時に効く複合境界
  - **実際の使用場面**: 特性を多数狙いつつ触媒で品質を補おうとする「欲張り調合」。食い合いが触媒補正を上回るケース
- **期待される結果**: `MaterialInstance.Quality.D`（`1`）
  - **境界での正確性**: 減算後加算の結果 `1.0` が下限 `max(1.0, 1.0) = 1.0` に一致。触媒1個では大量の食い合いを相殺しきれないことを表現
  - **一貫した動作**: 演算順序（減算→加算→クランプ）が要件定義 §2 の step 順に一致すること
- **テストの目的**: penalty_count と support_bonus_count が同時に非0の複合演算＋下限クランプの総合動作を確認する
  - **堅牢性の確認**: 触媒加算を先に行って下限を割らせない等の演算順序ミスを検出する
- 🟡 信頼性: REQ-108・REQ-111・REQ-112 の複合適用からの妥当な推測（複合境界の専用TCは未整備、REQ 本文から導出）

---

## 4. 開発言語・フレームワーク

- **プログラミング言語**: GDScript（Godot 4.7）
  - **言語選択の理由**: プロジェクトの技術スタック確定事項（CLAUDE.md / architecture.md NFR-301）。被テスト対象 `quality_calculator.gd` が GDScript の `static func`
  - **テストに適した機能**: 型付き配列 `Array[TraitDefinition]`、enum（`MaterialInstance.Quality` / `TraitDefinition.Category`）、静的メソッド呼び出しにより純粋関数を副作用なく検証できる
- **テストフレームワーク**: GUT（Godot Unit Test）9.6.1
  - **フレームワーク選択の理由**: プロジェクト標準のユニットテストフレームワーク（TASK-0013 の `quality_calculator_test.gd` が既に GUT ベース）。同一ファイルへ追記する
  - **テスト実行環境**: `cd atelier-godot && godot --headless -d -s addons/gut/gut_cmdline.gd -gtest="res://tests/unit/features/alchemy/quality_calculator_test.gd"`
- 🔵 信頼性: note.md「技術スタック」・既存テストファイル構成より、ほぼ推測なし

---

## 5. テストケース実装時の日本語コメント指針

TASK-0013 の既存テスト（`quality_calculator_test.gd`）のコメントスタイルを踏襲する。各テスト関数は以下の4ブロックコメントを含める。

```gdscript
func test_発現特性1個で品質が1段減算される() -> void:
    # 【テスト目的】: SUPPORT以外の発現特性1個で品質が1段減算されることを確認する
    # 【テスト内容】: base_quality=4.0, 貢献度系1件を渡す
    # 【期待される動作】: 4 - 1 = 3 → Quality.B が返る
    # 🟡 信頼性: REQ-111 の基本ルールからの妥当な推測

    # 【テストデータ準備】: 下限・上限にかからない中間品質A(4)と貢献度系1件を用意する
    # 【初期条件設定】: activated_traits は Array[TraitDefinition] 型で1件のみ
    var traits: Array[TraitDefinition] = [_make_trait(&"holy", TraitDefinitionScript.Category.CONTRIBUTION)]

    # 【実際の処理実行】: apply_trait_penalty を呼び出す
    # 【処理内容】: penalty_count 算出 → 減算 → クランプ → 丸めの一連を検証する
    var result = QualityCalculatorScript.apply_trait_penalty(4.0, traits)

    # 【結果検証】: 戻り値が Quality.B(3) であることを確認する
    # 【期待値確認】: 4 - 1 = 3 が B(3) に一致する（REQ-111）
    # 【品質保証】: ペナルティ算出の中核が正しく機能することを保証する
    assert_eq(result, MaterialInstanceScript.Quality.B, "発現特性1個で1段減算されるべき") # 【確認内容】: 1個=1段減 🟡
```

- `assert_eq` を使用（enum は int 値比較）。float 比較は本関数の戻り値には不要（戻り値は enum int）。
- 各 `assert` 行末に `# 【確認内容】: ...` と信頼性信号（🔵🟡🔴）を付す。

---

## 6. 要件定義との対応関係

| テストケース | 参照要件 / 受け入れ基準 | 種別 | 信頼性 |
|-------------|------------------------|------|--------|
| TC-16-N01 | REQ-111（1個=1段減）/ TASK-0016 テストケース2 | 正常系 | 🟡 |
| TC-16-N02 | REQ-112（加算的）/ TASK-0016 テストケース3 | 正常系 | 🟡 |
| TC-16-N03 | REQ-108（触媒+1段）, REQ-111（減算後加算）/ テストケース4 | 正常系 | 🟡 |
| TC-16-N04 | 要件定義 §2 step1（category != SUPPORT） | 正常系 | 🟡 |
| TC-16-E01 | REQ-111（0個は減算なし）/ テストケース5 | 異常系（縮退） | 🟡 |
| TC-16-B01 | **TC-101-B02（Critical・下限保証）**, REQ-111 | 境界値 | 🔵 |
| TC-16-B02 | 要件定義 §3（上限クランプ・防御的） | 境界値 | 🟡 |
| TC-16-B03 | 要件定義 §3（round 丸め・暫定確定） | 境界値 | 🟡 |
| TC-16-B04 | REQ-108 + REQ-111 + REQ-112 複合 | 境界値 | 🟡 |

- **参照した機能概要**: 要件定義書 §1（品質ペナルティ純粋関数）
- **参照した入力・出力仕様**: 要件定義書 §2（アルゴリズム7ステップ）
- **参照した制約条件**: 要件定義書 §3（下限保証 Critical・上限クランプ・丸め方式・純粋関数）
- **参照した使用例**: 要件定義書 §4（基本パターン・エッジケース・EDGE-102）

---

## 品質判定結果

```
✅ 高品質:
- テストケース分類: 正常系4・異常系1・境界値4 の計9ケースで網羅
  （1段減 / 加算的 / SUPPORT加算 / REWARD減算 / 0個 / 下限 / 上限 / 丸め / 複合境界）
- 期待値定義: 全ケースで具体的な Quality enum 値（1〜5）が明確
- 技術選択: GDScript + GUT 9.6.1 で確定、既存テストファイルへ追記
- 実装可能性: 既存 _make_trait パターン流用で確実に実装可能
- 信頼性レベル分布: 🔵1（TC-101-B02・Critical）/ 🟡8 / 🔴0
```

**総評**: 下限保証（TC-16-B01 = TC-101-B02）は🔵で確実。通常ケースの数値検証・触媒加算・丸め・上限クランプは acceptance-criteria.md に専用TC未整備のため🟡（REQ 本文から妥当に導出）。触媒複数投入時の挙動（TC-16-B02）と丸め方式（TC-16-B03）はバランス調整フェーズでの再検証を推奨する。

---

## 次のステップ

次のお勧めステップ: `/tsumiki:tdd-red atelier-alchemy-core TASK-0016` で Red フェーズ（失敗テスト作成）を開始する。
