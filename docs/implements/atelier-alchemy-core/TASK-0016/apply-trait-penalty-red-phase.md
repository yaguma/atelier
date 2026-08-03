# TASK-0016 Redフェーズ記録: QualityCalculator.apply_trait_penalty

**機能名**: QualityCalculator.apply_trait_penalty（品質ペナルティ適用）
**タスクID**: TASK-0016
**要件名**: atelier-alchemy-core
**フェーズ**: Red（失敗するテスト作成）
**作成日**: 2026-08-02

---

## 1. 作成したテストケース一覧（9件）

`docs/implements/atelier-alchemy-core/TASK-0016/apply-trait-penalty-testcases.md` に定義された9ケース全てを実装した。

| No | テストケースID | テスト関数名 | 分類 | 信頼性 |
|----|----------------|--------------|------|--------|
| 1 | TC-16-N01 | `test_貢献度系1個発現時に基礎品質A4がB3へ1段減算される` | 正常系 | 🟡 |
| 2 | TC-16-N02 | `test_貢献度系2個発現時に基礎品質A4からスコア2C相当へ加算的に減算される` | 正常系 | 🟡 |
| 3 | TC-16-N03 | `test_貢献度系1個と補助系1個で1段減算後に1段加算されA4へ戻る` | 正常系 | 🟡 |
| 4 | TC-16-N04 | `test_報酬系1個発現時も貢献度系と同様にA4がB3へ1段減算される` | 正常系 | 🟡 |
| 5 | TC-16-E01 | `test_発現特性0個の空配列でもペナルティが発生せず基礎品質を維持する` | 異常系（縮退） | 🟡 |
| 6 | TC-16-B01 | `test_基礎品質D1で特性1個以上発現してもD1を下回らない` | 境界値（Critical） | 🔵 |
| 7 | TC-16-B02 | `test_補助系2個投入で上限S5を超えないようクランプされる` | 境界値 | 🟡 |
| 8 | TC-16-B03 | `test_発現特性0個で基礎品質2_5がroundで一貫して丸められる` | 境界値 | 🟡 |
| 9 | TC-16-B04 | `test_基礎品質A4で貢献度系4個と触媒1個により下限D1にクランプされる` | 境界値 | 🟡 |

- テストファイル: `atelier-godot/tests/unit/features/alchemy/quality_calculator_test.gd`（TASK-0013の既存8ケースに追記）
- 追加したヘルパー: `const TraitDefinitionScript`（preload）、`_make_trait(p_id, p_cat)`（`trait_activation_test.gd` の `_make_trait` パターンを踏襲し、本関数が参照する `category` のみを最小限セット）

---

## 2. 実装したスタブコード

`atelier-godot/features/alchemy/logic/quality_calculator.gd` に以下のスタブを追加した。`pass` のみでは戻り値型注釈（`-> MaterialInstance.Quality`）違反でスクリプト全体がコンパイル不能になるため（TASK-0015のRedフェーズで得た教訓）、型に合致するダミー値 `MaterialInstance.Quality.D` を返す仮実装とした。

```gdscript
static func apply_trait_penalty(
	base_quality: float,
	activated_traits: Array[TraitDefinition],
) -> MaterialInstance.Quality:
	# 【仮実装】: Redフェーズ用ダミー戻り値。Greenフェーズでアルゴリズム7ステップを実装する
	return MaterialInstance.Quality.D
```

---

## 3. テスト実行結果（失敗確認）

### 実行コマンド

```bash
cd atelier-godot
"C:\Users\syagu\AppData\Local\Microsoft\WinGet\Packages\GodotEngine.GodotEngine_Microsoft.Winget.Source_8wekyb3d8bbwe\Godot_v4.7-stable_win64_console.exe" --headless -s addons/gut/gut_cmdln.gd -gdir=res://tests/unit/features/alchemy -gexit
```

### 結果サマリ

- `quality_calculator_test.gd`: **17件中10件Pass、7件Fail**
  - 既存の `calculate_base_quality` テスト**8件は全てPass**（回帰なし）
  - 新規9件のうち**7件は期待通りFail**（スタブが常に `Quality.D`(1) を返すため、期待値と不一致）
  - 新規9件のうち**2件（TC-16-B01, TC-16-B04）はPass**
    - 理由: いずれも「下限保証によりQuality.Dへクランプされる」ことを検証するケースであり、期待値そのものが `Quality.D`(1)。スタブのダミー値もD(1)であるため、**偶然値が一致してPassした**（実装ロジックが正しく動いているわけではない）
    - これはRedフェーズにおける許容範囲内の既知現象（TASK-0015と同様のダミー値選定に起因）であり、Greenフェーズで正式なアルゴリズムに置き換えた後も同じ期待値でPassし続けることを確認する
- 他スクリプト（`recipe_definition_test.gd`, `trait_activation_test.gd`, `trait_definition_test.gd` 等）は影響なく全件Pass

### 失敗したテスト（7件）と失敗内容

| テスト関数名 | 期待値 | スタブの戻り値 |
|--------------|--------|----------------|
| `test_貢献度系1個発現時に基礎品質A4がB3へ1段減算される` | `Quality.B`(3) | `Quality.D`(1) |
| `test_貢献度系2個発現時に基礎品質A4からスコア2C相当へ加算的に減算される` | `Quality.C`(2) | `Quality.D`(1) |
| `test_貢献度系1個と補助系1個で1段減算後に1段加算されA4へ戻る` | `Quality.A`(4) | `Quality.D`(1) |
| `test_報酬系1個発現時も貢献度系と同様にA4がB3へ1段減算される` | `Quality.B`(3) | `Quality.D`(1) |
| `test_発現特性0個の空配列でもペナルティが発生せず基礎品質を維持する` | `Quality.B`(3) | `Quality.D`(1) |
| `test_補助系2個投入で上限S5を超えないようクランプされる` | `Quality.S`(5) | `Quality.D`(1) |
| `test_発現特性0個で基礎品質2_5がroundで一貫して丸められる` | `Quality.B`(3) | `Quality.D`(1) |

---

## 4. Greenフェーズで実装すべき内容

`apply_trait_penalty` に以下のアルゴリズム7ステップを実装する（要件定義書§2 / テストケース定義書より）。

1. `activated_traits` のうち `category != SUPPORT` の件数 → `penalty_count`
2. `quality_after_penalty = base_quality - penalty_count`
3. `activated_traits` のうち `category == SUPPORT` の件数 → `support_bonus_count`
4. `quality_after_penalty += support_bonus_count`
5. 下限クランプ: `max(quality_after_penalty, 1.0)`
6. 上限クランプ: `min(quality_after_penalty, 5.0)`
7. `round()` で丸め → `MaterialInstance.Quality` にキャストして返却

実装後、9件全てがPassし、既存8件も引き続きPassすることを確認する。
