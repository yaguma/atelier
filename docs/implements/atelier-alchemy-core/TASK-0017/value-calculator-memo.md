# TDD開発メモ: ValueCalculator（貢献度/報酬算出）

## 概要

- 機能名: ValueCalculator（貢献度/報酬算出）
- 開発開始: 2026-08-02
- 現在のフェーズ: 完了

## 関連ファイル

- 元タスクファイル: `docs/tasks/atelier-alchemy-core/TASK-0017.md`
- 要件定義: `docs/implements/atelier-alchemy-core/TASK-0017/value-calculator-requirements.md`
- テストケース定義: `docs/implements/atelier-alchemy-core/TASK-0017/value-calculator-testcases.md`
- Redフェーズ記録: `docs/implements/atelier-alchemy-core/TASK-0017/value-calculator-red-phase.md`
- 実装ファイル（スタブ）: `atelier-godot/features/alchemy/logic/value_calculator.gd`
- テストファイル: `atelier-godot/tests/unit/features/alchemy/value_calculator_test.gd`

## Redフェーズ（失敗するテスト作成）

### 作成日時

2026-08-02

### テストケース

テストケース定義書の全13ケース（正常系6/異常系・エッジ3/境界値4）を実装。

- TC-N01〜N06: 乗算構造の骨格・系統独立性・指定合致ボーナス・4係数完全形・同系統複数特性
- TC-E01〜E03: 空配列/SUPPORT/反対系統0件での特性ボーナス1.0無効化
- TC-B01〜B04: ゼロ値吸収・品質倍率の下限/上限/基準点

DailyRequest型が未実装（Phase 4予定）のため、テストファイル内にローカル `DummyDailyRequest`（RefCounted、`required_recipe_id`/`bonus_multiplier`のみ保持）を定義しDuck typingで代替した。

### テストコード

`atelier-godot/tests/unit/features/alchemy/value_calculator_test.gd`（新規作成、226行）。
ヘルパー: `_make_recipe()`, `_make_trait()`, ネストクラス `DummyDailyRequest`。
アサーション: `assert_almost_eq(result, expected, 0.001, message)`。

### 期待される失敗

`features/alchemy/logic/value_calculator.gd` はRedフェーズ用スタブとして新規作成し、`calculate_contribution` / `calculate_reward` ともにロジック未実装でダミー値 `0.0` を返すのみとした（TASK-0015/0016の教訓：型注釈違反でスクリプト全体がコンパイル不能にならないよう、`daily_request` 引数の型注釈を省略し、戻り値は型に合致する `0.0` とした）。

実行結果: **1/13 passed**（12件失敗）。
唯一パスした `test_基礎貢献度が0_0のとき結果は0_0になる`（TC-B01）は期待値自体が `0.0` でありスタブの `0.0` と偶然一致したもので、ロジックは検証できていない。既存のTASK-0011〜0016分58件は全てパスし、リグレッションなしを確認した（Scripts 7 / Tests 71 / Passing 59 / Failing 12）。

### 次のフェーズへの要求事項

- `calculate_contribution` / `calculate_reward` を要件定義の4係数乗算式で実装する
- 品質倍率 `float(final_quality) / float(MaterialInstance.Quality.C)` を実装（将来のバランス調整に備え関数化を検討）
- 特性ボーナスは該当カテゴリ（CONTRIBUTION or REWARD）のみをフィルタし `bonus_multiplier` を全乗算、該当0件は1.0
- 指定合致ボーナスは `daily_request.required_recipe_id == recipe.id` で判定
- `daily_request` の型注釈は本タスクでは省略のまま実装し、Phase 4のDailyRequest実装後に型厳格化する

## Greenフェーズ（最小実装）

### 実装日時

2026-08-02

### 実装方針

Redフェーズで確定した4係数乗算式（REQ-109, REQ-110）をそのまま実装。共通処理は
`_calculate_category_bonus()`（カテゴリ別bonus_multiplier全乗算・該当0件は1.0）と
`_calculate_match_bonus()`（daily_request一致判定・null安全）の2つのprivateヘルパーに切り出した。

### 実装コード

`atelier-godot/features/alchemy/logic/value_calculator.gd` を更新（詳細は
`value-calculator-green-phase.md` 参照）。

