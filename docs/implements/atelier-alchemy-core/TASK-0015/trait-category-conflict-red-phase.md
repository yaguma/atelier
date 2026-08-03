# TASK-0015 Redフェーズ記録: TraitActivation.resolve_category_conflict

**機能名**: 特性系統間排他制御（TraitActivation.resolve_category_conflict）
**タスクID**: TASK-0015
**要件名**: atelier-alchemy-core
**作成日**: 2026-08-01

---

## 1. 作成したテストケース一覧（10件）

対象ファイル: `atelier-godot/tests/unit/features/alchemy/trait_activation_test.gd`（TASK-0014の既存11件に追記）

### 正常系（4件）

1. `test_不均衡3対2で多い系統のみ発現し少ない系統を不発にする` — TC-101-05 🔵
2. `test_不均衡で報酬系が多い場合は報酬系のみ発現し貢献度系を不発にする` — 対称性検証 🟡
3. `test_片系統のみのとき排他せずそのまま残す` — 必須 🟡
4. `test_補助系は同数不発の状況でも排他対象外で残る` — 必須 🟡

### 異常系（3件）

5. `test_同数2対2で両系統とも不発になり空配列を返す` — TC-101-04 **Critical** 🔵
6. `test_1素材が2タグ同時保持でも同数不発で両取りできない` — TC-101-07 **Critical** 🔵
7. `test_発現候補が空のとき空配列を返し排他フラグは偽` — Edge 🟡

### 境界値（3件）

8. `test_差分1の最小不均衡で多い系統のみ残す` — オフバイワン境界 🟡
9. `test_補助系のみのとき排他制御なしで全て残す` — SUPPORT単独境界 🟡
10. `test_多い系統内の複数特性は全て残り少ない系統は全除去される` — REQ-112×REQ-115境界 🟡

---

## 2. 実装したスタブコード

`atelier-godot/features/alchemy/logic/trait_activation.gd` に以下を追加（Greenフェーズで本実装予定）。

```gdscript
static func resolve_category_conflict(
	materials: Array[MaterialInstance],
	activated_traits: Array[TraitDefinition],
) -> Dictionary:
	# 【未実装】: Greenフェーズで系統別枚数集計・比較・排他ロジックを実装する
	# 【Redフェーズ注記】: `pass`のみだと型注釈(-> Dictionary)を満たさずスクリプト全体が
	# 　コンパイル不能になり、TASK-0014の既存テストまで巻き添えで失敗するため、
	# 　空Dictionaryを明示的に返す形のスタブとする（キー未設定なのでテストは失敗する）
	return {}
```

### スタブ設計上の注意（重要な学び）

当初、タスク指示どおり `pass` のみのスタブ（戻り値なし）を実装したところ、GDScriptの型注釈（`-> Dictionary`）を満たさないコードが**スクリプト全体の解析エラー**を引き起こし、`TraitActivationScript` が正しくコンパイルされない状態になった。その結果、既存の `resolve_activated_traits` を呼ぶTASK-0014の11テストまで `Invalid call. Nonexistent function 'resolve_activated_traits' in base 'GDScript'` として巻き添えで失敗した（本来のRedフェーズ対象外のテストが壊れるのは不適切）。

対策として、スタブを `return {}`（空Dictionaryを明示的に返す）に変更した。これによりスクリプトは正常にコンパイルされ、既存11テストは引き続きパスしつつ、新規10テストは「戻り値Dictionaryに `activated_traits` キーが存在しない」ことによる `Invalid access to property or key 'activated_traits' on a base object of type 'Dictionary'` エラーで期待通り失敗する。

---

## 3. テスト実行結果

実行コマンド:

```bash
"C:\Users\syagu\AppData\Local\Microsoft\WinGet\Packages\GodotEngine.GodotEngine_Microsoft.Winget.Source_8wekyb3d8bbwe\Godot_v4.7-stable_win64_console.exe" --headless -s addons/gut/gut_cmdln.gd -gdir=res://tests/unit/features/alchemy -gexit
```

結果サマリー（`atelier-godot/` から実行）:

- `trait_activation_test.gd`: **21テスト中11件パス（TASK-0014既存分）／10件失敗（TASK-0015新規分、すべて期待通りの失敗）**
- `trait_definition_test.gd`: 3/3 パス（影響なし）
- 全体（6スクリプト・49テスト）: Passing 39 / Failing 10

新規10件はすべて以下のエラーで失敗することを確認した（期待される失敗）:

```
SCRIPT ERROR: Invalid access to property or key 'activated_traits' on a base object of type 'Dictionary'.
```

既存のTASK-0014テスト11件（`resolve_activated_traits`関連）は全てパスすることを確認済み。

---

## 4. Greenフェーズで実装すべき内容

`resolve_category_conflict(materials, activated_traits)` の本実装:

1. `activated_traits` を `category`（CONTRIBUTION/REWARD/SUPPORT）でグループ化
2. CONTRIBUTION群・REWARD群それぞれについて、各特性タグを持つ `materials` の出現回数を合計
3. 比較・排他:
   - CONTRIBUTION合計 > REWARD合計 → CONTRIBUTIONのみ残す、`rejected_category = REWARD`, `has_rejected_category = true`
   - CONTRIBUTION合計 < REWARD合計 → REWARDのみ残す、`rejected_category = CONTRIBUTION`, `has_rejected_category = true`
   - 同数（両方 > 0） → 両方除外（空）、`has_rejected_category = false`
   - 一方が0 → 存在する系統をそのまま残す、`has_rejected_category = false`
4. SUPPORT群は常に結果に残す（比較・排他の対象外）
5. 戻り値は `{"activated_traits": Array[TraitDefinition], "rejected_category": TraitDefinition.Category, "has_rejected_category": bool}` の3キー構造を必ず維持する
