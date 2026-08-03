# TASK-0017: ValueCalculator（貢献度/報酬算出）Redフェーズ記録

**作成日**: 2026-08-02
**フェーズ**: Red（失敗するテスト作成）
**テストファイル**: `tests/unit/features/alchemy/value_calculator_test.gd`
**対象実装（未実装スタブ）**: `features/alchemy/logic/value_calculator.gd`

---

## 1. 作成したテストケース一覧（13件）

テストケース定義書（`value-calculator-testcases.md`）の全13ケースを実装した。

| No | 関数名 | 対応TC | 信頼性 |
|----|--------|--------|--------|
| 1 | test_発現特性なし指定合致なしで基礎貢献度と品質倍率のみ反映される | TC-N01 | 🟡 |
| 2 | test_貢献度系と報酬系が混在しても貢献度計算には貢献度系ボーナスのみ寄与する | TC-N02 | 🟡 |
| 3 | test_貢献度系と報酬系が混在しても報酬計算には報酬系ボーナスのみ寄与する | TC-N03 | 🟡 |
| 4 | test_指定合致調合物と一致する場合に指定合致ボーナスが乗算される | TC-N04 | 🟡 |
| 5 | test_品質特性指定合致の4係数が同時に働くと全て乗算される | TC-N05 | 🟡 |
| 6 | test_貢献度系特性が複数発現するとbonus_multiplierがすべて乗算される | TC-N06 | 🟡 |
| 7 | test_発現特性が空配列のとき特性ボーナスは1_0で無効化される | TC-E01 | 🟡 |
| 8 | test_SUPPORT特性のみのとき貢献度報酬ともに特性ボーナスは1_0になる | TC-E02 | 🟡 |
| 9 | test_貢献度計算で報酬系特性のみが存在すると特性ボーナスは1_0になる | TC-E03 | 🟡 |
| 10 | test_基礎貢献度が0_0のとき結果は0_0になる | TC-B01 | 🟡 |
| 11 | test_品質下限D1のとき品質倍率は0_5になる | TC-B02 | 🔴 |
| 12 | test_品質上限S5のとき品質倍率は2_5になる報酬側 | TC-B03 | 🔴 |
| 13 | test_品質基準C2のとき品質倍率は1_0になる基準点 | TC-B04 | 🔵 |

正常系6 / 異常系・エッジ3 / 境界値4 = 合計13件（テストケース追加目標10件を上回る）。

### DailyRequest未実装への対応

`features/guild/data/daily_request.gd` は本タスク時点で未実装（Phase 4予定）のため、テストファイル内にローカルの `DummyDailyRequest`（RefCounted継承、`required_recipe_id` / `bonus_multiplier` の2フィールドのみ保持）を定義し、Duck typingで注入した（テストケース定義書0.3節の方針どおり）。

---

## 2. テストコード

`tests/unit/features/alchemy/value_calculator_test.gd` に実装済み（226行）。主な構成:

- `DummyDailyRequest`（RefCountedのローカルネストクラス）
- `_make_recipe(id, base_contribution, base_reward) -> RecipeDefinition`
- `_make_trait(id, category, bonus) -> TraitDefinition`
- 13個のテスト関数（正常系6・異常系/エッジ3・境界値4）

各テストは `assert_almost_eq(result, expected, 0.001, message)` で浮動小数点比較を行う（既存 `quality_calculator_test.gd` のパターンに準拠）。

---

## 3. 対象実装（Redフェーズ用スタブ）

`features/alchemy/logic/value_calculator.gd` を新規作成し、以下のスタブを実装した（ロジック未実装、ダミー戻り値のみ）。

```gdscript
class_name ValueCalculator
extends RefCounted

static func calculate_contribution(
    recipe: RecipeDefinition,
    final_quality: MaterialInstance.Quality,
    activated_traits: Array[TraitDefinition],
    daily_request,
) -> float:
    return 0.0

static func calculate_reward(
    recipe: RecipeDefinition,
    final_quality: MaterialInstance.Quality,
    activated_traits: Array[TraitDefinition],
    daily_request,
) -> float:
    return 0.0
```

TASK-0015/0016のRedフェーズでの教訓（型注釈違反によるスクリプト全体のコンパイル不能）を踏まえ、`daily_request` 引数は型注釈を省略（Duck typing）し、戻り値は型に合致するダミー値（`0.0`）とした。これによりテストファイルはパースエラーなく実行可能。

---

## 4. テスト実行結果（失敗確認）

実行コマンド:

```bash
cd atelier-godot
"C:\Users\syagu\AppData\Local\Microsoft\WinGet\Packages\GodotEngine.GodotEngine_Microsoft.Winget.Source_8wekyb3d8bbwe\Godot_v4.7-stable_win64_console.exe" --headless -s addons/gut/gut_cmdln.gd -gdir=res://tests/unit/features/alchemy -gexit
```

結果サマリ:

```
res://tests/unit/features/alchemy/value_calculator_test.gd
1/13 passed.
```

- 12/13件が失敗（期待どおり。スタブが `0.0` 固定を返すため、非ゼロ期待値のテストは全て失敗）。
- 1件（`test_基礎貢献度が0_0のとき結果は0_0になる` / TC-B01）のみ偶然パス。これは期待値自体が `0.0` であり、スタブのダミー戻り値 `0.0` と一致するため。ロジック本体は依然未実装であり、Greenフェーズでの実装完了後に他12件と合わせて意味のある検証となる。
- 既存58件（TASK-0011〜0016分）は全てパスし、リグレッションなしを確認。

```
Totals
------
Scripts               7
Tests                71   (既存58 + 新規13)
Passing Tests        59   (既存58 + 新規1)
Failing Tests        12
Asserts           118/131
```

---

## 5. Greenフェーズで実装すべき内容

`features/alchemy/logic/value_calculator.gd` の `calculate_contribution` / `calculate_reward` を以下の式で実装する。

```
貢献度 = recipe.base_contribution × 品質倍率 × 貢献度系特性ボーナス × 指定合致ボーナス
報酬   = recipe.base_reward       × 品質倍率 × 報酬系特性ボーナス   × 指定合致ボーナス

品質倍率 = float(final_quality) / float(MaterialInstance.Quality.C)
特性ボーナス = 該当カテゴリ(CONTRIBUTION or REWARD)のtrait.bonus_multiplierを全て乗算（該当0件なら1.0）
指定合致ボーナス = daily_request.required_recipe_id == recipe.id ? daily_request.bonus_multiplier : 1.0
```

- `daily_request` 引数は型注釈なし（Variant/Duck typing）のまま実装する。
- SUPPORTカテゴリは両ボーナス計算のフィルタ対象外とする。
- 品質倍率計算は将来のバランス調整で差し替えやすいよう関数化を検討する。