```gdscript
static func calculate_contribution(recipe, final_quality, activated_traits, daily_request) -> float:
    var quality_multiplier := float(final_quality) / float(MaterialInstance.Quality.C)
    var trait_bonus := _calculate_category_bonus(activated_traits, TraitDefinition.Category.CONTRIBUTION)
    var match_bonus := _calculate_match_bonus(recipe, daily_request)
    return recipe.base_contribution * quality_multiplier * trait_bonus * match_bonus
```

（`calculate_reward` は対称構造。ヘルパー2件の詳細はGreenフェーズ記録ファイル参照）

### テスト結果

`value_calculator_test.gd` 13/13 passed。既存58件（TASK-0011〜0016分）も全てパスし、
リグレッションなし（Scripts 7 / Tests 71 / Passing 71 / Asserts 131/131）。

### 課題・改善点（Refactorフェーズで対応検討）

- 品質倍率式 `float(final_quality) / float(MaterialInstance.Quality.C)` は暫定式（🔴）。
  `game_balance.gd` 等への定数/関数切り出しをRefactorフェーズで検討。
- DailyRequest型未実装のため `daily_request` 引数は型注釈なし（Duck typing）のまま。Phase 4で厳格化。
- 指定合致ボーナスのalchemy/guild二重適用疑義は未解決（Phase 4着手前に責務統一が必要）。

## Refactorフェーズ（品質改善）

### 実施日時

2026-08-02

### 改善内容

機能・アルゴリズムの変更は行わず（テスト71/71 green維持）、`quality_calculator.gd`（TASK-0015/0016）で
確立済みの「⚠️ 設計判断」形式に倣い、ファイル冒頭に3つの未解決事項を集約した目立つコメントブロックを追加した。

1. **【最重要】alchemy/guildの指定合致ボーナス責務重複疑義**: REQ-109/110の式は指定合致ボーナスを
   alchemy側（本実装）に直接含めるが、dataflow.md「機能3」ではguild側の
   `DeliveryCalculator.check_daily_request_match()`（未実装）が別途算出し再度乗算する設計になっており、
   二重適用のリスクがある。Phase4着手前に設計確定が必須と明記。
2. **品質倍率計算式（🔴完全な推測）**: `quality_multiplier = final_quality / Quality.C` は設計文書に
   根拠のない暫定式であり、バランス調整フェーズで見直される可能性が高い。`game_balance.gd`
   （`QUALITY_MULTIPLIER_TABLE`）への定数切り出しは本タスクのスコープ外である旨も明記。
3. **DailyRequest型未実装（Duck typing）**: `daily_request`引数が型ヒントなしである理由（Phase4で
   `DailyRequest`実装予定のため）をファイル冒頭・各関数docコメント双方から参照できるようにした。

詳細は `value-calculator-refactor-phase.md` を参照。

### セキュリティレビュー

純粋関数のみで構成され外部入力を直接受け付けない。`daily_request`はDuck typingだがnullチェック済み。
重大な脆弱性は検出されなかった。

### パフォーマンスレビュー

`activated_traits`に対するO(n)の単純走査のみ（調合投入枠は数個規模）。重大な性能課題は検出されなかった。

### テスト結果

`value_calculator_test.gd` 13/13 passed。既存58件を含む全71件がリファクタ前後で変化なく成功
（Scripts 7 / Tests 71 / Passing 71 / Asserts 131/131）。

### 品質評価

✅ 高品質。機能的変更なし・ファイルサイズ166行（500行制限内）・3つの未解決事項をファイル冒頭に
集約する形で目立つコメントとして明示済み。次フェーズ（Verify）へ進行可能。

## Verifyフェーズ（完全性検証）

### 実施日時

2026-08-02

### 検証結果

- `docs/tasks/atelier-alchemy-core/TASK-0017.md` の完了条件6項目を全て確認: すべて実装済み。
- GUT実行（`-gdir=res://tests/unit/features/alchemy`）: Scripts 7 / Tests 71 / Passing 71 / Asserts 131（全パス、value_calculator_test.gdは13/13）。
- 品質評価「要ヒアリング」の根拠（alchemy/guild二重適用疑義・品質倍率暫定式・DailyRequest未実装）はいずれもコード冒頭「⚠️ 設計判断」1〜3として明示済みであり、申し送り事項として許容。

### 🎯 最終結果

- **実装率**: 100%（13/13テストケース、完了条件6/6）
- **品質判定**: 合格（OK）
- **TODO更新**: ✅ 完了マーク追加（TASK-0017.md, overview.md）
