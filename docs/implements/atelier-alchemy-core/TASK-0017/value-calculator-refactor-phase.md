# TASK-0017: ValueCalculator（貢献度/報酬算出）Refactorフェーズ記録

**作成日**: 2026-08-02
**フェーズ**: Refactor（品質改善）
**テストファイル**: `tests/unit/features/alchemy/value_calculator_test.gd`
**対象実装**: `features/alchemy/logic/value_calculator.gd`

---

## 1. リファクタリング方針

Greenフェーズの実装（4係数乗算式、`_calculate_category_bonus` / `_calculate_match_bonus` の2ヘルパーへの
共通化）はロジック・構造ともに適切であり、機能的な変更は行わない。本フェーズでは
`quality_calculator.gd`（TASK-0015/0016 Refactor）で確立済みの「⚠️ 設計判断」形式に倣い、
以下3点の未解決事項を **ファイル冒頭に集約した目立つコメントブロック** として明示することに専念した。

## 2. 改善ポイント

### 改善1（最重要）: alchemy/guildの指定合致ボーナス責務重複疑義の明示 🔴

- **課題**: REQ-109/110は指定合致ボーナスをalchemy側（ValueCalculator）の算出式に直接含めているが、
  dataflow.md「機能3: ギルド納品」ではguild側の `DeliveryCalculator.check_daily_request_match()`
  （TASK-0017時点では未実装）が別途合致ボーナスを算出し再度乗算する設計になっている。
  architecture.mdのディレクトリ構成でも `guild/logic/delivery_calculator.gd` が同じ責務を持つと
  明記されており、両方を実装すると二重適用されるリスクが高い。
- **対応**: ファイル冒頭に「⚠️ 設計判断1（最重要・Phase4着手前に要解消）」として、問題の所在・
  参照すべき設計文書（architecture.md / dataflow.md）・対応方針（Phase4着手前にどちらか一方に統一）を
  明示した。加えて `_calculate_match_bonus()` のdocコメントと、両公開関数内の該当行コメントからも
  この設計判断ブロックを参照するようにし、コードを読むどの経路からも見落とせないようにした。
- 🔴 信頼性レベル: 設計文書間の不整合そのもの（要件定義書・タスクノートで申し送り済みの内容を集約）

### 改善2: 品質倍率計算式が完全な推測であることの明示、および定数切り出しのスコープ外明記 🔴

- **課題**: `quality_multiplier = float(final_quality) / float(MaterialInstance.Quality.C)` は
  設計文書に根拠のない暫定式であり、バランス調整フェーズで見直される可能性が高い。
  また `shared/constants/game_balance.gd`（TASK-0005）には既に `QUALITY_MULTIPLIER_TABLE`
  （品質→倍率のDictionary、現状は全品質1.0のTBDプレースホルダ）が用意されており、
  本来はそちらへ計算式・定数を切り出すのが望ましいが、この切り出しは本タスクのスコープ外である。
- **対応**: ファイル冒頭「⚠️ 設計判断2」として、(a) 式が完全な推測であること、(b) バランス調整で
  見直される可能性が高いこと、(c) `game_balance.gd` への切り出しは本タスクのスコープ外であり
  バランス調整フェーズで対応すること、の3点を明記した。両公開関数内の品質倍率算出行コメントからも
  この設計判断ブロックを参照させた。
- 🔴 信頼性レベル: 要件定義書「3. 制約条件」の申し送り内容を集約

### 改善3: DailyRequest型未実装・Duck typing採用理由の明示 🔴

- **課題**: `daily_request` 引数はPhase 4で作成予定の `DailyRequest` 型が未実装のため、型注釈なし
  （Duck typing）のまま実装されている。この理由が実装者にとって自明でないと、誤って型注釈を
  追加してスクリプトのパースエラーを引き起こしたり、逆に型の緩さを見落として不正な値を渡す
  リスクがある。
- **対応**: ファイル冒頭「⚠️ 設計判断3」として、型未実装の経緯・型注釈を省略した理由・Phase4での
  厳格化方針を明記した。各公開関数の `@param daily_request` docコメントからも参照させた。
- 🔴 信頼性レベル: 要件定義書「申し送り1」の内容を集約

## 3. セキュリティレビュー

- 純粋関数のみで構成され、外部入力（ユーザー操作・ネットワーク・ファイルI/O）を直接受け付けない。
- `daily_request` がDuck typingのため型安全性はやや低いが、`_calculate_match_bonus()` で
  `null` チェックを行っており、未定義プロパティアクセスによるクラッシュのリスクは
  呼び出し側（DailyRequest実装時）の契約違反に限定される。Phase4での型厳格化により解消される見込み。
- 重大な脆弱性は検出されなかった。

## 4. パフォーマンスレビュー

- `calculate_contribution` / `calculate_reward` はいずれも `activated_traits`（調合投入枠は
  REQ-101想定4枠程度の少数）に対するO(n)の単純走査のみで、ボトルネックとなる要素はない。
- メモリ確保も一時変数のみで、追加のコレクション生成は最小限。
- 重大な性能課題は検出されなかった。

## 5. テスト実行結果

実行コマンド:

```bash
cd atelier-godot
"C:\Users\syagu\AppData\Local\Microsoft\WinGet\Packages\GodotEngine.GodotEngine_Microsoft.Winget.Source_8wekyb3d8bbwe\Godot_v4.7-stable_win64_console.exe" --headless -s addons/gut/gut_cmdln.gd -gdir=res://tests/unit/features/alchemy -gexit
```

結果サマリ（リファクタ前後で変化なし）:

```
Totals
------
Scripts               7
Tests                71
Passing Tests        71
Asserts             131
---- All tests passed! ----
```

## 6. 品質判定

| 判定項目 | 結果 |
|---------|------|
| テスト結果 | ✅ 全71件成功（新規13件含む）、リファクタ前後で変化なし |
| セキュリティ | ✅ 重大な脆弱性なし |
| パフォーマンス | ✅ 重大な性能課題なし |
| リファクタ品質 | ✅ 目標達成（機能変更なし、3つの未解決事項を目立つコメントで明示） |
| コード品質 | ✅ quality_calculator.gdと一貫した「⚠️ 設計判断」形式でドキュメント化 |
| ファイルサイズ | ✅ 166行（500行制限に対し余裕あり） |
| 日本語コメント品質 | ✅ 信頼性レベル（🔵🟡🔴）付与、参照経路を複数箇所から明示 |

**総合判定**: ✅ 高品質。機能的な変更を一切行わず、Phase4着手前に確定が必要な3つの未解決事項
（責務重複・品質倍率暫定式・DailyRequest未実装）をファイル冒頭に集約する形で目立つコメントとして
明示した。テストは71/71で継続成功。

## 7. 次フェーズへの申し送り（変更なし、Verifyフェーズへ継続）

1. **指定合致ボーナスの二重適用疑義（🔴・最重要）**: Phase 4（guild機能）着手前に、
   alchemy側（本実装）とguild側（`delivery_calculator.gd`）のどちらか一方でのみ適用するよう
   architecture.md / dataflow.md の整合を取り、設計を確定させることが必須。
2. **品質倍率式が暫定（🔴）**: バランス調整フェーズで式自体の見直しと `game_balance.gd`
   （`QUALITY_MULTIPLIER_TABLE`）への切り出しを検討する。
3. **DailyRequest型未実装（🔴）**: Phase 4でDailyRequest実装後、`daily_request` 引数の型注釈を
   `DailyRequest` へ厳格化する。
